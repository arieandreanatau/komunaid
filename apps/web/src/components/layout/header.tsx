'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Menu, X, Bell, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';

interface HeaderProps {
  isAuthenticated?: boolean;
  user?: {
    firstName: string;
    lastName: string;
    avatar?: string | null;
    email: string;
  };
  notificationCount?: number;
  onLogout?: () => void;
}

export function Header({
  isAuthenticated = false,
  user,
  notificationCount = 0,
  onLogout,
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[9999] focus:rounded-lg focus:bg-royal-500 focus:px-4 focus:py-2 focus:text-white focus:outline-none"
      >
        Skip to content
      </a>
      <header className="sticky top-0 z-sticky border-b border-gray-200 bg-white">
        <div className="container-komuna flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-xl font-bold text-navy">KomunaID</span>
            </Link>

            <nav aria-label="Main navigation" className="hidden items-center gap-6 md:flex">
              <Link
                href="/communities"
                className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
              >
                Komunitas
              </Link>
              <Link
                href="/organizations"
                className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
              >
                Organisasi
              </Link>
              <Link
                href="/events"
                className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
              >
                Event
              </Link>
              <Link
                href="/about"
                className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
              >
                Tentang
              </Link>
            </nav>
          </div>

          <div className="hidden items-center gap-4 md:flex">
            {isAuthenticated ? (
              <>
                <Link href="/app/notifications">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Notifikasi${notificationCount > 0 ? ` (${notificationCount} belum dibaca)` : ''}`}
                  >
                    <Bell className="h-5 w-5 text-gray-500" />
                    {notificationCount > 0 && (
                      <Badge
                        variant="destructive"
                        className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs"
                        aria-hidden="true"
                      >
                        {notificationCount > 99 ? '99+' : notificationCount}
                      </Badge>
                    )}
                  </Button>
                </Link>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="gap-2" aria-label="Menu pengguna">
                      <div
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-royal-100 text-sm font-medium text-royal-700"
                        aria-hidden="true"
                      >
                        {user?.firstName?.[0]}
                        {user?.lastName?.[0]}
                      </div>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-medium text-gray-900">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/app">Dashboard</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/app/profile">Profil</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/app/settings">Pengaturan</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={onLogout} className="text-red-600">
                      Keluar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost">Masuk</Button>
                </Link>
                <Link href="/register">
                  <Button>Daftar</Button>
                </Link>
              </>
            )}
          </div>

          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Tutup menu' : 'Buka menu'}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div id="mobile-menu" className="border-t border-gray-200 bg-white px-4 py-4 md:hidden">
            <nav aria-label="Mobile navigation" className="flex flex-col gap-3">
              <Link
                href="/communities"
                className="text-sm font-medium text-gray-600"
                onClick={() => setMobileMenuOpen(false)}
              >
                Komunitas
              </Link>
              <Link
                href="/organizations"
                className="text-sm font-medium text-gray-600"
                onClick={() => setMobileMenuOpen(false)}
              >
                Organisasi
              </Link>
              <Link
                href="/events"
                className="text-sm font-medium text-gray-600"
                onClick={() => setMobileMenuOpen(false)}
              >
                Event
              </Link>
              <Link
                href="/about"
                className="text-sm font-medium text-gray-600"
                onClick={() => setMobileMenuOpen(false)}
              >
                Tentang
              </Link>
              <hr className="my-2" />
              {isAuthenticated ? (
                <>
                  <Link
                    href="/app"
                    className="text-sm font-medium text-gray-600"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onLogout?.();
                    }}
                    className="text-left text-sm font-medium text-red-600"
                  >
                    Keluar
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-sm font-medium text-gray-600"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Masuk
                  </Link>
                  <Link
                    href="/register"
                    className="text-sm font-medium text-royal-600"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Daftar
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
