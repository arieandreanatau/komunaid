'use client';

import { use, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { SearchInput } from '@/components/shared/search-input';
import { EmptyState } from '@/components/shared/empty-state';
import { LoadingState } from '@/components/shared/loading-state';
import { UserMinus, Shield } from 'lucide-react';

export default function CommunityMembersPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['community-members', id, search],
    queryFn: () =>
      api.get(`/communities/${id}/members`, { params: { search } }).then((r) => r.data.data),
  });

  const removeMutation = useMutation({
    mutationFn: (memberId: string) => api.delete(`/communities/${id}/members/${memberId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['community-members', id] }),
  });

  const promoteMutation = useMutation({
    mutationFn: (memberId: string) => api.post(`/communities/${id}/members/${memberId}/promote`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['community-members', id] }),
  });

  const items = data?.items || data || [];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Member Management</h1>

      <div className="mb-6">
        <SearchInput
          placeholder="Cari anggota..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onClear={() => setSearch('')}
          className="sm:w-80"
        />
      </div>

      {isLoading ? (
        <LoadingState rows={8} />
      ) : items.length > 0 ? (
        <div className="card overflow-hidden !p-0">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left font-medium text-gray-500">Anggota</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500">Role</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500">Bergabung</th>
                <th className="px-6 py-3 text-right font-medium text-gray-500">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((m: any) => (
                <tr key={m.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-royal text-xs font-bold text-white">
                        {m.user?.firstName?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {m.user?.firstName} {m.user?.lastName}
                        </p>
                        <p className="text-xs text-gray-400">@{m.user?.username}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                      {m.role || 'Member'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {new Date(m.joinedAt || m.createdAt).toLocaleDateString('id-ID')}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => promoteMutation.mutate(m.id)}
                        className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-royal"
                        title="Promote"
                      >
                        <Shield className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => removeMutation.mutate(m.id)}
                        className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
                        title="Remove"
                      >
                        <UserMinus className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState title="Tidak ada anggota" />
      )}
    </div>
  );
}
