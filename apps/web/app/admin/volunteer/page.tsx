"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/components/auth-provider";
import { DashboardErrorState, DashboardLoadingState } from "@/components/member-dashboard-ui";

interface VolunteerStats {
  totalPrograms: number;
  activeVolunteers: number;
  pendingApplications: number;
  totalApplications: number;
  totalAttended: number;
  totalRegistrations: number;
}

const quickActions = [
  { label: "Program Relawan", desc: "Kelola program volunteer", href: "/admin/volunteer/programs", color: "bg-komuna-blue" },
  { label: "Pengajuan", desc: "Review aplikasi relawan", href: "/admin/volunteer/applications", color: "bg-komuna-teal" },
  { label: "Absensi", desc: "Catat kehadiran relawan", href: "/admin/volunteer/attendance", color: "bg-purple-500" },
  { label: "Antrean Review", desc: "Setujui proposal volunteer", href: "/admin/volunteer/review-queue", color: "bg-orange-500" },
];

export default function VolunteerOverviewPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { data, isLoading, isError, refetch } = useQuery<VolunteerStats>({
    queryKey: ["volunteer-programs", "admin", "stats"],
    queryFn: async () => (await api.get("/volunteer-programs/admin/stats")).data.data,
    enabled: !authLoading && Boolean(user?.roles.includes("SUPER_ADMIN")),
  });

  if (!authLoading && !user?.roles.includes("SUPER_ADMIN")) {
    return <div className="rounded-xl border border-red-100 bg-red-50 p-6 text-sm text-red-700">Akses Superadmin diperlukan untuk panel volunteer.</div>;
  }

  const stats = data ?? { totalPrograms: 0, activeVolunteers: 0, pendingApplications: 0, totalApplications: 0, totalAttended: 0, totalRegistrations: 0 };

  const statCards = [
    { label: "Total Program", value: stats.totalPrograms, icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10", color: "text-komuna-blue bg-komuna-blue/10" },
    { label: "Relawan Aktif", value: stats.activeVolunteers, icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z", color: "text-komuna-teal bg-komuna-teal/10" },
    { label: "Pengajuan Pending", value: stats.pendingApplications, icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z", color: "text-orange-500 bg-orange-500/10" },
    { label: "Total Pendaftar", value: stats.totalApplications, icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z", color: "text-purple-500 bg-purple-500/10" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-komuna-navy">Volunteer Management</h1>
        <p className="text-sm text-gray-500 mt-1">Kelola program relawan dan pengajuan volunteer</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {isLoading ? (
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

      {!isLoading && isError && <DashboardErrorState title="Statistik tidak dapat dimuat" onRetry={() => refetch()} />}

      <div>
        <h2 className="text-lg font-semibold text-komuna-navy mb-4">Aksi Cepat</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
