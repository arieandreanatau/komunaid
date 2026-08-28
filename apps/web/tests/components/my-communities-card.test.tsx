import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { CommunityCard, type CommunityTab, type UserCommunity } from "../../app/dashboard/communities/page";

// Ticket #15 (spec #12): "Komunitas Saya"'s "Kelola" (manage) affordance used
// to be hardcoded to `tab === "created"` (== role === "OWNER"), so an
// ADMIN/EVENT_MANAGER/VOLUNTEER_COORDINATOR -- who ticket #14 already lets
// open the workspace -- had no manage entry point on this page at all. It
// now keys off a `canManage` prop threaded down from the page's
// managedIds set, which in turn comes from GET /users/profile's
// server-derived managedCommunities (apps/api/src/routes/users.ts, built
// with isCommunityOfficer -- the same predicate requireCommunityOfficer
// uses to gate workspace entry). This suite pins the presentational half of
// that wiring: the affordance follows `canManage`, not the tab or the role
// label.

function makeCommunity(overrides: Partial<UserCommunity> = {}): UserCommunity {
  return {
    id: "c1",
    name: "Komunitas Uji",
    slug: "komunitas-uji",
    logo: null,
    role: "ADMIN",
    status: "APPROVED",
    ...overrides,
  };
}

describe("CommunityCard (Komunitas Saya)", () => {
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

  function render(community: UserCommunity, tab: CommunityTab, canManage: boolean) {
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);
    act(() => {
      root!.render(<CommunityCard community={community} tab={tab} canManage={canManage} onLeave={vi.fn()} />);
    });
    return container;
  }

  function findLinkByText(el: HTMLElement, text: string): HTMLAnchorElement | undefined {
    return Array.from(el.querySelectorAll("a")).find((a) => a.textContent === text);
  }

  it("shows Kelola for an OWNER in the created tab (unchanged baseline behaviour)", () => {
    const el = render(makeCommunity({ role: "OWNER" }), "created", true);
    const manageLink = findLinkByText(el, "Kelola");
    expect(manageLink?.getAttribute("href")).toBe("/dashboard/communities/komunitas-uji/overview");
  });

  it("shows Kelola for a non-owner officer (ADMIN) in the followed tab, once canManage is true", () => {
    const el = render(makeCommunity({ role: "ADMIN" }), "followed", true);
    const manageLink = findLinkByText(el, "Kelola");
    expect(manageLink?.getAttribute("href")).toBe("/dashboard/communities/komunitas-uji/overview");
    // The leave affordance stays available -- an officer can still leave.
    expect(el.textContent).toContain("Tinggalkan");
  });

  it("does NOT show Kelola for a plain MEMBER in the followed tab (canManage false)", () => {
    const el = render(makeCommunity({ role: "MEMBER" }), "followed", false);
    expect(findLinkByText(el, "Kelola")).toBeUndefined();
    expect(el.querySelector('a[href="/dashboard/communities/komunitas-uji/overview"]')).toBeNull();
    expect(el.textContent).toContain("Lihat Komunitas");
    expect(el.textContent).toContain("Tinggalkan");
  });

  it("the community name links to the workspace only when canManage is true, otherwise to the public page", () => {
    const managed = render(makeCommunity({ role: "EVENT_MANAGER" }), "followed", true);
    expect(managed.querySelector("a")?.getAttribute("href")).toBe("/dashboard/communities/komunitas-uji/overview");

    act(() => root?.unmount());
    container?.remove();
    const unmanaged = render(makeCommunity({ role: "MEMBER" }), "followed", false);
    expect(unmanaged.querySelector("a")?.getAttribute("href")).toBe("/communities/komunitas-uji");
  });
});
