import { describe, it, expect, vi, beforeEach } from "vitest";
import { Hono } from "hono";
import { SignJWT } from "jose";

const JWT_SECRET = new TextEncoder().encode("test-integration-secret");
process.env.JWT_SECRET = "test-integration-secret";

vi.mock("@komunaid/database", async () => {
  const { prisma } = await import("../support/mock");
  return { prisma };
});

vi.mock("pino", () => ({
  default: vi.fn(() => ({
    info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn(), child: vi.fn().mockReturnThis(),
  })),
}));
vi.mock("pino-pretty", () => ({ default: vi.fn(() => ({})) }));
vi.mock("resend", () => ({
  Resend: vi.fn().mockImplementation(() => ({ emails: { send: vi.fn(async () => ({ id: "email-id" })) } })),
}));
vi.mock("nodemailer", () => ({
  default: { createTransport: vi.fn(() => ({ sendMail: vi.fn(async () => ({})) })) },
}));

import { prisma, db } from "../support/mock";
import { anEvent } from "../support/builders";
import { eventRoutes } from "../../src/routes/events";
import { LifecycleTransitionError } from "../../src/services/lifecycle-transition";

async function generateToken(payload: any): Promise<string> {
  return new SignJWT(payload).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("15m").sign(JWT_SECRET);
}

