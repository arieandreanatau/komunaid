import { Hono } from "hono";
import { prisma } from "@komunaid/database";
import { createEventSchema, updateEventSchema } from "@komunaid/shared";
import { authMiddleware, optionalAuthMiddleware } from "../middleware/auth";
import { requireCommunityAdmin, requireOrganizationOwner } from "../middleware/rbac";
import { validate } from "../middleware/validate";
import { createAuditLog, AuditActions } from "../services/audit";
import type { AuthUser } from "../middleware/auth";

type Env = { Variables: { user: AuthUser; validated: any; userRoles: string[] } };

export const eventRoutes = new Hono<Env>();

// ==========================================
// LIST EVENTS (Public)
// ==========================================

eventRoutes.get("/", optionalAuthMiddleware, async (c) => {
  const url = new URL(c.req.url);
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = parseInt(url.searchParams.get("limit") || "20");
  const search = url.searchParams.get("search") || "";
  const communityId = url.searchParams.get("communityId") || "";
  const organizationId = url.searchParams.get("organizationId") || "";
  const upcoming = url.searchParams.get("upcoming") === "true";

  const where: Record<string, unknown> = {
    deletedAt: null,
    status: "APPROVED",
  };

  if (search) {
    where.OR = [
      { title: { contains: search } },
      { description: { contains: search } },
    ];
  }

  if (communityId) {
    where.communityId = communityId;
  }

  if (organizationId) {
    where.organizationId = organizationId;
  }

  if (upcoming) {
    where.eventDate = { gte: new Date() };
  }

  const [events, total] = await Promise.all([
    prisma.event.findMany({
      where,
      include: {
        community: {
          select: { id: true, name: true, slug: true, logo: true },
        },
        organization: {
          select: { id: true, name: true, slug: true, logo: true },
        },
        createdBy: {
          select: { id: true, name: true, avatar: true },
        },
        _count: {
          select: { registrations: true },
        },
      },
      orderBy: { eventDate: "asc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.event.count({ where }),
  ]);

  return c.json({
    events: events.map((e) => ({
      id: e.id,
      title: e.title,
      slug: e.slug,
      description: e.description,
      coverImage: e.coverImage,
      location: e.location,
      isOnline: e.isOnline,
      eventDate: e.eventDate,
      endDate: e.endDate,
      quota: e.quota,
      registeredCount: e._count.registrations,
      community: e.community,
      organization: e.organization,
      createdBy: e.createdBy,
      createdAt: e.createdAt,
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
// GET EVENT BY SLUG (Public)
// ==========================================

eventRoutes.get("/:slug", optionalAuthMiddleware, async (c) => {
  const slug = c.req.param("slug");

  const event = await prisma.event.findUnique({
    where: { slug },
    include: {
      community: {
        select: { id: true, name: true, slug: true, logo: true },
      },
      organization: {
        select: { id: true, name: true, slug: true, logo: true },
      },
      createdBy: {
        select: { id: true, name: true, avatar: true },
      },
      registrations: {
        include: {
          user: {
            select: { id: true, name: true, avatar: true },
          },
        },
        take: 20,
      },
      categories: {
        include: { category: true },
      },
      _count: {
        select: { registrations: true },
      },
    },
  });

  if (!event || event.deletedAt) {
    return c.json({ error: "Event not found" }, 404);
  }

  return c.json({
    event: {
      ...event,
      registrations: undefined,
      registeredCount: event._count.registrations,
      registeredUsers: event.registrations.map((r) => ({
        id: r.user.id,
        name: r.user.name,
        avatar: r.user.avatar,
        status: r.status,
        registeredAt: r.registeredAt,
      })),
      categories: event.categories.map((c) => c.category),
    },
  });
});

// ==========================================
// CREATE EVENT (Community Admin / Org Owner)
// ==========================================

eventRoutes.post("/", authMiddleware, validate(createEventSchema), async (c) => {
  const authUser = c.get("user");
  const data = c.get("validated");

  if (data.communityId) {
    const membership = await prisma.communityMember.findUnique({
      where: {
        communityId_userId: {
          communityId: data.communityId,
          userId: authUser.id,
        },
      },
    });

    if (!membership || !["OWNER", "ADMIN", "EVENT_MANAGER"].includes(membership.role)) {
      return c.json({ error: "Tidak memiliki akses membuat event di komunitas ini" }, 403);
    }
  }

  if (data.organizationId) {
    const membership = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId: data.organizationId,
          userId: authUser.id,
        },
      },
    });

    if (!membership || !["OWNER", "ADMIN"].includes(membership.role)) {
      return c.json({ error: "Tidak memiliki akses membuat event di organisasi ini" }, 403);
    }
  }

  const slug = data.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  const existingSlug = await prisma.event.findUnique({ where: { slug } });
  const finalSlug = existingSlug ? `${slug}-${Date.now()}` : slug;

  const { categoryIds, ...eventData } = data;

  const event = await prisma.event.create({
    data: {
      ...eventData,
      slug: finalSlug,
      createdById: authUser.id,
      eventDate: new Date(data.eventDate),
      endDate: data.endDate ? new Date(data.endDate) : null,
      categories: categoryIds
        ? {
            create: categoryIds.map((categoryId) => ({ categoryId })),
          }
        : undefined,
    },
  });

  await createAuditLog({
    userId: authUser.id,
    actionType: AuditActions.EVENT_CREATE,
    resourceName: "Event",
    resourceId: event.id,
    afterData: { title: event.title, slug: event.slug },
  });

  return c.json({
    message: "Event berhasil dibuat",
    event: {
      id: event.id,
      title: event.title,
      slug: event.slug,
      status: event.status,
    },
  }, 201);
});

// ==========================================
// REGISTER FOR EVENT
// ==========================================

eventRoutes.post("/:eventId/register", authMiddleware, async (c) => {
  const authUser = c.get("user");
  const eventId = c.req.param("eventId");

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      _count: { select: { registrations: true } },
    },
  });

  if (!event || event.deletedAt) {
    return c.json({ error: "Event tidak ditemukan" }, 404);
  }

  if (event.status !== "APPROVED") {
    return c.json({ error: "Event belum disetujui" }, 400);
  }

  if (new Date(event.eventDate) < new Date()) {
    return c.json({ error: "Event sudah lewat" }, 400);
  }

  if (event._count.registrations >= event.quota) {
    return c.json({ error: "Kuota event penuh" }, 400);
  }

  const existing = await prisma.eventRegistration.findUnique({
    where: {
      eventId_userId: {
        eventId,
        userId: authUser.id,
      },
    },
  });

  if (existing) {
    return c.json({ error: "Sudah terdaftar di event ini" }, 409);
  }

  await prisma.eventRegistration.create({
    data: {
      eventId,
      userId: authUser.id,
      status: "CONFIRMED",
    },
  });

  await createAuditLog({
    userId: authUser.id,
    actionType: AuditActions.EVENT_REGISTER,
    resourceName: "Event",
    resourceId: eventId,
  });

  return c.json({ message: "Berhasil mendaftar event" });
});

// ==========================================
// UNREGISTER FROM EVENT
// ==========================================

eventRoutes.delete("/:eventId/register", authMiddleware, async (c) => {
  const authUser = c.get("user");
  const eventId = c.req.param("eventId");

  const registration = await prisma.eventRegistration.findUnique({
    where: {
      eventId_userId: {
        eventId,
        userId: authUser.id,
      },
    },
  });

  if (!registration) {
    return c.json({ error: "Tidak terdaftar di event ini" }, 404);
  }

  await prisma.eventRegistration.update({
    where: {
      eventId_userId: {
        eventId,
        userId: authUser.id,
      },
    },
    data: { status: "CANCELLED" },
  });

  await createAuditLog({
    userId: authUser.id,
    actionType: AuditActions.EVENT_UNREGISTER,
    resourceName: "Event",
    resourceId: eventId,
  });

  return c.json({ message: "Berhasil membatalkan pendaftaran" });
});
