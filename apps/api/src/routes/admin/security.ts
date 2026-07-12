import { Hono } from "hono";
import { prisma } from "@komunaid/database";
import { requireSuperAdmin } from "../../middleware/rbac";
import { validate } from "../../middleware/validate";
import { forceLogoutSchema } from "@komunaid/shared";
import { createAuditLog, AuditActions } from "../../services/audit";
import type { AuthUser } from "../../middleware/auth";

type Env = { Variables: { user: AuthUser; validated: any; userRoles: string[] } };
export const securityRoutes = new Hono<Env>();

function pagination(url: string) {
  const u = new URL(url);
  const page = Math.max(1, parseInt(u.searchParams.get("page") || "1"));
  const limit = Math.min(100, Math.max(1, parseInt(u.searchParams.get("limit") || "20")));
  const search = u.searchParams.get("search") || "";
  const sortBy = u.searchParams.get("sortBy") || "createdAt";
  const sortOrder = u.searchParams.get("sortOrder") === "asc" ? "asc" : "desc";
  return { page, limit, search, sortBy, sortOrder, skip: (page - 1) * limit };
}

securityRoutes.get("/security/login-history", requireSuperAdmin(), async (c) => {
  const { page, limit, skip } = pagination(c.req.url);
  const url = new URL(c.req.url);
  const userId = url.searchParams.get("userId") || "";
  const success = url.searchParams.get("success");
  const dateFrom = url.searchParams.get("dateFrom") || "";
  const dateTo = url.searchParams.get("dateTo") || "";

  const where: Record<string, any> = {};
  if (userId) where.userId = userId;
  if (success !== null && success !== undefined && success !== "") {
    where.success = success === "true";
  }
  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) where.createdAt.gte = new Date(dateFrom);
    if (dateTo) where.createdAt.lte = new Date(dateTo);
  }

  const [logs, total] = await Promise.all([
    prisma.loginHistory.findMany({
      where,
      include: { user: { select: { id: true, name: true, email: true, avatar: true } } },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.loginHistory.count({ where }),
  ]);

  return c.json({
    success: true,
    data: logs.map((l) => ({
      id: l.id,
      user: l.user,
      ipAddress: l.ipAddress,
      userAgent: l.userAgent,
      success: l.success,
      failureReason: l.failureReason,
      createdAt: l.createdAt,
    })),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});

securityRoutes.get("/security/failed-logins", requireSuperAdmin(), async (c) => {
  const { page, limit, skip } = pagination(c.req.url);
  const url = new URL(c.req.url);
  const dateFrom = url.searchParams.get("dateFrom") || "";
  const dateTo = url.searchParams.get("dateTo") || "";

  const where: Record<string, any> = { success: false };
  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) where.createdAt.gte = new Date(dateFrom);
    if (dateTo) where.createdAt.lte = new Date(dateTo);
  }

  const [logs, total] = await Promise.all([
    prisma.loginHistory.findMany({
      where,
      include: { user: { select: { id: true, name: true, email: true, avatar: true } } },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.loginHistory.count({ where }),
  ]);

  return c.json({
    success: true,
    data: logs.map((l) => ({
      id: l.id,
      user: l.user,
      ipAddress: l.ipAddress,
      userAgent: l.userAgent,
      failureReason: l.failureReason,
      createdAt: l.createdAt,
    })),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});

securityRoutes.get("/security/suspicious-activity", requireSuperAdmin(), async (c) => {
  const { page, limit, skip } = pagination(c.req.url);

  const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

  const suspiciousUsers = await prisma.loginHistory.groupBy({
    by: ["userId", "ipAddress"],
    where: {
      success: false,
      createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    },
    _count: { id: true },
    having: { id: { _count: { gte: 3 } } },
    orderBy: { _count: { id: "desc" } },
    skip,
    take: limit,
  });

  const userIds = suspiciousUsers.map((s) => s.userId);
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, name: true, email: true, avatar: true, status: true },
  });
  const userMap = new Map(users.map((u) => [u.id, u]));

  return c.json({
    success: true,
    data: suspiciousUsers.map((s) => ({
      user: userMap.get(s.userId) || { id: s.userId, name: "Unknown" },
      ipAddress: s.ipAddress,
      failedAttempts: s._count.id,
    })),
  });
});

securityRoutes.post("/security/force-logout", requireSuperAdmin(), validate(forceLogoutSchema), async (c) => {
  const authUser = c.get("user");
  const body = await c.req.json();
  const { userId } = body as { userId: string };

  if (!userId) {
    return c.json({ success: false, message: "userId wajib diisi" }, 400);
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return c.json({ success: false, message: "User tidak ditemukan" }, 404);
  }

  await prisma.user.update({
    where: { id: userId },
    data: { tokenVersion: { increment: 1 } },
  });

  await createAuditLog({
    userId: authUser.id,
    actionType: AuditActions.FORCE_LOGOUT,
    resourceName: "User",
    resourceId: userId,
    afterData: { forceLogoutBy: authUser.id },
  });

  await prisma.notification.create({
    data: {
      userId,
      title: "Force Logout",
      message: "Akun Anda telah logout paksa oleh administrator.",
      type: "SYSTEM",
    },
  });

  return c.json({ success: true, message: "User berhasil dipaksa logout" });
});

securityRoutes.put("/security/lock-user", requireSuperAdmin(), async (c) => {
  const authUser = c.get("user");
  const body = await c.req.json();
  const { userId } = body as { userId: string };

  if (!userId) {
    return c.json({ success: false, message: "userId wajib diisi" }, 400);
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return c.json({ success: false, message: "User tidak ditemukan" }, 404);
  }

  const before = { status: user.status };

  await prisma.user.update({
    where: { id: userId },
    data: { status: "SUSPENDED" },
  });

  await createAuditLog({
    userId: authUser.id,
    actionType: AuditActions.ACCOUNT_LOCK,
    resourceName: "User",
    resourceId: userId,
    beforeData: before,
    afterData: { status: "SUSPENDED" },
  });

  await prisma.notification.create({
    data: {
      userId,
      title: "Akun Dikunci",
      message: "Akun Anda telah dikunci oleh administrator.",
      type: "SYSTEM",
    },
  });

  return c.json({ success: true, message: "User berhasil dikunci" });
});

securityRoutes.put("/security/unlock-user", requireSuperAdmin(), async (c) => {
  const authUser = c.get("user");
  const body = await c.req.json();
  const { userId } = body as { userId: string };

  if (!userId) {
    return c.json({ success: false, message: "userId wajib diisi" }, 400);
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return c.json({ success: false, message: "User tidak ditemukan" }, 404);
  }

  const before = { status: user.status };

  await prisma.user.update({
    where: { id: userId },
    data: { status: "ACTIVE" },
  });

  await createAuditLog({
    userId: authUser.id,
    actionType: AuditActions.ACCOUNT_UNLOCK,
    resourceName: "User",
    resourceId: userId,
    beforeData: before,
    afterData: { status: "ACTIVE" },
  });

  await prisma.notification.create({
    data: {
      userId,
      title: "Akun Dibuka",
      message: "Akun Anda telah dibuka oleh administrator.",
      type: "SYSTEM",
    },
  });

  return c.json({ success: true, message: "User berhasil dibuka" });
});
