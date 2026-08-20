"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/components/auth-provider";
import { DashboardEmptyState, DashboardErrorState, DashboardLoadingState } from "@/components/member-dashboard-ui";

interface ApplicationRow {
  id: string;
  applicant: { id: string; name: string; email: string };
  program: { id: string; title: string };
  status: string;
  motivation: string | null;
  reviewNote: string | null;
  appliedAt: string;
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending", ACCEPTED: "Diterima", REJECTED: "Ditolak",
  CANCELLED_BY_USER: "Batal (Peserta)", CANCELLED_BY_ORGANIZER: "Batal (Organizer)",
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700", ACCEPTED: "bg-green-100 text-green-700", REJECTED: "bg-red-100 text-red-700",
  CANCELLED_BY_USER: "bg-gray-100 text-gray-600", CANCELLED_BY_ORGANIZER: "bg-gray-200 text-gray-600",
};

export default function VolunteerApplicationsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, refetch } = useQuery<{ items: ApplicationRow[]; pagination: { page: number; totalPages: number; total: number } }>({
    queryKey: ["volunteer-programs", "admin", "applications", statusFilter, page],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page) });
      if (statusFilter) params.set("status", statusFilter);
      const res = await api.get(`/volunteer-programs/admin/applications${params.toString() ? `?${params}` : ""}`);
      return { items: res.data.data || [], pagination: res.data.pagination };
    },
    enabled: !authLoading && Boolean(user?.roles.includes("SUPER_ADMIN")),
  });

  if (!authLoading && !user?.roles.includes("SUPER_ADMIN")) {
    return <div className="rounded-xl border border-red-100 bg-red-50 p-6 text-sm text-red-700">Akses Superadmin diperlukan untuk panel volunteer.</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-komuna-navy">Pengajuan Relawan</h1>
        <p className="text-sm text-gray-500 mt-1">Review dan kelola aplikasi volunteer</p>
      </div>

      <div className="flex gap-1 bg-white rounded-lg p-1 shadow-sm w-fit flex-wrap">
        {[{ v: "", l: "Semua" }, { v: "PENDING", l: "Pending" }, { v: "ACCEPTED", l: "Diterima" }, { v: "REJECTED", l: "Ditolak" }].map((t) => (
          <button key={t.v} onClick={() => { setStatusFilter(t.v); setPage(1); }}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${statusFilter === t.v ? "bg-komuna-blue text-white" : "text-gray-600 hover:bg-gray-100"}`}>
            {t.l}
          </button>
        ))}
      </div>

      {isLoading ? (
        <DashboardLoadingState label="Memuat pengajuan relawan" />
      ) : isError ? (
        <DashboardErrorState onRetry={() => refetch()} />
      ) : !data?.items.length ? (
        <DashboardEmptyState title="Belum ada pengajuan" description="Pengajuan volunteer akan muncul di sini." />
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Pelamar</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Program</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-500">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 hidden md:table-cell">Tanggal Daftar</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {data.items.map((a) => (
                  <tr key={a.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{a.applicant.name}</p>
                      <p className="text-xs text-gray-400">{a.applicant.email}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{a.program.title}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[a.status] || "bg-gray-100 text-gray-600"}`}>{STATUS_LABELS[a.status] || a.status}</span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-gray-500 text-xs">
                      {new Date(a.appliedAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {data.pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 border-t border-gray-100 px-4 py-3">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page <= 1}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40"
              >
                Sebelumnya
              </button>
              <span className="text-sm text-gray-500">Halaman {data.pagination.page} dari {data.pagination.totalPages}</span>
              <button
                onClick={() => setPage(Math.min(data.pagination.totalPages, page + 1))}
                disabled={page >= data.pagination.totalPages}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40"
              >
                Selanjutnya
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
