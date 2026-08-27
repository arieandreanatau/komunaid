"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/lib/api";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { JsonLd } from "@/components/json-ld";

interface Category {
  id: string;
  name: string;
  type?: string;
}

interface Community {
  id: string;
  name: string;
  slug: string;
  description: string;
  coverImage: string | null;
  logo: string | null;
  location: string | null;
  memberCount: number;
  eventCount: number;
  categories: { id: string; name: string }[];
}

interface EventItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  eventDate: string | null;
  coverImage: string | null;
  location: string | null;
  locationType: string;
  community?: { name: string } | null;
  organization?: { name: string } | null;
}

interface VolunteerItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  status: string;
  activityStartDate: string | null;
  event?: { title: string; location: string | null } | null;
}

type TabKey = "all" | "communities" | "events" | "volunteer" | "categories";

const TABS: { key: TabKey; label: string }[] = [
  { key: "all", label: "Semua" },
  { key: "communities", label: "Komunitas" },
  { key: "events", label: "Event" },
  { key: "volunteer", label: "Volunteer" },
  { key: "categories", label: "Kategori" },
];

function formatDate(value: string | null) {
  if (!value) return "Tanggal menyusul";
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value));
}

function matches(text: string | null | undefined, query: string) {
  return `${text ?? ""}`.toLocaleLowerCase("id-ID").includes(query);
}

function EmptyResult({ query }: { query: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-komuna-forest/20 bg-komuna-soft p-12 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-komuna-coral" aria-hidden="true">
        <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
      </div>
      <p className="mt-5 font-display text-2xl text-komuna-dark">No results found</p>
      <p className="mt-2 text-sm text-komuna-dark/65">
        {query ? `Tidak ada hasil untuk "${query}".` : "Masukkan kata kunci pencarian."}
      </p>
      <p className="mt-1 text-sm text-komuna-dark/65">Coba kata kunci lain atau jelajahi kategori kami.</p>
      <Link href="/categories" className="mt-5 inline-block font-bold text-komuna-forest underline decoration-komuna-coral decoration-2 underline-offset-4">Jelajahi kategori</Link>
    </div>
  );
}

function SearchResultsInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";

  const [query, setQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [volunteers, setVolunteers] = useState<VolunteerItem[]>([]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const [categoryRes, communityRes, eventRes, volunteerRes] = await Promise.allSettled([
        api.get("/categories", { params: { type: "COMMUNITY" } }),
        api.get("/communities", { params: { limit: 100, orderBy: "memberCount", sort: "desc" } }),
        api.get("/events/popular/upcoming"),
        api.get("/volunteer-programs", { params: { limit: 50, status: "REGISTRATION_OPEN" } }),
      ]);
      if (cancelled) return;
      const read = (r: PromiseSettledResult<{ data: { data?: unknown } }>) => (r.status === "fulfilled" ? (r.value.data.data ?? []) : []);
      setCategories(read(categoryRes as PromiseSettledResult<{ data: { data?: unknown } }>) as Category[]);
      setCommunities(read(communityRes as PromiseSettledResult<{ data: { data?: unknown } }>) as Community[]);
      setEvents(read(eventRes as PromiseSettledResult<{ data: { data?: unknown } }>) as EventItem[]);
      setVolunteers(read(volunteerRes as PromiseSettledResult<{ data: { data?: unknown } }>) as VolunteerItem[]);
      setLoading(false);
    }
    void load();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    setQuery(searchParams.get("q") ?? "");
  }, [searchParams]);

  const normalizedQuery = query.trim().toLocaleLowerCase("id-ID");

  const filtered = useMemo(() => {
    if (!normalizedQuery) {
      return { communities: [], events: [], volunteers: [], categories: [] };
    }
    const q = normalizedQuery;
    return {
      communities: communities.filter((c) =>
        matches(c.name, q) || matches(c.description, q) || matches(c.location, q) || c.categories.some((cat) => matches(cat.name, q))),
      events: events.filter((e) => matches(e.title, q) || matches(e.description, q) || matches(e.community?.name, q) || matches(e.organization?.name, q)),
      volunteers: volunteers.filter((v) => matches(v.title, q) || matches(v.description, q) || matches(v.event?.title, q)),
      categories: categories.filter((cat) => matches(cat.name, q) && (!cat.type || cat.type === "COMMUNITY")),
    };
  }, [normalizedQuery, communities, events, volunteers, categories]);

  const resultCount = filtered.communities.length + filtered.events.length + filtered.volunteers.length + filtered.categories.length;
  const showEmpty = !loading && normalizedQuery.length > 0 && resultCount === 0;
  const isIdle = !loading && normalizedQuery.length === 0;

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const next = normalizedQuery;
    router.replace(next ? `/search?q=${encodeURIComponent(query.trim())}` : "/search", { scroll: false });
  }

  function renderCommunities(list: Community[]) {
    return (
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((c) => (
          <Link key={c.id} href={`/communities/${c.slug}`} className="group overflow-hidden rounded-2xl border border-komuna-forest/10 bg-white transition duration-200 hover:-translate-y-1 hover:shadow-xl">
            <div className="h-40 overflow-hidden">
              {c.coverImage || c.logo ? <img src={c.coverImage || c.logo || ""} alt={c.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" loading="lazy" /> : <div className="flex h-full items-center justify-center bg-gradient-to-br from-komuna-forest to-komuna-dark"><span className="font-display text-5xl text-white/25">{c.name.slice(0, 1)}</span></div>}
            </div>
            <div className="p-5">
              <p className="text-xs font-bold text-komuna-coral">{c.categories[0]?.name || "Komunitas"}</p>
              <h3 className="mt-2 line-clamp-1 text-lg font-bold text-komuna-dark">{c.name}</h3>
              <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-komuna-dark/65">{c.description || "Komunitas untuk bertumbuh bersama."}</p>
              <div className="mt-4 flex items-center justify-between gap-3 text-xs text-komuna-dark/55">
                <span>{c.memberCount} anggota</span>
                <span className="truncate">{c.location || "Indonesia"}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    );
  }

  function renderEvents(list: EventItem[]) {
    return (
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {list.map((event) => (
          <Link key={event.id} href={`/events/${event.slug}`} className="group overflow-hidden rounded-2xl border border-komuna-forest/10 bg-white transition hover:-translate-y-1 hover:shadow-xl">
            <div className="h-40 overflow-hidden">
              {event.coverImage ? <img src={event.coverImage} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" loading="lazy" /> : <div className="flex h-full items-center justify-center bg-gradient-to-br from-komuna-coral to-[#c65240] font-display text-5xl text-white/25">{event.title.slice(0, 1)}</div>}
            </div>
            <div className="p-5">
              <p className="text-sm font-bold text-komuna-coral">{formatDate(event.eventDate)}</p>
              <h3 className="mt-2 line-clamp-1 text-xl font-bold text-komuna-dark">{event.title}</h3>
              <p className="mt-2 line-clamp-1 text-sm text-komuna-forest">{event.community?.name || event.organization?.name || "KomunaID"}</p>
              <div className="mt-4 flex justify-between gap-3 text-xs text-komuna-dark/60">
                <span>{event.locationType === "ONLINE" ? "Online" : event.location || "Lokasi menyusul"}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    );
  }

  function renderVolunteers(list: VolunteerItem[]) {
    return (
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {list.map((volunteer) => (
          <Link key={volunteer.id} href={`/volunteer/${volunteer.slug}`} className="group rounded-2xl border border-komuna-forest/10 bg-white p-6 transition hover:-translate-y-1 hover:shadow-xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-komuna-soft text-2xl text-komuna-coral" aria-hidden="true">+</div>
            <p className="mt-6 text-sm font-bold text-komuna-coral">{volunteer.status === "REGISTRATION_OPEN" ? "Pendaftaran Dibuka" : volunteer.status === "ONGOING" ? "Berlangsung" : volunteer.status === "REGISTRATION_CLOSED" ? "Pendaftaran Ditutup" : volunteer.status}</p>
            <h3 className="mt-2 line-clamp-1 text-xl font-bold text-komuna-dark">{volunteer.title}</h3>
            <p className="mt-2 line-clamp-1 text-sm text-komuna-forest">{volunteer.event?.title || "Komunitas"}</p>
            <p className="mt-4 line-clamp-2 min-h-10 text-sm leading-5 text-komuna-dark/65">{volunteer.description || "Kesempatan untuk berkontribusi bersama komunitas."}</p>
          </Link>
        ))}
      </div>
    );
  }

  function renderResults() {
    if (loading) {
      return (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-komuna-forest/10 bg-white animate-pulse">
              <div className="h-40 rounded-t-2xl bg-komuna-soft" />
              <div className="space-y-3 p-5">
                <div className="h-3 w-1/3 rounded bg-komuna-soft" />
                <div className="h-5 w-3/4 rounded bg-komuna-soft" />
                <div className="h-3 w-full rounded bg-komuna-soft" />
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (isIdle) {
      return (
        <div className="rounded-2xl border border-dashed border-komuna-forest/20 bg-white p-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-komuna-soft text-komuna-coral" aria-hidden="true">
            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
          <p className="mt-5 font-display text-2xl text-komuna-dark">Cari komunitas, event, volunteer, atau kategori.</p>
          <p className="mt-2 text-sm text-komuna-dark/65">Contoh: teknologi, olahraga, volunteer, Jakarta.</p>
        </div>
      );
    }

    if (showEmpty) {
      return <EmptyResult query={query.trim()} />;
    }

    const showCategories = activeTab === "all" || activeTab === "categories";
    const showCommunities = activeTab === "all" || activeTab === "communities";
    const showEvents = activeTab === "all" || activeTab === "events";
    const showVolunteer = activeTab === "all" || activeTab === "volunteer";

    return (
      <div className="space-y-14">
        {activeTab === "all" && (
          <>
            <ResultSection heading="Komunitas" count={filtered.communities.length} href="/communities">
              {renderCommunities(filtered.communities.slice(0, 3))}
            </ResultSection>
            <ResultSection heading="Event" count={filtered.events.length} href="/events">
              {renderEvents(filtered.events.slice(0, 3))}
            </ResultSection>
            <ResultSection heading="Volunteer" count={filtered.volunteers.length} href="/volunteer">
              {renderVolunteers(filtered.volunteers.slice(0, 3))}
            </ResultSection>
            {filtered.categories.length > 0 && (
              <div>
                <h2 className="font-display text-2xl font-semibold text-komuna-dark">Kategori</h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {filtered.categories.map((cat) => (
                    <Link key={cat.id} href={`/communities?search=${encodeURIComponent(cat.name)}`} className="rounded-full border border-komuna-forest/15 bg-white px-4 py-2 text-sm font-bold text-komuna-forest transition hover:border-komuna-forest hover:bg-komuna-forest hover:text-white">{cat.name}</Link>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {showCommunities && activeTab !== "all" && (
          filtered.communities.length > 0 ? renderCommunities(filtered.communities) : <EmptyResult query={query.trim()} />
        )}
        {showEvents && activeTab !== "all" && (
          filtered.events.length > 0 ? renderEvents(filtered.events) : <EmptyResult query={query.trim()} />
        )}
        {showVolunteer && activeTab !== "all" && (
          filtered.volunteers.length > 0 ? renderVolunteers(filtered.volunteers) : <EmptyResult query={query.trim()} />
        )}
        {showCategories && activeTab !== "all" && (
          filtered.categories.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.categories.map((cat) => (
                <Link key={cat.id} href={`/communities?search=${encodeURIComponent(cat.name)}`} className="group rounded-2xl border border-komuna-forest/10 bg-white p-6 transition hover:-translate-y-1 hover:shadow-xl">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-komuna-soft text-xl font-bold text-komuna-coral" aria-hidden="true">{cat.name.charAt(0)}</div>
                  <h3 className="mt-4 text-lg font-bold text-komuna-dark group-hover:text-komuna-forest">{cat.name}</h3>
                </Link>
              ))}
            </div>
          ) : <EmptyResult query={query.trim()} />
        )}

        {activeTab === "all" && (
          <div className="text-center">
            <Link href="/categories" className="inline-flex items-center gap-2 font-bold text-komuna-forest underline decoration-komuna-coral decoration-2 underline-offset-4 hover:text-komuna-dark">Lihat semua kategori <span aria-hidden="true">&rarr;</span></Link>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-komuna-cream text-komuna-dark">
      <a href="#content" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-komuna-coral focus:px-4 focus:py-2 focus:font-semibold focus:text-white">Langsung ke konten utama</a>
      <JsonLd type="website" />
      <Header />

      <main id="content">
        <section className="bg-komuna-soft px-4 py-14 sm:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-komuna-coral">Pencarian</p>
            <h1 className="mt-3 font-display text-4xl font-semibold tracking-[-0.03em] text-komuna-dark sm:text-5xl">Temukan apa yang kamu cari</h1>
            <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-3 sm:flex-row">
              <label className="sr-only" htmlFor="search-input">Cari komunitas, event, volunteer, atau kategori</label>
              <div className="relative flex-1">
                <svg aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-komuna-forest/50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m1.35-5.15a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z" /></svg>
                <input id="search-input" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari komunitas, event, volunteer, atau kategori..." className="w-full rounded-xl border border-transparent bg-white py-3.5 pl-12 pr-4 text-sm text-komuna-dark outline-none placeholder:text-komuna-dark/45 focus:border-komuna-forest focus:ring-2 focus:ring-komuna-forest/15" />
              </div>
              <button type="submit" className="rounded-xl bg-komuna-forest px-6 py-3.5 text-sm font-bold text-white transition hover:bg-komuna-dark">Cari</button>
            </form>
          </div>
        </section>

        <section className="px-4 py-12 sm:py-16">
          <div className="mx-auto max-w-7xl">
            <div className="-mx-4 mb-10 flex gap-2 overflow-x-auto px-4 pb-2 scrollbar-hide" aria-label="Tab hasil pencarian">
              {TABS.map((tab) => (
                <button key={tab.key} type="button" onClick={() => setActiveTab(tab.key)} aria-pressed={activeTab === tab.key} className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold transition ${activeTab === tab.key ? "bg-komuna-forest text-white" : "border border-komuna-forest/15 bg-white text-komuna-forest hover:border-komuna-forest"}`}>{tab.label}</button>
              ))}
            </div>
            {!isIdle && !showEmpty && normalizedQuery && (
              <p className="mb-8 text-sm text-komuna-dark/60">
                {resultCount} hasil untuk <span className="font-bold text-komuna-dark">&ldquo;{query.trim()}&rdquo;</span>
              </p>
            )}
            {renderResults()}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

function ResultSection({ heading, count, href, children }: { heading: string; count: number; href: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-5 flex items-end justify-between gap-4">
        <h2 className="font-display text-2xl font-semibold text-komuna-dark">
          {heading}
          {count > 0 && <span className="ml-2 text-base font-bold text-komuna-coral">{count}</span>}
        </h2>
        <Link href={href} className="inline-flex shrink-0 items-center gap-1 text-sm font-bold text-komuna-forest underline decoration-komuna-coral decoration-2 underline-offset-4 hover:text-komuna-dark">Lihat semua</Link>
      </div>
      {count > 0 ? children : <EmptyResult query="" />}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-komuna-cream text-komuna-dark">
        <Header />
        <main className="px-4 py-20"><div className="mx-auto max-w-3xl animate-pulse"><div className="h-8 w-1/2 rounded bg-komuna-soft" /><div className="mt-6 h-12 rounded-xl bg-white" /></div></main>
        <Footer />
      </div>
    }>
      <SearchResultsInner />
    </Suspense>
  );
}
