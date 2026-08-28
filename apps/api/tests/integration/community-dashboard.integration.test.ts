import { describe, it, expect, vi, beforeEach } from "vitest";
import { SignJWT } from "jose";

// Ticket #13 (spec #12): GET /communities/:communityId/dashboard carries the
// viewer's real community membership role (`userRole`), so the web client
// can derive every tab/action gate from can() in
// packages/shared/src/permissions.ts instead of an ownership boolean.
//
// Ticket #14 (spec #12) loosens the route's guard from requireCommunityAdmin
// to requireCommunityOfficer, so EVENT_MANAGER and VOLUNTEER_COORDINATOR can
// now open the workspace too -- but the payload is trimmed to what each role
// actually has authority over (pendingJoinRequestCount, recentActivity,
// communityInfo.settings), and every mutation route downstream of this one
// keeps its original requireCommunityAdmin/requireCommunityOwner guard
// untouched. This suite proves: the field is present and correct for every
// role that can now reach the route, a plain MEMBER and a non-member both
// still get 403, the payload is genuinely role-trimmed (not just hidden by
// the web client), and mutation guards below this route did not get any
// looser as a side effect.

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

describe("GET /communities/:communityId/dashboard — viewer role & workspace access (spec #12, tickets #13 & #14)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    db.reset();
    invalidateRoleCache("owner-1");
    invalidateRoleCache("admin-1");
    invalidateRoleCache("member-1");
    invalidateRoleCache("outsider-1");
    invalidateRoleCache("event-manager-1");
    invalidateRoleCache("volunteer-coordinator-1");
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

  it("rejects a plain MEMBER (requireCommunityOfficer excludes plain MEMBER)", async () => {
    await seedUser("owner-1");
    await seedUser("member-1");
    aCommunity(db, { id: "comm-3", ownerId: "owner-1" })
      .withMember({ id: "owner-1" }, { role: "OWNER" })
      .withMember({ id: "member-1" }, { role: "MEMBER" });

    const tok = await token("member-1");
    const res = await app.request("/api/v1/communities/comm-3/dashboard", { headers: headers(tok) });
    expect(res.status).toBe(403);
  });

  it("ticket #14: opens the workspace to EVENT_MANAGER, the guard's whole point", async () => {
    await seedUser("owner-1");
    await seedUser("event-manager-1");
    aCommunity(db, { id: "comm-4", ownerId: "owner-1" })
      .withMember({ id: "owner-1" }, { role: "OWNER" })
      .withMember({ id: "event-manager-1" }, { role: "EVENT_MANAGER" });

    const tok = await token("event-manager-1");
    const res = await app.request("/api/v1/communities/comm-4/dashboard", { headers: headers(tok) });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.userRole).toBe("EVENT_MANAGER");
  });

  it("ticket #14: opens the workspace to VOLUNTEER_COORDINATOR too", async () => {
    await seedUser("owner-1");
    await seedUser("volunteer-coordinator-1");
    aCommunity(db, { id: "comm-4b", ownerId: "owner-1" })
      .withMember({ id: "owner-1" }, { role: "OWNER" })
      .withMember({ id: "volunteer-coordinator-1" }, { role: "VOLUNTEER_COORDINATOR" });

    const tok = await token("volunteer-coordinator-1");
    const res = await app.request("/api/v1/communities/comm-4b/dashboard", { headers: headers(tok) });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.userRole).toBe("VOLUNTEER_COORDINATOR");
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

  it("ticket #14: loosening the entry guard does not loosen a downstream requireCommunityAdmin mutation for EVENT_MANAGER", async () => {
    await seedUser("owner-1");
    await seedUser("event-manager-1");
    aCommunity(db, { id: "comm-7", ownerId: "owner-1" })
      .withMember({ id: "owner-1" }, { role: "OWNER" })
      .withMember({ id: "event-manager-1" }, { role: "EVENT_MANAGER" });

    // EVENT_MANAGER now genuinely opens the workspace...
    const tok = await token("event-manager-1");
    const dashboardRes = await app.request("/api/v1/communities/comm-7/dashboard", { headers: headers(tok) });
    expect(dashboardRes.status).toBe(200);
    expect((await dashboardRes.json()).data.userRole).toBe("EVENT_MANAGER");

    // ...but a requireCommunityAdmin mutation route beneath it is untouched.
    const CSRF_TOKEN = "c".repeat(64);
    const settingsRes = await app.request(`/api/v1/communities/comm-7/settings`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${tok}`,
        "Content-Type": "application/json",
        "Content-Length": "26",
        Cookie: `csrf_token=${CSRF_TOKEN}`,
        "X-CSRF-Token": CSRF_TOKEN,
      },
      body: JSON.stringify({ allowMemberPost: false }),
    });
    expect(settingsRes.status).toBe(403);

    // A requireCommunityAdmin GET route is untouched too.
    const joinRequestsRes = await app.request(`/api/v1/communities/comm-7/join-requests`, { headers: headers(tok) });
    expect(joinRequestsRes.status).toBe(403);
  });

  describe("payload trimmed by the viewer's actual authority", () => {
    async function seedWorkspace(communityId: string) {
      await seedUser("owner-1");
      await seedUser("admin-1");
      await seedUser("event-manager-1");
      const community = aCommunity(db, { id: communityId, ownerId: "owner-1" })
        .withMember({ id: "owner-1" }, { role: "OWNER" })
        .withMember({ id: "admin-1" }, { role: "ADMIN" })
        .withMember({ id: "event-manager-1" }, { role: "EVENT_MANAGER" });

      // `settings` is a real relation in the fake engine (community ->
      // communitySettings via communityId), not a plain column -- seed the
      // related row directly rather than overriding aCommunity's `settings`
      // field, which the relation lookup ignores.
      db.tables.communitySettings.seed({
        id: `settings-${communityId}`,
        communityId,
        allowMemberPost: true,
        requireApproval: false,
        showMemberList: true,
        showEventList: true,
      });

      db.tables.joinRequest.seed({
        id: `jr-${communityId}`,
        communityId,
        userId: "owner-1",
        status: "PENDING",
      });
      db.tables.membershipHistory.seed({
        id: `mh-${communityId}`,
        communityId,
        userId: "admin-1",
        action: "ROLE_CHANGE",
        oldRole: "MEMBER",
        newRole: "ADMIN",
        details: null,
        performedBy: "owner-1",
        user: { id: "admin-1", name: "admin-1", avatar: null },
      });

      return community;
    }

    it("sends the real pendingJoinRequestCount, recentActivity and settings to an ADMIN (can handleJoinRequests/manageMembers/editSettings)", async () => {
      await seedWorkspace("comm-8");

      const tok = await token("admin-1");
      const res = await app.request("/api/v1/communities/comm-8/dashboard", { headers: headers(tok) });
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.data.pendingJoinRequestCount).toBe(1);
      expect(body.data.recentActivity).toHaveLength(1);
      expect(body.data.recentActivity[0].action).toBe("ROLE_CHANGE");
      expect(body.data.communityInfo.settings).not.toBeNull();
    });

    it("zeroes pendingJoinRequestCount, empties recentActivity and nulls settings for EVENT_MANAGER (none of those actions pass can())", async () => {
      await seedWorkspace("comm-9");

      const tok = await token("event-manager-1");
      const res = await app.request("/api/v1/communities/comm-9/dashboard", { headers: headers(tok) });
      expect(res.status).toBe(200);
      const body = await res.json();
      // The underlying data genuinely exists (proven by the ADMIN case above)
      // -- an EVENT_MANAGER must still not receive it.
      expect(body.data.pendingJoinRequestCount).toBe(0);
      expect(body.data.recentActivity).toEqual([]);
      expect(body.data.communityInfo.settings).toBeNull();
      // memberCount/activeEventCount stay unconditional -- no authority gate.
      expect(typeof body.data.memberCount).toBe("number");
      expect(typeof body.data.activeEventCount).toBe("number");
    });
  });
});
