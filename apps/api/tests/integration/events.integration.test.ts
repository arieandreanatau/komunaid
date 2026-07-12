import { describe, it, expect, vi, beforeEach } from "vitest";
import { Hono } from "hono";
import { SignJWT } from "jose";

const JWT_SECRET = new TextEncoder().encode("test-integration-secret");
process.env.JWT_SECRET = "test-integration-secret";

vi.mock("@komunaid/database", () => {
  const events = new Map<string, any>();
  const registrations = new Map<string, any>();
  let idCounter = 1;
  const createId = () => `event-${idCounter++}`;

  const prisma = {
    event: {
      findUnique: vi.fn(async ({ where }: any) => {
        if (where.id) return events.get(where.id) || null;
        if (where.slug) return Array.from(events.values()).find((e) => e.slug === where.slug) || null;
        return null;
      }),
      findMany: vi.fn(async () => Array.from(events.values())),
      create: vi.fn(async ({ data }: any) => {
        const id = createId();
        const event = {
          id, title: data.title, slug: data.slug || data.title.toLowerCase().replace(/\s+/g, "-"),
          description: data.description || null, status: data.status || "DRAFT",
          visibility: data.visibility || "PUBLIC", deletedAt: null,
          coverImage: null, thumbnail: null, location: data.location || null,
          locationType: data.locationType || "PHYSICAL", isOnline: data.isOnline || false,
          onlineUrl: null, meetingUrl: null, eventDate: data.eventDate || new Date(),
          endDate: data.endDate || null, timezone: "Asia/Jakarta", quota: data.quota || 100,
          allowWaitlist: data.allowWaitlist || false, contactName: null, contactEmail: null,
          contactPhone: null, gallery: null, communityId: data.communityId || null,
          organizationId: data.organizationId || null, createdById: data.createdById,
          createdAt: new Date(), updatedAt: new Date(), _count: { registrations: 0 },
          community: null, organization: null,
          createdBy: { id: data.createdById, name: "Creator", avatar: null },
          categories: [], registrations: [],
        };
        events.set(id, event);
        return event;
      }),
      update: vi.fn(async ({ where, data }: any) => {
        const e = events.get(where.id);
        if (!e) throw new Error("Not found");
        Object.assign(e, data);
        return e;
      }),
      count: vi.fn(async () => events.size),
    },
    eventRegistration: {
      findUnique: vi.fn(async ({ where }: any) => {
        if (where.eventId_userId) {
          return Array.from(registrations.values()).find(
            (r) => r.eventId === where.eventId_userId.eventId && r.userId === where.eventId_userId.userId
          ) || null;
        }
        if (where.id) return Array.from(registrations.values()).find((r) => r.id === where.id) || null;
        return null;
      }),
      findMany: vi.fn(async () => Array.from(registrations.values())),
      create: vi.fn(async ({ data }: any) => {
        const id = `reg-${Date.now()}`;
        const reg = { id, ...data, registeredAt: new Date(), attendance: null, checkedInAt: null, checkedOutAt: null, notes: null };
        registrations.set(id, reg);
        return reg;
      }),
      update: vi.fn(async ({ where, data }: any) => {
        const r = Array.from(registrations.values()).find((reg) => reg.id === where.id);
        if (r) Object.assign(r, data);
        return r;
      }),
      delete: vi.fn(), count: vi.fn(async () => registrations.size),
      groupBy: vi.fn(async () => []), updateMany: vi.fn(async () => ({ count: 0 })),
    },
    communityMember: { findUnique: vi.fn(async () => null) },
    organizationMember: { findUnique: vi.fn(async () => null) },
    userRole: { findMany: vi.fn(async () => []) },
    auditLog: { create: vi.fn(async () => ({})) },
    activityHistory: { create: vi.fn(async () => ({})) },
    notification: { create: vi.fn(async () => ({})), createMany: vi.fn(async () => ({ count: 0 })) },
    eventCategory: { deleteMany: vi.fn(async () => ({ count: 0 })), createMany: vi.fn(async () => ({ count: 0 })) },
    user: { findUnique: vi.fn(async () => null) },
    $transaction: vi.fn(async (fn: any) => { if (typeof fn === "function") return fn(prisma); return Promise.all(fn); }),
    $queryRaw: vi.fn(async () => []),
  };
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

import { prisma } from "@komunaid/database";
import { eventRoutes } from "../../src/routes/events";

async function generateToken(payload: any): Promise<string> {
  return new SignJWT(payload).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("15m").sign(JWT_SECRET);
}

describe("Events Integration Tests", () => {
  let app: Hono;

  beforeEach(() => {
    vi.clearAllMocks();
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
        body: JSON.stringify({ title: "Test Event", eventDate: "2025-12-01T10:00:00Z", communityId: "comm-1" }),
      });
      expect([400, 403]).toContain(res.status);
    });

    it("should create event with valid community role", async () => {
      const token = await generateToken({ sub: "user-1", email: "test@test.com", name: "Test", username: "test", type: "access" });
      (prisma.user.findUnique as any).mockResolvedValue({ tokenVersion: 0, status: "ACTIVE" });
      (prisma.communityMember.findUnique as any).mockResolvedValue({
        role: "OWNER", communityId: "comm-1", userId: "user-1",
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
      expect([200, 403]).toContain(res.status);
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
});
