'use client';

import { use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/components/providers/auth-provider';
import api from '@/lib/api';
import { Calendar, MapPin, Users, ArrowLeft, Clock, Tag } from 'lucide-react';
import { formatDate, formatNumber } from '@/lib/utils';
import { LoadingState } from '@/components/shared/loading-state';
import { EmptyState } from '@/components/shared/empty-state';

export default function EventDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const {
    data: event,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['event', slug],
    queryFn: () => api.get(`/events/${slug}`).then((r) => r.data.data),
  });

  const registerMutation = useMutation({
    mutationFn: () => api.post(`/events/${event.id}/register`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['event', slug] }),
  });

  if (isLoading)
    return (
      <div className="container-komuna py-10">
        <LoadingState rows={8} />
      </div>
    );
  if (error || !event)
    return (
      <div className="container-komuna py-10">
        <EmptyState title="Event tidak ditemukan" />
      </div>
    );

  return (
    <div>
      {/* Banner */}
      <div className="relative h-48 bg-gradient-to-r from-teal to-aqua sm:h-72">
        {event.banner && (
          <Image src={event.banner} alt={event.title} fill className="object-cover" />
        )}
      </div>

      <div className="container-komuna py-10">
        <Link
          href="/events"
          className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-royal hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> Kembali ke Events
        </Link>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              {event.category && (
                <span className="mb-3 inline-block rounded-full bg-teal/10 px-3 py-1 text-xs font-medium text-teal">
                  {event.category.name}
                </span>
              )}
              <h1 className="text-3xl font-bold text-gray-900">{event.title}</h1>
            </div>

            <div>
              <h2 className="mb-3 text-lg font-semibold text-gray-900">Deskripsi</h2>
              <div className="prose prose-sm max-w-none text-gray-600 whitespace-pre-line">
                {event.description || 'Belum ada deskripsi.'}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="card">
              <h3 className="mb-4 text-sm font-semibold text-gray-900">Detail Event</h3>
              <dl className="space-y-4 text-sm">
                <div className="flex items-start gap-3">
                  <Calendar className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400" />
                  <div>
                    <dt className="font-medium text-gray-900">Tanggal</dt>
                    <dd className="text-gray-500">{formatDate(event.startDate || event.date)}</dd>
                  </div>
                </div>
                {event.endDate && (
                  <div className="flex items-start gap-3">
                    <Clock className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400" />
                    <div>
                      <dt className="font-medium text-gray-900">Selesai</dt>
                      <dd className="text-gray-500">{formatDate(event.endDate)}</dd>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400" />
                  <div>
                    <dt className="font-medium text-gray-900">Lokasi</dt>
                    <dd className="text-gray-500">{event.location || 'Online'}</dd>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Users className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400" />
                  <div>
                    <dt className="font-medium text-gray-900">Kapasitas</dt>
                    <dd className="text-gray-500">
                      {event.capacity ? `${event.capacity} peserta` : 'Tidak terbatas'}
                    </dd>
                  </div>
                </div>
                {event.category && (
                  <div className="flex items-start gap-3">
                    <Tag className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400" />
                    <div>
                      <dt className="font-medium text-gray-900">Kategori</dt>
                      <dd className="text-gray-500">{event.category.name}</dd>
                    </div>
                  </div>
                )}
              </dl>

              {isAuthenticated && (
                <div className="mt-6">
                  <button
                    onClick={() => registerMutation.mutate()}
                    disabled={registerMutation.isPending || event.isRegistered}
                    className="btn-primary w-full"
                  >
                    {event.isRegistered
                      ? 'Sudah Terdaftar'
                      : registerMutation.isPending
                        ? 'Mendaftar...'
                        : 'Daftar Sekarang'}
                  </button>
                </div>
              )}
            </div>

            {event.organizer && (
              <div className="card">
                <h3 className="mb-4 text-sm font-semibold text-gray-900">Penyelenggara</h3>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-royal text-sm font-bold text-white">
                    {event.organizer.name?.charAt(0) || 'O'}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{event.organizer.name}</p>
                    {event.organizer.type && (
                      <p className="text-xs text-gray-400">{event.organizer.type}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
