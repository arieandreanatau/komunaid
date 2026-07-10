import { Hono } from "hono";
import { prisma } from "@komunaid/database";
import { createReportSchema } from "@komunaid/shared";
import { authMiddleware } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { createAuditLog, AuditActions } from "../services/audit";
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
      status: { in: ["OPEN", "UNDER_REVIEW"] },
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
    report: {
      id: report.id,
      status: report.status,
    },
  }, 201);
});

// ==========================================
// GET MY REPORTS
// ==========================================

reportRoutes.get("/my", authMiddleware, async (c) => {
  const authUser = c.get("user");
  const url = new URL(c.req.url);
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = parseInt(url.searchParams.get("limit") || "20");

  const [reports, total] = await Promise.all([
    prisma.report.findMany({
      where: { reporterId: authUser.id },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.report.count({ where: { reporterId: authUser.id } }),
  ]);

  return c.json({
    success: true,
    data: reports,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});
