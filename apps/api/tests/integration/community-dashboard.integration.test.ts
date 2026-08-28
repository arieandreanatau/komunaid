import { describe, it, expect, vi, beforeEach } from "vitest";
import { SignJWT } from "jose";

// Ticket #13 (spec #12): GET /communities/:communityId/dashboard now carries
// the viewer's real community membership role (`userRole`), so the web
// client can derive every tab/action gate from can() in
// packages/shared/src/permissions.ts instead of an ownership boolean.
//
// This suite intentionally does NOT touch the dashboard route's guard
// (`requireCommunityAdmin` stays exactly as it is -- loosening it to any
// officer role is ticket #14's job). It proves: the field is present and
// correct for OWNER and ADMIN (the only roles that can reach the route
// today), a plain MEMBER and a non-member both still get 403, and the
// mutation route guarded by requireCommunityOwner (changeMemberRole) does
// not get any looser as a side effect.

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

async function token(id: string, roles: string[] = ["MEMBER"]) {
  const u = db.tables.user.all().find((x) => x.id === id) || {};
  return new SignJWT({ sub: id, email: u.email || `${id}@test.local`, name: id, username: id, roles, type: "access", tokenVersion: 0 })
    .setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("15m").sign(JWT_SECRET);
}

function headers(accessToken: string): Record<string, string> {
  return { Authorization: `Bearer ${accessToken}` };
}

async function seedUser(id: string) {
  aUser(db, { id, name: id, username: id, email: `${id}@test.local` });
  db.tables.userRole.seed({ userId: id, role: "MEMBER" });
}

describe("GET /communities/:communityId/dashboard — viewer role (spec #12, ticket #13)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    db.reset();
    invalidateRoleCache("owner-1");
    invalidateRoleCache("admin-1");
    invalidateRoleCache("member-1");
    invalidateRoleCache("outsider-1");
    invalidateRoleCache("event-manager-1");
  });

  it("returns userRole: 'OWNER' for the community owner", async () => {
    await seedUser("owner-1");
    aCommunity(db, { id: "comm-1", ownerId: "owner-1" }).withMember({ id: "owner-1" }, { role: "OWNER" });

    const tok = await token("owner-1");
    const res = await app.request("/api/v1/communities/comm-1/dashboard", { headers: headers(tok) });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.userRole).toBe("OWNER");
  });

  it("returns userRole: 'ADMIN' for a community admin, distinct from the owner", async () => {
    await seedUser("owner-1");
    await seedUser("admin-1");
    aCommunity(db, { id: "comm-2", ownerId: "owner-1" })
      .withMember({ id: "owner-1" }, { role: "OWNER" })
      .withMember({ id: "admin-1" }, { role: "ADMIN" });

    const tok = await token("admin-1");
    const res = await app.request("/api/v1/communities/comm-2/dashboard", { headers: headers(tok) });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.userRole).toBe("ADMIN");
    // The response is genuinely role-specific, not just a hardcoded OWNER.
    expect(body.data.userRole).not.toBe("OWNER");
  });

  it("rejects a plain MEMBER (dashboard route stays requireCommunityAdmin under ticket #13)", async () => {
    await seedUser("owner-1");
    await seedUser("member-1");
    aCommunity(db, { id: "comm-3", ownerId: "owner-1" })
      .withMember({ id: "owner-1" }, { role: "OWNER" })
      .withMember({ id: "member-1" }, { role: "MEMBER" });

    const tok = await token("member-1");
    const res = await app.request("/api/v1/communities/comm-3/dashboard", { headers: headers(tok) });
    expect(res.status).toBe(403);
  });

  it("rejects a community officer role below ADMIN (EVENT_MANAGER) -- guard untouched by ticket #13", async () => {
    await seedUser("owner-1");
    await seedUser("event-manager-1");
    aCommunity(db, { id: "comm-4", ownerId: "owner-1" })
      .withMember({ id: "owner-1" }, { role: "OWNER" })
      .withMember({ id: "event-manager-1" }, { role: "EVENT_MANAGER" });

    const tok = await token("event-manager-1");
    const res = await app.request("/api/v1/communities/comm-4/dashboard", { headers: headers(tok) });
    expect(res.status).toBe(403);
  });

  it("rejects a non-member entirely", async () => {
    await seedUser("owner-1");
    await seedUser("outsider-1");
    aCommunity(db, { id: "comm-5", ownerId: "owner-1" }).withMember({ id: "owner-1" }, { role: "OWNER" });

    const tok = await token("outsider-1");
    const res = await app.request("/api/v1/communities/comm-5/dashboard", { headers: headers(tok) });
    expect(res.status).toBe(403);
  });

  it("does not loosen changeMemberRole's requireCommunityOwner guard: an ADMIN still cannot change a member's role", async () => {
    await seedUser("owner-1");
    await seedUser("admin-1");
    await seedUser("member-1");
    aCommunity(db, { id: "comm-6", ownerId: "owner-1" })
      .withMember({ id: "owner-1" }, { role: "OWNER" })
      .withMember({ id: "admin-1" }, { role: "ADMIN" })
      .withMember({ id: "member-1" }, { role: "MEMBER" });

    // Confirm ADMIN genuinely reaches the dashboard with the right role...
    const adminTok = await token("admin-1");
    const dashboardRes = await app.request("/api/v1/communities/comm-6/dashboard", { headers: headers(adminTok) });
    expect(dashboardRes.status).toBe(200);
    expect((await dashboardRes.json()).data.userRole).toBe("ADMIN");

    // ...but still cannot reach the OWNER-only role-change mutation.
    const CSRF_TOKEN = "c".repeat(64);
    const memberId = "member-comm-6-member-1";
    const roleRes = await app.request(`/api/v1/communities/comm-6/members/${memberId}/role`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${adminTok}`,
        "Content-Type": "application/json",
        "Content-Length": "8",
        Cookie: `csrf_token=${CSRF_TOKEN}`,
        "X-CSRF-Token": CSRF_TOKEN,
      },
      body: JSON.stringify({ role: "ADMIN" }),
    });
    expect(roleRes.status).toBe(403);
  });
});
