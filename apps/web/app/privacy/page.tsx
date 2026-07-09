import Link from "next/link";

export default function PrivacyPage() {
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
          <h1 className="text-4xl font-bold text-komuna-navy mb-8">Kebijakan Privasi</h1>
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600">Terakhir diperbarui: Juli 2026</p>

            <h2 className="text-2xl font-bold text-komuna-navy mt-8">1. Informasi yang Kami Kumpulkan</h2>
            <p className="text-gray-600">
              Kami mengumpulkan informasi yang Anda berikan saat mendaftar, termasuk nama, email, dan informasi profil lainnya.
            </p>

            <h2 className="text-2xl font-bold text-komuna-navy mt-8">2. Penggunaan Informasi</h2>
            <p className="text-gray-600">
              Informasi digunakan untuk menyediakan layanan platform, mengelola akun, dan berkomunikasi dengan Anda.
            </p>

            <h2 className="text-2xl font-bold text-komuna-navy mt-8">3. Keamanan Data</h2>
            <p className="text-gray-600">
              Kami menggunakan enkripsi dan langkah-langkah keamanan yang sesuai untuk melindungi data Anda.
            </p>

            <h2 className="text-2xl font-bold text-komuna-navy mt-8">4. Berbagi Informasi</h2>
            <p className="text-gray-600">
              Kami tidak menjual atau membagikan informasi pribadi Anda kepada pihak ketiga tanpa persetujuan Anda.
            </p>

            <h2 className="text-2xl font-bold text-komuna-navy mt-8">5. Hak Anda</h2>
            <p className="text-gray-600">
              Anda memiliki hak untuk mengakses, memperbarui, atau menghapus data pribadi Anda kapan saja.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
