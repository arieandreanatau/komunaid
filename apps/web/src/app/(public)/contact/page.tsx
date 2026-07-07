'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import { Mail, Send, CheckCircle } from 'lucide-react';

const contactSchema = z.object({
  name: z.string().min(2, 'Nama harus minimal 2 karakter'),
  email: z.string().email('Email tidak valid'),
  subject: z.string().min(3, 'Subjek harus minimal 3 karakter'),
  message: z.string().min(10, 'Pesan harus minimal 10 karakter'),
});

type ContactForm = z.infer<typeof contactSchema>;

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
  });

  const mutation = useMutation({
    mutationFn: (data: ContactForm) => api.post('/contact', data),
    onSuccess: () => {
      setSubmitted(true);
      reset();
    },
  });

  return (
    <div className="container-komuna py-16">
      <div className="mx-auto max-w-2xl">
        <div className="mb-10 text-center">
          <Mail className="mx-auto mb-4 h-12 w-12 text-royal" />
          <h1 className="mb-3 text-4xl font-bold text-gray-900">Hubungi Kami</h1>
          <p className="text-gray-500">Punya pertanyaan atau masukan? Kirim pesan kepada kami.</p>
        </div>

        {submitted ? (
          <div className="card text-center">
            <CheckCircle className="mx-auto mb-4 h-16 w-16 text-teal" />
            <h2 className="mb-2 text-xl font-semibold text-gray-900">Pesan Terkirim!</h2>
            <p className="text-sm text-gray-500">
              Terima kasih telah menghubungi kami. Kami akan merespon dalam 1x24 jam.
            </p>
            <button onClick={() => setSubmitted(false)} className="btn-primary mt-6">
              Kirim Pesan Lain
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="card space-y-5">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Nama</label>
              <input
                {...register('name')}
                className="input-field"
                placeholder="Nama lengkap Anda"
              />
              {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
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
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Subjek</label>
              <input {...register('subject')} className="input-field" placeholder="Subjek pesan" />
              {errors.subject && (
                <p className="mt-1 text-xs text-red-500">{errors.subject.message}</p>
              )}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Pesan</label>
              <textarea
                {...register('message')}
                rows={5}
                className="input-field resize-none"
                placeholder="Tulis pesan Anda di sini..."
              />
              {errors.message && (
                <p className="mt-1 text-xs text-red-500">{errors.message.message}</p>
              )}
            </div>
            <button type="submit" disabled={mutation.isPending} className="btn-primary w-full">
              <Send className="mr-2 h-4 w-4" />
              {mutation.isPending ? 'Mengirim...' : 'Kirim Pesan'}
            </button>
            {mutation.isError && (
              <p className="text-center text-sm text-red-500">
                Gagal mengirim pesan. Silakan coba lagi.
              </p>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
