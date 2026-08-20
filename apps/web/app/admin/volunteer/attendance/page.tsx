"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/components/auth-provider";
import { DashboardEmptyState, DashboardErrorState, DashboardLoadingState } from "@/components/member-dashboard-ui";

interface AttendanceRow {
  id: string;
  status: string;
  date: string | null;
  volunteer: { id: string; name: string; email: string };
  program: { id: string; name: string };
}

export default function VolunteerAttendancePage() {
  const { user, isLoading: authLoading } = useAuth();
  const { data, isLoading, isError, refetch } = useQuery<AttendanceRow[]>({
    queryKey: ["volunteer-programs", "admin", "attendance"],
    queryFn: async () => (await api.get("/volunteer-programs/admin/attendance")).data.data,
    enabled: !authLoading && Boolean(user?.roles.includes("SUPER_ADMIN")),
  });

  if (!authLoading && !user?.roles.includes("SUPER_ADMIN")) {
    return <div className="rounded-xl border border-red-100 bg-red-50 p-6 text-sm text-red-700">Akses Superadmin diperlukan untuk panel volunteer.</div>;
  }

  const statusColors: Record<string, string> = {
    ATTENDED: "bg-green-100 text-green-700",
    NO_SHOW: "bg-red-100 text-red-700",
    NOT_RECORDED: "bg-gray-100 text-gray-600",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-komuna-navy">Absensi Relawan</h1>
        <p className="text-sm text-gray-500 mt-1">Kehadiran relawan dalam program</p>
      </div>

      {isLoading ? (
        <DashboardLoadingState label="Memuat data absensi" />
      ) : isError ? (
        <DashboardErrorState onRetry={() => refetch()} />
      ) : !data?.length ? (
        <DashboardEmptyState title="Belum ada data absensi" description="Data kehadiran relawan akan muncul di sini." />
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Volunteer</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Program</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Tanggal</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {data.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{r.volunteer.name}</p>
                      <p className="text-xs text-gray-400">{r.volunteer.email}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{r.program.name}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {r.date ? new Date(r.date).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "-"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[r.status] || "bg-gray-100 text-gray-600"}`}>
                        {r.status === "ATTENDED" ? "Hadir" : r.status === "NO_SHOW" ? "Tidak Hadir" : r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
