import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <img src="/icon_komuna.png" alt="KomunaID" className="h-8 w-8" />
            <span className="font-bold text-xl text-komuna-navy">KomunaID</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link href="/communities" className="hover:text-komuna-blue transition-colors">
              Komunitas
            </Link>
            <Link href="/events" className="hover:text-komuna-blue transition-colors">
              Event
            </Link>
            <Link href="/organizations" className="hover:text-komuna-blue transition-colors">
              Organisasi
            </Link>
            <Link href="/about" className="hover:text-komuna-blue transition-colors">
              Tentang
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium text-komuna-navy hover:text-komuna-blue transition-colors"
            >
              Masuk
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 text-sm font-medium text-white bg-komuna-blue rounded-lg hover:bg-komuna-navy transition-colors"
            >
              Daftar
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 flex items-center justify-center bg-gradient-to-br from-komuna-navy via-komuna-blue to-komuna-teal text-white">
        <div className="container mx-auto px-4 py-24 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Platform - People - Community - Partnership
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-komuna-aqua/90 max-w-2xl mx-auto">
            Terhubung. Berdaya. Berdampak.
          </p>
          <p className="text-lg mb-10 text-white/80 max-w-xl mx-auto">
            Menghubungkan individu, komunitas, organisasi, dan ekosistem kolaborasi
            secara terstruktur di Indonesia.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="px-8 py-3 text-base font-semibold bg-komuna-aqua text-komuna-navy rounded-lg hover:bg-white transition-colors"
            >
              Mulai Sekarang
            </Link>
            <Link
              href="/communities"
              className="px-8 py-3 text-base font-semibold border-2 border-white/30 text-white rounded-lg hover:bg-white/10 transition-colors"
            >
              Jelajahi Komunitas
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-komuna-blue">100+</div>
              <div className="text-sm text-gray-600 mt-1">Komunitas</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-komuna-blue">500+</div>
              <div className="text-sm text-gray-600 mt-1">Anggota</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-komuna-blue">50+</div>
              <div className="text-sm text-gray-600 mt-1">Event</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-komuna-blue">25+</div>
              <div className="text-sm text-gray-600 mt-1">Kota</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-komuna-navy mb-12">
            Mengapa KomunaID?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="h-12 w-12 bg-komuna-blue/10 rounded-lg flex items-center justify-center mb-4">
                <svg className="h-6 w-6 text-komuna-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-komuna-navy mb-2">Komunitas Terstruktur</h3>
              <p className="text-gray-600 text-sm">Buat dan kelola komunitas dengan sistem keanggotaan yang terstruktur.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="h-12 w-12 bg-komuna-teal/10 rounded-lg flex items-center justify-center mb-4">
                <svg className="h-6 w-6 text-komuna-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-komuna-navy mb-2">Event Management</h3>
              <p className="text-gray-600 text-sm">Jadwalkan dan kelola event dengan kuota terbatas dan registrasi online.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="h-12 w-12 bg-komuna-aqua/10 rounded-lg flex items-center justify-center mb-4">
                <svg className="h-6 w-6 text-komuna-aqua" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-komuna-navy mb-2">Keamanan & Moderasi</h3>
              <p className="text-gray-600 text-sm">Sistem approval, RBAC, dan moderasi konten untuk keamanan platform.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-komuna-navy text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img src="/icon_komuna.png" alt="KomunaID" className="h-8 w-8" />
                <span className="font-bold text-lg">KomunaID</span>
              </div>
              <p className="text-sm text-white/70">Terhubung. Berdaya. Berdampak.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Platform</h4>
              <div className="flex flex-col gap-2 text-sm text-white/70">
                <Link href="/communities" className="hover:text-komuna-aqua">Komunitas</Link>
                <Link href="/events" className="hover:text-komuna-aqua">Event</Link>
                <Link href="/organizations" className="hover:text-komuna-aqua">Organisasi</Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Legal</h4>
              <div className="flex flex-col gap-2 text-sm text-white/70">
                <Link href="/terms" className="hover:text-komuna-aqua">Syarat & Ketentuan</Link>
                <Link href="/privacy" className="hover:text-komuna-aqua">Kebijakan Privasi</Link>
                <Link href="/community-guidelines" className="hover:text-komuna-aqua">Panduan Komunitas</Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Tentang</h4>
              <div className="flex flex-col gap-2 text-sm text-white/70">
                <Link href="/about" className="hover:text-komuna-aqua">Tentang Kami</Link>
                <Link href="/faq" className="hover:text-komuna-aqua">FAQ</Link>
                <Link href="/contact" className="hover:text-komuna-aqua">Kontak</Link>
              </div>
            </div>
          </div>
          <div className="border-t border-white/10 mt-8 pt-8 text-center text-sm text-white/50">
            &copy; {new Date().getFullYear()} PT Komuna Digital Indonesia. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
