'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import { Mail, CheckCircle } from 'lucide-react';

const forgotPasswordSchema = z.object({
  email: z.string().email('Email tidak valid'),
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const mutation = useMutation({
    mutationFn: (data: ForgotPasswordForm) => api.post('/auth/forgot-password', data),
    onSuccess: () => setSubmitted(true),
  });

  return (
    <div className="card">
      <div className="mb-8 text-center">
        <Link href="/" className="text-2xl font-extrabold text-navy">
          KomunaID
        </Link>
        <h1 className="mt-4 text-xl font-bold text-gray-900">Lupa Password</h1>
        <p className="mt-1 text-sm text-gray-500">Masukkan email Anda untuk reset password</p>
      </div>

      {submitted ? (
        <div className="text-center">
          <CheckCircle className="mx-auto mb-4 h-16 w-16 text-teal" />
          <h2 className="mb-2 text-lg font-semibold text-gray-900">Email Terkirim!</h2>
          <p className="mb-6 text-sm text-gray-500">
            Kami telah mengirimkan link reset password ke email Anda. Silakan cek inbox Anda.
          </p>
          <Link href="/login" className="btn-primary">
            Kembali ke Login
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Email</label>
            <input
              {...register('email')}
              type="email"
              className="input-field"
              placeholder="email@contoh.com"
            />
            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
          </div>

          <button type="submit" disabled={mutation.isPending} className="btn-primary w-full">
            <Mail className="mr-2 h-4 w-4" />
            {mutation.isPending ? 'Mengirim...' : 'Kirim Link Reset'}
          </button>

          {mutation.isError && (
            <p className="text-center text-sm text-red-500">
              Gagal mengirim email. Silakan coba lagi.
            </p>
          )}
        </form>
      )}

      <p className="mt-6 text-center text-sm text-gray-500">
        Ingat password?{' '}
        <Link href="/login" className="font-medium text-royal hover:underline">
          Masuk
        </Link>
      </p>
    </div>
  );
}
