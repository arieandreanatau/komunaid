import { Hono } from "hono";
import { prisma } from "@komunaid/database";
import { requirePlatformAdmin, requireSuperAdmin } from "../../middleware/rbac";
import { validate } from "../../middleware/validate";
import { adminResolveReportSchema, adminModerationWarningSchema } from "@komunaid/shared";
import { createAuditLog, AuditActions } from "../../services/audit";
import { invalidateRoleCache } from "../../middleware/rbac";
import { transitionEvent, LifecycleTransitionError as EventTransitionError } from "../../services/lifecycle-transition";
import type { AuthUser } from "../../middleware/auth";
import { activeScope } from "../../lib/visibility-scope";

type Env = { Variables: { user: AuthUser; validated: any; userRoles: string[] } };
export const reportsRoutes = new Hono<Env>();

function pagination(url: string) {
  const u = new URL(url);
  const page = Math.max(1, parseInt(u.searchParams.get("page") || "1"));
  const limit = Math.min(100, Math.max(1, parseInt(u.searchParams.get("limit") || "20")));
  const search = u.searchParams.get("search") || "";
  const sortBy = u.searchParams.get("sortBy") || "createdAt";
  const sortOrder = u.searchParams.get("sortOrder") === "asc" ? "asc" : "desc";
  return { page, limit, search, sortBy, sortOrder, skip: (page - 1) * limit };
}

reportsRoutes.get("/moderation/stats", requirePlatformAdmin(), async (c) => {
  const [open, underReview, suspended, dismissed] = await Promise.all([
    prisma.report.count({ where: { status: "OPEN", ...activeScope("report") } }),
    prisma.report.count({ where: { status: "UNDER_REVIEW", ...activeScope("report") } }),
    prisma.report.count({ where: { status: "SUSPENDED", ...activeScope("report") } }),
    prisma.report.count({ where: { status: "DISMISSED", ...activeScope("report") } }),
  ]);
  return c.json({ success: true, data: { openReports: open, underReview, resolved: suspended, dismissed } });
});

