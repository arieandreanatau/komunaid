"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import api from "@/lib/api";

interface StructureItem {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  parentId: string | null;
  position: number;
  isActive: boolean;
  members: MemberItem[];
  _count: { children: number; members: number };
  parent?: { id: string; title: string } | null;
}

interface MemberItem {
  id: string;
  name: string;
  position: string;
  email: string | null;
  phone: string | null;
  avatar: string | null;
  bio: string | null;
  order: number;
  isActive: boolean;
}

export default function AdminOrgStructurePage() {
  const [structures, setStructures] = useState<StructureItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [editingItem, setEditingItem] = useState<StructureItem | null>(null);
  const [editingMember, setEditingMember] = useState<MemberItem | null>(null);
  const [selectedStructureId, setSelectedStructureId] = useState<string>("");
  const [form, setForm] = useState({ title: "", description: "", imageUrl: "", parentId: "", position: "0" });
  const [memberForm, setMemberForm] = useState({ name: "", position: "", email: "", phone: "", avatar: "", bio: "", order: "0" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { fetchStructures(); }, []);

  const fetchStructures = async () => {
    try {
      const { data } = await api.get("/organization-structure/admin/all");
      setStructures(data.data || []);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = (parentId?: string) => {
    setEditingItem(null);
    setForm({ title: "", description: "", imageUrl: "", parentId: parentId || "", position: "0" });
    setError("");
    setShowModal(true);
  };

  const openEditModal = (item: StructureItem) => {
    setEditingItem(item);
    setForm({
      title: item.title,
      description: item.description || "",
      imageUrl: item.imageUrl || "",
      parentId: item.parentId || "",
      position: String(item.position),
    });
    setError("");
    setShowModal(true);
  };

  const handleSaveStructure = async () => {
    setSaving(true);
    setError("");
    try {
      const payload = {
        ...form,
        position: parseInt(form.position) || 0,
        parentId: form.parentId || null,
      };
      if (editingItem) {
        await api.put(`/organization-structure/admin/${editingItem.id}`, payload);
      } else {
        await api.post("/organization-structure/admin", payload);
      }
      setShowModal(false);
      fetchStructures();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Gagal menyimpan.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteStructure = async (id: string) => {
    if (!confirm("Yakin ingin menghapus struktur ini? Semua anggota juga akan dihapus.")) return;
    try {
      await api.delete(`/organization-structure/admin/${id}`);
      fetchStructures();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Gagal menghapus.");
    }
  };

  const openMemberModal = (structureId: string, member?: MemberItem) => {
    setSelectedStructureId(structureId);
    if (member) {
      setEditingMember(member);
      setMemberForm({
        name: member.name,
        position: member.position,
        email: member.email || "",
        phone: member.phone || "",
        avatar: member.avatar || "",
        bio: member.bio || "",
        order: String(member.order),
      });
    } else {
      setEditingMember(null);
      setMemberForm({ name: "", position: "", email: "", phone: "", avatar: "", bio: "", order: "0" });
    }
    setError("");
    setShowMemberModal(true);
  };

  const handleSaveMember = async () => {
    setSaving(true);
    setError("");
    try {
      const payload = {
        ...memberForm,
        order: parseInt(memberForm.order) || 0,
      };
      if (editingMember) {
        await api.put(`/organization-structure/admin/members/${editingMember.id}`, payload);
      } else {
        await api.post(`/organization-structure/admin/${selectedStructureId}/members`, payload);
      }
      setShowMemberModal(false);
      fetchStructures();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Gagal menyimpan anggota.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMember = async (memberId: string) => {
    if (!confirm("Yakin ingin menghapus anggota ini?")) return;
    try {
      await api.delete(`/organization-structure/admin/members/${memberId}`);
      fetchStructures();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Gagal menghapus anggota.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 border-4 border-komuna-blue border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-komuna-navy">Struktur Organisasi</h1>
          <p className="text-sm text-gray-500">Kelola kerangka organisasi PT Komuna Digital Indonesia</p>
        </div>
        <button
          onClick={() => openCreateModal()}
          className="px-4 py-2.5 bg-komuna-blue text-white rounded-lg font-medium text-sm hover:bg-komuna-navy transition-colors"
        >
          + Tambah Struktur
        </button>
      </div>

      {structures.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <p className="text-gray-500">Belum ada data struktur. Klik "Tambah Struktur" untuk memulai.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {structures.filter((s) => !s.parentId).map((item) => (
            <div key={item.id} className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-komuna-blue/10 flex items-center justify-center">
                    <span className="text-komuna-blue font-bold text-sm">{item.title[0]}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-komuna-navy">{item.title}</h3>
                    <p className="text-xs text-gray-500">{item._count.members} anggota &middot; {item._count.children} sub-struktur</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => openMemberModal(item.id)} className="px-3 py-1.5 text-xs font-medium text-komuna-blue bg-komuna-blue/10 rounded-lg hover:bg-komuna-blue/20 transition-colors">
                    + Anggota
                  </button>
                  <button onClick={() => openCreateModal(item.id)} className="px-3 py-1.5 text-xs font-medium text-komuna-teal bg-komuna-teal/10 rounded-lg hover:bg-komuna-teal/20 transition-colors">
                    + Sub
                  </button>
                  <button onClick={() => openEditModal(item)} className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                    Edit
                  </button>
                  <button onClick={() => handleDeleteStructure(item.id)} className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                    Hapus
                  </button>
                </div>
              </div>

              {item.members.length > 0 && (
                <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {item.members.map((member) => (
                    <div key={member.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="h-10 w-10 rounded-full bg-komuna-teal/10 flex items-center justify-center shrink-0">
                        <span className="text-komuna-teal font-bold text-xs">{member.name[0]}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-komuna-navy truncate">{member.name}</p>
                        <p className="text-xs text-komuna-blue">{member.position}</p>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => openMemberModal(item.id, member)} className="text-xs text-gray-500 hover:text-komuna-blue">Edit</button>
                        <button onClick={() => handleDeleteMember(member.id)} className="text-xs text-red-500 hover:text-red-700">Hapus</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {item._count.children > 0 && (
                <div className="p-4 pt-0 space-y-3">
                  {structures.filter((s) => s.parentId === item.id).map((child) => (
                    <div key={child.id} className="border-l-2 border-komuna-blue/20 pl-4 ml-2">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-sm text-komuna-navy">{child.title}</h4>
                          <p className="text-xs text-gray-500">{child._count.members} anggota</p>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => openMemberModal(child.id)} className="text-xs text-komuna-blue hover:underline">+ Anggota</button>
                          <button onClick={() => openEditModal(child)} className="text-xs text-gray-500 hover:text-komuna-blue">Edit</button>
                          <button onClick={() => handleDeleteStructure(child.id)} className="text-xs text-red-500 hover:text-red-700">Hapus</button>
                        </div>
                      </div>
                      {child.members.length > 0 && (
                        <div className="space-y-2">
                          {child.members.map((m) => (
                            <div key={m.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded text-sm">
                              <span className="font-medium text-komuna-navy">{m.name}</span>
                              <span className="text-xs text-komuna-blue">{m.position}</span>
                              <div className="ml-auto flex gap-1">
                                <button onClick={() => openMemberModal(child.id, m)} className="text-xs text-gray-500 hover:text-komuna-blue">Edit</button>
                                <button onClick={() => handleDeleteMember(m.id)} className="text-xs text-red-500 hover:text-red-700">Hapus</button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 p-6 max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <h3 className="text-lg font-semibold text-komuna-navy mb-4">{editingItem ? "Edit Struktur" : "Tambah Struktur"}</h3>
            {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-lg mb-4">{error}</div>}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Judul <span className="text-red-500">*</span></label>
                <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-komuna-blue outline-none" placeholder="Contoh: Direktur Utama" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-komuna-blue outline-none resize-none" placeholder="Deskripsi struktur..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL Gambar</label>
                <input type="text" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-komuna-blue outline-none" placeholder="https://..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Parent Struktur</label>
                <select value={form.parentId} onChange={(e) => setForm({ ...form, parentId: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-komuna-blue outline-none bg-white">
                  <option value="">None (Top Level)</option>
                  {structures.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Posisi (Urutan)</label>
                <input type="number" value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-komuna-blue outline-none" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors text-sm">Batal</button>
              <button onClick={handleSaveStructure} disabled={saving} className="flex-1 px-4 py-2.5 bg-komuna-blue text-white rounded-lg font-medium hover:bg-komuna-navy transition-colors text-sm disabled:opacity-50">
                {saving ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showMemberModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowMemberModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 p-6 max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowMemberModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <h3 className="text-lg font-semibold text-komuna-navy mb-4">{editingMember ? "Edit Anggota" : "Tambah Anggota"}</h3>
            {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-lg mb-4">{error}</div>}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama <span className="text-red-500">*</span></label>
                <input type="text" value={memberForm.name} onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-komuna-blue outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jabatan <span className="text-red-500">*</span></label>
                <input type="text" value={memberForm.position} onChange={(e) => setMemberForm({ ...memberForm, position: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-komuna-blue outline-none" placeholder="Contoh: Direktur Utama" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" value={memberForm.email} onChange={(e) => setMemberForm({ ...memberForm, email: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-komuna-blue outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telepon</label>
                  <input type="text" value={memberForm.phone} onChange={(e) => setMemberForm({ ...memberForm, phone: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-komuna-blue outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL Avatar</label>
                <input type="text" value={memberForm.avatar} onChange={(e) => setMemberForm({ ...memberForm, avatar: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-komuna-blue outline-none" placeholder="https://..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                <textarea value={memberForm.bio} onChange={(e) => setMemberForm({ ...memberForm, bio: e.target.value })} rows={3} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-komuna-blue outline-none resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Urutan</label>
                <input type="number" value={memberForm.order} onChange={(e) => setMemberForm({ ...memberForm, order: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-komuna-blue outline-none" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowMemberModal(false)} className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors text-sm">Batal</button>
              <button onClick={handleSaveMember} disabled={saving} className="flex-1 px-4 py-2.5 bg-komuna-blue text-white rounded-lg font-medium hover:bg-komuna-navy transition-colors text-sm disabled:opacity-50">
                {saving ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
