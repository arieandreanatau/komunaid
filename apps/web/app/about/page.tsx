import Link from "next/link";

export default function AboutPage() {
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
            <Link href="/about" className="text-komuna-blue">Tentang</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login" className="px-4 py-2 text-sm font-medium text-komuna-navy hover:text-komuna-blue">Masuk</Link>
            <Link href="/register" className="px-4 py-2 text-sm font-medium text-white bg-komuna-blue rounded-lg hover:bg-komuna-navy">Daftar</Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-komuna-navy mb-6">Tentang KomunaID</h1>
          <div className="prose prose-lg">
            <p className="text-gray-600 text-lg leading-relaxed">
              KomunaID adalah platform digital yang menghubungkan individu, komunitas, organisasi, 
              event, dan ekosistem kolaborasi secara terstruktur di Indonesia.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Didirikan oleh PT Komuna Digital Indonesia, kami berkomitmen untuk membangun ekosistem 
              komunitas digital yang inklusif, aman, dan bermanfaat bagi semua anggota.
            </p>
            <h2 className="text-2xl font-bold text-komuna-navy mt-8">Misi Kami</h2>
            <ul className="text-gray-600 space-y-2">
              <li>Menyediakan platform yang memudahkan pembentukan dan pengelolaan komunitas</li>
              <li>Menghubungkan individu dengan komunitas dan organisasi yang sesuai dengan minat mereka</li>
              <li>Memfasilitasi penyelenggaraan event yang terstruktur dan terukur</li>
              <li>Membangun ekosistem kolaborasi yang sehat dan produktif</li>
            </ul>
            <h2 className="text-2xl font-bold text-komuna-navy mt-8">Nilai-Nilai Kami</h2>
            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-komuna-navy">Terhubung</h3>
                <p className="text-sm text-gray-600">Membangun jaringan yang menghubungkan orang-orang dengan minat yang sama.</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-komuna-navy">Berdaya</h3>
                <p className="text-sm text-gray-600">Memberdayakan komunitas untuk tumbuh dan berkembang bersama.</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-komuna-navy">Berdampak</h3>
                <p className="text-sm text-gray-600">Menciptakan dampak positif bagi masyarakat melalui kolaborasi.</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-komuna-navy">Inklusif</h3>
                <p className="text-sm text-gray-600">Membuka pintu bagi semua orang untuk bergabung dan berkontribusi.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
