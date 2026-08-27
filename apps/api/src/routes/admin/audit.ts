import { Hono } from "hono";
import { prisma } from "@komunaid/database";
import { requireSuperAdmin } from "../../middleware/rbac";
import type { AuthUser } from "../../middleware/auth";

type Env = { Variables: { user: AuthUser; validated: any; userRoles: string[] } };
export const auditRoutes = new Hono<Env>();

function pagination(url: string) {
  const u = new URL(url);
  const page = Math.max(1, parseInt(u.searchParams.get("page") || "1"));
  const limit = Math.min(100, Math.max(1, parseInt(u.searchParams.get("limit") || "20")));
  const search = u.searchParams.get("search") || "";
  const sortBy = u.searchParams.get("sortBy") || "createdAt";
  const sortOrder = u.searchParams.get("sortOrder") === "asc" ? "asc" : "desc";
  return { page, limit, search, sortBy, sortOrder, skip: (page - 1) * limit };
}

auditRoutes.get("/audit-logs", requireSuperAdmin(), async (c) => {
  const { page, limit, search, skip } = pagination(c.req.url);
  const url = new URL(c.req.url);
  const actionType = url.searchParams.get("actionType") || "";
  const resourceName = url.searchParams.get("resourceName") || "";
  const userId = url.searchParams.get("userId") || "";
  const actorRole = url.searchParams.get("actorRole") || "";
  const dateFrom = url.searchParams.get("dateFrom") || "";
  const dateTo = url.searchParams.get("dateTo") || "";

  const where: Record<string, any> = {};

  if (actionType) {
    const actionTypes = actionType.split(",").map((value) => value.trim()).filter(Boolean);
    where.actionType = actionTypes.length > 1 ? { in: actionTypes } : actionTypes[0];
  }
  if (resourceName) where.resourceName = resourceName;
  if (userId) where.userId = userId;
  if (actorRole) where.actorRole = actorRole;

  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) where.createdAt.gte = new Date(dateFrom);
    if (dateTo) where.createdAt.lte = new Date(dateTo);
  }

  if (search) {
    where.OR = [
      { actionType: { contains: search } },
      { resourceName: { contains: search } },
      { resourceId: { contains: search } },
    ];
  }

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.auditLog.count({ where }),
  ]);

  return c.json({
    success: true,
    data: logs.map((l) => ({
      id: l.id,
      user: l.user,
      actorRole: l.actorRole,
      actionType: l.actionType,
      resourceName: l.resourceName,
      resourceId: l.resourceId,
      beforeData: l.beforeData,
      afterData: l.afterData,
      ipAddress: l.ipAddress,
      createdAt: l.createdAt,
    })),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});

auditRoutes.get("/audit-logs/user/:userId", requireSuperAdmin(), async (c) => {
  const { page, limit, skip } = pagination(c.req.url);
  const userId = c.req.param("userId") as string;

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where: { userId },
      include: { user: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.auditLog.count({ where: { userId } }),
  ]);

  return c.json({
    success: true,
    data: logs.map((l) => ({
      id: l.id,
      user: l.user,
      actionType: l.actionType,
      resourceName: l.resourceName,
      resourceId: l.resourceId,
      beforeData: l.beforeData,
      afterData: l.afterData,
      ipAddress: l.ipAddress,
      createdAt: l.createdAt,
    })),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});
