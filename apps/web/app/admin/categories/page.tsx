"use client";

import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";

interface Category {
  id: string; name: string; slug: string; description: string | null; icon: string | null;
  type: string; isActive: boolean;
  communityCount: number; organizationCount: number; eventCount: number; createdAt: string;
}
const typeColors: Record<string, string> = { COMMUNITY: "bg-blue-100 text-blue-700", ORGANIZATION: "bg-teal-100 text-teal-700", EVENT: "bg-purple-100 text-purple-700" };
const typeLabels: Record<string, string> = { COMMUNITY: "Komunitas", ORGANIZATION: "Organisasi", EVENT: "Event" };

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("");
  const [showInactive, setShowInactive] = useState(false);
  const [modal, setModal] = useState<{ mode: "create" | "edit"; category?: Category } | null>(null);
  const [form, setForm] = useState({ name: "", description: "", icon: "", type: "COMMUNITY" });
  const [actionLoading, setActionLoading] = useState(false);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = { includeInactive: showInactive };
      if (typeFilter) params.type = typeFilter;
      const { data } = await api.get("/admin/categories", { params });
      setCategories(data.data || []);
    } catch { /* empty */ }
    finally { setLoading(false); }
  }, [typeFilter, showInactive]);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const handleSave = async () => {
    setActionLoading(true);
    try {
      if (modal?.mode === "create") {
        await api.post("/admin/categories", form);
      } else if (modal?.category) {
        await api.put(`/admin/categories/${modal.category.id}`, form);
      }
      setModal(null); fetchCategories();
    } catch { /* empty */ }
    finally { setActionLoading(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Nonaktifkan kategori ini?")) return;
    try { await api.delete(`/admin/categories/${id}`); fetchCategories(); }
    catch { /* empty */ }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-komuna-navy">Category Management</h1>
          <p className="text-sm text-gray-500 mt-1">Kelola kategori komunitas, organisasi, dan event</p></div>
        <button onClick={() => { setModal({ mode: "create" }); setForm({ name: "", description: "", icon: "", type: "COMMUNITY" }); }}
          className="px-4 py-2.5 text-sm font-medium text-white bg-komuna-blue rounded-lg hover:bg-komuna-navy transition-colors">
          + Tambah Kategori
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="flex gap-1 bg-white rounded-lg p-1 shadow-sm">
          {[{ v: "", l: "Semua" }, { v: "COMMUNITY", l: "Komunitas" }, { v: "ORGANIZATION", l: "Organisasi" }, { v: "EVENT", l: "Event" }].map((t) => (
            <button key={t.v} onClick={() => setTypeFilter(t.v)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${typeFilter === t.v ? "bg-komuna-blue text-white" : "text-gray-600 hover:bg-gray-100"}`}>
              {t.l}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg shadow-sm text-xs font-medium text-gray-600 cursor-pointer">
          <input type="checkbox" checked={showInactive} onChange={(e) => setShowInactive(e.target.checked)}
            className="rounded border-gray-300 text-komuna-blue focus:ring-komuna-blue" />
          Tampilkan Nonaktif
        </label>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-5 shadow-sm animate-pulse"><div className="h-4 bg-gray-200 rounded w-1/3 mb-2" /><div className="h-3 bg-gray-200 rounded w-1/2" /></div>
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-sm"><p className="text-gray-500">Tidak ada kategori</p></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <div key={cat.id} className={`bg-white rounded-xl shadow-sm p-5 border border-gray-100 ${!cat.isActive ? "opacity-60" : ""}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-komuna-navy">{cat.name}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${typeColors[cat.type] || ""}`}>{typeLabels[cat.type]}</span>
                  </div>
                  {cat.description && <p className="text-sm text-gray-500 mt-1 line-clamp-2">{cat.description}</p>}
                  <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
                    <span>{cat.communityCount} komunitas</span>
                    <span>{cat.organizationCount} organisasi</span>
                    <span>{cat.eventCount} event</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4 pt-3 border-t">
                <button onClick={() => { setModal({ mode: "edit", category: cat }); setForm({ name: cat.name, description: cat.description || "", icon: cat.icon || "", type: cat.type }); }}
                  className="px-3 py-1.5 text-xs font-medium text-komuna-blue bg-komuna-blue/10 rounded-lg hover:bg-komuna-blue/20">Edit</button>
                {cat.isActive && (
                  <button onClick={() => handleDelete(cat.id)}
                    className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100">Nonaktifkan</button>
                )}
                {!cat.isActive && <span className="text-xs text-gray-400">Nonaktif</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
            <h3 className="text-lg font-semibold text-komuna-navy mb-4">{modal.mode === "create" ? "Tambah Kategori" : "Edit Kategori"}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama *</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-komuna-blue/30" placeholder="Nama kategori" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-komuna-blue/30" placeholder="Deskripsi kategori" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
                <input type="text" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-komuna-blue/30" placeholder="Nama icon (opsional)" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipe *</label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-komuna-blue/30">
                  <option value="COMMUNITY">Komunitas</option>
                  <option value="ORGANIZATION">Organisasi</option>
                  <option value="EVENT">Event</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setModal(null)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Batal</button>
              <button onClick={handleSave} disabled={actionLoading || !form.name.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-komuna-blue rounded-lg hover:bg-komuna-navy disabled:opacity-50">
                {actionLoading ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