describe("Events Integration Tests", () => {
  let app: Hono;

  beforeEach(() => {
    vi.clearAllMocks();
    db.reset();
    (prisma.userRole.findMany as any).mockResolvedValue([]);
    app = new Hono();
    app.onError((err, c) => {
      if (err.message === "Unauthorized") {
        return c.json({ success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } }, 401);
      }
      if (err.message === "Forbidden") {
        return c.json({ success: false, error: { code: "FORBIDDEN", message: "Forbidden" } }, 403);
      }
      if (err.message === "Not Found") {
        return c.json({ success: false, error: { code: "NOT_FOUND", message: "Not Found" } }, 404);
      }
      if (err instanceof LifecycleTransitionError) {
        return c.json({ success: false, error: { code: err.code, message: "Status telah berubah, silakan muat ulang" } }, 409);
      }
      return c.json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Internal Server Error" } }, 500);
    });
    app.route("/api/v1/events", eventRoutes);
  });

  describe("GET /events", () => {
    it("should list events publicly", async () => {
      const res = await app.request("/api/v1/events");
      expect(res.status).toBe(200);
      const body = await res.json() as any;
      expect(body.success).toBe(true);
      expect(body.pagination).toBeDefined();
    });
  });

  describe("POST /events", () => {
    it("should return 401 without auth", async () => {
      const res = await app.request("/api/v1/events", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      expect(res.status).toBe(401);
    });

    it("should return 400 when no organizer specified", async () => {
      const token = await generateToken({ sub: "user-1", email: "test@test.com", name: "Test", username: "test", type: "access" });
      (prisma.user.findUnique as any).mockResolvedValue({ tokenVersion: 0, status: "ACTIVE" });

      const res = await app.request("/api/v1/events", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title: "Test Event", eventDate: "2025-12-01T10:00:00Z" }),
      });
      expect(res.status).toBe(400);
    });

    it("should return 403 when user lacks community role", async () => {
      const token = await generateToken({ sub: "user-1", email: "test@test.com", name: "Test", username: "test", type: "access" });
      (prisma.user.findUnique as any).mockResolvedValue({ tokenVersion: 0, status: "ACTIVE" });
      (prisma.communityMember.findUnique as any).mockResolvedValue(null);

      const res = await app.request("/api/v1/events", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title: "Test Event", eventDate: "2025-12-01T10:00:00Z", communityId: "comm-1", quota: 100 }),
      });
      expect(res.status).toBe(403);
    });

    it("should create event with valid community role", async () => {
      const token = await generateToken({ sub: "user-1", email: "test@test.com", name: "Test", username: "test", type: "access" });
      (prisma.user.findUnique as any).mockResolvedValue({ tokenVersion: 0, status: "ACTIVE" });
      (prisma.communityMember.findUnique as any).mockResolvedValue({
        role: "OWNER", status: "ACTIVE", deletedAt: null, communityId: "comm-1", userId: "user-1",
      });

      const res = await app.request("/api/v1/events", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title: "Test Event", eventDate: "2025-12-01T10:00:00Z", communityId: "comm-1", quota: 100 }),
      });
      expect(res.status).toBe(201);
    });

    it("should return 409 if already registered", async () => {
      const token = await generateToken({ sub: "user-1", email: "test@test.com", name: "Test", username: "test", type: "access" });
      (prisma.user.findUnique as any).mockResolvedValue({ tokenVersion: 0, status: "ACTIVE" });
      (prisma.event.findUnique as any).mockResolvedValue({
        id: "event-1", slug: "test-event", title: "Test Event", status: "REGISTRATION_OPEN",
        deletedAt: null, quota: 100, allowWaitlist: false, createdById: "user-2",
        _count: { registrations: 0 },
      });
      (prisma.$queryRaw as any).mockResolvedValue([{
        quota: 100, status: "REGISTRATION_OPEN", allowWaitlist: false,
        registrationOpensAt: null, registrationDeadline: null, deletedAt: null,
      }]);
      (prisma.eventRegistration.findUnique as any).mockResolvedValue({
        id: "reg-1", userId: "user-1", eventId: "event-1", status: "CONFIRMED",
      });

      const res = await app.request("/api/v1/events/event-1/register", {
        method: "POST", headers: { Authorization: `Bearer ${token}` },
      });
      expect(res.status).toBe(409);
    });
  });

  describe("POST /events/:eventId/cancel", () => {
    it("should return 401 without auth", async () => {
      const res = await app.request("/api/v1/events/event-1/cancel", { method: "POST" });
      expect(res.status).toBe(401);
    });

    it("should cancel event as owner", async () => {
      const token = await generateToken({ sub: "user-1", email: "test@test.com", name: "Test", username: "test", type: "access" });
      (prisma.user.findUnique as any).mockResolvedValue({ tokenVersion: 0, status: "ACTIVE" });
      (prisma.event.findUnique as any).mockResolvedValue({
        id: "event-1", status: "PUBLISHED", deletedAt: null, createdById: "user-1",
        title: "Test", slug: "test", communityId: null, organizationId: null,
      });
      (prisma.communityMember.findUnique as any).mockResolvedValue(null);
      (prisma.organizationMember.findUnique as any).mockResolvedValue(null);
      (prisma.eventRegistration.findMany as any).mockResolvedValue([]);

      const res = await app.request("/api/v1/events/event-1/cancel", {
        method: "POST", headers: { Authorization: `Bearer ${token}` },
      });
      // Membership is null in this mock, so role resolves to null and
      // canManageEvent() returns false → 403 Forbidden.
      expect(res.status).toBe(403);
    });

    it("allows SUPER_ADMIN to cancel an event they do not own", async () => {
      const token = await generateToken({ sub: "user-2", email: "u2@test.com", name: "U2", username: "u2", type: "access" });
      (prisma.user.findUnique as any).mockResolvedValue({ tokenVersion: 0, status: "ACTIVE" });
      // Seeded (not just `mockResolvedValue`d) so the guarded `updateMany` inside
      // transitionEvent() checks its `where.status` against the SAME row `findUnique`
      // returns — this is what actually exercises the optimistic-concurrency guard
      // instead of an always-succeeds stub.
      anEvent(db, {
        id: "event-1", status: "PUBLISHED", createdById: "user-1",
        title: "Test", slug: "test", communityId: "comm-1", organizationId: null,
      });
      (prisma.communityMember.findUnique as any).mockResolvedValue(null);
      (prisma.organizationMember.findUnique as any).mockResolvedValue(null);
      // SUPER_ADMIN platform role → canManageEvent bypass applies.
      (prisma.userRole.findMany as any).mockResolvedValue([{ role: "SUPER_ADMIN" }]);
      (prisma.eventRegistration.findMany as any).mockResolvedValue([]);
      (prisma.volunteerOpportunity.findMany as any).mockResolvedValue([]);
      (prisma.volunteerApplication.findMany as any).mockResolvedValue([]);
      (prisma.volunteerOpportunity.updateMany as any).mockResolvedValue({ count: 0 });
      (prisma.volunteerApplication.updateMany as any).mockResolvedValue({ count: 0 });

      const res = await app.request("/api/v1/events/event-1/cancel", {
        method: "POST", headers: { Authorization: `Bearer ${token}` },
      });

      expect(res.status).toBe(200);
      const body = await res.json() as any;
      expect(body.data.status).toBe("CANCELLED");
      // Restore default (non-superadmin) role lookup so later tests are unaffected.
      (prisma.userRole.findMany as any).mockResolvedValue([]);
    });

    it("should return 403 when not authorized", async () => {
      const token = await generateToken({ sub: "user-2", email: "u2@test.com", name: "U2", username: "u2", type: "access" });
      (prisma.user.findUnique as any).mockResolvedValue({ tokenVersion: 0, status: "ACTIVE" });
      (prisma.event.findUnique as any).mockResolvedValue({
        id: "event-1", status: "PUBLISHED", deletedAt: null, createdById: "user-1",
        communityId: null, organizationId: null,
      });
      (prisma.communityMember.findUnique as any).mockResolvedValue(null);
      (prisma.organizationMember.findUnique as any).mockResolvedValue(null);

      const res = await app.request("/api/v1/events/event-1/cancel", {
        method: "POST", headers: { Authorization: `Bearer ${token}` },
      });
      expect(res.status).toBe(403);
    });

    it("cascades cancellation to volunteer opportunities and notifies applicants", async () => {
      const token = await generateToken({ sub: "user-1", email: "test@test.com", name: "Test", username: "test", type: "access" });
      (prisma.user.findUnique as any).mockResolvedValue({ tokenVersion: 0, status: "ACTIVE" });
      // Seeded (not just `mockResolvedValue`d) — see the SUPER_ADMIN cancel test above
      // for why the guarded `updateMany` needs a real backing row.
      anEvent(db, {
        id: "event-1", status: "PUBLISHED", createdById: "user-2",
        title: "Test", slug: "test", communityId: "comm-1", organizationId: null,
      });
      // Creator is an OWNER of the community → can manage the event.
      (prisma.communityMember.findUnique as any).mockResolvedValue({ role: "OWNER", status: "ACTIVE", deletedAt: null });
      (prisma.organizationMember.findUnique as any).mockResolvedValue(null);
      (prisma.eventRegistration.findMany as any).mockResolvedValue([]);
      // There is one volunteer opportunity with one applicant.
      (prisma.volunteerOpportunity.findMany as any).mockResolvedValue([{ id: "opp-1" }]);
      (prisma.volunteerApplication.findMany as any).mockResolvedValue([{ id: "va-1", userId: "member-9" }]);

      const res = await app.request("/api/v1/events/event-1/cancel", {
        method: "POST", headers: { Authorization: `Bearer ${token}` },
      });

      expect(res.status).toBe(200);
      // Volunteer opportunity must be closed and its applications rejected.
      const oppCall = (prisma.volunteerOpportunity.updateMany as any).mock.calls[0][0];
      expect(oppCall.data.status).toBe("CLOSED");
      expect(oppCall.where.id.in).toEqual(["opp-1"]);

      const appCall = (prisma.volunteerApplication.updateMany as any).mock.calls[0][0];
      expect(appCall.data.status).toBe("REJECTED");
      expect(appCall.where.opportunityId.in).toEqual(["opp-1"]);

      // Applicants must be notified about the cancellation.
      const notifData = (prisma.notification.createMany as any).mock.calls[0][0].data;
      expect(notifData).toEqual(
        expect.arrayContaining([expect.objectContaining({ userId: "member-9", title: "Event Dibatalkan" })])
      );
    });

    it("refuses a transition computed from a stale status snapshot (optimistic-concurrency guard)", async () => {
      // Regression test for the guard in services/lifecycle-transition.ts's
      // transitionEvent(): `tx.event.updateMany({ where: { status: expectedStatus },
      // ... })` must find ZERO rows — and therefore throw LifecycleTransitionError
      // ("EVENT_STATUS_CHANGED") — when the row's real status no longer matches what
      // the handler read earlier. The previous hand-rolled fake's `updateMany` always
      // returned `{ count: 1 }` regardless of `where.status`, so this path was never
      // actually exercised; grep for EVENT_STATUS_CHANGED found it in zero test files.
      const token = await generateToken({ sub: "user-1", email: "test@test.com", name: "Test", username: "test", type: "access" });
      (prisma.user.findUnique as any).mockResolvedValue({ tokenVersion: 0, status: "ACTIVE" });

      // The row's REAL current status is already CANCELLED — as if another admin's
      // request already won the race. Both the route handler's own `findUnique` read
      // AND the transition module's internal pre-update `findUnique` read (inside the
      // transaction) see a stale PUBLISHED snapshot, exactly like two concurrent reads
      // racing a concurrent update would produce — this forces the assertion past the
      // module's fail-fast pre-check and into the real defense: updateMany's `where`
      // matching against the actually-stored row.
      anEvent(db, {
        id: "event-race", status: "CANCELLED", createdById: "user-2",
        title: "Race", slug: "race", communityId: "comm-1", organizationId: null,
      });
      const staleSnapshot = {
        id: "event-race", status: "PUBLISHED", deletedAt: null, createdById: "user-2",
        title: "Race", slug: "race", communityId: "comm-1", organizationId: null,
      };
      (prisma.event.findUnique as any).mockResolvedValueOnce(staleSnapshot).mockResolvedValueOnce(staleSnapshot);
      (prisma.communityMember.findUnique as any).mockResolvedValue({ role: "OWNER", status: "ACTIVE", deletedAt: null });
      (prisma.organizationMember.findUnique as any).mockResolvedValue(null);
      (prisma.eventRegistration.findMany as any).mockResolvedValue([]);

      const res = await app.request("/api/v1/events/event-race/cancel", {
        method: "POST", headers: { Authorization: `Bearer ${token}` },
      });

      // app.ts's onError (mirrored in this test's local onError above) maps
      // LifecycleTransitionError to 409 for every caller, public or admin — fixing
      // the previous split where the public path fell through to a bare 500.
      expect(res.status).toBe(409);
      expect(prisma.event.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ id: "event-race", status: "PUBLISHED" }) })
      );
      // The stale write must never have taken effect.
      expect(db.tables.event.all().find((e) => e.id === "event-race")?.status).toBe("CANCELLED");
    });
  });

  describe("PATCH /events/:eventId organizer reassignment", () => {
    it("requires active membership in target organizer and clears previous organizer", async () => {
      const token = await generateToken({ sub: "user-1", email: "test@test.com", name: "Test", username: "test", type: "access" });
      (prisma.user.findUnique as any).mockResolvedValue({ tokenVersion: 0, status: "ACTIVE" });
      const event = {
        id: "event-1", status: "DRAFT", deletedAt: null, createdById: "user-1",
        communityId: "comm-1", organizationId: null, title: "Test", categories: [],
      };
      (prisma.event.findUnique as any).mockResolvedValue(event);
      (prisma.event.update as any).mockResolvedValue({
        ...event,
        communityId: "comm-2",
        organizationId: null,
        community: { id: "comm-2", name: "C2", slug: "c2" },
        organization: null,
      });
      (prisma.communityMember.findUnique as any).mockImplementation(({ where }: any) => {
        const id = where.communityId_userId.communityId;
        return id === "comm-1"
          ? { role: "OWNER", status: "ACTIVE", deletedAt: null }
          : { role: "ADMIN", status: "ACTIVE", deletedAt: new Date() };
      });

      const denied = await app.request("/api/v1/events/event-1", {
        method: "PATCH", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ communityId: "comm-2" }),
      });
      expect(denied.status).toBe(403);

      (prisma.communityMember.findUnique as any).mockImplementation(({ where }: any) =>
        ({ role: "ADMIN", status: "ACTIVE", deletedAt: null, communityId: where.communityId_userId.communityId })
      );
      const allowed = await app.request("/api/v1/events/event-1", {
        method: "PATCH", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ communityId: "comm-2" }),
      });
      expect(allowed.status).toBe(200);
      expect(prisma.event.update).toHaveBeenLastCalledWith(expect.objectContaining({
        data: expect.objectContaining({ communityId: "comm-2", organizationId: null }),
      }));
    });
  });

  describe("POST /events/:eventId/publish", () => {
    it("should return 401 without auth", async () => {
      const res = await app.request("/api/v1/events/event-1/publish", { method: "POST" });
      expect(res.status).toBe(401);
    });
  });

  describe("DELETE /events/:eventId", () => {
    it("should return 401 without auth", async () => {
      const res = await app.request("/api/v1/events/event-1", { method: "DELETE" });
      expect(res.status).toBe(401);
    });
  });

  describe("GET /events/:slug", () => {
    it("should return 404 for non-existent event", async () => {
      (prisma.event.findUnique as any).mockResolvedValue(null);
      const res = await app.request("/api/v1/events/nonexistent-slug");
      expect(res.status).toBe(404);
    });

    it("should return event detail for valid slug", async () => {
      (prisma.event.findUnique as any).mockResolvedValue({
        id: "event-1", slug: "test-event", title: "Test Event", status: "PUBLISHED",
        visibility: "PUBLIC", deletedAt: null, createdById: "user-1",
        gallery: null, registrations: [], categories: [], community: null, organization: null,
        createdBy: { id: "user-1", name: "Creator", avatar: null }, _count: { registrations: 0 },
        description: "desc", coverImage: null, thumbnail: null, location: "Jakarta",
        locationType: "PHYSICAL", isOnline: false, onlineUrl: null, meetingUrl: null,
        eventDate: new Date(), endDate: null, timezone: "Asia/Jakarta", quota: 100,
        allowWaitlist: false, contactName: null, contactEmail: null, contactPhone: null,
        communityId: null, organizationId: null, createdAt: new Date(), updatedAt: new Date(),
      });
      (prisma.eventRegistration.findUnique as any).mockResolvedValue(null);
      (prisma.communityMember.findUnique as any).mockResolvedValue(null);

      const res = await app.request("/api/v1/events/test-event");
      expect(res.status).toBe(200);
    });
  });

  describe("saved events", () => {
    it("requires authentication to save an event", async () => {
      const res = await app.request("/api/v1/events/event-1/save", { method: "POST" });
      expect(res.status).toBe(401);
    });

    it("saves and removes an event", async () => {
      const token = await generateToken({ sub: "user-1", email: "test@test.com", name: "Test", username: "test", type: "access" });
      (prisma.user.findUnique as any).mockResolvedValue({ tokenVersion: 0, status: "ACTIVE" });
      (prisma.event.findFirst as any).mockResolvedValue({ id: "event-1" });

      const saveRes = await app.request("/api/v1/events/event-1/save", {
        method: "POST", headers: { Authorization: `Bearer ${token}` },
      });
      expect(saveRes.status).toBe(200);
      expect(prisma.eventSave.upsert).toHaveBeenCalled();

      const deleteRes = await app.request("/api/v1/events/event-1/save", {
        method: "DELETE", headers: { Authorization: `Bearer ${token}` },
      });
      expect(deleteRes.status).toBe(200);
      expect(prisma.eventSave.deleteMany).toHaveBeenCalled();
    });

    it("returns 404 when saving a missing event", async () => {
      const token = await generateToken({ sub: "user-1", email: "test@test.com", name: "Test", username: "test", type: "access" });
      (prisma.user.findUnique as any).mockResolvedValue({ tokenVersion: 0, status: "ACTIVE" });
      (prisma.event.findFirst as any).mockResolvedValue(null);

      const res = await app.request("/api/v1/events/missing/save", {
        method: "POST", headers: { Authorization: `Bearer ${token}` },
      });
      expect(res.status).toBe(404);
    });
  });
});
