"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { useAuth } from "@/components/auth-provider";
import { Header } from "@/components/header";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Footer } from "@/components/footer";
import { FeatureDisabledBanner } from "@/components/feature-disabled-banner";
import { featureFlags } from "@/lib/feature-flags";

interface OrganizationMember {
  id: string;
  name: string;
  avatar: string | null;
  role: string;
}

interface OrganizationEvent {
  id: string;
  title: string;
  eventDate: string;
  coverImage: string | null;
}

interface OrganizationCategory {
  id: string;
  name: string;
}

interface OrganizationTag {
  id: string;
  tag: string;
}

interface Organization {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo: string | null;
  banner: string | null;
  country: string | null;
  province: string | null;
  city: string | null;
  website: string | null;
  instagram: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  industry: string | null;
  visibility: string;
  status: string;
  owner: { id: string; name: string; avatar: string | null };
  memberCount: number;
  eventCount: number;
  membersPreview: OrganizationMember[];
  upcomingEvents: OrganizationEvent[];
  categories: OrganizationCategory[];
  tags: OrganizationTag[];
  userMembership: { role: string; status: string } | null;
}

const TAG_COLORS = [
  "bg-blue-100 text-blue-700",
  "bg-emerald-100 text-emerald-700",
  "bg-purple-100 text-purple-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
  "bg-cyan-100 text-cyan-700",
  "bg-indigo-100 text-indigo-700",
  "bg-teal-100 text-teal-700",
];

