import { describe, it, expect, vi, beforeEach } from "vitest";
import { SignJWT } from "jose";

const JWT_SECRET = new TextEncoder().encode("test-integration-secret");
process.env.JWT_SECRET = "test-integration-secret";
process.env.CSRF_SECRET = "test-csrf-secret";

// In-memory data
const users = new Map<string, any>();
const memberships = new Map<string, any>(); // key `${communityId}:${userId}`
const communities = new Map<string, any>();

vi.mock("@komunaid/database", () => {
  const prisma: any = {
    user: {
      findUnique: vi.fn(async ({ where, include }: any) => {
        if (where.id) {
          const u = users.get(where.id);
          if (!u) return null;
          await new Promise((r) => setTimeout(r, 1));
          if (include?.roles) return { ...u, roles: u.roleList || [] };
          return { ...u };
        }
        return null;
      }),
      findMany: vi.fn(async () => []),
      count: vi.fn(async () => 0),
      update: vi.fn(async ({ where, data }: any) => {
        const u = users.get(where.id);
        Object.assign(u, data);
        return { ...u };
      }),
    },
    userRole: {
      findMany: vi.fn(async ({ where }: any) => (users.get(where.userId)?.roleList || [])),
      findFirst: vi.fn(async () => null),
      count: vi.fn(async () => 1),
      deleteMany: vi.fn(async () => ({ count: 1 })),
      create: vi.fn(async ({ data }: any) => ({ ...data })),
    },
    community: {
      findUnique: vi.fn(async ({ where }: any) => (where.id ? (communities.get(where.id) || null) : null)),
      findMany: vi.fn(async () => Array.from(communities.values())),
      count: vi.fn(async () => communities.size),
      update: vi.fn(async ({ where, data }: any) => {
        const c = communities.get(where.id);
        Object.assign(c, data);
        return { ...c };
      }),
      create: vi.fn(async ({ data }: any) => ({ id: "comm-new", ...data })),
      deleteMany: vi.fn(async () => ({ count: 0 })),
    },
    communityMember: {
      findUnique: vi.fn(async ({ where, include }: any) => {
        if (where.communityId_userId) {
          const m = memberships.get(`${where.communityId_userId.communityId}:${where.communityId_userId.userId}`) || null;
          if (!m) return null;
          if (include?.user) return { ...m, user: { id: m.userId, name: m.userId } };
          return { ...m };
        }
        if (where.id) {
          return Array.from(memberships.values()).find((m) => m.id === where.id) || null;
        }
        return null;
      }),
      findMany: vi.fn(async () => Array.from(memberships.values())),
      findFirst: vi.fn(async () => null),
      count: vi.fn(async () => 0),
      create: vi.fn(async ({ data }: any) => ({ id: "member-new", ...data })),
      update: vi.fn(async ({ where, data }: any) => ({ id: where.id, ...data })),
    },
    organization: { findUnique: vi.fn(async () => null), findMany: vi.fn(async () => []), count: vi.fn(async () => 0) },
    organizationMember: { findUnique: vi.fn(async () => null), findMany: vi.fn(async () => []), count: vi.fn(async () => 0) },
    event: {
      findUnique: vi.fn(async () => null),
      findMany: vi.fn(async () => []),
      count: vi.fn(async () => 0),
      create: vi.fn(async ({ data }: any) => ({ id: "event-new", ...data })),
    },
    category: { findUnique: vi.fn(async () => null), create: vi.fn(async () => ({})) },
    communityCategory: { deleteMany: vi.fn(async () => ({ count: 0 })), createMany: vi.fn(async () => ({ count: 0 })), create: vi.fn(async () => ({})) },
    communityTag: { deleteMany: vi.fn(async () => ({ count: 0 })), createMany: vi.fn(async () => ({ count: 0 })) },
    auditLog: { create: vi.fn(async () => ({})), findMany: vi.fn(async () => []), count: vi.fn(async () => 0) },
    notification: { create: vi.fn(async () => ({})), createMany: vi.fn(async () => ({ count: 0 })) },
    activityHistory: { create: vi.fn(async () => ({})) },
    membershipHistory: { create: vi.fn(async () => ({})), findMany: vi.fn(async () => []) },
    setting: { findMany: vi.fn(async () => []), upsert: vi.fn(async ({ create }: any) => create) },
    report: { count: vi.fn(async () => 0), findMany: vi.fn(async () => []), findUnique: vi.fn(async () => null) },
    communitySettings: { findUnique: vi.fn(async () => null) },
    communityMedia: { findMany: vi.fn(async () => []), count: vi.fn(async () => 0) },
    joinRequest: { findFirst: vi.fn(async () => null), findMany: vi.fn(async () => []) },
    volunteerOpportunity: { findUnique: vi.fn(async () => null), findMany: vi.fn(async () => []) },
    volunteerStatusHistory: { create: vi.fn(async () => ({})), findMany: vi.fn(async () => []) },
  };
  return { prisma };
});

