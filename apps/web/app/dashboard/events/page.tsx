"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { useAuth } from "@/components/auth-provider";

interface CreatedEvent {
  id: string;
  title: string;
  slug: string;
  status: string;
  eventDate: string;
  endDate: string;
  location: string;
  locationType: string;
  coverImage: string | null;
  registeredCount: number;
  quota: number;
  community: { name: string; slug: string } | null;
  organization: { name: string; slug: string } | null;
  allowWaitlist: boolean;
}

interface RegisteredEvent {
  id: string;
  title: string;
  slug: string;
  eventDate: string;
  endDate: string;
  location: string;
  locationType: string;
  coverImage: string | null;
  status: string;
  registrationStatus: string;
  attendance: string;
  community: { name: string; slug: string } | null;
  organization: { name: string; slug: string } | null;
}

interface SavedEvent extends Omit<RegisteredEvent, "registrationStatus" | "attendance"> {
  savedAt: string;
}

const EVENT_STATUS_MAP: Record<string, { label: string; className: string }> = {
  DRAFT: { label: "Draft", className: "bg-gray-100 text-gray-600" },
  PUBLISHED: { label: "Diterbitkan", className: "bg-blue-100 text-blue-700" },
  REGISTRATION_OPEN: { label: "Pendaftaran Buka", className: "bg-green-100 text-green-700" },
  REGISTRATION_CLOSED: { label: "Pendaftaran Tutup", className: "bg-yellow-100 text-yellow-700" },
  ONGOING: { label: "Berlangsung", className: "bg-purple-100 text-purple-700" },
  COMPLETED: { label: "Selesai", className: "bg-green-200 text-green-800" },
  CANCELLED: { label: "Dibatalkan", className: "bg-red-100 text-red-700" },
  ARCHIVED: { label: "Diarsipkan", className: "bg-gray-200 text-gray-700" },
};

const REG_STATUS_MAP: Record<string, { label: string; className: string }> = {
  CONFIRMED: { label: "Dikonfirmasi", className: "bg-green-100 text-green-700" },
  PENDING: { label: "Menunggu", className: "bg-yellow-100 text-yellow-700" },
  WAITLISTED: { label: "Waiting List", className: "bg-orange-100 text-orange-700" },
  CANCELLED: { label: "Dibatalkan", className: "bg-red-100 text-red-700" },
  REJECTED: { label: "Ditolak", className: "bg-red-100 text-red-700" },
};

const ATTENDANCE_MAP: Record<string, { label: string; className: string }> = {
  CHECKED_IN: { label: "Hadir", className: "bg-green-100 text-green-700" },
  CHECKED_OUT: { label: "Selesai", className: "bg-blue-100 text-blue-700" },
  ABSENT: { label: "Tidak Hadir", className: "bg-red-100 text-red-700" },
  REGISTERED: { label: "Terdaftar", className: "bg-gray-100 text-gray-600" },
};