export default function OrganizationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const { user, isAuthenticated, isLoading } = useAuth();

  const hasOrgAccess =
    user?.roles?.some((r: string) => ["SUPER_ADMIN", "PLATFORM_ADMIN"].includes(r)) ||
    (user?.communitiesCount ?? 0) > 0 ||
    (user?.organizationsCount ?? 0) > 0;

  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [relatedOrgs, setRelatedOrgs] = useState<Organization[]>([]);

  useEffect(() => {
    fetchOrganization();
  }, [slug]);

  useEffect(() => {
    if (organization) {
      fetchRelatedOrgs();
    }
  }, [organization?.id]);

  const fetchOrganization = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await api.get(`/organizations/${slug}`);
      setOrganization(data.organization || data.data);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Gagal memuat data organisasi.");
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedOrgs = async () => {
    try {
      const { data } = await api.get(`/organizations?limit=3`);
      const orgs = (data.organizations || data.data || []).filter(
        (o: Organization) => o.id !== organization!.id
      );
      setRelatedOrgs(orgs.slice(0, 3));
    } catch {
    }
  };

  const handleJoin = async () => {
    if (!organization) return;
    setActionLoading(true);
    try {
      await api.post(`/organizations/${organization.id}/join`);
      fetchOrganization();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Gagal mengirim permintaan.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeave = async () => {
    if (!organization) return;
    if (!confirm("Yakin ingin keluar dari organisasi ini?")) return;
    setActionLoading(true);
    try {
      await api.post(`/organizations/${organization.id}/leave`);
      fetchOrganization();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Gagal keluar dari organisasi.");
    } finally {
      setActionLoading(false);
    }
  };

  const isOwner = user && organization && user.id === organization.owner.id;
  const isAdmin = user && organization && (isOwner || organization.userMembership?.role === "ADMIN");
  const isPending = organization?.userMembership?.status === "PENDING";
  const isMember = !!organization?.userMembership && !isPending;

  const renderActions = () => {
    if (!isAuthenticated) {
      return (
        <Link
          href={`/login?redirect=${encodeURIComponent(`/organizations/${slug}`)}`}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-komuna-blue text-white rounded-lg font-medium hover:bg-komuna-navy transition-colors"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
          </svg>
          Masuk untuk Bergabung
        </Link>
      );
    }

    if (isAdmin) {
      return (
        <div className="flex flex-wrap gap-3">
          <Link
            href={`/organizations/${slug}/edit`}
            className="inline-flex items-center gap-2 px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors text-sm"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit
          </Link>
          <Link
            href={`/dashboard/organizations/${organization!.id}`}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-komuna-blue text-white rounded-lg font-medium hover:bg-komuna-navy transition-colors text-sm"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            Dashboard
          </Link>
        </div>
      );
    }

    if (isMember) {
      return (
        <div className="flex flex-wrap gap-3">
          <span className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-50 text-emerald-700 rounded-lg font-medium text-sm border border-emerald-200">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Anggota
            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-xs capitalize">
              {organization!.userMembership!.role}
            </span>
          </span>
          {!isOwner && (
            <button
              onClick={handleLeave}
              disabled={actionLoading}
              className="inline-flex items-center gap-2 px-5 py-2.5 border border-red-300 text-red-600 rounded-lg font-medium hover:bg-red-50 transition-colors text-sm disabled:opacity-50"
            >
              {actionLoading ? (
                <div className="h-4 w-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              )}
              Keluar
            </button>
          )}
        </div>
      );
    }

    if (isPending) {
      return (
        <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-50 text-amber-700 rounded-lg font-medium text-sm border border-amber-200">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Menunggu Persetujuan
        </span>
      );
    }

    return (
      <button
        onClick={handleJoin}
        disabled={actionLoading}
        className="inline-flex items-center gap-2 px-6 py-3 bg-komuna-blue text-white rounded-lg font-medium hover:bg-komuna-navy transition-colors disabled:opacity-50"
      >
        {actionLoading ? (
          <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
        )}
        Bergabung
      </button>
    );
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="h-12 w-12 border-4 border-komuna-blue border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Memuat organisasi...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!hasOrgAccess) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="h-16 w-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="h-8 w-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-komuna-navy mb-2">Akses Terbatas</h2>
            <p className="text-gray-500 mb-6">Halaman ini hanya dapat diakses oleh anggota komunitas atau organisasi.</p>
            <Link href="/dashboard" className="inline-flex items-center gap-2 px-5 py-2.5 bg-komuna-blue text-white rounded-lg font-medium hover:bg-komuna-navy transition-colors">
              Kembali ke Dashboard
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !organization) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-komuna-navy mb-2">Organisasi Tidak Ditemukan</h2>
            <p className="text-gray-500 mb-6">{error || "Organisasi yang kamu cari tidak tersedia."}</p>
            <Link
              href="/organizations"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-komuna-blue text-white rounded-lg font-medium hover:bg-komuna-navy transition-colors"
            >
              Kembali ke Direktori
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const location = [organization.city, organization.province, organization.country].filter(Boolean).join(", ");

  if (!featureFlags.organization) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <FeatureDisabledBanner />
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {organization.banner ? (
        <div className="relative h-64 md:h-80 w-full overflow-hidden">
          <img
            src={organization.banner}
            alt={`${organization.name} banner`}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        </div>
      ) : (
        <div className="relative h-64 md:h-80 w-full bg-gradient-to-br from-komuna-teal via-komuna-blue to-komuna-navy overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <circle cx="20" cy="20" r="15" fill="white" />
              <circle cx="80" cy="60" r="25" fill="white" />
              <circle cx="50" cy="90" r="10" fill="white" />
            </svg>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white/20 text-[200px] font-bold leading-none select-none">
              {organization.name[0]}
            </span>
          </div>
        </div>
      )}

      <main className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto -mt-16 relative z-10">
          <Breadcrumbs
            items={[
              { label: "Organisasi", href: "/organizations" },
              { label: organization.name },
            ]}
          />

          <div className="flex flex-col md:flex-row md:items-end gap-4 mb-6">
            <div className="flex-shrink-0">
              {organization.logo ? (
                <img
                  src={organization.logo}
                  alt={`${organization.name} logo`}
                  className="w-24 h-24 md:w-32 md:h-32 rounded-2xl border-4 border-white shadow-lg object-cover bg-white"
                />
              ) : (
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl border-4 border-white shadow-lg bg-komuna-teal flex items-center justify-center">
                  <span className="text-white text-3xl md:text-4xl font-bold">
                    {organization.name[0]}
                  </span>
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0 pb-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-2xl md:text-3xl font-bold text-komuna-navy truncate">
                  {organization.name}
                </h1>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    organization.visibility === "PUBLIC"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {organization.visibility === "PUBLIC" ? "Publik" : "Privat"}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    organization.status === "ACTIVE"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {organization.status === "ACTIVE" ? "Aktif" : organization.status}
                </span>
              </div>
              {location && (
                <p className="flex items-center gap-1 text-sm text-gray-500">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {location}
                </p>
              )}
            </div>

            <div className="flex-shrink-0">{renderActions()}</div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 pb-12">
          <div className="lg:col-span-2 space-y-6">
            {organization.description && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-komuna-navy mb-3">Tentang Organisasi</h2>
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                  {organization.description}
                </p>
              </div>
            )}

            {organization.industry && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-komuna-navy mb-3">Industri</h2>
                <span className="px-3 py-1.5 bg-komuna-teal/10 text-komuna-teal rounded-full text-sm font-medium">
                  {organization.industry}
                </span>
              </div>
            )}

            {organization.categories.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-komuna-navy mb-3">Kategori</h2>
                <div className="flex flex-wrap gap-2">
                  {organization.categories.map((cat) => (
                    <span
                      key={cat.id}
                      className="px-3 py-1.5 bg-komuna-blue/10 text-komuna-blue rounded-full text-sm font-medium"
                    >
                      {cat.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {organization.tags.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-komuna-navy mb-3">Tag</h2>
                <div className="flex flex-wrap gap-2">
                  {organization.tags.map((t, i) => (
                    <span
                      key={t.id}
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        TAG_COLORS[i % TAG_COLORS.length]
                      }`}
                    >
                      #{t.tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {organization.upcomingEvents.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-komuna-navy mb-4">Event Mendatang</h2>
                <div className="space-y-3">
                  {organization.upcomingEvents.slice(0, 5).map((event) => (
                    <Link
                      key={event.id}
                      href={`/events/${event.id}`}
                      className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                    >
                      {event.coverImage ? (
                        <img
                          src={event.coverImage}
                          alt={event.title}
                          className="h-12 w-12 rounded-lg object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-lg bg-komuna-blue/10 flex items-center justify-center flex-shrink-0">
                          <svg className="h-6 w-6 text-komuna-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-komuna-navy group-hover:text-komuna-blue transition-colors truncate">
                          {event.title}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(event.eventDate).toLocaleDateString("id-ID", {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                      <svg className="h-5 w-5 text-gray-400 group-hover:text-komuna-blue transition-colors flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-komuna-navy">{organization.memberCount}</p>
                  <p className="text-sm text-gray-500">Anggota</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-komuna-navy">{organization.eventCount}</p>
                  <p className="text-sm text-gray-500">Event</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-komuna-navy">{organization.categories.length}</p>
                  <p className="text-sm text-gray-500">Kategori</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-3">Pemilik</h3>
              <div className="flex items-center gap-3">
                {organization.owner.avatar ? (
                  <img
                    src={organization.owner.avatar}
                    alt={organization.owner.name}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-komuna-teal flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {organization.owner.name[0]}
                    </span>
                  </div>
                )}
                <div className="min-w-0">
                  <p className="font-medium text-komuna-navy truncate">{organization.owner.name}</p>
                  <p className="text-xs text-gray-500">Pemilik Organisasi</p>
                </div>
              </div>
            </div>

            {organization.membersPreview.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-500">Anggota</h3>
                  <span className="text-xs text-gray-400">{organization.memberCount} total</span>
                </div>
                <div className="space-y-3">
                  {organization.membersPreview.slice(0, 20).map((member) => (
                    <div key={member.id} className="flex items-center gap-3">
                      {member.avatar ? (
                        <img
                          src={member.avatar}
                          alt={member.name}
                          className="h-8 w-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-komuna-blue/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-komuna-blue font-bold text-xs">
                            {member.name[0]}
                          </span>
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-komuna-navy truncate">{member.name}</p>
                        {member.role !== "MEMBER" && (
                          <p className="text-xs text-gray-500 capitalize">{member.role.toLowerCase()}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                {organization.memberCount > 20 && (
                  <p className="mt-3 text-xs text-gray-400 text-center">
                    +{organization.memberCount - 20} anggota lainnya
                  </p>
                )}
              </div>
            )}

            {(organization.website || organization.instagram || organization.contactEmail || organization.contactPhone) && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-sm font-medium text-gray-500 mb-3">Kontak</h3>
                <div className="space-y-3">
                  {organization.website && (
                    <a
                      href={organization.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-komuna-blue hover:underline"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      {organization.website.replace(/^https?:\/\//, "").slice(0, 40)}
                    </a>
                  )}
                  {organization.instagram && (
                    <p className="text-sm text-gray-600 flex items-center gap-2">
                      <svg className="h-4 w-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                      </svg>
                      {organization.instagram}
                    </p>
                  )}
                  {organization.contactEmail && (
                    <a
                      href={`mailto:${organization.contactEmail}`}
                      className="text-sm text-gray-600 flex items-center gap-2 hover:text-komuna-blue transition-colors"
                    >
                      <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      {organization.contactEmail}
                    </a>
                  )}
                  {organization.contactPhone && (
                    <p className="text-sm text-gray-600 flex items-center gap-2">
                      <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      {organization.contactPhone}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {relatedOrgs.length > 0 && (
          <div className="max-w-4xl mx-auto pb-12">
            <h2 className="text-xl font-bold text-komuna-navy mb-6">Organisasi Lainnya</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedOrgs.map((org) => (
                <Link
                  key={org.id}
                  href={`/organizations/${org.slug}`}
                  className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow group"
                >
                  <div className="h-32 bg-gradient-to-br from-komuna-teal via-komuna-blue to-komuna-navy relative overflow-hidden">
                    {org.banner ? (
                      <img src={org.banner} alt={org.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-white/20 text-6xl font-bold select-none">{org.name[0]}</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-3 mb-2">
                      {org.logo ? (
                        <img src={org.logo} alt={org.name} className="h-10 w-10 rounded-lg object-cover bg-white -mt-8 border-2 border-white shadow-sm" />
                      ) : (
                        <div className="h-10 w-10 rounded-lg bg-komuna-teal flex items-center justify-center -mt-8 border-2 border-white shadow-sm">
                          <span className="text-white font-bold text-sm">{org.name[0]}</span>
                        </div>
                      )}
                      <div className="min-w-0">
                        <h3 className="font-semibold text-komuna-navy truncate group-hover:text-komuna-blue transition-colors text-sm">
                          {org.name}
                        </h3>
                        <p className="text-xs text-gray-500">{org.memberCount} anggota</p>
                      </div>
                    </div>
                    {org.description && (
                      <p className="text-xs text-gray-500 line-clamp-2 mt-1">{org.description}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
