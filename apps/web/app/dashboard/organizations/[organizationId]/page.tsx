"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { Header } from "@/components/header";
import { useAuth } from "@/components/auth-provider";
import { FeatureDisabledBanner } from "@/components/feature-disabled-banner";
import { featureFlags } from "@/lib/feature-flags";
import { SETTINGS_DEFAULTS } from "@komunaid/shared";

interface DashboardData {
  organization: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    visibility: string;
    status: string;
    industry: string | null;
    memberCount: number;
    eventCount: number;
    createdAt: string;
  };
  recentActivity: ActivityItem[];
}

interface ActivityItem {
  id: string;
  action: string;
  userId: string;
  userName: string;
  userAvatar: string | null;
  createdAt: string;
  details: string | null;
}

interface Member {
  id: string;
  userId: string;
  name: string;
  username: string;
  avatar: string | null;
  role: string;
  joinedAt: string;
}

type Tab = "ringkasan" | "anggota" | "aktivitas" | "pengaturan";

const tabs: { key: Tab; label: string }[] = [
  { key: "ringkasan", label: "Ringkasan" },
  { key: "anggota", label: "Tim" },
  { key: "aktivitas", label: "Aktivitas" },
  { key: "pengaturan", label: "Pengaturan" },
];

const roleBadge: Record<string, string> = {
  OWNER: "bg-purple-100 text-purple-700",
  ADMIN: "bg-amber-100 text-amber-700",
  MEMBER: "bg-gray-100 text-gray-600",
};

