import { describe, it, expect, vi, beforeEach } from "vitest";
import { SignJWT } from "jose";

// Ticket #15 (spec #12): "the list of communities I manage must contain
// exactly the communities I can actually open." Before this ticket, the
// context switcher filtered profile.communities with isCommunityOfficer
// (packages/shared/src/permissions.ts) in the BROWSER only -- GET
// /users/profile returned every active membership unfiltered, and the
// "Komunitas Saya" page's "Kelola" affordance was hardcoded to
// role === "OWNER" on both server and client, so an ADMIN/EVENT_MANAGER/
// VOLUNTEER_COORDINATOR had no manage entry point at all even though ticket
// #14 already lets them open the workspace via requireCommunityOfficer.
//
// This suite proves the correspondence end to end, against the real Hono
// app and the real requireCommunityOfficer guard (not a mock of it):
//   1. GET /users/profile's managedCommunities contains exactly the
//      communities where the caller holds an officer role, and never a
//      plain MEMBER community.
//   2. Every community that shows up in managedCommunities can actually be
//      opened via GET /communities/:communityId/dashboard (200, not 403) --
//      the same route ticket #14 guarded with requireCommunityOfficer.
//   3. The one community where the caller is a plain MEMBER is rejected by
//      that same route (403), and is correctly absent from managedCommunities.
//
// managedCommunities and requireCommunityOfficer both resolve to
// isCommunityOfficer under the hood (apps/api/src/routes/users.ts,
// apps/api/src/middleware/rbac.ts) -- this test is what makes that
// correspondence a checked fact rather than two predicates that happen to
// agree today.

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
  // joinedCommunities/organizationMembers/registeredEvents/notifications/
  // interests are now real relations in fake-prisma's RELATIONS config for
  // the `user` table (fk userId, same as `roles`), so GET /users/profile's
  // include resolves each to `[]` on its own once no row references this
  // user -- no placeholder overrides needed here.
  aUser(db, { id, name: id, username: id, email: `${id}@test.local` });
  db.tables.userRole.seed({ userId: id, role: "MEMBER" });
}

/**
 * GET /users/profile selects `joinedCommunities` with a nested
 * `include: { community: { select: {...} } }`. fake-prisma's generic
 * relation-array resolution (fillIncludes) returns the raw joined
 * `communityMember` rows without recursively applying that nested
 * include/select -- the same reason tests/support/builders.ts's
 * `withMember` already embeds a `user: {...}` placeholder directly on the
 * row instead of relying on a real join back to the `user` table. This
 * mirrors that pattern for the other side: the row must carry its own
 * `community` projection so `membership.community.id/name/slug/logo/status`
 * (read by the route's `mapCommunity`) is already the right shape, and
 * `deletedAt: null` so the route's `where: { community: activeScope(...) }`
 * filter (which falls back to matching this embedded object once
 * fake-prisma finds no configured `communityMember -> community` relation)
 * resolves correctly instead of by coincidence.
 */
function seedOfficerMembership(communityId: string, callerId: string, role: string) {
  db.tables.communityMember.seed({
    id: `member-${communityId}-${callerId}`,
    communityId,
    userId: callerId,
    role,
    status: "ACTIVE",
    deletedAt: null,
    joinedAt: new Date(),
    user: { id: callerId, name: callerId, avatar: null },
    community: { id: communityId, name: communityId, slug: communityId, logo: null, status: "APPROVED", deletedAt: null },
  });
}

