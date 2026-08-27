import { Hono } from "hono";
import bcrypt from "bcryptjs";
import { parse } from "cookie";
import { prisma } from "@komunaid/database";
import { registerSchema, loginSchema, changePasswordSchema, forgotPasswordSchema, resetPasswordSchema } from "@komunaid/shared";
import type { AuthUser } from "../middleware/auth";
import {
  generateAccessToken,
  verifyToken,
  setTokenCookies,
  clearTokenCookies,
  authMiddleware,
  generateResetToken,
} from "../middleware/auth";
import { validate } from "../middleware/validate";
import { createAuditLog, AuditActions } from "../services/audit";
import { sendEmail, buildResetPasswordEmail } from "../services/email";
import {
  createRefreshTokenFamily,
  rotateRefreshToken,
  hashToken,
  revokeAllUserTokens,
  revokeToken,
  getActiveSessions,
  revokeSession,
} from "../services/refresh-token";
import {
  loginRateLimiter,
  registrationRateLimiter,
  forgotPasswordRateLimiter,
  resetPasswordRateLimiter,
  refreshTokenRateLimiter,
  getIP,
} from "../services/rate-limiter";
import { createChildLogger } from "../lib/logger";

const log = createChildLogger("auth");

type Env = { Variables: { user: AuthUser; validated: any; userRoles: string[] } };

export const authRoutes = new Hono<Env>();

// ==========================================
// REGISTER
// ==========================================

authRoutes.post("/register", validate(registerSchema), async (c) => {
  const data = c.get("validated");
  const ipAddress = getIP(c);

  const rateLimitResult = await registrationRateLimiter(ipAddress);
  if (!rateLimitResult.allowed) {
    return c.json({ success: false, message: "Terlalu banyak pendaftaran. Coba lagi nanti." }, 429);
  }

  try {
    const existingEmail = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingEmail) {
      return c.json({ success: false, message: "Email sudah terdaftar" }, 409);
    }

    const existingUsername = await prisma.user.findUnique({
      where: { username: data.username },
    });

    if (existingUsername) {
      return c.json({ success: false, message: "Username sudah digunakan" }, 409);
    }

    const hashedPassword = await bcrypt.hash(
      data.password,
      parseInt(process.env.BCRYPT_ROUNDS || "12")
    );

    const user = await prisma.user.create({
      data: {
        name: data.name,
        username: data.username,
        email: data.email,
        password: hashedPassword,
        roles: {
          create: {
            role: "MEMBER",
          },
        },
      },
      include: {
        roles: true,
      },
    });

    const accessToken = await generateAccessToken({
      id: user.id,
      email: user.email,
      name: user.name,
      username: user.username,
    }, user.tokenVersion, user.roles.map((r) => r.role));

    const userAgent = c.req.header("User-Agent") || "";
    const fingerprint = c.req.header("X-Device-Fingerprint") || undefined;
    const { tokenHash: refreshTokenHash } = await createRefreshTokenFamily(
      user.id, fingerprint, ipAddress, userAgent
    );

    setTokenCookies(c, accessToken, refreshTokenHash);

    try {
      await createAuditLog({
        userId: user.id,
        actionType: AuditActions.USER_REGISTER,
        resourceName: "User",
        resourceId: user.id,
        afterData: { name: user.name, email: user.email, username: user.username },
      });

      await prisma.notification.create({
        data: {
          userId: user.id,
          title: "Selamat Datang di KomunaID!",
          message: "Akun Anda berhasil dibuat. Mulai jelajahi komunitas dan event di sekitar Anda.",
          type: "SYSTEM",
        },
      });

      await prisma.activityHistory.create({
        data: {
          userId: user.id,
          action: "USER_REGISTER",
          details: { email: user.email, username: user.username },
        },
      });
    } catch (postErr) {
      log.error({ err: postErr, userId: user.id }, "post-registration operations failed");
    }

    log.info({ userId: user.id }, "user registered");

    return c.json(
      {
        success: true,
        message: "Registrasi berhasil",
        data: {
          user: {
            id: user.id,
            name: user.name,
            username: user.username,
            email: user.email,
            roles: user.roles.map((r) => r.role),
          },
        },
      },
      201
    );
  } catch (err) {
    log.error({ err, email: data.email }, "register failed");
    return c.json({ success: false, message: "Registrasi gagal" }, 500);
  }
});

