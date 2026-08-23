"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Pagination } from "@/components/pagination";
import { CommunityCard, CommunityCardSkeleton } from "@/components/community-card";
import type { CommunityCardData } from "@/components/community-card";

interface Category {
  id: string;
  name: string;
}

const MEMBERSHIP_TABS = [
  { value: "", label: "Semua" },
  { value: "OPEN", label: "Terbuka" },
  { value: "RESTRICTED", label: "Terbatas" },
];

const SORT_OPTIONS = [
  { value: "newest", label: "Terbaru" },
  { value: "oldest", label: "Terlama" },
  { value: "name", label: "Nama A-Z" },
  { value: "members", label: "Member Terbanyak" },
];

const SECTION_TABS = [
  { key: "browse", label: "Jelajahi" },
  { key: "featured", label: "Unggulan" },
  { key: "new", label: "Terbaru" },
  { key: "popular", label: "Populer" },
] as const;

type SectionTab = (typeof SECTION_TABS)[number]["key"];

export default function CommunitiesPage() {
  const [activeSection, setActiveSection] = useState<SectionTab>("browse");
  const [communities, setCommunities] = useState<CommunityCardData[]>([]);
  const [featuredCommunities, setFeaturedCommunities] = useState<CommunityCardData[]>([]);
  const [newCommunities, setNewCommunities] = useState<CommunityCardData[]>([]);
  const [popularCommunities, setPopularCommunities] = useState<CommunityCardData[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [provinces, setProvinces] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [sectionLoading, setSectionLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [membershipType, setMembershipType] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [province, setProvince] = useState("");
  const [city, setCity] = useState("");
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
    fetchCategories();
    fetchProvinces();
  }, []);

  useEffect(() => {
    if (province) {
      fetchCitiesByProvince(province);
    } else {
      setCities([]);
      setCity("");
    }
  }, [province]);

  const fetchCategories = async () => {
    try {
      const { data } = await api.get("/categories", { params: { type: "COMMUNITY" } });
      setCategories(data.data || []);
    } catch {}
  };

  const fetchProvinces = async () => {
    try {
      const { data } = await api.get("/communities/meta/provinces");
      setProvinces(data.data || []);
    } catch {}
  };

  const fetchCitiesByProvince = async (prov: string) => {
    try {
      const { data } = await api.get(`/master-data/cities`, { params: { province: prov } });
      setCities(data.data || []);
    } catch {
      setCities([]);
    }
  };

  const fetchFeatured = useCallback(async () => {
    setSectionLoading(true);
    try {
      const { data } = await api.get("/communities/featured/list");
      setFeaturedCommunities(data.data || []);
    } catch {}
    finally { setSectionLoading(false); }
  }, []);

  const fetchNew = useCallback(async () => {
    setSectionLoading(true);
    try {
      const { data } = await api.get("/communities/new/list");
      setNewCommunities(data.data || []);
    } catch {}
    finally { setSectionLoading(false); }
  }, []);

  const fetchPopular = useCallback(async () => {
    setSectionLoading(true);
    try {
      const { data } = await api.get("/communities/popular/list");
      setPopularCommunities(data.data || []);
    } catch {}
    finally { setSectionLoading(false); }
  }, []);

  useEffect(() => {
    if (activeSection === "featured") fetchFeatured();
    else if (activeSection === "new") fetchNew();
    else if (activeSection === "popular") fetchPopular();
  }, [activeSection, fetchFeatured, fetchNew, fetchPopular]);

  const fetchCommunities = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, limit: 12 };
      if (debouncedSearch) params.search = debouncedSearch;
      if (membershipType) params.membershipType = membershipType;
      if (categoryId) params.categoryId = categoryId;
      if (province) params.province = province;
      if (city) params.city = city;

      if (sort === "name") {
        params.orderBy = "name";
        params.sort = "asc";
      } else if (sort === "members") {
        params.orderBy = "memberCount";
        params.sort = "desc";
      } else if (sort === "oldest") {
        params.orderBy = "createdAt";
        params.sort = "asc";
      } else {
        params.orderBy = "createdAt";
        params.sort = "desc";
      }

      const { data } = await api.get("/communities", { params });
      setCommunities(data.data || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotal(data.pagination?.total || 0);
    } catch (err) {
      setCommunities([]);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, membershipType, categoryId, province, city, sort]);

  useEffect(() => {
    if (activeSection === "browse") fetchCommunities();
  }, [activeSection, fetchCommunities]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, membershipType, categoryId, province, city, sort]);

  const activeFilters: Array<{ label: string; clear: () => void }> = [];
  if (search) activeFilters.push({ label: `Cari: ${search}`, clear: () => { setSearch(""); setDebouncedSearch(""); } });
  if (membershipType) activeFilters.push({ label: membershipType === "OPEN" ? "Terbuka" : "Terbatas", clear: () => setMembershipType("") });
  if (categoryId) activeFilters.push({ label: categories.find((c) => c.id === categoryId)?.name || "Kategori", clear: () => setCategoryId("") });
  if (province) activeFilters.push({ label: province, clear: () => { setProvince(""); setCity(""); } });
  if (city) activeFilters.push({ label: city, clear: () => setCity("") });

  const clearAll = () => {
    setSearch("");
    setDebouncedSearch("");
    setMembershipType("");
    setCategoryId("");
    setProvince("");
    setCity("");
  };

  const renderSectionContent = () => {
    if (activeSection !== "browse") {
      const list =
        activeSection === "featured"
          ? featuredCommunities
          : activeSection === "new"
            ? newCommunities
            : popularCommunities;

      if (sectionLoading) {
        return (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <CommunityCardSkeleton key={i} />
            ))}
          </div>
        );
      }

      if (list.length === 0) {
        return (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-komuna-forest/20">
            <svg
              className="h-16 w-16 text-komuna-coral/30 mx-auto mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <h3 className="text-lg font-semibold text-komuna-dark mb-1">Belum ada komunitas</h3>
            <p className="text-komuna-dark/60 text-sm">Komunitas akan muncul di sini</p>
          </div>
        );
      }

      return (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {list.map((c) => (
            <CommunityCard key={c.id} community={c} />
          ))}
        </div>
      );
    }

    const resultsArea = (
      <>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <p className="text-sm text-komuna-dark/60">
            {total} komunitas {debouncedSearch ? `untuk "${debouncedSearch}"` : "ditemukan"}
          </p>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="px-3 py-2 rounded-lg border border-komuna-forest/15 bg-white text-sm text-komuna-dark focus:outline-none focus:ring-2 focus:ring-komuna-forest/15"
            aria-label="Urutkan komunitas"
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
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <CommunityCardSkeleton key={i} />
            ))}
          </div>
        ) : communities.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-komuna-forest/20">
            <svg
              className="h-16 w-16 text-komuna-coral/30 mx-auto mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <h3 className="text-lg font-semibold text-komuna-dark mb-1">Tidak ada komunitas ditemukan</h3>
            <p className="text-komuna-dark/60 text-sm">Coba kata kunci atau filter yang berbeda</p>
          </div>
        ) : (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {communities.map((c) => (
                <CommunityCard key={c.id} community={c} />
              ))}
            </div>
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        )}
      </>
    );

    return (
      <div className="grid lg:grid-cols-[260px_1fr] gap-8 items-start">
        <aside className="lg:sticky lg:top-28 bg-white rounded-2xl border border-komuna-forest/10 p-5 space-y-5">
          <div>
            <h2 className="text-sm font-bold text-komuna-dark mb-3">Filter</h2>
            <div className="flex flex-wrap gap-2">
              {MEMBERSHIP_TABS.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setMembershipType(tab.value)}
                  className={`px-3.5 py-1.5 text-sm font-bold rounded-full transition ${
                    membershipType === tab.value
                      ? "bg-komuna-forest text-white"
                      : "border border-komuna-forest/15 bg-white text-komuna-forest hover:border-komuna-forest"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-komuna-dark/50 mb-2">Kategori</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-komuna-forest/15 bg-white text-sm text-komuna-dark focus:outline-none focus:ring-2 focus:ring-komuna-forest/15"
            >
              <option value="">Semua Kategori</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-komuna-dark/50 mb-2">Provinsi</label>
            <select
              value={province}
              onChange={(e) => { setProvince(e.target.value); setCity(""); }}
              className="w-full px-3 py-2 rounded-lg border border-komuna-forest/15 bg-white text-sm text-komuna-dark focus:outline-none focus:ring-2 focus:ring-komuna-forest/15"
            >
              <option value="">Semua Provinsi</option>
              {provinces.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-komuna-dark/50 mb-2">Kota</label>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              disabled={!province}
              className="w-full px-3 py-2 rounded-lg border border-komuna-forest/15 bg-white text-sm text-komuna-dark focus:outline-none focus:ring-2 focus:ring-komuna-forest/15 disabled:bg-komuna-soft"
            >
              <option value="">Semua Kota</option>
              {cities.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </aside>

        <div>{resultsArea}</div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-komuna-cream text-komuna-dark">
      <Header />
      <main className="container mx-auto px-4 py-12 flex-1">
        <div className="mb-8">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-komuna-coral">Discovery</p>
          <h1 className="mt-3 font-display text-4xl font-semibold tracking-[-0.03em] text-komuna-dark sm:text-5xl">
            Temukan Komunitas Sesuai Minatmu
          </h1>
          <p className="mt-3 text-base leading-7 text-komuna-dark/65">
            Jelajahi berbagai komunitas, ikuti kegiatan menarik, dan bertumbuh bersama.
          </p>

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
        </div>

        <div className="mb-6">
          <div className="relative max-w-xl">
            <svg
              className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-komuna-forest/45"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Cari komunitas..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-komuna-forest/15 bg-white text-sm text-komuna-dark placeholder:text-komuna-dark/45 focus:outline-none focus:ring-2 focus:ring-komuna-forest/15 focus:border-komuna-forest"
            />
          </div>
        </div>

        {renderSectionContent()}

        <div className="mt-12 text-center bg-white rounded-2xl border border-komuna-forest/10 p-8 sm:p-10">
          <h2 className="font-display text-2xl font-semibold text-komuna-dark">Belum menemukan komunitas yang sesuai?</h2>
          <p className="mt-2 text-komuna-dark/65">Buat komunitasmu sendiri dan ajak orang lain bergabung.</p>
          <Link
            href="/communities/create"
            className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-komuna-forest text-white font-semibold hover:bg-komuna-dark transition-colors"
          >
            Buat Komunitas
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}