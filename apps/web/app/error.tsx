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
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md mx-auto p-8">
        <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-red-600 text-2xl">!</span>
        </div>
        <h2 className="text-2xl font-bold text-komuna-navy mb-2">
          Terjadi Kesalahan
        </h2>
        <p className="text-gray-600 mb-6">
          {error.message || "Terjadi kesalahan yang tidak terduga."}
        </p>
        <button
          onClick={reset}
          className="px-6 py-2 bg-komuna-blue text-white rounded-lg hover:bg-komuna-navy transition-colors"
        >
          Coba Lagi
        </button>
      </div>
    </div>
  );
}
