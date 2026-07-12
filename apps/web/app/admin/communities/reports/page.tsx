"use client";

import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";

interface ReportItem {
  id: string; targetType: string; targetId: string; reason: string; description: string | null;
  status: string; reviewNote: string | null;
  reporter: { id: string; name: string; email: string; avatar: string | null };
  target: { id: string; name: string } | null;
  reviewer: { id: string; name: string } | null; reviewedAt: string | null; createdAt: string;
}
interface Pagination { page: number; limit: number; total: number; totalPages: number; }

const statusColors: Record<string, string> = {
  OPEN: "bg-red-100 text-red-700", UNDER_REVIEW: "bg-yellow-100 text-yellow-700",
  DISMISSED: "bg-gray-100 text-gray-600", SUSPENDED: "bg-green-100 text-green-700",
};
const statusLabels: Record<string, string> = {
  OPEN: "Open", UNDER_REVIEW: "Dalam Review", DISMISSED: "Ditolak", SUSPENDED: "Ditindaklanjuti",
};
const reasonLabels: Record<string, string> = {
  SPAM: "Spam", HARASSMENT: "Pelecehan", INAPPROPRIATE_CONTENT: "Konten Tidak Pantas",
  MISINFORMATION: "Informasi Salah", COPYRIGHT_VIOLATION: "Pelanggaran Hak Cipta", OTHER: "Lainnya",
};

function formatTime(d: string) { return new Date(d).toLocaleString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }); }

function NoteModal({ title, placeholder, onConfirm, onCancel, loading }: {
  title: string; placeholder: string; onConfirm: (note: string) => void; onCancel: () => void; loading: boolean;
}) {
  const [note, setNote] = useState("");
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
        <h3 className="text-lg font-semibold text-komuna-navy mb-4">{title}</h3>
        <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder={placeholder} rows={4}
          className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-komuna-blue/30" />
        <div className="flex justify-end gap-3 mt-4">
          <button onClick={onCancel} disabled={loading} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50">Batal</button>
          <button onClick={() => onConfirm(note)} disabled={loading || !note.trim()} className="px-4 py-2 text-sm font-medium text-white bg-komuna-blue rounded-lg hover:bg-komuna-navy disabled:opacity-50">
            {loading ? "Mengirim..." : "Konfirmasi"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CommunityReportsPage() {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [statusFilter, setStatusFilter] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [modal, setModal] = useState<{ reportId: string; action: "SUSPENDED" | "DISMISSED" | "UNDER_REVIEW" } | null>(null);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = { page, limit: 20, targetType: "COMMUNITY" };
      if (statusFilter) params.status = statusFilter;
      const { data } = await api.get("/admin/reports", { params });
      setReports(data.data || []);
      setPagination(data.pagination || { page: 1, limit: 20, total: 0, totalPages: 1 });
    } catch { /* empty */ }
    finally { setLoading(false); }
  }, [page, statusFilter]);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  const handleResolve = async (reportId: string, action: string, note: string) => {
    setActionLoading(reportId);
    try {
      await api.put(`/admin/reports/${reportId}/resolve`, { action, note });
      setModal(null); fetchReports();
    } catch { /* empty */ }
    finally { setActionLoading(null); }
  };

  const handleUnderReview = async (reportId: string) => {
    setActionLoading(reportId);
    try { await api.put(`/admin/reports/${reportId}/under-review`); fetchReports(); }
    catch { /* empty */ }
    finally { setActionLoading(null); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-komuna-navy">Community Reports</h1>
        <p className="text-sm text-gray-500 mt-1">Kelola laporan pelanggaran terkait komunitas</p>
      </div>

      <div className="flex gap-1 bg-white rounded-lg p-1 shadow-sm">
        {[{ v: "", l: "Semua" }, { v: "OPEN", l: "Open" }, { v: "UNDER_REVIEW", l: "Review" }, { v: "DISMISSED", l: "Ditolak" }, { v: "SUSPENDED", l: "Ditindak" }].map((t) => (
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
      ) : reports.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-sm">
          <svg className="mx-auto h-12 w-12 text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <p className="text-gray-500">Tidak ada laporan komunitas</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-6 py-3 font-medium text-gray-500">Reporter</th>
                    <th className="text-left px-6 py-3 font-medium text-gray-500">Community</th>
                    <th className="text-left px-6 py-3 font-medium text-gray-500">Reason</th>
                    <th className="text-left px-6 py-3 font-medium text-gray-500">Status</th>
                    <th className="text-left px-6 py-3 font-medium text-gray-500">Date</th>
                    <th className="text-left px-6 py-3 font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {reports.map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-full bg-komuna-blue/10 flex items-center justify-center shrink-0">
                            <span className="text-komuna-blue text-xs font-medium">{r.reporter.name[0]}</span>
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 truncate">{r.reporter.name}</p>
                            <p className="text-xs text-gray-400 truncate">{r.reporter.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-komuna-navy font-medium">{r.target?.name || r.targetId}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">{reasonLabels[r.reason] || r.reason}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[r.status]}`}>{statusLabels[r.status]}</span>
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-xs">{formatTime(r.createdAt)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {r.status === "OPEN" && (
                            <button onClick={() => handleUnderReview(r.id)} disabled={actionLoading === r.id}
                              className="px-3 py-1.5 text-xs font-medium text-white bg-yellow-500 rounded-lg hover:bg-yellow-600 disabled:opacity-50">Review</button>
                          )}
                          {(r.status === "OPEN" || r.status === "UNDER_REVIEW") && (
                            <>
                              <button onClick={() => setModal({ reportId: r.id, action: "SUSPENDED" })} disabled={actionLoading === r.id}
                                className="px-3 py-1.5 text-xs font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50">Tindak</button>
                              <button onClick={() => setModal({ reportId: r.id, action: "DISMISSED" })} disabled={actionLoading === r.id}
                                className="px-3 py-1.5 text-xs font-medium text-white bg-gray-500 rounded-lg hover:bg-gray-600 disabled:opacity-50">Tolak</button>
                            </>
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

      {modal && (
        <NoteModal
          title={modal.action === "SUSPENDED" ? "Tindak Laporan" : "Tolak Laporan"}
          placeholder={modal.action === "SUSPENDED" ? "Catatan tindak lanjut..." : "Alasan penolakan..."}
          onConfirm={(note) => handleResolve(modal.reportId, modal.action, note)}
          onCancel={() => setModal(null)} loading={actionLoading === modal.reportId} />
      )}
    </div>
  );
}
