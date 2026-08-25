"use client";

import { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useContextStore, type CommunityContext } from "./context-store";
import { useAuth } from "@/components/auth-provider";
import { Avatar } from "@/components/ui/avatar";

interface ContextSwitcherProps {
  collapsed?: boolean;
}

const ROLE_LABELS: Record<string, string> = {
  OWNER: "Owner",
  ADMIN: "Admin",
  EVENT_MANAGER: "Manajer Event",
  VOLUNTEER_COORDINATOR: "Koordinator Volunteer",
  OFFICER: "Officer",
  MEMBER: "Member",
};

function ContextLogo({ src, name, size = "sm" }: { src?: string | null; name: string; size?: "sm" | "md" }) {
  const dims = size === "sm" ? "h-8 w-8" : "h-10 w-10";
  const text = size === "sm" ? "text-xs" : "text-sm";

  if (src) {
    return <img src={src} alt="" className={`${dims} rounded-lg object-cover flex-shrink-0`} />;
  }

  return (
    <span className={`flex ${dims} items-center justify-center rounded-lg bg-gradient-to-br from-komuna-blue to-komuna-teal ${text} font-bold text-white flex-shrink-0`}>
      {name.charAt(0).toUpperCase()}
    </span>
  );
}

function CheckIcon() {
  return (
    <svg className="h-4 w-4 shrink-0 text-komuna-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}

function EmptyStateIcon() {
  return (
    <svg className="h-10 w-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

export function ContextSwitcher({ collapsed = false }: ContextSwitcherProps) {
  const { user } = useAuth();
  const router = useRouter();
  const {
    activeContextType,
    activeCommunity,
    managedCommunities,
    recentlyUsedIds,
    setActiveContext,
  } = useContextStore();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const panelRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const recentlyUsed = useMemo(() => {
    return recentlyUsedIds
      .map((id) => managedCommunities.find((c) => c.id === id))
      .filter((c): c is CommunityContext => !!c);
  }, [recentlyUsedIds, managedCommunities]);

  const otherCommunities = useMemo(() => {
    const recentIds = new Set(recentlyUsedIds);
    return managedCommunities.filter((c) => !recentIds.has(c.id));
  }, [managedCommunities, recentlyUsedIds]);

  const searchResults = useMemo(() => {
    if (!search.trim()) return [];
    const q = search.toLowerCase();
    return managedCommunities.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (ROLE_LABELS[c.role] || c.role).toLowerCase().includes(q)
    );
  }, [managedCommunities, search]);

  const isSearching = search.trim().length > 0;

  const handleSelect = useCallback((type: "personal" | "community", community?: CommunityContext) => {
    setActiveContext(type, community);
    setIsOpen(false);
    setSearch("");
    if (type === "community" && community) {
      router.push(`/dashboard/communities/${community.slug}/overview`);
    } else if (type === "personal") {
      router.push("/dashboard");
    }
  }, [setActiveContext, router]);

  const handleOpen = useCallback(() => {
    setIsOpen(true);
    setTimeout(() => searchInputRef.current?.focus(), 50);
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setSearch("");
    triggerRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        handleClose();
      }
    };
    const keyHandler = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("keydown", keyHandler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("keydown", keyHandler);
    };
  }, [isOpen, handleClose]);

  const isActive = (type: "personal" | "community", communityId?: string) => {
    if (type === "personal" && activeContextType === "personal") return true;
    if (type === "community" && activeContextType === "community" && activeCommunity?.id === communityId) return true;
    return false;
  };

  const currentName = activeContextType === "personal"
    ? user?.name || "Personal"
    : activeCommunity?.name || "Komunitas";

  const currentRole = activeContextType === "personal"
    ? "Personal"
    : ROLE_LABELS[activeCommunity?.role || ""] || activeCommunity?.role || "Member";

  if (collapsed) {
    return (
      <div className="relative">
        <button
          ref={triggerRef}
          type="button"
          onClick={() => isOpen ? handleClose() : handleOpen()}
          className="flex h-10 w-full items-center justify-center rounded-lg transition-colors hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-komuna-blue"
          title={`${currentName} — ${currentRole}`}
          aria-label="Ganti context"
          aria-expanded={isOpen}
        >
          {activeContextType === "personal" ? (
            <Avatar src={user?.avatar} name={user?.name || ""} size="sm" />
          ) : (
            <ContextLogo src={activeCommunity?.logo} name={activeCommunity?.name || "C"} size="sm" />
          )}
        </button>
        {isOpen && (
          <ContextDropdown
            ref={panelRef}
            user={user}
            recentlyUsed={recentlyUsed}
            otherCommunities={otherCommunities}
            searchResults={searchResults}
            search={search}
            onSearchChange={setSearch}
            onSelect={handleSelect}
            isActive={isActive}
            isSearching={isSearching}
            align="left"
          />
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => isOpen ? handleClose() : handleOpen()}
        className="flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-white p-2.5 text-left transition-all hover:border-komuna-blue/30 hover:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-komuna-blue"
        aria-label="Ganti context"
        aria-expanded={isOpen}
        aria-haspopup="dialog"
      >
        {activeContextType === "personal" ? (
          <Avatar src={user?.avatar} name={user?.name || ""} size="md" />
        ) : (
          <ContextLogo src={activeCommunity?.logo} name={activeCommunity?.name || "C"} size="md" />
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-komuna-navy leading-tight">{currentName}</p>
          <p className="truncate text-xs text-slate-500 leading-tight mt-0.5">{currentRole}</p>
        </div>
        <ChevronIcon open={isOpen} />
      </button>

      {isOpen && (
        <ContextDropdown
          ref={panelRef}
          user={user}
          recentlyUsed={recentlyUsed}
          otherCommunities={otherCommunities}
          searchResults={searchResults}
          search={search}
          onSearchChange={setSearch}
          onSelect={handleSelect}
          isActive={isActive}
          isSearching={isSearching}
          align="right"
        />
      )}
    </div>
  );
}

import { forwardRef } from "react";

interface ContextDropdownProps {
  user: { name?: string; avatar?: string | null; username?: string } | null;
  recentlyUsed: CommunityContext[];
  otherCommunities: CommunityContext[];
  searchResults: CommunityContext[];
  search: string;
  onSearchChange: (v: string) => void;
  onSelect: (type: "personal" | "community", community?: CommunityContext) => void;
  isActive: (type: "personal" | "community", communityId?: string) => boolean;
  isSearching: boolean;
  align: "left" | "right";
}

function CommunityRow({
  community,
  active,
  onClick,
}: {
  community: CommunityContext;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="option"
      aria-selected={active}
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors ${
        active
          ? "bg-komuna-blue/5 text-komuna-blue"
          : "text-slate-700 hover:bg-slate-50"
      }`}
    >
      <ContextLogo src={community.logo} name={community.name} size="sm" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold leading-tight">{community.name}</p>
        <p className="truncate text-xs text-slate-500 leading-tight mt-0.5">
          {ROLE_LABELS[community.role] || community.role}
        </p>
      </div>
      {active ? (
        <CheckIcon />
      ) : (
        <svg className="h-4 w-4 shrink-0 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      )}
    </button>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-2.5 pt-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
      {children}
    </p>
  );
}

const ContextDropdown = forwardRef<HTMLDivElement, ContextDropdownProps>(
  function ContextDropdown({
    user,
    recentlyUsed,
    otherCommunities,
    searchResults,
    search,
    onSearchChange,
    onSelect,
    isActive,
    isSearching,
    align,
  }, ref) {
    return (
      <div
        ref={ref}
        className={`absolute top-full z-50 mt-2 w-[min(20rem,calc(100vw-1.5rem))] max-w-[calc(100vw-1.5rem)] rounded-xl border border-slate-200 bg-white shadow-xl ${align === "right" ? "right-0" : "left-0"}`}
        role="dialog"
        aria-label="Switch Context"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2.5">
          <p className="text-xs font-bold text-komuna-navy">Switch Context</p>
          <button
            type="button"
            onClick={() => {
              document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
            }}
            className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            aria-label="Tutup"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-3 pt-3 pb-1">
          <div className="relative">
            <SearchIcon />
            <input
              ref={(el) => { if (el) (globalThis as Record<string, unknown>).__ctxSearchInput = el; }}
              type="text"
              placeholder="Cari komunitas yang Anda kelola..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-8 text-sm text-slate-700 placeholder-slate-400 focus:border-komuna-blue focus:bg-white focus:outline-none focus:ring-1 focus:ring-komuna-blue transition-colors"
              autoFocus
            />
            {search.trim() && (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-slate-400 hover:text-slate-600 transition-colors"
                aria-label="Hapus pencarian"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        <div className="max-h-72 overflow-y-auto px-1.5 pb-1.5">
          {isSearching ? (
            <SearchResults
              results={searchResults}
              isActive={isActive}
              onSelect={onSelect}
            />
          ) : (
            <DefaultView
              user={user}
              recentlyUsed={recentlyUsed}
              otherCommunities={otherCommunities}
              isActive={isActive}
              onSelect={onSelect}
            />
          )}
        </div>

        {!isSearching && (
          <div className="border-t border-slate-100 px-3 py-2">
            <Link
              href="/dashboard/communities"
              className="flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700"
            >
              Lihat semua komunitas
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        )}
      </div>
    );
  }
);

function DefaultView({
  user,
  recentlyUsed,
  otherCommunities,
  isActive,
  onSelect,
}: {
  user: { name?: string; avatar?: string | null } | null;
  recentlyUsed: CommunityContext[];
  otherCommunities: CommunityContext[];
  isActive: (type: "personal" | "community", communityId?: string) => boolean;
  onSelect: (type: "personal" | "community", community?: CommunityContext) => void;
}) {
  return (
    <>
      <SectionLabel>Personal</SectionLabel>
      <button
        type="button"
        role="option"
        aria-selected={isActive("personal")}
        onClick={() => onSelect("personal")}
        className={`flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors ${
          isActive("personal")
            ? "bg-komuna-blue/5 text-komuna-blue"
            : "text-slate-700 hover:bg-slate-50"
        }`}
      >
        <Avatar src={user?.avatar} name={user?.name || ""} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold leading-tight">{user?.name || "Personal"}</p>
          <p className="truncate text-xs text-slate-500 leading-tight mt-0.5">Personal</p>
        </div>
        {isActive("personal") && <CheckIcon />}
      </button>

      {recentlyUsed.length > 0 && (
        <>
          <SectionLabel>Terakhir Digunakan</SectionLabel>
          {recentlyUsed.map((community) => (
            <CommunityRow
              key={community.id}
              community={community}
              active={isActive("community", community.id)}
              onClick={() => onSelect("community", community)}
            />
          ))}
        </>
      )}

      {otherCommunities.length > 0 && (
        <>
          <SectionLabel>Komunitas Saya</SectionLabel>
          {otherCommunities.map((community) => (
            <CommunityRow
              key={community.id}
              community={community}
              active={isActive("community", community.id)}
              onClick={() => onSelect("community", community)}
            />
          ))}
        </>
      )}

      {recentlyUsed.length === 0 && otherCommunities.length === 0 && (
        <div className="px-2.5 py-6 text-center">
          <p className="text-xs text-slate-400">Anda belum mengelola komunitas.</p>
        </div>
      )}
    </>
  );
}

function SearchResults({
  results,
  isActive,
  onSelect,
}: {
  results: CommunityContext[];
  isActive: (type: "personal" | "community", communityId?: string) => boolean;
  onSelect: (type: "personal" | "community", community?: CommunityContext) => void;
}) {
  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center px-3 py-10 text-center">
        <EmptyStateIcon />
        <p className="mt-3 text-sm font-semibold text-slate-700">Komunitas tidak ditemukan</p>
        <p className="mt-1 text-xs text-slate-500 max-w-[220px]">
          Tidak ada komunitas yang cocok dengan pencarian Anda.
        </p>
        <button
          type="button"
          onClick={() => {
            const input = document.querySelector<HTMLInputElement>('[aria-label="Switch Context"] input[type="text"]');
            if (input) {
              const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
              nativeInputValueSetter?.call(input, "");
              input.dispatchEvent(new Event("input", { bubbles: true }));
            }
          }}
          className="mt-3 text-xs font-medium text-komuna-blue hover:text-komuna-navy transition-colors"
        >
          Hapus pencarian
        </button>
      </div>
    );
  }

  return (
    <>
      <SectionLabel>Hasil Komunitas</SectionLabel>
      {results.map((community) => (
        <CommunityRow
          key={community.id}
          community={community}
          active={isActive("community", community.id)}
          onClick={() => onSelect("community", community)}
        />
      ))}
      <p className="px-2.5 pt-2 pb-1 text-[11px] text-slate-400">
        {results.length} komunitas ditemukan
      </p>
    </>
  );
}
