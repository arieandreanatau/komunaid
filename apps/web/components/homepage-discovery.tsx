"use client";

import Link from "next/link";
import { FormEvent, useDeferredValue, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { HomepageCommunity, HomepageEvent, HomepageVolunteer } from "@/lib/homepage-data";

const CATEGORY_ORDER = ["Semua", "Sosial", "Pendidikan", "Olahraga", "Kreatif", "Teknologi", "Lingkungan", "Hobi", "Profesional"];

function formatDate(value: string | null) {
  if (!value) return "Tanggal menyusul";
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value));
}

function ImageFallback({ label, tone = "forest" }: { label: string; tone?: "forest" | "coral" }) {
  return <div className={`flex h-full items-center justify-center bg-gradient-to-br ${tone === "forest" ? "from-komuna-forest to-komuna-dark" : "from-komuna-coral to-[#c65240]"}`}><span className="font-display text-6xl text-white/25">{label.slice(0, 1)}</span></div>;
}

function SectionHeading({ eyebrow, title, copy, href }: { eyebrow: string; title: string; copy: string; href: string }) {
  return (
    <div className="mb-8 flex flex-col justify-between gap-4 sm:mb-10 sm:flex-row sm:items-end">
      <div className="max-w-2xl">
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-komuna-coral">{eyebrow}</p>
        <h2 className="mt-3 font-display text-4xl font-semibold tracking-[-0.03em] text-komuna-dark sm:text-5xl">{title}</h2>
        <p className="mt-3 text-base leading-7 text-komuna-dark/65">{copy}</p>
      </div>
      <Link href={href} className="inline-flex shrink-0 items-center gap-2 font-bold text-komuna-forest underline decoration-komuna-coral decoration-2 underline-offset-4 hover:text-komuna-dark">
        Lihat semua <span aria-hidden="true">&rarr;</span>
      </Link>
    </div>
  );
}

