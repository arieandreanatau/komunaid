"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { useAuth } from "@/components/auth-provider";

interface MasterDataStats {
  totalCategories: number;
  totalLocations: number;
  totalRoles: number;
  totalPermissions: number;
}

const quickActions = [
  { label: "Kategori", desc: "Kelola kategori komunitas, organisasi, event", href: "/admin/master-data/categories", color: "bg-komuna-blue" },
  { label: "Lokasi", desc: "Negara, provinsi, kota, kecamatan, kelurahan", href: "/admin/master-data/locations", color: "bg-komuna-teal" },
  { label: "Role", desc: "Kelola role dan assignment pengguna", href: "/admin/master-data/roles", color: "bg-purple-500" },
  { label: "Permission", desc: "Manajemen hak akses", href: "/admin/master-data/permissions", color: "bg-orange-500" },
];

export default function MasterDataOverviewPage() {
  const router = useRouter();
  const { user } = useAuth();
  const isSuperAdmin = user?.roles?.includes("SUPER_ADMIN");
  const [stats, setStats] = useState<MasterDataStats>({ totalCategories: 0, totalLocations: 0, totalRoles: 0, totalPermissions: 0 });
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/admin/master-data/stats");
      setStats(data.data || { totalCategories: 0, totalLocations: 0, totalRoles: 0, totalPermissions: 0 });
    } catch { /* empty */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  if (!isSuperAdmin) {
    return <div className="text-center py-16 text-gray-500">Hanya Super Admin yang dapat mengakses halaman ini.</div>;
  }

  const statCards = [
    { label: "Kategori", value: stats.totalCategories, icon: "M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z", color: "text-komuna-blue bg-komuna-blue/10" },
    { label: "Lokasi", value: stats.totalLocations, icon: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z", color: "text-komuna-teal bg-komuna-teal/10" },
    { label: "Role", value: stats.totalRoles, icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z", color: "text-purple-500 bg-purple-500/10" },
    { label: "Permission", value: stats.totalPermissions, icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z", color: "text-orange-500 bg-orange-500/10" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-komuna-navy">Master Data</h1>
        <p className="text-sm text-gray-500 mt-1">Kelola data referensi platform</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-5 shadow-sm animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
              <div className="h-8 bg-gray-200 rounded w-1/2" />
            </div>
          ))
        ) : (
          statCards.map((card) => (
            <div key={card.label} className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
              <div className="flex items-center gap-4">
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${card.color}`}>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={card.icon} />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-500">{card.label}</p>
                  <p className="text-2xl font-bold text-komuna-navy">{card.value}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div>
        <h2 className="text-lg font-semibold text-komuna-navy mb-4">Aksi Cepat</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <button
              key={action.href}
              onClick={() => router.push(action.href)}
              className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition-shadow text-left"
            >
              <div className={`h-10 w-10 rounded-lg ${action.color} flex items-center justify-center mb-3`}>
                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <h3 className="font-semibold text-komuna-navy">{action.label}</h3>
              <p className="text-xs text-gray-500 mt-1">{action.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