// ==========================================
// LOGIN
// ==========================================

authRoutes.post("/login", validate(loginSchema), async (c) => {
  const data = c.get("validated");
  const userAgent = c.req.header("User-Agent") || "";
  const ipAddress = getIP(c);

  const rateLimitKey = `${ipAddress}:${data.identifier}`;
  const rateLimitResult = await loginRateLimiter(rateLimitKey);
  if (!rateLimitResult.allowed) {
    return c.json({
      success: false,
      message: "Terlalu banyak percobaan login. Coba lagi nanti.",
      retryAfter: rateLimitResult.retryAfter,
    }, 429);
  }

  const isEmail = data.identifier.includes("@");

  const user = await prisma.user.findUnique({
    where: isEmail
      ? { email: data.identifier }
      : { username: data.identifier },
    include: { roles: true },
  });

  const GENERIC_AUTH_ERROR = "Email/username atau password salah";
  const DUMMY_HASH = "$2a$12$XOPbrlUPQdwdJUpSrIF6X.LbE14qsMmKGhM1A8W9iqaG3vv7TD7WO";

  if (!user) {
    await bcrypt.compare(data.password, DUMMY_HASH);
    return c.json({ success: false, message: GENERIC_AUTH_ERROR }, 401);
  }

  const isValidPassword = await bcrypt.compare(data.password, user.password);

  if (!isValidPassword) {
    try {
      await prisma.loginHistory.create({
        data: {
          userId: user.id,
          ipAddress,
          userAgent,
          success: false,
          failureReason: "INVALID_PASSWORD",
        },
      });
    } catch (loginErr) {
      log.error({ err: loginErr }, "failed to record login failure");
    }
    return c.json({ success: false, message: GENERIC_AUTH_ERROR }, 401);
  }

  const accountFailureReason = user.deletedAt
    ? "ACCOUNT_DELETED"
    : user.status === "SUSPENDED"
      ? "ACCOUNT_SUSPENDED"
      : user.status === "DEACTIVATED"
        ? "ACCOUNT_DEACTIVATED"
        : null;

  if (accountFailureReason) {
    try {
      await prisma.loginHistory.create({
        data: {
          userId: user.id,
          ipAddress,
          userAgent,
          success: false,
          failureReason: accountFailureReason,
        },
      });
    } catch (loginErr) {
      log.error({ err: loginErr }, "failed to record login failure");
    }
    return c.json({ success: false, message: GENERIC_AUTH_ERROR }, 401);
  }

  const accessToken = await generateAccessToken({
    id: user.id,
    email: user.email,
    name: user.name,
    username: user.username,
  }, user.tokenVersion, user.roles.map((r) => r.role));

  const fingerprint = c.req.header("X-Device-Fingerprint") || undefined;
  const { tokenHash: refreshTokenHash } = await createRefreshTokenFamily(
    user.id, fingerprint, ipAddress, userAgent
  );

  setTokenCookies(c, accessToken, refreshTokenHash);

  await createAuditLog({
    userId: user.id,
    actionType: AuditActions.USER_LOGIN,
    resourceName: "User",
    resourceId: user.id,
  });

  await prisma.loginHistory.create({
    data: {
      userId: user.id,
      ipAddress,
      userAgent,
      success: true,
    },
  });

  await prisma.activityHistory.create({
    data: {
      userId: user.id,
      action: "USER_LOGIN",
      details: { email: user.email },
    },
  });

  log.info({ userId: user.id }, "user logged in");

  return c.json({
    success: true,
    message: "Login berhasil",
    data: {
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        roles: user.roles.map((r) => r.role),
      },
    },
  });
});

// ==========================================
// REFRESH TOKEN
// ==========================================

