import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

// MediaTab fetches the media list on mount via the shared axios instance --
// stub it out so the component test stays about role gating, not networking.
vi.mock("@/lib/api", () => ({
  default: {
    get: vi.fn().mockResolvedValue({ data: { data: [] } }),
    post: vi.fn().mockResolvedValue({ data: { data: {} } }),
    put: vi.fn().mockResolvedValue({ data: { data: {} } }),
    delete: vi.fn().mockResolvedValue({ data: {} }),
  },
}));

import { MediaTab } from "../../components/community/media-tab";

describe("MediaTab", () => {
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
      // Let the mounted fetchMedia() promise resolve.
      await Promise.resolve();
    });
    return container;
  }

  it("hides the 'Buat Media' action for a role below ADMIN (manageMedia is OWNER+ADMIN)", async () => {
    const el = await render(<MediaTab communityId="community-1" role="EVENT_MANAGER" />);
    expect(el.textContent).not.toContain("Buat Media");
  });

  it("hides the 'Buat Media' action for a null/anonymous role", async () => {
    const el = await render(<MediaTab communityId="community-1" role={null} />);
    expect(el.textContent).not.toContain("Buat Media");
  });

  it("shows the 'Buat Media' action for ADMIN", async () => {
    const el = await render(<MediaTab communityId="community-1" role="ADMIN" />);
    expect(el.textContent).toContain("Buat Media");
  });

  it("shows the 'Buat Media' action for OWNER", async () => {
    const el = await render(<MediaTab communityId="community-1" role="OWNER" />);
    expect(el.textContent).toContain("Buat Media");
  });

  it("shows the empty state without the manage-hint for a role that cannot manage media", async () => {
    const el = await render(<MediaTab communityId="community-1" role="MEMBER" />);
    expect(el.textContent).toContain("Belum ada media.");
    expect(el.textContent).not.toContain("Buat pengumuman, berita, atau galeri baru.");
  });
});
