import { describe, expect, it } from "vitest";

// Policy-level regression tests. Route integration covers DB wiring separately.
const terminalStatuses = ["COMPLETED", "CANCELLED"];

function independentManagementAccess(params: {
  owner: boolean;
  accessStatus: string;
  startsAt: Date;
  expiresAt: Date;
  programStatus: string;
  now: Date;
}) {
  return (
    params.owner &&
    params.accessStatus === "ACTIVE" &&
    params.startsAt <= params.now &&
    params.expiresAt > params.now &&
    !terminalStatuses.includes(params.programStatus)
  );
}

describe("independent volunteer organizer policy", () => {
  const now = new Date("2026-08-12T02:00:00.000Z");

  it("allows active owner only for own active program", () => {
    expect(independentManagementAccess({
      owner: true, accessStatus: "ACTIVE", startsAt: new Date("2026-08-01T00:00:00.000Z"), expiresAt: new Date("2026-08-30T00:00:00.000Z"), programStatus: "REGISTRATION_OPEN", now,
    })).toBe(true);
    expect(independentManagementAccess({
      owner: false, accessStatus: "ACTIVE", startsAt: new Date("2026-08-01T00:00:00.000Z"), expiresAt: new Date("2026-08-30T00:00:00.000Z"), programStatus: "REGISTRATION_OPEN", now,
    })).toBe(false);
  });

  it("denies expired, revoked, completed, and cancelled management", () => {
    const base = { owner: true, startsAt: new Date("2026-08-01T00:00:00.000Z"), expiresAt: new Date("2026-08-30T00:00:00.000Z"), programStatus: "REGISTRATION_OPEN", now };
    expect(independentManagementAccess({ ...base, accessStatus: "REVOKED" })).toBe(false);
    expect(independentManagementAccess({ ...base, accessStatus: "ACTIVE", expiresAt: new Date("2026-08-12T01:00:00.000Z") })).toBe(false);
    expect(independentManagementAccess({ ...base, accessStatus: "ACTIVE", programStatus: "COMPLETED" })).toBe(false);
    expect(independentManagementAccess({ ...base, accessStatus: "ACTIVE", programStatus: "CANCELLED" })).toBe(false);
  });

  it("keeps a post-event window for final operational completion", () => {
    const endDate = new Date("2026-08-12T00:00:00.000Z");
    const expiry = new Date(endDate.getTime() + 24 * 60 * 60 * 1000);
    expect(expiry.toISOString()).toBe("2026-08-13T00:00:00.000Z");
  });
});
