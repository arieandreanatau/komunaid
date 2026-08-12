"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { Pagination } from "@/components/pagination";
import {
  DashboardEmptyState,
  DashboardErrorState,
  DashboardLoadingState,
  DashboardPageHeader,
  DashboardSurface,
} from "@/components/member-dashboard-ui";

interface ActivityItem {
  id: string;
  action: string;
  details?: Record<string, unknown> | null;
  createdAt: string;
}

const ACTION_LABELS: Record<string, string> = {
  USER_REGISTER: "Mendaftarkan akun",
  USER_LOGIN: "Masuk ke akun",
  USER_LOGOUT: "Keluar dari akun",
  USER_UPDATE_PROFILE: "Memperbarui profil",
  USER_UPDATE_INTERESTS: "Memperbarui minat",
  USER_CHANGE_PASSWORD: "Mengubah password",
  USER_RESET_PASSWORD: "Mereset password",
  COMMUNITY_CREATE: "Membuat komunitas",
  COMMUNITY_SUBMITTED: "Mengirim pengajuan komunitas",
  COMMUNITY_MEMBER_JOIN: "Bergabung dengan komunitas",
  COMMUNITY_JOIN_REQUEST_CREATE: "Mengirim permintaan bergabung",
  EVENT_REGISTER: "Mendaftar event",
};

function getResource(details?: Record<string, unknown> | null) {
  if (!details) return null;
  const values = [details.communityName, details.eventTitle, details.organizationName, details.resourceName];
  return values.find((value): value is string => typeof value === "string" && value.trim().length > 0) || null;
}

function formatAction(action: string) {
  if (ACTION_LABELS[action]) return ACTION_LABELS[action];
  return action.replaceAll("_", " ").toLocaleLowerCase("id-ID").replace(/^./, (letter) => letter.toUpperCase());
}

export default function ActivityPage() {
  const [page, setPage] = useState(1);
  const activityQuery = useQuery({
    queryKey: ["activity", "list", page],
    queryFn: async () => {
      const response = await api.get(`/users/activity?page=${page}&limit=20`);
      return response.data;
    },
  });

  const activities: ActivityItem[] = activityQuery.data?.data || [];
  const pagination = activityQuery.data?.pagination;

  return (
    <div className="space-y-6 pb-8">
      <DashboardPageHeader
        title="Aktivitas Saya"
        description="Lihat riwayat tindakan penting yang tercatat pada akun Anda."
      />

      <DashboardSurface>
        {activityQuery.isLoading ? (
          <DashboardLoadingState label="Memuat aktivitas" />
        ) : activityQuery.isError ? (
          <DashboardErrorState title="Aktivitas tidak dapat dimuat" onRetry={() => activityQuery.refetch()} />
        ) : activities.length === 0 ? (
          <DashboardEmptyState
            title="Belum ada aktivitas"
            description="Aktivitas akun, komunitas, dan event yang didukung sistem akan muncul di sini."
            icon={
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
        ) : (
          <ol className="divide-y divide-slate-100" aria-label="Riwayat aktivitas">
            {activities.map((activity) => {
              const resource = getResource(activity.details);
              return (
                <li key={activity.id} className="flex gap-4 p-4 sm:p-5">
                  <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-komuna-blue" aria-hidden="true">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-slate-800">{formatAction(activity.action)}</p>
                    {resource && <p className="mt-0.5 text-sm text-slate-500">{resource}</p>}
                    <time dateTime={activity.createdAt} className="mt-1.5 block text-xs text-slate-400">
                      {new Date(activity.createdAt).toLocaleString("id-ID", { dateStyle: "long", timeStyle: "short" })}
                    </time>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </DashboardSurface>

      {pagination?.totalPages > 1 && (
        <Pagination page={page} totalPages={pagination.totalPages} onPageChange={setPage} />
      )}
    </div>
  );
}
