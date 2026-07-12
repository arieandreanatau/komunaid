"use client";

import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";
import { useAuth } from "@/components/auth-provider";

interface RoleItem {
  id: string; role: string; createdAt: string;
  user: { id: string; name: string; email: string; avatar: string | null; status: string };
}
interface Pagination { page: number; limit: number; total: number; totalPages: number; }

const roleColors: Record<string, string> = {
  SUPER_ADMIN: "bg-purple-100 text-purple-700", PLATFORM_ADMIN: "bg-blue-100 text-blue-700", MEMBER: "bg-gray-100 text-gray-600",
};

export default function MasterDataRolesPage() {
  const { user: authUser } = useAuth();
  const isSuperAdmin = authUser?.roles?.includes("SUPER_ADMIN");
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [roleModal, setRoleModal] = useState<{ userId: string; name: string; currentRole: string } | null>(null);
  const [newRole, setNewRole] = useState("MEMBER");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchRoles = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = { page, limit: 20 };
      if (search) params.search = search;
      if (typeFilter) params.type = typeFilter;
      const { data } = await api.get("/admin/roles", { params });
      setRoles(data.data || []);
      setPagination(data.pagination || { page: 1, limit: 20, total: 0, totalPages: 1 });
    } catch { /* empty */ }
    finally { setLoading(false); }
  }, [page, search, typeFilter]);

  useEffect(() => { fetchRoles(); }, [fetchRoles]);

  const handleChangeRole = async () => {
    if (!roleModal) return;
    setActionLoading(true);
    try {
      await api.put(`/admin/users/${roleModal.userId}/role`, { role: newRole });
      setRoleModal(null);
      fetchRoles();
    } catch { /* empty */ }
    finally { setActionLoading(false); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-komuna-navy">Role Management</h1>
        <p className="text-sm text-gray-500 mt-1">Kelola role platform pengguna</p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <svg className="h-5 w-5 text-blue-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <div className="text-sm text-blue-700">
            <p className="font-medium">RBAC Platform</p>
            <p className="mt-0.5"><strong>Super Admin</strong>: Akses penuh termasuk ubah role, audit log, master data, settings.</p>
            <p><strong>Platform Admin</strong>: Kelola user, approval komunitas/organisasi, moderasi event, laporan, kategori, notifikasi.</p>
            <p><strong>Member</strong>: Akses dasar sebagai pengguna platform.</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input type="text" placeholder="Cari user..." value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-komuna-blue/30" />
        </div>
        <div className="flex gap-1 bg-white rounded-lg p-1 shadow-sm">
          {[{ v: "", l: "Semua" }, { v: "SUPER_ADMIN", l: "Super Admin" }, { v: "PLATFORM_ADMIN", l: "Platform Admin" }, { v: "MEMBER", l: "Member" }].map((t) => (
            <button key={t.v} onClick={() => { setTypeFilter(t.v); setPage(1); }}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${typeFilter === t.v ? "bg-komuna-blue text-white" : "text-gray-600 hover:bg-gray-100"}`}>
              {t.l}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-4 shadow-sm animate-pulse flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-gray-200" />
              <div className="flex-1"><div className="h-4 bg-gray-200 rounded w-1/4 mb-1" /><div className="h-3 bg-gray-200 rounded w-1/6" /></div>
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="border-b bg-gray-50">
                <th className="text-left px-4 py-3 font-medium text-gray-500">User</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Role</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 hidden md:table-cell">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 hidden md:table-cell">Ditugaskan</th>
                {isSuperAdmin && <th className="text-right px-4 py-3 font-medium text-gray-500">Aksi</th>}
              </tr></thead>
              <tbody className="divide-y">
                {roles.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {r.user.avatar ? (
                          <img src={r.user.avatar} alt={r.user.name} className="h-9 w-9 rounded-full object-cover" />
                        ) : (
                          <div className="h-9 w-9 rounded-full bg-komuna-blue flex items-center justify-center text-white text-sm font-medium">{r.user.name.charAt(0)}</div>
                        )}
                        <div><p className="font-medium text-gray-900">{r.user.name}</p><p className="text-xs text-gray-400">{r.user.email}</p></div>
                      </div>
                    </td>
                    <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${roleColors[r.role]}`}>{r.role}</span></td>
                    <td className="px-4 py-3 hidden md:table-cell"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${r.user.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>{r.user.status}</span></td>
                    <td className="px-4 py-3 hidden md:table-cell text-xs text-gray-500">{new Date(r.createdAt).toLocaleDateString("id-ID")}</td>
                    {isSuperAdmin && (
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => { setRoleModal({ userId: r.user.id, name: r.user.name, currentRole: r.role }); setNewRole(r.role); }}
                          className="px-3 py-1.5 text-xs font-medium text-komuna-blue bg-komuna-blue/10 rounded-lg hover:bg-komuna-blue/20 transition-colors">
                          Ubah
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
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

      {roleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
            <h3 className="text-lg font-semibold text-komuna-navy mb-2">Ubah Role</h3>
            <p className="text-sm text-gray-600 mb-4">Ubah role untuk <strong>{roleModal.name}</strong></p>
            <select value={newRole} onChange={(e) => setNewRole(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-komuna-blue/30 mb-4">
              <option value="MEMBER">MEMBER</option>
              <option value="PLATFORM_ADMIN">PLATFORM_ADMIN</option>
              <option value="SUPER_ADMIN">SUPER_ADMIN</option>
            </select>
            <div className="flex justify-end gap-3">
              <button onClick={() => setRoleModal(null)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Batal</button>
              <button onClick={handleChangeRole} disabled={actionLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-komuna-blue rounded-lg hover:bg-komuna-navy disabled:opacity-50">
                {actionLoading ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
