import { Hono } from "hono";
import { prisma } from "@komunaid/database";
import { createEventSchema, updateEventSchema, eventQuerySchema } from "@komunaid/shared";
import { authMiddleware, optionalAuthMiddleware } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { createAuditLog, AuditActions } from "../services/audit";
import type { AuthUser } from "../middleware/auth";

type Env = { Variables: { user: AuthUser; validated: any; userRoles: string[] } };

export const eventRoutes = new Hono<Env>();

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function getEventOrganizerRole(userId: string, event: any): Promise<string | null> {
  if (event.communityId) {
    const membership = await prisma.communityMember.findUnique({
      where: { communityId_userId: { communityId: event.communityId, userId } },
    });
    return membership?.role || null;
  }
  if (event.organizationId) {
    const membership = await prisma.organizationMember.findUnique({
      where: { organizationId_userId: { organizationId: event.organizationId, userId } },
    });
    return membership?.role || null;
  }
  return null;
}

function canManageEvent(role: string | null, userId: string, event: any): boolean {
  if (!role) return false;
  if (event.createdById === userId) return true;
  if (["OWNER", "ADMIN", "EVENT_MANAGER"].includes(role)) return true;
  return false;
}

const VALID_TRANSITIONS: Record<string, string[]> = {
  DRAFT: ["PUBLISHED", "CANCELLED"],
  PUBLISHED: ["REGISTRATION_OPEN", "CANCELLED", "ARCHIVED"],
  REGISTRATION_OPEN: ["REGISTRATION_CLOSED", "CANCELLED"],
  REGISTRATION_CLOSED: ["ONGOING", "CANCELLED"],
  ONGOING: ["COMPLETED", "CANCELLED"],
  COMPLETED: ["ARCHIVED"],
  CANCELLED: [],
  ARCHIVED: [],
};

function isValidTransition(from: string, to: string): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

// ==========================================
// 1. LIST EVENTS (Public)
// ==========================================

