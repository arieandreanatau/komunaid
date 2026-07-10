"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterInput } from "@komunaid/shared";
import api from "@/lib/api";
import { useAuth } from "@/components/auth-provider";

export default function RegisterPage() {
  const router = useRouter();
  const { setUser } = useAuth();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/dashboard";
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterInput) => {
    setError("");
    try {
      const res = await api.post("/auth/register", data);
      const userData = res.data.data?.user || res.data.user;
      setUser(userData);
      router.push(redirectTo);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string; error?: string | { code?: string; message?: string } } } };
      const errData = axiosErr.response?.data;
      const errMsg = typeof errData?.message === "string" && errData.message
        ? errData.message
        : typeof errData?.error === "string"
          ? errData.error
          : typeof errData?.error?.message === "string"
            ? errData.error.message
            : "Registrasi gagal";
      setError(errMsg);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link href="/" className="flex items-center justify-center gap-3 mb-6">
            <img src="/icon_komuna.png" alt="KomunaID" className="h-10 w-10" />
            <span className="font-bold text-2xl text-komuna-navy">KomunaID</span>
          </Link>
          <h2 className="text-2xl font-bold text-komuna-navy">Daftar Akun Baru</h2>
          <p className="text-sm text-gray-600 mt-2">
            Sudah punya akun?{" "}
            <Link href="/login" className="text-komuna-blue hover:underline font-medium">
              Masuk
            </Link>
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Nama Lengkap
              </label>
              <input
                id="name"
                type="text"
                {...register("name")}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue"
                placeholder="Masukkan nama lengkap"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <input
                id="username"
                type="text"
                {...register("username")}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue"
                placeholder="huruf, angka, underscore"
              />
              {errors.username && (
                <p className="mt-1 text-sm text-red-500">{errors.username.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                {...register("email")}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue"
                placeholder="email@contoh.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                {...register("password")}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue"
                placeholder="Minimal 8 karakter"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Konfirmasi Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                {...register("confirmPassword")}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue"
                placeholder="Ulangi password"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-500">{errors.confirmPassword.message}</p>
              )}
            </div>
          </div>

          <div className="flex items-start gap-2">
            <input id="terms" type="checkbox" required className="mt-1 h-4 w-4 text-komuna-blue border-gray-300 rounded" />
            <label htmlFor="terms" className="text-xs text-gray-500">
              Saya menyetujui{" "}
              <Link href="/terms" className="text-komuna-blue hover:underline">Syarat & Ketentuan</Link>{" "}
              dan{" "}
              <Link href="/privacy" className="text-komuna-blue hover:underline">Kebijakan Privasi</Link>
            </label>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-komuna-blue hover:bg-komuna-navy focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-komuna-blue disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? "Mendaftar..." : "Daftar"}
          </button>
        </form>
      </div>
    </div>
  );
}
