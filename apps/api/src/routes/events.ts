import { Hono } from "hono";
import { prisma } from "@komunaid/database";
import type { Prisma } from "@prisma/client";
import { createEventSchema, updateEventSchema, eventQuerySchema, reviewEventSchema } from "@komunaid/shared";
import { authMiddleware, optionalAuthMiddleware } from "../middleware/auth";
import { requireSuperAdmin } from "../middleware/rbac";
import { validate } from "../middleware/validate";
import { createAuditLog, AuditActions } from "../services/audit";
import { xssSanitize, sanitizeText } from "../lib/xss";
import { createWithUniqueSlug } from "../lib/slug";
import { slugify } from "@komunaid/utils";
import type { AuthUser } from "../middleware/auth";
import { sendEmail } from "../services/email";
import { transitionEvent as transitionEventLifecycle, EVENT_TRANSITIONS } from "../services/lifecycle-transition";
import { activeScope, publicScope, PUBLIC_EVENT_STATUSES } from "../lib/visibility-scope";
import { getEventOrganizerRole, isSuperAdmin, canManageEvent } from "../lib/organizer-authorization";

type Env = { Variables: { user: AuthUser; validated: any; userRoles: string[] } };

export const eventRoutes = new Hono<Env>();

// getEventOrganizerRole / isSuperAdmin / canManageEvent now live in
// ../lib/organizer-authorization.ts -- this file and routes/volunteers.ts
// used to carry byte-identical copies.

// Canonical transition table now lives in services/lifecycle-transition.ts
// (EVENT_TRANSITIONS) — this used to be a second, drifted copy.
function isValidTransition(from: string, to: string): boolean {
  return EVENT_TRANSITIONS[from]?.includes(to) ?? false;
}

async function actorRole(userId: string, event: any): Promise<string> {
  if (await isSuperAdmin(userId)) return "SUPER_ADMIN";
  return (await getEventOrganizerRole(userId, event)) || "UNKNOWN";
}

// Thin adapter over the shared lifecycle-transition service, kept so the 12
// call sites below don't need to change shape. This now runs the guarded
// transaction + EventStatusHistory row + AuditLog row (previously written
// separately, inconsistently, at each call site) in one place, and throws
// LifecycleTransitionError on a lost race instead of a bare Error — app.ts's
// onError maps that to 409 for every caller, public or admin.
async function transitionEvent(
  event: any,
  toStatus: string,
  actorId: string,
  options: {
    reason?: string;
    submittedAt?: Date | null;
    reviewedAt?: Date | null;
    reviewedById?: string | null;
    reviewNote?: string | null;
    auditAction?: string;
  } = {}
) {
  const role = await actorRole(actorId, event);
  return transitionEventLifecycle({
    eventId: event.id,
    expectedStatus: event.status,
    targetStatus: toStatus,
    actorId,
    actorRole: role,
    reason: options.reason ?? null,
    submittedAt: options.submittedAt,
    reviewedAt: options.reviewedAt,
    reviewedById: options.reviewedById,
    reviewNote: options.reviewNote,
    auditAction: options.auditAction,
  });
}

// ==========================================
// Settings-switch visibility for public event listings
// ==========================================

interface HiddenEventListIds {
  communityIds: string[];
  organizationIds: string[];
}

/**
 * Communities/organizations whose showEventList switch is off, narrowed by
 * the requesting user's own memberships so an active member or the owner of
 * one of these entities still sees its events -- "hiding is outward, not
 * inward" (settings-policy.ts). Mirrors the gate already applied to the
 * embedded event lists on GET /communities/:slug and GET /organizations/:slug
 * (commit 3da65bc, D5) for the standalone public listing routes below
 * (GET /, /popular/upcoming, /featured), which never read the switch at all.
 *
 * `showEventList: false` is a direct DB filter, not a re-implementation of
 * isEventListPublic's null-check: a community that never saved a settings
 * row simply has no matching communitySettings row (so it's never added to
 * the hidden set), and an organization whose settings relation is null fails
 * the nested `settings: { showEventList: false }` match the same way -- both
 * reach isEventListPublic(null)'s default-to-public outcome through the
 * shape of the query, not a hand-rolled `=== null`/`?? true` check in this
 * file. This is a bulk pre-filter feeding a Prisma `where` (required to keep
 * paginatedResponse()'s `total` honest -- see withEventListVisibility below),
 * not a per-row read of one resolved settings object, which is why it
 * doesn't call isEventListPublic() itself the way the detail endpoints do:
 * there is no single record to pass it here.
 *
 * CommunitySettings is queried directly (its own table); Organization is
 * queried via its `settings` relation filter. Both are equally valid real-
 * Prisma queries for the same result -- the split exists only because the
 * shared test fixture (apps/api/tests/support/fake-prisma.ts) models
 * organization settings as an embedded field on the organization row rather
 * than a joined table the way it models community settings.
 */
async function hiddenEventListEntityIds(userId?: string): Promise<HiddenEventListIds> {
  const [communitiesOff, organizationsOff] = await Promise.all([
    prisma.communitySettings.findMany({ where: { showEventList: false }, select: { communityId: true } }),
    prisma.organization.findMany({ where: { settings: { showEventList: false } }, select: { id: true } }),
  ]);

  let communityIds = communitiesOff.map((s: { communityId: string }) => s.communityId);
  let organizationIds = organizationsOff.map((o: { id: string }) => o.id);

  if (userId && (communityIds.length > 0 || organizationIds.length > 0)) {
    const [ownedCommunities, memberCommunities, ownedOrganizations, memberOrganizations] = await Promise.all([
      communityIds.length
        ? prisma.community.findMany({ where: { id: { in: communityIds }, ownerId: userId }, select: { id: true } })
        : Promise.resolve([] as { id: string }[]),
      communityIds.length
        ? prisma.communityMember.findMany({
            where: { communityId: { in: communityIds }, userId, status: "ACTIVE", deletedAt: null },
            select: { communityId: true },
          })
        : Promise.resolve([] as { communityId: string }[]),
      organizationIds.length
        ? prisma.organization.findMany({ where: { id: { in: organizationIds }, ownerId: userId }, select: { id: true } })
        : Promise.resolve([] as { id: string }[]),
      organizationIds.length
        ? prisma.organizationMember.findMany({
            where: { organizationId: { in: organizationIds }, userId, status: "ACTIVE", deletedAt: null },
            select: { organizationId: true },
          })
        : Promise.resolve([] as { organizationId: string }[]),
    ]);

    const visibleCommunityIds = new Set<string>([
      ...ownedCommunities.map((c: { id: string }) => c.id),
      ...memberCommunities.map((m: { communityId: string }) => m.communityId),
    ]);
    const visibleOrganizationIds = new Set<string>([
      ...ownedOrganizations.map((o: { id: string }) => o.id),
      ...memberOrganizations.map((m: { organizationId: string }) => m.organizationId),
    ]);

    communityIds = communityIds.filter((id) => !visibleCommunityIds.has(id));
    organizationIds = organizationIds.filter((id) => !visibleOrganizationIds.has(id));
  }

  return { communityIds, organizationIds };
}

