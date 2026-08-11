"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/components/auth-provider";
import api from "@/lib/api";

interface CommunitySummary {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  logo?: string | null;
  coverImage?: string | null;
  role?: string;
  status?: string;
  memberCount?: number;
  eventCount?: number;
  categories?: Array<{ id: string; name: string }>;
}

interface EventSummary {
  id: string;
  title: string;
  slug: string;
  coverImage?: string | null;
  thumbnail?: string | null;
  eventDate: string;
  status: string;
  registrationStatus?: string;
  location?: string | null;
  locationType?: string;
  registeredCount?: number;
  quota?: number;
  community?: { name: string; slug: string } | null;
  organization?: { name: string; slug: string } | null;
}

interface DashboardProfile {
  id?: string;
  name?: string;
  username?: string;
  email?: string;
  avatar?: string | null;
  bio?: string | null;
  location?: string | null;
  roles?: string[];
  interests?: string[];
  communities?: CommunitySummary[];
  followedCommunities?: CommunitySummary[];
  createdCommunities?: CommunitySummary[];
  events?: EventSummary[];
  registeredEventsCount?: number;
  savedEvents?: EventSummary[];
  savedEventsCount?: number;
  unreadNotifications?: number;
}

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  link?: string | null;
  createdAt: string;
}

interface ActivityItem {
  id: string;
  action: string;
  details?: Record<string, unknown> | null;
  createdAt: string;
}

type FeedItem = {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  kind: "community" | "event" | "approval" | "profile" | "system";
  href: string;
  unread?: boolean;
};

const MONTHS = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

const DAYS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

const FEED_STYLES: Record<FeedItem["kind"], { bg: string; text: string }> = {
  community: { bg: "bg-emerald-50", text: "text-emerald-600" },
  event: { bg: "bg-cyan-50", text: "text-cyan-600" },
  approval: { bg: "bg-amber-50", text: "text-amber-600" },
  profile: { bg: "bg-blue-50", text: "text-komuna-blue" },
  system: { bg: "bg-slate-100", text: "text-slate-600" },
};

function Icon({ name, className = "h-5 w-5" }: { name: string; className?: string }) {
  const paths: Record<string, string> = {
    users: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z",
    calendar: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
    bookmark: "M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-4-7 4V5z",
    bell: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9",
    arrow: "M9 5l7 7-7 7",
    chevronLeft: "M15 19l-7-7 7-7",
    chevronRight: "M9 5l7 7-7 7",
    location: "M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z",
    clock: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
    plus: "M12 4v16m8-8H4",
    sparkles: "M5 3v4M3 5h4m11-2v4m-2-2h4M6 17v4m-2-2h4m7-8l1.5 3.5L20 16l-3.5 1.5L15 21l-1.5-3.5L10 16l3.5-1.5L15 11z",
    refresh: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15",
    alertCircle: "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  };

  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={paths[name] || paths.arrow} />
    </svg>
  );
}

