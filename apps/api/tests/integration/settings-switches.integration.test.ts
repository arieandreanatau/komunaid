/**
 * Ticket #16 (spec #12) — the settings-policy module, wired into the public
 * community/organization endpoints.
 *
 * Scope: only the showEventList switch is ticket #16's to enforce, plus the
 * D5-ruled leak where GET /:slug's membersPreview/officers ignore
 * showMemberList entirely. allowMemberPost and requireApproval are #17/#18's
 * enforcement -- this file only pins the settings-policy module's read of
 * them where it is already exercised incidentally (none here; see the unit
 * test for those two switches).
 *
 * Ids/slugs are captured as local consts (not read back off the builders'
 * chained return value) because aCommunity/anOrganization's `.withMember()`
 * returns `this` typed only as `{ withMember(...): ... }` -- the spread
 * `AnyRecord` row fields aren't part of the inferred type, so `community.id`
 * would not typecheck even though it exists at runtime.
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

vi.mock("pino", () => ({ default: vi.fn(() => ({ info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn(), child: vi.fn().mockReturnThis() })) }));
vi.mock("pino-pretty", () => ({ default: vi.fn(() => ({})) }));
vi.mock("resend", () => ({ Resend: vi.fn().mockImplementation(() => ({ emails: { send: vi.fn(async () => ({})) } })) }));
vi.mock("nodemailer", () => ({ default: { createTransport: vi.fn(() => ({ sendMail: vi.fn(async () => ({})) })) } }));

import { db } from "../support/mock";
import { aUser, aCommunity, anOrganization, anEvent } from "../support/builders";
import { invalidateRoleCache } from "../../src/middleware/rbac";
import app from "../../src/app";

async function token(id: string): Promise<string> {
  return new SignJWT({ sub: id, email: `${id}@test.local`, name: id, username: id, roles: ["MEMBER"], type: "access", tokenVersion: 0 })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("15m")
    .sign(JWT_SECRET);
}

// Mirrors aCommunity()'s callers: `anOrganization()` carries `settings` as an
// inert placeholder field (discarded by fake-prisma's relation resolution --
// see tests/support/fake-prisma.ts's `settings: { table: "organizationSettings",
// ... }` relation config), so a real organizationSettings row must be seeded
// separately for it to actually resolve through `include: { settings: true }`,
// exactly like `db.tables.communitySettings.seed(...)` is required alongside
// `aCommunity(...)`.
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

describe("settings-policy enforcement: public community/organization detail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    db.reset();
    invalidateRoleCache("owner-1");
    invalidateRoleCache("member-1");
  });

  describe("Community — showEventList", () => {
    it("hides events from an anonymous caller when showEventList is off", async () => {
      const communityId = "comm-1";
      const owner = aUser(db, { id: "owner-1" });
      aCommunity(db, { id: communityId, slug: communityId, ownerId: owner.id }).withMember({ id: owner.id as string }, { role: "OWNER" });
      anEvent(db, { id: "ev-1", communityId, status: "PUBLISHED", visibility: "PUBLIC", eventDate: new Date("2026-12-01T10:00:00Z") });
      db.tables.communitySettings.seed({ id: "settings-1", communityId, allowMemberPost: true, requireApproval: false, showMemberList: true, showEventList: false });

      const res = await app.request(`/api/v1/communities/${communityId}`);
      expect(res.status).toBe(200);
      const body = (await res.json()) as any;
      expect(body.data.upcomingEvents).toEqual([]);
      expect(body.data.currentEvents).toEqual([]);
      expect(body.data.pastEvents).toEqual([]);
      expect(body.data.futureEvents).toEqual([]);
    });

    it("still shows events to an active member when showEventList is off (hiding is outward, not inward)", async () => {
      const communityId = "comm-2";
      const owner = aUser(db, { id: "owner-1" });
      const member = aUser(db, { id: "member-1" });
      const community = aCommunity(db, { id: communityId, slug: communityId, ownerId: owner.id });
      community.withMember({ id: owner.id as string }, { role: "OWNER" });
      community.withMember({ id: member.id as string }, { role: "MEMBER" });
      anEvent(db, { id: "ev-2", communityId, status: "PUBLISHED", visibility: "PUBLIC", eventDate: new Date("2026-12-01T10:00:00Z") });
      db.tables.communitySettings.seed({ id: "settings-2", communityId, allowMemberPost: true, requireApproval: false, showMemberList: true, showEventList: false });

      const tok = await token(member.id);
      const res = await app.request(`/api/v1/communities/${communityId}`, { headers: { Authorization: `Bearer ${tok}` } });
      expect(res.status).toBe(200);
      const body = (await res.json()) as any;
      expect(body.data.upcomingEvents).toHaveLength(1);
      expect(body.data.upcomingEvents[0].id).toBe("ev-2");
    });

    it("shows events to an anonymous caller when a settings row was never saved (default preserved)", async () => {
      const communityId = "comm-3";
      const owner = aUser(db, { id: "owner-1" });
      aCommunity(db, { id: communityId, slug: communityId, ownerId: owner.id, settings: null }).withMember({ id: owner.id as string }, { role: "OWNER" });
      anEvent(db, { id: "ev-3", communityId, status: "PUBLISHED", visibility: "PUBLIC", eventDate: new Date("2026-12-01T10:00:00Z") });
      // Deliberately no communitySettings row seeded — settings is null.

      const res = await app.request(`/api/v1/communities/${communityId}`);
      expect(res.status).toBe(200);
      const body = (await res.json()) as any;
      expect(body.data.upcomingEvents).toHaveLength(1);
    });
  });

  describe("Community — showMemberList leak on GET /:slug (D5)", () => {
    it("hides membersPreview and officers from an anonymous caller when showMemberList is off", async () => {
      const communityId = "comm-4";
      const owner = aUser(db, { id: "owner-1" });
      aCommunity(db, { id: communityId, slug: communityId, ownerId: owner.id }).withMember({ id: owner.id as string }, { role: "OWNER" });
      db.tables.communitySettings.seed({ id: "settings-4", communityId, allowMemberPost: true, requireApproval: false, showMemberList: false, showEventList: true });

      const res = await app.request(`/api/v1/communities/${communityId}`);
      expect(res.status).toBe(200);
      const body = (await res.json()) as any;
      expect(body.data.membersPreview).toEqual([]);
      expect(body.data.officers).toEqual([]);
    });

    it("still shows membersPreview and officers to an active member when showMemberList is off", async () => {
      const communityId = "comm-5";
      const owner = aUser(db, { id: "owner-1" });
      const member = aUser(db, { id: "member-1" });
      const community = aCommunity(db, { id: communityId, slug: communityId, ownerId: owner.id });
      community.withMember({ id: owner.id as string }, { role: "OWNER" });
      community.withMember({ id: member.id as string }, { role: "MEMBER" });
      db.tables.communitySettings.seed({ id: "settings-5", communityId, allowMemberPost: true, requireApproval: false, showMemberList: false, showEventList: true });

      const tok = await token(member.id);
      const res = await app.request(`/api/v1/communities/${communityId}`, { headers: { Authorization: `Bearer ${tok}` } });
      expect(res.status).toBe(200);
      const body = (await res.json()) as any;
      expect(body.data.membersPreview.length).toBeGreaterThan(0);
    });
  });

  describe("Organization — showEventList / showMemberList", () => {
    it("hides events and members from an anonymous caller when the switches are off", async () => {
      const orgId = "org-1";
      const owner = aUser(db, { id: "owner-1" });
      anOrganization(db, { id: orgId, slug: orgId, ownerId: owner.id }).withMember({ id: owner.id as string }, { role: "OWNER" });
      seedOrganizationSettings(orgId, { showMemberList: false, showEventList: false });
      anEvent(db, { id: "org-ev-1", organizationId: orgId, status: "PUBLISHED", visibility: "PUBLIC", eventDate: new Date("2026-12-01T10:00:00Z") });

      const res = await app.request(`/api/v1/organizations/${orgId}`);
      expect(res.status).toBe(200);
      const body = (await res.json()) as any;
      expect(body.data.upcomingEvents).toEqual([]);
      expect(body.data.membersPreview).toEqual([]);
    });

    it("still shows events and members to an active member when the switches are off", async () => {
      const orgId = "org-2";
      const owner = aUser(db, { id: "owner-1" });
      const member = aUser(db, { id: "member-1" });
      const org = anOrganization(db, { id: orgId, slug: orgId, ownerId: owner.id });
      org.withMember({ id: owner.id as string }, { role: "OWNER" });
      org.withMember({ id: member.id as string }, { role: "MEMBER" });
      seedOrganizationSettings(orgId, { showMemberList: false, showEventList: false });
      anEvent(db, { id: "org-ev-2", organizationId: orgId, status: "PUBLISHED", visibility: "PUBLIC", eventDate: new Date("2026-12-01T10:00:00Z") });

      const tok = await token(member.id);
      const res = await app.request(`/api/v1/organizations/${orgId}`, { headers: { Authorization: `Bearer ${tok}` } });
      expect(res.status).toBe(200);
      const body = (await res.json()) as any;
      expect(body.data.upcomingEvents).toHaveLength(1);
      expect(body.data.membersPreview.length).toBeGreaterThan(0);
    });

    it("shows events to an anonymous caller when settings were never saved (default preserved)", async () => {
      const orgId = "org-3";
      const owner = aUser(db, { id: "owner-1" });
      anOrganization(db, { id: orgId, slug: orgId, ownerId: owner.id, settings: null }).withMember({ id: owner.id as string }, { role: "OWNER" });
      anEvent(db, { id: "org-ev-3", organizationId: orgId, status: "PUBLISHED", visibility: "PUBLIC", eventDate: new Date("2026-12-01T10:00:00Z") });

      const res = await app.request(`/api/v1/organizations/${orgId}`);
      expect(res.status).toBe(200);
      const body = (await res.json()) as any;
      expect(body.data.upcomingEvents).toHaveLength(1);
    });
  });

  describe("Ticket #16 gap — standalone public event-listing routes (GET /events, /events/popular/upcoming, /events/featured)", () => {
    it("GET /events omits an event whose community has showEventList off, for an anonymous caller", async () => {
      const communityId = "list-comm-1";
      const owner = aUser(db, { id: "owner-1" });
      aCommunity(db, { id: communityId, slug: communityId, ownerId: owner.id }).withMember({ id: owner.id as string }, { role: "OWNER" });
      db.tables.communitySettings.seed({ id: "settings-list-1", communityId, allowMemberPost: true, requireApproval: false, showMemberList: true, showEventList: false });
      anEvent(db, { id: "list-ev-1", communityId, status: "PUBLISHED", visibility: "PUBLIC", eventDate: new Date("2026-12-01T10:00:00Z") });

      const res = await app.request(`/api/v1/events`);
      expect(res.status).toBe(200);
      const body = (await res.json()) as any;
      expect(body.data.find((e: any) => e.id === "list-ev-1")).toBeUndefined();
    });

    it("GET /events keeps the pagination total honest when a hidden community's event is excluded", async () => {
      const communityId = "list-comm-2";
      const visibleCommunityId = "list-comm-2b";
      const owner = aUser(db, { id: "owner-1" });
      aCommunity(db, { id: communityId, slug: communityId, ownerId: owner.id }).withMember({ id: owner.id as string }, { role: "OWNER" });
      aCommunity(db, { id: visibleCommunityId, slug: visibleCommunityId, ownerId: owner.id }).withMember({ id: owner.id as string }, { role: "OWNER" });
      db.tables.communitySettings.seed({ id: "settings-list-2", communityId, allowMemberPost: true, requireApproval: false, showMemberList: true, showEventList: false });
      anEvent(db, { id: "list-ev-2-hidden", communityId, status: "PUBLISHED", visibility: "PUBLIC", eventDate: new Date("2026-12-01T10:00:00Z") });
      anEvent(db, { id: "list-ev-2-visible", communityId: visibleCommunityId, status: "PUBLISHED", visibility: "PUBLIC", eventDate: new Date("2026-12-02T10:00:00Z") });

      const res = await app.request(`/api/v1/events`);
      expect(res.status).toBe(200);
      const body = (await res.json()) as any;
      const ids = body.data.map((e: any) => e.id);
      expect(ids).toContain("list-ev-2-visible");
      expect(ids).not.toContain("list-ev-2-hidden");
      // The pagination total must match what actually came back, not a
      // pre-filter count that still includes the hidden event.
      expect(body.pagination.total).toBe(body.data.length);
    });

    it("GET /events still includes the event for an active member of the hidden community (hiding is outward, not inward)", async () => {
      const communityId = "list-comm-3";
      const owner = aUser(db, { id: "owner-1" });
      const member = aUser(db, { id: "member-1" });
      const community = aCommunity(db, { id: communityId, slug: communityId, ownerId: owner.id });
      community.withMember({ id: owner.id as string }, { role: "OWNER" });
      community.withMember({ id: member.id as string }, { role: "MEMBER" });
      db.tables.communitySettings.seed({ id: "settings-list-3", communityId, allowMemberPost: true, requireApproval: false, showMemberList: true, showEventList: false });
      anEvent(db, { id: "list-ev-3", communityId, status: "PUBLISHED", visibility: "PUBLIC", eventDate: new Date("2026-12-01T10:00:00Z") });

      const tok = await token(member.id);
      const res = await app.request(`/api/v1/events`, { headers: { Authorization: `Bearer ${tok}` } });
      expect(res.status).toBe(200);
      const body = (await res.json()) as any;
      expect(body.data.map((e: any) => e.id)).toContain("list-ev-3");
    });

    it("GET /events keeps showing the event when the community never saved settings (default preserved)", async () => {
      const communityId = "list-comm-4";
      const owner = aUser(db, { id: "owner-1" });
      aCommunity(db, { id: communityId, slug: communityId, ownerId: owner.id, settings: null }).withMember({ id: owner.id as string }, { role: "OWNER" });
      anEvent(db, { id: "list-ev-4", communityId, status: "PUBLISHED", visibility: "PUBLIC", eventDate: new Date("2026-12-01T10:00:00Z") });

      const res = await app.request(`/api/v1/events`);
      expect(res.status).toBe(200);
      const body = (await res.json()) as any;
      expect(body.data.map((e: any) => e.id)).toContain("list-ev-4");
    });

    it("GET /events omits an event whose organization has showEventList off, for an anonymous caller, and still shows it to an active member", async () => {
      const orgId = "list-org-1";
      const owner = aUser(db, { id: "owner-1" });
      const member = aUser(db, { id: "member-1" });
      const org = anOrganization(db, { id: orgId, slug: orgId, ownerId: owner.id });
      org.withMember({ id: owner.id as string }, { role: "OWNER" });
      org.withMember({ id: member.id as string }, { role: "MEMBER" });
      seedOrganizationSettings(orgId, { showEventList: false });
      anEvent(db, { id: "list-org-ev-1", organizationId: orgId, status: "PUBLISHED", visibility: "PUBLIC", eventDate: new Date("2026-12-01T10:00:00Z") });

      const anonRes = await app.request(`/api/v1/events`);
      const anonBody = (await anonRes.json()) as any;
      expect(anonBody.data.map((e: any) => e.id)).not.toContain("list-org-ev-1");

      const tok = await token(member.id);
      const memberRes = await app.request(`/api/v1/events`, { headers: { Authorization: `Bearer ${tok}` } });
      const memberBody = (await memberRes.json()) as any;
      expect(memberBody.data.map((e: any) => e.id)).toContain("list-org-ev-1");
    });

    it("GET /events/popular/upcoming omits an event whose community has showEventList off, for an anonymous caller", async () => {
      const communityId = "list-popular-comm-1";
      const owner = aUser(db, { id: "owner-1" });
      aCommunity(db, { id: communityId, slug: communityId, ownerId: owner.id }).withMember({ id: owner.id as string }, { role: "OWNER" });
      db.tables.communitySettings.seed({ id: "settings-popular-1", communityId, allowMemberPost: true, requireApproval: false, showMemberList: true, showEventList: false });
      anEvent(db, { id: "popular-ev-1", communityId, status: "PUBLISHED", visibility: "PUBLIC", eventDate: new Date("2026-12-01T10:00:00Z") });

      const res = await app.request(`/api/v1/events/popular/upcoming`);
      expect(res.status).toBe(200);
      const body = (await res.json()) as any;
      expect(body.data.find((e: any) => e.id === "popular-ev-1")).toBeUndefined();
    });

    it("GET /events/featured omits an event whose community has showEventList off, for an anonymous caller", async () => {
      const communityId = "list-featured-comm-1";
      const owner = aUser(db, { id: "owner-1" });
      aCommunity(db, { id: communityId, slug: communityId, ownerId: owner.id }).withMember({ id: owner.id as string }, { role: "OWNER" });
      db.tables.communitySettings.seed({ id: "settings-featured-1", communityId, allowMemberPost: true, requireApproval: false, showMemberList: true, showEventList: false });
      anEvent(db, { id: "featured-ev-1", communityId, status: "PUBLISHED", visibility: "PUBLIC", eventDate: new Date("2026-12-01T10:00:00Z") });

      const res = await app.request(`/api/v1/events/featured`);
      expect(res.status).toBe(200);
      const body = (await res.json()) as any;
      expect(body.data.find((e: any) => e.id === "featured-ev-1")).toBeUndefined();
    });

    it("D9 regression: GET /events still shows a community event when an unrelated organization's showEventList is off (notIn must not drop NULL organizationId rows)", async () => {
      const communityId = "d9-comm-1";
      const orgId = "d9-org-1";
      const owner = aUser(db, { id: "owner-1" });
      // Community never saved settings -- its own showEventList default (on) is not what's under test.
      aCommunity(db, { id: communityId, slug: communityId, ownerId: owner.id, settings: null }).withMember({ id: owner.id as string }, { role: "OWNER" });
      // An unrelated organization has its switch off. This is what populates
      // hidden.organizationIds and used to make `{ organizationId: { notIn: [...] } }`
      // drop every community event, whose organizationId is NULL.
      anOrganization(db, { id: orgId, slug: orgId, ownerId: owner.id });
      seedOrganizationSettings(orgId, { showEventList: false });
      anEvent(db, { id: "d9-comm-ev-1", communityId, organizationId: null, status: "PUBLISHED", visibility: "PUBLIC", eventDate: new Date("2026-12-01T10:00:00Z") });

      const res = await app.request(`/api/v1/events`);
      expect(res.status).toBe(200);
      const body = (await res.json()) as any;
      expect(body.data.map((e: any) => e.id)).toContain("d9-comm-ev-1");
      expect(body.pagination.total).toBe(body.data.length);
    });

    it("D9 regression: GET /events still shows an organization event when an unrelated community's showEventList is off (notIn must not drop NULL communityId rows)", async () => {
      const communityId = "d9-comm-2";
      const orgId = "d9-org-2";
      const owner = aUser(db, { id: "owner-1" });
      // An unrelated community has its switch off. This is what populates
      // hidden.communityIds and used to make `{ communityId: { notIn: [...] } }`
      // drop every organization event, whose communityId is NULL.
      aCommunity(db, { id: communityId, slug: communityId, ownerId: owner.id }).withMember({ id: owner.id as string }, { role: "OWNER" });
      db.tables.communitySettings.seed({ id: "d9-settings-1", communityId, allowMemberPost: true, requireApproval: false, showMemberList: true, showEventList: false });
      // Organization never saved settings -- its own showEventList default (on) is not what's under test.
      anOrganization(db, { id: orgId, slug: orgId, ownerId: owner.id, settings: null });
      anEvent(db, { id: "d9-org-ev-1", organizationId: orgId, communityId: null, status: "PUBLISHED", visibility: "PUBLIC", eventDate: new Date("2026-12-01T10:00:00Z") });

      const res = await app.request(`/api/v1/events`);
      expect(res.status).toBe(200);
      const body = (await res.json()) as any;
      expect(body.data.map((e: any) => e.id)).toContain("d9-org-ev-1");
      expect(body.pagination.total).toBe(body.data.length);
    });

    it("GET /events/featured still shows the event to the owner of the hidden community (hiding is outward, not inward)", async () => {
      const communityId = "list-featured-comm-2";
      const owner = aUser(db, { id: "owner-1" });
      aCommunity(db, { id: communityId, slug: communityId, ownerId: owner.id }).withMember({ id: owner.id as string }, { role: "OWNER" });
      db.tables.communitySettings.seed({ id: "settings-featured-2", communityId, allowMemberPost: true, requireApproval: false, showMemberList: true, showEventList: false });
      anEvent(db, { id: "featured-ev-2", communityId, status: "PUBLISHED", visibility: "PUBLIC", eventDate: new Date("2026-12-01T10:00:00Z") });

      const tok = await token(owner.id);
      const res = await app.request(`/api/v1/events/featured`, { headers: { Authorization: `Bearer ${tok}` } });
      expect(res.status).toBe(200);
      const body = (await res.json()) as any;
      expect(body.data.map((e: any) => e.id)).toContain("featured-ev-2");
    });
  });
});
