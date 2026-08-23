"use client";

import Link from "next/link";

export default function PreferencesPage() {
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
        <h1 className="text-2xl font-bold text-komuna-navy mb-2">Preferensi</h1>
        <p className="text-sm text-gray-500 mb-6">Atur preferensi notifikasi dan tampilan Anda.</p>

        <div className="space-y-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Notifikasi Email</h3>
            <div className="space-y-3">
              <label className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Notifikasi komunitas baru</span>
                <input type="checkbox" defaultChecked className="rounded border-gray-300 text-komuna-blue focus:ring-komuna-blue" />
              </label>
              <label className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Pengumuman event</span>
                <input type="checkbox" defaultChecked className="rounded border-gray-300 text-komuna-blue focus:ring-komuna-blue" />
              </label>
              <label className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Status volunteer</span>
                <input type="checkbox" defaultChecked className="rounded border-gray-300 text-komuna-blue focus:ring-komuna-blue" />
              </label>
              <label className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Pembaruan keanggotaan</span>
                <input type="checkbox" defaultChecked className="rounded border-gray-300 text-komuna-blue focus:ring-komuna-blue" />
              </label>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Bahasa & Tampilan</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Bahasa</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue" disabled>
                  <option>Bahasa Indonesia</option>
                </select>
                <p className="text-[11px] text-gray-400 mt-1">Multi-bahasa tersedia di masa mendatang</p>
              </div>
            </div>
          </div>

          <p className="text-xs text-gray-400">
            Pengaturan preferensi akan disimpan secara otomatis. Fitur notifikasi email akan diaktifkan segera.
          </p>
        </div>
      </div>
    </div>
  );
}
