import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { JsonLd } from "@/components/json-ld";

export const metadata: Metadata = {
  title: "Tentang KomunaID",
  description: "Pelajari lebih lanjut tentang KomunaID, visi, misi, nilai, dan cara kerja platform komunitas digital Indonesia.",
  openGraph: {
    title: "Tentang KomunaID",
    description: "Pelajari lebih lanjut tentang KomunaID, platform komunitas digital Indonesia.",
  },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-komuna-cream text-komuna-dark">
      <JsonLd type="organization" />
      <Header />

      <main className="flex-1">
        <section className="bg-gradient-to-br from-komuna-navy via-komuna-blue to-komuna-teal text-white py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="font-display text-4xl md:text-5xl font-semibold tracking-[-0.03em] mb-4">Tentang KomunaID</h1>
            <p className="text-xl text-komuna-aqua/90 max-w-2xl mx-auto">
              Terhubung. Berdaya. Berdampak.
            </p>
          </div>
        </section>

        <section className="border-b border-gray-100 bg-white">
          <div className="container mx-auto flex flex-wrap gap-2 px-4 py-4 justify-center" aria-label="Navigasi halaman Tentang">
            <Link href="/about" className="rounded-full bg-komuna-forest px-4 py-2 text-sm font-bold text-white">Tentang Kami</Link>
            <Link href="/organization-structure" className="rounded-full border border-komuna-forest/20 px-4 py-2 text-sm font-bold text-komuna-forest transition hover:bg-komuna-forest/5">Struktur Organisasi</Link>
            <Link href="/contact" className="rounded-full border border-komuna-forest/20 px-4 py-2 text-sm font-bold text-komuna-forest transition hover:bg-komuna-forest/5">Kontak</Link>
            <Link href="/saran" className="rounded-full border border-komuna-forest/20 px-4 py-2 text-sm font-bold text-komuna-forest transition hover:bg-komuna-forest/5">Saran</Link>
            <Link href="/admin/login" className="rounded-full border border-komuna-forest/20 px-4 py-2 text-sm font-bold text-komuna-forest transition hover:bg-komuna-forest/5">Platform Access</Link>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="grid md:grid-cols-2 gap-12 mb-16">
                <div>
                  <h2 className="text-2xl font-bold text-komuna-navy mb-4">Visi Kami</h2>
                  <p className="text-gray-600 leading-relaxed">
                    Menjadi platform komunitas digital terbesar dan terpercaya di Indonesia yang menghubungkan setiap individu untuk berkolaborasi, berbagi, dan menciptakan dampak positif bersama.
                  </p>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-komuna-navy mb-4">Misi Kami</h2>
                  <ul className="space-y-3 text-gray-600">
                    <li className="flex items-start gap-3">
                      <span className="text-komuna-teal mt-1 shrink-0">&#10003;</span>
                      <span>Menyediakan platform yang memudahkan pembentukan dan pengelolaan komunitas digital yang terstruktur.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-komuna-teal mt-1 shrink-0">&#10003;</span>
                      <span>Menghubungkan individu dengan komunitas yang sesuai dengan minat mereka.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-komuna-teal mt-1 shrink-0">&#10003;</span>
                      <span>Memfasilitasi penyelenggaraan event yang terstruktur, terukur, dan inklusif.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-komuna-teal mt-1 shrink-0">&#10003;</span>
                      <span>Membangun ekosistem komunitas digital yang sehat, aman, dan produktif bagi seluruh anggota.</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mb-16">
                <h2 className="text-2xl font-bold text-komuna-navy mb-6">Tentang KomunaID</h2>
                <div className="prose prose-lg text-gray-600 space-y-4">
                  <p>
                    KomunaID adalah platform digital yang menghubungkan individu, komunitas, event, dan volunteer secara terstruktur di Indonesia. Didirikan oleh PT Komuna Digital Indonesia, kami berkomitmen untuk membangun ekosistem komunitas digital yang inklusif, aman, dan bermanfaat bagi semua anggota.
                  </p>
                  <p>
                    Platform ini hadir sebagai solusi atas tantangan pengelolaan komunitas digital yang selama ini masih terfragmentasi. Dengan fitur-fitur terintegrasi mulai dari manajemen keanggotaan, event management, volunteer matching, hingga analytics dashboard, KomunaID mempermudah setiap langkah dalam membangun dan mengembangkan komunitas.
                  </p>
                  <p>
                    Kami percaya bahwa setiap orang berhak untuk terhubung, berdaya, dan menciptakan dampak positif. Melalui KomunaID, kami ingin memastikan bahwa setiap komunitas memiliki akses ke alat yang dibutuhkan untuk tumbuh dan berkembang bersama.
                  </p>
                </div>
              </div>

              <div className="mb-16">
                <h2 className="text-2xl font-bold text-komuna-navy mb-6">Cara Kerja</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { step: "01", title: "Daftar & Buat Profil", desc: "Buat akun gratis dan lengkapi profil Anda untuk memulai." },
                    { step: "02", title: "Bergabung atau Buat Komunitas", desc: "Temukan komunitas yang sesuai minat atau buat komunitas baru sendiri." },
                    { step: "03", title: "Ikut Event & Volunteer", desc: "Daftar event dan peluang volunteer yang tersedia." },
                    { step: "04", title: "Berkolaborasi & Berdampak", desc: "Bangun jaringan, berkontribusi, dan ciptakan dampak positif bersama." },
                  ].map((item) => (
                    <div key={item.step} className="bg-white border rounded-xl p-6 relative">
                      <span className="text-5xl font-bold text-komuna-blue/10 absolute top-3 right-4">{item.step}</span>
                      <h3 className="text-lg font-semibold text-komuna-navy mb-2 relative z-10">{item.title}</h3>
                      <p className="text-sm text-gray-600 relative z-10">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-16">
                <h2 className="text-2xl font-bold text-komuna-navy mb-6">Nilai-Nilai Kami</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    { title: "Terhubung", desc: "Membangun jaringan yang menghubungkan orang-orang dengan minat yang sama untuk berkolaborasi.", bgClass: "bg-komuna-blue/5", borderClass: "border-komuna-blue" },
                    { title: "Berdaya", desc: "Memberdayakan komunitas untuk tumbuh, berkembang, dan mengelola diri secara mandiri.", bgClass: "bg-komuna-teal/5", borderClass: "border-komuna-teal" },
                    { title: "Berdampak", desc: "Menciptakan dampak positif yang nyata bagi masyarakat melalui kolaborasi dan kontribusi.", bgClass: "bg-komuna-aqua/5", borderClass: "border-komuna-aqua" },
                    { title: "Inklusif", desc: "Membuka pintu bagi semua orang untuk bergabung, berpartisipasi, dan berkontribusi tanpa diskriminasi.", bgClass: "bg-komuna-blue/5", borderClass: "border-komuna-blue" },
                    { title: "Aman", desc: "Menjamin keamanan dan privasi data seluruh pengguna melalui sistem moderasi dan keamanan yang ketat.", bgClass: "bg-komuna-teal/5", borderClass: "border-komuna-teal" },
                    { title: "Terstruktur", desc: "Menghadirkan sistem yang terorganisir dalam pengelolaan komunitas, event, dan keanggotaan.", bgClass: "bg-komuna-aqua/5", borderClass: "border-komuna-aqua" },
                  ].map((value) => (
                    <div key={value.title} className={`${value.bgClass} border-l-4 ${value.borderClass} p-5 rounded-r-lg`}>
                      <h3 className="font-semibold text-komuna-navy mb-2">{value.title}</h3>
                      <p className="text-sm text-gray-600">{value.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div id="platform-access" className="mb-16 rounded-2xl border border-komuna-forest/15 bg-komuna-soft p-8">
                <h2 className="text-2xl font-bold text-komuna-navy mb-3">Platform Access</h2>
                <p className="text-gray-600 leading-relaxed">
                  Area ini diperuntukkan bagi pengelola platform KomunaID yang memiliki akses administratif.
                </p>
                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <Link
                    href="/admin/login"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-komuna-forest text-white rounded-xl font-semibold hover:bg-komuna-dark transition-colors"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                    Masuk ke Platform
                  </Link>
                  <Link
                    href="/admin-access"
                    className="inline-flex items-center gap-2 px-6 py-3 border border-komuna-forest/25 text-komuna-forest rounded-xl font-semibold hover:bg-komuna-forest/5 transition-colors"
                  >
                    Informasi Akses
                  </Link>
                </div>
              </div>

              <div className="bg-gradient-to-r from-komuna-navy via-komuna-blue to-komuna-teal rounded-xl p-8 text-center text-white">
                <h2 className="text-2xl font-bold mb-3">Siap Bergabung?</h2>
                <p className="text-white/80 mb-6 max-w-lg mx-auto">
                  Mulai petualangan Anda di KomunaID. Daftar sekarang dan temukan komunitas yang tepat untuk Anda.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link
                    href="/register"
                    className="px-8 py-3 bg-komuna-aqua text-komuna-navy rounded-lg font-semibold hover:bg-white transition-colors"
                  >
                    Daftar Gratis
                  </Link>
                  <Link
                    href="/communities"
                    className="px-8 py-3 border-2 border-white/30 text-white rounded-lg font-semibold hover:bg-white/10 transition-colors"
                  >
                    Jelajahi Komunitas
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
