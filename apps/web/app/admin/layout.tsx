"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth-provider";
import { sidebarItems, isActiveHref } from "@/components/admin/navigation";
import { WorkspaceTabs } from "@/components/admin/workspace-tabs";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const isSuperAdmin = user?.roles?.includes("SUPER_ADMIN");
  const isAdmin = user?.roles?.includes("PLATFORM_ADMIN") || isSuperAdmin;
  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (!isLoading && !isLoginPage && (!isAuthenticated || !isAdmin)) {
      router.push("/admin/login");
    }
  }, [isLoading, isAuthenticated, isAdmin, router, isLoginPage]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSidebarOpen(false);
    };
    if (sidebarOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [sidebarOpen]);

  const filteredItems = sidebarItems.filter((item) => {
    if (item.superAdminOnly && !isSuperAdmin) return false;
    return true;
  });

  const renderSidebarItem = (item: typeof sidebarItems[0]) => {
    const active = isActiveHref(pathname, item.href);
    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={() => setSidebarOpen(false)}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group ${
          active
            ? "bg-komuna-blue/10 text-komuna-blue"
            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
        }`}
        aria-current={active ? "page" : undefined}
        title={sidebarCollapsed ? item.label : undefined}
      >
        <svg
          className={`h-5 w-5 flex-shrink-0 transition-colors ${
            active ? "text-komuna-blue" : "text-gray-400 group-hover:text-gray-600"
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
        </svg>
        {!sidebarCollapsed && <span>{item.label}</span>}
      </Link>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-komuna-blue border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (!isAuthenticated || !isAdmin) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex pt-16">
        <aside
          className={`hidden lg:flex flex-col border-r bg-white sticky top-16 h-[calc(100vh-4rem)] transition-all duration-300 ${
            sidebarCollapsed ? "w-16" : "w-60"
          }`}
          role="complementary"
        >
          <div className="flex-1 overflow-y-auto py-3 px-2">
            <nav className="space-y-0.5" aria-label="Navigasi admin">
              {!sidebarCollapsed && (
                <div className="px-2 mb-2">
                  <h3 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Navigation</h3>
                </div>
              )}
              {filteredItems.map(renderSidebarItem)}
            </nav>
          </div>
          <div className="border-t p-2">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors w-full"
              aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <svg
                className={`h-5 w-5 flex-shrink-0 transition-transform ${sidebarCollapsed ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
              {!sidebarCollapsed && <span>Collapse</span>}
            </button>
          </div>
        </aside>

        <div className="lg:hidden fixed bottom-4 left-4 z-50">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-3 bg-komuna-blue text-white rounded-full shadow-lg hover:bg-komuna-navy transition-colors"
            aria-label={sidebarOpen ? "Tutup menu admin" : "Buka menu admin"}
            aria-expanded={sidebarOpen}
            aria-controls="admin-sidebar-mobile"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {sidebarOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-40" id="admin-sidebar-mobile">
            <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} aria-hidden="true" />
            <aside className="absolute left-0 top-0 bottom-0 w-64 bg-white shadow-xl z-50" role="dialog" aria-label="Navigasi admin" aria-modal="true">
              <div className="flex items-center justify-between p-4 border-b">
                <span className="font-semibold text-komuna-navy">Admin Panel</span>
                <button onClick={() => setSidebarOpen(false)} className="p-1 hover:bg-gray-100 rounded" aria-label="Tutup sidebar admin">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <nav className="p-3 space-y-0.5" aria-label="Navigasi admin mobile">
                {filteredItems.map(renderSidebarItem)}
              </nav>
            </aside>
          </div>
        )}

        <main className="flex-1 min-h-[calc(100vh-4rem)]">
          <WorkspaceTabs />
          <div className="max-w-7xl mx-auto px-4 py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
