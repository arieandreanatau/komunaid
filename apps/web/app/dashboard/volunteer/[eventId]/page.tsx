"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import api from "@/lib/api";

interface DashboardSummary {
  totalOpportunities: number;
  totalApplicants: number;
  pending: number;
  accepted: number;
  rejected: number;
  checkedIn: number;
  checkedOut: number;
}

interface Opportunity {
  id: string;
  title: string;
  slug: string;
  status: string;
  positions: { id: string; name: string; requiredQty: number }[];
  applicationCount: number;
  createdAt: string;
}

export default function OrganizerVolunteerDashboard() {
  const params = useParams();
  const eventId = params.eventId as string;
  const { user } = useAuth();

  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, [eventId]);

  const fetchDashboard = async () => {
    try {
      const { data } = await api.get(`/volunteer/dashboard/${eventId}`);
      setSummary(data.data.summary);
      setOpportunities(data.data.opportunities);
    } catch (error) {
      console.error("Failed to fetch volunteer dashboard");
    } finally {
      setLoading(false);
    }
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-24 bg-gray-200 rounded-xl animate-pulse" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-komuna-navy via-komuna-blue to-komuna-teal rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold">Volunteer Dashboard</h1>
        <p className="text-white/80 mt-1">Kelola volunteer opportunity, pendaftar, dan penugasan</p>
      </div>

      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <p className="text-2xl font-bold text-komuna-navy">{summary.totalOpportunities}</p>
            <p className="text-sm text-gray-500">Total Opportunity</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <p className="text-2xl font-bold text-blue-600">{summary.totalApplicants}</p>
            <p className="text-sm text-gray-500">Total Pendaftar</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <p className="text-2xl font-bold text-green-600">{summary.accepted}</p>
            <p className="text-sm text-gray-500">Diterima</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <p className="text-2xl font-bold text-yellow-600">{summary.pending}</p>
            <p className="text-sm text-gray-500">Menunggu Review</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <p className="text-2xl font-bold text-red-600">{summary?.rejected || 0}</p>
          <p className="text-sm text-gray-500">Ditolak</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <p className="text-2xl font-bold text-komuna-teal">{summary?.checkedIn || 0}</p>
          <p className="text-sm text-gray-500">Check In</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <p className="text-2xl font-bold text-komuna-aqua">{summary?.checkedOut || 0}</p>
          <p className="text-sm text-gray-500">Check Out</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-komuna-navy">Volunteer Opportunity</h2>
      </div>

      {opportunities.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
          <svg className="h-16 w-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-1">Belum ada volunteer opportunity</h3>
          <p className="text-gray-500">Buat volunteer opportunity baru untuk event ini</p>
        </div>
      ) : (
        <div className="space-y-4">
          {opportunities.map((opp) => (
            <div key={opp.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-komuna-navy">{opp.title}</h3>
                  <p className="text-sm text-gray-500 mt-0.5">{opp.applicationCount} pendaftar</p>
                </div>
                <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${getStatusBadge(opp.status)}`}>
                  {opp.status}
                </span>
              </div>

              <div className="flex flex-wrap gap-2 mb-3">
                {opp.positions.map((pos) => (
                  <span key={pos.id} className="px-2 py-0.5 text-xs bg-komuna-teal/10 text-komuna-teal rounded-full">
                    {pos.name} ({pos.requiredQty})
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href={`/volunteer/${opp.slug}`}
                  className="px-3 py-1.5 text-sm text-komuna-blue border border-komuna-blue rounded-lg hover:bg-komuna-blue/5"
                >
                  Lihat Detail
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
