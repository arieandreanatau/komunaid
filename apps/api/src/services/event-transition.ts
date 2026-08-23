import { prisma } from "@komunaid/database";

export const EVENT_TRANSITIONS: Record<string, string[]> = {
  DRAFT: ["SUBMITTED", "CANCELLED"],
  SUBMITTED: ["IN_REVIEW", "CANCELLED"],
  IN_REVIEW: ["REVISION_REQUESTED", "APPROVED", "CANCELLED"],
  REVISION_REQUESTED: ["RESUBMITTED", "CANCELLED"],
  RESUBMITTED: ["IN_REVIEW", "CANCELLED"],
  APPROVED: ["PUBLISHED", "CANCELLED"],
  PUBLISHED: ["REGISTRATION_OPEN", "CANCELLED", "ARCHIVED"],
  REGISTRATION_OPEN: ["REGISTRATION_CLOSED", "CANCELLED"],
  REGISTRATION_CLOSED: ["ONGOING", "CANCELLED"],
  ONGOING: ["COMPLETED", "CANCELLED"],
  COMPLETED: ["ARCHIVED"],
  CANCELLED: [],
  ARCHIVED: [],
};

export class EventTransitionError extends Error {
  constructor(public readonly code: string) { super(code); }
}

export async function transitionEvent(input: {
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
}) {
  if (!EVENT_TRANSITIONS[input.expectedStatus]?.includes(input.targetStatus)) {
    throw new EventTransitionError("EVENT_INVALID_TRANSITION");
  }

  return prisma.$transaction(async (tx) => {
    const event = await tx.event.findUnique({ where: { id: input.eventId } });
    if (!event || event.deletedAt) throw new EventTransitionError("EVENT_NOT_FOUND");
    if (event.status !== input.expectedStatus) throw new EventTransitionError("EVENT_STATUS_CHANGED");

    const changed = await tx.event.updateMany({
      where: { id: input.eventId, status: input.expectedStatus as any, deletedAt: null },
      data: {
        status: input.targetStatus as any,
        ...(input.reviewNote !== undefined ? { reviewNote: input.reviewNote } : {}),
        ...(input.reviewedAt !== undefined ? { reviewedAt: input.reviewedAt } : {}),
        ...(input.reviewedById !== undefined ? { reviewedById: input.reviewedById } : {}),
        ...(input.submittedAt !== undefined ? { submittedAt: input.submittedAt } : {}),
      },
    });
    if (changed.count !== 1) throw new EventTransitionError("EVENT_STATUS_CHANGED");

    if (input.targetStatus === "CANCELLED") {
      const registrations = await tx.eventRegistration.findMany({ where: { eventId: input.eventId, status: { in: ["CONFIRMED", "PENDING", "WAITLISTED"] } }, select: { userId: true } });
      await tx.eventRegistration.updateMany({ where: { eventId: input.eventId, status: { in: ["CONFIRMED", "PENDING", "WAITLISTED"] } }, data: { status: "CANCELLED" } });
      if (registrations.length) {
        await tx.notification.createMany({ data: registrations.map((registration) => ({ userId: registration.userId, title: "Event Dibatalkan", message: `Event \"${event.title}\" telah dibatalkan.`, type: "EVENT" as const, link: `/events/${event.slug}` })) });
      }
    }

    await tx.eventStatusHistory.create({ data: { eventId: input.eventId, fromStatus: input.expectedStatus as any, toStatus: input.targetStatus as any, actorId: input.actorId, actorRole: input.actorRole, reason: input.reason || null } });
    await tx.auditLog.create({ data: { userId: input.actorId, actionType: input.targetStatus === "CANCELLED" ? "EVENT_CANCEL" : input.targetStatus === "ARCHIVED" ? "EVENT_ARCHIVE" : "EVENT_UPDATE", resourceName: "Event", resourceId: input.eventId, beforeData: { status: input.expectedStatus } as any, afterData: { status: input.targetStatus, reason: input.reason || null } as any } });
    return tx.event.findUniqueOrThrow({ where: { id: input.eventId } });
  });
}
