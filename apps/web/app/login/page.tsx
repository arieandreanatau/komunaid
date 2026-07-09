"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@komunaid/shared";
import api from "@/lib/api";
import { useAuth } from "@/components/auth-provider";

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useAuth();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/dashboard";
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setError("");
    try {
      const res = await api.post("/auth/login", data);
      const userData = res.data.data?.user || res.data.user;
      setUser(userData);
      router.push(redirectTo);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string; error?: string } } };
      setError(axiosErr.response?.data?.message || axiosErr.response?.data?.error || "Login gagal");
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
          <h2 className="text-2xl font-bold text-komuna-navy">Masuk ke Akun</h2>
          <p className="text-sm text-gray-600 mt-2">
            Belum punya akun?{" "}
            <Link href="/register" className="text-komuna-blue hover:underline font-medium">
              Daftar sekarang
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
              <label htmlFor="identifier" className="block text-sm font-medium text-gray-700">
                Email atau Username
              </label>
              <input
                id="identifier"
                type="text"
                {...register("identifier")}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue"
                placeholder="email@contoh.com atau username"
              />
              {errors.identifier && (
                <p className="mt-1 text-sm text-red-500">{errors.identifier.message}</p>
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
                placeholder="Masukkan password"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <Link href="/forgot-password" className="text-komuna-blue hover:underline">
                Lupa password?
              </Link>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-komuna-blue hover:bg-komuna-navy focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-komuna-blue disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? "Masuk..." : "Masuk"}
          </button>
        </form>
      </div>
    </div>
  );
}
