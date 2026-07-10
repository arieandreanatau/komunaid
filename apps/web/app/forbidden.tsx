import Link from "next/link";

export default function Forbidden() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md mx-auto p-8">
        <div className="text-6xl font-bold text-komuna-blue mb-4">403</div>
        <h2 className="text-2xl font-bold text-komuna-navy mb-2">Akses Ditolak</h2>
        <p className="text-gray-600 mb-6">
          Anda tidak memiliki izin untuk mengakses halaman ini.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-2 bg-komuna-blue text-white rounded-lg hover:bg-komuna-navy transition-colors"
        >
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}
