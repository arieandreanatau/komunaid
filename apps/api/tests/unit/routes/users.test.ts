import { describe, it, expect, vi, beforeEach } from "vitest";
import { Hono } from "hono";
import { SignJWT } from "jose";

vi.hoisted(() => {
  process.env.JWT_SECRET = "test-unit-secret-key-for-jwt";
});

vi.mock("@komunaid/database", () => {
  const handlers: Record<string, any> = {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(async ({ data }: any) => ({ id: "created-id", createdAt: new Date(), updatedAt: new Date(), ...data })),
    update: vi.fn(async ({ where, data }: any) => ({ id: where?.id || "id", ...data, updatedAt: new Date() })),
    updateMany: vi.fn(async () => ({ count: 0 })),
    delete: vi.fn(),
    deleteMany: vi.fn(async () => ({ count: 0 })),
    count: vi.fn(async () => 0),
    createMany: vi.fn(async () => ({ count: 0 })),
    upsert: vi.fn(),
  };
  const prisma: any = new Proxy({}, {
    get(_: any, table: string) { return handlers; },
  });
  return { prisma };
});

vi.mock("pino", () => ({
  default: vi.fn(() => ({
    info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn(), child: vi.fn().mockReturnThis(),
  })),
}));
vi.mock("pino-pretty", () => ({ default: vi.fn(() => ({})) }));
vi.mock("resend", () => ({
  Resend: vi.fn().mockImplementation(() => ({
    emails: { send: vi.fn(async () => ({ id: "test-email-id" })) },
  })),
}));
vi.mock("nodemailer", () => ({
  default: {
    createTransport: vi.fn(() => ({
      sendMail: vi.fn(async () => ({ messageId: "test-message-id" })),
    })),
  },
}));

import { prisma } from "@komunaid/database";
import { userRoutes } from "../../../src/routes/users";

const JWT_SECRET = new TextEncoder().encode("test-unit-secret-key-for-jwt");

async function generateToken(payload: Record<string, any>): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("15m")
    .sign(JWT_SECRET);
}

function mockAuth(routeResult?: any) {
  (prisma.user.findUnique as any).mockImplementation(async (args: any) => {
    if (args?.select?.tokenVersion !== undefined) {
      return { tokenVersion: 0, status: "ACTIVE" };
    }
    return routeResult !== undefined ? routeResult : null;
  });
}

