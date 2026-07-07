'use client';

import { use, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { SearchInput } from '@/components/shared/search-input';
import { EventCard } from '@/components/shared/event-card';
import { GridSkeleton } from '@/components/shared/loading-state';
import { EmptyState } from '@/components/shared/empty-state';
import { Plus } from 'lucide-react';
import Link from 'next/link';

export default function CommunityEventsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['community-events', id, search],
    queryFn: () =>
      api.get(`/communities/${id}/events`, { params: { search } }).then((r) => r.data.data),
  });

  const items = data?.items || data || [];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Event Management</h1>
      </div>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row">
        <SearchInput
          placeholder="Cari event..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onClear={() => setSearch('')}
          className="sm:w-80"
        />
      </div>

      {isLoading ? (
        <GridSkeleton count={3} />
      ) : items.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((e: any) => (
            <EventCard
              key={e.id}
              slug={e.slug}
              title={e.title}
              description={e.description || ''}
              banner={e.banner}
              date={e.startDate || e.date}
              location={e.location || 'Online'}
              category={e.category?.name}
              attendeeCount={e.attendeeCount || 0}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="Belum ada event"
          description="Buat event pertama untuk komunitas Anda."
        />
      )}
    </div>
  );
}