eventRoutes.get("/", optionalAuthMiddleware, validate(eventQuerySchema, "query"), async (c) => {
  const user = c.get("user");
  const q = c.get("validated");
  const page = q.page as number;
  const limit = q.limit as number;

  const where: any = { deletedAt: null };

  if (user) {
    where.status = q.status || { notIn: ["DRAFT", "CANCELLED", "ARCHIVED"] };
  } else {
    where.status = { notIn: ["DRAFT", "CANCELLED", "ARCHIVED"] };
    where.visibility = "PUBLIC";
  }

  if (q.search) {
    where.OR = [
      { title: { contains: q.search } },
      { description: { contains: q.search } },
    ];
  }

  if (q.communityId) where.communityId = q.communityId;
  if (q.organizationId) where.organizationId = q.organizationId;
  if (q.status && user) where.status = q.status;

  if (q.upcoming) {
    where.eventDate = { gte: new Date() };
  }

  const orderBy: any =
    q.orderBy === "eventDate"
      ? { eventDate: q.sort as "asc" | "desc" }
      : { [q.orderBy]: q.sort };

  const [events, total] = await Promise.all([
    prisma.event.findMany({
      where,
      include: {
        community: { select: { id: true, name: true, slug: true, logo: true } },
        organization: { select: { id: true, name: true, slug: true, logo: true } },
        createdBy: { select: { id: true, name: true, avatar: true } },
        categories: { include: { category: true } },
        _count: { select: { registrations: { where: { status: "CONFIRMED" } } } },
      },
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.event.count({ where }),
  ]);

  return c.json({
    success: true,
    data: events.map((e) => ({
      id: e.id,
      title: e.title,
      slug: e.slug,
      description: e.description,
      coverImage: e.coverImage,
      thumbnail: e.thumbnail,
      location: e.location,
      locationType: e.locationType,
      isOnline: e.isOnline,
      eventDate: e.eventDate,
      endDate: e.endDate,
      quota: e.quota,
      allowWaitlist: e.allowWaitlist,
      status: e.status,
      visibility: e.visibility,
      registeredCount: e._count.registrations,
      community: e.community,
      organization: e.organization,
      createdBy: e.createdBy,
      categories: e.categories.map((c) => c.category),
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
// 2. GET EVENT BY SLUG (Public)
// ==========================================

eventRoutes.get("/:slug", optionalAuthMiddleware, async (c) => {
  const slug = c.req.param("slug") as string;
  const user = c.get("user");

  const event = await prisma.event.findUnique({
    where: { slug },
    include: {
      community: { select: { id: true, name: true, slug: true, logo: true } },
      organization: { select: { id: true, name: true, slug: true, logo: true } },
      createdBy: { select: { id: true, name: true, avatar: true } },
      registrations: {
        where: { status: { in: ["CONFIRMED", "PENDING", "WAITLISTED"] } },
        include: { user: { select: { id: true, name: true, avatar: true } } },
        take: 50,
      },
      categories: { include: { category: true } },
      _count: { select: { registrations: { where: { status: "CONFIRMED" } } } },
    },
  });

  if (!event || event.deletedAt) {
    return c.json({ success: false, message: "Event tidak ditemukan" }, 404);
  }

  if (event.visibility === "PRIVATE" && (!user || (user.id !== event.createdById))) {
    const role = user ? await getEventOrganizerRole(user.id, event) : null;
    if (!role || !canManageEvent(role, user!.id, event)) {
      return c.json({ success: false, message: "Event ini privat" }, 403);
    }
  }

  let userRegistration = null;
  if (user) {
    userRegistration = await prisma.eventRegistration.findUnique({
      where: { eventId_userId: { eventId: event.id, userId: user.id } },
    });
  }

  const galleryParsed = event.gallery ? JSON.parse(event.gallery as string) : [];

  return c.json({
    success: true,
    data: {
      ...event,
      registrations: undefined,
      gallery: galleryParsed,
      registeredCount: event._count.registrations,
      registeredUsers: event.registrations.map((r) => ({
        id: r.user.id,
        name: r.user.name,
        avatar: r.user.avatar,
        status: r.status,
        attendance: r.attendance,
        registeredAt: r.registeredAt,
      })),
      categories: event.categories.map((c) => c.category),
      userRegistration: userRegistration
        ? {
            id: userRegistration.id,
            status: userRegistration.status,
            attendance: userRegistration.attendance,
            registeredAt: userRegistration.registeredAt,
          }
        : null,
    },
  });
});

// ==========================================
// 3. CREATE EVENT (Community/Org Manager)
// ==========================================

eventRoutes.post("/", authMiddleware, validate(createEventSchema), async (c) => {
  const authUser = c.get("user");
  const data = c.get("validated");

  if (!data.communityId && !data.organizationId) {
    return c.json({ success: false, message: "Event harus dimiliki oleh Community atau Organization" }, 400);
  }

  if (data.communityId && data.organizationId) {
    return c.json({ success: false, message: "Event hanya boleh dimiliki oleh satu penyelenggara" }, 400);
  }

  if (data.communityId) {
    const membership = await prisma.communityMember.findUnique({
      where: { communityId_userId: { communityId: data.communityId, userId: authUser.id } },
    });
    if (!membership || !["OWNER", "ADMIN", "EVENT_MANAGER"].includes(membership.role)) {
      return c.json({ success: false, message: "Tidak memiliki akses membuat event di komunitas ini" }, 403);
    }
  }

  if (data.organizationId) {
    const membership = await prisma.organizationMember.findUnique({
      where: { organizationId_userId: { organizationId: data.organizationId, userId: authUser.id } },
    });
    if (!membership || !["OWNER", "ADMIN"].includes(membership.role)) {
      return c.json({ success: false, message: "Tidak memiliki akses membuat event di organisasi ini" }, 403);
    }
  }

  let slug = slugify(data.title);
  const existingSlug = await prisma.event.findUnique({ where: { slug } });
  if (existingSlug) slug = `${slug}-${Date.now()}`;

  const { categoryIds, gallery, ...eventData } = data;

  const event = await prisma.event.create({
    data: {
      ...eventData,
      slug,
      createdById: authUser.id,
      eventDate: new Date(data.eventDate),
      endDate: data.endDate ? new Date(data.endDate) : null,
      gallery: gallery ? JSON.stringify(gallery) : null,
      categories: categoryIds
        ? { create: categoryIds.map((categoryId: string) => ({ categoryId })) }
        : undefined,
    },
    include: {
      community: { select: { id: true, name: true, slug: true } },
      organization: { select: { id: true, name: true, slug: true } },
      categories: { include: { category: true } },
    },
  });

  await createAuditLog({
    userId: authUser.id,
    actionType: AuditActions.EVENT_CREATE,
    resourceName: "Event",
    resourceId: event.id,
    afterData: { title: event.title, slug: event.slug, status: event.status },
  });

  return c.json({
    success: true,
    message: "Event berhasil dibuat",
    data: {
      id: event.id,
      title: event.title,
      slug: event.slug,
      status: event.status,
      community: event.community,
      organization: event.organization,
      categories: event.categories.map((c) => c.category),
    },
  }, 201);
});

// ==========================================
// 4. UPDATE EVENT
// ==========================================

eventRoutes.patch("/:eventId", authMiddleware, validate(updateEventSchema), async (c) => {
  const authUser = c.get("user");
  const eventId = c.req.param("eventId") as string;
  const data = c.get("validated");

  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event || event.deletedAt) {
    return c.json({ success: false, message: "Event tidak ditemukan" }, 404);
  }

  const role = await getEventOrganizerRole(authUser.id, event);
  if (!canManageEvent(role, authUser.id, event)) {
    return c.json({ success: false, message: "Tidak memiliki akses mengubah event ini" }, 403);
  }

  if (["COMPLETED", "CANCELLED", "ARCHIVED"].includes(event.status)) {
    return c.json({ success: false, message: "Event yang sudah selesai/dibatalkan/diarsipkan tidak dapat diubah" }, 400);
  }

  const { categoryIds, gallery, ...updateData } = data;

  const updated = await prisma.event.update({
    where: { id: eventId },
    data: {
      ...updateData,
      eventDate: data.eventDate ? new Date(data.eventDate) : undefined,
      endDate: data.endDate ? new Date(data.endDate) : undefined,
      gallery: gallery !== undefined ? JSON.stringify(gallery) : undefined,
    },
    include: {
      community: { select: { id: true, name: true, slug: true } },
      organization: { select: { id: true, name: true, slug: true } },
      categories: { include: { category: true } },
    },
  });

  if (categoryIds) {
    await prisma.eventCategory.deleteMany({ where: { eventId } });
    if (categoryIds.length > 0) {
      await prisma.eventCategory.createMany({
        data: categoryIds.map((categoryId: string) => ({ eventId, categoryId })),
      });
    }
  }

  await createAuditLog({
    userId: authUser.id,
    actionType: AuditActions.EVENT_UPDATE,
    resourceName: "Event",
    resourceId: eventId,
    beforeData: { title: event.title, status: event.status },
    afterData: { title: updated.title, status: updated.status },
  });

  return c.json({
    success: true,
    message: "Event berhasil diperbarui",
    data: {
      id: updated.id,
      title: updated.title,
      slug: updated.slug,
      status: updated.status,
      categories: updated.categories.map((c) => c.category),
    },
  });
});

// ==========================================
// 5. DELETE EVENT (Soft Delete)
// ==========================================

eventRoutes.delete("/:eventId", authMiddleware, async (c) => {
  const authUser = c.get("user");
  const eventId = c.req.param("eventId") as string;

  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event || event.deletedAt) {
    return c.json({ success: false, message: "Event tidak ditemukan" }, 404);
  }

  const role = await getEventOrganizerRole(authUser.id, event);
  if (!canManageEvent(role, authUser.id, event)) {
    return c.json({ success: false, message: "Tidak memiliki akses menghapus event ini" }, 403);
  }

  await prisma.event.update({
    where: { id: eventId },
    data: { deletedAt: new Date(), status: "CANCELLED" },
  });

  await createAuditLog({
    userId: authUser.id,
    actionType: AuditActions.EVENT_DELETE,
    resourceName: "Event",
    resourceId: eventId,
    beforeData: { title: event.title, status: event.status },
  });

  return c.json({ success: true, message: "Event berhasil dihapus" });
});

// ==========================================
// 6. PUBLISH EVENT
// ==========================================

eventRoutes.post("/:eventId/publish", authMiddleware, async (c) => {
  const authUser = c.get("user");
  const eventId = c.req.param("eventId") as string;

  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event || event.deletedAt) {
    return c.json({ success: false, message: "Event tidak ditemukan" }, 404);
  }

  const role = await getEventOrganizerRole(authUser.id, event);
  if (!canManageEvent(role, authUser.id, event)) {
    return c.json({ success: false, message: "Tidak memiliki akses mempublikasikan event ini" }, 403);
  }

  const targetStatus = "PUBLISHED";
  if (!isValidTransition(event.status, targetStatus)) {
    return c.json({ success: false, message: `Tidak dapat publish dari status ${event.status}` }, 400);
  }

  const updated = await prisma.event.update({
    where: { id: eventId },
    data: { status: targetStatus },
  });

  await createAuditLog({
    userId: authUser.id,
    actionType: AuditActions.EVENT_PUBLISH,
    resourceName: "Event",
    resourceId: eventId,
    beforeData: { status: event.status },
    afterData: { status: targetStatus },
  });

  return c.json({
    success: true,
    message: "Event berhasil dipublikasikan",
    data: { id: updated.id, status: updated.status },
  });
});

// ==========================================
// 7. OPEN REGISTRATION
// ==========================================

eventRoutes.post("/:eventId/open-registration", authMiddleware, async (c) => {
  const authUser = c.get("user");
  const eventId = c.req.param("eventId") as string;

  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event || event.deletedAt) {
    return c.json({ success: false, message: "Event tidak ditemukan" }, 404);
  }

  const role = await getEventOrganizerRole(authUser.id, event);
  if (!canManageEvent(role, authUser.id, event)) {
    return c.json({ success: false, message: "Tidak memiliki akses" }, 403);
  }

  if (!isValidTransition(event.status, "REGISTRATION_OPEN")) {
    return c.json({ success: false, message: `Tidak dapat membuka registrasi dari status ${event.status}` }, 400);
  }

  const updated = await prisma.event.update({
    where: { id: eventId },
    data: { status: "REGISTRATION_OPEN" },
  });

  await createAuditLog({
    userId: authUser.id,
    actionType: AuditActions.EVENT_PUBLISH,
    resourceName: "Event",
    resourceId: eventId,
    beforeData: { status: event.status },
    afterData: { status: "REGISTRATION_OPEN" },
  });

  return c.json({
    success: true,
    message: "Registrasi event berhasil dibuka",
    data: { id: updated.id, status: updated.status },
  });
});

// ==========================================
// 8. CLOSE REGISTRATION
// ==========================================

eventRoutes.post("/:eventId/close-registration", authMiddleware, async (c) => {
  const authUser = c.get("user");
  const eventId = c.req.param("eventId") as string;

  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event || event.deletedAt) {
    return c.json({ success: false, message: "Event tidak ditemukan" }, 404);
  }

  const role = await getEventOrganizerRole(authUser.id, event);
  if (!canManageEvent(role, authUser.id, event)) {
    return c.json({ success: false, message: "Tidak memiliki akses" }, 403);
  }

  if (!isValidTransition(event.status, "REGISTRATION_CLOSED")) {
    return c.json({ success: false, message: `Tidak dapat menutup registrasi dari status ${event.status}` }, 400);
  }

  const updated = await prisma.event.update({
    where: { id: eventId },
    data: { status: "REGISTRATION_CLOSED" },
  });

  await createAuditLog({
    userId: authUser.id,
    actionType: AuditActions.EVENT_PUBLISH,
    resourceName: "Event",
    resourceId: eventId,
    beforeData: { status: event.status },
    afterData: { status: "REGISTRATION_CLOSED" },
  });

  return c.json({
    success: true,
    message: "Registrasi event berhasil ditutup",
    data: { id: updated.id, status: updated.status },
  });
});

// ==========================================
// 9. START EVENT (ONGOING)
// ==========================================

eventRoutes.post("/:eventId/start", authMiddleware, async (c) => {
  const authUser = c.get("user");
  const eventId = c.req.param("eventId") as string;

  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event || event.deletedAt) {
    return c.json({ success: false, message: "Event tidak ditemukan" }, 404);
  }

  const role = await getEventOrganizerRole(authUser.id, event);
  if (!canManageEvent(role, authUser.id, event)) {
    return c.json({ success: false, message: "Tidak memiliki akses" }, 403);
  }

  if (!isValidTransition(event.status, "ONGOING")) {
    return c.json({ success: false, message: `Tidak dapat memulai event dari status ${event.status}` }, 400);
  }

  const updated = await prisma.event.update({
    where: { id: eventId },
    data: { status: "ONGOING" },
  });

  await createAuditLog({
    userId: authUser.id,
    actionType: AuditActions.EVENT_PUBLISH,
    resourceName: "Event",
    resourceId: eventId,
    beforeData: { status: event.status },
    afterData: { status: "ONGOING" },
  });

  return c.json({
    success: true,
    message: "Event berhasil dimulai",
    data: { id: updated.id, status: updated.status },
  });
});

// ==========================================
// 10. COMPLETE EVENT
// ==========================================

eventRoutes.post("/:eventId/complete", authMiddleware, async (c) => {
  const authUser = c.get("user");
  const eventId = c.req.param("eventId") as string;

  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event || event.deletedAt) {
    return c.json({ success: false, message: "Event tidak ditemukan" }, 404);
  }

  const role = await getEventOrganizerRole(authUser.id, event);
  if (!canManageEvent(role, authUser.id, event)) {
    return c.json({ success: false, message: "Tidak memiliki akses" }, 403);
  }

  if (!isValidTransition(event.status, "COMPLETED")) {
    return c.json({ success: false, message: `Tidak dapat menyelesaikan event dari status ${event.status}` }, 400);
  }

  const updated = await prisma.event.update({
    where: { id: eventId },
    data: { status: "COMPLETED" },
  });

  await createAuditLog({
    userId: authUser.id,
    actionType: AuditActions.EVENT_PUBLISH,
    resourceName: "Event",
    resourceId: eventId,
    beforeData: { status: event.status },
    afterData: { status: "COMPLETED" },
  });

  return c.json({
    success: true,
    message: "Event berhasil diselesaikan",
    data: { id: updated.id, status: updated.status },
  });
});

// ==========================================
// 11. CANCEL EVENT
// ==========================================

eventRoutes.post("/:eventId/cancel", authMiddleware, async (c) => {
  const authUser = c.get("user");
  const eventId = c.req.param("eventId") as string;

  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event || event.deletedAt) {
    return c.json({ success: false, message: "Event tidak ditemukan" }, 404);
  }

  const role = await getEventOrganizerRole(authUser.id, event);
  if (!canManageEvent(role, authUser.id, event)) {
    return c.json({ success: false, message: "Tidak memiliki akses membatalkan event ini" }, 403);
  }

  if (!isValidTransition(event.status, "CANCELLED")) {
    return c.json({ success: false, message: `Tidak dapat membatalkan event dari status ${event.status}` }, 400);
  }

  const updated = await prisma.event.update({
    where: { id: eventId },
    data: { status: "CANCELLED" },
  });

  const registrations = await prisma.eventRegistration.findMany({
    where: { eventId, status: { in: ["CONFIRMED", "PENDING", "WAITLISTED"] } },
  });

  if (registrations.length > 0) {
    await prisma.eventRegistration.updateMany({
      where: { eventId, status: { in: ["CONFIRMED", "PENDING", "WAITLISTED"] } },
      data: { status: "CANCELLED" },
    });

    await prisma.notification.createMany({
      data: registrations.map((r) => ({
        userId: r.userId,
        title: "Event Dibatalkan",
        message: `Event "${event.title}" telah dibatalkan oleh penyelenggara.`,
        type: "EVENT" as const,
        link: `/events/${event.slug}`,
      })),
    });
  }

  await createAuditLog({
    userId: authUser.id,
    actionType: AuditActions.EVENT_CANCEL,
    resourceName: "Event",
    resourceId: eventId,
    beforeData: { status: event.status },
    afterData: { status: "CANCELLED" },
  });

  return c.json({
    success: true,
    message: "Event berhasil dibatalkan",
    data: { id: updated.id, status: updated.status },
  });
});

// ==========================================
// 12. ARCHIVE EVENT
// ==========================================

eventRoutes.post("/:eventId/archive", authMiddleware, async (c) => {
  const authUser = c.get("user");
  const eventId = c.req.param("eventId") as string;

  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event || event.deletedAt) {
    return c.json({ success: false, message: "Event tidak ditemukan" }, 404);
  }

  const role = await getEventOrganizerRole(authUser.id, event);
  if (!canManageEvent(role, authUser.id, event)) {
    return c.json({ success: false, message: "Tidak memiliki akses mengarsipkan event ini" }, 403);
  }

  if (!isValidTransition(event.status, "ARCHIVED")) {
    return c.json({ success: false, message: `Tidak dapat mengarsipkan event dari status ${event.status}` }, 400);
  }

  const updated = await prisma.event.update({
    where: { id: eventId },
    data: { status: "ARCHIVED" },
  });

  await createAuditLog({
    userId: authUser.id,
    actionType: AuditActions.EVENT_ARCHIVE,
    resourceName: "Event",
    resourceId: eventId,
    beforeData: { status: event.status },
    afterData: { status: "ARCHIVED" },
  });

  return c.json({
    success: true,
    message: "Event berhasil diarsipkan",
    data: { id: updated.id, status: updated.status },
  });
});

