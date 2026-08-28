"use client";

import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";
import { runMutation } from "./mutation-helper";

interface MediaItem {
  id: string;
  title: string;
  content: string;
  type: "ANNOUNCEMENT" | "NEWS" | "GALLERY" | "FORUM_POST";
  imageUrl: string | null;
  isPublished: boolean;
  publishedAt: string | null;
  createdBy: { id: string; name: string; avatar: string | null };
  createdAt: string;
  updatedAt: string;
}

const MEDIA_TYPE_META: Record<string, { label: string; badge: string }> = {
  ANNOUNCEMENT: { label: "Pengumuman", badge: "bg-blue-100 text-blue-700" },
  NEWS: { label: "Berita", badge: "bg-emerald-100 text-emerald-700" },
  GALLERY: { label: "Galeri", badge: "bg-purple-100 text-purple-700" },
  FORUM_POST: { label: "Diskusi", badge: "bg-amber-100 text-amber-700" },
};

export function MediaTab({ communityId, canManage }: { communityId: string; canManage: boolean }) {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({ title: "", content: "", type: "ANNOUNCEMENT" as "ANNOUNCEMENT" | "NEWS" | "GALLERY", isPublished: false, imageUrl: "" });
  const [creating, setCreating] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ title: "", content: "", type: "ANNOUNCEMENT" as MediaItem["type"], isPublished: false, imageUrl: "" });

  const fetchMedia = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { limit: "50" };
      if (typeFilter) params.type = typeFilter;
      const { data } = await api.get(`/communities/${communityId}/media`, { params });
      setMedia(data.data || []);
    } catch {}
    finally { setLoading(false); }
  }, [communityId, typeFilter]);

  useEffect(() => { fetchMedia(); }, [fetchMedia]);

  const handleCreate = async () => {
    if (!createForm.title.trim() || !createForm.content.trim()) return;
    setCreating(true);
    await runMutation(
      () => api.post(`/communities/${communityId}/media`, { ...createForm, imageUrl: createForm.imageUrl.trim() || undefined }),
      {
        fallbackMessage: "Gagal membuat media.",
        onSuccess: () => {
          setShowCreateModal(false);
          setCreateForm({ title: "", content: "", type: "ANNOUNCEMENT", isPublished: false, imageUrl: "" });
          fetchMedia();
        },
      }
    );
    setCreating(false);
  };

  const handleUpdate = async () => {
    if (!editId || !editForm.title.trim() || !editForm.content.trim()) return;
    setCreating(true);
    await runMutation(
      () => api.put(`/communities/${communityId}/media/${editId}`, { ...editForm, imageUrl: editForm.imageUrl.trim() || undefined }),
      {
        fallbackMessage: "Gagal mengupdate media.",
        onSuccess: () => {
          setEditId(null);
          fetchMedia();
        },
      }
    );
    setCreating(false);
  };

  const handleDelete = async (mediaId: string) => {
    await runMutation(() => api.delete(`/communities/${communityId}/media/${mediaId}`), {
      confirmMessage: "Yakin ingin menghapus media ini?",
      fallbackMessage: "Gagal menghapus media.",
      onSuccess: fetchMedia,
    });
  };

  const handlePublishToggle = async (item: MediaItem) => {
    await runMutation(() => api.put(`/communities/${communityId}/media/${item.id}`, { isPublished: !item.isPublished }), {
      fallbackMessage: "Gagal mengubah status publish.",
      onSuccess: fetchMedia,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-komuna-navy">Community Content</h2>
          <p className="mt-1 text-sm text-slate-500">Media, pengumuman, berita, galeri, dan diskusi komunitas.</p>
        </div>
        <div className="flex overflow-x-auto gap-1 border-b border-gray-200 pb-px flex-1">
          {[{ value: "", label: "Semua" }, { value: "ANNOUNCEMENT", label: "Pengumuman" }, { value: "NEWS", label: "Berita" }, { value: "GALLERY", label: "Galeri" }, { value: "FORUM_POST", label: "Diskusi" }].map((f) => (
            <button key={f.value} onClick={() => setTypeFilter(f.value)} className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${typeFilter === f.value ? "border-komuna-blue text-komuna-blue" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
              {f.label}
            </button>
          ))}
        </div>
        {canManage && (
          <button onClick={() => setShowCreateModal(true)} className="px-4 py-2 bg-komuna-blue text-white text-sm font-medium rounded-lg hover:bg-komuna-navy transition-colors flex items-center gap-2 flex-shrink-0">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Buat Media
          </button>
        )}
      </div>

      {loading ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center"><div className="h-8 w-8 border-4 border-komuna-blue border-t-transparent rounded-full animate-spin mx-auto" /></div>
      ) : media.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-400 text-sm">
          Belum ada media. {canManage && "Buat pengumuman, berita, atau galeri baru."}
        </div>
      ) : (
        <div className="space-y-3">
          {media.map((item) => {
            const meta = MEDIA_TYPE_META[item.type] || { label: item.type, badge: "bg-gray-100 text-gray-600" };
            return (
            <div key={item.id} className="bg-white rounded-xl shadow-sm p-5">
              <div className="flex items-start gap-3">
                {item.imageUrl && <img src={item.imageUrl} alt="" className="h-12 w-12 rounded-lg object-cover flex-shrink-0" />}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-medium text-komuna-navy">{item.title}</h4>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${meta.badge}`}>
                      {meta.label}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${item.isPublished ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {item.isPublished ? "Dipublikasikan" : "Draft"}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">{item.content}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    Oleh {item.createdBy.name} · {new Date(item.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                </div>
                {canManage && (
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button onClick={() => handlePublishToggle(item)} className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${item.isPublished ? "text-amber-600 hover:bg-amber-50" : "text-green-600 hover:bg-green-50"}`}>
                      {item.isPublished ? "Unpublish" : "Publish"}
                    </button>
                    <button onClick={() => { setEditId(item.id); setEditForm({ title: item.title, content: item.content, type: item.type, isPublished: item.isPublished, imageUrl: item.imageUrl || "" }); }} className="p-1.5 text-gray-400 hover:text-komuna-blue hover:bg-komuna-blue/5 rounded transition-colors">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </button>
                    <button onClick={() => handleDelete(item.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                )}
              </div>
            </div>
            );
          })}
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowCreateModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 p-6">
            <button onClick={() => setShowCreateModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
            <h3 className="text-lg font-semibold text-komuna-navy mb-4">Buat Media Baru</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipe</label>
                <select value={createForm.type} onChange={(e) => setCreateForm({ ...createForm, type: e.target.value as "ANNOUNCEMENT" | "NEWS" | "GALLERY" })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-komuna-blue outline-none">
                  <option value="ANNOUNCEMENT">Pengumuman</option>
                  <option value="NEWS">Berita</option>
                  <option value="GALLERY">Galeri</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Judul</label>
                <input type="text" value={createForm.title} onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-komuna-blue outline-none" placeholder="Judul pengumuman..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Konten</label>
                <textarea value={createForm.content} onChange={(e) => setCreateForm({ ...createForm, content: e.target.value })} rows={6} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-komuna-blue outline-none resize-none" placeholder="Tulis konten..." />
              </div>
              {createForm.type === "GALLERY" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">URL Gambar</label>
                  <input type="url" value={createForm.imageUrl} onChange={(e) => setCreateForm({ ...createForm, imageUrl: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-komuna-blue outline-none" placeholder="https://..." />
                </div>
              )}
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" checked={createForm.isPublished} onChange={(e) => setCreateForm({ ...createForm, isPublished: e.target.checked })} className="rounded text-komuna-blue focus:ring-komuna-blue" />
                Langsung publikasikan
              </label>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">Batal</button>
              <button onClick={handleCreate} disabled={creating || !createForm.title.trim() || !createForm.content.trim()} className="px-4 py-2 text-sm font-medium text-white bg-komuna-blue rounded-lg hover:bg-komuna-navy disabled:opacity-50 transition-colors">{creating ? "Membuat..." : "Buat"}</button>
            </div>
          </div>
        </div>
      )}

      {editId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setEditId(null)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 p-6">
            <button onClick={() => setEditId(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
            <h3 className="text-lg font-semibold text-komuna-navy mb-4">Edit Media</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipe</label>
                <select value={editForm.type} onChange={(e) => setEditForm({ ...editForm, type: e.target.value as MediaItem["type"] })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-komuna-blue outline-none">
                  <option value="ANNOUNCEMENT">Pengumuman</option>
                  <option value="NEWS">Berita</option>
                  <option value="GALLERY">Galeri</option>
                  <option value="FORUM_POST">Diskusi</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Judul</label>
                <input type="text" value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-komuna-blue outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Konten</label>
                <textarea value={editForm.content} onChange={(e) => setEditForm({ ...editForm, content: e.target.value })} rows={6} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-komuna-blue outline-none resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL Gambar</label>
                <input type="url" value={editForm.imageUrl} onChange={(e) => setEditForm({ ...editForm, imageUrl: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-komuna-blue outline-none" placeholder="https://..." />
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" checked={editForm.isPublished} onChange={(e) => setEditForm({ ...editForm, isPublished: e.target.checked })} className="rounded text-komuna-blue focus:ring-komuna-blue" />
                Dipublikasikan
              </label>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setEditId(null)} className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">Batal</button>
              <button onClick={handleUpdate} disabled={creating || !editForm.title.trim() || !editForm.content.trim()} className="px-4 py-2 text-sm font-medium text-white bg-komuna-blue rounded-lg hover:bg-komuna-navy disabled:opacity-50 transition-colors">{creating ? "Menyimpan..." : "Simpan"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
