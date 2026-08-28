import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

// PengaturanTab renders <AddressSelector>, which calls TanStack Query's
// useQuery and needs a QueryClientProvider + network access. That widget is
// covered elsewhere; here we only care about PengaturanTab's own form state,
// loading/error/success surfacing, and owner-gating, so stub it out.
vi.mock("@/components/address-selector", () => ({
  AddressSelector: () => <div data-testid="address-selector-stub" />,
}));

import { PengaturanTab } from "../../components/community/pengaturan-tab";
import type { CommunitySettingsToggles, PengaturanForm } from "../../components/community/types";

function setInputValue(input: HTMLInputElement | HTMLTextAreaElement, value: string) {
  const proto = input instanceof HTMLTextAreaElement ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
  const setter = Object.getOwnPropertyDescriptor(proto, "value")!.set!;
  setter.call(input, value);
  input.dispatchEvent(new Event("input", { bubbles: true }));
}

function baseForm(overrides: Partial<PengaturanForm> = {}): PengaturanForm {
  return {
    name: "Komunitas Hijau",
    description: "Komunitas peduli lingkungan.",
    visibility: "PUBLIC",
    membershipType: "OPEN",
    address: "",
    province: "",
    city: "",
    district: "",
    village: "",
    postalCode: "",
    address2: "",
    country: "",
    website: "",
    banner: "",
    logo: "",
    categoryIds: [],
    tagsInput: "",
    ...overrides,
  };
}

function baseToggles(overrides: Partial<CommunitySettingsToggles> = {}): CommunitySettingsToggles {
  return {
    allowMemberPost: true,
    requireApproval: false,
    showMemberList: true,
    showEventList: true,
    ...overrides,
  };
}

