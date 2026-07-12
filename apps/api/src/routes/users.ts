import { Hono } from "hono";
import { prisma } from "@komunaid/database";
import { updateProfileSchema, paginationSchema } from "@komunaid/shared";
import { MAX_INTERESTS, COMMUNITY_STATUSES } from "@komunaid/constants";
import { authMiddleware } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { createAuditLog, AuditActions } from "../services/audit";
import { parsePagination, paginatedResponse } from "../lib/pagination";
import { sanitizeText } from "../lib/xss";
import type { AuthUser } from "../middleware/auth";

type Env = { Variables: { user: AuthUser; validated: any; userRoles: string[] } };

export const userRoutes = new Hono<Env>();

// ==========================================
// GET PROFILE
// ==========================================

userRoutes.get("/profile", authMiddleware, async (c) => {
  const authUser = c.get("user");

  const user = await prisma.user.findUnique({
    where: { id: authUser.id },
    include: {
      roles: true,
      interests: true,
      joinedCommunities: {
        include: {
          community: {
            select: { id: true, name: true, slug: true, logo: true, status: true },
          },
        },
      },
      organizationMembers: {
        include: {
          organization: {
            select: { id: true, name: true, slug: true, logo: true, status: true },
          },
        },
      },
      registeredEvents: {
        include: {
          event: {
            select: { id: true, title: true, slug: true, coverImage: true, eventDate: true, status: true },
          },
        },
        orderBy: { registeredAt: "desc" },
        take: 10,
      },
      notifications: {
        where: { isRead: false },
        take: 5,
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!user) {
    return c.json({ success: false, message: "User tidak ditemukan" }, 404);
  }

  const unreadCount = await prisma.notification.count({
    where: { userId: authUser.id, isRead: false },
  });

  return c.json({
    success: true,
    data: {
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        phone: user.phone,
        bio: user.bio,
        location: user.location,
        avatar: user.avatar,
        status: user.status,
        roles: user.roles.map((r) => r.role),
        interests: user.interests.map((i) => i.interest),
        communities: user.joinedCommunities.map((m) => ({
          id: m.community.id,
          name: m.community.name,
          slug: m.community.slug,
          logo: m.community.logo,
          role: m.role,
          status: m.community.status,
        })),
        organizations: user.organizationMembers.map((m) => ({
          id: m.organization.id,
          name: m.organization.name,
          slug: m.organization.slug,
          logo: m.organization.logo,
          role: m.role,
          status: m.organization.status,
        })),
        events: user.registeredEvents.map((r) => ({
          id: r.event.id,
          title: r.event.title,
          slug: r.event.slug,
          coverImage: r.event.coverImage,
          eventDate: r.event.eventDate,
          status: r.event.status,
          registrationStatus: r.status,
        })),
        unreadNotifications: unreadCount,
        createdAt: user.createdAt,
      },
    },
  });
});

// ==========================================
// UPDATE PROFILE
// ==========================================

userRoutes.put("/profile", authMiddleware, validate(updateProfileSchema), async (c) => {
  const authUser = c.get("user");
  const data = c.get("validated");

  const sanitizedData: Record<string, unknown> = {};
  if (data.name !== undefined) sanitizedData.name = sanitizeText(data.name) || data.name;
  if (data.phone !== undefined) sanitizedData.phone = data.phone;
  if (data.bio !== undefined) sanitizedData.bio = sanitizeText(data.bio);
  if (data.location !== undefined) sanitizedData.location = sanitizeText(data.location) || data.location;
  if (data.avatar !== undefined) sanitizedData.avatar = data.avatar;

  const before = await prisma.user.findUnique({
    where: { id: authUser.id },
    select: { name: true, phone: true, bio: true, location: true, avatar: true },
  });

  const updated = await prisma.user.update({
    where: { id: authUser.id },
    data: sanitizedData,
  });

  await createAuditLog({
    userId: authUser.id,
    actionType: AuditActions.USER_UPDATE_PROFILE,
    resourceName: "User",
    resourceId: authUser.id,
    beforeData: before,
    afterData: { name: updated.name, phone: updated.phone, bio: updated.bio, location: updated.location },
  });

  await prisma.activityHistory.create({
    data: {
      userId: authUser.id,
      action: "USER_UPDATE_PROFILE",
      details: { name: updated.name },
    },
  });

  return c.json({
    success: true,
    message: "Profile berhasil diupdate",
    data: {
      user: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        phone: updated.phone,
        bio: updated.bio,
        location: updated.location,
        avatar: updated.avatar,
      },
    },
  });
});

// ==========================================
// GET USER BY ID (Public)
// ==========================================

userRoutes.get("/:id", async (c) => {
  const id = c.req.param("id");

  const user = await prisma.user.findUnique({
    where: { id, deletedAt: null },
    select: {
      id: true,
      name: true,
      avatar: true,
      bio: true,
      location: true,
      createdAt: true,
      joinedCommunities: {
        select: {
          community: {
            select: { id: true, name: true, slug: true, logo: true },
          },
        },
        where: { community: { status: COMMUNITY_STATUSES.APPROVED } },
        take: 10,
      },
    },
  });

  if (!user) {
    return c.json({ success: false, message: "User tidak ditemukan" }, 404);
  }

  return c.json({ success: true, data: { user } });
});

// ==========================================
// UPDATE INTERESTS
// ==========================================

userRoutes.put("/interests", authMiddleware, async (c) => {
  const authUser = c.get("user");
  const body = await c.req.json();

  const { interests } = body as { interests: string[] };

  if (!Array.isArray(interests)) {
    return c.json({ success: false, message: "Interests harus berupa array" }, 400);
  }

  if (interests.length > MAX_INTERESTS) {
    return c.json({ success: false, message: `Maksimal ${MAX_INTERESTS} interests` }, 400);
  }

  const sanitizedInterests = interests
    .map((i) => sanitizeText(i))
    .filter((i): i is string => i !== null && i.length > 0);

  await prisma.userInterest.deleteMany({
    where: { userId: authUser.id },
  });

  if (sanitizedInterests.length > 0) {
    await prisma.userInterest.createMany({
      data: sanitizedInterests.map((interest) => ({
        userId: authUser.id,
        interest,
      })),
    });
  }

  await createAuditLog({
    userId: authUser.id,
    actionType: AuditActions.USER_UPDATE_INTERESTS,
    resourceName: "User",
    resourceId: authUser.id,
    afterData: { interests },
  });

  return c.json({
    success: true,
    message: "Interests berhasil diupdate",
    data: { interests },
  });
});

// ==========================================
// NOTIFICATIONS
// ==========================================

userRoutes.get("/notifications", authMiddleware, async (c) => {
  const authUser = c.get("user");
  const { page, limit } = parsePagination(c.req.url);
  const url = new URL(c.req.url);
  const unreadOnly = url.searchParams.get("unread") === "true";

  const where: Record<string, unknown> = { userId: authUser.id };
  if (unreadOnly) {
    where.isRead = false;
  }

  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.notification.count({ where }),
  ]);

  return c.json(paginatedResponse(notifications, total, page, limit));
});