authRoutes.post("/refresh", async (c) => {
  const cookieHeader = c.req.header("Cookie");
  if (!cookieHeader) {
    return c.json({ success: false, message: "Refresh token tidak ditemukan" }, 401);
  }
  const cookies = parse(cookieHeader);
  const rawRefreshToken = cookies.refreshToken;

  if (!rawRefreshToken) {
    return c.json({ success: false, message: "Refresh token tidak ditemukan" }, 401);
  }

  const tokenHash = hashToken(rawRefreshToken);
  const ipAddress = getIP(c);
  const userAgent = c.req.header("User-Agent") || "";
  const fingerprint = c.req.header("X-Device-Fingerprint") || undefined;

  const rateLimitResult = await refreshTokenRateLimiter(tokenHash);
  if (!rateLimitResult.allowed) {
    return c.json({ success: false, message: "Terlalu banyak percobaan refresh. Coba lagi nanti." }, 429);
  }

  const validation = await import("../services/refresh-token").then(m => m.validateRefreshToken(tokenHash));

  if (!validation.valid) {
    if (validation.familyId) {
      log.error(
        { userId: validation.userId, familyId: validation.familyId },
        "REUSE DETECTED: Invalid refresh token — all sessions revoked"
      );
      await revokeAllUserTokens(validation.userId);
      await prisma.user.update({
        where: { id: validation.userId },
        data: { tokenVersion: { increment: 1 } },
      });
      await createAuditLog({
        userId: validation.userId,
        actionType: "TOKEN_REUSE_DETECTED",
        resourceName: "User",
        resourceId: validation.userId,
        afterData: { familyId: validation.familyId, action: "all_sessions_revoked" },
      });
      await prisma.notification.create({
        data: {
          userId: validation.userId,
          title: "Peringatan Keamanan",
          message: "Aktivitas mencurigakan terdeteksi pada akun Anda. Semua sesi telah ditutup. Jika ini bukan Anda, segera hubungi administrator.",
          type: "SYSTEM",
        },
      });
    }
    return c.json({ success: false, message: "Refresh token tidak valid" }, 401);
  }

  const user = await prisma.user.findUnique({
    where: { id: validation.userId },
    include: { roles: true },
  });

  if (!user || user.deletedAt || user.status === "SUSPENDED" || user.status === "DEACTIVATED") {
    return c.json({ success: false, message: "User tidak ditemukan atau ditangguhkan" }, 401);
  }

  const rotation = await rotateRefreshToken(tokenHash, user.id, fingerprint, ipAddress, userAgent);

  if (rotation.expired) {
    clearTokenCookies(c);
    return c.json({ success: false, message: "Refresh token sudah kadaluarsa. Silakan login kembali." }, 401);
  }

  if (rotation.reused) {
    log.error(
      { userId: user.id, familyId: rotation.familyId },
      "Token reuse detected during rotation — all sessions revoked"
    );
    await revokeAllUserTokens(user.id);
    await prisma.user.update({
      where: { id: user.id },
      data: { tokenVersion: { increment: 1 } },
    });
    await createAuditLog({
      userId: user.id,
      actionType: "TOKEN_REUSE_DETECTED",
      resourceName: "User",
      resourceId: user.id,
      afterData: { familyId: rotation.familyId, action: "all_sessions_revoked" },
    });
    await prisma.notification.create({
      data: {
        userId: user.id,
        title: "Peringatan Keamanan",
        message: "Token refresh Anda telah disalahgunakan. Semua sesi telah ditutup. Jika ini bukan Anda, segera hubungi administrator.",
        type: "SYSTEM",
      },
    });
    return c.json({ success: false, message: "Token tidak valid — semua sesi telah ditutup" }, 401);
  }

  const newAccessToken = await generateAccessToken({
    id: user.id,
    email: user.email,
    name: user.name,
    username: user.username,
  }, user.tokenVersion, user.roles.map((r) => r.role));

  setTokenCookies(c, newAccessToken, rotation.newTokenHash);

  return c.json({
    success: true,
    message: "Token berhasil diperbarui",
    data: {
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        roles: user.roles.map((r) => r.role),
      },
    },
  });
});

// ==========================================
// LOGOUT
// ==========================================

authRoutes.post("/logout", authMiddleware, async (c) => {
  const user = c.get("user");
  clearTokenCookies(c);

  const cookieHeader = c.req.header("Cookie");
  if (cookieHeader) {
    const cookies = parse(cookieHeader);
    if (cookies.refreshToken) {
      const tokenHash = hashToken(cookies.refreshToken);
      await revokeToken(tokenHash);
    }
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { tokenVersion: { increment: 1 } },
  });

  await createAuditLog({
    userId: user.id,
    actionType: AuditActions.USER_LOGOUT,
    resourceName: "User",
    resourceId: user.id,
  });

  await prisma.activityHistory.create({
    data: {
      userId: user.id,
      action: "USER_LOGOUT",
    },
  });

  return c.json({ success: true, message: "Logout berhasil" });
});

