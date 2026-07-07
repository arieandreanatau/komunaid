'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { SearchInput } from '@/components/shared/search-input';
import { PaginationBar } from '@/components/shared/pagination-bar';
import { LoadingState } from '@/components/shared/loading-state';
import { EmptyState } from '@/components/shared/empty-state';
import { CheckCircle, XCircle } from 'lucide-react';

export default function AdminCommunitiesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-communities', search, page, filter],
    queryFn: () =>
      api
        .get('/admin/communities', {
          params: { search, page, limit: 20, status: filter || undefined },
        })
        .then((r) => r.data.data),
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => api.post(`/admin/communities/${id}/approve`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-communities'] }),
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => api.post(`/admin/communities/${id}/reject`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-communities'] }),
  });

  const items = data?.items || data || [];
  const totalPages = data?.totalPages || 1;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Community Approval Queue</h1>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row">
        <SearchInput
          placeholder="Cari komunitas..."
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
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {isLoading ? (
        <LoadingState rows={8} />
      ) : items.length > 0 ? (
        <>
          <div className="space-y-3">
            {items.map((c: any) => (
              <div key={c.id} className="card flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{c.name}</h3>
                  <p className="text-sm text-gray-500">
                    {c.description?.slice(0, 100) || 'No description'}
                  </p>
                  <span
                    className={cn(
                      'mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium',
                      c.status === 'approved' && 'bg-teal/10 text-teal',
                      c.status === 'pending' && 'bg-yellow-50 text-yellow-600',
                      c.status === 'rejected' && 'bg-red-50 text-red-600',
                    )}
                  >
                    {c.status}
                  </span>
                </div>
                {c.status === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => approveMutation.mutate(c.id)}
                      className="btn-teal !py-1.5 !px-3 text-xs"
                    >
                      <CheckCircle className="mr-1 h-3.5 w-3.5" /> Approve
                    </button>
                    <button
                      onClick={() => rejectMutation.mutate(c.id)}
                      className="inline-flex items-center justify-center rounded-lg border border-red-300 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                    >
                      <XCircle className="mr-1 h-3.5 w-3.5" /> Reject
                    </button>
                  </div>
                )}
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
        <EmptyState title="Tidak ada komunitas" />
      )}
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
