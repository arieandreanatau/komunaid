import { describe, expect, it } from "vitest";
import { canOpenTab, tabs, type Tab } from "../../components/community/types";
import type { CommunityRole } from "@komunaid/shared";

// Ticket #14 (spec #12): "the visible tabs equal the openable tabs." This is
// the single predicate (component-dashboard-route.tsx) uses both to filter
// the tab list and to guard each tab's route, so the two can never drift
// apart. Every case here mirrors a real server guard: see the CommunityAction
// comments in components/community/types.ts and the API's
// COMMUNITY_ACTION_ROLES table in packages/shared/src/permissions.ts.

const ALL_TABS: Tab[] = tabs.map((t) => t.key);

function openTabs(role: CommunityRole | null): Tab[] {
  return ALL_TABS.filter((tab) => canOpenTab(role, tab));
}

describe("canOpenTab", () => {
  it("OWNER can open every tab", () => {
    expect(openTabs("OWNER")).toEqual(ALL_TABS);
  });

  it("ADMIN can open every tab (editSettings/manageMedia/handleJoinRequests/etc. are all OWNER+ADMIN)", () => {
    expect(openTabs("ADMIN")).toEqual(ALL_TABS);
  });

  it("EVENT_MANAGER can open ringkasan, profil, event and anggota, but not the admin-only tabs", () => {
    const open = openTabs("EVENT_MANAGER");
    expect(open).toContain("ringkasan");
    expect(open).toContain("profil");
    expect(open).toContain("event");
    expect(open).toContain("anggota");
    expect(open).not.toContain("pengurus");
    expect(open).not.toContain("permintaan");
    expect(open).not.toContain("media");
    expect(open).not.toContain("pengaturan");
    expect(open).not.toContain("insight");
  });

  it("VOLUNTEER_COORDINATOR can open ringkasan, profil and anggota, but not manageEvents or any admin-only tab", () => {
    const open = openTabs("VOLUNTEER_COORDINATOR");
    expect(open).toContain("ringkasan");
    expect(open).toContain("profil");
    expect(open).toContain("anggota");
    expect(open).not.toContain("event");
    expect(open).not.toContain("pengurus");
    expect(open).not.toContain("permintaan");
    expect(open).not.toContain("media");
    expect(open).not.toContain("pengaturan");
    expect(open).not.toContain("insight");
  });

  it("a null role (not yet resolved / not a community role) can only open the two ungated tabs", () => {
    expect(openTabs(null)).toEqual(["ringkasan", "profil"]);
  });

  it("MEMBER can open ringkasan, profil, and anggota (viewMembers is open to MEMBER), but not event/pengurus/permintaan/media/pengaturan/insight", () => {
    const open = openTabs("MEMBER");
    expect(open).toContain("ringkasan");
    expect(open).toContain("profil");
    expect(open).toContain("anggota");
    expect(open).not.toContain("event");
    expect(open).not.toContain("pengurus");
    expect(open).not.toContain("permintaan");
    expect(open).not.toContain("media");
    expect(open).not.toContain("pengaturan");
    expect(open).not.toContain("insight");
  });

  it("ringkasan and profil have no gate -- open to any role that reached the workspace at all", () => {
    for (const role of ["OWNER", "ADMIN", "EVENT_MANAGER", "VOLUNTEER_COORDINATOR"] as const) {
      expect(canOpenTab(role, "ringkasan")).toBe(true);
      expect(canOpenTab(role, "profil")).toBe(true);
    }
  });
});
