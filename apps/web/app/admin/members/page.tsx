"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { useAuth } from "@/components/auth-provider";

interface MemberStats {
  totalUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  newUsersLast30d: number;
}

function StatCard({ label, value, icon, bgClass, textClass, sub, href }: {
  label: string; value: number; icon: string; bgClass: string; textClass: string; sub?: string; href: string;
}) {
  return (
    <Link href={href} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3">
        <div className={`h-10 w-10 rounded-lg ${bgClass} flex items-center justify-center`}>
          <svg className={`h-5 w-5 ${textClass}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
          </svg>
        </div>
        <div>
          <p className="text-2xl font-bold text-komuna-navy">{value.toLocaleString()}</p>
          <p className="text-sm text-gray-500">{label}</p>
        </div>
      </div>
      {sub && <p className="text-xs text-gray-400 mt-2 ml-13">{sub}</p>}
    </Link>
  );
}

export default function MembersOverviewPage() {
  const [stats, setStats] = useState<MemberStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isLoading: authLoading } = useAuth();

  const isAdmin = user?.roles?.some((r: string) => ["SUPER_ADMIN", "PLATFORM_ADMIN"].includes(r));

  useEffect(() => {
    if (authLoading || !isAdmin) {
      if (!authLoading) setLoading(false);
      return;
    }
    const fetchStats = async () => {
      try {
        const { data } = await api.get("/admin/dashboard");
        const d = data.data;
        setStats({
          totalUsers: d.stats.totalUsers,
          activeUsers: d.stats.activeUsers,
          suspendedUsers: d.stats.suspendedUsers,
          newUsersLast30d: d.stats.newUsersLast30d,
        });
      } catch {
        setError("Gagal memuat data members");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [authLoading, isAdmin]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded w-48 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-24 mb-2" />
              <div className="h-8 bg-gray-200 rounded w-16" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) return <div className="text-center py-16 text-red-500">{error}</div>;
  if (!stats) return <div className="text-center py-16 text-gray-500">Gagal memuat data</div>;

  const statCards = [
    { label: "Total Members", value: stats.totalUsers, icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z", bgClass: "bg-komuna-blue/10", textClass: "text-komuna-blue", sub: `${stats.newUsersLast30d} baru bulan ini`, href: "/admin/members/members" },
    { label: "Active", value: stats.activeUsers, icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z", bgClass: "bg-green-600/10", textClass: "text-green-600", href: "/admin/members/members" },
    { label: "Suspended", value: stats.suspendedUsers, icon: "M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636", bgClass: "bg-red-600/10", textClass: "text-red-600", href: "/admin/members/suspended" },
    { label: "New This Month", value: stats.newUsersLast30d, icon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6", bgClass: "bg-komuna-teal/10", textClass: "text-komuna-teal", href: "/admin/members/members" },
  ];

  const quickActions = [
    { label: "View All Members", href: "/admin/members/members", icon: "M4 6h16M4 10h16M4 14h16M4 18h16", bgClass: "bg-komuna-blue/10", textClass: "text-komuna-blue" },
    { label: "Suspended Members", href: "/admin/members/suspended", icon: "M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636", bgClass: "bg-red-600/10", textClass: "text-red-600" },
    { label: "Member Reports", href: "/admin/members/reports", icon: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z", bgClass: "bg-orange-600/10", textClass: "text-orange-600" },
    { label: "Login Activity", href: "/admin/members/login-activity", icon: "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z", bgClass: "bg-komuna-navy/10", textClass: "text-komuna-navy" },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-komuna-navy via-komuna-blue to-komuna-teal rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold">Members Workspace</h1>
        <p className="text-white/80 mt-1">Kelola seluruh pengguna platform KomunaID</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>

      <div>
        <h2 className="text-lg font-semibold text-komuna-navy mb-3">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
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
    </div>
  );
}
