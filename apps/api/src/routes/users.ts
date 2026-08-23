import { Hono } from "hono";
import { prisma } from "@komunaid/database";
import { updateProfileSchema, updateInterestsSchema } from "@komunaid/shared";
import { COMMUNITY_STATUSES, ALLOWED_IMAGE_TYPES } from "@komunaid/constants";
import { authMiddleware } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { createAuditLog, AuditActions } from "../services/audit";
import { parsePagination, paginatedResponse } from "../lib/pagination";
import { sanitizeText } from "../lib/xss";
import { createChildLogger } from "../lib/logger";
import type { AuthUser } from "../middleware/auth";

const log = createChildLogger("users");

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
        where: {
          community: { deletedAt: null },
        },
        include: {
          community: {
            select: { id: true, name: true, slug: true, logo: true, status: true },
          },
        },
      },
      organizationMembers: {
        where: {
          status: "ACTIVE",
          deletedAt: null,
          organization: { deletedAt: null },
        },
        include: {
          organization: {
            select: { id: true, name: true, slug: true, logo: true, status: true },
          },
        },
      },
      registeredEvents: {
        where: {
          status: { in: ["PENDING", "CONFIRMED", "WAITLISTED"] },
          event: {
            deletedAt: null,
            status: { notIn: ["CANCELLED", "ARCHIVED"] },
          },
        },
        include: {
          event: {
            select: { id: true, title: true, slug: true, coverImage: true, eventDate: true, status: true },
          },
        },
        orderBy: { event: { eventDate: "asc" } },
        take: 50,
      },
      notifications: {
        where: { isRead: false },
        take: 5,
        orderBy: { createdAt: "desc" },
      },
    },
  });

  let savedEventsRaw: { event: { id: string; title: string; slug: string; coverImage: string | null; eventDate: Date; status: string }; createdAt: Date }[] = [];
  try {
    savedEventsRaw = (await prisma.eventSave.findMany({
      where: { userId: authUser.id, event: { deletedAt: null } },
      include: {
        event: {
          select: { id: true, title: true, slug: true, coverImage: true, eventDate: true, status: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    })) ?? [];
  } catch {
    // event_saves table may not exist yet
  }

  if (!user) {
    return c.json({ success: false, message: "User tidak ditemukan" }, 404);
  }

  const [unreadCount, registeredEventsCount, savedEventsCount] = await Promise.all([
    prisma.notification.count({
      where: { userId: authUser.id, isRead: false },
    }),
    prisma.eventRegistration.count({
      where: {
        userId: authUser.id,
        status: { in: ["PENDING", "CONFIRMED", "WAITLISTED"] },
        event: { deletedAt: null, status: { notIn: ["CANCELLED", "ARCHIVED"] } },
      },
    }),
    prisma.eventSave.count({
      where: { userId: authUser.id, event: { deletedAt: null } },
    }).catch(() => 0),
  ]);

  const mapCommunity = (membership: (typeof user.joinedCommunities)[number]) => ({
    id: membership.community.id,
    name: membership.community.name,
    slug: membership.community.slug,
    logo: membership.community.logo,
    role: membership.role,
    status: membership.status,
  });
  const activeMemberships = user.joinedCommunities.filter(
    (membership) => membership.status === "ACTIVE" && membership.deletedAt === null
  );
  const createdCommunities = activeMemberships
    .filter((membership) => membership.role === "OWNER")
    .map(mapCommunity);
  const followedCommunities = activeMemberships
    .filter((membership) => membership.role !== "OWNER")
    .map(mapCommunity);
  const pastCommunities = user.joinedCommunities
    .filter(
      (membership) =>
        membership.role !== "OWNER" &&
        membership.deletedAt !== null
    )
    .map((membership) => ({
      ...mapCommunity(membership),
      leftAt: membership.deletedAt,
      leftReason: membership.status === "LEFT" ? "LEFT" : membership.status === "BANNED" ? "BANNED" : "REMOVED",
    }));

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
        isProfilePublic: user.isProfilePublic,
        status: user.status,
        roles: user.roles.map((r) => r.role),
        interests: user.interests.map((i) => i.interest),
        communities: activeMemberships.map(mapCommunity),
        createdCommunities,
        followedCommunities,
        pastCommunities,
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
        registeredEventsCount,
        savedEvents: savedEventsRaw.map((saved) => ({
          id: saved.event.id,
          title: saved.event.title,
          slug: saved.event.slug,
          coverImage: saved.event.coverImage,
          eventDate: saved.event.eventDate,
          status: saved.event.status,
          savedAt: saved.createdAt,
        })),
        savedEventsCount,
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
  if (data.phone !== undefined) sanitizedData.phone = data.phone === "" ? null : data.phone;
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
// UPLOAD PROFILE PHOTO
// ==========================================

const PHOTO_MAX_SIZE = 5 * 1024 * 1024;
const PHOTO_MAGIC_SIGNATURES: Record<string, number[][]> = {
  "image/jpeg": [[0xff, 0xd8, 0xff]],
  "image/png": [[0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]],
  "image/webp": [[0x52, 0x49, 0x46, 0x46]],
};

function matchesPhotoMagic(buffer: Buffer, mime: string): boolean {
  const signatures = PHOTO_MAGIC_SIGNATURES[mime];
  if (!signatures || signatures.length === 0) return false;
  return signatures.some((sig) => buffer.length >= sig.length && sig.every((byte, i) => buffer[i] === byte));
}

function getPhotoExtension(mime: string): string {
  const map: Record<string, string> = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
  };
  return map[mime] || ".bin";
}

function generatePhotoFilename(mime: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 10);
  return `avatar-${timestamp}-${random}${getPhotoExtension(mime)}`;
}

userRoutes.post("/profile/photo", authMiddleware, async (c) => {
  try {
    const authUser = c.get("user");
    const body = await c.req.parseBody();
    const file = body["file"];

    if (!file || typeof file === "string") {
      return c.json({ success: false, message: "File wajib diupload" }, 400);
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return c.json({ success: false, message: "Tipe file tidak didukung. Gunakan JPG, PNG, atau WebP" }, 400);
    }

    if (file.size > PHOTO_MAX_SIZE) {
      return c.json({ success: false, message: "Ukuran file maksimal 5MB" }, 400);
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (!matchesPhotoMagic(buffer, file.type)) {
      return c.json({ success: false, message: "File tidak valid (format tidak cocok)" }, 400);
    }

    const { writeFile, mkdir } = await import("node:fs/promises");
    const { join } = await import("node:path");

    const uploadDir = process.env.UPLOAD_DIR || join(process.cwd(), "uploads");
    const dateDir = new Date().toISOString().split("T")[0];
    const targetDir = join(uploadDir, "avatars", dateDir);

    await mkdir(targetDir, { recursive: true });

    const filename = generatePhotoFilename(file.type);
    const filePath = join(targetDir, filename);

    await writeFile(filePath, buffer);

    const baseUrl = process.env.UPLOAD_BASE_URL || `/uploads/avatars/${dateDir}`;
    const fileUrl = `${baseUrl}/${filename}`;

    const before = await prisma.user.findUnique({
      where: { id: authUser.id },
      select: { avatar: true },
    });

    const updated = await prisma.user.update({
      where: { id: authUser.id },
      data: { avatar: fileUrl },
      select: { id: true, avatar: true, name: true },
    });

    await createAuditLog({
      userId: authUser.id,
      actionType: AuditActions.USER_UPDATE_PROFILE_PHOTO,
      resourceName: "User",
      resourceId: authUser.id,
      beforeData: { avatar: before?.avatar },
      afterData: { avatar: fileUrl },
    });

    return c.json({
      success: true,
      message: "Foto profile berhasil diupdate",
      data: { avatar: updated.avatar },
    });
  } catch (err: unknown) {
    log.error({ err }, "profile photo upload failed");
    return c.json({ success: false, message: "Gagal upload foto profile" }, 500);
  }
});

// ==========================================
// UPDATE INTERESTS
// ==========================================

userRoutes.put("/interests", authMiddleware, validate(updateInterestsSchema), async (c) => {
  const authUser = c.get("user");
  const data = c.get("validated");
  const { interests } = data as { interests: string[] };

  const sanitizedInterests = interests
    .map((i) => sanitizeText(i))
    .filter((i): i is string => i !== null && i.length > 0)
    .slice(0, 20);

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
    afterData: { interests: sanitizedInterests },
  });

  return c.json({
    success: true,
    message: "Interests berhasil diupdate",
    data: { interests: sanitizedInterests },
  });
});

