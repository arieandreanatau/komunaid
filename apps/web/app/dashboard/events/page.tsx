"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { useAuth } from "@/components/auth-provider";
import { Pagination } from "@/components/pagination";
import { useToast } from "@/components/ui/toast";

type TabKey = "all" | "created" | "registered" | "saved";
type LifecycleFilter = "" | "upcoming" | "ongoing" | "completed" | "rejected" | "cancelled";

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

interface SavedEvent {
  id: string;
  title: string;
  slug: string;
  eventDate: string;
  endDate: string;
  status: string;
  location: string;
  locationType: string;
  coverImage: string | null;
  community: { name: string; slug: string } | null;
  organization: { name: string; slug: string } | null;
  savedAt: string;
}

const EVENT_STATUS_MAP: Record<string, { label: string; className: string }> = {
  DRAFT: { label: "Draft", className: "bg-gray-100 text-gray-600" },
  SUBMITTED: { label: "Menunggu review", className: "bg-amber-100 text-amber-700" },
  IN_REVIEW: { label: "Sedang ditinjau", className: "bg-amber-100 text-amber-700" },
  REVISION_REQUESTED: { label: "Perlu revisi", className: "bg-orange-100 text-orange-700" },
  RESUBMITTED: { label: "Dikirim ulang", className: "bg-amber-100 text-amber-700" },
  APPROVED: { label: "Disetujui", className: "bg-blue-100 text-blue-700" },
  REJECTED: { label: "Ditolak", className: "bg-red-100 text-red-700" },
  PUBLISHED: { label: "Diterbitkan", className: "bg-blue-100 text-blue-700" },
  REGISTRATION_OPEN: { label: "Pendaftaran Buka", className: "bg-green-100 text-green-700" },
  REGISTRATION_CLOSED: { label: "Pendaftaran Tutup", className: "bg-yellow-100 text-yellow-700" },
  ONGOING: { label: "Berlangsung", className: "bg-purple-100 text-purple-700" },
  COMPLETED: { label: "Selesai", className: "bg-emerald-100 text-emerald-700" },
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
  NOT_CHECKED_IN: { label: "Belum Check-in", className: "bg-gray-100 text-gray-600" },
  CHECKED_IN: { label: "Hadir", className: "bg-green-100 text-green-700" },
  CHECKED_OUT: { label: "Selesai", className: "bg-blue-100 text-blue-700" },
};

function getLifecycleStatus(eventDate: string, status: string): string {
  if (status === "REJECTED") return "rejected";
  if (status === "CANCELLED") return "cancelled";
  if (status === "COMPLETED") return "completed";
  if (status === "ONGOING") return "ongoing";
  const now = new Date();
  const date = new Date(eventDate);
  if (date > now) return "upcoming";
  return "completed";
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatMonthYear(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    month: "long",
    year: "numeric",
  });
}

function SummaryCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
      <div className="h-8 w-12 bg-gray-200 rounded animate-pulse mt-2" />
      <div className="h-3 w-32 bg-gray-100 rounded animate-pulse mt-2" />
    </div>
  );
}

function EventCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="h-24 w-32 rounded-lg bg-gray-200 animate-pulse flex-shrink-0" />
        <div className="flex-1 min-w-0 space-y-3">
          <div className="h-5 w-48 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-36 bg-gray-100 rounded animate-pulse" />
          <div className="h-3 w-28 bg-gray-100 rounded animate-pulse" />
          <div className="flex gap-4">
            <div className="h-3 w-20 bg-gray-100 rounded animate-pulse" />
            <div className="h-3 w-24 bg-gray-100 rounded animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ title, description, actionLabel, actionHref }: {
  title: string;
  description: string;
  actionLabel: string;
  actionHref: string;
}) {
  return (
    <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
      <svg className="h-16 w-16 text-gray-200 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      <h3 className="text-lg font-semibold text-gray-700 mb-1">{title}</h3>
      <p className="text-sm text-gray-500 mb-5 max-w-sm mx-auto">{description}</p>
      <Link
        href={actionHref}
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-komuna-blue text-white rounded-lg text-sm font-medium hover:bg-komuna-navy transition-colors"
      >
        {actionLabel}
      </Link>
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
      <div className="h-16 w-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-gray-700 mb-1">Event tidak dapat dimuat</h3>
      <p className="text-sm text-gray-500 mb-5">Terjadi kendala saat mengambil data event.</p>
      <button
        onClick={onRetry}
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-komuna-blue text-white rounded-lg text-sm font-medium hover:bg-komuna-navy transition-colors"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Coba Lagi
      </button>
    </div>
  );
}

