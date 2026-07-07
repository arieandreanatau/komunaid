'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Bell, MessageSquare, Users, Calendar, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/utils';
import { EmptyState } from '@/components/shared/empty-state';
import { LoadingState } from '@/components/shared/loading-state';

const iconMap: Record<string, any> = {
  community: Users,
  event: Calendar,
  message: MessageSquare,
  info: Info,
};

const colorMap: Record<string, string> = {
  community: 'text-royal bg-royal/10',
  event: 'text-teal bg-teal/10',
  message: 'text-aqua bg-aqua/10',
  info: 'text-gray-500 bg-gray-100',
};

export default function NotificationsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.get('/users/me/notifications').then((r) => r.data.data),
  });

  const items = data?.items || data || [];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Notifikasi</h1>
        <p className="text-gray-500">Notifikasi terbaru untuk Anda</p>
      </div>

      {isLoading ? (
        <LoadingState rows={5} />
      ) : items.length > 0 ? (
        <div className="space-y-3">
          {items.map((n: any) => {
            const Icon = iconMap[n.type] || Bell;
            const color = colorMap[n.type] || colorMap.info;
            return (
              <div
                key={n.id}
                className={cn(
                  'card flex items-start gap-4',
                  !n.read && 'border-l-4 border-l-royal',
                )}
              >
                <div
                  className={cn(
                    'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl',
                    color,
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{n.title}</p>
                  <p className="mt-0.5 text-sm text-gray-500">{n.message}</p>
                  <p className="mt-1 text-xs text-gray-400">{formatDate(n.createdAt)}</p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={<Bell className="h-16 w-16" />}
          title="Tidak ada notifikasi"
          description="Anda belum memiliki notifikasi baru."
        />
      )}
    </div>
  );
}
