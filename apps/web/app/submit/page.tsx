"use client";

import { useState } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import api from "@/lib/api";

const CATEGORIES = [
  { value: "GENERAL", label: "Umum" },
  { value: "FEEDBACK", label: "Feedback" },
  { value: "COMPLAINT", label: "Keluhan" },
  { value: "SUGGESTION", label: "Saran" },
  { value: "PARTNERSHIP", label: "Kerjasama" },
  { value: "OTHER", label: "Lainnya" },
];

export default function SubmitPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    category: "GENERAL",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      await api.post("/contact-messages", form);
      setSuccess(true);
      setForm({ name: "", email: "", subject: "", category: "GENERAL", message: "" });
    } catch (err: any) {
      setError(err?.response?.data?.message || "Gagal mengirim pesan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-komuna-navy mb-3">Submit Pesan</h1>
              <p className="text-gray-600">
                Kirim pesan, feedback, atau saran kepada tim KomunaID. Kami akan merespons segera.
              </p>
            </div>

            {success && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6 text-center">
                <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-green-800 mb-1">Pesan Terkirim!</h3>
                <p className="text-sm text-green-600">Terima kasih telah menghubungi kami. Tim kami akan merespons dalam waktu dekat.</p>
                <button
                  onClick={() => setSuccess(false)}
                  className="mt-4 px-4 py-2 text-sm font-medium text-green-700 bg-green-100 rounded-lg hover:bg-green-200 transition-colors"
                >
                  Kirim Pesan Lain
                </button>
              </div>
            )}

            {!success && (
              <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 space-y-5">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-lg">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">
                      Nama Lengkap <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="name"
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue outline-none"
                      placeholder="Masukkan nama lengkap"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue outline-none"
                      placeholder="email@contoh.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1.5">
                      Subjek <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="subject"
                      type="text"
                      required
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue outline-none"
                      placeholder="Subjek pesan"
                    />
                  </div>
                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1.5">
                      Kategori
                    </label>
                    <select
                      id="category"
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue outline-none bg-white"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Pesan <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="message"
                    required
                    rows={6}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue outline-none resize-none"
                    placeholder="Tulis pesan Anda di sini..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-komuna-blue text-white rounded-lg font-medium hover:bg-komuna-navy transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Mengirim..." : "Kirim Pesan"}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