// ==========================================
// 13. DUPLICATE EVENT
// ==========================================

eventRoutes.post("/:eventId/duplicate", authMiddleware, async (c) => {
  const authUser = c.get("user");
  const eventId = c.req.param("eventId") as string;

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: { categories: true },
  });

  if (!event || event.deletedAt) {
    return c.json({ success: false, message: "Event tidak ditemukan" }, 404);
  }

  const role = await getEventOrganizerRole(authUser.id, event);
  if (!canManageEvent(role, authUser.id, event)) {
    return c.json({ success: false, message: "Tidak memiliki akses menduplikasi event ini" }, 403);
  }

  let slug = slugify(`${event.title} copy`);
  const existingSlug = await prisma.event.findUnique({ where: { slug } });
  if (existingSlug) slug = `${slug}-${Date.now()}`;

  const newEvent = await prisma.event.create({
    data: {
      title: `${event.title} (Salinan)`,
      slug,
      description: event.description,
      coverImage: event.coverImage,
      thumbnail: event.thumbnail,
      location: event.location,
      locationType: event.locationType,
      isOnline: event.isOnline,
      onlineUrl: event.onlineUrl,
      meetingUrl: event.meetingUrl,
      eventDate: event.eventDate,
      endDate: event.endDate,
      timezone: event.timezone,
      quota: event.quota,
      allowWaitlist: event.allowWaitlist,
      status: "DRAFT",
      visibility: event.visibility,
      contactName: event.contactName,
      contactEmail: event.contactEmail,
      contactPhone: event.contactPhone,
      gallery: event.gallery,
      communityId: event.communityId,
      organizationId: event.organizationId,
      createdById: authUser.id,
      categories: event.categories.length > 0
        ? { create: event.categories.map((c) => ({ categoryId: c.categoryId })) }
        : undefined,
    },
    include: {
      categories: { include: { category: true } },
    },
  });

  await createAuditLog({
    userId: authUser.id,
    actionType: AuditActions.EVENT_DUPLICATE,
    resourceName: "Event",
    resourceId: newEvent.id,
    afterData: { originalEventId: event.id, title: newEvent.title },
  });

  return c.json({
    success: true,
    message: "Event berhasil diduplikasi",
    data: {
      id: newEvent.id,
      title: newEvent.title,
      slug: newEvent.slug,
      status: newEvent.status,
    },
  }, 201);
});

