"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "./auth-provider";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

const navigation = {
  event: [
    { href: "/events", label: "Event" },
    { href: "/volunteer", label: "Volunteer" },
  ],
  tentang: [
    { href: "/about", label: "Tentang Kami" },
    { href: "/organization-structure", label: "Struktur Organisasi" },
    { href: "/contact", label: "Kontak" },
    { href: "/saran", label: "Saran" },
    { href: "/admin/login", label: "Platform Access" },
  ],
};

function isEventActive(pathname: string) {
  return pathname.startsWith("/events") || pathname.startsWith("/volunteer");
}

function isTentangActive(pathname: string) {
  return (
    pathname.startsWith("/about") ||
    pathname.startsWith("/organization-structure") ||
    pathname.startsWith("/contact") ||
    pathname.startsWith("/saran") ||
    pathname.startsWith("/faq") ||
    pathname.startsWith("/admin")
  );
}

function navLinkClass(active: boolean) {
  return `relative transition-colors ${
    active ? "text-komuna-forest" : "text-komuna-dark/70 hover:text-komuna-forest"
  }`;
}

function NavMenuItem({
  href,
  label,
  onNavigate,
  active,
}: {
  href: string;
  label: string;
  onNavigate?: () => void;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      role="menuitem"
      className={`block px-4 py-2 text-sm transition-colors ${
        active ? "bg-komuna-soft font-semibold text-komuna-forest" : "text-gray-700 hover:bg-gray-50 hover:text-komuna-blue"
      }`}
      aria-current={active ? "page" : undefined}
      onClick={onNavigate}
    >
      {label}
    </Link>
  );
}

