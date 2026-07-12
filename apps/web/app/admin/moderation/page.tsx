"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

interface ModerationStats {
  openReports: number;
  underReview: number;
  resolved: number;
  dismissed: number;
}

const quickActions = [
  { label: "Laporan", desc: "Review laporan pelanggaran", href: "/admin/moderation/reports", color: "bg-red-500" },
  { label: "Audit Log", desc: "Riwayat aktivitas admin", href: "/admin/moderation/audit-log", color: "bg-komuna-blue" },
  { label: "Pelanggaran", desc: "Manajemen pelanggaran", href: "/admin/moderation/violations", color: "bg-orange-500" },
];

export default function ModerationOverviewPage() {
  const router = useRouter();
  const [stats, setStats] = useState<ModerationStats>({ openReports: 0, underReview: 0, resolved: 0, dismissed: 0 });
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/admin/moderation/stats");
      setStats(data.data || { openReports: 0, underReview: 0, resolved: 0, dismissed: 0 });
    } catch { /* empty */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const statCards = [
    { label: "Open Reports", value: stats.openReports, icon: "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z", color: "text-red-500 bg-red-500/10" },
    { label: "Under Review", value: stats.underReview, icon: "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z", color: "text-yellow-500 bg-yellow-500/10" },
    { label: "Resolved", value: stats.resolved, icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z", color: "text-green-500 bg-green-500/10" },
    { label: "Dismissed", value: stats.dismissed, icon: "M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636", color: "text-gray-400 bg-gray-400/10" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-komuna-navy">Moderation</h1>
        <p className="text-sm text-gray-500 mt-1">Kelola moderasi konten dan laporan pelanggaran</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-5 shadow-sm animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
              <div className="h-8 bg-gray-200 rounded w-1/2" />
            </div>
          ))
        ) : (
          statCards.map((card) => (
            <div key={card.label} className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
              <div className="flex items-center gap-4">
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${card.color}`}>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={card.icon} />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-500">{card.label}</p>
                  <p className="text-2xl font-bold text-komuna-navy">{card.value}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div>
        <h2 className="text-lg font-semibold text-komuna-navy mb-4">Aksi Cepat</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action) => (
            <button
              key={action.href}
              onClick={() => router.push(action.href)}
              className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition-shadow text-left"
            >
              <div className={`h-10 w-10 rounded-lg ${action.color} flex items-center justify-center mb-3`}>
                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <h3 className="font-semibold text-komuna-navy">{action.label}</h3>
              <p className="text-xs text-gray-500 mt-1">{action.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
