'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '@/lib/api';
import { Settings } from 'lucide-react';

const settingsSchema = z.object({
  siteName: z.string().min(1, 'Nama situs wajib diisi'),
  siteDescription: z.string().optional(),
  supportEmail: z.string().email('Email tidak valid'),
  maintenanceMode: z.boolean(),
});

type SettingsForm = z.infer<typeof settingsSchema>;

export default function AdminSettingsPage() {
  const queryClient = useQueryClient();
  const [success, setSuccess] = useState(false);

  const { data: settings } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: () => api.get('/admin/settings').then((r) => r.data.data),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SettingsForm>({
    resolver: zodResolver(settingsSchema),
    values: {
      siteName: settings?.siteName || 'KomunaID',
      siteDescription: settings?.siteDescription || '',
      supportEmail: settings?.supportEmail || 'support@komunaid.com',
      maintenanceMode: settings?.maintenanceMode || false,
    },
  });

  const mutation = useMutation({
    mutationFn: (data: SettingsForm) => api.patch('/admin/settings', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    },
  });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Platform Settings</h1>

      <div className="mx-auto max-w-2xl">
        <div className="card">
          {success && (
            <div className="mb-4 rounded-lg bg-teal/10 p-3 text-sm text-teal">
              Pengaturan berhasil disimpan!
            </div>
          )}

          <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Nama Situs</label>
              <input {...register('siteName')} className="input-field" />
              {errors.siteName && (
                <p className="mt-1 text-xs text-red-500">{errors.siteName.message}</p>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Deskripsi Situs
              </label>
              <textarea
                {...register('siteDescription')}
                rows={3}
                className="input-field resize-none"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Email Support
              </label>
              <input {...register('supportEmail')} type="email" className="input-field" />
              {errors.supportEmail && (
                <p className="mt-1 text-xs text-red-500">{errors.supportEmail.message}</p>
              )}
            </div>

            <div className="flex items-center gap-3">
              <input
                {...register('maintenanceMode')}
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-royal focus:ring-royal"
              />
              <label className="text-sm font-medium text-gray-700">Maintenance Mode</label>
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
