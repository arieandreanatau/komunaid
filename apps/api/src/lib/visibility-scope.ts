import type { Prisma } from "@prisma/client";

/**
 * The single source of truth for the two "who gets to see this row" filters
 * documented in CLAUDE.md's Data-visibility invariants:
 *
 *   - `activeScope(entity)` — the soft-delete-only fragment, `{ deletedAt: null }`,
 *     for authenticated/privileged reads that are otherwise allowed to see any
 *     lifecycle state (an owner viewing their own PENDING community, an admin
 *     moderation queue, a membership lookup, ...). Every entity carrying a
 *     `deletedAt` column belongs here. There is no global Prisma soft-delete
 *     filter, so skipping this on any query against a soft-deletable model is
 *     a bug — see CLAUDE.md's "Data-visibility invariants".
 *
 *   - `publicScope(entity)` — the full unauthenticated-safe fragment
 *     (deletedAt + status + visibility, entity-specific) for anonymous /
 *     public-discovery reads: "Public reads filter { deletedAt: null, status:
 *     APPROVED, visibility: PUBLIC }. No draft/pending/rejected/suspended
 *     entity and no private event may reach an unauthenticated response."
 *
 * Both return a plain Prisma `WhereInput` fragment meant to be spread into a
 * route's `where`, e.g.:
 *
 *   prisma.community.findMany({ where: { ...publicScope("community"), ...searchFilters } })
 *
 * Deliberately entity-keyed rather than exported as bare constant objects, so
 * a call site names what it is scoping — `publicScope("community")` reads as
 * domain language, a typo in the entity key is a compile error (or, for the
 * runtime-checked cases, a thrown error) instead of a silently-wrong literal
 * hand-copied from a neighboring route, and grepping for `publicScope(` or
 * `activeScope(` finds every place the invariant is enforced.
 */

// ---------------------------------------------------------------------------
// activeScope — soft-delete-only, for authenticated / privileged reads
// ---------------------------------------------------------------------------

const SOFT_DELETE_ENTITIES = [
  "user",
  "community",
  "communityMember",
  "organization",
  "organizationMember",
  "event",
  "volunteerOpportunity",
  "volunteerProgram",
  "report",
  "forumReply",
  "communityMedia",
] as const;

export type SoftDeleteEntity = (typeof SOFT_DELETE_ENTITIES)[number];

interface ActiveScopeMap {
  user: Prisma.UserWhereInput;
  community: Prisma.CommunityWhereInput;
  communityMember: Prisma.CommunityMemberWhereInput;
  organization: Prisma.OrganizationWhereInput;
  organizationMember: Prisma.OrganizationMemberWhereInput;
  event: Prisma.EventWhereInput;
  volunteerOpportunity: Prisma.VolunteerOpportunityWhereInput;
  volunteerProgram: Prisma.VolunteerProgramWhereInput;
  report: Prisma.ReportWhereInput;
  forumReply: Prisma.ForumReplyWhereInput;
  communityMedia: Prisma.CommunityMediaWhereInput;
}

/**
 * `{ deletedAt: null }`, typed to the entity asked for. This is the ONLY
 * clause an authenticated read that's otherwise entitled to see any
 * lifecycle state needs (it must never be skipped). Throws for an entity
 * with no `deletedAt` column — the whole point is to fail loudly on a typo
 * rather than silently return an unscoped `{}`.
 */
export function activeScope<E extends SoftDeleteEntity>(entity: E): ActiveScopeMap[E] {
  if (!(SOFT_DELETE_ENTITIES as readonly string[]).includes(entity)) {
    throw new Error(`activeScope: "${entity}" has no deletedAt column`);
  }
  return { deletedAt: null } as ActiveScopeMap[E];
}

// ---------------------------------------------------------------------------
// publicScope — the full unauthenticated-safe fragment, per entity
// ---------------------------------------------------------------------------

/**
 * Every status an APPROVED-and-beyond Event remains publicly visible in.
 * Individual call sites may narrow this (e.g. an "upcoming" feed drops
 * ONGOING/COMPLETED) but the narrowed list must stay a SUBSET — see
 * `assertPublicSubset` below.
 */
export const PUBLIC_EVENT_STATUSES = [
  "SUBMITTED",
  "IN_REVIEW",
  "PUBLISHED",
  "REGISTRATION_OPEN",
  "REGISTRATION_CLOSED",
  "ONGOING",
  "COMPLETED",
] as const;
export type PublicEventStatus = (typeof PUBLIC_EVENT_STATUSES)[number];

