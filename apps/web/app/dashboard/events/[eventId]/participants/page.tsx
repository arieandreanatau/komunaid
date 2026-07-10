"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { useAuth } from "@/components/auth-provider";

interface Participant {
  id: string;
  user: { id: string; name: string; avatar: string | null; email: string };
  status: string;
  attendance: string;
  registeredAt: string;
  checkedInAt: string | null;
  checkedOutAt: string | null;
}

interface ParticipantsResponse {
  participants: Participant[];
  pagination: { page: number; totalPages: number; totalItems: number };
}

const REG_STATUS_MAP: Record<string, { label: string; className: string }> = {
  CONFIRMED: { label: "Dikonfirmasi", className: "bg-green-100 text-green-700" },
  PENDING: { label: "Menunggu", className: "bg-yellow-100 text-yellow-700" },
  WAITLISTED: { label: "Waiting List", className: "bg-orange-100 text-orange-700" },
  CANCELLED: { label: "Dibatalkan", className: "bg-red-100 text-red-700" },
  REJECTED: { label: "Ditolak", className: "bg-red-100 text-red-700" },
};

const ATTENDANCE_MAP: Record<string, { label: string; className: string }> = {
  CHECKED_IN: { label: "Hadir", className: "bg-green-100 text-green-700" },
  CHECKED_OUT: { label: "Selesai", className: "bg-blue-100 text-blue-700" },
  ABSENT: { label: "Absen", className: "bg-red-100 text-red-700" },
  REGISTERED: { label: "Terdaftar", className: "bg-gray-100 text-gray-600" },
};