// ==========================================
// PRIVACY SETTINGS
// ==========================================

userRoutes.put("/privacy", authMiddleware, async (c) => {
  const authUser = c.get("user");
  const { isProfilePublic } = await c.req.json();

  if (typeof isProfilePublic !== "boolean") {
    return c.json({ success: false, message: "isProfilePublic harus boolean" }, 400);
  }

  const updated = await prisma.user.update({
    where: { id: authUser.id },
    data: { isProfilePublic },
    select: { id: true, isProfilePublic: true },
  });

  await createAuditLog({
    userId: authUser.id,
    actionType: AuditActions.USER_UPDATE_PROFILE,
    resourceName: "User",
    resourceId: authUser.id,
    afterData: { isProfilePublic },
  });

  return c.json({
    success: true,
    message: "Pengaturan privasi berhasil diperbarui",
    data: { isProfilePublic: updated.isProfilePublic },
  });
});

// ==========================================
// CHANGE EMAIL
// ==========================================

userRoutes.put("/change-email", authMiddleware, async (c) => {
  const authUser = c.get("user");
  const { email } = await c.req.json();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return c.json({ success: false, message: "Format email tidak valid" }, 400);
  }

  const current = await prisma.user.findUnique({
    where: { id: authUser.id },
    select: { email: true },
  });

  if (current?.email === email) {
    return c.json({ success: false, message: "Email sama dengan email saat ini" }, 400);
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return c.json({ success: false, message: "Email sudah digunakan" }, 409);
  }

  await prisma.user.update({
    where: { id: authUser.id },
    data: { email },
  });

  await createAuditLog({
    userId: authUser.id,
    actionType: AuditActions.USER_CHANGE_EMAIL,
    resourceName: "User",
    resourceId: authUser.id,
    beforeData: { email: current?.email },
    afterData: { email },
  });

  return c.json({ success: true, message: "Email berhasil diubah", data: { email } });
});

