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
  actorRole?: string;
}

const roleCache = new Map<string, { role: string; expiresAt: number }>();
const ROLE_CACHE_TTL_MS = 120_000;

export function invalidateActorRoleCache(userId: string) {
  roleCache.delete(userId);
}

async function resolveActorRole(userId: string): Promise<string> {
  const cached = roleCache.get(userId);
  if (cached && cached.expiresAt > Date.now()) return cached.role;
  try {
    const roles = await prisma.userRole.findMany({ where: { userId }, select: { role: true } });
    const role = roles.some((r) => r.role === "SUPER_ADMIN")
      ? "SUPER_ADMIN"
      : roles.some((r) => r.role === "PLATFORM_ADMIN")
        ? "PLATFORM_ADMIN"
        : roles.length > 0
          ? "MEMBER"
          : "UNKNOWN";
    roleCache.set(userId, { role, expiresAt: Date.now() + ROLE_CACHE_TTL_MS });
    return role;
  } catch {
    return "UNKNOWN";
  }
}

/**
 * Create an audit log entry.
 * This function is IMMUTABLE - it only supports INSERT operations.
 * Audit logs cannot be updated or deleted through this service.
 */
export async function createAuditLog(entry: AuditLogEntry): Promise<void> {
  try {
    const actorRole = entry.actorRole || (await resolveActorRole(entry.userId));
    await prisma.auditLog.create({
      data: {
        userId: entry.userId,
        actorRole,
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
 * Convenience wrapper over `createAuditLog` for the extremely common "diff
 * two plain objects and log them" shape (dozens of call sites hand-assemble
 * `beforeData`/`afterData` inline). Pass the entry plus a `before`/`after`
 * snapshot instead of pre-shaping those two fields yourself — this only
 * reshapes the call; `createAuditLog` still does the actual insert (and the
 * actor-role cache/resolution above is untouched).
 */
export async function logAuditSnapshot(
  entry: Omit<AuditLogEntry, "beforeData" | "afterData">,
  snapshot: { before?: Record<string, unknown> | null; after?: Record<string, unknown> | null }
): Promise<void> {
  return createAuditLog({
    ...entry,
    beforeData: snapshot.before ?? null,
    afterData: snapshot.after ?? null,
  });
}

/**
 * Picks a fixed set of keys off an entity row into a plain snapshot object —
 * `snapshotFields(community, ["status", "visibility"])` instead of
 * `{ status: community.status, visibility: community.visibility }` by hand.
 * Meant to build the `before`/`after` snapshots passed to `logAuditSnapshot`.
 */
export function snapshotFields<T extends Record<string, unknown>, K extends keyof T>(
  entity: T,
  fields: readonly K[]
): Pick<T, K> {
  const snapshot = {} as Pick<T, K>;
  for (const field of fields) snapshot[field] = entity[field];
  return snapshot;
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
  USER_ARCHIVE: "USER_ARCHIVE",
  USER_RESTORE: "USER_RESTORE",

  // Community
  COMMUNITY_CREATE: "COMMUNITY_CREATE",
  COMMUNITY_APPROVE: "COMMUNITY_APPROVE",
  COMMUNITY_SUSPEND: "COMMUNITY_SUSPEND",
  COMMUNITY_REJECTED: "COMMUNITY_REJECTED",
  COMMUNITY_REVISION_REQUESTED: "COMMUNITY_REVISION_REQUESTED",
  COMMUNITY_RESTORE: "COMMUNITY_RESTORE",
  COMMUNITY_UPDATE: "COMMUNITY_UPDATE",
  COMMUNITY_MEMBER_JOIN: "COMMUNITY_MEMBER_JOIN",
  COMMUNITY_MEMBER_LEAVE: "COMMUNITY_MEMBER_LEAVE",
  COMMUNITY_ROLE_CHANGE: "COMMUNITY_ROLE_CHANGE",
  COMMUNITY_ARCHIVE: "COMMUNITY_ARCHIVE",
  COMMUNITY_DELETE: "COMMUNITY_DELETE",
  COMMUNITY_MEMBER_REMOVE: "COMMUNITY_MEMBER_REMOVE",
  COMMUNITY_SUBMITTED: "COMMUNITY_SUBMITTED",

  // Organization
  ORG_CREATE: "ORG_CREATE",
  ORG_SUBMITTED: "ORG_SUBMITTED",
  ORG_APPROVE: "ORG_APPROVE",
  ORG_SUSPEND: "ORG_SUSPEND",
  ORG_REJECTED: "ORG_REJECTED",
  ORG_REVISION_REQUESTED: "ORG_REVISION_REQUESTED",
  ORG_RESTORE: "ORG_RESTORE",
  ORG_UPDATE: "ORG_UPDATE",
  ORG_OWNER_ACTIVATED: "ORG_OWNER_ACTIVATED",
  ORG_MEMBER_JOIN: "ORG_MEMBER_JOIN",
  ORG_MEMBER_LEAVE: "ORG_MEMBER_LEAVE",
  ORG_ROLE_CHANGE: "ORG_ROLE_CHANGE",
  ORG_ARCHIVE: "ORG_ARCHIVE",

  // Event
  EVENT_CREATE: "EVENT_CREATE",
  EVENT_UPDATE: "EVENT_UPDATE",
  EVENT_PUBLISH: "EVENT_PUBLISH",
  EVENT_CANCEL: "EVENT_CANCEL",
  EVENT_ARCHIVE: "EVENT_ARCHIVE",
  EVENT_RESTORE: "EVENT_RESTORE",
  EVENT_DUPLICATE: "EVENT_DUPLICATE",
  EVENT_DELETE: "EVENT_DELETE",
  EVENT_REGISTER: "EVENT_REGISTER",
  EVENT_UNREGISTER: "EVENT_UNREGISTER",
  EVENT_CHECK_IN: "EVENT_CHECK_IN",
  EVENT_CHECK_OUT: "EVENT_CHECK_OUT",
  EVENT_PARTICIPANT_APPROVE: "EVENT_PARTICIPANT_APPROVE",
  EVENT_PARTICIPANT_REJECT: "EVENT_PARTICIPANT_REJECT",

  // Report
  REPORT_CREATE: "REPORT_CREATE",
  REPORT_RESOLVE: "REPORT_RESOLVE",
  REPORT_DISMISS: "REPORT_DISMISS",

  // Volunteer
  VOLUNTEER_OPPORTUNITY_CREATE: "VOLUNTEER_OPPORTUNITY_CREATE",
  VOLUNTEER_OPPORTUNITY_UPDATE: "VOLUNTEER_OPPORTUNITY_UPDATE",
  VOLUNTEER_OPPORTUNITY_PUBLISH: "VOLUNTEER_OPPORTUNITY_PUBLISH",
  VOLUNTEER_OPPORTUNITY_CLOSE: "VOLUNTEER_OPPORTUNITY_CLOSE",
  VOLUNTEER_OPPORTUNITY_ARCHIVE: "VOLUNTEER_OPPORTUNITY_ARCHIVE",
  VOLUNTEER_OPPORTUNITY_DELETE: "VOLUNTEER_OPPORTUNITY_DELETE",
  VOLUNTEER_APPLY: "VOLUNTEER_APPLY",
  VOLUNTEER_CANCEL_APPLICATION: "VOLUNTEER_CANCEL_APPLICATION",
  VOLUNTEER_ACCEPT: "VOLUNTEER_ACCEPT",
  VOLUNTEER_REJECT: "VOLUNTEER_REJECT",
  VOLUNTEER_ASSIGN: "VOLUNTEER_ASSIGN",
  VOLUNTEER_CHECK_IN: "VOLUNTEER_CHECK_IN",
  VOLUNTEER_CHECK_OUT: "VOLUNTEER_CHECK_OUT",

  // Volunteer
  VOLUNTEER_APPLICATION_APPROVE: "VOLUNTEER_APPLICATION_APPROVE",
  VOLUNTEER_APPLICATION_REJECT: "VOLUNTEER_APPLICATION_REJECT",
  VOLUNTEER_SUSPEND: "VOLUNTEER_SUSPEND",
  VOLUNTEER_ARCHIVE: "VOLUNTEER_ARCHIVE",

  // Admin
  ROLE_CHANGE: "ROLE_CHANGE",
  SETTINGS_UPDATE: "SETTINGS_UPDATE",
  NOTIFICATION_BROADCAST: "NOTIFICATION_BROADCAST",
  REPORT_UNDER_REVIEW: "REPORT_UNDER_REVIEW",
  MODERATION_WARNING: "MODERATION_WARNING",

  // CMS
  CMS_PAGE_CREATE: "CMS_PAGE_CREATE",
  CMS_PAGE_UPDATE: "CMS_PAGE_UPDATE",
  CMS_PAGE_DELETE: "CMS_PAGE_DELETE",
  CMS_BANNER_CREATE: "CMS_BANNER_CREATE",
  CMS_BANNER_UPDATE: "CMS_BANNER_UPDATE",
  CMS_BANNER_DELETE: "CMS_BANNER_DELETE",

  // Security
  FORCE_LOGOUT: "FORCE_LOGOUT",
  ACCOUNT_LOCK: "ACCOUNT_LOCK",
  ACCOUNT_UNLOCK: "ACCOUNT_UNLOCK",

  // User Extra
  USER_UPDATE_INTERESTS: "USER_UPDATE_INTERESTS",
  USER_CHANGE_EMAIL: "USER_CHANGE_EMAIL",
  USER_CHANGE_USERNAME: "USER_CHANGE_USERNAME",
  USER_UPDATE_PROFILE_PHOTO: "USER_UPDATE_PROFILE_PHOTO",
} as const;
