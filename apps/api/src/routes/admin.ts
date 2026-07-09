import { Hono } from "hono";
import { prisma } from "@komunaid/database";
import { authMiddleware } from "../middleware/auth";
import { requirePlatformAdmin, requireSuperAdmin } from "../middleware/rbac";
import { createAuditLog, AuditActions } from "../services/audit";
import type { AuthUser } from "../middleware/auth";

type Env = { Variables: { user: AuthUser; validated: any; userRoles: string[] } };

export const adminRoutes = new Hono<Env>();

// All admin routes require Platform Admin or Super Admin
adminRoutes.use("*", authMiddleware);
adminRoutes.use("*", requirePlatformAdmin());

// ==========================================
// DASHBOARD STATS
// ==========================================

adminRoutes.get("/stats", async (c) => {
  const [
    totalUsers,
    totalCommunities,
    totalOrganizations,
    totalEvents,
    pendingCommunities,
    pendingOrganizations,
    pendingReports,
    activeUsers,
  ] = await Promise.all([
    prisma.user.count({ where: { deletedAt: null } }),
    prisma.community.count({ where: { deletedAt: null } }),
    prisma.organization.count({ where: { deletedAt: null } }),
    prisma.event.count({ where: { deletedAt: null } }),
    prisma.community.count({ where: { status: "PENDING", deletedAt: null } }),
    prisma.organization.count({ where: { status: "PENDING", deletedAt: null } }),
    prisma.report.count({ where: { status: { in: ["OPEN", "UNDER_REVIEW"] } } }),
    prisma.user.count({ where: { status: "ACTIVE", deletedAt: null } }),
  ]);

  return c.json({
    stats: {
      totalUsers,
      totalCommunities,
      totalOrganizations,
      totalEvents,
      pendingCommunities,
      pendingOrganizations,
      pendingReports,
      activeUsers,
    },
  });
});

// ==========================================
// USER MANAGEMENT
// ==========================================