// ==========================================
// 14. REGISTER FOR EVENT
// ==========================================

eventRoutes.post("/:eventId/register", authMiddleware, async (c) => {
  const authUser = c.get("user");
  const eventId = c.req.param("eventId") as string;

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: { _count: { select: { registrations: { where: { status: "CONFIRMED" } } } } },
  });

  if (!event || event.deletedAt) {
    return c.json({ success: false, message: "Event tidak ditemukan" }, 404);
  }

  if (event.status !== "REGISTRATION_OPEN") {
    return c.json({ success: false, message: "Registrasi event belum dibuka" }, 400);
  }

  const existing = await prisma.eventRegistration.findUnique({
    where: { eventId_userId: { eventId, userId: authUser.id } },
  });

  if (existing && ["CONFIRMED", "PENDING", "WAITLISTED"].includes(existing.status)) {
    return c.json({ success: false, message: "Sudah terdaftar di event ini" }, 409);
  }

  if (existing && existing.status === "CANCELLED") {
    await prisma.eventRegistration.delete({ where: { id: existing.id } });
  }

  const confirmedCount = event._count.registrations;
  const isFull = confirmedCount >= event.quota;
  let registrationStatus = "CONFIRMED";

  if (isFull) {
    if (!event.allowWaitlist) {
      return c.json({ success: false, message: "Kuota event penuh" }, 400);
    }
    registrationStatus = "WAITLISTED";
  }

  const registration = await prisma.eventRegistration.create({
    data: {
      eventId,
      userId: authUser.id,
      status: registrationStatus as any,
    },
  });

  await prisma.notification.create({
    data: {
      userId: event.createdById,
      title: "Peserta Baru Mendaftar",
      message: `${authUser.name} mendaftar pada event "${event.title}"`,
      type: "EVENT",
      link: `/events/${event.slug}`,
    },
  });

  await createAuditLog({
    userId: authUser.id,
    actionType: AuditActions.EVENT_REGISTER,
    resourceName: "Event",
    resourceId: eventId,
    afterData: { status: registrationStatus },
  });

  return c.json({
    success: true,
    message: registrationStatus === "WAITLISTED"
      ? "Berhasil masuk waiting list"
      : "Berhasil mendaftar event",
    data: {
      registrationId: registration.id,
      status: registration.status,
    },
  }, 201);
});

