"use client";

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

export default function VolunteerReportsPage() {
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

  const rows = [
    { label: "Total Program", value: stats.totalPrograms },
    { label: "Relawan Aktif", value: stats.activeVolunteers },
    { label: "Total Pendaftaran", value: stats.totalApplications },
    { label: "Pengajuan Pending", value: stats.pendingApplications },
    { label: "Total Kehadiran", value: stats.totalAttended },
    { label: "Total Partisipasi", value: stats.totalRegistrations },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-komuna-navy">Laporan Relawan</h1>
        <p className="text-sm text-gray-500 mt-1">Statistik program volunteer, kehadiran, dan partisipasi</p>
      </div>

      {isLoading ? (
        <DashboardLoadingState label="Memuat laporan" />
      ) : isError ? (
        <DashboardErrorState onRetry={() => refetch()} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rows.map((row) => (
            <div key={row.label} className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
              <p className="text-3xl font-bold text-komuna-navy">{row.value}</p>
              <p className="text-sm text-gray-500 mt-1">{row.label}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