// ==========================================
// MARK NOTIFICATION AS READ
// ==========================================

userRoutes.put("/notifications/:id/read", authMiddleware, async (c) => {
  const authUser = c.get("user");
  const id = c.req.param("id");

  const notification = await prisma.notification.findFirst({
    where: { id, userId: authUser.id },
  });

  if (!notification) {
    return c.json({ success: false, message: "Notification tidak ditemukan" }, 404);
  }

  await prisma.notification.update({
    where: { id },
    data: { isRead: true },
  });

  return c.json({ success: true, message: "Notification ditandai sudah dibaca" });
});

// ==========================================
// MARK ALL NOTIFICATIONS AS READ
// ==========================================

userRoutes.put("/notifications/read-all", authMiddleware, async (c) => {
  const authUser = c.get("user");

  await prisma.notification.updateMany({
    where: { userId: authUser.id, isRead: false },
    data: { isRead: true },
  });

  return c.json({ success: true, message: "Semua notifikasi ditandai sudah dibaca" });
});

// ==========================================
// ACTIVITY HISTORY
// ==========================================

userRoutes.get("/activity", authMiddleware, async (c) => {
  const authUser = c.get("user");
  const { page, limit } = parsePagination(c.req.url);

  const [activities, total] = await Promise.all([
    prisma.activityHistory.findMany({
      where: { userId: authUser.id },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.activityHistory.count({ where: { userId: authUser.id } }),
  ]);

  return c.json(paginatedResponse(activities, total, page, limit));
});
