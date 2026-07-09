import { Hono } from "hono";
import { prisma } from "@komunaid/database";
import { createOrganizationSchema, updateOrganizationSchema } from "@komunaid/shared";
import { authMiddleware, optionalAuthMiddleware } from "../middleware/auth";
import { requireOrganizationOwner } from "../middleware/rbac";
import { validate } from "../middleware/validate";
import { createAuditLog, AuditActions } from "../services/audit";
import type { AuthUser } from "../middleware/auth";

type Env = { Variables: { user: AuthUser; validated: any; userRoles: string[] } };

export const organizationRoutes = new Hono<Env>();

// ==========================================
// LIST ORGANIZATIONS (Public)
// ==========================================

organizationRoutes.get("/", optionalAuthMiddleware, async (c) => {
  const url = new URL(c.req.url);
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = parseInt(url.searchParams.get("limit") || "20");
  const search = url.searchParams.get("search") || "";

  const where: Record<string, unknown> = { deletedAt: null, status: "APPROVED" };

  if (search) {
    where.OR = [
      { name: { contains: search } },
      { description: { contains: search } },
    ];
  }

  const [organizations, total] = await Promise.all([
    prisma.organization.findMany({
      where,
      include: {
        owner: {
          select: { id: true, name: true, avatar: true },
        },
        _count: {
          select: { members: true, events: true },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.organization.count({ where }),
  ]);

  return c.json({
    success: true,
    organizations: organizations.map((o) => ({
      id: o.id,
      name: o.name,
      slug: o.slug,
      description: o.description,
      logo: o.logo,
      location: o.location,
      industry: o.industry,
      owner: o.owner,
      memberCount: o._count.members,
      eventCount: o._count.events,
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

// ==========================================
// GET ORGANIZATION BY SLUG (Public)
// ==========================================

organizationRoutes.get("/:slug", optionalAuthMiddleware, async (c) => {
  const slug = c.req.param("slug") as string;

  const organization = await prisma.organization.findUnique({
    where: { slug },
    include: {
      owner: {
        select: { id: true, name: true, avatar: true },
      },
      members: {
        include: {
          user: {
            select: { id: true, name: true, avatar: true },
          },
        },
        where: { status: "ACTIVE" },
        take: 20,
      },
      events: {
        where: { status: "APPROVED", eventDate: { gte: new Date() } },
        orderBy: { eventDate: "asc" },
        take: 5,
      },
      _count: {
        select: { members: true, events: true },
      },
    },
  });

  if (!organization || organization.deletedAt) {
    return c.json({ success: false, message: "Organization not found" }, 404);
  }

  return c.json({
    success: true,
    organization: {
      ...organization,
      members: undefined,
      memberCount: organization._count.members,
      eventCount: organization._count.events,
      membersPreview: organization.members.map((m) => ({
        id: m.user.id,
        name: m.user.name,
        avatar: m.user.avatar,
        role: m.role,
      })),
      upcomingEvents: organization.events,
    },
  });
});

// ==========================================
// CREATE ORGANIZATION
// ==========================================

organizationRoutes.post("/", authMiddleware, validate(createOrganizationSchema), async (c) => {
  const authUser = c.get("user");
  const data = c.get("validated");

  const slug = data.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  const existingSlug = await prisma.organization.findUnique({ where: { slug } });
  const finalSlug = existingSlug ? `${slug}-${Date.now()}` : slug;

  const organization = await prisma.organization.create({
    data: {
      ...data,
      slug: finalSlug,
      ownerId: authUser.id,
      members: {
        create: {
          userId: authUser.id,
          role: "OWNER",
          status: "ACTIVE",
        },
      },
    },
  });

  await createAuditLog({
    userId: authUser.id,
    actionType: AuditActions.ORG_CREATE,
    resourceName: "Organization",
    resourceId: organization.id,
    afterData: { name: organization.name, slug: organization.slug },
  });

  return c.json({
    success: true,
    message: "Organisasi berhasil dibuat. Menunggu approval admin.",
    organization: {
      id: organization.id,
      name: organization.name,
      slug: organization.slug,
      status: organization.status,
    },
  }, 201);
});

// ==========================================
// UPDATE ORGANIZATION (Owner)
// ==========================================

organizationRoutes.put("/:organizationId", authMiddleware, requireOrganizationOwner, validate(updateOrganizationSchema), async (c) => {
  const authUser = c.get("user");
  const organizationId = c.req.param("organizationId") as string;
  const data = c.get("validated");

  const before = await prisma.organization.findUnique({
    where: { id: organizationId },
  });

  const organization = await prisma.organization.update({
    where: { id: organizationId },
    data,
  });

  await createAuditLog({
    userId: authUser.id,
    actionType: AuditActions.ORG_UPDATE,
    resourceName: "Organization",
    resourceId: organizationId,
    beforeData: before ? { name: before.name, description: before.description } : null,
    afterData: { name: organization.name, description: organization.description },
  });

  return c.json({
    success: true,
    message: "Organisasi berhasil diupdate",
    organization: {
      id: organization.id,
      name: organization.name,
      slug: organization.slug,
    },
  });
});
