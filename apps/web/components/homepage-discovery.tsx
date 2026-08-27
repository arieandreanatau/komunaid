"use client";

import Link from "next/link";
import { FormEvent, useDeferredValue, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { HomepageCommunity, HomepageEvent, HomepageVolunteer } from "@/lib/homepage-data";
import { CommunityCard, CommunityCardSkeleton } from "./community-card";
import { EventCard, EventCardSkeleton } from "./event-card";
import { VolunteerCardSkeleton } from "./volunteer-card";

const PREFERRED_CATEGORY_ORDER = [
  "Olahraga",
  "Buku",
  "Seni",
  "Teknologi",
  "Pendidikan",
  "Sosial",
  "Budaya",
  "Lingkungan",
  "Kreatif",
  "Lainnya",
];

function formatDate(value: string | null) {
  if (!value) return "Tanggal menyusul";
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value));
}

function SectionHeading({
  eyebrow,
  title,
  copy,
  href,
  ctaLabel = "Lihat semua",
}: {
  eyebrow: string;
  title: string;
  copy: string;
  href: string;
  ctaLabel?: string;
}) {
  return (
    <div className="mb-8 flex flex-col justify-between gap-4 sm:mb-10 sm:flex-row sm:items-end">
      <div className="max-w-2xl">
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-komuna-coral">{eyebrow}</p>
        <h2 className="mt-3 font-display text-4xl font-semibold tracking-[-0.03em] text-komuna-dark sm:text-5xl">{title}</h2>
        <p className="mt-3 text-base leading-7 text-komuna-dark/65">{copy}</p>
      </div>
      <Link href={href} className="inline-flex shrink-0 items-center gap-2 font-bold text-komuna-forest underline decoration-komuna-coral decoration-2 underline-offset-4 hover:text-komuna-dark">
        {ctaLabel} <span aria-hidden="true">&rarr;</span>
      </Link>
    </div>
  );
}

const MINAT_CARDS = [
  { title: "Komunitas", description: "Temukan ruangmu", href: "/communities", cta: "Jelajahi Komunitas", tone: "forest" as const },
  { title: "Event", description: "Ikuti kegiatan", href: "/events", cta: "Lihat Event", tone: "coral" as const },
  { title: "Volunteer", description: "Ambil peran", href: "/volunteer", cta: "Cari Volunteer", tone: "teal" as const },
];

