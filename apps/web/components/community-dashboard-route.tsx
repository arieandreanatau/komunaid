"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import api, { apiGet, apiGetPaginated } from "@/lib/api";
import { useAuth } from "@/components/auth-provider";
import { CommunityEventTab } from "@/components/community-event-tab";
import { ProfilKomunitasTab } from "@/components/community/profil-komunitas-tab";
import { RingkasanTab } from "@/components/community/ringkasan-tab";
import { AnggotaTab } from "@/components/community/anggota-tab";
import { PengurusTab } from "@/components/community/pengurus-tab";
import { PermintaanTab } from "@/components/community/permintaan-tab";
import { PengaturanTab } from "@/components/community/pengaturan-tab";
import { InsightTab } from "@/components/community/insight-tab";
import { MediaTab } from "@/components/community/media-tab";
import { runMutation } from "@/components/community/mutation-helper";
import { isCommunityRole, type CommunityRole } from "@komunaid/shared";
import type {
  DashboardData,
  Member,
  MemberResponseItem,
  JoinRequest,
  InsightData,
  CommunitySettingsToggles,
  Tab,
} from "@/components/community/types";
import { tabs } from "@/components/community/types";

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
  const routeValue = communitySlug || (params.slug as string | undefined) || (params.communityId as string | undefined) || (params.idkomunitas as string | undefined);
  const routeSlug = communitySlug || (params.slug as string | undefined) || (params.communityId as string | undefined);
  const [resolvedCommunityId, setResolvedCommunityId] = useState(communityIdOverride);
  const communityId = resolvedCommunityId || (routeValue?.startsWith("cmt") ? routeValue : "");
  const communityPath = routeValue || communityId;
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [insight, setInsight] = useState<InsightData | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // The viewer's real community role, straight from GET .../dashboard's
  // `userRole` field (apps/api/src/routes/communities.ts). Every tab-level
  // gate below is derived from this through can() in
  // packages/shared/src/permissions.ts -- never from an ownership boolean
  // and never from a local role comparison.
  const [role, setRole] = useState<CommunityRole | null>(null);

  useEffect(() => {
    if (!routeSlug || communityIdOverride || routeSlug.startsWith("cmt")) return;
    apiGet<any>(`/communities/${routeSlug}`).then((community) => {
      setResolvedCommunityId(community.id);
      setSettingsForm((prev) => ({
        ...prev,
        address: community.address || prev.address,
        province: community.province || prev.province,
        city: community.city || prev.city,
        district: community.district || prev.district,
        village: community.village || prev.village,
        postalCode: community.postalCode || prev.postalCode,
        address2: community.address2 || "",
        country: community.country || "",
        website: community.website || prev.website,
        banner: community.banner || community.coverImage || prev.banner,
        logo: community.logo || prev.logo,
        categoryIds: (community.categories || []).map((cat: { id: string }) => cat.id),
        tagsInput: (community.tags || []).join(", "),
      }));
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
    address: "",
    province: "",
    city: "",
    district: "",
    village: "",
    postalCode: "",
    address2: "",
    country: "",
    website: "",
    banner: "",
    logo: "",
    categoryIds: [] as string[],
    tagsInput: "",
  });
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState("");
  const [settingsError, setSettingsError] = useState("");
  const [categories, setCategories] = useState<{ id: string; name: string; icon: string }[]>([]);

  const [communitySettingsForm, setCommunitySettingsForm] = useState({
    allowMemberPost: true,
    requireApproval: false,
    showMemberList: true,
    showEventList: true,
  });
  const [communitySettingsLoading, setCommunitySettingsLoading] = useState(false);
  const [communitySettingsSaving, setCommunitySettingsSaving] = useState(false);
  const [communitySettingsSuccess, setCommunitySettingsSuccess] = useState("");
  const [communitySettingsError, setCommunitySettingsError] = useState("");

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, authLoading, router]);

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const payload = await apiGet<any>(`/communities/${communityId}/dashboard`);
       const comm = payload.community || payload.communityInfo;
       if (!comm) throw Object.assign(new Error("Dashboard tidak dapat dimuat"), { response: { status: 500 } });
       setDashboard({
         ...payload,
         community: comm,
         pendingRequests: payload.pendingRequests ?? payload.pendingJoinRequestCount ?? 0,
         activeEvents: payload.activeEvents ?? payload.activeEventCount ?? 0,
       });
       // Prefer the server-issued role. Fall back to the legacy
       // ownership-boolean/owner-id inference only for a payload that
       // predates the `userRole` field, so an old cached response never
       // hard-fails the dashboard.
       const resolvedRole: CommunityRole | null = isCommunityRole(payload.userRole)
         ? payload.userRole
         : payload.isOwner === true || comm.owner?.id === user?.id
           ? "OWNER"
           : null;
       setRole(comm.status !== undefined ? resolvedRole : null);
      setSettingsForm((prev) => ({
        ...prev,
        name: comm.name,
        description: comm.description || "",
        visibility: comm.visibility,
        membershipType: comm.membershipType,
        address: prev.address || comm.address || comm.address1 || "",
        province: prev.province || comm.province || "",
        city: prev.city || comm.city || "",
        district: prev.district || comm.district || "",
        village: prev.village || comm.village || "",
        postalCode: prev.postalCode || comm.postalCode || "",
        website: prev.website || comm.website || "",
        banner: prev.banner || comm.banner || "",
        logo: prev.logo || comm.logo || "",
        tagsInput: prev.tagsInput || (comm.tags || []).join(", "),
      }));
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
      const result = await apiGetPaginated<MemberResponseItem>(`/communities/${communityId}/members`, {
        params: { page: memberPage, limit: 10, search: memberSearch, role: memberRoleFilter, status: memberStatusFilter || undefined },
      });
      setMembers(result.data.map((member) => ({
        id: member.id,
        userId: member.user.id,
        name: member.user.name,
        username: member.user.username,
        avatar: member.user.avatar,
        role: member.role,
        status: member.status,
        joinedAt: member.joinedAt,
      })));
      setMemberTotalPages(result.pagination.totalPages || 1);
    } catch (err: any) {
      setError(err?.response?.status === 403 ? "Anda tidak memiliki akses untuk melihat anggota komunitas ini." : "Anggota komunitas tidak dapat dimuat");
    }
  }, [communityId, memberPage, memberSearch, memberRoleFilter, memberStatusFilter]);

  const fetchOfficers = useCallback(async () => {
    try {
      setOfficersLoading(true);
      const result = await apiGetPaginated<MemberResponseItem>(`/communities/${communityId}/members`, {
        params: { status: "ACTIVE", limit: 100, orderBy: "role", sort: "asc" },
      });
      setOfficers(result.data
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
      const result = await apiGetPaginated<any>(`/communities/${communityId}/join-requests`, {
        params: { page: requestPage, limit: 10, status: requestStatusFilter || undefined },
      });
      setJoinRequests(result.data.map((request: any) => ({
        ...request,
        name: request.name || request.user?.name || "Pengguna",
        username: request.username || request.user?.username || "",
        avatar: request.avatar || request.user?.avatar || null,
      })));
      setRequestTotalPages(result.pagination.totalPages || 1);
    } catch {}
  }, [communityId, requestPage, requestStatusFilter]);

  const fetchInsight = useCallback(async () => {
    try {
      const insightData = await apiGet<InsightData>(`/communities/${communityId}/insight`);
      setInsight(insightData);
    } catch {}
  }, [communityId]);

  const fetchCommunitySettings = useCallback(async () => {
    if (!communityId) return;
    setCommunitySettingsLoading(true);
    setCommunitySettingsError("");
    try {
      const s = await apiGet<CommunitySettingsToggles>(`/communities/${communityId}/settings`);
      setCommunitySettingsForm({
        allowMemberPost: s.allowMemberPost ?? true,
        requireApproval: s.requireApproval ?? false,
        showMemberList: s.showMemberList ?? true,
        showEventList: s.showEventList ?? true,
      });
    } catch (err: any) {
      if (err?.response?.status !== 404) {
        setCommunitySettingsError(err?.response?.data?.message || "Gagal memuat pengaturan komunitas.");
      }
    } finally {
      setCommunitySettingsLoading(false);
    }
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

  useEffect(() => {
    if (tab === "pengaturan") {
      fetchCommunitySettings();
      api.get("/categories").then(({ data }) => setCategories(data.data || [])).catch(() => {});
    }
  }, [tab, fetchCommunitySettings]);

  // Shared mutation helper (`runMutation`) replaces the five near-identical
  // try/catch/alert blocks these handlers used to carry — see
  // apps/web/components/community/mutation-helper.ts. Behaviour (requests,
  // envelope shape, alert copy, refetch order) is unchanged.

  const handleApproveRequest = async (requestId: string) => {
    await runMutation(
      () => api.put(`/communities/${communityId}/join-requests/${requestId}`, { action: "approve" }),
      {
        fallbackMessage: "Gagal menyetujui permintaan.",
        onSuccess: () => {
          fetchJoinRequests();
          fetchDashboard();
        },
      }
    );
  };

  const handleRejectRequest = async (requestId: string) => {
    await runMutation(
      () => api.put(`/communities/${communityId}/join-requests/${requestId}`, { action: "reject" }),
      {
        confirmMessage: "Yakin ingin menolak permintaan ini?",
        fallbackMessage: "Gagal menolak permintaan.",
        onSuccess: () => {
          fetchJoinRequests();
          fetchDashboard();
        },
      }
    );
  };

  const handleChangeRole = async (memberId: string, newRole: string) => {
    await runMutation(
      () => api.put(`/communities/${communityId}/members/${memberId}/role`, { role: newRole }),
      {
        fallbackMessage: "Gagal mengubah role.",
        onSuccess: () => {
          fetchMembers();
          if (tab === "pengurus") fetchOfficers();
        },
      }
    );
  };

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    await runMutation(
      () => api.delete(`/communities/${communityId}/members/${memberId}`),
      {
        confirmMessage: `Yakin ingin mengeluarkan ${memberName} dari komunitas?`,
        fallbackMessage: "Gagal mengeluarkan anggota.",
        onSuccess: () => {
          fetchMembers();
          if (tab === "pengurus") fetchOfficers();
          fetchDashboard();
        },
      }
    );
  };

  const handleRestoreMember = async (memberId: string, memberName: string) => {
    await runMutation(
      () => api.post(`/communities/${communityId}/members/${memberId}/restore`),
      {
        confirmMessage: `Yakin ingin memulihkan ${memberName} ke komunitas?`,
        fallbackMessage: "Gagal memulihkan anggota.",
        onSuccess: () => {
          fetchMembers();
          fetchDashboard();
        },
      }
    );
  };

  const handleSaveSettings = async () => {
    setSettingsSaving(true);
    setSettingsError("");
    setSettingsSuccess("");
    const tags = settingsForm.tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)
      .slice(0, 10);
    const ok = await runMutation(
      () =>
        api.put(`/communities/${communityId}`, {
          name: settingsForm.name,
          description: settingsForm.description || undefined,
          visibility: settingsForm.visibility,
          membershipType: settingsForm.membershipType,
          address: settingsForm.address || undefined,
          address2: settingsForm.address2 || undefined,
          postalCode: settingsForm.postalCode || undefined,
          village: settingsForm.village || undefined,
          district: settingsForm.district || undefined,
          country: settingsForm.country || undefined,
          province: settingsForm.province || undefined,
          city: settingsForm.city || undefined,
          website: settingsForm.website || undefined,
          banner: settingsForm.banner || undefined,
          logo: settingsForm.logo || undefined,
          categoryIds: settingsForm.categoryIds,
          tags,
        }),
      {
        fallbackMessage: "Gagal menyimpan pengaturan.",
        onError: setSettingsError,
      }
    );
    if (ok) {
      setSettingsSuccess("Pengaturan berhasil disimpan!");
      fetchDashboard();
      setTimeout(() => setSettingsSuccess(""), 3000);
    }
    setSettingsSaving(false);
  };

  const handleSaveCommunitySettings = async () => {
    setCommunitySettingsSaving(true);
    setCommunitySettingsError("");
    setCommunitySettingsSuccess("");
    const ok = await runMutation(
      () => api.put(`/communities/${communityId}/settings`, communitySettingsForm),
      {
        fallbackMessage: "Gagal menyimpan pengaturan komunitas.",
        onError: setCommunitySettingsError,
      }
    );
    if (ok) {
      setCommunitySettingsSuccess("Pengaturan komunitas berhasil disimpan!");
      setTimeout(() => setCommunitySettingsSuccess(""), 3000);
    }
    setCommunitySettingsSaving(false);
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

  // Every tab below only renders once fetchDashboard() above has already
  // succeeded, and GET /communities/:id/dashboard requires
  // requireCommunityAdmin (apps/api/src/routes/communities.ts) -- so anyone
  // who reaches this point today holds OWNER or ADMIN in this community.
  // `role` is the viewer's real membership role from the dashboard payload
  // (state above); each tab derives its own affordances from it via can(),
  // rather than the shell precomputing a single "canManage" flag that
  // conflates distinct actions (editSettings vs. manageMedia vs.
  // changeMemberRole vs. manageDangerZone).
  const canonicalTabPath: Record<Tab, string> = {
    ringkasan: "overview",
    profil: "profile",
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
        {false && <aside aria-hidden="true" className="hidden">
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
                href={`/dashboard/communities/${communityPath}/${canonicalTabPath[navTab.key]}`}
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
        </aside>}

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
                {tab === "ringkasan" ? "Community Overview" : tab === "profil" ? "Profil Komunitas" : tabs.find((item) => item.key === tab)?.label || "Community Workspace"}
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                {tab === "ringkasan" ? "Command center operasional untuk memahami kondisi dan pekerjaan komunitas." : tab === "profil" ? "Identitas, informasi publik, dan detail utama komunitas." : `Kelola ${community.name} dalam satu Community Operating Workspace.`}
              </p>
            </div>

            <div className="hidden">
              {tabs.map((navTab) => (
                <Link
                  key={navTab.key}
                  href={`/dashboard/communities/${communityPath}/${canonicalTabPath[navTab.key]}`}
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
                communityId={communityId}
                communityPath={communityPath}
                community={community}
                pendingRequests={pendingRequests}
                activeEvents={activeEvents}
                recentActivity={recentActivity}
              />
            )}

            {tab === "profil" && (
              <ProfilKomunitasTab community={community} />
            )}

            {tab === "event" && (
              <CommunityEventTab communityId={communityId} communitySlug={community.slug} communityName={community.name} />
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
                role={role}
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
                role={role}
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
              <MediaTab communityId={communityId} role={role} />
            )}

            {tab === "pengaturan" && (
              <PengaturanTab
                form={settingsForm}
                setForm={setSettingsForm}
                onSave={handleSaveSettings}
                saving={settingsSaving}
                success={settingsSuccess}
                error={settingsError}
                role={role}
                categories={categories}
                communitySettingsForm={communitySettingsForm}
                setCommunitySettingsForm={setCommunitySettingsForm}
                onSaveCommunitySettings={handleSaveCommunitySettings}
                communitySettingsLoading={communitySettingsLoading}
                communitySettingsSaving={communitySettingsSaving}
                communitySettingsSuccess={communitySettingsSuccess}
                communitySettingsError={communitySettingsError}
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
