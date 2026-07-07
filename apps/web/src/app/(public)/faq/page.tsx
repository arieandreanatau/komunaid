'use client';

import { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const faqs = [
  {
    question: 'Apa itu KomunaID?',
    answer:
      'KomunaID adalah platform digital yang menghubungkan individu, komunitas, organisasi, event, dan ekosistem kolaborasi di Indonesia. Platform ini memudahkan Anda untuk menemukan, bergabung, dan berinteraksi dengan komunitas yang sesuai minat Anda.',
  },
  {
    question: 'Bagaimana cara mendaftar di KomunaID?',
    answer:
      'Klik tombol "Register" di halaman utama, isi formulir pendaftaran dengan nama, email, dan password Anda. Setelah itu, Anda akan langsung bisa mengakses seluruh fitur platform.',
  },
  {
    question: 'Apakah KomunaID gratis?',
    answer:
      'Ya, KomunaID dapat digunakan secara gratis untuk semua pengguna. Anda bisa bergabung dengan komunitas, mengikuti event, dan berinteraksi dengan anggota lain tanpa biaya.',
  },
  {
    question: 'Bagaimana cara membuat komunitas?',
    answer:
      'Masuk ke dashboard Anda, navigasi ke "My Communities", dan klik "Create Community". Isi informasi yang diperlukan seperti nama, deskripsi, kategori, dan logo komunitas.',
  },
  {
    question: 'Bagaimana cara bergabung dengan komunitas?',
    answer:
      'Cari komunitas yang Anda minati melalui halaman Communities, lalu klik tombol "Gabung" pada halaman detail komunitas. Beberapa komunitas mungkin memerlukan persetujuan dari admin.',
  },
  {
    question: 'Bagaimana cara membuat event?',
    answer:
      'Sebagai admin komunitas, Anda bisa membuat event melalui dashboard admin komunitas. Klik menu "Events" di sidebar, lalu "Create Event". Isi detail event seperti judul, tanggal, lokasi, dan deskripsi.',
  },
  {
    question: 'Bagaimana cara melaporkan konten yang tidak pantas?',
    answer:
      'Klik tombol "Report" pada konten yang ingin dilaporkan, pilih alasan pelaporan, dan berikan deskripsi singkat. Tim moderasi kami akan meninjau laporan Anda.',
  },
  {
    question: 'Bagaimana cara menghubungi tim support?',
    answer:
      'Anda bisa menghubungi kami melalui halaman Contact di website, atau mengirim email ke support@komunaid.com. Tim kami akan merespon dalam 1x24 jam.',
  },
  {
    question: 'Apakah data saya aman di KomunaID?',
    answer:
      'Ya, kami sangat menjaga keamanan data pengguna. Kami menggunakan enkripsi data, autentikasi token, dan mengikuti standar keamanan data yang berlaku.',
  },
  {
    question: 'Bisakah saya menghapus akun?',
    answer:
      'Ya, Anda bisa menghapus akun melalui halaman Settings di dashboard. Perlu diingat bahwa penghapusan akun bersifat permanen dan tidak dapat dibatalkan.',
  },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="container-komuna py-16">
      <div className="mx-auto max-w-3xl">
        <div className="mb-10 text-center">
          <HelpCircle className="mx-auto mb-4 h-12 w-12 text-royal" />
          <h1 className="mb-3 text-4xl font-bold text-gray-900">FAQ</h1>
          <p className="text-gray-500">Pertanyaan yang sering ditanyakan seputar KomunaID</p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div key={index} className="card !p-0 overflow-hidden">
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="flex w-full items-center justify-between px-6 py-4 text-left"
              >
                <span className="text-sm font-semibold text-gray-900">{faq.question}</span>
                <ChevronDown
                  className={cn(
                    'h-5 w-5 flex-shrink-0 text-gray-400 transition-transform',
                    openIndex === index && 'rotate-180',
                  )}
                />
              </button>
              {openIndex === index && (
                <div className="border-t border-gray-100 px-6 py-4">
                  <p className="text-sm text-gray-600 leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
