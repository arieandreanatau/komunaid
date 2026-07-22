"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import api from "@/lib/api";

interface UserItem {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar: string | null;
  status: string;
  roles: string[];
  communityCount: number;
  eventCount: number;
  createdAt: string;
}

interface Pagination { page: number; limit: number; total: number; totalPages: number; }

const statusColors: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-700", SUSPENDED: "bg-yellow-100 text-yellow-700", DEACTIVATED: "bg-gray-100 text-gray-600",
};
const statusLabels: Record<string, string> = { ACTIVE: "Aktif", SUSPENDED: "Ditangguhkan", DEACTIVATED: "Dinonaktifkan" };
const roleColors: Record<string, string> = {
  SUPER_ADMIN: "bg-purple-100 text-purple-700", PLATFORM_ADMIN: "bg-blue-100 text-blue-700", MEMBER: "bg-gray-100 text-gray-600",
};

function formatDate(d: string) { return new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }); }

export default function MembersListPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<{ userId: string; action: "suspend" | "activate"; name: string } | null>(null);
  const [resetPwModal, setResetPwModal] = useState<{ userId: string; name: string } | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [resetPwError, setResetPwError] = useState("");

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = { page, limit: 20 };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (roleFilter) params.role = roleFilter;
      const { data } = await api.get("/admin/users", { params });
      setUsers(data.data || []);
      setPagination(data.pagination || { page: 1, limit: 20, total: 0, totalPages: 1 });
    } catch { console.error("Gagal memuat users"); }
    finally { setLoading(false); }
  }, [page, search, statusFilter, roleFilter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleAction = async () => {
    if (!confirmModal) return;
    setActionLoading(confirmModal.userId);
    try {
      await api.put(`/admin/users/${confirmModal.userId}/${confirmModal.action}`);
      setConfirmModal(null);
      fetchUsers();
    } catch { console.error("Gagal"); }
    finally { setActionLoading(null); }
  };

  const handleResetPassword = async () => {
    if (!resetPwModal) return;
    setResetPwError("");
    if (!newPassword || newPassword.length < 8) {
      setResetPwError("Password minimal 8 karakter");
      return;
    }
    setActionLoading(resetPwModal.userId);
    try {
      await api.put(`/admin/users/${resetPwModal.userId}/reset-password`, { newPassword });
      setResetPwModal(null);
      setNewPassword("");
    } catch (err: any) {
      setResetPwError(err?.response?.data?.message || "Gagal mereset password");
    } finally { setActionLoading(null); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-komuna-navy">Members</h1>
          <p className="text-sm text-gray-500 mt-1">Daftar seluruh pengguna platform</p>
        </div>
        <div className="relative w-full md:w-80">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input type="text" placeholder="Cari user..." value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-komuna-blue/30 focus:border-komuna-blue" />
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="flex gap-1 bg-white rounded-lg p-1 shadow-sm">
          {[{ v: "", l: "Semua" }, { v: "ACTIVE", l: "Aktif" }, { v: "SUSPENDED", l: "Ditangguhkan" }, { v: "DEACTIVATED", l: "Dinonaktifkan" }].map((t) => (
            <button key={t.v} onClick={() => { setStatusFilter(t.v); setPage(1); }}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${statusFilter === t.v ? "bg-komuna-blue text-white" : "text-gray-600 hover:bg-gray-100"}`}>
              {t.l}
            </button>
          ))}
        </div>
        <select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
          className="px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-komuna-blue/30">
          <option value="">Semua Role</option>
          <option value="SUPER_ADMIN">Super Admin</option>
          <option value="PLATFORM_ADMIN">Platform Admin</option>
          <option value="MEMBER">Member</option>
        </select>
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
      ) : users.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-sm">
          <p className="text-gray-500">Tidak ada user ditemukan</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left px-4 py-3 font-medium text-gray-500">User</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Role</th>
                    <th className="text-center px-4 py-3 font-medium text-gray-500 hidden sm:table-cell">Komunitas</th>
                    <th className="text-center px-4 py-3 font-medium text-gray-500 hidden sm:table-cell">Event</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500 hidden md:table-cell">Bergabung</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-500">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {u.avatar ? (
                            <img src={u.avatar} alt={u.name} className="h-9 w-9 rounded-full object-cover" />
                          ) : (
                            <div className="h-9 w-9 rounded-full bg-komuna-blue flex items-center justify-center text-white text-sm font-medium">
                              {u.name.charAt(0)}
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-gray-900">{u.name}</p>
                            <p className="text-xs text-gray-400">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[u.status] || ""}`}>
                          {statusLabels[u.status] || u.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {u.roles.map((r) => (
                            <span key={r} className={`px-2 py-0.5 rounded-full text-xs font-medium ${roleColors[r] || ""}`}>{r}</span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center hidden sm:table-cell text-gray-600">{u.communityCount}</td>
                      <td className="px-4 py-3 text-center hidden sm:table-cell text-gray-600">{u.eventCount}</td>
                      <td className="px-4 py-3 hidden md:table-cell text-gray-500 text-xs">{formatDate(u.createdAt)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => setResetPwModal({ userId: u.id, name: u.name })}
                            className="px-3 py-1.5 text-xs font-medium text-amber-600 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors">
                            Reset PW
                          </button>
                          <Link href={`/admin/users/${u.id}`}
                            className="px-3 py-1.5 text-xs font-medium text-komuna-blue bg-komuna-blue/10 rounded-lg hover:bg-komuna-blue/20 transition-colors">
                            Detail
                          </Link>
                          {u.status === "ACTIVE" ? (
                            <button onClick={() => setConfirmModal({ userId: u.id, action: "suspend", name: u.name })}
                              disabled={actionLoading === u.id}
                              className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50">
                              Tangguhkan
                            </button>
                          ) : (
                            <button onClick={() => setConfirmModal({ userId: u.id, action: "activate", name: u.name })}
                              disabled={actionLoading === u.id}
                              className="px-3 py-1.5 text-xs font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50">
                              Aktifkan
                            </button>
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

      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
            <h3 className="text-lg font-semibold text-komuna-navy mb-2">
              {confirmModal.action === "suspend" ? "Tangguhkan User" : "Aktifkan User"}
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              {confirmModal.action === "suspend"
                ? `Apakah Anda yakin ingin menangguhkan user "${confirmModal.name}"? User tidak akan bisa mengakses platform.`
                : `Apakah Anda yakin ingin mengaktifkan kembali user "${confirmModal.name}"?`}
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setConfirmModal(null)} disabled={actionLoading === confirmModal.userId}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50">Batal</button>
              <button onClick={handleAction} disabled={actionLoading === confirmModal.userId}
                className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50 ${
                  confirmModal.action === "suspend" ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"
                }`}>
                {actionLoading === confirmModal.userId ? "Memproses..." : "Konfirmasi"}
              </button>
            </div>
          </div>
        </div>
      )}

      {resetPwModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
            <h3 className="text-lg font-semibold text-komuna-navy mb-2">Reset Password</h3>
            <p className="text-sm text-gray-600 mb-4">
              Reset password untuk user <strong>{resetPwModal.name}</strong>
            </p>
            {resetPwError && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-lg">{resetPwError}</div>
            )}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Password Baru</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimal 8 karakter, huruf besar/kecil, angka"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue"
                autoFocus
              />
              <p className="mt-1 text-xs text-gray-400">Minimal 8 karakter, kombinasi huruf besar, huruf kecil, dan angka</p>
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => { setResetPwModal(null); setNewPassword(""); setResetPwError(""); }}
                disabled={actionLoading === resetPwModal.userId}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50">Batal</button>
              <button onClick={handleResetPassword} disabled={actionLoading === resetPwModal.userId}
                className="px-4 py-2 text-sm font-medium text-white bg-amber-600 rounded-lg hover:bg-amber-700 disabled:opacity-50">
                {actionLoading === resetPwModal.userId ? "Menyimpan..." : "Simpan Password"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
