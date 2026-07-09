import Link from "next/link";

export default function EventGuidelinesPage() {
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
          <h1 className="text-4xl font-bold text-komuna-navy mb-8">Panduan Event</h1>
          <div className="prose prose-lg max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-bold text-komuna-navy">1. Pembuatan Event</h2>
              <p className="text-gray-600">Event hanya dapat dibuat oleh Community Owner/Admin atau Organization Owner/Admin yang telah terverifikasi.</p>
            </section>
            <section>
              <h2 className="text-2xl font-bold text-komuna-navy">2. Informasi Event</h2>
              <p className="text-gray-600">Setiap event wajib menyertakan judul, deskripsi, tanggal pelaksanaan, lokasi, dan kuota peserta.</p>
            </section>
            <section>
              <h2 className="text-2xl font-bold text-komuna-navy">3. Kuota dan Pendaftaran</h2>
              <p className="text-gray-600">Kuota peserta bersifat ketat. Jika kuota penuh, pendaftaran otomatis terkunci. Member hanya bisa mendaftar pada event aktif.</p>
            </section>
            <section>
              <h2 className="text-2xl font-bold text-komuna-navy">4. Pembatalan Event</h2>
              <p className="text-gray-600">Pembatalan event harus dilakukan minimal 24 jam sebelum waktu pelaksanaan. Peserta yang sudah terdaftar akan mendapat notifikasi.</p>
            </section>
            <section>
              <h2 className="text-2xl font-bold text-komuna-navy">5. Pelaporan</h2>
              <p className="text-gray-600">Jika menemukan event yang mencurigakan atau melanggar pedoman, laporkan melalui fitur Report Abuse.</p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
