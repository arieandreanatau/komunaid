"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";

interface CmsContactData {
  id: string;
  companyName: string;
  phone: string | null;
  address: string | null;
  email: string | null;
  instagram: string | null;
  facebook: string | null;
  twitter: string | null;
  threads: string | null;
  website: string | null;
  mapsUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function AdminCmsContactPage() {
  const [contacts, setContacts] = useState<CmsContactData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<CmsContactData | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [form, setForm] = useState({
    companyName: "",
    phone: "",
    address: "",
    email: "",
    instagram: "",
    facebook: "",
    twitter: "",
    threads: "",
    website: "",
    mapsUrl: "",
  });

  useEffect(() => { fetchContacts(); }, []);

  const fetchContacts = async () => {
    try {
      const { data } = await api.get("/admin/cms/contact/all");
      setContacts(data.data || []);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ companyName: "", phone: "", address: "", email: "", instagram: "", facebook: "", twitter: "", threads: "", website: "", mapsUrl: "" });
    setError("");
    setShowModal(true);
  };

  const openEdit = (item: CmsContactData) => {
    setEditing(item);
    setForm({
      companyName: item.companyName,
      phone: item.phone || "",
      address: item.address || "",
      email: item.email || "",
      instagram: item.instagram || "",
      facebook: item.facebook || "",
      twitter: item.twitter || "",
      threads: item.threads || "",
      website: item.website || "",
      mapsUrl: item.mapsUrl || "",
    });
    setError("");
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      if (editing) {
        await api.put(`/admin/cms/contact/${editing.id}`, form);
        showToast("Data kontak berhasil diupdate");
      } else {
        await api.post("/admin/cms/contact", form);
        showToast("Data kontak berhasil dibuat");
      }
      setShowModal(false);
      fetchContacts();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Gagal menyimpan.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus data kontak ini?")) return;
    try {
      await api.delete(`/admin/cms/contact/${id}`);
      showToast("Data kontak berhasil dihapus");
      fetchContacts();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Gagal menghapus.");
    }
  };

  const handleToggleActive = async (item: CmsContactData) => {
    try {
      await api.put(`/admin/cms/contact/${item.id}`, { isActive: !item.isActive });
      fetchContacts();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Gagal mengubah status.");
    }
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const socialFields = [
    { key: "instagram", label: "Instagram", placeholder: "https://instagram.com/..." },
    { key: "facebook", label: "Facebook", placeholder: "https://facebook.com/..." },
    { key: "twitter", label: "Twitter / X", placeholder: "https://x.com/..." },
    { key: "threads", label: "Threads", placeholder: "https://threads.net/..." },
  ] as const;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 border-4 border-komuna-blue border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium animate-in fade-in">
          {toast}
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-komuna-navy">CMS Hubungi Kami</h1>
          <p className="text-sm text-gray-500">Kelola data kontak yang ditampilkan di halaman Hubungi Kami</p>
        </div>
        <button onClick={openCreate} className="px-4 py-2.5 bg-komuna-blue text-white rounded-lg font-medium text-sm hover:bg-komuna-navy transition-colors">
          + Tambah Data
        </button>
      </div>

      {contacts.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-gray-500 mb-4">Belum ada data kontak.</p>
          <button onClick={openCreate} className="px-4 py-2 bg-komuna-blue text-white rounded-lg text-sm font-medium hover:bg-komuna-navy transition-colors">
            Tambah Sekarang
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {contacts.map((item) => (
            <div key={item.id} className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-komuna-blue/10 flex items-center justify-center">
                    <svg className="h-6 w-6 text-komuna-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-komuna-navy">{item.companyName}</h3>
                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                      {item.email && <span>{item.email}</span>}
                      {item.phone && <span>{item.phone}</span>}
                      {item.instagram && <span>Instagram</span>}
                      {item.facebook && <span>Facebook</span>}
                      {item.twitter && <span>Twitter</span>}
                      {item.threads && <span>Threads</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleActive(item)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                      item.isActive
                        ? "text-green-700 bg-green-100 hover:bg-green-200"
                        : "text-gray-500 bg-gray-100 hover:bg-gray-200"
                    }`}
                  >
                    {item.isActive ? "Active" : "Inactive"}
                  </button>
                  <button onClick={() => openEdit(item)} className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                    Hapus
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-4 p-6 max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <h3 className="text-lg font-semibold text-komuna-navy mb-4">{editing ? "Edit Data Kontak" : "Tambah Data Kontak"}</h3>
            {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-lg mb-4">{error}</div>}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Perusahaan <span className="text-red-500">*</span></label>
                <input type="text" value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-komuna-blue outline-none" placeholder="PT Komuna Digital Indonesia" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">No. Telepon</label>
                  <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-komuna-blue outline-none" placeholder="+62 xxx" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-komuna-blue outline-none" placeholder="info@komuna.id" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
                <textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} rows={3} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-komuna-blue outline-none resize-none" placeholder="Alamat lengkap perusahaan" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                <input type="url" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-komuna-blue outline-none" placeholder="https://komuna.id" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Google Maps URL</label>
                <input type="url" value={form.mapsUrl} onChange={(e) => setForm({ ...form, mapsUrl: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-komuna-blue outline-none" placeholder="https://maps.google.com/..." />
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Sosial Media</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {socialFields.map((field) => (
                    <div key={field.key}>
                      <label className="block text-xs font-medium text-gray-500 mb-1">{field.label}</label>
                      <input type="url" value={form[field.key]} onChange={(e) => setForm({ ...form, [field.key]: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-komuna-blue outline-none" placeholder={field.placeholder} />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors text-sm">Batal</button>
              <button onClick={handleSave} disabled={saving} className="flex-1 px-4 py-2.5 bg-komuna-blue text-white rounded-lg font-medium hover:bg-komuna-navy transition-colors text-sm disabled:opacity-50">
                {saving ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
