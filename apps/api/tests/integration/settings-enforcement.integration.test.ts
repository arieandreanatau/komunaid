/**
 * Spec #12 — tickets #17 and #18.
 *
 * #17: `allowMemberPost` must actually gate forum content creation
 * (thread + reply) for plain MEMBERs, while pengurus (any community role
 * above MEMBER) stay unaffected.
 *
 * #18: `requireApproval` must route a community join through the existing
 * review flow (`JoinRequest` + `GET/PUT /:communityId/join-requests`),
 * without ever loosening what `membershipType` already gates (ruling D4:
 * the switch may only ADD a review gate, never remove one). The
 * organization join route already reads `requireApproval` correctly
 * (ruling D3) — this file pins that behaviour with a regression test
 * rather than changing it.
 *
 * Every switch is exercised with an explicit `true`, an explicit `false`,
 * and a never-saved (`settings === null`) row, because "a community/
 * organization that never saved settings must behave exactly as it does
 * today" is the spec's most emphatic constraint.
 *
 * Note: `aCommunity(...)`/`anOrganization(...)` return an object whose
 * inferred type only carries the `withMember(...)` method, not the spread
 * row fields (a pre-existing quirk of those builders' `{ ...row, withMember
 * () {...} }` return shape) -- so, matching the pattern already used in
 * `community-dashboard.integration.test.ts` / `settings-switches.integration
 * .test.ts`, every id here is a literal declared up front and passed into
 * the builder, never read back off the builder's return value.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { SignJWT } from "jose";

const JWT_SECRET = new TextEncoder().encode("test-integration-secret");
process.env.JWT_SECRET = "test-integration-secret";
process.env.CSRF_SECRET = "test-csrf-secret";

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
  Resend: vi.fn().mockImplementation(() => ({ emails: { send: vi.fn(async () => ({})) } })),
}));
vi.mock("nodemailer", () => ({
  default: { createTransport: vi.fn(() => ({ sendMail: vi.fn(async () => ({})) })) },
}));

import { db } from "../support/mock";
import { aUser, aCommunity, anOrganization } from "../support/builders";
import app from "../../src/app";

const CSRF_TOKEN = "c".repeat(64);

async function token(id: string, roles: string[] = ["MEMBER"]): Promise<string> {
  const u = db.tables.user.all().find((x) => x.id === id) || {};
  return new SignJWT({
    sub: id,
    email: u.email || `${id}@test.local`,
    name: id,
    username: id,
    roles,
    type: "access",
    tokenVersion: 0,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("15m")
    .sign(JWT_SECRET);
}

function headers(accessToken: string, mutation = false): Record<string, string> {
  if (mutation) {
    return {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "Content-Length": "8",
      Cookie: `csrf_token=${CSRF_TOKEN}`,
      "X-CSRF-Token": CSRF_TOKEN,
    };
  }
  return { Authorization: `Bearer ${accessToken}` };
}

function seedCommunitySettings(communityId: string, overrides: Record<string, any> = {}) {
  db.tables.communitySettings.seed({
    id: `settings-${communityId}`,
    communityId,
    allowMemberPost: true,
    requireApproval: false,
    showMemberList: true,
    showEventList: true,
    ...overrides,
  });
}

function seedOrganizationSettings(organizationId: string, overrides: Record<string, any> = {}) {
  db.tables.organizationSettings.seed({
    id: `org-settings-${organizationId}`,
    organizationId,
    allowMemberPost: true,
    requireApproval: false,
    showMemberList: true,
    showEventList: true,
    ...overrides,
  });
}

function seedForumThread(communityId: string, threadId: string, createdById: string) {
  db.tables.communityMedia.seed({
    id: threadId,
    communityId,
    type: "FORUM_POST",
    title: "Thread Uji",
    content: "Konten thread uji yang cukup panjang",
    isPublished: true,
    createdById,
  });
}

describe("Settings enforcement — #17 allowMemberPost, #18 requireApproval", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    db.reset();
  });

  describe("#17 — allowMemberPost gates forum content creation (community forum)", () => {
    it("blocks a plain MEMBER from creating a forum thread when the switch is off", async () => {
      const owner = aUser(db, { id: "owner-1" });
      const member = aUser(db, { id: "member-1" });
      const communityId = "comm-1";
      const community = aCommunity(db, { id: communityId, ownerId: owner.id });
      community.withMember({ id: owner.id }, { role: "OWNER" });
      community.withMember({ id: member.id }, { role: "MEMBER" });
      seedCommunitySettings(communityId, { allowMemberPost: false });

      const tok = await token(member.id);
      const res = await app.request(`/api/v1/communities/${communityId}/media`, {
        method: "POST",
        headers: headers(tok, true),
        body: JSON.stringify({
          title: "Judul Thread",
          content: "Konten thread minimal sepuluh karakter",
          type: "FORUM_POST",
          isPublished: false,
        }),
      });

      expect(res.status).toBe(403);
    });

    it("still lets pengurus (ADMIN) create a forum thread when the switch is off", async () => {
      const owner = aUser(db, { id: "owner-1" });
      const admin = aUser(db, { id: "admin-1" });
      const communityId = "comm-2";
      const community = aCommunity(db, { id: communityId, ownerId: owner.id });
      community.withMember({ id: owner.id }, { role: "OWNER" });
      community.withMember({ id: admin.id }, { role: "ADMIN" });
      seedCommunitySettings(communityId, { allowMemberPost: false });

      const tok = await token(admin.id);
      const res = await app.request(`/api/v1/communities/${communityId}/media`, {
        method: "POST",
        headers: headers(tok, true),
        body: JSON.stringify({
          title: "Judul Thread",
          content: "Konten thread minimal sepuluh karakter",
          type: "FORUM_POST",
          isPublished: false,
        }),
      });

      expect(res.status).toBe(201);
    });

    it("still lets an EVENT_MANAGER (pengurus, not just OWNER/ADMIN) create a forum thread when the switch is off", async () => {
      const owner = aUser(db, { id: "owner-1" });
      const manager = aUser(db, { id: "manager-1" });
      const communityId = "comm-2b";
      const community = aCommunity(db, { id: communityId, ownerId: owner.id });
      community.withMember({ id: owner.id }, { role: "OWNER" });
      community.withMember({ id: manager.id }, { role: "EVENT_MANAGER" });
      seedCommunitySettings(communityId, { allowMemberPost: false });

      const tok = await token(manager.id);
      const res = await app.request(`/api/v1/communities/${communityId}/media`, {
        method: "POST",
        headers: headers(tok, true),
        body: JSON.stringify({
          title: "Judul Thread",
          content: "Konten thread minimal sepuluh karakter",
          type: "FORUM_POST",
          isPublished: false,
        }),
      });

      expect(res.status).toBe(201);
    });

    it("lets a plain MEMBER create a forum thread when settings were never saved (default preserved)", async () => {
      const owner = aUser(db, { id: "owner-1" });
      const member = aUser(db, { id: "member-1" });
      const communityId = "comm-3";
      const community = aCommunity(db, { id: communityId, ownerId: owner.id });
      community.withMember({ id: owner.id }, { role: "OWNER" });
      community.withMember({ id: member.id }, { role: "MEMBER" });
      // deliberately no seedCommunitySettings call: settings stays null

      const tok = await token(member.id);
      const res = await app.request(`/api/v1/communities/${communityId}/media`, {
        method: "POST",
        headers: headers(tok, true),
        body: JSON.stringify({
          title: "Judul Thread",
          content: "Konten thread minimal sepuluh karakter",
          type: "FORUM_POST",
          isPublished: false,
        }),
      });

      expect(res.status).toBe(201);
    });

    it("blocks a plain MEMBER from replying to a forum thread when the switch is off", async () => {
      const owner = aUser(db, { id: "owner-1" });
      const member = aUser(db, { id: "member-1" });
      const communityId = "comm-4";
      const community = aCommunity(db, { id: communityId, ownerId: owner.id });
      community.withMember({ id: owner.id }, { role: "OWNER" });
      community.withMember({ id: member.id }, { role: "MEMBER" });
      seedCommunitySettings(communityId, { allowMemberPost: false });
      seedForumThread(communityId, "thread-1", owner.id);

      const tok = await token(member.id);
      const res = await app.request(`/api/v1/communities/${communityId}/media/thread-1/replies`, {
        method: "POST",
        headers: headers(tok, true),
        body: JSON.stringify({ content: "Balasan saya" }),
      });

      expect(res.status).toBe(403);
    });

    it("still lets pengurus reply when the switch is off", async () => {
      const owner = aUser(db, { id: "owner-1" });
      const admin = aUser(db, { id: "admin-1" });
      const communityId = "comm-5";
      const community = aCommunity(db, { id: communityId, ownerId: owner.id });
      community.withMember({ id: owner.id }, { role: "OWNER" });
      community.withMember({ id: admin.id }, { role: "ADMIN" });
      seedCommunitySettings(communityId, { allowMemberPost: false });
      seedForumThread(communityId, "thread-2", owner.id);

      const tok = await token(admin.id);
      const res = await app.request(`/api/v1/communities/${communityId}/media/thread-2/replies`, {
        method: "POST",
        headers: headers(tok, true),
        body: JSON.stringify({ content: "Balasan saya" }),
      });

      expect(res.status).toBe(201);
    });

    it("lets a plain MEMBER reply when settings were never saved (default preserved)", async () => {
      const owner = aUser(db, { id: "owner-1" });
      const member = aUser(db, { id: "member-1" });
      const communityId = "comm-6";
      const community = aCommunity(db, { id: communityId, ownerId: owner.id });
      community.withMember({ id: owner.id }, { role: "OWNER" });
      community.withMember({ id: member.id }, { role: "MEMBER" });
      seedForumThread(communityId, "thread-3", owner.id);

      const tok = await token(member.id);
      const res = await app.request(`/api/v1/communities/${communityId}/media/thread-3/replies`, {
        method: "POST",
        headers: headers(tok, true),
        body: JSON.stringify({ content: "Balasan saya" }),
      });

      expect(res.status).toBe(201);
    });
  });

  describe("#17 — organizations have no member-content route to gate (D2, vacuous)", () => {
    it("organizations expose no /media or /replies route at all", async () => {
      const owner = aUser(db, { id: "owner-1" });
      const organizationId = "org-vacuous";
      const organization = anOrganization(db, { id: organizationId, ownerId: owner.id });
      organization.withMember({ id: owner.id }, { role: "OWNER" });
      const tok = await token(owner.id);

      const res = await app.request(`/api/v1/organizations/${organizationId}/media`, {
        method: "POST",
        headers: headers(tok, true),
        body: JSON.stringify({ title: "x", content: "y".repeat(20), type: "FORUM_POST" }),
      });

      // No such route is mounted under organizationRoutes; Hono 404s rather than 403ing,
      // which is the concrete evidence that there is nothing here for #17 to gate.
      expect(res.status).toBe(404);
    });
  });

  describe("#18 — requireApproval gates community join requests", () => {
    it("turning the switch on routes an OPEN community's join through the review flow", async () => {
      const owner = aUser(db, { id: "owner-1" });
      const applicant = aUser(db, { id: "member-2" });
      const communityId = "comm-10";
      const community = aCommunity(db, { id: communityId, ownerId: owner.id, membershipType: "OPEN" });
      community.withMember({ id: owner.id }, { role: "OWNER" });
      seedCommunitySettings(communityId, { requireApproval: true });

      const tok = await token(applicant.id);
      const res = await app.request(`/api/v1/communities/${communityId}/join`, {
        method: "POST",
        headers: headers(tok, true),
        body: JSON.stringify({}),
      });

      expect(res.status).toBe(201);
      const body = (await res.json()) as any;
      expect(body.data.requestId).toBeDefined();

      const member = db.tables.communityMember
        .all()
        .find((m) => m.communityId === communityId && m.userId === applicant.id);
      expect(member).toBeUndefined();

      // and the pending request surfaces to a role that can handle it (OWNER/ADMIN)
      // via the EXISTING review flow, not a new one.
      const ownerTok = await token(owner.id);
      const listRes = await app.request(`/api/v1/communities/${communityId}/join-requests`, {
        headers: headers(ownerTok),
      });
      expect(listRes.status).toBe(200);
      const listBody = (await listRes.json()) as any;
      expect(listBody.data.some((r: any) => r.userId === applicant.id && r.status === "PENDING")).toBe(true);
    });

    it("turning the switch off keeps an OPEN community's join immediate (regression)", async () => {
      const owner = aUser(db, { id: "owner-1" });
      const applicant = aUser(db, { id: "member-2" });
      const communityId = "comm-11";
      const community = aCommunity(db, { id: communityId, ownerId: owner.id, membershipType: "OPEN" });
      community.withMember({ id: owner.id }, { role: "OWNER" });
      seedCommunitySettings(communityId, { requireApproval: false });

      const tok = await token(applicant.id);
      const res = await app.request(`/api/v1/communities/${communityId}/join`, {
        method: "POST",
        headers: headers(tok, true),
        body: JSON.stringify({}),
      });

      expect(res.status).toBe(200);
      const member = db.tables.communityMember
        .all()
        .find((m) => m.communityId === communityId && m.userId === applicant.id);
      expect(member?.status).toBe("ACTIVE");
    });

    it("a never-saved settings row keeps an OPEN community's join immediate (default preserved)", async () => {
      const owner = aUser(db, { id: "owner-1" });
      const applicant = aUser(db, { id: "member-2" });
      const communityId = "comm-12";
      const community = aCommunity(db, { id: communityId, ownerId: owner.id, membershipType: "OPEN" });
      community.withMember({ id: owner.id }, { role: "OWNER" });
      // no settings seeded at all

      const tok = await token(applicant.id);
      const res = await app.request(`/api/v1/communities/${communityId}/join`, {
        method: "POST",
        headers: headers(tok, true),
        body: JSON.stringify({}),
      });

      expect(res.status).toBe(200);
      const member = db.tables.communityMember
        .all()
        .find((m) => m.communityId === communityId && m.userId === applicant.id);
      expect(member?.status).toBe("ACTIVE");
    });

    it("a never-saved settings row keeps a RESTRICTED community's join going to review (default preserved)", async () => {
      const owner = aUser(db, { id: "owner-1" });
      const applicant = aUser(db, { id: "member-2" });
      const communityId = "comm-13";
      const community = aCommunity(db, {
        id: communityId,
        ownerId: owner.id,
        membershipType: "RESTRICTED",
      });
      community.withMember({ id: owner.id }, { role: "OWNER" });
      // no settings seeded at all

      const tok = await token(applicant.id);
      const res = await app.request(`/api/v1/communities/${communityId}/join`, {
        method: "POST",
        headers: headers(tok, true),
        body: JSON.stringify({}),
      });

      expect(res.status).toBe(201);
      const body = (await res.json()) as any;
      expect(body.data.requestId).toBeDefined();
    });

    it("switching requireApproval off does NOT reopen a RESTRICTED community (the switch only ADDS a gate, never removes one)", async () => {
      const owner = aUser(db, { id: "owner-1" });
      const applicant = aUser(db, { id: "member-2" });
      const communityId = "comm-14";
      const community = aCommunity(db, {
        id: communityId,
        ownerId: owner.id,
        membershipType: "RESTRICTED",
      });
      community.withMember({ id: owner.id }, { role: "OWNER" });
      seedCommunitySettings(communityId, { requireApproval: false });

      const tok = await token(applicant.id);
      const res = await app.request(`/api/v1/communities/${communityId}/join`, {
        method: "POST",
        headers: headers(tok, true),
        body: JSON.stringify({}),
      });

      expect(res.status).toBe(201);
      const body = (await res.json()) as any;
      expect(body.data.requestId).toBeDefined();
      const member = db.tables.communityMember
        .all()
        .find((m) => m.communityId === communityId && m.userId === applicant.id);
      expect(member).toBeUndefined();
    });

    it("re-join of a previously-LEFT member on an OPEN community goes to review when the switch is on", async () => {
      const owner = aUser(db, { id: "owner-1" });
      const rejoiner = aUser(db, { id: "member-2" });
      const communityId = "comm-15";
      const community = aCommunity(db, { id: communityId, ownerId: owner.id, membershipType: "OPEN" });
      community.withMember({ id: owner.id }, { role: "OWNER" });
      community.withMember({ id: rejoiner.id }, { role: "MEMBER", status: "LEFT" });
      seedCommunitySettings(communityId, { requireApproval: true });

      const tok = await token(rejoiner.id);
      const res = await app.request(`/api/v1/communities/${communityId}/join`, {
        method: "POST",
        headers: headers(tok, true),
        body: JSON.stringify({}),
      });

      expect(res.status).toBe(200);
      const body = (await res.json()) as any;
      expect(body.data.membership.status).toBe("PENDING");
    });

    it("re-join of a previously-LEFT member on an OPEN community stays immediate when the switch is off (regression)", async () => {
      const owner = aUser(db, { id: "owner-1" });
      const rejoiner = aUser(db, { id: "member-2" });
      const communityId = "comm-16";
      const community = aCommunity(db, { id: communityId, ownerId: owner.id, membershipType: "OPEN" });
      community.withMember({ id: owner.id }, { role: "OWNER" });
      community.withMember({ id: rejoiner.id }, { role: "MEMBER", status: "LEFT" });
      seedCommunitySettings(communityId, { requireApproval: false });

      const tok = await token(rejoiner.id);
      const res = await app.request(`/api/v1/communities/${communityId}/join`, {
        method: "POST",
        headers: headers(tok, true),
        body: JSON.stringify({}),
      });

      expect(res.status).toBe(200);
      const body = (await res.json()) as any;
      expect(body.data.membership.status).toBe("ACTIVE");
    });
  });

  describe("#18 — organization join already reads requireApproval correctly (D3 regression pin)", () => {
    it("requireApproval on routes the join through the review flow", async () => {
      const owner = aUser(db, { id: "owner-1" });
      const applicant = aUser(db, { id: "member-2" });
      const organizationId = "org-1";
      const organization = anOrganization(db, { id: organizationId, ownerId: owner.id });
      organization.withMember({ id: owner.id }, { role: "OWNER" });
      seedOrganizationSettings(organizationId, { requireApproval: true });

      const tok = await token(applicant.id);
      const res = await app.request(`/api/v1/organizations/${organizationId}/join`, {
        method: "POST",
        headers: headers(tok, true),
      });

      expect(res.status).toBe(201);
      const body = (await res.json()) as any;
      expect(body.data.requestId).toBeDefined();
      const member = db.tables.organizationMember
        .all()
        .find((m) => m.organizationId === organizationId && m.userId === applicant.id);
      expect(member).toBeUndefined();
    });

    it("requireApproval off joins immediately", async () => {
      const owner = aUser(db, { id: "owner-1" });
      const applicant = aUser(db, { id: "member-2" });
      const organizationId = "org-2";
      const organization = anOrganization(db, { id: organizationId, ownerId: owner.id });
      organization.withMember({ id: owner.id }, { role: "OWNER" });
      seedOrganizationSettings(organizationId, { requireApproval: false });

      const tok = await token(applicant.id);
      const res = await app.request(`/api/v1/organizations/${organizationId}/join`, {
        method: "POST",
        headers: headers(tok, true),
      });

      expect(res.status).toBe(200);
      const member = db.tables.organizationMember
        .all()
        .find((m) => m.organizationId === organizationId && m.userId === applicant.id);
      expect(member?.status).toBe("ACTIVE");
    });

    it("a never-saved settings row joins immediately (default preserved)", async () => {
      const owner = aUser(db, { id: "owner-1" });
      const applicant = aUser(db, { id: "member-2" });
      const organizationId = "org-3";
      const organization = anOrganization(db, { id: organizationId, ownerId: owner.id });
      organization.withMember({ id: owner.id }, { role: "OWNER" });
      // no settings seeded at all

      const tok = await token(applicant.id);
      const res = await app.request(`/api/v1/organizations/${organizationId}/join`, {
        method: "POST",
        headers: headers(tok, true),
      });

      expect(res.status).toBe(200);
      const member = db.tables.organizationMember
        .all()
        .find((m) => m.organizationId === organizationId && m.userId === applicant.id);
      expect(member?.status).toBe("ACTIVE");
    });
  });
});
