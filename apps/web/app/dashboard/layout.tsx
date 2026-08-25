"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { GlobalSidebar } from "@/components/sidebar/global-sidebar";
import { Header } from "@/components/header";
import { useDrawerDialog } from "@/components/ui/use-drawer-dialog";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const sidebarRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [pathname]);

  useDrawerDialog(mobileSidebarOpen, sidebarRef, menuButtonRef, () => setMobileSidebarOpen(false), mainRef);

  const handleMobileClose = useCallback(() => {
    setMobileSidebarOpen(false);
  }, []);

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

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <div className="flex">
        <GlobalSidebar />

        <div className="lg:hidden fixed bottom-4 left-4 z-40">
          <button
            ref={menuButtonRef}
            type="button"
            aria-label={mobileSidebarOpen ? "Tutup menu sidebar" : "Buka menu sidebar"}
            aria-expanded={mobileSidebarOpen}
            aria-controls="mobile-global-sidebar"
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-komuna-blue text-white shadow-lg transition-colors hover:bg-komuna-navy focus:outline-none focus-visible:ring-2 focus-visible:ring-komuna-blue focus-visible:ring-offset-2"
          >
            {mobileSidebarOpen ? (
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

        {mobileSidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-30">
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
              onClick={handleMobileClose}
              aria-hidden="true"
            />
            <aside
              id="mobile-global-sidebar"
              ref={sidebarRef}
              tabIndex={-1}
              className="absolute left-0 top-0 bottom-0 flex w-[min(94vw,24rem)] flex-col bg-white shadow-2xl transition-transform"
              role="dialog"
              aria-modal="true"
              aria-label="Navigasi global"
            >
              <GlobalSidebar onMobileClose={handleMobileClose} isMobile />
            </aside>
          </div>
        )}

        <main ref={mainRef} className="min-w-0 flex-1 min-h-[calc(100vh-4rem)]">
          <div className="max-w-6xl mx-auto px-4 py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
