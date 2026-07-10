import { Hono } from "hono";
import { prisma } from "@komunaid/database";
import { authMiddleware } from "../middleware/auth";
import { requirePlatformAdmin, requireSuperAdmin, invalidateRoleCache } from "../middleware/rbac";
import { createAuditLog, AuditActions } from "../services/audit";
import type { AuthUser } from "../middleware/auth";

type Env = { Variables: { user: AuthUser; validated: any; userRoles: string[] } };

export const adminRoutes = new Hono<Env>();

adminRoutes.use("*", authMiddleware);
adminRoutes.use("*", requirePlatformAdmin());

function pagination(url: string) {
  const u = new URL(url);
  const page = Math.max(1, parseInt(u.searchParams.get("page") || "1"));
  const limit = Math.min(100, Math.max(1, parseInt(u.searchParams.get("limit") || "20")));
  const search = u.searchParams.get("search") || "";
  const sortBy = u.searchParams.get("sortBy") || "createdAt";
  const sortOrder = u.searchParams.get("sortOrder") === "asc" ? "asc" : "desc";
  return { page, limit, search, sortBy, sortOrder, skip: (page - 1) * limit };
}

// ==========================================
// 1. ADMIN DASHBOARD
// ==========================================

adminRoutes.get("/dashboard", async (c) => {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    totalCommunities,
    totalOrganizations,
    totalEvents,
    pendingCommunities,
    pendingOrganizations,
    pendingReports,
    activeUsers,
    suspendedUsers,
    newUsersLast30d,
    newCommunitiesLast30d,
    newEventsLast30d,
    recentActivity,
    recentAudit,
    recentReports,
    pendingCommunityList,
    pendingOrganizationList,
  ] = await Promise.all([
    prisma.user.count({ where: { deletedAt: null } }),
    prisma.community.count({ where: { deletedAt: null } }),
    prisma.organization.count({ where: { deletedAt: null } }),
    prisma.event.count({ where: { deletedAt: null } }),
    prisma.community.count({ where: { status: "PENDING", deletedAt: null } }),
    prisma.organization.count({ where: { status: "PENDING", deletedAt: null } }),
    prisma.report.count({ where: { status: { in: ["OPEN", "UNDER_REVIEW"] } } }),
    prisma.user.count({ where: { status: "ACTIVE", deletedAt: null } }),
    prisma.user.count({ where: { status: "SUSPENDED", deletedAt: null } }),
    prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo }, deletedAt: null } }),
    prisma.community.count({ where: { createdAt: { gte: thirtyDaysAgo }, deletedAt: null } }),
    prisma.event.count({ where: { createdAt: { gte: thirtyDaysAgo }, deletedAt: null } }),
    prisma.activityHistory.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { user: { select: { id: true, name: true, avatar: true } } },
    }),
    prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { user: { select: { id: true, name: true } } },
    }),
    prisma.report.findMany({
      where: { status: { in: ["OPEN", "UNDER_REVIEW"] } },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { reporter: { select: { id: true, name: true } } },
    }),
    prisma.community.findMany({
      where: { status: "PENDING", deletedAt: null },
      take: 5,
      orderBy: { submittedAt: "asc" },
      include: { owner: { select: { id: true, name: true, avatar: true } } },
    }),
    prisma.organization.findMany({
      where: { status: "PENDING", deletedAt: null },
      take: 5,
      orderBy: { submittedAt: "asc" },
      include: { owner: { select: { id: true, name: true, avatar: true } } },
    }),
  ]);

  return c.json({
    success: true,
    data: {
      stats: {
        totalUsers,
        totalCommunities,
        totalOrganizations,
        totalEvents,
        pendingCommunities,
        pendingOrganizations,
        pendingReports,
        activeUsers,
        suspendedUsers,
        newUsersLast30d,
        newCommunitiesLast30d,
        newEventsLast30d,
      },
      recentActivity: recentActivity.map((a) => ({
        id: a.id,
        action: a.action,
        details: a.details,
        user: a.user,
        createdAt: a.createdAt,
      })),
      recentAudit: recentAudit.map((l) => ({
        id: l.id,
        actionType: l.actionType,
        resourceName: l.resourceName,
        resourceId: l.resourceId,
        user: l.user,
        createdAt: l.createdAt,
      })),
      recentReports: recentReports.map((r) => ({
        id: r.id,
        targetType: r.targetType,
        targetId: r.targetId,
        reason: r.reason,
        status: r.status,
        reporter: r.reporter,
        createdAt: r.createdAt,
      })),
      pendingCommunities: pendingCommunityList.map((comm) => ({
        id: comm.id,
        name: comm.name,
        slug: comm.slug,
        owner: comm.owner,
        submittedAt: comm.submittedAt,
      })),
      pendingOrganizations: pendingOrganizationList.map((org) => ({
        id: org.id,
        name: org.name,
        slug: org.slug,
        owner: org.owner,
        submittedAt: org.submittedAt,
      })),
    },
  });
});

// ==========================================
// 2. USER MANAGEMENT
// ==========================================

