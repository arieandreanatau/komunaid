import type { Metadata } from "next";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: "Panduan Komunitas",
  description: "Panduan dan pedoman penggunaan komunitas di platform KomunaID.",
};

export default function CommunityGuidelinesPage() {
  return (
    <div className="min-h-screen flex flex-col bg-komuna-cream text-komuna-dark">
      <Header />
      <main className="container mx-auto px-4 py-16 flex-1">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-display text-4xl font-semibold tracking-[-0.03em] text-komuna-dark mb-3">Panduan Komunitas</h1>
          <p className="text-gray-500 text-lg mb-10">Pedoman untuk menciptakan lingkungan komunitas yang sehat dan produktif.</p>
          <div className="space-y-8">
            <section className="bg-white border rounded-xl p-6">
              <h2 className="text-xl font-bold text-komuna-navy mb-3">1. Menghormati Anggota</h2>
              <p className="text-gray-600">Semua anggota komunitas wajib saling menghormati tanpa memandang latar belakang, agama, suku, atau status sosial. Diskriminasi dan pelecehan dalam bentuk apapun tidak akan ditoleransi.</p>
            </section>
            <section className="bg-white border rounded-xl p-6">
              <h2 className="text-xl font-bold text-komuna-navy mb-3">2. Konten yang Sesuai</h2>
              <p className="text-gray-600">Dilarang membagikan konten yang mengandung SARA, pornografi, kekerasan, misinformasi, atau hal-hal yang melanggar hukum dan ketertiban umum.</p>
            </section>
            <section className="bg-white border rounded-xl p-6">
              <h2 className="text-xl font-bold text-komuna-navy mb-3">3. Spam dan Promosi</h2>
              <p className="text-gray-600">Dilarang melakukan spam atau promosi yang tidak relevan tanpa izin admin komunitas. Konten komersial harus sesuai dengan tema dan aturan komunitas.</p>
            </section>
            <section className="bg-white border rounded-xl p-6">
              <h2 className="text-xl font-bold text-komuna-navy mb-3">4. Privasi dan Keamanan</h2>
              <p className="text-gray-600">Dilarang membagikan informasi pribadi anggota lain tanpa persetujuan mereka. Jaga keamanan akun Anda dan segera laporkan aktivitas mencurigakan.</p>
            </section>
            <section className="bg-white border rounded-xl p-6">
              <h2 className="text-xl font-bold text-komuna-navy mb-3">5. Moderasi</h2>
              <p className="text-gray-600">Admin komunitas berhak menindak anggota yang melanggar panduan ini, termasuk peringatan, penangguhan, atau pengeluaran dari komunitas. Keputusan admin bersifat final.</p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
