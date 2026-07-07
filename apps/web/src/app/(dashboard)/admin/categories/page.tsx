'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '@/lib/api';
import { LoadingState } from '@/components/shared/loading-state';
import { EmptyState } from '@/components/shared/empty-state';
import { Plus, Pencil, Trash2, X } from 'lucide-react';

const categorySchema = z.object({
  name: z.string().min(2, 'Nama harus minimal 2 karakter'),
  slug: z.string().min(2, 'Slug harus minimal 2 karakter'),
  description: z.string().optional(),
});

type CategoryForm = z.infer<typeof categorySchema>;

export default function AdminCategoriesPage() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: () => api.get('/admin/categories').then((r) => r.data.data),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<CategoryForm>({
    resolver: zodResolver(categorySchema),
  });

  const createMutation = useMutation({
    mutationFn: (data: CategoryForm) => api.post('/admin/categories', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      setShowForm(false);
      reset();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/categories/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-categories'] }),
  });

  const items = data?.items || data || [];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Category Management</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary !py-2 !px-4 text-sm">
          <Plus className="mr-1 h-4 w-4" /> Add Category
        </button>
      </div>

      {showForm && (
        <div className="mb-6 card">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Tambah Kategori Baru</h2>
            <button
              onClick={() => {
                setShowForm(false);
                reset();
              }}
            >
              <X className="h-5 w-5 text-gray-400" />
            </button>
          </div>
          <form
            onSubmit={handleSubmit((data) => createMutation.mutate(data))}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Nama</label>
                <input {...register('name')} className="input-field" placeholder="Technology" />
                {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Slug</label>
                <input {...register('slug')} className="input-field" placeholder="technology" />
                {errors.slug && <p className="mt-1 text-xs text-red-500">{errors.slug.message}</p>}
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Deskripsi</label>
              <input {...register('description')} className="input-field" placeholder="Opsional" />
            </div>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="btn-primary text-sm"
            >
              {createMutation.isPending ? 'Menyimpan...' : 'Simpan'}
            </button>
          </form>
        </div>
      )}

      {isLoading ? (
        <LoadingState rows={6} />
      ) : items.length > 0 ? (
        <div className="card overflow-hidden !p-0">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left font-medium text-gray-500">Nama</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500">Slug</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500">Deskripsi</th>
                <th className="px-6 py-3 text-right font-medium text-gray-500">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((cat: any) => (
                <tr key={cat.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{cat.name}</td>
                  <td className="px-6 py-4 text-gray-500">{cat.slug}</td>
                  <td className="px-6 py-4 text-gray-500">{cat.description || '-'}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => deleteMutation.mutate(cat.id)}
                      className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState title="Tidak ada kategori" />
      )}
    </div>
  );
}