export default function MyEventsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"created" | "registered" | "saved">("created");
  const [createdPage, setCreatedPage] = useState(1);
  const [registeredPage, setRegisteredPage] = useState(1);
  const [savedPage, setSavedPage] = useState(1);
  const [filterMonth, setFilterMonth] = useState("");
  const [filterCommunityId, setFilterCommunityId] = useState("");
  const [userCommunities, setUserCommunities] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (searchParams.get("tab") === "saved") {
      setActiveTab("saved");
    }
  }, [searchParams]);

  useEffect(() => {
    if (isAuthenticated) {
      api.get("/users/profile").then((res) => {
        const profile = res.data.data?.user || res.data.user;
        if (profile?.communities) {
          setUserCommunities(profile.communities.map((c: any) => ({ id: c.id, name: c.name })));
        }
      }).catch(() => {});
    }
  }, [isAuthenticated]);

  const createdParams = { page: createdPage, limit: 10 };
  if (filterMonth) Object.assign(createdParams, { month: filterMonth });
  if (filterCommunityId) Object.assign(createdParams, { communityId: filterCommunityId });

  const registeredParams = { page: registeredPage, limit: 10 };
  if (filterMonth) Object.assign(registeredParams, { month: filterMonth });
  if (filterCommunityId) Object.assign(registeredParams, { communityId: filterCommunityId });

  useEffect(() => { setCreatedPage(1); setRegisteredPage(1); setSavedPage(1); }, [filterMonth, filterCommunityId]);

  const { data: createdData, isLoading: createdLoading } = useQuery({
    queryKey: ["myCreatedEvents", createdPage, filterMonth, filterCommunityId],
    enabled: !!isAuthenticated,
    queryFn: async () => {
      const res = await api.get("/events/my/created", { params: createdParams });
      return res.data;
    },
  });

  const { data: registeredData, isLoading: registeredLoading } = useQuery({
    queryKey: ["myRegisteredEvents", registeredPage, filterMonth, filterCommunityId],
    enabled: !!isAuthenticated,
    queryFn: async () => {
      const res = await api.get("/events/my/registered", { params: registeredParams });
      return res.data;
    },
  });

  const { data: savedData, isLoading: savedLoading } = useQuery({
    queryKey: ["mySavedEvents", savedPage],
    enabled: !!isAuthenticated,
    queryFn: async () => {
      const res = await api.get("/events/my/saved", { params: { page: savedPage, limit: 10 } });
      return res.data;
    },
  });

  const publishMutation = useMutation({
    mutationFn: async (eventId: string) => {
      return api.patch(`/events/${eventId}/status`, { status: "PUBLISHED" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myCreatedEvents"] });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: async (eventId: string) => {
      return api.patch(`/events/${eventId}/status`, { status: "CANCELLED" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myCreatedEvents"] });
    },
  });

  const archiveMutation = useMutation({
    mutationFn: async (eventId: string) => {
      return api.patch(`/events/${eventId}/status`, { status: "ARCHIVED" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myCreatedEvents"] });
    },
  });

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-8 w-8 border-4 border-komuna-blue border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const createdEvents = createdData?.events || [];
  const createdPagination = createdData?.pagination || { page: 1, totalPages: 1 };
  const registeredEvents = registeredData?.events || [];
  const registeredPagination = registeredData?.pagination || { page: 1, totalPages: 1 };
  const savedEvents: SavedEvent[] = savedData?.data || [];
  const savedPagination = savedData?.pagination || { page: 1, totalPages: 1, total: 0 };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-komuna-navy">Event Saya</h1>
          <p className="text-sm text-gray-500 mt-1">Kelola event yang kamu buat dan ikuti</p>
        </div>
        <Link
          href="/dashboard/events/create"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-komuna-blue text-white rounded-lg font-medium text-sm hover:bg-komuna-navy transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Buat Event Baru
        </Link>
      </div>

      {/* Filters */}
      {activeTab !== "saved" && <div className="flex flex-wrap gap-3">
        <select
          value={filterMonth}
          onChange={(e) => setFilterMonth(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-komuna-blue"
        >
          <option value="">Semua Bulan</option>
          {Array.from({ length: 12 }, (_, i) => {
            const m = String(i + 1).padStart(2, "0");
            const now = new Date();
            const y = now.getFullYear();
            const d = new Date(y, i, 1);
            return <option key={m} value={`${y}-${m}`}>{d.toLocaleDateString("id-ID", { month: "long", year: "numeric" })}</option>;
          })}
        </select>
        <select
          value={filterCommunityId}
          onChange={(e) => setFilterCommunityId(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-komuna-blue"
        >
          <option value="">Semua Komunitas</option>
          {userCommunities.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-0">
          <button
            onClick={() => setActiveTab("created")}
            className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "created"
                ? "border-komuna-blue text-komuna-blue"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Dibuat
            {createdData?.pagination && (
              <span className="ml-1.5 px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded text-xs">
                {createdPagination.totalItems || 0}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("registered")}
            className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "registered"
                ? "border-komuna-blue text-komuna-blue"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Diikuti
            {registeredData?.pagination && (
              <span className="ml-1.5 px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded text-xs">
                {registeredPagination.totalItems || 0}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("saved")}
            className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "saved"
                ? "border-komuna-blue text-komuna-blue"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Tersimpan
            {savedData?.pagination && (
              <span className="ml-1.5 px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded text-xs">
                {savedPagination.total || 0}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Created Events Tab */}
      {activeTab === "created" && (
        <div className="space-y-4">
          {createdLoading ? (
            <div className="text-center py-12">
              <div className="h-8 w-8 border-4 border-komuna-blue border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm text-gray-500 mt-3">Memuat event...</p>
            </div>
          ) : createdEvents.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
              <svg className="h-12 w-12 text-gray-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-gray-500 mb-3">Belum ada event yang dibuat</p>
              <Link
                href="/dashboard/events/create"
                className="inline-flex items-center gap-2 px-4 py-2 bg-komuna-blue text-white rounded-lg text-sm font-medium hover:bg-komuna-navy transition-colors"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Buat Event Pertama
              </Link>
            </div>
          ) : (
            <>
              {createdEvents.map((event: CreatedEvent) => {
                const statusInfo = EVENT_STATUS_MAP[event.status] || EVENT_STATUS_MAP.DRAFT;
                return (
                  <div key={event.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                    <div className="flex flex-col sm:flex-row gap-4">
                      {event.coverImage ? (
                        <img
                          src={event.coverImage}
                          alt={event.title}
                          className="h-20 w-28 rounded-lg object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="h-20 w-28 rounded-lg bg-gradient-to-br from-komuna-blue to-komuna-teal flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-xl font-bold">{event.title[0]}</span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="font-semibold text-komuna-navy truncate">{event.title}</h3>
                            <p className="text-sm text-gray-500 mt-0.5">{formatDateTime(event.eventDate)}</p>
                            {event.community && (
                              <p className="text-xs text-komuna-blue mt-1">oleh {event.community.name}</p>
                            )}
                            {event.organization && (
                              <p className="text-xs text-komuna-blue mt-1">oleh {event.organization.name}</p>
                            )}
                          </div>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${statusInfo.className}`}>
                            {statusInfo.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                          <span>{event.locationType === "ONLINE" ? "Online" : event.location || "Lokasi TBD"}</span>
                          <span>{event.registeredCount}/{event.quota} peserta</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mt-3">
                          <Link
                            href={`/events/${event.slug}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            Lihat
                          </Link>
                          <Link
                            href={`/dashboard/events/${event.id}/edit`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-komuna-blue border border-komuna-blue/30 rounded-lg hover:bg-komuna-blue/5 transition-colors"
                          >
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                          </Link>
                          <Link
                            href={`/dashboard/events/${event.id}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-komuna-teal border border-komuna-teal/30 rounded-lg hover:bg-komuna-teal/5 transition-colors"
                          >
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                            </svg>
                            Dashboard
                          </Link>
                          {event.status === "DRAFT" && (
                            <button
                              onClick={() => {
                                if (confirm("Terbitkan event ini?")) publishMutation.mutate(event.id);
                              }}
                              disabled={publishMutation.isPending}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50"
                            >
                              {publishMutation.isPending ? (
                                <div className="h-3.5 w-3.5 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                              Terbitkan
                            </button>
                          )}
                          {event.status !== "CANCELLED" && event.status !== "ARCHIVED" && event.status !== "COMPLETED" && (
                            <button
                              onClick={() => {
                                if (confirm("Batalkan event ini?")) cancelMutation.mutate(event.id);
                              }}
                              disabled={cancelMutation.isPending}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                            >
                              {cancelMutation.isPending ? (
                                <div className="h-3.5 w-3.5 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              )}
                              Batalkan
                            </button>
                          )}
                          {event.status === "COMPLETED" && (
                            <button
                              onClick={() => {
                                if (confirm("Arsipkan event ini?")) archiveMutation.mutate(event.id);
                              }}
                              disabled={archiveMutation.isPending}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 border border-gray-200 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                            >
                              {archiveMutation.isPending ? (
                                <div className="h-3.5 w-3.5 border-2 border-gray-500 border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                                </svg>
                              )}
                              Arsipkan
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {createdPagination.totalPages > 1 && (
                <div className="flex flex-wrap justify-center gap-2">
                  {Array.from({ length: createdPagination.totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setCreatedPage(p)}
                      className={`px-3 py-1 rounded-lg text-sm ${p === createdPage ? "bg-komuna-blue text-white" : "bg-white border hover:bg-gray-50"}`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Registered Events Tab */}
      {activeTab === "registered" && (
        <div className="space-y-4">
          {registeredLoading ? (
            <div className="text-center py-12">
              <div className="h-8 w-8 border-4 border-komuna-blue border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm text-gray-500 mt-3">Memuat event...</p>
            </div>
          ) : registeredEvents.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
              <svg className="h-12 w-12 text-gray-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-gray-500 mb-3">Belum terdaftar di event manapun</p>
              <Link
                href="/events"
                className="inline-flex items-center gap-2 px-4 py-2 bg-komuna-blue text-white rounded-lg text-sm font-medium hover:bg-komuna-navy transition-colors"
              >
                Jelajahi Event
              </Link>
            </div>
          ) : (
            <>
              {registeredEvents.map((event: RegisteredEvent) => {
                const regInfo = REG_STATUS_MAP[event.registrationStatus] || REG_STATUS_MAP.PENDING;
                const attInfo = ATTENDANCE_MAP[event.attendance] || null;
                return (
                  <div key={event.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                    <div className="flex flex-col sm:flex-row gap-4">
                      {event.coverImage ? (
                        <img
                          src={event.coverImage}
                          alt={event.title}
                          className="h-20 w-28 rounded-lg object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="h-20 w-28 rounded-lg bg-gradient-to-br from-komuna-teal to-komuna-aqua flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-xl font-bold">{event.title[0]}</span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="font-semibold text-komuna-navy truncate">
                              <Link href={`/events/${event.slug}`} className="hover:text-komuna-blue transition-colors">
                                {event.title}
                              </Link>
                            </h3>
                            <p className="text-sm text-gray-500 mt-0.5">{formatDateTime(event.eventDate)}</p>
                            {event.community && (
                              <p className="text-xs text-komuna-blue mt-1">oleh {event.community.name}</p>
                            )}
                            {event.organization && (
                              <p className="text-xs text-komuna-blue mt-1">oleh {event.organization.name}</p>
                            )}
                          </div>
                          <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${regInfo.className}`}>
                              {regInfo.label}
                            </span>
                            {attInfo && (
                              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${attInfo.className}`}>
                                {attInfo.label}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                          <span>{event.locationType === "ONLINE" ? "Online" : event.location || "Lokasi TBD"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {registeredPagination.totalPages > 1 && (
                <div className="flex justify-center gap-2">
                  {Array.from({ length: registeredPagination.totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setRegisteredPage(p)}
                      className={`px-3 py-1 rounded-lg text-sm ${p === registeredPage ? "bg-komuna-blue text-white" : "bg-white border hover:bg-gray-50"}`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {activeTab === "saved" && (
        <div className="space-y-4">
          {savedLoading ? (
            <div className="text-center py-12">
              <div className="h-8 w-8 border-4 border-komuna-blue border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm text-gray-500 mt-3">Memuat event tersimpan...</p>
            </div>
          ) : savedEvents.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
              <svg className="h-12 w-12 text-gray-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-4-7 4V5z" />
              </svg>
              <p className="text-gray-500 mb-3">Belum ada event tersimpan</p>
              <Link href="/events" className="inline-flex items-center gap-2 px-4 py-2 bg-komuna-blue text-white rounded-lg text-sm font-medium hover:bg-komuna-navy transition-colors">
                Jelajahi Event
              </Link>
            </div>
          ) : (
            <>
              {savedEvents.map((event) => (
                <Link key={event.id} href={`/events/${event.slug}`} className="block bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:border-komuna-blue/30 hover:shadow-md transition-all">
                  <div className="flex flex-col sm:flex-row gap-4">
                    {event.coverImage ? (
                      <img src={event.coverImage} alt={event.title} className="h-20 w-28 rounded-lg object-cover flex-shrink-0" />
                    ) : (
                      <div className="h-20 w-28 rounded-lg bg-gradient-to-br from-komuna-blue to-komuna-teal flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xl font-bold">{event.title[0]}</span>
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-komuna-navy truncate">{event.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">{formatDateTime(event.eventDate)}</p>
                      <p className="text-xs text-gray-500 mt-2">{event.locationType === "ONLINE" ? "Online" : event.location || "Lokasi TBD"}</p>
                    </div>
                  </div>
                </Link>
              ))}
              {savedPagination.totalPages > 1 && (
                <div className="flex justify-center gap-2">
                  {Array.from({ length: savedPagination.totalPages }, (_, i) => i + 1).map((pageNumber) => (
                    <button key={pageNumber} onClick={() => setSavedPage(pageNumber)} className={`px-3 py-1 rounded-lg text-sm ${pageNumber === savedPage ? "bg-komuna-blue text-white" : "bg-white border hover:bg-gray-50"}`}>
                      {pageNumber}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
