'use client';

import { use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/components/providers/auth-provider';
import api from '@/lib/api';
import { Users, MapPin, Globe, ArrowLeft, UserPlus } from 'lucide-react';
import { formatDate, formatNumber } from '@/lib/utils';
import { LoadingState } from '@/components/shared/loading-state';
import { EmptyState } from '@/components/shared/empty-state';

export default function CommunityDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const {
    data: community,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['community', slug],
    queryFn: () => api.get(`/communities/${slug}`).then((r) => r.data.data),
  });

  const joinMutation = useMutation({
    mutationFn: () => api.post(`/communities/${community.id}/join`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['community', slug] }),
  });

  if (isLoading)
    return (
      <div className="container-komuna py-10">
        <LoadingState rows={8} />
      </div>
    );
  if (error || !community)
    return (
      <div className="container-komuna py-10">
        <EmptyState title="Komunitas tidak ditemukan" />
      </div>
    );

  const members = community.members || [];
  const posts = community.posts || [];

  return (
    <div>
      {/* Banner */}
      <div className="relative h-48 bg-gradient-to-r from-navy to-royal sm:h-64">
        {community.banner && (
          <Image src={community.banner} alt={community.name} fill className="object-cover" />
        )}
      </div>

      <div className="container-komuna">
        {/* Header */}
        <div className="-mt-12 flex flex-col gap-6 sm:flex-row sm:items-end">
          <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-2xl border-4 border-white bg-white shadow-md sm:h-32 sm:w-32">
            {community.logo ? (
              <Image
                src={community.logo}
                alt={community.name}
                width={128}
                height={128}
                className="h-full w-full rounded-2xl object-cover"
              />
            ) : (
              <span className="text-3xl font-bold text-royal">{community.name.charAt(0)}</span>
            )}
          </div>
          <div className="flex-1 pb-2">
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">{community.name}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-500">
              <span className="inline-flex items-center gap-1">
                <Users className="h-4 w-4" />
                {formatNumber(community.memberCount || members.length)} anggota
              </span>
              {community.category && (
                <span className="rounded-full bg-teal/10 px-2.5 py-0.5 text-xs font-medium text-teal">
                  {community.category.name}
                </span>
              )}
              {community.location && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {community.location}
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-3 pb-2">
            <Link href="/communities" className="btn-secondary !py-2 !px-4 text-sm">
              <ArrowLeft className="mr-1 h-4 w-4" /> Kembali
            </Link>
            {isAuthenticated && (
              <button
                onClick={() => joinMutation.mutate()}
                disabled={joinMutation.isPending || community.isMember}
                className="btn-primary !py-2 !px-4 text-sm"
              >
                <UserPlus className="mr-1 h-4 w-4" />
                {community.isMember
                  ? 'Sudah Bergabung'
                  : joinMutation.isPending
                    ? 'Bergabung...'
                    : 'Gabung'}
              </button>
            )}
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h2 className="mb-3 text-lg font-semibold text-gray-900">Tentang</h2>
              <p className="text-sm leading-relaxed text-gray-600 whitespace-pre-line">
                {community.description || 'Belum ada deskripsi.'}
              </p>
            </div>

            <div>
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Postingan</h2>
              {posts.length > 0 ? (
                <div className="space-y-4">
                  {posts.map((post: any) => (
                    <div key={post.id} className="card">
                      <div className="mb-2 flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-xs font-bold text-gray-600">
                          {post.author?.firstName?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-900">
                            {post.author?.firstName} {post.author?.lastName}
                          </span>
                          <span className="ml-2 text-xs text-gray-400">
                            {formatDate(post.createdAt)}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 whitespace-pre-line">{post.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="Belum ada postingan"
                  description="Postingan akan muncul di sini."
                />
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="card">
              <h3 className="mb-4 text-sm font-semibold text-gray-900">Informasi</h3>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-500">Lokasi</dt>
                  <dd className="font-medium text-gray-900">{community.location || '-'}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Website</dt>
                  <dd>
                    {community.website ? (
                      <a
                        href={community.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-royal hover:underline"
                      >
                        <Globe className="mr-1 inline h-3.5 w-3.5" />
                        Link
                      </a>
                    ) : (
                      <span className="font-medium text-gray-900">-</span>
                    )}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Dibuat</dt>
                  <dd className="font-medium text-gray-900">{formatDate(community.createdAt)}</dd>
                </div>
              </dl>
            </div>

            <div className="card">
              <h3 className="mb-4 text-sm font-semibold text-gray-900">
                Anggota ({members.length})
              </h3>
              <div className="flex -space-x-2">
                {members.slice(0, 10).map((m: any) => (
                  <div
                    key={m.id}
                    className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-royal text-xs font-bold text-white"
                    title={m.user?.firstName}
                  >
                    {m.user?.firstName?.charAt(0) || 'U'}
                  </div>
                ))}
                {members.length > 10 && (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-gray-200 text-xs font-medium text-gray-600">
                    +{members.length - 10}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
