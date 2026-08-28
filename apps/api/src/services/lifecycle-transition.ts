import { prisma } from "@komunaid/database";
import type { Prisma } from "@prisma/client";

/**
 * One transition module for every lifecycle (Event, VolunteerProgram,
 * Community, VolunteerOpportunity).
 *
 * Every status machine in this codebase follows the same shape: a single
 * `prisma.$transaction` doing an optimistic `updateMany({ where: { id,
 * status: expectedStatus, deletedAt: null } })` guarded by
 * `changed.count !== 1`, followed by a history-table row and an AuditLog
 * row, plus any cascade. This module owns that shape ONCE, via
 * `transitionLifecycle`, and exposes a thin per-entity wrapper for each of
 * the four lifecycles so call sites keep reading like domain code
 * (`transitionEvent({ eventId, ... })`) instead of the generic shape.
 *
 * All four wrappers throw the SAME typed error, `LifecycleTransitionError`,
 * for a lost optimistic-concurrency race (and for an invalid transition, or
 * a row that vanished mid-transaction). `apps/api/src/app.ts`'s `onError`
 * maps it to 409 so every caller — public route or admin route — behaves
 * identically instead of the previous split (409 via a manual `.catch` on
 * the admin path, bare 500 on the public path).
 *
 * Known asymmetry: Community has no `CommunityStatusHistory` table (unlike
 * Event/VolunteerProgram/VolunteerOpportunity, which each have one). Per the
 * migration policy this module does NOT add one. `transitionCommunity`
 * therefore has no built-in history writer — the existing bookkeeping
 * tables (`ActivityHistory`, `MembershipHistory`) are supplied by the
 * caller via the `cascade` hook, same as before, just now inside the same
 * transaction as the guarded status update. See the "Community history
 * asymmetry" note in the task report for the follow-up this implies.
 */

type Tx = Prisma.TransactionClient;

export type LifecycleEntity = "EVENT" | "VOLUNTEER_PROGRAM" | "COMMUNITY" | "VOLUNTEER_OPPORTUNITY";

export class LifecycleTransitionError extends Error {
  constructor(
    public readonly code: string,
    public readonly entity: LifecycleEntity
  ) {
    super(code);
    this.name = "LifecycleTransitionError";
  }
}

interface StatusDelegate {
  findUnique: (args: { where: { id: string } }) => Promise<any>;
  updateMany: (args: { where: Record<string, unknown>; data: Record<string, unknown> }) => Promise<{ count: number }>;
}

export interface TransitionLifecycleInput {
  entity: LifecycleEntity;
  transitions: Record<string, string[]>;
  delegate: (tx: Tx) => StatusDelegate;
  id: string;
  expectedStatus: string;
  targetStatus: string;
  actorId: string;
  actorRole: string;
  reason?: string | null;
  /** Extra columns to set alongside `status` in the same guarded update. */
  data?: Record<string, unknown>;
  /** Writes the entity's status-history row. Omit for entities with no history table (see Community above). */
  writeHistory?: (tx: Tx, before: any) => Promise<unknown>;
  /** AuditLog `actionType`. Defaults to `${entity}_UPDATE` when omitted. */
  auditAction?: string;
  auditBeforeData?: Record<string, unknown>;
  auditAfterData?: Record<string, unknown>;
  /** Extra work (cascades, notifications, entity-specific bookkeeping) run inside the SAME transaction, after the audit row. */
  cascade?: (tx: Tx, before: any) => Promise<unknown>;
}

/**
 * The one entry point: entity kind, id, expected/target status, actor, and
 * optional cascade/metadata. Everything else — the transaction, the
 * optimistic guard, which history table, the audit row shape — is supplied
 * by the per-entity wrapper below and stays internal to this function.
 */