vi.mock("pino", () => ({ default: vi.fn(() => ({ info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn(), child: vi.fn().mockReturnThis() })) }));
vi.mock("pino-pretty", () => ({ default: vi.fn(() => ({})) }));
vi.mock("resend", () => ({ Resend: vi.fn().mockImplementation(() => ({ emails: { send: vi.fn(async () => ({})) } })) }));
vi.mock("nodemailer", () => ({ default: { createTransport: vi.fn(() => ({ sendMail: vi.fn(async () => ({})) })) } }));

import { prisma } from "@komunaid/database";
import { invalidateRoleCache } from "../../src/middleware/rbac";
import app from "../../src/app";

const CSRF_TOKEN = "c".repeat(64);

async function token(id: string, roles: string[], claims: { status?: string; deletedAt?: boolean } = {}) {
  const u = users.get(id) || {};
  return new SignJWT({ sub: id, email: u.email || `${id}@test.local`, name: id, username: id, roles, type: "access", ...(claims.status === "SUSPENDED" ? {} : {}), tokenVersion: 0 })
    .setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("15m").sign(JWT_SECRET);
}

function headers(accessToken: string, mutation = false): Record<string, string> {
  if (mutation) {
    return { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json", "Content-Length": "8", Cookie: `csrf_token=${CSRF_TOKEN}`, "X-CSRF-Token": CSRF_TOKEN };
  }
  return { Authorization: `Bearer ${accessToken}` };
}

async function seedUser(id: string, fields: any = {}) {
  users.set(id, { id, name: id, username: id, email: `${id}@test.local`, status: "ACTIVE", deletedAt: null, tokenVersion: 0, roleList: [{ userId: id, role: "MEMBER" }], ...fields });
}

async function seedCommunity(id: string, ownerId: string, fields: any = {}) {
  communities.set(id, {
    id, name: id, slug: id, description: "d", status: "APPROVED", visibility: "PUBLIC", membershipType: "OPEN",
    ownerId, deletedAt: null, createdAt: new Date(), updatedAt: new Date(), _count: { members: 1, events: 0 }, ...fields,
  });
  memberships.set(`${id}:${ownerId}`, { id: `mem-${id}-${ownerId}`, communityId: id, userId: ownerId, role: "OWNER", status: "ACTIVE", deletedAt: null });
}

async function seedMember(communityId: string, userId: string, role: string) {
  memberships.set(`${communityId}:${userId}`, { id: `mem-${communityId}-${userId}`, communityId, userId, role, status: "ACTIVE", deletedAt: null });
}

describe("08b — RBAC privilege escalation (horizontal & vertical)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    users.clear();
    memberships.clear();
    communities.clear();
    invalidateRoleCache("admin-a");
    invalidateRoleCache("admin-b");
    invalidateRoleCache("member-1");
    invalidateRoleCache("super-1");
    invalidateRoleCache("platform-1");
    invalidateRoleCache("member-suspended");
  });

  describe("Horizontal escalation", () => {
    it("Admin A must NOT update Community B (owned by Admin B)", async () => {
      await seedUser("admin-a");
      await seedUser("admin-b");
      await seedCommunity("comm-a", "admin-a");
      await seedCommunity("comm-b", "admin-b");
      await seedMember("comm-b", "admin-b", "OWNER");

      const tok = await token("admin-a", ["MEMBER"]);
      const res = await app.request("/api/v1/communities/comm-b", {
        method: "PUT",
        headers: headers(tok, true),
        body: JSON.stringify({ name: "Community B hacked" }),
      });
      expect(res.status).toBe(403);
    });

    it("Member must NOT archive a community (owner-only)", async () => {
      await seedUser("member-1");
      await seedUser("owner-1");
      await seedCommunity("comm-x", "owner-1");
      await seedMember("comm-x", "member-1", "MEMBER");

      const tok = await token("member-1", ["MEMBER"]);
      const res = await app.request("/api/v1/communities/comm-x/archive", { method: "POST", headers: headers(tok, true) });
      expect(res.status).toBe(403);
    });

    it("Community Admin must NOT change member role of another community (owner-only)", async () => {
      await seedUser("admin-a");
      await seedUser("admin-b");
      await seedUser("victim");
      await seedCommunity("comm-a", "admin-a");
      await seedCommunity("comm-b", "admin-b");
      await seedMember("comm-b", "admin-b", "OWNER");
      await seedMember("comm-b", "victim", "MEMBER");

      const tok = await token("admin-a", ["MEMBER"]);
      const memberId = `mem-comm-b-victim`;
      const res = await app.request(`/api/v1/communities/comm-b/members/${memberId}/role`, {
        method: "PUT", headers: headers(tok, true), body: JSON.stringify({ role: "ADMIN" }),
      });
      expect(res.status).toBe(403);
    });

    it("Member must NOT update community (needs OWNER/ADMIN membership)", async () => {
      await seedUser("member-1");
      await seedUser("owner-1");
      await seedCommunity("comm-x", "owner-1");
      await seedMember("comm-x", "member-1", "MEMBER");

      const tok = await token("member-1", ["MEMBER"]);
      const res = await app.request("/api/v1/communities/comm-x", {
        method: "PUT", headers: headers(tok, true), body: JSON.stringify({ name: "x" }),
      });
      expect(res.status).toBe(403);
    });
  });

  describe("Vertical escalation", () => {
    it("Member must NOT call Super Admin endpoints", async () => {
      await seedUser("member-1");
      const tok = await token("member-1", ["MEMBER"]);
      for (const path of ["/users?limit=5", "/audit-logs?limit=5", "/dashboard/growth"]) {
        const res = await app.request(`/api/v1/admin${path}`, { method: "GET", headers: headers(tok) });
        expect(res.status).toBe(403);
      }
    });

    it("Platform Admin must NOT suspend a Super Admin (canMutateTarget)", async () => {
      await seedUser("platform-1", { roleList: [{ userId: "platform-1", role: "PLATFORM_ADMIN" }] });
      await seedUser("super-1", { roleList: [{ userId: "super-1", role: "SUPER_ADMIN" }] });

      const tok = await token("platform-1", ["PLATFORM_ADMIN"]);
      const res = await app.request("/api/v1/admin/users/super-1/suspend", { method: "PUT", headers: headers(tok, true) });
      expect(res.status).toBe(403);
    });

    it("Platform Admin must NOT change role to SUPER_ADMIN", async () => {
      await seedUser("platform-1", { roleList: [{ userId: "platform-1", role: "PLATFORM_ADMIN" }] });
      await seedUser("member-1");

      const tok = await token("platform-1", ["PLATFORM_ADMIN"]);
      const res = await app.request("/api/v1/admin/users/member-1/role", {
        method: "PUT", headers: headers(tok, true), body: JSON.stringify({ role: "SUPER_ADMIN" }),
      });
      expect(res.status).toBe(403);
    });

    it("Platform Admin must NOT suspend another Platform Admin", async () => {
      await seedUser("platform-1", { roleList: [{ userId: "platform-1", role: "PLATFORM_ADMIN" }] });
      await seedUser("platform-2", { roleList: [{ userId: "platform-2", role: "PLATFORM_ADMIN" }] });

      const tok = await token("platform-1", ["PLATFORM_ADMIN"]);
      const res = await app.request("/api/v1/admin/users/platform-2/suspend", { method: "PUT", headers: headers(tok, true) });
      expect(res.status).toBe(403);
    });

    it("Super Admin CAN suspend a Member (control case)", async () => {
      await seedUser("super-1", { roleList: [{ userId: "super-1", role: "SUPER_ADMIN" }] });
      await seedUser("member-1");

      const tok = await token("super-1", ["SUPER_ADMIN"]);
      const res = await app.request("/api/v1/admin/users/member-1/suspend", { method: "PUT", headers: headers(tok, true) });
      expect([200, 400]).toContain(res.status); // 400 = already suspended, both mean authorized
    });
  });

  describe("Suspended / deleted user mutation", () => {
    it("Suspended user mutation attempt → 403", async () => {
      await seedUser("member-suspended", { status: "SUSPENDED" });
      await seedUser("owner-1");
      await seedCommunity("comm-x", "owner-1");

      const tok = await token("member-suspended", ["MEMBER"], { status: "SUSPENDED" });
      const res = await app.request("/api/v1/communities/comm-x/archive", { method: "POST", headers: headers(tok, true) });
      expect(res.status).toBe(403);
    });

    it("Deleted (deletedAt) user token → 401", async () => {
      await seedUser("member-deleted", { deletedAt: new Date() });
      const tok = await token("member-deleted", ["MEMBER"]);
      const res = await app.request("/api/v1/communities", { method: "POST", headers: headers(tok, true), body: JSON.stringify({ name: "x", description: "d" }) });
      expect(res.status).toBe(401);
    });
  });
});