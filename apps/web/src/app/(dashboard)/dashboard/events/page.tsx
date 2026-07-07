'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { EventCard } from '@/components/shared/event-card';
import { GridSkeleton } from '@/components/shared/loading-state';
import { EmptyState } from '@/components/shared/empty-state';
import Link from 'next/link';

export default function MyEventsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['my-events'],
    queryFn: () => api.get('/users/me/events').then((r) => r.data.data),
  });

  const items = data?.items || data || [];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Event Saya</h1>
        <p className="text-gray-500">Event yang Anda ikuti</p>
      </div>

      {isLoading ? (
        <GridSkeleton count={6} />
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
          description="Anda belum terdaftar di event manapun."
          action={
            <Link href="/events" className="btn-primary">
              Jelajahi Event
            </Link>
          }
        />
      )}
    </div>
  );
}