export async function transitionLifecycle<T = any>(input: TransitionLifecycleInput): Promise<T> {
  if (!input.transitions[input.expectedStatus]?.includes(input.targetStatus)) {
    throw new LifecycleTransitionError(`${input.entity}_INVALID_TRANSITION`, input.entity);
  }

  return prisma.$transaction(async (tx) => {
    const model = input.delegate(tx);

    const before = await model.findUnique({ where: { id: input.id } });
    if (!before || before.deletedAt) {
      throw new LifecycleTransitionError(`${input.entity}_NOT_FOUND`, input.entity);
    }
    if (before.status !== input.expectedStatus) {
      throw new LifecycleTransitionError(`${input.entity}_STATUS_CHANGED`, input.entity);
    }

    const changed = await model.updateMany({
      where: { id: input.id, status: input.expectedStatus, deletedAt: null },
      data: { status: input.targetStatus, ...(input.data ?? {}) },
    });
    if (changed.count !== 1) {
      throw new LifecycleTransitionError(`${input.entity}_STATUS_CHANGED`, input.entity);
    }

    if (input.writeHistory) {
      await input.writeHistory(tx, before);
    }

    await tx.auditLog.create({
      data: {
        userId: input.actorId,
        actionType: input.auditAction ?? `${input.entity}_UPDATE`,
        resourceName: RESOURCE_NAME[input.entity],
        resourceId: input.id,
        beforeData: (input.auditBeforeData ?? { status: input.expectedStatus }) as any,
        afterData: (input.auditAfterData ?? { status: input.targetStatus, reason: input.reason ?? null }) as any,
      },
    });

    if (input.cascade) {
      await input.cascade(tx, before);
    }

    // Re-fetch via findUnique (not findUniqueOrThrow) + an explicit check —
    // every existing call site's test doubles already mock findUnique, and a
    // row that disappears between the guarded updateMany above and here is
    // exactly the same "changed under us" condition as STATUS_CHANGED.
    const after = await model.findUnique({ where: { id: input.id } });
    if (!after) {
      throw new LifecycleTransitionError(`${input.entity}_NOT_FOUND`, input.entity);
    }
    return after as T;
  });
}

const RESOURCE_NAME: Record<LifecycleEntity, string> = {
  EVENT: "Event",
  VOLUNTEER_PROGRAM: "VolunteerProgram",
  COMMUNITY: "Community",
  VOLUNTEER_OPPORTUNITY: "VolunteerOpportunity",
};

// ---------------------------------------------------------------------------
// Event
// ---------------------------------------------------------------------------

export const EVENT_TRANSITIONS: Record<string, string[]> = {
  DRAFT: ["SUBMITTED", "CANCELLED"],
  SUBMITTED: ["IN_REVIEW", "CANCELLED"],
  IN_REVIEW: ["REVISION_REQUESTED", "REJECTED", "APPROVED", "CANCELLED"],
  REVISION_REQUESTED: ["RESUBMITTED", "CANCELLED"],
  RESUBMITTED: ["IN_REVIEW", "CANCELLED"],
  APPROVED: ["PUBLISHED", "CANCELLED"],
  PUBLISHED: ["REGISTRATION_OPEN", "CANCELLED", "ARCHIVED"],
  REGISTRATION_OPEN: ["REGISTRATION_CLOSED", "CANCELLED"],
  REGISTRATION_CLOSED: ["ONGOING", "CANCELLED"],
  ONGOING: ["COMPLETED", "CANCELLED"],
  COMPLETED: ["ARCHIVED"],
  CANCELLED: [],
  REJECTED: [],
  ARCHIVED: [],
};

export interface TransitionEventInput {
  eventId: string;
  expectedStatus: string;
  targetStatus: string;
  actorId: string;
  actorRole: string;
  reason?: string | null;
  reviewNote?: string | null;
  reviewedAt?: Date | null;
  reviewedById?: string | null;
  submittedAt?: Date | null;
  /** Override the default action-type ternary (CANCELLED/ARCHIVED/else) — used by call sites that historically logged a different action (e.g. EVENT_PUBLISH for publish/registration/lifecycle-progress endpoints). */
  auditAction?: string;
}

async function eventCancelCascade(tx: Tx, eventId: string, before: any) {
  const registrations = await tx.eventRegistration.findMany({
    where: { eventId, status: { in: ["CONFIRMED", "PENDING", "WAITLISTED"] } },
    select: { userId: true },
  });
  await tx.eventRegistration.updateMany({
    where: { eventId, status: { in: ["CONFIRMED", "PENDING", "WAITLISTED"] } },
    data: { status: "CANCELLED" },
  });
  if (registrations.length) {
    await tx.notification.createMany({
      data: registrations.map((registration: { userId: string }) => ({
        userId: registration.userId,
        title: "Event Dibatalkan",
        message: `Event "${before.title}" telah dibatalkan.`,
        type: "EVENT" as const,
        link: `/events/${before.slug}`,
      })),
    });
  }
}

