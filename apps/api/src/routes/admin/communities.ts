import { Hono } from "hono";
import { prisma } from "@komunaid/database";
import { validate } from "../../middleware/validate";
import { requireSuperAdmin } from "../../middleware/rbac";
import { adminActionNoteSchema } from "@komunaid/shared";
import { createAuditLog, AuditActions, logAuditSnapshot, snapshotFields } from "../../services/audit";
import type { AuthUser } from "../../middleware/auth";
import { activeScope } from "../../lib/visibility-scope";
import { transitionCommunity } from "../../services/lifecycle-transition";

type Env = { Variables: { user: AuthUser; validated: any; userRoles: string[] } };
export const communitiesRoutes = new Hono<Env>();

function pagination(url: string) {
  const u = new URL(url);
  const page = Math.max(1, parseInt(u.searchParams.get("page") || "1"));
  const limit = Math.min(100, Math.max(1, parseInt(u.searchParams.get("limit") || "20")));
  const search = u.searchParams.get("search") || "";
  const sortBy = u.searchParams.get("sortBy") || "createdAt";
  const sortOrder = u.searchParams.get("sortOrder") === "asc" ? "asc" : "desc";
  return { page, limit, search, sortBy, sortOrder, skip: (page - 1) * limit };
}

communitiesRoutes.get("/communities", async (c) => {
  const { page, limit, search, sortBy, sortOrder, skip } = pagination(c.req.url);
  const url = new URL(c.req.url);
  const status = url.searchParams.get("status") || "";

  const where: Record<string, any> = { ...activeScope("community") };

  if (search) {
    where.OR = [
      { name: { contains: search } },
      { description: { contains: search } },
    ];
  }
  if (status && status !== "ALL") {
    where.status = status;
  }

  const [communities, total] = await Promise.all([
    prisma.community.findMany({
      where: where as never,
      include: {
        owner: { select: { id: true, name: true, email: true, avatar: true } },
        categories: { include: { category: true } },
        tags: true,
        _count: { select: { members: true, events: true } },
      },
      orderBy: { createdAt: sortOrder as "asc" | "desc" },
      skip,
      take: limit,
    }),
    prisma.community.count({ where: where as never }),
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
      owner: comm.owner,
      categories: comm.categories.map((cc) => cc.category),
      tags: comm.tags.map((t) => t.tag),
      memberCount: comm._count.members,
      eventCount: comm._count.events,
      createdAt: comm.createdAt,
    })),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});

