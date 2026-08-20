"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/components/auth-provider";
import { DashboardEmptyState, DashboardErrorState, DashboardLoadingState } from "@/components/member-dashboard-ui";

interface ProgramRow {
  id: string;
  title: string;
  status: string;
  organizerType: string;
  capacity: number;
  volunteers: number;
  applicationCount: number;
  startDate: string;
  endDate: string | null;
  community: { id: string; name: string } | null;
  organizer: { id: string; name: string } | null;
}

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Draft", SUBMITTED: "Dikirim", UNDER_REVIEW: "Tinjauan", REVISION_REQUIRED: "Perlu Revisi",
  REJECTED: "Ditolak", APPROVED: "Disetujui", SCHEDULED: "Terjadwal", REGISTRATION_OPEN: "Pendaftaran dibuka",
  REGISTRATION_CLOSED: "Pendaftaran ditutup", ONGOING: "Berlangsung", COMPLETED: "Selesai", CANCELLED: "Dibatalkan",
};

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-600", SUBMITTED: "bg-blue-100 text-blue-700", UNDER_REVIEW: "bg-yellow-100 text-yellow-700",
  REVISION_REQUIRED: "bg-orange-100 text-orange-700", REJECTED: "bg-red-100 text-red-700", APPROVED: "bg-emerald-100 text-emerald-700",
  SCHEDULED: "bg-sky-100 text-sky-700", REGISTRATION_OPEN: "bg-green-100 text-green-700", REGISTRATION_CLOSED: "bg-amber-100 text-amber-700",
  ONGOING: "bg-teal-100 text-teal-700", COMPLETED: "bg-purple-100 text-purple-700", CANCELLED: "bg-gray-200 text-gray-500",
};

export default function VolunteerProgramsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [statusFilter, setStatusFilter] = useState("");
  const { data, isLoading, isError, refetch } = useQuery<ProgramRow[]>({
    queryKey: ["volunteer-programs", "admin", "programs", statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      return (await api.get(`/volunteer-programs/admin/programs${params.toString() ? `?${params}` : ""}`)).data.data;
    },
    enabled: !authLoading && Boolean(user?.roles.includes("SUPER_ADMIN")),
  });

  if (!authLoading && !user?.roles.includes("SUPER_ADMIN")) {
    return <div className="rounded-xl border border-red-100 bg-red-50 p-6 text-sm text-red-700">Akses Superadmin diperlukan untuk panel volunteer.</div>;
  }

  const filters = ["", "UNDER_REVIEW", "REGISTRATION_OPEN", "ONGOING", "COMPLETED", "CANCELLED"];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-komuna-navy">Program Relawan</h1>
        <p className="text-sm text-gray-500 mt-1">Kelola program volunteer</p>
      </div>

      <div className="flex gap-1 bg-white rounded-lg p-1 shadow-sm w-fit flex-wrap">
        {[...filters].map((v) => (
          <button key={v} onClick={() => setStatusFilter(v)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${statusFilter === v ? "bg-komuna-blue text-white" : "text-gray-600 hover:bg-gray-100"}`}>
            {v === "" ? "Semua" : (STATUS_LABELS[v] || v)}
          </button>
        ))}
      </div>

      {isLoading ? (
        <DashboardLoadingState label="Memuat program volunteer" />
      ) : isError ? (
        <DashboardErrorState onRetry={() => refetch()} />
      ) : !data?.length ? (
        <DashboardEmptyState title="Belum ada program volunteer" description="Program relawan akan muncul di sini." />
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Program</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 hidden md:table-cell">Organizer</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-500">Status</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-500">Relawan</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 hidden md:table-cell">Tanggal</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {data.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{p.title}</p>
                      <p className="text-xs text-gray-400">{p.organizerType === "COMMUNITY" ? p.community?.name : p.organizer?.name}</p>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-gray-500 text-xs">{p.organizerType === "COMMUNITY" ? (p.community?.name || "-") : (p.organizer?.name || "-")}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[p.status] || "bg-gray-100 text-gray-600"}`}>{STATUS_LABELS[p.status] || p.status}</span>
                    </td>
                    <td className="px-4 py-3 text-center text-gray-600">{p.volunteers}/{p.capacity}</td>
                    <td className="px-4 py-3 hidden md:table-cell text-gray-500 text-xs">
                      {new Date(p.startDate).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
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
