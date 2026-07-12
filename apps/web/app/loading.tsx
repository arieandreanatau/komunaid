export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50" role="status" aria-label="Memuat halaman">
      <div className="text-center">
        <div className="h-12 w-12 border-4 border-komuna-blue border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Memuat...</p>
        <span className="sr-only">Memuat halaman, mohon tunggu...</span>
      </div>
    </div>
  );
}
