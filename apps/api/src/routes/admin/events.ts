import { Hono } from "hono";
import { prisma } from "@komunaid/database";
import { requireSuperAdmin } from "../../middleware/rbac";
import { createAuditLog, AuditActions } from "../../services/audit";
import { transitionEvent, EventTransitionError } from "../../services/event-transition";
import type { AuthUser } from "../../middleware/auth";

type Env = { Variables: { user: AuthUser; validated: any; userRoles: string[] } };
export const eventsRoutes = new Hono<Env>();

function pagination(url: string) {
  const u = new URL(url);
  const page = Math.max(1, parseInt(u.searchParams.get("page") || "1"));
  const limit = Math.min(100, Math.max(1, parseInt(u.searchParams.get("limit") || "20")));
  const search = u.searchParams.get("search") || "";
  const sortBy = u.searchParams.get("sortBy") || "createdAt";
  const sortOrder = u.searchParams.get("sortOrder") === "asc" ? "asc" : "desc";
  return { page, limit, search, sortBy, sortOrder, skip: (page - 1) * limit };
}

eventsRoutes.get("/events", async (c) => {
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

eventsRoutes.get("/events/:eventId", async (c) => {
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

eventsRoutes.put("/events/:eventId/suspend", requireSuperAdmin(), async (c) => {
  const authUser = c.get("user");
  const eventId = c.req.param("eventId") as string;

  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) {
    return c.json({ success: false, message: "Event tidak ditemukan" }, 404);
  }

  const updated = await transitionEvent({ eventId, expectedStatus: event.status, targetStatus: "CANCELLED", actorId: authUser.id, actorRole: "SUPER_ADMIN", reason: "Ditangguhkan oleh moderation" }).catch((error) => error instanceof EventTransitionError ? null : Promise.reject(error));
  if (!updated) return c.json({ success: false, message: "Event tidak dapat ditangguhkan dari status saat ini" }, 409);

  return c.json({ success: true, message: "Event berhasil ditangguhkan" });
});

eventsRoutes.put("/events/:eventId/restore", requireSuperAdmin(), async (c) => {
  return c.json({ success: false, code: "EVENT_CANCELLATION_TERMINAL", message: "Event yang dibatalkan tidak dapat dipulihkan. Buat Event baru bila diperlukan." }, 409);
});

eventsRoutes.put("/events/:eventId/archive", requireSuperAdmin(), async (c) => {
  const authUser = c.get("user");
  const eventId = c.req.param("eventId") as string;

  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) {
    return c.json({ success: false, message: "Event tidak ditemukan" }, 404);
  }

  const updated = await transitionEvent({ eventId, expectedStatus: event.status, targetStatus: "ARCHIVED", actorId: authUser.id, actorRole: "SUPER_ADMIN", reason: "Diarsipkan oleh administrator" }).catch((error) => error instanceof EventTransitionError ? null : Promise.reject(error));
  if (!updated) return c.json({ success: false, message: "Event hanya dapat diarsipkan setelah selesai" }, 409);

  return c.json({ success: true, message: "Event berhasil diarsipkan" });
});

eventsRoutes.put("/events/:eventId/publish", requireSuperAdmin(), async (c) => {
  const authUser = c.get("user");
  const eventId = c.req.param("eventId") as string;

  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) {
    return c.json({ success: false, message: "Event tidak ditemukan" }, 404);
  }

  const updated = await transitionEvent({ eventId, expectedStatus: event.status, targetStatus: "PUBLISHED", actorId: authUser.id, actorRole: "SUPER_ADMIN", reason: "Dipublikasikan oleh administrator" }).catch((error) => error instanceof EventTransitionError ? null : Promise.reject(error));
  if (!updated) return c.json({ success: false, message: "Event harus disetujui sebelum dipublikasikan" }, 409);

  return c.json({ success: true, message: "Event berhasil dipublish" });
});

eventsRoutes.put("/events/:eventId/cancel", requireSuperAdmin(), async (c) => {
  const authUser = c.get("user");
  const eventId = c.req.param("eventId") as string;

  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) {
    return c.json({ success: false, message: "Event tidak ditemukan" }, 404);
  }

  const updated = await transitionEvent({ eventId, expectedStatus: event.status, targetStatus: "CANCELLED", actorId: authUser.id, actorRole: "SUPER_ADMIN", reason: "Dibatalkan oleh administrator" }).catch((error) => error instanceof EventTransitionError ? null : Promise.reject(error));
  if (!updated) return c.json({ success: false, message: "Event tidak dapat dibatalkan dari status saat ini" }, 409);

  return c.json({ success: true, message: "Event berhasil dibatalkan" });
});

eventsRoutes.get("/events/:eventId/registrations", async (c) => {
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

eventsRoutes.put("/events/:eventId/soft-delete", requireSuperAdmin(), async (c) => {
  const authUser = c.get("user");
  const eventId = c.req.param("eventId") as string;

  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) {
    return c.json({ success: false, message: "Event tidak ditemukan" }, 404);
  }

  if (event.deletedAt) {
    return c.json({ success: false, message: "Event sudah dihapus" }, 400);
  }

  const before = { status: event.status, deletedAt: event.deletedAt };

  await prisma.event.update({
    where: { id: eventId },
    data: { deletedAt: new Date() },
  });

  await createAuditLog({
    userId: authUser.id,
    actionType: AuditActions.EVENT_DELETE,
    resourceName: "Event",
    resourceId: eventId,
    beforeData: before,
    afterData: { deletedAt: new Date().toISOString() },
  });

  return c.json({ success: true, message: "Event berhasil dihapus" });
});
