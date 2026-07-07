'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { SearchInput } from '@/components/shared/search-input';
import { PaginationBar } from '@/components/shared/pagination-bar';
import { LoadingState } from '@/components/shared/loading-state';
import { EmptyState } from '@/components/shared/empty-state';
import { CheckCircle, XCircle } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function AdminReportsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-reports', search, page, filter],
    queryFn: () =>
      api
        .get('/admin/reports', { params: { search, page, limit: 20, status: filter || undefined } })
        .then((r) => r.data.data),
  });

  const resolveMutation = useMutation({
    mutationFn: (id: string) => api.post(`/admin/reports/${id}/resolve`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-reports'] }),
  });

  const dismissMutation = useMutation({
    mutationFn: (id: string) => api.post(`/admin/reports/${id}/dismiss`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-reports'] }),
  });

  const items = data?.items || data || [];
  const totalPages = data?.totalPages || 1;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Report Management</h1>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row">
        <SearchInput
          placeholder="Cari laporan..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          onClear={() => {
            setSearch('');
            setPage(1);
          }}
          className="sm:w-80"
        />
        <select
          value={filter}
          onChange={(e) => {
            setFilter(e.target.value);
            setPage(1);
          }}
          className="input-field w-auto"
        >
          <option value="">Semua Status</option>
          <option value="pending">Pending</option>
          <option value="resolved">Resolved</option>
          <option value="dismissed">Dismissed</option>
        </select>
      </div>

      {isLoading ? (
        <LoadingState rows={8} />
      ) : items.length > 0 ? (
        <>
          <div className="space-y-3">
            {items.map((r: any) => (
              <div key={r.id} className="card">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{r.reason || 'Laporan'}</h3>
                    <p className="text-sm text-gray-500">{r.description || 'No description'}</p>
                    <p className="mt-1 text-xs text-gray-400">
                      Oleh: {r.reporter?.firstName} {r.reporter?.lastName} &middot;{' '}
                      {formatDate(r.createdAt)}
                    </p>
                    <span
                      className={cn(
                        'mt-2 inline-block rounded-full px-2 py-0.5 text-xs font-medium',
                        r.status === 'resolved' && 'bg-teal/10 text-teal',
                        r.status === 'pending' && 'bg-yellow-50 text-yellow-600',
                        r.status === 'dismissed' && 'bg-gray-100 text-gray-500',
                      )}
                    >
                      {r.status}
                    </span>
                  </div>
                  {r.status === 'pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => resolveMutation.mutate(r.id)}
                        className="btn-teal !py-1.5 !px-3 text-xs"
                      >
                        <CheckCircle className="mr-1 h-3.5 w-3.5" /> Resolve
                      </button>
                      <button
                        onClick={() => dismissMutation.mutate(r.id)}
                        className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                      >
                        <XCircle className="mr-1 h-3.5 w-3.5" /> Dismiss
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          <PaginationBar
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
            className="mt-6"
          />
        </>
      ) : (
        <EmptyState title="Tidak ada laporan" />
      )}
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
