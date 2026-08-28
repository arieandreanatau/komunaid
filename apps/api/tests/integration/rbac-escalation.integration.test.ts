import { describe, it, expect, vi, beforeEach } from "vitest";
import { SignJWT } from "jose";

const JWT_SECRET = new TextEncoder().encode("test-integration-secret");
process.env.JWT_SECRET = "test-integration-secret";
process.env.CSRF_SECRET = "test-csrf-secret";

vi.mock("@komunaid/database", async () => {
  const { prisma } = await import("../support/mock");
  return { prisma };
});

vi.mock("pino", () => ({ default: vi.fn(() => ({ info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn(), child: vi.fn().mockReturnThis() })) }));
vi.mock("pino-pretty", () => ({ default: vi.fn(() => ({})) }));
vi.mock("resend", () => ({ Resend: vi.fn().mockImplementation(() => ({ emails: { send: vi.fn(async () => ({})) } })) }));
vi.mock("nodemailer", () => ({ default: { createTransport: vi.fn(() => ({ sendMail: vi.fn(async () => ({})) })) } }));

import { db } from "../support/mock";
import { aUser, aCommunity } from "../support/builders";
import { invalidateRoleCache } from "../../src/middleware/rbac";
import app from "../../src/app";

const CSRF_TOKEN = "c".repeat(64);

async function token(id: string, roles: string[], claims: { status?: string; deletedAt?: boolean } = {}) {
  const u = db.tables.user.all().find((x) => x.id === id) || {};
  return new SignJWT({ sub: id, email: u.email || `${id}@test.local`, name: id, username: id, roles, type: "access", ...(claims.status === "SUSPENDED" ? {} : {}), tokenVersion: 0 })
    .setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("15m").sign(JWT_SECRET);
}

function headers(accessToken: string, mutation = false): Record<string, string> {
  if (mutation) {
    return { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json", "Content-Length": "8", Cookie: `csrf_token=${CSRF_TOKEN}`, "X-CSRF-Token": CSRF_TOKEN };
  }
  return { Authorization: `Bearer ${accessToken}` };
}

/** `fields.roleList` (a legacy shape from the old hand-rolled mock) still drives which
 *  platform roles get seeded into the real `userRole` table — everything else becomes
 *  a scalar field on the seeded user row. */
async function seedUser(id: string, fields: any = {}) {
  const { roleList, ...userFields } = fields;
  aUser(db, { id, name: id, username: id, email: `${id}@test.local`, ...userFields });
  const roles = roleList || [{ userId: id, role: "MEMBER" }];
  for (const r of roles) db.tables.userRole.seed({ userId: id, role: r.role });
}

async function seedCommunity(id: string, ownerId: string, fields: any = {}) {
  aCommunity(db, {
    id, name: id, slug: id, description: "d", status: "APPROVED", visibility: "PUBLIC", membershipType: "OPEN",
    ownerId, _count: { members: 1, events: 0 }, ...fields,
  }).withMember({ id: ownerId }, { id: `mem-${id}-${ownerId}`, role: "OWNER", status: "ACTIVE" });
}

async function seedMember(communityId: string, userId: string, role: string) {
  db.tables.communityMember.seed({ id: `mem-${communityId}-${userId}`, communityId, userId, role, status: "ACTIVE", deletedAt: null });
}

describe("08b — RBAC privilege escalation (horizontal & vertical)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    db.reset();
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