import { prisma } from "@komunaid/database";

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

export class VolunteerProgramTransitionError extends Error {}

export async function transitionVolunteerProgram(input: {
  programId: string;
  expectedStatus: string;
  targetStatus: string;
  actorId: string;
  actorRole: string;
  reason?: string | null;
  reviewNote?: string | null;
  reviewedById?: string | null;
  reviewedAt?: Date | null;
}) {
  if (!VOLUNTEER_PROGRAM_TRANSITIONS[input.expectedStatus]?.includes(input.targetStatus)) {
    throw new VolunteerProgramTransitionError("VOLUNTEER_PROGRAM_INVALID_TRANSITION");
  }

  return prisma.$transaction(async (tx) => {
    const changed = await tx.volunteerProgram.updateMany({
      where: { id: input.programId, status: input.expectedStatus as any, deletedAt: null },
      data: {
        status: input.targetStatus as any,
        ...(input.reviewNote !== undefined ? { reviewNote: input.reviewNote } : {}),
        ...(input.reviewedById !== undefined ? { reviewedById: input.reviewedById } : {}),
        ...(input.reviewedAt !== undefined ? { reviewedAt: input.reviewedAt } : {}),
      },
    });
    if (changed.count !== 1) throw new VolunteerProgramTransitionError("VOLUNTEER_PROGRAM_STATUS_CHANGED");
    await tx.volunteerProgramStatusHistory.create({
      data: {
        volunteerProgramId: input.programId,
        previousStatus: input.expectedStatus as any,
        newStatus: input.targetStatus as any,
        actorId: input.actorId,
        actorRole: input.actorRole,
        reason: input.reason || null,
      },
    });
    await tx.auditLog.create({
      data: {
        userId: input.actorId,
        actionType: "VOLUNTEER_PROGRAM_TRANSITION",
        resourceName: "VolunteerProgram",
        resourceId: input.programId,
        beforeData: { status: input.expectedStatus } as any,
        afterData: { status: input.targetStatus, reason: input.reason || null } as any,
      },
    });
    const program = await tx.volunteerProgram.findUnique({ where: { id: input.programId } });
    if (!program) throw new VolunteerProgramTransitionError("VOLUNTEER_PROGRAM_NOT_FOUND");
    return program;
  });
}
