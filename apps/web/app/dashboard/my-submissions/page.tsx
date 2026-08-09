"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth-provider";
import api from "@/lib/api";
import { Pagination } from "@/components/pagination";
import { Badge } from "@/components/ui/badge";

interface Submission {
  id: string;
  name: string;
  slug: string;
  description: string;
  logo: string | null;
  banner: string | null;
  status: "DRAFT" | "PENDING" | "APPROVED" | "REJECTED" | "REVISION_REQUIRED";
  membershipType: string;
  visibility: string;
  adminNote: string | null;
  submittedAt: string | null;
  reviewedAt: string | null;
  categories: { id: string; name: string }[];
  tags: { id: string; name: string }[];
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

const STATUS_TABS: { value: StatusFilter; label: string }[] = [
  { value: "", label: "Semua" },
  { value: "DRAFT", label: "Draft" },
  { value: "PENDING", label: "Menunggu Review" },
  { value: "APPROVED", label: "Disetujui" },
  { value: "REJECTED", label: "Ditolak" },
  { value: "REVISION_REQUIRED", label: "Perlu Revisi" },
];

const STATUS_BADGE: Record<string, { variant: string; label: string }> = {
  DRAFT: { variant: "default", label: "Draft" },
  PENDING: { variant: "pending", label: "Menunggu Review" },
  APPROVED: { variant: "approved", label: "Disetujui" },
  REJECTED: { variant: "rejected", label: "Ditolak" },
  REVISION_REQUIRED: { variant: "warning", label: "Perlu Revisi" },
};

function formatDate(dateStr: string) {
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(new Date(dateStr));
}

function SubmissionCardSkeleton() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="h-14 w-14 rounded-xl bg-slate-100 animate-pulse flex-shrink-0" />
        <div className="flex-1 space-y-3">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="h-4 w-48 rounded bg-slate-100 animate-pulse" />
              <div className="h-3 w-32 rounded bg-slate-100 animate-pulse" />
            </div>
            <div className="h-6 w-24 rounded-full bg-slate-100 animate-pulse" />
          </div>
          <div className="h-3 w-full rounded bg-slate-100 animate-pulse" />
          <div className="border-t border-slate-100 pt-3 space-y-2">
            <div className="h-3 w-28 rounded bg-slate-100 animate-pulse" />
            <div className="flex gap-4">
              <div className="h-8 w-8 rounded-full bg-slate-100 animate-pulse" />
              <div className="h-8 w-8 rounded-full bg-slate-100 animate-pulse" />
              <div className="h-8 w-8 rounded-full bg-slate-100 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
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
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
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
      <h3 className="text-base font-semibold text-slate-900">Gagal Memuat</h3>
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

function ApprovalTimeline({
  submission,
}: {
  submission: Submission;
}) {
  const hasSubmitted = !!submission.submittedAt;
  const hasReviewed = !!submission.reviewedAt;

  const steps = [
    {
      label: "Draft",
      date: formatDate(submission.createdAt),
      status: "completed" as const,
    },
    {
      label: "Pengajuan dikirim",
      date: submission.submittedAt ? formatDate(submission.submittedAt) : null,
      status: hasSubmitted ? ("completed" as const) : ("pending" as const),
    },
    {
      label: "Sedang direview",
      date: null,
      status: hasSubmitted && !hasReviewed ? ("current" as const) : hasReviewed ? ("completed" as const) : ("pending" as const),
    },
    {
      label: "Keputusan",
      date: submission.reviewedAt ? formatDate(submission.reviewedAt) : null,
      status: hasReviewed
        ? submission.status === "APPROVED"
          ? ("completed" as const)
          : submission.status === "REJECTED"
          ? ("error" as const)
          : ("warning" as const)
        : ("pending" as const),
    },
  ];

  return (
    <div className="mt-4 border-t border-slate-100 pt-4">
      <p className="text-xs font-medium text-slate-500 mb-3">Timeline Pengajuan</p>
      <div className="flex items-center gap-0">
        {steps.map((step, i) => (
          <div key={step.label} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div
                className={`h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                  step.status === "completed"
                    ? "bg-green-100"
                    : step.status === "current"
                    ? "bg-komuna-blue/10 ring-2 ring-komuna-blue/30"
                    : step.status === "error"
                    ? "bg-red-100"
                    : step.status === "warning"
                    ? "bg-orange-100"
                    : "bg-slate-100"
                }`}
              >
                {step.status === "completed" ? (
                  <svg className="h-3 w-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                ) : step.status === "current" ? (
                  <div className="h-2 w-2 rounded-full bg-komuna-blue" />
                ) : step.status === "error" ? (
                  <svg className="h-3 w-3 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : step.status === "warning" ? (
                  <svg className="h-3 w-3 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01" />
                  </svg>
                ) : (
                  <div className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                )}
              </div>
            </div>
            <div className="ml-2 min-w-0 flex-1">
              <p className={`text-xs font-medium ${
                step.status === "completed"
                  ? "text-slate-700"
                  : step.status === "current"
                  ? "text-komuna-blue"
                  : step.status === "error"
                  ? "text-red-600"
                  : step.status === "warning"
                  ? "text-orange-600"
                  : "text-slate-400"
              }`}>
                {step.label}
              </p>
              {step.date && (
                <p className="text-[10px] text-slate-400">{step.date}</p>
              )}
            </div>
            {i < steps.length - 1 && (
              <div className={`mx-1 h-0.5 flex-1 rounded ${
                step.status === "completed" ? "bg-green-200" : "bg-slate-200"
              }`} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function MySubmissionsPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<StatusFilter>("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  const fetchSubmissions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await api.get("/communities/my/submissions", {
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
    if (!confirm("Yakin ingin mengajukan komunitas ini untuk review?")) return;
    try {
      setSubmittingId(id);
      await api.post(`/communities/${id}/submit`);
      fetchSubmissions();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Gagal mengajukan komunitas.");
    } finally {
      setSubmittingId(null);
    }
  };

  const handleTabChange = (tab: StatusFilter) => {
    setActiveTab(tab);
    setPage(1);
  };

  if (authLoading || (!isAuthenticated && !authLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-komuna-blue border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-komuna-navy">Pengajuan Komunitas</h1>
          <p className="text-sm text-slate-500 mt-1">
            Lihat status dan timeline review pengajuan komunitas Anda.
          </p>
        </div>
        <Link
          href="/communities/create"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-komuna-blue text-white rounded-lg font-medium text-sm hover:bg-komuna-navy transition-colors shrink-0"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Buat Komunitas Baru
        </Link>
      </div>

      <div className="border-b border-slate-200" role="tablist" aria-label="Filter status pengajuan">
        <div className="flex overflow-x-auto gap-0 scrollbar-hide">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.value}
              onClick={() => handleTabChange(tab.value)}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.value
                  ? "border-komuna-blue text-komuna-blue"
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <SubmissionCardSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={fetchSubmissions} />
      ) : submissions.length === 0 ? (
        <EmptyState
          title="Belum Ada Pengajuan"
          description="Anda belum memiliki pengajuan komunitas. Buat komunitas baru untuk memulai."
          action={
            <Link
              href="/communities/create"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-komuna-blue text-white rounded-lg text-sm font-medium hover:bg-komuna-navy transition-colors"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Buat Komunitas Baru
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {submissions.map((submission) => {
            const badge = STATUS_BADGE[submission.status] || STATUS_BADGE.DRAFT;
            const categoryNames = submission.categories?.map((c) => c.name).join(", ");

            return (
              <div key={submission.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-start gap-4">
                  {submission.logo ? (
                    <img
                      src={submission.logo}
                      alt={submission.name}
                      className="h-14 w-14 rounded-xl object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="h-14 w-14 rounded-xl bg-komuna-blue/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-komuna-blue font-bold text-lg">
                        {submission.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-komuna-navy truncate">{submission.name}</h3>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          {categoryNames && (
                            <span className="text-xs text-slate-500">{categoryNames}</span>
                          )}
                          <span className="text-xs text-slate-400">
                            Diajukan: {formatDate(submission.createdAt)}
                          </span>
                        </div>
                      </div>
                      <Badge variant={badge.variant}>{badge.label}</Badge>
                    </div>

                    {submission.description && (
                      <p className="text-sm text-slate-600 mt-2 line-clamp-2">{submission.description}</p>
                    )}

                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      <span className="text-xs text-slate-400">
                        {submission.visibility === "PUBLIC" ? "Publik" : "Privat"}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-xs text-slate-400">
                        {submission.membershipType === "OPEN" ? "Terbuka" : "Terbatas"}
                      </span>
                      {submission.memberCount > 0 && (
                        <>
                          <span className="text-slate-300">•</span>
                          <span className="text-xs text-slate-400">{submission.memberCount} anggota</span>
                        </>
                      )}
                    </div>

                    <ApprovalTimeline submission={submission} />

                    {(submission.status === "REJECTED" || submission.status === "REVISION_REQUIRED") && submission.adminNote && (
                      <div className={`mt-4 p-3 rounded-lg text-sm flex items-start gap-2 ${
                        submission.status === "REJECTED"
                          ? "bg-red-50 text-red-700 border border-red-200"
                          : "bg-orange-50 text-orange-700 border border-orange-200"
                      }`}>
                        <svg className="h-5 w-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                          <p className="font-medium mb-0.5">Catatan Reviewer:</p>
                          <p>{submission.adminNote}</p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100">
                      {submission.status === "DRAFT" && (
                        <>
                          <Link
                            href={`/communities/${submission.slug}/edit`}
                            className="px-4 py-2 text-sm font-medium text-komuna-blue border border-komuna-blue/30 rounded-lg hover:bg-komuna-blue/5 transition-colors"
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
                            Kirim Pengajuan
                          </button>
                        </>
                      )}

                      {submission.status === "REVISION_REQUIRED" && (
                        <>
                          <Link
                            href={`/communities/${submission.slug}/edit`}
                            className="px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 transition-colors"
                          >
                            Perbaiki Pengajuan
                          </Link>
                          <button
                            onClick={() => handleSubmit(submission.id)}
                            disabled={submittingId === submission.id}
                            className="px-4 py-2 text-sm font-medium text-white bg-komuna-blue rounded-lg hover:bg-komuna-navy disabled:opacity-50 transition-colors inline-flex items-center gap-2"
                          >
                            {submittingId === submission.id && (
                              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            )}
                            Submit Ulang
                          </button>
                        </>
                      )}

                      {submission.status === "REJECTED" && (
                        <Link
                          href={`/communities/${submission.slug}/edit`}
                          className="px-4 py-2 text-sm font-medium text-white bg-komuna-blue rounded-lg hover:bg-komuna-navy transition-colors"
                        >
                          Ajukan Revisi
                        </Link>
                      )}

                      {submission.status === "APPROVED" && (
                        <Link
                          href={`/communities/${submission.slug}`}
                          className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                        >
                          Lihat Komunitas
                        </Link>
                      )}

                      {submission.status === "PENDING" && (
                        <span className="text-sm text-slate-500 flex items-center gap-2">
                          <div className="h-4 w-4 border-2 border-komuna-blue border-t-transparent rounded-full animate-spin" />
                          Menunggu review...
                        </span>
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
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      )}
    </div>
  );
}