/**
 * Folds hiddenEventListEntityIds() into an existing Event `where` via `AND`,
 * so it composes with any prior top-level `communityId`/`organizationId`
 * equality filter (e.g. GET /'s `?communityId=` query param) instead of
 * overwriting it -- and so every query built from the same base `where`
 * (list + count, or the ranked/fallback pair on /popular/upcoming) applies
 * the identical filter, keeping paginatedResponse()'s `total` honest rather
 * than lying about a post-query-filtered page.
 */
function withEventListVisibility(where: Prisma.EventWhereInput, hidden: HiddenEventListIds): Prisma.EventWhereInput {
  const extra: Prisma.EventWhereInput[] = [];
  // Event.communityId and Event.organizationId are both nullable -- an event
  // belongs to a community OR an organization, so one of the two columns is
  // NULL on essentially every row. Prisma's `notIn` (like SQL `NOT IN`) never
  // returns a row whose column is NULL, so a bare `{ communityId: { notIn } }`
  // would silently drop every organization-owned event the instant ANY
  // community's showEventList switch went off, and vice versa. The explicit
  // `{ field: null }` branch keeps those NULL rows in, which is what makes
  // this an "exclude these specific ids" filter instead of an accidental
  // "exclude every row that doesn't have this column set" filter.
  if (hidden.communityIds.length > 0) {
    extra.push({ OR: [{ communityId: null }, { communityId: { notIn: hidden.communityIds } }] });
  }
  if (hidden.organizationIds.length > 0) {
    extra.push({ OR: [{ organizationId: null }, { organizationId: { notIn: hidden.organizationIds } }] });
  }
  if (extra.length === 0) return where;
  const existingAnd = (where as { AND?: unknown }).AND;
  const andArr = Array.isArray(existingAnd) ? existingAnd : existingAnd ? [existingAnd] : [];
  return { ...where, AND: [...andArr, ...extra] };
}

// ==========================================
// 1. LIST EVENTS (Public)
// ==========================================

