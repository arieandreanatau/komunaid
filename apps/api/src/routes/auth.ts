import { Hono } from "hono";
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { prisma } from "@komunaid/database";
import { registerSchema, loginSchema, changePasswordSchema, forgotPasswordSchema, resetPasswordSchema } from "@komunaid/shared";
import type { AuthUser } from "../middleware/auth";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
  setTokenCookies,
  clearTokenCookies,
  getRefreshToken,
  authMiddleware,
} from "../middleware/auth";
import { validate } from "../middleware/validate";
import { createAuditLog, AuditActions } from "../services/audit";
import { sendEmail, buildResetPasswordEmail } from "../services/email";
import { createChildLogger } from "../lib/logger";

const log = createChildLogger("auth");

// ==========================================
// BRUTE-FORCE PROTECTION
// ==========================================
const loginAttempts = new Map<string, { count: number; resetAt: number }>();
const MAX_LOGIN_ATTEMPTS = 5;
const LOGIN_LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes

function checkLoginAttempts(identifier: string): boolean {
  const record = loginAttempts.get(identifier);
  if (!record) return true;
  if (Date.now() > record.resetAt) {
    loginAttempts.delete(identifier);
    return true;
  }
  return record.count < MAX_LOGIN_ATTEMPTS;
}

function recordLoginAttempt(identifier: string): void {
  const record = loginAttempts.get(identifier);
  if (!record || Date.now() > record.resetAt) {
    loginAttempts.set(identifier, { count: 1, resetAt: Date.now() + LOGIN_LOCKOUT_MS });
  } else {
    record.count++;
  }
}

function clearLoginAttempts(identifier: string): void {
  loginAttempts.delete(identifier);
}
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "dev-secret-change-this");

type Env = { Variables: { user: AuthUser; validated: any; userRoles: string[] } };

export const authRoutes = new Hono<Env>();

// ==========================================
// REGISTER
// ==========================================

authRoutes.post("/register", validate(registerSchema), async (c) => {
  const data = c.get("validated");

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
    });
    const refreshToken = await generateRefreshToken({
      id: user.id,
      email: user.email,
      name: user.name,
      username: user.username,
    });

    setTokenCookies(c, accessToken, refreshToken);

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

  if (!checkLoginAttempts(data.identifier)) {
    return c.json({ success: false, message: "Terlalu banyak percobaan login. Coba lagi dalam 15 menit." }, 429);
  }

  const isEmail = data.identifier.includes("@");

  const user = await prisma.user.findUnique({
    where: isEmail
      ? { email: data.identifier }
      : { username: data.identifier },
    include: { roles: true },
  });

  if (!user) {
    recordLoginAttempt(data.identifier);
    return c.json({ success: false, message: "Email/username atau password salah" }, 401);
  }

  if (user.deletedAt) {
    return c.json({ success: false, message: "Akun sudah dihapus" }, 403);
  }

  if (user.status === "SUSPENDED") {
    return c.json({ success: false, message: "Akun ditangguhkan. Hubungi administrator." }, 403);
  }

  if (user.status === "DEACTIVATED") {
    return c.json({ success: false, message: "Akun sudah dinonaktifkan" }, 403);
  }

  const isValidPassword = await bcrypt.compare(data.password, user.password);

  if (!isValidPassword) {
    recordLoginAttempt(data.identifier);
    return c.json({ success: false, message: "Email/username atau password salah" }, 401);
  }

  clearLoginAttempts(data.identifier);

  const accessToken = await generateAccessToken({
    id: user.id,
    email: user.email,
    name: user.name,
    username: user.username,
  });
  const refreshToken = await generateRefreshToken({
    id: user.id,
    email: user.email,
    name: user.name,
    username: user.username,
  });

  setTokenCookies(c, accessToken, refreshToken);

  await createAuditLog({
    userId: user.id,
    actionType: AuditActions.USER_LOGIN,
    resourceName: "User",
    resourceId: user.id,
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
  const refreshToken = getRefreshToken(c);

  if (!refreshToken) {
    return c.json({ success: false, message: "Refresh token tidak ditemukan" }, 401);
  }

  try {
    const payload = await verifyToken(refreshToken);

    if (payload.type !== "refresh") {
      return c.json({ success: false, message: "Token type tidak valid" }, 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      include: { roles: true },
    });

    if (!user || user.deletedAt || user.status === "SUSPENDED") {
      return c.json({ success: false, message: "User tidak ditemukan atau ditangguhkan" }, 401);
    }

    const newAccessToken = await generateAccessToken({
      id: user.id,
      email: user.email,
      name: user.name,
      username: user.username,
    });
    const newRefreshToken = await generateRefreshToken({
      id: user.id,
      email: user.email,
      name: user.name,
      username: user.username,
    });

    setTokenCookies(c, newAccessToken, newRefreshToken);

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
  } catch {
    return c.json({ success: false, message: "Refresh token tidak valid" }, 401);
  }
});

// ==========================================
// LOGOUT
// ==========================================

authRoutes.post("/logout", authMiddleware, async (c) => {
  const user = c.get("user");
  clearTokenCookies(c);

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
        status: userData.status,
        roles: userData.roles.map((r) => r.role),
        interests: userData.interests.map((i) => i.interest),
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

  await prisma.user.update({
    where: { id: authUser.id },
    data: { password: hashedPassword },
  });

  await createAuditLog({
    userId: authUser.id,
    actionType: "USER_CHANGE_PASSWORD",
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

  // Always return same response to prevent email enumeration
  const user = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (user && !user.deletedAt && user.status === "ACTIVE") {
    // Generate reset token (JWT, 1hr expiry)
    const resetToken = await new SignJWT({
      sub: user.id,
      email: user.email,
      type: "reset",
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("1h")
      .sign(JWT_SECRET);

    log.info({ userId: user.id }, "password reset requested");

    const appUrl = process.env.APP_URL || "http://localhost:3000";
    const resetUrl = `${appUrl}/reset-password?token=${resetToken}`;
    const emailContent = buildResetPasswordEmail(resetUrl);
    await sendEmail({
      to: user.email,
      subject: emailContent.subject,
      html: emailContent.html,
    });
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

  try {
    const { payload } = await jwtVerify(data.token, JWT_SECRET);

    if (payload.type !== "reset") {
      return c.json({ success: false, message: "Token tidak valid" }, 400);
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.sub as string },
    });

    if (!user || user.deletedAt) {
      return c.json({ success: false, message: "User tidak ditemukan" }, 404);
    }

    const hashedPassword = await bcrypt.hash(
      data.password,
      parseInt(process.env.BCRYPT_ROUNDS || "12")
    );

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    await createAuditLog({
      userId: user.id,
      actionType: "USER_RESET_PASSWORD",
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

    return c.json({
      success: true,
      message: "Password berhasil diubah. Silakan login dengan password baru.",
    });
  } catch {
    return c.json({ success: false, message: "Token tidak valid atau sudah kadaluarsa" }, 400);
  }
});
