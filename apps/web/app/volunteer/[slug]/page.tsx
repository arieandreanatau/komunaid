"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Modal } from "@/components/ui/modal";
import { Textarea } from "@/components/ui/textarea";
import api from "@/lib/api";

interface VolunteerProgramDetail {
  id: string;
  title: string;
  slug: string;
  description: string;
  status: string;
  location: string | null;
  registrationDeadline: string | null;
  activityStartDate: string;
  activityEndDate: string;
  capacity: number;
  applicationCount: number;
  acceptedCount: number;
  slotsLeft: number;
  organizer: { id: string; name: string; slug?: string; avatar?: string | null } | null;
  event: {
    id: string;
    title: string;
    slug: string;
    eventDate: string;
    endDate: string | null;
    location: string | null;
    community: { id: string; name: string; slug: string } | null;
    organization: { id: string; name: string; slug: string } | null;
  };
  userApplication: {
    id: string;
    status: string;
    motivation: string | null;
    reviewNote: string | null;
    createdAt: string;
  } | null;
}

interface VolunteerListItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  status: string;
  location: string | null;
  startDate: string;
  organizer?: { id: string; name: string } | null;
  applicationCount: number;
  capacity: number;
}

const STATUS_STYLES: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-700",
  SUBMITTED: "bg-yellow-100 text-yellow-700",
  UNDER_REVIEW: "bg-yellow-100 text-yellow-700",
  REVISION_REQUIRED: "bg-yellow-100 text-yellow-700",
  APPROVED: "bg-green-100 text-green-700",
  SCHEDULED: "bg-blue-100 text-blue-700",
  REGISTRATION_OPEN: "bg-green-100 text-green-700",
  REGISTRATION_CLOSED: "bg-red-100 text-red-700",
  ONGOING: "bg-purple-100 text-purple-700",
  COMPLETED: "bg-gray-200 text-gray-700",
  CANCELLED: "bg-red-100 text-red-700",
  ARCHIVED: "bg-gray-200 text-gray-700",
};

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Draft",
  SUBMITTED: "Dikirim",
  UNDER_REVIEW: "Dalam Review",
  REVISION_REQUIRED: "Perlu Revisi",
  APPROVED: "Disetujui",
  SCHEDULED: "Terjadwal",
  REGISTRATION_OPEN: "Pendaftaran Dibuka",
  REGISTRATION_CLOSED: "Pendaftaran Ditutup",
  ONGOING: "Berlangsung",
  COMPLETED: "Selesai",
  CANCELLED: "Dibatalkan",
  ARCHIVED: "Diarsipkan",
};

const APPLICATION_STYLES: Record<string, string> = {
  PENDING: "bg-blue-100 text-blue-700",
  ACCEPTED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
  CANCELLED_BY_USER: "bg-gray-100 text-gray-600",
  CANCELLED_BY_ORGANIZER: "bg-gray-100 text-gray-600",
};

const APPLICATION_LABELS: Record<string, string> = {
  PENDING: "Menunggu Review",
  ACCEPTED: "Diterima",
  REJECTED: "Ditolak",
  CANCELLED_BY_USER: "Dibatalkan",
  CANCELLED_BY_ORGANIZER: "Dibatalkan Organizer",
};

function badgeClass(map: Record<string, string>, key: string) {
  return map[key] || "bg-gray-100 text-gray-700";
}

