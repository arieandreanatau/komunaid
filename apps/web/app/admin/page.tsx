"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import api from "@/lib/api";

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

  useEffect(() => {
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
  }, []);

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

  const statCards: Array<{ label: string; value: number; color: string; icon: string; sub?: string; link?: string }> = [
    { label: "Total Users", value: stats.totalUsers, color: "komuna-blue", icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z", sub: `${stats.newUsersLast30d} baru bulan ini` },
    { label: "Total Komunitas", value: stats.totalCommunities, color: "komuna-teal", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z", sub: `${stats.newCommunitiesLast30d} baru bulan ini` },
    { label: "Total Organisasi", value: stats.totalOrganizations, color: "komuna-navy", icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" },
    { label: "Total Event", value: stats.totalEvents, color: "komuna-aqua", icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z", sub: `${stats.newEventsLast30d} baru bulan ini` },
    { label: "Users Aktif", value: stats.activeUsers, color: "green-600", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
    { label: "Users Ditangguhkan", value: stats.suspendedUsers, color: "red-600", icon: "M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" },
    { label: "Pending Komunitas", value: stats.pendingCommunities, color: "yellow-600", icon: "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z", link: "/admin/communities" },
    { label: "Laporan Aktif", value: stats.pendingReports, color: "orange-600", icon: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z", link: "/admin/reports" },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-komuna-navy via-komuna-blue to-komuna-teal rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-white/80 mt-1">Overview operasional platform KomunaID</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((card) => {
            if (card.link) {
              return (
                <Link key={card.label} href={card.link} className={`bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer`}>
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-lg bg-${card.color}/10 flex items-center justify-center`}>
                      <svg className={`h-5 w-5 text-${card.color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
              );
            }
            return (
              <div key={card.label} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-lg bg-${card.color}/10 flex items-center justify-center`}>
                    <svg className={`h-5 w-5 text-${card.color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={card.icon} />
                    </svg>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-komuna-navy">{card.value.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">{card.label}</p>
                  </div>
                </div>
                {card.sub && <p className="text-xs text-gray-400 mt-2 ml-13">{card.sub}</p>}
              </div>
            );
          })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {(pendingCommunities.length > 0 || pendingOrganizations.length > 0) && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-komuna-navy mb-4">Menunggu Persetujuan</h2>
            {pendingCommunities.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Komunitas ({pendingCommunities.length})</h3>
                {pendingCommunities.map((comm) => (
                  <Link key={comm.id} href="/admin/communities" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors -mx-2">
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
                {pendingOrganizations.map((org) => (
                  <Link key={org.id} href="/admin/organizations" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors -mx-2">
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
            <h2 className="text-lg font-semibold text-komuna-navy">Audit Log Terbaru</h2>
            <Link href="/admin/audit-logs" className="text-sm text-komuna-blue hover:underline">Lihat Semua</Link>
          </div>
          {recentAudit.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">Belum ada aktivitas</p>
          ) : (
            <div className="space-y-3">
              {recentAudit.slice(0, 8).map((log) => (
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
            <Link href="/admin/reports" className="text-sm text-komuna-blue hover:underline">Lihat Semua</Link>
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
