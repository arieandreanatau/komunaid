"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import api from "@/lib/api";
import { useAuth } from "@/components/auth-provider";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { getInitial } from "@/lib/initial";
import { GallerySection } from "@/components/gallery-section";
import { ForumSection } from "@/components/forum-section";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { CommunityDetailSkeleton } from "@/components/skeleton";

interface CommunityMember {
  id: string;
  name: string;
  avatar: string | null;
  role: string;
}

interface CommunityEvent {
  id: string;
  title: string;
  slug: string;
  eventDate: string;
  endDate: string | null;
  coverImage: string | null;
  status: string;
  location: string | null;
  locationType: string | null;
  registeredCount?: number;
  quota?: number;
}

interface VolunteerProgram {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  location: string | null;
  status: string;
  startDate: string;
  endDate: string | null;
  applicationCount: number;
}

interface MediaItem {
  id: string;
  title: string;
  content: string;
  type: "ANNOUNCEMENT" | "NEWS";
  imageUrl: string | null;
  isPublished: boolean;
  publishedAt: string | null;
  createdBy: { id: string; name: string; avatar: string | null };
  createdAt: string;
}

interface Community {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  coverImage: string | null;
  logo: string | null;
  banner: string | null;
  location: string | null;
  website: string | null;
  instagram: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  membershipType: string;
  visibility: string;
  status: string;
  owner: { id: string; name: string; avatar: string | null };
  memberCount: number;
  eventCount: number;
  membersPreview: CommunityMember[];
  officers: CommunityMember[];
  upcomingEvents: CommunityEvent[];
  currentEvents: CommunityEvent[];
  pastEvents: CommunityEvent[];
  futureEvents: CommunityEvent[];
  categories: { id: string; name: string }[];
  tags: { id: string; tag: string }[];
  settings: { showMemberList: boolean; showEventList: boolean } | null;
  userMembership: { role: string; status: string } | null;
  pendingJoinRequests: number;
  isSaved: boolean;
  createdAt?: string;
}

const ROLE_LABELS: Record<string, string> = {
  OWNER: "Pemilik",
  ADMIN: "Admin",
  EVENT_MANAGER: "Pengelola Event",
  VOLUNTEER_COORDINATOR: "Koordinator Volunteer",
  MEMBER: "Anggota",
};

const VOLUNTEER_STATUS_LABELS: Record<string, string> = {
  SCHEDULED: "Terjadwal",
  REGISTRATION_OPEN: "Menerima Pendaftaran",
  REGISTRATION_CLOSED: "Pendaftaran Ditutup",
  ONGOING: "Berlangsung",
  COMPLETED: "Selesai",
};

const VOLUNTEER_STATUS_COLORS: Record<string, string> = {
  SCHEDULED: "bg-blue-50 text-blue-700 border-blue-200",
  REGISTRATION_OPEN: "bg-emerald-50 text-emerald-700 border-emerald-200",
  REGISTRATION_CLOSED: "bg-gray-100 text-gray-600 border-gray-200",
  ONGOING: "bg-amber-50 text-amber-700 border-amber-200",
  COMPLETED: "bg-gray-100 text-gray-600 border-gray-200",
};

type CommunityTab = "tentang" | "aktivitas" | "event" | "volunteer" | "anggota" | "media";

const COMMUNITY_TABS: { value: CommunityTab; label: string }[] = [
  { value: "tentang", label: "Tentang" },
  { value: "event", label: "Event" },
  { value: "volunteer", label: "Volunteer" },
  { value: "aktivitas", label: "Aktivitas" },
  { value: "anggota", label: "Anggota" },
  { value: "media", label: "Media" },
];