// ==========================================
// 15. CANCEL REGISTRATION
// ==========================================

eventRoutes.delete("/:eventId/register", authMiddleware, async (c) => {
  const authUser = c.get("user");
  const eventId = c.req.param("eventId") as string;

  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event || event.deletedAt) {
    return c.json({ success: false, message: "Event tidak ditemukan" }, 404);
  }

  if (["COMPLETED", "CANCELLED", "ARCHIVED"].includes(event.status)) {
    return c.json({ success: false, message: "Tidak dapat membatalkan pendaftaran untuk event ini" }, 400);
  }

  const registration = await prisma.eventRegistration.findUnique({
    where: { eventId_userId: { eventId, userId: authUser.id } },
  });

  if (!registration || registration.status === "CANCELLED") {
    return c.json({ success: false, message: "Tidak terdaftar di event ini" }, 404);
  }

  await prisma.eventRegistration.update({
    where: { eventId_userId: { eventId, userId: authUser.id } },
    data: { status: "CANCELLED" },
  });

  if (event.status === "REGISTRATION_OPEN") {
    const waitlisted = await prisma.eventRegistration.findFirst({
      where: { eventId, status: "WAITLISTED" },
      orderBy: { registeredAt: "asc" },
    });

    if (waitlisted) {
      await prisma.eventRegistration.update({
        where: { id: waitlisted.id },
        data: { status: "CONFIRMED" },
      });

      await prisma.notification.create({
        data: {
          userId: waitlisted.userId,
          title: "Registrasi Dikonfirmasi",
          message: `Kuota tersedia! Anda terkonfirmasi pada event "${event.title}".`,
          type: "EVENT",
          link: `/events/${event.slug}`,
        },
      });
    }
  }

  await prisma.notification.create({
    data: {
      userId: event.createdById,
      title: "Peserta Membatalkan",
      message: `${authUser.name} membatalkan pendaftaran pada event "${event.title}"`,
      type: "EVENT",
      link: `/events/${event.slug}`,
    },
  });

  await createAuditLog({
    userId: authUser.id,
    actionType: AuditActions.EVENT_UNREGISTER,
    resourceName: "Event",
    resourceId: eventId,
  });

  return c.json({ success: true, message: "Berhasil membatalkan pendaftaran" });
});

