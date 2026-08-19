import React, { act, useRef } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useDrawerDialog } from "../../components/ui/use-drawer-dialog";

function TestDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const dialogRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const backgroundRef = useRef<HTMLElement>(null);
  useDrawerDialog(open, dialogRef, triggerRef, onClose, backgroundRef);

  return (
    <>
      <button ref={triggerRef}>Buka menu</button>
      <main ref={backgroundRef}>Konten</main>
      {open && (
        <aside ref={dialogRef} tabIndex={-1} role="dialog">
          <button>Tutup menu</button>
          <a href="/dashboard">Dashboard</a>
        </aside>
      )}
    </>
  );
}

describe("useDrawerDialog", () => {
  let container: HTMLDivElement | undefined;
  let root: ReturnType<typeof createRoot> | undefined;

  afterEach(() => {
    act(() => root?.unmount());
    container?.remove();
    document.body.style.overflow = "";
    vi.unstubAllGlobals();
  });

  it("locks scroll, traps focus, closes on Escape, and restores trigger focus", () => {
    (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
      callback(0);
      return 0;
    });
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);
    const onClose = vi.fn();

    act(() => root?.render(<TestDrawer open onClose={onClose} />));

    const dialog = container.querySelector<HTMLElement>("[role='dialog']")!;
    const closeButton = dialog.querySelector<HTMLButtonElement>("button")!;
    const lastFocusable = dialog.querySelector<HTMLAnchorElement>("a")!;
    const trigger = container.querySelector<HTMLButtonElement>("button")!;

    expect(document.body.style.overflow).toBe("hidden");
    expect(document.activeElement).toBe(dialog);

    lastFocusable.focus();
    act(() => document.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab", bubbles: true })));
    expect(document.activeElement).toBe(closeButton);

    act(() => document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true })));
    expect(onClose).toHaveBeenCalledOnce();

    act(() => root?.render(<TestDrawer open={false} onClose={onClose} />));
    expect(document.body.style.overflow).toBe("");
    expect(document.activeElement).toBe(trigger);
  });
});
