"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { useAuth } from "@/components/auth-provider";
import { SearchInput } from "@/components/ui/search-input";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Pagination } from "@/components/pagination";

interface UserCommunity {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  role: string;
  status: string;
  leftAt?: string | null;
  leftReason?: "LEFT" | "BANNED" | "REMOVED" | null;
  categories?: { id: string; name: string }[];
  memberCount?: number;
  eventCount?: number;
  province?: string | null;
  city?: string | null;
  updatedAt?: string;
}

interface UserProfile {
  communities?: UserCommunity[];
  createdCommunities?: UserCommunity[];
  followedCommunities?: UserCommunity[];
  pastCommunities?: UserCommunity[];
}

type CommunityTab = "created" | "followed" | "past" | "left";

const TABS: { id: CommunityTab; label: string }[] = [
  { id: "created", label: "Dibuat oleh Saya" },
  { id: "followed", label: "Diikuti" },
  { id: "past", label: "Pernah Diikuti" },
  { id: "left", label: "Ditinggalkan" },
];

const ROLE_LABELS: Record<string, string> = {
  OWNER: "Pemilik",
  ADMIN: "Admin",
  EVENT_MANAGER: "Manajer Event",
  MEMBER: "Anggota",
};

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Aktif",
  DRAFT: "Draft",
  INACTIVE: "Nonaktif",
  ARCHIVED: "Arsip",
  PENDING: "Menunggu",
  APPROVED: "Disetujui",
  REJECTED: "Ditolak",
  REVISION_REQUIRED: "Perlu Revisi",
};

const STATUS_VARIANT: Record<string, string> = {
  ACTIVE: "active",
  APPROVED: "approved",
  DRAFT: "default",
  INACTIVE: "archived",
  ARCHIVED: "archived",
  PENDING: "pending",
  REJECTED: "rejected",
  REVISION_REQUIRED: "pending",
};

const CREATED_FILTERS = [
  { value: "all", label: "Semua" },
  { value: "ACTIVE", label: "Aktif" },
  { value: "DRAFT", label: "Draft" },
  { value: "INACTIVE", label: "Nonaktif" },
  { value: "ARCHIVED", label: "Arsip" },
];

const FOLLOWED_FILTERS = [
  { value: "all", label: "Semua" },
  { value: "ACTIVE", label: "Aktif" },
  { value: "has_event", label: "Ada Event" },
  { value: "no_event", label: "Tanpa Event" },
];

const HISTORY_SORT = [
  { value: "newest", label: "Terbaru" },
  { value: "oldest", label: "Terlama" },
];

const ITEMS_PER_PAGE = 12;

function formatDate(dateStr: string) {
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(new Date(dateStr));
}

function formatLocation(province?: string | null, city?: string | null) {
  const parts = [city, province].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : null;
}

function CommunityCardSkeleton() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="h-12 w-12 rounded-lg bg-slate-100 animate-pulse flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-3/4 rounded bg-slate-100 animate-pulse" />
          <div className="h-3 w-1/2 rounded bg-slate-100 animate-pulse" />
        </div>
      </div>
      <div className="mt-3 space-y-2">
        <div className="h-3 w-full rounded bg-slate-100 animate-pulse" />
        <div className="h-3 w-2/3 rounded bg-slate-100 animate-pulse" />
      </div>
      <div className="mt-3 flex gap-2">
        <div className="h-6 w-16 rounded-full bg-slate-100 animate-pulse" />
        <div className="h-6 w-20 rounded-full bg-slate-100 animate-pulse" />
      </div>
    </div>
  );
}

function SummaryCardSkeleton() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="h-3 w-24 rounded bg-slate-100 animate-pulse" />
      <div className="mt-2 h-7 w-10 rounded bg-slate-100 animate-pulse" />
      <div className="mt-1 h-3 w-32 rounded bg-slate-100 animate-pulse" />
    </div>
  );
}

