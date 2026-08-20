"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-komuna-cream px-4">
      <div className="text-center max-w-md mx-auto p-8">
        <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-red-600 text-2xl">!</span>
        </div>
        <h2 className="font-display text-3xl font-semibold tracking-[-0.03em] text-komuna-dark mb-2">
          Terjadi Kesalahan
        </h2>
        <p className="text-komuna-dark/65 mb-6">
          Terjadi kesalahan tak terduga. Silakan coba lagi.
        </p>
        <button
          onClick={reset}
          className="px-6 py-2.5 bg-komuna-forest text-white rounded-xl hover:bg-komuna-dark transition-colors font-bold"
        >
          Coba Lagi
        </button>
      </div>
    </div>
  );
}
