"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contactMessageSchema, type ContactMessageInput } from "@komunaid/shared";
import api from "@/lib/api";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export default function SaranPage() {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactMessageInput>({
    resolver: zodResolver(contactMessageSchema),
    defaultValues: { category: "SUGGESTION" },
  });

  const onSubmit = async (data: ContactMessageInput) => {
    setError("");
    try {
      await api.post("/contact-messages", { ...data, category: "SUGGESTION" });
      setSuccess(true);
      reset();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message || "Gagal mengirim saran. Silakan coba lagi.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-komuna-cream">
      <Header />
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-10">
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-komuna-coral mb-3">Saran</p>
              <h1 className="font-display text-4xl font-semibold tracking-[-0.03em] text-komuna-dark">Kirim Saran</h1>
              <p className="text-komuna-dark/65 mt-3">
                Punya masukan untuk membuat KomunaID lebih baik? Sampaikan kepada kami.
              </p>
            </div>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="rounded-2xl border border-komuna-forest/10 bg-white p-6 shadow-sm sm:p-8 space-y-5"
            >
              {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 text-sm p-3 rounded-lg">
                  Terima kasih! Saran Anda berhasil terkirim.
                </div>
              )}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-lg">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Nama
                </label>
                <input
                  id="name"
                  type="text"
                  {...register("name")}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue"
                  placeholder="Nama Anda"
                />
                {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>}
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
                {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>}
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
                  Subjek
                </label>
                <input
                  id="subject"
                  type="text"
                  {...register("subject")}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue"
                  placeholder="Ringkasan saran Anda"
                />
                {errors.subject && <p className="mt-1 text-sm text-red-500">{errors.subject.message}</p>}
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                  Saran
                </label>
                <textarea
                  id="message"
                  rows={5}
                  {...register("message")}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue"
                  placeholder="Tulis saran Anda di sini..."
                />
                {errors.message && <p className="mt-1 text-sm text-red-500">{errors.message.message}</p>}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl text-sm font-bold text-white bg-komuna-forest hover:bg-komuna-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-komuna-forest disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? "Mengirim..." : "Kirim Saran"}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-6">
              Lebih suka cara lain?{" "}
              <Link href="/contact" className="text-komuna-blue hover:underline font-medium">
                Hubungi kami
              </Link>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
