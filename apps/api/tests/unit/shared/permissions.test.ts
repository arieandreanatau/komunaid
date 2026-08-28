import { describe, it, expect } from "vitest";
import {
  PLATFORM_ROLES,
  COMMUNITY_ROLES,
  ORGANIZATION_ROLES,
  COMMUNITY_ROLES_EXCLUDING_OWNER,
  ORGANIZATION_ROLES_EXCLUDING_OWNER,
  isPlatformRole,
  isCommunityRole,
  isOrganizationRole,
  communityRoleLevel,
  isAtLeastCommunityRole,
  isCommunityOfficer,
  can,
  type CommunityAction,
} from "@komunaid/shared";

describe("permissions: canonical role lists", () => {
  it("matches the Prisma CommunityRole enum (schema.prisma:200-206)", () => {
    expect(COMMUNITY_ROLES).toEqual(["OWNER", "ADMIN", "EVENT_MANAGER", "VOLUNTEER_COORDINATOR", "MEMBER"]);
  });

  it("matches the Prisma PlatformRole enum (schema.prisma:96-100)", () => {
    expect(PLATFORM_ROLES).toEqual(["SUPER_ADMIN", "PLATFORM_ADMIN", "MEMBER"]);
  });

  it("matches the Prisma OrganizationRole enum (schema.prisma:457-461)", () => {
    expect(ORGANIZATION_ROLES).toEqual(["OWNER", "ADMIN", "MEMBER"]);
  });

  it("never contains the phantom OFFICER role", () => {
    expect(COMMUNITY_ROLES).not.toContain("OFFICER");
    expect(PLATFORM_ROLES).not.toContain("OFFICER");
    expect(ORGANIZATION_ROLES).not.toContain("OFFICER");
  });

  it("excludes OWNER from the two role-change enums, and only OWNER", () => {
    expect(COMMUNITY_ROLES_EXCLUDING_OWNER).toEqual(["ADMIN", "EVENT_MANAGER", "VOLUNTEER_COORDINATOR", "MEMBER"]);
    expect(COMMUNITY_ROLES_EXCLUDING_OWNER).not.toContain("OWNER");

    expect(ORGANIZATION_ROLES_EXCLUDING_OWNER).toEqual(["ADMIN", "MEMBER"]);
    expect(ORGANIZATION_ROLES_EXCLUDING_OWNER).not.toContain("OWNER");
  });
});

describe("permissions: role guards", () => {
  it("isPlatformRole accepts only real platform roles", () => {
    expect(isPlatformRole("SUPER_ADMIN")).toBe(true);
    expect(isPlatformRole("PLATFORM_ADMIN")).toBe(true);
    expect(isPlatformRole("MEMBER")).toBe(true);
    expect(isPlatformRole("OFFICER")).toBe(false);
    expect(isPlatformRole(undefined)).toBe(false);
    expect(isPlatformRole(null)).toBe(false);
  });

  it("isCommunityRole accepts only real community roles", () => {
    for (const role of COMMUNITY_ROLES) {
      expect(isCommunityRole(role)).toBe(true);
    }
    expect(isCommunityRole("OFFICER")).toBe(false);
    expect(isCommunityRole("")).toBe(false);
  });

  it("isOrganizationRole accepts only real organization roles", () => {
    for (const role of ORGANIZATION_ROLES) {
      expect(isOrganizationRole(role)).toBe(true);
    }
    expect(isOrganizationRole("EVENT_MANAGER")).toBe(false);
  });
});