// ==========================================
// CHANGE USERNAME
// ==========================================

userRoutes.put("/change-username", authMiddleware, async (c) => {
  const authUser = c.get("user");
  const { username } = await c.req.json();

  if (!username || !/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
    return c.json({ success: false, message: "Username 3-20 karakter, huruf/angka/underscore" }, 400);
  }

  const current = await prisma.user.findUnique({
    where: { id: authUser.id },
    select: { username: true },
  });

  if (current?.username === username) {
    return c.json({ success: false, message: "Username sama dengan username saat ini" }, 400);
  }

  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) {
    return c.json({ success: false, message: "Username sudah digunakan" }, 409);
  }

  await prisma.user.update({
    where: { id: authUser.id },
    data: { username },
  });

  await createAuditLog({
    userId: authUser.id,
    actionType: AuditActions.USER_CHANGE_USERNAME,
    resourceName: "User",
    resourceId: authUser.id,
    beforeData: { username: current?.username },
    afterData: { username },
  });

  return c.json({ success: true, message: "Username berhasil diubah", data: { username } });
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

// ==========================================
// GET USER BY ID (Public)
// Keep dynamic route after all static GET routes.
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
      isProfilePublic: true,
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

  if (!user.isProfilePublic) {
    return c.json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          avatar: user.avatar,
          createdAt: user.createdAt,
        },
      },
    });
  }

  return c.json({ success: true, data: { user } });
});
