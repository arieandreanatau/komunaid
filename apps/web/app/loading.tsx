export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-komuna-cream" role="status" aria-label="Memuat halaman">
      <div className="text-center">
        <div className="h-12 w-12 border-4 border-komuna-forest border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-komuna-dark/60">Memuat...</p>
        <span className="sr-only">Memuat halaman, mohon tunggu...</span>
      </div>
    </div>
  );
}
