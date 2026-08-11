"use client";

import Link from "next/link";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { Pagination } from "@/components/pagination";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import {
  DashboardEmptyState,
  DashboardErrorState,
  DashboardLoadingState,
  DashboardPageHeader,
  DashboardSurface,
} from "@/components/member-dashboard-ui";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: "SYSTEM" | "COMMUNITY" | "ORGANIZATION" | "EVENT" | "REPORT" | "APPROVAL";
  isRead: boolean;
  link?: string | null;
  createdAt: string;
}

const NOTIFICATION_TYPE: Record<NotificationItem["type"], { label: string; variant: string }> = {
  SYSTEM: { label: "Sistem", variant: "primary" },
  COMMUNITY: { label: "Komunitas", variant: "success" },
  ORGANIZATION: { label: "Organisasi", variant: "info" },
  EVENT: { label: "Event", variant: "info" },
  REPORT: { label: "Laporan", variant: "danger" },
  APPROVAL: { label: "Persetujuan", variant: "warning" },
};

export default function NotificationsPage() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  const [page, setPage] = useState(1);

  const notificationsQuery = useQuery({
    queryKey: ["notifications", "list", page],
    queryFn: async () => {
      const response = await api.get(`/users/notifications?page=${page}&limit=20`);
      return response.data;
    },
  });

  const refreshNotifications = async () => {
    await queryClient.invalidateQueries({ queryKey: ["notifications"] });
  };
  const markReadMutation = useMutation({
    mutationFn: (id: string) => api.put(`/users/notifications/${id}/read`),
    onSuccess: refreshNotifications,
    onError: () => addToast("Notifikasi gagal ditandai sudah dibaca.", "error"),
  });
  const markAllReadMutation = useMutation({
    mutationFn: () => api.put("/users/notifications/read-all"),
    onSuccess: async () => {
      await refreshNotifications();
      addToast("Semua notifikasi ditandai sudah dibaca.", "success");
    },
    onError: () => addToast("Notifikasi gagal diperbarui.", "error"),
  });

  const notifications: NotificationItem[] = notificationsQuery.data?.data || [];
  const pagination = notificationsQuery.data?.pagination;

  return (
    <div className="space-y-6 pb-8">
      <DashboardPageHeader
        title="Notifikasi"
        description="Pantau pembaruan komunitas, event, dan informasi penting akun Anda."
        action={
          <button
            type="button"
            onClick={() => markAllReadMutation.mutate()}
            disabled={notificationsQuery.isLoading || notifications.length === 0 || markAllReadMutation.isPending}
            className="rounded-lg border border-komuna-blue px-4 py-2.5 text-sm font-bold text-komuna-blue transition-colors hover:bg-blue-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-komuna-blue focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {markAllReadMutation.isPending ? "Memperbarui..." : "Tandai Semua Dibaca"}
          </button>
        }
      />

      <DashboardSurface>
        {notificationsQuery.isLoading ? (
          <DashboardLoadingState label="Memuat notifikasi" />
        ) : notificationsQuery.isError ? (
          <DashboardErrorState title="Notifikasi tidak dapat dimuat" onRetry={() => notificationsQuery.refetch()} />
        ) : notifications.length === 0 ? (
          <DashboardEmptyState
            title="Belum ada notifikasi"
            description="Pembaruan komunitas, event, dan sistem akan muncul di sini."
            icon={
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            }
          />
        ) : (
          <ul className="divide-y divide-slate-100" aria-label="Daftar notifikasi">
            {notifications.map((notification) => {
              const type = NOTIFICATION_TYPE[notification.type] || { label: notification.type, variant: "default" };
              const href = notification.link?.startsWith("/") ? notification.link : "/dashboard/notifications";
              return (
                <li key={notification.id} className={`relative p-4 transition-colors sm:p-5 ${notification.isRead ? "bg-white" : "bg-blue-50/45"}`}>
                  <div className="flex items-start gap-3 sm:gap-4">
                    <span className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${notification.isRead ? "bg-slate-100 text-slate-500" : "bg-komuna-blue text-white"}`} aria-hidden="true">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5" />
                      </svg>
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link href={href} className="font-bold text-slate-800 hover:text-komuna-blue focus:outline-none focus-visible:underline">
                          {notification.title}
                        </Link>
                        <Badge variant={type.variant}>{type.label}</Badge>
                        {!notification.isRead && <span className="text-xs font-bold text-komuna-blue">Belum dibaca</span>}
                      </div>
                      <p className="mt-1 text-sm leading-6 text-slate-600">{notification.message}</p>
                      <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <time dateTime={notification.createdAt} className="text-xs text-slate-400">
                          {new Date(notification.createdAt).toLocaleString("id-ID", { dateStyle: "long", timeStyle: "short" })}
                        </time>
                        {!notification.isRead && (
                          <button
                            type="button"
                            onClick={() => markReadMutation.mutate(notification.id)}
                            disabled={markReadMutation.isPending}
                            className="w-fit text-xs font-bold text-komuna-blue hover:text-komuna-navy focus:outline-none focus-visible:underline disabled:cursor-wait disabled:opacity-50"
                          >
                            Tandai sudah dibaca
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </DashboardSurface>

      {pagination?.totalPages > 1 && (
        <Pagination page={page} totalPages={pagination.totalPages} onPageChange={setPage} />
      )}
    </div>
  );
}
