"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import api from "@/lib/api";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Pagination } from "@/components/pagination";

interface Event {
  id: string;
  title: string;
  slug: string;
  description: string;
  coverImage: string;
  thumbnail: string;
  location: string;
  locationType: string;
  eventDate: string;
  status: string;
  quota: number;
  registeredCount: number;
  community: { name: string; slug: string } | null;
  organization: { name: string; slug: string } | null;
  categories: Array<{ id: string; name: string }>;
}

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

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  DRAFT: { label: "Draft", className: "bg-gray-100 text-gray-600" },
  PUBLISHED: { label: "Diterbitkan", className: "bg-blue-100 text-blue-700" },
  REGISTRATION_OPEN: { label: "Pendaftaran Buka", className: "bg-green-100 text-green-700" },
  REGISTRATION_CLOSED: { label: "Pendaftaran Tutup", className: "bg-yellow-100 text-yellow-700" },
  ONGOING: { label: "Berlangsung", className: "bg-purple-100 text-purple-700" },
  COMPLETED: { label: "Selesai", className: "bg-green-200 text-green-800" },
  CANCELLED: { label: "Dibatalkan", className: "bg-red-100 text-red-700" },
  ARCHIVED: { label: "Diarsipkan", className: "bg-gray-200 text-gray-700" },
};

export default function EventsPage() {
  const searchParams = useSearchParams();
  const communityId = searchParams.get("communityId") || "";
  const [events, setEvents] = useState<Event[]>([]);
  const [communityName, setCommunityName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusTab, setStatusTab] = useState("");
  const [locationType, setLocationType] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
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
    } catch {
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, locationType, statusTab, sort, communityId]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);
  useEffect(() => { setPage(1); }, [debouncedSearch, locationType, statusTab, sort]);

  useEffect(() => {
    if (communityId) {
      api.get(`/communities/${communityId}`).then(({ data }) => {
        const c = data.data || data.community;
        setCommunityName(c?.name || "");
      }).catch(() => {});
    }
  }, [communityId]);

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-12 flex-1">
        <div className="mb-8">
          {communityId ? (
            <>
              <nav className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                <Link href="/events" className="hover:text-komuna-blue transition-colors">Event</Link>
                <span>/</span>
                <span className="text-komuna-navy font-medium">{communityName || "Komunitas"}</span>
              </nav>
              <h1 className="text-3xl font-bold text-komuna-navy mb-2">Event Komunitas</h1>
              <p className="text-gray-500 mb-6">Daftar event dari komunitas {communityName}</p>
            </>
          ) : (
            <>
              <h1 className="text-3xl font-bold text-komuna-navy mb-2">Direktori Event</h1>
              <p className="text-gray-500 mb-6">Temukan event menarik di sekitarmu</p>
            </>
          )}

          <div className="flex flex-wrap gap-2 mb-4">
            {STATUS_TABS.map((tab) => (
              <button key={tab.value} onClick={() => setStatusTab(tab.value)} className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${statusTab === tab.value ? "bg-komuna-blue text-white border-komuna-blue" : "bg-white text-gray-600 border-gray-200 hover:border-komuna-blue/50"}`}>
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input type="text" placeholder="Cari event..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-komuna-blue focus:border-komuna-blue text-sm" />
            </div>
            <div className="flex gap-2">
              {LOCATION_FILTERS.map((f) => (
                <button key={f.value} onClick={() => setLocationType(f.value)} className={`px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${locationType === f.value ? "bg-komuna-blue text-white border-komuna-blue" : "bg-white text-gray-600 border-gray-200 hover:border-komuna-blue/50"}`}>
                  {f.label}
                </button>
              ))}
            </div>
            <select value={sort} onChange={(e) => setSort(e.target.value)} className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-komuna-blue">
              <option value="newest">Terbaru</option>
              <option value="oldest">Terlama</option>
              <option value="date">Tanggal Event</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden animate-pulse">
                <div className="h-44 bg-gray-200" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                  <div className="h-3 bg-gray-200 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border">
            <svg className="h-16 w-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            <h3 className="text-lg font-semibold text-komuna-navy mb-1">Tidak ada event ditemukan</h3>
            <p className="text-gray-500 text-sm">Coba kata kunci atau filter yang berbeda</p>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((e) => {
                const statusInfo = STATUS_MAP[e.status];
                return (
                  <Link key={e.id} href={`/events/${e.slug}`} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
                    <div className="h-44 relative overflow-hidden">
                      {e.coverImage || e.thumbnail ? (
                        <img src={e.coverImage || e.thumbnail} alt={e.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="h-full bg-gradient-to-br from-komuna-blue to-komuna-teal flex items-center justify-center"><span className="text-white text-5xl font-bold opacity-30">{e.title[0]}</span></div>
                      )}
                      {statusInfo && <span className={`absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.className}`}>{statusInfo.label}</span>}
                    </div>
                    <div className="p-5">
                      <h3 className="font-semibold text-komuna-navy mb-2 line-clamp-1 group-hover:text-komuna-blue transition-colors">{e.title}</h3>
                      <p className="text-sm text-gray-500 mb-2">{formatDate(e.eventDate)}</p>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-3">{e.description}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                        <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        <span>{e.locationType === "ONLINE" ? "Online" : e.location || "Lokasi TBD"}</span>
                        <span className="mx-1">&middot;</span>
                        <span>{e.registeredCount}/{e.quota} peserta</span>
                      </div>
                      {e.categories && e.categories.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          {e.categories.slice(0, 3).map((cat) => (
                            <span key={cat.id} className="px-2 py-0.5 bg-komuna-blue/5 text-komuna-blue rounded text-xs font-medium">{cat.name}</span>
                          ))}
                        </div>
                      )}
                      {(e.community || e.organization) && (
                        <div className="text-xs text-komuna-blue">oleh {e.community?.name || e.organization?.name}</div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        )}

      </main>
      <Footer />
    </div>
  );
}
