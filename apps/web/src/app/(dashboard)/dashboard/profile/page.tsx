'use client';

import { useState } from 'react';
import { useAuth } from '@/components/providers/auth-provider';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import { User } from 'lucide-react';

const profileSchema = z.object({
  firstName: z.string().min(2, 'Nama depan harus minimal 2 karakter'),
  lastName: z.string().min(2, 'Nama belakang harus minimal 2 karakter'),
  username: z.string().min(3, 'Username harus minimal 3 karakter'),
  bio: z.string().max(500, 'Bio maksimal 500 karakter').optional(),
  location: z.string().optional(),
  website: z.string().url('URL tidak valid').optional().or(z.literal('')),
});

type ProfileForm = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { user } = useAuth();
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      username: user?.username || '',
      bio: '',
      location: '',
      website: '',
    },
  });

  const mutation = useMutation({
    mutationFn: (data: ProfileForm) => api.patch('/users/me', data),
    onSuccess: () => {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    },
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Edit Profile</h1>
        <p className="text-gray-500">Perbarui informasi profil Anda</p>
      </div>

      <div className="mx-auto max-w-2xl">
        <div className="card">
          <div className="mb-6 flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-royal text-xl font-bold text-white">
              {user?.firstName?.charAt(0)}
            </div>
            <div>
              <p className="font-semibold text-gray-900">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-sm text-gray-400">@{user?.username}</p>
            </div>
          </div>

          {success && (
            <div className="mb-4 rounded-lg bg-teal/10 p-3 text-sm text-teal">
              Profil berhasil diperbarui!
            </div>
          )}

          <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Nama Depan</label>
                <input {...register('firstName')} className="input-field" />
                {errors.firstName && (
                  <p className="mt-1 text-xs text-red-500">{errors.firstName.message}</p>
                )}
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Nama Belakang
                </label>
                <input {...register('lastName')} className="input-field" />
                {errors.lastName && (
                  <p className="mt-1 text-xs text-red-500">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Username</label>
              <input {...register('username')} className="input-field" />
              {errors.username && (
                <p className="mt-1 text-xs text-red-500">{errors.username.message}</p>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Bio</label>
              <textarea
                {...register('bio')}
                rows={4}
                className="input-field resize-none"
                placeholder="Ceritakan tentang diri Anda..."
              />
              {errors.bio && <p className="mt-1 text-xs text-red-500">{errors.bio.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Lokasi</label>
                <input
                  {...register('location')}
                  className="input-field"
                  placeholder="Jakarta, Indonesia"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Website</label>
                <input
                  {...register('website')}
                  className="input-field"
                  placeholder="https://contoh.com"
                />
                {errors.website && (
                  <p className="mt-1 text-xs text-red-500">{errors.website.message}</p>
                )}
              </div>
            </div>

            <button type="submit" disabled={isSubmitting} className="btn-primary">
              <User className="mr-2 h-4 w-4" />
              {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
