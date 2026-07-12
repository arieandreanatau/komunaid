"use client";

import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";

interface Community {
  id: string; name: string; slug: string; description: string; logo: string | null; banner: string | null;
  status: string; membershipType: string; visibility: string; adminNote: string | null;
  submittedAt: string | null; owner: { id: string; name: string; email: string; avatar: string | null };
  categories: { id: string; name: string }[]; tags: { id: string; tag: string }[];
  memberCount: number; createdAt: string;
}
interface Pagination { page: number; limit: number; total: number; totalPages: number; }

const statusColors: Record<string, string> = { PENDING: "bg-yellow-100 text-yellow-700", REVISION_REQUIRED: "bg-orange-100 text-orange-700", APPROVED: "bg-green-100 text-green-700", REJECTED: "bg-red-100 text-red-700" };
const statusLabels: Record<string, string> = { PENDING: "Pending", REVISION_REQUIRED: "Revisi", APPROVED: "Disetujui", REJECTED: "Ditolak" };

function formatDate(d: string | null) { return d ? new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "-"; }

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

type StatusFilter = "ALL" | "PENDING" | "REVISION_REQUIRED" | "APPROVED" | "REJECTED";
const STATUS_TABS: { value: StatusFilter; label: string }[] = [
  { value: "ALL", label: "Semua" }, { value: "PENDING", label: "Pending" }, { value: "REVISION_REQUIRED", label: "Revisi" },
  { value: "APPROVED", label: "Disetujui" }, { value: "REJECTED", label: "Ditolak" },
];

export default function CommunityApprovalPage() {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("PENDING");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [modal, setModal] = useState<{ type: "revision" | "reject"; communityId: string } | null>(null);

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
  }, [page, statusFilter, search]);

  useEffect(() => { fetchCommunities(); }, [fetchCommunities]);

  const handleApprove = async (id: string) => { setActionLoading(id); try { await api.put(`/admin/communities/${id}/approve`); fetchCommunities(); } finally { setActionLoading(null); } };
  const handleReject = async (id: string, note: string) => { setActionLoading(id); try { await api.patch(`/admin/communities/${id}/reject`, { note }); setModal(null); fetchCommunities(); } finally { setActionLoading(null); } };
  const handleRevision = async (id: string, note: string) => { setActionLoading(id); try { await api.patch(`/admin/communities/${id}/request-revision`, { note }); setModal(null); fetchCommunities(); } finally { setActionLoading(null); } };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-komuna-navy">Community Approval Queue</h1>
          <p className="text-sm text-gray-500 mt-1">Tinjau dan kelola pengajuan komunitas baru</p></div>
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

      {loading ? (
        <div className="space-y-4">{Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm p-6 animate-pulse"><div className="flex items-start gap-4"><div className="h-12 w-12 rounded-lg bg-gray-200" /><div className="flex-1"><div className="h-4 bg-gray-200 rounded w-1/3 mb-2" /><div className="h-3 bg-gray-200 rounded w-1/4" /></div></div></div>
        ))}</div>
      ) : communities.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-sm">
          <svg className="mx-auto h-12 w-12 text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-gray-500">Tidak ada komunitas untuk ditinjau</p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {communities.map((comm) => (
              <div key={comm.id} className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex flex-col md:flex-row md:items-start gap-4">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    {comm.logo ? <img src={comm.logo} alt={comm.name} className="h-12 w-12 rounded-lg object-cover shrink-0" /> :
                      <div className="h-12 w-12 rounded-lg bg-komuna-blue/10 flex items-center justify-center shrink-0"><span className="text-komuna-blue font-bold text-lg">{comm.name[0]}</span></div>}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-komuna-navy">{comm.name}</h3>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[comm.status]}`}>{statusLabels[comm.status]}</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-0.5">{comm.owner.name} &middot; {comm.owner.email}</p>
                      {comm.adminNote && <div className="mt-2 px-3 py-2 bg-orange-50 border border-orange-200 rounded-lg text-sm text-orange-700"><span className="font-medium">Catatan admin:</span> {comm.adminNote}</div>}
                      <p className="text-sm text-gray-600 mt-2 line-clamp-2">{comm.description || "Tidak ada deskripsi"}</p>
                      <div className="flex items-center flex-wrap gap-2 mt-3">
                        {comm.categories.map((c) => <span key={c.id} className="px-2 py-0.5 bg-komuna-blue/10 text-komuna-blue text-xs font-medium rounded-full">{c.name}</span>)}
                        {comm.tags.map((t) => <span key={t.id} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">#{t.tag}</span>)}
                      </div>
                      <div className="flex items-center flex-wrap gap-3 mt-3 text-xs text-gray-400">
                        <span>{comm.membershipType === "OPEN" ? "Terbuka" : "Terbatas"}</span>
                        <span>{comm.visibility === "PUBLIC" ? "Publik" : "Privat"}</span>
                        <span>{comm.memberCount} anggota</span>
                        <span>Diajukan {formatDate(comm.submittedAt || comm.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                  {(comm.status === "PENDING" || comm.status === "REVISION_REQUIRED") && (
                    <div className="flex flex-row md:flex-col gap-2 shrink-0">
                      <button onClick={() => handleApprove(comm.id)} disabled={actionLoading === comm.id}
                        className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50">Setujui</button>
                      <button onClick={() => setModal({ type: "revision", communityId: comm.id })} disabled={actionLoading === comm.id}
                        className="px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 disabled:opacity-50">Minta Revisi</button>
                      <button onClick={() => setModal({ type: "reject", communityId: comm.id })} disabled={actionLoading === comm.id}
                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50">Tolak</button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {pagination.totalPages > 1 && (
            <div className="flex justify-center items-center gap-1 mt-8">
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
          title={modal.type === "revision" ? "Minta Revisi" : "Tolak Komunitas"}
          placeholder={modal.type === "revision" ? "Jelaskan apa yang perlu diperbaiki..." : "Alasan penolakan..."}
          onConfirm={(note) => modal.type === "revision" ? handleRevision(modal.communityId, note) : handleReject(modal.communityId, note)}
          onCancel={() => setModal(null)} loading={actionLoading === modal.communityId} />
      )}
    </div>
  );
}
