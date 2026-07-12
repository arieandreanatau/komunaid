"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import api from "@/lib/api";

interface CommunityStats {
  total: number;
  pending: number;
  approved: number;
  suspended: number;
  rejected: number;
}

interface RecentCommunity {
  id: string;
  name: string;
  slug: string;
  status: string;
  owner: { id: string; name: string; avatar: string | null };
  memberCount: number;
  createdAt: string;
}

interface OverviewData {
  stats: CommunityStats;
  recentCommunities: RecentCommunity[];
}

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700", APPROVED: "bg-green-100 text-green-700",
  SUSPENDED: "bg-red-100 text-red-700", REJECTED: "bg-red-100 text-red-700",
  REVISION_REQUIRED: "bg-orange-100 text-orange-700", DRAFT: "bg-gray-100 text-gray-600",
};
const statusLabels: Record<string, string> = {
  PENDING: "Pending", APPROVED: "Disetujui", SUSPENDED: "Ditangguhkan",
  REJECTED: "Ditolak", REVISION_REQUIRED: "Revisi", DRAFT: "Draft",
};

function formatDate(d: string) { return new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }); }

export default function CommunitiesOverviewPage() {
  const [stats, setStats] = useState<CommunityStats | null>(null);
  const [recentCommunities, setRecentCommunities] = useState<RecentCommunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOverview = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [totalRes, pendingRes, approvedRes, suspendedRes, rejectedRes] = await Promise.all([
        api.get("/admin/communities", { params: { limit: 1 } }),
        api.get("/admin/communities", { params: { status: "PENDING", limit: 1 } }),
        api.get("/admin/communities", { params: { status: "APPROVED", limit: 1 } }),
        api.get("/admin/communities", { params: { status: "SUSPENDED", limit: 1 } }),
        api.get("/admin/communities", { params: { status: "REJECTED", limit: 1 } }),
      ]);
      setStats({
        total: totalRes.data.pagination?.total || 0,
        pending: pendingRes.data.pagination?.total || 0,
        approved: approvedRes.data.pagination?.total || 0,
        suspended: suspendedRes.data.pagination?.total || 0,
        rejected: rejectedRes.data.pagination?.total || 0,
      });
      setRecentCommunities((totalRes.data.data || []).slice(0, 5));
    } catch {
      setError("Gagal memuat data komunitas");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOverview(); }, [fetchOverview]);

  const statCards = [
    { label: "Total Communities", value: stats?.total ?? 0, bgClass: "bg-komuna-teal/10", textClass: "text-komuna-teal", href: "/admin/communities/communities", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" },
    { label: "Pending Approval", value: stats?.pending ?? 0, bgClass: "bg-yellow-600/10", textClass: "text-yellow-600", href: "/admin/communities/approval", icon: "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
    { label: "Approved", value: stats?.approved ?? 0, bgClass: "bg-green-600/10", textClass: "text-green-600", href: "/admin/communities/communities", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
    { label: "Suspended", value: stats?.suspended ?? 0, bgClass: "bg-red-600/10", textClass: "text-red-600", href: "/admin/communities/communities", icon: "M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" },
    { label: "Rejected", value: stats?.rejected ?? 0, bgClass: "bg-gray-600/10", textClass: "text-gray-600", href: "/admin/communities/communities", icon: "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" },
  ];

  const quickActions = [
    { label: "View All Communities", href: "/admin/communities/communities", icon: "M4 6h16M4 10h16M4 14h16M4 18h16", bgClass: "bg-komuna-teal/10", textClass: "text-komuna-teal" },
    { label: "Pending Approval", href: "/admin/communities/approval", icon: "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z", bgClass: "bg-yellow-600/10", textClass: "text-yellow-600" },
    { label: "Categories", href: "/admin/communities/categories", icon: "M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z", bgClass: "bg-komuna-blue/10", textClass: "text-komuna-blue" },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-komuna-navy via-komuna-blue to-komuna-teal rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold">Community Dashboard</h1>
        <p className="text-white/80 mt-1">Overview workspace komunitas KomunaID</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-24 mb-2" />
              <div className="h-8 bg-gray-200 rounded w-16" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-sm">
          <p className="text-red-500">{error}</p>
          <button onClick={fetchOverview} className="mt-3 px-4 py-2 text-sm font-medium text-komuna-blue bg-komuna-blue/10 rounded-lg hover:bg-komuna-blue/20">Coba Lagi</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {statCards.map((card) => (
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
      )}

      <div>
        <h2 className="text-lg font-semibold text-komuna-navy mb-3">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
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

      {recentCommunities.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-komuna-navy">Recent Communities</h2>
            <Link href="/admin/communities/communities" className="text-sm text-komuna-blue hover:underline">Lihat Semua</Link>
          </div>
          <div className="space-y-3">
            {recentCommunities.map((comm) => (
              <div key={comm.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="h-8 w-8 rounded-lg bg-komuna-blue/10 flex items-center justify-center shrink-0">
                  <span className="text-komuna-blue font-semibold text-xs">{comm.name[0]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{comm.name}</p>
                  <p className="text-xs text-gray-400">{comm.owner.name} &middot; {formatDate(comm.createdAt)}</p>
                </div>
                <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusColors[comm.status]}`}>{statusLabels[comm.status]}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
