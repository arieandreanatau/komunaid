"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/header";
import { useAuth } from "@/components/auth-provider";
import api from "@/lib/api";

interface Submission {
  id: string;
  name: string;
  slug: string;
  description: string;
  logo: string | null;
  banner: string | null;
  status: "DRAFT" | "PENDING" | "APPROVED" | "REJECTED" | "REVISION_REQUIRED";
  industry: string | null;
  visibility: string;
  adminNote: string | null;
  submittedAt: string | null;
  reviewedAt: string | null;
  categories: { id: string; name: string }[];
  memberCount: number;
  createdAt: string;
  updatedAt: string;
}

interface PaginatedResponse {
  success: boolean;
  data: Submission[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

type StatusFilter = "" | "DRAFT" | "PENDING" | "APPROVED" | "REJECTED" | "REVISION_REQUIRED";

const statusTabs: { value: StatusFilter; label: string }[] = [
  { value: "", label: "Semua" },
  { value: "DRAFT", label: "Draft" },
  { value: "PENDING", label: "Pending" },
  { value: "APPROVED", label: "Disetujui" },
  { value: "REJECTED", label: "Ditolak" },
  { value: "REVISION_REQUIRED", label: "Revisi" },
];

const statusBadge: Record<string, { bg: string; text: string; label: string }> = {
  DRAFT: { bg: "bg-gray-100", text: "text-gray-700", label: "Draft" },
  PENDING: { bg: "bg-yellow-100", text: "text-yellow-700", label: "Menunggu Review" },
  APPROVED: { bg: "bg-green-100", text: "text-green-700", label: "Disetujui" },
  REJECTED: { bg: "bg-red-100", text: "text-red-700", label: "Ditolak" },
  REVISION_REQUIRED: { bg: "bg-orange-100", text: "text-orange-700", label: "Perlu Revisi" },
};

export default function MyOrganizationSubmissionsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<StatusFilter>("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set());
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, authLoading, router]);

