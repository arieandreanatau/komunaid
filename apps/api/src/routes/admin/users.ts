import { Hono } from "hono";
import bcrypt from "bcryptjs";
import { prisma } from "@komunaid/database";
import { requireSuperAdmin, invalidateRoleCache } from "../../middleware/rbac";
import { validate } from "../../middleware/validate";
import { assignRoleSchema, adminResetPasswordSchema } from "@komunaid/shared";
import { createAuditLog, AuditActions } from "../../services/audit";
import type { AuthUser } from "../../middleware/auth";

type Env = { Variables: { user: AuthUser; validated: any; userRoles: string[] } };
export const usersRoutes = new Hono<Env>();

function pagination(url: string) {
  const u = new URL(url);
  const page = Math.max(1, parseInt(u.searchParams.get("page") || "1"));
  const limit = Math.min(100, Math.max(1, parseInt(u.searchParams.get("limit") || "20")));
  const search = u.searchParams.get("search") || "";
  const sortBy = u.searchParams.get("sortBy") || "createdAt";
  const sortOrder = u.searchParams.get("sortOrder") === "asc" ? "asc" : "desc";
  return { page, limit, search, sortBy, sortOrder, skip: (page - 1) * limit };
}

async function canMutateTarget(callerId: string, targetId: string): Promise<boolean> {
  const callerRoles = await prisma.userRole.findMany({ where: { userId: callerId }, select: { role: true } });
  if (callerRoles.some((role) => role.role === "SUPER_ADMIN")) return true;

  const targetRoles = await prisma.userRole.findMany({ where: { userId: targetId }, select: { role: true } });
  return !targetRoles.some((role) => ["SUPER_ADMIN", "PLATFORM_ADMIN"].includes(role.role));
}

usersRoutes.get("/users", async (c) => {
  const { page, limit, search, sortBy, sortOrder, skip } = pagination(c.req.url);
  const url = new URL(c.req.url);
  const status = url.searchParams.get("status") || "";
  const role = url.searchParams.get("role") || "";

  const where: Record<string, any> = { deletedAt: null };

  if (search) {
    where.OR = [
      { name: { contains: search } },
      { email: { contains: search } },
      { username: { contains: search } },
    ];
  }
  if (status) where.status = status;
  if (role) {
    where.roles = { some: { role } };
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where: where as never,
      include: {
        roles: true,
        _count: {
          select: {
            joinedCommunities: true,
            registeredEvents: true,
            createdCommunities: true,
            createdOrganizations: true,
          },
        },
      },
      orderBy: { createdAt: sortOrder as "asc" | "desc" },
      skip,
      take: limit,
    }),
    prisma.user.count({ where: where as never }),
  ]);

  return c.json({
    success: true,
    data: users.map((u) => ({
      id: u.id,
      name: u.name,
      username: u.username,
      email: u.email,
      avatar: u.avatar,
      status: u.status,
      roles: u.roles.map((r) => r.role),
      communityCount: u._count.joinedCommunities,
      eventCount: u._count.registeredEvents,
      ownedCommunities: u._count.createdCommunities,
      ownedOrganizations: u._count.createdOrganizations,
      createdAt: u.createdAt,
    })),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});

