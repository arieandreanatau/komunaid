"use client";

import { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Pagination } from "@/components/pagination";
import api from "@/lib/api";
import { VolunteerCard, VolunteerCardSkeleton } from "@/components/volunteer-card";
import type { VolunteerCardData } from "@/components/volunteer-card";

const SECTION_TABS = [
  { key: "browse", label: "Jelajahi" },
  { key: "featured", label: "Unggulan" },
  { key: "popular", label: "Populer" },
  { key: "upcoming", label: "Mendatang" },
  { key: "new", label: "Terbaru" },
] as const;

type SectionTab = (typeof SECTION_TABS)[number]["key"];

const STATUS_TABS = [
  { value: "", label: "Semua" },
  { value: "REGISTRATION_OPEN", label: "Open" },
  { value: "REGISTRATION_CLOSED", label: "Closed" },
];

const SORT_OPTIONS = [
  { value: "newest", label: "Terbaru" },
  { value: "oldest", label: "Terlama" },
  { value: "name", label: "Nama A-Z" },
  { value: "deadline", label: "Deadline Terdekat" },
];

interface Category {
  id: string;
  name: string;
}

export default function VolunteerListPage() {
  const [activeSection, setActiveSection] = useState<SectionTab>("browse");
  const [opportunities, setOpportunities] = useState<VolunteerCardData[]>([]);
  const [sectionList, setSectionList] = useState<VolunteerCardData[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [sectionLoading, setSectionLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await api.get("/categories", { params: { type: "VOLUNTEER" } });
        setCategories(data.data || []);
      } catch {}
    };
    fetchCategories();
  }, []);

  const fetchDiscovery = useCallback(async (endpoint: string) => {
    setSectionLoading(true);
    try {
      const { data } = await api.get(endpoint);
      setSectionList(data.data || []);
    } catch {
      setSectionList([]);
    } finally {
      setSectionLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeSection === "featured") fetchDiscovery("/volunteer-programs/featured");
    else if (activeSection === "popular") fetchDiscovery("/volunteer-programs/popular");
    else if (activeSection === "upcoming") fetchDiscovery("/volunteer-programs/upcoming");
    else if (activeSection === "new") fetchDiscovery("/volunteer-programs/new");
  }, [activeSection, fetchDiscovery]);

  const fetchOpportunities = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, string | number> = { page, limit: 12 };
      if (debouncedSearch) params.search = debouncedSearch;
      if (status) params.status = status;
      if (categoryId) params.categoryId = categoryId;

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

      const { data } = await api.get("/volunteer-programs", { params });
      setOpportunities(data.data || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotal(data.pagination?.total || 0);
    } catch {
      setOpportunities([]);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, status, categoryId, sort]);

  useEffect(() => {
    if (activeSection === "browse") fetchOpportunities();
  }, [activeSection, fetchOpportunities]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status, categoryId, sort]);

  const activeFilters: Array<{ label: string; clear: () => void }> = [];
  if (search) activeFilters.push({ label: `Cari: ${search}`, clear: () => { setSearch(""); setDebouncedSearch(""); } });
  if (status) activeFilters.push({
    label: status === "REGISTRATION_OPEN" ? "Open" : "Closed",
    clear: () => setStatus(""),
  });
  if (categoryId) activeFilters.push({
    label: categories.find((c) => c.id === categoryId)?.name || "Kategori",
    clear: () => setCategoryId(""),
  });

  const clearAll = () => {
    setSearch("");
    setDebouncedSearch("");
    setStatus("");
    setCategoryId("");
  };

  const renderSectionContent = () => {
    if (activeSection !== "browse") {
      if (sectionLoading) {
        return (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <VolunteerCardSkeleton key={i} />
            ))}
          </div>
        );
      }
      if (sectionList.length === 0) {
        return (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-komuna-forest/20">
            <svg className="h-16 w-16 text-komuna-coral/30 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
            <h3 className="text-lg font-semibold text-komuna-dark mb-1">Belum ada volunteer di bagian ini</h3>
            <p className="text-komuna-dark/60 text-sm">Kesempatan volunteer akan muncul di sini</p>
          </div>
        );
      }
      return (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sectionList.map((opp) => (
            <VolunteerCard key={opp.id} opportunity={opp} />
          ))}
        </div>
      );
    }

    return (
      <>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <p className="text-sm text-komuna-dark/60">
            {total} kesempatan volunteer {debouncedSearch ? `untuk "${debouncedSearch}"` : "ditemukan"}
          </p>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="px-3 py-2 rounded-lg border border-komuna-forest/15 bg-white text-sm text-komuna-dark focus:outline-none focus:ring-2 focus:ring-komuna-forest/15"
            aria-label="Urutkan volunteer"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
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
              <VolunteerCardSkeleton key={i} />
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
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {opportunities.map((opp) => (
                <VolunteerCard key={opp.id} opportunity={opp} />
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
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-komuna-coral">Kontribusi</p>
          <h1 className="mt-3 font-display text-4xl font-semibold tracking-[-0.03em] text-komuna-dark sm:text-5xl">Rasakan Menjadi Volunteer</h1>
          <p className="mt-3 text-base leading-7 text-komuna-dark/65">Temukan kesempatan volunteer dan berkontribusi untuk komunitas</p>

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

          {activeSection === "browse" && (
            <div className="mt-6 flex flex-wrap gap-2 mb-4">
              {STATUS_TABS.map((tab) => (
                <button key={tab.value} onClick={() => setStatus(tab.value)} className={`px-4 py-2 text-sm font-bold rounded-full transition ${status === tab.value ? "bg-komuna-forest text-white" : "border border-komuna-forest/15 bg-white text-komuna-forest hover:border-komuna-forest"}`}>
                  {tab.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {activeSection === "browse" && (
          <div className="mt-5 flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-komuna-forest/45" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input type="text" placeholder="Cari volunteer..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-11 pr-4 py-3 rounded-xl border border-komuna-forest/15 bg-white text-sm text-komuna-dark placeholder:text-komuna-dark/45 focus:outline-none focus:ring-2 focus:ring-komuna-forest/15 focus:border-komuna-forest" />
            </div>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-komuna-forest/15 bg-white text-sm text-komuna-dark focus:outline-none focus:ring-2 focus:ring-komuna-forest/15"
              aria-label="Filter kategori volunteer"
            >
              <option value="">Semua Kategori</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
        )}

        {renderSectionContent()}
      </main>
      <Footer />
    </div>
  );
}