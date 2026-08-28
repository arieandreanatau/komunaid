import { Hono } from "hono";
import { prisma } from "@komunaid/database";
import { requireSuperAdmin } from "../../middleware/rbac";
import { createAuditLog, AuditActions } from "../../services/audit";
import type { AuthUser } from "../../middleware/auth";
import { activeScope } from "../../lib/visibility-scope";

type Env = { Variables: { user: AuthUser; validated: any; userRoles: string[] } };
export const volunteersRoutes = new Hono<Env>();

// VolunteerOpportunity is retained only for historical admin reads during the
// VolunteerProgram migration. Lifecycle/application mutations must use the
// canonical VolunteerProgram admin APIs (/volunteer-programs/admin/*).
volunteersRoutes.use("*", async (c, next) => {
  if (["GET", "HEAD", "OPTIONS"].includes(c.req.method)) return next();
  return c.json({
    success: false,
    code: "LEGACY_VOLUNTEER_DEPRECATED",
    message: "Lifecycle VolunteerOpportunity sudah read-only. Gunakan VolunteerProgram API untuk pengelolaan dan moderasi.",
  }, 410);
});

function pagination(url: string) {
  const u = new URL(url);
  const page = Math.max(1, parseInt(u.searchParams.get("page") || "1"));
  const limit = Math.min(100, Math.max(1, parseInt(u.searchParams.get("limit") || "20")));
  const search = u.searchParams.get("search") || "";
  const sortBy = u.searchParams.get("sortBy") || "createdAt";
  const sortOrder = u.searchParams.get("sortOrder") === "asc" ? "asc" : "desc";
  return { page, limit, search, sortBy, sortOrder, skip: (page - 1) * limit };
}

volunteersRoutes.get("/volunteers", async (c) => {
  const { page, limit, search, sortBy, sortOrder, skip } = pagination(c.req.url);
  const url = new URL(c.req.url);
  const status = url.searchParams.get("status") || "";

  const where: Record<string, any> = { ...activeScope("volunteerOpportunity") };

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

volunteersRoutes.get("/volunteers/:opportunityId", async (c) => {
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

volunteersRoutes.get("/volunteers/:opportunityId/applications", async (c) => {
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

volunteersRoutes.put("/volunteers/:opportunityId/soft-delete", requireSuperAdmin(), async (c) => {
  const authUser = c.get("user");
  const opportunityId = c.req.param("opportunityId") as string;

  const opportunity = await prisma.volunteerOpportunity.findUnique({ where: { id: opportunityId } });
  if (!opportunity) {
    return c.json({ success: false, message: "Volunteer opportunity tidak ditemukan" }, 404);
  }

  if (opportunity.deletedAt) {
    return c.json({ success: false, message: "Volunteer opportunity sudah dihapus" }, 400);
  }

  const before = { status: opportunity.status, deletedAt: opportunity.deletedAt };

  await prisma.volunteerOpportunity.update({
    where: { id: opportunityId },
    data: { deletedAt: new Date() },
  });

  await createAuditLog({
    userId: authUser.id,
    actionType: AuditActions.VOLUNTEER_OPPORTUNITY_DELETE,
    resourceName: "VolunteerOpportunity",
    resourceId: opportunityId,
    beforeData: before,
    afterData: { deletedAt: new Date().toISOString() },
  });

  return c.json({ success: true, message: "Volunteer opportunity berhasil dihapus" });
});

volunteersRoutes.put("/volunteers/:opportunityId/restore", requireSuperAdmin(), async (c) => {
  return c.json({
    success: false,
    code: "LEGACY_VOLUNTEER_DEPRECATED",
    message: "Lifecycle VolunteerOpportunity sudah read-only. Gunakan VolunteerProgram API.",
  }, 410);
});
