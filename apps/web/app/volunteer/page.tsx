"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Pagination } from "@/components/pagination";
import api from "@/lib/api";

interface VolunteerPosition {
  id: string;
  name: string;
  requiredQty: number;
}

interface VolunteerOpportunity {
  id: string;
  title: string;
  slug: string;
  description: string;
  coverImage?: string | null;
  thumbnail?: string | null;
  status: string;
  registrationDeadline: string;
  activityStartDate: string;
  event: {
    id: string;
    title: string;
    slug: string;
    eventDate: string;
    location: string;
    status: string;
  };
  createdBy: { id: string; name: string; avatar: string };
  positions: VolunteerPosition[];
  applicationCount: number;
  createdAt: string;
}

const STATUS_TABS = [
  { value: "", label: "Semua" },
  { value: "OPEN", label: "Open" },
  { value: "CLOSED", label: "Closed" },
];

const SORT_OPTIONS = [
  { value: "newest", label: "Terbaru" },
  { value: "oldest", label: "Terlama" },
  { value: "name", label: "Nama A-Z" },
  { value: "deadline", label: "Deadline Terdekat" },
];

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  OPEN: { label: "Open", className: "bg-green-100 text-green-700" },
  CLOSED: { label: "Closed", className: "bg-red-100 text-red-700" },
};

export default function VolunteerListPage() {
  const [opportunities, setOpportunities] = useState<VolunteerOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timeout);
  }, [search]);

  const fetchOpportunities = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, string | number> = { page, limit: 12 };
      if (debouncedSearch) params.search = debouncedSearch;
      if (status) params.status = status;

      if (sort === "name") {
        params.orderBy = "title";
        params.sort = "asc";
      } else if (sort === "deadline") {
        params.orderBy = "registrationDeadline";
        params.sort = "asc";
      } else if (sort === "oldest") {
        params.orderBy = "createdAt";
        params.sort = "asc";
      } else {
        params.orderBy = "createdAt";
        params.sort = "desc";
      }

      const { data } = await api.get("/volunteer", { params });
      setOpportunities(data.data || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotal(data.pagination?.total || 0);
    } catch {
      setOpportunities([]);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, status, sort]);

  useEffect(() => { fetchOpportunities(); }, [fetchOpportunities]);
  useEffect(() => { setPage(1); }, [debouncedSearch, status, sort]);

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="min-h-screen flex flex-col bg-komuna-cream text-komuna-dark">
      <Header />
      <main className="container mx-auto px-4 py-12 flex-1">
        <div className="mb-8">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-komuna-coral">Kontribusi</p>
          <h1 className="mt-3 font-display text-4xl font-semibold tracking-[-0.03em] text-komuna-dark sm:text-5xl">Direktori Volunteer</h1>
          <p className="mt-3 text-base leading-7 text-komuna-dark/65">Temukan kesempatan volunteer dan berkontribusi untuk komunitas</p>

          <div className="mt-6 flex flex-wrap gap-2 mb-4">
            {STATUS_TABS.map((tab) => (
              <button key={tab.value} onClick={() => setStatus(tab.value)} className={`px-4 py-2 text-sm font-bold rounded-full transition ${status === tab.value ? "bg-komuna-forest text-white" : "border border-komuna-forest/15 bg-white text-komuna-forest hover:border-komuna-forest"}`}>
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-komuna-forest/45" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input type="text" placeholder="Cari volunteer..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-komuna-forest/15 bg-white text-sm text-komuna-dark placeholder:text-komuna-dark/45 focus:outline-none focus:ring-2 focus:ring-komuna-forest/15 focus:border-komuna-forest" />
            </div>
            <select value={sort} onChange={(e) => setSort(e.target.value)} className="px-4 py-2.5 rounded-xl border border-komuna-forest/15 bg-white text-sm text-komuna-dark focus:outline-none focus:ring-2 focus:ring-komuna-forest/15">
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-komuna-forest/10 bg-white overflow-hidden animate-pulse">
                <div className="h-44 bg-komuna-soft" />
                <div className="p-5 space-y-3">
                  <div className="h-3 bg-komuna-soft rounded w-1/3" />
                  <div className="h-4 bg-komuna-soft rounded w-3/4" />
                  <div className="h-3 bg-komuna-soft rounded w-full" />
                  <div className="h-3 bg-komuna-soft rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : opportunities.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-komuna-forest/20">
            <svg className="h-16 w-16 text-komuna-coral/30 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
            <h3 className="text-lg font-semibold text-komuna-dark mb-1">Tidak ada volunteer ditemukan</h3>
            <p className="text-komuna-dark/60 text-sm">Coba kata kunci atau filter yang berbeda</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-komuna-dark/60 mb-4">{total} kesempatan volunteer ditemukan</p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {opportunities.map((opp) => {
                const statusInfo = STATUS_MAP[opp.status];
                return (
                  <Link key={opp.id} href={`/volunteer/${opp.slug}`} className="group overflow-hidden rounded-2xl border border-komuna-forest/10 bg-white transition duration-200 hover:-translate-y-1 hover:shadow-xl">
                    <div className="h-44 relative overflow-hidden">
                      {opp.coverImage || opp.thumbnail ? (
                        <img src={opp.coverImage || opp.thumbnail!} alt={opp.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="h-full bg-gradient-to-br from-komuna-teal to-komuna-aqua flex items-center justify-center"><span className="text-white text-5xl font-bold opacity-30">{opp.title[0]}</span></div>
                      )}
                      {statusInfo && <span className={`absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/90 ${statusInfo.label === "Open" ? "text-komuna-forest" : "text-red-600"}`}>{statusInfo.label}</span>}
                    </div>
                    <div className="p-5">
                      <p className="text-xs font-bold text-komuna-coral">{formatDate(opp.activityStartDate || opp.registrationDeadline)}</p>
                      <h3 className="mt-2 font-semibold text-komuna-dark mb-2 line-clamp-1 group-hover:text-komuna-forest transition-colors">{opp.title}</h3>
                      <p className="text-sm text-komuna-dark/65 line-clamp-2 mb-3 min-h-10">{opp.description}</p>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-komuna-dark/55 mb-2">
                        {opp.event?.location && (
                          <>
                            <span className="inline-flex items-center gap-1">
                              <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                              {opp.event.location}
                            </span>
                            <span className="text-komuna-coral">&middot;</span>
                          </>
                        )}
                        <span>{opp.applicationCount} pendaftar</span>
                      </div>
                      {opp.positions && opp.positions.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          {opp.positions.slice(0, 3).map((pos) => (
                            <span key={pos.id} className="px-2.5 py-0.5 bg-komuna-teal/10 text-komuna-teal rounded-full text-xs font-bold">{pos.name}</span>
                          ))}
                        </div>
                      )}
                      <span className="mt-1 inline-block text-sm font-bold text-komuna-forest">Lihat Detail &rarr;</span>
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
