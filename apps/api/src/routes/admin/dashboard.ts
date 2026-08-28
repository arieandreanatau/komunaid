import { Hono } from "hono";
import { prisma } from "@komunaid/database";
import { requireSuperAdmin } from "../../middleware/rbac";
import type { AuthUser } from "../../middleware/auth";
import { activeScope } from "../../lib/visibility-scope";

type Env = { Variables: { user: AuthUser; validated: any; userRoles: string[] } };
export const dashboardRoutes = new Hono<Env>();

dashboardRoutes.get("/dashboard", async (c) => {
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
    totalVolunteers,
  ] = await Promise.all([
    prisma.user.count({ where: activeScope("user") }),
    prisma.community.count({ where: activeScope("community") }),
    prisma.organization.count({ where: activeScope("organization") }),
    prisma.event.count({ where: activeScope("event") }),
    prisma.community.count({ where: { status: "PENDING", ...activeScope("community") } }),
    prisma.organization.count({ where: { status: "PENDING", ...activeScope("organization") } }),
    prisma.report.count({ where: { status: { in: ["OPEN", "UNDER_REVIEW"] } } }),
    prisma.user.count({ where: { status: "ACTIVE", ...activeScope("user") } }),
    prisma.user.count({ where: { status: "SUSPENDED", ...activeScope("user") } }),
    prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo }, ...activeScope("user") } }),
    prisma.community.count({ where: { createdAt: { gte: thirtyDaysAgo }, ...activeScope("community") } }),
    prisma.event.count({ where: { createdAt: { gte: thirtyDaysAgo }, ...activeScope("event") } }),
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
      where: { status: "PENDING", ...activeScope("community") },
      take: 5,
      orderBy: { submittedAt: "asc" },
      include: { owner: { select: { id: true, name: true, avatar: true } } },
    }),
    prisma.organization.findMany({
      where: { status: "PENDING", ...activeScope("organization") },
      take: 5,
      orderBy: { submittedAt: "asc" },
      include: { owner: { select: { id: true, name: true, avatar: true } } },
    }),
    prisma.volunteerProgramParticipation.count(),
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
        totalVolunteers,
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

dashboardRoutes.get("/dashboard/growth", requireSuperAdmin(), async (c) => {
  const now = new Date();
  const months = 12;
  const monthlyData: Array<{
    month: string;
    members: number;
    communities: number;
    events: number;
    volunteers: number;
  }> = [];

  for (let i = months - 1; i >= 0; i--) {
    const startOfMonth = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);

    const [members, communities, events, volunteers] = await Promise.all([
      prisma.user.count({
        where: { createdAt: { gte: startOfMonth, lte: endOfMonth }, ...activeScope("user") },
      }),
      prisma.community.count({
        where: { createdAt: { gte: startOfMonth, lte: endOfMonth }, ...activeScope("community") },
      }),
      prisma.event.count({
        where: { createdAt: { gte: startOfMonth, lte: endOfMonth }, ...activeScope("event") },
      }),
      prisma.volunteerApplication.count({
        where: { createdAt: { gte: startOfMonth, lte: endOfMonth } },
      }),
    ]);

    monthlyData.push({
      month: startOfMonth.toISOString().slice(0, 7),
      members,
      communities,
      events,
      volunteers,
    });
  }

  const totalVolunteers = await prisma.volunteerApplication.count({
    where: { status: "ACCEPTED" },
  });
  const activeVolunteers = await prisma.volunteerOpportunity.count({
    where: { status: { in: ["PUBLISHED", "OPEN"] }, ...activeScope("volunteerOpportunity") },
  });

  return c.json({
    success: true,
    data: {
      monthlyGrowth: monthlyData,
      totalVolunteers,
      activeVolunteers,
    },
  });
});
