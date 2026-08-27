"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";

interface Member {
  id: string;
  role: string;
  status: string;
  joinedAt: string;
  user: { id: string; name: string; avatar: string | null };
}

interface CommunityDetail {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo: string | null;
  banner: string | null;
  coverImage: string | null;
  location: string | null;
  address1: string | null;
  address2: string | null;
  village: string | null;
  district: string | null;
  city: string | null;
  province: string | null;
  postalCode: string | null;
  website: string | null;
  instagram: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  membershipType: string;
  status: string;
  visibility: string;
  adminNote: string | null;
  submittedAt: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
  owner: { id: string; name: string; email: string; avatar: string | null };
  categories: { id: string; name: string }[];
  tags: string[];
  members: Member[];
  settings: { allowMemberPost: boolean; requireApproval: boolean; showMemberList: boolean; showEventList: boolean } | null;
  _count: { members: number; events: number; joinRequests: number };
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  APPROVED: "bg-green-100 text-green-700",
  SUSPENDED: "bg-red-100 text-red-700",
  REJECTED: "bg-red-100 text-red-700",
  REVISION_REQUIRED: "bg-orange-100 text-orange-700",
  DRAFT: "bg-gray-100 text-gray-600",
  ARCHIVED: "bg-gray-100 text-gray-600",
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  APPROVED: "Disetujui",
  SUSPENDED: "Ditangguhkan",
  REJECTED: "Ditolak",
  REVISION_REQUIRED: "Revisi",
  DRAFT: "Draft",
  ARCHIVED: "Diarsipkan",
};

const ROLE_LABELS: Record<string, string> = {
  OWNER: "Pemilik",
  ADMIN: "Admin",
  EVENT_MANAGER: "Manajer Event",
  VOLUNTEER_COORDINATOR: "Koordinator Volunteer",
  MEMBER: "Anggota",
};

