"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { Header } from "@/components/header";

interface Community {
  id: string;
  name: string;
  slug: string;
  description: string;
  coverImage: string | null;
  logo: string | null;
  banner: string | null;
  location: string | null;
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

export default function CommunitiesPage() {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [membershipType, setMembershipType] = useState("");
  const [visibility, setVisibility] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchCommunities();
  }, [page, search, membershipType, visibility]);

  const fetchCommunities = async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = {
        page,
        limit: 12,
        search,
        status: "APPROVED",
      };
      if (membershipType) params.membershipType = membershipType;
      if (visibility) params.visibility = visibility;
      const { data } = await api.get("/communities", { params });
      setCommunities(data.communities);
      setTotalPages(data.pagination.totalPages);
    } catch (err) {
      console.error("Failed to fetch communities");
      setCommunities([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleMembershipTypeChange = (value: string) => {
    setMembershipType(value);
    setPage(1);
  };

  const handleVisibilityChange = (value: string) => {
    setVisibility(value);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-komuna-navy mb-1">
              Direktori Komunitas
            </h1>
            <p className="text-gray-500 text-sm">
              Temukan komunitas yang sesuai dengan minatmu
            </p>
          </div>
          <Link
            href="/communities/create"
            className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium text-white bg-komuna-blue rounded-lg hover:bg-komuna-navy transition-colors shrink-0"
          >
            Buat Komunitas
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 mb-8">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
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
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-komuna-blue/30 focus:border-komuna-blue transition-colors"
              />
            </div>
            <select
              value={membershipType}
              onChange={(e) => handleMembershipTypeChange(e.target.value)}
              className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-komuna-blue/30 focus:border-komuna-blue transition-colors"
            >
              <option value="">Semua Tipe</option>
              <option value="OPEN">Terbuka</option>
              <option value="RESTRICTED">Terbatas</option>
            </select>
            <select
              value={visibility}
              onChange={(e) => handleVisibilityChange(e.target.value)}
              className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-komuna-blue/30 focus:border-komuna-blue transition-colors"
            >
              <option value="">Semua Visibilitas</option>
              <option value="PUBLIC">Publik</option>
              <option value="PRIVATE">Privat</option>
            </select>
          </div>
        </div>

        {/* Community Registration Banner */}
        <div className="bg-gradient-to-r from-komuna-navy via-komuna-blue to-komuna-teal rounded-xl p-6 mb-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white">Tidak menemukan komunitas Anda?</h2>
              <p className="text-white/80 mt-1">Daftarkan komunitas Anda di KomunaID dan jangkau lebih banyak anggota.</p>
            </div>
            <Link
              href="/communities/create"
              className="px-6 py-3 bg-white text-komuna-blue rounded-lg font-semibold hover:bg-gray-100 transition-colors whitespace-nowrap"
            >
              Daftarkan Komunitas
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-xl shadow-sm p-6 animate-pulse"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-12 w-12 rounded-lg bg-gray-200" />
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="h-3 bg-gray-200 rounded w-full" />
                  <div className="h-3 bg-gray-200 rounded w-2/3" />
                </div>
                <div className="flex gap-4">
                  <div className="h-3 bg-gray-200 rounded w-16" />
                  <div className="h-3 bg-gray-200 rounded w-16" />
                  <div className="h-5 bg-gray-200 rounded-full w-16" />
                </div>
              </div>
            ))}
          </div>
        ) : communities.length === 0 ? (
          <div className="text-center py-16">
            <svg
              className="mx-auto h-12 w-12 text-gray-300 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <p className="text-gray-500 text-lg font-medium">
              Belum ada komunitas ditemukan
            </p>
            <p className="text-gray-400 text-sm mt-1">
              Coba ubah filter pencarianmu atau buat komunitas baru
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {communities.map((c) => (
                <Link
                  key={c.id}
                  href={`/communities/${c.slug}`}
                  className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col"
                >
                  <div className="flex items-center gap-3 mb-3">
                    {c.logo ? (
                      <img
                        src={c.logo}
                        alt={c.name}
                        className="h-12 w-12 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-lg bg-komuna-blue/10 flex items-center justify-center shrink-0">
                        <span className="text-komuna-blue font-bold text-lg">
                          {c.name[0]}
                        </span>
                      </div>
                    )}
                    <div className="min-w-0">
                      <h3 className="font-semibold text-komuna-navy truncate">
                        {c.name}
                      </h3>
                      {c.location && (
                        <p className="text-xs text-gray-500 truncate flex items-center gap-1">
                          <svg
                            className="h-3 w-3 shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                          {c.location}
                        </p>
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 line-clamp-2 mb-4 flex-1">
                    {c.description || "Tidak ada deskripsi"}
                  </p>

                  <div className="flex items-center flex-wrap gap-2 text-xs">
                    <span className="text-gray-500 flex items-center gap-1">
                      <svg
                        className="h-3.5 w-3.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      {c.memberCount} anggota
                    </span>
                    <span className="text-gray-300">|</span>
                    <span className="text-gray-500 flex items-center gap-1">
                      <svg
                        className="h-3.5 w-3.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      {c.eventCount} event
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full font-medium ${
                        c.membershipType === "OPEN"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {c.membershipType === "OPEN" ? "Terbuka" : "Terbatas"}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full font-medium ${
                        c.visibility === "PUBLIC"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {c.visibility === "PUBLIC" ? "Publik" : "Privat"}
                    </span>
                  </div>
                </Link>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-1 mt-10">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-2 rounded-lg text-sm font-medium border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Prev
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => {
                    if (totalPages <= 7) return true;
                    if (p === 1 || p === totalPages) return true;
                    if (Math.abs(p - page) <= 1) return true;
                    return false;
                  })
                  .reduce<(number | "...")[]>((acc, p, i, arr) => {
                    if (i > 0) {
                      const prev = arr[i - 1];
                      if (p - prev > 1) acc.push("...");
                    }
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((item, i) =>
                    item === "..." ? (
                      <span
                        key={`ellipsis-${i}`}
                        className="px-2 py-2 text-sm text-gray-400"
                      >
                        ...
                      </span>
                    ) : (
                      <button
                        key={item}
                        onClick={() => setPage(item)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          item === page
                            ? "bg-komuna-blue text-white"
                            : "bg-white border border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        {item}
                      </button>
                    )
                  )}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-2 rounded-lg text-sm font-medium border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