export default function CommunityDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const searchParams = useSearchParams();
  const { user, isAuthenticated } = useAuth();

  const [community, setCommunity] = useState<Community | null>(null);
  const [volunteers, setVolunteers] = useState<VolunteerProgram[]>([]);
  const [volunteersLoading, setVolunteersLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const [joinMessage, setJoinMessage] = useState("");
  const [joinLoading, setJoinLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<CommunityTab>(
    (searchParams.get("tab") as CommunityTab) || "tentang"
  );
  const tabsRef = useRef<HTMLDivElement>(null);

  const fetchCommunity = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await api.get(`/communities/${slug}`);
      setCommunity(data.data);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Gagal memuat data komunitas.");
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchCommunity();
  }, [fetchCommunity]);

  useEffect(() => {
    const id = community?.id;
    if (!id) return;
    let cancelled = false;
    (async () => {
      try {
        setVolunteersLoading(true);
        const { data } = await api.get("/volunteer-programs", {
          params: { communityId: id, limit: 5 },
        });
        if (!cancelled) setVolunteers(data.data || []);
      } catch {
        if (!cancelled) setVolunteers([]);
      } finally {
        if (!cancelled) setVolunteersLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [community?.id]);

  const handleJoin = async () => {
    if (!community) return;
    setJoinLoading(true);
    try {
      await api.post(`/communities/${community.id}/join`, {
        message: joinMessage || undefined,
      });
      setJoinModalOpen(false);
      setJoinMessage("");
      fetchCommunity();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Gagal mengirim permintaan.");
    } finally {
      setJoinLoading(false);
    }
  };

  const handleSave = async () => {
    if (!community || !isAuthenticated) {
      window.location.href = `/login?redirect=${encodeURIComponent(`/communities/${slug}`)}`;
      return;
    }
    setSaveLoading(true);
    try {
      await api[community.isSaved ? "delete" : "post"](`/communities/${community.id}/save`);
      setCommunity((current) => current ? { ...current, isSaved: !current.isSaved } : current);
    } catch (err: any) {
      alert(err?.response?.data?.message || "Gagal memperbarui komunitas tersimpan.");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleLeave = async () => {
    if (!community) return;
    if (!confirm("Yakin ingin keluar dari komunitas ini?")) return;
    setActionLoading(true);
    try {
      await api.post(`/communities/${community.id}/leave`);
      fetchCommunity();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Gagal keluar dari komunitas.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : `/communities/${slug}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: community?.name, url });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        alert("Link komunitas disalin.");
      }
    } catch {}
  };

  const isOwner = user && community && user.id === community.owner.id;
  const isAdmin =
    user &&
    community &&
    (isOwner || community.userMembership?.role === "ADMIN");
  const isPending = community?.userMembership?.status === "PENDING";
  const isMember = !!community?.userMembership && !isPending;
  const officers = community?.officers ?? [];

  if (loading) return <CommunityDetailSkeleton />;

  if (error || !community)
    return (
      <div className="min-h-screen flex flex-col bg-komuna-cream">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="h-8 w-8 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-komuna-navy mb-2">
              Komunitas Tidak Ditemukan
            </h2>
            <p className="text-gray-500 mb-6">
              {error || "Komunitas yang kamu cari tidak tersedia."}
            </p>
            <Link
              href="/communities"
              className="inline-flex items-center px-5 py-2.5 bg-komuna-blue text-white rounded-lg font-medium hover:bg-komuna-navy transition-colors"
            >
              Jelajahi Komunitas
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );

  return (
    <div className="min-h-screen flex flex-col bg-komuna-cream">
      <Header />

      <main className="flex-1">
        {/* ========== COVER ========== */}
        <section className="relative h-64 md:h-80 w-full overflow-hidden">
          {community.banner || community.coverImage ? (
            <img
              src={community.banner || community.coverImage!}
              alt={`${community.name} cover`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="h-full bg-gradient-to-br from-komuna-blue via-komuna-teal to-komuna-navy">
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white/10 text-[200px] font-bold leading-none select-none">
                  {getInitial(community.name)}
                </span>
              </div>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
        </section>

        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto -mt-20 relative z-10">
            {/* Breadcrumb */}
            <Breadcrumbs
              items={[
                { label: "Komunitas", href: "/communities" },
                { label: community.name },
              ]}
            />

            {/* ========== COMMUNITY IDENTITY ========== */}
            <div className="flex flex-col md:flex-row md:items-end gap-4 mb-6">
              <div className="flex-shrink-0">
                {community.logo ? (
                  <img
                    src={community.logo}
                    alt={`${community.name} logo`}
                    className="w-24 h-24 md:w-32 md:h-32 rounded-2xl border-4 border-white shadow-lg object-cover bg-white"
                  />
                ) : (
                  <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl border-4 border-white shadow-lg bg-komuna-blue flex items-center justify-center">
                    <span className="text-white text-3xl md:text-4xl font-bold">
                      {getInitial(community.name)}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0 pb-1">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h1 className="text-2xl md:text-3xl font-bold text-komuna-navy truncate">
                    {community.name}
                  </h1>
                  {community.categories.length > 0 && (
                    <Badge variant="primary">{community.categories[0].name}</Badge>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-500">
                  {community.location && (
                    <span className="inline-flex items-center gap-1">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {community.location}
                    </span>
                  )}
                  <span className="text-gray-300">|</span>
                  <span className="inline-flex items-center gap-1">
                    {community.visibility === "PUBLIC" ? "Publik" : "Privat"}
                  </span>
                  <span className="text-gray-300">|</span>
                  <span>
                    {community.membershipType === "OPEN" ? "Terbuka" : "Terbatas"}
                  </span>
                </div>
              </div>

              {/* ========== PRIMARY ACTIONS ========== */}
              <div className="flex flex-shrink-0 items-center gap-2">
                <button
                  onClick={handleShare}
                  className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-komuna-soft transition-colors text-sm"
                  title="Bagikan komunitas"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  <span className="hidden sm:inline">Bagikan</span>
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saveLoading}
                  aria-pressed={community.isSaved}
                  className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors disabled:opacity-50 ${community.isSaved ? "border-komuna-blue bg-komuna-blue/5 text-komuna-blue" : "border-gray-300 text-gray-700 hover:bg-komuna-soft"}`}
                >
                  <svg className="h-4 w-4" fill={community.isSaved ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-4-7 4V5z" /></svg>
                  <span className="hidden sm:inline">{saveLoading ? "Memproses..." : community.isSaved ? "Tersimpan" : "Simpan"}</span>
                </button>
                <CommunityActions
                  community={community}
                  isAuthenticated={isAuthenticated}
                  isOwner={!!isOwner}
                  isAdmin={!!isAdmin}
                  isMember={isMember}
                  isPending={isPending}
                  actionLoading={actionLoading}
                  onJoin={() => setJoinModalOpen(true)}
                  onJoinDirect={handleJoin}
                  onLeave={handleLeave}
                />
              </div>
            </div>

            {/* ========== COMMUNITY STATS ========== */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <StatCard
                value={community.memberCount}
                label="Anggota"
                icon={
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                }
              />
              <StatCard
                value={community.eventCount}
                label="Event"
                icon={
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                }
              />
              <StatCard
                value={community.categories.length}
                label="Kategori"
                icon={
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                }
              />
              <StatCard
                value={community.location || "-"}
                label="Lokasi"
                isText
                icon={
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                }
              />
            </div>

            {/* ========== COMMUNITY NAVIGATION (TABS) ========== */}
            <div
              ref={tabsRef}
              className="flex gap-1 mb-6 overflow-x-auto scrollbar-hide pb-1"
              role="tablist"
              aria-label="Navigasi komunitas"
            >
              {COMMUNITY_TABS.map((tab) => {
                const isActive = activeTab === tab.value;
                return (
                  <button
                    key={tab.value}
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setActiveTab(tab.value)}
                    className={`flex-shrink-0 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-komuna-blue text-white shadow-sm"
                        : "bg-white text-gray-600 hover:bg-gray-50 hover:text-komuna-navy border border-gray-200"
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* ========== TWO-COLUMN LAYOUT ========== */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-12">
              {/* ===== MAIN CONTENT ===== */}
              <div className="lg:col-span-2 space-y-6">
                {activeTab === "tentang" && (
                  <AboutSection community={community} />
                )}

                {activeTab === "event" && (
                  <EventSection
                    community={community}
                    onTabChange={setActiveTab}
                  />
                )}

                 {activeTab === "tentang" && (
                   <VolunteerSection
                     communityId={community.id}
                     volunteers={volunteers}
                     loading={volunteersLoading}
                   />
                 )}

                 {activeTab === "volunteer" && (
                  <VolunteerSection
                    communityId={community.id}
                    volunteers={volunteers}
                    loading={volunteersLoading}
                  />
                )}

                {activeTab === "aktivitas" && (
                  <div className="space-y-6">
                    <CommunityMediaSection communityId={community.id} />
                    <ForumSection
                      communityId={community.id}
                      isMember={isMember}
                    />
                  </div>
                )}

                {activeTab === "anggota" && (
                  <MembersSection
                    community={community}
                    officers={officers}
                    isMember={isMember}
                  />
                )}

                {activeTab === "media" && (
                  <div className="space-y-6">
                    <CommunityMediaSection communityId={community.id} />
                    <GallerySection
                      communityId={community.id}
                      isMember={isMember}
                    />
                    <ForumSection
                      communityId={community.id}
                      isMember={isMember}
                    />
                  </div>
                )}
              </div>

              {/* ===== SIDEBAR ===== */}
              <div className="space-y-6">
                <CommunityInfoCard community={community} />
                {officers.length > 0 && (
                  <OfficersCard
                    officers={officers}
                    communitySlug={community.slug}
                  />
                )}
                {community.membersPreview.length > 0 && (
                  <ActiveMembersCard
                    members={community.membersPreview}
                    totalCount={community.memberCount}
                    communitySlug={community.slug}
                  />
                )}
                {(community.website || community.instagram || community.contactEmail) && (
                  <ContactCard community={community} />
                )}
              </div>
            </div>

            {/* ========== BOTTOM CTA ========== */}
            <CommunityBottomCTA
              isMember={isMember}
              isAuthenticated={isAuthenticated}
              communitySlug={community.slug}
            />
          </div>
        </div>
      </main>

      <Footer />

      {/* ========== JOIN MODAL ========== */}
      {joinModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setJoinModalOpen(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
            <button
              onClick={() => setJoinModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h3 className="text-lg font-semibold text-komuna-navy mb-1">
              Minta Bergabung
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Kirim permintaan bergabung ke{" "}
              <strong>{community.name}</strong>.
            </p>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Pesan (opsional)
            </label>
            <textarea
              value={joinMessage}
              onChange={(e) => setJoinMessage(e.target.value)}
              rows={4}
              placeholder="Ceritakan mengapa kamu ingin bergabung..."
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-komuna-blue outline-none resize-none"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setJoinModalOpen(false)}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-komuna-soft transition-colors text-sm"
              >
                Batal
              </button>
              <button
                onClick={handleJoin}
                disabled={joinLoading}
                className="flex-1 px-4 py-2.5 bg-komuna-blue text-white rounded-lg font-medium hover:bg-komuna-navy transition-colors text-sm disabled:opacity-50"
              >
                {joinLoading ? "Mengirim..." : "Kirim Permintaan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   STAT CARD
   ============================================================ */
function StatCard({
  value,
  label,
  icon,
  isText,
}: {
  value: number | string;
  label: string;
  icon: React.ReactNode;
  isText?: boolean;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
      <div className="inline-flex items-center justify-center h-9 w-9 rounded-lg bg-komuna-blue/10 text-komuna-blue mb-2">
        {icon}
      </div>
      <p
        className={`font-bold text-komuna-navy ${
          isText ? "text-sm truncate" : "text-xl"
        }`}
      >
        {isText ? value : typeof value === "number" ? value.toLocaleString("id-ID") : value}
      </p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
}

/* ============================================================
   COMMUNITY ACTIONS (CTA)
   ============================================================ */
function CommunityActions({
  community,
  isAuthenticated,
  isOwner,
  isAdmin,
  isMember,
  isPending,
  actionLoading,
  onJoin,
  onJoinDirect,
  onLeave,
}: {
  community: Community;
  isAuthenticated: boolean;
  isOwner: boolean;
  isAdmin: boolean;
  isMember: boolean;
  isPending: boolean;
  actionLoading: boolean;
  onJoin: () => void;
  onJoinDirect: () => void;
  onLeave: () => void;
}) {
  if (!isAuthenticated) {
    return (
      <Link
        href={`/login?redirect=${encodeURIComponent(`/communities/${community.slug}`)}`}
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-komuna-blue text-white rounded-lg font-medium hover:bg-komuna-navy transition-colors text-sm"
      >
        Bergabung
      </Link>
    );
  }

  if (isAdmin) {
    return (
      <div className="flex flex-wrap gap-2">
          <Link
            href={`/dashboard/communities/${community.slug}/overview`}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-komuna-blue text-white rounded-lg font-medium hover:bg-komuna-navy transition-colors text-sm"
        >
          Kelola
          {community.pendingJoinRequests > 0 && (
            <span className="px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full font-bold">
              {community.pendingJoinRequests}
            </span>
          )}
        </Link>
        {!isOwner && (
          <button
            onClick={onLeave}
            disabled={actionLoading}
            className="px-4 py-2.5 border border-red-300 text-red-600 rounded-lg font-medium hover:bg-red-50 transition-colors text-sm disabled:opacity-50"
          >
            Keluar
          </button>
        )}
      </div>
    );
  }

  if (isMember) {
    return (
      <div className="flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-50 text-emerald-700 rounded-lg font-medium text-sm border border-emerald-200">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Bergabung
        </span>
        <button
          onClick={onLeave}
          disabled={actionLoading}
          className="px-4 py-2.5 border border-red-300 text-red-600 rounded-lg font-medium hover:bg-red-50 transition-colors text-sm disabled:opacity-50"
        >
          Keluar
        </button>
      </div>
    );
  }

  if (isPending) {
    return (
      <span className="px-5 py-2.5 bg-amber-50 text-amber-700 rounded-lg font-medium text-sm border border-amber-200">
        Menunggu Persetujuan
      </span>
    );
  }

  if (community.membershipType === "RESTRICTED") {
    return (
      <button
        onClick={onJoin}
        className="px-5 py-2.5 bg-komuna-blue text-white rounded-lg font-medium hover:bg-komuna-navy transition-colors text-sm"
      >
        Minta Bergabung
      </button>
    );
  }

  return (
    <button
      onClick={onJoinDirect}
      disabled={actionLoading}
      className="px-5 py-2.5 bg-komuna-blue text-white rounded-lg font-medium hover:bg-komuna-navy transition-colors text-sm disabled:opacity-50"
    >
      Bergabung
    </button>
  );
}

/* ============================================================
   ABOUT SECTION
   ============================================================ */
function AboutSection({ community }: { community: Community }) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-komuna-navy mb-3">
          Tentang Komunitas
        </h2>
        {community.description ? (
          <p className="text-gray-600 leading-relaxed whitespace-pre-line">
            {community.description}
          </p>
        ) : (
          <p className="text-gray-400 italic">
            Komunitas ini belum menambahkan deskripsi.
          </p>
        )}
      </div>

      {community.categories.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-komuna-navy mb-3">
            Kategori
          </h2>
          <div className="flex flex-wrap gap-2">
            {community.categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/communities?categoryId=${cat.id}`}
                className="px-3 py-1.5 bg-komuna-blue/10 text-komuna-blue rounded-full text-sm font-medium hover:bg-komuna-blue/20 transition-colors"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {community.tags.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-komuna-navy mb-3">Tag</h2>
          <div className="flex flex-wrap gap-2">
            {community.tags.map((t, i) => {
              const colors = [
                "bg-blue-100 text-blue-700",
                "bg-emerald-100 text-emerald-700",
                "bg-purple-100 text-purple-700",
                "bg-amber-100 text-amber-700",
                "bg-rose-100 text-rose-700",
                "bg-cyan-100 text-cyan-700",
              ];
              return (
                <span
                  key={t.id}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${colors[i % colors.length]}`}
                >
                  #{t.tag}
                </span>
              );
            })}
          </div>
        </div>
      )}

      <CommunityMediaSection communityId={community.id} />
    </div>
  );
}

/* ============================================================
   EVENT SECTION
   ============================================================ */
function EventSection({
  community,
  onTabChange,
}: {
  community: Community;
  onTabChange: (tab: CommunityTab) => void;
}) {
  const [eventTab, setEventTab] = useState<"now" | "upcoming" | "past">(
    "upcoming"
  );

  const events =
    eventTab === "now"
      ? community.currentEvents
      : eventTab === "upcoming"
      ? community.futureEvents
      : community.pastEvents;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-komuna-navy">Event</h2>
        <Link
          href={`/events?communityId=${community.id}`}
          className="text-sm text-komuna-blue hover:underline font-medium"
        >
          Lihat Semua
        </Link>
      </div>

      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 mb-4" role="tablist">
        {(["now", "upcoming", "past"] as const).map((tab) => {
          const labels = { now: "Sekarang", upcoming: "Mendatang", past: "Riwayat" };
          const counts = {
            now: community.currentEvents.length,
            upcoming: community.futureEvents.length,
            past: community.pastEvents.length,
          };
          const isActive = eventTab === tab;
          return (
            <button
              key={tab}
              role="tab"
              aria-selected={isActive}
              onClick={() => setEventTab(tab)}
              className={`flex-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? "bg-white text-komuna-blue shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {labels[tab]}
              {counts[tab] > 0 && (
                <span className="ml-1 px-1.5 py-0.5 bg-komuna-blue/10 text-komuna-blue rounded text-xs">
                  {counts[tab]}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {events.length === 0 ? (
        <div className="text-center py-10 text-gray-400">
          <svg className="h-12 w-12 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-sm">
            {eventTab === "now"
              ? "Tidak ada event yang sedang berlangsung"
              : eventTab === "upcoming"
              ? "Belum ada event mendatang"
              : "Belum ada riwayat event"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((event) => (
            <Link
              key={event.id}
              href={`/events/${event.slug}`}
              className="flex items-center gap-4 p-3 rounded-lg hover:bg-komuna-soft transition-colors group"
            >
              {event.coverImage ? (
                <img
                  src={event.coverImage}
                  alt={event.title}
                  className="h-14 w-14 rounded-lg object-cover shrink-0"
                />
              ) : (
                <div className="h-14 w-14 rounded-lg bg-komuna-teal/10 flex items-center justify-center shrink-0">
                  <svg className="h-6 w-6 text-komuna-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-komuna-navy group-hover:text-komuna-blue transition-colors truncate">
                    {event.title}
                  </p>
                  {event.status === "APPROVED" && eventTab === "now" && (
                    <Badge variant="success">Berlangsung</Badge>
                  )}
                </div>
                <p className="text-sm text-gray-500">
                  {new Date(event.eventDate).toLocaleDateString("id-ID", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {event.locationType === "ONLINE"
                    ? "Online"
                    : event.location || "Lokasi TBD"}
                </p>
              </div>
              <svg className="h-5 w-5 text-gray-300 group-hover:text-komuna-blue transition-colors shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

/* ============================================================
   VOLUNTEER SECTION
   ============================================================ */
function VolunteerSection({
  communityId,
  volunteers,
  loading,
}: {
  communityId: string;
  volunteers: VolunteerProgram[];
  loading: boolean;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-komuna-navy">
          Kesempatan Volunteer
        </h2>
        <Link
          href={`/volunteer?communityId=${communityId}`}
          className="text-sm text-komuna-blue hover:underline font-medium"
        >
          Lihat Semua
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-gray-100">
              <div className="h-10 w-10 rounded-lg bg-gray-200 animate-pulse shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-2/3 bg-gray-200 rounded animate-pulse" />
                <div className="h-3 w-full bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : volunteers.length === 0 ? (
        <div className="text-center py-10 text-gray-400">
          <svg className="h-12 w-12 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <p className="text-sm">Belum ada kesempatan volunteer.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {volunteers.map((program) => (
            <Link
              key={program.id}
              href={`/volunteer/${program.slug}`}
              className="flex items-center gap-4 p-3 rounded-lg hover:bg-komuna-soft transition-colors group"
            >
              <div className="h-12 w-12 rounded-lg bg-komuna-coral/10 flex items-center justify-center shrink-0">
                <svg className="h-5 w-5 text-komuna-coral" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-komuna-navy group-hover:text-komuna-blue transition-colors truncate">
                    {program.title}
                  </p>
                  <span
                    className={`px-1.5 py-0.5 rounded text-xs font-medium border ${
                      VOLUNTEER_STATUS_COLORS[program.status] ||
                      "bg-gray-100 text-gray-600 border-gray-200"
                    }`}
                  >
                    {VOLUNTEER_STATUS_LABELS[program.status] || program.status}
                  </span>
                </div>
                <p className="text-sm text-gray-500">
                  {new Date(program.startDate).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                  {program.endDate
                    ? ` – ${new Date(program.endDate).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}`
                    : ""}
                  {program.applicationCount > 0 && (
                    <span className="text-gray-400">
                      {" "}
                      · {program.applicationCount} pendaftar
                    </span>
                  )}
                </p>
              </div>
              <svg className="h-5 w-5 text-gray-300 group-hover:text-komuna-blue transition-colors shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

/* ============================================================
   MEMBERS SECTION
   ============================================================ */
function MembersSection({
  community,
  officers,
  isMember,
}: {
  community: Community;
  officers: CommunityMember[];
  isMember: boolean;
}) {
  return (
    <div className="space-y-6">
      {officers.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-komuna-navy">
              Pengelola Komunitas
            </h2>
            <Link
              href={`/communities/${community.slug}/members`}
              className="text-sm text-komuna-blue hover:underline font-medium"
            >
              Lihat Semua
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {officers.map((member) => (
              <Link
                key={member.id}
                href={`/communities/${community.slug}/members`}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-komuna-soft transition-colors"
              >
                <Avatar src={member.avatar} name={member.name} size="md" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-komuna-navy truncate">
                    {member.name}
                  </p>
                  <span
                    className={`inline-block px-1.5 py-0.5 rounded text-xs font-medium ${
                      member.role === "OWNER"
                        ? "bg-amber-50 text-amber-700"
                        : "bg-komuna-blue/10 text-komuna-blue"
                    }`}
                  >
                    {ROLE_LABELS[member.role] || member.role}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {community.membersPreview.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-komuna-navy">
                Anggota Komunitas
              </h2>
              <Link
                href={`/communities/${community.slug}/members`}
                className="text-sm text-komuna-blue hover:underline font-medium"
              >
                Lihat Semua
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {community.membersPreview.slice(0, 10).map((member) => (
                <Link
                  key={member.id}
                  href={`/communities/${community.slug}/members`}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-komuna-soft transition-colors"
                >
                  <Avatar src={member.avatar} name={member.name} size="md" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-komuna-navy truncate">
                      {member.name}
                    </p>
                    {member.role !== "MEMBER" && (
                      <p className="text-xs text-gray-500 capitalize">
                        {ROLE_LABELS[member.role] || member.role.toLowerCase()}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
            {community.memberCount > 10 && (
              <p className="mt-4 text-xs text-gray-400 text-center">
                +{community.memberCount - 10} anggota lainnya
              </p>
            )}
          </div>
        )}
    </div>
  );
}

/* ============================================================
   SIDEBAR — COMMUNITY INFO
   ============================================================ */
function CommunityInfoCard({ community }: { community: Community }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
        Informasi Komunitas
      </h3>
      <div className="space-y-3 text-sm">
        <InfoRow
          label="Tipe"
          value={
            community.membershipType === "OPEN"
              ? "Komunitas Terbuka"
              : "Komunitas Terbatas"
          }
        />
        <InfoRow label="Status" value={community.status.toLowerCase()} />
        {community.createdAt && (
          <InfoRow
            label="Berdiri"
            value={new Date(community.createdAt).toLocaleDateString("id-ID", {
              month: "long",
              year: "numeric",
            })}
          />
        )}
        <InfoRow
          label="Keanggotaan"
          value={`${community.memberCount} anggota`}
        />
        {community.location && (
          <InfoRow label="Lokasi" value={community.location} />
        )}
        {community.website && (
          <div className="flex items-center justify-between gap-3">
            <span className="text-gray-500">Situs</span>
            <a
              href={community.website}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-komuna-blue hover:underline truncate text-right max-w-[55%]"
            >
              {community.website.replace(/^https?:\/\//, "").slice(0, 30)}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-komuna-navy text-right capitalize">
        {value}
      </span>
    </div>
  );
}

/* ============================================================
   SIDEBAR — OFFICERS
   ============================================================ */
function OfficersCard({
  officers,
  communitySlug,
}: {
  officers: CommunityMember[];
  communitySlug: string;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
          Pengurus
        </h3>
        <Link
          href={`/communities/${communitySlug}/members`}
          className="text-xs text-komuna-blue hover:underline"
        >
          Lihat Semua
        </Link>
      </div>
      <div className="space-y-3">
        {officers.slice(0, 5).map((member) => (
          <div key={member.id} className="flex items-center gap-3">
            <Avatar src={member.avatar} name={member.name} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-komuna-navy truncate">
                {member.name}
              </p>
              <span
                className={`inline-block px-1.5 py-0.5 rounded text-xs font-medium ${
                  member.role === "OWNER"
                    ? "bg-amber-50 text-amber-700"
                    : "bg-komuna-blue/10 text-komuna-blue"
                }`}
              >
                {ROLE_LABELS[member.role] || member.role}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================================================
   SIDEBAR — ACTIVE MEMBERS
   ============================================================ */
function ActiveMembersCard({
  members,
  totalCount,
  communitySlug,
}: {
  members: CommunityMember[];
  totalCount: number;
  communitySlug: string;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
          Anggota Aktif
        </h3>
        <Link
          href={`/communities/${communitySlug}/members`}
          className="text-xs text-komuna-blue hover:underline"
        >
          Lihat Semua
        </Link>
      </div>
      <div className="flex items-center">
        <div className="flex -space-x-2">
          {members.slice(0, 6).map((member) => (
            <div key={member.id} className="relative" title={member.name}>
              {member.avatar ? (
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="h-9 w-9 rounded-full border-2 border-white object-cover"
                />
              ) : (
                <div className="h-9 w-9 rounded-full border-2 border-white bg-komuna-blue flex items-center justify-center">
                  <span className="text-white text-xs font-bold">
                    {member.name[0]}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
        {totalCount > 6 && (
          <span className="ml-2 text-sm font-medium text-gray-500">
            +{(totalCount - 6).toLocaleString("id-ID")}
          </span>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   SIDEBAR — CONTACT
   ============================================================ */
function ContactCard({ community }: { community: Community }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
        Kontak & Media Sosial
      </h3>
      <div className="space-y-3">
        {community.website && (
          <a
            href={community.website}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-komuna-blue hover:underline"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            {community.website.replace(/^https?:\/\//, "").slice(0, 40)}
          </a>
        )}
        {community.instagram && (
          <p className="flex items-center gap-2 text-sm text-gray-600">
            <svg className="h-4 w-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
            {community.instagram}
          </p>
        )}
        {community.contactEmail && (
          <a
            href={`mailto:${community.contactEmail}`}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-komuna-blue transition-colors"
          >
            <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            {community.contactEmail}
          </a>
        )}
        {community.contactPhone && (
          <p className="flex items-center gap-2 text-sm text-gray-600">
            <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            {community.contactPhone}
          </p>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   BOTTOM CTA
   ============================================================ */
function CommunityBottomCTA({
  isMember,
  isAuthenticated,
  communitySlug,
}: {
  isMember: boolean;
  isAuthenticated: boolean;
  communitySlug: string;
}) {
  return (
    <div className="mb-12 bg-gradient-to-r from-komuna-blue to-komuna-navy rounded-2xl p-8 md:p-12 text-center text-white">
      {isMember ? (
        <>
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            Terus terlibat dalam aktivitas komunitas.
          </h2>
          <p className="text-white/80 mb-6 max-w-lg mx-auto">
            Jelajahi event, volunteer, dan diskusi terbaru dari komunitasmu.
          </p>
          <Link
            href={`/events?communityId=${communitySlug}`}
            className="inline-flex items-center px-6 py-3 bg-white text-komuna-blue rounded-xl font-semibold hover:bg-gray-100 transition-colors"
          >
            Jelajahi Aktivitas
          </Link>
        </>
      ) : (
        <>
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            Temukan ruang untuk bertumbuh dan berkontribusi bersama.
          </h2>
          <p className="text-white/80 mb-6 max-w-lg mx-auto">
            Bergabung dengan komunitas yang sesuai dengan minat dan values kamu.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/communities"
              className="inline-flex items-center px-6 py-3 bg-white/10 text-white border border-white/30 rounded-xl font-semibold hover:bg-white/20 transition-colors"
            >
              Jelajahi Komunitas
            </Link>
            {!isAuthenticated && (
              <Link
                href={`/login?redirect=${encodeURIComponent(`/communities/${communitySlug}`)}`}
                className="inline-flex items-center px-6 py-3 bg-white text-komuna-blue rounded-xl font-semibold hover:bg-gray-100 transition-colors"
              >
                Bergabung dengan Komunitas
              </Link>
            )}
          </div>
        </>
      )}
    </div>
  );
}

/* ============================================================
   MEDIA SECTION (ANNOUNCEMENTS & NEWS)
   ============================================================ */
function CommunityMediaSection({ communityId }: { communityId: string }) {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchMedia = async () => {
      try {
        const { data } = await api.get(`/communities/${communityId}/media`, {
          params: { limit: 5, published: "true" },
        });
        setMedia(data.data || []);
      } catch {}
      finally {
        setLoading(false);
      }
    };
    fetchMedia();
  }, [communityId]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="h-5 w-48 bg-gray-200 rounded animate-pulse mb-4" />
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex items-start gap-3 p-4 rounded-lg border border-gray-100">
              <div className="h-8 w-8 rounded-lg bg-gray-200 animate-pulse shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-2/3 bg-gray-200 rounded animate-pulse" />
                <div className="h-3 w-full bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (media.length === 0) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-lg font-semibold text-komuna-navy mb-4">
        Pengumuman & Berita
      </h2>
      <div className="space-y-3">
        {media.map((item) => (
          <div
            key={item.id}
            className="p-4 rounded-lg border border-gray-100 hover:bg-komuna-soft transition-colors"
          >
            <div className="flex items-start gap-3">
              <div
                className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
                  item.type === "ANNOUNCEMENT"
                    ? "bg-blue-100"
                    : "bg-emerald-100"
                }`}
              >
                <svg
                  className={`h-4 w-4 ${
                    item.type === "ANNOUNCEMENT"
                      ? "text-blue-600"
                      : "text-emerald-600"
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d={
                      item.type === "ANNOUNCEMENT"
                        ? "M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
                        : "M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                    }
                  />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-komuna-navy text-sm line-clamp-1">
                    {item.title}
                  </h4>
                  <Badge
                    variant={
                      item.type === "ANNOUNCEMENT" ? "info" : "success"
                    }
                  >
                    {item.type === "ANNOUNCEMENT" ? "Pengumuman" : "Berita"}
                  </Badge>
                </div>
                <p
                  className={`text-sm text-gray-600 ${
                    expandedId === item.id ? "" : "line-clamp-2"
                  }`}
                >
                  {item.content}
                </p>
                {item.content.length > 150 && (
                  <button
                    onClick={() =>
                      setExpandedId(expandedId === item.id ? null : item.id)
                    }
                    className="text-xs text-komuna-blue hover:underline mt-1"
                  >
                    {expandedId === item.id ? "Sembunyikan" : "Selengkapnya"}
                  </button>
                )}
                <p className="text-xs text-gray-400 mt-1">
                  {item.createdBy.name} ·{" "}
                  {new Date(
                    item.publishedAt || item.createdAt
                  ).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
