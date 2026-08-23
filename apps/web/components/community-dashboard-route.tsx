"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { useAuth } from "@/components/auth-provider";
import { CommunityEventTab } from "@/components/community-event-tab";

interface DashboardData {
  community: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    visibility: string;
    membershipType: string;
    status: string;
    memberCount: number;
    eventCount: number;
    createdAt: string;
  };
  pendingRequests: number;
  activeEvents: number;
  recentActivity: ActivityItem[];
}

interface ActivityItem {
  id: string;
  action: string;
  userId: string;
  userName: string;
  userAvatar: string | null;
  createdAt: string;
  details: unknown | null;
}

interface Member {
  id: string;
  userId: string;
  name: string;
  username: string;
  avatar: string | null;
  role: string;
  status?: string;
  joinedAt: string;
}

interface MemberResponseItem {
  id: string;
  user: {
    id: string;
    name: string;
    username: string;
    avatar: string | null;
  };
  role: string;
  status: string;
  joinedAt: string;
}

interface JoinRequest {
  id: string;
  userId: string;
  name: string;
  username: string;
  avatar: string | null;
  message: string | null;
  status: string;
  createdAt: string;
}

interface InsightData {
  totalMembers: number;
  pendingRequests: number;
  memberGrowthRate: number;
  memberGrowthCount: number;
  topMembers: { role: string; count: number }[];
}

type Tab = "ringkasan" | "pengurus" | "anggota" | "permintaan" | "media" | "pengaturan" | "insight" | "event";

const tabs: { key: Tab; label: string }[] = [
  { key: "ringkasan", label: "Ringkasan" },
  { key: "event", label: "Event" },
  { key: "pengurus", label: "Pengurus" },
  { key: "anggota", label: "Anggota" },
  { key: "permintaan", label: "Permintaan" },
  { key: "media", label: "Media" },
  { key: "pengaturan", label: "Pengaturan" },
  { key: "insight", label: "Insight" },
];

const roleBadge: Record<string, string> = {
  OWNER: "bg-purple-100 text-purple-700",
  ADMIN: "bg-amber-100 text-amber-700",
  EVENT_MANAGER: "bg-blue-100 text-blue-700",
  VOLUNTEER_COORDINATOR: "bg-teal-100 text-teal-700",
  MEMBER: "bg-gray-100 text-gray-600",
};

const statusBadge: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  APPROVED: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-red-100 text-red-700",
};

const statusLabel: Record<string, string> = {
  PENDING: "Menunggu",
  APPROVED: "Disetujui",
  REJECTED: "Ditolak",
};

function formatActivityDetails(details: unknown): string | null {
  if (typeof details === "string") return details;
  if (!details || typeof details !== "object" || Array.isArray(details)) return null;

  const values = Object.values(details as Record<string, unknown>);
  const text = values.find((value): value is string => typeof value === "string" && value.trim().length > 0);
  return text || null;
}

