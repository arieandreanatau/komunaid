"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { useAuth } from "@/components/auth-provider";

interface EventRegistration {
  id: string;
  status: string;
  registeredAt: string;
  event: {
    id: string;
    title: string;
    slug: string;
    coverImage: string | null;
    eventDate: string;
    endDate: string | null;
    status: string;
    location: string | null;
    locationType: string;
    community: { name: string; slug: string } | null;
  };
}

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  CONFIRMED: { label: "Dikonfirmasi", className: "bg-green-100 text-green-700" },
  PENDING: { label: "Menunggu", className: "bg-yellow-100 text-yellow-700" },
  WAITLISTED: { label: "Waiting List", className: "bg-orange-100 text-orange-700" },
  CANCELLED: { label: "Dibatalkan", className: "bg-red-100 text-red-700" },
};

const LIFECYCLE_TABS = [
  { key: "", label: "Semua" },
  { key: "completed", label: "Selesai" },
  { key: "cancelled", label: "Dibatalkan" },
] as const;

type LifecycleTab = (typeof LIFECYCLE_TABS)[number]["key"];

export default function EventHistoryPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [events, setEvents] = useState<EventRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState<LifecycleTab>("");

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, limit: 12 };
      if (filter === "completed") params.status = "COMPLETED";
      if (filter === "cancelled") params.status = "CANCELLED";
      const { data } = await api.get("/events/my/registered", { params });
      const regs = data.data || [];
      if (filter) {
        setEvents(regs.filter((r: EventRegistration) => {
          if (filter === "completed") return r.event.status === "COMPLETED";
          if (filter === "cancelled") return r.event.status === "CANCELLED";
          return true;
        }));
      } else {
        setEvents(regs);
      }
      setTotalPages(data.pagination?.totalPages || 1);
      setTotal(data.pagination?.total || regs.length);
    } catch {
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [page, filter]);

  useEffect(() => { if (isAuthenticated) fetchHistory(); }, [fetchHistory, isAuthenticated]);
  useEffect(() => { setPage(1); }, [filter]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="h-8 w-8 border-4 border-komuna-blue border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-komuna-navy">Riwayat Event</h1>
        <p className="text-sm text-gray-500 mt-1">Event yang telah Anda ikuti atau buat.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {LIFECYCLE_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 text-sm font-bold rounded-full transition ${
              filter === tab.key
                ? "bg-komuna-blue text-white"
                : "border border-gray-200 bg-white text-gray-600 hover:border-komuna-blue/50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-4 border border-gray-100 animate-pulse">
              <div className="flex gap-4">
                <div className="h-20 w-20 bg-gray-200 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                  <div className="h-3 bg-gray-200 rounded w-1/4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-gray-200 p-12 text-center">
          <p className="text-gray-400 text-sm">Belum ada riwayat event.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((reg) => {
            const statusInfo = STATUS_LABELS[reg.status];
            return (
              <Link
                key={reg.id}
                href={`/events/${reg.event.slug}`}
                className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-shadow flex gap-4"
              >
                {reg.event.coverImage ? (
                  <img src={reg.event.coverImage} alt="" className="h-20 w-20 rounded-lg object-cover flex-shrink-0" />
                ) : (
                  <div className="h-20 w-20 rounded-lg bg-gradient-to-br from-komuna-blue to-komuna-teal flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-xl opacity-30">{reg.event.title[0]}</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-komuna-navy truncate">{reg.event.title}</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(reg.event.eventDate).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                    {reg.event.community && <span> &middot; {reg.event.community.name}</span>}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    {statusInfo && (
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusInfo.className}`}>
                        {statusInfo.label}
                      </span>
                    )}
                    <span className="text-[11px] text-gray-400">
                      {reg.event.status === "COMPLETED" ? "Selesai" : reg.event.status === "CANCELLED" ? "Dibatalkan" : ""}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`px-3 py-1 rounded text-sm ${
                    p === page ? "bg-komuna-blue text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