function MinatCards() {
  return (
    <section id="mulai-dari-minatmu" className="bg-komuna-soft px-4 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-komuna-coral">Mulai dari Minatmu</p>
          <h2 className="mt-3 font-display text-4xl font-semibold tracking-[-0.03em] text-komuna-dark sm:text-5xl">
            Mulai dari Minatmu
          </h2>
          <p className="mt-3 text-lg leading-8 text-komuna-dark/65">Satu tempat untuk hadir, ikut, dan berkontribusi.</p>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {MINAT_CARDS.map((card) => (
            <Link
              key={card.title}
              href={card.href}
              className="group rounded-2xl border border-komuna-forest/10 bg-white p-7 transition duration-200 hover:-translate-y-1 hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-komuna-forest"
            >
              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl text-lg font-bold text-white ${card.tone === "forest" ? "bg-komuna-forest" : card.tone === "coral" ? "bg-komuna-coral" : "bg-komuna-teal"}`} aria-hidden="true">
                {card.title.charAt(0)}
              </div>
              <h3 className="mt-5 font-display text-2xl font-semibold text-komuna-dark">{card.title}</h3>
              <p className="mt-2 text-sm leading-6 text-komuna-dark/65">{card.description}</p>
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-komuna-forest transition group-hover:gap-3">
                {card.cta} <span aria-hidden="true">&rarr;</span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function NetworkSection() {
  return (
    <section id="network" className="bg-komuna-navy px-4 py-16 text-white sm:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-komuna-coral">Network</p>
            <h2 className="mt-3 font-display text-4xl font-semibold tracking-[-0.03em] sm:text-5xl">Terhubung Lebih Luas</h2>
            <p className="mt-4 max-w-lg text-base leading-8 text-white/70">
              Komunitas tidak berdiri sendiri. Temukan koneksi antara komunitas, aktivitas, dan orang-orang yang memiliki minat yang sama.
            </p>
            <ul className="mt-6 space-y-3 text-sm leading-6 text-white/75">
              <li className="flex items-start gap-3"><span className="mt-1 text-komuna-coral" aria-hidden="true">&#9679;</span>Berbagi minat &amp; anggota antar komunitas</li>
              <li className="flex items-start gap-3"><span className="mt-1 text-komuna-coral" aria-hidden="true">&#9679;</span>Kegiatan lintas komunitas yang saling terhubung</li>
              <li className="flex items-start gap-3"><span className="mt-1 text-komuna-coral" aria-hidden="true">&#9679;</span>Tetap berpusat pada komunitas, bukan umpan sosial tanpa arah</li>
            </ul>
            <Link
              href="/network"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-komuna-navy transition hover:bg-komuna-cream focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Jelajahi Network <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
          <div className="flex items-center justify-center" aria-hidden="true">
            <div className="relative w-full max-w-md">
              <div className="rounded-[2rem] border border-white/15 bg-white/5 p-8 backdrop-blur-sm">
                <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-white/50">Koneksi Antar Komunitas</p>
                <div className="mt-8 flex items-center justify-around">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-komuna-coral/90 text-center font-display text-sm font-semibold text-white">Komunitas<br />A</div>
                  <div className="h-px flex-1 bg-white/30" />
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-komuna-teal/90 text-center font-display text-sm font-semibold text-white">Komunitas<br />B</div>
                </div>
                <div className="mx-auto mt-6 h-px w-px bg-white/30" />
                <div className="h-px w-1/3 bg-white/30 mx-auto -translate-y-px" />
                <div className="mt-6 flex justify-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-komuna-aqua/90 text-center font-display text-sm font-semibold text-white">Komunitas<br />C</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CollaborationSection() {
  return (
    <section id="kolaborasi" className="px-4 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 max-w-2xl">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-komuna-coral">Kolaborasi</p>
          <h2 className="mt-3 font-display text-4xl font-semibold tracking-[-0.03em] text-komuna-dark sm:text-5xl">
            Kolaborasi Komunitas
          </h2>
          <p className="mt-3 text-base leading-7 text-komuna-dark/65">Ketika komunitas bertemu, lebih banyak hal bisa terjadi.</p>
        </div>
        <div className="grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
          <div className="rounded-2xl border border-komuna-forest/10 bg-white p-7">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-komuna-coral">Contoh</p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <span className="rounded-xl bg-komuna-soft px-4 py-2 text-sm font-bold text-komuna-forest">Komunitas A</span>
              <span className="text-2xl font-bold text-komuna-coral" aria-hidden="true">&times;</span>
              <span className="rounded-xl bg-komuna-soft px-4 py-2 text-sm font-bold text-komuna-forest">Komunitas B</span>
              <span className="ml-auto text-sm font-semibold text-komuna-dark/55">Meetup &amp; Workshop Bersama</span>
            </div>
            <p className="mt-5 text-sm leading-7 text-komuna-dark/65">
              Dua komunitas, satu kegiatan bersama: menggabungkan anggota, pengalaman, dan sumber daya untuk menciptakan kegiatan yang lebih besar dari sekadar yang bisa dilakukan sendiri.
            </p>
          </div>
          <div className="flex flex-col justify-between gap-8 rounded-2xl bg-komuna-soft p-7">
            <div className="space-y-4 text-sm leading-7 text-komuna-dark/70">
              <p><strong className="text-komuna-dark">Komunitas A</strong> <span className="text-komuna-coral">&#215;</span> <strong className="text-komuna-dark">Komunitas B</strong> <span className="text-komuna-coral">&rarr;</span> Kegiatan bersama</p>
              <p>Dari event, volunteer, hingga kontribusi lanjutan yang melibatkan lebih banyak orang.</p>
            </div>
            <Link
              href="/kolaborasi"
              className="inline-flex items-center gap-2 rounded-xl bg-komuna-forest px-6 py-3.5 text-sm font-bold text-white transition hover:bg-komuna-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-komuna-forest"
            >
              Lihat Kolaborasi <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function SpotlightSection({ community }: { community: HomepageCommunity | null }) {
  return (
    <section id="spotlight" className="bg-komuna-soft px-4 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-komuna-coral">Unggulan</p>
            <h2 className="mt-3 font-display text-4xl font-semibold tracking-[-0.03em] text-komuna-dark sm:text-5xl">
              Community Spotlight
            </h2>
          </div>
        </div>
        {community ? (
          <div className="grid overflow-hidden rounded-3xl border border-komuna-forest/10 bg-white lg:grid-cols-2">
            <div className="relative h-64 lg:h-full">
              {community.coverImage || community.logo ? (
                <img src={community.coverImage || community.logo!} alt={community.name} className="h-full w-full object-cover" loading="lazy" />
              ) : (
                <div className="flex h-full items-center justify-center bg-gradient-to-br from-komuna-forest to-komuna-dark">
                  <span className="font-display text-8xl font-semibold text-white/25">{community.name.slice(0, 1)}</span>
                </div>
              )}
            </div>
            <div className="flex flex-col justify-center p-8 sm:p-10">
              <p className="text-sm font-bold text-komuna-coral">{community.categories?.[0]?.name || "Komunitas"}</p>
              <h3 className="mt-2 font-display text-3xl font-semibold text-komuna-dark">{community.name}</h3>
              <p className="mt-4 line-clamp-3 text-sm leading-7 text-komuna-dark/65">
                {community.description || "Komunitas untuk bertumbuh bersama."}
              </p>
              <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold text-komuna-dark/70">
                <span>{community.memberCount} anggota</span>
                <span>{community.eventCount} event</span>
              </div>
              <Link
                href={`/communities/${community.slug}`}
                className="mt-8 inline-flex w-fit items-center gap-2 rounded-xl bg-komuna-forest px-6 py-3.5 text-sm font-bold text-white transition hover:bg-komuna-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-komuna-forest"
              >
                Kenali Komunitas <span aria-hidden="true">&rarr;</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-komuna-forest/20 bg-white p-10 text-center">
            <p className="font-display text-2xl text-komuna-dark">Komunitas unggulan akan hadir di sini.</p>
            <Link href="/communities" className="mt-3 inline-block font-bold text-komuna-forest underline">Jelajahi Komunitas</Link>
          </div>
        )}
      </div>
    </section>
  );
}

function CreateCommunitySection() {
  return (
    <section id="buat-komunitas" className="bg-komuna-dark px-4 py-16 sm:py-24">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-komuna-coral">Buat Komunitas</p>
        <h2 className="mt-4 font-display text-4xl font-semibold text-white sm:text-6xl">Punya Komunitas?</h2>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-white/70">
          Bangun ruang untuk orang-orang yang memiliki minat yang sama.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/communities/create"
            className="rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-komuna-navy transition hover:bg-komuna-cream focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            + Buat Komunitas
          </Link>
          <Link
            href="/communities"
            className="rounded-xl border border-white/25 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Jelajahi Komunitas
          </Link>
        </div>
      </div>
    </section>
  );
}

export function HomepageDiscovery({ communities, events, volunteers }: { communities: HomepageCommunity[]; events: HomepageEvent[]; volunteers: HomepageVolunteer[] }) {
  const router = useRouter();
  const [discoveryCommunities, setDiscoveryCommunities] = useState(communities);
  const [discoveryEvents, setDiscoveryEvents] = useState(events);
  const [discoveryVolunteers, setDiscoveryVolunteers] = useState(volunteers);
  const [refetching, setRefetching] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Semua");
  const communitySectionRef = useRef<HTMLElement>(null);
  const deferredSearch = useDeferredValue(search.trim().toLocaleLowerCase("id-ID"));

  const categories = Array.from(
    new Map(
      discoveryCommunities
        .flatMap((community) => community.categories?.map((item) => item.name) ?? [])
        .map((name) => [name.toLocaleLowerCase("id-ID"), name]),
    ).values(),
  ).sort((a, b) => {
    const aIndex = PREFERRED_CATEGORY_ORDER.indexOf(a);
    const bIndex = PREFERRED_CATEGORY_ORDER.indexOf(b);
    const aRank = aIndex === -1 ? PREFERRED_CATEGORY_ORDER.length : aIndex;
    const bRank = bIndex === -1 ? PREFERRED_CATEGORY_ORDER.length : bIndex;
    return aRank - bRank;
  });

  useEffect(() => {
    if (communities.length > 0 && events.length > 0 && volunteers.length > 0) return;

    let cancelled = false;
    setRefetching(true);
    async function loadDiscovery() {
      const [communityResponse, eventResponse, volunteerResponse] = await Promise.allSettled([
        fetch("/api/v1/communities?limit=24&sort=desc&orderBy=memberCount"),
        fetch("/api/v1/events/popular/upcoming"),
        fetch("/api/v1/volunteer-programs?limit=6&status=REGISTRATION_OPEN"),
      ]);
      if (cancelled) return;

      const readData = async <T,>(result: PromiseSettledResult<Response>): Promise<T | null> => {
        if (result.status !== "fulfilled" || !result.value.ok) return null;
        const payload = await result.value.json();
        return payload.data ?? null;
      };

      const [loadedCommunities, loadedEvents, loadedVolunteers] = await Promise.all([
        readData<HomepageCommunity[]>(communityResponse),
        readData<HomepageEvent[]>(eventResponse),
        readData<HomepageVolunteer[]>(volunteerResponse),
      ]);
      if (cancelled) return;
      if (loadedCommunities) setDiscoveryCommunities(loadedCommunities);
      if (loadedEvents) setDiscoveryEvents(loadedEvents);
      if (loadedVolunteers) setDiscoveryVolunteers(loadedVolunteers);
      setRefetching(false);
    }

    void loadDiscovery();
    return () => { cancelled = true; };
  }, [communities.length, events.length, volunteers.length]);

  function selectCategory(next: string) {
    setCategory(next);
    communitySectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const visibleCommunities = discoveryCommunities
    .filter((community) => category === "Semua" || (community.categories?.some((item) => item.name.localeCompare(category, "id", { sensitivity: "base" }) === 0) ?? false))
    .filter((community) => !deferredSearch || [community.name, community.description, community.location, ...(community.categories?.map((item) => item.name) ?? [])].filter(Boolean).join(" ").toLocaleLowerCase("id-ID").includes(deferredSearch))
    .slice(0, 4);
  const searchMatches = [
    ...discoveryCommunities.filter((item) => [item.name, item.description].filter(Boolean).join(" ").toLocaleLowerCase("id-ID").includes(deferredSearch)).map((item) => ({ type: "Komunitas", label: item.name, href: `/communities/${item.slug}` })),
    ...discoveryEvents.filter((item) => [item.title, item.description].filter(Boolean).join(" ").toLocaleLowerCase("id-ID").includes(deferredSearch)).map((item) => ({ type: "Event", label: item.title, href: `/events/${item.slug}` })),
    ...discoveryVolunteers.filter((item) => [item.title, item.description].filter(Boolean).join(" ").toLocaleLowerCase("id-ID").includes(deferredSearch)).map((item) => ({ type: "Volunteer", label: item.title, href: `/volunteer/${item.slug}` })),
  ].slice(0, 6);

  const communityLoading = refetching && discoveryCommunities.length === 0;
  const eventLoading = refetching && discoveryEvents.length === 0;
  const volunteerLoading = refetching && discoveryVolunteers.length === 0;

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (searchMatches[0]) router.push(searchMatches[0].href);
    else if (search.trim()) router.push(`/communities?search=${encodeURIComponent(search.trim())}`);
  }

  return (
    <>
      <section className="relative z-10 px-4 pb-16 sm:pb-20">
        <div className="mx-auto -mt-7 max-w-5xl rounded-2xl border border-komuna-forest/10 bg-white p-3 shadow-[0_20px_50px_rgba(15,91,82,0.12)] sm:-mt-10 sm:p-4">
          <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row">
            <label className="sr-only" htmlFor="homepage-search">Cari komunitas, event, atau volunteer</label>
            <div className="relative flex-1">
              <svg aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-komuna-forest/50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m1.35-5.15a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z" /></svg>
              <input id="homepage-search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari komunitas, event, atau volunteer..." className="w-full rounded-xl border border-transparent bg-komuna-cream py-3.5 pl-12 pr-4 text-sm text-komuna-dark outline-none placeholder:text-komuna-dark/45 focus:border-komuna-forest focus:ring-2 focus:ring-komuna-forest/15" />
              {deferredSearch && searchMatches.length > 0 && (
                <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-20 overflow-hidden rounded-xl border border-komuna-forest/10 bg-white py-2 shadow-xl">
                  {searchMatches.map((match) => <Link key={`${match.type}-${match.href}`} href={match.href} className="flex items-center justify-between gap-4 px-4 py-3 text-sm hover:bg-komuna-soft"><span className="font-semibold text-komuna-dark">{match.label}</span><span className="text-xs font-bold text-komuna-forest">{match.type}</span></Link>)}
                </div>
              )}
            </div>
            <button type="submit" className="rounded-xl bg-komuna-forest px-6 py-3.5 text-sm font-bold text-white transition hover:bg-komuna-dark">Cari</button>
          </form>
        </div>
      </section>

      <MinatCards />

      <section id="komunitas" ref={communitySectionRef} className="scroll-mt-24 px-4 pb-16 sm:pb-20">
        <div className="mx-auto max-w-7xl">
          <SectionHeading eyebrow="Temukan Komunitas" title="Komunitas Populer" copy="Komunitas yang aktif dan terbuka untuk diikuti, sesuai minat dan lokasimu." href="/communities" ctaLabel="Lihat Semua Komunitas" />
          {communityLoading ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => <CommunityCardSkeleton key={index} />)}
            </div>
          ) : visibleCommunities.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {visibleCommunities.map((community) => <CommunityCard key={community.id} community={community} />)}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-komuna-forest/20 bg-komuna-soft p-10 text-center">
              <p className="font-display text-2xl text-komuna-dark">Komunitas belum ditemukan.</p>
              <Link href="/communities" className="mt-3 inline-block font-bold text-komuna-forest underline">Buka direktori komunitas</Link>
            </div>
          )}
        </div>
      </section>

      <section id="jelajahi-minat" className="bg-komuna-soft px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div className="max-w-2xl">
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-komuna-coral">Minat</p>
              <h2 className="mt-3 font-display text-4xl font-semibold tracking-[-0.03em] text-komuna-dark sm:text-5xl">
                Jelajahi Berdasarkan Minat
              </h2>
              <p className="mt-3 text-base leading-7 text-komuna-dark/65">Pilih minat untuk menyaring daftar komunitas di atas.</p>
            </div>
            <Link href="/categories" className="inline-flex shrink-0 items-center gap-2 font-bold text-komuna-forest underline decoration-komuna-coral decoration-2 underline-offset-4 hover:text-komuna-dark">
              Lihat Semua Kategori <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
          {categories.length > 0 ? (
            <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 scrollbar-hide" aria-label="Filter kategori komunitas">
              {["Semua", ...categories].map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => selectCategory(item)}
                  aria-pressed={category === item}
                  className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold transition ${category === item ? "bg-komuna-forest text-white" : "border border-komuna-forest/15 bg-white text-komuna-forest hover:border-komuna-forest"}`}
                >
                  {item}
                </button>
              ))}
            </div>
          ) : (
            <p className="rounded-2xl border border-dashed border-komuna-forest/20 bg-white p-8 text-center text-sm text-komuna-dark/60">
              Kategori komunitas akan tersedia di sini.
            </p>
          )}
        </div>
      </section>

      <section id="event" className="px-4 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl">
          <SectionHeading eyebrow="Aktivitas" title="Event Mendatang" copy="Temukan kegiatan dari komunitas yang menarik untukmu." href="/events" ctaLabel="Lihat Semua Event" />
          {eventLoading ? (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => <EventCardSkeleton key={index} />)}
            </div>
          ) : discoveryEvents.length > 0 ? (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {discoveryEvents.slice(0, 3).map((event) => <EventCard key={event.id} event={event} />)}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-komuna-forest/20 bg-komuna-soft p-10 text-center">
              <p className="font-display text-2xl text-komuna-dark">Belum ada event mendatang.</p>
              <Link href="/communities" className="mt-3 inline-block font-bold text-komuna-forest underline">Jelajahi Komunitas</Link>
            </div>
          )}
        </div>
      </section>

      <section id="volunteer" className="bg-komuna-soft px-4 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl">
          <SectionHeading eyebrow="Kontribusi" title="Ambil Peran di Komunitas" copy="Kesempatan volunteer yang sedang terbuka." href="/volunteer" ctaLabel="Temukan Volunteer" />
          {volunteerLoading ? (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => <VolunteerCardSkeleton key={index} />)}
            </div>
          ) : discoveryVolunteers.length > 0 ? (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {discoveryVolunteers.slice(0, 3).map((volunteer) => (
                <Link key={volunteer.id} href={`/volunteer/${volunteer.slug}`} className="group rounded-2xl border border-komuna-forest/10 bg-white p-6 transition hover:-translate-y-1 hover:shadow-xl">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-komuna-soft text-2xl text-komuna-coral" aria-hidden="true">+</div>
                  <p className="mt-6 text-sm font-bold text-komuna-coral">{volunteer.status === "REGISTRATION_OPEN" ? "Pendaftaran Dibuka" : volunteer.status === "ONGOING" ? "Berlangsung" : volunteer.status === "REGISTRATION_CLOSED" ? "Pendaftaran Ditutup" : formatDate(volunteer.activityStartDate || volunteer.event?.eventDate)}</p>
                  <h3 className="mt-2 line-clamp-1 text-xl font-bold text-komuna-dark">{volunteer.title}</h3>
                  <p className="mt-2 line-clamp-1 text-sm text-komuna-forest">{volunteer.event?.community?.name || volunteer.event?.title || "Komunitas"}</p>
                  <p className="mt-4 line-clamp-2 min-h-10 text-sm leading-5 text-komuna-dark/65">{volunteer.description || "Kesempatan untuk berkontribusi bersama komunitas."}</p>
                  <div className="mt-5 flex flex-wrap justify-between gap-3 text-xs text-komuna-dark/60">
                    <span>{formatDate(volunteer.activityStartDate || volunteer.event?.eventDate)}</span>
                    <span className="truncate">{volunteer.event?.locationType === "ONLINE" ? "Online" : volunteer.event?.location || "Lokasi menyusul"}</span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-3 text-xs text-komuna-dark/60">
                    {volunteer.registrationDeadline && <span>Tutup: {formatDate(volunteer.registrationDeadline)}</span>}
                    <span>{volunteer.applicationCount} pendaftar</span>
                  </div>
                  {volunteer.positions && volunteer.positions.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {volunteer.positions.slice(0, 2).map((pos) => (
                        <span key={pos.id} className="rounded-full bg-komuna-teal/10 px-2.5 py-0.5 text-xs font-bold text-komuna-teal">{pos.name}</span>
                      ))}
                    </div>
                  )}
                  <span className="mt-5 inline-block text-sm font-bold text-komuna-forest">Lihat <span aria-hidden="true">&rarr;</span></span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-komuna-forest/20 bg-white p-10 text-center">
              <p className="font-display text-2xl text-komuna-dark">Kesempatan volunteer akan hadir di sini.</p>
              <Link href="/volunteer" className="mt-3 inline-block font-bold text-komuna-forest underline">Temukan Volunteer</Link>
            </div>
          )}
        </div>
      </section>

      <NetworkSection />

      <CollaborationSection />

      <SpotlightSection community={discoveryCommunities[0] ?? null} />

      <CreateCommunitySection />
    </>
  );
}