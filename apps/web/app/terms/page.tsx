import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Syarat & Ketentuan - KomunaID",
  description: "Syarat dan ketentuan penggunaan platform KomunaID.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-komuna-blue flex items-center justify-center">
              <span className="text-white font-bold text-sm">K</span>
            </div>
            <span className="font-bold text-xl text-komuna-navy">KomunaID</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link href="/communities" className="hover:text-komuna-blue">Komunitas</Link>
            <Link href="/events" className="hover:text-komuna-blue">Event</Link>
            <Link href="/about" className="hover:text-komuna-blue">Tentang</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login" className="px-4 py-2 text-sm font-medium text-komuna-navy hover:text-komuna-blue">Masuk</Link>
            <Link href="/register" className="px-4 py-2 text-sm font-medium text-white bg-komuna-blue rounded-lg hover:bg-komuna-navy">Daftar</Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-komuna-navy mb-8">Syarat & Ketentuan</h1>
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600">Terakhir diperbarui: Juli 2026</p>

            <h2 className="text-2xl font-bold text-komuna-navy mt-8">1. Penerimaan Syarat</h2>
            <p className="text-gray-600">
              Dengan mengakses dan menggunakan platform KomunaID, Anda menyetujui untuk terikat oleh syarat dan ketentuan ini.
            </p>

            <h2 className="text-2xl font-bold text-komuna-navy mt-8">2. Akun Pengguna</h2>
            <p className="text-gray-600">
              Anda bertanggung jawab untuk menjaga kerahasiaan akun Anda. Satu email hanya dapat digunakan untuk satu akun.
            </p>

            <h2 className="text-2xl font-bold text-komuna-navy mt-8">3. Komunitas & Organisasi</h2>
            <p className="text-gray-600">
              Komunitas dan organisasi yang dibuat harus mematuhi pedoman platform. Admin berhak menangguhkan atau menolak komunitas yang melanggar.
            </p>

            <h2 className="text-2xl font-bold text-komuna-navy mt-8">4. Event</h2>
            <p className="text-gray-600">
              Event harus diselenggarakan sesuai dengan ketentuan platform. Kapasitas kuota bersifat ketat dan tidak dapat dilampaui.
            </p>

            <h2 className="text-2xl font-bold text-komuna-navy mt-8">5. Moderasi Konten</h2>
            <p className="text-gray-600">
              Platform berhak melakukan moderasi terhadap konten yang melanggar pedoman komunitas.
            </p>

            <h2 className="text-2xl font-bold text-komuna-navy mt-8">6. Penghapusan Akun</h2>
            <p className="text-gray-600">
              Pengguna dapat meminta penghapusan akun. Data akan di-soft delete sesuai dengan kebijakan retensi data.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
