"use client";

import Link from "next/link";
import type { ActivityItem, DashboardData } from "./types";

function formatActivityDetails(details: unknown): string | null {
  if (typeof details === "string") return details;
  if (!details || typeof details !== "object" || Array.isArray(details)) return null;

  const values = Object.values(details as Record<string, unknown>);
  const text = values.find((value): value is string => typeof value === "string" && value.trim().length > 0);
  return text || null;
}

export function RingkasanTab({
  communityId,
  communityPath,
  community,
  pendingRequests,
  activeEvents,
  recentActivity,
}: {
  communityId: string;
  communityPath: string;
  community: DashboardData["community"];
  pendingRequests: number;
  activeEvents: number;
  recentActivity: ActivityItem[];
}) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        {[
          ["Anggota", community.memberCount],
          ["Permintaan", pendingRequests],
          ["Event", activeEvents],
          ["Volunteer", 0],
          ["Aktivitas", recentActivity.length],
          ["Status", community.status === "ACTIVE" ? "Aktif" : community.status],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="truncate text-xs font-medium text-slate-500">{label}</p>
            <p className="mt-1 truncate text-xl font-bold text-komuna-navy">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-amber-700">Perlu Tindakan</p>
          <div className="mt-3 space-y-2 text-sm">
            <Link href={`/dashboard/communities/${communityPath}/requests`} className="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-slate-700 hover:text-komuna-blue">
              Permintaan anggota <span className="font-bold text-amber-700">{pendingRequests}</span>
            </Link>
            <Link href="#" className="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-slate-700 hover:text-komuna-blue">
              Event menunggu review <span className="font-bold text-slate-500">0</span>
            </Link>
            <Link href="#" className="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-slate-700 hover:text-komuna-blue">
              Volunteer menunggu review <span className="font-bold text-slate-500">0</span>
            </Link>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Aktivitas Operasional</p>
          <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-lg bg-slate-50 p-3"><p className="text-xl font-bold text-komuna-navy">{activeEvents}</p><p className="text-xs text-slate-500">Event mendatang</p></div>
            <div className="rounded-lg bg-slate-50 p-3"><p className="text-xl font-bold text-komuna-navy">0</p><p className="text-xs text-slate-500">Volunteer aktif</p></div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-komuna-navy mb-4">Informasi Komunitas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Nama</span>
            <p className="font-medium text-komuna-navy">{community.name}</p>
          </div>
          <div>
            <span className="text-gray-500">Visibilitas</span>
            <p className="font-medium text-komuna-navy">{community.visibility === "PUBLIC" ? "Publik" : "Privat"}</p>
          </div>
          <div>
            <span className="text-gray-500">Tipe Keanggotaan</span>
            <p className="font-medium text-komuna-navy">{community.membershipType === "OPEN" ? "Terbuka" : "Terbatas"}</p>
          </div>
          <div>
            <span className="text-gray-500">Dibuat</span>
            <p className="font-medium text-komuna-navy">
              {new Date(community.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-komuna-navy mb-4">Aktivitas Terbaru</h3>
        {recentActivity.length === 0 ? (
          <p className="text-gray-400 text-sm">Belum ada aktivitas.</p>
        ) : (
          <div className="space-y-3">
            {recentActivity.map((activity) => {
              const details = formatActivityDetails(activity.details);
              return (
              <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                {activity.userAvatar ? (
                  <img src={activity.userAvatar} alt="" className="h-8 w-8 rounded-full object-cover flex-shrink-0" />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-komuna-blue/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-komuna-blue text-xs font-bold">{activity.userName?.[0]}</span>
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-gray-700">
                    <span className="font-medium text-komuna-navy">{activity.userName}</span>{" "}
                    {activity.action}
                  </p>
                  {details && <p className="text-xs text-gray-400 mt-0.5">{details}</p>}
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(activity.createdAt).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}
                  </p>
                </div>
              </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
