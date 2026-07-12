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

const roleColors: Record<string, string> = {
  SUPER_ADMIN: "bg-purple-100 text-purple-700", PLATFORM_ADMIN: "bg-blue-100 text-blue-700", MEMBER: "bg-gray-100 text-gray-600",
};

function formatDate(d: string) { return new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }); }

export default function SuspendedMembersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<{ userId: string; name: string } | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = { page, limit: 20, status: "SUSPENDED" };
      if (search) params.search = search;
      const { data } = await api.get("/admin/users", { params });
      setUsers(data.data || []);
      setPagination(data.pagination || { page: 1, limit: 20, total: 0, totalPages: 1 });
    } catch { console.error("Gagal memuat suspended users"); }
    finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleActivate = async () => {
    if (!confirmModal) return;
    setActionLoading(confirmModal.userId);
    try {
      await api.put(`/admin/users/${confirmModal.userId}/activate`);
      setConfirmModal(null);
      fetchUsers();
    } catch { console.error("Gagal mengaktifkan user"); }
    finally { setActionLoading(null); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-komuna-navy">Suspended Members</h1>
          <p className="text-sm text-gray-500 mt-1">User yang ditangguhkan dari platform</p>
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
          <p className="text-gray-500">Tidak ada user yang ditangguhkan</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left px-4 py-3 font-medium text-gray-500">User</th>
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
                          <Link href={`/admin/users/${u.id}`}
                            className="px-3 py-1.5 text-xs font-medium text-komuna-blue bg-komuna-blue/10 rounded-lg hover:bg-komuna-blue/20 transition-colors">
                            Detail
                          </Link>
                          <button onClick={() => setConfirmModal({ userId: u.id, name: u.name })}
                            disabled={actionLoading === u.id}
                            className="px-3 py-1.5 text-xs font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50">
                            Aktifkan
                          </button>
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
            <h3 className="text-lg font-semibold text-komuna-navy mb-2">Aktifkan User</h3>
            <p className="text-sm text-gray-600 mb-6">
              Apakah Anda yakin ingin mengaktifkan kembali user &quot;{confirmModal.name}&quot;?
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setConfirmModal(null)} disabled={actionLoading === confirmModal.userId}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50">Batal</button>
              <button onClick={handleActivate} disabled={actionLoading === confirmModal.userId}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50">
                {actionLoading === confirmModal.userId ? "Memproses..." : "Konfirmasi"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
