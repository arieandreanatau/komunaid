"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { useAuth } from "@/components/auth-provider";

interface DashboardStats {
  totalUsers: number;
  totalCommunities: number;
  totalOrganizations: number;
  totalEvents: number;
  pendingCommunities: number;
  pendingOrganizations: number;
  pendingReports: number;
  activeUsers: number;
  suspendedUsers: number;
  newUsersLast30d: number;
  newCommunitiesLast30d: number;
  newEventsLast30d: number;
}

interface AuditItem {
  id: string;
  actionType: string;
  resourceName: string;
  resourceId: string;
  user: { id: string; name: string };
  createdAt: string;
}

interface ReportItem {
  id: string;
  targetType: string;
  targetId: string;
  reason: string;
  status: string;
  reporter: { id: string; name: string };
  createdAt: string;
}

interface PendingItem {
  id: string;
  name: string;
  slug: string;
  owner: { id: string; name: string; avatar: string | null };
  submittedAt: string | null;
}

interface GrowthData {
  month: string;
  members: number;
  communities: number;
  events: number;
  volunteers: number;
}

interface GrowthResponse {
  success: boolean;
  data: {
    monthlyGrowth: GrowthData[];
    totalVolunteers: number;
    activeVolunteers: number;
  };
}

interface DashboardData {
  stats: DashboardStats;
  recentAudit: AuditItem[];
  recentReports: ReportItem[];
  pendingCommunities: PendingItem[];
  pendingOrganizations: PendingItem[];
}

const actionLabels: Record<string, string> = {
  USER_SUSPEND: "Menangguhkan User",
  USER_ACTIVATE: "Mengaktifkan User",
  COMMUNITY_APPROVE: "Menyetujui Komunitas",
  COMMUNITY_SUSPEND: "Menangguhkan Komunitas",
  COMMUNITY_REJECTED: "Menolak Komunitas",
  ORG_APPROVE: "Menyetujui Organisasi",
  ORG_SUSPEND: "Menangguhkan Organisasi",
  ROLE_CHANGE: "Mengubah Role",
  SETTINGS_UPDATE: "Mengupdate Pengaturan",
  REPORT_RESOLVE: "Menindaklanjuti Laporan",
  REPORT_DISMISS: "Menolak Laporan",
  NOTIFICATION_BROADCAST: "Mengirim Notifikasi Massal",
};

const targetTypeLabels: Record<string, string> = {
  COMMUNITY: "Komunitas",
  EVENT: "Event",
  USER: "User",
  ORGANIZATION: "Organisasi",
};

