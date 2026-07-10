"use client";

import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";
import { useAuth } from "@/components/auth-provider";

interface AuditLog {
  id: string;
  user: { id: string; name: string; email: string };
  actionType: string;
  resourceName: string;
  resourceId: string;
  beforeData: any;
  afterData: any;
  ipAddress: string | null;
  createdAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const actionLabels: Record<string, string> = {
  USER_REGISTER: "Registrasi", USER_LOGIN: "Login", USER_LOGOUT: "Logout",
  USER_CHANGE_PASSWORD: "Ubah Password", USER_RESET_PASSWORD: "Reset Password",
  USER_UPDATE_PROFILE: "Update Profil", USER_SUSPEND: "Tangguhkan User",
  USER_ACTIVATE: "Aktifkan User", USER_ARCHIVE: "Arsipkan User", USER_RESTORE: "Pulihkan User",
  COMMUNITY_CREATE: "Buat Komunitas", COMMUNITY_APPROVE: "Setujui Komunitas",
  COMMUNITY_SUSPEND: "Tangguhkan Komunitas", COMMUNITY_REJECTED: "Tolak Komunitas",
  COMMUNITY_REVISION_REQUESTED: "Minta Revisi Komunitas", COMMUNITY_RESTORE: "Pulihkan Komunitas",
  COMMUNITY_UPDATE: "Update Komunitas", COMMUNITY_MEMBER_JOIN: "Gabung Komunitas",
  COMMUNITY_MEMBER_LEAVE: "Tinggalkan Komunitas", COMMUNITY_ROLE_CHANGE: "Ubah Role Komunitas",
  ORG_CREATE: "Buat Organisasi", ORG_APPROVE: "Setujui Organisasi",
  ORG_SUSPEND: "Tangguhkan Organisasi", ORG_REJECTED: "Tolak Organisasi",
  ORG_REVISION_REQUESTED: "Minta Revisi Organisasi", ORG_RESTORE: "Pulihkan Organisasi",
  ORG_UPDATE: "Update Organisasi",
  EVENT_CREATE: "Buat Event", EVENT_UPDATE: "Update Event", EVENT_PUBLISH: "Publish Event",
  EVENT_CANCEL: "Batalkan Event", EVENT_ARCHIVE: "Arsipkan Event", EVENT_RESTORE: "Pulihkan Event",
  REPORT_CREATE: "Buat Laporan", REPORT_RESOLVE: "Tindaklanjuti Laporan",
  REPORT_DISMISS: "Tolak Laporan", REPORT_UNDER_REVIEW: "Review Laporan",
  ROLE_CHANGE: "Ubah Role", SETTINGS_UPDATE: "Update Pengaturan",
  NOTIFICATION_BROADCAST: "Notifikasi Massal",
};

const resourceLabels: Record<string, string> = {
  User: "User", Community: "Komunitas", Organization: "Organisasi", Event: "Event",
  Report: "Laporan", Setting: "Pengaturan", Category: "Kategori",
  NotificationTemplate: "Template Notifikasi", Notification: "Notifikasi",
};

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString("id-ID", {
    day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

export default function AuditLogsPage() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [resourceFilter, setResourceFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [expandedLog, setExpandedLog] = useState<string | null>(null);

  const isSuperAdmin = user?.roles?.includes("SUPER_ADMIN");

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = { page, limit: 20 };
      if (search) params.search = search;
      if (actionFilter) params.actionType = actionFilter;
      if (resourceFilter) params.resourceName = resourceFilter;
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;
      const { data } = await api.get("/admin/audit-logs", { params });
      setLogs(data.data || []);
      setPagination(data.pagination || { page: 1, limit: 20, total: 0, totalPages: 1 });
    } catch {
      console.error("Gagal memuat audit log");
    } finally {
      setLoading(false);
    }
  }, [page, search, actionFilter, resourceFilter, dateFrom, dateTo]);

  useEffect(() => {
    if (isSuperAdmin) fetchLogs();
  }, [fetchLogs, isSuperAdmin]);

  if (!isSuperAdmin) {
    return <div className="text-center py-16 text-gray-500">Hanya Super Admin yang dapat mengakses halaman ini.</div>;
  }