/** Same idea as `PUBLIC_EVENT_STATUSES`, for VolunteerProgram. */
export const PUBLIC_VOLUNTEER_PROGRAM_STATUSES = [
  "SUBMITTED",
  "UNDER_REVIEW",
  "SCHEDULED",
  "REGISTRATION_OPEN",
  "REGISTRATION_CLOSED",
  "ONGOING",
  "COMPLETED",
] as const;
export type PublicVolunteerProgramStatus = (typeof PUBLIC_VOLUNTEER_PROGRAM_STATUSES)[number];

function assertPublicSubset<T extends string>(entity: string, canonical: readonly T[], requested: readonly T[]): void {
  const widened = requested.filter((status) => !(canonical as readonly string[]).includes(status));
  if (widened.length > 0) {
    throw new Error(
      `publicScope("${entity}"): status override ${JSON.stringify(widened)} is not part of the canonical public set ` +
        `${JSON.stringify(canonical)}. Narrowing the public set is allowed; widening it is not.`
    );
  }
}

export interface PublicEventScopeOptions {
  /** Must be a subset of `PUBLIC_EVENT_STATUSES`. Defaults to the full list. */
  statuses?: readonly PublicEventStatus[];
}

export interface PublicVolunteerProgramScopeOptions {
  /** Must be a subset of `PUBLIC_VOLUNTEER_PROGRAM_STATUSES`. Defaults to the full list. */
  statuses?: readonly PublicVolunteerProgramStatus[];
}

export function publicScope(entity: "community"): Prisma.CommunityWhereInput;
export function publicScope(entity: "organization"): Prisma.OrganizationWhereInput;
export function publicScope(entity: "event", options?: PublicEventScopeOptions): Prisma.EventWhereInput;
export function publicScope(entity: "volunteerOpportunity"): Prisma.VolunteerOpportunityWhereInput;
export function publicScope(entity: "volunteerProgram", options?: PublicVolunteerProgramScopeOptions): Prisma.VolunteerProgramWhereInput;
export function publicScope(
  entity: "community" | "organization" | "event" | "volunteerOpportunity" | "volunteerProgram",
  options?: PublicEventScopeOptions | PublicVolunteerProgramScopeOptions
): unknown {
  switch (entity) {
    case "community":
    case "organization":
      // Community and Organization share the exact same lifecycle shape for
      // this purpose: a single APPROVED status, a single PUBLIC visibility.
      return { deletedAt: null, status: "APPROVED", visibility: "PUBLIC" };

    case "event": {
      const statuses = options?.statuses ?? PUBLIC_EVENT_STATUSES;
      assertPublicSubset("event", PUBLIC_EVENT_STATUSES, statuses as readonly PublicEventStatus[]);
      return { deletedAt: null, visibility: "PUBLIC", status: { in: statuses as PublicEventStatus[] } };
    }

    case "volunteerOpportunity":
      // VolunteerOpportunity has no `visibility` column of its own —
      // publicness is inherited from its parent Event, which is why this
      // fragment nests an `event` filter instead of a flat `visibility`
      // clause. `status: { notIn: [...] }` (rather than an allowlist) mirrors
      // the pre-existing public-listing query: only DRAFT and ARCHIVED
      // opportunities are hidden, everything else (PUBLISHED/OPEN/CLOSED) is
      // public as long as the parent event is.
      return {
        deletedAt: null,
        status: { notIn: ["DRAFT", "ARCHIVED"] },
        event: { deletedAt: null, visibility: "PUBLIC", status: { in: ["PUBLISHED"] } },
      };

    case "volunteerProgram": {
      const statuses = options?.statuses ?? PUBLIC_VOLUNTEER_PROGRAM_STATUSES;
      assertPublicSubset("volunteerProgram", PUBLIC_VOLUNTEER_PROGRAM_STATUSES, statuses as readonly PublicVolunteerProgramStatus[]);
      // No `visibility` column on VolunteerProgram either.
      return { deletedAt: null, status: { in: statuses as PublicVolunteerProgramStatus[] } };
    }

    default: {
      const exhaustive: never = entity;
      throw new Error(`publicScope: no public-read fragment defined for entity "${exhaustive}"`);
    }
  }
}