const reasonLabels: Record<string, string> = {
  SPAM: "Spam",
  HARASSMENT: "Pelecehan",
  INAPPROPRIATE_CONTENT: "Kontak Tidak Pantas",
  MISINFORMATION: "Informasi Salah",
  COPYRIGHT_VIOLATION: "Pelanggaran Hak Cipta",
  OTHER: "Lainnya",
};

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [growthData, setGrowthData] = useState<GrowthData[]>([]);
  const [totalVolunteers, setTotalVolunteers] = useState(0);
  const [activeVolunteers, setActiveVolunteers] = useState(0);
  const [growthLoading, setGrowthLoading] = useState(true);
  const [growthError, setGrowthError] = useState<string | null>(null);
  const { user, isLoading: authLoading } = useAuth();

  const isAdmin = user?.roles?.some((r: string) => ["SUPER_ADMIN", "PLATFORM_ADMIN"].includes(r));

  useEffect(() => {
    if (authLoading || !isAdmin) {
      if (!authLoading) setLoading(false);
      return;
    }
    const fetchDashboard = async () => {
      try {
        const res = await api.get("/admin/dashboard");
        setData(res.data.data);
      } catch {
        console.error("Gagal memuat dashboard");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [authLoading, isAdmin]);

  useEffect(() => {
    if (authLoading || !isAdmin) return;
    const fetchGrowth = async () => {
      try {
        const res = await api.get("/admin/dashboard/growth");
        const payload: GrowthResponse = res.data;
        if (payload.success && payload.data) {
          setGrowthData(payload.data.monthlyGrowth);
          setTotalVolunteers(payload.data.totalVolunteers);
          setActiveVolunteers(payload.data.activeVolunteers);
        }
      } catch {
        setGrowthError("Gagal memuat data pertumbuhan");
      } finally {
        setGrowthLoading(false);
      }
    };
    fetchGrowth();
  }, [authLoading, isAdmin]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded w-48 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-24 mb-2" />
              <div className="h-8 bg-gray-200 rounded w-16" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!data) return <div className="text-center py-16 text-gray-500">Gagal memuat data</div>;

  const { stats, recentAudit, recentReports, pendingCommunities, pendingOrganizations } = data;

  const platformStatus: Array<{ label: string; value: number; bgClass: string; textClass: string; icon: string; sub?: string; href: string }> = [
    { label: "Members", value: stats.totalUsers, bgClass: "bg-komuna-blue/10", textClass: "text-komuna-blue", icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z", sub: `${stats.newUsersLast30d} baru bulan ini`, href: "/admin/members" },
    { label: "Communities", value: stats.totalCommunities, bgClass: "bg-komuna-teal/10", textClass: "text-komuna-teal", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z", sub: `${stats.newCommunitiesLast30d} baru bulan ini`, href: "/admin/communities" },
    { label: "Events", value: stats.totalEvents, bgClass: "bg-komuna-aqua/10", textClass: "text-komuna-aqua", icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z", sub: `${stats.newEventsLast30d} baru bulan ini`, href: "/admin/events" },
    { label: "Volunteer", value: totalVolunteers, bgClass: "bg-komuna-teal/10", textClass: "text-komuna-teal", icon: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z", href: "/admin/volunteer" },
  ];

  const operationalMetrics: Array<{ label: string; value: number; bgClass: string; textClass: string; icon: string; href: string }> = [
    { label: "Pending Approval", value: stats.pendingCommunities + stats.pendingOrganizations, bgClass: "bg-yellow-600/10", textClass: "text-yellow-600", icon: "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z", href: "/admin/communities/approval" },
    { label: "Pending Reports", value: stats.pendingReports, bgClass: "bg-orange-600/10", textClass: "text-orange-600", icon: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z", href: "/admin/moderation/reports" },
    { label: "Active Users", value: stats.activeUsers, bgClass: "bg-green-600/10", textClass: "text-green-600", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z", href: "/admin/members" },
    { label: "Suspended Users", value: stats.suspendedUsers, bgClass: "bg-red-600/10", textClass: "text-red-600", icon: "M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636", href: "/admin/members/suspended" },
  ];

  const quickActions: Array<{ label: string; href: string; icon: string; bgClass: string; textClass: string }> = [
    { label: "Approve Community", href: "/admin/communities/approval", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z", bgClass: "bg-komuna-blue/10", textClass: "text-komuna-blue" },
    { label: "Open Reports", href: "/admin/moderation/reports", icon: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z", bgClass: "bg-orange-600/10", textClass: "text-orange-600" },
    { label: "Manage Categories", href: "/admin/master-data/categories", icon: "M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z", bgClass: "bg-komuna-teal/10", textClass: "text-komuna-teal" },
    { label: "View Audit Log", href: "/admin/moderation/audit-log", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2", bgClass: "bg-komuna-navy/10", textClass: "text-komuna-navy" },
    { label: "Settings", href: "/admin/settings", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z", bgClass: "bg-gray-600/10", textClass: "text-gray-600" },
  ];

  const chartMax = Math.max(...growthData.map((d) => Math.max(d.members, d.communities, d.events, d.volunteers)), 1);
  const chartSeries: Array<{ key: keyof Omit<GrowthData, "month">; label: string; color: string }> = [
    { key: "members", label: "Members", color: "bg-komuna-blue" },
    { key: "communities", label: "Komunitas", color: "bg-komuna-teal" },
    { key: "events", label: "Events", color: "bg-komuna-aqua" },
    { key: "volunteers", label: "Relawan", color: "bg-purple-500" },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-komuna-navy via-komuna-blue to-komuna-teal rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold">Operational Dashboard</h1>
        <p className="text-white/80 mt-1">Overview operasional platform KomunaID</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {platformStatus.map((card) => (
          <Link key={card.label} href={card.href} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className={`h-10 w-10 rounded-lg ${card.bgClass} flex items-center justify-center`}>
                <svg className={`h-5 w-5 ${card.textClass}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={card.icon} />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-komuna-navy">{card.value.toLocaleString()}</p>
                <p className="text-sm text-gray-500">{card.label}</p>
              </div>
            </div>
            {card.sub && <p className="text-xs text-gray-400 mt-2 ml-13">{card.sub}</p>}
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {operationalMetrics.map((card) => (
          <Link key={card.label} href={card.href} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className={`h-10 w-10 rounded-lg ${card.bgClass} flex items-center justify-center`}>
                <svg className={`h-5 w-5 ${card.textClass}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={card.icon} />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-komuna-navy">{card.value.toLocaleString()}</p>
                <p className="text-sm text-gray-500">{card.label}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div>
        <h2 className="text-lg font-semibold text-komuna-navy mb-3">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
          {quickActions.map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-all duration-150 flex items-center gap-3 group"
            >
              <div className={`h-10 w-10 rounded-lg ${action.bgClass} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}>
                <svg className={`h-5 w-5 ${action.textClass}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={action.icon} />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-komuna-navy truncate">{action.label}</p>
              </div>
              <svg className="h-4 w-4 text-gray-300 group-hover:text-gray-500 transition-colors shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-komuna-navy">Pertumbuhan Bulanan</h2>
          <div className="flex items-center gap-4 text-xs">
            {chartSeries.map((s) => (
              <span key={s.key} className="flex items-center gap-1.5">
                <span className={`h-2.5 w-2.5 rounded-sm ${s.color}`} />
                <span className="text-gray-500">{s.label}</span>
              </span>
            ))}
          </div>
        </div>
        {growthLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-end gap-2">
                <div className="h-4 bg-gray-200 rounded w-12 animate-pulse" />
                <div className="flex-1 flex items-end gap-1">
                  {Array.from({ length: 4 }).map((_, j) => (
                    <div key={j} className="h-16 bg-gray-200 rounded flex-1 animate-pulse" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : growthError ? (
          <p className="text-sm text-red-500 py-4 text-center">{growthError}</p>
        ) : growthData.length === 0 ? (
          <p className="text-sm text-gray-400 py-4 text-center">Belum ada data pertumbuhan</p>
        ) : (
          <div className="space-y-3">
            {growthData.map((d) => (
              <div key={d.month} className="flex items-end gap-2">
                <span className="text-xs text-gray-500 w-16 shrink-0 text-right">{d.month}</span>
                <div className="flex-1 flex items-end gap-1 h-16">
                  {chartSeries.map((s) => (
                    <div
                      key={s.key}
                      className={`${s.color} rounded-t flex-1 transition-all duration-300`}
                      style={{ height: `${(d[s.key] / chartMax) * 100}%`, minHeight: d[s.key] > 0 ? "4px" : "0" }}
                      title={`${s.label}: ${d[s.key]}`}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {(pendingCommunities.length > 0 || pendingOrganizations.length > 0) && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-komuna-navy">Pending Approval</h2>
              <Link href="/admin/communities/approval" className="text-sm text-komuna-blue hover:underline">Lihat Semua</Link>
            </div>
            {pendingCommunities.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Komunitas ({pendingCommunities.length})</h3>
                {pendingCommunities.slice(0, 4).map((comm) => (
                  <Link key={comm.id} href="/admin/communities/approval" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors -mx-2">
                    <div className="h-8 w-8 rounded-lg bg-komuna-blue/10 flex items-center justify-center shrink-0">
                      <span className="text-komuna-blue font-semibold text-xs">{comm.name[0]}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{comm.name}</p>
                      <p className="text-xs text-gray-400">{comm.owner.name} &middot; {formatDate(comm.submittedAt)}</p>
                    </div>
                    <span className="px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-700 rounded-full">Pending</span>
                  </Link>
                ))}
              </div>
            )}
            {pendingOrganizations.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Organisasi ({pendingOrganizations.length})</h3>
                {pendingOrganizations.slice(0, 4).map((org) => (
                  <Link key={org.id} href="/admin/communities/approval" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors -mx-2">
                    <div className="h-8 w-8 rounded-lg bg-komuna-teal/10 flex items-center justify-center shrink-0">
                      <span className="text-komuna-teal font-semibold text-xs">{org.name[0]}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{org.name}</p>
                      <p className="text-xs text-gray-400">{org.owner.name} &middot; {formatDate(org.submittedAt)}</p>
                    </div>
                    <span className="px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-700 rounded-full">Pending</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-komuna-navy">Audit Log Preview</h2>
            <Link href="/admin/moderation/audit-log" className="text-sm text-komuna-blue hover:underline">Lihat Semua</Link>
          </div>
          {recentAudit.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">Belum ada aktivitas</p>
          ) : (
            <div className="space-y-3">
              {recentAudit.slice(0, 6).map((log) => (
                <div key={log.id} className="flex items-start gap-3">
                  <div className="h-2 w-2 rounded-full bg-komuna-blue mt-2 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">{log.user.name}</span>{" "}
                      {actionLabels[log.actionType] || log.actionType}
                    </p>
                    <p className="text-xs text-gray-400">{formatTime(log.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-komuna-navy">Laporan Terbaru</h2>
            <Link href="/admin/moderation/reports" className="text-sm text-komuna-blue hover:underline">Lihat Semua</Link>
          </div>
          {recentReports.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">Tidak ada laporan aktif</p>
          ) : (
            <div className="space-y-3">
              {recentReports.map((report) => (
                <div key={report.id} className="flex items-start gap-3">
                  <div className={`h-2 w-2 rounded-full mt-2 shrink-0 ${report.status === "OPEN" ? "bg-red-500" : "bg-yellow-500"}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">{targetTypeLabels[report.targetType] || report.targetType}</span>{" "}
                      - {reasonLabels[report.reason] || report.reason}
                    </p>
                    <p className="text-xs text-gray-400">oleh {report.reporter.name} &middot; {formatTime(report.createdAt)}</p>
                  </div>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${report.status === "OPEN" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>
                    {report.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
