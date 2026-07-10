import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: "Halaman Tidak Ditemukan",
  description: "Halaman yang Anda cari tidak tersedia atau sudah dipindahkan.",
};

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="text-7xl font-bold text-komuna-blue mb-4">404</div>
          <h1 className="text-2xl font-bold text-komuna-navy mb-2">
            Halaman Tidak Ditemukan
          </h1>
          <p className="text-gray-600 mb-8">
            Halaman yang Anda cari tidak tersedia atau sudah dipindahkan ke lokasi lain.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10">
            <Link
              href="/"
              className="px-6 py-2.5 bg-komuna-blue text-white rounded-lg hover:bg-komuna-navy transition-colors font-medium"
            >
              Kembali ke Beranda
            </Link>
            <Link
              href="/communities"
              className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Jelajahi Komunitas
            </Link>
          </div>
          <div className="border-t pt-6">
            <p className="text-sm text-gray-500 mb-3">Atau kunjungi:</p>
            <div className="flex flex-wrap justify-center gap-3 text-sm">
              <Link href="/events" className="text-komuna-blue hover:underline">Event</Link>
              <Link href="/organizations" className="text-komuna-blue hover:underline">Organisasi</Link>
              <Link href="/volunteer" className="text-komuna-blue hover:underline">Volunteer</Link>
              <Link href="/faq" className="text-komuna-blue hover:underline">FAQ</Link>
              <Link href="/contact" className="text-komuna-blue hover:underline">Kontak</Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
