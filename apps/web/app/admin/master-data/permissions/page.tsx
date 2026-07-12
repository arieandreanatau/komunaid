"use client";

export default function MasterDataPermissionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-komuna-navy">Permissions</h1>
        <p className="text-sm text-gray-500 mt-1">Manajemen hak akses platform</p>
      </div>

      <div className="text-center py-16 bg-white rounded-xl shadow-sm">
        <svg className="h-12 w-12 text-gray-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
        <p className="text-gray-500 font-medium">Manajemen permission belum tersedia</p>
        <p className="text-sm text-gray-400 mt-1 max-w-md mx-auto">
          Sistem manajemen hak akses berbasis peran (RBAC) akan segera tersedia.
        </p>
      </div>
    </div>
  );
}