export async function transitionEvent(input: TransitionEventInput) {
  return transitionLifecycle({
    entity: "EVENT",
    transitions: EVENT_TRANSITIONS,
    delegate: (tx) => tx.event as unknown as StatusDelegate,
    id: input.eventId,
    expectedStatus: input.expectedStatus,
    targetStatus: input.targetStatus,
    actorId: input.actorId,
    actorRole: input.actorRole,
    reason: input.reason,
    data: {
      ...(input.reviewNote !== undefined ? { reviewNote: input.reviewNote } : {}),
      ...(input.reviewedAt !== undefined ? { reviewedAt: input.reviewedAt } : {}),
      ...(input.reviewedById !== undefined ? { reviewedById: input.reviewedById } : {}),
      ...(input.submittedAt !== undefined ? { submittedAt: input.submittedAt } : {}),
    },
    // Uses input.expectedStatus (already validated equal to the pre-update row's
    // status) rather than re-reading `before.status` here — the fake-prisma test
    // harness mutates row objects in place, so `before` would otherwise already
    // reflect the NEW status by the time this callback runs after updateMany.
    writeHistory: (tx) =>
      tx.eventStatusHistory.create({
        data: {
          eventId: input.eventId,
          fromStatus: input.expectedStatus as any,
          toStatus: input.targetStatus as any,
          actorId: input.actorId,
          actorRole: input.actorRole,
          reason: input.reason || null,
        },
      }),
    auditAction:
      input.auditAction ??
      (input.targetStatus === "CANCELLED" ? "EVENT_CANCEL" : input.targetStatus === "ARCHIVED" ? "EVENT_ARCHIVE" : "EVENT_UPDATE"),
    cascade:
      input.targetStatus === "CANCELLED"
        ? (tx, before) => eventCancelCascade(tx, input.eventId, before)
        : undefined,
  });
}

// ---------------------------------------------------------------------------
// VolunteerProgram
// ---------------------------------------------------------------------------

export const VOLUNTEER_PROGRAM_TRANSITIONS: Record<string, string[]> = {
  DRAFT: ["SUBMITTED", "CANCELLED"],
  SUBMITTED: ["UNDER_REVIEW", "CANCELLED"],
  UNDER_REVIEW: ["REVISION_REQUIRED", "REJECTED", "APPROVED", "CANCELLED"],
  REVISION_REQUIRED: ["SUBMITTED", "CANCELLED"],
  APPROVED: ["SCHEDULED", "CANCELLED"],
  SCHEDULED: ["REGISTRATION_OPEN", "CANCELLED"],
  REGISTRATION_OPEN: ["REGISTRATION_CLOSED", "CANCELLED"],
  REGISTRATION_CLOSED: ["ONGOING", "CANCELLED"],
  ONGOING: ["COMPLETED", "CANCELLED"],
  COMPLETED: ["ARCHIVED"],
  REJECTED: [],
  CANCELLED: [],
  ARCHIVED: [],
};

export interface TransitionVolunteerProgramInput {
  programId: string;
  expectedStatus: string;
  targetStatus: string;
  actorId: string;
  actorRole: string;
  reason?: string | null;
  reviewNote?: string | null;
  reviewedById?: string | null;
  reviewedAt?: Date | null;
}

export async function transitionVolunteerProgram(input: TransitionVolunteerProgramInput) {
  return transitionLifecycle({
    entity: "VOLUNTEER_PROGRAM",
    transitions: VOLUNTEER_PROGRAM_TRANSITIONS,
    delegate: (tx) => tx.volunteerProgram as unknown as StatusDelegate,
    id: input.programId,
    expectedStatus: input.expectedStatus,
    targetStatus: input.targetStatus,
    actorId: input.actorId,
    actorRole: input.actorRole,
    reason: input.reason,
    data: {
      ...(input.reviewNote !== undefined ? { reviewNote: input.reviewNote } : {}),
      ...(input.reviewedById !== undefined ? { reviewedById: input.reviewedById } : {}),
      ...(input.reviewedAt !== undefined ? { reviewedAt: input.reviewedAt } : {}),
    },
    // See the Event wrapper above for why this reads input.expectedStatus
    // rather than before.status.
    writeHistory: (tx) =>
      tx.volunteerProgramStatusHistory.create({
        data: {
          volunteerProgramId: input.programId,
          previousStatus: input.expectedStatus as any,
          newStatus: input.targetStatus as any,
          actorId: input.actorId,
          actorRole: input.actorRole,
          reason: input.reason || null,
        },
      }),
    auditAction: "VOLUNTEER_PROGRAM_TRANSITION",
  });
}

// ---------------------------------------------------------------------------
// Community
// ---------------------------------------------------------------------------

/**
 * Community's real guards today are permissive and ad hoc (e.g. "archive"
 * is legal from any non-ARCHIVED status; "suspend" from any status except
 * SUSPENDED/ARCHIVED). This table is the exact codification of what the
 * three owner-facing endpoints in routes/communities.ts already allow —
 * NOT an idealized redesign — so wiring it in changes zero externally
 * observable legality. The admin review transitions (PENDING -> APPROVED /
 * REJECTED / REVISION_REQUIRED, and REVISION_REQUIRED -> PENDING) are
 * included for documentation completeness; routes/admin/communities.ts
 * still performs those with its own bespoke `prisma.community.update`
 * calls (out of this module's file lane) and does not consume this table
 * yet — a follow-up.
 */