describe("User Routes", () => {
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
      return c.json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Internal Server Error" } }, 500);
    });
    app.route("/users", userRoutes);
  });

  describe("GET /profile", () => {
    it("should return 401 without auth token", async () => {
      const res = await app.request("/users/profile");
      expect(res.status).toBe(401);
    });

    it("should return profile with all mapped fields", async () => {
      const token = await generateToken({ sub: "user-1", email: "u@test.com", name: "U", username: "u", type: "access" });
      mockAuth({
        id: "user-1", name: "U", username: "u", email: "u@test.com", phone: "123", bio: "bio",
        location: "loc", avatar: "http://img", status: "ACTIVE",
        roles: [{ role: "MEMBER" }], interests: [{ interest: "coding" }],
        joinedCommunities: [{ community: { id: "c1", name: "C1", slug: "c1", logo: "l", status: "APPROVED" }, role: "MEMBER", status: "ACTIVE", deletedAt: null }],
        organizationMembers: [{ organization: { id: "o1", name: "O1", slug: "o1", logo: "l", status: "ACTIVE" }, role: "OWNER" }],
        registeredEvents: [{ event: { id: "e1", title: "E1", slug: "e1", coverImage: "ci", eventDate: new Date(), status: "PUBLISHED" }, status: "CONFIRMED" }],
        savedEvents: [{ event: { id: "e2", title: "E2", slug: "e2", coverImage: null, eventDate: new Date(), status: "PUBLISHED" }, createdAt: new Date() }],
        notifications: [],
        createdAt: new Date(),
      });
      (prisma.notification.count as any)
        .mockResolvedValueOnce(2)
        .mockResolvedValueOnce(1)
        .mockResolvedValueOnce(1);

      const res = await app.request("/users/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data.user.roles).toEqual(["MEMBER"]);
      expect(body.data.user.interests).toEqual(["coding"]);
      expect(body.data.user.communities).toHaveLength(1);
      expect(body.data.user.communities[0].name).toBe("C1");
      expect(body.data.user.organizations).toHaveLength(1);
      expect(body.data.user.events).toHaveLength(1);
      expect(body.data.user.events[0].registrationStatus).toBe("CONFIRMED");
      expect(body.data.user.registeredEventsCount).toBe(1);
      expect(body.data.user.savedEvents).toHaveLength(1);
      expect(body.data.user.savedEventsCount).toBe(1);
      expect(body.data.user.unreadNotifications).toBe(2);
    });

    it("should return 404 when user not found", async () => {
      const token = await generateToken({ sub: "user-1", email: "u@test.com", name: "U", username: "u", type: "access" });
      mockAuth(null);

      const res = await app.request("/users/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      expect(res.status).toBe(404);
      const body = await res.json();
      expect(body.success).toBe(false);
      expect(body.message).toBe("User tidak ditemukan");
    });

    it("should map roles from nested role objects to flat strings", async () => {
      const token = await generateToken({ sub: "u1", email: "a@b.com", name: "A", username: "a", type: "access" });
      mockAuth({
        id: "u1", name: "A", username: "a", email: "a@b.com", phone: null, bio: null,
        location: null, avatar: null, status: "ACTIVE",
        roles: [{ role: "MEMBER" }, { role: "PLATFORM_ADMIN" }], interests: [],
        joinedCommunities: [], organizationMembers: [], registeredEvents: [], notifications: [],
        createdAt: new Date(),
      });
      (prisma.notification.count as any).mockResolvedValue(0);

      const res = await app.request("/users/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const body = await res.json();
      expect(body.data.user.roles).toEqual(["MEMBER", "PLATFORM_ADMIN"]);
    });

    it("should map interests from nested objects to flat strings", async () => {
      const token = await generateToken({ sub: "u1", email: "a@b.com", name: "A", username: "a", type: "access" });
      mockAuth({
        id: "u1", name: "A", username: "a", email: "a@b.com", phone: null, bio: null,
        location: null, avatar: null, status: "ACTIVE",
        roles: [], interests: [{ interest: "music" }, { interest: "sports" }],
        joinedCommunities: [], organizationMembers: [], registeredEvents: [], notifications: [],
        createdAt: new Date(),
      });
      (prisma.notification.count as any).mockResolvedValue(0);

      const res = await app.request("/users/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const body = await res.json();
      expect(body.data.user.interests).toEqual(["music", "sports"]);
    });

    it("should map community members with role and status", async () => {
      const token = await generateToken({ sub: "u1", email: "a@b.com", name: "A", username: "a", type: "access" });
      mockAuth({
        id: "u1", name: "A", username: "a", email: "a@b.com", phone: null, bio: null,
        location: null, avatar: null, status: "ACTIVE",
        roles: [], interests: [],
        joinedCommunities: [
          { community: { id: "c1", name: "C1", slug: "c1", logo: "l1", status: "APPROVED" }, role: "OWNER", status: "ACTIVE", deletedAt: null },
          { community: { id: "c2", name: "C2", slug: "c2", logo: "l2", status: "PENDING" }, role: "MEMBER", status: "ACTIVE", deletedAt: null },
        ],
        organizationMembers: [], registeredEvents: [], notifications: [],
        createdAt: new Date(),
      });
      (prisma.notification.count as any).mockResolvedValue(0);

      const res = await app.request("/users/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const body = await res.json();
      expect(body.data.user.communities).toHaveLength(2);
      expect(body.data.user.communities[0].role).toBe("OWNER");
      expect(body.data.user.communities[1].status).toBe("PENDING");
      expect(body.data.user.createdCommunities).toHaveLength(1);
      expect(body.data.user.followedCommunities).toHaveLength(1);
      expect(body.data.user.pastCommunities).toHaveLength(0);
    });

    it("should separate communities that the user previously followed", async () => {
      const token = await generateToken({ sub: "u1", email: "a@b.com", name: "A", username: "a", type: "access" });
      const leftAt = new Date("2026-07-01T00:00:00.000Z");
      mockAuth({
        id: "u1", name: "A", username: "a", email: "a@b.com", phone: null, bio: null,
        location: null, avatar: null, status: "ACTIVE", roles: [], interests: [],
        joinedCommunities: [
          { community: { id: "c1", name: "Past", slug: "past", logo: null, status: "APPROVED" }, role: "MEMBER", status: "ACTIVE", deletedAt: leftAt },
          { community: { id: "c2", name: "Banned", slug: "banned", logo: null, status: "APPROVED" }, role: "MEMBER", status: "BANNED", deletedAt: leftAt },
        ],
        organizationMembers: [], registeredEvents: [], notifications: [], createdAt: new Date(),
      });
      (prisma.notification.count as any).mockResolvedValue(0);

      const res = await app.request("/users/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const body = await res.json();

      expect(body.data.user.communities).toHaveLength(0);
      expect(body.data.user.pastCommunities).toEqual([
        expect.objectContaining({ id: "c1", leftAt: leftAt.toISOString() }),
        expect.objectContaining({ id: "c2", leftAt: leftAt.toISOString() }),
      ]);
    });

    it("should return zero unreadNotifications when count is 0", async () => {
      const token = await generateToken({ sub: "u1", email: "a@b.com", name: "A", username: "a", type: "access" });
      mockAuth({
        id: "u1", name: "A", username: "a", email: "a@b.com", phone: null, bio: null,
        location: null, avatar: null, status: "ACTIVE",
        roles: [], interests: [], joinedCommunities: [], organizationMembers: [],
        registeredEvents: [], notifications: [],
        createdAt: new Date(),
      });
      (prisma.notification.count as any).mockResolvedValue(0);

      const res = await app.request("/users/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const body = await res.json();
      expect(body.data.user.unreadNotifications).toBe(0);
    });
  });

  describe("PUT /profile", () => {
    it("should return 401 without auth token", async () => {
      const res = await app.request("/users/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "New Name" }),
      });
      expect(res.status).toBe(401);
    });

    it("should update profile successfully", async () => {
      const token = await generateToken({ sub: "user-1", email: "u@test.com", name: "U", username: "u", type: "access" });
      mockAuth({ id: "user-1", name: "Old", phone: null, bio: null, location: null, avatar: null });
      (prisma.user.update as any).mockResolvedValue({
        id: "user-1", name: "New Name", email: "u@test.com", phone: "08123",
        bio: "Hello", location: "Jakarta", avatar: "http://img",
      });

      const res = await app.request("/users/profile", {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ name: "New Name", phone: "08123", bio: "Hello", location: "Jakarta" }),
      });
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data.user.name).toBe("New Name");
      expect(body.data.user.phone).toBe("08123");
    });

    it("should return 400 for invalid avatar URL", async () => {
      const token = await generateToken({ sub: "user-1", email: "u@test.com", name: "U", username: "u", type: "access" });

      const res = await app.request("/users/profile", {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ avatar: "not-a-url" }),
      });
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.success).toBe(false);
      expect(body.message).toBe("Validation Error");
    });

    it("should create an audit log on update", async () => {
      const token = await generateToken({ sub: "user-1", email: "u@test.com", name: "U", username: "u", type: "access" });
      mockAuth({ id: "user-1", name: "Old", phone: null, bio: null, location: null, avatar: null });
      (prisma.user.update as any).mockResolvedValue({
        id: "user-1", name: "New", email: "u@test.com", phone: null, bio: null, location: null, avatar: null,
      });

      await app.request("/users/profile", {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ name: "New" }),
      });
      expect(prisma.auditLog.create).toHaveBeenCalled();
    });

    it("should create activity history on update", async () => {
      const token = await generateToken({ sub: "user-1", email: "u@test.com", name: "U", username: "u", type: "access" });
      mockAuth({ id: "user-1", name: "Old", phone: null, bio: null, location: null, avatar: null });
      (prisma.user.update as any).mockResolvedValue({
        id: "user-1", name: "New", email: "u@test.com", phone: null, bio: null, location: null, avatar: null,
      });

      await app.request("/users/profile", {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ name: "New" }),
      });
      expect(prisma.activityHistory.create).toHaveBeenCalled();
    });

    it("should allow updating with empty body", async () => {
      const token = await generateToken({ sub: "user-1", email: "u@test.com", name: "U", username: "u", type: "access" });
      mockAuth({ id: "user-1", name: "Old", phone: null, bio: null, location: null, avatar: null });
      (prisma.user.update as any).mockResolvedValue({
        id: "user-1", name: "Old", email: "u@test.com", phone: null, bio: null, location: null, avatar: null,
      });

      const res = await app.request("/users/profile", {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      expect(res.status).toBe(200);
    });
  });

  describe("GET /:id", () => {
    it("should return user by ID", async () => {
      (prisma.user.findUnique as any).mockImplementation(async (args: any) => {
        if (args?.select?.tokenVersion !== undefined) return { tokenVersion: 0, status: "ACTIVE" };
        return {
          id: "user-42", name: "John", avatar: "http://img", bio: "bio",
          location: "City", createdAt: new Date(),
          joinedCommunities: [{ community: { id: "c1", name: "C1", slug: "c1", logo: "l" } }],
        };
      });

      const res = await app.request("/users/user-42");
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data.user.id).toBe("user-42");
      expect(body.data.user.name).toBe("John");
    });

    it("should return 404 when user not found", async () => {
      (prisma.user.findUnique as any).mockImplementation(async (args: any) => {
        if (args?.select?.tokenVersion !== undefined) return { tokenVersion: 0, status: "ACTIVE" };
        return null;
      });

      const res = await app.request("/users/nonexistent");
      expect(res.status).toBe(404);
      const body = await res.json();
      expect(body.success).toBe(false);
      expect(body.message).toBe("User tidak ditemukan");
    });

    it("should not require authentication", async () => {
      (prisma.user.findUnique as any).mockImplementation(async (args: any) => {
        if (args?.select?.tokenVersion !== undefined) return { tokenVersion: 0, status: "ACTIVE" };
        return {
          id: "u1", name: "A", avatar: null, bio: null,
          location: null, createdAt: new Date(), joinedCommunities: [],
        };
      });

      const res = await app.request("/users/u1");
      expect(res.status).toBe(200);
    });

    it("should pass correct where clause to prisma", async () => {
      (prisma.user.findUnique as any).mockImplementation(async (args: any) => {
        if (args?.select?.tokenVersion !== undefined) return { tokenVersion: 0, status: "ACTIVE" };
        return {
          id: "u1", name: "A", avatar: null, bio: null,
          location: null, createdAt: new Date(), joinedCommunities: [],
        };
      });

      await app.request("/users/u1");
      expect(prisma.user.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ id: "u1", deletedAt: null }),
        })
      );
    });
  });

  describe("PUT /interests", () => {
    it("should return 401 without auth", async () => {
      const res = await app.request("/users/interests", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interests: [] }),
      });
      expect(res.status).toBe(401);
    });

    it("should update interests successfully", async () => {
      const token = await generateToken({ sub: "u1", email: "a@b.com", name: "A", username: "a", type: "access" });
      mockAuth();

      const res = await app.request("/users/interests", {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ interests: ["coding", "music"] }),
      });
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data.interests).toEqual(["coding", "music"]);
    });

    it("should return 400 for non-array interests", async () => {
      const token = await generateToken({ sub: "u1", email: "a@b.com", name: "A", username: "a", type: "access" });
      mockAuth();

      const res = await app.request("/users/interests", {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ interests: "not-an-array" }),
      });
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.message).toBe("Interests harus berupa array");
    });

    it("should return 400 for more than 20 interests", async () => {
      const token = await generateToken({ sub: "u1", email: "a@b.com", name: "A", username: "a", type: "access" });
      mockAuth();
      const interests = Array.from({ length: 21 }, (_, i) => `interest-${i}`);

      const res = await app.request("/users/interests", {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ interests }),
      });
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.message).toBe("Maksimal 20 interests");
    });

    it("should allow exactly 20 interests", async () => {
      const token = await generateToken({ sub: "u1", email: "a@b.com", name: "A", username: "a", type: "access" });
      mockAuth();
      const interests = Array.from({ length: 20 }, (_, i) => `interest-${i}`);

      const res = await app.request("/users/interests", {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ interests }),
      });
      expect(res.status).toBe(200);
    });

    it("should delete existing interests before inserting new ones", async () => {
      const token = await generateToken({ sub: "u1", email: "a@b.com", name: "A", username: "a", type: "access" });
      mockAuth();

      await app.request("/users/interests", {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ interests: ["coding"] }),
      });
      expect(prisma.userInterest.deleteMany).toHaveBeenCalled();
    });

    it("should create audit log on interests update", async () => {
      const token = await generateToken({ sub: "u1", email: "a@b.com", name: "A", username: "a", type: "access" });
      mockAuth();

      await app.request("/users/interests", {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ interests: ["coding"] }),
      });
      expect(prisma.auditLog.create).toHaveBeenCalled();
    });

    it("should handle empty interests array", async () => {
      const token = await generateToken({ sub: "u1", email: "a@b.com", name: "A", username: "a", type: "access" });
      mockAuth();

      const res = await app.request("/users/interests", {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ interests: [] }),
      });
      expect(res.status).toBe(200);
    });
  });

  describe("GET /notifications", () => {
    it("should return 401 without auth", async () => {
      const res = await app.request("/users/notifications");
      expect(res.status).toBe(401);
    });

    it("should return unread notifications", async () => {
      const token = await generateToken({ sub: "u1", email: "a@b.com", name: "A", username: "a", type: "access" });
      mockAuth();
      (prisma.notification.findMany as any).mockResolvedValue([{ id: "n1", isRead: false }]);
      (prisma.notification.count as any).mockResolvedValue(1);

      const res = await app.request("/users/notifications?unread=true&page=1&limit=1", {
        headers: { Authorization: `Bearer ${token}` },
      });

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.data).toHaveLength(1);
      expect(body.pagination.total).toBe(1);
      expect(prisma.notification.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userId: "u1", isRead: false } })
      );
    });
  });

  describe("PUT /notifications/:id/read", () => {
    it("should mark notification as read", async () => {
      const token = await generateToken({ sub: "u1", email: "a@b.com", name: "A", username: "a", type: "access" });
      mockAuth();
      (prisma.notification.findFirst as any).mockResolvedValue({ id: "n1", userId: "u1", isRead: false });

      const res = await app.request("/users/notifications/n1/read", {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(prisma.notification.update).toHaveBeenCalledWith({
        where: { id: "n1" },
        data: { isRead: true },
      });
    });

    it("should return 404 when notification not found", async () => {
      const token = await generateToken({ sub: "u1", email: "a@b.com", name: "A", username: "a", type: "access" });
      mockAuth();
      (prisma.notification.findFirst as any).mockResolvedValue(null);

      const res = await app.request("/users/notifications/nonexistent/read", {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      expect(res.status).toBe(404);
      const body = await res.json();
      expect(body.message).toBe("Notification tidak ditemukan");
    });

    it("should return 401 without auth", async () => {
      const res = await app.request("/users/notifications/n1/read", { method: "PUT" });
      expect(res.status).toBe(401);
    });
  });

  describe("PUT /notifications/read-all", () => {
    it("should mark all notifications as read", async () => {
      const token = await generateToken({ sub: "u1", email: "a@b.com", name: "A", username: "a", type: "access" });
      mockAuth();

      const res = await app.request("/users/notifications/read-all", {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.message).toBe("Semua notifikasi ditandai sudah dibaca");
      expect(prisma.notification.updateMany).toHaveBeenCalledWith({
        where: { userId: "u1", isRead: false },
        data: { isRead: true },
      });
    });

    it("should return 401 without auth", async () => {
      const res = await app.request("/users/notifications/read-all", { method: "PUT" });
      expect(res.status).toBe(401);
    });
  });

  describe("GET /activity", () => {
    it("should return 401 without auth", async () => {
      const res = await app.request("/users/activity");
      expect(res.status).toBe(401);
    });

    it("should return activity history", async () => {
      const token = await generateToken({ sub: "u1", email: "a@b.com", name: "A", username: "a", type: "access" });
      mockAuth();
      (prisma.activityHistory.findMany as any).mockResolvedValue([]);
      (prisma.activityHistory.count as any).mockResolvedValue(0);

      const res = await app.request("/users/activity", {
        headers: { Authorization: `Bearer ${token}` },
      });
      expect(res.status).toBe(200);
    });
  });
});
