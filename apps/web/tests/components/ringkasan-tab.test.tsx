import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeAll, describe, expect, it } from "vitest";
import { RingkasanTab } from "../../components/community/ringkasan-tab";
import type { ActivityItem, DashboardData } from "../../components/community/types";

// Ticket #14 (spec #12): the Ringkasan tab is open to every community
// officer (see canOpenTab in components/community/types.ts -- "ringkasan"
// has no CommunityAction gate), but the volunteer-workspace shortcut inside
// it must only appear for a role that can(role, "manageVolunteerPrograms")
// -- D7 in spec #12's product decisions: the standalone volunteer route
// (app/dashboard/communities/[slug]/volunteer/page.tsx) isn't rebuilt into
// the tab shell, it's just made discoverable to whoever can manage it.

function baseCommunity(): DashboardData["community"] {
  return {
    id: "comm-1",
    name: "Komunitas Uji",
    slug: "komunitas-uji",
    description: "Deskripsi",
    visibility: "PUBLIC",
    membershipType: "OPEN",
    status: "ACTIVE",
    memberCount: 12,
    eventCount: 3,
    createdAt: "2024-01-01T00:00:00.000Z",
  };
}

describe("RingkasanTab", () => {
  let container: HTMLDivElement | undefined;
  let root: ReturnType<typeof createRoot> | undefined;

  beforeAll(() => {
    (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  });

  afterEach(() => {
    act(() => root?.unmount());
    container?.remove();
    container = undefined;
    root = undefined;
  });

  function render(ui: React.ReactElement) {
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);
    act(() => root!.render(ui));
    return container;
  }

  function baseProps(overrides: Partial<React.ComponentProps<typeof RingkasanTab>> = {}) {
    return {
      communityId: "comm-1",
      communityPath: "komunitas-uji",
      community: baseCommunity(),
      pendingRequests: 0,
      activeEvents: 0,
      recentActivity: [] as ActivityItem[],
      role: null,
      ...overrides,
    };
  }

  it("shows the volunteer-workspace shortcut for VOLUNTEER_COORDINATOR", () => {
    const el = render(<RingkasanTab {...baseProps({ role: "VOLUNTEER_COORDINATOR" })} />);
    const link = el.querySelector('a[href="/dashboard/communities/komunitas-uji/volunteer"]');
    expect(link).toBeTruthy();
    expect(el.textContent).toContain("Program volunteer");
  });

  it("shows the volunteer-workspace shortcut for OWNER too (can() covers OWNER for every action)", () => {
    const el = render(<RingkasanTab {...baseProps({ role: "OWNER" })} />);
    expect(el.querySelector('a[href="/dashboard/communities/komunitas-uji/volunteer"]')).toBeTruthy();
  });

  it("hides the volunteer-workspace shortcut for EVENT_MANAGER (cannot manageVolunteerPrograms)", () => {
    const el = render(<RingkasanTab {...baseProps({ role: "EVENT_MANAGER" })} />);
    expect(el.querySelector('a[href="/dashboard/communities/komunitas-uji/volunteer"]')).toBeFalsy();
  });

  it("hides the volunteer-workspace shortcut when role is null", () => {
    const el = render(<RingkasanTab {...baseProps({ role: null })} />);
    expect(el.querySelector('a[href="/dashboard/communities/komunitas-uji/volunteer"]')).toBeFalsy();
  });

  it("still renders the general overview content regardless of role (no gate on the tab itself)", () => {
    const el = render(<RingkasanTab {...baseProps({ role: "EVENT_MANAGER" })} />);
    expect(el.textContent).toContain("Informasi Komunitas");
    expect(el.textContent).toContain(baseCommunity().name);
  });
});
