"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import api from "@/lib/api";

interface CommunityEvent {
  id: string;
  title: string;
  slug: string;
  status: string;
  eventDate: string;
  quota: number;
  registeredCount: number;
  community?: { id: string; name: string; slug: string } | null;
  organization?: { id: string; name: string; slug: string } | null;
  createdAt: string;
}

interface PageResult {
  data: CommunityEvent[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Draft",
  PUBLISHED: "Diterbitkan",
  REGISTRATION_OPEN: "Pendaftaran Buka",
  REGISTRATION_CLOSED: "Pendaftaran Tutup",
  ONGOING: "Berlangsung",
  COMPLETED: "Selesai",
  CANCELLED: "Dibatalkan",
  ARCHIVED: "Diarsipkan",
};

const STATUS_CLASS: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-600",
  PUBLISHED: "bg-blue-100 text-blue-700",
  REGISTRATION_OPEN: "bg-green-100 text-green-700",
  REGISTRATION_CLOSED: "bg-yellow-100 text-yellow-700",
  ONGOING: "bg-purple-100 text-purple-700",
  COMPLETED: "bg-emerald-100 text-emerald-700",
  CANCELLED: "bg-red-100 text-red-700",
  ARCHIVED: "bg-gray-200 text-gray-700",
};

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function CommunityEventTab({ communityId, communityName }: { communityId: string; communityName: string }) {
  const [events, setEvents] = useState<CommunityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [canManage, setCanManage] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    api
      .get("/users/profile")
      .then(({ data }) => {
        const profile = data.data?.user || data.user;
        const membership = (profile?.communities || []).find((c: { id: string }) => c.id === communityId);
        setCanManage(
          !!membership &&
            membership.status === "ACTIVE" &&
            ["OWNER", "ADMIN", "EVENT_MANAGER"].includes(membership.role)
        );
      })
      .catch(() => setCanManage(false));
  }, [communityId]);

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await api.get<PageResult>("/events/my/created", {
        params: { page, limit: 20, communityId },
      });
      setEvents(data.data || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch {
      setError("Event gagal dimuat.");
    } finally {
      setLoading(false);
    }
  }, [communityId, page]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  useEffect(() => {
    setPage(1);
  }, [communityId]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-komuna-navy">Event Komunitas</h2>
          <p className="text-sm text-gray-500 mt-1">Semua event yang kamu buat di {communityName}.</p>
        </div>
        {canManage && (
          <Link
            href={`/dashboard/events/create?communityId=${encodeURIComponent(communityId)}`}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-komuna-blue text-white rounded-lg font-medium text-sm hover:bg-komuna-navy transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            + Tambah Event
          </Link>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 animate-pulse">
              <div className="h-5 w-48 bg-gray-200 rounded" />
              <div className="h-4 w-36 bg-gray-100 rounded mt-3" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
          <p className="text-sm text-gray-500 mb-4">{error}</p>
          <button
            onClick={fetchEvents}
            className="px-4 py-2 bg-komuna-blue text-white rounded-lg text-sm font-medium"
          >
            Coba Lagi
          </button>
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-14 bg-white rounded-xl border border-gray-100">
          <svg className="h-14 w-14 text-gray-200 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-700">Belum ada event</h3>
          <p className="text-sm text-gray-500 mt-1">
            {canManage
              ? "Buat event pertama untuk komunitas ini."
              : "Belum ada event yang dibuat di komunitas ini."}
          </p>
          {canManage && (
            <Link
              href={`/dashboard/events/create?communityId=${encodeURIComponent(communityId)}`}
              className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 bg-komuna-blue text-white rounded-lg text-sm font-medium hover:bg-komuna-navy transition-colors"
            >
              + Tambah Event
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {events.map((event) => {
            const statusLabel = STATUS_LABEL[event.status] || event.status;
            const statusClass = STATUS_CLASS[event.status] || STATUS_CLASS.DRAFT;
            return (
              <Link
                key={event.id}
                href={`/events/${event.slug}`}
                className="block bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-komuna-navy truncate">{event.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">{formatDate(event.eventDate)}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${statusClass}`}>
                    {statusLabel}
                  </span>
                </div>
                {event.quota > 0 && (
                  <p className="text-sm text-gray-500 mt-2">
                    {event.registeredCount}/{event.quota} peserta
                  </p>
                )}
              </Link>
            );
          })}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Sebelumnya
              </button>
              <span className="text-sm text-gray-500">
                Halaman {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Selanjutnya
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
