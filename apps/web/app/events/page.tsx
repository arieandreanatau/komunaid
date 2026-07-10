"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import api from "@/lib/api";

interface Event {
  id: string;
  title: string;
  slug: string;
  description: string;
  coverImage: string;
  thumbnail: string;
  location: string;
  locationType: string;
  isOnline: boolean;
  eventDate: string;
  status: string;
  quota: number;
  registeredCount: number;
  community: { name: string; slug: string } | null;
  organization: { name: string; slug: string } | null;
  categories: Array<{ id: string; name: string }>;
}

const EVENT_STATUS_MAP: Record<string, { label: string; className: string }> = {
  DRAFT: { label: "Draft", className: "bg-gray-100 text-gray-600" },
  PUBLISHED: { label: "Diterbitkan", className: "bg-blue-100 text-blue-700" },
  REGISTRATION_OPEN: { label: "Pendaftaran Buka", className: "bg-green-100 text-green-700" },
  REGISTRATION_CLOSED: { label: "Pendaftaran Tutup", className: "bg-yellow-100 text-yellow-700" },
  ONGOING: { label: "Berlangsung", className: "bg-purple-100 text-purple-700" },
  COMPLETED: { label: "Selesai", className: "bg-green-200 text-green-800" },
  CANCELLED: { label: "Dibatalkan", className: "bg-red-100 text-red-700" },
  ARCHIVED: { label: "Diarsipkan", className: "bg-gray-200 text-gray-700" },
};

const LOCATION_FILTERS = [
  { value: "", label: "Semua" },
  { value: "OFFLINE", label: "Offline" },
  { value: "ONLINE", label: "Online" },
  { value: "HYBRID", label: "Hybrid" },
];

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [locationType, setLocationType] = useState("");
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
      const params: Record<string, string | number> = { page, limit: 12, upcoming: "true" };
      if (debouncedSearch) params.search = debouncedSearch;
      if (locationType) params.locationType = locationType;
      const { data } = await api.get("/events", { params });
      setEvents(data.events || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch {
      console.error("Gagal memuat event");
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, locationType]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, locationType]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-komuna-blue flex items-center justify-center">
              <span className="text-white font-bold text-sm">K</span>
            </div>
            <span className="font-bold text-xl text-komuna-navy">KomunaID</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link href="/communities" className="hover:text-komuna-blue">Komunitas</Link>
            <Link href="/events" className="text-komuna-blue">Event</Link>
            <Link href="/about" className="hover:text-komuna-blue">Tentang</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login" className="px-4 py-2 text-sm font-medium text-komuna-navy hover:text-komuna-blue">Masuk</Link>
            <Link href="/register" className="px-4 py-2 text-sm font-medium text-white bg-komuna-blue rounded-lg hover:bg-komuna-navy">Daftar</Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-komuna-navy mb-2">Event Mendatang</h1>
          <p className="text-gray-500 mb-6">Temukan event menarik di sekitarmu</p>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Cari event..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-komuna-blue focus:border-komuna-blue text-sm"
              />
            </div>
            <div className="flex gap-2">
              {LOCATION_FILTERS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setLocationType(f.value)}
                  className={`px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
                    locationType === f.value
                      ? "bg-komuna-blue text-white border-komuna-blue"
                      : "bg-white text-gray-600 border-gray-200 hover:border-komuna-blue/50"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="h-10 w-10 border-4 border-komuna-blue border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-gray-500">Memuat event...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
            <svg className="h-16 w-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="text-lg font-semibold text-komuna-navy mb-1">Tidak ada event ditemukan</h3>
            <p className="text-gray-500 text-sm">Coba kata kunci atau filter yang berbeda</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((e) => {
              const statusInfo = EVENT_STATUS_MAP[e.status];
              return (
                <Link
                  key={e.id}
                  href={`/events/${e.slug}`}
                  className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden group"
                >
                  <div className="h-44 relative overflow-hidden">
                    {e.coverImage || e.thumbnail ? (
                      <img
                        src={e.coverImage || e.thumbnail}
                        alt={e.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="h-full bg-gradient-to-br from-komuna-blue to-komuna-teal flex items-center justify-center">
                        <span className="text-white text-5xl font-bold opacity-30">{e.title[0]}</span>
                      </div>
                    )}
                    {statusInfo && (
                      <span className={`absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.className}`}>
                        {statusInfo.label}
                      </span>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="font-semibold text-komuna-navy mb-2 line-clamp-1 group-hover:text-komuna-blue transition-colors">{e.title}</h3>
                    <p className="text-sm text-gray-500 mb-2">{formatDate(e.eventDate)}</p>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-4">{e.description}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                      <svg className="h-3.5 w-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>{e.locationType === "ONLINE" ? "Online" : e.location || "Lokasi TBD"}</span>
                      <span className="mx-1">·</span>
                      <svg className="h-3.5 w-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>{e.registeredCount}/{e.quota} peserta</span>
                    </div>
                    {e.categories && e.categories.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {e.categories.slice(0, 3).map((cat) => (
                          <span key={cat.id} className="px-2 py-0.5 bg-komuna-blue/5 text-komuna-blue rounded text-xs font-medium">
                            {cat.name}
                          </span>
                        ))}
                        {e.categories.length > 3 && (
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-xs">
                            +{e.categories.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                    {(e.community || e.organization) && (
                      <div className="text-xs text-komuna-blue">
                        oleh {e.community?.name || e.organization?.name}
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`px-3 py-1 rounded-lg text-sm ${p === page ? "bg-komuna-blue text-white" : "bg-white border hover:bg-gray-50"}`}
              >
                {p}
              </button>
            ))}
          </div>
        )}
        {/* Volunteer CTA */}
        <div className="bg-gradient-to-r from-komuna-teal to-komuna-aqua rounded-xl p-6 mt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-white/20 rounded-lg flex items-center justify-center shrink-0">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Ingin jadi relawan?</h2>
                <p className="text-white/80 mt-0.5">Temukan peluang volunteer dari komunitas dan organisasi di seluruh Indonesia.</p>
              </div>
            </div>
            <Link
              href="/volunteer"
              className="px-6 py-3 bg-white text-komuna-teal rounded-lg font-semibold hover:bg-gray-100 transition-colors whitespace-nowrap"
            >
              Lihat Peluang Volunteer
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
