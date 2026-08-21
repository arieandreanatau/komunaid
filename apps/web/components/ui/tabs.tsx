"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

interface TabsContextValue {
  value: string;
  setValue: (value: string) => void;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabs() {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error("Tabs components must be used within <Tabs>");
  return ctx;
}

interface TabsProps {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: ReactNode;
  className?: string;
}

export function Tabs({
  defaultValue = "",
  value,
  onValueChange,
  children,
  className,
}: TabsProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const controlled = value !== undefined;
  const activeValue = controlled ? value : internalValue;

  const setValue = (next: string) => {
    if (controlled) {
      onValueChange?.(next);
    } else {
      setInternalValue(next);
      onValueChange?.(next);
    }
  };

  return (
    <TabsContext.Provider value={{ value: activeValue, setValue }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      role="tablist"
      className={cn("flex gap-1 bg-gray-100 rounded-lg p-1", className)}
    >
      {children}
    </div>
  );
}

interface TabsTriggerProps {
  value: string;
  children: ReactNode;
  className?: string;
}

export function TabsTrigger({ value, children, className }: TabsTriggerProps) {
  const { value: activeValue, setValue } = useTabs();
  const active = activeValue === value;
  return (
    <button
      role="tab"
      aria-selected={active}
      onClick={() => setValue(value)}
      className={cn(
        "flex-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
        active
          ? "bg-white text-komuna-blue shadow-sm"
          : "text-gray-500 hover:text-gray-700",
        className
      )}
    >
      {children}
    </button>
  );
}

export function TabsContent({
  value,
  children,
  className,
}: {
  value: string;
  children: ReactNode;
  className?: string;
}) {
  const { value: activeValue } = useTabs();
  if (activeValue !== value) return null;
  return <div className={className}>{children}</div>;
}
