"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";

export default function NotificationsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["notifications", page],
    queryFn: async () => {
      const res = await api.get(`/users/notifications?page=${page}&limit=20`);
      return res.data;
    },
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => api.put(`/users/notifications/${id}/read`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => api.put("/users/notifications/read-all"),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const notifications = data?.data || [];
  const pagination = data?.pagination;

  const typeColors: Record<string, string> = {
    SYSTEM: "bg-blue-100 text-blue-700",
    COMMUNITY: "bg-green-100 text-green-700",
    EVENT: "bg-purple-100 text-purple-700",
    REPORT: "bg-red-100 text-red-700",
    APPROVAL: "bg-yellow-100 text-yellow-700",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-komuna-navy">Notifikasi</h1>
        <button onClick={() => markAllReadMutation.mutate()}
          className="text-sm text-komuna-blue hover:underline font-medium">
          Tandai semua sudah dibaca
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        {isLoading ? (
          <div className="p-6 space-y-4">{[1, 2, 3].map(i => <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />)}</div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <svg className="h-12 w-12 mx-auto text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
            <p className="text-sm">Tidak ada notifikasi baru</p>
          </div>
        ) : (
          <div className="divide-y">
            {notifications.map((n: { id: string; title: string; message: string; type: string; isRead: boolean; createdAt: string }) => (
              <div key={n.id} className={`px-6 py-4 flex items-start gap-3 hover:bg-gray-50 ${!n.isRead ? "bg-komuna-blue/5" : ""}`}
                onClick={() => { if (!n.isRead) markReadMutation.mutate(n.id); }}>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className={`text-sm font-medium ${!n.isRead ? "text-gray-900" : "text-gray-600"}`}>{n.title}</h3>
                    <span className={`px-1.5 py-0.5 text-xs rounded-full ${typeColors[n.type] || "bg-gray-100 text-gray-600"}`}>
                      {n.type}
                    </span>
                    {!n.isRead && <div className="h-2 w-2 rounded-full bg-komuna-blue" />}
                  </div>
                  <p className="text-sm text-gray-500">{n.message}</p>
                  <p className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
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