'use client';

import { useState } from 'react';
import { useAuth } from '@/components/providers/auth-provider';
import { useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Settings, Trash2, Lock } from 'lucide-react';

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Password saat ini wajib diisi'),
    newPassword: z.string().min(8, 'Password baru harus minimal 8 karakter'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Password tidak cocok',
    path: ['confirmPassword'],
  });

type PasswordForm = z.infer<typeof passwordSchema>;

export default function SettingsPage() {
  const { logout } = useAuth();
  const [pwSuccess, setPwSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  });

  const passwordMutation = useMutation({
    mutationFn: (data: PasswordForm) =>
      api.post('/auth/change-password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      }),
    onSuccess: () => {
      setPwSuccess(true);
      reset();
      setTimeout(() => setPwSuccess(false), 3000);
    },
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500">Kelola pengaturan akun Anda</p>
      </div>

      <div className="mx-auto max-w-2xl space-y-8">
        {/* Change Password */}
        <div className="card">
          <div className="mb-4 flex items-center gap-2">
            <Lock className="h-5 w-5 text-royal" />
            <h2 className="text-lg font-semibold text-gray-900">Ubah Password</h2>
          </div>

          {pwSuccess && (
            <div className="mb-4 rounded-lg bg-teal/10 p-3 text-sm text-teal">
              Password berhasil diubah!
            </div>
          )}

          <form
            onSubmit={handleSubmit((data) => passwordMutation.mutate(data))}
            className="space-y-4"
          >
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Password Saat Ini
              </label>
              <input {...register('currentPassword')} type="password" className="input-field" />
              {errors.currentPassword && (
                <p className="mt-1 text-xs text-red-500">{errors.currentPassword.message}</p>
              )}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Password Baru
              </label>
              <input {...register('newPassword')} type="password" className="input-field" />
              {errors.newPassword && (
                <p className="mt-1 text-xs text-red-500">{errors.newPassword.message}</p>
              )}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Konfirmasi Password Baru
              </label>
              <input {...register('confirmPassword')} type="password" className="input-field" />
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-red-500">{errors.confirmPassword.message}</p>
              )}
            </div>
            <button type="submit" disabled={passwordMutation.isPending} className="btn-primary">
              {passwordMutation.isPending ? 'Menyimpan...' : 'Ubah Password'}
            </button>
          </form>
        </div>

        {/* Delete Account */}
        <div className="card border-red-200">
          <div className="mb-4 flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-red-500" />
            <h2 className="text-lg font-semibold text-red-600">Hapus Akun</h2>
          </div>
          <p className="mb-4 text-sm text-gray-500">
            Menghapus akun bersifat permanen dan tidak dapat dibatalkan. Semua data Anda akan
            dihapus.
          </p>
          <button className="inline-flex items-center justify-center rounded-lg border border-red-300 bg-white px-6 py-3 text-sm font-semibold text-red-600 transition-all hover:bg-red-50">
            <Trash2 className="mr-2 h-4 w-4" />
            Hapus Akun
          </button>
        </div>
      </div>
    </div>
  );
}
