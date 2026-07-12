import type { Metadata } from "next";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: "Syarat & Ketentuan",
  description: "Syarat dan ketentuan penggunaan platform KomunaID.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="container mx-auto px-4 py-16 flex-1">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-komuna-navy mb-3">Syarat & Ketentuan</h1>
          <p className="text-gray-500 mb-10">Terakhir diperbarui: Juli 2026</p>
          <div className="space-y-8">
            <section className="bg-white border rounded-xl p-6">
              <h2 className="text-xl font-bold text-komuna-navy mb-3">1. Penerimaan Syarat</h2>
              <p className="text-gray-600">Dengan mengakses dan menggunakan platform KomunaID, Anda menyetujui untuk terikat oleh syarat dan ketentuan ini. Jika Anda tidak setuju, harap tidak menggunakan platform ini.</p>
            </section>
            <section className="bg-white border rounded-xl p-6">
              <h2 className="text-xl font-bold text-komuna-navy mb-3">2. Akun Pengguna</h2>
              <p className="text-gray-600">Anda bertanggung jawab untuk menjaga kerahasiaan akun Anda. Satu email hanya dapat digunakan untuk satu akun. Anda wajib memberikan informasi yang benar saat pendaftaran.</p>
            </section>
            <section className="bg-white border rounded-xl p-6">
              <h2 className="text-xl font-bold text-komuna-navy mb-3">3. Komunitas</h2>
              <p className="text-gray-600">Komunitas yang dibuat harus mematuhi pedoman platform. Admin berhak menangguhkan atau menolak komunitas yang melanggar ketentuan. Komunitas baru akan melalui proses review sebelum tampil di direktori publik.</p>
            </section>
            <section className="bg-white border rounded-xl p-6">
              <h2 className="text-xl font-bold text-komuna-navy mb-3">4. Event</h2>
              <p className="text-gray-600">Event harus diselenggarakan sesuai dengan ketentuan platform. Kapasitas kuota bersifat ketat dan tidak dapat dilampaui. Pembatalan event harus dilakukan sesuai dengan pedoman yang berlaku.</p>
            </section>
            <section className="bg-white border rounded-xl p-6">
              <h2 className="text-xl font-bold text-komuna-navy mb-3">5. Moderasi Konten</h2>
              <p className="text-gray-600">Platform berhak melakukan moderasi terhadap konten yang melanggar pedoman komunitas. Konten yang melanggar dapat dihapus tanpa pemberitahuan sebelumnya.</p>
            </section>
            <section className="bg-white border rounded-xl p-6">
              <h2 className="text-xl font-bold text-komuna-navy mb-3">6. Penghapusan Akun</h2>
              <p className="text-gray-600">Pengguna dapat meminta penghapusan akun. Data akan di-soft delete sesuai dengan kebijakan retensi data yang berlaku.</p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
