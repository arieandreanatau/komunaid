"use client";

import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface Community {
  id: string; name: string; slug: string; description: string | null; logo: string | null;
  status: string; membershipType: string; visibility: string; adminNote: string | null;
  submittedAt: string | null; reviewedAt: string | null;
  owner: { id: string; name: string; email: string; avatar: string | null };
  categories: { id: string; name: string }[]; tags: string[];
  memberCount: number; eventCount: number; createdAt: string;
}
interface Pagination { page: number; limit: number; total: number; totalPages: number; }

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700", APPROVED: "bg-green-100 text-green-700",
  SUSPENDED: "bg-red-100 text-red-700", REJECTED: "bg-red-100 text-red-700",
  REVISION_REQUIRED: "bg-orange-100 text-orange-700", DRAFT: "bg-gray-100 text-gray-600",
  ARCHIVED: "bg-gray-100 text-gray-600",
};
const statusLabels: Record<string, string> = {
  PENDING: "Pending", APPROVED: "Disetujui", SUSPENDED: "Ditangguhkan",
  REJECTED: "Ditolak", REVISION_REQUIRED: "Revisi", DRAFT: "Draft", ARCHIVED: "Diarsipkan",
};

function formatDate(d: string | null) { return d ? new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "-"; }

type StatusFilter = "ALL" | "PENDING" | "APPROVED" | "SUSPENDED" | "REJECTED" | "REVISION_REQUIRED";
const STATUS_TABS: { value: StatusFilter; label: string }[] = [
  { value: "ALL", label: "Semua" }, { value: "PENDING", label: "Pending" }, { value: "APPROVED", label: "Disetujui" },
  { value: "SUSPENDED", label: "Ditangguhkan" }, { value: "REJECTED", label: "Ditolak" }, { value: "REVISION_REQUIRED", label: "Revisi" },
];

