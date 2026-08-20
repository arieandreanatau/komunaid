import type { Metadata } from "next";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: "Panduan Event",
  description: "Panduan dan pedoman penyelenggaraan event di platform KomunaID.",
};

export default function EventGuidelinesPage() {
  return (
    <div className="min-h-screen flex flex-col bg-komuna-cream text-komuna-dark">
      <Header />
      <main className="container mx-auto px-4 py-16 flex-1">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-display text-4xl font-semibold tracking-[-0.03em] text-komuna-dark mb-3">Panduan Event</h1>
          <p className="text-gray-500 text-lg mb-10">Pedoman penyelenggaraan event yang sukses dan terstruktur di KomunaID.</p>
          <div className="space-y-8">
            <section className="bg-white border rounded-xl p-6">
              <h2 className="text-xl font-bold text-komuna-navy mb-3">1. Pembuatan Event</h2>
              <p className="text-gray-600">Event hanya dapat dibuat oleh Community Owner/Admin yang telah terverifikasi. Event baru berstatus DRAFT dan harus dipublikasikan untuk terlihat oleh peserta.</p>
            </section>
            <section className="bg-white border rounded-xl p-6">
              <h2 className="text-xl font-bold text-komuna-navy mb-3">2. Informasi Event</h2>
              <p className="text-gray-600">Setiap event wajib menyertakan judul, deskripsi, tanggal pelaksanaan, lokasi, jenis lokasi (Offline/Online/Hybrid), dan kuota peserta. Informasi kontak panitia juga diperlukan.</p>
            </section>
            <section className="bg-white border rounded-xl p-6">
              <h2 className="text-xl font-bold text-komuna-navy mb-3">3. Kuota dan Pendaftaran</h2>
              <p className="text-gray-600">Kuota peserta bersifat ketat. Jika kuota penuh, pendaftaran otomatis terkunci. Opsi waiting list tersedia jika panitia mengaktifkannya. Peserta hanya bisa mendaftar pada event dengan status REGISTRATION_OPEN.</p>
            </section>
            <section className="bg-white border rounded-xl p-6">
              <h2 className="text-xl font-bold text-komuna-navy mb-3">4. Pembatalan Event</h2>
              <p className="text-gray-600">Pembatalan event harus dilakukan sesuai dengan state machine yang berlaku. Peserta yang sudah terdaftar akan mendapat notifikasi pembatalan. Pembatalan tidak dapat dilakukan pada event yang sudah COMPLETED atau ARCHIVED.</p>
            </section>
            <section className="bg-white border rounded-xl p-6">
              <h2 className="text-xl font-bold text-komuna-navy mb-3">5. Pelaporan</h2>
              <p className="text-gray-600">Jika menemukan event yang mencurigakan atau melanggar pedoman, laporkan melalui fitur Report Abuse. Laporan akan ditinjau oleh admin platform dan ditindaklanjuti sesuai kebijakan moderasi.</p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
