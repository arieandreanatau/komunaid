"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Pagination } from "@/components/pagination";
import { VolunteerCTA } from "@/components/volunteer-cta";

interface Organization {
  id: string;
  name: string;
  slug: string;
  description: string;
  logo: string | null;
  banner: string | null;
  location: string | null;
  industry: string | null;
  memberCount: number;
  eventCount: number;
  categories: { id: string; name: string }[];
}

export default function OrganizationsPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timeout);
  }, [search]);

  const fetchOrganizations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params: Record<string, string | number> = { page, limit: 12 };
      if (debouncedSearch) params.search = debouncedSearch;

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

      const { data } = await api.get("/organizations", { params });
      const result = data.data || data;
      setOrganizations(result.organizations || result.data || []);
      setTotalPages(result.pagination?.totalPages || 1);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Gagal memuat data organisasi.");
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, sort]);

  useEffect(() => { fetchOrganizations(); }, [fetchOrganizations]);
  useEffect(() => { setPage(1); }, [debouncedSearch, sort]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-12 flex-1">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-komuna-navy">Direktori Organisasi</h1>
              <p className="text-gray-500 text-sm mt-1">Temukan organisasi yang sesuai dengan minat Anda.</p>
            </div>
            <Link href="/organizations/create" className="inline-flex items-center gap-2 px-5 py-2.5 bg-komuna-blue text-white rounded-lg font-medium hover:bg-komuna-navy transition-colors text-sm">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Buat Organisasi
            </Link>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input type="text" placeholder="Cari organisasi..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue text-sm" />
            </div>
            <select value={sort} onChange={(e) => setSort(e.target.value)} className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-komuna-blue">
              <option value="newest">Terbaru</option>
              <option value="oldest">Terlama</option>
              <option value="name">Nama A-Z</option>
              <option value="members">Anggota Terbanyak</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center mb-6">
            <h2 className="text-xl font-bold text-komuna-navy mb-2">Gagal Memuat</h2>
            <p className="text-gray-500 text-sm mb-6">{error}</p>
            <button onClick={fetchOrganizations} className="px-5 py-2.5 bg-komuna-blue text-white rounded-lg font-medium hover:bg-komuna-navy transition-colors text-sm">Coba Lagi</button>
          </div>
        )}

        {!error && loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden animate-pulse">
                <div className="h-32 bg-gray-200" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-full" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : !error && organizations.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
            </div>
            <h2 className="text-xl font-bold text-komuna-navy mb-2">Belum Ada Organisasi</h2>
            <p className="text-gray-500 text-sm mb-6">Jadilah yang pertama membuat organisasi di KomunaID.</p>
            <Link href="/organizations/create" className="inline-flex items-center gap-2 px-5 py-2.5 bg-komuna-blue text-white rounded-lg font-medium hover:bg-komuna-navy transition-colors text-sm">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Buat Organisasi Baru
            </Link>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {organizations.map((org) => (
                <Link key={org.id} href={`/organizations/${org.slug}`} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
                  {org.banner ? (
                    <div className="h-32 overflow-hidden">
                      <img src={org.banner} alt={`${org.name} banner`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>
                  ) : (
                    <div className="h-32 bg-gradient-to-br from-komuna-teal via-komuna-blue to-komuna-navy flex items-center justify-center"><span className="text-white/20 text-6xl font-bold">{org.name[0]}</span></div>
                  )}
                  <div className="p-5">
                    <div className="flex items-center gap-3 mb-3">
                      {org.logo ? (
                        <img src={org.logo} alt={org.name} className="h-10 w-10 rounded-lg object-cover border border-gray-200" />
                      ) : (
                        <div className="h-10 w-10 rounded-lg bg-komuna-teal/10 flex items-center justify-center"><span className="text-komuna-teal font-bold text-sm">{org.name[0]}</span></div>
                      )}
                      <div className="min-w-0">
                        <h3 className="font-semibold text-komuna-navy truncate group-hover:text-komuna-blue transition-colors">{org.name}</h3>
                        {org.location && <p className="text-xs text-gray-500 truncate">{org.location}</p>}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">{org.description}</p>
                    {org.categories && org.categories.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {org.categories.slice(0, 3).map((cat) => (
                          <span key={cat.id} className="px-2 py-0.5 bg-komuna-blue/10 text-komuna-blue rounded text-xs font-medium">{cat.name}</span>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center gap-4 text-xs text-gray-500 pt-3 border-t border-gray-100">
                      <span>{org.memberCount} anggota</span>
                      <span>{org.eventCount} event</span>
                      {org.industry && <span className="px-2 py-0.5 bg-komuna-teal/10 text-komuna-teal rounded-full">{org.industry}</span>}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        )}
        <VolunteerCTA />
      </main>
      <Footer />
    </div>
  );
}
