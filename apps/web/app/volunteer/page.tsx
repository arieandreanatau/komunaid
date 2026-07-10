"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Header } from "@/components/header";
import api from "@/lib/api";

interface VolunteerPosition {
  id: string;
  name: string;
  requiredQty: number;
}

interface VolunteerOpportunity {
  id: string;
  title: string;
  slug: string;
  description: string;
  status: string;
  registrationDeadline: string;
  activityStartDate: string;
  event: {
    id: string;
    title: string;
    slug: string;
    eventDate: string;
    location: string;
    status: string;
  };
  createdBy: { id: string; name: string; avatar: string };
  positions: VolunteerPosition[];
  applicationCount: number;
  createdAt: string;
}

export default function VolunteerListPage() {
  const [opportunities, setOpportunities] = useState<VolunteerOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchOpportunities();
  }, [page, search]);

  const fetchOpportunities = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "12",
      });
      if (search) params.set("search", search);

      const { data } = await api.get(`/volunteer?${params.toString()}`);
      setOpportunities(data.data);
      setTotalPages(data.pagination.totalPages);
      setTotal(data.pagination.total);
    } catch (error) {
      console.error("Failed to fetch volunteer opportunities");
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-komuna-navy">Volunteer</h1>
            <p className="text-gray-600 mt-2">Temukan kesempatan volunteer dan berkontribusi untuk komunitas</p>
          </div>

          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Cari volunteer opportunity..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-komuna-blue focus:border-transparent"
              />
            </div>
          </div>

          <p className="text-sm text-gray-500 mb-4">{total} kesempatan volunteer ditemukan</p>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-4" />
                  <div className="h-20 bg-gray-100 rounded mb-4" />
                  <div className="h-3 bg-gray-200 rounded w-full" />
                </div>
              ))}
            </div>
          ) : opportunities.length === 0 ? (
            <div className="text-center py-16">
              <svg className="h-16 w-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-1">Belum ada volunteer opportunity</h3>
              <p className="text-gray-500">Volunteer opportunity akan muncul di sini setelah dipublikasikan</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {opportunities.map((opp) => (
                  <Link
                    key={opp.id}
                    href={`/volunteer/${opp.slug}`}
                    className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusBadge(opp.status)}`}>
                        {opp.status}
                      </span>
                      {opp.activityStartDate && (
                        <span className="text-xs text-gray-500">{formatDate(opp.activityStartDate)}</span>
                      )}
                    </div>

                    <h3 className="font-semibold text-komuna-navy mb-2 line-clamp-2">{opp.title}</h3>

                    {opp.description && (
                      <p className="text-sm text-gray-500 mb-3 line-clamp-2">{opp.description}</p>
                    )}

                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>{opp.event.title}</span>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {opp.positions.map((pos) => (
                        <span key={pos.id} className="px-2 py-0.5 text-xs bg-komuna-teal/10 text-komuna-teal rounded-full">
                          {pos.name} ({pos.requiredQty})
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{opp.applicationCount} pendaftar</span>
                      {opp.registrationDeadline && (
                        <span>Deadline: {formatDate(opp.registrationDeadline)}</span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-50 hover:bg-gray-50"
                  >
                    Sebelumnya
                  </button>
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPage(i + 1)}
                      className={`px-3 py-1.5 text-sm rounded-lg ${
                        page === i + 1
                          ? "bg-komuna-blue text-white"
                          : "border hover:bg-gray-50"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-50 hover:bg-gray-50"
                  >
                    Selanjutnya
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
