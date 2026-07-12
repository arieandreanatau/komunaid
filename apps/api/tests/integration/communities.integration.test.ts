import { describe, it, expect, vi, beforeEach } from "vitest";
import { Hono } from "hono";
import { SignJWT } from "jose";

const JWT_SECRET = new TextEncoder().encode("test-integration-secret");
process.env.JWT_SECRET = "test-integration-secret";

vi.mock("@komunaid/database", () => {
  const communities = new Map<string, any>();
  const members = new Map<string, any[]>();
  let idCounter = 1;
  const createId = () => `comm-${idCounter++}`;

  const prisma = {
    community: {
      findUnique: vi.fn(async ({ where }: any) => {
        if (where.id) return communities.get(where.id) || null;
        if (where.slug) return Array.from(communities.values()).find((c) => c.slug === where.slug) || null;
        return null;
      }),
      findMany: vi.fn(async () => Array.from(communities.values())),
      create: vi.fn(async ({ data }: any) => {
        const id = createId();
        const slug = data.slug || data.name.toLowerCase().replace(/\s+/g, "-");
        const community = {
          id, name: data.name, slug, description: data.description || null,
          location: data.location || null, website: data.website || null,
          ownerId: data.ownerId, status: data.status || "DRAFT",
          visibility: data.visibility || "PUBLIC", membershipType: data.membershipType || "OPEN",
          deletedAt: null, coverImage: null, logo: null, banner: null,
          address: null, address1: null, address2: null, postalCode: null,
          district: null, village: null, country: null, province: null, city: null,
          contactEmail: null, contactPhone: null, submittedAt: null, reviewedAt: null,
          adminNote: null, createdAt: new Date(), updatedAt: new Date(),
          _count: { members: 0, events: 0 }, categories: [], tags: [],
          owner: { id: data.ownerId, name: "Owner", avatar: null },
          members: [], events: [], settings: null,
        };
        communities.set(id, community);
        members.set(id, [{ userId: data.ownerId, role: "OWNER", status: "ACTIVE", communityId: id }]);
        return community;
      }),
      update: vi.fn(async ({ where, data }: any) => {
        const c = communities.get(where.id);
        if (!c) throw new Error("Not found");
        Object.assign(c, data);
        return c;
      }),
      count: vi.fn(async () => communities.size),
    },
    communityMember: {
      findUnique: vi.fn(async ({ where }: any) => {
        const cid = where?.communityId_userId?.communityId || "";
        const uid = where?.communityId_userId?.userId || "";
        const commMembers = members.get(cid) || [];
        return commMembers.find((m) => m.userId === uid) || null;
      }),
      create: vi.fn(async ({ data }: any) => {
        const commMembers = members.get(data.communityId) || [];
        commMembers.push({ ...data, id: `member-${Date.now()}` });
        return { id: `member-${Date.now()}`, ...data };
      }),
      findMany: vi.fn(async () => []),
      count: vi.fn(async () => 0),
      update: vi.fn(),
    },
    communitySettings: { findUnique: vi.fn(async () => null), upsert: vi.fn(async ({ create }: any) => create) },
    communityCategory: { deleteMany: vi.fn(async () => ({ count: 0 })), createMany: vi.fn(async () => ({ count: 0 })), create: vi.fn(async () => ({})) },
    communityTag: { deleteMany: vi.fn(async () => ({ count: 0 })), createMany: vi.fn(async () => ({ count: 0 })) },
    joinRequest: {
      findFirst: vi.fn(async () => null), findUnique: vi.fn(async () => null),
      findMany: vi.fn(async () => []),
      create: vi.fn(async ({ data }: any) => ({ id: `jr-${Date.now()}`, ...data, status: "PENDING", createdAt: new Date() })),
      update: vi.fn(), count: vi.fn(async () => 0),
    },
    category: { findUnique: vi.fn(async () => null), create: vi.fn(async ({ data }: any) => ({ id: `cat-${Date.now()}`, ...data })) },
    auditLog: { create: vi.fn(async () => ({})) },
    activityHistory: { create: vi.fn(async () => ({})) },
    membershipHistory: { create: vi.fn(async () => ({})), findMany: vi.fn(async () => []) },
    notification: { create: vi.fn(async () => ({})), createMany: vi.fn(async () => ({ count: 0 })) },
    event: { count: vi.fn(async () => 0) },
    organization: { count: vi.fn(async () => 0) },
    organizationMember: { findUnique: vi.fn(async () => null), count: vi.fn(async () => 0) },
    userRole: { findMany: vi.fn(async () => []) },
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
import { communityRoutes } from "../../src/routes/communities";

async function generateToken(payload: any): Promise<string> {
  return new SignJWT(payload).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("15m").sign(JWT_SECRET);
}

describe("Communities Integration Tests", () => {
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
    app.route("/api/v1/communities", communityRoutes);
  });

  describe("GET /communities", () => {
    it("should list communities publicly", async () => {
      const res = await app.request("/api/v1/communities");
      expect(res.status).toBe(200);
      const body = await res.json() as any;
      expect(body.success).toBe(true);
      expect(body.pagination).toBeDefined();
    });
  });

  describe("POST /communities", () => {
    it("should return 401 without auth", async () => {
      const res = await app.request("/api/v1/communities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Test" }),
      });
      expect(res.status).toBe(401);
    });

    it("should create a community with valid auth", async () => {
      const token = await generateToken({ sub: "user-1", email: "test@test.com", name: "Test", username: "test", type: "access" });
      (prisma.user.findUnique as any).mockResolvedValue({ tokenVersion: 0 });

      const res = await app.request("/api/v1/communities", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: "My Community", description: "A great community", membershipType: "OPEN", visibility: "PUBLIC", location: "Jakarta" }),
      });

      expect(res.status).toBe(201);
      const body = await res.json() as any;
      expect(body.success).toBe(true);
      expect(body.data.name).toBe("My Community");
    });

    it("should return 400 for short name", async () => {
      const token = await generateToken({ sub: "user-1", email: "test@test.com", name: "Test", username: "test", type: "access" });
      (prisma.user.findUnique as any).mockResolvedValue({ tokenVersion: 0 });

      const res = await app.request("/api/v1/communities", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: "ab" }),
      });
      expect(res.status).toBe(400);
    });

    it("should return 400 with empty body", async () => {
      const token = await generateToken({ sub: "user-1", email: "test@test.com", name: "Test", username: "test", type: "access" });
      (prisma.user.findUnique as any).mockResolvedValue({ tokenVersion: 0 });

      const res = await app.request("/api/v1/communities", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({}),
      });
      expect(res.status).toBe(400);
    });
  });

  describe("GET /communities/:slug", () => {
    it("should return 404 for non-existent slug", async () => {
      const res = await app.request("/api/v1/communities/nonexistent");
      expect(res.status).toBe(404);
    });

    it("should return community detail for valid slug", async () => {
      (prisma.community.findUnique as any).mockResolvedValue({
        id: "comm-1", name: "Test", slug: "test", description: "desc",
        status: "APPROVED", visibility: "PUBLIC", deletedAt: null, ownerId: "user-1",
        members: [], events: [], categories: [], tags: [], settings: null,
        _count: { members: 1, events: 0 },
        owner: { id: "user-1", name: "Owner", avatar: null, bio: null },
        coverImage: null, logo: null, banner: null, location: null,
        address: null, address1: null, address2: null, postalCode: null,
        district: null, village: null, country: null, province: null, city: null,
        website: null, membershipType: "OPEN", createdAt: new Date(), updatedAt: new Date(),
      });
      (prisma.communityMember.findUnique as any).mockResolvedValue(null);

      const res = await app.request("/api/v1/communities/test");
      expect(res.status).toBe(200);
    });
  });

  describe("POST /communities/:communityId/join", () => {
    it("should return 401 without auth", async () => {
      const res = await app.request("/api/v1/communities/comm-1/join", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      expect(res.status).toBe(401);
    });

    it("should return 404 for non-existent community", async () => {
      const token = await generateToken({ sub: "user-2", email: "u2@test.com", name: "U2", username: "u2", type: "access" });
      (prisma.user.findUnique as any).mockResolvedValue({ tokenVersion: 0 });
      (prisma.community.findUnique as any).mockResolvedValue(null);

      const res = await app.request("/api/v1/communities/nonexistent/join", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({}),
      });
      expect(res.status).toBe(404);
    });
  });

  describe("POST /communities/:communityId/leave", () => {
    it("should return 401 without auth", async () => {
      const res = await app.request("/api/v1/communities/comm-1/leave", { method: "POST" });
      expect(res.status).toBe(401);
    });

    it("should return 400 when not a member", async () => {
      const token = await generateToken({ sub: "user-2", email: "u2@test.com", name: "U2", username: "u2", type: "access" });
      (prisma.user.findUnique as any).mockResolvedValue({ tokenVersion: 0 });
      (prisma.communityMember.findUnique as any).mockResolvedValue(null);

      const res = await app.request("/api/v1/communities/comm-1/leave", {
        method: "POST", headers: { Authorization: `Bearer ${token}` },
      });
      expect(res.status).toBe(400);
    });
  });

  describe("GET /communities/my/submissions", () => {
    it("should return 401 without auth", async () => {
      const res = await app.request("/api/v1/communities/my/submissions");
      expect(res.status).toBe(401);
    });
  });

  describe("POST /communities/:communityId/join (restricted)", () => {
    it("should create join request for RESTRICTED community", async () => {
      const token = await generateToken({ sub: "user-2", email: "u2@test.com", name: "U2", username: "u2", type: "access" });
      (prisma.user.findUnique as any).mockResolvedValue({ tokenVersion: 0 });
      (prisma.community.findUnique as any).mockResolvedValue({
        id: "comm-1", name: "Restricted", status: "APPROVED", visibility: "PUBLIC",
        deletedAt: null, membershipType: "RESTRICTED",
      });
      (prisma.communityMember.findUnique as any).mockResolvedValue(null);
      (prisma.joinRequest.findFirst as any).mockResolvedValue(null);

      const res = await app.request("/api/v1/communities/comm-1/join", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ message: "I want to join" }),
      });

      expect(res.status).toBe(201);
      const body = await res.json() as any;
      expect(body.success).toBe(true);
    });
  });

  describe("POST /communities/:communityId/join (duplicate)", () => {
    it("should return 409 if already a member", async () => {
      const token = await generateToken({ sub: "user-2", email: "u2@test.com", name: "U2", username: "u2", type: "access" });
      (prisma.user.findUnique as any).mockResolvedValue({ tokenVersion: 0 });
      (prisma.community.findUnique as any).mockResolvedValue({
        id: "comm-1", name: "Test", status: "APPROVED", visibility: "PUBLIC",
        deletedAt: null, membershipType: "OPEN",
      });
      (prisma.communityMember.findUnique as any).mockResolvedValue({
        id: "m-1", userId: "user-2", communityId: "comm-1", role: "MEMBER", status: "ACTIVE",
      });

      const res = await app.request("/api/v1/communities/comm-1/join", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({}),
      });

      expect(res.status).toBe(409);
    });
  });
});
