import { prisma } from "@komunaid/database";

// Under the serverless (Vercel) topology nothing calls this on its own — there is
// no long-lived process to hold a setInterval. It requires an external scheduler;
// see apps/api/src/services/scheduled-work.ts, apps/api/src/routes/cron.ts and
// the "crons" entry in vercel.json.

const ROLLOVER_BATCH = 100;

async function transitionEventStatus(input: {
  eventId: string;
  fromStatus: string;
  toStatus: string;
  actorId: string;
  reason?: string;
}) {
  return prisma.$transaction(async (tx) => {
    const changed = await tx.event.updateMany({
      where: { id: input.eventId, status: input.fromStatus as any, deletedAt: null },
      data: { status: input.toStatus as any },
    });
    if (changed.count !== 1) return false;

    await tx.eventStatusHistory.create({
      data: {
        eventId: input.eventId,
        fromStatus: input.fromStatus as any,
        toStatus: input.toStatus as any,
        actorId: input.actorId,
        actorRole: "SYSTEM",
        reason: input.reason || null,
      },
    });
    await tx.auditLog.create({
      data: {
        userId: input.actorId,
        actorRole: "SYSTEM",
        actionType: "EVENT_UPDATE",
        resourceName: "Event",
        resourceId: input.eventId,
        beforeData: { status: input.fromStatus },
        afterData: { status: input.toStatus, reason: input.reason || null },
      },
    });
    return true;
  });
}

export async function rolloverStaleEvents(): Promise<{ ongoing: number; completed: number }> {
  const now = new Date();
  const ongoing: string[] = [];
  const completed: string[] = [];

  const staleOpen = await prisma.event.findMany({
    where: {
      status: { in: ["REGISTRATION_OPEN", "REGISTRATION_CLOSED"] },
      eventDate: { lt: now },
      deletedAt: null,
    },
    select: { id: true, status: true, createdById: true },
    orderBy: { eventDate: "asc" },
    take: ROLLOVER_BATCH,
  });

  for (const event of staleOpen) {
    const ok = await transitionEventStatus({
      eventId: event.id,
      fromStatus: event.status,
      toStatus: "ONGOING",
      actorId: event.createdById,
      reason: "Rollover otomatis: jadwal event telah dimulai",
    });
    if (ok) ongoing.push(event.id);
  }

  const staleOngoing = await prisma.event.findMany({
    where: {
      status: "ONGOING",
      endDate: { lt: now },
      deletedAt: null,
    },
    select: { id: true, status: true, createdById: true },
    orderBy: { endDate: "asc" },
    take: ROLLOVER_BATCH,
  });

  for (const event of staleOngoing) {
    const ok = await transitionEventStatus({
      eventId: event.id,
      fromStatus: "ONGOING",
      toStatus: "COMPLETED",
      actorId: event.createdById,
      reason: "Rollover otomatis: jadwal event telah berakhir",
    });
    if (ok) completed.push(event.id);
  }

  return { ongoing: ongoing.length, completed: completed.length };
}