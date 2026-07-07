'use client';

import { use } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Users, Calendar, FileText, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LoadingState } from '@/components/shared/loading-state';

export default function CommunityAdminOverview({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const { data: stats, isLoading } = useQuery({
    queryKey: ['community-admin-stats', id],
    queryFn: () => api.get(`/communities/${id}/stats`).then((r) => r.data.data),
  });

  if (isLoading) return <LoadingState rows={6} />;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Community Overview</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: 'Members',
            value: stats?.memberCount || 0,
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
            label: 'Posts',
            value: stats?.postCount || 0,
            icon: FileText,
            color: 'text-aqua bg-aqua/10',
          },
          {
            label: 'Growth',
            value: `${stats?.growthRate || 0}%`,
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
    </div>
  );
}