usersRoutes.get("/users/:userId", async (c) => {
  const userId = c.req.param("userId") as string;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      roles: true,
      interests: true,
      joinedCommunities: {
        include: { community: { select: { id: true, name: true, slug: true, status: true } } },
        take: 10,
      },
      registeredEvents: {
        include: { event: { select: { id: true, title: true, slug: true, status: true, eventDate: true } } },
        take: 10,
      },
      createdCommunities: {
        select: { id: true, name: true, slug: true, status: true },
        take: 10,
      },
      createdOrganizations: {
        select: { id: true, name: true, slug: true, status: true },
        take: 10,
      },
      activityLogs: {
        orderBy: { createdAt: "desc" },
        take: 20,
      },
      _count: {
        select: {
          joinedCommunities: true,
          registeredEvents: true,
          createdCommunities: true,
          createdOrganizations: true,
          reportedReports: true,
          auditLogs: true,
        },
      },
    },
  });

  if (!user) {
    return c.json({ success: false, message: "User tidak ditemukan" }, 404);
  }

  return c.json({
    success: true,
    data: {
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      phone: user.phone,
      bio: user.bio,
      location: user.location,
      status: user.status,
      emailVerifiedAt: user.emailVerifiedAt,
      roles: user.roles.map((r) => r.role),
      interests: user.interests.map((i) => i.interest),
      communities: user.joinedCommunities.map((cm) => ({
        id: cm.community.id,
        name: cm.community.name,
        slug: cm.community.slug,
        status: cm.community.status,
        role: cm.role,
        memberStatus: cm.status,
      })),
      events: user.registeredEvents.map((er) => ({
        id: er.event.id,
        title: er.event.title,
        slug: er.event.slug,
        status: er.event.status,
        eventDate: er.event.eventDate,
        registrationStatus: er.status,
      })),
      ownedCommunities: user.createdCommunities,
      ownedOrganizations: user.createdOrganizations,
      recentActivity: user.activityLogs,
      counts: user._count,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
  });
});

usersRoutes.put("/users/:userId/suspend", async (c) => {
  const authUser = c.get("user");
  const userId = c.req.param("userId") as string;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return c.json({ success: false, message: "User tidak ditemukan" }, 404);
  }

  if (user.status === "SUSPENDED") {
    return c.json({ success: false, message: "User sudah ditangguhkan" }, 400);
  }

  if (!await canMutateTarget(authUser.id, userId)) {
    return c.json({ success: false, message: "Tidak dapat mengubah user dengan hak akses lebih tinggi" }, 403);
  }

  const before = { status: user.status };

  await prisma.user.update({
    where: { id: userId },
    data: { status: "SUSPENDED" },
  });

  await createAuditLog({
    userId: authUser.id,
    actionType: AuditActions.USER_SUSPEND,
    resourceName: "User",
    resourceId: userId,
    beforeData: before,
    afterData: { status: "SUSPENDED" },
  });

  await prisma.notification.create({
    data: {
      userId,
      title: "Akun Ditangguhkan",
      message: "Akun Anda telah ditangguhkan oleh administrator. Hubungi admin untuk informasi lebih lanjut.",
      type: "SYSTEM",
    },
  });

  return c.json({ success: true, message: "User berhasil ditangguhkan" });
});

usersRoutes.put("/users/:userId/activate", async (c) => {
  const authUser = c.get("user");
  const userId = c.req.param("userId") as string;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return c.json({ success: false, message: "User tidak ditemukan" }, 404);
  }

  if (user.status === "ACTIVE") {
    return c.json({ success: false, message: "User sudah aktif" }, 400);
  }

  if (!await canMutateTarget(authUser.id, userId)) {
    return c.json({ success: false, message: "Tidak dapat mengubah user dengan hak akses lebih tinggi" }, 403);
  }

  const before = { status: user.status };

  await prisma.user.update({
    where: { id: userId },
    data: { status: "ACTIVE" },
  });

  await createAuditLog({
    userId: authUser.id,
    actionType: AuditActions.USER_ACTIVATE,
    resourceName: "User",
    resourceId: userId,
    beforeData: before,
    afterData: { status: "ACTIVE" },
  });

  await prisma.notification.create({
    data: {
      userId,
      title: "Akun Diaktifkan",
      message: "Akun Anda telah diaktifkan kembali oleh administrator.",
      type: "SYSTEM",
    },
  });

  return c.json({ success: true, message: "User berhasil diaktifkan" });
});

