"use client";

import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";
import { useAuth } from "@/components/auth-provider";

type TabKey = "provinces" | "cities" | "countries" | "interests" | "tabs";

const tabs: { key: TabKey; label: string }[] = [
  { key: "provinces", label: "Provinsi" }, { key: "cities", label: "Kota" },
  { key: "countries", label: "Negara" }, { key: "interests", label: "Interest" }, { key: "tabs", label: "Tags" },
];

export default function MasterDataPage() {
  const { user } = useAuth();
  const isSuperAdmin = user?.roles?.includes("SUPER_ADMIN");
  const [activeTab, setActiveTab] = useState<TabKey>("provinces");
  const [data, setData] = useState<any[]>([]);
  const [newItem, setNewItem] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: res } = await api.get(`/admin/master-data/${activeTab}`);
      setData(Array.isArray(res.data) ? res.data : []);
    } catch { setData([]); }
    finally { setLoading(false); }
  }, [activeTab]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    if (message) { const t = setTimeout(() => setMessage(null), 3000); return () => clearTimeout(t); }
  }, [message]);

  if (!isSuperAdmin) return <div className="text-center py-16 text-gray-500">Hanya Super Admin yang dapat mengakses halaman ini.</div>;

  const handleAdd = () => {
    if (!newItem.trim()) return;
    if (data.some((d) => typeof d === "string" ? d.toLowerCase() === newItem.toLowerCase() : false)) {
      setMessage({ type: "error", text: "Item sudah ada" }); return;
    }
    setData([...data, newItem.trim()]);
    setNewItem("");
  };

  const handleRemove = (index: number) => {
    setData(data.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setSaving(true); setMessage(null);
    try {
      await api.put(`/admin/master-data/${activeTab}`, { [activeTab]: data });
      setMessage({ type: "success", text: `${tabs.find((t) => t.key === activeTab)?.label} berhasil disimpan` });
    } catch { setMessage({ type: "error", text: "Gagal menyimpan" }); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-komuna-navy">Master Data</h1>
        <p className="text-sm text-gray-500 mt-1">Kelola data referensi platform</p></div>

      {message && (
        <div className={`px-4 py-3 rounded-lg text-sm font-medium ${message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          {message.text}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-48 shrink-0">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-2">
            {tabs.map((tab) => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={`w-full px-3 py-2.5 rounded-lg text-sm font-medium text-left transition-colors ${activeTab === tab.key ? "bg-komuna-blue/10 text-komuna-blue" : "text-gray-600 hover:bg-gray-50"}`}>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-komuna-navy mb-4">{tabs.find((t) => t.key === activeTab)?.label}</h2>

            {loading ? (
              <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-10 bg-gray-100 rounded-lg animate-pulse" />
              ))}</div>
            ) : (
              <>
                <div className="flex gap-2 mb-4">
                  <input type="text" value={newItem} onChange={(e) => setNewItem(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                    placeholder={`Tambah ${tabs.find((t) => t.key === activeTab)?.label} baru...`}
                    className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-komuna-blue/30" />
                  <button onClick={handleAdd}
                    className="px-4 py-2.5 text-sm font-medium text-white bg-komuna-blue rounded-lg hover:bg-komuna-navy transition-colors shrink-0">
                    Tambah
                  </button>
                </div>

                <div className="space-y-1 max-h-96 overflow-y-auto">
                  {data.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-8">Belum ada data</p>
                  ) : (
                    data.map((item, index) => (
                      <div key={index} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 group">
                        <span className="h-2 w-2 rounded-full bg-komuna-blue/30 shrink-0" />
                        <span className="flex-1 text-sm text-gray-700">{item}</span>
                        <button onClick={() => handleRemove(index)}
                          className="px-2 py-1 text-xs font-medium text-red-600 bg-red-50 rounded opacity-0 group-hover:opacity-100 hover:bg-red-100 transition-all">
                          Hapus
                        </button>
                      </div>
                    ))
                  )}
                </div>

                <div className="flex justify-between items-center mt-4 pt-4 border-t">
                  <span className="text-sm text-gray-500">{data.length} item</span>
                  <button onClick={handleSave} disabled={saving}
                    className="px-6 py-2.5 text-sm font-medium text-white bg-komuna-blue rounded-lg hover:bg-komuna-navy transition-colors disabled:opacity-50">
                    {saving ? "Menyimpan..." : "Simpan"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
