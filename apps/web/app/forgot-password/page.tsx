"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@komunaid/shared";
import api from "@/lib/api";

export default function ForgotPasswordPage() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    setError("");
    setMessage("");
    try {
      await api.post("/auth/forgot-password", data);
      setMessage("Email reset password telah dikirim. Silakan cek inbox Anda.");
    } catch {
      setError("Gagal mengirim email reset password.");
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
          <h2 className="text-2xl font-bold text-komuna-navy">Lupa Password</h2>
          <p className="text-sm text-gray-600 mt-2">
            Masukkan email Anda untuk mendapatkan link reset password
          </p>
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

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-komuna-blue hover:bg-komuna-navy focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-komuna-blue disabled:opacity-50 transition-colors"
          >
            {isSubmitting ? "Mengirim..." : "Kirim Link Reset"}
          </button>

          <div className="text-center">
            <Link href="/login" className="text-sm text-komuna-blue hover:underline font-medium">
              Kembali ke Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
