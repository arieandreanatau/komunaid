"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import api from "@/lib/api";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Pagination } from "@/components/pagination";
import { EventCard, EventCardSkeleton } from "@/components/event-card";
import type { EventCardData } from "@/components/event-card";

const STATUS_TABS = [
  { value: "", label: "Semua" },
  { value: "upcoming", label: "Mendatang" },
  { value: "ongoing", label: "Berlangsung" },
  { value: "finished", label: "Selesai" },
];

const LOCATION_FILTERS = [
  { value: "", label: "Semua" },
  { value: "OFFLINE", label: "Offline" },
  { value: "ONLINE", label: "Online" },
  { value: "HYBRID", label: "Hybrid" },
];

const SECTION_TABS = [
  { key: "browse", label: "Jelajahi" },
  { key: "featured", label: "Unggulan" },
  { key: "upcoming", label: "Mendatang" },
  { key: "popular", label: "Populer" },
] as const;

type SectionTab = (typeof SECTION_TABS)[number]["key"];

export default function EventsPage() {
  const searchParams = useSearchParams();
  const communityId = searchParams.get("communityId") || "";
  const [activeSection, setActiveSection] = useState<SectionTab>("browse");
  const [events, setEvents] = useState<EventCardData[]>([]);
  const [featuredEvents, setFeaturedEvents] = useState<EventCardData[]>([]);
  const [communityName, setCommunityName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [sectionLoading, setSectionLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusTab, setStatusTab] = useState("");
  const [locationType, setLocationType] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timeout);
  }, [search]);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, limit: 12 };
      if (debouncedSearch) params.search = debouncedSearch;
      if (locationType) params.locationType = locationType;
      if (communityId) params.communityId = communityId;

      if (statusTab === "upcoming") {
        params.upcoming = "true";
      } else if (statusTab === "ongoing") {
        params.status = "ONGOING";
      } else if (statusTab === "finished") {
        params.status = "COMPLETED";
      }

      if (sort === "oldest") {
        params.orderBy = "eventDate";
        params.sort = "asc";
      } else if (sort === "date") {
        params.orderBy = "eventDate";
        params.sort = "desc";
      } else {
        params.orderBy = "createdAt";
        params.sort = "desc";
      }

      const { data } = await api.get("/events", { params });
      setEvents(data.data || data.events || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotal(data.pagination?.total || 0);
    } catch {
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, locationType, statusTab, sort, communityId]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);
  useEffect(() => { setPage(1); }, [debouncedSearch, locationType, statusTab, sort]);

  const fetchFeatured = useCallback(async () => {
    setSectionLoading(true);
    try {
      const { data } = await api.get("/events/featured");
      setFeaturedEvents(data.data || []);
    } catch {}
    finally { setSectionLoading(false); }
  }, []);

  const fetchUpcomingEvents = useCallback(async () => {
    setSectionLoading(true);
    try {
      const { data } = await api.get("/events", { params: { limit: 12, upcoming: "true", orderBy: "eventDate", sort: "asc" } });
      setFeaturedEvents(data.data || data.events || []);
    } catch {}
    finally { setSectionLoading(false); }
  }, []);

  const fetchPopularEvents = useCallback(async () => {
    setSectionLoading(true);
    try {
      const { data } = await api.get("/events/popular/upcoming");
      setFeaturedEvents(data.data || []);
    } catch {}
    finally { setSectionLoading(false); }
  }, []);

  useEffect(() => {
    if (activeSection === "featured") fetchFeatured();
    else if (activeSection === "upcoming") fetchUpcomingEvents();
    else if (activeSection === "popular") fetchPopularEvents();
  }, [activeSection, fetchFeatured, fetchUpcomingEvents, fetchPopularEvents]);

  useEffect(() => {
    if (communityId) {
      api.get(`/communities/${communityId}`).then(({ data }) => {
        const c = data.data || data.community;
        setCommunityName(c?.name || "");
      }).catch(() => {});
    }
  }, [communityId]);

  const activeFilters: Array<{ label: string; clear: () => void }> = [];
  if (search) activeFilters.push({ label: `Cari: ${search}`, clear: () => { setSearch(""); setDebouncedSearch(""); } });
  if (locationType) activeFilters.push({
    label: LOCATION_FILTERS.find((f) => f.value === locationType)?.label || locationType,
    clear: () => setLocationType(""),
  });

  const clearAll = () => {
    setSearch("");
    setDebouncedSearch("");
    setLocationType("");
    setStatusTab("");
  };

  const renderSectionContent = () => {
    if (activeSection !== "browse") {
      if (sectionLoading) {
        return (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <EventCardSkeleton key={i} />
            ))}
          </div>
        );
      }
      if (featuredEvents.length === 0) {
        return (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-komuna-forest/20">
            <svg className="h-16 w-16 text-komuna-coral/30 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            <h3 className="text-lg font-semibold text-komuna-dark mb-1">
              {activeSection === "featured" ? "Belum ada event unggulan" : "Belum ada event mendatang"}
            </h3>
            <p className="text-komuna-dark/60 text-sm">Event akan muncul di sini</p>
          </div>
        );
      }
      return (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredEvents.map((e) => (
            <EventCard key={e.id} event={e} />
          ))}
        </div>
      );
    }

    return (
      <>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <p className="text-sm text-komuna-dark/60">
            {total} event {debouncedSearch ? `untuk "${debouncedSearch}"` : "ditemukan"}
          </p>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="px-3 py-2 rounded-lg border border-komuna-forest/15 bg-white text-sm text-komuna-dark focus:outline-none focus:ring-2 focus:ring-komuna-forest/15"
            aria-label="Urutkan event"
          >
            <option value="newest">Terbaru</option>
            <option value="oldest">Terlama</option>
            <option value="date">Tanggal Event</option>
          </select>
        </div>

        {activeFilters.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {activeFilters.map((f) => (
              <button
                key={f.label}
                onClick={f.clear}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-komuna-forest/20 bg-white text-xs font-semibold text-komuna-forest hover:bg-komuna-forest/5"
              >
                {f.label}
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            ))}
            <button onClick={clearAll} className="text-xs font-semibold text-komuna-dark/55 hover:text-komuna-forest underline">
              Hapus semua
            </button>
          </div>
        )}

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <EventCardSkeleton key={i} />
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-komuna-forest/20">
            <svg className="h-16 w-16 text-komuna-coral/30 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            <h3 className="text-lg font-semibold text-komuna-dark mb-1">Tidak ada event ditemukan</h3>
            <p className="text-komuna-dark/60 text-sm">Coba kata kunci atau filter yang berbeda</p>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((e) => (
                <EventCard key={e.id} event={e} />
              ))}
            </div>
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        )}
      </>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-komuna-cream text-komuna-dark">
      <Header />
      <main className="container mx-auto px-4 py-12 flex-1">
        <div className="mb-8">
          {communityId ? (
            <>
              <nav className="flex items-center gap-2 text-sm text-komuna-dark/60 mb-3">
                <Link href="/events" className="hover:text-komuna-forest transition-colors font-semibold">Event</Link>
                <span>/</span>
                <span className="text-komuna-dark font-semibold">{communityName || "Komunitas"}</span>
              </nav>
              <h1 className="font-display text-4xl font-semibold tracking-[-0.03em] text-komuna-dark sm:text-5xl">Event Komunitas</h1>
              <p className="mt-3 text-base leading-7 text-komuna-dark/65">Daftar event dari komunitas {communityName}</p>
            </>
          ) : (
            <>
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-komuna-coral">Kegiatan</p>
              <h1 className="mt-3 font-display text-4xl font-semibold tracking-[-0.03em] text-komuna-dark sm:text-5xl">Temukan Event yang Kamu Sukai</h1>
              <p className="mt-3 text-base leading-7 text-komuna-dark/65">Temukan event menarik di sekitarmu, ikuti kegiatan, dan bertumbuh bersama.</p>
            </>
          )}

          {!communityId && (
            <div className="mt-6 flex gap-2 overflow-x-auto border-b border-komuna-forest/10 pb-0">
              {SECTION_TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveSection(tab.key)}
                  className={`shrink-0 whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-bold transition-colors ${
                    activeSection === tab.key
                      ? "border-komuna-forest text-komuna-forest"
                      : "border-transparent text-komuna-dark/55 hover:text-komuna-dark"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}

          {communityId && (
            <div className="mt-6 flex flex-wrap gap-2 mb-4">
              {STATUS_TABS.map((tab) => (
                <button key={tab.value} onClick={() => setStatusTab(tab.value)} className={`px-4 py-2 text-sm font-bold rounded-full transition ${statusTab === tab.value ? "bg-komuna-forest text-white" : "border border-komuna-forest/15 bg-white text-komuna-forest hover:border-komuna-forest"}`}>
                  {tab.label}
                </button>
              ))}
            </div>
          )}

          <div className="mt-5 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-komuna-forest/45" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input type="text" placeholder="Cari event..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-11 pr-4 py-3 rounded-xl border border-komuna-forest/15 bg-white text-sm text-komuna-dark placeholder:text-komuna-dark/45 focus:outline-none focus:ring-2 focus:ring-komuna-forest/15 focus:border-komuna-forest" />
            </div>
            <div className="flex flex-wrap gap-2">
              {LOCATION_FILTERS.map((f) => (
                <button key={f.value} onClick={() => setLocationType(f.value)} className={`px-3 py-2 text-sm font-bold rounded-full transition ${locationType === f.value ? "bg-komuna-forest text-white" : "border border-komuna-forest/15 bg-white text-komuna-forest hover:border-komuna-forest"}`}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {renderSectionContent()}

      </main>
      <Footer />
    </div>
  );
}
