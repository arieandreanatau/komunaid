import { describe, it, expect } from "vitest";
import {
  activeScope,
  publicScope,
  PUBLIC_EVENT_STATUSES,
  PUBLIC_VOLUNTEER_PROGRAM_STATUSES,
  type SoftDeleteEntity,
} from "../../../src/lib/visibility-scope";

const SOFT_DELETE_ENTITIES: SoftDeleteEntity[] = [
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
];

describe("activeScope", () => {
  it.each(SOFT_DELETE_ENTITIES)("returns exactly { deletedAt: null } for %s", (entity) => {
    expect(activeScope(entity)).toEqual({ deletedAt: null });
  });

  it("never over-filters: the fragment contains no status or visibility clause", () => {
    for (const entity of SOFT_DELETE_ENTITIES) {
      const scope = activeScope(entity) as Record<string, unknown>;
      expect(Object.keys(scope)).toEqual(["deletedAt"]);
    }
  });

  it("throws for an entity with no deletedAt column instead of returning an unscoped fragment", () => {
    expect(() => activeScope("joinRequest" as SoftDeleteEntity)).toThrow(/no deletedAt column/);
  });
});

describe("publicScope", () => {
  it("community: contains all three documented clauses", () => {
    expect(publicScope("community")).toEqual({
      deletedAt: null,
      status: "APPROVED",
      visibility: "PUBLIC",
    });
  });

  it("organization: contains all three documented clauses", () => {
    expect(publicScope("organization")).toEqual({
      deletedAt: null,
      status: "APPROVED",
      visibility: "PUBLIC",
    });
  });

  it("event: contains deletedAt, visibility PUBLIC, and the canonical public status allowlist", () => {
    const scope = publicScope("event");
    expect(scope.deletedAt).toBeNull();
    expect(scope.visibility).toBe("PUBLIC");
    expect(scope.status).toEqual({ in: PUBLIC_EVENT_STATUSES });
    // None of the excluded lifecycle states may leak through.
    for (const hidden of ["DRAFT", "REJECTED", "CANCELLED", "ARCHIVED"]) {
      expect((scope.status as { in: readonly string[] }).in).not.toContain(hidden);
    }
  });

  it("event: accepts a narrower status subset", () => {
    const scope = publicScope("event", { statuses: ["PUBLISHED", "REGISTRATION_OPEN"] });
    expect(scope.status).toEqual({ in: ["PUBLISHED", "REGISTRATION_OPEN"] });
    expect(scope.deletedAt).toBeNull();
    expect(scope.visibility).toBe("PUBLIC");
  });

  it("event: rejects a status override that widens beyond the canonical public set", () => {
    expect(() => publicScope("event", { statuses: ["DRAFT" as never] })).toThrow(/not part of the canonical public set/);
  });

  it("volunteerOpportunity: hides DRAFT/ARCHIVED and requires a public, non-deleted parent event", () => {
    const scope = publicScope("volunteerOpportunity");
    expect(scope.deletedAt).toBeNull();
    expect(scope.status).toEqual({ notIn: ["DRAFT", "ARCHIVED"] });
    expect(scope.event).toEqual({
      deletedAt: null,
      visibility: "PUBLIC",
      status: { in: ["PUBLISHED"] },
    });
  });

  it("volunteerProgram: contains deletedAt and the canonical public status allowlist (no visibility column)", () => {
    const scope = publicScope("volunteerProgram");
    expect(scope.deletedAt).toBeNull();
    expect(scope.status).toEqual({ in: PUBLIC_VOLUNTEER_PROGRAM_STATUSES });
    expect("visibility" in scope).toBe(false);
  });

  it("volunteerProgram: accepts a narrower status subset", () => {
    const scope = publicScope("volunteerProgram", { statuses: ["SCHEDULED", "REGISTRATION_OPEN"] });
    expect(scope.status).toEqual({ in: ["SCHEDULED", "REGISTRATION_OPEN"] });
  });

  it("volunteerProgram: rejects a status override that widens beyond the canonical public set", () => {
    expect(() => publicScope("volunteerProgram", { statuses: ["DRAFT" as never] })).toThrow(/not part of the canonical public set/);
  });

  it("throws for an entity with no defined public-read fragment", () => {
    expect(() => (publicScope as (e: string) => unknown)("user")).toThrow(/no public-read fragment defined/);
  });
});
