"use client";

import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";

interface UserInfo {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  status?: string;
}

interface LoginHistoryEntry {
  id: string;
  user: UserInfo;
  ipAddress: string | null;
  userAgent: string | null;
  success: boolean;
  failureReason: string | null;
  createdAt: string;
}

interface FailedLoginEntry {
  id: string;
  user: UserInfo;
  ipAddress: string | null;
  userAgent: string | null;
  failureReason: string | null;
  createdAt: string;
}

interface SuspiciousActivityEntry {
  user: UserInfo;
  ipAddress: string | null;
  failedAttempts: number;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

type TabKey = "login-history" | "failed-logins" | "suspicious-activity";

const tabs: { key: TabKey; label: string }[] = [
  { key: "login-history", label: "Riwayat Login" },
  { key: "failed-logins", label: "Login Gagal" },
  { key: "suspicious-activity", label: "Aktivitas Mencurigakan" },
];

function formatDateTime(d: string): string {
  return new Date(d).toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function parseUserAgent(ua: string | null): string {
  if (!ua) return "Tidak diketahui";
  if (ua.includes("Chrome") && !ua.includes("Edg")) return "Chrome";
  if (ua.includes("Firefox")) return "Firefox";
  if (ua.includes("Safari") && !ua.includes("Chrome")) return "Safari";
  if (ua.includes("Edg")) return "Edge";
  if (ua.includes("Opera") || ua.includes("OPR")) return "Opera";
  return ua.substring(0, 40);
}

function ConfirmActionModal({
  title,
  description,
  confirmLabel,
  confirmColor,
  onConfirm,
  onCancel,
  loading,
}: {
  title: string;
  description: string;
  confirmLabel: string;
  confirmColor: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
        <h3 className="text-lg font-semibold text-komuna-navy mb-2">{title}</h3>
        <p className="text-sm text-gray-600 mb-6">{description}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50 ${confirmColor}`}
          >
            {loading ? "Memproses..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SecurityPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("login-history");
  const [loading, setLoading] = useState(true);

  const [loginHistory, setLoginHistory] = useState<LoginHistoryEntry[]>([]);
  const [failedLogins, setFailedLogins] = useState<FailedLoginEntry[]>([]);
  const [suspiciousActivity, setSuspiciousActivity] = useState<SuspiciousActivityEntry[]>([]);

  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [page, setPage] = useState(1);

  const [userIdFilter, setUserIdFilter] = useState("");
  const [successFilter, setSuccessFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    type: "force-logout" | "lock" | "unlock";
    userId: string;
    userName: string;
  } | null>(null);

  const fetchLoginHistory = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = { page, limit: 20 };
      if (userIdFilter) params.userId = userIdFilter;
      if (successFilter) params.success = successFilter;
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;
      const { data } = await api.get("/admin/security/login-history", { params });
      setLoginHistory(data.data || []);
      setPagination(data.pagination || { page: 1, limit: 20, total: 0, totalPages: 1 });
    } catch {
      console.error("Gagal memuat riwayat login");
    } finally {
      setLoading(false);
    }
  }, [page, userIdFilter, successFilter, dateFrom, dateTo]);

  const fetchFailedLogins = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = { page, limit: 20 };
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;
      const { data } = await api.get("/admin/security/failed-logins", { params });
      setFailedLogins(data.data || []);
      setPagination(data.pagination || { page: 1, limit: 20, total: 0, totalPages: 1 });
    } catch {
      console.error("Gagal memuat login gagal");
    } finally {
      setLoading(false);
    }
  }, [page, dateFrom, dateTo]);

  const fetchSuspiciousActivity = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/admin/security/suspicious-activity");
      setSuspiciousActivity(data.data || []);
    } catch {
      console.error("Gagal memuat aktivitas mencurigakan");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setPage(1);
    setUserIdFilter("");
    setSuccessFilter("");
    setDateFrom("");
    setDateTo("");
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === "login-history") fetchLoginHistory();
    else if (activeTab === "failed-logins") fetchFailedLogins();
    else if (activeTab === "suspicious-activity") fetchSuspiciousActivity();
  }, [activeTab, fetchLoginHistory, fetchFailedLogins, fetchSuspiciousActivity]);

  const handleForceLogout = async (userId: string) => {
    setActionLoading(userId);
    try {
      await api.post("/admin/security/force-logout", { userId });
      setConfirmModal(null);
      if (activeTab === "login-history") fetchLoginHistory();
      else if (activeTab === "failed-logins") fetchFailedLogins();
      else fetchSuspiciousActivity();
    } catch {
      console.error("Gagal force logout");
    } finally {
      setActionLoading(null);
    }
  };

  const handleLockUser = async (userId: string) => {
    setActionLoading(userId);
    try {
      await api.put("/admin/security/lock-user", { userId });
      setConfirmModal(null);
      if (activeTab === "login-history") fetchLoginHistory();
      else if (activeTab === "failed-logins") fetchFailedLogins();
      else fetchSuspiciousActivity();
    } catch {
      console.error("Gagal mengunci user");
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnlockUser = async (userId: string) => {
    setActionLoading(userId);
    try {
      await api.put("/admin/security/unlock-user", { userId });
      setConfirmModal(null);
      if (activeTab === "login-history") fetchLoginHistory();
      else if (activeTab === "failed-logins") fetchFailedLogins();
      else fetchSuspiciousActivity();
    } catch {
      console.error("Gagal membuka kunci user");
    } finally {
      setActionLoading(null);
    }
  };

  function renderPagination() {
    if (activeTab === "suspicious-activity" || pagination.totalPages <= 1) return null;
    return (
      <div className="flex justify-center items-center gap-1 mt-6">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="px-3 py-2 rounded-lg text-sm font-medium border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Prev
        </button>
        {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
          .filter(
            (p) =>
              pagination.totalPages <= 7 ||
              p === 1 ||
              p === pagination.totalPages ||
              Math.abs(p - page) <= 1
          )
          .reduce<(number | "...")[]>((acc, p, i, arr) => {
            if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("...");
            acc.push(p);
            return acc;
          }, [])
          .map((item, i) =>
            item === "..." ? (
              <span key={`e-${i}`} className="px-2 py-2 text-sm text-gray-400">
                ...
              </span>
            ) : (
              <button
                key={item}
                onClick={() => setPage(item)}
                className={`px-3 py-2 rounded-lg text-sm font-medium ${
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
          onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
          disabled={page === pagination.totalPages}
          className="px-3 py-2 rounded-lg text-sm font-medium border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    );
  }

  function renderLoginHistorySkeleton() {
    return (
      <div className="space-y-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm p-4 animate-pulse">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gray-200 shrink-0" />
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-1/3" />
              </div>
              <div className="h-6 w-16 bg-gray-200 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  function renderLoginHistory() {
    return (
      <>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="relative">
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
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              <input
                type="text"
                placeholder="Filter User ID..."
                value={userIdFilter}
                onChange={(e) => {
                  setUserIdFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-komuna-blue/30"
              />
            </div>
            <select
              value={successFilter}
              onChange={(e) => {
                setSuccessFilter(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-komuna-blue/30"
            >
              <option value="">Semua Status</option>
              <option value="true">Berhasil</option>
              <option value="false">Gagal</option>
            </select>
            <div className="flex gap-2">
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => {
                  setDateFrom(e.target.value);
                  setPage(1);
                }}
                className="flex-1 px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-komuna-blue/30"
              />
              <input
                type="date"
                value={dateTo}
                onChange={(e) => {
                  setDateTo(e.target.value);
                  setPage(1);
                }}
                className="flex-1 px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-komuna-blue/30"
              />
            </div>
          </div>
        </div>

        {loginHistory.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm">
            <svg className="mx-auto h-12 w-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <p className="text-gray-500">Tidak ada data riwayat login</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left px-4 py-3 font-medium text-gray-500">User</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">IP Address</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500 hidden md:table-cell">Browser</th>
                    <th className="text-center px-4 py-3 font-medium text-gray-500">Status</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500 hidden sm:table-cell">Waktu</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-500">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {loginHistory.map((entry) => (
                    <tr key={entry.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {entry.user.avatar ? (
                            <img src={entry.user.avatar} alt={entry.user.name} className="h-9 w-9 rounded-full object-cover" />
                          ) : (
                            <div className="h-9 w-9 rounded-full bg-komuna-blue flex items-center justify-center text-white text-sm font-medium shrink-0">
                              {entry.user.name.charAt(0)}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 truncate">{entry.user.name}</p>
                            <p className="text-xs text-gray-400 truncate">{entry.user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600 font-mono text-xs">
                        {entry.ipAddress || "-"}
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs hidden md:table-cell">
                        {parseUserAgent(entry.userAgent)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {entry.success ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Berhasil
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                            <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                            Gagal
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell text-gray-500 text-xs">
                        {formatDateTime(entry.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() =>
                              setConfirmModal({
                                type: "force-logout",
                                userId: entry.user.id,
                                userName: entry.user.name,
                              })
                            }
                            disabled={actionLoading === entry.user.id}
                            className="px-2.5 py-1.5 text-xs font-medium text-orange-600 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors disabled:opacity-50"
                            title="Force Logout"
                          >
                            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                          </button>
                          <button
                            onClick={() =>
                              setConfirmModal({
                                type: "lock",
                                userId: entry.user.id,
                                userName: entry.user.name,
                              })
                            }
                            disabled={actionLoading === entry.user.id}
                            className="px-2.5 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                            title="Kunci User"
                          >
                            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {renderPagination()}
      </>
    );
  }

  function renderFailedLogins() {
    return (
      <>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="flex gap-2 md:col-span-2">
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => {
                  setDateFrom(e.target.value);
                  setPage(1);
                }}
                className="flex-1 px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-komuna-blue/30"
              />
              <input
                type="date"
                value={dateTo}
                onChange={(e) => {
                  setDateTo(e.target.value);
                  setPage(1);
                }}
                className="flex-1 px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-komuna-blue/30"
              />
            </div>
            <div className="text-sm text-gray-400 flex items-center justify-end">
              {pagination.total.toLocaleString()} percobaan gagal
            </div>
          </div>
        </div>

        {failedLogins.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm">
            <svg className="mx-auto h-12 w-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <p className="text-gray-500">Tidak ada login gagal yang tercatat</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left px-4 py-3 font-medium text-gray-500">User</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">IP Address</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500 hidden md:table-cell">Browser</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Alasan</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500 hidden sm:table-cell">Waktu</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-500">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {failedLogins.map((entry) => (
                    <tr key={entry.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {entry.user.avatar ? (
                            <img src={entry.user.avatar} alt={entry.user.name} className="h-9 w-9 rounded-full object-cover" />
                          ) : (
                            <div className="h-9 w-9 rounded-full bg-red-500 flex items-center justify-center text-white text-sm font-medium shrink-0">
                              {entry.user.name.charAt(0)}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 truncate">{entry.user.name}</p>
                            <p className="text-xs text-gray-400 truncate">{entry.user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600 font-mono text-xs">
                        {entry.ipAddress || "-"}
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs hidden md:table-cell">
                        {parseUserAgent(entry.userAgent)}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600 max-w-[200px] truncate">
                        {entry.failureReason || "-"}
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell text-gray-500 text-xs">
                        {formatDateTime(entry.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() =>
                              setConfirmModal({
                                type: "lock",
                                userId: entry.user.id,
                                userName: entry.user.name,
                              })
                            }
                            disabled={actionLoading === entry.user.id}
                            className="px-2.5 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                            title="Kunci User"
                          >
                            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                          </button>
                          <button
                            onClick={() =>
                              setConfirmModal({
                                type: "unlock",
                                userId: entry.user.id,
                                userName: entry.user.name,
                              })
                            }
                            disabled={actionLoading === entry.user.id}
                            className="px-2.5 py-1.5 text-xs font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50"
                            title="Buka Kunci User"
                          >
                            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {renderPagination()}
      </>
    );
  }

  function renderSuspiciousActivity() {
    return (
      <>
        {suspiciousActivity.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm">
            <svg className="mx-auto h-12 w-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <p className="text-gray-500">Tidak ada aktivitas mencurigakan terdeteksi</p>
          </div>
        ) : (
          <div className="space-y-3">
            {suspiciousActivity.map((entry, idx) => (
              <div
                key={`${entry.user.id}-${idx}`}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-5"
              >
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {entry.user.avatar ? (
                      <img src={entry.user.avatar} alt={entry.user.name} className="h-11 w-11 rounded-full object-cover" />
                    ) : (
                      <div className="h-11 w-11 rounded-full bg-komuna-navy flex items-center justify-center text-white text-sm font-medium shrink-0">
                        {entry.user.name.charAt(0)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-gray-900">{entry.user.name}</p>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          entry.user.status === "ACTIVE"
                            ? "bg-green-100 text-green-700"
                            : entry.user.status === "SUSPENDED"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-gray-100 text-gray-600"
                        }`}>
                          {entry.user.status === "ACTIVE"
                            ? "Aktif"
                            : entry.user.status === "SUSPENDED"
                            ? "Ditangguhkan"
                            : entry.user.status || "Tidak diketahui"}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400">{entry.user.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-2">
                      <div className="px-3 py-1.5 rounded-lg bg-red-50 border border-red-100">
                        <span className="text-xs text-gray-500">Percobaan Gagal</span>
                        <span className="ml-2 text-sm font-bold text-red-600">{entry.failedAttempts}</span>
                      </div>
                    </div>

                    {entry.ipAddress && (
                      <div className="px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-100">
                        <span className="text-xs text-gray-500">IP</span>
                        <span className="ml-2 text-sm font-mono text-gray-700">{entry.ipAddress}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() =>
                          setConfirmModal({
                            type: "force-logout",
                            userId: entry.user.id,
                            userName: entry.user.name,
                          })
                        }
                        disabled={actionLoading === entry.user.id}
                        className="px-2.5 py-1.5 text-xs font-medium text-orange-600 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors disabled:opacity-50"
                        title="Force Logout"
                      >
                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                      </button>
                      <button
                        onClick={() =>
                          setConfirmModal({
                            type: "lock",
                            userId: entry.user.id,
                            userName: entry.user.name,
                          })
                        }
                        disabled={actionLoading === entry.user.id}
                        className="px-2.5 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                        title="Kunci User"
                      >
                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </button>
                      <button
                        onClick={() =>
                          setConfirmModal({
                            type: "unlock",
                            userId: entry.user.id,
                            userName: entry.user.name,
                          })
                        }
                        disabled={actionLoading === entry.user.id}
                        className="px-2.5 py-1.5 text-xs font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50"
                        title="Buka Kunci User"
                      >
                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-komuna-navy">Keamanan</h1>
        <p className="text-sm text-gray-500 mt-1">Monitor aktivitas login dan keamanan platform</p>
      </div>

      <div className="flex gap-1 bg-white rounded-lg p-1 shadow-sm border border-gray-100">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === tab.key
                ? "bg-komuna-blue text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading
        ? renderLoginHistorySkeleton()
        : activeTab === "login-history"
        ? renderLoginHistory()
        : activeTab === "failed-logins"
        ? renderFailedLogins()
        : renderSuspiciousActivity()}

      {confirmModal && (
        <ConfirmActionModal
          title={
            confirmModal.type === "force-logout"
              ? "Force Logout"
              : confirmModal.type === "lock"
              ? "Kunci User"
              : "Buka Kunci User"
          }
          description={
            confirmModal.type === "force-logout"
              ? `Apakah Anda yakin ingin memaksa logout "${confirmModal.userName}"? Semua sesi aktif user akan diakhiri.`
              : confirmModal.type === "lock"
              ? `Apakah Anda yakin ingin mengunci akun "${confirmModal.userName}"? User tidak akan bisa login sampai dikunci.`
              : `Apakah Anda yakin ingin membuka kunci akun "${confirmModal.userName}"? User akan bisa login kembali.`
          }
          confirmLabel={
            confirmModal.type === "force-logout"
              ? "Force Logout"
              : confirmModal.type === "lock"
              ? "Kunci User"
              : "Buka Kunci"
          }
          confirmColor={
            confirmModal.type === "force-logout"
              ? "bg-orange-600 hover:bg-orange-700"
              : confirmModal.type === "lock"
              ? "bg-red-600 hover:bg-red-700"
              : "bg-green-600 hover:bg-green-700"
          }
          onConfirm={() => {
            if (confirmModal.type === "force-logout") handleForceLogout(confirmModal.userId);
            else if (confirmModal.type === "lock") handleLockUser(confirmModal.userId);
            else handleUnlockUser(confirmModal.userId);
          }}
          onCancel={() => setConfirmModal(null)}
          loading={actionLoading === confirmModal.userId}
        />
      )}
    </div>
  );
}
