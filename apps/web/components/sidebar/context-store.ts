"use client";

import { create } from "zustand";

export type ContextType = "personal" | "community";

export interface CommunityContext {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
  role: string;
}

const MAX_RECENTLY_USED = 5;

interface ContextState {
  activeContextType: ContextType;
  activeCommunity: CommunityContext | null;
  managedCommunities: CommunityContext[];
  recentlyUsedIds: string[];
  sidebarCollapsed: boolean;
  setActiveContext: (type: ContextType, community?: CommunityContext) => void;
  setManagedCommunities: (communities: CommunityContext[]) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebarCollapsed: () => void;
}

const STORAGE_KEY = "komuna-sidebar-context";
const COLLAPSE_KEY = "komuna-sidebar-collapsed";
const RECENTLY_USED_KEY = "komuna-recently-used-contexts";

function getInitialCollapsed(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(COLLAPSE_KEY) === "true";
  } catch {
    return false;
  }
}

function getInitialContext(): { type: ContextType; community: CommunityContext | null } {
  if (typeof window === "undefined") return { type: "personal", community: null };
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed && typeof parsed === "object") {
        if (parsed.type === "community" && parsed.community) {
          return { type: "community", community: parsed.community };
        }
      }
    }
  } catch {}
  return { type: "personal", community: null };
}

function getInitialRecentlyUsed(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(RECENTLY_USED_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed.slice(0, MAX_RECENTLY_USED);
    }
  } catch {}
  return [];
}

function saveRecentlyUsed(ids: string[]) {
  try {
    localStorage.setItem(RECENTLY_USED_KEY, JSON.stringify(ids));
  } catch {}
}

export const useContextStore = create<ContextState>((set) => {
  const initial = getInitialContext();
  return {
    activeContextType: initial.type,
    activeCommunity: initial.community,
    managedCommunities: [],
    recentlyUsedIds: getInitialRecentlyUsed(),
    sidebarCollapsed: getInitialCollapsed(),

    setActiveContext: (type, community) => {
      set({ activeContextType: type, activeCommunity: community || null });
      try {
        if (type === "community" && community) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify({ type, community }));
          set((state) => {
            const next = [community.id, ...state.recentlyUsedIds.filter((id) => id !== community.id)].slice(0, MAX_RECENTLY_USED);
            saveRecentlyUsed(next);
            return { recentlyUsedIds: next };
          });
        } else {
          localStorage.setItem(STORAGE_KEY, JSON.stringify({ type: "personal", community: null }));
        }
      } catch {}
    },

    setManagedCommunities: (communities) => {
      set({ managedCommunities: communities });
    },

    setSidebarCollapsed: (collapsed) => {
      set({ sidebarCollapsed: collapsed });
      try {
        localStorage.setItem(COLLAPSE_KEY, String(collapsed));
      } catch {}
    },

    toggleSidebarCollapsed: () => {
      set((state) => {
        const next = !state.sidebarCollapsed;
        try {
          localStorage.setItem(COLLAPSE_KEY, String(next));
        } catch {}
        return { sidebarCollapsed: next };
      });
    },
  };
});
