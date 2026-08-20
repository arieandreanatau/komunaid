import type { Metadata } from "next";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: "Panduan Volunteer",
  description: "Panduan lengkap untuk menjadi relawan di platform KomunaID. Pelajari alur pendaftaran, aturan, dan kode etik volunteer.",
};

export default function VolunteerGuidelinesPage() {
  return (
    <div className="min-h-screen flex flex-col bg-komuna-cream text-komuna-dark">
      <main className="container mx-auto px-4 py-16 flex-1">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-display text-4xl font-semibold tracking-[-0.03em] text-komuna-dark mb-6">Panduan Volunteer</h1>
          <p className="text-gray-600 text-lg mb-10">
            Panduan lengkap untuk menjadi relawan di KomunaID. Pastikan Anda memahami seluruh prosedur sebelum mendaftar.
          </p>

          <div className="space-y-8">
            <section className="bg-white border rounded-xl p-6">
              <h2 className="text-xl font-bold text-komuna-navy mb-3">1. Pendaftaran</h2>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-komuna-teal mt-1">&#10003;</span>
                  <span>Daftar akun di KomunaID jika belum memiliki akun.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-komuna-teal mt-1">&#10003;</span>
                  <span>Browse peluang volunteer yang tersedia di halaman Volunteer.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-komuna-teal mt-1">&#10003;</span>
                  <span>Pilih posisi yang sesuai dengan minat dan kemampuan Anda.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-komuna-teal mt-1">&#10003;</span>
                  <span>Isi formulir pendaftaran dengan data yang benar, termasuk motivasi dan pengalaman.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-komuna-teal mt-1">&#10003;</span>
                  <span>Centang pernyataan persetujuan sebelum mengirim pendaftaran.</span>
                </li>
              </ul>
            </section>

            <section className="bg-white border rounded-xl p-6">
              <h2 className="text-xl font-bold text-komuna-navy mb-3">2. Seleksi & Review</h2>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-komuna-blue mt-1">&#9679;</span>
                  <span>Panitia akan meninjau setiap pendaftaran yang masuk.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-komuna-blue mt-1">&#9679;</span>
                  <span>Status pendaftaran dapat dipantau di dashboard volunteer Anda.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-komuna-blue mt-1">&#9679;</span>
                  <span>Jika diterima, Anda akan mendapat notifikasi dan informasi lebih lanjut.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-komuna-blue mt-1">&#9679;</span>
                  <span>Jika ditolak, Anda dapat mendaftar ke posisi lain atau kesempatan volunteer berikutnya.</span>
                </li>
              </ul>
            </section>

            <section className="bg-white border rounded-xl p-6">
              <h2 className="text-xl font-bold text-komuna-navy mb-3">3. Pelaksanaan</h2>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-komuna-teal mt-1">&#10003;</span>
                  <span>Hadir tepat waktu sesuai jadwal shift yang telah ditentukan.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-komuna-teal mt-1">&#10003;</span>
                  <span>Lakukan check-in dan check-out melalui sistem untuk pencatatan kehadiran.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-komuna-teal mt-1">&#10003;</span>
                  <span>Ikuti briefing sebelum pelaksanaan kegiatan.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-komuna-teal mt-1">&#10003;</span>
                  <span>Koordinasi dengan PIC (Person In Charge) yang telah ditugaskan.</span>
                </li>
              </ul>
            </section>

            <section className="bg-white border rounded-xl p-6">
              <h2 className="text-xl font-bold text-komuna-navy mb-3">4. Aturan & Kode Etik</h2>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">&#10007;</span>
                  <span>Dilarang melakukan tindakan yang merugikan peserta atau panitia.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">&#10007;</span>
                  <span>Dilarang meninggalkan tanggung jawab tanpa pemberitahuan sebelumnya.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">&#10007;</span>
                  <span>Dilarang menggunakan data peserta untuk kepentingan pribadi.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-komuna-teal mt-1">&#10003;</span>
                  <span>Menjaga profesionalisme dan sikap positif selama kegiatan berlangsung.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-komuna-teal mt-1">&#10003;</span>
                  <span>Mematuhi seluruh instruksi dari panitia dan PIC.</span>
                </li>
              </ul>
            </section>

            <section className="bg-white border rounded-xl p-6">
              <h2 className="text-xl font-bold text-komuna-navy mb-3">5. Penghargaan & Sertifikat</h2>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-komuna-teal mt-1">&#10003;</span>
                  <span>Volunteer yang menyelesaikan kegiatan akan mendapatkan sertifikat apresiasi.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-komuna-teal mt-1">&#10003;</span>
                  <span>Riwayat kegiatan volunteer akan tercatat di profil Anda.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-komuna-teal mt-1">&#10003;</span>
                  <span>Volunteer berprestasi berkesempatan menjadi PIC di kegiatan selanjutnya.</span>
                </li>
              </ul>
            </section>
          </div>

          <div className="mt-10 bg-gradient-to-r from-komuna-teal to-komuna-aqua rounded-xl p-6 text-center">
            <h3 className="text-xl font-bold text-white mb-2">Siap Menjadi Relawan?</h3>
            <p className="text-white/80 mb-4">Temukan peluang volunteer yang sesuai dengan minat Anda.</p>
            <a
              href="/volunteer"
              className="inline-block px-6 py-3 bg-white text-komuna-teal rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Lihat Peluang Volunteer
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
