'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import { Lock, CheckCircle, Eye, EyeOff } from 'lucide-react';

const resetPasswordSchema = z
  .object({
    password: z.string().min(8, 'Password harus minimal 8 karakter'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Password tidak cocok',
    path: ['confirmPassword'],
  });

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const mutation = useMutation({
    mutationFn: (data: ResetPasswordForm) =>
      api.post('/auth/reset-password', { token, password: data.password }),
    onSuccess: () => setSuccess(true),
    onError: (err: any) => setError(err?.response?.data?.message || 'Gagal reset password'),
  });

  if (!token) {
    return (
      <div className="card text-center">
        <h2 className="mb-2 text-lg font-semibold text-gray-900">Token Tidak Valid</h2>
        <p className="mb-4 text-sm text-gray-500">
          Link reset password tidak valid atau sudah kedaluwarsa.
        </p>
        <Link href="/forgot-password" className="btn-primary">
          Minta Link Baru
        </Link>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="mb-8 text-center">
        <Link href="/" className="text-2xl font-extrabold text-navy">
          KomunaID
        </Link>
        <h1 className="mt-4 text-xl font-bold text-gray-900">Reset Password</h1>
        <p className="mt-1 text-sm text-gray-500">Masukkan password baru Anda</p>
      </div>

      {success ? (
        <div className="text-center">
          <CheckCircle className="mx-auto mb-4 h-16 w-16 text-teal" />
          <h2 className="mb-2 text-lg font-semibold text-gray-900">Password Berhasil Diubah!</h2>
          <p className="mb-6 text-sm text-gray-500">
            Password Anda telah berhasil diubah. Silakan masuk dengan password baru.
          </p>
          <Link href="/login" className="btn-primary">
            Masuk
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
          {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>}

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Password Baru</label>
            <div className="relative">
              <input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                className="input-field pr-10"
                placeholder="Minimal 8 karakter"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Konfirmasi Password
            </label>
            <input
              {...register('confirmPassword')}
              type="password"
              className="input-field"
              placeholder="Ulangi password baru"
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-xs text-red-500">{errors.confirmPassword.message}</p>
            )}
          </div>

          <button type="submit" disabled={mutation.isPending} className="btn-primary w-full">
            <Lock className="mr-2 h-4 w-4" />
            {mutation.isPending ? 'Mengubah...' : 'Ubah Password'}
          </button>
        </form>
      )}
    </div>
  );
}