eventRoutes.get("/", optionalAuthMiddleware, validate(eventQuerySchema, "query"), async (c) => {
  const q = c.get("validated");
  const user = c.get("user");
  const page = q.page as number;
  const limit = q.limit as number;

  // Public discovery never exposes another organizer's private or internal event.
  const where: any = { ...publicScope("event") };

  if (q.search) {
    where.OR = [
      { title: { contains: q.search } },
      { description: { contains: q.search } },
    ];
  }

if (q.communityId) where.communityId = q.communityId;
  if (q.organizationId) where.organizationId = q.organizationId;
  if (q.categoryId) where.categories = { some: { categoryId: q.categoryId } };
  if (q.locationType) where.locationType = q.locationType;
  if (q.status && (PUBLIC_EVENT_STATUSES as readonly string[]).includes(q.status)) {
    where.status = q.status;
  }

  if (q.upcoming) {
    where.eventDate = { gte: new Date() };
  }

  const hidden = await hiddenEventListEntityIds(user?.id);
  const visibleWhere = withEventListVisibility(where, hidden);

  const orderBy: any =
    q.orderBy === "eventDate"
      ? { eventDate: q.sort as "asc" | "desc" }
      : { [q.orderBy]: q.sort };

  const [events, total] = await Promise.all([
    prisma.event.findMany({
      where: visibleWhere,
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
    prisma.event.count({ where: visibleWhere }),
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
       canRegister: e.status === "REGISTRATION_OPEN",
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
// POPULAR UPCOMING EVENTS (Public)
// ==========================================

eventRoutes.get("/popular/upcoming", optionalAuthMiddleware, async (c) => {
  const user = c.get("user");
  const hidden = await hiddenEventListEntityIds(user?.id);
  const eventWhere: Prisma.EventWhereInput = withEventListVisibility(
    {
      ...publicScope("event", { statuses: ["SUBMITTED", "IN_REVIEW", "PUBLISHED", "REGISTRATION_OPEN", "REGISTRATION_CLOSED"] }),
      eventDate: { gte: new Date() },
    },
    hidden
  );
  const ranked = await prisma.eventRegistration.groupBy({
    by: ["eventId"],
    where: { status: "CONFIRMED", event: eventWhere },
    _count: { _all: true },
    orderBy: { _count: { eventId: "desc" } },
    take: 6,
  });
  const rankedIds = ranked.map((item) => item.eventId);
  const fallback = rankedIds.length < 6
    ? await prisma.event.findMany({
        where: { ...eventWhere, id: { notIn: rankedIds } },
        select: { id: true },
        orderBy: { eventDate: "asc" },
        take: 6 - rankedIds.length,
      })
    : [];
  const orderedIds = [...rankedIds, ...fallback.map((event) => event.id)];
  const events = await prisma.event.findMany({
    where: { id: { in: orderedIds } },
    include: {
      community: { select: { id: true, name: true, slug: true, logo: true } },
      organization: { select: { id: true, name: true, slug: true, logo: true } },
      categories: { include: { category: true } },
      _count: { select: { registrations: { where: { status: "CONFIRMED" } } } },
    },
  });
  const eventOrder = new Map(orderedIds.map((id, index) => [id, index]));
  events.sort((a, b) => (eventOrder.get(a.id) ?? 0) - (eventOrder.get(b.id) ?? 0));

  return c.json({
    success: true,
    data: events.map((event) => ({
      id: event.id,
      title: event.title,
      slug: event.slug,
      description: event.description,
      coverImage: event.coverImage,
      thumbnail: event.thumbnail,
      location: event.location,
      locationType: event.locationType,
      eventDate: event.eventDate,
      quota: event.quota,
      status: event.status,
      registeredCount: event._count.registrations,
      community: event.community,
      organization: event.organization,
      categories: event.categories.map((item) => item.category),
    })),
  });
});

// ==========================================
// SAVED EVENTS
// ==========================================

eventRoutes.get("/my/saved", authMiddleware, async (c) => {
  const authUser = c.get("user");
  const url = new URL(c.req.url);
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1") || 1);
  const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get("limit") || "20") || 20));
  const where = { userId: authUser.id, event: activeScope("event") };

  const [savedEvents, total] = await Promise.all([
    prisma.eventSave.findMany({
      where,
      include: {
        event: {
          include: {
            community: { select: { id: true, name: true, slug: true } },
            organization: { select: { id: true, name: true, slug: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.eventSave.count({ where }),
  ]);

  return c.json({
    success: true,
    data: savedEvents.map((saved) => ({
      id: saved.event.id,
      title: saved.event.title,
      slug: saved.event.slug,
      eventDate: saved.event.eventDate,
      endDate: saved.event.endDate,
      status: saved.event.status,
      location: saved.event.location,
      locationType: saved.event.locationType,
      coverImage: saved.event.coverImage,
      community: saved.event.community,
      organization: saved.event.organization,
      savedAt: saved.createdAt,
    })),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});

// ==========================================
// FEATURED EVENTS (Public) - newest published
// ==========================================

eventRoutes.get("/featured", optionalAuthMiddleware, async (c) => {
  const user = c.get("user");
  const hidden = await hiddenEventListEntityIds(user?.id);
  const events = await prisma.event.findMany({
    where: withEventListVisibility(
      publicScope("event", { statuses: ["SUBMITTED", "IN_REVIEW", "PUBLISHED", "REGISTRATION_OPEN"] }),
      hidden
    ),
    include: {
      community: { select: { id: true, name: true, slug: true, logo: true } },
      organization: { select: { id: true, name: true, slug: true, logo: true } },
      categories: { include: { category: true } },
      _count: { select: { registrations: { where: { status: "CONFIRMED" } } } },
    },
    orderBy: { createdAt: "desc" },
    take: 6,
  });
  return c.json({
    success: true,
    data: events.map((event) => ({
      id: event.id,
      title: event.title,
      slug: event.slug,
      description: event.description,
      coverImage: event.coverImage,
      thumbnail: event.thumbnail,
      location: event.location,
      locationType: event.locationType,
      eventDate: event.eventDate,
      quota: event.quota,
      status: event.status,
      registeredCount: event._count.registrations,
      community: event.community,
      organization: event.organization,
      categories: event.categories.map((item) => item.category),
    })),
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
      agendas: { orderBy: { startTime: "asc" as const } },
      speakers: true,
      tickets: { orderBy: { price: "asc" as const } },
      _count: { select: { registrations: { where: { status: "CONFIRMED" } } } },
    },
  });

  if (!event || event.deletedAt) {
    return c.json({ success: false, message: "Event tidak ditemukan" }, 404);
  }

  const role = user ? await getEventOrganizerRole(user.id, event) : null;
  const isOrganizer = user ? await canManageEvent(role, user.id, event) : false;
  const isPublicEvent = event.visibility === "PUBLIC" && (PUBLIC_EVENT_STATUSES as readonly string[]).includes(event.status);
  if (!isPublicEvent && !isOrganizer) {
    return c.json({ success: false, message: "Event tidak ditemukan" }, 404);
  }

  let userRegistration = null;
  let isSaved = false;
  let waitlistCount = 0;
  if (user) {
    [userRegistration, isSaved, waitlistCount] = await Promise.all([
      prisma.eventRegistration.findUnique({
        where: { eventId_userId: { eventId: event.id, userId: user.id } },
      }),
      prisma.eventSave.findUnique({
        where: { eventId_userId: { eventId: event.id, userId: user.id } },
      }).then(Boolean),
      prisma.eventRegistration.count({
        where: { eventId: event.id, status: "WAITLISTED" },
      }),
    ]);
  } else {
    waitlistCount = await prisma.eventRegistration.count({
      where: { eventId: event.id, status: "WAITLISTED" },
    });
  }

  const galleryParsed = (() => {
    try {
      return event.gallery ? JSON.parse(event.gallery as string) : [];
    } catch {
      return [];
    }
  })();

  return c.json({
    success: true,
    data: {
      ...event,
      registrations: undefined,
      gallery: galleryParsed,
      registeredCount: event._count.registrations,
      waitlistCount,
      registeredUsers: isOrganizer
        ? event.registrations.map((r) => ({
            id: r.user.id,
            name: r.user.name,
            avatar: r.user.avatar,
            status: r.status,
            attendance: r.attendance,
            registeredAt: r.registeredAt,
          }))
        : undefined,
      categories: event.categories.map((c) => c.category),
      userRegistration: userRegistration
        ? {
            id: userRegistration.id,
            status: userRegistration.status,
            attendance: userRegistration.attendance,
            registeredAt: userRegistration.registeredAt,
          }
        : null,
      isSaved,
    },
  });
});

eventRoutes.post("/:eventId/save", authMiddleware, async (c) => {
  const authUser = c.get("user");
  const eventId = c.req.param("eventId") as string;
  const event = await prisma.event.findFirst({
    where: { id: eventId, ...activeScope("event") },
    select: { id: true },
  });

  if (!event) {
    return c.json({ success: false, message: "Event tidak ditemukan" }, 404);
  }

  await prisma.eventSave.upsert({
    where: { eventId_userId: { eventId, userId: authUser.id } },
    create: { eventId, userId: authUser.id },
    update: {},
  });

  return c.json({ success: true, message: "Event berhasil disimpan" });
});

eventRoutes.delete("/:eventId/save", authMiddleware, async (c) => {
  const authUser = c.get("user");
  const eventId = c.req.param("eventId") as string;
  await prisma.eventSave.deleteMany({
    where: { eventId, userId: authUser.id },
  });

  return c.json({ success: true, message: "Event dihapus dari daftar tersimpan" });
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
    const isSA = await isSuperAdmin(authUser.id);
    if (!isSA && (!membership || membership.status !== "ACTIVE" || membership.deletedAt !== null || !["OWNER", "ADMIN", "EVENT_MANAGER"].includes(membership.role))) {
      return c.json({ success: false, message: "Tidak memiliki akses membuat event di komunitas ini" }, 403);
    }
  }

  if (data.organizationId) {
    const membership = await prisma.organizationMember.findUnique({
      where: { organizationId_userId: { organizationId: data.organizationId, userId: authUser.id } },
    });
    const isSA = await isSuperAdmin(authUser.id);
    if (!isSA && (!membership || membership.status !== "ACTIVE" || membership.deletedAt !== null || !["OWNER", "ADMIN"].includes(membership.role))) {
      return c.json({ success: false, message: "Tidak memiliki akses membuat event di organisasi ini" }, 403);
    }
  }

  const { categoryIds, gallery, agendas, speakers, tickets, ...eventData } = data;

  const sanitizedEventData = {
    ...eventData,
    title: sanitizeText(eventData.title),
    description: sanitizeText(eventData.description),
    location: sanitizeText(eventData.location),
    contactName: sanitizeText(eventData.contactName),
    contactEmail: sanitizeText(eventData.contactEmail),
    contactPhone: sanitizeText(eventData.contactPhone),
  };

  const event = await createWithUniqueSlug(
    (slug) =>
      prisma.$transaction(async (tx) => {
        const createdEvent = await tx.event.create({
          data: {
            ...sanitizedEventData,
            slug,
            createdById: authUser.id,
            eventDate: new Date(data.eventDate),
            endDate: data.endDate ? new Date(data.endDate) : null,
            gallery: gallery ? JSON.stringify(gallery) : null,
            categories: categoryIds
              ? { create: categoryIds.map((categoryId: string) => ({ categoryId })) }
              : undefined,
          },
          select: { id: true },
        });

        if (agendas?.length) {
          await tx.eventAgenda.createMany({
            data: agendas.map((agenda: { session: string; description?: string; startTime?: string; endTime?: string; room?: string; speakerName?: string }) => ({
              eventId: createdEvent.id,
              session: sanitizeText(agenda.session),
              description: agenda.description ? sanitizeText(agenda.description) : null,
              startTime: agenda.startTime ? new Date(agenda.startTime) : null,
              endTime: agenda.endTime ? new Date(agenda.endTime) : null,
              room: agenda.room ? sanitizeText(agenda.room) : null,
              speakerName: agenda.speakerName ? sanitizeText(agenda.speakerName) : null,
              createdById: authUser.id,
            })),
          });
        }

        if (speakers?.length) {
          await tx.eventSpeaker.createMany({
            data: speakers.map((speaker: { name: string; photo?: string; bio?: string; position?: string; institution?: string; socialMedia?: string; topic?: string; material?: string }) => ({
              eventId: createdEvent.id,
              name: sanitizeText(speaker.name),
              photo: speaker.photo || null,
              bio: speaker.bio ? sanitizeText(speaker.bio) : null,
              position: speaker.position ? sanitizeText(speaker.position) : null,
              institution: speaker.institution ? sanitizeText(speaker.institution) : null,
              socialMedia: speaker.socialMedia || null,
              topic: speaker.topic ? sanitizeText(speaker.topic) : null,
              material: speaker.material || null,
            })),
          });
        }

        if (tickets?.length) {
          await tx.eventTicket.createMany({
            data: tickets.map((ticket: { name: string; description?: string; price: number; quota?: number | null }) => ({
              eventId: createdEvent.id,
              name: sanitizeText(ticket.name),
              description: ticket.description ? sanitizeText(ticket.description) : null,
              price: ticket.price,
              quota: ticket.quota ?? null,
            })),
          });
        }

        const fetched = await tx.event.findUnique({
          where: { id: createdEvent.id },
          include: {
            community: { select: { id: true, name: true, slug: true } },
            organization: { select: { id: true, name: true, slug: true } },
            categories: { include: { category: true } },
          },
        });
        if (!fetched) throw new Error("Event creation failed");
        return fetched;
      }),
    data.title
  );

  await createAuditLog({
    userId: authUser.id,
    actionType: AuditActions.EVENT_CREATE,
    resourceName: "Event",
    resourceId: event.id,
    afterData: { title: event.title, slug: event.slug, status: event.status },
  });

  const submitted = await transitionEvent(event, "SUBMITTED", authUser.id, { submittedAt: new Date() });
  const queued = await transitionEvent(submitted, "IN_REVIEW", authUser.id, { reason: "Event masuk antrean review" });
  const admins = await prisma.userRole.findMany({ where: { role: "SUPER_ADMIN" }, include: { user: { select: { email: true } } } });
  if (admins.length) {
    await prisma.notification.createMany({
      data: admins.map((admin) => ({ userId: admin.userId, title: "Event Baru Menunggu Review", message: `Event "${event.title}" telah dikirim untuk review.`, type: "APPROVAL" as const, link: `/admin/events/events` })),
    });
    await sendEmail({ to: admins.map((admin) => admin.user.email), subject: `Event baru menunggu review: ${event.title}`, html: `<p>Event <strong>${event.title}</strong> telah dikirim untuk review.</p><p><a href="${process.env.APP_URL || "http://localhost:3000"}/admin/events/events">Buka antrean event</a></p>` });
  }

  return c.json({
    success: true,
    message: "Event berhasil dibuat",
    data: {
      id: event.id,
      title: event.title,
      slug: event.slug,
        status: queued.status,
        canRegister: false,
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
  if (!await canManageEvent(role, authUser.id, event)) {
    return c.json({ success: false, message: "Tidak memiliki akses mengubah event ini" }, 403);
  }

  if (["COMPLETED", "CANCELLED", "ARCHIVED"].includes(event.status)) {
    return c.json({ success: false, message: "Event yang sudah selesai/dibatalkan/diarsipkan tidak dapat diubah" }, 400);
  }

  const { categoryIds, gallery, agendas, speakers, tickets, ...updateData } = data;

  const updateDataAny = updateData as Record<string, unknown>;
  const hasCommunityChange = Object.hasOwn(updateDataAny, "communityId");
  const hasOrganizationChange = Object.hasOwn(updateDataAny, "organizationId");
  const targetCommunityId = hasCommunityChange
    ? updateDataAny.communityId as string | undefined
    : hasOrganizationChange ? undefined : event.communityId;
  const targetOrganizationId = hasOrganizationChange
    ? updateDataAny.organizationId as string | undefined
    : hasCommunityChange ? undefined : event.organizationId;
  if ((targetCommunityId ? 1 : 0) + (targetOrganizationId ? 1 : 0) !== 1) {
    return c.json({ success: false, message: "Event hanya boleh dimiliki oleh satu penyelenggara" }, 400);
  }

  if (hasCommunityChange && targetCommunityId !== event.communityId) {
    const membership = await prisma.communityMember.findUnique({
      where: { communityId_userId: { communityId: targetCommunityId!, userId: authUser.id } },
    });
    const isSA = await isSuperAdmin(authUser.id);
    if (!isSA && (!membership || membership.status !== "ACTIVE" || membership.deletedAt !== null || !["OWNER", "ADMIN", "EVENT_MANAGER"].includes(membership.role))) {
      return c.json({ success: false, message: "Tidak memiliki akses memindahkan event ke komunitas ini" }, 403);
    }
  }

  if (hasOrganizationChange && targetOrganizationId !== event.organizationId) {
    const membership = await prisma.organizationMember.findUnique({
      where: { organizationId_userId: { organizationId: targetOrganizationId!, userId: authUser.id } },
    });
    const isSA = await isSuperAdmin(authUser.id);
    if (!isSA && (!membership || membership.status !== "ACTIVE" || membership.deletedAt !== null || !["OWNER", "ADMIN"].includes(membership.role))) {
      return c.json({ success: false, message: "Tidak memiliki akses memindahkan event ke organisasi ini" }, 403);
    }
  }

  const sanitizedUpdateData = {
    ...updateData,
    title: sanitizeText(updateData.title),
    description: sanitizeText(updateData.description),
    location: sanitizeText(updateData.location),
    contactName: sanitizeText(updateData.contactName),
    contactEmail: sanitizeText(updateData.contactEmail),
    contactPhone: sanitizeText(updateData.contactPhone),
  };

  const updated = await prisma.$transaction(async (tx) => {
    const updatedEvent = await tx.event.update({
      where: { id: eventId },
      data: {
        ...sanitizedUpdateData,
        communityId: hasCommunityChange || hasOrganizationChange ? targetCommunityId ?? null : undefined,
        organizationId: hasCommunityChange || hasOrganizationChange ? targetOrganizationId ?? null : undefined,
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
      await tx.eventCategory.deleteMany({ where: { eventId } });
      if (categoryIds.length > 0) {
        await tx.eventCategory.createMany({
          data: categoryIds.map((categoryId: string) => ({ eventId, categoryId })),
        });
      }
    }

    if (agendas !== undefined) {
      await tx.eventAgenda.deleteMany({ where: { eventId } });
      if (agendas.length > 0) {
        await tx.eventAgenda.createMany({
          data: agendas.map((agenda: { session: string; description?: string; startTime?: string; endTime?: string; room?: string; speakerName?: string }) => ({
            eventId,
            session: sanitizeText(agenda.session),
            description: agenda.description ? sanitizeText(agenda.description) : null,
            startTime: agenda.startTime ? new Date(agenda.startTime) : null,
            endTime: agenda.endTime ? new Date(agenda.endTime) : null,
            room: agenda.room ? sanitizeText(agenda.room) : null,
            speakerName: agenda.speakerName ? sanitizeText(agenda.speakerName) : null,
            createdById: authUser.id,
          })),
        });
      }
    }

    if (speakers !== undefined) {
      await tx.eventSpeaker.deleteMany({ where: { eventId } });
      if (speakers.length > 0) {
        await tx.eventSpeaker.createMany({
          data: speakers.map((speaker: { name: string; photo?: string; bio?: string; position?: string; institution?: string; socialMedia?: string; topic?: string; material?: string }) => ({
            eventId,
            name: sanitizeText(speaker.name),
            photo: speaker.photo || null,
            bio: speaker.bio ? sanitizeText(speaker.bio) : null,
            position: speaker.position ? sanitizeText(speaker.position) : null,
            institution: speaker.institution ? sanitizeText(speaker.institution) : null,
            socialMedia: speaker.socialMedia || null,
            topic: speaker.topic ? sanitizeText(speaker.topic) : null,
            material: speaker.material || null,
          })),
        });
      }
    }

    if (tickets !== undefined) {
      await tx.eventTicket.deleteMany({ where: { eventId } });
      if (tickets.length > 0) {
        await tx.eventTicket.createMany({
          data: tickets.map((ticket: { name: string; description?: string; price: number; quota?: number | null }) => ({
            eventId,
            name: sanitizeText(ticket.name),
            description: ticket.description ? sanitizeText(ticket.description) : null,
            price: ticket.price,
            quota: ticket.quota ?? null,
          })),
        });
      }
    }

    return updatedEvent;
  });

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
  if (!await canManageEvent(role, authUser.id, event)) {
    return c.json({ success: false, message: "Tidak memiliki akses menghapus event ini" }, 403);
  }

  if (!["DRAFT", "CANCELLED", "COMPLETED"].includes(event.status)) {
    return c.json({ success: false, message: `Tidak dapat menghapus event dari status ${event.status}. Gunakan cancel terlebih dahulu.` }, 400);
  }

  await prisma.event.update({
    where: { id: eventId },
    data: { deletedAt: new Date() },
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
// 6. SUBMIT EVENT FOR REVIEW
// ==========================================

eventRoutes.post("/:eventId/submit", authMiddleware, async (c) => {
  const authUser = c.get("user");
  const eventId = c.req.param("eventId") as string;

  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event || event.deletedAt) {
    return c.json({ success: false, message: "Event tidak ditemukan" }, 404);
  }

  const role = await getEventOrganizerRole(authUser.id, event);
  if (!await canManageEvent(role, authUser.id, event)) {
    return c.json({ success: false, message: "Tidak memiliki akses mengirim event ini" }, 403);
  }

  const targetStatus = event.status === "REVISION_REQUESTED" ? "RESUBMITTED" : "SUBMITTED";
  if (!isValidTransition(event.status, targetStatus)) {
    return c.json({ success: false, message: `Tidak dapat mengirim event dari status ${event.status}` }, 400);
  }

  const updated = await transitionEvent(event, targetStatus, authUser.id, { submittedAt: new Date(), reviewNote: null, reviewedAt: null, reviewedById: null });

  return c.json({
    success: true,
    message: targetStatus === "RESUBMITTED" ? "Event berhasil dikirim ulang untuk ditinjau" : "Event berhasil dikirim untuk ditinjau",
    data: { id: updated.id, status: updated.status },
  });
});

// ==========================================
// 7. REVIEW EVENT
// ==========================================

eventRoutes.post("/:eventId/review", authMiddleware, requireSuperAdmin(), validate(reviewEventSchema), async (c) => {
  const reviewer = c.get("user");
  const event = await prisma.event.findUnique({ where: { id: c.req.param("eventId") as string } });
  const { action, note } = c.get("validated");
  if (!event || event.deletedAt) return c.json({ success: false, message: "Event tidak ditemukan" }, 404);
  if (event.createdById === reviewer.id) return c.json({ success: false, message: "Reviewer tidak dapat mereview event miliknya sendiri" }, 403);

  const targetStatus = action === "APPROVE" ? "APPROVED" : action === "REJECT" ? "REJECTED" : "REVISION_REQUESTED";
  const allowed = event.status === "SUBMITTED" || event.status === "RESUBMITTED";
  if (!allowed) return c.json({ success: false, message: "Event tidak dalam antrean review" }, 400);

  const inReview = await transitionEvent(event, "IN_REVIEW", reviewer.id, { reviewedAt: new Date(), reviewedById: reviewer.id });
  const updated = await transitionEvent(inReview, targetStatus, reviewer.id, {
    reviewedAt: new Date(),
    reviewedById: reviewer.id,
    reviewNote: note || null,
    reason: note,
  });

  return c.json({ success: true, message: "Review event berhasil disimpan", data: { id: updated.id, status: updated.status } });
});

// ==========================================
// 8. PUBLISH EVENT
// ==========================================

eventRoutes.post("/:eventId/publish", authMiddleware, requireSuperAdmin(), async (c) => {
  const authUser = c.get("user");
  const eventId = c.req.param("eventId") as string;
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event || event.deletedAt) return c.json({ success: false, message: "Event tidak ditemukan" }, 404);
  if (!isValidTransition(event.status, "PUBLISHED")) return c.json({ success: false, message: `Tidak dapat publish dari status ${event.status}` }, 400);
  const updated = await transitionEvent(event, "PUBLISHED", authUser.id, { auditAction: AuditActions.EVENT_PUBLISH });
  return c.json({ success: true, message: "Event berhasil dipublikasikan", data: { id: updated.id, status: updated.status } });
});

// ==========================================
// 9. OPEN REGISTRATION
// ==========================================

eventRoutes.post("/:eventId/open-registration", authMiddleware, async (c) => {
  const authUser = c.get("user");
  const eventId = c.req.param("eventId") as string;

  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event || event.deletedAt) {
    return c.json({ success: false, message: "Event tidak ditemukan" }, 404);
  }

  const role = await getEventOrganizerRole(authUser.id, event);
  if (!await canManageEvent(role, authUser.id, event)) {
    return c.json({ success: false, message: "Tidak memiliki akses" }, 403);
  }

  if (!isValidTransition(event.status, "REGISTRATION_OPEN")) {
    return c.json({ success: false, message: `Tidak dapat membuka registrasi dari status ${event.status}` }, 400);
  }

  const updated = await transitionEvent(event, "REGISTRATION_OPEN", authUser.id, { auditAction: AuditActions.EVENT_PUBLISH });

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
  if (!await canManageEvent(role, authUser.id, event)) {
    return c.json({ success: false, message: "Tidak memiliki akses" }, 403);
  }

  if (!isValidTransition(event.status, "REGISTRATION_CLOSED")) {
    return c.json({ success: false, message: `Tidak dapat menutup registrasi dari status ${event.status}` }, 400);
  }

  const updated = await transitionEvent(event, "REGISTRATION_CLOSED", authUser.id, { auditAction: AuditActions.EVENT_PUBLISH });

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
  if (!await canManageEvent(role, authUser.id, event)) {
    return c.json({ success: false, message: "Tidak memiliki akses" }, 403);
  }

  if (!isValidTransition(event.status, "ONGOING")) {
    return c.json({ success: false, message: `Tidak dapat memulai event dari status ${event.status}` }, 400);
  }

  const updated = await transitionEvent(event, "ONGOING", authUser.id, { auditAction: AuditActions.EVENT_PUBLISH });

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
  if (!await canManageEvent(role, authUser.id, event)) {
    return c.json({ success: false, message: "Tidak memiliki akses" }, 403);
  }

  if (!isValidTransition(event.status, "COMPLETED")) {
    return c.json({ success: false, message: `Tidak dapat menyelesaikan event dari status ${event.status}` }, 400);
  }

  const updated = await transitionEvent(event, "COMPLETED", authUser.id, { auditAction: AuditActions.EVENT_PUBLISH });

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
  if (!await canManageEvent(role, authUser.id, event)) {
    return c.json({ success: false, message: "Tidak memiliki akses membatalkan event ini" }, 403);
  }

  if (!isValidTransition(event.status, "CANCELLED")) {
    return c.json({ success: false, message: `Tidak dapat membatalkan event dari status ${event.status}` }, 400);
  }

  // transitionEvent's CANCELLED cascade (inside the same guarded transaction)
  // already cancels active registrations and notifies those registrants.
  const updated = await transitionEvent(event, "CANCELLED", authUser.id, { reason: "Event dibatalkan" });

  // Cascade: cancel volunteer opportunities tied to this event and
  // reject pending/accepted volunteer applications (audit trail preserved).
  const opportunities = await prisma.volunteerOpportunity.findMany({
    where: { eventId, ...activeScope("volunteerOpportunity") },
  });
  if (opportunities.length > 0) {
    const opportunityIds = opportunities.map((o) => o.id);

    await prisma.volunteerOpportunity.updateMany({
      where: { id: { in: opportunityIds } },
      data: { status: "CLOSED" },
    });

    const pendingApps = await prisma.volunteerApplication.findMany({
      where: { opportunityId: { in: opportunityIds }, status: { in: ["APPLIED", "REVIEWED", "ACCEPTED"] } },
    });

    if (pendingApps.length > 0) {
      await prisma.volunteerApplication.updateMany({
        where: { opportunityId: { in: opportunityIds }, status: { in: ["APPLIED", "REVIEWED", "ACCEPTED"] } },
        data: {
          status: "REJECTED",
          reviewNote: "Event dibatalkan oleh penyelenggara.",
          reviewedAt: new Date(),
          reviewedById: authUser.id,
        },
      });

      await prisma.notification.createMany({
        data: pendingApps.map((a) => ({
          userId: a.userId,
          title: "Event Dibatalkan",
          message: `Event "${event.title}" telah dibatalkan. Pendaftaran volunteer Anda dibatalkan.`,
          type: "EVENT" as const,
          link: `/events/${event.slug}`,
        })),
      });
    }
  }

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
  if (!await canManageEvent(role, authUser.id, event)) {
    return c.json({ success: false, message: "Tidak memiliki akses mengarsipkan event ini" }, 403);
  }

  if (!isValidTransition(event.status, "ARCHIVED")) {
    return c.json({ success: false, message: `Tidak dapat mengarsipkan event dari status ${event.status}` }, 400);
  }

  const updated = await transitionEvent(event, "ARCHIVED", authUser.id);

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
  if (!await canManageEvent(role, authUser.id, event)) {
    return c.json({ success: false, message: "Tidak memiliki akses menduplikasi event ini" }, 403);
  }

  const newEvent = await createWithUniqueSlug(
    (slug) =>
      prisma.event.create({
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
    }),
    `${event.title} copy`
  );

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

  const registration = await prisma.$transaction(async (tx) => {
    const lockedRows = await tx.$queryRaw<Array<{ quota: number; status: string; allowWaitlist: boolean; registrationOpensAt: Date | null; registrationDeadline: Date | null; deletedAt: Date | null }>>`
      SELECT \`quota\`, \`status\`, \`allowWaitlist\`, \`registrationOpensAt\`, \`registrationDeadline\`, \`deletedAt\`
      FROM \`events\` WHERE \`id\` = ${eventId} FOR UPDATE
    `;
    const lockedEvent = lockedRows[0];
    if (!lockedEvent || lockedEvent.deletedAt) return { code: "EVENT_NOT_FOUND" };
    if (lockedEvent.status !== "REGISTRATION_OPEN") return { code: "REGISTRATION_NOT_OPEN" };
    const now = new Date();
    if (lockedEvent.registrationOpensAt && lockedEvent.registrationOpensAt > now) return { code: "REGISTRATION_NOT_OPEN" };
    if (lockedEvent.registrationDeadline && lockedEvent.registrationDeadline < now) return { code: "REGISTRATION_DEADLINE_PASSED" };

    const existing = await tx.eventRegistration.findUnique({ where: { eventId_userId: { eventId, userId: authUser.id } } });
    if (existing && ["CONFIRMED", "PENDING", "WAITLISTED"].includes(existing.status)) return { code: "EVENT_ALREADY_REGISTERED" };
    if (existing?.status === "CANCELLED") await tx.eventRegistration.delete({ where: { id: existing.id } });

    const confirmedCount = await tx.eventRegistration.count({
      where: { eventId, status: "CONFIRMED" },
    });

    const quota = lockedEvent.quota;
    const isFull = confirmedCount >= quota;
    let registrationStatus = "CONFIRMED";

    if (isFull) {
      if (!lockedEvent.allowWaitlist) return { code: "QUOTA_FULL" };
      registrationStatus = "WAITLISTED";
    }

    const created = await tx.eventRegistration.create({
      data: {
        eventId,
        userId: authUser.id,
        status: registrationStatus as any,
      },
    });
    return { registration: created };
  }).catch((error: any) => error?.code === "P2002" ? { code: "EVENT_ALREADY_REGISTERED" } : Promise.reject(error));

  if ("code" in registration) {
    const messages: Record<string, string> = {
      EVENT_NOT_FOUND: "Event tidak ditemukan",
      REGISTRATION_NOT_OPEN: "Registrasi event belum dibuka",
      REGISTRATION_DEADLINE_PASSED: "Batas registrasi event sudah lewat",
      EVENT_ALREADY_REGISTERED: "Sudah terdaftar di event ini",
      QUOTA_FULL: "Kuota event penuh",
    };
    const code = (registration as { code: string }).code;
    const status = ["EVENT_ALREADY_REGISTERED", "QUOTA_FULL"].includes(code) ? 409 : code === "EVENT_NOT_FOUND" ? 404 : 400;
    return c.json({ success: false, code, message: messages[code] || "Registrasi tidak dapat diproses" }, status);
  }

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
    afterData: { status: registration.registration.status },
  });

  try {
    await prisma.activityHistory.create({
      data: {
        userId: authUser.id,
        action: "EVENT_REGISTER",
        details: { eventId, eventTitle: event.title, status: registration.registration.status },
      },
    });
  } catch {
    // Registration is already committed; activity history must not turn success into an error.
  }

  return c.json({
    success: true,
    message: registration.registration.status === "WAITLISTED"
      ? "Berhasil masuk waiting list"
      : "Berhasil mendaftar event",
    data: {
      registrationId: registration.registration.id,
      status: registration.registration.status,
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
    const waitlistResult = await prisma.$transaction(async (tx) => {
      const waitlisted = await tx.eventRegistration.findFirst({
        where: { eventId, status: "WAITLISTED" },
        orderBy: { registeredAt: "asc" },
      });

      if (waitlisted) {
        await tx.eventRegistration.update({
          where: { id: waitlisted.id },
          data: { status: "CONFIRMED" },
        });
        return waitlisted;
      }
      return null;
    });

    if (waitlistResult) {
      await prisma.notification.create({
        data: {
          userId: waitlistResult.userId,
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
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1") || 1);
  const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get("limit") || "20") || 20));
  const search = url.searchParams.get("search") || "";
  const status = url.searchParams.get("status") || "";

  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event || event.deletedAt) {
    return c.json({ success: false, message: "Event tidak ditemukan" }, 404);
  }

  const role = await getEventOrganizerRole(authUser.id, event);
  if (!await canManageEvent(role, authUser.id, event)) {
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
// 17. BULK CHECK IN PARTICIPANTS
// ==========================================

eventRoutes.post("/:eventId/participants/bulk-check-in", authMiddleware, async (c) => {
  const authUser = c.get("user");
  const eventId = c.req.param("eventId") as string;
  const body = await c.req.json().catch(() => null) as { participantIds?: unknown } | null;
  const participantIds = body?.participantIds;
  if (!Array.isArray(participantIds) || participantIds.length === 0 || participantIds.length > 100 || participantIds.some((id) => typeof id !== "string" || !id)) {
    return c.json({ success: false, code: "INVALID_PARTICIPANT_IDS", message: "Pilih 1 sampai 100 peserta yang valid" }, 400);
  }
  const ids = [...new Set(participantIds)];
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event || event.deletedAt) return c.json({ success: false, message: "Event tidak ditemukan" }, 404);
  const role = await getEventOrganizerRole(authUser.id, event);
  if (!await canManageEvent(role, authUser.id, event)) return c.json({ success: false, message: "Tidak memiliki akses" }, 403);
  if (event.status !== "ONGOING") return c.json({ success: false, code: "EVENT_NOT_ONGOING", message: "Check-in hanya dapat dilakukan saat event berlangsung" }, 400);

  const result = await prisma.$transaction(async (tx) => {
    const registrations = await tx.eventRegistration.findMany({ where: { id: { in: ids }, eventId }, select: { id: true, status: true, attendance: true, userId: true } });
    const byId = new Map(registrations.map((registration) => [registration.id, registration]));
    const checkInIds = registrations.filter((registration) => registration.status === "CONFIRMED" && registration.attendance === "NOT_CHECKED_IN").map((registration) => registration.id);
    if (checkInIds.length) {
      await tx.eventRegistration.updateMany({ where: { id: { in: checkInIds }, eventId, status: "CONFIRMED", attendance: "NOT_CHECKED_IN" }, data: { attendance: "CHECKED_IN", checkedInAt: new Date() } });
      await tx.auditLog.createMany({ data: checkInIds.map((id) => ({ userId: authUser.id, actionType: AuditActions.EVENT_CHECK_IN, resourceName: "EventRegistration", resourceId: id, afterData: { bulk: true, eventId } as any })) });
    }
    return ids.map((id) => {
      const registration = byId.get(id);
      if (!registration) return { id, status: "NOT_FOUND" };
      if (registration.status !== "CONFIRMED") return { id, status: "SKIPPED", reason: "REGISTRATION_NOT_CONFIRMED" };
      if (registration.attendance !== "NOT_CHECKED_IN") return { id, status: "UNCHANGED", reason: "ALREADY_CHECKED_IN" };
      return { id, status: "CHECKED_IN" };
    });
  });
  return c.json({ success: true, data: { results: result, checkedIn: result.filter((entry) => entry.status === "CHECKED_IN").length } });
});

// ==========================================
// 18. CHECK IN PARTICIPANT
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
  if (!await canManageEvent(role, authUser.id, event)) {
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
// 19. CHECK OUT PARTICIPANT
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
  if (!await canManageEvent(role, authUser.id, event)) {
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
  if (!await canManageEvent(role, authUser.id, event)) {
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

  const approveResult = await prisma.$transaction(async (tx) => {
    const lockedRows = await tx.$queryRaw<{ quota: number }[]>`
      SELECT \`quota\` FROM \`events\` WHERE \`id\` = ${eventId} FOR UPDATE
    `;

    const lockedEvent = lockedRows[0];
    if (!lockedEvent) {
      return { notFound: true as const };
    }

    const confirmedCount = await tx.eventRegistration.count({
      where: { eventId, status: "CONFIRMED" },
    });

    const isFull = confirmedCount >= lockedEvent.quota;

    if (isFull && !event.allowWaitlist) {
      return { full: true as const };
    }

    const targetStatus = isFull ? "WAITLISTED" : "CONFIRMED";

    const updated = await tx.eventRegistration.update({
      where: { id: participantId },
      data: { status: targetStatus },
    });

    return { full: false as const, updated, waitlisted: isFull };
  });

  if (approveResult.notFound) {
    return c.json({ success: false, message: "Event tidak ditemukan" }, 404);
  }
  if (approveResult.full) {
    return c.json({ success: false, message: "Kuota event sudah penuh" }, 400);
  }
  const updated = approveResult.updated;

  await prisma.notification.create({
    data: {
      userId: registration.userId,
      title: approveResult.waitlisted ? "Pendaftaran Masuk Daftar Tunggu" : "Pendaftaran Disetujui",
      message: approveResult.waitlisted
        ? `Kuota event "${event.title}" penuh. Pendaftaran Anda masuk daftar tunggu.`
        : `Pendaftaran Anda pada event "${event.title}" telah disetujui.`,
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
  if (!await canManageEvent(role, authUser.id, event)) {
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
  if (!await canManageEvent(role, authUser.id, event)) {
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
  if (!await canManageEvent(role, authUser.id, event)) {
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
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1") || 1);
  const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get("limit") || "20") || 20));
  const status = url.searchParams.get("status") || "";
  const monthParam = url.searchParams.get("month") || "";
  const communityId = url.searchParams.get("communityId") || "";

  const where: any = {
    createdById: authUser.id,
    ...activeScope("event"),
  };

  if (status) where.status = status;
  if (communityId) where.communityId = communityId;
  if (monthParam) {
    const [year, month] = monthParam.split("-").map(Number);
    if (year && month) {
      const startDate = new Date(Date.UTC(year, month - 1, 1));
      const endDate = new Date(Date.UTC(year, month, 1));
      where.eventDate = { gte: startDate, lt: endDate };
    }
  }

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
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1") || 1);
  const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get("limit") || "20") || 20));
  const status = url.searchParams.get("status") || "";
  const monthParam = url.searchParams.get("month") || "";
  const communityId = url.searchParams.get("communityId") || "";

  const where: any = {
    userId: authUser.id,
    event: activeScope("event"),
  };

  if (status) where.status = status;
  if (communityId) where.event = { ...where.event, communityId };
  if (monthParam) {
    const [year, month] = monthParam.split("-").map(Number);
    if (year && month) {
      const startDate = new Date(Date.UTC(year, month - 1, 1));
      const endDate = new Date(Date.UTC(year, month, 1));
      where.event = { ...where.event, eventDate: { gte: startDate, lt: endDate } };
    }
  }

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
