import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-royal"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke beranda
        </Link>
        {children}
      </div>
    </div>
  );
}