export default function VolunteerDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [opportunity, setOpportunity] = useState<VolunteerProgramDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applying, setApplying] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [formError, setFormError] = useState("");
  const [related, setRelated] = useState<VolunteerListItem[]>([]);
  const [form, setForm] = useState({ motivation: "", agreement: false });

  useEffect(() => {
    let cancelled = false;
    const fetchOpportunity = async () => {
      try {
        const { data } = await api.get(`/volunteer-programs/detail/${slug}`);
        if (!cancelled) {
          setOpportunity(data.data);
          setError(false);
        }
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void fetchOpportunity();
    return () => { cancelled = true; };
  }, [slug]);

  useEffect(() => {
    if (!opportunity) return;
    let cancelled = false;
    const fetchRelated = async () => {
      try {
        const { data } = await api.get("/volunteer-programs?limit=3&sort=asc&orderBy=startDate");
        if (!cancelled) {
          setRelated((data.data as VolunteerListItem[]).filter((o) => o.id !== opportunity.id));
        }
      } catch {
        // related list is non-critical
      }
    };
    void fetchRelated();
    return () => { cancelled = true; };
  }, [opportunity]);

  const handleApply = async () => {
    if (!form.motivation || form.motivation.length < 10) {
      setFormError("Motivasi minimal 10 karakter");
      return;
    }
    if (!form.agreement) {
      setFormError("Anda harus menyetujui ketentuan");
      return;
    }

    try {
      setApplying(true);
      setFormError("");
      await api.post(`/volunteer-programs/${opportunity!.id}/apply`, { motivation: form.motivation });
      setShowApplyModal(false);
      setForm({ motivation: "", agreement: false });
      const { data } = await api.get(`/volunteer-programs/detail/${slug}`);
      setOpportunity(data.data);
    } catch (error: any) {
      setFormError(error.response?.data?.message || "Gagal mendaftar");
    } finally {
      setApplying(false);
    }
  };

  const handleCancelApplication = async () => {
    if (!window.confirm("Yakin ingin membatalkan pendaftaran?")) return;
    try {
      setCancelling(true);
      await api.delete(`/volunteer-programs/${opportunity!.id}/apply`);
      const { data } = await api.get(`/volunteer-programs/detail/${slug}`);
      setOpportunity(data.data);
    } catch (error: any) {
      window.alert(error.response?.data?.message || "Gagal membatalkan");
    } finally {
      setCancelling(false);
    }
  };

  const handleShare = async () => {
    try {
      const url = window.location.href;
      if (navigator.share) {
        await navigator.share({ title: opportunity?.title || "Volunteer KomunaID", url });
      } else {
        await navigator.clipboard.writeText(url);
        window.alert("Tautan volunteer disalin");
      }
    } catch {
      // user cancelled share
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatShortDate = (dateStr?: string | null) => {
    if (!dateStr) return "Tanggal menyusul";
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-komuna-cream">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="h-12 w-12 border-4 border-komuna-blue border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-komuna-dark/60">Memuat volunteer...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !opportunity) {
    return (
      <div className="min-h-screen flex flex-col bg-komuna-cream">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-komuna-navy mb-2">Volunteer Tidak Ditemukan</h2>
            <p className="text-gray-500 mb-6">Volunteer yang kamu cari tidak tersedia.</p>
            <Link href="/volunteer" className="inline-flex items-center gap-2 px-5 py-2.5 bg-komuna-blue text-white rounded-lg font-medium hover:bg-komuna-navy transition-colors">
              Kembali ke Daftar Volunteer
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const userApp = opportunity.userApplication;
  const deadlinePassed = opportunity.registrationDeadline ? new Date(opportunity.registrationDeadline).getTime() < Date.now() : false;
  const quotaFull = opportunity.slotsLeft <= 0;
  const hasActiveApp = Boolean(userApp && ["PENDING", "ACCEPTED"].includes(userApp.status));
  const canApply = !hasActiveApp && opportunity.status === "REGISTRATION_OPEN" && !deadlinePassed && !quotaFull;

  return (
    <div className="min-h-screen flex flex-col bg-komuna-cream">
      <Header />

      <main className="container mx-auto px-4 py-8 flex-1">
        <div className="max-w-4xl mx-auto">
          <Breadcrumbs
            items={[
              { label: "Volunteer", href: "/volunteer" },
              { label: opportunity.title },
            ]}
          />

          <div className="mb-4">
            <Link href="/volunteer" className="text-sm text-komuna-blue hover:underline flex items-center gap-1">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Kembali ke Daftar Volunteer
            </Link>
          </div>

          <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
            <div className="h-44 relative bg-gradient-to-br from-komuna-teal to-komuna-blue flex items-center justify-center">
              <span className="text-white text-6xl font-bold opacity-30">{opportunity.title.slice(0, 1)}</span>
              <span className={`absolute top-3 left-3 px-2.5 py-1 text-xs font-bold rounded-full bg-white/90 ${badgeClass(STATUS_STYLES, opportunity.status)}`}>
                {STATUS_LABELS[opportunity.status] || opportunity.status}
              </span>
            </div>

            <div className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h1 className="text-2xl font-bold text-komuna-navy">{opportunity.title}</h1>
                  <p className="mt-1 text-sm text-gray-500">
                    {opportunity.organizer?.name ? `oleh ${opportunity.organizer.name}` : "Volunteer Program"}
                  </p>
                </div>
                {userApp && (
                  <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${badgeClass(APPLICATION_STYLES, userApp.status)}`}>
                    {APPLICATION_LABELS[userApp.status] || userApp.status}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
                <span>{opportunity.applicationCount} pendaftar</span>
                {opportunity.location && (
                  <span className="flex items-center gap-1">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {opportunity.location}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-3 gap-3 mb-5">
                <div className="bg-komuna-cream rounded-lg p-3 text-center">
                  <p className="text-xl font-bold text-komuna-navy">{opportunity.capacity}</p>
                  <p className="text-xs text-gray-500">Kuota</p>
                </div>
                <div className="bg-komuna-cream rounded-lg p-3 text-center">
                  <p className="text-xl font-bold text-komuna-navy">{opportunity.slotsLeft}</p>
                  <p className="text-xs text-gray-500">Slot Tersisa</p>
                </div>
                <div className="bg-komuna-cream rounded-lg p-3 text-center">
                  <p className="text-xl font-bold text-komuna-navy">{opportunity.applicationCount}</p>
                  <p className="text-xs text-gray-500">Pendaftar</p>
                </div>
              </div>

              {opportunity.capacity > 0 && (
                <div className="mb-6">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                    <span>Kuota terisi</span>
                    <span>{opportunity.acceptedCount}/{opportunity.capacity}</span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${quotaFull ? "bg-red-500" : "bg-komuna-teal"}`}
                      style={{ width: `${Math.min(100, Math.round((opportunity.acceptedCount / opportunity.capacity) * 100))}%` }}
                    />
                  </div>
                </div>
              )}

              {opportunity.description && (
                <p className="text-gray-600 mb-6 whitespace-pre-wrap">{opportunity.description}</p>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="bg-komuna-cream rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">Jadwal Aktivitas</p>
                  <p className="text-sm font-medium text-gray-900">
                    {formatDate(opportunity.activityStartDate)}
                    {opportunity.activityEndDate && ` - ${formatDate(opportunity.activityEndDate)}`}
                  </p>
                </div>
                {opportunity.registrationDeadline && (
                  <div className="bg-komuna-cream rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">Batas Pendaftaran</p>
                    <p className="text-sm font-medium text-gray-900">
                      {formatDate(opportunity.registrationDeadline)}
                      {deadlinePassed && <span className="ml-2 text-xs font-bold text-red-600">(lewat)</span>}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                {canApply && (
                  <button
                    onClick={() => setShowApplyModal(true)}
                    className="flex-1 py-3 bg-komuna-blue text-white rounded-lg hover:bg-komuna-navy transition-colors font-medium"
                  >
                    Daftar Volunteer
                  </button>
                )}
                {!canApply && !userApp && (
                  <div className="flex-1 rounded-lg bg-slate-50 px-4 py-3 text-center text-sm font-medium text-gray-500 border border-gray-100">
                    {quotaFull
                      ? "Kuota program sudah penuh"
                      : deadlinePassed
                        ? "Batas pendaftaran sudah lewat"
                        : opportunity.status === "REGISTRATION_CLOSED"
                          ? "Pendaftaran ditutup"
                          : "Pendaftaran belum dibuka"}
                  </div>
                )}
                {userApp && ["PENDING", "ACCEPTED"].includes(userApp.status) && (
                  <button
                    onClick={handleCancelApplication}
                    disabled={cancelling}
                    className="flex-1 py-3 text-sm text-red-600 border border-red-300 rounded-lg hover:bg-red-50 disabled:opacity-50 font-medium"
                  >
                    {cancelling ? "Membatalkan..." : "Batalkan Pendaftaran"}
                  </button>
                )}
                <button
                  onClick={handleShare}
                  className="px-5 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-komuna-cream transition-colors font-medium"
                >
                  <span className="flex items-center justify-center gap-2">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 0a3 3 0 11-5.367 2.684 3 3 0 015.367-2.684z" />
                    </svg>
                    Bagikan
                  </span>
                </button>
              </div>
            </div>
          </div>

          {userApp && (
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <h2 className="text-lg font-semibold text-komuna-navy mb-4">Status Pendaftaran</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Status</span>
                  <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${badgeClass(APPLICATION_STYLES, userApp.status)}`}>
                    {APPLICATION_LABELS[userApp.status] || userApp.status}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Tanggal Daftar</span>
                  <span className="text-sm font-medium text-gray-900">{formatDate(userApp.createdAt)}</span>
                </div>
                {userApp.reviewNote && (
                  <div className="rounded-lg bg-slate-50 p-3">
                    <p className="text-xs text-gray-500 mb-1">Catatan Review</p>
                    <p className="text-sm text-gray-800">{userApp.reviewNote}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {related.length > 0 && (
            <div className="mt-8">
              <h2 className="text-lg font-semibold text-komuna-navy mb-4">Volunteer Lainnya</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {related.map((opp) => (
                  <Link
                    key={opp.id}
                    href={`/volunteer/${opp.slug}`}
                    className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${badgeClass(STATUS_STYLES, opp.status)}`}>
                        {STATUS_LABELS[opp.status] || opp.status}
                      </span>
                      <span className="text-xs text-gray-500">{formatShortDate(opp.startDate)}</span>
                    </div>
                    <h3 className="font-semibold text-komuna-navy mb-2 line-clamp-2">{opp.title}</h3>
                    {opp.description && (
                      <p className="text-sm text-gray-500 mb-3 line-clamp-2">{opp.description}</p>
                    )}
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{opp.location || "Lokasi menyusul"}</span>
                      <span>{opp.applicationCount} pendaftar</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />

      <Modal open={showApplyModal} onClose={() => setShowApplyModal(false)} title="Daftar Volunteer" size="lg">
        {formError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {formError}
          </div>
        )}

        <div className="space-y-4">
          <Textarea
            label="Motivasi *"
            value={form.motivation}
            onChange={(e) => setForm({ ...form, motivation: e.target.value })}
            rows={4}
            placeholder="Ceritakan motivasi Anda mengikuti volunteer ini..."
            className="resize-none"
          />

          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.agreement}
              onChange={(e) => setForm({ ...form, agreement: e.target.checked })}
              className="mt-1 h-4 w-4 text-komuna-blue border-gray-300 rounded focus:ring-komuna-blue"
            />
            <span className="text-sm text-gray-600">
              Saya menyetujui untuk mengikuti seluruh rangkaian kegiatan volunteer dan mematuhi ketentuan yang berlaku.
            </span>
          </label>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setShowApplyModal(false)}
              className="flex-1 py-2.5 border border-gray-300 rounded-lg hover:bg-komuna-cream transition-colors text-sm font-medium"
            >
              Batal
            </button>
            <button
              onClick={handleApply}
              disabled={applying}
              className="flex-1 py-2.5 bg-komuna-blue text-white rounded-lg hover:bg-komuna-navy transition-colors text-sm font-medium disabled:opacity-50"
            >
              {applying ? "Mendaftar..." : "Daftar Sekarang"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}