export function HomepageDiscovery({ communities, events, volunteers }: { communities: HomepageCommunity[]; events: HomepageEvent[]; volunteers: HomepageVolunteer[] }) {
  const router = useRouter();
  const [discoveryCommunities, setDiscoveryCommunities] = useState(communities);
  const [discoveryEvents, setDiscoveryEvents] = useState(events);
  const [discoveryVolunteers, setDiscoveryVolunteers] = useState(volunteers);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Semua");
  const deferredSearch = useDeferredValue(search.trim().toLocaleLowerCase("id-ID"));

  useEffect(() => {
    if (communities.length > 0 && events.length > 0 && volunteers.length > 0) return;

    let cancelled = false;
    async function loadDiscovery() {
      const [communityResponse, eventResponse, volunteerResponse] = await Promise.allSettled([
        fetch("/api/v1/communities?limit=24&sort=desc&orderBy=memberCount"),
        fetch("/api/v1/events/popular/upcoming"),
        fetch("/api/v1/volunteer?limit=6&status=OPEN"),
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
    }

    void loadDiscovery();
    return () => { cancelled = true; };
  }, [communities.length, events.length, volunteers.length]);

  const visibleCommunities = discoveryCommunities
    .filter((community) => category === "Semua" || community.categories.some((item) => item.name.localeCompare(category, "id", { sensitivity: "base" }) === 0))
    .filter((community) => !deferredSearch || [community.name, community.description, community.location, ...community.categories.map((item) => item.name)].filter(Boolean).join(" ").toLocaleLowerCase("id-ID").includes(deferredSearch))
    .slice(0, 4);
  const searchMatches = [
    ...discoveryCommunities.filter((item) => [item.name, item.description].filter(Boolean).join(" ").toLocaleLowerCase("id-ID").includes(deferredSearch)).map((item) => ({ type: "Komunitas", label: item.name, href: `/communities/${item.slug}` })),
    ...discoveryEvents.filter((item) => [item.title, item.description].filter(Boolean).join(" ").toLocaleLowerCase("id-ID").includes(deferredSearch)).map((item) => ({ type: "Event", label: item.title, href: `/events/${item.slug}` })),
    ...discoveryVolunteers.filter((item) => [item.title, item.description].filter(Boolean).join(" ").toLocaleLowerCase("id-ID").includes(deferredSearch)).map((item) => ({ type: "Volunteer", label: item.title, href: `/volunteer/${item.slug}` })),
  ].slice(0, 6);

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (searchMatches[0]) router.push(searchMatches[0].href);
    else if (search.trim()) router.push(`/communities?search=${encodeURIComponent(search.trim())}`);
  }

  return (
    <>
      <section className="relative z-10 px-4 pb-16 sm:pb-24">
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

      <section id="komunitas" className="px-4 pb-16 sm:pb-24">
        <div className="mx-auto max-w-7xl">
          <SectionHeading eyebrow="Discovery" title="Temukan Komunitas" copy="Temukan komunitas yang sesuai dengan minat, lokasi, dan hal yang ingin kamu lakukan bersama." href="/communities" />
          <div className="-mx-4 mb-8 flex gap-2 overflow-x-auto px-4 pb-2 scrollbar-hide" aria-label="Filter kategori komunitas">
            {CATEGORY_ORDER.map((item) => <button key={item} type="button" onClick={() => setCategory(item)} aria-pressed={category === item} className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold transition ${category === item ? "bg-komuna-forest text-white" : "border border-komuna-forest/15 bg-white text-komuna-forest hover:border-komuna-forest"}`}>{item}</button>)}
          </div>
          {visibleCommunities.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {visibleCommunities.map((community) => <Link key={community.id} href={`/communities/${community.slug}`} className="group overflow-hidden rounded-2xl border border-komuna-forest/10 bg-white transition duration-200 hover:-translate-y-1 hover:shadow-xl">
                <div className="h-44 overflow-hidden">{community.coverImage || community.logo ? <img src={community.coverImage || community.logo || ""} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" loading="lazy" /> : <ImageFallback label={community.name} />}</div>
                <div className="p-5"><p className="text-xs font-bold text-komuna-coral">{community.categories[0]?.name || "Komunitas"}</p><h3 className="mt-2 line-clamp-1 text-lg font-bold text-komuna-dark">{community.name}</h3><p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-komuna-dark/65">{community.description || "Komunitas untuk bertumbuh bersama."}</p><div className="mt-4 flex items-center justify-between gap-3 text-xs text-komuna-dark/55"><span>{community.memberCount} anggota</span><span className="truncate">{community.location || "Indonesia"}</span></div><span className="mt-5 inline-block text-sm font-bold text-komuna-forest">Lihat Komunitas &rarr;</span></div>
              </Link>)}
            </div>
          ) : <div className="rounded-2xl border border-dashed border-komuna-forest/20 bg-komuna-soft p-10 text-center"><p className="font-display text-2xl text-komuna-dark">Komunitas belum ditemukan.</p><Link href="/communities" className="mt-3 inline-block font-bold text-komuna-forest underline">Buka direktori komunitas</Link></div>}
        </div>
      </section>

      <section id="event" className="bg-komuna-soft px-4 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl"><SectionHeading eyebrow="Kegiatan" title="Kegiatan Mendatang" copy="Pilih kegiatan dari komunitas dan ambil bagian dalam pertemuan yang bermakna." href="/events" />
          {discoveryEvents.length > 0 ? <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{discoveryEvents.slice(0, 3).map((event) => <Link key={event.id} href={`/events/${event.slug}`} className="group overflow-hidden rounded-2xl bg-white transition hover:-translate-y-1 hover:shadow-xl"><div className="h-44 overflow-hidden">{event.coverImage || event.thumbnail ? <img src={event.coverImage || event.thumbnail || ""} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" loading="lazy" /> : <ImageFallback label={event.title} tone="coral" />}</div><div className="p-5"><p className="text-sm font-bold text-komuna-coral">{formatDate(event.eventDate)}</p><h3 className="mt-2 line-clamp-1 text-xl font-bold text-komuna-dark">{event.title}</h3><p className="mt-2 line-clamp-1 text-sm text-komuna-forest">{event.community?.name || event.organization?.name || "KomunaID"}</p><div className="mt-4 flex justify-between gap-3 text-xs text-komuna-dark/60"><span>{event.locationType === "ONLINE" ? "Online" : event.location || "Lokasi menyusul"}</span><span>{event.registeredCount}/{event.quota} peserta</span></div><span className="mt-5 inline-block text-sm font-bold text-komuna-forest">Lihat Event &rarr;</span></div></Link>)}</div> : <div className="rounded-2xl border border-dashed border-komuna-forest/20 bg-white p-10 text-center"><p className="font-display text-2xl text-komuna-dark">Belum ada event mendatang.</p></div>}</div>
      </section>

      <section id="volunteer" className="px-4 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl"><SectionHeading eyebrow="Kontribusi" title="Temukan Kesempatan Volunteer" copy="Ambil bagian dalam kegiatan komunitas lewat peran volunteer yang tersedia." href="/volunteer" />
          {discoveryVolunteers.length > 0 ? <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{discoveryVolunteers.slice(0, 3).map((volunteer) => <Link key={volunteer.id} href={`/volunteer/${volunteer.slug}`} className="group rounded-2xl border border-komuna-forest/10 bg-white p-6 transition hover:-translate-y-1 hover:shadow-xl"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-komuna-soft text-2xl text-komuna-coral" aria-hidden="true">+</div><p className="mt-6 text-sm font-bold text-komuna-coral">{volunteer.status === "OPEN" ? "Pendaftaran terbuka" : volunteer.status}</p><h3 className="mt-2 line-clamp-1 text-xl font-bold text-komuna-dark">{volunteer.title}</h3><p className="mt-2 line-clamp-1 text-sm text-komuna-forest">{volunteer.event?.community?.name || volunteer.event?.title || "Komunitas"}</p><p className="mt-4 line-clamp-2 min-h-10 text-sm leading-5 text-komuna-dark/65">{volunteer.description || "Kesempatan untuk berkontribusi bersama komunitas."}</p><div className="mt-5 flex justify-between gap-3 text-xs text-komuna-dark/60"><span>{formatDate(volunteer.activityStartDate || volunteer.event?.eventDate)}</span><span className="truncate">{volunteer.event?.location || "Lokasi menyusul"}</span></div><span className="mt-5 inline-block text-sm font-bold text-komuna-forest">Lihat Detail &rarr;</span></Link>)}</div> : <div className="rounded-2xl border border-dashed border-komuna-forest/20 bg-komuna-soft p-10 text-center"><p className="font-display text-2xl text-komuna-dark">Kesempatan volunteer akan hadir di sini.</p></div>}</div>
      </section>

      <section className="bg-komuna-forest px-4 py-16 text-white sm:py-24">
        <div className="mx-auto max-w-7xl"><p className="text-sm font-bold uppercase tracking-[0.16em] text-komuna-coral">Cara Kerja KomunaID</p><h2 className="mt-3 max-w-xl font-display text-4xl font-semibold sm:text-5xl">Dari menemukan ruang sampai memberi dampak.</h2><div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{[["01", "Temukan", "Temukan komunitas sesuai minat dan kebutuhanmu."], ["02", "Bergabung", "Daftar dan bergabung dengan komunitas pilihanmu."], ["03", "Ikuti Kegiatan", "Temukan event dan kegiatan yang diselenggarakan komunitas."], ["04", "Berkontribusi", "Ikuti kesempatan volunteer dan ambil bagian dalam kegiatan komunitas."]].map(([number, title, description]) => <div key={number} className="border-t border-white/25 pt-5"><p className="font-display text-3xl text-komuna-coral">{number}</p><h3 className="mt-5 text-lg font-bold">{title}</h3><p className="mt-2 text-sm leading-6 text-white/70">{description}</p></div>)}</div></div>
      </section>
    </>
  );
}
