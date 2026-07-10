import { Hono } from "hono";
import { prisma } from "@komunaid/database";
import {
  createOrganizationSchema,
  updateOrganizationSchema,
  organizationQuerySchema,
  updateOrganizationSettingsSchema,
  changeOrganizationMemberRoleSchema,
  updateOrganizationProfileSchema,
  updateOrganizationBannerSchema,
  updateOrganizationLogoSchema,
} from "@komunaid/shared";
import { authMiddleware, optionalAuthMiddleware } from "../middleware/auth";
import {
  requireOrganizationOwner,
  requireOrganizationAdmin,
} from "../middleware/rbac";
import { validate } from "../middleware/validate";
import { createAuditLog, AuditActions } from "../services/audit";
import type { AuthUser } from "../middleware/auth";

type Env = { Variables: { user: AuthUser; validated: any; userRoles: string[] } };

export const organizationRoutes = new Hono<Env>();

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// ==========================================
// 1. LIST ORGANIZATIONS (Public)
// ==========================================

organizationRoutes.get("/", optionalAuthMiddleware, validate(organizationQuerySchema, "query"), async (c) => {
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

  if (q.categoryId) {
    where.categories = { some: { categoryId: q.categoryId } };
  }

  const orderBy: any =
    q.orderBy === "memberCount"
      ? { members: { _count: q.sort as "asc" | "desc" } }
      : { [q.orderBy]: q.sort };

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
        categories: {
          include: { category: true },
        },
        tags: true,
      },
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.organization.count({ where }),
  ]);

  return c.json({
    success: true,
    data: organizations.map((o) => ({
      id: o.id,
      name: o.name,
      slug: o.slug,
      description: o.description,
      logo: o.logo,
      banner: o.banner,
      location: o.location,
      website: o.website,
      industry: o.industry,
      status: o.status,
      visibility: o.visibility,
      owner: o.owner,
      memberCount: o._count.members,
      eventCount: o._count.events,
      categories: o.categories.map((oc) => oc.category),
      tags: o.tags.map((t) => t.tag),
      createdAt: o.createdAt,
      updatedAt: o.updatedAt,
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
// MY ORGANIZATION SUBMISSIONS
// ==========================================

organizationRoutes.get("/my/submissions", authMiddleware, async (c) => {
  const authUser = c.get("user");
  const url = new URL(c.req.url);
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = parseInt(url.searchParams.get("limit") || "10");
  const status = url.searchParams.get("status") || "";

  const where: any = {
    ownerId: authUser.id,
    deletedAt: null,
  };

  if (status) {
    where.status = status;
  }

  const [organizations, total] = await Promise.all([
    prisma.organization.findMany({
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
    prisma.organization.count({ where }),
  ]);

  return c.json({
    success: true,
    data: organizations.map((org) => ({
      id: org.id,
      name: org.name,
      slug: org.slug,
      description: org.description,
      logo: org.logo,
      banner: org.banner,
      status: org.status,
      visibility: org.visibility,
      adminNote: org.adminNote,
      submittedAt: org.submittedAt,
      reviewedAt: org.reviewedAt,
      categories: org.categories.map((oc) => oc.category),
      tags: org.tags.map((t) => t.tag),
      memberCount: org._count.members,
      createdAt: org.createdAt,
      updatedAt: org.updatedAt,
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
// 2. GET ORGANIZATION BY SLUG (Public)
// ==========================================

organizationRoutes.get("/:slug", optionalAuthMiddleware, async (c) => {
  const slug = c.req.param("slug") as string;
  const user = c.get("user");

  const organization = await prisma.organization.findUnique({
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

  if (!organization || organization.deletedAt) {
    return c.json({ success: false, message: "Organisasi tidak ditemukan" }, 404);
  }

  if (!user && organization.visibility === "PRIVATE") {
    return c.json({ success: false, message: "Organisasi ini bersifat privat" }, 403);
  }

  let userMembership: { role: string; status: string } | null = null;
  if (user) {
    const membership = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId: organization.id,
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
      id: organization.id,
      name: organization.name,
      slug: organization.slug,
      description: organization.description,
      logo: organization.logo,
      banner: organization.banner,
      location: organization.location,
      website: organization.website,
      industry: organization.industry,
      country: organization.country,
      province: organization.province,
      city: organization.city,
      instagram: organization.instagram,
      contactEmail: organization.contactEmail,
      contactPhone: organization.contactPhone,
      status: organization.status,
      visibility: organization.visibility,
      owner: organization.owner,
      memberCount: organization._count.members,
      eventCount: organization._count.events,
      membersPreview: organization.members.map((m) => ({
        id: m.user.id,
        name: m.user.name,
        avatar: m.user.avatar,
        role: m.role,
      })),
      upcomingEvents: organization.events,
      categories: organization.categories.map((oc) => oc.category),
      tags: organization.tags.map((t) => t.tag),
      settings: organization.settings
        ? {
            showMemberList: organization.settings.showMemberList,
            showEventList: organization.settings.showEventList,
          }
        : null,
      userMembership,
      createdAt: organization.createdAt,
      updatedAt: organization.updatedAt,
    },
  });
});

// ==========================================
// 3. CREATE ORGANIZATION
// ==========================================

organizationRoutes.post("/", authMiddleware, validate(createOrganizationSchema), async (c) => {
  const authUser = c.get("user");
  const data = c.get("validated");

  const slug = slugify(data.name);

  const existingSlug = await prisma.organization.findUnique({ where: { slug } });
  const finalSlug = existingSlug ? `${slug}-${Date.now()}` : slug;

  const { categoryIds, tags, ...orgData } = data;

  const organization = await prisma.organization.create({
    data: {
      ...orgData,
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
    actionType: AuditActions.ORG_CREATE,
    resourceName: "Organization",
    resourceId: organization.id,
    afterData: { name: organization.name, slug: organization.slug },
  });

  await prisma.activityHistory.create({
    data: {
      userId: authUser.id,
      action: "ORG_CREATE",
      details: { organizationId: organization.id, organizationName: organization.name },
    },
  });

  return c.json(
    {
      success: true,
      message: "Organisasi berhasil dibuat sebagai draft",
      data: {
        id: organization.id,
        name: organization.name,
        slug: organization.slug,
        status: organization.status,
        visibility: organization.visibility,
        memberCount: organization._count.members,
        categories: organization.categories.map((oc) => oc.category),
        tags: organization.tags.map((t) => t.tag),
        createdAt: organization.createdAt,
      },
    },
    201
  );
});

// ==========================================
// UPDATE ORGANIZATION (DRAFT/REVISION)
// ==========================================

organizationRoutes.patch(
  "/:organizationId",
  authMiddleware,
  validate(updateOrganizationSchema),
  async (c) => {
    const authUser = c.get("user");
    const organizationId = c.req.param("organizationId") as string;
    const data = c.get("validated");

    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!organization || organization.deletedAt) {
      return c.json({ success: false, message: "Organisasi tidak ditemukan" }, 404);
    }

    if (organization.ownerId !== authUser.id) {
      return c.json({ success: false, message: "Hanya pemilik yang dapat mengedit organisasi" }, 403);
    }

    if (organization.status !== "DRAFT" && organization.status !== "REVISION_REQUIRED") {
      return c.json({ success: false, message: "Organisasi hanya dapat diedit dalam status draft atau revision" }, 400);
    }

    const before = await prisma.organization.findUnique({ where: { id: organizationId } });

    const { categoryIds, tags, ...updateData } = data as any;

    const updated = await prisma.organization.update({
      where: { id: organizationId },
      data: updateData,
    });

    if (categoryIds !== undefined) {
      await prisma.organizationCategory.deleteMany({ where: { organizationId } });
      if (categoryIds.length > 0) {
        await prisma.organizationCategory.createMany({
          data: categoryIds.map((categoryId: string) => ({ organizationId, categoryId })),
        });
      }
    }

    if (tags !== undefined) {
      await prisma.organizationTag.deleteMany({ where: { organizationId } });
      if (tags.length > 0) {
        await prisma.organizationTag.createMany({
          data: tags.map((tag: string) => ({ organizationId, tag })),
        });
      }
    }

    await createAuditLog({
      userId: authUser.id,
      actionType: AuditActions.ORG_UPDATE,
      resourceName: "Organization",
      resourceId: organizationId,
      beforeData: { name: before?.name },
      afterData: { name: updated.name },
    });

    return c.json({
      success: true,
      message: "Organisasi berhasil diupdate",
      data: { id: updated.id, name: updated.name, status: updated.status },
    });
  }
);

// ==========================================
// SUBMIT ORGANIZATION FOR REVIEW
// ==========================================

organizationRoutes.post(
  "/:organizationId/submit",
  authMiddleware,
  async (c) => {
    const authUser = c.get("user");
    const organizationId = c.req.param("organizationId") as string;

    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!organization || organization.deletedAt) {
      return c.json({ success: false, message: "Organisasi tidak ditemukan" }, 404);
    }

    if (organization.ownerId !== authUser.id) {
      return c.json({ success: false, message: "Hanya pemilik yang dapat mengirim submission" }, 403);
    }

    if (organization.status !== "DRAFT" && organization.status !== "REVISION_REQUIRED") {
      return c.json({ success: false, message: "Organisasi tidak dapat dikirim untuk review" }, 400);
    }

    const updated = await prisma.organization.update({
      where: { id: organizationId },
      data: {
        status: "PENDING",
        submittedAt: new Date(),
      },
    });

    await createAuditLog({
      userId: authUser.id,
      actionType: AuditActions.ORG_SUBMITTED,
      resourceName: "Organization",
      resourceId: organizationId,
      beforeData: { status: organization.status },
      afterData: { status: "PENDING" },
    });

    await prisma.activityHistory.create({
      data: {
        userId: authUser.id,
        action: "ORG_SUBMITTED",
        details: { organizationId, organizationName: organization.name },
      },
    });

    return c.json({
      success: true,
      message: "Organisasi berhasil dikirim untuk review",
      data: { id: updated.id, status: updated.status },
    });
  }
);

// ==========================================
// 4. UPDATE ORGANIZATION (Owner/Admin)
// ==========================================

organizationRoutes.put(
  "/:organizationId",
  authMiddleware,
  requireOrganizationAdmin,
  validate(updateOrganizationSchema),
  async (c) => {
    const authUser = c.get("user");
    const organizationId = c.req.param("organizationId") as string;
    const data = c.get("validated");

    const before = await prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!before || before.deletedAt) {
      return c.json({ success: false, message: "Organisasi tidak ditemukan" }, 404);
    }

    const { categoryIds, tags, ...updateData } = data;

    const organization = await prisma.organization.update({
      where: { id: organizationId },
      data: updateData,
    });

    if (categoryIds !== undefined) {
      await prisma.organizationCategory.deleteMany({ where: { organizationId } });
      if (categoryIds.length > 0) {
        await prisma.organizationCategory.createMany({
          data: categoryIds.map((categoryId: string) => ({
            organizationId,
            categoryId,
          })),
        });
      }
    }

    if (tags !== undefined) {
      await prisma.organizationTag.deleteMany({ where: { organizationId } });
      if (tags.length > 0) {
        await prisma.organizationTag.createMany({
          data: tags.map((tag: string) => ({ organizationId, tag })),
        });
      }
    }

    await createAuditLog({
      userId: authUser.id,
      actionType: AuditActions.ORG_UPDATE,
      resourceName: "Organization",
      resourceId: organizationId,
      beforeData: { name: before.name, description: before.description },
      afterData: { name: organization.name, description: organization.description },
    });

    return c.json({
      success: true,
      message: "Organisasi berhasil diupdate",
      data: {
        id: organization.id,
        name: organization.name,
        slug: organization.slug,
        description: organization.description,
      },
    });
  }
);

// ==========================================
// 5. ARCHIVE ORGANIZATION
// ==========================================

organizationRoutes.post(
  "/:organizationId/archive",
  authMiddleware,
  requireOrganizationOwner,
  async (c) => {
    const authUser = c.get("user");
    const organizationId = c.req.param("organizationId") as string;

    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!organization || organization.deletedAt) {
      return c.json({ success: false, message: "Organisasi tidak ditemukan" }, 404);
    }

    if (organization.status === "ARCHIVED") {
      return c.json({ success: false, message: "Organisasi sudah diarsipkan" }, 400);
    }

    const beforeStatus = organization.status;

    await prisma.organization.update({
      where: { id: organizationId },
      data: { status: "ARCHIVED" },
    });

    await createAuditLog({
      userId: authUser.id,
      actionType: AuditActions.ORG_SUSPEND,
      resourceName: "Organization",
      resourceId: organizationId,
      beforeData: { status: beforeStatus },
      afterData: { status: "ARCHIVED" },
    });

    return c.json({
      success: true,
      message: "Organisasi berhasil diarsipkan",
      data: { id: organizationId, status: "ARCHIVED" },
    });
  }
);

// ==========================================
// 6. GET ORGANIZATION DASHBOARD
// ==========================================

organizationRoutes.get(
  "/:organizationId/dashboard",
  authMiddleware,
  requireOrganizationAdmin,
  async (c) => {
    const organizationId = c.req.param("organizationId") as string;

    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
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

    if (!organization || organization.deletedAt) {
      return c.json({ success: false, message: "Organisasi tidak ditemukan" }, 404);
    }

    const [pendingJoinRequestCount, activeEventCount, recentActivity] =
      await Promise.all([
        prisma.joinRequest.count({
          where: { organizationId: organizationId, status: "PENDING" },
        }),
        prisma.event.count({
          where: { organizationId, status: "PUBLISHED", eventDate: { gte: new Date() } },
        }),
        prisma.membershipHistory.findMany({
          where: { organizationId },
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
        organizationInfo: {
          id: organization.id,
          name: organization.name,
          slug: organization.slug,
          description: organization.description,
          logo: organization.logo,
          banner: organization.banner,
          location: organization.location,
          website: organization.website,
          industry: organization.industry,
          country: organization.country,
          province: organization.province,
          city: organization.city,
          instagram: organization.instagram,
          contactEmail: organization.contactEmail,
          contactPhone: organization.contactPhone,
          status: organization.status,
          visibility: organization.visibility,
          owner: organization.owner,
          settings: organization.settings,
          tags: organization.tags.map((t) => t.tag),
          createdAt: organization.createdAt,
        },
        memberCount: organization._count.members,
        eventCount: organization._count.events,
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
// 7. GET ORGANIZATION INSIGHT
// ==========================================

organizationRoutes.get(
  "/:organizationId/insight",
  authMiddleware,
  requireOrganizationAdmin,
  async (c) => {
    const organizationId = c.req.param("organizationId") as string;

    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!organization || organization.deletedAt) {
      return c.json({ success: false, message: "Organisasi tidak ditemukan" }, 404);
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
      prisma.organizationMember.count({
        where: { organizationId, status: "ACTIVE" },
      }),
      prisma.joinRequest.count({
        where: { organizationId: organizationId, status: "PENDING" },
      }),
      prisma.organizationMember.count({
        where: {
          organizationId,
          status: "ACTIVE",
          joinedAt: { gte: sevenDaysAgo },
        },
      }),
      prisma.organizationMember.count({
        where: {
          organizationId,
          status: "ACTIVE",
          joinedAt: { gte: fourteenDaysAgo, lt: sevenDaysAgo },
        },
      }),
      prisma.joinRequest.findMany({
        where: { organizationId: organizationId, status: "PENDING" },
        include: {
          user: { select: { id: true, name: true, avatar: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      prisma.organizationMember.findMany({
        where: { organizationId, status: "ACTIVE" },
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
// 8. UPDATE ORGANIZATION PROFILE
// ==========================================

organizationRoutes.put(
  "/:organizationId/profile",
  authMiddleware,
  requireOrganizationAdmin,
  validate(updateOrganizationProfileSchema),
  async (c) => {
    const authUser = c.get("user");
    const organizationId = c.req.param("organizationId") as string;
    const data = c.get("validated");

    const {
      name, description, location, website, industry,
      country, province, city, instagram, contactEmail, contactPhone,
    } = data as {
      name?: string; description?: string; location?: string; website?: string; industry?: string;
      country?: string; province?: string; city?: string; instagram?: string; contactEmail?: string; contactPhone?: string;
    };

    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!organization || organization.deletedAt) {
      return c.json({ success: false, message: "Organisasi tidak ditemukan" }, 404);
    }

    const updated = await prisma.organization.update({
      where: { id: organizationId },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(location !== undefined && { location }),
        ...(website !== undefined && { website }),
        ...(industry !== undefined && { industry }),
        ...(country !== undefined && { country }),
        ...(province !== undefined && { province }),
        ...(city !== undefined && { city }),
        ...(instagram !== undefined && { instagram }),
        ...(contactEmail !== undefined && { contactEmail }),
        ...(contactPhone !== undefined && { contactPhone }),
      },
    });

    await createAuditLog({
      userId: authUser.id,
      actionType: AuditActions.ORG_UPDATE,
      resourceName: "Organization",
      resourceId: organizationId,
      beforeData: {
        name: organization.name,
        description: organization.description,
      },
      afterData: {
        name: updated.name,
        description: updated.description,
      },
    });

    return c.json({
      success: true,
      message: "Profil organisasi berhasil diupdate",
      data: {
        id: updated.id,
        name: updated.name,
        description: updated.description,
        location: updated.location,
        website: updated.website,
        industry: updated.industry,
        country: updated.country,
        province: updated.province,
        city: updated.city,
        instagram: updated.instagram,
        contactEmail: updated.contactEmail,
        contactPhone: updated.contactPhone,
      },
    });
  }
);

// ==========================================
// 9. UPDATE ORGANIZATION BANNER
// ==========================================

organizationRoutes.put(
  "/:organizationId/banner",
  authMiddleware,
  requireOrganizationAdmin,
  validate(updateOrganizationBannerSchema),
  async (c) => {
    const authUser = c.get("user");
    const organizationId = c.req.param("organizationId") as string;
    const data = c.get("validated");
    const { banner } = data as { banner?: string };

    if (!banner) {
      return c.json({ success: false, message: "URL banner wajib diisi" }, 400);
    }

    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!organization || organization.deletedAt) {
      return c.json({ success: false, message: "Organisasi tidak ditemukan" }, 404);
    }

    const updated = await prisma.organization.update({
      where: { id: organizationId },
      data: { banner },
    });

    await createAuditLog({
      userId: authUser.id,
      actionType: AuditActions.ORG_UPDATE,
      resourceName: "Organization",
      resourceId: organizationId,
      beforeData: { banner: organization.banner },
      afterData: { banner: updated.banner },
    });

    return c.json({
      success: true,
      message: "Banner organisasi berhasil diupdate",
      data: { id: updated.id, banner: updated.banner },
    });
  }
);

// ==========================================
// 10. UPDATE ORGANIZATION LOGO
// ==========================================

organizationRoutes.put(
  "/:organizationId/logo",
  authMiddleware,
  requireOrganizationAdmin,
  validate(updateOrganizationLogoSchema),
  async (c) => {
    const authUser = c.get("user");
    const organizationId = c.req.param("organizationId") as string;
    const data = c.get("validated");
    const { logo } = data as { logo?: string };

    if (!logo) {
      return c.json({ success: false, message: "URL logo wajib diisi" }, 400);
    }

    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!organization || organization.deletedAt) {
      return c.json({ success: false, message: "Organisasi tidak ditemukan" }, 404);
    }

    const updated = await prisma.organization.update({
      where: { id: organizationId },
      data: { logo },
    });

    await createAuditLog({
      userId: authUser.id,
      actionType: AuditActions.ORG_UPDATE,
      resourceName: "Organization",
      resourceId: organizationId,
      beforeData: { logo: organization.logo },
      afterData: { logo: updated.logo },
    });

    return c.json({
      success: true,
      message: "Logo organisasi berhasil diupdate",
      data: { id: updated.id, logo: updated.logo },
    });
  }
);

// ==========================================
// 11. GET ORGANIZATION SETTINGS
// ==========================================

organizationRoutes.get(
  "/:organizationId/settings",
  authMiddleware,
  requireOrganizationAdmin,
  async (c) => {
    const organizationId = c.req.param("organizationId") as string;

    const settings = await prisma.organizationSettings.findUnique({
      where: { organizationId },
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
// 12. UPDATE ORGANIZATION SETTINGS
// ==========================================

organizationRoutes.put(
  "/:organizationId/settings",
  authMiddleware,
  requireOrganizationAdmin,
  validate(updateOrganizationSettingsSchema),
  async (c) => {
    const authUser = c.get("user");
    const organizationId = c.req.param("organizationId") as string;
    const data = c.get("validated");

    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!organization || organization.deletedAt) {
      return c.json({ success: false, message: "Organisasi tidak ditemukan" }, 404);
    }

    const before = await prisma.organizationSettings.findUnique({
      where: { organizationId },
    });

    const settings = await prisma.organizationSettings.upsert({
      where: { organizationId },
      update: data,
      create: {
        organizationId,
        allowMemberPost: data.allowMemberPost ?? true,
        requireApproval: data.requireApproval ?? false,
        showMemberList: data.showMemberList ?? true,
        showEventList: data.showEventList ?? true,
      },
    });

    await createAuditLog({
      userId: authUser.id,
      actionType: AuditActions.SETTINGS_UPDATE,
      resourceName: "OrganizationSettings",
      resourceId: organizationId,
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
      message: "Settings organisasi berhasil diupdate",
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
// 13. JOIN ORGANIZATION
// ==========================================

organizationRoutes.post(
  "/:organizationId/join",
  authMiddleware,
  async (c) => {
    const authUser = c.get("user");
    const organizationId = c.req.param("organizationId") as string;

    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!organization || organization.deletedAt) {
      return c.json({ success: false, message: "Organisasi tidak ditemukan" }, 404);
    }

    if (organization.status !== "APPROVED") {
      return c.json({ success: false, message: "Organisasi belum disetujui" }, 400);
    }

    if (organization.visibility === "PRIVATE") {
      return c.json({ success: false, message: "Organisasi ini bersifat privat" }, 403);
    }

    const existingMember = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId,
          userId: authUser.id,
        },
      },
    });

    if (existingMember) {
      if (existingMember.status === "BANNED") {
        return c.json(
          { success: false, message: "Anda telah dibanned dari organisasi ini" },
          403
        );
      }
      return c.json({ success: false, message: "Sudah menjadi anggota" }, 409);
    }

    const settings = await prisma.organizationSettings.findUnique({
      where: { organizationId },
    });

    if (settings?.requireApproval) {
      const existingRequest = await prisma.joinRequest.findFirst({
        where: {
          organizationId,
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
          organizationId,
          userId: authUser.id,
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

    const member = await prisma.organizationMember.create({
      data: {
        organizationId,
        userId: authUser.id,
        role: "MEMBER",
        status: "ACTIVE",
      },
    });

    await createAuditLog({
      userId: authUser.id,
      actionType: AuditActions.ORG_MEMBER_JOIN,
      resourceName: "Organization",
      resourceId: organizationId,
    });

    await prisma.notification.create({
      data: {
        userId: organization.ownerId,
        title: "Anggota Baru Bergabung",
        message: `${authUser.name} telah bergabung dengan organisasi "${organization.name}".`,
        type: "ORGANIZATION",
        link: `/organizations/${organization.slug}`,
      },
    });

    await prisma.activityHistory.create({
      data: {
        userId: authUser.id,
        action: "ORG_MEMBER_JOIN",
        details: { organizationId, organizationName: organization.name },
      },
    });

    return c.json({
      success: true,
      message: "Berhasil bergabung dengan organisasi",
      data: { memberId: member.id, role: member.role, status: member.status },
    });
  }
);

// ==========================================
// 14. LEAVE ORGANIZATION
// ==========================================

organizationRoutes.post(
  "/:organizationId/leave",
  authMiddleware,
  async (c) => {
    const authUser = c.get("user");
    const organizationId = c.req.param("organizationId") as string;

    const membership = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId,
          userId: authUser.id,
        },
      },
    });

    if (!membership) {
      return c.json({ success: false, message: "Bukan anggota organisasi" }, 400);
    }

    if (membership.role === "OWNER") {
      return c.json(
        { success: false, message: "Owner tidak bisa meninggalkan organisasi" },
        400
      );
    }

    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
    });

    await prisma.organizationMember.update({
      where: {
        organizationId_userId: {
          organizationId,
          userId: authUser.id,
        },
      },
      data: { status: "BANNED", deletedAt: new Date() },
    });

    await createAuditLog({
      userId: authUser.id,
      actionType: AuditActions.ORG_MEMBER_LEAVE,
      resourceName: "Organization",
      resourceId: organizationId,
    });

    await prisma.activityHistory.create({
      data: {
        userId: authUser.id,
        action: "ORG_MEMBER_LEAVE",
        details: { organizationId, organizationName: organization?.name || organizationId },
      },
    });

    return c.json({
      success: true,
      message: "Berhasil meninggalkan organisasi",
    });
  }
);

// ==========================================
// 15. LIST JOIN REQUESTS (Admin)
// ==========================================

organizationRoutes.get(
  "/:organizationId/join-requests",
  authMiddleware,
  requireOrganizationAdmin,
  async (c) => {
    const organizationId = c.req.param("organizationId") as string;
    const url = new URL(c.req.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "20");
    const search = url.searchParams.get("search") || "";
    const statusFilter = url.searchParams.get("status") || "PENDING";

    const where: any = { organizationId };

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

organizationRoutes.put(
  "/:organizationId/join-requests/:requestId",
  authMiddleware,
  requireOrganizationAdmin,
  async (c) => {
    const authUser = c.get("user");
    const organizationId = c.req.param("organizationId") as string;
    const requestId = c.req.param("requestId") as string;
    const body = await c.req.json();
    const { action } = body;

    const request = await prisma.joinRequest.findUnique({
      where: { id: requestId },
      include: {
        user: { select: { id: true, name: true } },
      },
    });

    if (!request || request.organizationId !== organizationId) {
      return c.json({ success: false, message: "Permintaan tidak ditemukan" }, 404);
    }

    if (request.status !== "PENDING") {
      return c.json(
        { success: false, message: "Permintaan sudah diproses sebelumnya" },
        400
      );
    }

    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
    });

    const newStatus = action === "approve" ? "APPROVED" : "REJECTED";

    await prisma.joinRequest.update({
      where: { id: requestId },
      data: { status: newStatus },
    });

    if (action === "approve") {
      await prisma.organizationMember.create({
        data: {
          organizationId,
          userId: request.userId,
          role: "MEMBER",
          status: "ACTIVE",
        },
      });

      await prisma.activityHistory.create({
        data: {
          userId: request.userId,
          action: "ORG_MEMBER_JOIN",
          details: { organizationId, organizationName: organization?.name || organizationId },
        },
      });
    }

    await prisma.activityHistory.create({
      data: {
        userId: authUser.id,
        action: "ORG_JOIN_REQUEST_HANDLE",
        details: {
          organizationId,
          action,
          requestUserName: request.user.name,
        },
      },
    });

    await createAuditLog({
      userId: authUser.id,
      actionType:
        action === "approve"
          ? AuditActions.ORG_MEMBER_JOIN
          : AuditActions.ORG_UPDATE,
      resourceName: "Organization",
      resourceId: organizationId,
      afterData: {
        action,
        targetUserId: request.userId,
        targetUserName: request.user.name,
      },
    });

    return c.json({
      success: true,
      message:
        action === "approve"
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

organizationRoutes.get(
  "/:organizationId/members",
  authMiddleware,
  async (c) => {
    const organizationId = c.req.param("organizationId") as string;
    const url = new URL(c.req.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "20");
    const search = url.searchParams.get("search") || "";
    const roleFilter = url.searchParams.get("role") || "";
    const sort = url.searchParams.get("sort") || "asc";
    const orderByParam = url.searchParams.get("orderBy") || "joinedAt";

    const where: any = {
      organizationId,
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
      prisma.organizationMember.findMany({
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
      prisma.organizationMember.count({ where }),
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

organizationRoutes.delete(
  "/:organizationId/members/:memberId",
  authMiddleware,
  requireOrganizationAdmin,
  async (c) => {
    const authUser = c.get("user");
    const organizationId = c.req.param("organizationId") as string;
    const memberId = c.req.param("memberId") as string;

    const member = await prisma.organizationMember.findUnique({
      where: { id: memberId },
      include: {
        user: { select: { id: true, name: true } },
      },
    });

    if (!member || member.organizationId !== organizationId) {
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

    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
    });

    await prisma.organizationMember.update({
      where: { id: memberId },
      data: { status: "BANNED", deletedAt: new Date() },
    });

    await createAuditLog({
      userId: authUser.id,
      actionType: AuditActions.ORG_ROLE_CHANGE,
      resourceName: "Organization",
      resourceId: organizationId,
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
        action: "ORG_MEMBER_REMOVE",
        details: {
          organizationId,
          organizationName: organization?.name || organizationId,
          memberName: member.user.name,
          memberId: member.userId,
        },
      },
    });

    return c.json({
      success: true,
      message: `Anggota "${member.user.name}" berhasil dihapus dari organisasi`,
    });
  }
);

// ==========================================
// 19. CHANGE MEMBER ROLE (Owner)
// ==========================================

organizationRoutes.put(
  "/:organizationId/members/:memberId/role",
  authMiddleware,
  requireOrganizationOwner,
  validate(changeOrganizationMemberRoleSchema),
  async (c) => {
    const authUser = c.get("user");
    const organizationId = c.req.param("organizationId") as string;
    const memberId = c.req.param("memberId") as string;
    const data = c.get("validated");

    const member = await prisma.organizationMember.findUnique({
      where: { id: memberId },
      include: {
        user: { select: { id: true, name: true } },
      },
    });

    if (!member || member.organizationId !== organizationId) {
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

    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
    });

    await prisma.organizationMember.update({
      where: { id: memberId },
      data: { role: newRole },
    });

    await createAuditLog({
      userId: authUser.id,
      actionType: AuditActions.ORG_ROLE_CHANGE,
      resourceName: "Organization",
      resourceId: organizationId,
      beforeData: { role: beforeRole, targetUserId: member.userId },
      afterData: { role: newRole, targetUserId: member.userId },
    });

    await prisma.activityHistory.create({
      data: {
        userId: authUser.id,
        action: "ORG_ROLE_CHANGE",
        details: {
          organizationId,
          organizationName: organization?.name || organizationId,
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

organizationRoutes.get(
  "/:organizationId/members/history",
  authMiddleware,
  requireOrganizationAdmin,
  async (c) => {
    const organizationId = c.req.param("organizationId") as string;
    const url = new URL(c.req.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "20");
    const actionFilter = url.searchParams.get("action") || "";

    const where: any = {
      organizationId,
    };

    if (actionFilter) {
      where.action = actionFilter;
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
