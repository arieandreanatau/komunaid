import { Hono } from "hono";
import { prisma } from "@komunaid/database";
import {
  createCommunitySchema,
  updateCommunitySchema,
  joinCommunitySchema,
  handleJoinRequestSchema,
  updateCommunitySettingsSchema,
  changeMemberRoleSchema,
  communityQuerySchema,
  submitCommunitySchema,
  updateCommunityProfileSchema,
  updateCommunityBannerSchema,
  updateCommunityLogoSchema,
} from "@komunaid/shared";
import { authMiddleware, optionalAuthMiddleware } from "../middleware/auth";
import {
  requireCommunityOwner,
  requireCommunityAdmin,
} from "../middleware/rbac";
import { validate } from "../middleware/validate";
import { createAuditLog, AuditActions } from "../services/audit";
import type { AuthUser } from "../middleware/auth";

type Env = { Variables: { user: AuthUser; validated: any; userRoles: string[] } };

export const communityRoutes = new Hono<Env>();

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// ==========================================
// 1. LIST COMMUNITIES (Public)
// ==========================================

communityRoutes.get("/", optionalAuthMiddleware, validate(communityQuerySchema, "query"), async (c) => {
  const user = c.get("user");
  const q = c.get("validated");

  const page = q.page as number;
  const limit = q.limit as number;

  const where: any = { deletedAt: null };

  if (user) {
    where.status = q.status || "APPROVED";
  } else {
    where.status = "APPROVED";
    where.visibility = q.visibility || "PUBLIC";
  }

  if (q.search) {
    where.OR = [
      { name: { contains: q.search } },
      { description: { contains: q.search } },
    ];
  }

  if (q.visibility && user) {
    where.visibility = q.visibility;
  }

  if (q.membershipType) {
    where.membershipType = q.membershipType;
  }

  if (q.categoryId) {
    where.categories = { some: { categoryId: q.categoryId } };
  }

  const orderBy: any =
    q.orderBy === "memberCount"
      ? { members: { _count: q.sort as "asc" | "desc" } }
      : { [q.orderBy]: q.sort };

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
        categories: {
          include: { category: true },
        },
        tags: true,
      },
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.community.count({ where }),
  ]);

  return c.json({
    success: true,
    data: communities.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description,
      coverImage: c.coverImage,
      logo: c.logo,
      banner: c.banner,
      location: c.location,
      website: c.website,
      membershipType: c.membershipType,
      status: c.status,
      visibility: c.visibility,
      owner: c.owner,
      memberCount: c._count.members,
      eventCount: c._count.events,
      categories: c.categories.map((cc) => cc.category),
      tags: c.tags.map((t) => t.tag),
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
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
// MY COMMUNITY SUBMISSIONS
// ==========================================

communityRoutes.get(
  "/my/submissions",
  authMiddleware,
  async (c) => {
    const authUser = c.get("user");
    const url = new URL(c.req.url);
    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1") || 1);
    const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get("limit") || "10") || 10));
    const status = url.searchParams.get("status") || "";

    const where: any = {
      ownerId: authUser.id,
      deletedAt: null,
    };

    if (status) {
      where.status = status;
    }

    const [communities, total] = await Promise.all([
      prisma.community.findMany({
        where,
        include: {
          categories: { include: { category: true } },
          tags: true,
          settings: true,
          _count: { select: { members: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.community.count({ where }),
    ]);

    return c.json({
      success: true,
      data: communities.map((comm) => ({
        id: comm.id,
        name: comm.name,
        slug: comm.slug,
        description: comm.description,
        logo: comm.logo,
        banner: comm.banner,
        status: comm.status,
        membershipType: comm.membershipType,
        visibility: comm.visibility,
        adminNote: comm.adminNote,
        submittedAt: comm.submittedAt,
        reviewedAt: comm.reviewedAt,
        categories: comm.categories.map((cc) => cc.category),
        tags: comm.tags.map((t) => t.tag),
        memberCount: comm._count.members,
        createdAt: comm.createdAt,
        updatedAt: comm.updatedAt,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  }
);

// ==========================================
// 2. GET COMMUNITY BY SLUG (Public)
// ==========================================

communityRoutes.get("/:slug", optionalAuthMiddleware, async (c) => {
  const slug = c.req.param("slug") as string;
  const user = c.get("user");

  const community = await prisma.community.findUnique({
    where: { slug },
    include: {
      owner: {
        select: { id: true, name: true, avatar: true, bio: true },
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
        where: { status: "PUBLISHED", eventDate: { gte: new Date() } },
        orderBy: { eventDate: "asc" },
        take: 5,
      },
      categories: {
        include: { category: true },
      },
      tags: true,
      settings: true,
      _count: {
        select: { members: true, events: true },
      },
    },
  });

  if (!community || community.deletedAt) {
    return c.json({ success: false, message: "Komunitas tidak ditemukan" }, 404);
  }

  if (!user && community.visibility === "PRIVATE") {
    return c.json({ success: false, message: "Komunitas ini bersifat privat" }, 403);
  }

  let userMembership: { role: string; status: string } | null = null;
  if (user) {
    const membership = await prisma.communityMember.findUnique({
      where: {
        communityId_userId: {
          communityId: community.id,
          userId: user.id,
        },
      },
      select: { role: true, status: true },
    });
    userMembership = membership
      ? { role: membership.role, status: membership.status }
      : null;
  }

  return c.json({
    success: true,
    data: {
      id: community.id,
      name: community.name,
      slug: community.slug,
      description: community.description,
      coverImage: community.coverImage,
      logo: community.logo,
      banner: community.banner,
      location: community.location,
      website: community.website,
      membershipType: community.membershipType,
      status: community.status,
      visibility: community.visibility,
      owner: community.owner,
      memberCount: community._count.members,
      eventCount: community._count.events,
      membersPreview: community.members.map((m) => ({
        id: m.user.id,
        name: m.user.name,
        avatar: m.user.avatar,
        role: m.role,
      })),
      upcomingEvents: community.events,
      categories: community.categories.map((cc) => cc.category),
      tags: community.tags.map((t) => t.tag),
      settings: community.settings
        ? {
            showMemberList: community.settings.showMemberList,
            showEventList: community.settings.showEventList,
          }
        : null,
      userMembership,
      createdAt: community.createdAt,
      updatedAt: community.updatedAt,
    },
  });
});

// ==========================================
// 3. CREATE COMMUNITY
// ==========================================

communityRoutes.post("/", authMiddleware, validate(createCommunitySchema), async (c) => {
  const authUser = c.get("user");
  const data = c.get("validated");

  const slug = slugify(data.name);

  const existingSlug = await prisma.community.findUnique({ where: { slug } });
  const finalSlug = existingSlug ? `${slug}-${Date.now()}` : slug;

  const { categoryIds, tags, ...communityData } = data;

  const community = await prisma.community.create({
    data: {
      ...communityData,
      slug: finalSlug,
      ownerId: authUser.id,
      status: "DRAFT",
      members: {
        create: {
          userId: authUser.id,
          role: "OWNER",
          status: "ACTIVE",
        },
      },
      settings: {
        create: {
          allowMemberPost: true,
          requireApproval: false,
          showMemberList: true,
          showEventList: true,
        },
      },
      ...(categoryIds && categoryIds.length > 0
        ? {
            categories: {
              create: categoryIds.map((categoryId: string) => ({ categoryId })),
            },
          }
        : {}),
      ...(tags && tags.length > 0
        ? {
            tags: {
              create: tags.map((tag: string) => ({ tag })),
            },
          }
        : {}),
    },
    include: {
      _count: { select: { members: true, events: true } },
      categories: { include: { category: true } },
      tags: true,
    },
  });

  await createAuditLog({
    userId: authUser.id,
    actionType: AuditActions.COMMUNITY_CREATE,
    resourceName: "Community",
    resourceId: community.id,
    afterData: { name: community.name, slug: community.slug },
  });

  await prisma.activityHistory.create({
    data: {
      userId: authUser.id,
      action: "COMMUNITY_CREATE",
      details: { communityId: community.id, communityName: community.name },
    },
  });

  return c.json(
    {
      success: true,
      message: "Komunitas berhasil dibuat sebagai draft",
      data: {
        id: community.id,
        name: community.name,
        slug: community.slug,
        status: community.status,
        membershipType: community.membershipType,
        visibility: community.visibility,
        memberCount: community._count.members,
        categories: community.categories.map((cc) => cc.category),
        tags: community.tags.map((t) => t.tag),
        createdAt: community.createdAt,
      },
    },
    201
  );
});

// ==========================================
// UPDATE COMMUNITY (DRAFT/REVISION)
// ==========================================

communityRoutes.patch(
  "/:communityId",
  authMiddleware,
  validate(updateCommunitySchema),
  async (c) => {
    const authUser = c.get("user");
    const communityId = c.req.param("communityId") as string;
    const data = c.get("validated");

    const community = await prisma.community.findUnique({
      where: { id: communityId },
    });

    if (!community || community.deletedAt) {
      return c.json({ success: false, message: "Komunitas tidak ditemukan" }, 404);
    }

    if (community.ownerId !== authUser.id) {
      return c.json({ success: false, message: "Hanya pemilik yang dapat mengedit komunitas" }, 403);
    }

    if (community.status !== "DRAFT" && community.status !== "REVISION_REQUIRED") {
      return c.json({ success: false, message: "Komunitas hanya dapat diedit dalam status draft atau revision" }, 400);
    }

    const before = await prisma.community.findUnique({ where: { id: communityId } });

    const { categoryIds, tags, ...updateData } = data as any;

    const updated = await prisma.community.update({
      where: { id: communityId },
      data: updateData,
    });

    // Update categories if provided
    if (categoryIds !== undefined) {
      await prisma.communityCategory.deleteMany({ where: { communityId } });
      if (categoryIds.length > 0) {
        await prisma.communityCategory.createMany({
          data: categoryIds.map((categoryId: string) => ({ communityId, categoryId })),
        });
      }
    }

    // Update tags if provided
    if (tags !== undefined) {
      await prisma.communityTag.deleteMany({ where: { communityId } });
      if (tags.length > 0) {
        await prisma.communityTag.createMany({
          data: tags.map((tag: string) => ({ communityId, tag })),
        });
      }
    }

    await createAuditLog({
      userId: authUser.id,
      actionType: AuditActions.COMMUNITY_UPDATE,
      resourceName: "Community",
      resourceId: communityId,
      beforeData: { name: before?.name },
      afterData: { name: updated.name },
    });

    return c.json({
      success: true,
      message: "Komunitas berhasil diupdate",
      data: { id: updated.id, name: updated.name, status: updated.status },
    });
  }
);

// ==========================================
// SUBMIT COMMUNITY FOR REVIEW
// ==========================================

communityRoutes.post(
  "/:communityId/submit",
  authMiddleware,
  async (c) => {
    const authUser = c.get("user");
    const communityId = c.req.param("communityId") as string;

    const community = await prisma.community.findUnique({
      where: { id: communityId },
    });

    if (!community || community.deletedAt) {
      return c.json({ success: false, message: "Komunitas tidak ditemukan" }, 404);
    }

    if (community.ownerId !== authUser.id) {
      return c.json({ success: false, message: "Hanya pemilik yang dapat mengirim submission" }, 403);
    }

    if (community.status !== "DRAFT" && community.status !== "REVISION_REQUIRED") {
      return c.json({ success: false, message: "Komunitas tidak dapat dikirim untuk review" }, 400);
    }

    const updated = await prisma.community.update({
      where: { id: communityId },
      data: {
        status: "PENDING",
        submittedAt: new Date(),
      },
    });

    await createAuditLog({
      userId: authUser.id,
      actionType: "COMMUNITY_SUBMITTED",
      resourceName: "Community",
      resourceId: communityId,
      beforeData: { status: community.status },
      afterData: { status: "PENDING" },
    });

    await prisma.activityHistory.create({
      data: {
        userId: authUser.id,
        action: "COMMUNITY_SUBMITTED",
        details: { communityId, communityName: community.name },
      },
    });

    return c.json({
      success: true,
      message: "Komunitas berhasil dikirim untuk review",
      data: { id: updated.id, status: updated.status },
    });
  }
);

// ==========================================
// 4. UPDATE COMMUNITY (Owner/Admin)
// ==========================================
// 4. UPDATE COMMUNITY (Owner/Admin)
// ==========================================

communityRoutes.put(
  "/:communityId",
  authMiddleware,
  requireCommunityAdmin,
  validate(updateCommunitySchema),
  async (c) => {
    const authUser = c.get("user");
    const communityId = c.req.param("communityId") as string;
    const data = c.get("validated");

    const before = await prisma.community.findUnique({
      where: { id: communityId },
    });

    if (!before || before.deletedAt) {
      return c.json({ success: false, message: "Komunitas tidak ditemukan" }, 404);
    }

    const { categoryIds, tags, ...updateData } = data;

    const community = await prisma.community.update({
      where: { id: communityId },
      data: updateData,
    });

    if (categoryIds !== undefined) {
      await prisma.communityCategory.deleteMany({ where: { communityId } });
      if (categoryIds.length > 0) {
        await prisma.communityCategory.createMany({
          data: categoryIds.map((categoryId: string) => ({
            communityId,
            categoryId,
          })),
        });
      }
    }

    if (tags !== undefined) {
      await prisma.communityTag.deleteMany({ where: { communityId } });
      if (tags.length > 0) {
        await prisma.communityTag.createMany({
          data: tags.map((tag: string) => ({ communityId, tag })),
        });
      }
    }

    await createAuditLog({
      userId: authUser.id,
      actionType: AuditActions.COMMUNITY_UPDATE,
      resourceName: "Community",
      resourceId: communityId,
      beforeData: { name: before.name, description: before.description },
      afterData: { name: community.name, description: community.description },
    });

    return c.json({
      success: true,
      message: "Komunitas berhasil diupdate",
      data: {
        id: community.id,
        name: community.name,
        slug: community.slug,
        description: community.description,
      },
    });
  }
);

// ==========================================
// 5. ARCHIVE COMMUNITY
// ==========================================

communityRoutes.post(
  "/:communityId/archive",
  authMiddleware,
  requireCommunityOwner,
  async (c) => {
    const authUser = c.get("user");
    const communityId = c.req.param("communityId") as string;

    const community = await prisma.community.findUnique({
      where: { id: communityId },
    });

    if (!community || community.deletedAt) {
      return c.json({ success: false, message: "Komunitas tidak ditemukan" }, 404);
    }

    if (community.status === "ARCHIVED") {
      return c.json({ success: false, message: "Komunitas sudah diarsipkan" }, 400);
    }

    const beforeStatus = community.status;

    await prisma.community.update({
      where: { id: communityId },
      data: { status: "ARCHIVED" },
    });

    await createAuditLog({
      userId: authUser.id,
      actionType: AuditActions.COMMUNITY_SUSPEND,
      resourceName: "Community",
      resourceId: communityId,
      beforeData: { status: beforeStatus },
      afterData: { status: "ARCHIVED" },
    });

    return c.json({
      success: true,
      message: "Komunitas berhasil diarsipkan",
      data: { id: communityId, status: "ARCHIVED" },
    });
  }
);

// ==========================================
// 6. GET COMMUNITY DASHBOARD
// ==========================================

communityRoutes.get(
  "/:communityId/dashboard",
  authMiddleware,
  requireCommunityAdmin,
  async (c) => {
    const communityId = c.req.param("communityId") as string;

    const community = await prisma.community.findUnique({
      where: { id: communityId },
      include: {
        settings: true,
        tags: true,
        owner: {
          select: { id: true, name: true, avatar: true },
        },
        _count: {
          select: { members: true, events: true },
        },
      },
    });

    if (!community || community.deletedAt) {
      return c.json({ success: false, message: "Komunitas tidak ditemukan" }, 404);
    }

    const [pendingJoinRequestCount, activeEventCount, recentActivity] =
      await Promise.all([
        prisma.joinRequest.count({
          where: { communityId, status: "PENDING" },
        }),
        prisma.event.count({
          where: { communityId, status: "PUBLISHED", eventDate: { gte: new Date() } },
        }),
        prisma.membershipHistory.findMany({
          where: { communityId },
          include: {
            user: { select: { id: true, name: true, avatar: true } },
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        }),
      ]);

    return c.json({
      success: true,
      data: {
        communityInfo: {
          id: community.id,
          name: community.name,
          slug: community.slug,
          description: community.description,
          coverImage: community.coverImage,
          logo: community.logo,
          banner: community.banner,
          location: community.location,
          website: community.website,
          membershipType: community.membershipType,
          status: community.status,
          visibility: community.visibility,
          owner: community.owner,
          settings: community.settings,
          tags: community.tags.map((t) => t.tag),
          createdAt: community.createdAt,
        },
        memberCount: community._count.members,
        pendingJoinRequestCount,
        activeEventCount,
        recentActivity: recentActivity.map((a) => ({
          id: a.id,
          userId: a.userId,
          user: a.user,
          action: a.action,
          oldRole: a.oldRole,
          newRole: a.newRole,
          details: a.details,
          performedBy: a.performedBy,
          createdAt: a.createdAt,
        })),
      },
    });
  }
);

// ==========================================
// 7. GET COMMUNITY INSIGHT
// ==========================================

communityRoutes.get(
  "/:communityId/insight",
  authMiddleware,
  requireCommunityAdmin,
  async (c) => {
    const communityId = c.req.param("communityId") as string;

    const community = await prisma.community.findUnique({
      where: { id: communityId },
    });

    if (!community || community.deletedAt) {
      return c.json({ success: false, message: "Komunitas tidak ditemukan" }, 404);
    }

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const [
      totalMembers,
      totalPendingRequests,
      memberGrowthLast7,
      memberGrowthPrev7,
      recentJoinRequests,
      topMembers,
    ] = await Promise.all([
      prisma.communityMember.count({
        where: { communityId, status: "ACTIVE" },
      }),
      prisma.joinRequest.count({
        where: { communityId, status: "PENDING" },
      }),
      prisma.communityMember.count({
        where: {
          communityId,
          status: "ACTIVE",
          joinedAt: { gte: sevenDaysAgo },
        },
      }),
      prisma.communityMember.count({
        where: {
          communityId,
          status: "ACTIVE",
          joinedAt: { gte: fourteenDaysAgo, lt: sevenDaysAgo },
        },
      }),
      prisma.joinRequest.findMany({
        where: { communityId, status: "PENDING" },
        include: {
          user: { select: { id: true, name: true, avatar: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      prisma.communityMember.findMany({
        where: { communityId, status: "ACTIVE" },
        include: {
          user: { select: { id: true, name: true, avatar: true } },
        },
        orderBy: [{ role: "asc" }, { joinedAt: "asc" }],
        take: 10,
      }),
    ]);

    return c.json({
      success: true,
      data: {
        totalMembers,
        totalPendingRequests,
        memberGrowth: {
          last7Days: memberGrowthLast7,
          previous7Days: memberGrowthPrev7,
          growthRate:
            memberGrowthPrev7 > 0
              ? ((memberGrowthLast7 - memberGrowthPrev7) / memberGrowthPrev7) * 100
              : memberGrowthLast7 > 0
                ? 100
                : 0,
        },
        recentJoinRequests: recentJoinRequests.map((r) => ({
          id: r.id,
          user: r.user,
          message: r.message,
          createdAt: r.createdAt,
        })),
        topMembers: topMembers.map((m) => ({
          id: m.id,
          user: m.user,
          role: m.role,
          joinedAt: m.joinedAt,
        })),
      },
    });
  }
);

// ==========================================
// 8. UPDATE COMMUNITY PROFILE
// ==========================================

communityRoutes.put(
  "/:communityId/profile",
  authMiddleware,
  requireCommunityAdmin,
  validate(updateCommunityProfileSchema),
  async (c) => {
    const authUser = c.get("user");
    const communityId = c.req.param("communityId") as string;
    const data = c.get("validated");

    const { name, description, location, website } = data as {
      name?: string;
      description?: string;
      location?: string;
      website?: string;
    };

    const community = await prisma.community.findUnique({
      where: { id: communityId },
    });

    if (!community || community.deletedAt) {
      return c.json({ success: false, message: "Komunitas tidak ditemukan" }, 404);
    }

    const updated = await prisma.community.update({
      where: { id: communityId },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(location !== undefined && { location }),
        ...(website !== undefined && { website }),
      },
    });

    await createAuditLog({
      userId: authUser.id,
      actionType: AuditActions.COMMUNITY_UPDATE,
      resourceName: "Community",
      resourceId: communityId,
      beforeData: {
        name: community.name,
        description: community.description,
        location: community.location,
        website: community.website,
      },
      afterData: {
        name: updated.name,
        description: updated.description,
        location: updated.location,
        website: updated.website,
      },
    });

    return c.json({
      success: true,
      message: "Profil komunitas berhasil diupdate",
      data: {
        id: updated.id,
        name: updated.name,
        description: updated.description,
        location: updated.location,
        website: updated.website,
      },
    });
  }
);

// ==========================================
// 9. UPDATE COMMUNITY BANNER
// ==========================================

communityRoutes.put(
  "/:communityId/banner",
  authMiddleware,
  requireCommunityAdmin,
  validate(updateCommunityBannerSchema),
  async (c) => {
    const authUser = c.get("user");
    const communityId = c.req.param("communityId") as string;
    const data = c.get("validated");
    const { banner } = data as { banner?: string };

    if (!banner) {
      return c.json({ success: false, message: "URL banner wajib diisi" }, 400);
    }

    const community = await prisma.community.findUnique({
      where: { id: communityId },
    });

    if (!community || community.deletedAt) {
      return c.json({ success: false, message: "Komunitas tidak ditemukan" }, 404);
    }

    const updated = await prisma.community.update({
      where: { id: communityId },
      data: { banner },
    });

    await createAuditLog({
      userId: authUser.id,
      actionType: AuditActions.COMMUNITY_UPDATE,
      resourceName: "Community",
      resourceId: communityId,
      beforeData: { banner: community.banner },
      afterData: { banner: updated.banner },
    });

    return c.json({
      success: true,
      message: "Banner komunitas berhasil diupdate",
      data: { id: updated.id, banner: updated.banner },
    });
  }
);

// ==========================================
// 10. UPDATE COMMUNITY LOGO
// ==========================================

communityRoutes.put(
  "/:communityId/logo",
  authMiddleware,
  requireCommunityAdmin,
  validate(updateCommunityLogoSchema),
  async (c) => {
    const authUser = c.get("user");
    const communityId = c.req.param("communityId") as string;
    const data = c.get("validated");
    const { logo } = data as { logo?: string };

    if (!logo) {
      return c.json({ success: false, message: "URL logo wajib diisi" }, 400);
    }

    const community = await prisma.community.findUnique({
      where: { id: communityId },
    });

    if (!community || community.deletedAt) {
      return c.json({ success: false, message: "Komunitas tidak ditemukan" }, 404);
    }

    const updated = await prisma.community.update({
      where: { id: communityId },
      data: { logo },
    });

    await createAuditLog({
      userId: authUser.id,
      actionType: AuditActions.COMMUNITY_UPDATE,
      resourceName: "Community",
      resourceId: communityId,
      beforeData: { logo: community.logo },
      afterData: { logo: updated.logo },
    });

    return c.json({
      success: true,
      message: "Logo komunitas berhasil diupdate",
      data: { id: updated.id, logo: updated.logo },
    });
  }
);

// ==========================================
// 11. GET COMMUNITY SETTINGS
// ==========================================

communityRoutes.get(
  "/:communityId/settings",
  authMiddleware,
  requireCommunityAdmin,
  async (c) => {
    const communityId = c.req.param("communityId") as string;

    const settings = await prisma.communitySettings.findUnique({
      where: { communityId },
    });

    if (!settings) {
      return c.json({ success: false, message: "Settings tidak ditemukan" }, 404);
    }

    return c.json({
      success: true,
      data: {
        allowMemberPost: settings.allowMemberPost,
        requireApproval: settings.requireApproval,
        showMemberList: settings.showMemberList,
        showEventList: settings.showEventList,
      },
    });
  }
);

// ==========================================
// 12. UPDATE COMMUNITY SETTINGS
// ==========================================

communityRoutes.put(
  "/:communityId/settings",
  authMiddleware,
  requireCommunityAdmin,
  validate(updateCommunitySettingsSchema),
  async (c) => {
    const authUser = c.get("user");
    const communityId = c.req.param("communityId") as string;
    const data = c.get("validated");

    const community = await prisma.community.findUnique({
      where: { id: communityId },
    });

    if (!community || community.deletedAt) {
      return c.json({ success: false, message: "Komunitas tidak ditemukan" }, 404);
    }

    const before = await prisma.communitySettings.findUnique({
      where: { communityId },
    });

    const settings = await prisma.communitySettings.upsert({
      where: { communityId },
      update: data,
      create: {
        communityId,
        allowMemberPost: data.allowMemberPost ?? true,
        requireApproval: data.requireApproval ?? false,
        showMemberList: data.showMemberList ?? true,
        showEventList: data.showEventList ?? true,
      },
    });

    await createAuditLog({
      userId: authUser.id,
      actionType: AuditActions.SETTINGS_UPDATE,
      resourceName: "CommunitySettings",
      resourceId: communityId,
      beforeData: before
        ? {
            allowMemberPost: before.allowMemberPost,
            requireApproval: before.requireApproval,
            showMemberList: before.showMemberList,
            showEventList: before.showEventList,
          }
        : null,
      afterData: {
        allowMemberPost: settings.allowMemberPost,
        requireApproval: settings.requireApproval,
        showMemberList: settings.showMemberList,
        showEventList: settings.showEventList,
      },
    });

    return c.json({
      success: true,
      message: "Settings komunitas berhasil diupdate",
      data: {
        allowMemberPost: settings.allowMemberPost,
        requireApproval: settings.requireApproval,
        showMemberList: settings.showMemberList,
        showEventList: settings.showEventList,
      },
    });
  }
);

// ==========================================
// 13. JOIN COMMUNITY
// ==========================================

communityRoutes.post(
  "/:communityId/join",
  authMiddleware,
  validate(joinCommunitySchema),
  async (c) => {
    const authUser = c.get("user");
    const communityId = c.req.param("communityId") as string;
    const data = c.get("validated");

    const community = await prisma.community.findUnique({
      where: { id: communityId },
    });

    if (!community || community.deletedAt) {
      return c.json({ success: false, message: "Komunitas tidak ditemukan" }, 404);
    }

    if (community.status !== "APPROVED") {
      return c.json({ success: false, message: "Komunitas belum disetujui" }, 400);
    }

    if (community.visibility === "PRIVATE") {
      return c.json({ success: false, message: "Komunitas ini bersifat privat" }, 403);
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
      if (existingMember.status === "BANNED") {
        return c.json(
          { success: false, message: "Anda telah dibanned dari komunitas ini" },
          403
        );
      }
      return c.json({ success: false, message: "Sudah menjadi anggota" }, 409);
    }

    if (community.membershipType === "OPEN") {
      const member = await prisma.communityMember.create({
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

      await prisma.notification.create({
        data: {
          userId: community.ownerId,
          title: "Anggota Baru Bergabung",
          message: `${authUser.name} telah bergabung dengan komunitas "${community.name}".`,
          type: "COMMUNITY",
          link: `/communities/${community.slug}`,
        },
      });

      await prisma.activityHistory.create({
        data: {
          userId: authUser.id,
          action: "COMMUNITY_MEMBER_JOIN",
          details: { communityId, communityName: community.name },
        },
      });

      return c.json({
        success: true,
        message: "Berhasil bergabung dengan komunitas",
        data: { memberId: member.id, role: member.role, status: member.status },
      });
    }

    const existingRequest = await prisma.joinRequest.findFirst({
      where: {
        communityId,
        userId: authUser.id,
        status: "PENDING",
      },
    });

    if (existingRequest) {
      return c.json(
        { success: false, message: "Permintaan bergabung sudah ada dan masih menunggu" },
        409
      );
    }

    const joinRequest = await prisma.joinRequest.create({
      data: {
        communityId,
        userId: authUser.id,
        message: data.message || null,
      },
    });

    await createAuditLog({
      userId: authUser.id,
      actionType: AuditActions.COMMUNITY_MEMBER_JOIN,
      resourceName: "Community",
      resourceId: communityId,
      afterData: { action: "join_request_created", requestId: joinRequest.id },
    });

    await prisma.activityHistory.create({
      data: {
        userId: authUser.id,
        action: "COMMUNITY_JOIN_REQUEST_CREATE",
        details: { communityId, communityName: community.name },
      },
    });

    return c.json(
      {
        success: true,
        message: "Permintaan bergabung dikirim. Menunggu persetujuan admin.",
        data: { requestId: joinRequest.id },
      },
      201
    );
  }
);

// ==========================================
// 14. LEAVE COMMUNITY
// ==========================================

communityRoutes.post(
  "/:communityId/leave",
  authMiddleware,
  async (c) => {
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
      return c.json(
        { success: false, message: "Owner tidak bisa meninggalkan komunitas" },
        400
      );
    }

    const community = await prisma.community.findUnique({
      where: { id: communityId },
    });

    await prisma.communityMember.update({
      where: {
        communityId_userId: {
          communityId,
          userId: authUser.id,
        },
      },
      data: { status: "BANNED", deletedAt: new Date() },
    });

    await createAuditLog({
      userId: authUser.id,
      actionType: AuditActions.COMMUNITY_MEMBER_LEAVE,
      resourceName: "Community",
      resourceId: communityId,
    });

    await prisma.activityHistory.create({
      data: {
        userId: authUser.id,
        action: "COMMUNITY_MEMBER_LEAVE",
        details: { communityId, communityName: community?.name || communityId },
      },
    });

    return c.json({
      success: true,
      message: "Berhasil meninggalkan komunitas",
    });
  }
);

// ==========================================
// 15. LIST JOIN REQUESTS (Admin)
// ==========================================

communityRoutes.get(
  "/:communityId/join-requests",
  authMiddleware,
  requireCommunityAdmin,
  async (c) => {
    const communityId = c.req.param("communityId") as string;
    const url = new URL(c.req.url);
    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1") || 1);
    const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get("limit") || "20") || 20));
    const search = url.searchParams.get("search") || "";
    const statusFilter = url.searchParams.get("status") || "PENDING";

    const where: any = { communityId };

    if (statusFilter !== "all") {
      where.status = statusFilter;
    }

    if (search) {
      where.user = {
        name: { contains: search },
      };
    }

    const [requests, total] = await Promise.all([
      prisma.joinRequest.findMany({
        where,
        include: {
          user: {
            select: { id: true, name: true, email: true, avatar: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.joinRequest.count({ where }),
    ]);

    return c.json({
      success: true,
      data: requests.map((r) => ({
        id: r.id,
        userId: r.userId,
        user: r.user,
        message: r.message,
        status: r.status,
        createdAt: r.createdAt,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  }
);

// ==========================================
// 16. APPROVE/REJECT JOIN REQUEST
// ==========================================

communityRoutes.put(
  "/:communityId/join-requests/:requestId",
  authMiddleware,
  requireCommunityAdmin,
  validate(handleJoinRequestSchema),
  async (c) => {
    const authUser = c.get("user");
    const communityId = c.req.param("communityId") as string;
    const requestId = c.req.param("requestId") as string;
    const data = c.get("validated");

    const request = await prisma.joinRequest.findUnique({
      where: { id: requestId },
      include: {
        user: { select: { id: true, name: true } },
      },
    });

    if (!request || request.communityId !== communityId) {
      return c.json({ success: false, message: "Permintaan tidak ditemukan" }, 404);
    }

    if (request.status !== "PENDING") {
      return c.json(
        { success: false, message: "Permintaan sudah diproses sebelumnya" },
        400
      );
    }

    const community = await prisma.community.findUnique({
      where: { id: communityId },
    });

    const newStatus = data.action === "approve" ? "APPROVED" : "REJECTED";

    await prisma.joinRequest.update({
      where: { id: requestId },
      data: { status: newStatus },
    });

    if (data.action === "approve") {
      await prisma.communityMember.create({
        data: {
          communityId,
          userId: request.userId,
          role: "MEMBER",
          status: "ACTIVE",
        },
      });

      await prisma.activityHistory.create({
        data: {
          userId: request.userId,
          action: "COMMUNITY_MEMBER_JOIN",
          details: { communityId, communityName: community?.name || communityId },
        },
      });
    }

    await prisma.activityHistory.create({
      data: {
        userId: authUser.id,
        action: "COMMUNITY_JOIN_REQUEST_HANDLE",
        details: {
          communityId,
          action: data.action,
          requestUserName: request.user.name,
        },
      },
    });

    await createAuditLog({
      userId: authUser.id,
      actionType:
        data.action === "approve"
          ? AuditActions.COMMUNITY_MEMBER_JOIN
          : AuditActions.COMMUNITY_UPDATE,
      resourceName: "Community",
      resourceId: communityId,
      afterData: {
        action: data.action,
        targetUserId: request.userId,
        targetUserName: request.user.name,
      },
    });

    return c.json({
      success: true,
      message:
        data.action === "approve"
          ? "Permintaan bergabung disetujui"
          : "Permintaan bergabung ditolak",
      data: {
        requestId,
        status: newStatus,
      },
    });
  }
);

// ==========================================
// 17. LIST MEMBERS
// ==========================================

communityRoutes.get(
  "/:communityId/members",
  authMiddleware,
  async (c) => {
    const authUser = c.get("user");
    const communityId = c.req.param("communityId") as string;

    const community = await prisma.community.findUnique({ where: { id: communityId } });
    if (!community || community.deletedAt) {
      return c.json({ success: false, message: "Komunitas tidak ditemukan" }, 404);
    }

    const isMember = await prisma.communityMember.findUnique({
      where: {
        communityId_userId: {
          communityId,
          userId: authUser.id,
        },
      },
      select: { id: true },
    });

    if (community.visibility === "PRIVATE" && !isMember) {
      return c.json({ success: false, message: "Komunitas ini bersifat privat" }, 403);
    }

    const url = new URL(c.req.url);
    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1") || 1);
    const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get("limit") || "20") || 20));
    const search = url.searchParams.get("search") || "";
    const roleFilter = url.searchParams.get("role") || "";
    const sort = url.searchParams.get("sort") || "asc";
    const orderByParam = url.searchParams.get("orderBy") || "joinedAt";

    const where: any = {
      communityId,
      status: "ACTIVE",
    };

    if (roleFilter) {
      where.role = roleFilter;
    }

    if (search) {
      where.user = {
        OR: [
          { name: { contains: search } },
          { username: { contains: search } },
        ],
      };
    }

    const orderBy: any =
      orderByParam === "role"
        ? { role: sort as "asc" | "desc" }
        : { [orderByParam]: sort as "asc" | "desc" };

    const [members, total] = await Promise.all([
      prisma.communityMember.findMany({
        where,
        include: {
          user: {
            select: { id: true, name: true, avatar: true, bio: true, username: true },
          },
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.communityMember.count({ where }),
    ]);

    return c.json({
      success: true,
      data: members.map((m) => ({
        id: m.id,
        user: m.user,
        role: m.role,
        status: m.status,
        joinedAt: m.joinedAt,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  }
);

// ==========================================
// 18. REMOVE MEMBER (Admin)
// ==========================================

communityRoutes.delete(
  "/:communityId/members/:memberId",
  authMiddleware,
  requireCommunityAdmin,
  async (c) => {
    const authUser = c.get("user");
    const communityId = c.req.param("communityId") as string;
    const memberId = c.req.param("memberId") as string;

    const member = await prisma.communityMember.findUnique({
      where: { id: memberId },
      include: {
        user: { select: { id: true, name: true } },
      },
    });

    if (!member || member.communityId !== communityId) {
      return c.json({ success: false, message: "Anggota tidak ditemukan" }, 404);
    }

    if (member.role === "OWNER") {
      return c.json(
        { success: false, message: "Tidak bisa menghapus owner" },
        403
      );
    }

    if (member.userId === authUser.id) {
      return c.json(
        { success: false, message: "Tidak bisa menghapus diri sendiri" },
        400
      );
    }

    const community = await prisma.community.findUnique({ where: { id: communityId } });
    if (!community || community.deletedAt) {
      return c.json({ success: false, message: "Komunitas tidak ditemukan" }, 404);
    }
    const isOwner = community.ownerId === authUser.id;

    if (member.role === "ADMIN" && !isOwner) {
      return c.json(
        { success: false, message: "Hanya owner yang dapat menghapus admin" },
        403
      );
    }

    await prisma.communityMember.update({
      where: { id: memberId },
      data: { status: "BANNED", deletedAt: new Date() },
    });

    await createAuditLog({
      userId: authUser.id,
      actionType: AuditActions.COMMUNITY_ROLE_CHANGE,
      resourceName: "Community",
      resourceId: communityId,
      afterData: {
        action: "remove_member",
        targetUserId: member.userId,
        targetUserName: member.user.name,
        previousRole: member.role,
      },
    });

    await prisma.activityHistory.create({
      data: {
        userId: authUser.id,
        action: "COMMUNITY_MEMBER_REMOVE",
        details: {
          communityId,
          communityName: community?.name || communityId,
          memberName: member.user.name,
          memberId: member.userId,
        },
      },
    });

    return c.json({
      success: true,
      message: `Anggota "${member.user.name}" berhasil dihapus dari komunitas`,
    });
  }
);

// ==========================================
// 19. CHANGE MEMBER ROLE (Owner)
// ==========================================

communityRoutes.put(
  "/:communityId/members/:memberId/role",
  authMiddleware,
  requireCommunityOwner,
  validate(changeMemberRoleSchema),
  async (c) => {
    const authUser = c.get("user");
    const communityId = c.req.param("communityId") as string;
    const memberId = c.req.param("memberId") as string;
    const data = c.get("validated");

    const member = await prisma.communityMember.findUnique({
      where: { id: memberId },
      include: {
        user: { select: { id: true, name: true } },
      },
    });

    if (!member || member.communityId !== communityId) {
      return c.json({ success: false, message: "Anggota tidak ditemukan" }, 404);
    }

    if (member.role === "OWNER") {
      return c.json(
        { success: false, message: "Tidak bisa mengubah role owner" },
        403
      );
    }

    if (member.userId === authUser.id) {
      return c.json(
        { success: false, message: "Tidak bisa mengubah role sendiri" },
        400
      );
    }

    if (member.status !== "ACTIVE") {
      return c.json(
        { success: false, message: "Hanya bisa mengubah role anggota aktif" },
        400
      );
    }

    const beforeRole = member.role;
    const newRole = data.role;

    if (beforeRole === newRole) {
      return c.json(
        { success: false, message: "Role sudah sesuai" },
        400
      );
    }

    const community = await prisma.community.findUnique({
      where: { id: communityId },
    });

    await prisma.communityMember.update({
      where: { id: memberId },
      data: { role: newRole },
    });

    await createAuditLog({
      userId: authUser.id,
      actionType: AuditActions.COMMUNITY_ROLE_CHANGE,
      resourceName: "Community",
      resourceId: communityId,
      beforeData: { role: beforeRole, targetUserId: member.userId },
      afterData: { role: newRole, targetUserId: member.userId },
    });

    await prisma.activityHistory.create({
      data: {
        userId: authUser.id,
        action: "COMMUNITY_ROLE_CHANGE",
        details: {
          communityId,
          communityName: community?.name || communityId,
          memberName: member.user.name,
          memberId: member.userId,
          oldRole: beforeRole,
          newRole,
        },
      },
    });

    return c.json({
      success: true,
      message: `Role "${member.user.name}" berhasil diubah dari ${beforeRole} ke ${newRole}`,
      data: {
        memberId,
        userId: member.userId,
        previousRole: beforeRole,
        newRole,
      },
    });
  }
);

// ==========================================
// 20. GET MEMBERSHIP HISTORY (Admin)
// ==========================================

communityRoutes.get(
  "/:communityId/members/history",
  authMiddleware,
  requireCommunityAdmin,
  async (c) => {
    const communityId = c.req.param("communityId") as string;
    const url = new URL(c.req.url);
    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1") || 1);
    const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get("limit") || "20") || 20));
    const search = url.searchParams.get("search") || "";
    const actionFilter = url.searchParams.get("action") || "";

    const where: any = {
      communityId,
    };

    if (actionFilter) {
      where.action = actionFilter;
    }

    if (search) {
      where.details = { path: ["communityName"], string_contains: search };
    }

    const [history, total] = await Promise.all([
      prisma.membershipHistory.findMany({
        where,
        include: {
          user: {
            select: { id: true, name: true, avatar: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.membershipHistory.count({ where }),
    ]);

    return c.json({
      success: true,
      data: history.map((h) => ({
        id: h.id,
        userId: h.userId,
        user: h.user,
        action: h.action,
        oldRole: h.oldRole,
        newRole: h.newRole,
        details: h.details,
        performedBy: h.performedBy,
        createdAt: h.createdAt,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  }
);