describe("Managed-communities correspondence — GET /users/profile vs GET /communities/:id/dashboard (spec #12, ticket #15)", () => {
  const CALLER = "officer-1";
  const OWNER_COMMUNITY = { id: "comm-owner", role: "OWNER" };
  const ADMIN_COMMUNITY = { id: "comm-admin", role: "ADMIN" };
  const EM_COMMUNITY = { id: "comm-em", role: "EVENT_MANAGER" };
  const VC_COMMUNITY = { id: "comm-vc", role: "VOLUNTEER_COORDINATOR" };
  const MEMBER_COMMUNITY = { id: "comm-member", role: "MEMBER" };
  const OTHER_OWNER = "other-owner-1";

  beforeEach(async () => {
    vi.clearAllMocks();
    db.reset();
    invalidateRoleCache(CALLER);
    invalidateRoleCache(OTHER_OWNER);

    await seedUser(CALLER);
    await seedUser(OTHER_OWNER);

    // The caller owns one community outright, holds each of the other
    // officer roles in one community apiece, and is a plain MEMBER of a
    // fifth. This exercises every CommunityRole isCommunityOfficer draws
    // the line across (packages/shared/src/permissions.ts). Each community
    // still needs its own OWNER so the workspace-guard checks below have a
    // real owner to attribute the community to; the caller's own membership
    // is seeded separately via seedOfficerMembership so it carries the
    // embedded `community` projection GET /users/profile reads.
    aCommunity(db, { id: OWNER_COMMUNITY.id, ownerId: CALLER });
    seedOfficerMembership(OWNER_COMMUNITY.id, CALLER, "OWNER");
    aCommunity(db, { id: ADMIN_COMMUNITY.id, ownerId: OTHER_OWNER }).withMember({ id: OTHER_OWNER }, { role: "OWNER" });
    seedOfficerMembership(ADMIN_COMMUNITY.id, CALLER, "ADMIN");
    aCommunity(db, { id: EM_COMMUNITY.id, ownerId: OTHER_OWNER }).withMember({ id: OTHER_OWNER }, { role: "OWNER" });
    seedOfficerMembership(EM_COMMUNITY.id, CALLER, "EVENT_MANAGER");
    aCommunity(db, { id: VC_COMMUNITY.id, ownerId: OTHER_OWNER }).withMember({ id: OTHER_OWNER }, { role: "OWNER" });
    seedOfficerMembership(VC_COMMUNITY.id, CALLER, "VOLUNTEER_COORDINATOR");
    aCommunity(db, { id: MEMBER_COMMUNITY.id, ownerId: OTHER_OWNER }).withMember({ id: OTHER_OWNER }, { role: "OWNER" });
    seedOfficerMembership(MEMBER_COMMUNITY.id, CALLER, "MEMBER");
  });

  it("managedCommunities contains exactly the four officer-role communities, never the plain-MEMBER one", async () => {
    const tok = await token(CALLER);
    const res = await app.request("/api/v1/users/profile", { headers: headers(tok) });
    expect(res.status).toBe(200);
    const body = await res.json();

    const managedIds = (body.data.user.managedCommunities as Array<{ id: string }>).map((c) => c.id).sort();
    expect(managedIds).toEqual([ADMIN_COMMUNITY.id, EM_COMMUNITY.id, OWNER_COMMUNITY.id, VC_COMMUNITY.id].sort());
    expect(managedIds).not.toContain(MEMBER_COMMUNITY.id);

    // Every community is still visible in the unfiltered list (the caller
    // IS a member of all five) -- only the managed subset narrows.
    expect((body.data.user.communities as Array<{ id: string }>).map((c) => c.id).sort()).toEqual(
      [OWNER_COMMUNITY.id, ADMIN_COMMUNITY.id, EM_COMMUNITY.id, VC_COMMUNITY.id, MEMBER_COMMUNITY.id].sort()
    );
  });

  it("every community reported in managedCommunities can actually be opened without rejection", async () => {
    const tok = await token(CALLER);

    const profileRes = await app.request("/api/v1/users/profile", { headers: headers(tok) });
    const profileBody = await profileRes.json();
    const managedIds: string[] = profileBody.data.user.managedCommunities.map((c: { id: string }) => c.id);

    expect(managedIds.length).toBeGreaterThan(0);

    for (const communityId of managedIds) {
      const dashboardRes = await app.request(`/api/v1/communities/${communityId}/dashboard`, { headers: headers(tok) });
      expect(dashboardRes.status, `community ${communityId} appeared in managedCommunities but was rejected by the workspace guard`).toBe(200);
    }
  });

  it("a plain MEMBER role is rejected by the same guard, matching its absence from managedCommunities", async () => {
    const tok = await token(CALLER);

    const profileRes = await app.request("/api/v1/users/profile", { headers: headers(tok) });
    const profileBody = await profileRes.json();
    const managedIds: string[] = profileBody.data.user.managedCommunities.map((c: { id: string }) => c.id);
    expect(managedIds).not.toContain(MEMBER_COMMUNITY.id);

    const dashboardRes = await app.request(`/api/v1/communities/${MEMBER_COMMUNITY.id}/dashboard`, { headers: headers(tok) });
    expect(dashboardRes.status).toBe(403);
  });

  it("a non-member sees no communities at all and is rejected by the same guard", async () => {
    await seedUser("outsider-1");
    invalidateRoleCache("outsider-1");
    const tok = await token("outsider-1");

    const profileRes = await app.request("/api/v1/users/profile", { headers: headers(tok) });
    const profileBody = await profileRes.json();
    expect(profileBody.data.user.managedCommunities).toEqual([]);

    const dashboardRes = await app.request(`/api/v1/communities/${OWNER_COMMUNITY.id}/dashboard`, { headers: headers(tok) });
    expect(dashboardRes.status).toBe(403);
  });
});
