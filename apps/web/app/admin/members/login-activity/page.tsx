"use client";

import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";

interface AuditLog {
  id: string;
  user: { id: string; name: string; email: string };
  actionType: string;
  resourceName: string;
  resourceId: string;
  ipAddress: string | null;
  createdAt: string;
}

interface Pagination { page: number; limit: number; total: number; totalPages: number; }

const actionLabels: Record<string, string> = {
  USER_LOGIN: "Login", USER_LOGOUT: "Logout",
};

const actionColors: Record<string, string> = {
  USER_LOGIN: "bg-green-100 text-green-700", USER_LOGOUT: "bg-gray-100 text-gray-600",
};

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString("id-ID", {
    day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

export default function LoginActivityPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [actionFilter, setActionFilter] = useState("");

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = { page, limit: 20, actionType: actionFilter || "USER_LOGIN,USER_LOGOUT" };
      const { data } = await api.get("/admin/audit-logs", { params });
      setLogs(data.data || []);
      setPagination(data.pagination || { page: 1, limit: 20, total: 0, totalPages: 1 });
    } catch { console.error("Gagal memuat login activity"); }
    finally { setLoading(false); }
  }, [page, actionFilter]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-komuna-navy">Login Activity</h1>
          <p className="text-sm text-gray-500 mt-1">Riwayat login/logout pengguna</p>
        </div>
        <div className="text-sm text-gray-400">{pagination.total.toLocaleString()} total entri</div>
      </div>

      <div className="flex gap-1 bg-white rounded-lg p-1 shadow-sm w-fit">
        {[{ v: "", l: "Semua" }, { v: "USER_LOGIN", l: "Login" }, { v: "USER_LOGOUT", l: "Logout" }].map((t) => (
          <button key={t.v} onClick={() => { setActionFilter(t.v); setPage(1); }}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${actionFilter === t.v ? "bg-komuna-blue text-white" : "text-gray-600 hover:bg-gray-100"}`}>
            {t.l}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="divide-y">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="p-4 animate-pulse flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-gray-200" />
                <div className="flex-1"><div className="h-4 bg-gray-200 rounded w-1/4 mb-1" /><div className="h-3 bg-gray-200 rounded w-1/6" /></div>
                <div className="h-6 w-16 bg-gray-200 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      ) : logs.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-sm">
          <p className="text-gray-500">Tidak ada data login activity</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left px-4 py-3 font-medium text-gray-500">User</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Action</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">IP Address</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-komuna-blue/10 flex items-center justify-center shrink-0">
                            <span className="text-komuna-blue font-semibold text-sm">
                              {log.user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{log.user.name}</p>
                            <p className="text-xs text-gray-400">{log.user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${actionColors[log.actionType] || ""}`}>
                          {actionLabels[log.actionType] || log.actionType}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 font-mono text-xs">
                        {log.ipAddress || "-"}
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{formatTime(log.createdAt)}</td>
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
