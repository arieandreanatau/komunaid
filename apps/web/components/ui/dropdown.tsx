"use client";

import { useState, useRef, useCallback } from "react";
import { useClickOutside } from "@/hooks/useClickOutside";

interface DropdownItem {
  label: string;
  value: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  danger?: boolean;
}

interface DropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  onSelect: (value: string) => void;
  align?: "left" | "right";
  className?: string;
}

export function Dropdown({ trigger, items, onSelect, align = "left", className = "" }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useClickOutside(ref, () => setOpen(false), open);

  const handleSelect = useCallback(
    (value: string) => {
      onSelect(value);
      setOpen(false);
    },
    [onSelect]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        return;
      }
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        const items = ref.current?.querySelectorAll<HTMLElement>("[data-dropdown-item]");
        if (!items?.length) return;
        const focused = document.activeElement as HTMLElement;
        let idx = Array.from(items).indexOf(focused);
        if (e.key === "ArrowDown") idx = idx < items.length - 1 ? idx + 1 : 0;
        if (e.key === "ArrowUp") idx = idx > 0 ? idx - 1 : items.length - 1;
        items[idx]?.focus();
      }
    },
    []
  );

  return (
    <div ref={ref} className={`relative inline-block ${className}`}>
      <div onClick={() => setOpen(!open)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setOpen(!open); } }}>
        {trigger}
      </div>
      {open && (
        <div
          role="menu"
          aria-orientation="vertical"
          className={`absolute mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50 focus:outline-none ${
            align === "right" ? "right-0" : "left-0"
          }`}
          onKeyDown={handleKeyDown}
        >
          {items.map((item) => (
            <button
              key={item.value}
              data-dropdown-item
              role="menuitem"
              disabled={item.disabled}
              onClick={() => !item.disabled && handleSelect(item.value)}
              className={`w-full flex items-center gap-2 px-4 py-2 text-sm transition-colors ${
                item.danger
                  ? "text-red-600 hover:bg-red-50"
                  : "text-gray-700 hover:bg-gray-50 hover:text-komuna-blue"
              } disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              {item.icon && <span className="h-4 w-4">{item.icon}</span>}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
