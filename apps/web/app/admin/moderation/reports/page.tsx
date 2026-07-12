"use client";

import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";

interface ReportItem {
  id: string; targetType: string; targetId: string; reason: string; description: string | null;
  status: string; reviewNote: string | null;
  reporter: { id: string; name: string; email: string; avatar: string | null };
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
const targetLabels: Record<string, string> = { COMMUNITY: "Komunitas", EVENT: "Event", USER: "User", ORGANIZATION: "Organisasi" };
const reasonLabels: Record<string, string> = {
  SPAM: "Spam", HARASSMENT: "Pelecehan", INAPPROPRIATE_CONTENT: "Konten Tidak Pantas",
  MISINFORMATION: "Informasi Salah", COPYRIGHT_VIOLATION: "Pelanggaran Hak Cipta", OTHER: "Lainnya",
};
const targetColors: Record<string, string> = { COMMUNITY: "bg-blue-100 text-blue-700", EVENT: "bg-purple-100 text-purple-700", USER: "bg-orange-100 text-orange-700", ORGANIZATION: "bg-teal-100 text-teal-700" };

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

export default function ModerationReportsPage() {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [statusFilter, setStatusFilter] = useState("");
  const [targetFilter, setTargetFilter] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [modal, setModal] = useState<{ reportId: string; action: "SUSPENDED" | "DISMISSED" | "UNDER_REVIEW" } | null>(null);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = { page, limit: 20 };
      if (statusFilter) params.status = statusFilter;
      if (targetFilter) params.targetType = targetFilter;
      const { data } = await api.get("/admin/reports", { params });
      setReports(data.data || []);
      setPagination(data.pagination || { page: 1, limit: 20, total: 0, totalPages: 1 });
    } catch { /* empty */ }
    finally { setLoading(false); }
  }, [page, statusFilter, targetFilter]);

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
        <h1 className="text-2xl font-bold text-komuna-navy">Report Abuse</h1>
        <p className="text-sm text-gray-500 mt-1">Kelola laporan pelanggaran dari pengguna</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="flex gap-1 bg-white rounded-lg p-1 shadow-sm">
          {[{ v: "", l: "Semua" }, { v: "OPEN", l: "Open" }, { v: "UNDER_REVIEW", l: "Review" }, { v: "DISMISSED", l: "Ditolak" }, { v: "SUSPENDED", l: "Ditindak" }].map((t) => (
            <button key={t.v} onClick={() => { setStatusFilter(t.v); setPage(1); }}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${statusFilter === t.v ? "bg-komuna-blue text-white" : "text-gray-600 hover:bg-gray-100"}`}>
              {t.l}
            </button>
          ))}
        </div>
        <div className="flex gap-1 bg-white rounded-lg p-1 shadow-sm">
          {[{ v: "", l: "Semua Tipe" }, { v: "COMMUNITY", l: "Komunitas" }, { v: "EVENT", l: "Event" }, { v: "USER", l: "User" }, { v: "ORGANIZATION", l: "Organisasi" }].map((t) => (
            <button key={t.v} onClick={() => { setTargetFilter(t.v); setPage(1); }}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${targetFilter === t.v ? "bg-komuna-teal text-white" : "text-gray-600 hover:bg-gray-100"}`}>
              {t.l}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl p-4 shadow-sm animate-pulse"><div className="h-4 bg-gray-200 rounded w-1/3 mb-2" /><div className="h-3 bg-gray-200 rounded w-1/4" /></div>
        ))}</div>
      ) : reports.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-sm"><p className="text-gray-500">Tidak ada laporan</p></div>
      ) : (
        <>
          <div className="space-y-3">
            {reports.map((r) => (
              <div key={r.id} className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
                <div className="flex flex-col md:flex-row md:items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${targetColors[r.targetType] || ""}`}>{targetLabels[r.targetType] || r.targetType}</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[r.status]}`}>{statusLabels[r.status]}</span>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">{reasonLabels[r.reason] || r.reason}</span>
                    </div>
                    {r.description && <p className="text-sm text-gray-600 mt-2">{r.description}</p>}
                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                      <span>Oleh {r.reporter.name}</span>
                      <span>&middot;</span>
                      <span>{formatTime(r.createdAt)}</span>
                    </div>
                    {r.reviewNote && (
                      <div className="mt-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600">
                        <span className="font-medium">Catatan review:</span> {r.reviewNote}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-row md:flex-col gap-2 shrink-0">
                    {r.status === "OPEN" && (
                      <button onClick={() => handleUnderReview(r.id)} disabled={actionLoading === r.id}
                        className="px-4 py-2 text-sm font-medium text-white bg-yellow-500 rounded-lg hover:bg-yellow-600 disabled:opacity-50">Review</button>
                    )}
                    {(r.status === "OPEN" || r.status === "UNDER_REVIEW") && (
                      <>
                        <button onClick={() => setModal({ reportId: r.id, action: "SUSPENDED" })} disabled={actionLoading === r.id}
                          className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50">Tindak</button>
                        <button onClick={() => setModal({ reportId: r.id, action: "DISMISSED" })} disabled={actionLoading === r.id}
                          className="px-4 py-2 text-sm font-medium text-white bg-gray-500 rounded-lg hover:bg-gray-600 disabled:opacity-50">Tolak</button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
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
