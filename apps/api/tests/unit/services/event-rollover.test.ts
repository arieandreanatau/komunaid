import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@komunaid/database", () => {
  let events: any[] = [];
  const prisma: any = {
    __setEvents: (list: any[]) => { events = list; },
    event: {
      findMany: vi.fn(async ({ where }: any) => {
        let list = events.slice();
        if (where?.status?.in) list = list.filter((e) => where.status.in.includes(e.status));
        if (where?.status && !where?.status?.in) list = list.filter((e) => e.status === where.status);
        if (where?.eventDate?.lt) list = list.filter((e) => new Date(e.eventDate).getTime() < new Date(where.eventDate.lt).getTime());
        if (where?.endDate?.lt) list = list.filter((e) => e.endDate && new Date(e.endDate).getTime() < new Date(where.endDate.lt).getTime());
        if (where?.deletedAt !== undefined) list = list.filter((e) => (e.deletedAt ?? null) === (where.deletedAt ?? null));
        return list;
      }),
      updateMany: vi.fn(async ({ where, data }: any) => {
        const matched = events.filter((e) => e.id === where.id && e.status === where.status);
        matched.forEach((e) => Object.assign(e, data));
        return { count: matched.length };
      }),
    },
    eventStatusHistory: { create: vi.fn(async () => ({})) },
    auditLog: { create: vi.fn(async () => ({})) },
    $transaction: vi.fn(async (fn: any) => fn(prisma)),
  };
  return { prisma };
});

vi.mock("pino", () => ({ default: vi.fn(() => ({ info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn(), child: vi.fn().mockReturnThis() })) }));
vi.mock("pino-pretty", () => ({ default: vi.fn(() => ({})) }));

import { prisma } from "@komunaid/database";
import { rolloverStaleEvents } from "../../../src/services/event-rollover";

function makeEvent(overrides: any = {}) {
  return {
    id: `evt-${Math.random().toString(36).slice(2)}`,
    title: "E",
    slug: "e",
    status: "REGISTRATION_OPEN",
    eventDate: new Date().toISOString(),
    endDate: null,
    deletedAt: null,
    createdById: "user-1",
    ...overrides,
  };
}

describe("rolloverStaleEvents (D-02)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("promotes REGISTRATION_OPEN/CLOSED events whose eventDate has passed to ONGOING", async () => {
    const staleOpen = makeEvent({ status: "REGISTRATION_OPEN", eventDate: new Date(Date.now() - 3600_000).toISOString() });
    const staleClosed = makeEvent({ status: "REGISTRATION_CLOSED", eventDate: new Date(Date.now() - 3600_000).toISOString() });
    const future = makeEvent({ status: "REGISTRATION_OPEN", eventDate: new Date(Date.now() + 3600_000).toISOString() });
(prisma as any).__setEvents([staleOpen, staleClosed, future]);

    const result = await rolloverStaleEvents();

    expect(prisma.event.updateMany).toHaveBeenCalledTimes(2);
    const updatedIds = (prisma.event.updateMany as any).mock.calls.map((call: any) => call[0].where.id);
    expect(updatedIds).toEqual([staleOpen.id, staleClosed.id]);
    expect(prisma.eventStatusHistory.create).toHaveBeenCalledTimes(2);
    expect(result.ongoing).toBe(2);
  });

  it("completes ONGOING events whose endDate has passed; leaves null-endDate running", async () => {
    const finished = makeEvent({ status: "ONGOING", endDate: new Date(Date.now() - 3600_000).toISOString() });
    const stillRunning = makeEvent({ status: "ONGOING", endDate: null });
(prisma as any).__setEvents([finished, stillRunning]);

    const result = await rolloverStaleEvents();

    expect(prisma.event.updateMany).toHaveBeenCalledTimes(1);
    expect((prisma.event.updateMany as any).mock.calls[0][0].where.id).toBe(finished.id);
    expect((prisma.event.updateMany as any).mock.calls[0][0].data.status).toBe("COMPLETED");
    expect(result.completed).toBe(1);
  });

  it("never promotes events whose eventDate is in the future", async () => {
    const future = makeEvent({ status: "REGISTRATION_OPEN", eventDate: new Date(Date.now() + 86400_000).toISOString() });
(prisma as any).__setEvents([future]);

    const result = await rolloverStaleEvents();

    expect(prisma.event.updateMany).not.toHaveBeenCalled();
    expect(result.ongoing).toBe(0);
  });

  it("writes status history and audit log for every transition", async () => {
    const stale = makeEvent({ status: "REGISTRATION_OPEN", eventDate: new Date(Date.now() - 3600_000).toISOString() });
(prisma as any).__setEvents([stale]);

    await rolloverStaleEvents();

    expect(prisma.eventStatusHistory.create).toHaveBeenCalled();
    expect(prisma.auditLog.create).toHaveBeenCalled();
  });
});
