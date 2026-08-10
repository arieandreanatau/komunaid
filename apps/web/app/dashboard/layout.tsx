"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/components/auth-provider";
import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

interface Community {
  id: string;
  name: string;
  slug: string;
  status: string;
}

interface Organization {
  id: string;
  name: string;
  slug: string;
  status: string;
}

interface UserProfile {
  communities: (Community & { role: string })[];
  organizations: (Organization & { role: string })[];
}

interface SidebarItem {
  href: string;
  label: string;
  icon: string;
  badge?: number;
}

interface SidebarSection {
  id: string;
  label?: string;
  items: SidebarItem[];
}

const SIDEBAR_COLLAPSE_KEY = "komuna-dashboard-sidebar-collapsed";

function SidebarIcon({ path, className = "h-5 w-5" }: { path: string; className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={path} />
    </svg>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [approvedCommunity, setApprovedCommunity] = useState<Community | null>(null);
  const [approvedOrganization, setApprovedOrganization] = useState<Organization | null>(null);
  const sidebarRef = useRef<HTMLElement>(null);
  const { data: unreadCount = 0 } = useQuery<number>({
    queryKey: ["notifications", "unread-count"],
    enabled: isAuthenticated,
    queryFn: async () => {
      const res = await api.get("/users/notifications?unread=true&page=1&limit=1");
      return res.data.pagination?.total ?? 0;
    },
    refetchInterval: 60000,
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(SIDEBAR_COLLAPSE_KEY);
      if (stored !== null) {
        setCollapsed(stored === "true");
      }
    } catch {}
  }, []);

  const toggleCollapsed = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(SIDEBAR_COLLAPSE_KEY, String(next));
      } catch {}
      return next;
    });
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      if (isAuthenticated) {
        try {
          const response = await api.get("/users/profile");
          const profile: UserProfile = response.data.data?.user || response.data.user;
          const ownedApproved = profile.communities?.find(
            (c) => c.role === "OWNER" && c.status === "APPROVED"
          );
          if (ownedApproved) {
            setApprovedCommunity(ownedApproved);
          }
          if (profile.organizations) {
            const ownedApprovedOrg = profile.organizations.find(
              (o) => o.role === "OWNER" && o.status === "APPROVED"
            );
            if (ownedApprovedOrg) {
              setApprovedOrganization(ownedApprovedOrg);
            }
          }
        } catch (error) {
          console.error("Failed to fetch profile:", error);
        }
      }
    };

    fetchProfile();
  }, [isAuthenticated]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSidebarOpen(false);
    };
    if (sidebarOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [sidebarOpen]);

  const baseSections: SidebarSection[] = [
    {
      id: "overview",
      items: [
        { href: "/dashboard", label: "Overview", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
      ],
    },
    {
      id: "komunitas",
      label: "Komunitas",
      items: [
        { href: "/dashboard/communities", label: "Komunitas Saya", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" },
        { href: "/dashboard/my-submissions", label: "Pengajuan Komunitas", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
      ],
    },
    {
      id: "event",
      label: "Event",
      items: [
        { href: "/dashboard/events", label: "Event Saya", icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
      ],
    },
    {
      id: "aktivitas",
      label: "Aktivitas Saya",
      items: [
        { href: "/dashboard/profile", label: "Profil", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
        { href: "/dashboard/interests", label: "Minat Saya", icon: "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.958a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.367 2.446a1 1 0 00-.364 1.118l1.286 3.958c.3.921-.755 1.688-1.539 1.118l-3.367-2.446a1 1 0 00-1.176 0l-3.367 2.446c-.783.57-1.838-.197-1.539-1.118l1.286-3.958a1 1 0 00-.364-1.118L4.06 9.385c-.783-.57-.38-1.81.588-1.81H8.81a1 1 0 00.951-.69l1.287-3.958z" },
        { href: "/dashboard/notifications", label: "Notifikasi", icon: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9", badge: unreadCount },
        { href: "/dashboard/activity", label: "Aktivitas", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
      ],
    },
    {
      id: "pengaturan",
      label: "Pengaturan",
      items: [
        { href: "/dashboard/settings", label: "Pengaturan", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" },
      ],
    },
  ];

  const communityManagementSection: SidebarSection = {
    id: "community-mgmt",
    label: "Komunitas Saya",
    items: approvedCommunity
      ? [
          { href: `/dashboard/communities/${approvedCommunity.id}`, label: "Dasbor Komunitas", icon: "M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" },
          { href: `/communities/${approvedCommunity.slug}/members`, label: "Anggota Komunitas", icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" },
          { href: `/communities/${approvedCommunity.slug}/settings`, label: "Pengaturan Komunitas", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" },
          { href: `/communities/${approvedCommunity.slug}`, label: "Detail Komunitas", icon: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
          { href: "/events", label: "Acara", icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
          { href: "/dashboard/volunteer", label: "Volunteer Saya", icon: "M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" },
        ]
      : [],
  };

  const organizationManagementSection: SidebarSection = {
    id: "org-mgmt",
    label: "Organisasi Saya",
    items: approvedOrganization
      ? [
          { href: `/dashboard/organizations/${approvedOrganization.id}`, label: "Dasbor Organisasi", icon: "M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" },
          { href: `/organizations/${approvedOrganization.slug}`, label: "Detail Organisasi", icon: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
        ]
      : [],
  };

  const allSections = [
    ...baseSections,
    ...(communityManagementSection.items.length > 0 ? [communityManagementSection] : []),
    ...(organizationManagementSection.items.length > 0 ? [organizationManagementSection] : []),
  ];

  const renderSidebarItem = (item: SidebarItem, isCollapsed: boolean) => {
    const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={() => setSidebarOpen(false)}
        className={`relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
          isCollapsed ? "justify-center px-2" : ""
        } ${
          isActive
            ? "bg-komuna-blue/10 text-komuna-blue"
            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
        }`}
        title={isCollapsed ? item.label : undefined}
        aria-label={isCollapsed ? item.label : undefined}
      >
        <SidebarIcon path={item.icon} className="h-5 w-5 shrink-0" />
        {!isCollapsed && <span className="truncate">{item.label}</span>}
        {!isCollapsed && typeof item.badge === "number" && item.badge > 0 && (
          <span className="ml-auto flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold leading-none text-white">
            {item.badge > 99 ? "99+" : item.badge}
          </span>
        )}
        {isCollapsed && typeof item.badge === "number" && item.badge > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold leading-none text-white ring-2 ring-white">
            {item.badge > 99 ? "99+" : item.badge}
          </span>
        )}
      </Link>
    );
  };

  const renderSidebarContent = (isCollapsed: boolean) => (
    <>
      <nav className={`flex-1 overflow-y-auto py-4 ${isCollapsed ? "px-2" : "px-3"}`} aria-label="Navigasi dashboard">
        <div className="space-y-6">
          {allSections.map((section) => (
            <div key={section.id}>
              {section.label && !isCollapsed && (
                <h3 className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  {section.label}
                </h3>
              )}
              {section.label && isCollapsed && (
                <div className="mx-auto mb-1.5 h-px w-4 bg-slate-200" aria-hidden="true" />
              )}
              <div className="space-y-0.5">
                {section.items.map((item) => renderSidebarItem(item, isCollapsed))}
              </div>
            </div>
          ))}
        </div>
      </nav>

      {!isCollapsed && (
        <div className="border-t border-slate-100 p-4">
          <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4 max-xl:hidden">
            <p className="text-sm font-bold text-komuna-navy">Mulai Berkontribusi</p>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              Buat komunitas atau bergabung dengan komunitas yang sesuai dengan minatmu.
            </p>
            <div className="mt-3 flex flex-col gap-2">
              {approvedCommunity ? (
                <Link
                  href={`/dashboard/communities/${approvedCommunity.id}`}
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-komuna-blue px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-komuna-navy"
                >
                  Kelola Komunitas
                </Link>
              ) : (
                <Link
                  href="/communities/create"
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-komuna-blue px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-komuna-navy"
                >
                  Buat Komunitas
                </Link>
              )}
              <Link
                href="/communities"
                className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition-colors hover:border-komuna-blue/30 hover:text-komuna-blue"
              >
                Jelajahi Komunitas
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-komuna-blue border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-komuna-blue border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const sidebarWidth = collapsed ? "w-[68px]" : "w-64";

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside
          className={`hidden lg:sticky lg:top-16 lg:flex lg:h-[calc(100vh-4rem)] lg:flex-col lg:border-r lg:border-slate-200 lg:bg-white lg:transition-all lg:duration-200 ${sidebarWidth}`}
          aria-label="Sidebar dashboard"
        >
          <div className="flex items-center justify-end px-3 pt-3">
            <button
              type="button"
              onClick={toggleCollapsed}
              className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              aria-label={collapsed ? "Perluas sidebar" : "Sembunyikan sidebar"}
              title={collapsed ? "Perluas sidebar" : "Sembunyikan sidebar"}
            >
              {collapsed ? (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
              ) : (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                </svg>
              )}
            </button>
          </div>
          {renderSidebarContent(collapsed)}
        </aside>

        {/* Mobile Sidebar Toggle */}
        <div className="lg:hidden fixed bottom-4 left-4 z-40">
          <button
            aria-label={sidebarOpen ? "Tutup menu dashboard" : "Buka menu dashboard"}
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-komuna-blue text-white shadow-lg transition-colors hover:bg-komuna-navy"
          >
            {sidebarOpen ? (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Sidebar Drawer */}
        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-30">
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
              onClick={() => setSidebarOpen(false)}
              aria-hidden="true"
            />
            <aside
              ref={sidebarRef}
              className="absolute left-0 top-0 bottom-0 flex w-72 flex-col bg-white shadow-2xl transition-transform"
              role="dialog"
              aria-modal="true"
              aria-label="Navigasi dashboard"
            >
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                <span className="text-sm font-bold text-komuna-navy">Menu Dashboard</span>
                <button
                  aria-label="Tutup menu dashboard"
                  onClick={() => setSidebarOpen(false)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {renderSidebarContent(false)}
            </aside>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 min-h-[calc(100vh-4rem)]">
          <div className="max-w-6xl mx-auto px-4 py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
