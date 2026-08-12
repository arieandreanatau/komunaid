import Link from "next/link";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { JsonLd } from "@/components/json-ld";
import { HomepageDiscovery } from "@/components/homepage-discovery";
import type { HomepageCommunity, HomepageEvent, HomepageVolunteer } from "@/lib/homepage-data";

function getBaseUrl() {
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return process.env.API_URL || "http://localhost:3001";
}

async function fetchPublic<T>(endpoint: string, fallback: T): Promise<T> {
  try {
    const response = await fetch(`${getBaseUrl()}/api/v1/${endpoint}`, {
      next: { revalidate: 60 },
    });
    if (!response.ok) return fallback;
    const payload = await response.json();
    return (payload.data ?? fallback) as T;
  } catch {
    return fallback;
  }
}

export default async function HomePage() {
  const [communities, events, volunteers] = await Promise.all([
    fetchPublic<HomepageCommunity[]>("communities?limit=24&sort=desc&orderBy=memberCount", []),
    fetchPublic<HomepageEvent[]>("events/popular/upcoming", []),
    fetchPublic<HomepageVolunteer[]>("volunteer?limit=6&status=OPEN", []),
  ]);

  return (
    <div className="min-h-screen bg-komuna-cream text-komuna-dark">
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-komuna-coral focus:px-4 focus:py-2 focus:font-semibold focus:text-white"
      >
        Langsung ke konten utama
      </a>
      <JsonLd type="website" />
      <JsonLd type="organization" />
      <Header />

      <main id="content">
        <section className="relative isolate overflow-hidden bg-komuna-soft px-4 pb-16 pt-14 sm:pb-24 sm:pt-20">
          <div className="absolute -left-20 top-20 h-72 w-72 rounded-full bg-komuna-coral/20 blur-3xl" />
          <div className="absolute right-[-7rem] top-[-5rem] h-80 w-80 rounded-full border-[28px] border-komuna-forest/10" />
          <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.05fr_.95fr] lg:gap-16">
            <div className="max-w-2xl">
              <p className="mb-5 inline-flex rounded-full border border-komuna-forest/15 bg-white/70 px-4 py-2 text-sm font-semibold text-komuna-forest">
                Rumah digital komunitas Indonesia
              </p>
              <h1 className="font-display text-5xl font-semibold leading-[1.02] tracking-[-0.04em] text-komuna-dark sm:text-6xl lg:text-7xl">
                Temukan komunitas untuk bertumbuh bersama.
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-komuna-dark/70 sm:text-xl">
                Temukan komunitas, kegiatan, dan kesempatan volunteer yang sesuai dengan minatmu.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a href="/register" className="rounded-xl bg-komuna-forest px-6 py-3.5 text-center text-sm font-bold text-white transition hover:bg-komuna-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-komuna-forest">
                  Mulai Sekarang
                </a>
                <Link href="/events" className="rounded-xl border border-komuna-forest/20 bg-white px-6 py-3.5 text-center text-sm font-bold text-komuna-forest transition hover:border-komuna-forest hover:bg-komuna-forest/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-komuna-forest">
                  Temukan Event
                </Link>
              </div>
              <Link href="/communities/create" className="mt-5 inline-flex text-sm font-semibold text-komuna-forest underline decoration-komuna-coral decoration-2 underline-offset-4 hover:text-komuna-dark">
                Buat Komunitas
              </Link>
            </div>

            <div className="relative mx-auto w-full max-w-xl">
              <div className="absolute -right-5 -top-5 h-24 w-24 rounded-full bg-komuna-coral" />
              <div className="relative overflow-hidden rounded-[2rem] bg-komuna-navy p-5 shadow-[0_24px_60px_rgba(10,29,77,0.22)] sm:p-7">
                <div className="min-h-[360px] rounded-[1.4rem] bg-gradient-to-br from-komuna-navy via-komuna-blue to-komuna-teal p-6 text-white sm:p-8">
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold tracking-wide">MULAI DARI MINATMU</span>
                    <span className="h-10 w-10 rounded-full bg-komuna-coral" />
                  </div>
                  <div className="mt-16">
                    <p className="font-display text-4xl leading-tight sm:text-5xl">Satu tempat untuk hadir, ikut, dan berkontribusi.</p>
                    <div className="mt-8 grid grid-cols-3 gap-3">
                      {[
                        ["Komunitas", "Temukan ruangmu"],
                        ["Event", "Ikuti kegiatan"],
                        ["Volunteer", "Ambil peran"],
                      ].map(([title, description]) => (
                        <div key={title} className="rounded-2xl bg-white/10 p-3 backdrop-blur-sm">
                          <p className="text-xs font-bold text-komuna-coral">{title}</p>
                          <p className="mt-2 text-xs leading-5 text-white/75">{description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-7 -left-3 rounded-2xl border border-komuna-forest/10 bg-white p-4 shadow-xl sm:-left-10 sm:p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-komuna-forest">KomunaID</p>
                <p className="mt-1 text-sm font-bold text-komuna-dark">Hubungkan. Bangun. Bertumbuh.</p>
              </div>
            </div>
          </div>
        </section>

        <HomepageDiscovery communities={communities} events={events} volunteers={volunteers} />

        <section id="tentang" className="bg-komuna-soft px-4 py-16 sm:py-24">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-komuna-coral">Tentang KomunaID</p>
              <h2 className="mt-4 max-w-xl font-display text-4xl font-semibold leading-tight text-komuna-dark sm:text-5xl">
                Ruang temu untuk gerakan yang tumbuh dari komunitas.
              </h2>
            </div>
            <div className="space-y-5 text-base leading-8 text-komuna-dark/70">
              <p>KomunaID membantu masyarakat menemukan komunitas, mengikuti kegiatan, dan mengambil bagian lewat kesempatan volunteer.</p>
              <p>Setiap komunitas dapat bertumbuh melalui partisipasi anggota, event yang terbuka, dan kontribusi yang nyata.</p>
              <Link href="/about" className="inline-flex font-bold text-komuna-forest underline decoration-komuna-coral decoration-2 underline-offset-4 hover:text-komuna-dark">Pelajari KomunaID</Link>
            </div>
          </div>
        </section>

        <section className="bg-komuna-dark px-4 py-16 sm:py-24">
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-komuna-coral">Mulai Perjalananmu</p>
            <h2 className="mt-4 font-display text-4xl font-semibold text-white sm:text-6xl">Siap menemukan komunitasmu?</h2>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-white/70">Temukan komunitas, kegiatan, dan kesempatan volunteer yang sesuai dengan minatmu.</p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/communities" className="rounded-xl bg-komuna-coral px-6 py-3.5 text-sm font-bold text-white transition hover:bg-[#e96650]">Jelajahi Komunitas</Link>
              <Link href="/register" className="rounded-xl border border-white/25 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-white/10">Daftar di KomunaID</Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
