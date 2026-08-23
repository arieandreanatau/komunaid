"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { useAuth } from "@/components/auth-provider";

export default function PrivacySettingsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [isProfilePublic, setIsProfilePublic] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (user) {
      setIsProfilePublic(user.isProfilePublic !== false);
    }
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    try {
      await api.put("/users/privacy", { isProfilePublic });
      setMessage("Pengaturan privasi berhasil disimpan.");
    } catch {
      setMessage("Gagal menyimpan pengaturan privasi.");
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="h-8 w-8 border-4 border-komuna-blue border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link
          href="/dashboard/settings"
          className="text-sm text-komuna-blue hover:underline flex items-center gap-1"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Kembali ke Pengaturan
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h1 className="text-2xl font-bold text-komuna-navy mb-2">Privasi</h1>
        <p className="text-sm text-gray-500 mb-6">Atur siapa yang dapat melihat profil Anda.</p>

        <div className="space-y-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Profil Publik</h3>
                <p className="text-xs text-gray-500 mt-1">
                  {isProfilePublic
                    ? "Profil Anda terlihat oleh semua orang (nama, avatar, bio, lokasi, komunitas)."
                    : "Profil Anda hanya terlihat oleh Anda. Pengunjung hanya melihat nama dan avatar."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsProfilePublic(!isProfilePublic)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isProfilePublic ? "bg-komuna-blue" : "bg-gray-300"
                }`}
                role="switch"
                aria-checked={isProfilePublic}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isProfilePublic ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Data Yang Dikontrol</h3>
            <ul className="text-xs text-gray-500 space-y-1.5">
              <li className="flex items-start gap-2">
                <span className={`mt-1 h-1.5 w-1.5 rounded-full ${isProfilePublic ? "bg-green-500" : "bg-gray-400"} shrink-0`} />
                <span><strong className="text-gray-700">Publik:</strong> Nama, Avatar — selalu terlihat</span>
              </li>
              <li className="flex items-start gap-2">
                <span className={`mt-1 h-1.5 w-1.5 rounded-full ${isProfilePublic ? "bg-green-500" : "bg-gray-400"} shrink-0`} />
                <span><strong className="text-gray-700">{isProfilePublic ? "Terlihat" : "Disembunyikan"}:</strong> Bio, Lokasi, Komunitas yang diikuti</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-red-500 shrink-0" />
                <span><strong className="text-gray-700">Selalu Privat:</strong> Email, Telepon, Minat, Event yang diikuti</span>
              </li>
            </ul>
          </div>

          {message && (
            <p className={`text-sm ${message.includes("berhasil") ? "text-green-600" : "text-red-600"}`}>
              {message}
            </p>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-komuna-blue text-white rounded-lg font-medium hover:bg-komuna-navy transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {saving && <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            {saving ? "Menyimpan..." : "Simpan Pengaturan"}
          </button>
        </div>
      </div>
    </div>
  );
}