export default function EventParticipantsPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.eventId as string;
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, authLoading, router]);

  const { data, isLoading } = useQuery({
    queryKey: ["eventParticipants", eventId, page, search, statusFilter],
    enabled: !!isAuthenticated && !!eventId,
    queryFn: async () => {
      const params: Record<string, string | number> = { page, limit: 20 };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const res = await api.get(`/events/${eventId}/participants`, { params });
      return res.data as ParticipantsResponse;
    },
  });

  const checkInMutation = useMutation({
    mutationFn: async (participantId: string) => {
      return api.post(`/events/${eventId}/participants/${participantId}/check-in`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["eventParticipants", eventId] });
      setSelectedIds(new Set());
    },
  });

  const checkOutMutation = useMutation({
    mutationFn: async (participantId: string) => {
      return api.post(`/events/${eventId}/participants/${participantId}/check-out`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["eventParticipants", eventId] });
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (participantId: string) => {
      return api.patch(`/events/${eventId}/participants/${participantId}/approve`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["eventParticipants", eventId] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (participantId: string) => {
      return api.patch(`/events/${eventId}/participants/${participantId}/reject`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["eventParticipants", eventId] });
    },
  });

  const bulkCheckInMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      return api.post(`/events/${eventId}/participants/bulk-check-in`, { participantIds: ids });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["eventParticipants", eventId] });
      setSelectedIds(new Set());
    },
  });

  const handleExport = async () => {
    try {
      const res = await api.get(`/events/${eventId}/participants/export`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `participants-${eventId}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      alert("Gagal mengexport data");
    }
  };

  const toggleSelectAll = () => {
    const participants = data?.participants || [];
    const checkable = participants.filter(
      (p) => p.status === "CONFIRMED" && p.attendance !== "CHECKED_IN" && p.attendance !== "CHECKED_OUT"
    );
    if (selectedIds.size === checkable.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(checkable.map((p) => p.id)));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-8 w-8 border-4 border-komuna-blue border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const participants = data?.participants || [];
  const pagination = data?.pagination || { page: 1, totalPages: 1, totalItems: 0 };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/dashboard/events" className="text-sm text-komuna-blue hover:underline">Event Saya</Link>
            <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <Link href={`/dashboard/events/${eventId}`} className="text-sm text-komuna-blue hover:underline">Dashboard</Link>
            <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-sm text-gray-500">Peserta</span>
          </div>
          <h1 className="text-2xl font-bold text-komuna-navy">Kelola Peserta</h1>
          <p className="text-sm text-gray-500 mt-1">{pagination.totalItems} peserta terdaftar</p>
        </div>
        <button
          onClick={handleExport}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Cari nama atau email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue text-sm"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue text-sm"
        >
          <option value="">Semua Status</option>
          <option value="CONFIRMED">Dikonfirmasi</option>
          <option value="PENDING">Menunggu</option>
          <option value="WAITLISTED">Waiting List</option>
          <option value="CANCELLED">Dibatalkan</option>
          <option value="REJECTED">Ditolak</option>
        </select>
      </div>

      {/* Bulk Actions */}
      {selectedIds.size > 0 && (
        <div className="bg-komuna-blue/5 border border-komuna-blue/20 rounded-lg p-3 flex items-center justify-between">
          <span className="text-sm text-komuna-blue font-medium">{selectedIds.size} dipilih</span>
          <div className="flex gap-2">
            <button
              onClick={() => {
                if (confirm(`Check-in ${selectedIds.size} peserta?`)) {
                  bulkCheckInMutation.mutate(Array.from(selectedIds));
                }
              }}
              disabled={bulkCheckInMutation.isPending}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50"
            >
              {bulkCheckInMutation.isPending && (
                <div className="h-3.5 w-3.5 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
              )}
              Bulk Check In
            </button>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="px-3 py-1.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Batal
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      {participants.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
          <svg className="h-12 w-12 text-gray-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <p className="text-gray-500">Tidak ada peserta ditemukan</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="px-4 py-3 w-10">
                    <input
                      type="checkbox"
                      checked={participants.filter(
                        (p) => p.status === "CONFIRMED" && p.attendance !== "CHECKED_IN" && p.attendance !== "CHECKED_OUT"
                      ).length > 0 && selectedIds.size === participants.filter(
                        (p) => p.status === "CONFIRMED" && p.attendance !== "CHECKED_IN" && p.attendance !== "CHECKED_OUT"
                      ).length}
                      onChange={toggleSelectAll}
                      className="text-komuna-blue focus:ring-komuna-blue"
                    />
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Nama</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 hidden md:table-cell">Email</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Kehadiran</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 hidden lg:table-cell">Terdaftar</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-500">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {participants.map((p) => {
                  const regInfo = REG_STATUS_MAP[p.status] || REG_STATUS_MAP.PENDING;
                  const attInfo = ATTENDANCE_MAP[p.attendance] || ATTENDANCE_MAP.REGISTERED;
                  const canCheckIn = p.status === "CONFIRMED" && p.attendance !== "CHECKED_IN" && p.attendance !== "CHECKED_OUT";
                  return (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        {canCheckIn && (
                          <input
                            type="checkbox"
                            checked={selectedIds.has(p.id)}
                            onChange={() => toggleSelect(p.id)}
                            className="text-komuna-blue focus:ring-komuna-blue"
                          />
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {p.user.avatar ? (
                            <img src={p.user.avatar} alt={p.user.name} className="h-8 w-8 rounded-full object-cover" />
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-komuna-blue/10 flex items-center justify-center flex-shrink-0">
                              <span className="text-komuna-blue font-bold text-xs">{p.user.name[0]}</span>
                            </div>
                          )}
                          <span className="font-medium text-gray-900">{p.user.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{p.user.email}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${regInfo.className}`}>
                          {regInfo.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${attInfo.className}`}>
                          {attInfo.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 hidden lg:table-cell">{formatDateTime(p.registeredAt)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          {p.status === "PENDING" && (
                            <>
                              <button
                                onClick={() => approveMutation.mutate(p.id)}
                                disabled={approveMutation.isPending}
                                className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors"
                                title="Setuju"
                              >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              </button>
                              <button
                                onClick={() => rejectMutation.mutate(p.id)}
                                disabled={rejectMutation.isPending}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                                title="Tolak"
                              >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </>
                          )}
                          {canCheckIn && (
                            <button
                              onClick={() => checkInMutation.mutate(p.id)}
                              disabled={checkInMutation.isPending}
                              className="px-2 py-1 text-xs font-medium text-komuna-blue bg-komuna-blue/5 border border-komuna-blue/30 rounded hover:bg-komuna-blue/10 transition-colors"
                            >
                              Check In
                            </button>
                          )}
                          {p.attendance === "CHECKED_IN" && (
                            <button
                              onClick={() => checkOutMutation.mutate(p.id)}
                              disabled={checkOutMutation.isPending}
                              className="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 border border-gray-200 rounded hover:bg-gray-200 transition-colors"
                            >
                              Check Out
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`px-3 py-1 rounded-lg text-sm ${p === page ? "bg-komuna-blue text-white" : "bg-white border hover:bg-gray-50"}`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
