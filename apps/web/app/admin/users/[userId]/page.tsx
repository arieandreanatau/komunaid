"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { useAuth } from "@/components/auth-provider";

interface UserData {
  id: string; name: string; username: string; email: string; avatar: string | null;
  phone: string | null; bio: string | null; location: string | null;
  status: string; emailVerifiedAt: string | null; roles: string[];
  interests: string[];
  communities: { id: string; name: string; slug: string; status: string; role: string; memberStatus: string }[];
  events: { id: string; title: string; slug: string; status: string; eventDate: string; registrationStatus: string }[];
  ownedCommunities: { id: string; name: string; slug: string; status: string }[];
  ownedOrganizations: { id: string; name: string; slug: string; status: string }[];
  recentActivity: { id: string; action: string; details: any; createdAt: string }[];
  counts: { joinedCommunities: number; registeredEvents: number; createdCommunities: number; createdOrganizations: number; reportedReports: number; auditLogs: number };
  createdAt: string; updatedAt: string;
}

const statusColors: Record<string, string> = { ACTIVE: "bg-green-100 text-green-700", SUSPENDED: "bg-yellow-100 text-yellow-700", DEACTIVATED: "bg-gray-100 text-gray-600" };
const statusLabels: Record<string, string> = { ACTIVE: "Aktif", SUSPENDED: "Ditangguhkan", DEACTIVATED: "Dinonaktifkan" };
const roleColors: Record<string, string> = { SUPER_ADMIN: "bg-purple-100 text-purple-700", PLATFORM_ADMIN: "bg-blue-100 text-blue-700", MEMBER: "bg-gray-100 text-gray-600" };
const commStatusColors: Record<string, string> = { PENDING: "bg-yellow-100 text-yellow-700", APPROVED: "bg-green-100 text-green-700", SUSPENDED: "bg-red-100 text-red-700", REJECTED: "bg-red-100 text-red-700" };

function formatDate(d: string) { return new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }); }
function formatDateTime(d: string) { return new Date(d).toLocaleString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }); }

