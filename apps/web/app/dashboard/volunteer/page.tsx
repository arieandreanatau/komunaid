"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth-provider";
import api from "@/lib/api";

interface VolunteerApplication {
  id: string;
  status: string;
  motivation: string;
  reviewedAt: string;
  reviewNote: string;
  createdAt: string;
  opportunity: {
    id: string;
    title: string;
    slug: string;
    status: string;
    activityStartDate: string;
    event: {
      id: string;
      title: string;
      slug: string;
      eventDate: string;
      status: string;
    };
  };
  position: { id: string; name: string };
  assignment: {
    id: string;
    shiftStart: string;
    shiftEnd: string;
    notes: string;
    attendance: {
      status: string;
      checkInAt: string;
      checkOutAt: string;
    } | null;
  } | null;
}

export default function DashboardVolunteerPage() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<VolunteerApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    fetchApplications();
  }, [page, statusFilter]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
      });
      if (statusFilter) params.set("status", statusFilter);

      const { data } = await api.get(`/volunteer/my/applications?${params.toString()}`);
      setApplications(data.data);
      setTotalPages(data.pagination.totalPages);
      setTotal(data.pagination.total);
    } catch (error) {
      console.error("Failed to fetch applications");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
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

  const getAttendanceBadge = (status: string) => {
    const styles: Record<string, string> = {
      NOT_CHECKED_IN: "bg-gray-100 text-gray-600",
      CHECKED_IN: "bg-blue-100 text-blue-700",
      CHECKED_OUT: "bg-green-100 text-green-700",
    };
    return styles[status] || "bg-gray-100 text-gray-700";
  };

  const statusCounts = {
    total: applications.length,
    applied: applications.filter((a) => a.status === "APPLIED").length,
    accepted: applications.filter((a) => a.status === "ACCEPTED").length,
    rejected: applications.filter((a) => a.status === "REJECTED").length,
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-komuna-navy via-komuna-blue to-komuna-teal rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold">Volunteer Saya</h1>
        <p className="text-white/80 mt-1">Pantau pendaftaran volunteer, tugas, dan riwayat kegiatan Anda</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <p className="text-2xl font-bold text-komuna-navy">{total}</p>
          <p className="text-sm text-gray-500">Total Pendaftaran</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <p className="text-2xl font-bold text-blue-600">{statusCounts.applied}</p>
          <p className="text-sm text-gray-500">Menunggu Review</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <p className="text-2xl font-bold text-green-600">{statusCounts.accepted}</p>
          <p className="text-sm text-gray-500">Diterima</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <p className="text-2xl font-bold text-red-600">{statusCounts.rejected}</p>
          <p className="text-sm text-gray-500">Ditolak</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {["", "APPLIED", "ACCEPTED", "REJECTED"].map((s) => (
          <button
            key={s}
            onClick={() => { setStatusFilter(s); setPage(1); }}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              statusFilter === s
                ? "bg-komuna-blue text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {s || "Semua"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : applications.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
          <svg className="h-16 w-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-1">Belum ada pendaftaran volunteer</h3>
          <p className="text-gray-500 mb-4">Mulai menjelajahi kesempatan volunteer</p>
          <Link href="/volunteer" className="inline-block px-4 py-2 bg-komuna-blue text-white rounded-lg hover:bg-komuna-navy transition-colors text-sm font-medium">
            Jelajahi Volunteer
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <div key={app.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <Link href={`/volunteer/${app.opportunity.slug}`} className="font-semibold text-komuna-navy hover:text-komuna-blue">
                    {app.opportunity.title}
                  </Link>
                  <p className="text-sm text-gray-500 mt-0.5">{app.opportunity.event.title}</p>
                </div>
                <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${getApplicationStatusBadge(app.status)}`}>
                  {app.status}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-3">
                <span>Posisi: <span className="font-medium text-gray-700">{app.position.name}</span></span>
                <span>Mendaftar: {formatDate(app.createdAt)}</span>
                {app.opportunity.activityStartDate && (
                  <span>Aktivitas: {formatDate(app.opportunity.activityStartDate)}</span>
                )}
              </div>

              {app.assignment && (
                <div className="bg-gray-50 rounded-lg p-3 mt-3">
                  <p className="text-xs font-medium text-gray-500 mb-2">Penugasan</p>
                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    {app.assignment.shiftStart && (
                      <span>Shift: {formatDate(app.assignment.shiftStart)}
                        {app.assignment.shiftEnd ? ` - ${formatDate(app.assignment.shiftEnd)}` : ""}
                      </span>
                    )}
                    {app.assignment.attendance && (
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getAttendanceBadge(app.assignment.attendance.status)}`}>
                        {app.assignment.attendance.status.replace("_", " ")}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {app.reviewNote && (
                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-xs font-medium text-yellow-700 mb-1">Catatan Review</p>
                  <p className="text-sm text-yellow-800">{app.reviewNote}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-50 hover:bg-gray-50"
          >
            Sebelumnya
          </button>
          <span className="text-sm text-gray-500">Halaman {page} dari {totalPages}</span>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-50 hover:bg-gray-50"
          >
            Selanjutnya
          </button>
        </div>
      )}
    </div>
  );
}
