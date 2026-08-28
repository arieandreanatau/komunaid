import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@komunaid/database", async () => {
  const { prisma } = await import("../../support/mock");
  return { prisma };
});

import { prisma, db } from "../../support/mock";
import {
  transitionEvent,
  transitionVolunteerProgram,
  transitionCommunity,
  transitionVolunteerOpportunity,
  transitionLifecycle,
  LifecycleTransitionError,
  EVENT_TRANSITIONS,
  VOLUNTEER_PROGRAM_TRANSITIONS,
  COMMUNITY_TRANSITIONS,
  VOLUNTEER_OPPORTUNITY_TRANSITIONS,
} from "../../../src/services/lifecycle-transition";

describe("lifecycle-transition service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    db.reset();
  });

  describe("transition tables", () => {
    it("rejects a transition absent from the table before touching the database", async () => {
      db.tables.event.seed({ id: "event-1", status: "COMPLETED", deletedAt: null });

      await expect(
        transitionEvent({ eventId: "event-1", expectedStatus: "COMPLETED", targetStatus: "DRAFT", actorId: "user-1", actorRole: "OWNER" })
      ).rejects.toMatchObject({ code: "EVENT_INVALID_TRANSITION", entity: "EVENT" });

      expect(prisma.event.updateMany).not.toHaveBeenCalled();
    });

    it("EVENT_TRANSITIONS has a terminal (empty) entry for every dead-end status", () => {
      for (const terminal of ["CANCELLED", "REJECTED", "ARCHIVED"]) {
        expect(EVENT_TRANSITIONS[terminal]).toEqual([]);
      }
    });

    it("every LifecycleTransitionError instance is one type, regardless of entity", async () => {
      db.tables.volunteerProgram.seed({ id: "vp-1", status: "ARCHIVED", deletedAt: null });
      const error = await transitionVolunteerProgram({
        programId: "vp-1", expectedStatus: "ARCHIVED", targetStatus: "SUBMITTED", actorId: "user-1", actorRole: "SYSTEM",
      }).catch((e) => e);
      expect(error).toBeInstanceOf(LifecycleTransitionError);
      expect(error.entity).toBe("VOLUNTEER_PROGRAM");
    });
  });

  describe("optimistic-concurrency guard", () => {
    it("throws STATUS_CHANGED (not a bare Error) when the stored row no longer matches the expected status", async () => {
      db.tables.event.seed({ id: "event-2", status: "CANCELLED", deletedAt: null, title: "Race", slug: "race" });

      await expect(
        transitionEvent({ eventId: "event-2", expectedStatus: "PUBLISHED", targetStatus: "ARCHIVED", actorId: "user-1", actorRole: "OWNER" })
      ).rejects.toMatchObject({ code: "EVENT_STATUS_CHANGED", entity: "EVENT" });
    });

    it("throws STATUS_CHANGED when updateMany's own where-match loses the race (deeper defense than the pre-check)", async () => {
      db.tables.event.seed({ id: "event-3", status: "PUBLISHED", deletedAt: null, title: "Race", slug: "race" });
      // Simulate another transaction winning between this call's own read and its write.
      (prisma.event.updateMany as any).mockResolvedValueOnce({ count: 0 });

      await expect(
        transitionEvent({ eventId: "event-3", expectedStatus: "PUBLISHED", targetStatus: "ARCHIVED", actorId: "user-1", actorRole: "OWNER" })
      ).rejects.toMatchObject({ code: "EVENT_STATUS_CHANGED" });

      expect(prisma.event.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ id: "event-3", status: "PUBLISHED", deletedAt: null }) })
      );
      // The row itself was never mutated by the lost race.
      expect(db.tables.event.all().find((e) => e.id === "event-3")?.status).toBe("PUBLISHED");
    });

    it("throws NOT_FOUND when the row has been soft-deleted", async () => {
      db.tables.event.seed({ id: "event-4", status: "DRAFT", deletedAt: new Date() });

      await expect(
        transitionEvent({ eventId: "event-4", expectedStatus: "DRAFT", targetStatus: "SUBMITTED", actorId: "user-1", actorRole: "OWNER" })
      ).rejects.toMatchObject({ code: "EVENT_NOT_FOUND" });
    });
  });

  describe("bookkeeping: history + audit", () => {
    it("writes EventStatusHistory and an AuditLog row inside the same transition for Event", async () => {
      db.tables.event.seed({ id: "event-5", status: "DRAFT", deletedAt: null, title: "T", slug: "t" });

      const updated = await transitionEvent({
        eventId: "event-5", expectedStatus: "DRAFT", targetStatus: "SUBMITTED", actorId: "user-1", actorRole: "OWNER", reason: "kirim",
      });

      expect(updated.status).toBe("SUBMITTED");
      const history = db.tables.eventStatusHistory.all().find((h: any) => h.eventId === "event-5");
      expect(history).toMatchObject({ fromStatus: "DRAFT", toStatus: "SUBMITTED", actorId: "user-1", reason: "kirim" });
      const audit = db.tables.auditLog.all().find((a: any) => a.resourceId === "event-5");
      expect(audit).toMatchObject({ actionType: "EVENT_UPDATE", resourceName: "Event" });
    });

    it("defaults the audit actionType to CANCEL/ARCHIVE for those targets and lets callers override it otherwise", async () => {
      db.tables.event.seed({ id: "event-6", status: "PUBLISHED", deletedAt: null, title: "T", slug: "t" });
      await transitionEvent({ eventId: "event-6", expectedStatus: "PUBLISHED", targetStatus: "CANCELLED", actorId: "user-1", actorRole: "OWNER" });
      expect(db.tables.auditLog.all().find((a: any) => a.resourceId === "event-6")?.actionType).toBe("EVENT_CANCEL");

      db.tables.event.seed({ id: "event-7", status: "APPROVED", deletedAt: null, title: "T", slug: "t" });
      await transitionEvent({ eventId: "event-7", expectedStatus: "APPROVED", targetStatus: "PUBLISHED", actorId: "user-1", actorRole: "OWNER", auditAction: "EVENT_PUBLISH" });
      expect(db.tables.auditLog.all().find((a: any) => a.resourceId === "event-7")?.actionType).toBe("EVENT_PUBLISH");
    });

    it("writes VolunteerProgramStatusHistory for VolunteerProgram", async () => {
      db.tables.volunteerProgram.seed({ id: "vp-2", status: "DRAFT", deletedAt: null });
      await transitionVolunteerProgram({ programId: "vp-2", expectedStatus: "DRAFT", targetStatus: "SUBMITTED", actorId: "user-1", actorRole: "PROGRAM_ORGANIZER" });
      const history = db.tables.volunteerProgramStatusHistory.all().find((h: any) => h.volunteerProgramId === "vp-2");
      expect(history).toMatchObject({ previousStatus: "DRAFT", newStatus: "SUBMITTED" });
      expect(db.tables.auditLog.all().find((a: any) => a.resourceId === "vp-2")?.actionType).toBe("VOLUNTEER_PROGRAM_TRANSITION");
    });

    it("writes VolunteerStatusHistory for VolunteerOpportunity", async () => {
      db.tables.volunteerOpportunity.seed({ id: "opp-1", status: "DRAFT", deletedAt: null, title: "Opp", slug: "opp" });
      await transitionVolunteerOpportunity({ opportunityId: "opp-1", expectedStatus: "DRAFT", targetStatus: "PUBLISHED", actorId: "user-1", actorRole: "EVENT_MANAGER", auditAction: "VOLUNTEER_OPPORTUNITY_PUBLISH" });
      const history = db.tables.volunteerStatusHistory.all().find((h: any) => h.opportunityId === "opp-1");
      expect(history).toMatchObject({ fromStatus: "DRAFT", toStatus: "PUBLISHED" });
    });

    it("Community has no built-in history writer (documented asymmetry) but still writes AuditLog and any caller-supplied cascade bookkeeping", async () => {
      db.tables.community.seed({ id: "comm-1", status: "DRAFT", deletedAt: null, name: "Komunitas" });
      let cascadeRan = false;

      const updated = await transitionCommunity({
        communityId: "comm-1",
        expectedStatus: "DRAFT",
        targetStatus: "PENDING",
        actorId: "user-1",
        actorRole: "OWNER",
        auditAction: "COMMUNITY_SUBMITTED",
        cascade: async (tx) => {
          cascadeRan = true;
          await tx.activityHistory.create({ data: { userId: "user-1", action: "COMMUNITY_SUBMITTED", details: { communityId: "comm-1" } } });
        },
      });

      expect(updated.status).toBe("PENDING");
      expect(cascadeRan).toBe(true);
      expect(db.tables.activityHistory.all().some((h: any) => h.action === "COMMUNITY_SUBMITTED")).toBe(true);
      expect(db.tables.auditLog.all().find((a: any) => a.resourceId === "comm-1")?.actionType).toBe("COMMUNITY_SUBMITTED");
    });
  });

  describe("cascades", () => {
    it("EVENT: cancelling cancels active registrations and notifies registrants inside the same transition", async () => {
      db.tables.event.seed({ id: "event-8", status: "PUBLISHED", deletedAt: null, title: "Cascade Event", slug: "cascade-event" });
      db.tables.eventRegistration.seed({ id: "reg-1", eventId: "event-8", userId: "member-1", status: "CONFIRMED" });
      db.tables.eventRegistration.seed({ id: "reg-2", eventId: "event-8", userId: "member-2", status: "WAITLISTED" });
      db.tables.eventRegistration.seed({ id: "reg-3", eventId: "event-8", userId: "member-3", status: "CANCELLED" });

      await transitionEvent({ eventId: "event-8", expectedStatus: "PUBLISHED", targetStatus: "CANCELLED", actorId: "user-1", actorRole: "OWNER" });

      expect(db.tables.eventRegistration.all().find((r: any) => r.id === "reg-1")?.status).toBe("CANCELLED");
      expect(db.tables.eventRegistration.all().find((r: any) => r.id === "reg-2")?.status).toBe("CANCELLED");
      const notified = db.tables.notification.all().map((n: any) => n.userId);
      expect(notified).toEqual(expect.arrayContaining(["member-1", "member-2"]));
      expect(notified).not.toContain("member-3");
    });

    it("VOLUNTEER_OPPORTUNITY: closing rejects pending applications and notifies applicants inside the same transition", async () => {
      db.tables.volunteerOpportunity.seed({ id: "opp-2", status: "OPEN", deletedAt: null, title: "Cascade Opp", slug: "cascade-opp" });
      db.tables.volunteerApplication.seed({ id: "app-1", opportunityId: "opp-2", userId: "member-1", status: "APPLIED" });
      db.tables.volunteerApplication.seed({ id: "app-2", opportunityId: "opp-2", userId: "member-2", status: "ACCEPTED" });

      await transitionVolunteerOpportunity({ opportunityId: "opp-2", expectedStatus: "OPEN", targetStatus: "CLOSED", actorId: "user-1", actorRole: "EVENT_MANAGER", auditAction: "VOLUNTEER_OPPORTUNITY_CLOSE" });

      expect(db.tables.volunteerApplication.all().find((a: any) => a.id === "app-1")?.status).toBe("REJECTED");
      // ACCEPTED volunteers keep their confirmed slot.
      expect(db.tables.volunteerApplication.all().find((a: any) => a.id === "app-2")?.status).toBe("ACCEPTED");
      expect(db.tables.notification.all().some((n: any) => n.userId === "member-1")).toBe(true);
    });
  });

  describe("generic entry point", () => {
    it("transitionLifecycle is the single entry point every per-entity wrapper delegates to", async () => {
      db.tables.community.seed({ id: "comm-2", status: "APPROVED", deletedAt: null, name: "K" });
      const updated = await transitionLifecycle({
        entity: "COMMUNITY",
        transitions: COMMUNITY_TRANSITIONS,
        delegate: (tx: any) => tx.community,
        id: "comm-2",
        expectedStatus: "APPROVED",
        targetStatus: "ARCHIVED",
        actorId: "user-1",
        actorRole: "OWNER",
        auditAction: "COMMUNITY_ARCHIVE",
      });
      expect(updated.status).toBe("ARCHIVED");
    });

    it("VOLUNTEER_PROGRAM_TRANSITIONS and VOLUNTEER_OPPORTUNITY_TRANSITIONS both terminate at ARCHIVED", () => {
      expect(VOLUNTEER_PROGRAM_TRANSITIONS.COMPLETED).toEqual(["ARCHIVED"]);
      expect(VOLUNTEER_OPPORTUNITY_TRANSITIONS.CLOSED).toEqual(["ARCHIVED"]);
      expect(VOLUNTEER_OPPORTUNITY_TRANSITIONS.ARCHIVED).toEqual([]);
    });
  });
});
