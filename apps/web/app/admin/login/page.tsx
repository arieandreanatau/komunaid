"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@komunaid/shared";
import api from "@/lib/api";
import { useAuth } from "@/components/auth-provider";

export default function AdminLoginPage() {
  const router = useRouter();
  const { user, setUser, logout, isAuthenticated, isLoading } = useAuth();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/admin";
  const [error, setError] = useState("");
  const [checkingRole, setCheckingRole] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    if (!isLoading && isAuthenticated && user?.roles?.some((r: string) => ["SUPER_ADMIN", "PLATFORM_ADMIN"].includes(r))) {
      router.push(redirectTo);
    }
  }, [isLoading, isAuthenticated, user, redirectTo, router]);

  const onSubmit = async (data: LoginInput) => {
    setError("");
    setCheckingRole(true);
    try {
      const res = await api.post("/auth/login", data);
      const userData = res.data.data?.user || res.data.user;

      if (!userData?.roles?.some((r: string) => ["SUPER_ADMIN", "PLATFORM_ADMIN"].includes(r))) {
        await logout();
        setError("Akun Anda tidak memiliki akses ke panel administrasi.");
        setCheckingRole(false);
        return;
      }

      setUser(userData);
      router.push(redirectTo);
    } catch (err: unknown) {
      setCheckingRole(false);
      const axiosErr = err as { response?: { data?: { message?: string; error?: string | { code?: string; message?: string } } } };
      const errData = axiosErr.response?.data;
      const errMsg = typeof errData?.message === "string" && errData.message
        ? errData.message
        : typeof errData?.error === "string"
          ? errData.error
          : typeof errData?.error?.message === "string"
            ? errData.error.message
            : "Login gagal";
      setError(errMsg);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-komuna-navy via-komuna-blue to-komuna-teal py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full mb-6">
            <svg className="h-4 w-4 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span className="text-sm font-medium text-white/80">Admin Panel</span>
          </div>

          <h1 className="text-2xl font-bold text-white">Masuk ke Admin Panel</h1>
          <p className="text-sm text-white/60 mt-2">
            Hanya untuk administrator platform
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {error && (
              <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-600 text-sm p-4 rounded-lg">
                <svg className="h-5 w-5 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <div>
              <label htmlFor="identifier" className="block text-sm font-medium text-gray-700 mb-1">
                Email atau Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  id="identifier"
                  type="text"
                  {...register("identifier")}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-komuna-blue/30 focus:border-komuna-blue text-sm"
                  placeholder="email@komunaid.com atau username"
                />
              </div>
              {errors.identifier && (
                <p className="mt-1 text-sm text-red-500">{errors.identifier.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  id="password"
                  type="password"
                  {...register("password")}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-komuna-blue/30 focus:border-komuna-blue text-sm"
                  placeholder="Masukkan password"
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>

            <div className="flex items-center justify-between text-sm">
              <Link href="/forgot-password" className="text-komuna-blue hover:underline">
                Lupa password?
              </Link>
              <Link href="/login" className="text-gray-500 hover:text-gray-700">
                Login biasa
              </Link>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || checkingRole}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-komuna-blue hover:bg-komuna-navy focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-komuna-blue disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {(isSubmitting || checkingRole) && (
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              {checkingRole ? "Memverifikasi akses..." : isSubmitting ? "Masuk..." : "Masuk ke Admin Panel"}
            </button>
          </form>
        </div>

        <div className="text-center">
          <p className="text-xs text-white/40">
            KomunaID Administration Panel &middot; v0.1.0
          </p>
        </div>
      </div>
    </div>
  );
}