// ==========================================
// 16. GET PARTICIPANTS (Manager)
// ==========================================

eventRoutes.get("/:eventId/participants", authMiddleware, async (c) => {
  const authUser = c.get("user");
  const eventId = c.req.param("eventId") as string;
  const url = new URL(c.req.url);
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = parseInt(url.searchParams.get("limit") || "20");
  const search = url.searchParams.get("search") || "";
  const status = url.searchParams.get("status") || "";

  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event || event.deletedAt) {
    return c.json({ success: false, message: "Event tidak ditemukan" }, 404);
  }

  const role = await getEventOrganizerRole(authUser.id, event);
  if (!canManageEvent(role, authUser.id, event)) {
    return c.json({ success: false, message: "Tidak memiliki akses melihat peserta" }, 403);
  }

  const where: any = { eventId };
  if (status) where.status = status;

  if (search) {
    where.user = {
      OR: [
        { name: { contains: search } },
        { email: { contains: search } },
      ],
    };
  }

  const [participants, total] = await Promise.all([
    prisma.eventRegistration.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true, avatar: true, phone: true } },
      },
      orderBy: { registeredAt: "asc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.eventRegistration.count({ where }),
  ]);

  const stats = await prisma.eventRegistration.groupBy({
    by: ["status"],
    where: { eventId },
    _count: true,
  });

  return c.json({
    success: true,
    data: participants.map((p) => ({
      id: p.id,
      user: p.user,
      status: p.status,
      attendance: p.attendance,
      checkedInAt: p.checkedInAt,
      checkedOutAt: p.checkedOutAt,
      notes: p.notes,
      registeredAt: p.registeredAt,
    })),
    stats: stats.reduce((acc, s) => ({ ...acc, [s.status]: s._count }), {}),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

// ==========================================
// 17. CHECK IN PARTICIPANT
// ==========================================

eventRoutes.post("/:eventId/participants/:participantId/check-in", authMiddleware, async (c) => {
  const authUser = c.get("user");
  const eventId = c.req.param("eventId") as string;
  const participantId = c.req.param("participantId") as string;

  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event || event.deletedAt) {
    return c.json({ success: false, message: "Event tidak ditemukan" }, 404);
  }

  const role = await getEventOrganizerRole(authUser.id, event);
  if (!canManageEvent(role, authUser.id, event)) {
    return c.json({ success: false, message: "Tidak memiliki akses" }, 403);
  }

  const registration = await prisma.eventRegistration.findUnique({
    where: { id: participantId },
    include: { user: { select: { name: true } }, event: { select: { title: true } } },
  });

  if (!registration || registration.eventId !== eventId) {
    return c.json({ success: false, message: "Peserta tidak ditemukan" }, 404);
  }

  if (registration.status !== "CONFIRMED") {
    return c.json({ success: false, message: "Peserta belum dikonfirmasi" }, 400);
  }

  const updated = await prisma.eventRegistration.update({
    where: { id: participantId },
    data: { attendance: "CHECKED_IN", checkedInAt: new Date() },
  });

  await createAuditLog({
    userId: authUser.id,
    actionType: AuditActions.EVENT_CHECK_IN,
    resourceName: "EventRegistration",
    resourceId: participantId,
    afterData: { userId: registration.userId, userName: registration.user.name },
  });

  return c.json({
    success: true,
    message: `${registration.user.name} berhasil check in`,
    data: { id: updated.id, attendance: updated.attendance, checkedInAt: updated.checkedInAt },
  });
});

// ==========================================
// 18. CHECK OUT PARTICIPANT
// ==========================================

eventRoutes.post("/:eventId/participants/:participantId/check-out", authMiddleware, async (c) => {
  const authUser = c.get("user");
  const eventId = c.req.param("eventId") as string;
  const participantId = c.req.param("participantId") as string;

  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event || event.deletedAt) {
    return c.json({ success: false, message: "Event tidak ditemukan" }, 404);
  }

  const role = await getEventOrganizerRole(authUser.id, event);
  if (!canManageEvent(role, authUser.id, event)) {
    return c.json({ success: false, message: "Tidak memiliki akses" }, 403);
  }

  const registration = await prisma.eventRegistration.findUnique({
    where: { id: participantId },
    include: { user: { select: { name: true } } },
  });

  if (!registration || registration.eventId !== eventId) {
    return c.json({ success: false, message: "Peserta tidak ditemukan" }, 404);
  }

  if (registration.attendance !== "CHECKED_IN") {
    return c.json({ success: false, message: "Peserta belum check in" }, 400);
  }

  const updated = await prisma.eventRegistration.update({
    where: { id: participantId },
    data: { attendance: "CHECKED_OUT", checkedOutAt: new Date() },
  });

  await createAuditLog({
    userId: authUser.id,
    actionType: AuditActions.EVENT_CHECK_OUT,
    resourceName: "EventRegistration",
    resourceId: participantId,
    afterData: { userId: registration.userId, userName: registration.user.name },
  });

  return c.json({
    success: true,
    message: `${registration.user.name} berhasil check out`,
    data: { id: updated.id, attendance: updated.attendance, checkedOutAt: updated.checkedOutAt },
  });
});

