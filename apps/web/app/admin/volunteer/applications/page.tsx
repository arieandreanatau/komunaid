"use client";

import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";

interface Application {
  id: string;
  applicant: { id: string; name: string; email: string };
  program: { id: string; name: string };
  status: string;
  appliedAt: string;
}

export default function VolunteerApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = {};
      if (statusFilter) params.status = statusFilter;
      const { data } = await api.get("/admin/volunteer/applications", { params });
      setApplications(data.data || []);
    } catch { /* empty */ }
    finally { setLoading(false); }
  }, [statusFilter]);

  useEffect(() => { fetchApplications(); }, [fetchApplications]);

  const statusColors: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-700",
    APPROVED: "bg-green-100 text-green-700",
    REJECTED: "bg-red-100 text-red-700",
    WITHDRAWN: "bg-gray-100 text-gray-600",
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-komuna-navy">Pengajuan Relawan</h1>
          <p className="text-sm text-gray-500 mt-1">Review dan kelola aplikasi volunteer</p>
        </div>
      </div>

      <div className="flex gap-1 bg-white rounded-lg p-1 shadow-sm w-fit">
        {[{ v: "", l: "Semua" }, { v: "PENDING", l: "Pending" }, { v: "APPROVED", l: "Disetujui" }, { v: "REJECTED", l: "Ditolak" }].map((t) => (
          <button key={t.v} onClick={() => setStatusFilter(t.v)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${statusFilter === t.v ? "bg-komuna-blue text-white" : "text-gray-600 hover:bg-gray-100"}`}>
            {t.l}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-4 shadow-sm animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-1/4" />
            </div>
          ))}
        </div>
      ) : applications.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-sm">
          <svg className="h-12 w-12 text-gray-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-gray-500 font-medium">Belum ada pengajuan</p>
          <p className="text-sm text-gray-400 mt-1">Pengajuan volunteer akan muncul di sini</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Applicant</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Program</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-500">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 hidden md:table-cell">Applied Date</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {applications.map((a) => (
                  <tr key={a.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-900">{a.applicant.name}</p>
                        <p className="text-xs text-gray-400">{a.applicant.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{a.program.name}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[a.status] || "bg-gray-100 text-gray-600"}`}>
                        {a.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-gray-500 text-xs">
                      {new Date(a.appliedAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
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