export function CommunityDashboardRoute({
  tab,
  communityIdOverride,
  communitySlug,
}: {
  tab: Tab;
  communityIdOverride?: string;
  communitySlug?: string;
}) {
  const params = useParams();
  const router = useRouter();
  const routeSlug = communitySlug || (params.slug as string | undefined);
  const [resolvedCommunityId, setResolvedCommunityId] = useState(communityIdOverride);
  const communityId = resolvedCommunityId || (routeSlug ? "" : ((params.idkomunitas || params.communityId) as string));
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [insight, setInsight] = useState<InsightData | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    if (!routeSlug || communityIdOverride) return;
    api.get(`/communities/${routeSlug}`).then(({ data }) => {
      const community = data.data || data;
      setResolvedCommunityId(community.id);
    }).catch((err) => {
      setError(err?.response?.status === 404 ? "Komunitas tidak ditemukan" : "Dashboard tidak dapat dimuat");
      setLoading(false);
    });
  }, [routeSlug, communityIdOverride]);

  const [memberSearch, setMemberSearch] = useState("");
  const [memberRoleFilter, setMemberRoleFilter] = useState("");
  const [memberStatusFilter, setMemberStatusFilter] = useState("");
  const [memberPage, setMemberPage] = useState(1);
  const [memberTotalPages, setMemberTotalPages] = useState(1);
  const [officers, setOfficers] = useState<Member[]>([]);
  const [officersLoading, setOfficersLoading] = useState(false);

  const [requestStatusFilter, setRequestStatusFilter] = useState<string>("");
  const [requestPage, setRequestPage] = useState(1);
  const [requestTotalPages, setRequestTotalPages] = useState(1);

  const [settingsForm, setSettingsForm] = useState({
    name: "",
    description: "",
    visibility: "PUBLIC",
    membershipType: "OPEN",
  });
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState("");
  const [settingsError, setSettingsError] = useState("");

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, authLoading, router]);

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await api.get(`/communities/${communityId}/dashboard`);
       const payload = data.data || data;
       const comm = payload.community || payload.communityInfo;
       if (!comm) throw Object.assign(new Error("Dashboard tidak dapat dimuat"), { response: { status: 500 } });
       setDashboard({
         ...payload,
         community: comm,
         pendingRequests: payload.pendingRequests ?? payload.pendingJoinRequestCount ?? 0,
         activeEvents: payload.activeEvents ?? payload.activeEventCount ?? 0,
       });
       setIsOwner(
         comm.status !== undefined &&
           (payload.userRole === "OWNER" || payload.isOwner === true || comm.owner?.id === user?.id)
       );
      setSettingsForm({
        name: comm.name,
        description: comm.description || "",
        visibility: comm.visibility,
        membershipType: comm.membershipType,
      });
    } catch (err: any) {
      if (err?.response?.status === 401) {
        setError("Login diperlukan");
      } else if (err?.response?.status === 403) {
        setError("Anda tidak memiliki akses ke dashboard komunitas ini. Hanya pemilik atau admin yang dapat mengakses.");
      } else if (err?.response?.status === 404) {
        setError("Komunitas tidak ditemukan");
      } else {
        setError("Dashboard tidak dapat dimuat");
      }
    } finally {
      setLoading(false);
    }
  }, [communityId]);

  const fetchMembers = useCallback(async () => {
    try {
      const { data } = await api.get(`/communities/${communityId}/members`, {
        params: { page: memberPage, limit: 10, search: memberSearch, role: memberRoleFilter, status: memberStatusFilter || undefined },
      });
      const items = (data.data || []) as MemberResponseItem[];
      setMembers(items.map((member) => ({
        id: member.id,
        userId: member.user.id,
        name: member.user.name,
        username: member.user.username,
        avatar: member.user.avatar,
        role: member.role,
        status: member.status,
        joinedAt: member.joinedAt,
      })));
      setMemberTotalPages(data.pagination?.totalPages || 1);
    } catch (err: any) {
      setError(err?.response?.status === 403 ? "Anda tidak memiliki akses untuk melihat anggota komunitas ini." : "Anggota komunitas tidak dapat dimuat");
    }
  }, [communityId, memberPage, memberSearch, memberRoleFilter, memberStatusFilter]);

  const fetchOfficers = useCallback(async () => {
    try {
      setOfficersLoading(true);
      const { data } = await api.get(`/communities/${communityId}/members`, {
        params: { status: "ACTIVE", limit: 100, orderBy: "role", sort: "asc" },
      });
      const items = (data.data || []) as MemberResponseItem[];
      setOfficers(items
        .filter((member) => member.role !== "MEMBER")
        .map((member) => ({
          id: member.id,
          userId: member.user.id,
          name: member.user.name,
          username: member.user.username,
          avatar: member.user.avatar,
          role: member.role,
          status: member.status,
          joinedAt: member.joinedAt,
        })));
    } catch {}
    finally {
      setOfficersLoading(false);
    }
  }, [communityId]);

  const fetchJoinRequests = useCallback(async () => {
    try {
      const { data } = await api.get(`/communities/${communityId}/join-requests`, {
        params: { page: requestPage, limit: 10, status: requestStatusFilter || undefined },
      });
      const result = data.data || data;
       const items = result.requests || result.data || [];
       setJoinRequests(items.map((request: any) => ({
         ...request,
         name: request.name || request.user?.name || "Pengguna",
         username: request.username || request.user?.username || "",
         avatar: request.avatar || request.user?.avatar || null,
       })));
       setRequestTotalPages(result.pagination?.totalPages || result.totalPages || 1);
    } catch {}
  }, [communityId, requestPage, requestStatusFilter]);

  const fetchInsight = useCallback(async () => {
    try {
      const { data } = await api.get(`/communities/${communityId}/insight`);
      setInsight(data.data || data);
    } catch {}
  }, [communityId]);

  useEffect(() => {
    if (!authLoading && isAuthenticated && communityId) {
      fetchDashboard();
    }
  }, [authLoading, isAuthenticated, communityId, fetchDashboard]);

  useEffect(() => {
    if (tab === "anggota") fetchMembers();
  }, [tab, fetchMembers]);

  useEffect(() => {
    if (tab === "pengurus") fetchOfficers();
  }, [tab, fetchOfficers]);

  useEffect(() => {
    if (tab === "permintaan") fetchJoinRequests();
  }, [tab, fetchJoinRequests]);

  useEffect(() => {
    if (tab === "insight") fetchInsight();
  }, [tab, fetchInsight]);

  const handleApproveRequest = async (requestId: string) => {
    try {
      await api.put(`/communities/${communityId}/join-requests/${requestId}`, { action: "approve" });
      fetchJoinRequests();
      fetchDashboard();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Gagal menyetujui permintaan.");
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    if (!confirm("Yakin ingin menolak permintaan ini?")) return;
    try {
      await api.put(`/communities/${communityId}/join-requests/${requestId}`, { action: "reject" });
      fetchJoinRequests();
      fetchDashboard();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Gagal menolak permintaan.");
    }
  };

  const handleChangeRole = async (memberId: string, newRole: string) => {
    try {
      await api.put(`/communities/${communityId}/members/${memberId}/role`, { role: newRole });
      fetchMembers();
      if (tab === "pengurus") fetchOfficers();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Gagal mengubah role.");
    }
  };

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    if (!confirm(`Yakin ingin mengeluarkan ${memberName} dari komunitas?`)) return;
    try {
      await api.delete(`/communities/${communityId}/members/${memberId}`);
      fetchMembers();
      if (tab === "pengurus") fetchOfficers();
      fetchDashboard();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Gagal mengeluarkan anggota.");
    }
  };

  const handleRestoreMember = async (memberId: string, memberName: string) => {
    if (!confirm(`Yakin ingin memulihkan ${memberName} ke komunitas?`)) return;
    try {
      await api.post(`/communities/${communityId}/members/${memberId}/restore`);
      fetchMembers();
      fetchDashboard();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Gagal memulihkan anggota.");
    }
  };

  const handleSaveSettings = async () => {
    setSettingsSaving(true);
    setSettingsError("");
    setSettingsSuccess("");
    try {
      await api.put(`/communities/${communityId}`, settingsForm);
      setSettingsSuccess("Pengaturan berhasil disimpan!");
      fetchDashboard();
      setTimeout(() => setSettingsSuccess(""), 3000);
    } catch (err: any) {
      setSettingsError(err?.response?.data?.message || "Gagal menyimpan pengaturan.");
    } finally {
      setSettingsSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="h-8 w-8 border-4 border-komuna-blue border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-komuna-navy mb-2">Akses Ditolak</h2>
            <p className="text-gray-500 text-sm mb-6">{error}</p>
            <Link
              href="/communities"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-komuna-blue text-white rounded-lg font-medium hover:bg-komuna-navy transition-colors text-sm"
            >
              Kembali ke Direktori
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!dashboard) return null;

  const { community, pendingRequests, activeEvents, recentActivity } = dashboard;
  const canonicalTabPath: Record<Tab, string> = {
    ringkasan: "overview",
    event: "events",
    pengurus: "pengurus",
    anggota: "members",
    permintaan: "requests",
    pengaturan: "settings",
    media: "media",
    insight: "insights",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <aside className="hidden lg:block w-64 border-r bg-white min-h-[calc(100vh-4rem)] sticky top-16">
          <nav className="p-4 space-y-1">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Kembali ke Dashboard
            </Link>

            <div className="pt-2 pb-1 px-3">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Komunitas</p>
            </div>

            {tabs.map((navTab) => (
              <Link
                key={navTab.key}
                href={`/dashboard/communities/${communityId}/${canonicalTabPath[navTab.key]}`}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
                  navTab.key === tab
                    ? "bg-komuna-blue/10 text-komuna-blue"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                {navTab.key === "ringkasan" && (
                  <svg className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                )}
                {navTab.key === "event" && (
                  <svg className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                )}
                {navTab.key === "anggota" && (
                  <svg className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                )}
                {navTab.key === "pengurus" && (
                  <svg className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                )}
                {navTab.key === "permintaan" && (
                  <div className="relative flex-shrink-0">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    {pendingRequests > 0 && (
                      <span className="absolute -top-1 -right-1 h-3.5 w-3.5 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                        {pendingRequests > 9 ? "9+" : pendingRequests}
                      </span>
                    )}
                  </div>
                )}
                {navTab.key === "media" && (
                  <svg className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                )}
                {navTab.key === "pengaturan" && (
                  <svg className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
                {navTab.key === "insight" && (
                  <svg className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                )}
                {navTab.label}
              </Link>
            ))}
          </nav>
        </aside>

        <main className="flex-1 min-h-[calc(100vh-4rem)]">
          <div className="max-w-5xl mx-auto px-4 py-6">
            <div className="mb-6">
              <Link
                href={`/communities/${community.slug}`}
                className="text-sm text-komuna-blue hover:underline flex items-center gap-1"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                {community.name}
              </Link>
              <h1 className="text-2xl font-bold text-komuna-navy mt-1">
                Dashboard Komunitas
              </h1>
            </div>

            <div className="flex lg:hidden overflow-x-auto gap-1 mb-6 border-b border-gray-200 pb-px">
              {tabs.map((navTab) => (
                <Link
                  key={navTab.key}
                  href={`/dashboard/communities/${communityId}/${canonicalTabPath[navTab.key]}`}
                  className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                    navTab.key === tab
                      ? "border-komuna-blue text-komuna-blue"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {navTab.label}
                </Link>
              ))}
            </div>

            {tab === "ringkasan" && (
              <RingkasanTab
                community={community}
                pendingRequests={pendingRequests}
                activeEvents={activeEvents}
                recentActivity={recentActivity}
              />
            )}

            {tab === "event" && (
              <CommunityEventTab communityId={communityId} communityName={community.name} />
            )}

            {tab === "anggota" && (
              <AnggotaTab
                members={members}
                memberSearch={memberSearch}
                setMemberSearch={setMemberSearch}
                memberRoleFilter={memberRoleFilter}
                setMemberRoleFilter={setMemberRoleFilter}
                memberStatusFilter={memberStatusFilter}
                setMemberStatusFilter={setMemberStatusFilter}
                memberPage={memberPage}
                setMemberPage={setMemberPage}
                memberTotalPages={memberTotalPages}
                isOwner={isOwner}
                currentUserId={user?.id}
                onChangeRole={handleChangeRole}
                onRemoveMember={handleRemoveMember}
                onRestoreMember={handleRestoreMember}
              />
            )}

            {tab === "pengurus" && (
              <PengurusTab
                officers={officers}
                loading={officersLoading}
                isOwner={isOwner}
                currentUserId={user?.id}
                onChangeRole={handleChangeRole}
                onRemoveMember={handleRemoveMember}
              />
            )}

            {tab === "permintaan" && (
              <PermintaanTab
                requests={joinRequests}
                requestStatusFilter={requestStatusFilter}
                setRequestStatusFilter={setRequestStatusFilter}
                requestPage={requestPage}
                setRequestPage={setRequestPage}
                requestTotalPages={requestTotalPages}
                onApprove={handleApproveRequest}
                onReject={handleRejectRequest}
              />
            )}

            {tab === "media" && (
              <MediaTab communityId={communityId} isOwner={isOwner} />
            )}

            {tab === "pengaturan" && (
              <PengaturanTab
                form={settingsForm}
                setForm={setSettingsForm}
                onSave={handleSaveSettings}
                saving={settingsSaving}
                success={settingsSuccess}
                error={settingsError}
                isOwner={isOwner}
              />
            )}

            {tab === "insight" && (
              <InsightTab insight={insight} communityName={community.name} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

function RingkasanTab({
  community,
  pendingRequests,
  activeEvents,
  recentActivity,
}: {
  community: DashboardData["community"];
  pendingRequests: number;
  activeEvents: number;
  recentActivity: ActivityItem[];
}) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-komuna-blue/10 flex items-center justify-center">
              <svg className="h-5 w-5 text-komuna-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-komuna-navy">{community.memberCount}</p>
              <p className="text-xs text-gray-500">Total Anggota</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <svg className="h-5 w-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-komuna-navy">{pendingRequests}</p>
              <p className="text-xs text-gray-500">Permintaan Pending</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center">
              <svg className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-komuna-navy">{activeEvents}</p>
              <p className="text-xs text-gray-500">Event Aktif</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <svg className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-lg font-bold text-komuna-navy">
                {community.status === "ACTIVE" ? "Aktif" : community.status === "INACTIVE" ? "Nonaktif" : community.status}
              </p>
              <p className="text-xs text-gray-500">Status Komunitas</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-komuna-navy mb-4">Informasi Komunitas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Nama</span>
            <p className="font-medium text-komuna-navy">{community.name}</p>
          </div>
          <div>
            <span className="text-gray-500">Visibilitas</span>
            <p className="font-medium text-komuna-navy">{community.visibility === "PUBLIC" ? "Publik" : "Privat"}</p>
          </div>
          <div>
            <span className="text-gray-500">Tipe Keanggotaan</span>
            <p className="font-medium text-komuna-navy">{community.membershipType === "OPEN" ? "Terbuka" : "Terbatas"}</p>
          </div>
          <div>
            <span className="text-gray-500">Dibuat</span>
            <p className="font-medium text-komuna-navy">
              {new Date(community.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-komuna-navy mb-4">Aktivitas Terbaru</h3>
        {recentActivity.length === 0 ? (
          <p className="text-gray-400 text-sm">Belum ada aktivitas.</p>
        ) : (
          <div className="space-y-3">
            {recentActivity.map((activity) => {
              const details = formatActivityDetails(activity.details);
              return (
              <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                {activity.userAvatar ? (
                  <img src={activity.userAvatar} alt="" className="h-8 w-8 rounded-full object-cover flex-shrink-0" />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-komuna-blue/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-komuna-blue text-xs font-bold">{activity.userName?.[0]}</span>
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-gray-700">
                    <span className="font-medium text-komuna-navy">{activity.userName}</span>{" "}
                    {activity.action}
                  </p>
                  {details && <p className="text-xs text-gray-400 mt-0.5">{details}</p>}
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(activity.createdAt).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}
                  </p>
                </div>
              </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function AnggotaTab({
  members,
  memberSearch,
  setMemberSearch,
  memberRoleFilter,
  setMemberRoleFilter,
  memberStatusFilter,
  setMemberStatusFilter,
  memberPage,
  setMemberPage,
  memberTotalPages,
  isOwner,
  currentUserId,
  onChangeRole,
  onRemoveMember,
  onRestoreMember,
}: {
  members: Member[];
  memberSearch: string;
  setMemberSearch: (v: string) => void;
  memberRoleFilter: string;
  setMemberRoleFilter: (v: string) => void;
  memberStatusFilter: string;
  setMemberStatusFilter: (v: string) => void;
  memberPage: number;
  setMemberPage: (v: number) => void;
  memberTotalPages: number;
  isOwner: boolean;
  currentUserId?: string;
  onChangeRole: (memberId: string, role: string) => void;
  onRemoveMember: (memberId: string, name: string) => void;
  onRestoreMember: (memberId: string, name: string) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex gap-1 border-b border-gray-200 pb-px">
        {[{ value: "", label: "Anggota Aktif" }, { value: "BANNED", label: "Diblokir" }].map((f) => (
          <button
            key={f.value}
            onClick={() => { setMemberStatusFilter(f.value); setMemberPage(1); }}
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${memberStatusFilter === f.value ? "border-komuna-blue text-komuna-blue" : "border-transparent text-gray-500 hover:text-gray-700"}`}
          >
            {f.label}
          </button>
        ))}
      </div>
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={memberSearch}
              onChange={(e) => { setMemberSearch(e.target.value); setMemberPage(1); }}
              placeholder="Cari anggota..."
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue outline-none"
            />
          </div>
          <select
            value={memberRoleFilter}
            onChange={(e) => { setMemberRoleFilter(e.target.value); setMemberPage(1); }}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue outline-none"
          >
            <option value="">Semua Role</option>
            <option value="OWNER">Owner</option>
            <option value="ADMIN">Admin</option>
            <option value="EVENT_MANAGER">Event Manager</option>
            <option value="VOLUNTEER_COORDINATOR">Volunteer Coordinator</option>
            <option value="MEMBER">Member</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm divide-y divide-gray-100">
        {members.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">{memberStatusFilter === "BANNED" ? "Tidak ada anggota yang diblokir." : "Tidak ada anggota ditemukan."}</div>
        ) : (
          members.map((member) => (
            <div key={member.id} className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors">
              {member.avatar ? (
                <img src={member.avatar} alt="" className="h-10 w-10 rounded-full object-cover flex-shrink-0" />
              ) : (
                <div className="h-10 w-10 rounded-full bg-komuna-blue flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-sm">{member.name?.[0]}</span>
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="font-medium text-komuna-navy truncate">{member.name}</p>
                <p className="text-xs text-gray-400">@{member.username}</p>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${member.status === "BANNED" ? "bg-red-100 text-red-600" : roleBadge[member.role] || ""}`}>
                {member.status === "BANNED" ? "Diblokir" : member.role}
              </span>
              {member.userId !== currentUserId && member.status !== "BANNED" && (
                <div className="flex items-center gap-2 flex-shrink-0">
                  {isOwner && (
                    <select
                      value={member.role}
                      onChange={(e) => onChangeRole(member.id, e.target.value)}
                      className="px-2 py-1 border border-gray-200 rounded text-xs bg-white focus:ring-1 focus:ring-komuna-blue outline-none"
                    >
                      <option value="MEMBER">Member</option>
                      <option value="ADMIN">Admin</option>
                      <option value="EVENT_MANAGER">Manajer Event</option>
                      <option value="VOLUNTEER_COORDINATOR">Koordinator Volunteer</option>
                    </select>
                  )}
                  {member.role !== "OWNER" && (
                    <button
                      onClick={() => onRemoveMember(member.id, member.name)}
                      className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Keluarkan anggota"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM21 12h-6" />
                      </svg>
                    </button>
                  )}
                </div>
              )}
              {member.userId !== currentUserId && member.status === "BANNED" && (
                <button
                  onClick={() => onRestoreMember(member.id, member.name)}
                  className="px-3 py-1.5 text-xs font-medium text-white bg-emerald-500 rounded-lg hover:bg-emerald-600 transition-colors flex-shrink-0"
                >
                  Pulihkan
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {memberTotalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setMemberPage(Math.max(1, memberPage - 1))}
            disabled={memberPage <= 1}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
          >
            Sebelumnya
          </button>
          <span className="text-sm text-gray-500">
            {memberPage} / {memberTotalPages}
          </span>
          <button
            onClick={() => setMemberPage(Math.min(memberTotalPages, memberPage + 1))}
            disabled={memberPage >= memberTotalPages}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
          >
            Berikutnya
          </button>
        </div>
      )}
    </div>
  );
}

function PengurusTab({
  officers,
  loading,
  isOwner,
  currentUserId,
  onChangeRole,
  onRemoveMember,
}: {
  officers: Member[];
  loading: boolean;
  isOwner: boolean;
  currentUserId?: string;
  onChangeRole: (memberId: string, role: string) => void;
  onRemoveMember: (memberId: string, name: string) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm p-4">
        <p className="text-sm text-gray-500">
          Pengurus komunitas adalah anggota dengan peran pengelolaan: Owner, Admin, Pengelola Event, dan Koordinator Volunteer.
          Perubahan peran hanya dapat dilakukan oleh Owner.
        </p>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <div className="h-8 w-8 border-4 border-komuna-blue border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : officers.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-400 text-sm">
          Belum ada pengurus selain owner. Gunakan tab Anggota untuk menetapkan peran.
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm divide-y divide-gray-100">
          {officers.map((member) => (
            <div key={member.id} className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors">
              {member.avatar ? (
                <img src={member.avatar} alt="" className="h-10 w-10 rounded-full object-cover flex-shrink-0" />
              ) : (
                <div className="h-10 w-10 rounded-full bg-komuna-blue flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-sm">{member.name?.[0]}</span>
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="font-medium text-komuna-navy truncate">{member.name}</p>
                <p className="text-xs text-gray-400">@{member.username}</p>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${roleBadge[member.role] || ""}`}>
                {member.role}
              </span>
              {member.userId !== currentUserId && (
                <div className="flex items-center gap-2 flex-shrink-0">
                  {isOwner && member.role !== "OWNER" && (
                    <select
                      value={member.role}
                      onChange={(e) => onChangeRole(member.id, e.target.value)}
                      className="px-2 py-1 border border-gray-200 rounded text-xs bg-white focus:ring-1 focus:ring-komuna-blue outline-none"
                    >
                      <option value="MEMBER">Member</option>
                      <option value="ADMIN">Admin</option>
                      <option value="EVENT_MANAGER">Manajer Event</option>
                      <option value="VOLUNTEER_COORDINATOR">Koordinator Volunteer</option>
                    </select>
                  )}
                  {member.role !== "OWNER" && (
                    <button
                      onClick={() => onRemoveMember(member.id, member.name)}
                      className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Keluarkan pengurus"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM21 12h-6" />
                      </svg>
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PermintaanTab({
  requests,
  requestStatusFilter,
  setRequestStatusFilter,
  requestPage,
  setRequestPage,
  requestTotalPages,
  onApprove,
  onReject,
}: {
  requests: JoinRequest[];
  requestStatusFilter: string;
  setRequestStatusFilter: (v: string) => void;
  requestPage: number;
  setRequestPage: (v: number) => void;
  requestTotalPages: number;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex overflow-x-auto gap-1 border-b border-gray-200 pb-px">
        {[
          { value: "", label: "Semua" },
          { value: "PENDING", label: "Menunggu" },
          { value: "APPROVED", label: "Disetujui" },
          { value: "REJECTED", label: "Ditolak" },
        ].map((filter) => (
          <button
            key={filter.value}
            onClick={() => { setRequestStatusFilter(filter.value); setRequestPage(1); }}
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              requestStatusFilter === filter.value
                ? "border-komuna-blue text-komuna-blue"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {requests.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-400 text-sm">
            Tidak ada permintaan.
          </div>
        ) : (
          requests.map((req) => (
            <div key={req.id} className="bg-white rounded-xl shadow-sm p-5">
              <div className="flex items-start gap-4">
                {req.avatar ? (
                  <img src={req.avatar} alt="" className="h-12 w-12 rounded-full object-cover flex-shrink-0" />
                ) : (
                  <div className="h-12 w-12 rounded-full bg-komuna-blue flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold">{req.name?.[0]}</span>
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-komuna-navy">{req.name}</p>
                    <span className="text-xs text-gray-400">@{req.username}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge[req.status] || ""}`}>
                      {statusLabel[req.status] || req.status}
                    </span>
                  </div>
                  {req.message && (
                    <p className="text-sm text-gray-600 mt-1 bg-gray-50 rounded-lg p-3">{req.message}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(req.createdAt).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}
                  </p>
                </div>
                {req.status === "PENDING" && (
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => onApprove(req.id)}
                      className="px-3 py-1.5 bg-emerald-500 text-white text-sm font-medium rounded-lg hover:bg-emerald-600 transition-colors"
                    >
                      Setuju
                    </button>
                    <button
                      onClick={() => onReject(req.id)}
                      className="px-3 py-1.5 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-colors"
                    >
                      Tolak
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {requestTotalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setRequestPage(Math.max(1, requestPage - 1))}
            disabled={requestPage <= 1}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
          >
            Sebelumnya
          </button>
          <span className="text-sm text-gray-500">
            {requestPage} / {requestTotalPages}
          </span>
          <button
            onClick={() => setRequestPage(Math.min(requestTotalPages, requestPage + 1))}
            disabled={requestPage >= requestTotalPages}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
          >
            Berikutnya
          </button>
        </div>
      )}
    </div>
  );
}

function PengaturanTab({
  form,
  setForm,
  onSave,
  saving,
  success,
  error,
  isOwner,
}: {
  form: { name: string; description: string; visibility: string; membershipType: string };
  setForm: (v: typeof form) => void;
  onSave: () => void;
  saving: boolean;
  success: string;
  error: string;
  isOwner: boolean;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold text-komuna-navy mb-6">Pengaturan Komunitas</h3>

      {success && (
        <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm p-3 rounded-lg flex items-center gap-2">
          <svg className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {success}
        </div>
      )}

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-lg flex items-center gap-2">
          <svg className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          {error}
        </div>
      )}

      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nama Komunitas</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            disabled={!isOwner}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue outline-none disabled:bg-gray-50 disabled:text-gray-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            disabled={!isOwner}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue outline-none resize-none disabled:bg-gray-50 disabled:text-gray-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Visibilitas</label>
            <select
              value={form.visibility}
              onChange={(e) => setForm({ ...form, visibility: e.target.value })}
              disabled={!isOwner}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue outline-none disabled:bg-gray-50"
            >
              <option value="PUBLIC">Publik</option>
              <option value="PRIVATE">Privat</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipe Keanggotaan</label>
            <select
              value={form.membershipType}
              onChange={(e) => setForm({ ...form, membershipType: e.target.value })}
              disabled={!isOwner}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue outline-none disabled:bg-gray-50"
            >
              <option value="OPEN">Terbuka</option>
              <option value="RESTRICTED">Terbatas</option>
            </select>
          </div>
        </div>

        {isOwner && (
          <div className="flex justify-end pt-2">
            <button
              onClick={onSave}
              disabled={saving}
              className="px-5 py-2 bg-komuna-blue text-white text-sm font-medium rounded-lg hover:bg-komuna-navy disabled:opacity-50 transition-colors inline-flex items-center gap-2"
            >
              {saving && <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              {saving ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        )}

        {!isOwner && (
          <p className="text-xs text-gray-400 text-right pt-2">Hanya pemilik yang dapat mengubah pengaturan ini.</p>
        )}
      </div>
    </div>
  );
}

function InsightTab({ insight, communityName }: { insight: InsightData | null; communityName: string }) {
  if (!insight) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-400 text-sm">
        Memuat data insight...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-5">
          <p className="text-sm text-gray-500 mb-1">Total Anggota</p>
          <p className="text-3xl font-bold text-komuna-navy">{insight.totalMembers}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5">
          <p className="text-sm text-gray-500 mb-1">Permintaan Pending</p>
          <p className="text-3xl font-bold text-komuna-navy">{insight.pendingRequests}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5">
          <p className="text-sm text-gray-500 mb-1">Pertumbuhan Anggota</p>
          <div className="flex items-end gap-2">
            <p className="text-3xl font-bold text-komuna-navy">{insight.memberGrowthRate}%</p>
            <p className="text-sm text-gray-400 pb-1">
              {insight.memberGrowthCount >= 0 ? "+" : ""}{insight.memberGrowthCount} bulan ini
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-komuna-navy mb-4">Distribusi Role Anggota</h3>
        {insight.topMembers.length === 0 ? (
          <p className="text-gray-400 text-sm">Belum ada data.</p>
        ) : (
          <div className="space-y-3">
            {insight.topMembers.map((item) => {
              const percentage = insight.totalMembers > 0 ? Math.round((item.count / insight.totalMembers) * 100) : 0;
              return (
                <div key={item.role}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${roleBadge[item.role] || "bg-gray-100 text-gray-600"}`}>
                        {item.role}
                      </span>
                      <span className="text-sm text-gray-500">{item.count} anggota</span>
                    </div>
                    <span className="text-sm font-medium text-komuna-navy">{percentage}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-komuna-blue rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-komuna-navy mb-4">Ringkasan {communityName}</h3>
        <div className="grid grid-cols-2 gap-6 text-sm">
          <div>
            <p className="text-gray-500">Total Anggota</p>
            <p className="text-xl font-bold text-komuna-navy">{insight.totalMembers}</p>
          </div>
          <div>
            <p className="text-gray-500">Permintaan Menunggu</p>
            <p className="text-xl font-bold text-komuna-navy">{insight.pendingRequests}</p>
          </div>
          <div>
            <p className="text-gray-500">Tingkat Pertumbuhan</p>
            <p className="text-xl font-bold text-komuna-navy">{insight.memberGrowthRate}%</p>
          </div>
          <div>
            <p className="text-gray-500">Jumlah Role</p>
            <p className="text-xl font-bold text-komuna-navy">{insight.topMembers.length}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

interface MediaItem {
  id: string;
  title: string;
  content: string;
  type: "ANNOUNCEMENT" | "NEWS" | "GALLERY" | "FORUM_POST";
  imageUrl: string | null;
  isPublished: boolean;
  publishedAt: string | null;
  createdBy: { id: string; name: string; avatar: string | null };
  createdAt: string;
  updatedAt: string;
}

const MEDIA_TYPE_META: Record<string, { label: string; badge: string }> = {
  ANNOUNCEMENT: { label: "Pengumuman", badge: "bg-blue-100 text-blue-700" },
  NEWS: { label: "Berita", badge: "bg-emerald-100 text-emerald-700" },
  GALLERY: { label: "Galeri", badge: "bg-purple-100 text-purple-700" },
  FORUM_POST: { label: "Diskusi", badge: "bg-amber-100 text-amber-700" },
};

function MediaTab({ communityId, isOwner }: { communityId: string; isOwner: boolean }) {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({ title: "", content: "", type: "ANNOUNCEMENT" as "ANNOUNCEMENT" | "NEWS" | "GALLERY", isPublished: false, imageUrl: "" });
  const [creating, setCreating] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ title: "", content: "", type: "ANNOUNCEMENT" as MediaItem["type"], isPublished: false, imageUrl: "" });

  const fetchMedia = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { limit: "50" };
      if (typeFilter) params.type = typeFilter;
      const { data } = await api.get(`/communities/${communityId}/media`, { params });
      setMedia(data.data || []);
    } catch {}
    finally { setLoading(false); }
  }, [communityId, typeFilter]);

  useEffect(() => { fetchMedia(); }, [fetchMedia]);

  const handleCreate = async () => {
    if (!createForm.title.trim() || !createForm.content.trim()) return;
    setCreating(true);
    try {
      await api.post(`/communities/${communityId}/media`, { ...createForm, imageUrl: createForm.imageUrl.trim() || undefined });
      setShowCreateModal(false);
      setCreateForm({ title: "", content: "", type: "ANNOUNCEMENT", isPublished: false, imageUrl: "" });
      fetchMedia();
    } catch (err: any) { alert(err?.response?.data?.message || "Gagal membuat media."); }
    finally { setCreating(false); }
  };

  const handleUpdate = async () => {
    if (!editId || !editForm.title.trim() || !editForm.content.trim()) return;
    setCreating(true);
    try {
      await api.put(`/communities/${communityId}/media/${editId}`, { ...editForm, imageUrl: editForm.imageUrl.trim() || undefined });
      setEditId(null);
      fetchMedia();
    } catch (err: any) { alert(err?.response?.data?.message || "Gagal mengupdate media."); }
    finally { setCreating(false); }
  };

  const handleDelete = async (mediaId: string) => {
    if (!confirm("Yakin ingin menghapus media ini?")) return;
    try {
      await api.delete(`/communities/${communityId}/media/${mediaId}`);
      fetchMedia();
    } catch (err: any) { alert(err?.response?.data?.message || "Gagal menghapus media."); }
  };

  const handlePublishToggle = async (item: MediaItem) => {
    try {
      await api.put(`/communities/${communityId}/media/${item.id}`, { isPublished: !item.isPublished });
      fetchMedia();
    } catch (err: any) { alert(err?.response?.data?.message || "Gagal mengubah status publish."); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex overflow-x-auto gap-1 border-b border-gray-200 pb-px flex-1">
          {[{ value: "", label: "Semua" }, { value: "ANNOUNCEMENT", label: "Pengumuman" }, { value: "NEWS", label: "Berita" }, { value: "GALLERY", label: "Galeri" }, { value: "FORUM_POST", label: "Diskusi" }].map((f) => (
            <button key={f.value} onClick={() => setTypeFilter(f.value)} className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${typeFilter === f.value ? "border-komuna-blue text-komuna-blue" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
              {f.label}
            </button>
          ))}
        </div>
        {isOwner && (
          <button onClick={() => setShowCreateModal(true)} className="px-4 py-2 bg-komuna-blue text-white text-sm font-medium rounded-lg hover:bg-komuna-navy transition-colors flex items-center gap-2 flex-shrink-0">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Buat Media
          </button>
        )}
      </div>

      {loading ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center"><div className="h-8 w-8 border-4 border-komuna-blue border-t-transparent rounded-full animate-spin mx-auto" /></div>
      ) : media.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-400 text-sm">
          Belum ada media. {isOwner && "Buat pengumuman, berita, atau galeri baru."}
        </div>
      ) : (
        <div className="space-y-3">
          {media.map((item) => {
            const meta = MEDIA_TYPE_META[item.type] || { label: item.type, badge: "bg-gray-100 text-gray-600" };
            return (
            <div key={item.id} className="bg-white rounded-xl shadow-sm p-5">
              <div className="flex items-start gap-3">
                {item.imageUrl && <img src={item.imageUrl} alt="" className="h-12 w-12 rounded-lg object-cover flex-shrink-0" />}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-medium text-komuna-navy">{item.title}</h4>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${meta.badge}`}>
                      {meta.label}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${item.isPublished ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {item.isPublished ? "Dipublikasikan" : "Draft"}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">{item.content}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    Oleh {item.createdBy.name} · {new Date(item.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                </div>
                {isOwner && (
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button onClick={() => handlePublishToggle(item)} className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${item.isPublished ? "text-amber-600 hover:bg-amber-50" : "text-green-600 hover:bg-green-50"}`}>
                      {item.isPublished ? "Unpublish" : "Publish"}
                    </button>
                    <button onClick={() => { setEditId(item.id); setEditForm({ title: item.title, content: item.content, type: item.type, isPublished: item.isPublished, imageUrl: item.imageUrl || "" }); }} className="p-1.5 text-gray-400 hover:text-komuna-blue hover:bg-komuna-blue/5 rounded transition-colors">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </button>
                    <button onClick={() => handleDelete(item.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                )}
              </div>
            </div>
            );
          })}
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowCreateModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 p-6">
            <button onClick={() => setShowCreateModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
            <h3 className="text-lg font-semibold text-komuna-navy mb-4">Buat Media Baru</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipe</label>
                <select value={createForm.type} onChange={(e) => setCreateForm({ ...createForm, type: e.target.value as "ANNOUNCEMENT" | "NEWS" | "GALLERY" })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-komuna-blue outline-none">
                  <option value="ANNOUNCEMENT">Pengumuman</option>
                  <option value="NEWS">Berita</option>
                  <option value="GALLERY">Galeri</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Judul</label>
                <input type="text" value={createForm.title} onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-komuna-blue outline-none" placeholder="Judul pengumuman..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Konten</label>
                <textarea value={createForm.content} onChange={(e) => setCreateForm({ ...createForm, content: e.target.value })} rows={6} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-komuna-blue outline-none resize-none" placeholder="Tulis konten..." />
              </div>
              {createForm.type === "GALLERY" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">URL Gambar</label>
                  <input type="url" value={createForm.imageUrl} onChange={(e) => setCreateForm({ ...createForm, imageUrl: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-komuna-blue outline-none" placeholder="https://..." />
                </div>
              )}
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" checked={createForm.isPublished} onChange={(e) => setCreateForm({ ...createForm, isPublished: e.target.checked })} className="rounded text-komuna-blue focus:ring-komuna-blue" />
                Langsung publikasikan
              </label>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">Batal</button>
              <button onClick={handleCreate} disabled={creating || !createForm.title.trim() || !createForm.content.trim()} className="px-4 py-2 text-sm font-medium text-white bg-komuna-blue rounded-lg hover:bg-komuna-navy disabled:opacity-50 transition-colors">{creating ? "Membuat..." : "Buat"}</button>
            </div>
          </div>
        </div>
      )}

      {editId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setEditId(null)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 p-6">
            <button onClick={() => setEditId(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
            <h3 className="text-lg font-semibold text-komuna-navy mb-4">Edit Media</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipe</label>
                <select value={editForm.type} onChange={(e) => setEditForm({ ...editForm, type: e.target.value as MediaItem["type"] })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-komuna-blue outline-none">
                  <option value="ANNOUNCEMENT">Pengumuman</option>
                  <option value="NEWS">Berita</option>
                  <option value="GALLERY">Galeri</option>
                  <option value="FORUM_POST">Diskusi</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Judul</label>
                <input type="text" value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-komuna-blue outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Konten</label>
                <textarea value={editForm.content} onChange={(e) => setEditForm({ ...editForm, content: e.target.value })} rows={6} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-komuna-blue outline-none resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL Gambar</label>
                <input type="url" value={editForm.imageUrl} onChange={(e) => setEditForm({ ...editForm, imageUrl: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-komuna-blue outline-none" placeholder="https://..." />
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" checked={editForm.isPublished} onChange={(e) => setEditForm({ ...editForm, isPublished: e.target.checked })} className="rounded text-komuna-blue focus:ring-komuna-blue" />
                Dipublikasikan
              </label>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setEditId(null)} className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">Batal</button>
              <button onClick={handleUpdate} disabled={creating || !editForm.title.trim() || !editForm.content.trim()} className="px-4 py-2 text-sm font-medium text-white bg-komuna-blue rounded-lg hover:bg-komuna-navy disabled:opacity-50 transition-colors">{creating ? "Menyimpan..." : "Simpan"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
