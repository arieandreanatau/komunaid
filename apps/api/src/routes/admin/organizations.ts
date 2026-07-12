import { Hono } from "hono";
import { prisma } from "@komunaid/database";
import { validate } from "../../middleware/validate";
import { adminActionNoteSchema } from "@komunaid/shared";
import { createAuditLog, AuditActions } from "../../services/audit";
import type { AuthUser } from "../../middleware/auth";

type Env = { Variables: { user: AuthUser; validated: any; userRoles: string[] } };
export const organizationsRoutes = new Hono<Env>();

function pagination(url: string) {
  const u = new URL(url);
  const page = Math.max(1, parseInt(u.searchParams.get("page") || "1"));
  const limit = Math.min(100, Math.max(1, parseInt(u.searchParams.get("limit") || "20")));
  const search = u.searchParams.get("search") || "";
  const sortBy = u.searchParams.get("sortBy") || "createdAt";
  const sortOrder = u.searchParams.get("sortOrder") === "asc" ? "asc" : "desc";
  return { page, limit, search, sortBy, sortOrder, skip: (page - 1) * limit };
}

organizationsRoutes.get("/organizations", async (c) => {
  const { page, limit, search, sortBy, sortOrder, skip } = pagination(c.req.url);
  const url = new URL(c.req.url);
  const status = url.searchParams.get("status") || "";

  const where: Record<string, any> = { deletedAt: null };

  if (search) {
    where.OR = [
      { name: { contains: search } },
      { description: { contains: search } },
    ];
  }
  if (status && status !== "ALL") {
    where.status = status;
  }

  const [organizations, total] = await Promise.all([
    prisma.organization.findMany({
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
    prisma.organization.count({ where: where as never }),
  ]);

  return c.json({
    success: true,
    data: organizations.map((org: any) => ({
      id: org.id,
      name: org.name,
      slug: org.slug,
      description: org.description,
      logo: org.logo,
      banner: org.banner,
      industry: org.industry,
      status: org.status,
      visibility: org.visibility,
      adminNote: org.adminNote,
      submittedAt: org.submittedAt,
      reviewedAt: org.reviewedAt,
      owner: org.owner,
      categories: org.categories.map((oc: any) => oc.category),
      tags: org.tags.map((t: any) => t.tag),
      memberCount: org._count.members,
      eventCount: org._count.events,
      createdAt: org.createdAt,
    })),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});

organizationsRoutes.get("/organizations/:organizationId", async (c) => {
  const organizationId = c.req.param("organizationId") as string;

  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
    include: {
      owner: { select: { id: true, name: true, email: true, avatar: true, phone: true } },
      categories: { include: { category: true } },
      tags: true,
      settings: true,
      members: {
        include: { user: { select: { id: true, name: true, avatar: true } } },
        take: 20,
      },
      _count: { select: { members: true, events: true } },
    },
  });

  if (!organization) {
    return c.json({ success: false, message: "Organisasi tidak ditemukan" }, 404);
  }

  return c.json({
    success: true,
    data: {
      ...organization,
      categories: organization.categories.map((oc) => oc.category),
      tags: organization.tags.map((t) => t.tag),
      members: organization.members.map((m) => ({
        id: m.id,
        role: m.role,
        status: m.status,
        joinedAt: m.joinedAt,
        user: m.user,
      })),
    },
  });
});

organizationsRoutes.put("/organizations/:organizationId/approve", async (c) => {
  const authUser = c.get("user");
  const organizationId = c.req.param("organizationId") as string;

  const organization = await prisma.organization.findUnique({ where: { id: organizationId } });
  if (!organization) {
    return c.json({ success: false, message: "Organisasi tidak ditemukan" }, 404);
  }

  if (!["PENDING", "REVISION_REQUIRED"].includes(organization.status)) {
    return c.json({ success: false, message: "Hanya organisasi pending/revisi yang dapat disetujui" }, 400);
  }

  const before = { status: organization.status };

  await prisma.organization.update({
    where: { id: organizationId },
    data: { status: "APPROVED", reviewedAt: new Date(), adminNote: null },
  });

  const ownerMember = await prisma.organizationMember.findFirst({
    where: { organizationId, role: "OWNER" },
  });
  if (ownerMember) {
    await prisma.organizationMember.update({
      where: { id: ownerMember.id },
      data: { status: "ACTIVE" },
    });
  }

  await prisma.notification.create({
    data: {
      userId: organization.ownerId,
      title: "Organisasi Disetujui",
      message: `Organisasi "${organization.name}" telah disetujui oleh admin.`,
      type: "APPROVAL",
      link: `/organizations/${organization.slug}`,
    },
  });

  await createAuditLog({
    userId: authUser.id,
    actionType: AuditActions.ORG_APPROVE,
    resourceName: "Organization",
    resourceId: organizationId,
    beforeData: before,
    afterData: { status: "APPROVED" },
  });

  await prisma.membershipHistory.create({
    data: {
      organizationId,
      userId: organization.ownerId,
      action: "ORG_APPROVED",
      details: { approvedBy: authUser.id },
      performedBy: authUser.id,
    },
  });

  return c.json({ success: true, message: "Organisasi berhasil disetujui" });
});

organizationsRoutes.put("/organizations/:organizationId/suspend", async (c) => {
  const authUser = c.get("user");
  const organizationId = c.req.param("organizationId") as string;

  const organization = await prisma.organization.findUnique({ where: { id: organizationId } });
  if (!organization) {
    return c.json({ success: false, message: "Organisasi tidak ditemukan" }, 404);
  }

  const before = { status: organization.status };

  await prisma.organization.update({
    where: { id: organizationId },
    data: { status: "SUSPENDED" },
  });

  await prisma.notification.create({
    data: {
      userId: organization.ownerId,
      title: "Organisasi Ditangguhkan",
      message: `Organisasi "${organization.name}" telah ditangguhkan oleh admin.`,
      type: "ORGANIZATION",
      link: `/organizations/${organization.slug}`,
    },
  });

  await createAuditLog({
    userId: authUser.id,
    actionType: AuditActions.ORG_SUSPEND,
    resourceName: "Organization",
    resourceId: organizationId,
    beforeData: before,
    afterData: { status: "SUSPENDED" },
  });

  await prisma.membershipHistory.create({
    data: {
      organizationId,
      userId: organization.ownerId,
      action: "ORG_SUSPENDED",
      details: { suspendedBy: authUser.id },
      performedBy: authUser.id,
    },
  });

  return c.json({ success: true, message: "Organisasi berhasil ditangguhkan" });
});

organizationsRoutes.put("/organizations/:organizationId/restore", async (c) => {
  const authUser = c.get("user");
  const organizationId = c.req.param("organizationId") as string;

  const organization = await prisma.organization.findUnique({ where: { id: organizationId } });
  if (!organization) {
    return c.json({ success: false, message: "Organisasi tidak ditemukan" }, 404);
  }

  const before = { status: organization.status };

  await prisma.organization.update({
    where: { id: organizationId },
    data: { status: "APPROVED" },
  });

  await prisma.notification.create({
    data: {
      userId: organization.ownerId,
      title: "Organisasi Dipulihkan",
      message: `Organisasi "${organization.name}" telah dipulihkan oleh admin.`,
      type: "ORGANIZATION",
      link: `/organizations/${organization.slug}`,
    },
  });

  await createAuditLog({
    userId: authUser.id,
    actionType: AuditActions.ORG_RESTORE,
    resourceName: "Organization",
    resourceId: organizationId,
    beforeData: before,
    afterData: { status: "APPROVED" },
  });

  await prisma.membershipHistory.create({
    data: {
      organizationId,
      userId: organization.ownerId,
      action: "ORG_RESTORED",
      details: { restoredBy: authUser.id },
      performedBy: authUser.id,
    },
  });

  return c.json({ success: true, message: "Organisasi berhasil dipulihkan" });
});

organizationsRoutes.patch("/organizations/:organizationId/reject", validate(adminActionNoteSchema), async (c) => {
  const authUser = c.get("user");
  const organizationId = c.req.param("organizationId") as string;
  const data = c.get("validated");
  const { note } = data as { note?: string };

  const organization = await prisma.organization.findUnique({ where: { id: organizationId } });
  if (!organization) {
    return c.json({ success: false, message: "Organisasi tidak ditemukan" }, 404);
  }

  if (!["PENDING", "REVISION_REQUIRED"].includes(organization.status)) {
    return c.json({ success: false, message: "Hanya organisasi pending/revisi yang dapat ditolak" }, 400);
  }

  await prisma.organization.update({
    where: { id: organizationId },
    data: { status: "REJECTED", adminNote: note || null, reviewedAt: new Date() },
  });

  await prisma.notification.create({
    data: {
      userId: organization.ownerId,
      title: "Organisasi Ditolak",
      message: `Organisasi "${organization.name}" ditolak. ${note ? `Alasan: ${note}` : ""}`,
      type: "APPROVAL",
      link: `/organizations/${organization.slug}`,
    },
  });

  await createAuditLog({
    userId: authUser.id,
    actionType: AuditActions.ORG_REJECTED,
    resourceName: "Organization",
    resourceId: organizationId,
    beforeData: { status: organization.status },
    afterData: { status: "REJECTED", note },
  });

  await prisma.membershipHistory.create({
    data: {
      organizationId,
      userId: organization.ownerId,
      action: "ORG_REJECTED",
      details: { rejectedBy: authUser.id, note: note || null },
      performedBy: authUser.id,
    },
  });

  return c.json({ success: true, message: "Organisasi berhasil ditolak" });
});

organizationsRoutes.patch("/organizations/:organizationId/request-revision", validate(adminActionNoteSchema), async (c) => {
  const authUser = c.get("user");
  const organizationId = c.req.param("organizationId") as string;
  const data = c.get("validated");
  const { note } = data as { note?: string };

  const organization = await prisma.organization.findUnique({ where: { id: organizationId } });
  if (!organization) {
    return c.json({ success: false, message: "Organisasi tidak ditemukan" }, 404);
  }

  if (organization.status !== "PENDING") {
    return c.json({ success: false, message: "Hanya organisasi pending yang dapat diminta revisi" }, 400);
  }

  await prisma.organization.update({
    where: { id: organizationId },
    data: { status: "REVISION_REQUIRED", adminNote: note || null, reviewedAt: new Date() },
  });

  await prisma.notification.create({
    data: {
      userId: organization.ownerId,
      title: "Revisi Diperlukan",
      message: `Organisasi "${organization.name}" perlu direvisi. ${note ? `Catatan: ${note}` : ""}`,
      type: "APPROVAL",
      link: `/organizations/${organization.slug}`,
    },
  });

  await createAuditLog({
    userId: authUser.id,
    actionType: AuditActions.ORG_REVISION_REQUESTED,
    resourceName: "Organization",
    resourceId: organizationId,
    beforeData: { status: organization.status },
    afterData: { status: "REVISION_REQUIRED", note },
  });

  await prisma.membershipHistory.create({
    data: {
      organizationId,
      userId: organization.ownerId,
      action: "ORG_REVISION_REQUESTED",
      details: { requestedBy: authUser.id, note: note || null },
      performedBy: authUser.id,
    },
  });

  return c.json({ success: true, message: "Revisi berhasil diminta" });
});
