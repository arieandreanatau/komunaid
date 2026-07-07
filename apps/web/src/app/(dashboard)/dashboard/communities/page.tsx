'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { CommunityCard } from '@/components/shared/community-card';
import { GridSkeleton } from '@/components/shared/loading-state';
import { EmptyState } from '@/components/shared/empty-state';
import Link from 'next/link';

export default function MyCommunitiesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['my-communities'],
    queryFn: () => api.get('/users/me/communities').then((r) => r.data.data),
  });

  const items = data?.items || data || [];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Komunitas Saya</h1>
        <p className="text-gray-500">Komunitas yang Anda ikuti</p>
      </div>

      {isLoading ? (
        <GridSkeleton count={6} />
      ) : items.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((c: any) => (
            <CommunityCard
              key={c.id}
              slug={c.slug}
              name={c.name}
              description={c.description || ''}
              logo={c.logo}
              memberCount={c.memberCount || 0}
              category={c.category?.name}
              location={c.location}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="Belum ada komunitas"
          description="Anda belum bergabung dengan komunitas manapun."
          action={
            <Link href="/communities" className="btn-primary">
              Jelajahi Komunitas
            </Link>
          }
        />
      )}
    </div>
  );
}