  const fetchSubmissions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await api.get("/organizations/my/submissions", {
        params: {
          page,
          limit: 10,
          status: activeTab || undefined,
        },
      });
      const result: PaginatedResponse = data;
      setSubmissions(result.data);
      setTotalPages(result.pagination.totalPages);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Gagal memuat data pengajuan.");
    } finally {
      setLoading(false);
    }
  }, [page, activeTab]);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      fetchSubmissions();
    }
  }, [authLoading, isAuthenticated, fetchSubmissions]);

  const handleSubmit = async (id: string) => {
    if (!confirm("Yakin ingin mengajukan organisasi ini untuk review?")) return;
    try {
      setSubmittingId(id);
      await api.post(`/organizations/${id}/submit`);
      fetchSubmissions();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Gagal mengajukan organisasi.");
    } finally {
      setSubmittingId(null);
    }
  };

  const toggleNote = (id: string) => {
    setExpandedNotes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleTabChange = (tab: StatusFilter) => {
    setActiveTab(tab);
    setPage(1);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  if (authLoading || (!isAuthenticated && !authLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-komuna-blue border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-5xl mx-auto px-4 py-6">
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href="/dashboard" className="hover:text-komuna-blue transition-colors">
            Dashboard
          </Link>
          <span>/</span>
          <span className="text-komuna-navy font-medium">My Organization Submissions</span>
        </nav>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-komuna-navy">Pengajuan Organisasi Saya</h1>
          <p className="text-sm text-gray-500 mt-1">Lihat status dan timeline review pengajuan organisasi Anda.</p>
        </div>

        <div className="flex overflow-x-auto gap-1 border-b border-gray-200 mb-6">
          {statusTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => handleTabChange(tab.value)}
              className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.value
                  ? "border-komuna-blue text-komuna-blue"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 border-4 border-komuna-blue border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-komuna-navy mb-2">Gagal Memuat</h2>
            <p className="text-gray-500 text-sm mb-6">{error}</p>
            <button
              onClick={fetchSubmissions}
              className="px-5 py-2.5 bg-komuna-blue text-white rounded-lg font-medium hover:bg-komuna-navy transition-colors text-sm"
            >
              Coba Lagi
            </button>
          </div>
        ) : submissions.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-komuna-navy mb-2">Belum Ada Pengajuan</h2>
            <p className="text-gray-500 text-sm mb-6">Anda belum memiliki pengajuan organisasi.</p>
            <Link
              href="/organizations/create"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-komuna-blue text-white rounded-lg font-medium hover:bg-komuna-navy transition-colors text-sm"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Buat Organisasi Baru
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {submissions.map((submission) => {
              const badge = statusBadge[submission.status] || statusBadge.DRAFT;
              const hasSubmitted = !!submission.submittedAt;
              const hasReviewed = !!submission.reviewedAt;

              return (
                <div key={submission.id} className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-start gap-4">
                    {submission.logo ? (
                      <img
                        src={submission.logo}
                        alt={submission.name}
                        className="h-14 w-14 rounded-xl object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="h-14 w-14 rounded-xl bg-komuna-teal/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-komuna-teal font-bold text-lg">
                          {submission.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="font-semibold text-komuna-navy truncate">{submission.name}</h3>
                          <p className="text-xs text-gray-400 mt-0.5">
                            Dibuat {formatDate(submission.createdAt)}
                          </p>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium flex-shrink-0 ${badge.bg} ${badge.text}`}>
                          {badge.label}
                        </span>
                      </div>

                      {submission.description && (
                        <p className="text-sm text-gray-600 mt-2 line-clamp-2">{submission.description}</p>
                      )}

                      <div className="flex items-center gap-3 mt-3 flex-wrap">
                        <span className="text-xs text-gray-400">
                          {submission.visibility === "PUBLIC" ? "Publik" : "Privat"}
                        </span>
                        {submission.industry && (
                          <span className="text-xs text-komuna-teal bg-komuna-teal/10 px-2 py-0.5 rounded-full">
                            {submission.industry}
                          </span>
                        )}
                        {submission.memberCount > 0 && (
                          <span className="text-xs text-gray-400">{submission.memberCount} anggota</span>
                        )}
                      </div>

                      <div className="mt-4 border-t border-gray-100 pt-4">
                        <p className="text-xs font-medium text-gray-500 mb-3">Timeline Approval</p>
                        <div className="space-y-0">
                          <div className="flex items-start gap-3">
                            <div className="flex flex-col items-center">
                              <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                                <svg className="h-3.5 w-3.5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                              {hasSubmitted && <div className="w-0.5 h-6 bg-green-200" />}
                            </div>
                            <div className="pt-0.5">
                              <p className="text-sm font-medium text-gray-700">Draft</p>
                              <p className="text-xs text-gray-400">{formatDate(submission.createdAt)}</p>
                            </div>
                          </div>

                          {hasSubmitted ? (
                            <div className="flex items-start gap-3">
                              <div className="flex flex-col items-center">
                                <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                                  <svg className="h-3.5 w-3.5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                  </svg>
                                </div>
                                {hasReviewed && <div className="w-0.5 h-6 bg-green-200" />}
                              </div>
                              <div className="pt-0.5">
                                <p className="text-sm font-medium text-gray-700">Submitted</p>
                                <p className="text-xs text-gray-400">{formatDate(submission.submittedAt!)}</p>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-start gap-3">
                              <div className="flex flex-col items-center">
                                <div className="h-6 w-6 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                                  <div className="h-2 w-2 rounded-full bg-gray-300" />
                                </div>
                              </div>
                              <div className="pt-0.5">
                                <p className="text-sm text-gray-400">Submitted</p>
                              </div>
                            </div>
                          )}

                          {hasReviewed ? (
                            <div className="flex items-start gap-3">
                              <div className="flex flex-col items-center">
                                <div className={`h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                                  submission.status === "APPROVED"
                                    ? "bg-green-100"
                                    : submission.status === "REJECTED"
                                    ? "bg-red-100"
                                    : "bg-orange-100"
                                }`}>
                                  <svg className={`h-3.5 w-3.5 ${
                                    submission.status === "APPROVED"
                                      ? "text-green-600"
                                      : submission.status === "REJECTED"
                                      ? "text-red-600"
                                      : "text-orange-600"
                                  }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                  </svg>
                                </div>
                              </div>
                              <div className="pt-0.5">
                                <p className="text-sm font-medium text-gray-700">Reviewed</p>
                                <p className="text-xs text-gray-400">
                                  {formatDate(submission.reviewedAt!)} — {statusBadge[submission.status]?.label}
                                </p>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-start gap-3">
                              <div className="flex flex-col items-center">
                                <div className="h-6 w-6 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                                  <div className="h-2 w-2 rounded-full bg-gray-300" />
                                </div>
                              </div>
                              <div className="pt-0.5">
                                <p className="text-sm text-gray-400">Reviewed</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {(submission.status === "REJECTED" || submission.status === "REVISION_REQUIRED") && submission.adminNote && (
                        <div className={`mt-4 p-3 rounded-lg text-sm flex items-start gap-2 ${
                          submission.status === "REJECTED"
                            ? "bg-red-50 text-red-700 border border-red-200"
                            : "bg-orange-50 text-orange-700 border border-orange-200"
                        }`}>
                          <svg className="h-5 w-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <div>
                            <p className="font-medium mb-0.5">Catatan Admin:</p>
                            <p>{submission.adminNote}</p>
                          </div>
                        </div>
                      )}

                      {submission.status === "REJECTED" && submission.adminNote && (
                        <button
                          onClick={() => toggleNote(submission.id)}
                          className="mt-2 text-sm text-komuna-blue hover:underline font-medium"
                        >
                          {expandedNotes.has(submission.id) ? "Sembunyikan Alasan" : "Lihat Alasan"}
                        </button>
                      )}

                      {(submission.status === "REJECTED" || submission.status === "REVISION_REQUIRED") && submission.adminNote && expandedNotes.has(submission.id) && (
                        <div className="mt-2 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                          <p className="font-medium mb-1">Alasan Penolakan / Revisi:</p>
                          <p>{submission.adminNote}</p>
                        </div>
                      )}

                      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100">
                        {submission.status === "DRAFT" && (
                          <>
                            <Link
                              href={`/organizations/${submission.slug}/edit`}
                              className="px-4 py-2 text-sm font-medium text-komuna-blue border border-komuna-blue rounded-lg hover:bg-komuna-blue/5 transition-colors"
                            >
                              Edit
                            </Link>
                            <button
                              onClick={() => handleSubmit(submission.id)}
                              disabled={submittingId === submission.id}
                              className="px-4 py-2 text-sm font-medium text-white bg-komuna-blue rounded-lg hover:bg-komuna-navy disabled:opacity-50 transition-colors inline-flex items-center gap-2"
                            >
                              {submittingId === submission.id && (
                                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              )}
                              Submit
                            </button>
                          </>
                        )}

                        {submission.status === "REVISION_REQUIRED" && (
                          <>
                            <Link
                              href={`/organizations/${submission.slug}/edit`}
                              className="px-4 py-2 text-sm font-medium text-komuna-blue border border-komuna-blue rounded-lg hover:bg-komuna-blue/5 transition-colors"
                            >
                              Edit
                            </Link>
                            <button
                              onClick={() => handleSubmit(submission.id)}
                              disabled={submittingId === submission.id}
                              className="px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 disabled:opacity-50 transition-colors inline-flex items-center gap-2"
                            >
                              {submittingId === submission.id && (
                                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              )}
                              Submit Ulang
                            </button>
                          </>
                        )}

                        {submission.status === "REJECTED" && (
                          <button
                            onClick={() => toggleNote(submission.id)}
                            className="px-4 py-2 text-sm font-medium text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                          >
                            Lihat Alasan
                          </button>
                        )}

                        {submission.status === "APPROVED" && (
                          <Link
                            href={`/organizations/${submission.slug}`}
                            className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                          >
                            Lihat Organisasi
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
            >
              Sebelumnya
            </button>
            <span className="text-sm text-gray-500">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
            >
              Berikutnya
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
