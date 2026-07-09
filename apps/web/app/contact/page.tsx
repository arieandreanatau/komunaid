import Link from "next/link";

export default function ContactPage() {
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
          <h1 className="text-4xl font-bold text-komuna-navy mb-8">Hubungi Kami</h1>
          <div className="bg-white border rounded-lg p-8">
            <p className="text-gray-600 mb-6">
              Punya pertanyaan atau masukan? Silakan hubungi kami melalui:
            </p>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-komuna-navy">Email</h3>
                <p className="text-gray-600">support@komuna.id</p>
              </div>
              <div>
                <h3 className="font-semibold text-komuna-navy">Perusahaan</h3>
                <p className="text-gray-600">PT Komuna Digital Indonesia</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
