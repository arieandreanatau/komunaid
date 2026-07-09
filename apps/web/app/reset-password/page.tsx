"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPasswordSchema, type ResetPasswordInput } from "@komunaid/shared";
import api from "@/lib/api";
import { Suspense } from "react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token: token || "" },
  });

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
        <div className="max-w-md w-full text-center space-y-4">
          <img src="/icon_komuna.png" alt="KomunaID" className="h-12 w-12 mx-auto" />
          <h2 className="text-2xl font-bold text-komuna-navy">Token Tidak Valid</h2>
          <p className="text-gray-600">Link reset password tidak valid atau sudah kadaluarsa.</p>
          <Link href="/forgot-password" className="text-komuna-blue hover:underline font-medium">
            Minta link baru
          </Link>
        </div>
      </div>
    );
  }

  const onSubmit = async (data: ResetPasswordInput) => {
    setError("");
    setMessage("");
    try {
      await api.post("/auth/reset-password", data);
      setMessage("Password berhasil diubah. Mengalihkan ke halaman login...");
      setTimeout(() => router.push("/login"), 2000);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message || "Gagal mereset password.");
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
          <h2 className="text-2xl font-bold text-komuna-navy">Reset Password</h2>
          <p className="text-sm text-gray-600 mt-2">Masukkan password baru Anda</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-lg">
              {error}
            </div>
          )}
          {message && (
            <div className="bg-green-50 border border-green-200 text-green-700 text-sm p-3 rounded-lg">
              {message}
            </div>
          )}

          <input type="hidden" {...register("token")} />

          <div className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password Baru
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
                Konfirmasi Password Baru
              </label>
              <input
                id="confirmPassword"
                type="password"
                {...register("confirmPassword")}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue"
                placeholder="Ulangi password baru"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-500">{errors.confirmPassword.message}</p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-komuna-blue hover:bg-komuna-navy focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-komuna-blue disabled:opacity-50 transition-colors"
          >
            {isSubmitting ? "Mengubah..." : "Ubah Password"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