function formatDate(d: string | null) {
  if (!d) return "-";
  return new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

function formatDateTime(d: string | null) {
  if (!d) return "-";
  return new Date(d).toLocaleString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function AdminCommunityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const communityId = params.communityId as string;
  const [data, setData] = useState<CommunityDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [noteModal, setNoteModal] = useState<{ type: "reject" | "revision"; note: string } | null>(null);

  const fetchCommunity = useCallback(async () => {
    try {
      const { data } = await api.get(`/admin/communities/${communityId}`);
      setData(data.data);
      setError(null);
    } catch {
      setError("Gagal memuat detail komunitas");
    } finally {
      setLoading(false);
    }
  }, [communityId]);

  useEffect(() => {
    fetchCommunity();
  }, [fetchCommunity]);

  const runAction = async (endpoint: string, method: "put" | "patch" = "put", body?: Record<string, string>, key: string = endpoint) => {
    setActionLoading(key);
    try {
      if (method === "put") await api.put(`/admin/communities/${communityId}${endpoint}`);
      else await api.patch(`/admin/communities/${communityId}${endpoint}`, body);
      setNoteModal(null);
      await fetchCommunity();
    } catch {
      setError("Aksi gagal dijalankan");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded w-48 animate-pulse" />
        <div className="bg-white rounded-xl p-6 shadow-sm animate-pulse">
          <div className="h-20 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="text-center py-16">
        <p className="text-red-500">{error}</p>
        <button onClick={fetchCommunity} className="mt-3 px-4 py-2 text-sm font-medium text-komuna-blue bg-komuna-blue/10 rounded-lg hover:bg-komuna-blue/20">
          Coba Lagi
        </button>
      </div>
    );
  }

  if (!data) return <div className="text-center py-16 text-gray-500">Komunitas tidak ditemukan</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push("/admin/communities/communities")} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-komuna-navy">Detail Komunitas</h1>
            <p className="text-sm text-gray-500">Slug: {data.slug}</p>
          </div>
        </div>
        <Link href={`/communities/${data.slug}`} className="px-4 py-2 text-sm font-medium text-komuna-blue bg-komuna-blue/10 rounded-lg hover:bg-komuna-blue/20 transition-colors">
          Lihat Komunitas
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-lg">{error}</div>
      )}

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <div className="flex flex-col md:flex-row md:items-start gap-6">
          {data.logo ? (
            <img src={data.logo} alt={data.name} className="h-20 w-20 rounded-xl object-cover" />
          ) : (
            <div className="h-20 w-20 rounded-xl bg-komuna-blue flex items-center justify-center text-white text-2xl font-bold shrink-0">
              {data.name.charAt(0)}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-bold text-komuna-navy truncate">{data.name}</h2>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[data.status] || "bg-gray-100 text-gray-600"}`}>
                {STATUS_LABELS[data.status] || data.status}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${data.visibility === "PUBLIC" ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                {data.visibility === "PUBLIC" ? "Publik" : "Privat"}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Owner: {data.owner.name} &middot; {data.owner.email}
            </p>
            {data.description && <p className="text-sm text-gray-600 mt-2">{data.description}</p>}
            <div className="flex flex-wrap gap-2 mt-2">
              {data.categories.map((c) => (
                <span key={c.id} className="px-2 py-0.5 rounded-full text-xs font-medium bg-komuna-blue/10 text-komuna-blue">{c.name}</span>
              ))}
              {data.tags.length > 0 && (
                <span className="text-xs text-gray-400 self-center">{data.tags.join(", ")}</span>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Dibuat {formatDateTime(data.createdAt)}
              {data.submittedAt && <> &middot; Diajukan {formatDateTime(data.submittedAt)}</>}
              {data.reviewedAt && <> &middot; Direview {formatDateTime(data.reviewedAt)}</>}
            </p>
          </div>
          <div className="flex flex-col gap-2 shrink-0">
            {data.status === "PENDING" && (
              <>
                <button onClick={() => runAction("/approve")} disabled={actionLoading !== null}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors">
                  {actionLoading === "/approve" ? "..." : "Setujui"}
                </button>
                <button onClick={() => setNoteModal({ type: "revision", note: "" })} disabled={actionLoading !== null}
                  className="px-4 py-2 text-sm font-medium text-orange-600 bg-orange-50 rounded-lg hover:bg-orange-100 disabled:opacity-50 transition-colors">
                  Minta Revisi
                </button>
                <button onClick={() => setNoteModal({ type: "reject", note: "" })} disabled={actionLoading !== null}
                  className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 disabled:opacity-50 transition-colors">
                  Tolak
                </button>
              </>
            )}
            {data.status === "REVISION_REQUIRED" && (
              <button onClick={() => runAction("/approve")} disabled={actionLoading !== null}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors">
                {actionLoading === "/approve" ? "..." : "Setujui"}
              </button>
            )}
            {data.status === "APPROVED" && (
              <button onClick={() => runAction("/suspend")} disabled={actionLoading !== null}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors">
                {actionLoading === "/suspend" ? "..." : "Tangguhkan"}
              </button>
            )}
            {data.status === "SUSPENDED" && (
              <button onClick={() => runAction("/restore")} disabled={actionLoading !== null}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors">
                {actionLoading === "/restore" ? "..." : "Pulihkan"}
              </button>
            )}
          </div>
        </div>

        {data.adminNote && (
          <div className="mt-4 p-3 rounded-lg text-sm bg-orange-50 border border-orange-200 text-orange-700">
            <p className="font-medium mb-0.5">Catatan Admin:</p>
            <p>{data.adminNote}</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Anggota", value: data._count.members },
          { label: "Event", value: data._count.events },
          { label: "Permintaan Join", value: data._count.joinRequests },
          { label: "Tipe", value: data.membershipType === "OPEN" ? "Terbuka" : "Terbatas" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 text-center">
            <p className="text-2xl font-bold text-komuna-navy">{s.value}</p>
            <p className="text-xs text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-komuna-navy mb-4">Detail Data</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 text-sm">
          <div><span className="text-gray-500">Lokasi:</span> {data.city || data.province || "-"}</div>
          <div><span className="text-gray-500">Alamat:</span> {data.address1 || "-"}</div>
          <div><span className="text-gray-500">Website:</span> {data.website || "-"}</div>
          <div><span className="text-gray-500">Instagram:</span> {data.instagram || "-"}</div>
          <div><span className="text-gray-500">Email:</span> {data.contactEmail || "-"}</div>
          <div><span className="text-gray-500">Telepon:</span> {data.contactPhone || "-"}</div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-komuna-navy mb-4">Anggota</h3>
        {data.members.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">Belum ada anggota</p>
        ) : (
          <div className="space-y-3">
            {data.members.map((m) => (
              <div key={m.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50">
                {m.user.avatar ? (
                  <img src={m.user.avatar} alt={m.user.name} className="h-9 w-9 rounded-full object-cover" />
                ) : (
                  <div className="h-9 w-9 rounded-full bg-komuna-blue/10 flex items-center justify-center shrink-0">
                    <span className="text-komuna-blue font-semibold text-xs">{m.user.name.charAt(0)}</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{m.user.name}</p>
                  <p className="text-xs text-gray-400">{formatDate(m.joinedAt)}</p>
                </div>
                <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
                  {ROLE_LABELS[m.role] || m.role}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {noteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
            <h3 className="text-lg font-semibold text-komuna-navy mb-4">
              {noteModal.type === "reject" ? "Tolak Komunitas" : "Minta Revisi"}
            </h3>
            <textarea
              value={noteModal.note}
              onChange={(e) => setNoteModal({ ...noteModal, note: e.target.value })}
              placeholder="Catatan untuk pemilik komunitas..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-komuna-blue/30"
            />
            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => setNoteModal(null)} disabled={actionLoading !== null}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50">
                Batal
              </button>
              <button
                onClick={() => runAction(noteModal.type === "reject" ? "/reject" : "/request-revision", "patch", { note: noteModal.note }, noteModal.type === "reject" ? "/reject" : "/request-revision")}
                disabled={actionLoading !== null || !noteModal.note.trim()}
                className={`px-4 py-2 text-sm font-medium text-white rounded-lg disabled:opacity-50 transition-colors ${noteModal.type === "reject" ? "bg-red-600 hover:bg-red-700" : "bg-orange-500 hover:bg-orange-600"}`}>
                {actionLoading ? "Mengirim..." : "Konfirmasi"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