function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
        <svg className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </div>
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      <p className="mt-1 text-sm text-slate-500 max-w-sm">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="h-16 w-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
        <svg className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <h3 className="text-base font-semibold text-slate-900">Komunitas tidak dapat dimuat</h3>
      <p className="mt-1 text-sm text-slate-500 max-w-sm">{message}</p>
      <button
        onClick={onRetry}
        className="mt-4 px-4 py-2 text-sm font-medium text-white bg-komuna-blue rounded-lg hover:bg-komuna-navy transition-colors"
      >
        Coba Lagi
      </button>
    </div>
  );
}

export default function MyCommunitiesPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<CommunityTab>("created");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest");
  const [page, setPage] = useState(1);
  const [leaveTarget, setLeaveTarget] = useState<UserCommunity | null>(null);
  const [leaving, setLeaving] = useState(false);

  const { data: profile, isLoading, error, refetch } = useQuery({
    queryKey: ["profile", "communities"],
    enabled: !!user,
    queryFn: async () => {
      const res = await api.get("/users/profile");
      return (res.data.data?.user || res.data.user) as UserProfile;
    },
  });

  const communities: UserCommunity[] = profile?.communities || [];

  const communityGroups = useMemo(() => {
    const created = profile?.createdCommunities || communities.filter((c) => c.role === "OWNER");
    const followed = profile?.followedCommunities || communities.filter((c) => c.role !== "OWNER" && !c.leftAt);
    const past = profile?.pastCommunities || communities.filter((c) => c.role !== "OWNER" && !!c.leftAt && c.leftReason !== "LEFT");
    const left = communities.filter((c) => c.leftReason === "LEFT" || (!c.leftReason && !!c.leftAt));
    return { created, followed, past, left };
  }, [profile, communities]);

  const summary = useMemo(() => ({
    created: communityGroups.created.length,
    followed: communityGroups.followed.length,
    past: communityGroups.past.length,
    left: communityGroups.left.length,
  }), [communityGroups]);

  const filtered = useMemo(() => {
    let items = communityGroups[tab];

    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.slug.toLowerCase().includes(q)
      );
    }

    if (tab === "created" && statusFilter !== "all") {
      items = items.filter((c) => c.status === statusFilter);
    }

    if (tab === "followed" && statusFilter !== "all") {
      if (statusFilter === "has_event") {
        items = items.filter((c) => (c.eventCount ?? 0) > 0);
      } else if (statusFilter === "no_event") {
        items = items.filter((c) => (c.eventCount ?? 0) === 0);
      } else {
        items = items.filter((c) => c.status === statusFilter);
      }
    }

    if (tab === "past" || tab === "left") {
      items = [...items].sort((a, b) => {
        const dateA = a.leftAt || a.updatedAt || "";
        const dateB = b.leftAt || b.updatedAt || "";
        return sortBy === "newest"
          ? new Date(dateB).getTime() - new Date(dateA).getTime()
          : new Date(dateA).getTime() - new Date(dateB).getTime();
      });
    }

    return items;
  }, [communityGroups, tab, search, statusFilter, sortBy]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginatedItems = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleTabChange = (newTab: CommunityTab) => {
    setTab(newTab);
    setSearch("");
    setStatusFilter("all");
    setSortBy("newest");
    setPage(1);
  };

  const handleLeave = async () => {
    if (!leaveTarget) return;
    setLeaving(true);
    try {
      await api.post(`/communities/${leaveTarget.id}/leave`);
      refetch();
    } catch {
    } finally {
      setLeaving(false);
      setLeaveTarget(null);
    }
  };

  const getFilterOptions = () => {
    switch (tab) {
      case "created":
        return CREATED_FILTERS;
      case "followed":
        return FOLLOWED_FILTERS;
      default:
        return [];
    }
  };

  const filterOptions = getFilterOptions();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-komuna-navy">Komunitas Saya</h1>
          <p className="text-sm text-slate-500 mt-1">
            Kelola komunitas yang Anda buat dan komunitas yang Anda ikuti.
          </p>
        </div>
        <Link
          href="/communities/create"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-komuna-blue text-white rounded-lg font-medium text-sm hover:bg-komuna-navy transition-colors shrink-0"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Buat Komunitas
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <SummaryCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3" role="list" aria-label="Ringkasan komunitas">
          {[
            { key: "created" as const, label: "Komunitas Dibuat", desc: "Komunitas yang Anda kelola", count: summary.created },
            { key: "followed" as const, label: "Komunitas Diikuti", desc: "Komunitas yang sedang Anda ikuti", count: summary.followed },
            { key: "past" as const, label: "Pernah Diikuti", desc: "Riwayat komunitas Anda", count: summary.past },
            { key: "left" as const, label: "Ditinggalkan", desc: "Komunitas yang sudah Anda tinggalkan", count: summary.left },
          ].map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => handleTabChange(item.key)}
              className={`rounded-xl border p-4 text-left transition-all ${
                tab === item.key
                  ? "border-komuna-blue bg-komuna-blue/5 shadow-sm"
                  : "border-slate-200 bg-white hover:border-komuna-blue/30 hover:shadow-sm"
              }`}
              role="listitem"
              aria-label={`${item.label}: ${item.count}`}
            >
              <p className="text-xs font-medium text-slate-500">{item.label}</p>
              <p className={`mt-1 text-2xl font-bold ${tab === item.key ? "text-komuna-blue" : "text-komuna-navy"}`}>
                {item.count}
              </p>
              <p className="mt-0.5 text-xs text-slate-400">{item.desc}</p>
            </button>
          ))}
        </div>
      )}

      <div className="border-b border-slate-200" role="tablist" aria-label="Tab komunitas">
        <div className="flex overflow-x-auto gap-0 scrollbar-hide" role="tablist">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              aria-controls={`tabpanel-${t.id}`}
              id={`tab-${t.id}`}
              onClick={() => handleTabChange(t.id)}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                tab === t.id
                  ? "border-komuna-blue text-komuna-blue"
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Cari komunitas..."
            ariaLabel="Cari komunitas"
          />
        </div>
        {filterOptions.length > 0 && (
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-komuna-blue/50 focus:border-komuna-blue"
            aria-label="Filter status"
          >
            {filterOptions.map((f) => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
        )}
        {(tab === "past" || tab === "left") && (
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "newest" | "oldest")}
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-komuna-blue/50 focus:border-komuna-blue"
            aria-label="Urutkan"
          >
            {HISTORY_SORT.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        )}
      </div>

      <div id={`tabpanel-${tab}`} role="tabpanel" aria-labelledby={`tab-${tab}`}>
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <CommunityCardSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <ErrorState message="Terjadi kendala saat mengambil data komunitas." onRetry={() => refetch()} />
        ) : paginatedItems.length === 0 ? (
          tab === "created" ? (
            <EmptyState
              title="Belum ada komunitas yang Anda buat"
              description="Bangun ruang komunitas Anda dan mulai menghubungkan orang dengan minat yang sama."
              action={
                <Link
                  href="/communities/create"
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-komuna-blue text-white rounded-lg text-sm font-medium hover:bg-komuna-navy transition-colors"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Buat Komunitas
                </Link>
              }
            />
          ) : tab === "followed" ? (
            <EmptyState
              title="Anda belum mengikuti komunitas"
              description="Temukan komunitas yang sesuai dengan minat Anda."
              action={
                <Link
                  href="/communities"
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-komuna-blue text-white rounded-lg text-sm font-medium hover:bg-komuna-navy transition-colors"
                >
                  Jelajahi Komunitas
                </Link>
              }
            />
          ) : tab === "past" ? (
            <EmptyState
              title="Belum ada riwayat komunitas"
              description="Komunitas yang pernah Anda ikuti akan muncul di sini."
              action={
                <Link
                  href="/communities"
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-komuna-blue text-white rounded-lg text-sm font-medium hover:bg-komuna-navy transition-colors"
                >
                  Jelajahi Komunitas
                </Link>
              }
            />
          ) : (
            <EmptyState
              title="Tidak ada komunitas yang ditinggalkan"
              description="Komunitas yang Anda tinggalkan akan muncul di sini."
            />
          )
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedItems.map((c) => (
                <CommunityCard
                  key={c.id}
                  community={c}
                  tab={tab}
                  onLeave={() => setLeaveTarget(c)}
                />
              ))}
            </div>
            {totalPages > 1 && (
              <div className="mt-6">
                <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
              </div>
            )}
          </>
        )}
      </div>

      <ConfirmDialog
        open={!!leaveTarget}
        title="Tinggalkan Komunitas?"
        message="Anda tidak akan lagi menerima pembaruan dari komunitas ini."
        confirmLabel="Tinggalkan"
        cancelLabel="Batal"
        variant="danger"
        loading={leaving}
        onConfirm={handleLeave}
        onCancel={() => setLeaveTarget(null)}
      />
    </div>
  );
}

