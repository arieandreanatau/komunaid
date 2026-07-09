import { prisma } from "@komunaid/database";
import { createChildLogger } from "../lib/logger";

const log = createChildLogger("audit");

export interface AuditLogEntry {
  userId: string;
  actionType: string;
  resourceName: string;
  resourceId: string;
  beforeData?: Record<string, unknown> | null;
  afterData?: Record<string, unknown> | null;
  ipAddress?: string;
}

/**
 * Create an audit log entry.
 * This function is IMMUTABLE - it only supports INSERT operations.
 * Audit logs cannot be updated or deleted through this service.
 */
export async function createAuditLog(entry: AuditLogEntry): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId: entry.userId,
        actionType: entry.actionType,
        resourceName: entry.resourceName,
        resourceId: entry.resourceId,
        beforeData: entry.beforeData as any ?? undefined,
        afterData: entry.afterData as any ?? undefined,
        ipAddress: entry.ipAddress,
      },
    });
  } catch (error) {
    log.error({ err: error, entry }, "Failed to create audit log");
  }
}

/**
 * Read audit logs for a specific resource.
 * Audit logs are READ ONLY - this is the only allowed read operation.
 */
export async function getAuditLogs(params: {
  resourceName?: string;
  resourceId?: string;
  userId?: string;
  actionType?: string;
  page?: number;
  limit?: number;
}) {
  const { resourceName, resourceId, userId, actionType, page = 1, limit = 20 } = params;

  const where: Record<string, unknown> = {};
  if (resourceName) where.resourceName = resourceName;
  if (resourceId) where.resourceId = resourceId;
  if (userId) where.userId = userId;
  if (actionType) where.actionType = actionType;

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.auditLog.count({ where }),
  ]);

  return { logs, total, page, limit, totalPages: Math.ceil(total / limit) };
}

/**
 * IMMUTABLE - These operations are FORBIDDEN on audit logs.
 * They are listed here as documentation only.
 *
 * FORBIDDEN:
 * - updateAuditLog() - NEVER implement this
 * - deleteAuditLog() - NEVER implement this
 * - softDeleteAuditLog() - NEVER implement this
 *
 * Audit logs are permanent records that cannot be modified.
 */
export const AuditActions = {
  // User
  USER_REGISTER: "USER_REGISTER",
  USER_LOGIN: "USER_LOGIN",
  USER_LOGOUT: "USER_LOGOUT",
  USER_CHANGE_PASSWORD: "USER_CHANGE_PASSWORD",
  USER_RESET_PASSWORD: "USER_RESET_PASSWORD",
  USER_UPDATE_PROFILE: "USER_UPDATE_PROFILE",
  USER_SUSPEND: "USER_SUSPEND",
  USER_ACTIVATE: "USER_ACTIVATE",

  // Community
  COMMUNITY_CREATE: "COMMUNITY_CREATE",
  COMMUNITY_APPROVE: "COMMUNITY_APPROVE",
  COMMUNITY_SUSPEND: "COMMUNITY_SUSPEND",
  COMMUNITY_UPDATE: "COMMUNITY_UPDATE",
  COMMUNITY_MEMBER_JOIN: "COMMUNITY_MEMBER_JOIN",
  COMMUNITY_MEMBER_LEAVE: "COMMUNITY_MEMBER_LEAVE",
  COMMUNITY_ROLE_CHANGE: "COMMUNITY_ROLE_CHANGE",

  // Organization
  ORG_CREATE: "ORG_CREATE",
  ORG_APPROVE: "ORG_APPROVE",
  ORG_SUSPEND: "ORG_SUSPEND",
  ORG_UPDATE: "ORG_UPDATE",

  // Event
  EVENT_CREATE: "EVENT_CREATE",
  EVENT_APPROVE: "EVENT_APPROVE",
  EVENT_CANCEL: "EVENT_CANCEL",
  EVENT_REGISTER: "EVENT_REGISTER",
  EVENT_UNREGISTER: "EVENT_UNREGISTER",

  // Report
  REPORT_CREATE: "REPORT_CREATE",
  REPORT_RESOLVE: "REPORT_RESOLVE",
  REPORT_DISMISS: "REPORT_DISMISS",

  // Admin
  ROLE_CHANGE: "ROLE_CHANGE",
  SETTINGS_UPDATE: "SETTINGS_UPDATE",
} as const;