adminRoutes.get("/users", async (c) => {
  const url = new URL(c.req.url);
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = parseInt(url.searchParams.get("limit") || "20");
  const search = url.searchParams.get("search") || "";
  const status = url.searchParams.get("status") || "";

  const where: Record<string, unknown> = { deletedAt: null };

  if (search) {
    where.OR = [
      { name: { contains: search } },
      { email: { contains: search } },
    ];
  }

  if (status) {
    where.status = status;
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      include: {
        roles: true,
        _count: {
          select: {
            joinedCommunities: true,
            registeredEvents: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  return c.json({
    users: users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      status: u.status,
      roles: u.roles.map((r) => r.role),
      communityCount: u._count.joinedCommunities,
      eventCount: u._count.registeredEvents,
      createdAt: u.createdAt,
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

// ==========================================
// SUSPEND USER
// ==========================================

adminRoutes.put("/users/:userId/suspend", async (c) => {
  const authUser = c.get("user");
  const userId = c.req.param("userId");

  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    return c.json({ error: "User not found" }, 404);
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

  return c.json({ message: "User berhasil ditangguhkan" });
});

// ==========================================
// ACTIVATE USER
// ==========================================

adminRoutes.put("/users/:userId/activate", async (c) => {
  const authUser = c.get("user");
  const userId = c.req.param("userId");

  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    return c.json({ error: "User not found" }, 404);
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

  return c.json({ message: "User berhasil diaktifkan" });
});

// ==========================================
// COMMUNITY APPROVAL
// ==========================================

adminRoutes.get("/communities/pending", async (c) => {
  const url = new URL(c.req.url);
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = parseInt(url.searchParams.get("limit") || "20");

  const [communities, total] = await Promise.all([
    prisma.community.findMany({
      where: { status: "PENDING", deletedAt: null },
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
        _count: {
          select: { members: true },
        },
      },
      orderBy: { createdAt: "asc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.community.count({ where: { status: "PENDING", deletedAt: null } }),
  ]);

  return c.json({
    communities: communities.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description,
      owner: c.owner,
      memberCount: c._count.members,
      createdAt: c.createdAt,
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

adminRoutes.put("/communities/:communityId/approve", async (c) => {
  const authUser = c.get("user");
  const communityId = c.req.param("communityId");

  const community = await prisma.community.findUnique({ where: { id: communityId } });

  if (!community) {
    return c.json({ error: "Community not found" }, 404);
  }

  const before = { status: community.status };

  await prisma.community.update({
    where: { id: communityId },
    data: { status: "APPROVED" },
  });

  await createAuditLog({
    userId: authUser.id,
    actionType: AuditActions.COMMUNITY_APPROVE,
    resourceName: "Community",
    resourceId: communityId,
    beforeData: before,
    afterData: { status: "APPROVED" },
  });

  return c.json({ message: "Komunitas berhasil disetujui" });
});

adminRoutes.put("/communities/:communityId/suspend", async (c) => {
  const authUser = c.get("user");
  const communityId = c.req.param("communityId");

  const community = await prisma.community.findUnique({ where: { id: communityId } });

  if (!community) {
    return c.json({ error: "Community not found" }, 404);
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

  return c.json({ message: "Komunitas berhasil ditangguhkan" });
});

// ==========================================
// ORGANIZATION APPROVAL
// ==========================================

adminRoutes.get("/organizations/pending", async (c) => {
  const url = new URL(c.req.url);
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = parseInt(url.searchParams.get("limit") || "20");

  const [organizations, total] = await Promise.all([
    prisma.organization.findMany({
      where: { status: "PENDING", deletedAt: null },
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: "asc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.organization.count({ where: { status: "PENDING", deletedAt: null } }),
  ]);

  return c.json({
    organizations: organizations.map((o) => ({
      id: o.id,
      name: o.name,
      slug: o.slug,
      description: o.description,
      owner: o.owner,
      createdAt: o.createdAt,
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

adminRoutes.put("/organizations/:organizationId/approve", async (c) => {
  const authUser = c.get("user");
  const organizationId = c.req.param("organizationId");

  const organization = await prisma.organization.findUnique({ where: { id: organizationId } });

  if (!organization) {
    return c.json({ error: "Organization not found" }, 404);
  }

  const before = { status: organization.status };

  await prisma.organization.update({
    where: { id: organizationId },
    data: { status: "APPROVED" },
  });

  await createAuditLog({
    userId: authUser.id,
    actionType: AuditActions.ORG_APPROVE,
    resourceName: "Organization",
    resourceId: organizationId,
    beforeData: before,
    afterData: { status: "APPROVED" },
  });

  return c.json({ message: "Organisasi berhasil disetujui" });
});

adminRoutes.put("/organizations/:organizationId/suspend", async (c) => {
  const authUser = c.get("user");
  const organizationId = c.req.param("organizationId");

  const organization = await prisma.organization.findUnique({ where: { id: organizationId } });

  if (!organization) {
    return c.json({ error: "Organization not found" }, 404);
  }

  const before = { status: organization.status };

  await prisma.organization.update({
    where: { id: organizationId },
    data: { status: "SUSPENDED" },
  });

  await createAuditLog({
    userId: authUser.id,
    actionType: AuditActions.ORG_SUSPEND,
    resourceName: "Organization",
    resourceId: organizationId,
    beforeData: before,
    afterData: { status: "SUSPENDED" },
  });

  return c.json({ message: "Organisasi berhasil ditangguhkan" });
});

// ==========================================
// REPORT MANAGEMENT
// ==========================================

adminRoutes.get("/reports", async (c) => {
  const url = new URL(c.req.url);
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = parseInt(url.searchParams.get("limit") || "20");
  const status = url.searchParams.get("status") || "";

  const where: Record<string, unknown> = {};

  if (status) {
    where.status = status;
  }

  const [reports, total] = await Promise.all([
    prisma.report.findMany({
      where,
      include: {
        reporter: {
          select: { id: true, name: true, email: true },
        },
        reviewer: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.report.count({ where }),
  ]);

  return c.json({
    reports: reports.map((r) => ({
      id: r.id,
      targetType: r.targetType,
      targetId: r.targetId,
      reason: r.reason,
      description: r.description,
      status: r.status,
      reporter: r.reporter,
      reviewer: r.reviewer,
      createdAt: r.createdAt,
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

adminRoutes.put("/reports/:reportId/resolve", async (c) => {
  const authUser = c.get("user");
  const reportId = c.req.param("reportId");
  const body = await c.req.json();

  const { action, note } = body as { action: "DISMISSED" | "SUSPENDED"; note?: string };

  const report = await prisma.report.findUnique({ where: { id: reportId } });

  if (!report) {
    return c.json({ error: "Report not found" }, 404);
  }

  const before = { status: report.status };

  await prisma.report.update({
    where: { id: reportId },
    data: {
      status: action,
      reviewedBy: authUser.id,
      reviewedAt: new Date(),
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

  return c.json({ message: `Laporan berhasil ${action === "SUSPENDED" ? "ditindaklanjuti" : "ditolak"}` });
});

// ==========================================
// ROLE MANAGEMENT
// ==========================================

adminRoutes.put("/users/:userId/role", requireSuperAdmin(), async (c) => {
  const authUser = c.get("user");
  const userId = c.req.param("userId");
  const body = await c.req.json();

  const { role } = body as { role: "SUPER_ADMIN" | "PLATFORM_ADMIN" | "MEMBER" };

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { roles: true },
  });

  if (!user) {
    return c.json({ error: "User not found" }, 404);
  }

  const before = user.roles.map((r) => r.role);

  await prisma.userRole.deleteMany({ where: { userId } });

  await prisma.userRole.create({
    data: { userId, role },
  });

  await createAuditLog({
    userId: authUser.id,
    actionType: AuditActions.ROLE_CHANGE,
    resourceName: "User",
    resourceId: userId,
    beforeData: { roles: before },
    afterData: { roles: [role] },
  });

  return c.json({ message: "Role berhasil diubah" });
});

// ==========================================
// AUDIT LOG
// ==========================================

adminRoutes.get("/audit-logs", requireSuperAdmin(), async (c) => {
  const url = new URL(c.req.url);
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = parseInt(url.searchParams.get("limit") || "20");
  const actionType = url.searchParams.get("actionType") || "";
  const resourceName = url.searchParams.get("resourceName") || "";

  const where: Record<string, unknown> = {};

  if (actionType) {
    where.actionType = actionType;
  }

  if (resourceName) {
    where.resourceName = resourceName;
  }

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.auditLog.count({ where }),
  ]);

  return c.json({
    logs: logs.map((l) => ({
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
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});
