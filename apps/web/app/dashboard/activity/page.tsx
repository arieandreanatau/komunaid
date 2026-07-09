"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

export default function ActivityPage() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["activity", page],
    queryFn: async () => {
      const res = await api.get(`/users/activity?page=${page}&limit=20`);
      return res.data;
    },
  });

  const activities = data?.data || [];
  const pagination = data?.pagination;

  const actionLabels: Record<string, string> = {
    USER_REGISTER: "Mendaftar",
    USER_LOGIN: "Login",
    USER_LOGOUT: "Logout",
    USER_UPDATE_PROFILE: "Update profile",
    USER_UPDATE_INTERESTS: "Update minat",
    USER_CHANGE_PASSWORD: "Ubah password",
    USER_RESET_PASSWORD: "Reset password",
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-komuna-navy">Riwayat Aktivitas</h1>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        {isLoading ? (
          <div className="p-6 space-y-4">{[1, 2, 3].map(i => <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />)}</div>
        ) : activities.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <svg className="h-12 w-12 mx-auto text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <p className="text-sm">Belum ada aktivitas</p>
          </div>
        ) : (
          <div className="divide-y">
            {activities.map((a: { id: string; action: string; details?: Record<string, unknown>; createdAt: string }) => (
              <div key={a.id} className="px-6 py-4 flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{actionLabels[a.action] || a.action}</p>
                  <p className="text-xs text-gray-400">{new Date(a.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-3 border-t">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="text-sm text-komuna-blue hover:underline disabled:text-gray-400">
              Sebelumnya
            </button>
            <span className="text-sm text-gray-500">Halaman {page} dari {pagination.totalPages}</span>
            <button onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))} disabled={page === pagination.totalPages}
              className="text-sm text-komuna-blue hover:underline disabled:text-gray-400">
              Selanjutnya
            </button>
          </div>
        )}
      </div>
    </div>
  );
}