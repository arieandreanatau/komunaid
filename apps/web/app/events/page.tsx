"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import api from "@/lib/api";

interface Event {
  id: string;
  title: string;
  slug: string;
  description: string;
  coverImage: string;
  location: string;
  isOnline: boolean;
  eventDate: string;
  quota: number;
  registeredCount: number;
  community: { name: string; slug: string } | null;
  organization: { name: string; slug: string } | null;
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchEvents();
  }, [page, search]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/events", {
        params: { page, limit: 12, search, upcoming: "true" },
      });
      setEvents(data.events);
      setTotalPages(data.pagination.totalPages);
    } catch {
      console.error("Failed to fetch events");
    } finally {
      setLoading(false);
    }
  };

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
          <h1 className="text-3xl font-bold text-komuna-navy mb-4">Event Mendatang</h1>
          <input
            type="text"
            placeholder="Cari event..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full md:w-96 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-komuna-blue focus:border-komuna-blue"
          />
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500">Memuat...</div>
        ) : events.length === 0 ? (
          <div className="text-center py-12 text-gray-500">Belum ada event mendatang</div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {events.map((e) => (
              <Link key={e.id} href={`/events/${e.slug}`} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                <div className="h-40 bg-gradient-to-br from-komuna-blue to-komuna-teal flex items-center justify-center">
                  <span className="text-white text-4xl font-bold">{e.title[0]}</span>
                </div>
                <div className="p-6">
                  <h3 className="font-semibold text-komuna-navy mb-2 line-clamp-1">{e.title}</h3>
                  <p className="text-sm text-gray-500 mb-3">{formatDate(e.eventDate)}</p>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-4">{e.description}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{e.isOnline ? "Online" : e.location}</span>
                    <span>{e.registeredCount}/{e.quota} peserta</span>
                  </div>
                  {e.community && (
                    <div className="mt-3 text-xs text-komuna-blue">
                      oleh {e.community.name}
                    </div>
                  )}
                  {e.organization && (
                    <div className="mt-3 text-xs text-komuna-blue">
                      oleh {e.organization.name}
                    </div>
                  )}
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