function CommunityCard({
  community,
  tab,
  onLeave,
}: {
  community: UserCommunity;
  tab: CommunityTab;
  onLeave: () => void;
}) {
  const location = formatLocation(community.province, community.city);
  const categoryNames = community.categories?.map((c) => c.name).join(", ");

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        {community.logo ? (
          <img
            src={community.logo}
            alt={community.name}
            className="h-12 w-12 rounded-lg object-cover flex-shrink-0"
          />
        ) : (
          <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-komuna-blue to-komuna-teal flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-lg">{community.name[0]}</span>
          </div>
        )}
        <div className="min-w-0 flex-1">
          <Link
            href={tab === "created" ? `/dashboard/communities/${community.id}` : `/communities/${community.slug}`}
            className="font-semibold text-komuna-navy truncate hover:text-komuna-blue transition-colors block"
          >
            {community.name}
          </Link>
          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
            {categoryNames && (
              <span className="text-xs text-slate-500">{categoryNames}</span>
            )}
            {location && (
              <>
                {categoryNames && <span className="text-slate-300">•</span>}
                <span className="text-xs text-slate-500">{location}</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-3 text-xs text-slate-500">
        {community.memberCount != null && (
          <span className="flex items-center gap-1">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {community.memberCount} anggota
          </span>
        )}
        {community.eventCount != null && (
          <span className="flex items-center gap-1">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {community.eventCount} event
          </span>
        )}
      </div>

      <div className="mt-3 flex items-center gap-2 flex-wrap">
        <Badge variant={STATUS_VARIANT[community.status] || "default"}>
          {STATUS_LABELS[community.status] || community.status}
        </Badge>
        {tab === "created" && community.role && (
          <Badge variant="default">{ROLE_LABELS[community.role] || community.role}</Badge>
        )}
        {tab === "left" && community.leftAt && (
          <span className="text-xs text-slate-400">
            Keluar {formatDate(community.leftAt)}
          </span>
        )}
        {tab === "past" && community.leftAt && (
          <span className="text-xs text-slate-400">
            Pernah bergabung
          </span>
        )}
      </div>

      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2">
        {tab === "created" ? (
          <>
            <Link
              href={`/dashboard/communities/${community.id}`}
              className="px-3 py-1.5 text-xs font-medium text-komuna-blue bg-komuna-blue/10 rounded-lg hover:bg-komuna-blue/20 transition-colors"
            >
              Kelola
            </Link>
            <Link
              href={`/communities/${community.slug}`}
              className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
            >
              Lihat
            </Link>
          </>
        ) : tab === "followed" ? (
          <>
            <Link
              href={`/communities/${community.slug}`}
              className="px-3 py-1.5 text-xs font-medium text-komuna-blue bg-komuna-blue/10 rounded-lg hover:bg-komuna-blue/20 transition-colors"
            >
              Lihat Komunitas
            </Link>
            <button
              type="button"
              onClick={onLeave}
              className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
            >
              Tinggalkan
            </button>
          </>
        ) : (
          <>
            <Link
              href={`/communities/${community.slug}`}
              className="px-3 py-1.5 text-xs font-medium text-komuna-blue bg-komuna-blue/10 rounded-lg hover:bg-komuna-blue/20 transition-colors"
            >
              Lihat Detail
            </Link>
            {community.status !== "ARCHIVED" && (
              <Link
                href={`/communities/${community.slug}`}
                className="px-3 py-1.5 text-xs font-medium text-white bg-komuna-blue rounded-lg hover:bg-komuna-navy transition-colors"
              >
                Gabung Lagi
              </Link>
            )}
          </>
        )}
      </div>
    </div>
  );
}
