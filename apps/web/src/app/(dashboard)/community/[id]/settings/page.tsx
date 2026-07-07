'use client';

import { use } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '@/lib/api';
import { useState } from 'react';
import { Settings } from 'lucide-react';

const settingsSchema = z.object({
  name: z.string().min(2, 'Nama harus minimal 2 karakter'),
  description: z.string().optional(),
  location: z.string().optional(),
  website: z.string().url('URL tidak valid').optional().or(z.literal('')),
});

type SettingsForm = z.infer<typeof settingsSchema>;

export default function CommunitySettingsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [success, setSuccess] = useState(false);

  const { data: community } = useQuery({
    queryKey: ['community-admin', id],
    queryFn: () => api.get(`/communities/${id}`).then((r) => r.data.data),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SettingsForm>({
    resolver: zodResolver(settingsSchema),
    values: {
      name: community?.name || '',
      description: community?.description || '',
      location: community?.location || '',
      website: community?.website || '',
    },
  });

  const mutation = useMutation({
    mutationFn: (data: SettingsForm) => api.patch(`/communities/${id}`, data),
    onSuccess: () => {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    },
  });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Community Settings</h1>

      <div className="mx-auto max-w-2xl">
        <div className="card">
          {success && (
            <div className="mb-4 rounded-lg bg-teal/10 p-3 text-sm text-teal">
              Pengaturan berhasil disimpan!
            </div>
          )}

          <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Nama Komunitas
              </label>
              <input {...register('name')} className="input-field" />
              {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Deskripsi</label>
              <textarea {...register('description')} rows={4} className="input-field resize-none" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Lokasi</label>
                <input {...register('location')} className="input-field" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Website</label>
                <input {...register('website')} className="input-field" placeholder="https://" />
                {errors.website && (
                  <p className="mt-1 text-xs text-red-500">{errors.website.message}</p>
                )}
              </div>
            </div>

            <button type="submit" disabled={mutation.isPending} className="btn-primary">
              <Settings className="mr-2 h-4 w-4" />
              {mutation.isPending ? 'Menyimpan...' : 'Simpan Pengaturan'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
