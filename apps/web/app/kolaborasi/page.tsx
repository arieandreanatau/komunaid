import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { JsonLd } from "@/components/json-ld";

export const metadata: Metadata = {
  title: "Kolaborasi Komunitas",
  description: "Ketika komunitas bertemu, lebih banyak hal bisa terjadi. Jelajahi bagaimana kolaborasi antar komunitas bekerja di KomunaID.",
  openGraph: {
    title: "Kolaborasi Komunitas | KomunaID",
    description: "Komunitas bereksplorasi dan berkolaborasi untuk menciptakan kegiatan bersama.",
  },
};

export default function KolaborasiPage() {
  return (
    <div className="min-h-screen flex flex-col bg-komuna-cream text-komuna-dark">
      <JsonLd type="website" />
      <Header />

      <main className="flex-1">
        <section className="bg-gradient-to-br from-komuna-navy via-komuna-blue to-komuna-teal px-4 py-20 text-white">
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-komuna-coral">Kolaborasi</p>
            <h1 className="mt-4 font-display text-4xl font-semibold tracking-[-0.03em] sm:text-6xl">Kolaborasi Komunitas</h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-white/75">
              Ketika komunitas bertemu, lebih banyak hal bisa terjadi.
            </p>
          </div>
        </section>

        <section className="px-4 py-16 sm:py-20">
          <div className="mx-auto max-w-5xl">
            <div className="rounded-3xl border border-komuna-forest/10 bg-white p-8 sm:p-12">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-komuna-coral">Cara Kolaborasi Bekerja</p>
              <div className="mt-8 flex flex-col items-center justify-center gap-6 sm:flex-row sm:gap-4">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-komuna-soft text-center font-display text-sm font-semibold text-komuna-forest">Komunitas<br />A</div>
                <span className="text-3xl font-bold text-komuna-coral" aria-hidden="true">&times;</span>
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-komuna-soft text-center font-display text-sm font-semibold text-komuna-forest">Komunitas<br />B</div>
                <span className="text-3xl font-bold text-komuna-coral" aria-hidden="true">&rarr;</span>
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-komuna-forest text-center font-display text-sm font-semibold text-white">Kegiatan<br />Bersama</div>
              </div>
              <div className="mt-10 grid gap-5 sm:grid-cols-3">
                <div className="rounded-2xl bg-komuna-soft p-6">
                  <h2 className="text-lg font-bold text-komuna-dark">Event Bersama</h2>
                  <p className="mt-2 text-sm leading-7 text-komuna-dark/65">Dua komunitas menyelenggarakan satu event yang melibatkan kedua anggota.</p>
                </div>
                <div className="rounded-2xl bg-komuna-soft p-6">
                  <h2 className="text-lg font-bold text-komuna-dark">Volunteer Terbuka</h2>
                  <p className="mt-2 text-sm leading-7 text-komuna-dark/65">Kesempatan volunteer yang dibuka untuk anggota komunitas lain.</p>
                </div>
                <div className="rounded-2xl bg-komuna-soft p-6">
                  <h2 className="text-lg font-bold text-komuna-dark">Kontribusi Nyata</h2>
                  <p className="mt-2 text-sm leading-7 text-komuna-dark/65">Kegiatan bersama yang memberi dampak lebih besar bagi setiap komunitas.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-komuna-soft px-4 py-16 sm:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-komuna-coral">Koleksi Kolaborasi</p>
            <h2 className="mt-3 font-display text-3xl font-semibold text-komuna-dark sm:text-4xl">Kolaborasi Komunitas</h2>
            <div className="mt-8 rounded-2xl border border-dashed border-komuna-forest/20 bg-white p-10">
              <p className="font-display text-2xl text-komuna-dark">Belum ada kolaborasi yang tersedia.</p>
              <p className="mt-3 text-sm leading-7 text-komuna-dark/65">
                Kolaborasi antar komunitas akan tampil di sini setelah tersedia.
              </p>
              <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                <Link href="/communities" className="rounded-xl bg-komuna-forest px-6 py-3.5 text-sm font-bold text-white transition hover:bg-komuna-dark">Jelajahi Komunitas</Link>
                <Link href="/events" className="rounded-xl border border-komuna-forest/20 bg-white px-6 py-3.5 text-sm font-bold text-komuna-forest transition hover:bg-komuna-forest/5">Lihat Event</Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}