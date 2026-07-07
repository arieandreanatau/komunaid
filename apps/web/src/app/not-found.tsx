import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4">
      <h1 className="text-6xl font-bold text-navy">404</h1>
      <p className="mt-4 text-xl text-gray-600">Halaman tidak ditemukan</p>
      <p className="mt-2 text-gray-500">
        Halaman yang Anda cari tidak tersedia atau telah dipindahkan.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex items-center rounded-lg bg-royal px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-royal-600 transition-colors"
      >
        Kembali ke Beranda
      </Link>
    </div>
  );
}