export default function OrganizationDashboardPage() {
  const params = useParams();
  const router = useRouter();
  const organizationId = params.organizationId as string;
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<Tab>("ringkasan");
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState(false);

  const [memberSearch, setMemberSearch] = useState("");
  const [memberRoleFilter, setMemberRoleFilter] = useState("");
  const [memberPage, setMemberPage] = useState(1);
  const [memberTotalPages, setMemberTotalPages] = useState(1);

  const [settingsForm, setSettingsForm] = useState({
    name: "",
    description: "",
    visibility: "PUBLIC",
    status: "ACTIVE",
  });
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState("");
  const [settingsError, setSettingsError] = useState("");

  const [interactionSettings, setInteractionSettings] = useState(SETTINGS_DEFAULTS);
  const [interactionLoading, setInteractionLoading] = useState(false);
  const [interactionSaving, setInteractionSaving] = useState(false);
  const [interactionSuccess, setInteractionSuccess] = useState("");
  const [interactionError, setInteractionError] = useState("");

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, authLoading, router]);

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await api.get(`/organizations/${organizationId}/dashboard`);
      setDashboard(data.data || data);
      const org = (data.data || data).organization;
      setIsOwner(
        data.userRole === "OWNER" || data.isOwner === true
      );
      setSettingsForm({
        name: org.name,
        description: org.description || "",
        visibility: org.visibility,
        status: org.status,
      });
    } catch (err: any) {
      if (err?.response?.status === 403) {
        setError("Anda tidak memiliki akses ke dashboard organisasi ini. Hanya pemilik atau admin yang dapat mengakses.");
      } else {
        setError(err?.response?.data?.message || "Gagal memuat dashboard.");
      }
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  const fetchMembers = useCallback(async () => {
    try {
      const { data } = await api.get(`/organizations/${organizationId}/members`, {
        params: { page: memberPage, limit: 10, search: memberSearch, role: memberRoleFilter },
      });
      const result = data.data || data;
      setMembers(result.members || result.data || []);
      setMemberTotalPages(result.totalPages || 1);
    } catch {}
  }, [organizationId, memberPage, memberSearch, memberRoleFilter]);

  useEffect(() => {
    if (!authLoading && isAuthenticated && organizationId) {
      fetchDashboard();
    }
  }, [authLoading, isAuthenticated, organizationId, fetchDashboard]);

  useEffect(() => {
    if (activeTab === "anggota") fetchMembers();
  }, [activeTab, fetchMembers]);

  const handleChangeRole = async (memberId: string, newRole: string) => {
    try {
      await api.put(`/organizations/${organizationId}/members/${memberId}/role`, { role: newRole });
      fetchMembers();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Gagal mengubah role.");
    }
  };

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    if (!confirm(`Yakin ingin mengeluarkan ${memberName} dari organisasi?`)) return;
    try {
      await api.delete(`/organizations/${organizationId}/members/${memberId}`);
      fetchMembers();
      fetchDashboard();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Gagal mengeluarkan anggota.");
    }
  };

  const handleSaveSettings = async () => {
    setSettingsSaving(true);
    setSettingsError("");
    setSettingsSuccess("");
    try {
      await api.patch(`/organizations/${organizationId}`, settingsForm);
      setSettingsSuccess("Pengaturan berhasil disimpan!");
      fetchDashboard();
      setTimeout(() => setSettingsSuccess(""), 3000);
    } catch (err: any) {
      setSettingsError(err?.response?.data?.message || "Gagal menyimpan pengaturan.");
    } finally {
      setSettingsSaving(false);
    }
  };

  const fetchInteractionSettings = useCallback(async () => {
    setInteractionLoading(true);
    setInteractionError("");
    try {
      const { data } = await api.get(`/organizations/${organizationId}/settings`);
      const s = data.data || data;
      setInteractionSettings({
        allowMemberPost: s.allowMemberPost ?? SETTINGS_DEFAULTS.allowMemberPost,
        requireApproval: s.requireApproval ?? SETTINGS_DEFAULTS.requireApproval,
        showMemberList: s.showMemberList ?? SETTINGS_DEFAULTS.showMemberList,
        showEventList: s.showEventList ?? SETTINGS_DEFAULTS.showEventList,
      });
    } catch (err: any) {
      if (err?.response?.status !== 404) {
        setInteractionError(err?.response?.data?.message || "Gagal memuat pengaturan interaksi.");
      }
    } finally {
      setInteractionLoading(false);
    }
  }, [organizationId]);

  const handleSaveInteractionSettings = async () => {
    setInteractionSaving(true);
    setInteractionError("");
    setInteractionSuccess("");
    try {
      await api.put(`/organizations/${organizationId}/settings`, interactionSettings);
      setInteractionSuccess("Pengaturan interaksi berhasil disimpan!");
      setTimeout(() => setInteractionSuccess(""), 3000);
    } catch (err: any) {
      setInteractionError(err?.response?.data?.message || "Gagal menyimpan pengaturan interaksi.");
    } finally {
      setInteractionSaving(false);
    }
  };

  useEffect(() => {
    if (activeTab === "pengaturan") fetchInteractionSettings();
  }, [activeTab, fetchInteractionSettings]);

  if (!featureFlags.organization) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <FeatureDisabledBanner />
      </div>
    );
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
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
        <Header />
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
              href="/organizations"
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

  const { organization, recentActivity } = dashboard;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

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
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Organisasi</p>
            </div>

            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
                  activeTab === tab.key
                    ? "bg-komuna-blue/10 text-komuna-blue"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                {tab.key === "ringkasan" && (
                  <svg className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                )}
                {tab.key === "anggota" && (
                  <svg className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                )}
                {tab.key === "aktivitas" && (
                  <svg className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                {tab.key === "pengaturan" && (
                  <svg className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
                {tab.label}
              </button>
            ))}
          </nav>
        </aside>

        <main className="flex-1 min-h-[calc(100vh-4rem)]">
          <div className="max-w-5xl mx-auto px-4 py-6">
            <div className="mb-6">
              <Link
                href={`/organizations/${organization.slug}`}
                className="text-sm text-komuna-blue hover:underline flex items-center gap-1"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                {organization.name}
              </Link>
              <h1 className="text-2xl font-bold text-komuna-navy mt-1">
                Dashboard Organisasi
              </h1>
            </div>

            <div className="flex lg:hidden overflow-x-auto gap-1 mb-6 border-b border-gray-200 pb-px">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                    activeTab === tab.key
                      ? "border-komuna-blue text-komuna-blue"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab === "ringkasan" && (
              <RingkasanTab
                organization={organization}
                recentActivity={recentActivity}
              />
            )}

            {activeTab === "anggota" && (
              <AnggotaTab
                members={members}
                memberSearch={memberSearch}
                setMemberSearch={setMemberSearch}
                memberRoleFilter={memberRoleFilter}
                setMemberRoleFilter={setMemberRoleFilter}
                memberPage={memberPage}
                setMemberPage={setMemberPage}
                memberTotalPages={memberTotalPages}
                isOwner={isOwner}
                currentUserId={user?.id}
                onChangeRole={handleChangeRole}
                onRemoveMember={handleRemoveMember}
              />
            )}

            {activeTab === "aktivitas" && (
              <AktivitasTab recentActivity={recentActivity} />
            )}

            {activeTab === "pengaturan" && (
              <PengaturanTab
                form={settingsForm}
                setForm={setSettingsForm}
                onSave={handleSaveSettings}
                saving={settingsSaving}
                success={settingsSuccess}
                error={settingsError}
                isOwner={isOwner}
                interactionSettings={interactionSettings}
                setInteractionSettings={setInteractionSettings}
                onSaveInteraction={handleSaveInteractionSettings}
                interactionLoading={interactionLoading}
                interactionSaving={interactionSaving}
                interactionSuccess={interactionSuccess}
                interactionError={interactionError}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

function RingkasanTab({
  organization,
  recentActivity,
}: {
  organization: DashboardData["organization"];
  recentActivity: ActivityItem[];
}) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-komuna-teal/10 flex items-center justify-center">
              <svg className="h-5 w-5 text-komuna-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-komuna-navy">{organization.memberCount}</p>
              <p className="text-xs text-gray-500">Total Anggota</p>
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
              <p className="text-2xl font-bold text-komuna-navy">{organization.eventCount}</p>
              <p className="text-xs text-gray-500">Total Event</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-komuna-blue/10 flex items-center justify-center">
              <svg className="h-5 w-5 text-komuna-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <p className="text-lg font-bold text-komuna-navy">
                {organization.industry || "-"}
              </p>
              <p className="text-xs text-gray-500">Industri</p>
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
                {organization.status === "ACTIVE" ? "Aktif" : organization.status === "INACTIVE" ? "Nonaktif" : organization.status}
              </p>
              <p className="text-xs text-gray-500">Status</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-komuna-navy mb-4">Informasi Organisasi</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Nama</span>
            <p className="font-medium text-komuna-navy">{organization.name}</p>
          </div>
          <div>
            <span className="text-gray-500">Visibilitas</span>
            <p className="font-medium text-komuna-navy">{organization.visibility === "PUBLIC" ? "Publik" : "Privat"}</p>
          </div>
          {organization.industry && (
            <div>
              <span className="text-gray-500">Industri</span>
              <p className="font-medium text-komuna-navy">{organization.industry}</p>
            </div>
          )}
          <div>
            <span className="text-gray-500">Dibuat</span>
            <p className="font-medium text-komuna-navy">
              {new Date(organization.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
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
            {recentActivity.slice(0, 5).map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                {activity.userAvatar ? (
                  <img src={activity.userAvatar} alt="" className="h-8 w-8 rounded-full object-cover flex-shrink-0" />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-komuna-teal/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-komuna-teal text-xs font-bold">{activity.userName?.[0]}</span>
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-gray-700">
                    <span className="font-medium text-komuna-navy">{activity.userName}</span>{" "}
                    {activity.action}
                  </p>
                  {activity.details && <p className="text-xs text-gray-400 mt-0.5">{activity.details}</p>}
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(activity.createdAt).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}
                  </p>
                </div>
              </div>
            ))}
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
  memberPage,
  setMemberPage,
  memberTotalPages,
  isOwner,
  currentUserId,
  onChangeRole,
  onRemoveMember,
}: {
  members: Member[];
  memberSearch: string;
  setMemberSearch: (v: string) => void;
  memberRoleFilter: string;
  setMemberRoleFilter: (v: string) => void;
  memberPage: number;
  setMemberPage: (v: number) => void;
  memberTotalPages: number;
  isOwner: boolean;
  currentUserId?: string;
  onChangeRole: (memberId: string, role: string) => void;
  onRemoveMember: (memberId: string, name: string) => void;
}) {
  return (
    <div className="space-y-4">
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
            <option value="MEMBER">Member</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm divide-y divide-gray-100">
        {members.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">Tidak ada anggota ditemukan.</div>
        ) : (
          members.map((member) => (
            <div key={member.id} className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors">
              {member.avatar ? (
                <img src={member.avatar} alt="" className="h-10 w-10 rounded-full object-cover flex-shrink-0" />
              ) : (
                <div className="h-10 w-10 rounded-full bg-komuna-teal flex items-center justify-center flex-shrink-0">
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
                  {isOwner && (
                    <select
                      value={member.role}
                      onChange={(e) => onChangeRole(member.id, e.target.value)}
                      className="px-2 py-1 border border-gray-200 rounded text-xs bg-white focus:ring-1 focus:ring-komuna-blue outline-none"
                    >
                      <option value="MEMBER">Member</option>
                      <option value="ADMIN">Admin</option>
                      {isOwner && <option value="OWNER">Owner</option>}
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

function AktivitasTab({ recentActivity }: { recentActivity: ActivityItem[] }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold text-komuna-navy mb-4">Riwayat Keanggotaan</h3>
      {recentActivity.length === 0 ? (
        <p className="text-gray-400 text-sm">Belum ada aktivitas.</p>
      ) : (
        <div className="space-y-3">
          {recentActivity.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
              {activity.userAvatar ? (
                <img src={activity.userAvatar} alt="" className="h-8 w-8 rounded-full object-cover flex-shrink-0" />
              ) : (
                <div className="h-8 w-8 rounded-full bg-komuna-teal/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-komuna-teal text-xs font-bold">{activity.userName?.[0]}</span>
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm text-gray-700">
                  <span className="font-medium text-komuna-navy">{activity.userName}</span>{" "}
                  {activity.action}
                </p>
                {activity.details && <p className="text-xs text-gray-400 mt-0.5">{activity.details}</p>}
                <p className="text-xs text-gray-400 mt-0.5">
                  {new Date(activity.createdAt).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}
                </p>
              </div>
            </div>
          ))}
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
  interactionSettings,
  setInteractionSettings,
  onSaveInteraction,
  interactionLoading,
  interactionSaving,
  interactionSuccess,
  interactionError,
}: {
  form: { name: string; description: string; visibility: string; status: string };
  setForm: (v: typeof form) => void;
  onSave: () => void;
  saving: boolean;
  success: string;
  error: string;
  isOwner: boolean;
  interactionSettings: { allowMemberPost: boolean; requireApproval: boolean; showMemberList: boolean; showEventList: boolean };
  setInteractionSettings: (v: typeof interactionSettings) => void;
  onSaveInteraction: () => void;
  interactionLoading: boolean;
  interactionSaving: boolean;
  interactionSuccess: string;
  interactionError: string;
}) {
  return (
    <div className="space-y-5">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-komuna-navy mb-6">Pengaturan Organisasi</h3>

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
          <label className="block text-sm font-medium text-gray-700 mb-1">Nama Organisasi</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              disabled={!isOwner}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue outline-none disabled:bg-gray-50"
            >
              <option value="ACTIVE">Aktif</option>
              <option value="INACTIVE">Nonaktif</option>
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

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-komuna-navy mb-2">Pengaturan Interaksi</h3>
        <p className="mb-6 text-sm text-slate-500">Kontrol visibilitas anggota, event, dan postingan organisasi.</p>

        {interactionSuccess && (
          <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm p-3 rounded-lg flex items-center gap-2">
            <svg className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {interactionSuccess}
          </div>
        )}

        {interactionError && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-lg flex items-center gap-2">
            <svg className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            {interactionError}
          </div>
        )}

        {interactionLoading ? (
          <div className="py-6 text-center text-sm text-gray-400">Memuat pengaturan interaksi...</div>
        ) : (
          <div className="space-y-4">
            {([
              { key: "allowMemberPost" as const, label: "Izinkan Anggota Posting", desc: "Anggota dapat membuat postingan di organisasi." },
              { key: "requireApproval" as const, label: "Persetujuan Wajib", desc: "Permintaan bergabung menunggu ditinjau, bukan langsung menjadi anggota." },
              { key: "showMemberList" as const, label: "Tampilkan Daftar Anggota", desc: "Daftar anggota terlihat di halaman publik organisasi." },
              { key: "showEventList" as const, label: "Tampilkan Daftar Event", desc: "Event terlihat di halaman publik organisasi." },
            ]).map((item, i) => (
              <div key={item.key}>
                {i > 0 && <div className="border-t border-gray-100 mb-4" />}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700">{item.label}</p>
                    <p className="text-xs text-gray-500">{item.desc}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setInteractionSettings({ ...interactionSettings, [item.key]: !interactionSettings[item.key] })}
                      aria-pressed={interactionSettings[item.key]}
                    className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors disabled:opacity-50 ${
                      interactionSettings[item.key] ? "bg-komuna-blue" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        interactionSettings[item.key] ? "translate-x-7" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>
            ))}
            <div className="flex justify-end pt-2">
              <button
                onClick={onSaveInteraction}
                disabled={interactionSaving}
                className="px-5 py-2 bg-komuna-blue text-white text-sm font-medium rounded-lg hover:bg-komuna-navy disabled:opacity-50 transition-colors inline-flex items-center gap-2"
              >
                {interactionSaving && <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                {interactionSaving ? "Menyimpan..." : "Simpan Pengaturan Interaksi"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
