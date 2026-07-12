"use client";

import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";

interface ReportItem {
  id: string;
  targetType: string;
  targetId: string;
  reason: string;
  description: string | null;
  status: string;
  reviewNote: string | null;
  reporter: { id: string; name: string; email: string; avatar: string | null };
  reviewer: { id: string; name: string } | null;
  reviewedAt: string | null;
  createdAt: string;
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

function formatTime(d: string) { return new Date(d).toLocaleString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }); }

export default function MemberReportsPage() {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [statusFilter, setStatusFilter] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = { page, limit: 20, targetType: "USER" };
      if (statusFilter) params.status = statusFilter;
      const { data } = await api.get("/admin/reports", { params });
      setReports(data.data || []);
      setPagination(data.pagination || { page: 1, limit: 20, total: 0, totalPages: 1 });
    } catch { console.error("Gagal memuat laporan user"); }
    finally { setLoading(false); }
  }, [page, statusFilter]);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  const handleAction = async (reportId: string, action: "SUSPENDED" | "DISMISSED") => {
    setActionLoading(reportId);
    try {
      await api.put(`/admin/reports/${reportId}/resolve`, { action, note: "" });
      fetchReports();
    } catch { console.error("Gagal memproses laporan"); }
    finally { setActionLoading(null); }
  };

  const handleUnderReview = async (reportId: string) => {
    setActionLoading(reportId);
    try {
      await api.put(`/admin/reports/${reportId}/under-review`);
      fetchReports();
    } catch { console.error("Gagal"); }
    finally { setActionLoading(null); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-komuna-navy">Member Reports</h1>
        <p className="text-sm text-gray-500 mt-1">Laporan pelanggaran yang menargetkan user</p>
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
      </div>

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl p-4 shadow-sm animate-pulse"><div className="h-4 bg-gray-200 rounded w-1/3 mb-2" /><div className="h-3 bg-gray-200 rounded w-1/4" /></div>
        ))}</div>
      ) : reports.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-sm">
          <p className="text-gray-500">Tidak ada laporan untuk user</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Reporter</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Target</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Reason</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500 hidden md:table-cell">Tanggal</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-500">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {reports.map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {r.reporter.avatar ? (
                            <img src={r.reporter.avatar} alt={r.reporter.name} className="h-8 w-8 rounded-full object-cover" />
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-komuna-blue flex items-center justify-center text-white text-xs font-medium">
                              {r.reporter.name.charAt(0)}
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-gray-900">{r.reporter.name}</p>
                            <p className="text-xs text-gray-400">{r.reporter.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{targetLabels[r.targetType] || r.targetType}</td>
                      <td className="px-4 py-3">
                        <span className="text-gray-600">{reasonLabels[r.reason] || r.reason}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[r.status] || ""}`}>
                          {statusLabels[r.status] || r.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-gray-500 text-xs">{formatTime(r.createdAt)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          {r.status === "OPEN" && (
                            <button onClick={() => handleUnderReview(r.id)} disabled={actionLoading === r.id}
                              className="px-3 py-1.5 text-xs font-medium text-yellow-700 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors disabled:opacity-50">
                              Review
                            </button>
                          )}
                          {(r.status === "OPEN" || r.status === "UNDER_REVIEW") && (
                            <>
                              <button onClick={() => handleAction(r.id, "SUSPENDED")} disabled={actionLoading === r.id}
                                className="px-3 py-1.5 text-xs font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50">
                                Tindak
                              </button>
                              <button onClick={() => handleAction(r.id, "DISMISSED")} disabled={actionLoading === r.id}
                                className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50">
                                Tolak
                              </button>
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
            <div className="flex justify-center items-center gap-1 mt-4">
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
