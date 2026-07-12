"use client";

import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";

interface EventItem {
  id: string; title: string; slug: string; description: string | null; coverImage: string | null;
  eventDate: string; endDate: string | null; quota: number; status: string; visibility: string;
  isOnline: boolean; community: { id: string; name: string } | null;
  organization: { id: string; name: string } | null;
  createdBy: { id: string; name: string; avatar: string | null };
  categories: { id: string; name: string }[]; registrationCount: number; createdAt: string;
}
interface Pagination { page: number; limit: number; total: number; totalPages: number; }

const statusColors: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-600", PUBLISHED: "bg-green-100 text-green-700",
  REGISTRATION_OPEN: "bg-blue-100 text-blue-700", REGISTRATION_CLOSED: "bg-yellow-100 text-yellow-700",
  ONGOING: "bg-purple-100 text-purple-700", COMPLETED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700", ARCHIVED: "bg-gray-100 text-gray-600",
};

function formatDate(d: string) { return new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }); }

export default function EventsListPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<{ eventId: string; action: string; title: string } | null>(null);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = { page, limit: 20, search };
      if (statusFilter) params.status = statusFilter;
      const { data } = await api.get("/admin/events", { params });
      setEvents(data.data || []);
      setPagination(data.pagination || { page: 1, limit: 20, total: 0, totalPages: 1 });
    } catch { /* empty */ }
    finally { setLoading(false); }
  }, [page, search, statusFilter]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const handleAction = async () => {
    if (!confirmModal) return;
    setActionLoading(confirmModal.eventId);
    try {
      await api.put(`/admin/events/${confirmModal.eventId}/${confirmModal.action}`);
      setConfirmModal(null); fetchEvents();
    } catch { /* empty */ }
    finally { setActionLoading(null); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-komuna-navy">Event Moderation</h1>
          <p className="text-sm text-gray-500 mt-1">Moderasi seluruh event di platform</p></div>
        <div className="relative w-full md:w-80">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input type="text" placeholder="Cari event..." value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-komuna-blue/30" />
        </div>
      </div>

      <div className="flex gap-1 bg-white rounded-lg p-1 shadow-sm overflow-x-auto">
        {[{ v: "", l: "Semua" }, { v: "PUBLISHED", l: "Published" }, { v: "CANCELLED", l: "Cancelled" }, { v: "ARCHIVED", l: "Archived" }].map((t) => (
          <button key={t.v} onClick={() => { setStatusFilter(t.v); setPage(1); }}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${statusFilter === t.v ? "bg-komuna-blue text-white" : "text-gray-600 hover:bg-gray-100"}`}>
            {t.l}
          </button>
        ))}
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
                  <th className="text-left px-4 py-3 font-medium text-gray-500 hidden md:table-cell">Lokasi</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-500 hidden sm:table-cell">Kuota</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 hidden md:table-cell">Tanggal</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-500">Aksi</th>
                </tr></thead>
                <tbody className="divide-y">
                  {events.map((e) => (
                    <tr key={e.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-gray-900">{e.title}</p>
                          <p className="text-xs text-gray-400">{e.community?.name || e.organization?.name || "Independent"} &middot; oleh {e.createdBy.name}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-gray-600 text-xs">
                        {e.isOnline ? "Online" : (e.community?.name || "Offline")}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[e.status] || "bg-gray-100 text-gray-600"}`}>{e.status}</span>
                      </td>
                      <td className="px-4 py-3 text-center hidden sm:table-cell text-gray-600 text-xs">{e.registrationCount}/{e.quota}</td>
                      <td className="px-4 py-3 hidden md:table-cell text-gray-500 text-xs">{formatDate(e.eventDate)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          {(e.status === "PUBLISHED" || e.status === "REGISTRATION_OPEN") && (
                            <button onClick={() => setConfirmModal({ eventId: e.id, action: "suspend", title: e.title })}
                              className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100">Batalkan</button>
                          )}
                          {(e.status === "CANCELLED") && (
                            <button onClick={() => setConfirmModal({ eventId: e.id, action: "restore", title: e.title })}
                              className="px-3 py-1.5 text-xs font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100">Pulihkan</button>
                          )}
                          {(e.status !== "ARCHIVED") && (
                            <button onClick={() => setConfirmModal({ eventId: e.id, action: "archive", title: e.title })}
                              className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">Arsipkan</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
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

      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
            <h3 className="text-lg font-semibold text-komuna-navy mb-2">
              {confirmModal.action === "suspend" ? "Batalkan Event" : confirmModal.action === "restore" ? "Pulihkan Event" : "Arsipkan Event"}
            </h3>
            <p className="text-sm text-gray-600 mb-6">Apakah Anda yakin ingin {confirmModal.action === "suspend" ? "membatalkan" : confirmModal.action === "restore" ? "memulihkan" : "mengarsipkan"} event "{confirmModal.title}"?</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setConfirmModal(null)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Batal</button>
              <button onClick={handleAction} disabled={!!actionLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-komuna-blue rounded-lg hover:bg-komuna-navy disabled:opacity-50">
                {actionLoading ? "Memproses..." : "Konfirmasi"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
