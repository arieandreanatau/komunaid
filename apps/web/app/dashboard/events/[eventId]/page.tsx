"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { useAuth } from "@/components/auth-provider";

interface DashboardData {
  event: {
    id: string;
    title: string;
    slug: string;
    status: string;
    eventDate: string;
    endDate: string;
    location: string;
    locationType: string;
    meetingUrl: string;
    quota: number;
    allowWaitlist: boolean;
    registeredCount: number;
    waitlistCount: number;
    community: { id: string; name: string; slug: string } | null;
    organization: { id: string; name: string; slug: string } | null;
  };
  stats: {
    totalRegistered: number;
    confirmed: number;
    pending: number;
    waitlisted: number;
    cancelled: number;
    checkedIn: number;
    checkedOut: number;
    absent: number;
  };
  recentRegistrations: Array<{
    id: string;
    user: { id: string; name: string; avatar: string | null; email: string };
    status: string;
    attendance: string;
    registeredAt: string;
  }>;
}

interface Participant {
  id: string;
  user: { id: string; name: string; avatar: string | null; email: string };
  status: string;
  attendance: string;
  registeredAt: string;
  checkedInAt: string | null;
}

const EVENT_STATUS_MAP: Record<string, { label: string; className: string }> = {
  DRAFT: { label: "Draft", className: "bg-gray-100 text-gray-600" },
  SUBMITTED: { label: "Dikirim", className: "bg-blue-100 text-blue-700" },
  IN_REVIEW: { label: "Sedang Ditinjau", className: "bg-blue-100 text-blue-700" },
  REVISION_REQUESTED: { label: "Perlu Revisi", className: "bg-yellow-100 text-yellow-700" },
  REJECTED: { label: "Ditolak", className: "bg-red-100 text-red-700" },
  RESUBMITTED: { label: "Dikirim Ulang", className: "bg-blue-100 text-blue-700" },
  APPROVED: { label: "Disetujui", className: "bg-green-100 text-green-700" },
  PUBLISHED: { label: "Diterbitkan", className: "bg-blue-100 text-blue-700" },
  REGISTRATION_OPEN: { label: "Pendaftaran Buka", className: "bg-green-100 text-green-700" },
  REGISTRATION_CLOSED: { label: "Pendaftaran Tutup", className: "bg-yellow-100 text-yellow-700" },
  ONGOING: { label: "Berlangsung", className: "bg-purple-100 text-purple-700" },
  COMPLETED: { label: "Selesai", className: "bg-green-200 text-green-800" },
  CANCELLED: { label: "Dibatalkan", className: "bg-red-100 text-red-700" },
  ARCHIVED: { label: "Diarsipkan", className: "bg-gray-200 text-gray-700" },
};

const STATUS_TRANSITIONS: Record<string, string[]> = {
  DRAFT: ["SUBMITTED", "CANCELLED"],
  REVISION_REQUESTED: ["SUBMITTED", "CANCELLED"],
  PUBLISHED: ["REGISTRATION_OPEN", "CANCELLED"],
  REGISTRATION_OPEN: ["REGISTRATION_CLOSED", "CANCELLED"],
  REGISTRATION_CLOSED: ["ONGOING", "CANCELLED"],
  ONGOING: ["COMPLETED", "CANCELLED"],
  COMPLETED: ["ARCHIVED"],
};

const STATUS_LABELS: Record<string, string> = {
  SUBMITTED: "Kirim untuk Review",
  PUBLISHED: "Terbitkan",
  REGISTRATION_OPEN: "Buka Pendaftaran",
  REGISTRATION_CLOSED: "Tutup Pendaftaran",
  ONGOING: "Mulai Event",
  COMPLETED: "Selesai",
  CANCELLED: "Batalkan",
  ARCHIVED: "Arsipkan",
};

const STATUS_ENDPOINTS: Record<string, string> = {
  SUBMITTED: "submit",
  PUBLISHED: "publish",
  REGISTRATION_OPEN: "open-registration",
  REGISTRATION_CLOSED: "close-registration",
  ONGOING: "start",
  COMPLETED: "complete",
  CANCELLED: "cancel",
  ARCHIVED: "archive",
};

