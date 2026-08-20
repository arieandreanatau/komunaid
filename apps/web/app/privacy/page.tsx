import type { Metadata } from "next";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: "Kebijakan Privasi",
  description: "Kebijakan privasi KomunaID tentang pengumpulan, penggunaan, dan perlindungan data pribadi Anda.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-komuna-cream text-komuna-dark">
      <Header />
      <main className="container mx-auto px-4 py-16 flex-1">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-display text-4xl font-semibold tracking-[-0.03em] text-komuna-dark mb-3">Kebijakan Privasi</h1>
          <p className="text-gray-500 mb-10">Terakhir diperbarui: Juli 2026</p>
          <div className="space-y-8">
            <section className="bg-white border rounded-xl p-6">
              <h2 className="text-xl font-bold text-komuna-navy mb-3">1. Informasi yang Kami Kumpulkan</h2>
              <p className="text-gray-600">Kami mengumpulkan informasi yang Anda berikan saat mendaftar, termasuk nama, email, username, dan informasi profil lainnya. Kami juga mengumpulkan data penggunaan platform untuk meningkatkan layanan.</p>
            </section>
            <section className="bg-white border rounded-xl p-6">
              <h2 className="text-xl font-bold text-komuna-navy mb-3">2. Penggunaan Informasi</h2>
              <p className="text-gray-600">Informasi digunakan untuk menyediakan layanan platform, mengelola akun, berkomunikasi dengan Anda, dan meningkatkan pengalaman pengguna. Kami tidak menggunakan data Anda untuk tujuan yang tidak terkait dengan layanan platform.</p>
            </section>
            <section className="bg-white border rounded-xl p-6">
              <h2 className="text-xl font-bold text-komuna-navy mb-3">3. Keamanan Data</h2>
              <p className="text-gray-600">Kami menggunakan enkripsi, autentikasi JWT, CSRF token, dan langkah-langkah keamanan lainnya untuk melindungi data Anda dari akses tidak sah.</p>
            </section>
            <section className="bg-white border rounded-xl p-6">
              <h2 className="text-xl font-bold text-komuna-navy mb-3">4. Berbagi Informasi</h2>
              <p className="text-gray-600">Kami tidak menjual atau membagikan informasi pribadi Anda kepada pihak ketiga tanpa persetujuan Anda, kecuali diwajibkan oleh hukum.</p>
            </section>
            <section className="bg-white border rounded-xl p-6">
              <h2 className="text-xl font-bold text-komuna-navy mb-3">5. Hak Anda</h2>
              <p className="text-gray-600">Anda memiliki hak untuk mengakses, memperbarui, atau menghapus data pribadi Anda kapan saja melalui dashboard pengaturan akun Anda.</p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