function SkeletonPulse({ className = "h-4" }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-slate-200 ${className}`} />;
}

function SectionHeader({ title, subtitle, href, linkLabel = "Lihat semua" }: { title: string; subtitle?: string; href: string; linkLabel?: string }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-4">
      <div>
        <h2 className="text-lg font-bold text-komuna-navy">{title}</h2>
        {subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}
      </div>
      <Link href={href} className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-komuna-blue hover:text-komuna-navy">
        {linkLabel}
        <Icon name="arrow" className="h-4 w-4" />
      </Link>
    </div>
  );
}

function formatRelativeDate(dateValue: string) {
  const date = new Date(dateValue);
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.max(0, Math.floor(diffMs / 60000));
  if (diffMinutes < 1) return "Baru saja";
  if (diffMinutes < 60) return `${diffMinutes} menit lalu`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} jam lalu`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays} hari lalu`;
  return date.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

function activityToFeed(activity: ActivityItem): FeedItem {
  const details = activity.details || {};
  const communityName = typeof details.communityName === "string" ? details.communityName : "komunitas";
  const eventTitle = typeof details.eventTitle === "string" ? details.eventTitle : "event";
  const labels: Record<string, { title: string; description: string; kind: FeedItem["kind"]; href: string }> = {
    COMMUNITY_CREATE: { title: "Membuat komunitas", description: communityName, kind: "community", href: "/dashboard/communities" },
    COMMUNITY_SUBMITTED: { title: "Komunitas diajukan", description: communityName, kind: "approval", href: "/dashboard/my-submissions" },
    COMMUNITY_MEMBER_JOIN: { title: "Bergabung komunitas", description: communityName, kind: "community", href: "/dashboard/communities" },
    COMMUNITY_JOIN_REQUEST_CREATE: { title: "Permintaan bergabung dikirim", description: communityName, kind: "community", href: "/dashboard/communities" },
    EVENT_REGISTER: { title: "Bergabung event", description: eventTitle, kind: "event", href: "/dashboard/events" },
    USER_UPDATE_PROFILE: { title: "Profil diperbarui", description: "Informasi profil berhasil diubah", kind: "profile", href: "/dashboard/profile" },
    USER_UPDATE_INTERESTS: { title: "Minat diperbarui", description: "Rekomendasi akan makin relevan", kind: "profile", href: "/dashboard/interests" },
  };
  const item = labels[activity.action] || {
    title: activity.action.replaceAll("_", " ").toLowerCase(),
    description: "Aktivitas akun",
    kind: "system" as const,
    href: "/dashboard/activity",
  };

  return { id: `activity-${activity.id}`, createdAt: activity.createdAt, ...item };
}

function notificationToFeed(notification: NotificationItem): FeedItem {
  const kind: FeedItem["kind"] = notification.type === "EVENT"
    ? "event"
    : notification.type === "COMMUNITY" || notification.type === "ORGANIZATION"
      ? "community"
      : notification.type === "APPROVAL"
        ? "approval"
        : "system";
  return {
    id: `notification-${notification.id}`,
    title: notification.title,
    description: notification.message,
    createdAt: notification.createdAt,
    kind,
    href: notification.link || "/dashboard/notifications",
    unread: !notification.isRead,
  };
}

function StatCardSkeleton() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-4">
        <SkeletonPulse className="h-11 w-11 rounded-xl" />
        <div className="flex-1 space-y-2">
          <SkeletonPulse className="h-7 w-12" />
          <SkeletonPulse className="h-3 w-24" />
        </div>
      </div>
    </div>
  );
}

function StatCardEmpty({ icon, label, description, href, ctaLabel }: { icon: string; label: string; description: string; href: string; ctaLabel: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-400">
          <Icon name={icon} />
        </span>
        <div className="min-w-0 flex-1">
          <span className="block text-2xl font-extrabold text-slate-300">0</span>
          <span className="block text-xs font-medium text-slate-500">{label}</span>
          <span className="mt-1 block text-xs text-slate-400">{description}</span>
          <Link href={href} className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-komuna-blue hover:text-komuna-navy">
            {ctaLabel} <Icon name="arrow" className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, href, accent }: { icon: string; label: string; value: number; href: string; accent: string }) {
  return (
    <Link href={href} className="group flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-komuna-blue/30 hover:shadow-md">
      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${accent}`}>
        <Icon name={icon} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-2xl font-extrabold text-komuna-navy">{value}</span>
        <span className="block truncate text-xs font-medium text-slate-500">{label}</span>
      </span>
      <Icon name="arrow" className="h-4 w-4 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-komuna-blue" />
    </Link>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const profileQuery = useQuery<DashboardProfile>({
    queryKey: ["profile"],
    enabled: !!user,
    queryFn: async () => {
      const res = await api.get("/users/profile");
      return res.data.data?.user || res.data.user;
    },
  });

  const popularCommunitiesQuery = useQuery<CommunitySummary[]>({
    queryKey: ["communities", "popular", "dashboard"],
    queryFn: async () => {
      const res = await api.get("/communities/popular/list");
      return res.data.data || [];
    },
  });

  const popularEventsQuery = useQuery<EventSummary[]>({
    queryKey: ["events", "popular", "upcoming"],
    queryFn: async () => {
      const res = await api.get("/events/popular/upcoming");
      return res.data.data || [];
    },
  });

  const notificationsQuery = useQuery<NotificationItem[]>({
    queryKey: ["notifications", "dashboard"],
    enabled: !!user,
    queryFn: async () => {
      const res = await api.get("/users/notifications?page=1&limit=5");
      return res.data.data || [];
    },
  });

  const activitiesQuery = useQuery<ActivityItem[]>({
    queryKey: ["activity", "dashboard"],
    enabled: !!user,
    queryFn: async () => {
      const res = await api.get("/users/activity?page=1&limit=5");
      return res.data.data || [];
    },
  });

  const profile = profileQuery.data || (user as DashboardProfile | null) || {};
  const followedCommunities = profile.followedCommunities || profile.communities || [];
  const registeredEvents = profile.events || [];
  const savedEventsCount = profile.savedEventsCount ?? profile.savedEvents?.length ?? 0;
  const upcomingRegisteredEvents = registeredEvents
    .filter((event) => new Date(event.eventDate).getTime() >= new Date().setHours(0, 0, 0, 0))
    .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime());

  const calendarDays = useMemo(() => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return [
      ...Array.from({ length: firstDay }, () => null),
      ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
    ];
  }, [calendarMonth]);

  const eventDays = useMemo(() => {
    const days = new Map<number, EventSummary[]>();
    registeredEvents.forEach((event) => {
      const date = new Date(event.eventDate);
      if (date.getFullYear() === calendarMonth.getFullYear() && date.getMonth() === calendarMonth.getMonth()) {
        const day = date.getDate();
        const existing = days.get(day) || [];
        days.set(day, [...existing, event]);
      }
    });
    return days;
  }, [calendarMonth, registeredEvents]);

  const selectedDayEvents = useMemo(() => {
    if (selectedDay === null) return [];
    return eventDays.get(selectedDay) || [];
  }, [selectedDay, eventDays]);

  const feed = useMemo(() => [
    ...(notificationsQuery.data || []).map(notificationToFeed),
    ...(activitiesQuery.data || []).map(activityToFeed),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 6), [activitiesQuery.data, notificationsQuery.data]);

  const isCurrentDay = (day: number) => {
    const now = new Date();
    return day === now.getDate() && calendarMonth.getMonth() === now.getMonth() && calendarMonth.getFullYear() === now.getFullYear();
  };

  const formatDateFull = (day: number) => {
    return `${day} ${MONTHS[calendarMonth.getMonth()]} ${calendarMonth.getFullYear()}`;
  };

  const isLoadingProfile = profileQuery.isLoading;
  const isErrorProfile = profileQuery.isError;

  return (
    <div className="space-y-6 pb-8">
      {/* Welcome Banner */}
      <section className="relative overflow-hidden rounded-2xl bg-komuna-navy px-5 py-6 text-white shadow-sm sm:px-7">
        <div className="absolute -right-16 -top-24 h-64 w-64 rounded-full bg-komuna-aqua/20 blur-2xl" />
        <div className="absolute -bottom-24 right-32 h-48 w-48 rounded-full bg-komuna-blue/50 blur-2xl" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-komuna-aqua">Overview</p>
            {isLoadingProfile ? (
              <>
                <SkeletonPulse className="h-8 w-64 bg-white/20" />
                <SkeletonPulse className="mt-2 h-4 w-96 max-w-full bg-white/10" />
              </>
            ) : (
              <>
                <h1 className="text-2xl font-bold sm:text-3xl">
                  Selamat datang, {profile.name || "Member"}!
                </h1>
                <p className="mt-2 max-w-xl text-sm leading-6 text-blue-100">
                  Temukan komunitas baru, pantau agenda, dan ikuti aktivitas terbaru dalam satu tempat.
                </p>
              </>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/communities/create" className="inline-flex w-fit items-center gap-2 rounded-lg border border-white/30 bg-white/10 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white">
              <Icon name="plus" className="h-4 w-4" />
              Buat Komunitas
            </Link>
            <Link href="/communities" className="inline-flex w-fit items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-bold text-komuna-navy transition-colors hover:bg-blue-50">
              <Icon name="sparkles" className="h-4 w-4 text-komuna-blue" />
              Jelajahi Komunitas
            </Link>
          </div>
        </div>
      </section>

      {/* Summary Cards */}
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {isLoadingProfile ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : isErrorProfile ? (
          <div className="col-span-full rounded-xl border border-red-200 bg-red-50 p-4 sm:col-span-3">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-500">
                <Icon name="alertCircle" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-red-700">Data dashboard tidak dapat dimuat.</p>
                <p className="mt-0.5 text-xs text-red-600">Terjadi kendala saat mengambil data. Silakan coba lagi.</p>
                <button
                  onClick={() => profileQuery.refetch()}
                  className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-red-700 hover:text-red-900"
                >
                  <Icon name="refresh" className="h-3.5 w-3.5" />
                  Coba Lagi
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            {followedCommunities.length === 0 ? (
              <StatCardEmpty
                icon="users"
                label="Komunitas Diikuti"
                description="Belum mengikuti komunitas"
                href="/communities"
                ctaLabel="Temukan Komunitas"
              />
            ) : (
              <StatCard
                icon="users"
                label="Komunitas Diikuti"
                value={followedCommunities.length}
                href="/dashboard/communities"
                accent="bg-blue-50 text-komuna-blue"
              />
            )}
            {(profile.registeredEventsCount ?? registeredEvents.length) === 0 ? (
              <StatCardEmpty
                icon="calendar"
                label="Event Terdaftar"
                description="Belum ada event yang diikuti"
                href="/events"
                ctaLabel="Jelajahi Event"
              />
            ) : (
              <StatCard
                icon="calendar"
                label="Event Terdaftar"
                value={profile.registeredEventsCount ?? registeredEvents.length}
                href="/dashboard/events"
                accent="bg-emerald-50 text-komuna-teal"
              />
            )}
            {savedEventsCount === 0 ? (
              <StatCardEmpty
                icon="bookmark"
                label="Event Tersimpan"
                description="Simpan event yang ingin kamu ikuti"
                href="/events"
                ctaLabel="Lihat Event"
              />
            ) : (
              <StatCard
                icon="bookmark"
                label="Event Tersimpan"
                value={savedEventsCount}
                href="/dashboard/events?tab=saved"
                accent="bg-amber-50 text-amber-600"
              />
            )}
          </>
        )}
      </section>

      {/* Recommendations + Calendar */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.45fr)_minmax(290px,0.75fr)]">
        {/* Recommendations */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <SectionHeader title="Rekomendasi Komunitas" subtitle="Komunitas pilihan yang mungkin sesuai dengan minatmu" href="/communities" />
          {popularCommunitiesQuery.isLoading ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="flex gap-3 rounded-xl border border-slate-100 p-3">
                  <SkeletonPulse className="h-12 w-12 shrink-0 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <SkeletonPulse className="h-4 w-3/4" />
                    <SkeletonPulse className="h-3 w-1/2" />
                    <SkeletonPulse className="h-3 w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : popularCommunitiesQuery.isError ? (
            <div className="rounded-xl bg-red-50 p-4 text-center">
              <p className="text-sm text-red-600">Rekomendasi komunitas gagal dimuat.</p>
              <button
                onClick={() => popularCommunitiesQuery.refetch()}
                className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-red-700 hover:text-red-900"
              >
                <Icon name="refresh" className="h-3.5 w-3.5" />
                Coba Lagi
              </button>
            </div>
          ) : popularCommunitiesQuery.data?.length ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {popularCommunitiesQuery.data.slice(0, 4).map((community) => (
                <Link key={community.id} href={`/communities/${community.slug}`} className="group flex gap-3 rounded-xl border border-slate-100 p-3 transition-colors hover:border-komuna-blue/25 hover:bg-blue-50/40">
                  {community.logo || community.coverImage ? (
                    <img src={community.logo || community.coverImage || ""} alt={community.name} className="h-12 w-12 shrink-0 rounded-xl object-cover" />
                  ) : (
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-komuna-blue to-komuna-teal text-lg font-extrabold text-white">
                      {community.name.charAt(0)}
                    </span>
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-bold text-komuna-navy group-hover:text-komuna-blue">{community.name}</span>
                    <span className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                      <span>{community.memberCount || 0} anggota</span>
                      <span className="h-1 w-1 rounded-full bg-slate-300" aria-hidden="true" />
                      <span>{community.eventCount || 0} event</span>
                    </span>
                    {community.categories?.[0] && (
                      <span className="mt-2 inline-block rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                        {community.categories[0].name}
                      </span>
                    )}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="rounded-xl bg-slate-50 p-5 text-center text-sm text-slate-500">Belum ada rekomendasi komunitas.</p>
          )}
        </div>

        {/* Calendar */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-komuna-navy">Kalender Event</h2>
              <p className="text-xs text-slate-500">Event yang kamu ikuti</p>
            </div>
            <div className="flex gap-1">
              <button
                type="button"
                aria-label="Bulan sebelumnya"
                onClick={() => { setCalendarMonth((date) => new Date(date.getFullYear(), date.getMonth() - 1, 1)); setSelectedDay(null); }}
                className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-50 hover:text-komuna-blue"
              >
                <Icon name="chevronLeft" className="h-4 w-4" />
              </button>
              <button
                type="button"
                aria-label="Bulan berikutnya"
                onClick={() => { setCalendarMonth((date) => new Date(date.getFullYear(), date.getMonth() + 1, 1)); setSelectedDay(null); }}
                className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-50 hover:text-komuna-blue"
              >
                <Icon name="chevronRight" className="h-4 w-4" />
              </button>
            </div>
          </div>
          <p className="mb-3 text-sm font-bold text-slate-800">{MONTHS[calendarMonth.getMonth()]} {calendarMonth.getFullYear()}</p>
          <div className="grid grid-cols-7 gap-y-1 text-center">
            {DAYS.map((day) => (
              <span key={day} className="py-1 text-[10px] font-bold uppercase text-slate-400">{day}</span>
            ))}
            {calendarDays.map((day, index) => (
              <span key={`${day || "empty"}-${index}`} className="flex h-8 items-center justify-center">
                {day && (
                  <button
                    type="button"
                    onClick={() => setSelectedDay(selectedDay === day ? null : day)}
                    className={`relative flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                      selectedDay === day
                        ? "bg-komuna-blue text-white ring-2 ring-komuna-blue/20"
                        : isCurrentDay(day)
                          ? "bg-komuna-navy text-white"
                          : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {day}
                    {eventDays.has(day) && (
                      <span className={`absolute -bottom-0.5 h-1.5 w-1.5 rounded-full ring-2 ring-white ${
                        selectedDay === day ? "bg-komuna-aqua" : isCurrentDay(day) ? "bg-komuna-aqua" : "bg-komuna-blue"
                      }`} />
                    )}
                  </button>
                )}
              </span>
            ))}
          </div>

          {/* Selected Day Detail */}
          <div className="mt-4 border-t border-slate-100 pt-3">
            {selectedDay !== null ? (
              <div>
                <p className="mb-2 text-xs font-bold text-slate-700">Event pada {formatDateFull(selectedDay)}</p>
                {selectedDayEvents.length > 0 ? (
                  <div className="space-y-2">
                    {selectedDayEvents.map((event) => (
                      <Link key={event.id} href={`/events/${event.slug}`} className="flex items-center gap-3 rounded-lg bg-blue-50/70 p-3 hover:bg-blue-50">
                        <span className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-lg bg-white text-komuna-blue shadow-sm">
                          <span className="text-[9px] font-bold uppercase">{new Date(event.eventDate).toLocaleDateString("id-ID", { month: "short" })}</span>
                          <span className="text-base font-extrabold leading-none">{new Date(event.eventDate).getDate()}</span>
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-xs font-bold text-komuna-navy">{event.title}</span>
                          <span className="mt-0.5 block text-[11px] text-slate-500">
                            {event.locationType === "ONLINE" ? "Online" : event.location || "Lokasi menyusul"}
                          </span>
                        </span>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-xs text-slate-500">Tidak ada event pada tanggal ini.</p>
                )}
              </div>
            ) : upcomingRegisteredEvents[0] ? (
              <Link href={`/events/${upcomingRegisteredEvents[0].slug}`} className="flex items-center gap-3 rounded-lg bg-blue-50/70 p-3 hover:bg-blue-50">
                <span className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-lg bg-white text-komuna-blue shadow-sm">
                  <span className="text-[9px] font-bold uppercase">{new Date(upcomingRegisteredEvents[0].eventDate).toLocaleDateString("id-ID", { month: "short" })}</span>
                  <span className="text-base font-extrabold leading-none">{new Date(upcomingRegisteredEvents[0].eventDate).getDate()}</span>
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-xs font-bold text-komuna-navy">{upcomingRegisteredEvents[0].title}</span>
                  <span className="mt-0.5 block text-[11px] text-slate-500">Agenda terdekat</span>
                </span>
              </Link>
            ) : (
              <p className="text-center text-xs text-slate-500">Belum ada agenda terdaftar.</p>
            )}
          </div>
        </div>
      </section>

      {/* Popular Events */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <SectionHeader title="Event Mendatang Populer" href="/events" />
        {popularEventsQuery.isLoading ? (
          <div className="grid gap-4 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                <SkeletonPulse className="h-32 rounded-none" />
                <div className="space-y-2 p-4">
                  <SkeletonPulse className="h-4 w-3/4" />
                  <SkeletonPulse className="h-3 w-1/2" />
                  <SkeletonPulse className="h-3 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : popularEventsQuery.isError ? (
          <div className="rounded-xl bg-red-50 p-4 text-center">
            <p className="text-sm text-red-600">Event populer gagal dimuat.</p>
            <button
              onClick={() => popularEventsQuery.refetch()}
              className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-red-700 hover:text-red-900"
            >
              <Icon name="refresh" className="h-3.5 w-3.5" />
              Coba Lagi
            </button>
          </div>
        ) : popularEventsQuery.data?.length ? (
          <div className="grid gap-4 md:grid-cols-3">
            {popularEventsQuery.data.slice(0, 3).map((event) => (
              <Link key={event.id} href={`/events/${event.slug}`} className="group overflow-hidden rounded-xl border border-slate-200 bg-white transition-all hover:-translate-y-0.5 hover:shadow-md">
                <div className="relative h-32 overflow-hidden bg-gradient-to-br from-komuna-blue to-komuna-teal">
                  {event.coverImage || event.thumbnail ? (
                    <img src={event.coverImage || event.thumbnail || ""} alt={event.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                  ) : (
                    <span className="flex h-full items-center justify-center text-4xl font-black text-white/30">{event.title.charAt(0)}</span>
                  )}
                  <span className="absolute left-3 top-3 rounded-lg bg-white/95 px-2 py-1 text-[10px] font-bold text-komuna-blue shadow-sm">{event.registeredCount || 0} peserta</span>
                </div>
                <div className="p-4">
                  <p className="mb-2 line-clamp-2 text-sm font-bold leading-5 text-komuna-navy group-hover:text-komuna-blue">{event.title}</p>
                  <p className="flex items-center gap-2 text-xs font-medium text-slate-600">
                    <Icon name="calendar" className="h-3.5 w-3.5 text-komuna-blue" />
                    {new Date(event.eventDate).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                  <p className="mt-1.5 flex items-center gap-2 truncate text-xs text-slate-500">
                    <Icon name="location" className="h-3.5 w-3.5 text-slate-400" />
                    {event.locationType === "ONLINE" ? "Online" : event.location || "Lokasi menyusul"}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="rounded-xl bg-slate-50 p-5 text-center text-sm text-slate-500">Belum ada event mendatang.</p>
        )}
      </section>

      {/* Activity & Profile */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(290px,0.85fr)]">
        {/* Activity Feed */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <SectionHeader title="Aktivitas & Notifikasi" href="/dashboard/activity" linkLabel="Riwayat" />
          {notificationsQuery.isLoading || activitiesQuery.isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                  <SkeletonPulse className="h-9 w-9 shrink-0 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <SkeletonPulse className="h-4 w-3/4" />
                    <SkeletonPulse className="h-3 w-1/2" />
                  </div>
                  <SkeletonPulse className="h-3 w-12 shrink-0" />
                </div>
              ))}
            </div>
           ) : notificationsQuery.isError && activitiesQuery.isError ? (
             <div className="rounded-xl bg-red-50 p-4 text-center" role="alert">
               <p className="text-sm text-red-600">Aktivitas dan notifikasi gagal dimuat.</p>
               <button
                 type="button"
                 onClick={() => { notificationsQuery.refetch(); activitiesQuery.refetch(); }}
                 className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-red-700 hover:text-red-900"
               >
                 <Icon name="refresh" className="h-3.5 w-3.5" />
                 Coba Lagi
               </button>
             </div>
           ) : feed.length ? (
            <div className="divide-y divide-slate-100">
              {feed.map((item) => {
                const style = FEED_STYLES[item.kind];
                return (
                  <Link key={item.id} href={item.href} className="group flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                    <span className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${style.bg} ${style.text}`}>
                      <Icon name={item.kind === "event" ? "calendar" : item.kind === "community" ? "users" : item.kind === "approval" ? "bell" : "clock"} className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span className="truncate text-sm font-bold text-slate-800 group-hover:text-komuna-blue">{item.title}</span>
                        {item.unread && <span className="h-2 w-2 shrink-0 rounded-full bg-komuna-blue" aria-label="Belum dibaca" />}
                      </span>
                      <span className="mt-0.5 block truncate text-xs text-slate-500">{item.description}</span>
                    </span>
                    <span className="shrink-0 text-[11px] text-slate-400">{formatRelativeDate(item.createdAt)}</span>
                  </Link>
                );
              })}
            </div>
           ) : notificationsQuery.isError || activitiesQuery.isError ? (
             <div className="rounded-xl bg-amber-50 p-4 text-center" role="status">
               <p className="text-sm text-amber-700">Sebagian pembaruan belum dapat dimuat.</p>
               <button
                 type="button"
                 onClick={() => { if (notificationsQuery.isError) notificationsQuery.refetch(); if (activitiesQuery.isError) activitiesQuery.refetch(); }}
                 className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-amber-800 hover:text-amber-950"
               >
                 <Icon name="refresh" className="h-3.5 w-3.5" />
                 Coba Lagi
               </button>
             </div>
           ) : (
            <p className="rounded-xl bg-slate-50 p-6 text-center text-sm text-slate-500">Belum ada aktivitas atau notifikasi.</p>
          )}
        </div>

        {/* Profile Summary */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="bg-gradient-to-br from-komuna-navy to-komuna-blue p-5 text-white">
            {isLoadingProfile ? (
              <div className="flex items-center gap-3">
                <SkeletonPulse className="h-14 w-14 shrink-0 rounded-2xl bg-white/20" />
                <div className="flex-1 space-y-2">
                  <SkeletonPulse className="h-3 w-20 bg-white/20" />
                  <SkeletonPulse className="h-5 w-32 bg-white/20" />
                  <SkeletonPulse className="h-3 w-24 bg-white/10" />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                {profile.avatar ? (
                  <img src={profile.avatar} alt={profile.name || "Profil"} className="h-14 w-14 rounded-2xl border-2 border-white/30 object-cover" />
                ) : (
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-xl font-black">{profile.name?.charAt(0).toUpperCase() || "M"}</span>
                )}
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-komuna-aqua">Profile Summary</p>
                  <h2 className="truncate text-lg font-bold">{profile.name || "Member"}</h2>
                  <p className="truncate text-xs text-blue-100">@{profile.username || "member"}</p>
                  {profile.email && <p className="mt-0.5 truncate text-[11px] text-blue-200">{profile.email}</p>}
                </div>
              </div>
            )}
            {!isLoadingProfile && profile.bio && (
              <p className="mt-4 line-clamp-2 text-xs leading-5 text-blue-100">{profile.bio}</p>
            )}
          </div>
          <div className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-bold text-komuna-navy">Profil dan Minat Saya</h2>
              <Link href="/dashboard/profile" className="text-xs font-bold text-komuna-blue hover:text-komuna-navy">Edit Profile</Link>
            </div>
            {isLoadingProfile ? (
              <div className="space-y-2">
                <SkeletonPulse className="h-5 w-20 rounded-full" />
                <SkeletonPulse className="h-5 w-24 rounded-full" />
                <SkeletonPulse className="h-5 w-16 rounded-full" />
              </div>
            ) : profile.interests?.length ? (
              <div className="flex flex-wrap gap-2">
                {profile.interests.slice(0, 7).map((interest) => (
                  <span key={interest} className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-komuna-blue">{interest}</span>
                ))}
              </div>
            ) : (
              <p className="text-xs leading-5 text-slate-500">Tambahkan minat agar rekomendasi komunitas dan event lebih sesuai.</p>
            )}
            <Link href="/dashboard/interests" className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-komuna-teal hover:text-komuna-navy">
              <Icon name="plus" className="h-3.5 w-3.5" />
              Kelola minat
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
