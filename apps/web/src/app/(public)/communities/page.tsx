'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { SearchInput } from '@/components/shared/search-input';
import { CommunityCard } from '@/components/shared/community-card';
import { PaginationBar } from '@/components/shared/pagination-bar';
import { EmptyState } from '@/components/shared/empty-state';
import { GridSkeleton } from '@/components/shared/loading-state';

export default function CommunitiesPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['communities', search, page, category],
    queryFn: () =>
      api
        .get('/communities', {
          params: { search, page, limit: 12, category: category || undefined },
        })
        .then((r) => r.data.data),
  });

  const items = data?.items || data || [];
  const totalPages = data?.totalPages || 1;

  return (
    <div className="container-komuna py-10">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">Communities</h1>
        <p className="text-gray-500">
          Temukan dan bergabung dengan komunitas yang sesuai minat Anda
        </p>
      </div>

      <div className="mb-8 flex flex-col gap-4 sm:flex-row">
        <SearchInput
          placeholder="Cari komunitas..."
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
          <option value="technology">Technology</option>
          <option value="design">Design</option>
          <option value="business">Business</option>
          <option value="education">Education</option>
          <option value="social">Social</option>
          <option value="environment">Environment</option>
          <option value="arts">Arts & Culture</option>
          <option value="sports">Sports</option>
        </select>
      </div>

      {isLoading ? (
        <GridSkeleton count={6} />
      ) : items.length > 0 ? (
        <>
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
          <PaginationBar
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
            className="mt-10"
          />
        </>
      ) : (
        <EmptyState
          title="Komunitas tidak ditemukan"
          description="Coba kata kunci atau filter yang berbeda."
        />
      )}
    </div>
  );
}