adminRoutes.get("/users", async (c) => {
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

adminRoutes.get("/users/:userId", async (c) => {
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

adminRoutes.put("/users/:userId/suspend", async (c) => {
  const authUser = c.get("user");
  const userId = c.req.param("userId") as string;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return c.json({ success: false, message: "User tidak ditemukan" }, 404);
  }

  if (user.status === "SUSPENDED") {
    return c.json({ success: false, message: "User sudah ditangguhkan" }, 400);
  }

  const callerRoles = await prisma.userRole.findMany({ where: { userId: authUser.id }, select: { role: true } });
  const isSuperAdmin = callerRoles.some((r) => r.role === "SUPER_ADMIN");
  if (!isSuperAdmin) {
    const targetRoles = await prisma.userRole.findMany({ where: { userId }, select: { role: true } });
    if (targetRoles.some((r) => ["SUPER_ADMIN", "PLATFORM_ADMIN"].includes(r.role))) {
      return c.json({ success: false, message: "Tidak dapat menangguhkan user dengan hak akses lebih tinggi" }, 403);
    }
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

adminRoutes.put("/users/:userId/activate", async (c) => {
  const authUser = c.get("user");
  const userId = c.req.param("userId") as string;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return c.json({ success: false, message: "User tidak ditemukan" }, 404);
  }

  if (user.status === "ACTIVE") {
    return c.json({ success: false, message: "User sudah aktif" }, 400);
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

adminRoutes.put("/users/:userId/archive", async (c) => {
  const authUser = c.get("user");
  const userId = c.req.param("userId") as string;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return c.json({ success: false, message: "User tidak ditemukan" }, 404);
  }

  if (user.deletedAt) {
    return c.json({ success: false, message: "User sudah diarsipkan" }, 400);
  }

  const before = { status: user.status, deletedAt: user.deletedAt };

  await prisma.user.update({
    where: { id: userId },
    data: { status: "DEACTIVATED", deletedAt: new Date() },
  });

  await createAuditLog({
    userId: authUser.id,
    actionType: "USER_ARCHIVE",
    resourceName: "User",
    resourceId: userId,
    beforeData: before,
    afterData: { status: "DEACTIVATED", deletedAt: new Date().toISOString() },
  });

  return c.json({ success: true, message: "User berhasil diarsipkan" });
});

adminRoutes.put("/users/:userId/restore", async (c) => {
  const authUser = c.get("user");
  const userId = c.req.param("userId") as string;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return c.json({ success: false, message: "User tidak ditemukan" }, 404);
  }

  const before = { status: user.status, deletedAt: user.deletedAt };

  await prisma.user.update({
    where: { id: userId },
    data: { status: "ACTIVE", deletedAt: null },
  });

  await createAuditLog({
    userId: authUser.id,
    actionType: "USER_RESTORE",
    resourceName: "User",
    resourceId: userId,
    beforeData: before,
    afterData: { status: "ACTIVE", deletedAt: null },
  });

  return c.json({ success: true, message: "User berhasil dipulihkan" });
});

// ==========================================
// 3. ROLE MANAGEMENT
// ==========================================

adminRoutes.get("/roles", async (c) => {
  const { page, limit, search, skip } = pagination(c.req.url);
  const url = new URL(c.req.url);
  const roleType = url.searchParams.get("type") || "";

  const where: Record<string, any> = {};

  if (search) {
    where.user = {
      OR: [
        { name: { contains: search } },
        { email: { contains: search } },
        { username: { contains: search } },
      ],
    };
  }

  if (roleType) {
    where.role = roleType;
  }

  const [roles, total] = await Promise.all([
    prisma.userRole.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, email: true, avatar: true, status: true },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.userRole.count({ where }),
  ]);

  return c.json({
    success: true,
    data: roles.map((r) => ({
      id: r.id,
      role: r.role,
      user: r.user,
      createdAt: r.createdAt,
    })),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});

adminRoutes.put("/users/:userId/role", requireSuperAdmin(), async (c) => {
  const authUser = c.get("user");
  const userId = c.req.param("userId") as string;
  const body = await c.req.json();
  const { role } = body as { role: "SUPER_ADMIN" | "PLATFORM_ADMIN" | "MEMBER" };

  if (!["SUPER_ADMIN", "PLATFORM_ADMIN", "MEMBER"].includes(role)) {
    return c.json({ success: false, message: "Role tidak valid" }, 400);
  }

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

// ==========================================
// 4. COMMUNITY APPROVAL
// ==========================================

adminRoutes.get("/communities", async (c) => {
  const { page, limit, search, sortBy, sortOrder, skip } = pagination(c.req.url);
  const url = new URL(c.req.url);
  const status = url.searchParams.get("status") || "";

  const where: Record<string, any> = { deletedAt: null };

  if (search) {
    where.OR = [
      { name: { contains: search } },
      { description: { contains: search } },
    ];
  }
  if (status && status !== "ALL") {
    where.status = status;
  }

  const [communities, total] = await Promise.all([
    prisma.community.findMany({
      where: where as never,
      include: {
        owner: { select: { id: true, name: true, email: true, avatar: true } },
        categories: { include: { category: true } },
        tags: true,
        _count: { select: { members: true, events: true } },
      },
      orderBy: { createdAt: sortOrder as "asc" | "desc" },
      skip,
      take: limit,
    }),
    prisma.community.count({ where: where as never }),
  ]);

  return c.json({
    success: true,
    data: communities.map((comm) => ({
      id: comm.id,
      name: comm.name,
      slug: comm.slug,
      description: comm.description,
      logo: comm.logo,
      banner: comm.banner,
      status: comm.status,
      membershipType: comm.membershipType,
      visibility: comm.visibility,
      adminNote: comm.adminNote,
      submittedAt: comm.submittedAt,
      reviewedAt: comm.reviewedAt,
      owner: comm.owner,
      categories: comm.categories.map((cc) => cc.category),
      tags: comm.tags.map((t) => t.tag),
      memberCount: comm._count.members,
      eventCount: comm._count.events,
      createdAt: comm.createdAt,
    })),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});

adminRoutes.get("/communities/:communityId", async (c) => {
  const communityId = c.req.param("communityId") as string;

  const community = await prisma.community.findUnique({
    where: { id: communityId },
    include: {
      owner: { select: { id: true, name: true, email: true, avatar: true, phone: true } },
      categories: { include: { category: true } },
      tags: true,
      settings: true,
      members: {
        include: { user: { select: { id: true, name: true, avatar: true } } },
        take: 20,
      },
      _count: { select: { members: true, events: true, joinRequests: true } },
    },
  });

  if (!community) {
    return c.json({ success: false, message: "Komunitas tidak ditemukan" }, 404);
  }

  return c.json({
    success: true,
    data: {
      ...community,
      categories: community.categories.map((cc) => cc.category),
      tags: community.tags.map((t) => t.tag),
      members: community.members.map((m) => ({
        id: m.id,
        role: m.role,
        status: m.status,
        joinedAt: m.joinedAt,
        user: m.user,
      })),
    },
  });
});

adminRoutes.put("/communities/:communityId/approve", async (c) => {
  const authUser = c.get("user");
  const communityId = c.req.param("communityId") as string;

  const community = await prisma.community.findUnique({ where: { id: communityId } });
  if (!community) {
    return c.json({ success: false, message: "Komunitas tidak ditemukan" }, 404);
  }

  if (!["PENDING", "REVISION_REQUIRED"].includes(community.status)) {
    return c.json({ success: false, message: "Hanya komunitas pending/revisi yang dapat disetujui" }, 400);
  }

  const before = { status: community.status };

  await prisma.community.update({
    where: { id: communityId },
    data: { status: "APPROVED", reviewedAt: new Date(), adminNote: null },
  });

  const ownerMember = await prisma.communityMember.findFirst({
    where: { communityId, role: "OWNER" },
  });
  if (ownerMember) {
    await prisma.communityMember.update({
      where: { id: ownerMember.id },
      data: { status: "ACTIVE" },
    });
  }

  await prisma.notification.create({
    data: {
      userId: community.ownerId,
      title: "Komunitas Disetujui",
      message: `Komunitas "${community.name}" telah disetujui oleh admin.`,
      type: "APPROVAL",
      link: `/communities/${community.slug}`,
    },
  });

  await createAuditLog({
    userId: authUser.id,
    actionType: AuditActions.COMMUNITY_APPROVE,
    resourceName: "Community",
    resourceId: communityId,
    beforeData: before,
    afterData: { status: "APPROVED" },
  });

  await prisma.membershipHistory.create({
    data: {
      communityId,
      userId: community.ownerId,
      action: "COMMUNITY_APPROVED",
      details: { approvedBy: authUser.id },
      performedBy: authUser.id,
    },
  });

  return c.json({ success: true, message: "Komunitas berhasil disetujui" });
});

adminRoutes.put("/communities/:communityId/suspend", async (c) => {
  const authUser = c.get("user");
  const communityId = c.req.param("communityId") as string;

  const community = await prisma.community.findUnique({ where: { id: communityId } });
  if (!community) {
    return c.json({ success: false, message: "Komunitas tidak ditemukan" }, 404);
  }

  const before = { status: community.status };

  await prisma.community.update({
    where: { id: communityId },
    data: { status: "SUSPENDED" },
  });

  await createAuditLog({
    userId: authUser.id,
    actionType: AuditActions.COMMUNITY_SUSPEND,
    resourceName: "Community",
    resourceId: communityId,
    beforeData: before,
    afterData: { status: "SUSPENDED" },
  });

  await prisma.notification.create({
    data: {
      userId: community.ownerId,
      title: "Komunitas Ditangguhkan",
      message: `Komunitas "${community.name}" telah ditangguhkan oleh admin.`,
      type: "COMMUNITY",
      link: `/communities/${community.slug}`,
    },
  });

  await prisma.membershipHistory.create({
    data: {
      communityId,
      userId: community.ownerId,
      action: "COMMUNITY_SUSPENDED",
      details: { suspendedBy: authUser.id },
      performedBy: authUser.id,
    },
  });

  return c.json({ success: true, message: "Komunitas berhasil ditangguhkan" });
});

adminRoutes.put("/communities/:communityId/restore", async (c) => {
  const authUser = c.get("user");
  const communityId = c.req.param("communityId") as string;

  const community = await prisma.community.findUnique({ where: { id: communityId } });
  if (!community) {
    return c.json({ success: false, message: "Komunitas tidak ditemukan" }, 404);
  }

  const before = { status: community.status };

  await prisma.community.update({
    where: { id: communityId },
    data: { status: "APPROVED" },
  });

  await createAuditLog({
    userId: authUser.id,
    actionType: "COMMUNITY_RESTORE",
    resourceName: "Community",
    resourceId: communityId,
    beforeData: before,
    afterData: { status: "APPROVED" },
  });

  await prisma.notification.create({
    data: {
      userId: community.ownerId,
      title: "Komunitas Dipulihkan",
      message: `Komunitas "${community.name}" telah dipulihkan oleh admin.`,
      type: "COMMUNITY",
      link: `/communities/${community.slug}`,
    },
  });

  return c.json({ success: true, message: "Komunitas berhasil dipulihkan" });
});

adminRoutes.patch("/communities/:communityId/reject", async (c) => {
  const authUser = c.get("user");
  const communityId = c.req.param("communityId") as string;
  const body = await c.req.json();
  const { note } = body as { note?: string };

  const community = await prisma.community.findUnique({ where: { id: communityId } });
  if (!community) {
    return c.json({ success: false, message: "Komunitas tidak ditemukan" }, 404);
  }

  if (!["PENDING", "REVISION_REQUIRED"].includes(community.status)) {
    return c.json({ success: false, message: "Hanya komunitas pending/revisi yang dapat ditolak" }, 400);
  }

  await prisma.community.update({
    where: { id: communityId },
    data: { status: "REJECTED", adminNote: note || null, reviewedAt: new Date() },
  });

  await prisma.notification.create({
    data: {
      userId: community.ownerId,
      title: "Komunitas Ditolak",
      message: `Komunitas "${community.name}" ditolak. ${note ? `Alasan: ${note}` : ""}`,
      type: "APPROVAL",
      link: `/communities/${community.slug}`,
    },
  });

  await createAuditLog({
    userId: authUser.id,
    actionType: AuditActions.COMMUNITY_REJECTED,
    resourceName: "Community",
    resourceId: communityId,
    beforeData: { status: community.status },
    afterData: { status: "REJECTED", note },
  });

  await prisma.membershipHistory.create({
    data: {
      communityId,
      userId: community.ownerId,
      action: "COMMUNITY_REJECTED",
      details: { rejectedBy: authUser.id, note: note || null },
      performedBy: authUser.id,
    },
  });

  return c.json({ success: true, message: "Komunitas berhasil ditolak" });
});

adminRoutes.patch("/communities/:communityId/request-revision", async (c) => {
  const authUser = c.get("user");
  const communityId = c.req.param("communityId") as string;
  const body = await c.req.json();
  const { note } = body as { note?: string };

  const community = await prisma.community.findUnique({ where: { id: communityId } });
  if (!community) {
    return c.json({ success: false, message: "Komunitas tidak ditemukan" }, 404);
  }

  if (!["PENDING"].includes(community.status)) {
    return c.json({ success: false, message: "Hanya komunitas pending yang dapat diminta revisi" }, 400);
  }

  await prisma.community.update({
    where: { id: communityId },
    data: { status: "REVISION_REQUIRED", adminNote: note || null, reviewedAt: new Date() },
  });

  await prisma.notification.create({
    data: {
      userId: community.ownerId,
      title: "Revisi Diperlukan",
      message: `Komunitas "${community.name}" perlu direvisi. ${note ? `Catatan: ${note}` : ""}`,
      type: "APPROVAL",
      link: `/communities/${community.slug}`,
    },
  });

  await createAuditLog({
    userId: authUser.id,
    actionType: AuditActions.COMMUNITY_REVISION_REQUESTED,
    resourceName: "Community",
    resourceId: communityId,
    beforeData: { status: community.status },
    afterData: { status: "REVISION_REQUIRED", note },
  });

  await prisma.membershipHistory.create({
    data: {
      communityId,
      userId: community.ownerId,
      action: "COMMUNITY_REVISION_REQUESTED",
      details: { requestedBy: authUser.id, note: note || null },
      performedBy: authUser.id,
    },
  });

  return c.json({ success: true, message: "Revisi berhasil diminta" });
});

// ==========================================
// 5. ORGANIZATION APPROVAL
// ==========================================

adminRoutes.get("/organizations", async (c) => {
  const { page, limit, search, sortBy, sortOrder, skip } = pagination(c.req.url);
  const url = new URL(c.req.url);
  const status = url.searchParams.get("status") || "";

  const where: Record<string, any> = { deletedAt: null };

  if (search) {
    where.OR = [
      { name: { contains: search } },
      { description: { contains: search } },
    ];
  }
  if (status && status !== "ALL") {
    where.status = status;
  }

  const [organizations, total] = await Promise.all([
    prisma.organization.findMany({
      where: where as never,
      include: {
        owner: { select: { id: true, name: true, email: true, avatar: true } },
        categories: { include: { category: true } },
        tags: true,
        _count: { select: { members: true, events: true } },
      },
      orderBy: { createdAt: sortOrder as "asc" | "desc" },
      skip,
      take: limit,
    }),
    prisma.organization.count({ where: where as never }),
  ]);

  return c.json({
    success: true,
    data: organizations.map((org: any) => ({
      id: org.id,
      name: org.name,
      slug: org.slug,
      description: org.description,
      logo: org.logo,
      banner: org.banner,
      industry: org.industry,
      status: org.status,
      visibility: org.visibility,
      adminNote: org.adminNote,
      submittedAt: org.submittedAt,
      reviewedAt: org.reviewedAt,
      owner: org.owner,
      categories: org.categories.map((oc: any) => oc.category),
      tags: org.tags.map((t: any) => t.tag),
      memberCount: org._count.members,
      eventCount: org._count.events,
      createdAt: org.createdAt,
    })),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});

adminRoutes.get("/organizations/:organizationId", async (c) => {
  const organizationId = c.req.param("organizationId") as string;

  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
    include: {
      owner: { select: { id: true, name: true, email: true, avatar: true, phone: true } },
      categories: { include: { category: true } },
      tags: true,
      settings: true,
      members: {
        include: { user: { select: { id: true, name: true, avatar: true } } },
        take: 20,
      },
      _count: { select: { members: true, events: true } },
    },
  });

  if (!organization) {
    return c.json({ success: false, message: "Organisasi tidak ditemukan" }, 404);
  }

  return c.json({
    success: true,
    data: {
      ...organization,
      categories: organization.categories.map((oc) => oc.category),
      tags: organization.tags.map((t) => t.tag),
      members: organization.members.map((m) => ({
        id: m.id,
        role: m.role,
        status: m.status,
        joinedAt: m.joinedAt,
        user: m.user,
      })),
    },
  });
});

adminRoutes.put("/organizations/:organizationId/approve", async (c) => {
  const authUser = c.get("user");
  const organizationId = c.req.param("organizationId") as string;

  const organization = await prisma.organization.findUnique({ where: { id: organizationId } });
  if (!organization) {
    return c.json({ success: false, message: "Organisasi tidak ditemukan" }, 404);
  }

  if (!["PENDING", "REVISION_REQUIRED"].includes(organization.status)) {
    return c.json({ success: false, message: "Hanya organisasi pending/revisi yang dapat disetujui" }, 400);
  }

  const before = { status: organization.status };

  await prisma.organization.update({
    where: { id: organizationId },
    data: { status: "APPROVED", reviewedAt: new Date(), adminNote: null },
  });

  const ownerMember = await prisma.organizationMember.findFirst({
    where: { organizationId, role: "OWNER" },
  });
  if (ownerMember) {
    await prisma.organizationMember.update({
      where: { id: ownerMember.id },
      data: { status: "ACTIVE" },
    });
  }

  await prisma.notification.create({
    data: {
      userId: organization.ownerId,
      title: "Organisasi Disetujui",
      message: `Organisasi "${organization.name}" telah disetujui oleh admin.`,
      type: "APPROVAL",
      link: `/organizations/${organization.slug}`,
    },
  });

  await createAuditLog({
    userId: authUser.id,
    actionType: AuditActions.ORG_APPROVE,
    resourceName: "Organization",
    resourceId: organizationId,
    beforeData: before,
    afterData: { status: "APPROVED" },
  });

  return c.json({ success: true, message: "Organisasi berhasil disetujui" });
});

adminRoutes.put("/organizations/:organizationId/suspend", async (c) => {
  const authUser = c.get("user");
  const organizationId = c.req.param("organizationId") as string;

  const organization = await prisma.organization.findUnique({ where: { id: organizationId } });
  if (!organization) {
    return c.json({ success: false, message: "Organisasi tidak ditemukan" }, 404);
  }

  const before = { status: organization.status };

  await prisma.organization.update({
    where: { id: organizationId },
    data: { status: "SUSPENDED" },
  });

  await prisma.notification.create({
    data: {
      userId: organization.ownerId,
      title: "Organisasi Ditangguhkan",
      message: `Organisasi "${organization.name}" telah ditangguhkan oleh admin.`,
      type: "ORGANIZATION",
      link: `/organizations/${organization.slug}`,
    },
  });

  await createAuditLog({
    userId: authUser.id,
    actionType: AuditActions.ORG_SUSPEND,
    resourceName: "Organization",
    resourceId: organizationId,
    beforeData: before,
    afterData: { status: "SUSPENDED" },
  });

  return c.json({ success: true, message: "Organisasi berhasil ditangguhkan" });
});

adminRoutes.put("/organizations/:organizationId/restore", async (c) => {
  const authUser = c.get("user");
  const organizationId = c.req.param("organizationId") as string;

  const organization = await prisma.organization.findUnique({ where: { id: organizationId } });
  if (!organization) {
    return c.json({ success: false, message: "Organisasi tidak ditemukan" }, 404);
  }

  const before = { status: organization.status };

  await prisma.organization.update({
    where: { id: organizationId },
    data: { status: "APPROVED" },
  });

  await prisma.notification.create({
    data: {
      userId: organization.ownerId,
      title: "Organisasi Dipulihkan",
      message: `Organisasi "${organization.name}" telah dipulihkan oleh admin.`,
      type: "ORGANIZATION",
      link: `/organizations/${organization.slug}`,
    },
  });

  await createAuditLog({
    userId: authUser.id,
    actionType: "ORG_RESTORE",
    resourceName: "Organization",
    resourceId: organizationId,
    beforeData: before,
    afterData: { status: "APPROVED" },
  });

  return c.json({ success: true, message: "Organisasi berhasil dipulihkan" });
});

adminRoutes.patch("/organizations/:organizationId/reject", async (c) => {
  const authUser = c.get("user");
  const organizationId = c.req.param("organizationId") as string;
  const body = await c.req.json();
  const { note } = body as { note?: string };

  const organization = await prisma.organization.findUnique({ where: { id: organizationId } });
  if (!organization) {
    return c.json({ success: false, message: "Organisasi tidak ditemukan" }, 404);
  }

  if (!["PENDING", "REVISION_REQUIRED"].includes(organization.status)) {
    return c.json({ success: false, message: "Hanya organisasi pending/revisi yang dapat ditolak" }, 400);
  }

  await prisma.organization.update({
    where: { id: organizationId },
    data: { status: "REJECTED", adminNote: note || null, reviewedAt: new Date() },
  });

  await prisma.notification.create({
    data: {
      userId: organization.ownerId,
      title: "Organisasi Ditolak",
      message: `Organisasi "${organization.name}" ditolak. ${note ? `Alasan: ${note}` : ""}`,
      type: "APPROVAL",
      link: `/organizations/${organization.slug}`,
    },
  });

  await createAuditLog({
    userId: authUser.id,
    actionType: "ORG_REJECTED",
    resourceName: "Organization",
    resourceId: organizationId,
    beforeData: { status: organization.status },
    afterData: { status: "REJECTED", note },
  });

  return c.json({ success: true, message: "Organisasi berhasil ditolak" });
});

adminRoutes.patch("/organizations/:organizationId/request-revision", async (c) => {
  const authUser = c.get("user");
  const organizationId = c.req.param("organizationId") as string;
  const body = await c.req.json();
  const { note } = body as { note?: string };

  const organization = await prisma.organization.findUnique({ where: { id: organizationId } });
  if (!organization) {
    return c.json({ success: false, message: "Organisasi tidak ditemukan" }, 404);
  }

  if (organization.status !== "PENDING") {
    return c.json({ success: false, message: "Hanya organisasi pending yang dapat diminta revisi" }, 400);
  }

  await prisma.organization.update({
    where: { id: organizationId },
    data: { status: "REVISION_REQUIRED", adminNote: note || null, reviewedAt: new Date() },
  });

  await prisma.notification.create({
    data: {
      userId: organization.ownerId,
      title: "Revisi Diperlukan",
      message: `Organisasi "${organization.name}" perlu direvisi. ${note ? `Catatan: ${note}` : ""}`,
      type: "APPROVAL",
      link: `/organizations/${organization.slug}`,
    },
  });

  await createAuditLog({
    userId: authUser.id,
    actionType: "ORG_REVISION_REQUESTED",
    resourceName: "Organization",
    resourceId: organizationId,
    beforeData: { status: organization.status },
    afterData: { status: "REVISION_REQUIRED", note },
  });

  return c.json({ success: true, message: "Revisi berhasil diminta" });
});

adminRoutes.get("/communities/review-queue", async (c) => {
  const { page, limit, search, sortBy, sortOrder, skip } = pagination(c.req.url);
  const url = new URL(c.req.url);
  const status = url.searchParams.get("status") || "PENDING";

  const where: Record<string, any> = { deletedAt: null };

  if (search) {
    where.OR = [
      { name: { contains: search } },
      { description: { contains: search } },
    ];
  }
  if (status && status !== "ALL") {
    if (["PENDING", "REVISION_REQUIRED"].includes(status)) {
      where.status = status;
    } else {
      where.status = { in: ["PENDING", "REVISION_REQUIRED"] };
    }
  } else {
    where.status = { in: ["PENDING", "REVISION_REQUIRED"] };
  }

  const allowedSort: Record<string, string> = { createdAt: "createdAt", name: "name", status: "status", submittedAt: "submittedAt" };
  const orderBy = allowedSort[sortBy] ? { [allowedSort[sortBy]]: sortOrder } : { submittedAt: "asc" };

  const [communities, total] = await Promise.all([
    prisma.community.findMany({
      where,
      include: {
        owner: { select: { id: true, name: true, email: true, avatar: true } },
        categories: { include: { category: true } },
        tags: true,
        _count: { select: { members: true, events: true } },
      },
      orderBy: orderBy as any,
      skip,
      take: limit,
    }),
    prisma.community.count({ where }),
  ]);

  return c.json({
    success: true,
    data: communities.map((comm: any) => ({
      id: comm.id,
      name: comm.name,
      slug: comm.slug,
      description: comm.description,
      logo: comm.logo,
      banner: comm.banner,
      status: comm.status,
      membershipType: comm.membershipType,
      visibility: comm.visibility,
      adminNote: comm.adminNote,
      submittedAt: comm.submittedAt,
      owner: comm.owner,
      categories: comm.categories.map((cc: any) => cc.category),
      tags: comm.tags.map((t: any) => t.tag),
      memberCount: comm._count.members,
      eventCount: comm._count.events,
      createdAt: comm.createdAt,
    })),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});

// ==========================================
// 6. EVENT MODERATION
// ==========================================

adminRoutes.get("/events", async (c) => {
  const { page, limit, search, sortBy, sortOrder, skip } = pagination(c.req.url);
  const url = new URL(c.req.url);
  const status = url.searchParams.get("status") || "";

  const where: Record<string, any> = { deletedAt: null };

  if (search) {
    where.OR = [
      { title: { contains: search } },
      { description: { contains: search } },
    ];
  }
  if (status && status !== "ALL") {
    where.status = status;
  }

  const [events, total] = await Promise.all([
    prisma.event.findMany({
      where: where as never,
      include: {
        createdBy: { select: { id: true, name: true, avatar: true } },
        community: { select: { id: true, name: true, slug: true } },
        organization: { select: { id: true, name: true, slug: true } },
        categories: { include: { category: true } },
        _count: { select: { registrations: true } },
      },
      orderBy: { createdAt: sortOrder as "asc" | "desc" },
      skip,
      take: limit,
    }),
    prisma.event.count({ where: where as never }),
  ]);

  return c.json({
    success: true,
    data: events.map((e) => ({
      id: e.id,
      title: e.title,
      slug: e.slug,
      description: e.description,
      coverImage: e.coverImage,
      eventDate: e.eventDate,
      endDate: e.endDate,
      quota: e.quota,
      status: e.status,
      visibility: e.visibility,
      isOnline: e.isOnline,
      community: e.community,
      organization: e.organization,
      createdBy: e.createdBy,
      categories: e.categories.map((ec) => ec.category),
      registrationCount: e._count.registrations,
      createdAt: e.createdAt,
    })),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});

adminRoutes.put("/events/:eventId/suspend", async (c) => {
  const authUser = c.get("user");
  const eventId = c.req.param("eventId") as string;

  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) {
    return c.json({ success: false, message: "Event tidak ditemukan" }, 404);
  }

  const before = { status: event.status };

  await prisma.event.update({
    where: { id: eventId },
    data: { status: "CANCELLED" },
  });

  const notificationData: any = {
    title: "Event Ditangguhkan",
    message: `Event "${event.title}" telah ditangguhkan oleh admin.`,
    type: "EVENT",
    link: `/events/${event.slug}`,
  };

  if (event.communityId) {
    const owner = await prisma.communityMember.findFirst({
      where: { communityId: event.communityId, role: "OWNER" },
    });
    if (owner) {
      notificationData.userId = owner.userId;
      await prisma.notification.create({ data: notificationData });
    }
  }

  await createAuditLog({
    userId: authUser.id,
    actionType: AuditActions.EVENT_CANCEL,
    resourceName: "Event",
    resourceId: eventId,
    beforeData: before,
    afterData: { status: "CANCELLED" },
  });

  return c.json({ success: true, message: "Event berhasil ditangguhkan" });
});

adminRoutes.put("/events/:eventId/restore", async (c) => {
  const authUser = c.get("user");
  const eventId = c.req.param("eventId") as string;

  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) {
    return c.json({ success: false, message: "Event tidak ditemukan" }, 404);
  }

  const before = { status: event.status };

  await prisma.event.update({
    where: { id: eventId },
    data: { status: "PUBLISHED" },
  });

  await createAuditLog({
    userId: authUser.id,
    actionType: "EVENT_RESTORE",
    resourceName: "Event",
    resourceId: eventId,
    beforeData: before,
    afterData: { status: "PUBLISHED" },
  });

  return c.json({ success: true, message: "Event berhasil dipulihkan" });
});

adminRoutes.put("/events/:eventId/archive", async (c) => {
  const authUser = c.get("user");
  const eventId = c.req.param("eventId") as string;

  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) {
    return c.json({ success: false, message: "Event tidak ditemukan" }, 404);
  }

  const before = { status: event.status };

  await prisma.event.update({
    where: { id: eventId },
    data: { status: "ARCHIVED" },
  });

  await createAuditLog({
    userId: authUser.id,
    actionType: AuditActions.EVENT_ARCHIVE,
    resourceName: "Event",
    resourceId: eventId,
    beforeData: before,
    afterData: { status: "ARCHIVED" },
  });

  return c.json({ success: true, message: "Event berhasil diarsipkan" });
});

adminRoutes.get("/events/:eventId", async (c) => {
  const eventId = c.req.param("eventId") as string;

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      createdBy: { select: { id: true, name: true, email: true, avatar: true } },
      community: { select: { id: true, name: true, slug: true } },
      organization: { select: { id: true, name: true, slug: true } },
      categories: { include: { category: true } },
      registrations: {
        include: { user: { select: { id: true, name: true, avatar: true } } },
        take: 20,
      },
      volunteerOpportunities: {
        include: { positions: true, _count: { select: { applications: true } } },
      },
      _count: { select: { registrations: true } },
    },
  });

  if (!event) {
    return c.json({ success: false, message: "Event tidak ditemukan" }, 404);
  }

  return c.json({
    success: true,
    data: {
      ...event,
      categories: event.categories.map((ec) => ec.category),
      registrations: event.registrations.map((r) => ({
        id: r.id,
        userId: r.userId,
        status: r.status,
        attendance: r.attendance,
        registeredAt: r.registeredAt,
        user: r.user,
      })),
      registrationCount: event._count.registrations,
    },
  });
});

adminRoutes.put("/events/:eventId/publish", async (c) => {
  const authUser = c.get("user");
  const eventId = c.req.param("eventId") as string;

  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) {
    return c.json({ success: false, message: "Event tidak ditemukan" }, 404);
  }

  if (event.status !== "DRAFT") {
    return c.json({ success: false, message: "Hanya event draft yang dapat dipublish" }, 400);
  }

  const before = { status: event.status };

  await prisma.event.update({
    where: { id: eventId },
    data: { status: "PUBLISHED" },
  });

  await createAuditLog({
    userId: authUser.id,
    actionType: AuditActions.EVENT_PUBLISH,
    resourceName: "Event",
    resourceId: eventId,
    beforeData: before,
    afterData: { status: "PUBLISHED" },
  });

  return c.json({ success: true, message: "Event berhasil dipublish" });
});

adminRoutes.put("/events/:eventId/cancel", async (c) => {
  const authUser = c.get("user");
  const eventId = c.req.param("eventId") as string;

  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) {
    return c.json({ success: false, message: "Event tidak ditemukan" }, 404);
  }

  const before = { status: event.status };

  await prisma.event.update({
    where: { id: eventId },
    data: { status: "CANCELLED" },
  });

  await createAuditLog({
    userId: authUser.id,
    actionType: AuditActions.EVENT_CANCEL,
    resourceName: "Event",
    resourceId: eventId,
    beforeData: before,
    afterData: { status: "CANCELLED" },
  });

  return c.json({ success: true, message: "Event berhasil dibatalkan" });
});

adminRoutes.get("/events/:eventId/registrations", async (c) => {
  const { page, limit, skip } = pagination(c.req.url);
  const eventId = c.req.param("eventId") as string;

  const [registrations, total] = await Promise.all([
    prisma.eventRegistration.findMany({
      where: { eventId },
      include: { user: { select: { id: true, name: true, email: true, avatar: true } } },
      orderBy: { registeredAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.eventRegistration.count({ where: { eventId } }),
  ]);

  return c.json({
    success: true,
    data: registrations.map((r) => ({
      id: r.id,
      userId: r.userId,
      status: r.status,
      attendance: r.attendance,
      checkedInAt: r.checkedInAt,
      registeredAt: r.registeredAt,
      user: r.user,
    })),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});

// ==========================================
// 7. VOLUNTEER MANAGEMENT
// ==========================================

adminRoutes.get("/volunteers", async (c) => {
  const { page, limit, search, sortBy, sortOrder, skip } = pagination(c.req.url);
  const url = new URL(c.req.url);
  const status = url.searchParams.get("status") || "";

  const where: Record<string, any> = { deletedAt: null };

  if (search) {
    where.OR = [
      { title: { contains: search } },
      { description: { contains: search } },
    ];
  }
  if (status && status !== "ALL") {
    where.status = status;
  }

  const allowedSort: Record<string, string> = { createdAt: "createdAt", title: "title", status: "status" };
  const orderBy = allowedSort[sortBy] ? { [allowedSort[sortBy]]: sortOrder } : { createdAt: "desc" };

  const [opportunities, total] = await Promise.all([
    prisma.volunteerOpportunity.findMany({
      where,
      include: {
        createdBy: { select: { id: true, name: true, avatar: true } },
        event: { select: { id: true, title: true, slug: true } },
        positions: true,
        _count: { select: { applications: true } },
      },
      orderBy: orderBy as any,
      skip,
      take: limit,
    }),
    prisma.volunteerOpportunity.count({ where }),
  ]);

  return c.json({
    success: true,
    data: opportunities.map((o: any) => ({
      id: o.id,
      title: o.title,
      slug: o.slug,
      description: o.description,
      status: o.status,
      event: o.event,
      createdBy: o.createdBy,
      positions: o.positions,
      applicationCount: o._count.applications,
      createdAt: o.createdAt,
    })),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});

adminRoutes.get("/volunteers/:opportunityId", async (c) => {
  const opportunityId = c.req.param("opportunityId") as string;

  const opportunity = await prisma.volunteerOpportunity.findUnique({
    where: { id: opportunityId },
    include: {
      createdBy: { select: { id: true, name: true, email: true, avatar: true } },
      event: { select: { id: true, title: true, slug: true } },
      positions: {
        include: {
          applications: {
            include: { user: { select: { id: true, name: true, email: true, avatar: true } } },
            orderBy: { createdAt: "desc" },
          },
        },
      },
      _count: { select: { applications: true } },
    },
  });

  if (!opportunity) {
    return c.json({ success: false, message: "Volunteer opportunity tidak ditemukan" }, 404);
  }

  return c.json({
    success: true,
    data: {
      ...opportunity,
      applicationCount: opportunity._count.applications,
    },
  });
});

adminRoutes.get("/volunteers/:opportunityId/applications", async (c) => {
  const { page, limit, skip } = pagination(c.req.url);
  const opportunityId = c.req.param("opportunityId") as string;
  const url = new URL(c.req.url);
  const status = url.searchParams.get("status") || "";

  const where: Record<string, any> = { opportunityId };
  if (status && status !== "ALL") {
    where.status = status;
  }

  const [applications, total] = await Promise.all([
    prisma.volunteerApplication.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true, avatar: true } },
        position: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.volunteerApplication.count({ where }),
  ]);

  return c.json({
    success: true,
    data: applications.map((a) => ({
      id: a.id,
      userId: a.userId,
      motivation: a.motivation,
      experience: a.experience,
      availability: a.availability,
      status: a.status,
      reviewNote: a.reviewNote,
      reviewedAt: a.reviewedAt,
      user: a.user,
      position: a.position,
      createdAt: a.createdAt,
    })),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});

adminRoutes.put("/volunteers/applications/:applicationId/approve", async (c) => {
  const authUser = c.get("user");
  const applicationId = c.req.param("applicationId") as string;

  const application = await prisma.volunteerApplication.findUnique({ where: { id: applicationId } });
  if (!application) {
    return c.json({ success: false, message: "Aplikasi tidak ditemukan" }, 404);
  }

  if (application.status === "ACCEPTED") {
    return c.json({ success: false, message: "Aplikasi sudah diterima" }, 400);
  }

  const before = { status: application.status };

  await prisma.volunteerApplication.update({
    where: { id: applicationId },
    data: { status: "ACCEPTED", reviewedById: authUser.id, reviewedAt: new Date() },
  });

  await createAuditLog({
    userId: authUser.id,
    actionType: "VOLUNTEER_APPLICATION_APPROVE",
    resourceName: "VolunteerApplication",
    resourceId: applicationId,
    beforeData: before,
    afterData: { status: "ACCEPTED" },
  });

  await prisma.notification.create({
    data: {
      userId: application.userId,
      title: "Aplikasi Volunteer Diterima",
      message: "Aplikasi volunteer Anda telah diterima oleh admin.",
      type: "SYSTEM",
    },
  });

  return c.json({ success: true, message: "Aplikasi berhasil diterima" });
});

adminRoutes.put("/volunteers/applications/:applicationId/reject", async (c) => {
  const authUser = c.get("user");
  const applicationId = c.req.param("applicationId") as string;
  const body = await c.req.json();
  const { note } = body as { note?: string };

  const application = await prisma.volunteerApplication.findUnique({ where: { id: applicationId } });
  if (!application) {
    return c.json({ success: false, message: "Aplikasi tidak ditemukan" }, 404);
  }

  const before = { status: application.status };

  await prisma.volunteerApplication.update({
    where: { id: applicationId },
    data: { status: "REJECTED", reviewedById: authUser.id, reviewedAt: new Date(), reviewNote: note || null },
  });

  await createAuditLog({
    userId: authUser.id,
    actionType: "VOLUNTEER_APPLICATION_REJECT",
    resourceName: "VolunteerApplication",
    resourceId: applicationId,
    beforeData: before,
    afterData: { status: "REJECTED", note },
  });

  return c.json({ success: true, message: "Aplikasi berhasil ditolak" });
});

adminRoutes.put("/volunteers/:opportunityId/suspend", async (c) => {
  const authUser = c.get("user");
  const opportunityId = c.req.param("opportunityId") as string;

  const opportunity = await prisma.volunteerOpportunity.findUnique({ where: { id: opportunityId } });
  if (!opportunity) {
    return c.json({ success: false, message: "Volunteer opportunity tidak ditemukan" }, 404);
  }

  const before = { status: opportunity.status };

  await prisma.volunteerOpportunity.update({
    where: { id: opportunityId },
    data: { status: "CLOSED" },
  });

  await createAuditLog({
    userId: authUser.id,
    actionType: "VOLUNTEER_SUSPEND",
    resourceName: "VolunteerOpportunity",
    resourceId: opportunityId,
    beforeData: before,
    afterData: { status: "CLOSED" },
  });

  return c.json({ success: true, message: "Volunteer opportunity berhasil ditutup" });
});

adminRoutes.put("/volunteers/:opportunityId/archive", async (c) => {
  const authUser = c.get("user");
  const opportunityId = c.req.param("opportunityId") as string;

  const opportunity = await prisma.volunteerOpportunity.findUnique({ where: { id: opportunityId } });
  if (!opportunity) {
    return c.json({ success: false, message: "Volunteer opportunity tidak ditemukan" }, 404);
  }

  const before = { status: opportunity.status };

  await prisma.volunteerOpportunity.update({
    where: { id: opportunityId },
    data: { status: "ARCHIVED" },
  });

  await createAuditLog({
    userId: authUser.id,
    actionType: "VOLUNTEER_ARCHIVE",
    resourceName: "VolunteerOpportunity",
    resourceId: opportunityId,
    beforeData: before,
    afterData: { status: "ARCHIVED" },
  });

  return c.json({ success: true, message: "Volunteer opportunity berhasil diarsipkan" });
});

// ==========================================
// 8. REPORT MANAGEMENT
// ==========================================

adminRoutes.get("/reports", async (c) => {
  const { page, limit, search, skip } = pagination(c.req.url);
  const url = new URL(c.req.url);
  const status = url.searchParams.get("status") || "";
  const targetType = url.searchParams.get("targetType") || "";

  const where: Record<string, any> = {};

  if (status && status !== "ALL") {
    where.status = status;
  }
  if (targetType) {
    where.targetType = targetType;
  }
  if (search) {
    where.OR = [
      { description: { contains: search } },
      { reason: { contains: search } },
    ];
  }

  const [reports, total] = await Promise.all([
    prisma.report.findMany({
      where,
      include: {
        reporter: { select: { id: true, name: true, email: true, avatar: true } },
        reviewer: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.report.count({ where }),
  ]);

  return c.json({
    success: true,
    data: reports.map((r) => ({
      id: r.id,
      targetType: r.targetType,
      targetId: r.targetId,
      reason: r.reason,
      description: r.description,
      status: r.status,
      reviewNote: r.reviewNote,
      reporter: r.reporter,
      reviewer: r.reviewer,
      reviewedAt: r.reviewedAt,
      createdAt: r.createdAt,
    })),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});

adminRoutes.put("/reports/:reportId/resolve", async (c) => {
  const authUser = c.get("user");
  const reportId = c.req.param("reportId") as string;
  const body = await c.req.json();
  const { action, note } = body as { action: "DISMISSED" | "SUSPENDED"; note?: string };

  if (!["DISMISSED", "SUSPENDED"].includes(action)) {
    return c.json({ success: false, message: "Action tidak valid" }, 400);
  }

  const report = await prisma.report.findUnique({ where: { id: reportId } });
  if (!report) {
    return c.json({ success: false, message: "Laporan tidak ditemukan" }, 404);
  }

  if (!["OPEN", "UNDER_REVIEW"].includes(report.status)) {
    return c.json({ success: false, message: "Laporan sudah ditindaklanjuti" }, 400);
  }

  const before = { status: report.status };

  await prisma.report.update({
    where: { id: reportId },
    data: {
      status: action,
      reviewedBy: authUser.id,
      reviewedAt: new Date(),
      reviewNote: note || null,
    },
  });

  await prisma.notification.create({
    data: {
      userId: report.reporterId,
      title: "Laporan Ditindaklanjuti",
      message: `Laporan Anda telah ${action === "SUSPENDED" ? "ditindaklanjuti" : "ditolak"}. ${note ? `Catatan: ${note}` : ""}`,
      type: "REPORT",
    },
  });

  await createAuditLog({
    userId: authUser.id,
    actionType: action === "SUSPENDED" ? AuditActions.REPORT_RESOLVE : AuditActions.REPORT_DISMISS,
    resourceName: "Report",
    resourceId: reportId,
    beforeData: before,
    afterData: { status: action, note },
  });

  return c.json({ success: true, message: `Laporan berhasil ${action === "SUSPENDED" ? "ditindaklanjuti" : "ditolak"}` });
});

adminRoutes.put("/reports/:reportId/under-review", async (c) => {
  const authUser = c.get("user");
  const reportId = c.req.param("reportId") as string;

  const report = await prisma.report.findUnique({ where: { id: reportId } });
  if (!report) {
    return c.json({ success: false, message: "Laporan tidak ditemukan" }, 404);
  }

  if (report.status !== "OPEN") {
    return c.json({ success: false, message: "Hanya laporan open yang dapat di-review" }, 400);
  }

  const before = { status: report.status };

  await prisma.report.update({
    where: { id: reportId },
    data: { status: "UNDER_REVIEW", reviewedBy: authUser.id },
  });

  await createAuditLog({
    userId: authUser.id,
    actionType: "REPORT_UNDER_REVIEW",
    resourceName: "Report",
    resourceId: reportId,
    beforeData: before,
    afterData: { status: "UNDER_REVIEW" },
  });

  return c.json({ success: true, message: "Laporan sedang dalam review" });
});

// ==========================================
// 8. CATEGORY MANAGEMENT
// ==========================================

adminRoutes.get("/categories", async (c) => {
  const url = new URL(c.req.url);
  const type = url.searchParams.get("type") || "";
  const includeInactive = url.searchParams.get("includeInactive") === "true";

  const where: Record<string, any> = {};
  if (!includeInactive) where.isActive = true;
  if (type) where.type = type;

  const categories = await prisma.category.findMany({
    where,
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: {
          communities: true,
          organizations: true,
          events: true,
        },
      },
    },
  });

  return c.json({
    success: true,
    data: categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      icon: cat.icon,
      type: cat.type,
      isActive: cat.isActive,
      communityCount: cat._count.communities,
      organizationCount: cat._count.organizations,
      eventCount: cat._count.events,
      createdAt: cat.createdAt,
    })),
  });
});

adminRoutes.post("/categories", async (c) => {
  const authUser = c.get("user");
  const body = await c.req.json();
  const { name, description, icon, type } = body as { name: string; description?: string; icon?: string; type?: string };

  if (!name) {
    return c.json({ success: false, message: "Nama kategori wajib diisi" }, 400);
  }

  if (type && !["COMMUNITY", "ORGANIZATION", "EVENT"].includes(type)) {
    return c.json({ success: false, message: "Tipe kategori tidak valid" }, 400);
  }

  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  const existing = await prisma.category.findUnique({ where: { slug } });
  if (existing) {
    return c.json({ success: false, message: "Kategori sudah ada" }, 409);
  }

  const category = await prisma.category.create({
    data: {
      name,
      slug,
      description,
      icon,
      type: (type as any) || "COMMUNITY",
    },
  });

  await createAuditLog({
    userId: authUser.id,
    actionType: AuditActions.SETTINGS_UPDATE,
    resourceName: "Category",
    resourceId: category.id,
    afterData: { name, slug, type: category.type },
  });

  return c.json({ success: true, data: category }, 201);
});

adminRoutes.put("/categories/:categoryId", async (c) => {
  const authUser = c.get("user");
  const categoryId = c.req.param("categoryId") as string;
  const body = await c.req.json();
  const { name, description, icon, isActive, type } = body;

  const category = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!category) {
    return c.json({ success: false, message: "Kategori tidak ditemukan" }, 404);
  }

  const before = { name: category.name, description: category.description, icon: category.icon, isActive: category.isActive, type: category.type };

  const updated = await prisma.category.update({
    where: { id: categoryId },
    data: {
      ...(name && { name }),
      ...(description !== undefined && { description }),
      ...(icon !== undefined && { icon }),
      ...(isActive !== undefined && { isActive }),
      ...(type && { type }),
    },
  });

  await createAuditLog({
    userId: authUser.id,
    actionType: AuditActions.SETTINGS_UPDATE,
    resourceName: "Category",
    resourceId: categoryId,
    beforeData: before,
    afterData: { name: updated.name, description: updated.description, isActive: updated.isActive, type: updated.type },
  });

  return c.json({ success: true, data: updated });
});

adminRoutes.delete("/categories/:categoryId", async (c) => {
  const authUser = c.get("user");
  const categoryId = c.req.param("categoryId") as string;

  const category = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!category) {
    return c.json({ success: false, message: "Kategori tidak ditemukan" }, 404);
  }

  await prisma.category.update({
    where: { id: categoryId },
    data: { isActive: false },
  });

  await createAuditLog({
    userId: authUser.id,
    actionType: AuditActions.SETTINGS_UPDATE,
    resourceName: "Category",
    resourceId: categoryId,
    beforeData: { isActive: true },
    afterData: { isActive: false },
  });

  return c.json({ success: true, message: "Kategori berhasil dinonaktifkan" });
});

// ==========================================
// 9. MASTER DATA
// ==========================================

adminRoutes.get("/master-data/provinces", async (c) => {
  const setting = await prisma.setting.findUnique({ where: { key: "master_provinces" } });
  const provinces = setting ? (setting.value as string[]) : [];
  return c.json({ success: true, data: provinces });
});

adminRoutes.put("/master-data/provinces", requireSuperAdmin(), async (c) => {
  const authUser = c.get("user");
  const body = await c.req.json();
  const { provinces } = body as { provinces: string[] };

  if (!Array.isArray(provinces)) {
    return c.json({ success: false, message: "Data provinsi tidak valid" }, 400);
  }

  await prisma.setting.upsert({
    where: { key: "master_provinces" },
    create: { key: "master_provinces", value: provinces },
    update: { value: provinces },
  });

  await createAuditLog({
    userId: authUser.id,
    actionType: AuditActions.SETTINGS_UPDATE,
    resourceName: "Setting",
    resourceId: "master_provinces",
    afterData: { count: provinces.length },
  });

  return c.json({ success: true, message: "Provinsi berhasil diupdate" });
});

adminRoutes.get("/master-data/cities", async (c) => {
  const setting = await prisma.setting.findUnique({ where: { key: "master_cities" } });
  const cities = setting ? (setting.value as any) : [];
  return c.json({ success: true, data: cities });
});

adminRoutes.put("/master-data/cities", requireSuperAdmin(), async (c) => {
  const authUser = c.get("user");
  const body = await c.req.json();
  const { cities } = body as { cities: any };

  await prisma.setting.upsert({
    where: { key: "master_cities" },
    create: { key: "master_cities", value: cities },
    update: { value: cities },
  });

  await createAuditLog({
    userId: authUser.id,
    actionType: AuditActions.SETTINGS_UPDATE,
    resourceName: "Setting",
    resourceId: "master_cities",
    afterData: { count: Array.isArray(cities) ? cities.length : 0 },
  });

  return c.json({ success: true, message: "Kota berhasil diupdate" });
});

adminRoutes.get("/master-data/countries", async (c) => {
  const setting = await prisma.setting.findUnique({ where: { key: "master_countries" } });
  const countries = setting ? (setting.value as string[]) : [];
  return c.json({ success: true, data: countries });
});

adminRoutes.put("/master-data/countries", requireSuperAdmin(), async (c) => {
  const authUser = c.get("user");
  const body = await c.req.json();
  const { countries } = body as { countries: string[] };

  if (!Array.isArray(countries)) {
    return c.json({ success: false, message: "Data negara tidak valid" }, 400);
  }

  await prisma.setting.upsert({
    where: { key: "master_countries" },
    create: { key: "master_countries", value: countries },
    update: { value: countries },
  });

  await createAuditLog({
    userId: authUser.id,
    actionType: AuditActions.SETTINGS_UPDATE,
    resourceName: "Setting",
    resourceId: "master_countries",
    afterData: { count: countries.length },
  });

  return c.json({ success: true, message: "Negara berhasil diupdate" });
});

adminRoutes.get("/master-data/interests", async (c) => {
  const setting = await prisma.setting.findUnique({ where: { key: "master_interests" } });
  const interests = setting ? (setting.value as string[]) : [];
  return c.json({ success: true, data: interests });
});

adminRoutes.put("/master-data/interests", requireSuperAdmin(), async (c) => {
  const authUser = c.get("user");
  const body = await c.req.json();
  const { interests } = body as { interests: string[] };

  if (!Array.isArray(interests)) {
    return c.json({ success: false, message: "Data interest tidak valid" }, 400);
  }

  await prisma.setting.upsert({
    where: { key: "master_interests" },
    create: { key: "master_interests", value: interests },
    update: { value: interests },
  });

  await createAuditLog({
    userId: authUser.id,
    actionType: AuditActions.SETTINGS_UPDATE,
    resourceName: "Setting",
    resourceId: "master_interests",
    afterData: { count: interests.length },
  });

  return c.json({ success: true, message: "Interest berhasil diupdate" });
});

adminRoutes.get("/master-data/tags", async (c) => {
  const setting = await prisma.setting.findUnique({ where: { key: "master_tags" } });
  const tags = setting ? (setting.value as string[]) : [];
  return c.json({ success: true, data: tags });
});

adminRoutes.put("/master-data/tags", requireSuperAdmin(), async (c) => {
  const authUser = c.get("user");
  const body = await c.req.json();
  const { tags } = body as { tags: string[] };

  if (!Array.isArray(tags)) {
    return c.json({ success: false, message: "Data tag tidak valid" }, 400);
  }

  await prisma.setting.upsert({
    where: { key: "master_tags" },
    create: { key: "master_tags", value: tags },
    update: { value: tags },
  });

  await createAuditLog({
    userId: authUser.id,
    actionType: AuditActions.SETTINGS_UPDATE,
    resourceName: "Setting",
    resourceId: "master_tags",
    afterData: { count: tags.length },
  });

  return c.json({ success: true, message: "Tags berhasil diupdate" });
});

// ==========================================
// 10. AUDIT LOG
// ==========================================

adminRoutes.get("/audit-logs", requireSuperAdmin(), async (c) => {
  const { page, limit, search, skip } = pagination(c.req.url);
  const url = new URL(c.req.url);
  const actionType = url.searchParams.get("actionType") || "";
  const resourceName = url.searchParams.get("resourceName") || "";
  const userId = url.searchParams.get("userId") || "";
  const dateFrom = url.searchParams.get("dateFrom") || "";
  const dateTo = url.searchParams.get("dateTo") || "";

  const where: Record<string, any> = {};

  if (actionType) where.actionType = actionType;
  if (resourceName) where.resourceName = resourceName;
  if (userId) where.userId = userId;

  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) where.createdAt.gte = new Date(dateFrom);
    if (dateTo) where.createdAt.lte = new Date(dateTo);
  }

  if (search) {
    where.OR = [
      { actionType: { contains: search } },
      { resourceName: { contains: search } },
      { resourceId: { contains: search } },
    ];
  }

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.auditLog.count({ where }),
  ]);

  return c.json({
    success: true,
    data: logs.map((l) => ({
      id: l.id,
      user: l.user,
      actionType: l.actionType,
      resourceName: l.resourceName,
      resourceId: l.resourceId,
      beforeData: l.beforeData,
      afterData: l.afterData,
      ipAddress: l.ipAddress,
      createdAt: l.createdAt,
    })),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});

adminRoutes.get("/audit-logs/user/:userId", requireSuperAdmin(), async (c) => {
  const { page, limit, skip } = pagination(c.req.url);
  const userId = c.req.param("userId") as string;

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where: { userId },
      include: { user: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.auditLog.count({ where: { userId } }),
  ]);

  return c.json({
    success: true,
    data: logs.map((l) => ({
      id: l.id,
      user: l.user,
      actionType: l.actionType,
      resourceName: l.resourceName,
      resourceId: l.resourceId,
      beforeData: l.beforeData,
      afterData: l.afterData,
      ipAddress: l.ipAddress,
      createdAt: l.createdAt,
    })),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});

// ==========================================
// 11. NOTIFICATION MANAGEMENT
// ==========================================

adminRoutes.get("/notifications", async (c) => {
  const { page, limit, search, skip } = pagination(c.req.url);
  const url = new URL(c.req.url);
  const type = url.searchParams.get("type") || "";

  const where: Record<string, any> = {};
  if (type) where.type = type;
  if (search) {
    where.OR = [
      { title: { contains: search } },
      { message: { contains: search } },
    ];
  }

  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
      where,
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.notification.count({ where }),
  ]);

  return c.json({
    success: true,
    data: notifications.map((n) => ({
      id: n.id,
      title: n.title,
      message: n.message,
      type: n.type,
      isRead: n.isRead,
      link: n.link,
      user: n.user,
      createdAt: n.createdAt,
    })),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});

adminRoutes.post("/notifications/broadcast", requireSuperAdmin(), async (c) => {
  const authUser = c.get("user");
  const body = await c.req.json();
  const { title, message, type, targetRoles } = body as {
    title: string;
    message: string;
    type?: string;
    targetRoles?: string[];
  };

  if (!title || !message) {
    return c.json({ success: false, message: "Title dan message wajib diisi" }, 400);
  }

  const where: Record<string, any> = { deletedAt: null };
  if (targetRoles && targetRoles.length > 0) {
    where.roles = { some: { role: { in: targetRoles } } };
  }

  const users = await prisma.user.findMany({
    where,
    select: { id: true },
  });

  if (users.length === 0) {
    return c.json({ success: false, message: "Tidak ada target user" }, 400);
  }

  await prisma.notification.createMany({
    data: users.map((u) => ({
      userId: u.id,
      title,
      message,
      type: (type as any) || "SYSTEM",
    })),
  });

  await createAuditLog({
    userId: authUser.id,
    actionType: "NOTIFICATION_BROADCAST",
    resourceName: "Notification",
    resourceId: "broadcast",
    afterData: { title, targetCount: users.length, targetRoles: targetRoles || ["ALL"] },
  });

  return c.json({ success: true, message: `Notifikasi berhasil dikirim ke ${users.length} user` });
});

// Notification Templates
adminRoutes.get("/notification-templates", async (c) => {
  const templates = await prisma.notificationTemplate.findMany({
    orderBy: { createdAt: "desc" },
  });

  return c.json({
    success: true,
    data: templates.map((t) => ({
      id: t.id,
      name: t.name,
      title: t.title,
      message: t.message,
      type: t.type,
      isActive: t.isActive,
      createdAt: t.createdAt,
    })),
  });
});

adminRoutes.post("/notification-templates", requireSuperAdmin(), async (c) => {
  const authUser = c.get("user");
  const body = await c.req.json();
  const { name, title, message, type } = body as { name: string; title: string; message: string; type?: string };

  if (!name || !title || !message) {
    return c.json({ success: false, message: "Name, title, dan message wajib diisi" }, 400);
  }

  const template = await prisma.notificationTemplate.create({
    data: {
      name,
      title,
      message,
      type: (type as any) || "SYSTEM",
    },
  });

  await createAuditLog({
    userId: authUser.id,
    actionType: AuditActions.SETTINGS_UPDATE,
    resourceName: "NotificationTemplate",
    resourceId: template.id,
    afterData: { name, title, type: template.type },
  });

  return c.json({ success: true, data: template }, 201);
});

adminRoutes.put("/notification-templates/:templateId", requireSuperAdmin(), async (c) => {
  const authUser = c.get("user");
  const templateId = c.req.param("templateId") as string;
  const body = await c.req.json();
  const { name, title, message, type, isActive } = body;

  const template = await prisma.notificationTemplate.findUnique({ where: { id: templateId } });
  if (!template) {
    return c.json({ success: false, message: "Template tidak ditemukan" }, 404);
  }

  const updated = await prisma.notificationTemplate.update({
    where: { id: templateId },
    data: {
      ...(name && { name }),
      ...(title && { title }),
      ...(message && { message }),
      ...(type && { type }),
      ...(isActive !== undefined && { isActive }),
    },
  });

  await createAuditLog({
    userId: authUser.id,
    actionType: AuditActions.SETTINGS_UPDATE,
    resourceName: "NotificationTemplate",
    resourceId: templateId,
    afterData: { name: updated.name, isActive: updated.isActive },
  });

  return c.json({ success: true, data: updated });
});

adminRoutes.delete("/notification-templates/:templateId", requireSuperAdmin(), async (c) => {
  const templateId = c.req.param("templateId") as string;

  await prisma.notificationTemplate.delete({ where: { id: templateId } });

  return c.json({ success: true, message: "Template berhasil dihapus" });
});

// ==========================================
// 12. PLATFORM SETTINGS
// ==========================================

adminRoutes.get("/settings", async (c) => {
  const settings = await prisma.setting.findMany();
  const settingsMap: Record<string, any> = {};
  settings.forEach((s) => {
    settingsMap[s.key] = s.value;
  });

  return c.json({ success: true, data: settingsMap });
});

adminRoutes.get("/settings/:key", async (c) => {
  const key = c.req.param("key") as string;
  const setting = await prisma.setting.findUnique({ where: { key } });

  if (!setting) {
    return c.json({ success: false, message: "Setting tidak ditemukan" }, 404);
  }

  return c.json({ success: true, data: { key: setting.key, value: setting.value } });
});

adminRoutes.put("/settings/:key", requireSuperAdmin(), async (c) => {
  const authUser = c.get("user");
  const key = c.req.param("key") as string;
  const body = await c.req.json();
  const { value } = body;

  const existing = await prisma.setting.findUnique({ where: { key } });
  const before = existing ? { value: existing.value } : null;

  await prisma.setting.upsert({
    where: { key },
    create: { key, value },
    update: { value },
  });

  await createAuditLog({
    userId: authUser.id,
    actionType: AuditActions.SETTINGS_UPDATE,
    resourceName: "Setting",
    resourceId: key,
    beforeData: before,
    afterData: { value },
  });

  return c.json({ success: true, message: "Setting berhasil diupdate" });
});

// Platform configuration groups
adminRoutes.get("/settings/platform/general", async (c) => {
  const keys = ["platform_name", "platform_description", "platform_url", "support_email", "maintenance_mode"];
  const settings = await prisma.setting.findMany({ where: { key: { in: keys } } });
  const data: Record<string, any> = {};
  settings.forEach((s) => { data[s.key] = s.value; });
  return c.json({ success: true, data });
});

adminRoutes.put("/settings/platform/general", requireSuperAdmin(), async (c) => {
  const authUser = c.get("user");
  const body = await c.req.json();
  const entries = Object.entries(body);

  for (const [key, value] of entries) {
    await prisma.setting.upsert({
      where: { key },
      create: { key, value: value as any },
      update: { value: value as any },
    });
  }

  await createAuditLog({
    userId: authUser.id,
    actionType: AuditActions.SETTINGS_UPDATE,
    resourceName: "Setting",
    resourceId: "platform_general",
    afterData: Object.fromEntries(entries.map(([k, v]) => [k, typeof v === "object" ? "updated" : v])),
  });

  return c.json({ success: true, message: "Pengaturan berhasil diupdate" });
});
