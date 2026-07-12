"use client";

import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";
import { useAuth } from "@/components/auth-provider";

type TabKey = "countries" | "provinces" | "cities" | "districts" | "kelurahan";
type SimpleTab = "countries";
type HierarchicalTab = "provinces" | "cities" | "districts" | "kelurahan";

const tabs: { key: TabKey; label: string }[] = [
  { key: "countries", label: "Negara" },
  { key: "provinces", label: "Provinsi" },
  { key: "cities", label: "Kota" },
  { key: "districts", label: "Kecamatan" },
  { key: "kelurahan", label: "Kelurahan" },
];

const SIMPLE_TABS: SimpleTab[] = ["countries"];
const HIERARCHICAL_TABS: HierarchicalTab[] = ["provinces", "cities", "districts", "kelurahan"];

const PARENT_LABELS: Record<HierarchicalTab, string> = {
  provinces: "Negara",
  cities: "Provinsi",
  districts: "Kota/Kabupaten",
  kelurahan: "Kecamatan",
};

const CHILD_LABELS: Record<HierarchicalTab, string> = {
  provinces: "Provinsi",
  cities: "Kota/Kabupaten",
  districts: "Kecamatan",
  kelurahan: "Kelurahan",
};

const PARENT_TABS: Record<HierarchicalTab, HierarchicalTab | "countries"> = {
  provinces: "countries",
  cities: "provinces",
  districts: "cities",
  kelurahan: "districts",
};

