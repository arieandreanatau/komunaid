'use client';

import { use, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { SearchInput } from '@/components/shared/search-input';
import { EmptyState } from '@/components/shared/empty-state';
import { LoadingState } from '@/components/shared/loading-state';
import { Trash2, Eye } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';

export default function CommunityPostsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['community-posts', id, search],
    queryFn: () =>
      api.get(`/communities/${id}/posts`, { params: { search } }).then((r) => r.data.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (postId: string) => api.delete(`/communities/${id}/posts/${postId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['community-posts', id] }),
  });

  const items = data?.items || data || [];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Post Management</h1>

      <div className="mb-6">
        <SearchInput
          placeholder="Cari postingan..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onClear={() => setSearch('')}
          className="sm:w-80"
        />
      </div>

      {isLoading ? (
        <LoadingState rows={8} />
      ) : items.length > 0 ? (
        <div className="space-y-3">
          {items.map((post: any) => (
            <div key={post.id} className="card flex items-start justify-between">
              <div className="min-w-0 flex-1">
                <div className="mb-2 flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-xs font-bold text-gray-600">
                    {post.author?.firstName?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {post.author?.firstName} {post.author?.lastName}
                    </p>
                    <p className="text-xs text-gray-400">{formatDate(post.createdAt)}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 line-clamp-3 whitespace-pre-line">
                  {post.content}
                </p>
              </div>
              <div className="ml-4 flex items-center gap-2">
                <button
                  onClick={() => deleteMutation.mutate(post.id)}
                  className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState title="Belum ada postingan" />
      )}
    </div>
  );
}
