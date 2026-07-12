import { Hono } from "hono";
import { prisma } from "@komunaid/database";
import { createReportSchema } from "@komunaid/shared";
import { REPORT_STATUSES } from "@komunaid/constants";
import { authMiddleware } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { createAuditLog, AuditActions } from "../services/audit";
import { parsePagination, paginatedResponse } from "../lib/pagination";
import type { AuthUser } from "../middleware/auth";

type Env = { Variables: { user: AuthUser; validated: any; userRoles: string[] } };

export const reportRoutes = new Hono<Env>();

// ==========================================
// CREATE REPORT
// ==========================================

reportRoutes.post("/", authMiddleware, validate(createReportSchema), async (c) => {
  const authUser = c.get("user");
  const data = c.get("validated");

  const existingReport = await prisma.report.findFirst({
    where: {
      reporterId: authUser.id,
      targetType: data.targetType,
      targetId: data.targetId,
      status: { in: [REPORT_STATUSES.OPEN, REPORT_STATUSES.UNDER_REVIEW] },
    },
  });

  if (existingReport) {
    return c.json({ success: false, message: "Anda sudah melaporkan ini" }, 409);
  }

  const report = await prisma.report.create({
    data: {
      reporterId: authUser.id,
      targetType: data.targetType,
      targetId: data.targetId,
      reason: data.reason,
      description: data.description,
    },
  });

  await createAuditLog({
    userId: authUser.id,
    actionType: AuditActions.REPORT_CREATE,
    resourceName: "Report",
    resourceId: report.id,
    afterData: { targetType: data.targetType, targetId: data.targetId, reason: data.reason },
  });

  return c.json({
    success: true,
    message: "Laporan berhasil dikirim",
    data: {
      id: report.id,
      status: report.status,
    },
  }, 201);
});

// ==========================================
// GET REPORT BY ID
// ==========================================

reportRoutes.get("/:reportId", authMiddleware, async (c) => {
  const authUser = c.get("user");
  const reportId = c.req.param("reportId") as string;

  const report = await prisma.report.findUnique({
    where: { id: reportId },
  });

  if (!report) {
    return c.json({ success: false, message: "Laporan tidak ditemukan" }, 404);
  }

  if (report.reporterId !== authUser.id) {
    return c.json({ success: false, message: "Tidak memiliki akses" }, 403);
  }

  return c.json({
    success: true,
    data: {
      id: report.id,
      targetType: report.targetType,
      targetId: report.targetId,
      reason: report.reason,
      description: report.description,
      status: report.status,
      reviewNote: report.reviewNote,
      reviewedAt: report.reviewedAt,
      createdAt: report.createdAt,
    },
  });
});

// ==========================================
// GET MY REPORTS
// ==========================================

reportRoutes.get("/my", authMiddleware, async (c) => {
  const authUser = c.get("user");
  const { page, limit } = parsePagination(c.req.url);

  const [reports, total] = await Promise.all([
    prisma.report.findMany({
      where: { reporterId: authUser.id },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.report.count({ where: { reporterId: authUser.id } }),
  ]);

  return c.json(paginatedResponse(reports, total, page, limit));
});
