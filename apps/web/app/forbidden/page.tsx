import Link from "next/link";

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-komuna-cream px-4">
      <div className="text-center max-w-md mx-auto p-8">
        <div className="font-display text-7xl font-semibold text-komuna-forest mb-4">403</div>
        <h2 className="font-display text-3xl font-semibold tracking-[-0.03em] text-komuna-dark mb-2">Akses Ditolak</h2>
        <p className="text-komuna-dark/65 mb-6">
          Anda tidak memiliki izin untuk mengakses halaman ini.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-2.5 bg-komuna-forest text-white rounded-xl hover:bg-komuna-dark transition-colors font-bold"
        >
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}