communitiesRoutes.get("/communities/review-queue", async (c) => {
  const { page, limit, search, sortBy, sortOrder, skip } = pagination(c.req.url);
  const url = new URL(c.req.url);
  const status = url.searchParams.get("status") || "PENDING";

  const where: Record<string, any> = { ...activeScope("community") };

  if (search) {
    where.OR = [
      { name: { contains: search } },
      { description: { contains: search } },
    ];
  }
  if (status && status !== "ALL") {
    if (["PENDING", "REVISION_REQUIRED"].includes(status)) {
      where.status = status;
    } else {
      where.status = { in: ["PENDING", "REVISION_REQUIRED"] };
    }
  } else {
    where.status = { in: ["PENDING", "REVISION_REQUIRED"] };
  }

  const allowedSort: Record<string, string> = { createdAt: "createdAt", name: "name", status: "status", submittedAt: "submittedAt" };
  const orderBy = allowedSort[sortBy] ? { [allowedSort[sortBy]]: sortOrder } : { submittedAt: "asc" };

  const [communities, total] = await Promise.all([
    prisma.community.findMany({
      where,
      include: {
        owner: { select: { id: true, name: true, email: true, avatar: true } },
        categories: { include: { category: true } },
        tags: true,
        _count: { select: { members: true, events: true } },
      },
      orderBy: orderBy as any,
      skip,
      take: limit,
    }),
    prisma.community.count({ where }),
  ]);

  return c.json({
    success: true,
    data: communities.map((comm: any) => ({
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
      owner: comm.owner,
      categories: comm.categories.map((cc: any) => cc.category),
      tags: comm.tags.map((t: any) => t.tag),
      memberCount: comm._count.members,
      eventCount: comm._count.events,
      createdAt: comm.createdAt,
    })),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});

communitiesRoutes.get("/communities/:communityId", async (c) => {
  const communityId = c.req.param("communityId") as string;

  const community = await prisma.community.findUnique({
    where: { id: communityId },
    include: {
      owner: { select: { id: true, name: true, email: true, avatar: true, phone: true } },
      categories: { include: { category: true } },
      tags: true,
      settings: true,
      members: {
        include: { user: { select: { id: true, name: true, avatar: true } } },
        take: 20,
      },
      _count: { select: { members: true, events: true, joinRequests: true } },
    },
  });

  if (!community) {
    return c.json({ success: false, message: "Komunitas tidak ditemukan" }, 404);
  }

  return c.json({
    success: true,
    data: {
      ...community,
      categories: community.categories.map((cc) => cc.category),
      tags: community.tags.map((t) => t.tag),
      members: community.members.map((m) => ({
        id: m.id,
        role: m.role,
        status: m.status,
        joinedAt: m.joinedAt,
        user: m.user,
      })),
    },
  });
});

communitiesRoutes.put("/communities/:communityId/approve", async (c) => {
  const authUser = c.get("user");
  const communityId = c.req.param("communityId") as string;
  const actorRole = (c.get("userRoles") ?? []).includes("SUPER_ADMIN") ? "SUPER_ADMIN" : "PLATFORM_ADMIN";

  const community = await prisma.community.findUnique({ where: { id: communityId } });
  if (!community) {
    return c.json({ success: false, message: "Komunitas tidak ditemukan" }, 404);
  }

  // COMMUNITY_TRANSITIONS (services/lifecycle-transition.ts) only allows
  // PENDING -> APPROVED; REVISION_REQUIRED must first go back through PENDING
  // (owner resubmission) before it can be approved. This narrows the old
  // bespoke check, which also accepted REVISION_REQUIRED directly — see the
  // task report's "admin/communities migration" section for why.
  if (community.status !== "PENDING") {
    return c.json({ success: false, message: "Hanya komunitas pending yang dapat disetujui" }, 400);
  }

  // transitionCommunity's guarded update + AuditLog row run inside one
  // transaction; the cascade below (owner membership activation,
  // notification, MembershipHistory) now runs in that same transaction
  // instead of as separate best-effort calls afterward.
  await transitionCommunity({
    communityId,
    expectedStatus: "PENDING",
    targetStatus: "APPROVED",
    actorId: authUser.id,
    actorRole,
    data: { reviewedAt: new Date(), adminNote: null },
    auditAction: AuditActions.COMMUNITY_APPROVE,
    auditBeforeData: { status: "PENDING" },
    auditAfterData: { status: "APPROVED" },
    cascade: async (tx, before) => {
      const ownerMember = await tx.communityMember.findFirst({
        where: { communityId, role: "OWNER" },
      });
      if (ownerMember) {
        await tx.communityMember.update({
          where: { id: ownerMember.id },
          data: { status: "ACTIVE" },
        });
      }

      await tx.notification.create({
        data: {
          userId: before.ownerId,
          title: "Komunitas Disetujui",
          message: `Komunitas "${before.name}" telah disetujui oleh admin.`,
          type: "APPROVAL",
          link: `/communities/${before.slug}`,
        },
      });

      await tx.membershipHistory.create({
        data: {
          communityId,
          userId: before.ownerId,
          action: "COMMUNITY_APPROVED",
          details: { approvedBy: authUser.id },
          performedBy: authUser.id,
        },
      });
    },
  });

  return c.json({ success: true, message: "Komunitas berhasil disetujui" });
});

communitiesRoutes.put("/communities/:communityId/suspend", async (c) => {
  const authUser = c.get("user");
  const communityId = c.req.param("communityId") as string;

  const community = await prisma.community.findUnique({ where: { id: communityId } });
  if (!community) {
    return c.json({ success: false, message: "Komunitas tidak ditemukan" }, 404);
  }

  const before = { status: community.status };

  await prisma.community.update({
    where: { id: communityId },
    data: { status: "SUSPENDED" },
  });

  await createAuditLog({
    userId: authUser.id,
    actionType: AuditActions.COMMUNITY_SUSPEND,
    resourceName: "Community",
    resourceId: communityId,
    beforeData: before,
    afterData: { status: "SUSPENDED" },
  });

  await prisma.notification.create({
    data: {
      userId: community.ownerId,
      title: "Komunitas Ditangguhkan",
      message: `Komunitas "${community.name}" telah ditangguhkan oleh admin.`,
      type: "COMMUNITY",
      link: `/communities/${community.slug}`,
    },
  });

  await prisma.membershipHistory.create({
    data: {
      communityId,
      userId: community.ownerId,
      action: "COMMUNITY_SUSPENDED",
      details: { suspendedBy: authUser.id },
      performedBy: authUser.id,
    },
  });

  return c.json({ success: true, message: "Komunitas berhasil ditangguhkan" });
});

communitiesRoutes.put("/communities/:communityId/restore", async (c) => {
  const authUser = c.get("user");
  const communityId = c.req.param("communityId") as string;

  const community = await prisma.community.findUnique({ where: { id: communityId } });
  if (!community) {
    return c.json({ success: false, message: "Komunitas tidak ditemukan" }, 404);
  }

  const before = { status: community.status };

  await prisma.community.update({
    where: { id: communityId },
    data: { status: "APPROVED" },
  });

  await createAuditLog({
    userId: authUser.id,
    actionType: AuditActions.COMMUNITY_RESTORE,
    resourceName: "Community",
    resourceId: communityId,
    beforeData: before,
    afterData: { status: "APPROVED" },
  });

  await prisma.notification.create({
    data: {
      userId: community.ownerId,
      title: "Komunitas Dipulihkan",
      message: `Komunitas "${community.name}" telah dipulihkan oleh admin.`,
      type: "COMMUNITY",
      link: `/communities/${community.slug}`,
    },
  });

  return c.json({ success: true, message: "Komunitas berhasil dipulihkan" });
});

communitiesRoutes.patch("/communities/:communityId/reject", validate(adminActionNoteSchema), async (c) => {
  const authUser = c.get("user");
  const communityId = c.req.param("communityId") as string;
  const data = c.get("validated");
  const { note } = data as { note?: string };
  const actorRole = (c.get("userRoles") ?? []).includes("SUPER_ADMIN") ? "SUPER_ADMIN" : "PLATFORM_ADMIN";

  const community = await prisma.community.findUnique({ where: { id: communityId } });
  if (!community) {
    return c.json({ success: false, message: "Komunitas tidak ditemukan" }, 404);
  }

  // See the /approve handler above: COMMUNITY_TRANSITIONS only allows
  // PENDING -> REJECTED, not REVISION_REQUIRED -> REJECTED.
  if (community.status !== "PENDING") {
    return c.json({ success: false, message: "Hanya komunitas pending yang dapat ditolak" }, 400);
  }

  await transitionCommunity({
    communityId,
    expectedStatus: "PENDING",
    targetStatus: "REJECTED",
    actorId: authUser.id,
    actorRole,
    reason: note,
    data: { adminNote: note || null, reviewedAt: new Date() },
    auditAction: AuditActions.COMMUNITY_REJECTED,
    auditBeforeData: { status: "PENDING" },
    auditAfterData: { status: "REJECTED", note },
    cascade: async (tx, before) => {
      await tx.notification.create({
        data: {
          userId: before.ownerId,
          title: "Komunitas Ditolak",
          message: `Komunitas "${before.name}" ditolak. ${note ? `Alasan: ${note}` : ""}`,
          type: "APPROVAL",
          link: `/communities/${before.slug}`,
        },
      });

      await tx.membershipHistory.create({
        data: {
          communityId,
          userId: before.ownerId,
          action: "COMMUNITY_REJECTED",
          details: { rejectedBy: authUser.id, note: note || null },
          performedBy: authUser.id,
        },
      });
    },
  });

  return c.json({ success: true, message: "Komunitas berhasil ditolak" });
});

communitiesRoutes.patch("/communities/:communityId/request-revision", validate(adminActionNoteSchema), async (c) => {
  const authUser = c.get("user");
  const communityId = c.req.param("communityId") as string;
  const data = c.get("validated");
  const { note } = data as { note?: string };
  const actorRole = (c.get("userRoles") ?? []).includes("SUPER_ADMIN") ? "SUPER_ADMIN" : "PLATFORM_ADMIN";

  const community = await prisma.community.findUnique({ where: { id: communityId } });
  if (!community) {
    return c.json({ success: false, message: "Komunitas tidak ditemukan" }, 404);
  }

  if (community.status !== "PENDING") {
    return c.json({ success: false, message: "Hanya komunitas pending yang dapat diminta revisi" }, 400);
  }

  await transitionCommunity({
    communityId,
    expectedStatus: "PENDING",
    targetStatus: "REVISION_REQUIRED",
    actorId: authUser.id,
    actorRole,
    reason: note,
    data: { adminNote: note || null, reviewedAt: new Date() },
    auditAction: AuditActions.COMMUNITY_REVISION_REQUESTED,
    auditBeforeData: { status: "PENDING" },
    auditAfterData: { status: "REVISION_REQUIRED", note },
    cascade: async (tx, before) => {
      await tx.notification.create({
        data: {
          userId: before.ownerId,
          title: "Revisi Diperlukan",
          message: `Komunitas "${before.name}" perlu direvisi. ${note ? `Catatan: ${note}` : ""}`,
          type: "APPROVAL",
          link: `/communities/${before.slug}`,
        },
      });

      await tx.membershipHistory.create({
        data: {
          communityId,
          userId: before.ownerId,
          action: "COMMUNITY_REVISION_REQUESTED",
          details: { requestedBy: authUser.id, note: note || null },
          performedBy: authUser.id,
        },
      });
    },
  });

  return c.json({ success: true, message: "Revisi berhasil diminta" });
});

// ==========================================
// 8. SOFT DELETE COMMUNITY (Super Admin)
// ==========================================

communitiesRoutes.put("/communities/:communityId/soft-delete", requireSuperAdmin(), async (c) => {
  const authUser = c.get("user");
  const communityId = c.req.param("communityId") as string;

  const community = await prisma.community.findUnique({ where: { id: communityId } });
  if (!community) {
    return c.json({ success: false, message: "Komunitas tidak ditemukan" }, 404);
  }

  if (community.deletedAt) {
    return c.json({ success: false, message: "Komunitas sudah dihapus" }, 400);
  }

  const before = snapshotFields(community, ["status", "deletedAt"]);

  const deletedAt = new Date();
  await prisma.community.update({
    where: { id: communityId },
    data: { deletedAt },
  });

  await logAuditSnapshot(
    { userId: authUser.id, actionType: AuditActions.COMMUNITY_DELETE, resourceName: "Community", resourceId: communityId },
    { before, after: { deletedAt: deletedAt.toISOString() } }
  );

  return c.json({ success: true, message: "Komunitas berhasil dihapus" });
});

// ==========================================
// 9. BULK SOFT DELETE COMMUNITIES (Super Admin)
// ==========================================

communitiesRoutes.post("/communities/bulk-delete", requireSuperAdmin(), async (c) => {
  const authUser = c.get("user");
  const body = await c.req.json();
  const ids: string[] = body.ids;

  if (!Array.isArray(ids) || ids.length === 0) {
    return c.json({ success: false, message: "Pilih komunitas yang akan dihapus" }, 400);
  }

  if (ids.length > 100) {
    return c.json({ success: false, message: "Maksimal 100 komunitas per aksi" }, 400);
  }

  const communities = await prisma.community.findMany({
    where: { id: { in: ids }, ...activeScope("community") },
    select: { id: true, name: true, status: true, deletedAt: true },
  });

  if (communities.length === 0) {
    return c.json({ success: false, message: "Tidak ada komunitas yang dapat dihapus" }, 404);
  }

  const now = new Date();
  await prisma.community.updateMany({
    where: { id: { in: communities.map((c) => c.id) } },
    data: { deletedAt: now },
  });

  for (const comm of communities) {
    await logAuditSnapshot(
      { userId: authUser.id, actionType: AuditActions.COMMUNITY_DELETE, resourceName: "Community", resourceId: comm.id },
      { before: snapshotFields(comm, ["status", "deletedAt"]), after: { deletedAt: now.toISOString() } }
    );
  }

  return c.json({
    success: true,
    message: `${communities.length} komunitas berhasil dihapus`,
    data: { deletedCount: communities.length, ids: communities.map((c) => c.id) },
  });
});
