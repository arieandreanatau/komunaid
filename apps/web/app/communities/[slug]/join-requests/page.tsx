"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import api, { unwrapApiData } from "@/lib/api";
import { Header } from "@/components/header";
import { useAuth } from "@/components/auth-provider";

interface JoinRequestUser {
  id: string;
  name: string;
  avatar: string | null;
}

interface JoinRequest {
  id: string;
  user: JoinRequestUser;
  message: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
}

interface Community {
  id: string;
  name: string;
  slug: string;
  owner?: { id: string; name: string; avatar?: string };
  userMembership: { role: string; status: string } | null;
}

type StatusFilter = "ALL" | "PENDING" | "APPROVED" | "REJECTED";

const STATUS_TABS: { label: string; value: StatusFilter }[] = [
  { label: "Semua", value: "ALL" },
  { label: "Menunggu", value: "PENDING" },
  { label: "Disetujui", value: "APPROVED" },
  { label: "Ditolak", value: "REJECTED" },
];

const STATUS_BADGES: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  APPROVED: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-red-100 text-red-700",
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Menunggu",
  APPROVED: "Disetujui",
  REJECTED: "Ditolak",
};

export default function JoinRequestsPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const { user, isAuthenticated } = useAuth();

  const [community, setCommunity] = useState<Community | null>(null);
  const [requests, setRequests] = useState<JoinRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<StatusFilter>("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=${encodeURIComponent(`/communities/${slug}/join-requests`)}`);
      return;
    }
    fetchCommunity();
  }, [slug, isAuthenticated]);

  useEffect(() => {
    if (community) {
      fetchRequests();
    }
  }, [community, activeTab, page]);

  const fetchCommunity = async () => {
    try {
      setLoading(true);
      setError(null);
      setCommunity(unwrapApiData<Community>(await api.get(`/communities/${slug}`)));
    } catch (err: any) {
      setError(err?.response?.data?.message || "Gagal memuat data komunitas.");
      setLoading(false);
    }
  };

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const params: Record<string, string | number> = {
        page,
        limit: 20,
        status: activeTab === "ALL" ? "all" : activeTab,
      };
      const response = await api.get(`/communities/${community!.id}/join-requests`, { params });
      setRequests(unwrapApiData<JoinRequest[]>(response) || []);
      setTotalPages(response.data.pagination?.totalPages || 1);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Gagal memuat permintaan bergabung.");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (requestId: string, action: "approve" | "reject") => {
    if (!community) return;
    setProcessingId(requestId);
    try {
      await api.put(`/communities/${community.id}/join-requests/${requestId}`, { action });
      setRequests((prev) =>
        prev.map((r) =>
          r.id === requestId
            ? { ...r, status: action === "approve" ? "APPROVED" : "REJECTED" }
            : r
        )
      );
    } catch (err: any) {
      alert(err?.response?.data?.message || "Gagal memproses permintaan.");
    } finally {
      setProcessingId(null);
    }
  };

  const isAdmin =
    user && community && (user.id === community.owner?.id || community.userMembership?.role === "OWNER" || community.userMembership?.role === "ADMIN");

  if (loading && !community) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="h-12 w-12 border-4 border-komuna-blue border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Memuat komunitas...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !community) {
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
            <h2 className="text-2xl font-bold text-komuna-navy mb-2">Komunitas Tidak Ditemukan</h2>
            <p className="text-gray-500 mb-6">{error}</p>
            <Link
              href="/communities"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-komuna-blue text-white rounded-lg font-medium hover:bg-komuna-navy transition-colors"
            >
              Kembali ke Direktori
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (community && !isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-komuna-navy mb-2">Akses Ditolak</h2>
            <p className="text-gray-500 mb-6">Hanya pemilik atau admin komunitas yang dapat mengelola permintaan bergabung.</p>
            <Link
              href={`/communities/${slug}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-komuna-blue text-white rounded-lg font-medium hover:bg-komuna-navy transition-colors"
            >
              Kembali ke Komunitas
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
            <Link href="/communities" className="hover:text-komuna-blue transition-colors">
              Komunitas
            </Link>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <Link href={`/communities/${slug}`} className="hover:text-komuna-blue transition-colors truncate">
              {community?.name}
            </Link>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-komuna-navy font-medium">Permintaan Bergabung</span>
          </nav>

          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-komuna-navy mb-1">Permintaan Bergabung</h1>
            <p className="text-gray-500">Kelola permintaan bergabung ke komunitas {community?.name}</p>
          </div>

          {/* Status Tabs */}
          <div className="flex gap-1 bg-white rounded-xl shadow-sm p-1 mb-6 overflow-x-auto">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => {
                  setActiveTab(tab.value);
                  setPage(1);
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.value
                    ? "bg-komuna-blue text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Requests List */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-10 w-10 border-4 border-komuna-blue border-t-transparent rounded-full animate-spin" />
            </div>
          ) : error ? (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <p className="text-gray-500">{error}</p>
              <button
                onClick={fetchRequests}
                className="mt-4 px-4 py-2 text-sm text-komuna-blue hover:underline"
              >
                Coba Lagi
              </button>
            </div>
          ) : requests.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <p className="text-gray-500 mb-1">Tidak ada permintaan bergabung</p>
              <p className="text-sm text-gray-400">
                {activeTab === "ALL"
                  ? "Belum ada yang mengirim permintaan bergabung."
                  : `Tidak ada permintaan dengan status ${STATUS_LABELS[activeTab]}.`}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {requests.map((request) => (
                <div
                  key={request.id}
                  className="bg-white rounded-xl shadow-sm p-5 flex flex-col sm:flex-row sm:items-center gap-4"
                >
                  {/* User Info */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {request.user.avatar ? (
                      <img
                        src={request.user.avatar}
                        alt={request.user.name}
                        className="h-10 w-10 rounded-full object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-komuna-blue flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-sm">
                          {request.user.name[0]}
                        </span>
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-komuna-navy truncate">{request.user.name}</p>
                      {request.message && (
                        <p className="text-sm text-gray-500 line-clamp-2">{request.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Status + Date + Actions */}
                  <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                    <span className="text-xs text-gray-400 whitespace-nowrap">
                      {new Date(request.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGES[request.status]}`}
                    >
                      {STATUS_LABELS[request.status]}
                    </span>

                    {request.status === "PENDING" && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAction(request.id, "reject")}
                          disabled={processingId === request.id}
                          className="px-3 py-1.5 text-xs font-medium border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 inline-flex items-center gap-1"
                        >
                          {processingId === request.id ? (
                            <div className="h-3 w-3 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          )}
                          Tolak
                        </button>
                        <button
                          onClick={() => handleAction(request.id, "approve")}
                          disabled={processingId === request.id}
                          className="px-3 py-1.5 text-xs font-medium bg-komuna-blue text-white rounded-lg hover:bg-komuna-navy transition-colors disabled:opacity-50 inline-flex items-center gap-1"
                        >
                          {processingId === request.id ? (
                            <div className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                          Setujui
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sebelumnya
              </button>
              <span className="px-4 py-2 text-sm text-gray-600">
                Halaman {page} dari {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Selanjutnya
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
