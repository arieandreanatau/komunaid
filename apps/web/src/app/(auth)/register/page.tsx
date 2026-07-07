'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/components/providers/auth-provider';
import { UserPlus, Eye, EyeOff } from 'lucide-react';

const registerSchema = z
  .object({
    firstName: z.string().min(2, 'Nama depan harus minimal 2 karakter'),
    lastName: z.string().min(2, 'Nama belakang harus minimal 2 karakter'),
    email: z.string().email('Email tidak valid'),
    username: z
      .string()
      .min(3, 'Username harus minimal 3 karakter')
      .regex(/^[a-zA-Z0-9_]+$/, 'Username hanya boleh huruf, angka, dan underscore'),
    password: z.string().min(8, 'Password harus minimal 8 karakter'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Password tidak cocok',
    path: ['confirmPassword'],
  });

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { register: registerUser } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    try {
      setError('');
      const { confirmPassword, ...submitData } = data;
      await registerUser(submitData);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Gagal mendaftar. Silakan coba lagi.');
    }
  };

  return (
    <div className="card">
      <div className="mb-8 text-center">
        <Link href="/" className="text-2xl font-extrabold text-navy">
          KomunaID
        </Link>
        <h1 className="mt-4 text-xl font-bold text-gray-900">Buat Akun Baru</h1>
        <p className="mt-1 text-sm text-gray-500">Bergabunglah dengan komunitas di KomunaID</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Nama Depan</label>
            <input {...register('firstName')} className="input-field" placeholder="John" />
            {errors.firstName && (
              <p className="mt-1 text-xs text-red-500">{errors.firstName.message}</p>
            )}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Nama Belakang</label>
            <input {...register('lastName')} className="input-field" placeholder="Doe" />
            {errors.lastName && (
              <p className="mt-1 text-xs text-red-500">{errors.lastName.message}</p>
            )}
          </div>
        </div>

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

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Username</label>
          <input {...register('username')} className="input-field" placeholder="johndoe" />
          {errors.username && (
            <p className="mt-1 text-xs text-red-500">{errors.username.message}</p>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Password</label>
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
            placeholder="Ulangi password"
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-xs text-red-500">{errors.confirmPassword.message}</p>
          )}
        </div>

        <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
          <UserPlus className="mr-2 h-4 w-4" />
          {isSubmitting ? 'Mendaftar...' : 'Daftar'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Sudah punya akun?{' '}
        <Link href="/login" className="font-medium text-royal hover:underline">
          Masuk
        </Link>
      </p>
    </div>
  );
}