// ==========================================
// 19. APPROVE PARTICIPANT
// ==========================================

eventRoutes.patch("/:eventId/participants/:participantId/approve", authMiddleware, async (c) => {
  const authUser = c.get("user");
  const eventId = c.req.param("eventId") as string;
  const participantId = c.req.param("participantId") as string;

  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event || event.deletedAt) {
    return c.json({ success: false, message: "Event tidak ditemukan" }, 404);
  }

  const role = await getEventOrganizerRole(authUser.id, event);
  if (!canManageEvent(role, authUser.id, event)) {
    return c.json({ success: false, message: "Tidak memiliki akses" }, 403);
  }

  const registration = await prisma.eventRegistration.findUnique({
    where: { id: participantId },
    include: { user: { select: { name: true } } },
  });

  if (!registration || registration.eventId !== eventId) {
    return c.json({ success: false, message: "Peserta tidak ditemukan" }, 404);
  }

  if (registration.status !== "PENDING") {
    return c.json({ success: false, message: "Hanya peserta dengan status PENDING yang dapat disetujui" }, 400);
  }

  const updated = await prisma.eventRegistration.update({
    where: { id: participantId },
    data: { status: "CONFIRMED" },
  });

  await prisma.notification.create({
    data: {
      userId: registration.userId,
      title: "Pendaftaran Disetujui",
      message: `Pendaftaran Anda pada event "${event.title}" telah disetujui.`,
      type: "EVENT",
      link: `/events/${event.slug}`,
    },
  });

  await createAuditLog({
    userId: authUser.id,
    actionType: AuditActions.EVENT_PARTICIPANT_APPROVE,
    resourceName: "EventRegistration",
    resourceId: participantId,
    afterData: { userId: registration.userId, userName: registration.user.name },
  });

  return c.json({
    success: true,
    message: `Pendaftaran ${registration.user.name} berhasil disetujui`,
    data: { id: updated.id, status: updated.status },
  });
});

// ==========================================
// 20. REJECT PARTICIPANT
// ==========================================

eventRoutes.patch("/:eventId/participants/:participantId/reject", authMiddleware, async (c) => {
  const authUser = c.get("user");
  const eventId = c.req.param("eventId") as string;
  const participantId = c.req.param("participantId") as string;

  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event || event.deletedAt) {
    return c.json({ success: false, message: "Event tidak ditemukan" }, 404);
  }

  const role = await getEventOrganizerRole(authUser.id, event);
  if (!canManageEvent(role, authUser.id, event)) {
    return c.json({ success: false, message: "Tidak memiliki akses" }, 403);
  }

  const registration = await prisma.eventRegistration.findUnique({
    where: { id: participantId },
    include: { user: { select: { name: true } } },
  });

  if (!registration || registration.eventId !== eventId) {
    return c.json({ success: false, message: "Peserta tidak ditemukan" }, 404);
  }

  if (registration.status !== "PENDING") {
    return c.json({ success: false, message: "Hanya peserta dengan status PENDING yang dapat ditolak" }, 400);
  }

  const updated = await prisma.eventRegistration.update({
    where: { id: participantId },
    data: { status: "REJECTED" },
  });

  await prisma.notification.create({
    data: {
      userId: registration.userId,
      title: "Pendaftaran Ditolak",
      message: `Pendaftaran Anda pada event "${event.title}" telah ditolak.`,
      type: "EVENT",
      link: `/events/${event.slug}`,
    },
  });

  await createAuditLog({
    userId: authUser.id,
    actionType: AuditActions.EVENT_PARTICIPANT_REJECT,
    resourceName: "EventRegistration",
    resourceId: participantId,
    afterData: { userId: registration.userId, userName: registration.user.name },
  });

  return c.json({
    success: true,
    message: `Pendaftaran ${registration.user.name} berhasil ditolak`,
    data: { id: updated.id, status: updated.status },
  });
});

// ==========================================
// 21. EXPORT PARTICIPANTS (CSV-like JSON)
// ==========================================

eventRoutes.get("/:eventId/participants/export", authMiddleware, async (c) => {
  const authUser = c.get("user");
  const eventId = c.req.param("eventId") as string;

  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event || event.deletedAt) {
    return c.json({ success: false, message: "Event tidak ditemukan" }, 404);
  }

  const role = await getEventOrganizerRole(authUser.id, event);
  if (!canManageEvent(role, authUser.id, event)) {
    return c.json({ success: false, message: "Tidak memiliki akses" }, 403);
  }

  const participants = await prisma.eventRegistration.findMany({
    where: { eventId, status: { in: ["CONFIRMED", "PENDING", "WAITLISTED"] } },
    include: { user: { select: { id: true, name: true, email: true, phone: true } } },
    orderBy: { registeredAt: "asc" },
  });

  return c.json({
    success: true,
    data: participants.map((p) => ({
      name: p.user.name,
      email: p.user.email,
      phone: p.user.phone,
      status: p.status,
      attendance: p.attendance,
      checkedInAt: p.checkedInAt,
      registeredAt: p.registeredAt,
    })),
    total: participants.length,
    eventName: event.title,
  });
});

