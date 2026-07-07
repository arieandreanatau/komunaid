'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Users, UsersRound, Calendar, Building2, TrendingUp, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LoadingState } from '@/components/shared/loading-state';

export default function AdminDashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => api.get('/admin/stats').then((r) => r.data.data),
  });

  if (isLoading) return <LoadingState rows={6} />;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Admin Dashboard</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          {
            label: 'Total Users',
            value: stats?.totalUsers || 0,
            icon: Users,
            color: 'text-royal bg-royal/10',
          },
          {
            label: 'Communities',
            value: stats?.totalCommunities || 0,
            icon: UsersRound,
            color: 'text-teal bg-teal/10',
          },
          {
            label: 'Events',
            value: stats?.totalEvents || 0,
            icon: Calendar,
            color: 'text-aqua bg-aqua/10',
          },
          {
            label: 'Organizations',
            value: stats?.totalOrganizations || 0,
            icon: Building2,
            color: 'text-navy bg-navy/10',
          },
          {
            label: 'Pending Approvals',
            value: stats?.pendingApprovals || 0,
            icon: AlertTriangle,
            color: 'text-yellow-600 bg-yellow-50',
          },
          {
            label: 'Reports',
            value: stats?.pendingReports || 0,
            icon: AlertTriangle,
            color: 'text-red-600 bg-red-50',
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