describe("permissions: community role hierarchy", () => {
  it("ranks OWNER above ADMIN above the officer tier above MEMBER", () => {
    expect(communityRoleLevel("OWNER")).toBeGreaterThan(communityRoleLevel("ADMIN"));
    expect(communityRoleLevel("ADMIN")).toBeGreaterThan(communityRoleLevel("EVENT_MANAGER"));
    expect(communityRoleLevel("ADMIN")).toBeGreaterThan(communityRoleLevel("VOLUNTEER_COORDINATOR"));
    expect(communityRoleLevel("EVENT_MANAGER")).toBeGreaterThan(communityRoleLevel("MEMBER"));
    expect(communityRoleLevel("VOLUNTEER_COORDINATOR")).toBeGreaterThan(communityRoleLevel("MEMBER"));
  });

  it("treats EVENT_MANAGER and VOLUNTEER_COORDINATOR as siblings, not ordered", () => {
    expect(communityRoleLevel("EVENT_MANAGER")).toBe(communityRoleLevel("VOLUNTEER_COORDINATOR"));
  });

  it("gives an unknown/missing role level 0", () => {
    expect(communityRoleLevel(null)).toBe(0);
    expect(communityRoleLevel(undefined)).toBe(0);
    expect(communityRoleLevel("OFFICER")).toBe(0);
  });

  it("isAtLeastCommunityRole compares against the minimum", () => {
    expect(isAtLeastCommunityRole("OWNER", "ADMIN")).toBe(true);
    expect(isAtLeastCommunityRole("ADMIN", "ADMIN")).toBe(true);
    expect(isAtLeastCommunityRole("EVENT_MANAGER", "ADMIN")).toBe(false);
    expect(isAtLeastCommunityRole("MEMBER", "MEMBER")).toBe(true);
    expect(isAtLeastCommunityRole(null, "MEMBER")).toBe(false);
  });

  it("isCommunityOfficer is true for every role above MEMBER, replacing the phantom OFFICER role", () => {
    expect(isCommunityOfficer("OWNER")).toBe(true);
    expect(isCommunityOfficer("ADMIN")).toBe(true);
    expect(isCommunityOfficer("EVENT_MANAGER")).toBe(true);
    expect(isCommunityOfficer("VOLUNTEER_COORDINATOR")).toBe(true);
    expect(isCommunityOfficer("MEMBER")).toBe(false);
    expect(isCommunityOfficer("OFFICER")).toBe(false);
    expect(isCommunityOfficer(null)).toBe(false);
  });
});

describe("permissions: can()", () => {
  const ALL_ACTIONS: CommunityAction[] = [
    "viewMembers",
    "manageMembers",
    "changeMemberRole",
    "managePengurus",
    "handleJoinRequests",
    "manageMedia",
    "editSettings",
    "viewInsights",
    "manageEvents",
    "manageVolunteerPrograms",
  ];

  it("rejects a null/unknown/phantom role for every action", () => {
    for (const action of ALL_ACTIONS) {
      expect(can(null, action)).toBe(false);
      expect(can(undefined, action)).toBe(false);
      expect(can("OFFICER", action)).toBe(false);
    }
  });

  it("OWNER can do everything a community role can do", () => {
    for (const action of ALL_ACTIONS) {
      expect(can("OWNER", action)).toBe(true);
    }
  });

  it("ADMIN can do everything except change a member's role", () => {
    for (const action of ALL_ACTIONS) {
      if (action === "changeMemberRole") {
        expect(can("ADMIN", action)).toBe(false);
      } else {
        expect(can("ADMIN", action)).toBe(true);
      }
    }
  });

  it("only OWNER can change a member's role (requireCommunityOwner)", () => {
    expect(can("OWNER", "changeMemberRole")).toBe(true);
    expect(can("ADMIN", "changeMemberRole")).toBe(false);
    expect(can("EVENT_MANAGER", "changeMemberRole")).toBe(false);
    expect(can("MEMBER", "changeMemberRole")).toBe(false);
  });

  it("EVENT_MANAGER can manage events but not volunteer programs, members, media, or settings", () => {
    expect(can("EVENT_MANAGER", "manageEvents")).toBe(true);
    expect(can("EVENT_MANAGER", "manageVolunteerPrograms")).toBe(false);
    expect(can("EVENT_MANAGER", "manageMembers")).toBe(false);
    expect(can("EVENT_MANAGER", "manageMedia")).toBe(false);
    expect(can("EVENT_MANAGER", "editSettings")).toBe(false);
    expect(can("EVENT_MANAGER", "handleJoinRequests")).toBe(false);
  });

  it("VOLUNTEER_COORDINATOR can manage volunteer programs but not events, members, media, or settings", () => {
    expect(can("VOLUNTEER_COORDINATOR", "manageVolunteerPrograms")).toBe(true);
    expect(can("VOLUNTEER_COORDINATOR", "manageEvents")).toBe(false);
    expect(can("VOLUNTEER_COORDINATOR", "manageMembers")).toBe(false);
    expect(can("VOLUNTEER_COORDINATOR", "manageMedia")).toBe(false);
    expect(can("VOLUNTEER_COORDINATOR", "editSettings")).toBe(false);
  });

  it("plain MEMBER can only view members", () => {
    expect(can("MEMBER", "viewMembers")).toBe(true);
    expect(can("MEMBER", "manageMembers")).toBe(false);
    expect(can("MEMBER", "managePengurus")).toBe(false);
    expect(can("MEMBER", "handleJoinRequests")).toBe(false);
    expect(can("MEMBER", "manageMedia")).toBe(false);
    expect(can("MEMBER", "editSettings")).toBe(false);
    expect(can("MEMBER", "manageEvents")).toBe(false);
    expect(can("MEMBER", "manageVolunteerPrograms")).toBe(false);
  });
});