// ==========================================
// ME
// ==========================================

authRoutes.get("/me", authMiddleware, async (c) => {
  const user = c.get("user");

  const userData = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      roles: true,
      interests: true,
    },
  });

  if (!userData) {
    return c.json({ success: false, message: "User tidak ditemukan" }, 404);
  }

  const [communitiesCount, organizationsCount] = await Promise.all([
    prisma.communityMember.count({
      where: { userId: userData.id, deletedAt: null },
    }),
    prisma.organizationMember.count({
      where: { userId: userData.id, deletedAt: null },
    }),
  ]);

  return c.json({
    success: true,
    data: {
      user: {
        id: userData.id,
        name: userData.name,
        username: userData.username,
        email: userData.email,
        phone: userData.phone,
        bio: userData.bio,
        location: userData.location,
        avatar: userData.avatar,
        isProfilePublic: userData.isProfilePublic,
        status: userData.status,
        roles: userData.roles.map((r) => r.role),
        interests: userData.interests.map((i) => i.interest),
        communitiesCount,
        organizationsCount,
        createdAt: userData.createdAt,
      },
    },
  });
});

// ==========================================
// CHANGE PASSWORD
// ==========================================

authRoutes.put("/change-password", authMiddleware, validate(changePasswordSchema), async (c) => {
  const authUser = c.get("user");
  const data = c.get("validated");

  const userData = await prisma.user.findUnique({
    where: { id: authUser.id },
    select: { id: true, password: true },
  });

  if (!userData) {
    return c.json({ success: false, message: "User tidak ditemukan" }, 404);
  }

  const isValidPassword = await bcrypt.compare(
    data.currentPassword,
    userData.password
  );

  if (!isValidPassword) {
    return c.json({ success: false, message: "Password saat ini salah" }, 401);
  }

  const hashedPassword = await bcrypt.hash(
    data.newPassword,
    parseInt(process.env.BCRYPT_ROUNDS || "12")
  );

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: authUser.id },
      data: {
        password: hashedPassword,
        tokenVersion: { increment: 1 },
      },
    });
  });

  await revokeAllUserTokens(authUser.id);
  clearTokenCookies(c);

  await createAuditLog({
    userId: authUser.id,
    actionType: AuditActions.USER_CHANGE_PASSWORD,
    resourceName: "User",
    resourceId: authUser.id,
  });

  await prisma.notification.create({
    data: {
      userId: authUser.id,
      title: "Password Berhasil Diubah",
      message: "Password akun Anda telah berhasil diubah. Jika Anda tidak melakukan ini, segera hubungi administrator.",
      type: "SYSTEM",
    },
  });

  return c.json({ success: true, message: "Password berhasil diubah" });
});

// ==========================================
// FORGOT PASSWORD
// ==========================================

authRoutes.post("/forgot-password", validate(forgotPasswordSchema), async (c) => {
  const data = c.get("validated");

  const rateLimitResult = await forgotPasswordRateLimiter(data.identifier.toLowerCase());
  if (!rateLimitResult.allowed) {
    return c.json({ success: false, message: "Terlalu banyak permintaan reset. Coba lagi nanti." }, 429);
  }

  const isEmail = data.identifier.includes("@");
  const user = await prisma.user.findUnique({
    where: isEmail
      ? { email: data.identifier }
      : { username: data.identifier },
  });

  if (user && !user.deletedAt && user.status === "ACTIVE") {
    const resetToken = await generateResetToken(user, user.tokenVersion);

    log.info({ userId: user.id }, "password reset requested");

    const appUrl = process.env.APP_URL || "http://localhost:3000";
    const resetUrl = `${appUrl}/reset-password?token=${resetToken}`;
    const emailContent = buildResetPasswordEmail(resetUrl);
    const emailSent = await sendEmail({
      to: user.email,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
    });

    if (!emailSent) {
      log.error({ userId: user.id }, "failed to send reset password email");
    }
  }

  return c.json({
    success: true,
    message: "Link reset password telah dikirim ke email Anda",
  });
});

