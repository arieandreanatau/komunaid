import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/api", () => ({
  default: {
    get: vi.fn().mockResolvedValue({ data: { data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 1 } } }),
    post: vi.fn().mockResolvedValue({ data: {} }),
    put: vi.fn().mockResolvedValue({ data: {} }),
    delete: vi.fn().mockResolvedValue({ data: {} }),
  },
}));

import { CommunityEventTab } from "../../components/community-event-tab";

describe("CommunityEventTab", () => {
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

  async function render(ui: React.ReactElement) {
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);
    await act(async () => {
      root!.render(ui);
      await Promise.resolve();
    });
    return container;
  }

  function baseProps(overrides: Partial<React.ComponentProps<typeof CommunityEventTab>> = {}) {
    return {
      communityId: "cmt-1",
      communitySlug: "komunitas-uji",
      communityName: "Komunitas Uji",
      role: null,
      ...overrides,
    };
  }

  it("shows 'Tambah Event' for OWNER", async () => {
    const el = await render(<CommunityEventTab {...baseProps({ role: "OWNER" })} />);
    expect(el.textContent).toContain("Tambah Event");
  });

  it("shows 'Tambah Event' for ADMIN", async () => {
    const el = await render(<CommunityEventTab {...baseProps({ role: "ADMIN" })} />);
    expect(el.textContent).toContain("Tambah Event");
  });

  it("shows 'Tambah Event' for EVENT_MANAGER", async () => {
    const el = await render(<CommunityEventTab {...baseProps({ role: "EVENT_MANAGER" })} />);
    expect(el.textContent).toContain("Tambah Event");
  });

  it("hides 'Tambah Event' for VOLUNTEER_COORDINATOR", async () => {
    const el = await render(<CommunityEventTab {...baseProps({ role: "VOLUNTEER_COORDINATOR" })} />);
    expect(el.textContent).not.toContain("Tambah Event");
  });

  it("hides 'Tambah Event' for MEMBER", async () => {
    const el = await render(<CommunityEventTab {...baseProps({ role: "MEMBER" })} />);
    expect(el.textContent).not.toContain("Tambah Event");
  });

  it("hides 'Tambah Event' when role is null", async () => {
    const el = await render(<CommunityEventTab {...baseProps({ role: null })} />);
    expect(el.textContent).not.toContain("Tambah Event");
  });

  it("still renders the empty state for a role that cannot manage events", async () => {
    const el = await render(<CommunityEventTab {...baseProps({ role: "MEMBER" })} />);
    expect(el.textContent).toContain("Belum ada event");
    expect(el.textContent).not.toContain("Buat event pertama");
  });
});
