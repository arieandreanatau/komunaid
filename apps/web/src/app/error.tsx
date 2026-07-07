'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4">
      <h1 className="text-6xl font-bold text-red-600">!</h1>
      <p className="mt-4 text-xl text-gray-600">Terjadi kesalahan</p>
      <p className="mt-2 text-gray-500">
        {error.message || 'Terjadi kesalahan yang tidak terduga.'}
      </p>
      <button
        onClick={reset}
        className="mt-8 inline-flex items-center rounded-lg bg-royal px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-royal-600 transition-colors"
      >
        Coba Lagi
      </button>
    </div>
  );
}
