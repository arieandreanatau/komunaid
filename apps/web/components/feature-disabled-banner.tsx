"use client";

import Link from "next/link";
import { featureFlags } from "@/lib/feature-flags";

export function FeatureDisabledBanner() {
  if (featureFlags.organization) return null;

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Modul Dormant</h1>
        <p className="text-gray-500 mb-6">
          Fitur ini tidak tersedia dalam MVP saat ini. Modul akan diaktifkan pada fase pengembangan berikutnya.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-2.5 text-sm font-medium text-white bg-komuna-blue rounded-lg hover:bg-komuna-navy transition-colors"
        >
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}