export default function CommunityListPage() {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [singleDeleteOpen, setSingleDeleteOpen] = useState(false);
  const [singleDeleteTarget, setSingleDeleteTarget] = useState<Community | null>(null);
  const [singleDeleting, setSingleDeleting] = useState(false);

  const fetchCommunities = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = { page, limit: 20, search };
      if (statusFilter !== "ALL") params.status = statusFilter;
      const { data } = await api.get("/admin/communities", { params });
      setCommunities(data.data || []);
      setPagination(data.pagination || { page: 1, limit: 20, total: 0, totalPages: 1 });
    } catch { /* empty */ }
    finally { setLoading(false); }
  }, [page, search, statusFilter]);

  useEffect(() => { fetchCommunities(); }, [fetchCommunities]);

  useEffect(() => { setSelectedIds(new Set()); }, [communities]);

  const allSelected = communities.length > 0 && communities.every((c) => selectedIds.has(c.id));
  const someSelected = communities.some((c) => selectedIds.has(c.id));

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(communities.map((c) => c.id)));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    setBulkDeleting(true);
    try {
      await api.post("/admin/communities/bulk-delete", { ids: Array.from(selectedIds) });
      setSelectedIds(new Set());
      setBulkDeleteOpen(false);
      fetchCommunities();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Gagal menghapus komunitas.");
    } finally {
      setBulkDeleting(false);
    }
  };

  const handleSingleDelete = async () => {
    if (!singleDeleteTarget) return;
    setSingleDeleting(true);
    try {
      await api.put(`/admin/communities/${singleDeleteTarget.id}/soft-delete`);
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(singleDeleteTarget.id);
        return next;
      });
      setSingleDeleteOpen(false);
      setSingleDeleteTarget(null);
      fetchCommunities();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Gagal menghapus komunitas.");
    } finally {
      setSingleDeleting(false);
    }
  };

  const openSingleDelete = (community: Community) => {
    setSingleDeleteTarget(community);
    setSingleDeleteOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-komuna-navy">Community List</h1>
          <p className="text-sm text-gray-500 mt-1">Daftar seluruh komunitas di platform</p></div>
        <div className="relative w-full md:w-80">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input type="text" placeholder="Cari komunitas..." value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-komuna-blue/30" />
        </div>
      </div>

      <div className="flex gap-1 bg-white rounded-lg p-1 shadow-sm overflow-x-auto">
        {STATUS_TABS.map((tab) => (
          <button key={tab.value} onClick={() => { setStatusFilter(tab.value); setPage(1); }}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${statusFilter === tab.value ? "bg-komuna-blue text-white" : "text-gray-600 hover:bg-gray-100"}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {someSelected && (
        <div className="flex items-center justify-between bg-komuna-blue/5 border border-komuna-blue/20 rounded-xl px-5 py-3">
          <p className="text-sm font-medium text-komuna-navy">
            {selectedIds.size} komunitas dipilih
          </p>
          <button
            onClick={() => setBulkDeleteOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Hapus ({selectedIds.size})
          </button>
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="animate-pulse">
            <div className="h-12 bg-gray-100 border-b border-gray-200" />
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-16 border-b border-gray-100 px-6 py-4 flex items-center gap-4">
                <div className="h-4 w-4 rounded bg-gray-200" />
                <div className="h-8 w-8 rounded-lg bg-gray-200" />
                <div className="flex-1"><div className="h-3 bg-gray-200 rounded w-1/4 mb-1" /><div className="h-2 bg-gray-200 rounded w-1/6" /></div>
                <div className="h-3 bg-gray-200 rounded w-16" />
                <div className="h-3 bg-gray-200 rounded w-12" />
              </div>
            ))}
          </div>
        </div>
      ) : communities.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-sm">
          <svg className="mx-auto h-12 w-12 text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <p className="text-gray-500">Tidak ada komunitas</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-4 py-3 w-10">
                      <input
                        type="checkbox"
                        checked={allSelected}
                        ref={(el) => { if (el) el.indeterminate = someSelected && !allSelected; }}
                        onChange={toggleSelectAll}
                        className="h-4 w-4 rounded border-gray-300 text-komuna-blue focus:ring-komuna-blue/30 cursor-pointer"
                        aria-label="Pilih semua"
                      />
                    </th>
                    <th className="text-left px-6 py-3 font-medium text-gray-500">Community</th>
                    <th className="text-left px-6 py-3 font-medium text-gray-500">Status</th>
                    <th className="text-left px-6 py-3 font-medium text-gray-500">Members</th>
                    <th className="text-left px-6 py-3 font-medium text-gray-500">Events</th>
                    <th className="text-left px-6 py-3 font-medium text-gray-500">Type</th>
                    <th className="text-left px-6 py-3 font-medium text-gray-500">Visibility</th>
                    <th className="text-left px-6 py-3 font-medium text-gray-500">Date</th>
                    <th className="text-left px-6 py-3 font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {communities.map((comm) => (
                    <tr key={comm.id} className={`hover:bg-gray-50 transition-colors ${selectedIds.has(comm.id) ? "bg-komuna-blue/5" : ""}`}>
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(comm.id)}
                          onChange={() => toggleSelect(comm.id)}
                          className="h-4 w-4 rounded border-gray-300 text-komuna-blue focus:ring-komuna-blue/30 cursor-pointer"
                          aria-label={`Pilih ${comm.name}`}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {comm.logo ? <img src={comm.logo} alt={comm.name} className="h-8 w-8 rounded-lg object-cover shrink-0" /> :
                            <div className="h-8 w-8 rounded-lg bg-komuna-blue/10 flex items-center justify-center shrink-0"><span className="text-komuna-blue font-bold text-xs">{comm.name[0]}</span></div>}
                          <div className="min-w-0">
                            <p className="font-medium text-komuna-navy truncate">{comm.name}</p>
                            <p className="text-xs text-gray-400 truncate">{comm.owner.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[comm.status]}`}>{statusLabels[comm.status]}</span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{comm.memberCount}</td>
                      <td className="px-6 py-4 text-gray-600">{comm.eventCount}</td>
                      <td className="px-6 py-4">
                        <span className="text-xs text-gray-500">{comm.membershipType === "OPEN" ? "Terbuka" : "Terbatas"}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-medium ${comm.visibility === "PUBLIC" ? "text-green-600" : "text-gray-500"}`}>{comm.visibility === "PUBLIC" ? "Publik" : "Privat"}</span>
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-xs">{formatDate(comm.submittedAt || comm.createdAt)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <a href={`/admin/communities/communities/${comm.id}`} className="text-komuna-blue text-xs font-medium hover:underline">Detail</a>
                          <span className="text-gray-300">|</span>
                          <button
                            onClick={() => openSingleDelete(comm)}
                            className="text-red-500 text-xs font-medium hover:text-red-700 hover:underline"
                          >
                            Hapus
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

      <ConfirmDialog
        open={bulkDeleteOpen}
        title="Hapus Komunitas"
        message={`Yakin ingin menghapus ${selectedIds.size} komunitas yang dipilih? Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Hapus Semua"
        cancelLabel="Batal"
        variant="danger"
        onConfirm={handleBulkDelete}
        onCancel={() => setBulkDeleteOpen(false)}
        loading={bulkDeleting}
      />

      <ConfirmDialog
        open={singleDeleteOpen}
        title="Hapus Komunitas"
        message={`Yakin ingin menghapus "${singleDeleteTarget?.name}"? Komunitas akan dihapus dari platform.`}
        confirmLabel="Hapus"
        cancelLabel="Batal"
        variant="danger"
        onConfirm={handleSingleDelete}
        onCancel={() => { setSingleDeleteOpen(false); setSingleDeleteTarget(null); }}
        loading={singleDeleting}
      />
    </div>
  );
}