function EventCard({
  event,
  tab,
  onPublish,
  onArchive,
  publishPending,
  archivePending,
}: {
  event: any;
  tab: TabKey;
  onPublish?: (id: string) => void;
  onArchive?: (id: string) => void;
  publishPending?: boolean;
  archivePending?: boolean;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const statusInfo = EVENT_STATUS_MAP[event.status] || EVENT_STATUS_MAP.DRAFT;
  const regInfo = event.registrationStatus ? REG_STATUS_MAP[event.registrationStatus] : null;
  const attInfo = event.attendance ? ATTENDANCE_MAP[event.attendance] : null;
  const lifecycle = getLifecycleStatus(event.eventDate, event.status);
  const quotaPercent = event.quota > 0 ? Math.round((event.registeredCount / event.quota) * 100) : 0;
  const isFull = event.quota > 0 && event.registeredCount >= event.quota;
  const isAlmostFull = event.quota > 0 && event.registeredCount >= event.quota - 2 && !isFull;

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
      <div className="flex flex-col sm:flex-row gap-4">
        {event.coverImage ? (
          <img
            src={event.coverImage}
            alt={event.title}
            className="h-24 w-32 rounded-lg object-cover flex-shrink-0"
          />
        ) : (
          <div className="h-24 w-32 rounded-lg bg-gradient-to-br from-komuna-blue to-komuna-teal flex items-center justify-center flex-shrink-0">
            <span className="text-white text-2xl font-bold opacity-80">{event.title[0]}</span>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <Link
                  href={tab === "created" ? `/events/${event.slug}` : `/events/${event.slug}`}
                  className="font-semibold text-komuna-navy truncate hover:text-komuna-blue transition-colors"
                >
                  {event.title}
                </Link>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${statusInfo.className}`}>
                  {statusInfo.label}
                </span>
              </div>
              {(event.community || event.organization) && (
                <p className="text-sm text-gray-500 mt-0.5">
                  Diselenggarakan oleh{" "}
                  <span className="text-komuna-blue font-medium">
                    {event.community?.name || event.organization?.name}
                  </span>
                </p>
              )}
            </div>
            {tab === "created" && (
              <div className="relative flex-shrink-0">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                  aria-label="Menu lainnya"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01" />
                  </svg>
                </button>
                {menuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                    <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl border border-gray-100 shadow-lg z-20 py-1">
                      <Link
                        href={`/events/${event.slug}`}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setMenuOpen(false)}
                      >
                        <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Lihat Detail
                      </Link>
                      <Link
                        href={`/dashboard/events/${event.id}/edit`}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setMenuOpen(false)}
                      >
                        <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit Event
                      </Link>
                      <Link
                        href={`/dashboard/events/${event.id}`}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setMenuOpen(false)}
                      >
                        <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                        </svg>
                        Kelola Event
                      </Link>
                      {event.status === "DRAFT" && (
                        <button
                          onClick={() => { setMenuOpen(false); onPublish?.(event.id); }}
                          disabled={publishPending}
                          className="flex items-center gap-2 px-3 py-2 text-sm text-green-700 hover:bg-green-50 w-full text-left disabled:opacity-50"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Terbitkan
                        </button>
                      )}
                      {event.status === "COMPLETED" && (
                        <button
                          onClick={() => { setMenuOpen(false); onArchive?.(event.id); }}
                          disabled={archivePending}
                          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 w-full text-left disabled:opacity-50"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                          </svg>
                          Arsipkan
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {formatDate(event.eventDate)}
              {event.endDate && (
                <span className="text-gray-400"> — {formatTime(event.eventDate)} — {formatTime(event.endDate)}</span>
              )}
              {!event.endDate && <span className="text-gray-400"> · {formatTime(event.eventDate)}</span>}
            </span>
          </div>

          <div className="flex items-center gap-4 mt-1.5 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {event.locationType === "ONLINE" ? "Online" : event.location || "Lokasi TBD"}
            </span>
            {event.quota > 0 && (
              <span className={`flex items-center gap-1 ${isFull ? "text-red-600 font-medium" : isAlmostFull ? "text-amber-600" : ""}`}>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {event.registeredCount}/{event.quota} peserta
                {isFull && <span className="ml-1 text-xs">· Kuota penuh</span>}
                {isAlmostFull && <span className="ml-1 text-xs">· Hampir penuh</span>}
              </span>
            )}
            {tab === "saved" && (
              <span className="flex items-center gap-1 text-gray-400">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-4-7 4V5z" />
                </svg>
                Disimpan {event.savedAt ? formatDate(event.savedAt) : ""}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 mt-3 flex-wrap">
            {regInfo && (
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${regInfo.className}`}>
                {regInfo.label}
              </span>
            )}
            {attInfo && (
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${attInfo.className}`}>
                {attInfo.label}
              </span>
            )}
            {event.registrationStatus === "WAITLISTED" && (
              <span className="text-xs text-orange-600">Menunggu ketersediaan peserta.</span>
            )}
            {event.registrationStatus === "CANCELLED" && tab === "registered" && (
              <span className="text-xs text-red-500">Pendaftaran kamu telah dibatalkan.</span>
            )}
          </div>

          <div className="flex items-center gap-2 mt-3">
            {tab === "created" && (
              <>
                <Link
                  href={`/events/${event.slug}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-komuna-blue border border-komuna-blue/30 rounded-lg hover:bg-komuna-blue/5 transition-colors"
                >
                  Lihat Detail
                </Link>
                <Link
                  href={`/dashboard/events/${event.id}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-komuna-teal border border-komuna-teal/30 rounded-lg hover:bg-komuna-teal/5 transition-colors"
                >
                  Kelola Event
                </Link>
              </>
            )}
            {tab === "registered" && (
              <Link
                href={`/events/${event.slug}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-komuna-blue border border-komuna-blue/30 rounded-lg hover:bg-komuna-blue/5 transition-colors"
              >
                Lihat Detail
              </Link>
            )}
            {tab === "saved" && (
              <Link
                href={`/events/${event.slug}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-komuna-blue border border-komuna-blue/30 rounded-lg hover:bg-komuna-blue/5 transition-colors"
              >
                Lihat Detail
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MyEventsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [lifecycleFilter, setLifecycleFilter] = useState<LifecycleFilter>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [filterCommunityId, setFilterCommunityId] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [createdPage, setCreatedPage] = useState(1);
  const [registeredPage, setRegisteredPage] = useState(1);
  const [savedPage, setSavedPage] = useState(1);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "created" || tab === "registered" || tab === "saved") {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const profileQuery = useQuery({
    queryKey: ["profile"],
    enabled: !!isAuthenticated,
    queryFn: async () => {
      const response = await api.get("/users/profile");
      return response.data.data?.user || response.data.user;
    },
  });
  const manageableCommunities: Array<{ id: string; name: string; role: string; status: string }> =
    profileQuery.data?.communities?.filter(
      (community: { role: string; status: string }) =>
        ["OWNER", "ADMIN", "EVENT_MANAGER"].includes(community.role) && community.status === "APPROVED"
    ) || [];
  const manageableOrganizations: Array<{ role: string; status: string }> =
    profileQuery.data?.organizations?.filter(
      (organization: { role: string; status: string }) =>
        ["OWNER", "ADMIN"].includes(organization.role) && organization.status === "APPROVED"
    ) || [];
  const filterCommunities: Array<{ id: string; name: string }> = profileQuery.data?.communities || [];

  useEffect(() => {
    setCreatedPage(1);
    setRegisteredPage(1);
    setSavedPage(1);
  }, [filterMonth, filterCommunityId, filterStatus, lifecycleFilter, searchQuery]);

  const createdParams: any = { page: createdPage, limit: 20 };
  if (filterMonth) createdParams.month = filterMonth;
  if (filterCommunityId) createdParams.communityId = filterCommunityId;
  if (filterStatus) createdParams.status = filterStatus;

  const registeredParams: any = { page: registeredPage, limit: 20 };
  if (filterMonth) registeredParams.month = filterMonth;
  if (filterCommunityId) registeredParams.communityId = filterCommunityId;

  const { data: createdData, isLoading: createdLoading, error: createdError, refetch: refetchCreated } = useQuery({
    queryKey: ["myCreatedEvents", createdPage, filterMonth, filterCommunityId, filterStatus],
    enabled: !!isAuthenticated && (activeTab === "all" || activeTab === "created"),
    queryFn: async () => {
      const res = await api.get("/events/my/created", { params: createdParams });
      return res.data;
    },
  });

  const { data: registeredData, isLoading: registeredLoading, error: registeredError, refetch: refetchRegistered } = useQuery({
    queryKey: ["myRegisteredEvents", registeredPage, filterMonth, filterCommunityId],
    enabled: !!isAuthenticated && (activeTab === "all" || activeTab === "registered"),
    queryFn: async () => {
      const res = await api.get("/events/my/registered", { params: registeredParams });
      const raw = res.data;
      const events = (raw.data || []).map((r: any) => ({
        id: r.event?.id || r.id,
        title: r.event?.title || "",
        slug: r.event?.slug || "",
        eventDate: r.event?.eventDate || "",
        endDate: r.event?.endDate || "",
        location: r.event?.location || "",
        locationType: r.event?.locationType || "",
        coverImage: r.event?.coverImage || null,
        status: r.event?.status || "",
        registrationStatus: r.status,
        attendance: r.attendance || "",
        community: r.event?.community || null,
        organization: r.event?.organization || null,
      }));
      return { ...raw, data: events };
    },
  });

  const { data: savedData, isLoading: savedLoading, error: savedError, refetch: refetchSaved } = useQuery({
    queryKey: ["mySavedEvents", savedPage],
    enabled: !!isAuthenticated && (activeTab === "all" || activeTab === "saved"),
    queryFn: async () => {
      const res = await api.get("/events/my/saved", { params: { page: savedPage, limit: 20 } });
      return res.data;
    },
  });

  const publishMutation = useMutation({
    mutationFn: async (eventId: string) => {
      return api.post(`/events/${eventId}/publish`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myCreatedEvents"] });
      addToast("Event berhasil diterbitkan.", "success");
    },
    onError: () => addToast("Event gagal diterbitkan.", "error"),
  });

  const archiveMutation = useMutation({
    mutationFn: async (eventId: string) => {
      return api.post(`/events/${eventId}/archive`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myCreatedEvents"] });
      addToast("Event berhasil diarsipkan.", "success");
    },
    onError: () => addToast("Event gagal diarsipkan.", "error"),
  });

  const createdEvents: CreatedEvent[] = createdData?.data || [];
  const createdPagination = createdData?.pagination || { page: 1, totalPages: 1, total: 0 };
  const registeredEvents: RegisteredEvent[] = registeredData?.data || [];
  const registeredPagination = registeredData?.pagination || { page: 1, totalPages: 1, total: 0 };
  const savedEvents: SavedEvent[] = savedData?.data || [];
  const savedPagination = savedData?.pagination || { page: 1, totalPages: 1, total: 0 };

  const createdTotal = createdPagination.total || 0;
  const registeredTotal = registeredPagination.total || 0;
  const savedTotal = savedPagination.total || 0;

  const allUpcomingCount = useMemo(() => {
    let count = 0;
    createdEvents.forEach((e) => { if (getLifecycleStatus(e.eventDate, e.status) === "upcoming") count++; });
    registeredEvents.forEach((e) => { if (getLifecycleStatus(e.eventDate, e.status) === "upcoming") count++; });
    return count;
  }, [createdEvents, registeredEvents]);

  const filteredCreatedEvents = useMemo(() => {
    let events = createdEvents;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      events = events.filter((e) => e.title.toLowerCase().includes(q) || e.community?.name.toLowerCase().includes(q) || e.organization?.name.toLowerCase().includes(q));
    }
    if (lifecycleFilter) {
      events = events.filter((e) => getLifecycleStatus(e.eventDate, e.status) === lifecycleFilter);
    }
    return events;
  }, [createdEvents, searchQuery, lifecycleFilter]);

  const filteredRegisteredEvents = useMemo(() => {
    let events = registeredEvents;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      events = events.filter((e) => e.title.toLowerCase().includes(q) || e.community?.name.toLowerCase().includes(q) || e.organization?.name.toLowerCase().includes(q));
    }
    if (lifecycleFilter) {
      events = events.filter((e) => getLifecycleStatus(e.eventDate, e.status) === lifecycleFilter);
    }
    return events;
  }, [registeredEvents, searchQuery, lifecycleFilter]);

  const filteredSavedEvents = useMemo(() => {
    let events = savedEvents;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      events = events.filter((e) => e.title.toLowerCase().includes(q) || e.community?.name.toLowerCase().includes(q) || e.organization?.name.toLowerCase().includes(q));
    }
    if (lifecycleFilter) {
      events = events.filter((e) => getLifecycleStatus(e.eventDate, e.status) === lifecycleFilter);
    }
    return events;
  }, [savedEvents, searchQuery, lifecycleFilter]);

  const allEvents = useMemo(() => {
    const map = new Map<string, any>();
    createdEvents.forEach((e) => map.set(e.id, { ...e, _relationship: "created" }));
    registeredEvents.forEach((e) => { if (!map.has(e.id)) map.set(e.id, { ...e, _relationship: "registered" }); else map.get(e.id)._relationship = "created"; });
    savedEvents.forEach((e) => { if (!map.has(e.id)) map.set(e.id, { ...e, _relationship: "saved" }); });
    let events = Array.from(map.values());
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      events = events.filter((e: any) => e.title.toLowerCase().includes(q) || e.community?.name.toLowerCase().includes(q) || e.organization?.name.toLowerCase().includes(q));
    }
    if (lifecycleFilter) {
      events = events.filter((e: any) => getLifecycleStatus(e.eventDate, e.status) === lifecycleFilter);
    }
    return events;
  }, [createdEvents, registeredEvents, savedEvents, searchQuery, lifecycleFilter]);

  const isLoadingAny = activeTab === "all"
    ? createdLoading || registeredLoading || savedLoading
    : activeTab === "created" ? createdLoading
    : activeTab === "registered" ? registeredLoading
    : savedLoading;

  const hasError = (activeTab === "created" && createdError) ||
    (activeTab === "registered" && registeredError) ||
    (activeTab === "saved" && savedError) ||
    (activeTab === "all" && createdError && registeredError && savedError);

  const tabs: { key: TabKey; label: string; count: number }[] = [
    { key: "all", label: "Semua", count: allEvents.length },
    { key: "created", label: "Dibuat", count: createdTotal },
    { key: "registered", label: "Diikuti", count: registeredTotal },
    { key: "saved", label: "Tersimpan", count: savedTotal },
  ];

  const lifecycleOptions: { value: LifecycleFilter; label: string }[] = [
    { value: "", label: "Semua Status" },
    { value: "upcoming", label: "Mendatang" },
    { value: "ongoing", label: "Berlangsung" },
    { value: "completed", label: "Selesai" },
    { value: "rejected", label: "Ditolak" },
    { value: "cancelled", label: "Dibatalkan" },
  ];

  const canCreateEvent = manageableCommunities.length > 0 || manageableOrganizations.length > 0;

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-8 w-8 border-4 border-komuna-blue border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const handleRetry = () => {
    if (activeTab === "created" || activeTab === "all") refetchCreated();
    if (activeTab === "registered" || activeTab === "all") refetchRegistered();
    if (activeTab === "saved" || activeTab === "all") refetchSaved();
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-komuna-navy">Event Saya</h1>
          <p className="text-sm text-gray-500 mt-1">Kelola event yang kamu buat, ikuti, dan simpan.</p>
        </div>
        {canCreateEvent && (
          <Link
            href="/dashboard/events/create"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-komuna-blue text-white rounded-lg font-medium text-sm hover:bg-komuna-navy transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Buat Event Baru
          </Link>
        )}
      </div>

      {/* Summary Cards */}
      {isLoadingAny && activeTab === "all" ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <SummaryCardSkeleton />
          <SummaryCardSkeleton />
          <SummaryCardSkeleton />
          <SummaryCardSkeleton />
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => setActiveTab("created")}
            className={`bg-white rounded-xl border p-5 text-left transition-all hover:shadow-md ${
              activeTab === "created" ? "border-komuna-blue shadow-md ring-1 ring-komuna-blue/20" : "border-gray-100 shadow-sm"
            }`}
          >
            <p className="text-sm font-medium text-gray-500">Event Dibuat</p>
            <p className="text-2xl font-bold text-komuna-navy mt-1">{createdTotal}</p>
            <p className="text-xs text-gray-400 mt-1">Event yang kamu selenggarakan</p>
          </button>
          <button
            onClick={() => setActiveTab("registered")}
            className={`bg-white rounded-xl border p-5 text-left transition-all hover:shadow-md ${
              activeTab === "registered" ? "border-komuna-blue shadow-md ring-1 ring-komuna-blue/20" : "border-gray-100 shadow-sm"
            }`}
          >
            <p className="text-sm font-medium text-gray-500">Event Diikuti</p>
            <p className="text-2xl font-bold text-komuna-navy mt-1">{registeredTotal}</p>
            <p className="text-xs text-gray-400 mt-1">Event yang kamu ikuti</p>
          </button>
          <button
            onClick={() => setActiveTab("saved")}
            className={`bg-white rounded-xl border p-5 text-left transition-all hover:shadow-md ${
              activeTab === "saved" ? "border-komuna-blue shadow-md ring-1 ring-komuna-blue/20" : "border-gray-100 shadow-sm"
            }`}
          >
            <p className="text-sm font-medium text-gray-500">Event Tersimpan</p>
            <p className="text-2xl font-bold text-komuna-navy mt-1">{savedTotal}</p>
            <p className="text-xs text-gray-400 mt-1">Event yang kamu simpan</p>
          </button>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <p className="text-sm font-medium text-gray-500">Mendatang</p>
            <p className="text-2xl font-bold text-komuna-navy mt-1">{allUpcomingCount}</p>
            <p className="text-xs text-gray-400 mt-1">Pada data yang sedang tampil</p>
          </div>
        </div>
      )}

      {/* Primary Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-0 overflow-x-auto" role="tablist" aria-label="Kategori event">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              role="tab"
              aria-selected={activeTab === tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.key
                  ? "border-komuna-blue text-komuna-blue"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
              <span className="ml-1.5 px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded text-xs">
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Cari event..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-komuna-blue focus:border-transparent"
              aria-label="Cari event"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label="Hapus pencarian"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              value={lifecycleFilter}
              onChange={(e) => setLifecycleFilter(e.target.value as LifecycleFilter)}
              className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-komuna-blue"
              aria-label="Filter status event"
            >
              {lifecycleOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <select
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-komuna-blue"
              aria-label="Filter bulan"
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
              className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-komuna-blue"
              aria-label="Filter komunitas"
            >
              <option value="">Semua Komunitas</option>
              {filterCommunities.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      {hasError ? (
        <ErrorState onRetry={handleRetry} />
      ) : isLoadingAny && activeTab === "all" ? (
        <div className="space-y-4">
          <EventCardSkeleton />
          <EventCardSkeleton />
          <EventCardSkeleton />
          <EventCardSkeleton />
        </div>
      ) : activeTab === "all" ? (
        allEvents.length === 0 ? (
          <EmptyState
            title="Belum ada event"
            description="Event yang kamu buat, ikuti, atau simpan akan muncul di sini."
            actionLabel="Jelajahi Event"
            actionHref="/events"
          />
        ) : (
          <div className="space-y-4">
            {allEvents.map((event: any) => (
              <EventCard
                key={event.id}
                event={event}
                tab={event._relationship === "created" ? "created" : event._relationship === "registered" ? "registered" : "saved"}
                onPublish={(id) => publishMutation.mutate(id)}
                onArchive={(id) => archiveMutation.mutate(id)}
                publishPending={publishMutation.isPending}
                archivePending={archiveMutation.isPending}
              />
            ))}
          </div>
        )
      ) : activeTab === "created" ? (
        createdLoading ? (
          <div className="space-y-4">
            <EventCardSkeleton />
            <EventCardSkeleton />
            <EventCardSkeleton />
          </div>
        ) : createdError ? (
          <ErrorState onRetry={() => refetchCreated()} />
        ) : filteredCreatedEvents.length === 0 ? (
          searchQuery || lifecycleFilter ? (
            <EmptyState
              title="Tidak ada event ditemukan"
              description="Tidak ada event yang cocok dengan filter yang dipilih."
              actionLabel="Reset Filter"
              actionHref="/dashboard/events"
            />
          ) : (
            <EmptyState
              title="Belum ada event yang kamu buat"
              description="Buat event untuk menghubungkan komunitas dengan aktivitas baru."
              actionLabel="+ Buat Event Baru"
              actionHref="/dashboard/events/create"
            />
          )
        ) : (
          <div className="space-y-4">
            {filteredCreatedEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                tab="created"
                onPublish={(id) => publishMutation.mutate(id)}
                onArchive={(id) => archiveMutation.mutate(id)}
                publishPending={publishMutation.isPending}
                archivePending={archiveMutation.isPending}
              />
            ))}
            <Pagination page={createdPage} totalPages={createdPagination.totalPages} onPageChange={setCreatedPage} />
          </div>
        )
      ) : activeTab === "registered" ? (
        registeredLoading ? (
          <div className="space-y-4">
            <EventCardSkeleton />
            <EventCardSkeleton />
            <EventCardSkeleton />
          </div>
        ) : registeredError ? (
          <ErrorState onRetry={() => refetchRegistered()} />
        ) : filteredRegisteredEvents.length === 0 ? (
          searchQuery || lifecycleFilter ? (
            <EmptyState
              title="Tidak ada event ditemukan"
              description="Tidak ada event yang cocok dengan filter yang dipilih."
              actionLabel="Reset Filter"
              actionHref="/dashboard/events"
            />
          ) : (
            <EmptyState
              title="Belum ada event yang kamu ikuti"
              description="Temukan event yang sesuai dengan minatmu."
              actionLabel="Jelajahi Event"
              actionHref="/events"
            />
          )
        ) : (
          <div className="space-y-4">
            {filteredRegisteredEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                tab="registered"
              />
            ))}
            <Pagination page={registeredPage} totalPages={registeredPagination.totalPages} onPageChange={setRegisteredPage} />
          </div>
        )
      ) : (
        savedLoading ? (
          <div className="space-y-4">
            <EventCardSkeleton />
            <EventCardSkeleton />
            <EventCardSkeleton />
          </div>
        ) : savedError ? (
          <ErrorState onRetry={() => refetchSaved()} />
        ) : filteredSavedEvents.length === 0 ? (
          searchQuery || lifecycleFilter ? (
            <EmptyState
              title="Tidak ada event ditemukan"
              description="Tidak ada event yang cocok dengan filter yang dipilih."
              actionLabel="Reset Filter"
              actionHref="/dashboard/events"
            />
          ) : (
            <EmptyState
              title="Belum ada event tersimpan"
              description="Simpan event yang ingin kamu ikuti nanti."
              actionLabel="Jelajahi Event"
              actionHref="/events"
            />
          )
        ) : (
          <div className="space-y-4">
            {filteredSavedEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                tab="saved"
              />
            ))}
            <Pagination page={savedPage} totalPages={savedPagination.totalPages} onPageChange={setSavedPage} />
          </div>
        )
      )}
    </div>
  );
}
