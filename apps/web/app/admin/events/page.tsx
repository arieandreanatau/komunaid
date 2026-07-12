"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import api from "@/lib/api";

interface EventStats {
  totalEvents: number;
  published: number;
  cancelled: number;
  archived: number;
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

export default function EventsOverviewPage() {
  const [stats, setStats] = useState<EventStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [allRes, pubRes, cancRes, archRes] = await Promise.all([
          api.get("/admin/events", { params: { page: 1, limit: 1 } }),
          api.get("/admin/events", { params: { page: 1, limit: 1, status: "PUBLISHED" } }),
          api.get("/admin/events", { params: { page: 1, limit: 1, status: "CANCELLED" } }),
          api.get("/admin/events", { params: { page: 1, limit: 1, status: "ARCHIVED" } }),
        ]);
        setStats({
          totalEvents: allRes.data.pagination?.total || 0,
          published: pubRes.data.pagination?.total || 0,
          cancelled: cancRes.data.pagination?.total || 0,
          archived: archRes.data.pagination?.total || 0,
        });
      } catch {
        setError("Gagal memuat data event");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

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
    { label: "Total Events", value: stats.totalEvents, icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z", bgClass: "bg-komuna-aqua/10", textClass: "text-komuna-aqua", href: "/admin/events/events" },
    { label: "Published", value: stats.published, icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z", bgClass: "bg-green-600/10", textClass: "text-green-600", href: "/admin/events/events" },
    { label: "Cancelled", value: stats.cancelled, icon: "M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636", bgClass: "bg-red-600/10", textClass: "text-red-600", href: "/admin/events/events" },
    { label: "Archived", value: stats.archived, icon: "M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4", bgClass: "bg-komuna-navy/10", textClass: "text-komuna-navy", href: "/admin/events/events" },
  ];

  const quickActions = [
    { label: "View All Events", href: "/admin/events/events", icon: "M4 6h16M4 10h16M4 14h16M4 18h16", bgClass: "bg-komuna-aqua/10", textClass: "text-komuna-aqua" },
    { label: "Participants", href: "/admin/events/participants", icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z", bgClass: "bg-komuna-blue/10", textClass: "text-komuna-blue" },
    { label: "Categories", href: "/admin/events/categories", icon: "M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z", bgClass: "bg-komuna-teal/10", textClass: "text-komuna-teal" },
    { label: "Reports", href: "/admin/events/reports", icon: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z", bgClass: "bg-orange-600/10", textClass: "text-orange-600" },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-komuna-navy via-komuna-blue to-komuna-teal rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold">Events Workspace</h1>
        <p className="text-white/80 mt-1">Kelola seluruh event di platform KomunaID</p>
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
