'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { SearchInput } from '@/components/shared/search-input';
import { EventCard } from '@/components/shared/event-card';
import { PaginationBar } from '@/components/shared/pagination-bar';
import { EmptyState } from '@/components/shared/empty-state';
import { GridSkeleton } from '@/components/shared/loading-state';

export default function EventsPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['events', search, page, category, dateFilter],
    queryFn: () =>
      api
        .get('/events', {
          params: {
            search,
            page,
            limit: 12,
            category: category || undefined,
            dateFilter: dateFilter || undefined,
          },
        })
        .then((r) => r.data.data),
  });

  const items = data?.items || data || [];
  const totalPages = data?.totalPages || 1;

  return (
    <div className="container-komuna py-10">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">Events</h1>
        <p className="text-gray-500">Temukan event menarik dari komunitas di seluruh Indonesia</p>
      </div>

      <div className="mb-8 flex flex-col gap-4 sm:flex-row">
        <SearchInput
          placeholder="Cari event..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          onClear={() => {
            setSearch('');
            setPage(1);
          }}
          className="sm:w-80"
        />
        <select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setPage(1);
          }}
          className="input-field w-auto"
        >
          <option value="">Semua Kategori</option>
          <option value="workshop">Workshop</option>
          <option value="seminar">Seminar</option>
          <option value="meetup">Meetup</option>
          <option value="conference">Conference</option>
          <option value="hackathon">Hackathon</option>
          <option value="networking">Networking</option>
        </select>
        <select
          value={dateFilter}
          onChange={(e) => {
            setDateFilter(e.target.value);
            setPage(1);
          }}
          className="input-field w-auto"
        >
          <option value="">Semua Waktu</option>
          <option value="today">Hari Ini</option>
          <option value="week">Minggu Ini</option>
          <option value="month">Bulan Ini</option>
          <option value="upcoming">Mendatang</option>
        </select>
      </div>

      {isLoading ? (
        <GridSkeleton count={6} />
      ) : items.length > 0 ? (
        <>
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
          <PaginationBar
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
            className="mt-10"
          />
        </>
      ) : (
        <EmptyState
          title="Event tidak ditemukan"
          description="Coba kata kunci atau filter yang berbeda."
        />
      )}
    </div>
  );
}
