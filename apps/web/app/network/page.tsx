import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { JsonLd } from "@/components/json-ld";
import { CommunityCard } from "@/components/community-card";
import type { HomepageCommunity } from "@/lib/homepage-data";

export const metadata: Metadata = {
  title: "Network Komunitas",
  description: "Terhubung lebih luas: temukan koneksi antara komunitas, aktivitas, dan orang-orang dengan minat yang sama di KomunaID.",
  openGraph: {
    title: "Network Komunitas | KomunaID",
    description: "Jelajahi koneksi antar komunitas di KomunaID.",
  },
};

function getBaseUrl() {
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return process.env.API_URL || "http://localhost:3001";
}

async function fetchCommunities(): Promise<HomepageCommunity[]> {
  try {
    const response = await fetch(`${getBaseUrl()}/api/v1/communities?limit=12&sort=desc&orderBy=memberCount`, {
      next: { revalidate: 60 },
    });
    if (!response.ok) return [];
    const payload = await response.json();
    return (payload.data ?? []) as HomepageCommunity[];
  } catch {
    return [];
  }
}

export default async function NetworkPage() {
  const communities = await fetchCommunities();

  return (
    <div className="min-h-screen flex flex-col bg-komuna-cream text-komuna-dark">
      <JsonLd type="website" />
      <Header />

      <main className="flex-1">
        <section className="bg-gradient-to-br from-komuna-navy via-komuna-blue to-komuna-teal px-4 py-20 text-white">
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-komuna-coral">Network</p>
            <h1 className="mt-4 font-display text-4xl font-semibold tracking-[-0.03em] sm:text-6xl">Terhubung Lebih Luas</h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-white/75">
              Komunitas tidak berdiri sendiri. Temukan koneksi antara komunitas, aktivitas, dan orang-orang yang memiliki minat yang sama.
            </p>
          </div>
        </section>

        <section className="px-4 py-16 sm:py-20">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-8 lg:grid-cols-3">
              <div className="rounded-2xl border border-komuna-forest/10 bg-white p-7">
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-komuna-coral">Koneksi</p>
                <h2 className="mt-3 font-display text-2xl font-semibold text-komuna-dark">Berbagi Minat</h2>
                <p className="mt-3 text-sm leading-7 text-komuna-dark/65">
                  Komunitas dengan minat yang sama saling terhubung, membuka kesempatan untuk saling belajar dan bertumbuh.
                </p>
              </div>
              <div className="rounded-2xl border border-komuna-forest/10 bg-white p-7">
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-komuna-coral">Aktivitas</p>
                <h2 className="mt-3 font-display text-2xl font-semibold text-komuna-dark">Kegiatan Lintas Komunitas</h2>
                <p className="mt-3 text-sm leading-7 text-komuna-dark/65">
                  Event dan volunteer dapat melibatkan lebih dari satu komunitas, memperluas jangkauan setiap kegiatan.
                </p>
              </div>
              <div className="rounded-2xl border border-komuna-forest/10 bg-white p-7">
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-komuna-coral">Berpusat Komunitas</p>
                <h2 className="mt-3 font-display text-2xl font-semibold text-komuna-dark">Bukan Umpan Sosial</h2>
                <p className="mt-3 text-sm leading-7 text-komuna-dark/65">
                  Network KomunaID tetap berpusat pada komunitas, kegiatan, dan kontribusi nyata &mdash; bukan umpan tanpa arah.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="komunitas-network" className="bg-komuna-soft px-4 py-16 sm:py-20">
          <div className="mx-auto max-w-7xl">
            <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div className="max-w-2xl">
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-komuna-coral">Titik Koneksi</p>
                <h2 className="mt-3 font-display text-4xl font-semibold tracking-[-0.03em] text-komuna-dark sm:text-5xl">
                  Mulai dari Komunitas
                </h2>
                <p className="mt-3 text-base leading-7 text-komuna-dark/65">
                  Setiap jaringan dimulai dari komunitas. Jelajahi komunitas yang tersedia di KomunaID.
                </p>
              </div>
              <Link href="/communities" className="inline-flex shrink-0 items-center gap-2 font-bold text-komuna-forest underline decoration-komuna-coral decoration-2 underline-offset-4 hover:text-komuna-dark">
                Lihat Semua Komunitas <span aria-hidden="true">&rarr;</span>
              </Link>
            </div>

            {communities.length > 0 ? (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {communities.map((community) => <CommunityCard key={community.id} community={community} />)}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-komuna-forest/20 bg-white p-10 text-center">
                <p className="font-display text-2xl text-komuna-dark">Belum ada komunitas untuk dijelajahi.</p>
                <Link href="/communities/create" className="mt-3 inline-block font-bold text-komuna-forest underline">Buat Komunitas</Link>
              </div>
            )}
          </div>
        </section>

        <section className="bg-komuna-dark px-4 py-16 sm:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-display text-3xl font-semibold text-white sm:text-5xl">Jaringan dimulai dari satu komunitas.</h2>
            <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-white/70">
              Temukan komunitasmu, ikut kegiatannya, dan perluas koneksimu bersama komunitas lain.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/communities" className="rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-komuna-navy transition hover:bg-komuna-cream">Jelajahi Komunitas</Link>
              <Link href="/events" className="rounded-xl border border-white/25 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-white/10">Lihat Event</Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}