export default function MasterDataLocationsPage() {
  const { user } = useAuth();
  const isSuperAdmin = user?.roles?.includes("SUPER_ADMIN");
  const [activeTab, setActiveTab] = useState<TabKey>("countries");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [simpleData, setSimpleData] = useState<string[]>([]);
  const [newItem, setNewItem] = useState("");

  const [hierarchicalData, setHierarchicalData] = useState<Record<string, string[]>>({});
  const [selectedParent, setSelectedParent] = useState("");
  const [parentOptions, setParentOptions] = useState<string[]>([]);
  const [newChildItem, setNewChildItem] = useState("");

  const isHierarchical = HIERARCHICAL_TABS.includes(activeTab as HierarchicalTab);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      if (SIMPLE_TABS.includes(activeTab as SimpleTab)) {
        const { data: res } = await api.get(`/admin/master-data/${activeTab}`);
        setSimpleData(Array.isArray(res.data) ? res.data : []);
      } else {
        const { data: res } = await api.get(`/admin/master-data/${activeTab}`);
        const raw = res.data || {};
        setHierarchicalData(typeof raw === "object" && !Array.isArray(raw) ? raw : {});

        const parentTab = PARENT_TABS[activeTab as HierarchicalTab];
        if (parentTab === "countries") {
          const countryRes = await api.get("/admin/master-data/countries");
          setParentOptions(Array.isArray(countryRes.data.data) ? countryRes.data.data : []);
        } else {
          const parentRes = await api.get(`/admin/master-data/${parentTab}`);
          const parentRaw = parentRes.data.data || {};
          if (typeof parentRaw === "object" && !Array.isArray(parentRaw)) {
            setParentOptions(Object.keys(parentRaw).sort());
          } else if (Array.isArray(parentRaw)) {
            setParentOptions(parentRaw);
          } else {
            setParentOptions([]);
          }
        }

        if (!selectedParent) {
          const keys = typeof raw === "object" && !Array.isArray(raw) ? Object.keys(raw) : [];
          if (keys.length > 0) setSelectedParent(keys[0]);
        }
      }
    } catch {
      setSimpleData([]);
      setHierarchicalData({});
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    if (message) { const t = setTimeout(() => setMessage(null), 3000); return () => clearTimeout(t); }
  }, [message]);

  useEffect(() => {
    setSelectedParent("");
    setNewItem("");
    setNewChildItem("");
  }, [activeTab]);

  if (!isSuperAdmin) return <div className="text-center py-16 text-gray-500">Hanya Super Admin yang dapat mengakses halaman ini.</div>;

  const handleAddSimple = () => {
    if (!newItem.trim()) return;
    if (simpleData.some((d) => d.toLowerCase() === newItem.toLowerCase())) {
      setMessage({ type: "error", text: "Item sudah ada" }); return;
    }
    setSimpleData([...simpleData, newItem.trim()]);
    setNewItem("");
  };

  const handleRemoveSimple = (index: number) => {
    setSimpleData(simpleData.filter((_, i) => i !== index));
  };

  const handleSaveSimple = async () => {
    setSaving(true); setMessage(null);
    try {
      await api.put(`/admin/master-data/${activeTab}`, { [activeTab]: simpleData });
      setMessage({ type: "success", text: `${tabs.find((t) => t.key === activeTab)?.label} berhasil disimpan` });
    } catch { setMessage({ type: "error", text: "Gagal menyimpan" }); }
    finally { setSaving(false); }
  };

  const currentChildren = selectedParent ? (hierarchicalData[selectedParent] || []) : [];

  const handleAddChild = () => {
    if (!newChildItem.trim() || !selectedParent) return;
    if (currentChildren.some((c) => c.toLowerCase() === newChildItem.toLowerCase())) {
      setMessage({ type: "error", text: "Item sudah ada" }); return;
    }
    const updated = { ...hierarchicalData, [selectedParent]: [...currentChildren, newChildItem.trim()].sort() };
    setHierarchicalData(updated);
    setNewChildItem("");
  };

  const handleRemoveChild = (childIndex: number) => {
    if (!selectedParent) return;
    const updated = { ...hierarchicalData };
    updated[selectedParent] = currentChildren.filter((_, i) => i !== childIndex);
    if (updated[selectedParent].length === 0) delete updated[selectedParent];
    setHierarchicalData(updated);
  };

  const handleAddParent = () => {
    if (!newItem.trim()) return;
    if (hierarchicalData[newItem.trim()]) {
      setMessage({ type: "error", text: "Item sudah ada" }); return;
    }
    setHierarchicalData({ ...hierarchicalData, [newItem.trim()]: [] });
    setSelectedParent(newItem.trim());
    setNewItem("");
  };

  const handleRemoveParent = (parent: string) => {
    const updated = { ...hierarchicalData };
    delete updated[parent];
    setHierarchicalData(updated);
    if (selectedParent === parent) {
      const keys = Object.keys(updated);
      setSelectedParent(keys.length > 0 ? keys[0] : "");
    }
  };

  const handleSaveHierarchical = async () => {
    setSaving(true); setMessage(null);
    try {
      await api.put(`/admin/master-data/${activeTab}`, { [activeTab]: hierarchicalData });
      setMessage({ type: "success", text: `${tabs.find((t) => t.key === activeTab)?.label} berhasil disimpan` });
    } catch { setMessage({ type: "error", text: "Gagal menyimpan" }); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-komuna-navy">Lokasi</h1>
        <p className="text-sm text-gray-500 mt-1">Kelola data lokasi negara, provinsi, kota, kecamatan, kelurahan</p></div>

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
            ) : isHierarchical ? (
              <div className="flex gap-4">
                <div className="w-1/3 border-r pr-4">
                  <p className="text-xs font-medium text-gray-500 uppercase mb-2">{PARENT_LABELS[activeTab as HierarchicalTab]}</p>
                  <div className="flex gap-2 mb-3">
                    <input type="text" value={newItem} onChange={(e) => setNewItem(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAddParent()}
                      placeholder={`Tambah ${PARENT_LABELS[activeTab as HierarchicalTab]}...`}
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-komuna-blue/30" />
                    <button onClick={handleAddParent}
                      className="px-3 py-2 text-sm font-medium text-white bg-komuna-blue rounded-lg hover:bg-komuna-navy transition-colors shrink-0">
                      +
                    </button>
                  </div>
                  <div className="space-y-1 max-h-80 overflow-y-auto">
                    {Object.keys(hierarchicalData).sort().map((parent) => (
                      <div key={parent}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer group transition-colors ${selectedParent === parent ? "bg-komuna-blue/10 text-komuna-blue" : "hover:bg-gray-50 text-gray-700"}`}
                        onClick={() => setSelectedParent(parent)}>
                        <span className="flex-1 text-sm truncate">{parent}</span>
                        <span className="text-xs text-gray-400">{(hierarchicalData[parent] || []).length}</span>
                        <button onClick={(e) => { e.stopPropagation(); handleRemoveParent(parent); }}
                          className="px-1 py-0.5 text-xs text-red-600 bg-red-50 rounded opacity-0 group-hover:opacity-100 hover:bg-red-100 transition-all">
                          Hapus
                        </button>
                      </div>
                    ))}
                    {Object.keys(hierarchicalData).length === 0 && (
                      <p className="text-sm text-gray-400 text-center py-4">Belum ada data</p>
                    )}
                  </div>
                </div>

                <div className="flex-1">
                  {selectedParent ? (
                    <>
                      <p className="text-xs font-medium text-gray-500 uppercase mb-2">
                        {CHILD_LABELS[activeTab as HierarchicalTab]} di <span className="text-komuna-blue">{selectedParent}</span>
                      </p>
                      <div className="flex gap-2 mb-3">
                        <input type="text" value={newChildItem} onChange={(e) => setNewChildItem(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleAddChild()}
                          placeholder={`Tambah ${CHILD_LABELS[activeTab as HierarchicalTab]}...`}
                          className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-komuna-blue/30" />
                        <button onClick={handleAddChild}
                          className="px-3 py-2 text-sm font-medium text-white bg-komuna-blue rounded-lg hover:bg-komuna-navy transition-colors shrink-0">
                          Tambah
                        </button>
                      </div>
                      <div className="space-y-1 max-h-80 overflow-y-auto">
                        {currentChildren.length === 0 ? (
                          <p className="text-sm text-gray-400 text-center py-4">Belum ada data</p>
                        ) : (
                          currentChildren.map((child, index) => (
                            <div key={index} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 group">
                              <span className="h-2 w-2 rounded-full bg-komuna-blue/30 shrink-0" />
                              <span className="flex-1 text-sm text-gray-700">{child}</span>
                              <button onClick={() => handleRemoveChild(index)}
                                className="px-2 py-1 text-xs font-medium text-red-600 bg-red-50 rounded opacity-0 group-hover:opacity-100 hover:bg-red-100 transition-all">
                                Hapus
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-gray-400 text-center py-8">Pilih {PARENT_LABELS[activeTab as HierarchicalTab]} di sebelah kiri</p>
                  )}
                </div>
              </div>
            ) : (
              <>
                <div className="flex gap-2 mb-4">
                  <input type="text" value={newItem} onChange={(e) => setNewItem(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddSimple()}
                    placeholder={`Tambah ${tabs.find((t) => t.key === activeTab)?.label} baru...`}
                    className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-komuna-blue/30" />
                  <button onClick={handleAddSimple}
                    className="px-4 py-2.5 text-sm font-medium text-white bg-komuna-blue rounded-lg hover:bg-komuna-navy transition-colors shrink-0">
                    Tambah
                  </button>
                </div>

                <div className="space-y-1 max-h-96 overflow-y-auto">
                  {simpleData.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-8">Belum ada data</p>
                  ) : (
                    simpleData.map((item, index) => (
                      <div key={index} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 group">
                        <span className="h-2 w-2 rounded-full bg-komuna-blue/30 shrink-0" />
                        <span className="flex-1 text-sm text-gray-700">{item}</span>
                        <button onClick={() => handleRemoveSimple(index)}
                          className="px-2 py-1 text-xs font-medium text-red-600 bg-red-50 rounded opacity-0 group-hover:opacity-100 hover:bg-red-100 transition-all">
                          Hapus
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}

            <div className="flex justify-between items-center mt-4 pt-4 border-t">
              <span className="text-sm text-gray-500">
                {isHierarchical
                  ? `${Object.keys(hierarchicalData).length} ${PARENT_LABELS[activeTab as HierarchicalTab]}, ${Object.values(hierarchicalData).flat().length} ${CHILD_LABELS[activeTab as HierarchicalTab]}`
                  : `${simpleData.length} item`}
              </span>
              <button onClick={isHierarchical ? handleSaveHierarchical : handleSaveSimple} disabled={saving}
                className="px-6 py-2.5 text-sm font-medium text-white bg-komuna-blue rounded-lg hover:bg-komuna-navy transition-colors disabled:opacity-50">
                {saving ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