usersRoutes.put("/users/:userId/archive", async (c) => {
  const authUser = c.get("user");
  const userId = c.req.param("userId") as string;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return c.json({ success: false, message: "User tidak ditemukan" }, 404);
  }

  if (user.deletedAt) {
    return c.json({ success: false, message: "User sudah diarsipkan" }, 400);
  }

  if (!await canMutateTarget(authUser.id, userId)) {
    return c.json({ success: false, message: "Tidak dapat mengubah user dengan hak akses lebih tinggi" }, 403);
  }

  const before = { status: user.status, deletedAt: user.deletedAt };

  await prisma.user.update({
    where: { id: userId },
    data: { status: "DEACTIVATED", deletedAt: new Date() },
  });

  await createAuditLog({
    userId: authUser.id,
    actionType: AuditActions.USER_ARCHIVE,
    resourceName: "User",
    resourceId: userId,
    beforeData: before,
    afterData: { status: "DEACTIVATED", deletedAt: new Date().toISOString() },
  });

  return c.json({ success: true, message: "User berhasil diarsipkan" });
});

usersRoutes.put("/users/:userId/restore", async (c) => {
  const authUser = c.get("user");
  const userId = c.req.param("userId") as string;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return c.json({ success: false, message: "User tidak ditemukan" }, 404);
  }

  if (!await canMutateTarget(authUser.id, userId)) {
    return c.json({ success: false, message: "Tidak dapat mengubah user dengan hak akses lebih tinggi" }, 403);
  }

  const before = { status: user.status, deletedAt: user.deletedAt };

  await prisma.user.update({
    where: { id: userId },
    data: { status: "ACTIVE", deletedAt: null },
  });

  await createAuditLog({
    userId: authUser.id,
    actionType: AuditActions.USER_RESTORE,
    resourceName: "User",
    resourceId: userId,
    beforeData: before,
    afterData: { status: "ACTIVE", deletedAt: null },
  });

  return c.json({ success: true, message: "User berhasil dipulihkan" });
});

usersRoutes.put("/users/:userId/role", requireSuperAdmin(), validate(assignRoleSchema), async (c) => {
  const authUser = c.get("user");
  const userId = c.req.param("userId") as string;
  const data = c.get("validated");
  const { role } = data as { role: "SUPER_ADMIN" | "PLATFORM_ADMIN" | "MEMBER" };

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { roles: true },
  });

  if (!user) {
    return c.json({ success: false, message: "User tidak ditemukan" }, 404);
  }

  const before = user.roles.map((r) => r.role);

  await prisma.userRole.deleteMany({ where: { userId } });
  await prisma.userRole.create({ data: { userId, role } });

  invalidateRoleCache(userId);

  await createAuditLog({
    userId: authUser.id,
    actionType: AuditActions.ROLE_CHANGE,
    resourceName: "User",
    resourceId: userId,
    beforeData: { roles: before },
    afterData: { roles: [role] },
  });

  await prisma.notification.create({
    data: {
      userId,
      title: "Role Diubah",
      message: `Role platform Anda telah diubah menjadi ${role} oleh administrator.`,
      type: "SYSTEM",
    },
  });

  return c.json({ success: true, message: "Role berhasil diubah" });
});

usersRoutes.put("/users/:userId/reset-password", requireSuperAdmin(), validate(adminResetPasswordSchema), async (c) => {
  const authUser = c.get("user");
  const userId = c.req.param("userId") as string;
  const data = c.get("validated");
  const { newPassword } = data as { newPassword: string };

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return c.json({ success: false, message: "User tidak ditemukan" }, 404);
  }

  const hashedPassword = await bcrypt.hash(newPassword, parseInt(process.env.BCRYPT_ROUNDS || "12"));

  await prisma.user.update({
    where: { id: userId },
    data: {
      password: hashedPassword,
      tokenVersion: { increment: 1 },
    },
  });

  await createAuditLog({
    userId: authUser.id,
    actionType: AuditActions.USER_RESET_PASSWORD,
    resourceName: "User",
    resourceId: userId,
    afterData: { resetBy: authUser.id },
  });

  await prisma.notification.create({
    data: {
      userId,
      title: "Password Direset oleh Admin",
      message: "Password akun Anda telah direset oleh administrator. Silakan login dengan password baru.",
      type: "SYSTEM",
    },
  });

  return c.json({ success: true, message: "Password berhasil direset" });
});
