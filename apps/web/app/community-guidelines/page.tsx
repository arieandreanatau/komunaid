import Link from "next/link";

export default function CommunityGuidelinesPage() {
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
          <h1 className="text-4xl font-bold text-komuna-navy mb-8">Panduan Komunitas</h1>
          <div className="prose prose-lg max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-bold text-komuna-navy">1. Menghormati Anggota</h2>
              <p className="text-gray-600">Semua anggota komunitas wajib saling menghormati tanpa memandang latar belakang, agama, suku, atau status sosial.</p>
            </section>
            <section>
              <h2 className="text-2xl font-bold text-komuna-navy">2. Konten yang Sesuai</h2>
              <p className="text-gray-600">Dilarang membagikan konten yang mengandung SARA, pornograksi, kekerasan, atau hal-hal yang melanggar hukum.</p>
            </section>
            <section>
              <h2 className="text-2xl font-bold text-komuna-navy">3. Spam dan Promosi</h2>
              <p className="text-gray-600">Dilarang melakukan spam atau promosi yang tidak relevan tanpa izin admin komunitas.</p>
            </section>
            <section>
              <h2 className="text-2xl font-bold text-komuna-navy">4. Privasi dan Keamanan</h2>
              <p className="text-gray-600">Dilarang membagikan informasi pribadi anggota lain tanpa persetujuan mereka.</p>
            </section>
            <section>
              <h2 className="text-2xl font-bold text-komuna-navy">5. Moderasi</h2>
              <p className="text-gray-600">Admin komunitas berhak menindak anggota yang melanggar panduan ini, termasuk peringatan, penangguhan, atau pengeluaran dari komunitas.</p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
