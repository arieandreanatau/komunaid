import Link from "next/link";

export default function ServerError() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-komuna-navy">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="text-7xl font-bold text-komuna-aqua mb-4">500</div>
        <h1 className="text-2xl font-bold text-white mb-2">
          Terjadi Kesalahan Server
        </h1>
        <p className="text-white/70 mb-8">
          Server kami mengalami masalah. Tim teknis sedang bekerja untuk memperbaikinya.
          Silakan coba lagi beberapa saat.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-komuna-aqua text-komuna-navy rounded-lg font-semibold hover:bg-white transition-colors"
        >
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}
