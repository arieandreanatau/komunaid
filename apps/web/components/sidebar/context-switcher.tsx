"use client";

import { useState, useRef, useCallback } from "react";
import { useContextStore, type CommunityContext } from "./context-store";
import { useAuth } from "@/components/auth-provider";
import { Avatar } from "@/components/ui/avatar";

interface ContextSwitcherProps {
  collapsed?: boolean;
}

const ROLE_LABELS: Record<string, string> = {
  OWNER: "Pemilik",
  ADMIN: "Admin",
  EVENT_MANAGER: "Manajer Event",
  VOLUNTEER_COORDINATOR: "Koordinator Volunteer",
  OFFICER: "Officer",
  MEMBER: "Member",
};

export function ContextSwitcher({ collapsed = false }: ContextSwitcherProps) {
  const { user } = useAuth();
  const { activeContextType, activeCommunity, managedCommunities, setActiveContext } = useContextStore();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const panelRef = useRef<HTMLDivElement>(null);

  const handleSelect = useCallback((type: "personal" | "community", community?: CommunityContext) => {
    setActiveContext(type, community);
    setIsOpen(false);
    setSearch("");
  }, [setActiveContext]);

  const filteredCommunities = managedCommunities.filter((c) =>
    search.trim() ? c.name.toLowerCase().includes(search.toLowerCase()) : true
  );

  const isActive = (type: "personal" | "community", communityId?: string) => {
    if (type === "personal" && activeContextType === "personal") return true;
    if (type === "community" && activeContextType === "community" && activeCommunity?.id === communityId) return true;
    return false;
  };

  if (collapsed) {
    return (
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex h-10 w-full items-center justify-center rounded-lg transition-colors hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-komuna-blue"
          title={activeContextType === "personal" ? "Personal" : activeCommunity?.name || "Context"}
          aria-label="Ganti context"
          aria-expanded={isOpen}
        >
          {activeContextType === "personal" ? (
            <Avatar src={user?.avatar} name={user?.name || ""} size="sm" />
          ) : activeCommunity?.logo ? (
            <img src={activeCommunity.logo} alt="" className="h-8 w-8 rounded-lg object-cover" />
          ) : (
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-komuna-blue/10 text-xs font-bold text-komuna-blue">
              {activeCommunity?.name?.charAt(0) || "C"}
            </span>
          )}
        </button>
        {isOpen && (
          <ContextDropdown
            ref={panelRef}
            user={user}
            managedCommunities={filteredCommunities}
            search={search}
            onSearchChange={setSearch}
            onSelect={handleSelect}
            onClose={() => { setIsOpen(false); setSearch(""); }}
            isActive={isActive}
            align="left"
          />
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full rounded-xl border border-slate-200 bg-white p-3 text-left transition-all hover:border-komuna-blue/30 hover:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-komuna-blue"
        aria-label="Ganti context"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <div className="flex items-center gap-3">
          {activeContextType === "personal" ? (
            <Avatar src={user?.avatar} name={user?.name || ""} size="md" />
          ) : activeCommunity?.logo ? (
            <img src={activeCommunity.logo} alt="" className="h-10 w-10 rounded-lg object-cover" />
          ) : (
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-komuna-blue/10 text-sm font-bold text-komuna-blue">
              {activeCommunity?.name?.charAt(0) || "C"}
            </span>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-komuna-navy">
              {activeContextType === "personal" ? "Personal" : activeCommunity?.name || "Komunitas"}
            </p>
            <p className="truncate text-xs text-slate-500">
              {activeContextType === "personal"
                ? "Personal Workspace"
                : ROLE_LABELS[activeCommunity?.role || ""] || activeCommunity?.role || "Member"}
            </p>
          </div>
          <svg className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {isOpen && (
        <ContextDropdown
          ref={panelRef}
          user={user}
          managedCommunities={filteredCommunities}
          search={search}
          onSearchChange={setSearch}
          onSelect={handleSelect}
          onClose={() => { setIsOpen(false); setSearch(""); }}
          isActive={isActive}
          align="right"
        />
      )}
    </div>
  );
}

import { forwardRef } from "react";

interface ContextDropdownProps {
  user: { name?: string; avatar?: string | null } | null;
  managedCommunities: CommunityContext[];
  search: string;
  onSearchChange: (v: string) => void;
  onSelect: (type: "personal" | "community", community?: CommunityContext) => void;
  onClose: () => void;
  isActive: (type: "personal" | "community", communityId?: string) => boolean;
  align: "left" | "right";
}

const ContextDropdown = forwardRef<HTMLDivElement, ContextDropdownProps>(
  function ContextDropdown({ user, managedCommunities, search, onSearchChange, onSelect, onClose, isActive, align }, ref) {
    return (
      <div
        ref={ref}
        className={`absolute top-full z-50 mt-2 w-72 rounded-xl border border-slate-200 bg-white shadow-xl ${align === "right" ? "right-0" : "left-0"}`}
        role="listbox"
        aria-label="Pilih context"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-slate-100 p-3">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">Switch Context</p>
          <div className="relative">
            <svg className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Cari komunitas..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-3 text-xs text-slate-700 placeholder-slate-400 focus:border-komuna-blue focus:bg-white focus:outline-none focus:ring-1 focus:ring-komuna-blue"
              autoFocus
            />
          </div>
        </div>

        <div className="max-h-64 overflow-y-auto p-1.5">
          <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">Personal</p>
          <button
            type="button"
            role="option"
            aria-selected={isActive("personal")}
            onClick={() => onSelect("personal")}
            className={`flex w-full items-center gap-3 rounded-lg px-2.5 py-2.5 text-left transition-colors ${
              isActive("personal")
                ? "bg-komuna-blue/10 text-komuna-blue"
                : "text-slate-700 hover:bg-slate-50"
            }`}
          >
            <Avatar src={user?.avatar} name={user?.name || ""} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{user?.name || "Personal"}</p>
              <p className="truncate text-xs text-slate-500">Personal Workspace</p>
            </div>
            {isActive("personal") && (
              <svg className="h-4 w-4 shrink-0 text-komuna-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>

          {managedCommunities.length > 0 && (
            <>
              <div className="my-2 border-t border-slate-100" />
              <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">Komunitas</p>
              {managedCommunities.map((community) => (
                <button
                  key={community.id}
                  type="button"
                  role="option"
                  aria-selected={isActive("community", community.id)}
                  onClick={() => onSelect("community", community)}
                  className={`flex w-full items-center gap-3 rounded-lg px-2.5 py-2.5 text-left transition-colors ${
                    isActive("community", community.id)
                      ? "bg-komuna-blue/10 text-komuna-blue"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {community.logo ? (
                    <img src={community.logo} alt="" className="h-8 w-8 rounded-lg object-cover" />
                  ) : (
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-komuna-blue to-komuna-teal text-xs font-bold text-white">
                      {community.name.charAt(0)}
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{community.name}</p>
                    <p className="truncate text-xs text-slate-500">
                      {ROLE_LABELS[community.role] || community.role}
                    </p>
                  </div>
                  {isActive("community", community.id) && (
                    <svg className="h-4 w-4 shrink-0 text-komuna-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              ))}
            </>
          )}
        </div>

        <div className="border-t border-slate-100 p-1.5">
          <button
            type="button"
            onClick={() => onSelect("personal")}
            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Kelola Komunitas
          </button>
        </div>
      </div>
    );
  }
);
