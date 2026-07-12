"use client";

export default function CmsFaqPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-komuna-navy">FAQ Management</h1>
        <p className="text-sm text-gray-500 mt-1">Kelola pertanyaan yang sering diajukan</p>
      </div>

      <div className="text-center py-16 bg-white rounded-xl shadow-sm">
        <svg className="h-12 w-12 text-gray-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-gray-500 font-medium">Manajemen FAQ belum tersedia</p>
        <p className="text-sm text-gray-400 mt-1 max-w-md mx-auto">
          Halaman untuk mengelola pertanyaan yang sering diajukan (FAQ) akan segera tersedia.
        </p>
      </div>
    </div>
  );
}
