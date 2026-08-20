import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { JsonLd } from "@/components/json-ld";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Pertanyaan umum seputar penggunaan platform KomunaID, termasuk pendaftaran, komunitas, event, dan kebijakan platform.",
};

const faqs = [
  {
    q: "Apa itu KomunaID?",
    a: "KomunaID adalah platform digital untuk menghubungkan individu, komunitas, event, dan volunteer di Indonesia. Platform ini menyediakan tools terintegrasi untuk manajemen keanggotaan, event management, volunteer matching, dan masih banyak lagi.",
  },
  {
    q: "Bagaimana cara bergabung dengan komunitas?",
    a: "Anda bisa menjelajahi direktori komunitas, lalu klik bergabung. Untuk komunitas tipe OPEN, Anda langsung menjadi anggota. Untuk RESTRICTED, Anda perlu menunggu persetujuan admin komunitas.",
  },
  {
    q: "Apakah saya bisa membuat komunitas sendiri?",
    a: "Ya, setelah mendaftar sebagai member, Anda bisa membuat komunitas. Komunitas baru akan melalui proses approval oleh admin platform sebelum tampil di direktori publik.",
  },
  {
    q: "Bagaimana cara mendaftar event?",
    a: "Buka halaman event, pilih event yang diinginkan, lalu klik Daftar. Pastikan kuota masih tersedia dan tanggal event belum lewat. Anda akan mendapat notifikasi konfirmasi setelah berhasil mendaftar.",
  },
  {
    q: "Bagaimana cara menjadi volunteer?",
    a: "Buka halaman Volunteer, pilih peluang yang tersedia, lalu daftar dengan mengisi formulir motivasi dan memilih posisi. Panitia akan meninjau pendaftaran Anda.",
  },
  {
    q: "Apakah ada biaya untuk menggunakan KomunaID?",
    a: "Untuk fase MVP, KomunaID dapat digunakan secara gratis untuk seluruh fitur dasar termasuk membuat komunitas, mendaftar event, dan menjadi volunteer.",
  },
  {
    q: "Bagaimana cara melaporkan konten yang melanggar?",
    a: "Gunakan fitur Report Abuse yang tersedia di setiap halaman komunitas, event, atau profil pengguna. Laporan akan ditinjau oleh admin platform.",
  },
  {
    q: "Bagaimana cara mengatur keanggotaan komunitas?",
    a: "Pemilik dan admin komunitas dapat mengatur jenis keanggotaan (OPEN atau RESTRICTED), menyetujui atau menolak permintaan bergabung, serta mengelola role anggota.",
  },
];

export default function FAQPage() {
  return (
    <div className="min-h-screen flex flex-col bg-komuna-cream text-komuna-dark">
      <JsonLd type="website" data={{ potentialAction: { "@type": "SearchAction", target: "https://komuna.id/search?q={search_term_string}" } }} />
      <Header />

      <main className="container mx-auto px-4 py-16 flex-1">
        <div className="max-w-3xl mx-auto">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-komuna-coral mb-3">Bantuan</p>
          <h1 className="font-display text-4xl font-semibold tracking-[-0.03em] text-komuna-dark mb-3">Pertanyaan Umum (FAQ)</h1>
          <p className="text-komuna-dark/65 text-lg mb-10">
            Temukan jawaban atas pertanyaan yang paling sering ditanyakan tentang KomunaID.
          </p>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <details key={i} className="bg-white border rounded-xl overflow-hidden group" open={i === 0}>
                <summary className="px-6 py-4 cursor-pointer font-semibold text-komuna-navy hover:bg-gray-50 transition-colors flex items-center justify-between list-none">
                  {faq.q}
                  <svg className="h-5 w-5 text-gray-400 shrink-0 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-6 pb-4 text-gray-600 leading-relaxed border-t pt-3">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>

          <div className="mt-12 bg-gray-50 rounded-xl p-8 text-center">
            <h2 className="text-xl font-bold text-komuna-navy mb-2">Masih punya pertanyaan?</h2>
            <p className="text-gray-500 mb-4">Hubungi kami dan kami akan dengan senang hati membantu Anda.</p>
            <Link
              href="/contact"
              className="inline-block px-6 py-2.5 bg-komuna-blue text-white rounded-lg font-medium hover:bg-komuna-navy transition-colors"
            >
              Hubungi Kami
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