reportsRoutes.get("/reports", async (c) => {
  const { page, limit, search, skip } = pagination(c.req.url);
  const url = new URL(c.req.url);
  const status = url.searchParams.get("status") || "";
  const targetType = url.searchParams.get("targetType") || "";

  const where: Record<string, any> = { ...activeScope("report") };

  if (status && status !== "ALL") {
    where.status = status;
  }
  if (targetType) {
    where.targetType = targetType;
  }
  if (search) {
    where.OR = [
      { description: { contains: search } },
      { reason: { contains: search } },
    ];
  }

  const [reports, total] = await Promise.all([
    prisma.report.findMany({
      where,
      include: {
        reporter: { select: { id: true, name: true, email: true, avatar: true } },
        reviewer: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.report.count({ where }),
  ]);

  return c.json({
    success: true,
    data: reports.map((r) => ({
      id: r.id,
      targetType: r.targetType,
      targetId: r.targetId,
      reason: r.reason,
      description: r.description,
      status: r.status,
      reviewNote: r.reviewNote,
      reporter: r.reporter,
      reviewer: r.reviewer,
      reviewedAt: r.reviewedAt,
      createdAt: r.createdAt,
    })),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});

async function suspendTargetEntity(targetType: string, targetId: string, actorId: string): Promise<boolean> {
  try {
    switch (targetType) {
      case "USER": {
        const user = await prisma.user.findUnique({ where: { id: targetId }, select: { id: true, status: true } });
        if (!user || user.status === "SUSPENDED") return false;
        await prisma.user.update({ where: { id: targetId }, data: { status: "SUSPENDED" } });
        invalidateRoleCache(targetId);
        return true;
      }
      case "COMMUNITY": {
        const community = await prisma.community.findUnique({ where: { id: targetId }, select: { id: true, status: true } });
        if (!community || !["APPROVED", "PENDING", "REVISION_REQUIRED"].includes(community.status)) return false;
        await prisma.community.update({ where: { id: targetId }, data: { status: "SUSPENDED" } });
        return true;
      }
      case "EVENT": {
        const event = await prisma.event.findUnique({ where: { id: targetId }, select: { id: true, status: true } });
        if (!event || event.status === "CANCELLED" || event.status === "ARCHIVED") return false;
        return Boolean(await transitionEvent({ eventId: targetId, expectedStatus: event.status, targetStatus: "CANCELLED", actorId, actorRole: "SUPER_ADMIN", reason: "Ditangguhkan melalui resolusi laporan" }).catch((error) => error instanceof EventTransitionError ? null : Promise.reject(error)));
      }
      case "ORGANIZATION": {
        const org = await prisma.organization.findUnique({ where: { id: targetId }, select: { id: true, status: true } });
        if (!org || !["APPROVED", "PENDING", "REVISION_REQUIRED"].includes(org.status)) return false;
        await prisma.organization.update({ where: { id: targetId }, data: { status: "SUSPENDED" } });
        return true;
      }
      default:
        return false;
    }
  } catch {
    return false;
  }
}

async function getTargetOwnerId(targetType: string, targetId: string): Promise<string | null> {
  try {
    switch (targetType) {
      case "USER":
        return targetId;
      case "COMMUNITY": {
        const community = await prisma.community.findUnique({ where: { id: targetId }, select: { ownerId: true } });
        return community?.ownerId ?? null;
      }
      case "EVENT": {
        const event = await prisma.event.findUnique({ where: { id: targetId }, select: { createdById: true } });
        return event?.createdById ?? null;
      }
      case "ORGANIZATION": {
        const org = await prisma.organization.findUnique({ where: { id: targetId }, select: { ownerId: true } });
        return org?.ownerId ?? null;
      }
      default:
        return null;
    }
  } catch {
    return null;
  }
}

reportsRoutes.put("/reports/:reportId/resolve", validate(adminResolveReportSchema), async (c) => {
  const authUser = c.get("user");
  const reportId = c.req.param("reportId") as string;
  const data = c.get("validated");
  const { action, note } = data as { action: "DISMISSED" | "SUSPENDED"; note?: string };

  const report = await prisma.report.findUnique({ where: { id: reportId, deletedAt: activeScope("report").deletedAt } });
  if (!report) {
    return c.json({ success: false, message: "Laporan tidak ditemukan" }, 404);
  }

  if (!["OPEN", "UNDER_REVIEW"].includes(report.status)) {
    return c.json({ success: false, message: "Laporan sudah ditindaklanjuti" }, 400);
  }

  const before = { status: report.status };

  let targetSuspended = false;
  if (action === "SUSPENDED") {
    targetSuspended = await suspendTargetEntity(report.targetType, report.targetId, authUser.id);
  }

  const reportStatus = action === "SUSPENDED" ? "SUSPENDED" : "DISMISSED";

  await prisma.report.update({
    where: { id: reportId },
    data: {
      status: reportStatus,
      reviewedBy: authUser.id,
      reviewedAt: new Date(),
      reviewNote: note || null,
    },
  });

  const targetOwnerId = await getTargetOwnerId(report.targetType, report.targetId);
  if (targetOwnerId) {
    await prisma.notification.create({
      data: {
        userId: targetOwnerId,
        title: action === "SUSPENDED" ? "Akun/Entity Ditangguhkan" : "Laporan Ditolak",
        message: action === "SUSPENDED"
          ? `Laporan terhadap ${report.targetType.toLowerCase()} Anda telah ditindaklanjuti dan entity telah ditangguhkan.${note ? ` Catatan: ${note}` : ""}`
          : `Laporan terhadap ${report.targetType.toLowerCase()} Anda telah ditolak.${note ? ` Catatan: ${note}` : ""}`,
        type: "REPORT",
      },
    });
  }

  await prisma.notification.create({
    data: {
      userId: report.reporterId,
      title: "Laporan Ditindaklanjuti",
      message: `Laporan Anda telah ${action === "SUSPENDED" ? "ditindaklanjuti" : "ditolak"}.${targetSuspended ? " Target telah ditangguhkan." : ""}${note ? ` Catatan: ${note}` : ""}`,
      type: "REPORT",
    },
  });

  await createAuditLog({
    userId: authUser.id,
    actionType: action === "SUSPENDED" ? AuditActions.REPORT_RESOLVE : AuditActions.REPORT_DISMISS,
    resourceName: "Report",
    resourceId: reportId,
    beforeData: before,
    afterData: { status: reportStatus, note, targetSuspended, targetType: report.targetType, targetId: report.targetId },
  });

  return c.json({ success: true, message: `Laporan berhasil ${action === "SUSPENDED" ? "ditindaklanjuti" : "ditolak"}` });
});

reportsRoutes.put("/reports/:reportId/under-review", async (c) => {
  const authUser = c.get("user");
  const reportId = c.req.param("reportId") as string;

  const report = await prisma.report.findUnique({ where: { id: reportId, deletedAt: activeScope("report").deletedAt } });
  if (!report) {
    return c.json({ success: false, message: "Laporan tidak ditemukan" }, 404);
  }

  if (report.status !== "OPEN") {
    return c.json({ success: false, message: "Hanya laporan open yang dapat di-review" }, 400);
  }

  const before = { status: report.status };

  await prisma.report.update({
    where: { id: reportId },
    data: { status: "UNDER_REVIEW", reviewedBy: authUser.id },
  });

  await prisma.notification.create({
    data: {
      userId: report.reporterId,
      title: "Laporan Sedang Direview",
      message: "Laporan Anda sedang dalam proses review oleh admin.",
      type: "REPORT",
    },
  });

  await createAuditLog({
    userId: authUser.id,
    actionType: AuditActions.REPORT_UNDER_REVIEW,
    resourceName: "Report",
    resourceId: reportId,
    beforeData: before,
    afterData: { status: "UNDER_REVIEW" },
  });

  return c.json({ success: true, message: "Laporan sedang dalam review" });
});

reportsRoutes.post("/reports/:reportId/warn", requireSuperAdmin(), validate(adminModerationWarningSchema), async (c) => {
  const authUser = c.get("user");
  const reportId = c.req.param("reportId") as string;
  const data = c.get("validated");
  const { reason } = data as { reason: string };

  const report = await prisma.report.findUnique({ where: { id: reportId, deletedAt: activeScope("report").deletedAt } });
  if (!report) {
    return c.json({ success: false, message: "Laporan tidak ditemukan" }, 404);
  }

  const targetUserId = await getTargetOwnerId(report.targetType, report.targetId);

  if (targetUserId) {
    await prisma.notification.create({
      data: {
        userId: targetUserId,
        title: "Peringatan dari Admin",
        message: `Anda menerima peringatan: ${reason}`,
        type: "SYSTEM",
      },
    });
  }

  await createAuditLog({
    userId: authUser.id,
    actionType: AuditActions.MODERATION_WARNING,
    resourceName: "Report",
    resourceId: reportId,
    afterData: { reason, targetUserId },
  });

  return c.json({ success: true, message: "Peringatan berhasil dikirim" });
});