export const COMMUNITY_TRANSITIONS: Record<string, string[]> = {
  DRAFT: ["PENDING", "ARCHIVED", "SUSPENDED"],
  PENDING: ["APPROVED", "REJECTED", "REVISION_REQUIRED", "ARCHIVED", "SUSPENDED"],
  REVISION_REQUIRED: ["PENDING", "ARCHIVED", "SUSPENDED"],
  APPROVED: ["SUSPENDED", "ARCHIVED"],
  SUSPENDED: ["APPROVED", "ARCHIVED"],
  REJECTED: ["ARCHIVED", "SUSPENDED"],
  ARCHIVED: [],
};

export interface TransitionCommunityInput {
  communityId: string;
  expectedStatus: string;
  targetStatus: string;
  actorId: string;
  actorRole: string;
  reason?: string | null;
  data?: Record<string, unknown>;
  auditAction: string;
  auditBeforeData?: Record<string, unknown>;
  auditAfterData?: Record<string, unknown>;
  /** Community has no CommunityStatusHistory table; entity-specific bookkeeping (ActivityHistory, MembershipHistory, notifications) is supplied here and now runs inside the same transaction as the guarded update. */
  cascade?: (tx: Tx, before: any) => Promise<unknown>;
}

export async function transitionCommunity(input: TransitionCommunityInput) {
  return transitionLifecycle({
    entity: "COMMUNITY",
    transitions: COMMUNITY_TRANSITIONS,
    delegate: (tx) => tx.community as unknown as StatusDelegate,
    id: input.communityId,
    expectedStatus: input.expectedStatus,
    targetStatus: input.targetStatus,
    actorId: input.actorId,
    actorRole: input.actorRole,
    reason: input.reason,
    data: input.data,
    auditAction: input.auditAction,
    auditBeforeData: input.auditBeforeData,
    auditAfterData: input.auditAfterData,
    cascade: input.cascade,
  });
}

// ---------------------------------------------------------------------------
// VolunteerOpportunity
// ---------------------------------------------------------------------------

export const VOLUNTEER_OPPORTUNITY_TRANSITIONS: Record<string, string[]> = {
  DRAFT: ["PUBLISHED"],
  PUBLISHED: ["OPEN"],
  OPEN: ["CLOSED"],
  CLOSED: ["ARCHIVED"],
  ARCHIVED: [],
};

export interface TransitionVolunteerOpportunityInput {
  opportunityId: string;
  expectedStatus: string;
  targetStatus: string;
  actorId: string;
  actorRole: string;
  reason?: string | null;
  auditAction: string;
}

async function opportunityCloseCascade(tx: Tx, opportunityId: string, before: any, actorId: string) {
  const pendingApplications = await tx.volunteerApplication.findMany({
    where: { opportunityId, status: { in: ["APPLIED", "REVIEWED"] } },
  });
  if (pendingApplications.length > 0) {
    await tx.volunteerApplication.updateMany({
      where: { opportunityId, status: { in: ["APPLIED", "REVIEWED"] } },
      data: {
        status: "REJECTED",
        reviewNote: "Volunteer opportunity ditutup oleh penyelenggara.",
        reviewedAt: new Date(),
        reviewedById: actorId,
      },
    });
    await tx.notification.createMany({
      data: pendingApplications.map((application: { userId: string }) => ({
        userId: application.userId,
        title: "Kesempatan Volunteer Ditutup",
        message: `Kesempatan volunteer "${before.title}" telah ditutup. Pendaftaran Anda dibatalkan.`,
        type: "EVENT" as const,
        link: `/volunteer/${before.slug}`,
      })),
    });
  }
}

export async function transitionVolunteerOpportunity(input: TransitionVolunteerOpportunityInput) {
  return transitionLifecycle({
    entity: "VOLUNTEER_OPPORTUNITY",
    transitions: VOLUNTEER_OPPORTUNITY_TRANSITIONS,
    delegate: (tx) => tx.volunteerOpportunity as unknown as StatusDelegate,
    id: input.opportunityId,
    expectedStatus: input.expectedStatus,
    targetStatus: input.targetStatus,
    actorId: input.actorId,
    actorRole: input.actorRole,
    reason: input.reason,
    // See the Event wrapper above for why this reads input.expectedStatus
    // rather than before.status.
    writeHistory: (tx) =>
      tx.volunteerStatusHistory.create({
        data: {
          opportunityId: input.opportunityId,
          fromStatus: input.expectedStatus as any,
          toStatus: input.targetStatus as any,
          actorId: input.actorId,
          reason: input.reason || null,
        },
      }),
    auditAction: input.auditAction,
    cascade:
      input.targetStatus === "CLOSED"
        ? (tx, before) => opportunityCloseCascade(tx, input.opportunityId, before, input.actorId)
        : undefined,
  });
}
