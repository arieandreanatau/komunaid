"use client";

import { useEffect, useCallback, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/components/auth-provider";
import { Avatar } from "@/components/ui/avatar";
import { useContextStore, type CommunityContext } from "./context-store";
import {
  getPersonalNavigation,
  getCommunityNavigation,
  getSupportingNavigation,
  getCommunitySupportingNavigation,
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
  const { user, isAuthenticated, isLoading } = useAuth();
  const {
    activeContextType,
    activeCommunity,
    managedCommunities,
    sidebarCollapsed,
    setManagedCommunities,
    toggleSidebarCollapsed,
    setSidebarCollapsed,
  } = useContextStore();

  const [unreadCount, setUnreadCount] = useState(0);

  const { data: profile } = useQuery<UserProfile>({
    queryKey: ["profile"],
    enabled: isAuthenticated,
    queryFn: async () => {
      const response = await api.get("/users/profile");
      return response.data.data?.user || response.data.user;
    },
  });

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
    if (!isAuthenticated) return;
    api.get("/users/notifications?unread=true&page=1&limit=1")
      .then((res) => setUnreadCount(res.data.pagination?.total ?? 0))
      .catch(() => {});
  }, [isAuthenticated]);

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
    ? getCommunityNavigation(activeCommunity.id, activeCommunity.role)
    : getPersonalNavigation();

  const supportingSections: NavSection[] = activeContextType === "community"
    ? getCommunitySupportingNavigation()
    : getSupportingNavigation();

  const allSections = [...navigationSections, ...supportingSections];

  const activeHref = allSections
    .flatMap((section) => section.items)
    .filter((item) => pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`)))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;

  const collapsed = isMobile ? false : sidebarCollapsed;

  const renderNavItem = (item: { href: string; label: string; icon: string; badge?: number }) => {
    const isActive = item.href === activeHref;
    const isBackToPersonal = item.label === "Kembali ke Personal";

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
        {isBackToPersonal && !collapsed && (
          <div className="absolute inset-x-3 -top-2 h-px bg-slate-200" aria-hidden="true" />
        )}
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
      <nav className={`flex-1 overflow-y-auto py-4 ${collapsed ? "px-2" : "px-3"}`} aria-label="Navigasi dashboard">
        <div className="space-y-6">
          {allSections.map((section) => (
            <div key={section.id}>
              {section.label && !collapsed && (
                <h3 className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  {section.label}
                </h3>
              )}
              {section.label && collapsed && (
                <div className="mx-auto mb-1.5 h-px w-4 bg-slate-200" aria-hidden="true" />
              )}
              <div className="space-y-0.5">
                {section.items.map((item) => renderNavItem({ href: item.href, label: item.label, icon: item.icon, badge: item.badge }))}
              </div>
            </div>
          ))}
        </div>
      </nav>

      {!collapsed && (
        <div className="border-t border-slate-100 p-4">
          <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4 max-xl:hidden">
            <p className="text-sm font-bold text-komuna-navy">
              {activeContextType === "personal" ? "Mulai Berkontribusi" : activeCommunity?.name || "Komunitas"}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              {activeContextType === "personal"
                ? "Buat komunitas atau bergabung dengan komunitas yang sesuai dengan minatmu."
                : activeCommunity?.role === "OWNER" || activeCommunity?.role === "ADMIN"
                  ? "Kelola komunitas Anda dengan efektif."
                  : "Berkontribusi untuk komunitas Anda."}
            </p>
            <div className="mt-3 flex flex-col gap-2">
              {activeContextType === "personal" ? (
                <Link
                  href="/communities/create"
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-komuna-blue px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-komuna-navy"
                  onClick={handleNavClick}
                >
                  Buat Komunitas
                </Link>
              ) : (
                <Link
                  href={`/communities/${activeCommunity?.slug || ""}`}
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-komuna-blue px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-komuna-navy"
                  onClick={handleNavClick}
                >
                  Lihat Komunitas
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );

  if (isMobile) {
    return (
      <div className="flex h-full flex-col bg-white">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <div className="flex items-center gap-3">
            <Avatar src={user?.avatar} name={user?.name || ""} size="sm" />
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-komuna-navy">{user?.name || "Member"}</p>
              <p className="truncate text-xs text-slate-500">Member</p>
            </div>
          </div>
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
      className={`sticky top-0 hidden h-screen flex-col border-r border-slate-200 bg-white transition-all duration-200 lg:flex ${
        collapsed ? "w-[68px]" : "w-64"
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

      <div className={`border-b border-slate-100 ${collapsed ? "px-2 py-2" : "px-3 py-3"}`}>
        {!collapsed && (
          <p className="mb-2 px-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">Context</p>
        )}
        <ContextSwitcher collapsed={collapsed} />
      </div>

      {sidebarContent}
    </aside>
  );
}
