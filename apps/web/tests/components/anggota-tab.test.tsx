import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { AnggotaTab } from "../../components/community/anggota-tab";
import type { Member } from "../../components/community/types";

function makeMember(overrides: Partial<Member> = {}): Member {
  return {
    id: "mem-1",
    userId: "user-1",
    name: "Budi Santoso",
    username: "budisantoso",
    avatar: null,
    role: "MEMBER",
    status: "ACTIVE",
    joinedAt: "2024-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function setInputValue(input: HTMLInputElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")!.set!;
  setter.call(input, value);
  input.dispatchEvent(new Event("input", { bubbles: true }));
}

function setSelectValue(select: HTMLSelectElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, "value")!.set!;
  setter.call(select, value);
  select.dispatchEvent(new Event("change", { bubbles: true }));
}

describe("AnggotaTab", () => {
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

  // Default role is ADMIN (not OWNER), matching the old `isOwner: false`
  // default -- this component was previously only ever reachable by
  // OWNER/ADMIN (requireCommunityAdmin on the dashboard route), so ADMIN is
  // the realistic "non-owner" baseline for most of these tests.
  function baseProps(overrides: Partial<React.ComponentProps<typeof AnggotaTab>> = {}) {
    return {
      members: [] as Member[],
      memberSearch: "",
      setMemberSearch: vi.fn(),
      memberRoleFilter: "",
      setMemberRoleFilter: vi.fn(),
      memberStatusFilter: "",
      setMemberStatusFilter: vi.fn(),
      memberPage: 1,
      setMemberPage: vi.fn(),
      memberTotalPages: 1,
      role: "ADMIN" as const,
      currentUserId: "current-user",
      onChangeRole: vi.fn(),
      onRemoveMember: vi.fn(),
      onRestoreMember: vi.fn(),
      ...overrides,
    };
  }

  it("shows the empty state copy for the active-member view", () => {
    const el = render(<AnggotaTab {...baseProps()} />);
    expect(el.textContent).toContain("Tidak ada anggota ditemukan.");
  });

  it("shows a different empty state copy when filtering banned members", () => {
    const el = render(<AnggotaTab {...baseProps({ memberStatusFilter: "BANNED" })} />);
    expect(el.textContent).toContain("Tidak ada anggota yang diblokir.");
  });

  it("renders populated members with their role badge", () => {
    const members = [makeMember({ name: "Siti Aminah", username: "sitiaminah", role: "ADMIN" })];
    const el = render(<AnggotaTab {...baseProps({ members })} />);
    expect(el.textContent).toContain("Siti Aminah");
    expect(el.textContent).toContain("@sitiaminah");
    expect(el.textContent).toContain("ADMIN");
  });

  it("ADMIN can remove a member but cannot change their role (changeMemberRole is OWNER-only)", () => {
    const members = [makeMember()];
    const el = render(<AnggotaTab {...baseProps({ members, role: "ADMIN" })} />);
    // Only one <select> should exist (the top filter) since the per-row role select is owner-only.
    expect(el.querySelectorAll("select").length).toBe(1);
    // manageMembers (remove) is OWNER+ADMIN, so an ADMIN still sees it.
    expect(el.querySelector("button[title='Keluarkan anggota']")).toBeTruthy();
  });

  it("shows the per-row role select for OWNER and wires onChangeRole", () => {
    const onChangeRole = vi.fn();
    const members = [makeMember({ id: "mem-2", role: "MEMBER" })];
    const el = render(<AnggotaTab {...baseProps({ members, role: "OWNER", onChangeRole })} />);

    const selects = el.querySelectorAll("select");
    expect(selects.length).toBe(2); // filter select + per-row role select
    const roleSelect = selects[1] as HTMLSelectElement;
    act(() => setSelectValue(roleSelect, "ADMIN"));

    expect(onChangeRole).toHaveBeenCalledWith("mem-2", "ADMIN");
  });

  it("EVENT_MANAGER and plain MEMBER get no member-management affordances at all", () => {
    const members = [makeMember()];

    const eventManager = render(<AnggotaTab {...baseProps({ members, role: "EVENT_MANAGER" })} />);
    expect(eventManager.querySelectorAll("select").length).toBe(1);
    expect(eventManager.querySelector("button[title='Keluarkan anggota']")).toBeNull();

    act(() => root?.unmount());
    container?.remove();

    const plainMember = render(<AnggotaTab {...baseProps({ members, role: "MEMBER" })} />);
    expect(plainMember.querySelectorAll("select").length).toBe(1);
    expect(plainMember.querySelector("button[title='Keluarkan anggota']")).toBeNull();
  });

  it("never shows role-management affordances for the current user's own row", () => {
    const members = [makeMember({ userId: "current-user" })];
    const el = render(<AnggotaTab {...baseProps({ members, role: "OWNER", currentUserId: "current-user" })} />);
    // Only the top filter select remains; no per-row controls for your own membership.
    expect(el.querySelectorAll("select").length).toBe(1);
    expect(el.querySelector("button[title='Keluarkan anggota']")).toBeNull();
  });

  it("calls onRemoveMember with the member id and name", () => {
    const onRemoveMember = vi.fn();
    const members = [makeMember({ id: "mem-3", name: "Dewi Lestari" })];
    const el = render(<AnggotaTab {...baseProps({ members, role: "OWNER", onRemoveMember })} />);

    const removeButton = el.querySelector<HTMLButtonElement>("button[title='Keluarkan anggota']")!;
    act(() => removeButton.click());

    expect(onRemoveMember).toHaveBeenCalledWith("mem-3", "Dewi Lestari");
  });

  it("shows a Pulihkan button for banned members and wires onRestoreMember", () => {
    const onRestoreMember = vi.fn();
    const members = [makeMember({ id: "mem-4", name: "Andi Wijaya", status: "BANNED" })];
    const el = render(<AnggotaTab {...baseProps({ members, memberStatusFilter: "BANNED", onRestoreMember })} />);

    const restoreButton = Array.from(el.querySelectorAll("button")).find((b) => b.textContent === "Pulihkan")!;
    expect(restoreButton).toBeTruthy();
    act(() => restoreButton.click());

    expect(onRestoreMember).toHaveBeenCalledWith("mem-4", "Andi Wijaya");
  });

  it("updates search text and resets to page 1", () => {
    const setMemberSearch = vi.fn();
    const setMemberPage = vi.fn();
    const el = render(<AnggotaTab {...baseProps({ setMemberSearch, setMemberPage })} />);

    const searchInput = el.querySelector<HTMLInputElement>("input[placeholder='Cari anggota...']")!;
    act(() => setInputValue(searchInput, "budi"));

    expect(setMemberSearch).toHaveBeenCalledWith("budi");
    expect(setMemberPage).toHaveBeenCalledWith(1);
  });

  it("renders pagination controls only when there is more than one page", () => {
    const single = render(<AnggotaTab {...baseProps({ memberTotalPages: 1 })} />);
    expect(single.textContent).not.toContain("Sebelumnya");

    act(() => root?.unmount());
    container?.remove();

    const multi = render(<AnggotaTab {...baseProps({ memberTotalPages: 3, memberPage: 2 })} />);
    expect(multi.textContent).toContain("2 / 3");
    const prevButton = Array.from(multi.querySelectorAll("button")).find((b) => b.textContent === "Sebelumnya") as HTMLButtonElement;
    const nextButton = Array.from(multi.querySelectorAll("button")).find((b) => b.textContent === "Berikutnya") as HTMLButtonElement;
    expect(prevButton.disabled).toBe(false);
    expect(nextButton.disabled).toBe(false);
  });
});
