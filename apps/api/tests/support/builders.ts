/**
 * Domain-shaped seed builders on top of tests/support/fake-prisma.ts.
 *
 * These exist so integration tests don't poke raw table rows directly. Each
 * builder inserts a fully-shaped row (with the null/array defaults the real
 * routes read) into the right table of a `FakeDb`, and returns a small
 * fluent handle for wiring up related rows.
 *
 * Example:
 *   const { db } = createFakePrisma();
 *   const owner = aUser(db, { id: "owner-1" });
 *   const community = aCommunity(db, { status: "APPROVED", ownerId: owner.id })
 *     .withMember(owner, { role: "OWNER" });
 *   const event = anEvent(db, { status: "PUBLISHED", communityId: community.id });
 */
import type { FakeDb } from "./fake-prisma";

let seq = 1;
const nextSeq = () => seq++;

export function resetBuilderSequence(): void {
  seq = 1;
}

// ---------------------------------------------------------------------------
// user
// ---------------------------------------------------------------------------

export function aUser(db: FakeDb, overrides: Record<string, any> = {}) {
  const id = overrides.id || `user-${nextSeq()}`;
  const row = db.tables.user.seed({
    id,
    name: "Test User",
    username: id,
    email: `${id}@test.local`,
    status: "ACTIVE",
    deletedAt: null,
    tokenVersion: 0,
    avatar: null,
    phone: null,
    bio: null,
    location: null,
    password: null,
    roles: [{ role: "MEMBER" }],
    interests: [],
    ...overrides,
  });
  return row;
}

// ---------------------------------------------------------------------------
// community
// ---------------------------------------------------------------------------

export function aCommunity(db: FakeDb, overrides: Record<string, any> = {}) {
  const id = overrides.id || `community-${nextSeq()}`;
  const ownerId = overrides.ownerId || "owner-1";
  const row = db.tables.community.seed({
    id,
    name: "Komunitas Uji",
    slug: id,
    description: "Deskripsi komunitas uji",
    status: "APPROVED",
    visibility: "PUBLIC",
    membershipType: "OPEN",
    ownerId,
    deletedAt: null,
    coverImage: null,
    logo: null,
    banner: null,
    location: null,
    website: null,
    address: null,
    address1: null,
    address2: null,
    postalCode: null,
    district: null,
    village: null,
    country: null,
    province: null,
    city: null,
    contactEmail: null,
    contactPhone: null,
    submittedAt: null,
    reviewedAt: null,
    adminNote: null,
    categories: [],
    tags: [],
    settings: null,
    owner: { id: ownerId, name: "Owner", avatar: null },
    _count: { members: 0, events: 0 },
    ...overrides,
  });

  return {
    ...row,
    withMember(user: { id: string; name?: string }, opts: { id?: string; role: string; status?: string; deletedAt?: Date | null } = { role: "MEMBER" }) {
      const memberId = opts.id || `member-${row.id}-${user.id}`;
      db.tables.communityMember.seed({
        id: memberId,
        communityId: row.id,
        userId: user.id,
        role: opts.role,
        status: opts.status || "ACTIVE",
        deletedAt: opts.deletedAt ?? null,
        joinedAt: new Date(),
        user: { id: user.id, name: user.name || user.id, avatar: null },
      });
      row._count = { ...(row._count || {}), members: (row._count?.members || 0) + 1 };
      return this;
    },
  };
}

// ---------------------------------------------------------------------------
// event
// ---------------------------------------------------------------------------

export function anEvent(db: FakeDb, overrides: Record<string, any> = {}) {
  const id = overrides.id || `event-${nextSeq()}`;
  const createdById = overrides.createdById || "user-1";
  const row = db.tables.event.seed({
    id,
    title: "Event Uji",
    slug: id,
    description: null,
    status: "DRAFT",
    visibility: "PUBLIC",
    deletedAt: null,
    coverImage: null,
    thumbnail: null,
    location: null,
    locationType: "PHYSICAL",
    isOnline: false,
    onlineUrl: null,
    meetingUrl: null,
    eventDate: new Date("2026-12-01T10:00:00Z"),
    endDate: null,
    timezone: "Asia/Jakarta",
    quota: 100,
    allowWaitlist: false,
    contactName: null,
    contactEmail: null,
    contactPhone: null,
    gallery: null,
    communityId: null,
    organizationId: null,
    createdById,
    reviewNote: null,
    reviewedAt: null,
    reviewedById: null,
    submittedAt: null,
    _count: { registrations: 0 },
    community: null,
    organization: null,
    createdBy: { id: createdById, name: "Creator", avatar: null },
    categories: [],
    registrations: [],
    ...overrides,
  });

  return {
    ...row,
    withRegistration(user: { id: string }, opts: { id?: string; status?: string } = {}) {
      const regId = opts.id || `reg-${row.id}-${user.id}`;
      db.tables.eventRegistration.seed({
        id: regId,
        eventId: row.id,
        userId: user.id,
        status: opts.status || "CONFIRMED",
        registeredAt: new Date(),
        attendance: null,
        checkedInAt: null,
        checkedOutAt: null,
        notes: null,
      });
      row._count = { ...(row._count || {}), registrations: (row._count?.registrations || 0) + 1 };
      return this;
    },
  };
}

// ---------------------------------------------------------------------------
// organization
// ---------------------------------------------------------------------------

export function anOrganization(db: FakeDb, overrides: Record<string, any> = {}) {
  const id = overrides.id || `org-${nextSeq()}`;
  const ownerId = overrides.ownerId || "owner-1";
  const row = db.tables.organization.seed({
    id,
    name: "Organisasi Uji",
    slug: id,
    description: null,
    status: "APPROVED",
    visibility: "PUBLIC",
    ownerId,
    deletedAt: null,
    owner: { id: ownerId, name: "Owner", avatar: null },
    settings: null,
    categories: [],
    tags: [],
    _count: { members: 0, events: 0 },
    ...overrides,
  });

  return {
    ...row,
    withMember(user: { id: string; name?: string }, opts: { id?: string; role: string; status?: string; deletedAt?: Date | null } = { role: "MEMBER" }) {
      const memberId = opts.id || `org-member-${row.id}-${user.id}`;
      db.tables.organizationMember.seed({
        id: memberId,
        organizationId: row.id,
        userId: user.id,
        role: opts.role,
        status: opts.status || "ACTIVE",
        deletedAt: opts.deletedAt ?? null,
        user: { id: user.id, name: user.name || user.id, avatar: null },
      });
      return this;
    },
  };
}
