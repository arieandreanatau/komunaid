'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { PaginationBar } from '@/components/shared/pagination-bar';
import { LoadingState } from '@/components/shared/loading-state';
import { EmptyState } from '@/components/shared/empty-state';
import { formatDate } from '@/lib/utils';

export default function AdminAuditLogPage() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-audit-log', page],
    queryFn: () =>
      api.get('/admin/audit-log', { params: { page, limit: 30 } }).then((r) => r.data.data),
  });

  const items = data?.items || data || [];
  const totalPages = data?.totalPages || 1;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Audit Log</h1>

      {isLoading ? (
        <LoadingState rows={10} />
      ) : items.length > 0 ? (
        <>
          <div className="card overflow-hidden !p-0">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left font-medium text-gray-500">Waktu</th>
                  <th className="px-6 py-3 text-left font-medium text-gray-500">User</th>
                  <th className="px-6 py-3 text-left font-medium text-gray-500">Aksi</th>
                  <th className="px-6 py-3 text-left font-medium text-gray-500">Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((log: any) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-500">{formatDate(log.createdAt)}</td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-gray-900">
                        {log.user?.firstName} {log.user?.lastName}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 max-w-xs truncate">
                      {log.detail || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <PaginationBar
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
            className="mt-6"
          />
        </>
      ) : (
        <EmptyState title="Tidak ada audit log" />
      )}
    </div>
  );
}