export default function EventDashboardPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.eventId as string;
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"summary" | "participants" | "analytics">("summary");

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, authLoading, router]);

  const { data: dashboard, isLoading } = useQuery({
    queryKey: ["eventDashboard", eventId],
    enabled: !!isAuthenticated && !!eventId,
    queryFn: async () => {
      const res = await api.get(`/events/${eventId}/dashboard`);
      return res.data.dashboard || res.data.data || res.data as DashboardData;
    },
  });

  const { data: participantsData, isLoading: participantsLoading } = useQuery({
    queryKey: ["eventParticipants", eventId],
    enabled: !!isAuthenticated && !!eventId && activeTab === "participants",
    queryFn: async () => {
      const res = await api.get(`/events/${eventId}/participants`);
      return res.data;
    },
  });

  const statusMutation = useMutation({
    mutationFn: async (newStatus: string) => {
      const endpoint = STATUS_ENDPOINTS[newStatus];
      if (!endpoint) throw new Error("Transisi status tidak didukung");
      return api.post(`/events/${eventId}/${endpoint}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["eventDashboard", eventId] });
    },
  });

  const checkInMutation = useMutation({
    mutationFn: async (participantId: string) => {
      return api.post(`/events/${eventId}/participants/${participantId}/check-in`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["eventParticipants", eventId] });
      queryClient.invalidateQueries({ queryKey: ["eventDashboard", eventId] });
    },
  });

  const checkOutMutation = useMutation({
    mutationFn: async (participantId: string) => {
      return api.post(`/events/${eventId}/participants/${participantId}/check-out`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["eventParticipants", eventId] });
      queryClient.invalidateQueries({ queryKey: ["eventDashboard", eventId] });
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (participantId: string) => {
      return api.patch(`/events/${eventId}/participants/${participantId}/approve`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["eventParticipants", eventId] });
      queryClient.invalidateQueries({ queryKey: ["eventDashboard", eventId] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (participantId: string) => {
      return api.patch(`/events/${eventId}/participants/${participantId}/reject`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["eventParticipants", eventId] });
      queryClient.invalidateQueries({ queryKey: ["eventDashboard", eventId] });
    },
  });

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatShortDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-8 w-8 border-4 border-komuna-blue border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  if (!dashboard) {
    return (
      <div className="text-center py-12">
        <svg className="h-12 w-12 text-gray-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-gray-500">Event tidak ditemukan</p>
      </div>
    );
  }

  const { event, stats, recentRegistrations } = dashboard;
  const statusInfo = EVENT_STATUS_MAP[event.status] || EVENT_STATUS_MAP.DRAFT;
  const transitions = STATUS_TRANSITIONS[event.status] || [];
  const quotaPercent = event.quota > 0 ? Math.round((stats.confirmed / event.quota) * 100) : 0;
  const attendanceRate = stats.confirmed > 0 ? Math.round((stats.checkedIn / stats.confirmed) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/dashboard/events" className="text-sm text-komuna-blue hover:underline">
              Event Saya
            </Link>
            <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-sm text-gray-500">Dashboard</span>
          </div>
          <h1 className="text-2xl font-bold text-komuna-navy">{event.title}</h1>
          <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.className}`}>
              {statusInfo.label}
            </span>
            <span>{formatDate(event.eventDate)}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/events/${event.slug}`}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Lihat
          </Link>
          <Link
            href={`/dashboard/events/${eventId}/edit`}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-komuna-blue border border-komuna-blue/30 rounded-lg hover:bg-komuna-blue/5 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit
          </Link>
          <Link
            href={`/dashboard/events/${eventId}/participants`}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-komuna-teal border border-komuna-teal/30 rounded-lg hover:bg-komuna-teal/5 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            Peserta
          </Link>
        </div>
      </div>

      {/* Status Actions */}
      {transitions.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <h3 className="text-sm font-medium text-gray-500 mb-3">Aksi Status</h3>
          <div className="flex flex-wrap gap-2">
            {transitions.map((s) => {
              const info = EVENT_STATUS_MAP[s];
              const isDanger = s === "CANCELLED";
              return (
                <button
                  key={s}
                  disabled={statusMutation.isPending}
                  onClick={() => {
                    const msg = isDanger
                      ? "Yakin ingin membatalkan event ini?"
                      : `Ubah status ke "${info.label}"?`;
                    if (confirm(msg)) statusMutation.mutate(s);
                  }}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 ${
                    isDanger
                      ? "text-red-600 bg-red-50 border border-red-200 hover:bg-red-100"
                      : "text-komuna-blue bg-komuna-blue/5 border border-komuna-blue/30 hover:bg-komuna-blue/10"
                  }`}
                >
                  {statusMutation.isPending && (
                    <div className="h-3.5 w-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  )}
                  {STATUS_LABELS[s] || s}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-0">
          {[
            { key: "summary" as const, label: "Ringkasan" },
            { key: "participants" as const, label: "Peserta" },
            { key: "analytics" as const, label: "Analitik" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? "border-komuna-blue text-komuna-blue"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Tab */}
      {activeTab === "summary" && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <p className="text-sm text-gray-500">Total Terdaftar</p>
              <p className="text-2xl font-bold text-komuna-navy mt-1">{stats.totalRegistered}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <p className="text-sm text-gray-500">Dikonfirmasi</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{stats.confirmed}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <p className="text-sm text-gray-500">Hadir</p>
              <p className="text-2xl font-bold text-komuna-blue mt-1">{stats.checkedIn}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <p className="text-sm text-gray-500">Tingkat Kehadiran</p>
              <p className="text-2xl font-bold text-komuna-teal mt-1">{attendanceRate}%</p>
            </div>
          </div>

          {/* Quota Bar */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-700">Kapasitas</h3>
              <span className="text-sm text-gray-500">{stats.confirmed}/{event.quota} ({quotaPercent}%)</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-komuna-blue to-komuna-teal h-3 rounded-full transition-all"
                style={{ width: `${Math.min(quotaPercent, 100)}%` }}
              />
            </div>
            {event.allowWaitlist && stats.waitlisted > 0 && (
              <p className="text-xs text-gray-500 mt-2">{stats.waitlisted} di waiting list</p>
            )}
          </div>

          {/* Event Info */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Informasi Event</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Tanggal Mulai</p>
                <p className="font-medium text-gray-900">{formatDate(event.eventDate)}</p>
              </div>
              {event.endDate && (
                <div>
                  <p className="text-gray-500">Tanggal Selesai</p>
                  <p className="font-medium text-gray-900">{formatDate(event.endDate)}</p>
                </div>
              )}
              <div>
                <p className="text-gray-500">Tipe Lokasi</p>
                <p className="font-medium text-gray-900">{event.locationType}</p>
              </div>
              {event.location && (
                <div>
                  <p className="text-gray-500">Lokasi</p>
                  <p className="font-medium text-gray-900">{event.location}</p>
                </div>
              )}
              <div>
                <p className="text-gray-500">Kuota</p>
                <p className="font-medium text-gray-900">{event.quota} peserta</p>
              </div>
              <div>
                <p className="text-gray-500">Waiting List</p>
                <p className="font-medium text-gray-900">{event.allowWaitlist ? "Aktif" : "Nonaktif"}</p>
              </div>
            </div>
          </div>

          {/* Recent Registrations */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-700">Pendaftaran Terbaru</h3>
              <button
                onClick={() => setActiveTab("participants")}
                className="text-xs text-komuna-blue hover:underline"
              >
                Lihat Semua
              </button>
            </div>
            {recentRegistrations && recentRegistrations.length > 0 ? (
              <div className="space-y-3">
                {recentRegistrations.slice(0, 5).map((reg: any) => (
                  <div key={reg.id} className="flex items-center gap-3">
                    {reg.user.avatar ? (
                      <img src={reg.user.avatar} alt={reg.user.name} className="h-8 w-8 rounded-full object-cover" />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-komuna-blue/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-komuna-blue font-bold text-xs">{reg.user.name[0]}</span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{reg.user.name}</p>
                      <p className="text-xs text-gray-500">{formatShortDate(reg.registeredAt)}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      reg.status === "CONFIRMED" ? "bg-green-100 text-green-700" :
                      reg.status === "PENDING" ? "bg-yellow-100 text-yellow-700" :
                      "bg-gray-100 text-gray-600"
                    }`}>
                      {reg.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">Belum ada pendaftaran</p>
            )}
          </div>
        </div>
      )}

      {/* Participants Tab */}
      {activeTab === "participants" && (
        <div>
          {participantsLoading ? (
            <div className="text-center py-12">
              <div className="h-8 w-8 border-4 border-komuna-blue border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm text-gray-500 mt-3">Memuat peserta...</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-500">
                  {participantsData?.participants?.length || 0} peserta
                </p>
                <Link
                  href={`/dashboard/events/${eventId}/participants`}
                  className="text-sm text-komuna-blue hover:underline font-medium"
                >
                  Kelola Semua Peserta
                </Link>
              </div>
              {participantsData?.participants?.length > 0 ? (
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-100 bg-gray-50">
                          <th className="text-left px-4 py-3 font-medium text-gray-500">Nama</th>
                          <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
                          <th className="text-left px-4 py-3 font-medium text-gray-500">Kehadiran</th>
                          <th className="text-right px-4 py-3 font-medium text-gray-500">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {participantsData.participants.slice(0, 10).map((p: Participant) => (
                          <tr key={p.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                {p.user.avatar ? (
                                  <img src={p.user.avatar} alt={p.user.name} className="h-8 w-8 rounded-full object-cover" />
                                ) : (
                                  <div className="h-8 w-8 rounded-full bg-komuna-blue/10 flex items-center justify-center flex-shrink-0">
                                    <span className="text-komuna-blue font-bold text-xs">{p.user.name[0]}</span>
                                  </div>
                                )}
                                <div>
                                  <p className="font-medium text-gray-900">{p.user.name}</p>
                                  <p className="text-xs text-gray-500">{p.user.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                p.status === "CONFIRMED" ? "bg-green-100 text-green-700" :
                                p.status === "PENDING" ? "bg-yellow-100 text-yellow-700" :
                                p.status === "WAITLISTED" ? "bg-orange-100 text-orange-700" :
                                "bg-red-100 text-red-700"
                              }`}>
                                {p.status}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                p.attendance === "CHECKED_IN" ? "bg-green-100 text-green-700" :
                                p.attendance === "CHECKED_OUT" ? "bg-blue-100 text-blue-700" :
                                p.attendance === "ABSENT" ? "bg-red-100 text-red-700" :
                                "bg-gray-100 text-gray-600"
                              }`}>
                                {p.attendance === "CHECKED_IN" ? "Hadir" :
                                 p.attendance === "CHECKED_OUT" ? "Selesai" :
                                 p.attendance === "ABSENT" ? "Absen" : "Terdaftar"}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-end gap-1">
                                {p.status === "PENDING" && (
                                  <>
                                    <button
                                      onClick={() => approveMutation.mutate(p.id)}
                                      disabled={approveMutation.isPending}
                                      className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors"
                                      title="Setuju"
                                    >
                                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                      </svg>
                                    </button>
                                    <button
                                      onClick={() => rejectMutation.mutate(p.id)}
                                      disabled={rejectMutation.isPending}
                                      className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                                      title="Tolak"
                                    >
                                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                      </svg>
                                    </button>
                                  </>
                                )}
                                {p.status === "CONFIRMED" && p.attendance !== "CHECKED_IN" && p.attendance !== "CHECKED_OUT" && (
                                  <button
                                    onClick={() => checkInMutation.mutate(p.id)}
                                    disabled={checkInMutation.isPending}
                                    className="px-2 py-1 text-xs font-medium text-komuna-blue bg-komuna-blue/5 border border-komuna-blue/30 rounded hover:bg-komuna-blue/10 transition-colors"
                                  >
                                    Check In
                                  </button>
                                )}
                                {p.attendance === "CHECKED_IN" && (
                                  <button
                                    onClick={() => checkOutMutation.mutate(p.id)}
                                    disabled={checkOutMutation.isPending}
                                    className="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 border border-gray-200 rounded hover:bg-gray-200 transition-colors"
                                  >
                                    Check Out
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
                  <p className="text-gray-500">Belum ada peserta terdaftar</p>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === "analytics" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <p className="text-sm text-gray-500 mb-1">Kapasitas Terisi</p>
              <div className="flex items-end gap-2">
                <p className="text-3xl font-bold text-komuna-navy">{quotaPercent}%</p>
                <p className="text-sm text-gray-400 mb-1">{stats.confirmed}/{event.quota}</p>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                <div
                  className="bg-komuna-blue h-2 rounded-full"
                  style={{ width: `${Math.min(quotaPercent, 100)}%` }}
                />
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <p className="text-sm text-gray-500 mb-1">Tingkat Kehadiran</p>
              <div className="flex items-end gap-2">
                <p className="text-3xl font-bold text-komuna-teal">{attendanceRate}%</p>
                <p className="text-sm text-gray-400 mb-1">{stats.checkedIn}/{stats.confirmed}</p>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                <div
                  className="bg-komuna-teal h-2 rounded-full"
                  style={{ width: `${Math.min(attendanceRate, 100)}%` }}
                />
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <p className="text-sm text-gray-500 mb-1">Tingkat Pembatalan</p>
              <div className="flex items-end gap-2">
                <p className="text-3xl font-bold text-red-500">
                  {stats.totalRegistered > 0 ? Math.round((stats.cancelled / stats.totalRegistered) * 100) : 0}%
                </p>
                <p className="text-sm text-gray-400 mb-1">{stats.cancelled}/{stats.totalRegistered}</p>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <p className="text-sm text-gray-500 mb-1">Waiting List</p>
              <div className="flex items-end gap-2">
                <p className="text-3xl font-bold text-orange-500">{stats.waitlisted}</p>
              </div>
            </div>
          </div>

          {/* Registration Breakdown */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-sm font-medium text-gray-700 mb-4">Breakdown Pendaftaran</h3>
            <div className="space-y-3">
              {[
                { label: "Dikonfirmasi", count: stats.confirmed, color: "bg-green-500" },
                { label: "Menunggu", count: stats.pending, color: "bg-yellow-500" },
                { label: "Waiting List", count: stats.waitlisted, color: "bg-orange-500" },
                { label: "Dibatalkan", count: stats.cancelled, color: "bg-red-500" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${item.color} flex-shrink-0`} />
                  <span className="text-sm text-gray-700 w-32">{item.label}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-4">
                    <div
                      className={`${item.color} h-4 rounded-full`}
                      style={{
                        width: `${stats.totalRegistered > 0 ? (item.count / stats.totalRegistered) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-10 text-right">{item.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Attendance Breakdown */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-sm font-medium text-gray-700 mb-4">Breakdown Kehadiran</h3>
            <div className="space-y-3">
              {[
                { label: "Check In", count: stats.checkedIn, color: "bg-green-500" },
                { label: "Check Out", count: stats.checkedOut, color: "bg-blue-500" },
                { label: "Tidak Hadir", count: stats.absent, color: "bg-red-500" },
                { label: "Belum Hadir", count: Math.max(0, stats.confirmed - stats.checkedIn - stats.checkedOut - stats.absent), color: "bg-gray-400" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${item.color} flex-shrink-0`} />
                  <span className="text-sm text-gray-700 w-32">{item.label}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-4">
                    <div
                      className={`${item.color} h-4 rounded-full`}
                      style={{
                        width: `${stats.confirmed > 0 ? (item.count / stats.confirmed) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-10 text-right">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
