import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "FAQ - KomunaID",
  description: "Pertanyaan umum seputar penggunaan platform KomunaID, termasuk pendaftaran, komunitas, event, dan kebijakan platform.",
};

export default function FAQPage() {
  const faqs = [
    {
      q: "Apa itu KomunaID?",
      a: "KomunaID adalah platform digital untuk menghubungkan individu, komunitas, organisasi, dan event di Indonesia.",
    },
    {
      q: "Bagaimana cara bergabung dengan komunitas?",
      a: "Anda bisa menjelajahi direktori komunitas, lalu klik bergabung. Untuk komunitas tipe OPEN, Anda langsung menjadi anggota. Untuk RESTRICTED, Anda perlu menunggu persetujuan admin.",
    },
    {
      q: "Apakah saya bisa membuat komunitas sendiri?",
      a: "Ya, setelah mendaftar sebagai member, Anda bisa membuat komunitas. Komunitas baru akan melalui proses approval oleh admin platform sebelum tampil di direktori publik.",
    },
    {
      q: "Bagaimana cara mendaftar event?",
      a: "Buka halaman event, pilih event yang diinginkan, lalu klik Daftar. Pastikan kuota masih tersedia dan tanggal event belum lewat.",
    },
    {
      q: "Apakah ada biaya untuk menggunakan KomunaID?",
      a: "Untuk fase MVP, KomunaID dapat digunakan secara gratis.",
    },
    {
      q: "Bagaimana cara melaporkan konten yang melanggar?",
      a: "Gunakan fitur Report Abuse yang tersedia di setiap halaman komunitas, event, atau profil pengguna.",
    },
  ];

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
            <Link href="/faq" className="text-komuna-blue">FAQ</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login" className="px-4 py-2 text-sm font-medium text-komuna-navy hover:text-komuna-blue">Masuk</Link>
            <Link href="/register" className="px-4 py-2 text-sm font-medium text-white bg-komuna-blue rounded-lg hover:bg-komuna-navy">Daftar</Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-komuna-navy mb-8">Pertanyaan Umum (FAQ)</h1>
          <div className="space-y-6">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white border rounded-lg p-6">
                <h3 className="text-lg font-semibold text-komuna-navy mb-2">{faq.q}</h3>
                <p className="text-gray-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
