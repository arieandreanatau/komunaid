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
      findFirst: vi.fn(async () => null),
      count: vi.fn(async () => 0),
      update: vi.fn(),
    },
    communitySettings: { findUnique: vi.fn(async () => null), upsert: vi.fn(async ({ create }: any) => create) },
    communityMedia: { findMany: vi.fn(async () => []), count: vi.fn(async () => 0) },
    communityCategory: { deleteMany: vi.fn(async () => ({ count: 0 })), createMany: vi.fn(async () => ({ count: 0 })), create: vi.fn(async () => ({})) },
    communityTag: { deleteMany: vi.fn(async () => ({ count: 0 })), createMany: vi.fn(async () => ({ count: 0 })) },
    joinRequest: {
      findFirst: vi.fn(async () => null), findUnique: vi.fn(async () => null),
      findMany: vi.fn(async () => []),
      create: vi.fn(async ({ data }: any) => ({ id: `jr-${Date.now()}`, ...data, status: "PENDING", createdAt: new Date() })),
      update: vi.fn(), count: vi.fn(async () => 0),
    },
    category: { findUnique: vi.fn(async () => null), findFirst: vi.fn(async () => null), create: vi.fn(async ({ data }: any) => ({ id: `cat-${Date.now()}`, ...data })) },
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

    it("should filter communities by category name", async () => {
      (prisma.category.findFirst as any).mockResolvedValue({ id: "cat-1", name: "Edukasi", slug: "edukasi" });
      (prisma.community.findMany as any).mockImplementation(({ where }: any) =>
        where.categories?.some?.categoryId === "cat-1"
          ? [{ id: "comm-1", name: "Edukasi Club", slug: "edukasi-club", description: null, coverImage: null, logo: null, banner: null, location: null, membershipType: "OPEN", visibility: "PUBLIC", status: "APPROVED", deletedAt: null, owner: { id: "u1", name: "O", avatar: null }, categories: [], tags: [], _count: { members: 0, events: 0 }, province: null, city: null, createdAt: new Date() }]
          : []
      );
      (prisma.community.count as any).mockResolvedValue(1);

      const res = await app.request("/api/v1/communities?category=Edukasi");
      expect(res.status).toBe(200);
      const body = await res.json() as any;
      expect(body.data).toHaveLength(1);
      expect(body.data[0].name).toBe("Edukasi Club");
      expect(prisma.community.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ categories: { some: { categoryId: "cat-1" } } }) })
      );
    });

    it("should return 404 for unknown category name", async () => {
      (prisma.category.findFirst as any).mockResolvedValue(null);
      const res = await app.request("/api/v1/communities?category=tidak-ada");
      expect(res.status).toBe(404);
      expect(prisma.community.findMany).not.toHaveBeenCalled();
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
      (prisma.user.findUnique as any).mockResolvedValue({ tokenVersion: 0, status: "ACTIVE" });

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
      (prisma.user.findUnique as any).mockResolvedValue({ tokenVersion: 0, status: "ACTIVE" });

      const res = await app.request("/api/v1/communities", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: "ab" }),
      });
      expect(res.status).toBe(400);
    });

    it("should return 400 with empty body", async () => {
      const token = await generateToken({ sub: "user-1", email: "test@test.com", name: "Test", username: "test", type: "access" });
      (prisma.user.findUnique as any).mockResolvedValue({ tokenVersion: 0, status: "ACTIVE" });

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
      (prisma.communityMember.findMany as any).mockResolvedValue([]);

      const res = await app.request("/api/v1/communities/test");
      expect(res.status).toBe(200);
      const body = await res.json() as any;
      expect(Array.isArray(body.data.officers)).toBe(true);
    });

    it("returns community officers separately from member preview", async () => {
      const token = await generateToken({ sub: "user-1", email: "u1@test.com", name: "U1", username: "u1", type: "access" });
      (prisma.user.findUnique as any).mockResolvedValue({ tokenVersion: 0, status: "ACTIVE" });
      (prisma.community.findUnique as any).mockResolvedValue({
        id: "comm-1", name: "Test", slug: "test", description: "desc",
        status: "APPROVED", visibility: "PUBLIC", deletedAt: null, ownerId: "user-1",
        members: [
          { user: { id: "user-1", name: "Owner", avatar: null }, role: "OWNER" },
          { user: { id: "user-9", name: "Anggota", avatar: null }, role: "MEMBER" },
        ],
        events: [], categories: [], tags: [], settings: null,
        _count: { members: 2, events: 0 },
        owner: { id: "user-1", name: "Owner", avatar: null, bio: null },
        coverImage: null, logo: null, banner: null, location: null,
        address: null, address1: null, address2: null, postalCode: null,
        district: null, village: null, country: null, province: null, city: null,
        website: null, membershipType: "OPEN", createdAt: new Date(), updatedAt: new Date(),
      });
      (prisma.communityMember.findUnique as any).mockResolvedValue({ role: "OWNER", status: "ACTIVE", deletedAt: null });
      (prisma.communityMember.findMany as any).mockResolvedValue([
        { user: { id: "user-1", name: "Owner", avatar: null }, role: "OWNER", status: "ACTIVE", deletedAt: null, joinedAt: new Date() },
        { user: { id: "user-2", name: "Budi", avatar: null }, role: "ADMIN", status: "ACTIVE", deletedAt: null, joinedAt: new Date() },
      ]);

      const res = await app.request("/api/v1/communities/test", { headers: { Authorization: `Bearer ${token}` } });
      expect(res.status).toBe(200);
      const body = await res.json() as any;
      expect(body.data.membersPreview).toHaveLength(2);
      expect(body.data.officers).toEqual([
        { id: "user-1", name: "Owner", avatar: null, role: "OWNER" },
        { id: "user-2", name: "Budi", avatar: null, role: "ADMIN" },
      ]);
    });

    it("should hide private community from suspended or deleted members", async () => {
      const token = await generateToken({ sub: "user-2", email: "u2@test.com", name: "U2", username: "u2", type: "access" });
      (prisma.user.findUnique as any).mockResolvedValue({ tokenVersion: 0, status: "ACTIVE" });
      (prisma.community.findUnique as any).mockResolvedValue({
        id: "comm-1", ownerId: "user-1", status: "APPROVED", visibility: "PRIVATE", deletedAt: null,
      });
      (prisma.communityMember.findUnique as any).mockResolvedValue({ role: "MEMBER", status: "SUSPENDED", deletedAt: null });

      const res = await app.request("/api/v1/communities/private", { headers: { Authorization: `Bearer ${token}` } });
      expect(res.status).toBe(403);
    });
  });

  describe("GET /communities/:communityId/members", () => {
    it("should list members of a public community without auth", async () => {
      (prisma.community.findUnique as any).mockResolvedValue({
        id: "comm-1",
        ownerId: "user-1",
        visibility: "PUBLIC",
        deletedAt: null,
        settings: null,
      });
      (prisma.communityMember.findMany as any).mockResolvedValue([
        {
          id: "member-1",
          user: { id: "user-1", name: "Owner", avatar: null, bio: null, username: "owner" },
          role: "OWNER",
          status: "ACTIVE",
          joinedAt: new Date(),
        },
      ]);
      (prisma.communityMember.count as any).mockResolvedValue(1);

      const res = await app.request("/api/v1/communities/comm-1/members?page=1&limit=20");

      expect(res.status).toBe(200);
      const body = await res.json() as any;
      expect(body.data).toHaveLength(1);
      expect(body.data[0].user.name).toBe("Owner");
      expect(prisma.communityMember.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            communityId: "comm-1",
            status: "ACTIVE",
            deletedAt: null,
          }),
        })
      );
    });

    it("should hide a private community member list from guests", async () => {
      (prisma.community.findUnique as any).mockResolvedValue({
        id: "comm-1",
        ownerId: "user-1",
        visibility: "PRIVATE",
        deletedAt: null,
        settings: null,
      });

      const res = await app.request("/api/v1/communities/comm-1/members");

      expect(res.status).toBe(403);
    });
  });

  describe("GET /communities/:communityId/media", () => {
    it("hides private community media from anonymous callers", async () => {
      (prisma.community.findUnique as any).mockResolvedValue({
        id: "comm-private", ownerId: "user-1", status: "APPROVED", visibility: "PRIVATE", deletedAt: null,
      });

      const res = await app.request("/api/v1/communities/comm-private/media");

      expect(res.status).toBe(404);
      expect(prisma.communityMedia.findMany).not.toHaveBeenCalled();
    });

    it("does not let anonymous published=false expose drafts", async () => {
      (prisma.community.findUnique as any).mockResolvedValue({
        id: "comm-public", ownerId: "user-1", status: "APPROVED", visibility: "PUBLIC", deletedAt: null,
      });

      const res = await app.request("/api/v1/communities/comm-public/media?published=false");

      expect(res.status).toBe(200);
      expect(prisma.communityMedia.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({ communityId: "comm-public", deletedAt: null, isPublished: true }),
      }));
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
      (prisma.user.findUnique as any).mockResolvedValue({ tokenVersion: 0, status: "ACTIVE" });
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
      (prisma.user.findUnique as any).mockResolvedValue({ tokenVersion: 0, status: "ACTIVE" });
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
      (prisma.user.findUnique as any).mockResolvedValue({ tokenVersion: 0, status: "ACTIVE" });
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
      (prisma.user.findUnique as any).mockResolvedValue({ tokenVersion: 0, status: "ACTIVE" });
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

  describe("POST /communities/:communityId/members/:memberId/restore", () => {
    function mockMembership(caller: { role: string; status: string }) {
      (prisma.communityMember.findUnique as any).mockImplementation(({ where }: any) => {
        if (where.communityId_userId) {
          if (where.communityId_userId.userId === "owner-1") {
            return { role: caller.role, status: caller.status, deletedAt: null };
          }
          return null;
        }
        return null;
      });
    }

    it("rejects non-admin caller", async () => {
      const token = await generateToken({ sub: "user-2", email: "u2@test.com", name: "U2", username: "u2", type: "access" });
      (prisma.user.findUnique as any).mockResolvedValue({ tokenVersion: 0, status: "ACTIVE" });
      (prisma.userRole.findMany as any).mockResolvedValue([{ role: "MEMBER" }]);
      mockMembership({ role: "MEMBER", status: "ACTIVE" });

      const res = await app.request("/api/v1/communities/comm-1/members/m-1/restore", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });
      expect(res.status).toBe(403);
      expect(prisma.communityMember.update).not.toHaveBeenCalled();
    });

    it("rejects restoring a member who is not banned", async () => {
      const token = await generateToken({ sub: "owner-1", email: "o1@test.com", name: "O1", username: "o1", type: "access" });
      (prisma.user.findUnique as any).mockResolvedValue({ tokenVersion: 0, status: "ACTIVE" });
      (prisma.userRole.findMany as any).mockResolvedValue([{ role: "MEMBER" }]);
      mockMembership({ role: "OWNER", status: "ACTIVE" });
      (prisma.community.findUnique as any).mockResolvedValue({ id: "comm-1", name: "Kom", ownerId: "owner-1", deletedAt: null });
      (prisma.communityMember.findUnique as any).mockImplementation(({ where }: any) => {
        if (where.id === "m-1") {
          return { id: "m-1", communityId: "comm-1", userId: "u9", role: "MEMBER", status: "ACTIVE", user: { id: "u9", name: "Budi" } };
        }
        return { role: "OWNER", status: "ACTIVE", deletedAt: null };
      });

      const res = await app.request("/api/v1/communities/comm-1/members/m-1/restore", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });
      expect(res.status).toBe(400);
      expect(prisma.communityMember.update).not.toHaveBeenCalled();
    });

    it("restores a banned member to active", async () => {
      const token = await generateToken({ sub: "owner-1", email: "o1@test.com", name: "O1", username: "o1", type: "access" });
      (prisma.user.findUnique as any).mockResolvedValue({ tokenVersion: 0, status: "ACTIVE" });
      (prisma.userRole.findMany as any).mockResolvedValue([{ role: "MEMBER" }]);
      (prisma.community.findUnique as any).mockResolvedValue({ id: "comm-1", name: "Kom", ownerId: "owner-1", deletedAt: null });
      (prisma.communityMember.findUnique as any).mockImplementation(({ where }: any) => {
        if (where.id === "m-1") {
          return { id: "m-1", communityId: "comm-1", userId: "u9", role: "MEMBER", status: "BANNED", deletedAt: new Date(), user: { id: "u9", name: "Budi" } };
        }
        return { role: "OWNER", status: "ACTIVE", deletedAt: null };
      });
      (prisma.communityMember.update as any).mockResolvedValue({ id: "m-1", status: "ACTIVE", deletedAt: null });

      const res = await app.request("/api/v1/communities/comm-1/members/m-1/restore", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });
      expect(res.status).toBe(200);
      const body = await res.json() as any;
      expect(body.message).toContain("Budi");
      expect(prisma.communityMember.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: "m-1" }, data: { status: "ACTIVE", deletedAt: null } })
      );
    });
  });

  describe("GET /communities/:communityId/members status filter", () => {
    it("lists banned members for owner", async () => {
      const token = await generateToken({ sub: "owner-1", email: "o1@test.com", name: "O1", username: "o1", type: "access" });
      (prisma.user.findUnique as any).mockResolvedValue({ tokenVersion: 0, status: "ACTIVE" });
      (prisma.userRole.findMany as any).mockResolvedValue([{ role: "MEMBER" }]);
      (prisma.community.findUnique as any).mockResolvedValue({ id: "comm-1", name: "Kom", ownerId: "owner-1", status: "APPROVED", visibility: "PUBLIC", deletedAt: null, settings: { showMemberList: true } });
      (prisma.communityMember.findFirst as any).mockResolvedValue({ id: "owner-m", role: "OWNER" });
      (prisma.communityMember.findMany as any).mockImplementation(({ where }: any) =>
        where.status === "BANNED"
          ? [{ id: "m-1", user: { id: "u9", name: "Budi", username: "budi", avatar: null }, role: "MEMBER", status: "BANNED", joinedAt: new Date() }]
          : []
      );
      (prisma.communityMember.count as any).mockResolvedValue(1);

      const res = await app.request("/api/v1/communities/comm-1/members?status=BANNED", { headers: { Authorization: `Bearer ${token}` } });
      expect(res.status).toBe(200);
      const body = await res.json() as any;
      expect(body.data).toHaveLength(1);
      expect(body.data[0].status).toBe("BANNED");
      expect(prisma.communityMember.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: expect.objectContaining({ status: "BANNED" }) }));
    });

    it("denies banned member list to plain members", async () => {
      const token = await generateToken({ sub: "user-2", email: "u2@test.com", name: "U2", username: "u2", type: "access" });
      (prisma.user.findUnique as any).mockResolvedValue({ tokenVersion: 0, status: "ACTIVE" });
      (prisma.userRole.findMany as any).mockResolvedValue([{ role: "MEMBER" }]);
      (prisma.community.findUnique as any).mockResolvedValue({ id: "comm-1", name: "Kom", ownerId: "owner-1", status: "APPROVED", visibility: "PUBLIC", deletedAt: null, settings: { showMemberList: true } });
      (prisma.communityMember.findFirst as any).mockResolvedValue({ id: "m-2", role: "MEMBER" });

      const res = await app.request("/api/v1/communities/comm-1/members?status=BANNED", { headers: { Authorization: `Bearer ${token}` } });
      expect(res.status).toBe(403);
      expect(prisma.communityMember.findMany).not.toHaveBeenCalled();
    });
  });
});