  const actionTypes = [...new Set(logs.map((l) => l.actionType))];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-komuna-navy">Audit Log</h1>
          <p className="text-sm text-gray-500 mt-1">Riwayat aktivitas administrator platform</p>
        </div>
        <div className="text-sm text-gray-400">{pagination.total.toLocaleString()} total entri</div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text" placeholder="Cari..." value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-komuna-blue/30"
            />
          </div>
          <select
            value={actionFilter}
            onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
            className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-komuna-blue/30"
          >
            <option value="">Semua Aksi</option>
            {actionTypes.map((a) => (
              <option key={a} value={a}>{actionLabels[a] || a}</option>
            ))}
          </select>
          <select
            value={resourceFilter}
            onChange={(e) => { setResourceFilter(e.target.value); setPage(1); }}
            className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-komuna-blue/30"
          >
            <option value="">Semua Resource</option>
            <option value="User">User</option>
            <option value="Community">Komunitas</option>
            <option value="Organization">Organisasi</option>
            <option value="Event">Event</option>
            <option value="Report">Laporan</option>
            <option value="Setting">Pengaturan</option>
            <option value="Category">Kategori</option>
          </select>
          <div className="flex gap-2">
            <input
              type="date" value={dateFrom}
              onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
              className="flex-1 px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-komuna-blue/30"
              placeholder="Dari"
            />
            <input
              type="date" value={dateTo}
              onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
              className="flex-1 px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-komuna-blue/30"
              placeholder="Sampai"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-4 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-gray-200" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-1" />
                  <div className="h-3 bg-gray-200 rounded w-1/4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : logs.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-sm">
          <p className="text-gray-500">Tidak ada data audit log</p>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {logs.map((log) => (
              <div key={log.id} className="bg-white rounded-xl shadow-sm border border-gray-100">
                <div
                  className="flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                >
                  <div className="h-8 w-8 rounded-full bg-komuna-blue/10 flex items-center justify-center shrink-0">
                    <span className="text-komuna-blue font-semibold text-xs">
                      {log.user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">{log.user.name}</span>{" "}
                      <span>{actionLabels[log.actionType] || log.actionType}</span>{" "}
                      <span className="text-gray-500">{resourceLabels[log.resourceName] || log.resourceName}</span>
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{formatTime(log.createdAt)}</p>
                  </div>
                  <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                    {log.actionType}
                  </span>
                  <svg className={`h-4 w-4 text-gray-400 transition-transform ${expandedLog === log.id ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                {expandedLog === log.id && (
                  <div className="px-4 pb-4 border-t">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                      <div>
                        <h4 className="text-xs font-semibold text-gray-400 uppercase mb-1">Detail</h4>
                        <div className="text-sm space-y-1">
                          <p><span className="text-gray-500">User:</span> {log.user.name} ({log.user.email})</p>
                          <p><span className="text-gray-500">Aksi:</span> {actionLabels[log.actionType] || log.actionType}</p>
                          <p><span className="text-gray-500">Resource:</span> {log.resourceName} ({log.resourceId})</p>
                          {log.ipAddress && <p><span className="text-gray-500">IP:</span> {log.ipAddress}</p>}
                        </div>
                      </div>
                      <div>
                        {log.beforeData && (
                          <div className="mb-2">
                            <h4 className="text-xs font-semibold text-gray-400 uppercase mb-1">Sebelum</h4>
                            <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto max-h-32">
                              {JSON.stringify(log.beforeData, null, 2)}
                            </pre>
                          </div>
                        )}
                        {log.afterData && (
                          <div>
                            <h4 className="text-xs font-semibold text-gray-400 uppercase mb-1">Sesudah</h4>
                            <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto max-h-32">
                              {JSON.stringify(log.afterData, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {pagination.totalPages > 1 && (
            <div className="flex justify-center items-center gap-1 mt-6">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                className="px-3 py-2 rounded-lg text-sm font-medium border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">
                Prev
              </button>
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                .filter((p) => pagination.totalPages <= 7 || p === 1 || p === pagination.totalPages || Math.abs(p - page) <= 1)
                .reduce<(number | "...")[]>((acc, p, i, arr) => {
                  if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("...");
                  acc.push(p);
                  return acc;
                }, [])
                .map((item, i) =>
                  item === "..." ? (
                    <span key={`e-${i}`} className="px-2 py-2 text-sm text-gray-400">...</span>
                  ) : (
                    <button key={item} onClick={() => setPage(item)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium ${item === page ? "bg-komuna-blue text-white" : "bg-white border border-gray-200 hover:bg-gray-50"}`}>
                      {item}
                    </button>
                  )
                )}
              <button onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))} disabled={page === pagination.totalPages}
                className="px-3 py-2 rounded-lg text-sm font-medium border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
