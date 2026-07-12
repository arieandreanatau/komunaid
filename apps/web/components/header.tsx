"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "./auth-provider";
import { useRouter } from "next/navigation";
import { featureFlags } from "@/lib/feature-flags";

export function Header() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [tentangOpen, setTentangOpen] = useState(false);
  const tentangRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (tentangRef.current && !tentangRef.current.contains(e.target as Node)) {
        setTentangOpen(false);
      }
    }
    if (tentangOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [tentangOpen]);

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const tentangItems = [
    { href: "/about", label: "Tentang Kami" },
    { href: "/faq", label: "FAQ" },
    { href: "/contact", label: "Kontak" },
    { href: "/submit", label: "Submit Pesan" },
    { href: "/organization-structure", label: "Struktur Organisasi" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <img src="/icon_komuna.png" alt="KomunaID" className="h-8 w-8" />
          <span className="font-bold text-xl text-komuna-navy">KomunaID</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium" aria-label="Navigasi utama">
          <Link href="/communities" className="text-gray-600 hover:text-komuna-blue transition-colors">
            Komunitas
          </Link>
          <Link href="/events" className="text-gray-600 hover:text-komuna-blue transition-colors">
            Event
          </Link>
          <Link href="/volunteer" className="text-gray-600 hover:text-komuna-blue transition-colors">
            Volunteer
          </Link>
          <div className="relative" ref={tentangRef}>
            <button
              onClick={() => setTentangOpen(!tentangOpen)}
              className="flex items-center gap-1 text-gray-600 hover:text-komuna-blue transition-colors"
              aria-expanded={tentangOpen}
              aria-haspopup="true"
            >
              Tentang
              <svg className={`h-4 w-4 transition-transform ${tentangOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {tentangOpen && (
              <div
                className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50"
                role="menu"
                aria-label="Menu Tentang"
                onKeyDown={(e) => {
                  if (e.key === "Escape") { setTentangOpen(false); }
                }}
              >
                {tentangItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    role="menuitem"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-komuna-blue transition-colors"
                    onClick={() => setTentangOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </nav>

        <div className="flex items-center gap-3">
          {/* Admin Panel icon — always visible, links to /admin/login */}
          <Link
            href="/admin/login"
            className="flex items-center gap-1.5 text-gray-400 hover:text-komuna-navy transition-colors"
            title="Admin Panel"
            aria-label="Admin Panel"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </Link>

          {isLoading ? (
            <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse" />
          ) : isAuthenticated && user ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-expanded={dropdownOpen}
                aria-haspopup="true"
              >
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="h-8 w-8 rounded-full object-cover" />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-komuna-blue flex items-center justify-center text-white text-sm font-medium">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="hidden md:inline text-sm font-medium text-gray-700">{user.name}</span>
              </button>

              {dropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} aria-hidden="true" />
                  <div
                    className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50"
                    role="menu"
                    aria-label="Menu pengguna"
                    onKeyDown={(e) => { if (e.key === "Escape") setDropdownOpen(false); }}
                  >
                    <div className="px-4 py-2 border-b">
                      <p className="text-sm font-medium text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500">@{user.username}</p>
                      <p className="text-xs text-gray-400">{user.email}</p>
                    </div>
                    <Link
                      href="/dashboard"
                      role="menuitem"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                      Dashboard
                    </Link>
                    {user?.roles?.some((r: string) => ["SUPER_ADMIN", "PLATFORM_ADMIN"].includes(r)) && (
                      <Link
                        href="/admin"
                        role="menuitem"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                        Admin Panel
                      </Link>
                    )}
                    <Link
                      href="/dashboard/profile"
                      role="menuitem"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                      Profile
                    </Link>
                    <Link
                      href="/dashboard/notifications"
                      role="menuitem"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                      Notifikasi
                    </Link>
                    <hr className="my-1" />
                    <button
                      onClick={handleLogout}
                      role="menuitem"
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                      Keluar
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-medium text-komuna-navy hover:text-komuna-blue transition-colors"
              >
                Masuk
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 text-sm font-medium text-white bg-komuna-blue rounded-lg hover:bg-komuna-navy transition-colors"
              >
                Daftar
              </Link>
            </>
          )}

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Tutup menu" : "Buka menu"}
            aria-expanded={menuOpen}
          >
            <svg className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {menuOpen && (
        <nav className="md:hidden border-t bg-white px-4 py-3 space-y-2" aria-label="Navigasi mobile">
          <Link href="/communities" className="block py-2 text-sm text-gray-600 hover:text-komuna-blue" onClick={() => setMenuOpen(false)}>
            Komunitas
          </Link>
          <Link href="/events" className="block py-2 text-sm text-gray-600 hover:text-komuna-blue" onClick={() => setMenuOpen(false)}>
            Event
          </Link>
          <Link href="/volunteer" className="block py-2 text-sm text-gray-600 hover:text-komuna-blue" onClick={() => setMenuOpen(false)}>
            Volunteer
          </Link>
          <div className="border-t pt-2 mt-2">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 px-2">Tentang</p>
            {tentangItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block py-2 text-sm text-gray-600 hover:text-komuna-blue pl-4"
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
          <Link href="/admin/login" className="flex items-center gap-2 py-2 text-sm text-gray-400 hover:text-komuna-navy pl-4" onClick={() => setMenuOpen(false)}>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Admin Panel
          </Link>
          {isAuthenticated && user && (
            <>
              <Link href="/dashboard" className="block py-2 text-sm text-gray-600 hover:text-komuna-blue" onClick={() => setMenuOpen(false)}>
                Dashboard
              </Link>
              <Link href="/dashboard/profile" className="block py-2 text-sm text-gray-600 hover:text-komuna-blue" onClick={() => setMenuOpen(false)}>
                Profile
              </Link>
              <button onClick={() => { setMenuOpen(false); handleLogout(); }} className="block py-2 text-sm text-red-600 hover:text-red-700 text-left w-full">
                Keluar
              </button>
            </>
          )}
        </nav>
      )}
    </header>
  );
}
