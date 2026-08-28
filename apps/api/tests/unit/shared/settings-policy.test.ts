import { describe, it, expect } from "vitest";
import {
  SETTINGS_DEFAULTS,
  resolveSettings,
  isMemberListPublic,
  isEventListPublic,
  canMembersPost,
  requiresJoinApproval,
  isVisibleToPublic,
  type SettingsRecord,
} from "@komunaid/shared";

const allOpen: SettingsRecord = {
  allowMemberPost: true,
  requireApproval: false,
  showMemberList: true,
  showEventList: true,
};

const allClosed: SettingsRecord = {
  allowMemberPost: false,
  requireApproval: true,
  showMemberList: false,
  showEventList: false,
};

describe("settings-policy: SETTINGS_DEFAULTS", () => {
  it("matches the Prisma column defaults (schema.prisma CommunitySettings/OrganizationSettings)", () => {
    expect(SETTINGS_DEFAULTS).toEqual({
      allowMemberPost: true,
      requireApproval: false,
      showMemberList: true,
      showEventList: true,
    });
  });
});

describe("settings-policy: resolveSettings", () => {
  it("falls back to SETTINGS_DEFAULTS for null", () => {
    expect(resolveSettings(null)).toEqual(SETTINGS_DEFAULTS);
  });

  it("falls back to SETTINGS_DEFAULTS for undefined", () => {
    expect(resolveSettings(undefined)).toEqual(SETTINGS_DEFAULTS);
  });

  it("passes through a saved record unchanged", () => {
    expect(resolveSettings(allClosed)).toEqual(allClosed);
  });
});

describe("settings-policy: isMemberListPublic", () => {
  it("is visible when the record was never saved (null)", () => {
    expect(isMemberListPublic(null)).toBe(true);
  });

  it("is visible when the record was never saved (undefined)", () => {
    expect(isMemberListPublic(undefined)).toBe(true);
  });

  it("is visible when showMemberList is true", () => {
    expect(isMemberListPublic(allOpen)).toBe(true);
  });

  it("is hidden only when showMemberList is explicitly false", () => {
    expect(isMemberListPublic(allClosed)).toBe(false);
  });
});

describe("settings-policy: isEventListPublic", () => {
  it("is visible when the record was never saved (null) -- the bug this ticket fixes must not flip this default", () => {
    expect(isEventListPublic(null)).toBe(true);
  });

  it("is visible when the record was never saved (undefined)", () => {
    expect(isEventListPublic(undefined)).toBe(true);
  });

  it("is visible when showEventList is true", () => {
    expect(isEventListPublic(allOpen)).toBe(true);
  });

  it("is hidden only when showEventList is explicitly false", () => {
    expect(isEventListPublic(allClosed)).toBe(false);
  });
});

describe("settings-policy: canMembersPost", () => {
  it("defaults to allowed when the record was never saved", () => {
    expect(canMembersPost(null)).toBe(true);
    expect(canMembersPost(undefined)).toBe(true);
  });

  it("is allowed when allowMemberPost is true", () => {
    expect(canMembersPost(allOpen)).toBe(true);
  });

  it("is disallowed only when allowMemberPost is explicitly false", () => {
    expect(canMembersPost(allClosed)).toBe(false);
  });
});

describe("settings-policy: requiresJoinApproval", () => {
  it("defaults to no-approval-needed when the record was never saved", () => {
    expect(requiresJoinApproval(null)).toBe(false);
    expect(requiresJoinApproval(undefined)).toBe(false);
  });

  it("does not require approval when requireApproval is false", () => {
    expect(requiresJoinApproval(allOpen)).toBe(false);
  });

  it("requires approval only when requireApproval is explicitly true", () => {
    expect(requiresJoinApproval(allClosed)).toBe(true);
  });

  it("uses the opposite polarity from the visibility switches on purpose", () => {
    // showMemberList/showEventList default open (`!== false`), but
    // requireApproval defaults closed (`=== true`) -- a never-saved record
    // must read as "no approval needed", matching SETTINGS_DEFAULTS.requireApproval.
    expect(SETTINGS_DEFAULTS.requireApproval).toBe(false);
    expect(requiresJoinApproval(null)).toBe(false);
  });
});

describe("settings-policy: isVisibleToPublic", () => {
  it("is visible when the switch is public, regardless of membership", () => {
    expect(isVisibleToPublic(true, false)).toBe(true);
    expect(isVisibleToPublic(true, true)).toBe(true);
  });

  it("is visible to a member/owner even when the switch is off (hiding is outward only)", () => {
    expect(isVisibleToPublic(false, true)).toBe(true);
  });

  it("is hidden from a stranger when the switch is off", () => {
    expect(isVisibleToPublic(false, false)).toBe(false);
  });
});
