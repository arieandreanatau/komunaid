"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Pagination } from "@/components/pagination";

interface Community {
  id: string;
  name: string;
  slug: string;
  description: string;
  coverImage: string | null;
  logo: string | null;
  banner: string | null;
  location: string | null;
  province: string | null;
  city: string | null;
  membershipType: string;
  visibility: string;
  status: string;
  owner: { id: string; name: string; avatar: string | null };
  memberCount: number;
  eventCount: number;
  categories: { id: string; name: string }[];
  tags: { id: string; tag: string }[];
  createdAt: string;
}

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

function CommunityCard({ c }: { c: Community }) {
  return (
    <Link
      href={`/communities/${c.slug}`}
      className="group overflow-hidden rounded-2xl border border-komuna-forest/10 bg-white transition duration-200 hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="h-44 relative overflow-hidden">
        {c.coverImage || c.logo ? (
          <img
            src={c.coverImage || c.logo!}
            alt={c.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="h-full bg-gradient-to-br from-komuna-forest to-komuna-dark flex items-center justify-center">
            <span className="text-white text-5xl font-bold opacity-30">
              {c.name[0]}
            </span>
          </div>
        )}
        <span
          className={`absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-xs font-bold ${
            c.membershipType === "OPEN"
              ? "bg-white/90 text-komuna-forest"
              : "bg-komuna-navy/80 text-white"
          }`}
        >
          {c.membershipType === "OPEN" ? "Terbuka" : "Terbatas"}
        </span>
      </div>
      <div className="p-5">
        <p className="text-xs font-bold text-komuna-coral">{c.categories[0]?.name || "Komunitas"}</p>
        <h3 className="mt-2 font-semibold text-komuna-dark mb-2 line-clamp-1 group-hover:text-komuna-forest transition-colors">
          {c.name}
        </h3>
        <p className="text-sm text-komuna-dark/65 line-clamp-2 mb-3 min-h-10">
          {c.description || "Komunitas untuk bertumbuh bersama."}
        </p>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-komuna-dark/55 mb-2">
          {c.location && (
            <>
              <span className="inline-flex items-center gap-1">
                <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {c.location}
              </span>
              <span className="text-komuna-coral">&middot;</span>
            </>
          )}
          <span>{c.memberCount} anggota</span>
          <span className="text-komuna-coral">&middot;</span>
          <span>{c.eventCount} event</span>
        </div>
        <span className="mt-1 inline-block text-sm font-bold text-komuna-forest">Lihat Komunitas &rarr;</span>
      </div>
    </Link>
  );
}

function CommunitySkeleton() {
  return (
    <div className="rounded-2xl border border-komuna-forest/10 bg-white overflow-hidden animate-pulse">
      <div className="h-44 bg-komuna-soft" />
      <div className="p-5 space-y-3">
        <div className="h-3 bg-komuna-soft rounded w-1/4" />
        <div className="h-4 bg-komuna-soft rounded w-3/4" />
        <div className="h-3 bg-komuna-soft rounded w-full" />
        <div className="h-3 bg-komuna-soft rounded w-1/2" />
      </div>
    </div>
  );
}

export default function CommunitiesPage() {
  const [activeSection, setActiveSection] = useState<SectionTab>("browse");
  const [communities, setCommunities] = useState<Community[]>([]);
  const [featuredCommunities, setFeaturedCommunities] = useState<Community[]>([]);
  const [newCommunities, setNewCommunities] = useState<Community[]>([]);
  const [popularCommunities, setPopularCommunities] = useState<Community[]>([]);
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
      const { data } = await api.get("/categories", {
        params: { type: "COMMUNITY" },
      });
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
      const { data } = await api.get(`/master-data/cities`, {
        params: { province: prov },
      });
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
      const params: Record<string, string | number> = {
        page,
        limit: 12,
      };
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
              <CommunitySkeleton key={i} />
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
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <h3 className="text-lg font-semibold text-komuna-dark mb-1">
              Belum ada komunitas
            </h3>
            <p className="text-komuna-dark/60 text-sm">Komunitas akan muncul di sini</p>
          </div>
        );
      }

      return (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {list.map((c) => (
            <CommunityCard key={c.id} c={c} />
          ))}
        </div>
      );
    }

    if (loading) {
      return (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <CommunitySkeleton key={i} />
          ))}
        </div>
      );
    }

    if (communities.length === 0) {
      return (
        <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-komuna-forest/20">
          <svg
            className="h-16 w-16 text-komuna-coral/30 mx-auto mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <h3 className="text-lg font-semibold text-komuna-dark mb-1">
            Tidak ada komunitas ditemukan
          </h3>
          <p className="text-komuna-dark/60 text-sm">
            Coba kata kunci atau filter yang berbeda
          </p>
        </div>
      );
    }

    return (
      <>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {communities.map((c) => (
            <CommunityCard key={c.id} c={c} />
          ))}
        </div>
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-komuna-cream text-komuna-dark">
      <Header />
      <main className="container mx-auto px-4 py-12 flex-1">
        <div className="mb-8">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-komuna-coral">Discovery</p>
          <h1 className="mt-3 font-display text-4xl font-semibold tracking-[-0.03em] text-komuna-dark sm:text-5xl">
            Direktori Komunitas
          </h1>
          <p className="mt-3 text-base leading-7 text-komuna-dark/65">
            Temukan komunitas yang sesuai dengan minatmu
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

        {activeSection === "browse" && (
          <div className="mb-6">
            <div className="flex flex-wrap gap-2 mb-4">
              {MEMBERSHIP_TABS.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setMembershipType(tab.value)}
                  className={`px-4 py-2 text-sm font-bold rounded-full transition ${
                    membershipType === tab.value
                      ? "bg-komuna-forest text-white"
                      : "border border-komuna-forest/15 bg-white text-komuna-forest hover:border-komuna-forest"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <svg
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-komuna-forest/45"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  type="text"
                  placeholder="Cari komunitas..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-komuna-forest/15 bg-white text-sm text-komuna-dark placeholder:text-komuna-dark/45 focus:outline-none focus:ring-2 focus:ring-komuna-forest/15 focus:border-komuna-forest"
                />
              </div>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="px-4 py-2.5 rounded-xl border border-komuna-forest/15 bg-white text-sm text-komuna-dark focus:outline-none focus:ring-2 focus:ring-komuna-forest/15"
              >
                <option value="">Semua Kategori</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <select
                value={province}
                onChange={(e) => {
                  setProvince(e.target.value);
                  setCity("");
                }}
                className="px-4 py-2.5 rounded-xl border border-komuna-forest/15 bg-white text-sm text-komuna-dark focus:outline-none focus:ring-2 focus:ring-komuna-forest/15"
              >
                <option value="">Semua Provinsi</option>
                {provinces.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                disabled={!province}
                className="px-4 py-2.5 rounded-xl border border-komuna-forest/15 bg-white text-sm text-komuna-dark focus:outline-none focus:ring-2 focus:ring-komuna-forest/15 disabled:bg-komuna-soft"
              >
                <option value="">Semua Kota</option>
                {cities.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="px-4 py-2.5 rounded-xl border border-komuna-forest/15 bg-white text-sm text-komuna-dark focus:outline-none focus:ring-2 focus:ring-komuna-forest/15"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {renderSectionContent()}
      </main>
      <Footer />
    </div>
  );
}
