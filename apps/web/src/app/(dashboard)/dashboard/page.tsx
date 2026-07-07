'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/components/providers/auth-provider';
import api from '@/lib/api';
import { Users, Calendar, MessageSquare, TrendingUp } from 'lucide-react';
import { CommunityCard } from '@/components/shared/community-card';
import { EventCard } from '@/components/shared/event-card';
import { GridSkeleton } from '@/components/shared/loading-state';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useAuth();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => api.get('/users/me/stats').then((r) => r.data.data),
  });

  const { data: communities, isLoading: communitiesLoading } = useQuery({
    queryKey: ['my-communities-preview'],
    queryFn: () => api.get('/users/me/communities?limit=3').then((r) => r.data.data),
  });

  const { data: events, isLoading: eventsLoading } = useQuery({
    queryKey: ['my-events-preview'],
    queryFn: () => api.get('/users/me/events?limit=3').then((r) => r.data.data),
  });

  const communityItems = communities?.items || communities || [];
  const eventItems = events?.items || events || [];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Selamat datang, {user?.firstName}!</h1>
        <p className="text-gray-500">Berikut ringkasan aktivitas Anda di KomunaID</p>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: 'Komunitas',
            value: stats?.communityCount || 0,
            icon: Users,
            color: 'text-royal bg-royal/10',
          },
          {
            label: 'Events',
            value: stats?.eventCount || 0,
            icon: Calendar,
            color: 'text-teal bg-teal/10',
          },
          {
            label: 'Postingan',
            value: stats?.postCount || 0,
            icon: MessageSquare,
            color: 'text-aqua bg-aqua/10',
          },
          {
            label: 'Koneksi',
            value: stats?.connectionCount || 0,
            icon: TrendingUp,
            color: 'text-navy bg-navy/10',
          },
        ].map((stat) => (
          <div key={stat.label} className="card flex items-center gap-4">
            <div
              className={cn('flex h-12 w-12 items-center justify-center rounded-xl', stat.color)}
            >
              <stat.icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* My Communities */}
      <section className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Komunitas Saya</h2>
          <Link
            href="/dashboard/communities"
            className="text-sm font-medium text-royal hover:underline"
          >
            Lihat Semua
          </Link>
        </div>
        {communitiesLoading ? (
          <GridSkeleton count={3} />
        ) : communityItems.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {communityItems.map((c: any) => (
              <CommunityCard
                key={c.id}
                slug={c.slug}
                name={c.name}
                description={c.description || ''}
                logo={c.logo}
                memberCount={c.memberCount || 0}
                category={c.category?.name}
              />
            ))}
          </div>
        ) : (
          <div className="card text-center text-sm text-gray-500">
            Anda belum bergabung dengan komunitas manapun.{' '}
            <Link href="/communities" className="text-royal hover:underline">
              Jelajahi komunitas
            </Link>
          </div>
        )}
      </section>

      {/* Upcoming Events */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Event Mendatang</h2>
          <Link href="/dashboard/events" className="text-sm font-medium text-royal hover:underline">
            Lihat Semua
          </Link>
        </div>
        {eventsLoading ? (
          <GridSkeleton count={3} />
        ) : eventItems.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {eventItems.map((e: any) => (
              <EventCard
                key={e.id}
                slug={e.slug}
                title={e.title}
                description={e.description || ''}
                banner={e.banner}
                date={e.startDate || e.date}
                location={e.location || 'Online'}
                category={e.category?.name}
              />
            ))}
          </div>
        ) : (
          <div className="card text-center text-sm text-gray-500">
            Belum ada event mendatang.{' '}
            <Link href="/events" className="text-royal hover:underline">
              Jelajahi event
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