// ==========================================
// RESET PASSWORD
// ==========================================

authRoutes.post("/reset-password", validate(resetPasswordSchema), async (c) => {
  const data = c.get("validated");

  const rateLimitResult = await resetPasswordRateLimiter(hashToken(data.token));
  if (!rateLimitResult.allowed) {
    return c.json({ success: false, message: "Terlalu banyak percobaan reset. Coba lagi nanti." }, 429);
  }

  try {
    const payload = await verifyToken(data.token);

    if (payload.type !== "reset") {
      return c.json({ success: false, message: "Token tidak valid" }, 400);
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.sub as string },
    });

    if (!user || user.deletedAt) {
      return c.json({ success: false, message: "User tidak ditemukan" }, 404);
    }

    if (payload.tokenVersion === undefined || payload.tokenVersion !== user.tokenVersion) {
      return c.json({ success: false, message: "Token tidak valid atau sudah digunakan" }, 400);
    }

    if (user.status === "SUSPENDED") {
      return c.json({ success: false, message: "Akun ditangguhkan. Hubungi administrator." }, 403);
    }

    if (user.status === "DEACTIVATED") {
      return c.json({ success: false, message: "Akun sudah dinonaktifkan" }, 403);
    }

    const hashedPassword = await bcrypt.hash(
      data.password,
      parseInt(process.env.BCRYPT_ROUNDS || "12")
    );

    const resetResult = await prisma.$transaction(async (tx) => {
      const result = await tx.user.updateMany({
        where: { id: user.id, tokenVersion: payload.tokenVersion },
        data: {
          password: hashedPassword,
          tokenVersion: { increment: 1 },
        },
      });

      if (result.count === 1) {
        await tx.refreshToken.updateMany({
          where: { userId: user.id, isRevoked: false },
          data: { isRevoked: true },
        });
      }

      return result;
    });

    if (resetResult.count !== 1) {
      return c.json({ success: false, message: "Token tidak valid atau sudah digunakan" }, 400);
    }

    clearTokenCookies(c);

    try {
      await createAuditLog({
        userId: user.id,
        actionType: AuditActions.USER_RESET_PASSWORD,
        resourceName: "User",
        resourceId: user.id,
      });

      await prisma.notification.create({
        data: {
          userId: user.id,
          title: "Password Berhasil Direset",
          message: "Password akun Anda telah berhasil direset. Jika Anda tidak melakukan ini, segera hubungi administrator.",
          type: "SYSTEM",
        },
      });
    } catch (postErr) {
      log.error({ err: postErr, userId: user.id }, "post-reset operations failed");
    }

    return c.json({
      success: true,
      message: "Password berhasil diubah. Silakan login dengan password baru.",
    });
  } catch {
    return c.json({ success: false, message: "Token tidak valid atau sudah kadaluarsa" }, 400);
  }
});

// ==========================================
// SESSIONS (Device Tracking)
// ==========================================

authRoutes.get("/sessions", authMiddleware, async (c) => {
  const user = c.get("user");
  const sessions = await getActiveSessions(user.id);
  return c.json({ success: true, data: { sessions } });
});

authRoutes.delete("/sessions/:sessionId", authMiddleware, async (c) => {
  const user = c.get("user");
  const sessionId = c.req.param("sessionId") as string;

  const revoked = await revokeSession(sessionId, user.id);
  if (!revoked) {
    return c.json({ success: false, message: "Sesi tidak ditemukan atau bukan milik Anda" }, 404);
  }

  await createAuditLog({
    userId: user.id,
    actionType: "SESSION_REVOKED",
    resourceName: "User",
    resourceId: user.id,
    afterData: { sessionId },
  });

  return c.json({ success: true, message: "Sesi berhasil ditutup" });
});

authRoutes.delete("/sessions", authMiddleware, async (c) => {
  const user = c.get("user");
  const revokedCount = await revokeAllUserTokens(user.id);

  await prisma.user.update({
    where: { id: user.id },
    data: { tokenVersion: { increment: 1 } },
  });

  await createAuditLog({
    userId: user.id,
    actionType: "ALL_SESSIONS_REVOKED",
    resourceName: "User",
    resourceId: user.id,
    afterData: { revokedCount },
  });

  return c.json({ success: true, message: `${revokedCount} sesi berhasil ditutup` });
});
