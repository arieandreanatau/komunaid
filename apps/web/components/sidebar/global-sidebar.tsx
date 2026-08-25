"use client";

import { useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/components/auth-provider";
import { useContextStore, type CommunityContext } from "./context-store";
import {
  getPersonalNavigation,
  getCommunityNavigation,
  type NavSection,
} from "./navigation";
import { ContextSwitcher } from "./context-switcher";
import { api } from "@/lib/api";

const SIDEBAR_COLLAPSE_KEY = "komuna-sidebar-collapsed";

interface UserProfile {
  name: string;
  avatar?: string | null;
  roles: string[];
  communities?: (CommunityContext & { role: string })[];
}

function SidebarIcon({ path, className = "h-5 w-5" }: { path: string; className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={path} />
    </svg>
  );
}

export function GlobalSidebar({
  onMobileClose,
  isMobile = false,
}: {
  onMobileClose?: () => void;
  isMobile?: boolean;
}) {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  const {
    activeContextType,
    activeCommunity,
    sidebarCollapsed,
    setManagedCommunities,
    toggleSidebarCollapsed,
    setSidebarCollapsed,
  } = useContextStore();

  const { data: profile } = useQuery<UserProfile>({
    queryKey: ["profile"],
    enabled: isAuthenticated,
    queryFn: async () => {
      const response = await api.get("/users/profile");
      return response.data.data?.user || response.data.user;
    },
  });

  useEffect(() => {
    const match = pathname.match(/^\/dashboard\/communities\/([^/]+)/);
    if (!match || !profile?.communities) return;
    const community = profile.communities.find((item) => item.id === match[1]);
    if (community && (activeContextType !== "community" || activeCommunity?.id !== community.id)) {
      useContextStore.getState().setActiveContext("community", {
        id: community.id,
        name: community.name,
        slug: community.slug,
        logo: community.logo ?? null,
        role: community.role,
      });
    }
  }, [pathname, profile, activeContextType, activeCommunity?.id]);

  useEffect(() => {
    if (profile?.communities) {
      const managed = profile.communities.filter((c) =>
        ["OWNER", "ADMIN", "EVENT_MANAGER", "VOLUNTEER_COORDINATOR", "OFFICER"].includes(c.role)
      ).map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        logo: c.logo ?? null,
        role: c.role,
      }));
      setManagedCommunities(managed);
    }
  }, [profile, setManagedCommunities]);

  useEffect(() => {
    if (isMobile) return;
    try {
      const stored = localStorage.getItem(SIDEBAR_COLLAPSE_KEY);
      if (stored !== null) {
        setSidebarCollapsed(stored === "true");
      }
    } catch {}
  }, [isMobile, setSidebarCollapsed]);

  const handleNavClick = useCallback(() => {
    if (isMobile && onMobileClose) {
      onMobileClose();
    }
  }, [isMobile, onMobileClose]);

  const navigationSections: NavSection[] = activeContextType === "community" && activeCommunity
    ? getCommunityNavigation(activeCommunity.slug, activeCommunity.role)
    : getPersonalNavigation();

  const allSections = [...navigationSections];

  const activeHref = allSections
    .flatMap((section) => section.items)
    .filter((item) => pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`)))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;

  const collapsed = isMobile ? false : sidebarCollapsed;

  const renderNavItem = (item: { href: string; label: string; icon: string; badge?: number }) => {
    const isActive = item.href === activeHref;

    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={handleNavClick}
        className={`group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-komuna-blue focus-visible:ring-offset-1 ${
          collapsed ? "justify-center px-2" : ""
        } ${
          isActive
            ? "bg-komuna-blue/10 text-komuna-blue"
            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
        }`}
        title={collapsed ? item.label : undefined}
        aria-label={collapsed ? item.label : undefined}
        aria-current={isActive ? "page" : undefined}
      >
        <SidebarIcon path={item.icon} className="h-5 w-5 shrink-0" />
        {!collapsed && <span className="truncate">{item.label}</span>}
        {!collapsed && typeof item.badge === "number" && item.badge > 0 && (
          <span className="ml-auto flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold leading-none text-white">
            {item.badge > 99 ? "99+" : item.badge}
          </span>
        )}
        {collapsed && typeof item.badge === "number" && item.badge > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold leading-none text-white ring-2 ring-white">
            {item.badge > 99 ? "99+" : item.badge}
          </span>
        )}
        {collapsed && (
          <div className="pointer-events-none absolute left-full z-50 ml-2 hidden rounded-lg bg-komuna-navy px-3 py-1.5 text-xs font-medium text-white shadow-lg group-hover:block whitespace-nowrap">
            {item.label}
            <div className="absolute left-0 top-1/2 -ml-1 -translate-y-1/2 border-4 border-transparent border-r-komuna-navy" />
          </div>
        )}
      </Link>
    );
  };

  const sidebarContent = (
    <>
      <nav className={`flex-1 overflow-y-auto py-3 ${collapsed ? "px-2" : "px-3"}`} aria-label="Navigasi dashboard">
        <div className="space-y-5">
          {allSections.map((section) => (
            <div key={section.id}>
              {section.label && !collapsed && (
                <h3 className="mb-1 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {section.label}
                </h3>
              )}
              {section.label && collapsed && (
                <div className="mx-auto mb-1 h-px w-4 bg-slate-200" aria-hidden="true" />
              )}
              <div className="space-y-0.5">
                {section.items.map((item) => renderNavItem({ href: item.href, label: item.label, icon: item.icon, badge: item.badge }))}
              </div>
            </div>
          ))}
        </div>
      </nav>
    </>
  );

  if (isMobile) {
    return (
      <div className="flex h-full min-w-0 flex-col bg-white">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <Link href="/" className="flex items-center gap-2" onClick={handleNavClick}>
            <img src="/icon_komuna.png" alt="KomunaID" className="h-6 w-6" />
            <span className="font-display text-base font-semibold text-komuna-dark">KomunaID</span>
          </Link>
          <button
            type="button"
            aria-label="Tutup menu"
            onClick={onMobileClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="border-b border-slate-100 p-3">
          <ContextSwitcher />
        </div>

        {sidebarContent}
      </div>
    );
  }

  return (
    <aside
      className={`sticky top-0 hidden h-screen shrink-0 flex-col border-r border-slate-200 bg-white transition-all duration-200 lg:flex ${
        collapsed ? "w-[68px]" : "w-72 xl:w-80 2xl:w-[20rem]"
      }`}
      aria-label="Sidebar global"
    >
      <div className={`flex items-center border-b border-slate-100 ${collapsed ? "justify-center px-2 py-3" : "justify-between px-3 py-3"}`}>
        {!collapsed && (
          <Link href="/" className="flex items-center gap-2">
            <img src="/icon_komuna.png" alt="KomunaID" className="h-7 w-7" />
            <span className="font-display text-lg font-semibold text-komuna-dark">KomunaID</span>
          </Link>
        )}
        {collapsed && (
          <Link href="/" aria-label="KomunaID Beranda">
            <img src="/icon_komuna.png" alt="KomunaID" className="h-7 w-7" />
          </Link>
        )}
        {!collapsed && (
          <button
            type="button"
            onClick={toggleSidebarCollapsed}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-komuna-blue"
            aria-label="Sembunyikan sidebar"
            title="Sembunyikan sidebar"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>
        )}
        {collapsed && (
          <button
            type="button"
            onClick={toggleSidebarCollapsed}
            className="absolute -right-3 top-16 z-10 hidden h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-komuna-blue lg:flex"
            aria-label="Perluas sidebar"
            title="Perluas sidebar"
          >
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>

      <div className={`border-b border-slate-100 ${collapsed ? "px-2 py-2" : "px-4 py-4"}`}>
        <ContextSwitcher collapsed={collapsed} />
      </div>

      {sidebarContent}
    </aside>
  );
}
