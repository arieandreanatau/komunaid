"use client";

import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";

interface EventItem {
  id: string; title: string; slug: string; quota: number; status: string;
  eventDate: string; registrationCount: number;
  community: { id: string; name: string } | null;
  organization: { id: string; name: string } | null;
  createdBy: { id: string; name: string };
}
interface Pagination { page: number; limit: number; total: number; totalPages: number; }

const statusColors: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-600", PUBLISHED: "bg-green-100 text-green-700",
  REGISTRATION_OPEN: "bg-blue-100 text-blue-700", REGISTRATION_CLOSED: "bg-yellow-100 text-yellow-700",
  ONGOING: "bg-purple-100 text-purple-700", COMPLETED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700", ARCHIVED: "bg-gray-100 text-gray-600",
};

function formatDate(d: string) { return new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }); }

export default function EventsParticipantsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [search, setSearch] = useState("");

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = { page, limit: 20, search };
      const { data } = await api.get("/admin/events", { params });
      setEvents(data.data || []);
      setPagination(data.pagination || { page: 1, limit: 20, total: 0, totalPages: 1 });
    } catch { /* empty */ }
    finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-komuna-navy">Event Participants</h1>
          <p className="text-sm text-gray-500 mt-1">Lihat jumlah pendaftar pada setiap event</p>
        </div>
        <div className="relative w-full md:w-80">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input type="text" placeholder="Cari event..." value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-komuna-blue/30" />
        </div>
      </div>

      <div className="bg-komuna-aqua/5 border border-komuna-aqua/20 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <svg className="h-5 w-5 text-komuna-aqua mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-komuna-navy">Halaman ini menampilkan ringkasan jumlah pendaftar per event. Detail participant belum tersedia melalui API saat ini.</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl p-4 shadow-sm animate-pulse"><div className="h-4 bg-gray-200 rounded w-1/3 mb-2" /><div className="h-3 bg-gray-200 rounded w-1/4" /></div>
        ))}</div>
      ) : events.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-sm"><p className="text-gray-500">Tidak ada event</p></div>
      ) : (
        <>
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b bg-gray-50">
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Event</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 hidden md:table-cell">Komunitas</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-500">Peserta</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-500">Kuota</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 hidden md:table-cell">Tanggal</th>
                </tr></thead>
                <tbody className="divide-y">
                  {events.map((e) => {
                    const fillPercent = e.quota > 0 ? Math.round((e.registrationCount / e.quota) * 100) : 0;
                    return (
                      <tr key={e.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium text-gray-900">{e.title}</p>
                            <p className="text-xs text-gray-400">oleh {e.createdBy.name}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell text-gray-600 text-xs">
                          {e.community?.name || e.organization?.name || "Independent"}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[e.status] || "bg-gray-100 text-gray-600"}`}>{e.status}</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-sm font-semibold text-komuna-navy">{e.registrationCount}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-xs text-gray-500">{e.registrationCount}/{e.quota}</span>
                            <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                              <div className="h-full rounded-full transition-all"
                                style={{ width: `${Math.min(fillPercent, 100)}%`, backgroundColor: fillPercent >= 90 ? "#EF4444" : fillPercent >= 60 ? "#F59E0B" : "#11A79B" }} />
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell text-gray-500 text-xs">{formatDate(e.eventDate)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {pagination.totalPages > 1 && (
            <div className="flex justify-center items-center gap-1 mt-6">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                className="px-3 py-2 rounded-lg text-sm font-medium border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40">Prev</button>
              {Array.from({ length: Math.min(pagination.totalPages, 7) }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => setPage(p)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium ${p === page ? "bg-komuna-blue text-white" : "bg-white border border-gray-200 hover:bg-gray-50"}`}>{p}</button>
              ))}
              <button onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))} disabled={page === pagination.totalPages}
                className="px-3 py-2 rounded-lg text-sm font-medium border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40">Next</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
