"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { useAuth } from "@/components/auth-provider";
import api from "@/lib/api";

interface Position {
  id: string;
  name: string;
  description: string;
  requiredQty: number;
  requirement: string;
  remainingSlot: number;
  applicationCount: number;
}

interface VolunteerOpportunity {
  id: string;
  title: string;
  slug: string;
  description: string;
  status: string;
  registrationDeadline: string;
  briefingDate: string;
  activityStartDate: string;
  activityEndDate: string;
  event: {
    id: string;
    title: string;
    slug: string;
    eventDate: string;
    endDate: string;
    location: string;
    locationType: string;
    status: string;
    community: { id: string; name: string; slug: string } | null;
    organization: { id: string; name: string; slug: string } | null;
  };
  createdBy: { id: string; name: string; avatar: string };
  positions: Position[];
  applicationCount: number;
  userApplication: any;
}

export default function VolunteerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const { isAuthenticated, user } = useAuth();

  const [opportunity, setOpportunity] = useState<VolunteerOpportunity | null>(null);
  const [loading, setLoading] = useState(true);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<string>("");
  const [applying, setApplying] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [formError, setFormError] = useState("");

  const [form, setForm] = useState({
    motivation: "",
    experience: "",
    availability: "",
    agreement: false,
  });

  useEffect(() => {
    fetchOpportunity();
  }, [slug]);

  const fetchOpportunity = async () => {
    try {
      const { data } = await api.get(`/volunteer/detail/${slug}`);
      setOpportunity(data.data);
    } catch {
      console.error("Failed to fetch opportunity");
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!selectedPosition) {
      setFormError("Pilih posisi terlebih dahulu");
      return;
    }
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
      await api.post(`/volunteer/${opportunity!.id}/apply`, {
        positionId: selectedPosition,
        motivation: form.motivation,
        experience: form.experience,
        availability: form.availability,
        agreement: true,
      });
      setShowApplyModal(false);
      setForm({ motivation: "", experience: "", availability: "", agreement: false });
      fetchOpportunity();
    } catch (error: any) {
      setFormError(error.response?.data?.message || "Gagal mendaftar");
    } finally {
      setApplying(false);
    }
  };

  const handleCancelApplication = async () => {
    if (!confirm("Yakin ingin membatalkan pendaftaran?")) return;
    try {
      setCancelling(true);
      await api.delete(`/volunteer/${opportunity!.id}/apply`);
      fetchOpportunity();
    } catch (error: any) {
      alert(error.response?.data?.message || "Gagal membatalkan");
    } finally {
      setCancelling(false);
    }
  };

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

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      DRAFT: "bg-gray-100 text-gray-700",
      PUBLISHED: "bg-blue-100 text-blue-700",
      OPEN: "bg-green-100 text-green-700",
      CLOSED: "bg-red-100 text-red-700",
      ARCHIVED: "bg-yellow-100 text-yellow-700",
    };
    return styles[status] || "bg-gray-100 text-gray-700";
  };

  const getApplicationStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      APPLIED: "bg-blue-100 text-blue-700",
      REVIEWED: "bg-yellow-100 text-yellow-700",
      ACCEPTED: "bg-green-100 text-green-700",
      REJECTED: "bg-red-100 text-red-700",
    };
    return styles[status] || "bg-gray-100 text-gray-700";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="h-12 w-12 border-4 border-komuna-blue border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!opportunity) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-komuna-navy mb-2">Volunteer Tidak Ditemukan</h2>
          <Link href="/volunteer" className="text-komuna-blue hover:underline">Kembali ke Daftar Volunteer</Link>
        </div>
      </div>
    );
  }

  const userApp = opportunity.userApplication;
  const canApply = !userApp && ["PUBLISHED", "OPEN"].includes(opportunity.status) && opportunity.event.status !== "COMPLETED";

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-4">
            <Link href="/volunteer" className="text-sm text-komuna-blue hover:underline flex items-center gap-1">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Kembali ke Daftar Volunteer
            </Link>
          </div>

          <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
            <div className="h-40 bg-gradient-to-br from-komuna-teal to-komuna-aqua flex items-center justify-center">
              <span className="text-white text-5xl font-bold">{opportunity.title[0]}</span>
            </div>

            <div className="p-6">
              <div className="flex items-start justify-between mb-3">
                <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${getStatusBadge(opportunity.status)}`}>
                  {opportunity.status}
                </span>
                {userApp && (
                  <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${getApplicationStatusBadge(userApp.status)}`}>
                    {userApp.status}
                  </span>
                )}
              </div>

              <h1 className="text-2xl font-bold text-komuna-navy mb-2">{opportunity.title}</h1>

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
                <div className="flex items-center gap-1">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>{opportunity.event.title}</span>
                </div>
                {opportunity.event.location && (
                  <div className="flex items-center gap-1">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{opportunity.event.location}</span>
                  </div>
                )}
                <span>{opportunity.applicationCount} pendaftar</span>
              </div>

              {opportunity.event.community && (
                <div className="text-sm text-komuna-blue mb-4">
                  oleh <Link href={`/communities/${opportunity.event.community.slug}`} className="underline">{opportunity.event.community.name}</Link>
                </div>
              )}

              {opportunity.event.organization && (
                <div className="text-sm text-komuna-blue mb-4">
                  oleh <Link href={`/organizations/${opportunity.event.organization.slug}`} className="underline">{opportunity.event.organization.name}</Link>
                </div>
              )}

              {opportunity.description && (
                <p className="text-gray-600 mb-6 whitespace-pre-wrap">{opportunity.description}</p>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {opportunity.activityStartDate && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">Tanggal Aktivitas</p>
                    <p className="text-sm font-medium text-gray-900">
                      {formatDate(opportunity.activityStartDate)}
                      {opportunity.activityEndDate && ` - ${formatDate(opportunity.activityEndDate)}`}
                    </p>
                  </div>
                )}
                {opportunity.briefingDate && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">Briefing Volunteer</p>
                    <p className="text-sm font-medium text-gray-900">{formatDate(opportunity.briefingDate)}</p>
                  </div>
                )}
                {opportunity.registrationDeadline && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">Batas Pendaftaran</p>
                    <p className="text-sm font-medium text-gray-900">{formatDate(opportunity.registrationDeadline)}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-komuna-navy mb-4">Posisi Volunteer</h2>
            <div className="space-y-4">
              {opportunity.positions.map((pos) => (
                <div key={pos.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-gray-900">{pos.name}</h3>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                      pos.remainingSlot > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}>
                      {pos.remainingSlot > 0 ? `${pos.remainingSlot} slot tersisa` : "Penuh"}
                    </span>
                  </div>
                  {pos.description && <p className="text-sm text-gray-600 mb-2">{pos.description}</p>}
                  {pos.requirement && (
                    <p className="text-xs text-gray-500">
                      <span className="font-medium">Persyaratan:</span> {pos.requirement}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    {pos.applicationCount}/{pos.requiredQty} terisi
                  </p>
                </div>
              ))}
            </div>
          </div>

          {userApp && (
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <h2 className="text-lg font-semibold text-komuna-navy mb-4">Status Pendaftaran</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Status</span>
                  <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${getApplicationStatusBadge(userApp.status)}`}>
                    {userApp.status}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Posisi</span>
                  <span className="text-sm font-medium text-gray-900">{userApp.position.name}</span>
                </div>
                {userApp.assignment && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Shift</span>
                      <span className="text-sm font-medium text-gray-900">
                        {userApp.assignment.shiftStart ? formatDate(userApp.assignment.shiftStart) : "-"}
                        {userApp.assignment.shiftEnd ? ` - ${formatDate(userApp.assignment.shiftEnd)}` : ""}
                      </span>
                    </div>
                    {userApp.assignment.attendance && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Absensi</span>
                        <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                          userApp.assignment.attendance.status === "CHECKED_OUT"
                            ? "bg-green-100 text-green-700"
                            : userApp.assignment.attendance.status === "CHECKED_IN"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100 text-gray-700"
                        }`}>
                          {userApp.assignment.attendance.status.replace("_", " ")}
                        </span>
                      </div>
                    )}
                  </>
                )}
                {userApp.status === "APPLIED" && (
                  <button
                    onClick={handleCancelApplication}
                    disabled={cancelling}
                    className="w-full mt-2 py-2 text-sm text-red-600 border border-red-300 rounded-lg hover:bg-red-50 disabled:opacity-50"
                  >
                    {cancelling ? "Membatalkan..." : "Batalkan Pendaftaran"}
                  </button>
                )}
              </div>
            </div>
          )}

          {canApply && (
            <button
              onClick={() => setShowApplyModal(true)}
              className="w-full py-3 bg-komuna-blue text-white rounded-lg hover:bg-komuna-navy transition-colors font-medium"
            >
              Daftar Volunteer
            </button>
          )}
        </div>
      </main>

      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowApplyModal(false)} />
          <div className="relative bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-komuna-navy">Daftar Volunteer</h2>
                <button onClick={() => setShowApplyModal(false)} className="p-1 hover:bg-gray-100 rounded">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {formError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  {formError}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Posisi *</label>
                  <select
                    value={selectedPosition}
                    onChange={(e) => setSelectedPosition(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-komuna-blue focus:border-transparent"
                  >
                    <option value="">-- Pilih Posisi --</option>
                    {opportunity.positions
                      .filter((p) => p.remainingSlot > 0)
                      .map((pos) => (
                        <option key={pos.id} value={pos.id}>
                          {pos.name} ({pos.remainingSlot} slot tersisa)
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Motivasi *</label>
                  <textarea
                    value={form.motivation}
                    onChange={(e) => setForm({ ...form, motivation: e.target.value })}
                    rows={4}
                    placeholder="Ceritakan motivasi Anda mengikuti volunteer ini..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-komuna-blue focus:border-transparent resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pengalaman</label>
                  <textarea
                    value={form.experience}
                    onChange={(e) => setForm({ ...form, experience: e.target.value })}
                    rows={3}
                    placeholder="Ceritakan pengalaman volunteer atau kegiatan sosial Anda sebelumnya..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-komuna-blue focus:border-transparent resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ketersediaan</label>
                  <input
                    type="text"
                    value={form.availability}
                    onChange={(e) => setForm({ ...form, availability: e.target.value })}
                    placeholder="Contoh: Weekends, weekday malam, full time"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-komuna-blue focus:border-transparent"
                  />
                </div>

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
                    className="flex-1 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
