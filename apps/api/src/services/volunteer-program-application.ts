import { prisma } from "@komunaid/database";

const ACTIVE_APPLICATION_STATUSES = ["PENDING", "ACCEPTED"];

export class VolunteerProgramApplicationError extends Error {
  constructor(public readonly code: string) { super(code); }
}

export async function applyToVolunteerProgram(input: { programId: string; userId: string; actorRole: string; motivation?: string }) {
  return prisma.$transaction(async (tx) => {
    const rows = await tx.$queryRaw<Array<{ id: string; status: string; capacity: number; registrationDeadline: Date | null; organizerUserId: string; deletedAt: Date | null }>>`
      SELECT \`id\`, \`status\`, \`capacity\`, \`registrationDeadline\`, \`organizerUserId\`, \`deletedAt\`
      FROM \`volunteer_programs\` WHERE \`id\` = ${input.programId} FOR UPDATE
    `;
    const program = rows[0];
    if (!program || program.deletedAt) throw new VolunteerProgramApplicationError("PROGRAM_NOT_FOUND");
    if (program.organizerUserId === input.userId) throw new VolunteerProgramApplicationError("ORGANIZER_CANNOT_APPLY");
    if (program.status !== "REGISTRATION_OPEN") throw new VolunteerProgramApplicationError("REGISTRATION_NOT_OPEN");
    if (program.registrationDeadline && program.registrationDeadline < new Date()) throw new VolunteerProgramApplicationError("REGISTRATION_DEADLINE_PASSED");

    const existing = await tx.volunteerProgramApplication.findUnique({ where: { volunteerProgramId_userId: { volunteerProgramId: input.programId, userId: input.userId } } });
    if (existing && ACTIVE_APPLICATION_STATUSES.includes(existing.status)) throw new VolunteerProgramApplicationError("VOLUNTEER_ALREADY_APPLIED");

    const accepted = await tx.volunteerProgramApplication.count({ where: { volunteerProgramId: input.programId, status: "ACCEPTED" } });
    if (accepted >= program.capacity) throw new VolunteerProgramApplicationError("QUOTA_FULL");

    const application = existing
      ? await tx.volunteerProgramApplication.update({ where: { id: existing.id }, data: { status: "PENDING", motivation: input.motivation, cancellationReason: null, reviewNote: null, reviewedAt: null, reviewedById: null } })
      : await tx.volunteerProgramApplication.create({ data: { volunteerProgramId: input.programId, userId: input.userId, motivation: input.motivation, status: "PENDING" } });
    await tx.volunteerProgramApplicationHistory.create({ data: { applicationId: application.id, previousStatus: (existing?.status || "PENDING") as any, newStatus: "PENDING", actorId: input.userId, actorRole: input.actorRole, reason: existing ? "Mengajukan ulang volunteer" : "Mengajukan volunteer" } });
    await tx.auditLog.create({ data: { userId: input.userId, actionType: "VOLUNTEER_PROGRAM_APPLY", resourceName: "VolunteerProgram", resourceId: input.programId, afterData: { applicationId: application.id, status: "PENDING" } as any } });
    return application;
  });
}

export async function transitionVolunteerProgramApplication(input: { applicationId: string; expectedStatus: string | string[]; targetStatus: string; actorId: string; actorRole: string; reason?: string | null; reviewNote?: string | null }) {
  return prisma.$transaction(async (tx) => {
    const application = await tx.volunteerProgramApplication.findUnique({ where: { id: input.applicationId } });
    if (!application) throw new VolunteerProgramApplicationError("APPLICATION_NOT_FOUND");
    const expected = Array.isArray(input.expectedStatus) ? input.expectedStatus : [input.expectedStatus];
    if (!expected.includes(application.status)) throw new VolunteerProgramApplicationError("APPLICATION_STATUS_CHANGED");
    const changed = await tx.volunteerProgramApplication.updateMany({ where: { id: application.id, status: { in: expected as any } }, data: { status: input.targetStatus as any, reviewNote: input.reviewNote ?? undefined, reviewedAt: new Date(), reviewedById: input.actorId, cancellationReason: input.targetStatus === "CANCELLED_BY_ORGANIZER" ? input.reason || null : undefined } });
    if (changed.count !== 1) throw new VolunteerProgramApplicationError("APPLICATION_STATUS_CHANGED");
    await tx.volunteerProgramApplicationHistory.create({ data: { applicationId: application.id, previousStatus: application.status, newStatus: input.targetStatus as any, actorId: input.actorId, actorRole: input.actorRole, reason: input.reason || null } });
    await tx.auditLog.create({ data: { userId: input.actorId, actionType: "VOLUNTEER_PROGRAM_APPLICATION_TRANSITION", resourceName: "VolunteerProgramApplication", resourceId: application.id, beforeData: { status: application.status } as any, afterData: { status: input.targetStatus, reason: input.reason || null } as any } });
    return tx.volunteerProgramApplication.findUniqueOrThrow({ where: { id: application.id } });
  });
}
