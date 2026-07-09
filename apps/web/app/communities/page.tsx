"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import api from "@/lib/api";

interface Community {
  id: string;
  name: string;
  slug: string;
  description: string;
  coverImage: string;
  logo: string;
  location: string;
  membershipType: string;
  memberCount: number;
  eventCount: number;
}

export default function CommunitiesPage() {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchCommunities();
  }, [page, search]);

  const fetchCommunities = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/communities", {
        params: { page, limit: 12, search, status: "APPROVED" },
      });
      setCommunities(data.communities);
      setTotalPages(data.pagination.totalPages);
    } catch {
      console.error("Failed to fetch communities");
    } finally {
      setLoading(false);
    }
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
            <Link href="/communities" className="text-komuna-blue">Komunitas</Link>
            <Link href="/events" className="hover:text-komuna-blue">Event</Link>
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
          <h1 className="text-3xl font-bold text-komuna-navy mb-4">Direktori Komunitas</h1>
          <input
            type="text"
            placeholder="Cari komunitas..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full md:w-96 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-komuna-blue focus:border-komuna-blue"
          />
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500">Memuat...</div>
        ) : communities.length === 0 ? (
          <div className="text-center py-12 text-gray-500">Belum ada komunitas</div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {communities.map((c) => (
              <Link key={c.id} href={`/communities/${c.slug}`} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-12 w-12 rounded-lg bg-komuna-blue/10 flex items-center justify-center">
                    <span className="text-komuna-blue font-bold">{c.name[0]}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-komuna-navy">{c.name}</h3>
                    <p className="text-xs text-gray-500">{c.location}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2 mb-4">{c.description}</p>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>{c.memberCount} anggota</span>
                  <span>{c.eventCount} event</span>
                  <span className={`px-2 py-0.5 rounded-full ${c.membershipType === "OPEN" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                    {c.membershipType === "OPEN" ? "Terbuka" : "Terbatas"}
                  </span>
                </div>
              </Link>
            ))}
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
      </main>
    </div>
  );
}
