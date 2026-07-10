"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";

export default function AdminAccessPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const isAdmin = isAuthenticated && user?.roles?.some((r: string) => ["SUPER_ADMIN", "PLATFORM_ADMIN"].includes(r));

  useEffect(() => {
    if (isAdmin) {
      router.push("/admin");
    }
  }, [isAdmin, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="h-8 w-8 border-4 border-komuna-blue border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isAdmin) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-komuna-navy via-komuna-blue to-komuna-teal flex items-center justify-center py-12 px-4">
      <div className="max-w-lg w-full text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full">
          <svg className="h-5 w-5 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <span className="text-sm font-medium text-white/80">Administration</span>
        </div>

        <div>
          <img src="/icon_komuna.png" alt="KomunaID" className="h-16 w-16 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-white">KomunaID Admin Panel</h1>
          <p className="text-white/60 mt-3 text-sm max-w-md mx-auto">
            Panel administrasi untuk mengelola platform KomunaID.
            Akses terbatas untuk administrator yang berwenang.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 space-y-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="h-10 w-10 rounded-lg bg-white/10 flex items-center justify-center mx-auto mb-2">
                <svg className="h-5 w-5 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <p className="text-xs text-white/50">User Management</p>
            </div>
            <div>
              <div className="h-10 w-10 rounded-lg bg-white/10 flex items-center justify-center mx-auto mb-2">
                <svg className="h-5 w-5 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-xs text-white/50">Approval</p>
            </div>
            <div>
              <div className="h-10 w-10 rounded-lg bg-white/10 flex items-center justify-center mx-auto mb-2">
                <svg className="h-5 w-5 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p className="text-xs text-white/50">Audit Log</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Link
            href="/admin/login"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-komuna-navy font-semibold rounded-xl hover:bg-white/90 transition-all shadow-lg hover:shadow-xl"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 5v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            Masuk sebagai Admin
          </Link>

          <p className="text-xs text-white/30">
            {isAuthenticated
              ? "Akun Anda tidak memiliki akses admin. Hubungi Super Admin."
              : "Masuk dengan akun administrator untuk mengakses panel ini."
            }
          </p>
        </div>

        <Link href="/" className="inline-block text-sm text-white/40 hover:text-white/60 transition-colors">
          &larr; Kembali ke beranda
        </Link>
      </div>
    </div>
  );
}