// ==========================================
// 22. EVENT DASHBOARD (Manager)
// ==========================================

eventRoutes.get("/:eventId/dashboard", authMiddleware, async (c) => {
  const authUser = c.get("user");
  const eventId = c.req.param("eventId") as string;

  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event || event.deletedAt) {
    return c.json({ success: false, message: "Event tidak ditemukan" }, 404);
  }

  const role = await getEventOrganizerRole(authUser.id, event);
  if (!canManageEvent(role, authUser.id, event)) {
    return c.json({ success: false, message: "Tidak memiliki akses" }, 403);
  }

  const [
    totalRegistrations,
    confirmedCount,
    pendingCount,
    waitlistedCount,
    cancelledCount,
    checkedInCount,
    checkedOutCount,
    recentRegistrations,
    registrationByDay,
  ] = await Promise.all([
    prisma.eventRegistration.count({ where: { eventId } }),
    prisma.eventRegistration.count({ where: { eventId, status: "CONFIRMED" } }),
    prisma.eventRegistration.count({ where: { eventId, status: "PENDING" } }),
    prisma.eventRegistration.count({ where: { eventId, status: "WAITLISTED" } }),
    prisma.eventRegistration.count({ where: { eventId, status: "CANCELLED" } }),
    prisma.eventRegistration.count({ where: { eventId, attendance: "CHECKED_IN" } }),
    prisma.eventRegistration.count({ where: { eventId, attendance: "CHECKED_OUT" } }),
    prisma.eventRegistration.findMany({
      where: { eventId },
      include: { user: { select: { id: true, name: true, avatar: true } } },
      orderBy: { registeredAt: "desc" },
      take: 10,
    }),
    prisma.$queryRaw`
      SELECT DATE(registeredAt) as date, COUNT(*) as count
      FROM event_registrations
      WHERE eventId = ${eventId} AND status != 'CANCELLED'
      GROUP BY DATE(registeredAt)
      ORDER BY date ASC
    `,
  ]);

  return c.json({
    success: true,
    data: {
      event: {
        id: event.id,
        title: event.title,
        status: event.status,
        eventDate: event.eventDate,
        endDate: event.endDate,
        quota: event.quota,
        allowWaitlist: event.allowWaitlist,
      },
      summary: {
        totalRegistrations,
        confirmed: confirmedCount,
        pending: pendingCount,
        waitlisted: waitlistedCount,
        cancelled: cancelledCount,
        checkedIn: checkedInCount,
        checkedOut: checkedOutCount,
        capacity: event.quota,
        capacityUsed: confirmedCount,
        capacityPercentage: event.quota > 0 ? Math.round((confirmedCount / event.quota) * 100) : 0,
        attendanceRate: confirmedCount > 0 ? Math.round((checkedInCount / confirmedCount) * 100) : 0,
      },
      recentRegistrations: recentRegistrations.map((r) => ({
        id: r.id,
        user: r.user,
        status: r.status,
        attendance: r.attendance,
        registeredAt: r.registeredAt,
      })),
      registrationTrend: registrationByDay,
    },
  });
});

// ==========================================
// 23. MY EVENTS (Dashboard)
// ==========================================

eventRoutes.get("/my/created", authMiddleware, async (c) => {
  const authUser = c.get("user");
  const url = new URL(c.req.url);
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = parseInt(url.searchParams.get("limit") || "20");
  const status = url.searchParams.get("status") || "";

  const where: any = {
    createdById: authUser.id,
    deletedAt: null,
  };

  if (status) where.status = status;

  const [events, total] = await Promise.all([
    prisma.event.findMany({
      where,
      include: {
        community: { select: { id: true, name: true, slug: true } },
        organization: { select: { id: true, name: true, slug: true } },
        _count: { select: { registrations: { where: { status: "CONFIRMED" } } } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.event.count({ where }),
  ]);

  return c.json({
    success: true,
    data: events.map((e) => ({
      id: e.id,
      title: e.title,
      slug: e.slug,
      status: e.status,
      eventDate: e.eventDate,
      quota: e.quota,
      registeredCount: e._count.registrations,
      community: e.community,
      organization: e.organization,
      createdAt: e.createdAt,
    })),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});

eventRoutes.get("/my/registered", authMiddleware, async (c) => {
  const authUser = c.get("user");
  const url = new URL(c.req.url);
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = parseInt(url.searchParams.get("limit") || "20");
  const status = url.searchParams.get("status") || "";

  const where: any = {
    userId: authUser.id,
    event: { deletedAt: null },
  };

  if (status) where.status = status;

  const [registrations, total] = await Promise.all([
    prisma.eventRegistration.findMany({
      where,
      include: {
        event: {
          include: {
            community: { select: { id: true, name: true, slug: true } },
            organization: { select: { id: true, name: true, slug: true } },
          },
        },
      },
      orderBy: { registeredAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.eventRegistration.count({ where }),
  ]);

  return c.json({
    success: true,
    data: registrations.map((r) => ({
      id: r.id,
      status: r.status,
      attendance: r.attendance,
      registeredAt: r.registeredAt,
      event: {
        id: r.event.id,
        title: r.event.title,
        slug: r.event.slug,
        eventDate: r.event.eventDate,
        endDate: r.event.endDate,
        status: r.event.status,
        location: r.event.location,
        isOnline: r.event.isOnline,
        community: r.event.community,
        organization: r.event.organization,
      },
    })),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});
