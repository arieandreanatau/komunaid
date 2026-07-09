import { Hono } from "hono";
import { prisma } from "@komunaid/database";
import { createCommunitySchema, updateCommunitySchema, paginationSchema, joinCommunitySchema } from "@komunaid/shared";
import { authMiddleware, optionalAuthMiddleware } from "../middleware/auth";
import { requireCommunityOwner, requireCommunityAdmin } from "../middleware/rbac";
import { validate } from "../middleware/validate";
import { createAuditLog, AuditActions } from "../services/audit";
import type { AuthUser } from "../middleware/auth";

type Env = { Variables: { user: AuthUser; validated: any; userRoles: string[] } };

export const communityRoutes = new Hono<Env>();

// ==========================================
// LIST COMMUNITIES (Public)
// ==========================================

communityRoutes.get("/", optionalAuthMiddleware, async (c) => {
  const url = new URL(c.req.url);
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = parseInt(url.searchParams.get("limit") || "20");
  const search = url.searchParams.get("search") || "";
  const status = url.searchParams.get("status") || "APPROVED";

  const where: Record<string, unknown> = { deletedAt: null };

  if (status !== "all") {
    where.status = status;
  }

  if (search) {
    where.OR = [
      { name: { contains: search } },
      { description: { contains: search } },
    ];
  }

  const [communities, total] = await Promise.all([
    prisma.community.findMany({
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
    prisma.community.count({ where }),
  ]);

  return c.json({
    success: true,
    communities: communities.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description,
      coverImage: c.coverImage,
      logo: c.logo,
      location: c.location,
      membershipType: c.membershipType,
      status: c.status,
      owner: c.owner,
      memberCount: c._count.members,
      eventCount: c._count.events,
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

// ==========================================
// GET COMMUNITY BY SLUG (Public)
// ==========================================

communityRoutes.get("/:slug", optionalAuthMiddleware, async (c) => {
  const slug = c.req.param("slug") as string;

  const community = await prisma.community.findUnique({
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
      categories: {
        include: { category: true },
      },
      _count: {
        select: { members: true, events: true },
      },
    },
  });

  if (!community || community.deletedAt) {
    return c.json({ success: false, message: "Community not found" }, 404);
  }

  return c.json({
    success: true,
    community: {
      ...community,
      members: undefined,
      memberCount: community._count.members,
      eventCount: community._count.events,
      membersPreview: community.members.map((m) => ({
        id: m.user.id,
        name: m.user.name,
        avatar: m.user.avatar,
        role: m.role,
      })),
      upcomingEvents: community.events,
      categories: community.categories.map((c) => c.category),
    },
  });
});

// ==========================================
// CREATE COMMUNITY
// ==========================================

communityRoutes.post("/", authMiddleware, validate(createCommunitySchema), async (c) => {
  const authUser = c.get("user");
  const data = c.get("validated");

  const slug = data.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  const existingSlug = await prisma.community.findUnique({ where: { slug } });
  const finalSlug = existingSlug ? `${slug}-${Date.now()}` : slug;

  const community = await prisma.community.create({
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
    actionType: AuditActions.COMMUNITY_CREATE,
    resourceName: "Community",
    resourceId: community.id,
    afterData: { name: community.name, slug: community.slug },
  });

  return c.json({
    success: true,
    message: "Komunitas berhasil dibuat. Menunggu approval admin.",
    community: {
      id: community.id,
      name: community.name,
      slug: community.slug,
      status: community.status,
    },
  }, 201);
});

// ==========================================
// UPDATE COMMUNITY (Owner/Admin)
// ==========================================

communityRoutes.put("/:communityId", authMiddleware, requireCommunityAdmin, validate(updateCommunitySchema), async (c) => {
  const authUser = c.get("user");
  const communityId = c.req.param("communityId") as string;
  const data = c.get("validated");

  const before = await prisma.community.findUnique({
    where: { id: communityId },
  });

  const community = await prisma.community.update({
    where: { id: communityId },
    data,
  });

  await createAuditLog({
    userId: authUser.id,
    actionType: AuditActions.COMMUNITY_UPDATE,
    resourceName: "Community",
    resourceId: communityId,
    beforeData: before ? { name: before.name, description: before.description } : null,
    afterData: { name: community.name, description: community.description },
  });

  return c.json({
    success: true,
    message: "Komunitas berhasil diupdate",
    community: {
      id: community.id,
      name: community.name,
      slug: community.slug,
    },
  });
});

// ==========================================
// JOIN COMMUNITY
// ==========================================

communityRoutes.post("/:communityId/join", authMiddleware, validate(joinCommunitySchema), async (c) => {
  const authUser = c.get("user");
  const communityId = c.req.param("communityId") as string;

  const community = await prisma.community.findUnique({
    where: { id: communityId },
  });

  if (!community || community.deletedAt) {
    return c.json({ success: false, message: "Komunitas tidak ditemukan" }, 404);
  }

  if (community.status !== "APPROVED") {
    return c.json({ success: false, message: "Komunitas belum disetujui" }, 400);
  }

  const existingMember = await prisma.communityMember.findUnique({
    where: {
      communityId_userId: {
        communityId,
        userId: authUser.id,
      },
    },
  });

  if (existingMember) {
    return c.json({ success: false, message: "Sudah menjadi anggota" }, 409);
  }

  if (community.membershipType === "OPEN") {
    await prisma.communityMember.create({
      data: {
        communityId,
        userId: authUser.id,
        role: "MEMBER",
        status: "ACTIVE",
      },
    });

    await createAuditLog({
      userId: authUser.id,
      actionType: AuditActions.COMMUNITY_MEMBER_JOIN,
      resourceName: "Community",
      resourceId: communityId,
    });

    return c.json({ success: true, message: "Berhasil bergabung dengan komunitas" });
  } else {
    const existingRequest = await prisma.joinRequest.findUnique({
      where: {
        communityId_userId: {
          communityId,
          userId: authUser.id,
        },
      },
    });

    if (existingRequest && existingRequest.status === "PENDING") {
      return c.json({ success: false, message: "Permintaan bergabung sudah ada" }, 409);
    }

    await prisma.joinRequest.create({
      data: {
        communityId,
        userId: authUser.id,
      },
    });

    return c.json({ success: true, message: "Permintaan bergabung dikirim. Menunggu persetujuan." });
  }
});

// ==========================================
// LEAVE COMMUNITY
// ==========================================

communityRoutes.post("/:communityId/leave", authMiddleware, async (c) => {
  const authUser = c.get("user");
  const communityId = c.req.param("communityId") as string;

  const membership = await prisma.communityMember.findUnique({
    where: {
      communityId_userId: {
        communityId,
        userId: authUser.id,
      },
    },
  });

  if (!membership) {
    return c.json({ success: false, message: "Bukan anggota komunitas" }, 400);
  }

  if (membership.role === "OWNER") {
    return c.json({ success: false, message: "Owner tidak bisa meninggalkan komunitas" }, 400);
  }

  await prisma.communityMember.delete({
    where: {
      communityId_userId: {
        communityId,
        userId: authUser.id,
      },
    },
  });

  await createAuditLog({
    userId: authUser.id,
    actionType: AuditActions.COMMUNITY_MEMBER_LEAVE,
    resourceName: "Community",
    resourceId: communityId,
  });

  return c.json({ success: true, message: "Berhasil meninggalkan komunitas" });
});

// ==========================================
// GET JOIN REQUESTS (Owner/Admin)
// ==========================================

communityRoutes.get("/:communityId/join-requests", authMiddleware, requireCommunityAdmin, async (c) => {
  const communityId = c.req.param("communityId") as string;

  const requests = await prisma.joinRequest.findMany({
    where: { communityId, status: "PENDING" },
    include: {
      user: {
        select: { id: true, name: true, email: true, avatar: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return c.json({ success: true, requests });
});

// ==========================================
// APPROVE/REJECT JOIN REQUEST
// ==========================================

communityRoutes.put("/:communityId/join-requests/:requestId", authMiddleware, requireCommunityAdmin, async (c) => {
  const authUser = c.get("user");
  const communityId = c.req.param("communityId") as string;
  const requestId = c.req.param("requestId") as string;
  const body = await c.req.json();

  const { action } = body as { action: "approve" | "reject" };

  const request = await prisma.joinRequest.findUnique({
    where: { id: requestId },
  });

  if (!request || request.communityId !== communityId) {
    return c.json({ success: false, message: "Request not found" }, 404);
  }

  if (request.status !== "PENDING") {
    return c.json({ success: false, message: "Request sudah diproses" }, 400);
  }

  await prisma.joinRequest.update({
    where: { id: requestId },
    data: { status: action === "approve" ? "APPROVED" : "REJECTED" },
  });

  if (action === "approve") {
    await prisma.communityMember.create({
      data: {
        communityId,
        userId: request.userId,
        role: "MEMBER",
        status: "ACTIVE",
      },
    });
  }

  return c.json({ success: true, message: `Request ${action === "approve" ? "disetujui" : "ditolak"}` });
});

// ==========================================
// GET MEMBERS
// ==========================================

communityRoutes.get("/:communityId/members", async (c) => {
  const communityId = c.req.param("communityId") as string;
  const url = new URL(c.req.url);
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = parseInt(url.searchParams.get("limit") || "20");

  const [members, total] = await Promise.all([
    prisma.communityMember.findMany({
      where: { communityId, status: "ACTIVE" },
      include: {
        user: {
          select: { id: true, name: true, avatar: true, bio: true },
        },
      },
      orderBy: { joinedAt: "asc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.communityMember.count({
      where: { communityId, status: "ACTIVE" },
    }),
  ]);

  return c.json({
    success: true,
    members: members.map((m) => ({
      id: m.user.id,
      name: m.user.name,
      avatar: m.user.avatar,
      bio: m.user.bio,
      role: m.role,
      joinedAt: m.joinedAt,
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});