describe("PengaturanTab", () => {
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

  function baseProps(overrides: Partial<React.ComponentProps<typeof PengaturanTab>> = {}) {
    return {
      form: baseForm(),
      setForm: vi.fn(),
      onSave: vi.fn(),
      saving: false,
      success: "",
      error: "",
      isOwner: true,
      canManage: true,
      categories: [] as { id: string; name: string; icon: string }[],
      communitySettingsForm: baseToggles(),
      setCommunitySettingsForm: vi.fn(),
      onSaveCommunitySettings: vi.fn(),
      communitySettingsLoading: false,
      communitySettingsSaving: false,
      communitySettingsSuccess: "",
      communitySettingsError: "",
      ...overrides,
    };
  }

  it("shows the loading copy for the interaction-settings panel and hides the toggles", () => {
    const el = render(<PengaturanTab {...baseProps({ communitySettingsLoading: true })} />);
    expect(el.textContent).toContain("Memuat pengaturan komunitas...");
    expect(el.textContent).not.toContain("Izinkan Anggota Posting");
  });

  it("surfaces the settings error and success messages", () => {
    const el = render(<PengaturanTab {...baseProps({ error: "Gagal menyimpan pengaturan." })} />);
    expect(el.textContent).toContain("Gagal menyimpan pengaturan.");

    act(() => root?.unmount());
    container?.remove();

    const successEl = render(<PengaturanTab {...baseProps({ success: "Pengaturan berhasil disimpan!" })} />);
    expect(successEl.textContent).toContain("Pengaturan berhasil disimpan!");
  });

  it("does not render a category section when there are no categories (empty state)", () => {
    const el = render(<PengaturanTab {...baseProps({ categories: [] })} />);
    expect(el.textContent).not.toContain("Kategori");
  });

  it("renders populated categories and highlights the ones already selected", () => {
    const categories = [
      { id: "cat-1", name: "Lingkungan", icon: "🌱" },
      { id: "cat-2", name: "Pendidikan", icon: "📚" },
    ];
    const form = baseForm({ categoryIds: ["cat-1"] });
    const el = render(<PengaturanTab {...baseProps({ categories, form })} />);

    const selectedButton = Array.from(el.querySelectorAll("button")).find((b) => b.textContent?.includes("Lingkungan"))!;
    const unselectedButton = Array.from(el.querySelectorAll("button")).find((b) => b.textContent?.includes("Pendidikan"))!;
    expect(selectedButton.className).toContain("bg-komuna-blue text-white border-komuna-blue");
    expect(unselectedButton.className).toContain("bg-white text-gray-600 border-gray-200");
    expect(unselectedButton.className).not.toContain("bg-komuna-blue text-white");
  });

  // Behaviour change (architecture candidate 2, permission module): the API
  // accepts community settings edits from OWNER *or* ADMIN alike
  // (requireCommunityAdmin on the community/settings PUT routes), so field
  // editing and the save actions are now gated on `canManage` (ADMIN+)
  // instead of `isOwner`. Only the Danger Zone -- a strictly-OWNER action
  // (archive/suspend) -- stays gated on `isOwner`. Previously this component
  // gated everything on `isOwner`, which under-permitted ADMIN-level
  // community managers relative to what the server already allowed them.
  it("disables all fields, hides the save action, and hides the danger zone when the viewer cannot manage the community", () => {
    const el = render(<PengaturanTab {...baseProps({ isOwner: false, canManage: false })} />);

    const nameInput = el.querySelector<HTMLInputElement>("input[type='text']")!;
    expect(nameInput.disabled).toBe(true);
    expect(el.textContent).toContain("Anda tidak memiliki izin untuk mengubah pengaturan ini.");
    expect(el.textContent).not.toContain("Simpan Perubahan");
    expect(el.textContent).not.toContain("Danger Zone");
  });

  it("enables fields and shows the save action for admins, but still hides the danger zone (owner-only)", () => {
    const el = render(<PengaturanTab {...baseProps({ isOwner: false, canManage: true })} />);

    const nameInput = el.querySelector<HTMLInputElement>("input[type='text']")!;
    expect(nameInput.disabled).toBe(false);
    expect(el.textContent).toContain("Simpan Perubahan");
    expect(el.textContent).not.toContain("Danger Zone");
  });

  it("enables fields and shows the save action and danger zone for owners", () => {
    const el = render(<PengaturanTab {...baseProps({ isOwner: true, canManage: true })} />);

    const nameInput = el.querySelector<HTMLInputElement>("input[type='text']")!;
    expect(nameInput.disabled).toBe(false);
    expect(el.textContent).toContain("Simpan Perubahan");
    expect(el.textContent).toContain("Danger Zone");
  });

  it("shows a spinner and disables the save button while saving", () => {
    const el = render(<PengaturanTab {...baseProps({ saving: true })} />);
    const saveButton = Array.from(el.querySelectorAll("button")).find((b) => b.textContent?.includes("Menyimpan..."))!;
    expect(saveButton).toBeTruthy();
    expect(saveButton.disabled).toBe(true);
  });

  it("propagates name field edits through setForm", () => {
    const setForm = vi.fn();
    const el = render(<PengaturanTab {...baseProps({ setForm })} />);
    const nameInput = el.querySelector<HTMLInputElement>("input[type='text']")!;

    act(() => setInputValue(nameInput, "Komunitas Baru"));

    expect(setForm).toHaveBeenCalledWith(expect.objectContaining({ name: "Komunitas Baru" }));
  });

  it("toggles a category id in and out of the form", () => {
    const setForm = vi.fn();
    const categories = [{ id: "cat-1", name: "Lingkungan", icon: "🌱" }];
    const el = render(<PengaturanTab {...baseProps({ setForm, categories, form: baseForm({ categoryIds: [] }) })} />);

    const categoryButton = Array.from(el.querySelectorAll("button")).find((b) => b.textContent?.includes("Lingkungan"))!;
    act(() => categoryButton.click());

    expect(setForm).toHaveBeenCalledWith(expect.objectContaining({ categoryIds: ["cat-1"] }));
  });

  it("calls onSave when the save button is clicked", () => {
    const onSave = vi.fn();
    const el = render(<PengaturanTab {...baseProps({ onSave })} />);
    const saveButton = Array.from(el.querySelectorAll("button")).find((b) => b.textContent === "Simpan Perubahan")!;

    act(() => saveButton.click());

    expect(onSave).toHaveBeenCalledOnce();
  });

  it("flips a community-settings toggle for admins/owners and calls onSaveCommunitySettings", () => {
    const setCommunitySettingsForm = vi.fn();
    const onSaveCommunitySettings = vi.fn();
    const el = render(<PengaturanTab {...baseProps({ setCommunitySettingsForm, onSaveCommunitySettings })} />);

    const toggle = el.querySelector<HTMLButtonElement>("button[aria-pressed]")!;
    act(() => toggle.click());
    expect(setCommunitySettingsForm).toHaveBeenCalledWith(expect.objectContaining({ allowMemberPost: false }));

    const saveInteractionButton = Array.from(el.querySelectorAll("button")).find((b) => b.textContent === "Simpan Pengaturan Komunitas")!;
    act(() => saveInteractionButton.click());
    expect(onSaveCommunitySettings).toHaveBeenCalledOnce();
  });

  // Behaviour change: gated on `canManage` now, not `isOwner` (see the
  // field-gating tests above) -- an ADMIN who cannot manage the community
  // (canManage: false) sees the control disabled, same as before.
  it("does not flip a toggle when the viewer cannot manage the community since the control is disabled", () => {
    const setCommunitySettingsForm = vi.fn();
    const el = render(<PengaturanTab {...baseProps({ isOwner: false, canManage: false, setCommunitySettingsForm })} />);

    const toggle = el.querySelector<HTMLButtonElement>("button[aria-pressed]")!;
    expect(toggle.disabled).toBe(true);
    act(() => toggle.click());
    expect(setCommunitySettingsForm).not.toHaveBeenCalled();
  });
});
