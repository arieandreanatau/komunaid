import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { PengurusTab } from "../../components/community/pengurus-tab";
import type { Member } from "../../components/community/types";

function makeMember(overrides: Partial<Member> = {}): Member {
  return {
    id: "officer-1",
    userId: "user-1",
    name: "Rani Wulandari",
    username: "raniwulandari",
    avatar: null,
    role: "ADMIN",
    status: "ACTIVE",
    joinedAt: "2024-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("PengurusTab", () => {
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

  function baseProps(overrides: Partial<React.ComponentProps<typeof PengurusTab>> = {}) {
    return {
      officers: [] as Member[],
      loading: false,
      role: "ADMIN" as const,
      currentUserId: "current-user",
      onChangeRole: vi.fn(),
      onRemoveMember: vi.fn(),
      ...overrides,
    };
  }

  it("shows a loading spinner", () => {
    const el = render(<PengurusTab {...baseProps({ loading: true })} />);
    expect(el.querySelector(".animate-spin")).toBeTruthy();
  });

  it("shows the empty state copy when there are no officers", () => {
    const el = render(<PengurusTab {...baseProps({ officers: [] })} />);
    expect(el.textContent).toContain("Belum ada pengurus selain owner.");
  });

  it("shows the Owner access badge only for OWNER", () => {
    const owner = render(<PengurusTab {...baseProps({ role: "OWNER" })} />);
    expect(owner.textContent).toContain("Owner access");

    act(() => root?.unmount());
    container?.remove();

    const admin = render(<PengurusTab {...baseProps({ role: "ADMIN" })} />);
    expect(admin.textContent).not.toContain("Owner access");
  });

  it("OWNER sees both the role select and the remove button for a non-owner officer", () => {
    const onChangeRole = vi.fn();
    const officers = [makeMember({ id: "officer-2", role: "EVENT_MANAGER" })];
    const el = render(<PengurusTab {...baseProps({ officers, role: "OWNER", onChangeRole })} />);

    expect(el.querySelector("select")).toBeTruthy();
    expect(el.querySelector("button[title='Keluarkan pengurus']")).toBeTruthy();
  });

  it("ADMIN can remove an officer (managePengurus) but cannot change their role (changeMemberRole is OWNER-only)", () => {
    const officers = [makeMember({ id: "officer-3", role: "EVENT_MANAGER" })];
    const el = render(<PengurusTab {...baseProps({ officers, role: "ADMIN" })} />);

    expect(el.querySelector("select")).toBeNull();
    expect(el.querySelector("button[title='Keluarkan pengurus']")).toBeTruthy();
  });

  it("EVENT_MANAGER and VOLUNTEER_COORDINATOR get no pengurus-management affordances at all", () => {
    const officers = [makeMember({ id: "officer-4", role: "ADMIN" })];

    const eventManager = render(<PengurusTab {...baseProps({ officers, role: "EVENT_MANAGER" })} />);
    expect(eventManager.querySelector("select")).toBeNull();
    expect(eventManager.querySelector("button[title='Keluarkan pengurus']")).toBeNull();

    act(() => root?.unmount());
    container?.remove();

    const volunteerCoordinator = render(<PengurusTab {...baseProps({ officers, role: "VOLUNTEER_COORDINATOR" })} />);
    expect(volunteerCoordinator.querySelector("select")).toBeNull();
    expect(volunteerCoordinator.querySelector("button[title='Keluarkan pengurus']")).toBeNull();
  });

  it("never shows management affordances for the current user's own row, even for OWNER", () => {
    const officers = [makeMember({ userId: "current-user" })];
    const el = render(<PengurusTab {...baseProps({ officers, role: "OWNER", currentUserId: "current-user" })} />);
    expect(el.querySelector("select")).toBeNull();
    expect(el.querySelector("button[title='Keluarkan pengurus']")).toBeNull();
  });

  it("never lets OWNER's own role be changed or removed, even by another OWNER-permissioned viewer", () => {
    const officers = [makeMember({ id: "officer-owner", role: "OWNER", userId: "other-owner" })];
    const el = render(<PengurusTab {...baseProps({ officers, role: "OWNER" })} />);
    expect(el.querySelector("select")).toBeNull();
    expect(el.querySelector("button[title='Keluarkan pengurus']")).toBeNull();
  });

  it("wires onChangeRole and onRemoveMember with the officer id", () => {
    const onChangeRole = vi.fn();
    const onRemoveMember = vi.fn();
    const officers = [makeMember({ id: "officer-5", role: "MEMBER", name: "Yusuf Hakim" })];
    const el = render(<PengurusTab {...baseProps({ officers, role: "OWNER", onChangeRole, onRemoveMember })} />);

    const select = el.querySelector<HTMLSelectElement>("select")!;
    const setter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, "value")!.set!;
    act(() => {
      setter.call(select, "ADMIN");
      select.dispatchEvent(new Event("change", { bubbles: true }));
    });
    expect(onChangeRole).toHaveBeenCalledWith("officer-5", "ADMIN");

    const removeButton = el.querySelector<HTMLButtonElement>("button[title='Keluarkan pengurus']")!;
    act(() => removeButton.click());
    expect(onRemoveMember).toHaveBeenCalledWith("officer-5", "Yusuf Hakim");
  });
});