export function Header() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [eventOpen, setEventOpen] = useState(false);
  const [tentangOpen, setTentangOpen] = useState(false);
  const eventRef = useRef<HTMLDivElement>(null);
  const tentangRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  const berandaActive = pathname === "/";
  const komunitasActive = pathname.startsWith("/communities") || pathname.startsWith("/categories");
  const eventActive = isEventActive(pathname);
  const tentangActive = isTentangActive(pathname);

  const { data: unreadNotifications = 0 } = useQuery({
    queryKey: ["notifications", "unread-count"],
    enabled: isAuthenticated,
    queryFn: async () => {
      const response = await api.get("/users/notifications?unread=true&page=1&limit=1");
      return response.data.pagination?.total ?? 0;
    },
  });

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (eventRef.current && !eventRef.current.contains(e.target as Node)) {
        setEventOpen(false);
      }
      if (tentangRef.current && !tentangRef.current.contains(e.target as Node)) {
        setTentangOpen(false);
      }
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-komuna-forest/10 bg-komuna-cream/95 backdrop-blur supports-[backdrop-filter]:bg-komuna-cream/80">
      <div className="mx-auto flex h-[4.5rem] max-w-7xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <img src="/icon_komuna.png" alt="KomunaID" className="h-8 w-8" />
          <span className="font-display text-2xl font-semibold text-komuna-dark">KomunaID</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-bold" aria-label="Navigasi utama">
          <Link href="/" aria-current={berandaActive ? "page" : undefined} className={navLinkClass(berandaActive)}>
            Beranda
          </Link>
          <Link
            href="/communities"
            aria-current={komunitasActive ? "page" : undefined}
            className={navLinkClass(komunitasActive)}
          >
            Komunitas
          </Link>
          <div className="relative" ref={eventRef}>
            <button
              onClick={() => setEventOpen(!eventOpen)}
              className={`flex items-center gap-1 transition-colors ${eventActive || eventOpen ? "text-komuna-forest" : "text-komuna-dark/70 hover:text-komuna-forest"}`}
              aria-expanded={eventOpen}
              aria-haspopup="true"
              aria-label="Menu Event"
            >
              Event
              <svg className={`h-4 w-4 transition-transform ${eventOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {eventOpen && (
              <div
                className="absolute right-0 mt-2 w-52 rounded-xl border border-gray-100 bg-white py-2 shadow-lg z-50"
                role="menu"
                aria-label="Menu Event"
                onKeyDown={(e) => {
                  if (e.key === "Escape") { setEventOpen(false); }
                }}
              >
                {navigation.event.map((item) => (
                  <NavMenuItem key={item.href} href={item.href} label={item.label} active={pathname === item.href || (item.href === "/events" && pathname.startsWith("/events")) || (item.href === "/volunteer" && pathname.startsWith("/volunteer"))} onNavigate={() => setEventOpen(false)} />
                ))}
              </div>
            )}
          </div>
          <div className="relative" ref={tentangRef}>
            <button
              onClick={() => setTentangOpen(!tentangOpen)}
              className={`flex items-center gap-1 transition-colors ${tentangActive || tentangOpen ? "text-komuna-forest" : "text-komuna-dark/70 hover:text-komuna-forest"}`}
              aria-expanded={tentangOpen}
              aria-haspopup="true"
              aria-label="Menu Tentang"
            >
              Tentang
              <svg className={`h-4 w-4 transition-transform ${tentangOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {tentangOpen && (
              <div
                className="absolute right-0 mt-2 w-56 rounded-xl border border-gray-100 bg-white py-2 shadow-lg z-50"
                role="menu"
                aria-label="Menu Tentang"
                onKeyDown={(e) => {
                  if (e.key === "Escape") { setTentangOpen(false); }
                }}
              >
                {navigation.tentang.map((item) => (
                  <NavMenuItem key={item.href} href={item.href} label={item.label} active={pathname === item.href || pathname.startsWith(item.href)} onNavigate={() => setTentangOpen(false)} />
                ))}
              </div>
            )}
          </div>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/search"
            className="hidden sm:inline-flex rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-komuna-blue"
            title="Cari"
            aria-label="Cari komunitas, event, volunteer, atau kategori"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m1.35-5.15a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z" />
            </svg>
          </Link>
          {isAuthenticated && (
            <Link
              href="/dashboard/notifications"
              className="relative rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-komuna-blue"
              title="Notifikasi"
              aria-label={`Notifikasi${unreadNotifications > 0 ? `, ${unreadNotifications} belum dibaca` : ""}`}
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {unreadNotifications > 0 && (
                <span className="absolute -right-1 -top-1 flex min-h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold leading-none text-white">
                  {unreadNotifications > 99 ? "99+" : unreadNotifications}
                </span>
              )}
            </Link>
          )}

          {isLoading ? (
            <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse" />
          ) : isAuthenticated && user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                aria-expanded={dropdownOpen}
                aria-haspopup="true"
                aria-label="Menu pengguna"
              >
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="h-8 w-8 rounded-full object-cover" />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-komuna-blue flex items-center justify-center text-white text-sm font-medium">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="hidden md:inline text-sm font-medium text-gray-700">{user.name}</span>
                <svg className={`hidden md:block h-4 w-4 text-gray-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {dropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-60 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50"
                  role="menu"
                  aria-label="Menu pengguna"
                  onKeyDown={(e) => { if (e.key === "Escape") setDropdownOpen(false); }}
                >
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500">@{user.username}</p>
                    {user.email && <p className="text-xs text-gray-400 mt-0.5">{user.email}</p>}
                  </div>

                  <Link
                    href="/dashboard"
                    role="menuitem"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-komuna-blue transition-colors"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                    Dashboard
                  </Link>

                  {user?.roles?.some((r: string) => ["SUPER_ADMIN", "PLATFORM_ADMIN"].includes(r)) && (
                    <Link
                      href="/admin"
                      role="menuitem"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-komuna-blue transition-colors"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                      Admin Panel
                    </Link>
                  )}

                  <div className="border-t border-gray-100 my-1" />

                  <Link
                    href="/dashboard/profile"
                    role="menuitem"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-komuna-blue transition-colors"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    Profil
                  </Link>

                  <Link
                    href="/dashboard/notifications"
                    role="menuitem"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-komuna-blue transition-colors"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                    Notifikasi
                  </Link>

                  <Link
                    href="/dashboard/activity"
                    role="menuitem"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-komuna-blue transition-colors"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Aktivitas
                  </Link>

                  <Link
                    href="/dashboard/settings"
                    role="menuitem"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-komuna-blue transition-colors"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    Pengaturan
                  </Link>

                  <div className="border-t border-gray-100 my-1" />

                  <button
                    onClick={handleLogout}
                    role="menuitem"
                    className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                    Keluar
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-bold text-komuna-forest hover:text-komuna-dark transition-colors"
              >
                Masuk
              </Link>
              <Link
                href="/register"
                className="rounded-xl bg-komuna-forest px-4 py-2 text-sm font-bold text-white hover:bg-komuna-dark transition-colors"
              >
                Daftar
              </Link>
            </>
          )}

          {/* Mobile menu button */}
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-komuna-soft"
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
        <nav className="lg:hidden border-t border-komuna-forest/10 bg-komuna-cream px-4 py-3 space-y-2" aria-label="Navigasi mobile">
          <Link href="/" className={`block py-2 text-sm font-semibold transition-colors ${berandaActive ? "text-komuna-forest" : "text-komuna-dark/70 hover:text-komuna-forest"}`} aria-current={berandaActive ? "page" : undefined} onClick={() => setMenuOpen(false)}>
            Beranda
          </Link>
          <Link href="/communities" className={`block py-2 text-sm transition-colors ${komunitasActive ? "text-komuna-forest font-semibold" : "text-gray-600 hover:text-komuna-blue"}`} aria-current={komunitasActive ? "page" : undefined} onClick={() => setMenuOpen(false)}>
            Komunitas
          </Link>
          <div className="border-t pt-1">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 px-2">Event</p>
            {navigation.event.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`block py-2 text-sm pl-4 transition-colors ${pathname === item.href || (item.href !== "/events" && pathname.startsWith(item.href)) || (item.href === "/events" && pathname.startsWith("/events")) ? "text-komuna-forest font-semibold" : "text-gray-600 hover:text-komuna-blue"}`}
                aria-current={pathname === item.href ? "page" : undefined}
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
          <Link href="/search" className="block py-2 text-sm text-gray-600 hover:text-komuna-blue" onClick={() => setMenuOpen(false)}>
            Cari
          </Link>
          <div className="border-t pt-2 mt-2">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 px-2">Tentang</p>
            {navigation.tentang.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`block py-2 text-sm pl-4 transition-colors ${
                  pathname === item.href || (item.href !== "/about" && pathname.startsWith(item.href)) || (item.href === "/about" && pathname.startsWith("/about"))
                    ? "text-komuna-forest font-semibold"
                    : "text-gray-600 hover:text-komuna-blue"
                }`}
                aria-current={pathname === item.href ? "page" : undefined}
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
          {isAuthenticated && user ? (
            <>
              <div className="border-t pt-2 mt-2">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 px-2">Dashboard</p>
                <Link href="/dashboard" className="block py-2 text-sm text-gray-600 hover:text-komuna-blue pl-4" onClick={() => setMenuOpen(false)}>
                  Overview
                </Link>
                <Link href="/dashboard/profile" className="block py-2 text-sm text-gray-600 hover:text-komuna-blue pl-4" onClick={() => setMenuOpen(false)}>
                  Profil
                </Link>
                <Link href="/dashboard/notifications" className="block py-2 text-sm text-gray-600 hover:text-komuna-blue pl-4" onClick={() => setMenuOpen(false)}>
                  Notifikasi
                </Link>
                <Link href="/dashboard/activity" className="block py-2 text-sm text-gray-600 hover:text-komuna-blue pl-4" onClick={() => setMenuOpen(false)}>
                  Aktivitas
                </Link>
                <Link href="/dashboard/settings" className="block py-2 text-sm text-gray-600 hover:text-komuna-blue pl-4" onClick={() => setMenuOpen(false)}>
                  Pengaturan
                </Link>
              </div>
              <button onClick={() => { setMenuOpen(false); handleLogout(); }} className="block py-2 text-sm text-red-600 hover:text-red-700 text-left w-full">
                Keluar
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="block py-2 text-sm font-semibold text-komuna-forest hover:text-komuna-dark"
                onClick={() => setMenuOpen(false)}
              >
                Masuk
              </Link>
              <Link
                href="/register"
                className="block py-2 text-sm font-semibold text-komuna-forest hover:text-komuna-dark"
                onClick={() => setMenuOpen(false)}
              >
                Daftar
              </Link>
            </>
          )}
        </nav>
      )}
    </header>
  );
}