type Tab = "communities" | "events" | "ownership" | "activity";

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user: authUser } = useAuth();
  const userId = params.userId as string;
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("communities");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [roleModal, setRoleModal] = useState(false);
  const [newRole, setNewRole] = useState("MEMBER");
  const isSuperAdmin = authUser?.roles?.includes("SUPER_ADMIN");

  const fetchUser = useCallback(async () => {
    try {
      const { data } = await api.get(`/admin/users/${userId}`);
      setUserData(data.data);
      setNewRole(data.data.roles[0] || "MEMBER");
    } catch { console.error("Gagal memuat user"); }
    finally { setLoading(false); }
  }, [userId]);

  useEffect(() => { fetchUser(); }, [fetchUser]);

  const handleSuspend = async () => {
    setActionLoading("suspend");
    try { await api.put(`/admin/users/${userId}/suspend`); fetchUser(); }
    finally { setActionLoading(null); }
  };

  const handleActivate = async () => {
    setActionLoading("activate");
    try { await api.put(`/admin/users/${userId}/activate`); fetchUser(); }
    finally { setActionLoading(null); }
  };

  const handleChangeRole = async () => {
    setActionLoading("role");
    try { await api.put(`/admin/users/${userId}/role`, { role: newRole }); setRoleModal(false); fetchUser(); }
    finally { setActionLoading(null); }
  };

  if (loading) {
    return <div className="space-y-6">
      <div className="h-8 bg-gray-200 rounded w-48 animate-pulse" />
      <div className="bg-white rounded-xl p-6 shadow-sm animate-pulse"><div className="h-20 bg-gray-200 rounded" /></div>
    </div>;
  }

  if (!userData) return <div className="text-center py-16 text-gray-500">User tidak ditemukan</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => router.push("/admin/users")} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <h1 className="text-2xl font-bold text-komuna-navy">Detail User</h1>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <div className="flex flex-col md:flex-row md:items-start gap-6">
          {userData.avatar ? (
            <img src={userData.avatar} alt={userData.name} className="h-20 w-20 rounded-full object-cover" />
          ) : (
            <div className="h-20 w-20 rounded-full bg-komuna-blue flex items-center justify-center text-white text-2xl font-bold shrink-0">
              {userData.name.charAt(0)}
            </div>
          )}
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-bold text-komuna-navy">{userData.name}</h2>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[userData.status]}`}>
                {statusLabels[userData.status]}
              </span>
            </div>
            <p className="text-sm text-gray-500">@{userData.username} &middot; {userData.email}</p>
            {userData.phone && <p className="text-sm text-gray-500 mt-1">Telp: {userData.phone}</p>}
            {userData.bio && <p className="text-sm text-gray-600 mt-1">{userData.bio}</p>}
            {userData.location && <p className="text-sm text-gray-500 mt-1">Lokasi: {userData.location}</p>}
            <div className="flex flex-wrap gap-1 mt-2">
              {userData.roles.map((r) => (
                <span key={r} className={`px-2 py-0.5 rounded-full text-xs font-medium ${roleColors[r]}`}>{r}</span>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-2">Bergabung {formatDate(userData.createdAt)}</p>
          </div>
          <div className="flex flex-col gap-2 shrink-0">
            {userData.status === "ACTIVE" ? (
              <button onClick={handleSuspend} disabled={actionLoading === "suspend"}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors">
                {actionLoading === "suspend" ? "..." : "Tangguhkan"}
              </button>
            ) : (
              <button onClick={handleActivate} disabled={actionLoading === "activate"}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors">
                {actionLoading === "activate" ? "..." : "Aktifkan"}
              </button>
            )}
            {isSuperAdmin && (
              <button onClick={() => setRoleModal(true)}
                className="px-4 py-2 text-sm font-medium text-komuna-blue bg-komuna-blue/10 rounded-lg hover:bg-komuna-blue/20 transition-colors">
                Ubah Role
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mt-6 pt-6 border-t">
          {[
            { label: "Komunitas", value: userData.counts.joinedCommunities },
            { label: "Event", value: userData.counts.registeredEvents },
            { label: "Komunitas Dimiliki", value: userData.counts.createdCommunities },
            { label: "Organisasi Dimiliki", value: userData.counts.createdOrganizations },
            { label: "Laporan", value: userData.counts.reportedReports },
            { label: "Audit Log", value: userData.counts.auditLogs },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-2xl font-bold text-komuna-navy">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-1 bg-white rounded-lg p-1 shadow-sm">
        {([
          ["communities", "Komunitas"],
          ["events", "Event"],
          ["ownership", "Kepemilikan"],
          ["activity", "Aktivitas"],
        ] as [Tab, string][]).map(([k, v]) => (
          <button key={k} onClick={() => setActiveTab(k)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === k ? "bg-komuna-blue text-white" : "text-gray-600 hover:bg-gray-100"}`}>
            {v}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        {activeTab === "communities" && (
          userData.communities.length === 0 ? <p className="text-sm text-gray-400 text-center py-8">Tidak ada komunitas</p> :
          <div className="space-y-3">
            {userData.communities.map((c) => (
              <div key={c.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50">
                <div className="h-10 w-10 rounded-lg bg-komuna-blue/10 flex items-center justify-center shrink-0">
                  <span className="text-komuna-blue font-semibold text-sm">{c.name[0]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{c.name}</p>
                  <p className="text-xs text-gray-400">Role: {c.role}</p>
                </div>
                <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${commStatusColors[c.status] || "bg-gray-100 text-gray-600"}`}>{c.status}</span>
              </div>
            ))}
          </div>
        )}
        {activeTab === "events" && (
          userData.events.length === 0 ? <p className="text-sm text-gray-400 text-center py-8">Tidak ada event</p> :
          <div className="space-y-3">
            {userData.events.map((e) => (
              <div key={e.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50">
                <div className="h-10 w-10 rounded-lg bg-komuna-teal/10 flex items-center justify-center shrink-0">
                  <svg className="h-5 w-5 text-komuna-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{e.title}</p>
                  <p className="text-xs text-gray-400">{formatDate(e.eventDate)}</p>
                </div>
                <span className="text-xs text-gray-500">{e.registrationStatus}</span>
              </div>
            ))}
          </div>
        )}
        {activeTab === "ownership" && (
          <div className="space-y-4">
            {userData.ownedCommunities.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Komunitas Dimiliki</h3>
                {userData.ownedCommunities.map((c) => (
                  <div key={c.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50">
                    <div className="h-8 w-8 rounded-lg bg-komuna-blue/10 flex items-center justify-center shrink-0">
                      <span className="text-komuna-blue font-semibold text-xs">{c.name[0]}</span>
                    </div>
                    <span className="text-sm font-medium">{c.name}</span>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${commStatusColors[c.status] || "bg-gray-100"}`}>{c.status}</span>
                  </div>
                ))}
              </div>
            )}
            {userData.ownedOrganizations.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Organisasi Dimiliki</h3>
                {userData.ownedOrganizations.map((o) => (
                  <div key={o.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50">
                    <div className="h-8 w-8 rounded-lg bg-komuna-teal/10 flex items-center justify-center shrink-0">
                      <span className="text-komuna-teal font-semibold text-xs">{o.name[0]}</span>
                    </div>
                    <span className="text-sm font-medium">{o.name}</span>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${commStatusColors[o.status] || "bg-gray-100"}`}>{o.status}</span>
                  </div>
                ))}
              </div>
            )}
            {userData.ownedCommunities.length === 0 && userData.ownedOrganizations.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-8">Tidak ada kepemilikan</p>
            )}
          </div>
        )}
        {activeTab === "activity" && (
          userData.recentActivity.length === 0 ? <p className="text-sm text-gray-400 text-center py-8">Tidak ada aktivitas</p> :
          <div className="space-y-3">
            {userData.recentActivity.map((a) => (
              <div key={a.id} className="flex items-start gap-3">
                <div className="h-2 w-2 rounded-full bg-komuna-blue mt-2 shrink-0" />
                <div>
                  <p className="text-sm text-gray-700">{a.action}</p>
                  <p className="text-xs text-gray-400">{formatDateTime(a.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {roleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
            <h3 className="text-lg font-semibold text-komuna-navy mb-4">Ubah Role</h3>
            <select value={newRole} onChange={(e) => setNewRole(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-komuna-blue/30 mb-4">
              <option value="MEMBER">MEMBER</option>
              <option value="PLATFORM_ADMIN">PLATFORM_ADMIN</option>
              <option value="SUPER_ADMIN">SUPER_ADMIN</option>
            </select>
            <div className="flex justify-end gap-3">
              <button onClick={() => setRoleModal(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Batal</button>
              <button onClick={handleChangeRole} disabled={actionLoading === "role"}
                className="px-4 py-2 text-sm font-medium text-white bg-komuna-blue rounded-lg hover:bg-komuna-navy disabled:opacity-50">
                {actionLoading === "role" ? "..." : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
