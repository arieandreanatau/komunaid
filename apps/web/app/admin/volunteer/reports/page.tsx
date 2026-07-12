"use client";

export default function VolunteerReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-komuna-navy">Laporan Relawan</h1>
        <p className="text-sm text-gray-500 mt-1">Statistik dan laporan program volunteer</p>
      </div>

      <div className="text-center py-16 bg-white rounded-xl shadow-sm">
        <svg className="h-12 w-12 text-gray-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <p className="text-gray-500 font-medium">Laporan volunteer belum tersedia</p>
        <p className="text-sm text-gray-400 mt-1 max-w-md mx-auto">
          Statistik detail program relawan, kehadiran, dan partisipasi akan ditampilkan di sini.
        </p>
      </div>
    </div>
  );
}
