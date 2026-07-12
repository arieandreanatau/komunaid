"use client";

import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";

interface CmsPage {
  id: string;
  slug: string;
  title: string;
  content: string | null;
  metaTitle: string | null;
  metaDesc: string | null;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Banner {
  id: string;
  title: string;
  imageUrl: string;
  linkUrl: string | null;
  position: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

type Tab = "pages" | "banners";

const positionColors: Record<string, string> = {
  HOME_TOP: "bg-blue-100 text-blue-700",
  HOME_MIDDLE: "bg-teal-100 text-teal-700",
  HOME_BOTTOM: "bg-purple-100 text-purple-700",
  SIDEBAR: "bg-yellow-100 text-yellow-700",
};

const positionLabels: Record<string, string> = {
  HOME_TOP: "Homepage Atas",
  HOME_MIDDLE: "Homepage Tengah",
  HOME_BOTTOM: "Homepage Bawah",
  SIDEBAR: "Sidebar",
};

const pageSlugs = [
  { value: "tentang-kami", label: "Tentang Kami" },
  { value: "kontak", label: "Kontak" },
  { value: "faq", label: "FAQ" },
  { value: "kebijakan-privasi", label: "Kebijakan Privasi" },
  { value: "syarat-ketentuan", label: "Syarat & Ketentuan" },
];

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(d: string) {
  return new Date(d).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function CmsHomepagePage() {
  const [activeTab, setActiveTab] = useState<Tab>("pages");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-komuna-navy">Homepage & Banner</h1>
        <p className="text-sm text-gray-500 mt-1">
          Kelola konten halaman utama dan banner platform
        </p>
      </div>

      <div className="flex gap-1 bg-white rounded-lg p-1 shadow-sm w-fit">
        {([
          { key: "pages" as Tab, label: "Halaman" },
          { key: "banners" as Tab, label: "Banner" },
        ]).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === tab.key
                ? "bg-komuna-blue text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "pages" ? <PagesTab /> : <BannersTab />}
    </div>
  );
}

function PagesTab() {
  const [pages, setPages] = useState<CmsPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState<{
    mode: "create" | "edit";
    page?: CmsPage;
  } | null>(null);
  const [form, setForm] = useState({
    slug: "",
    title: "",
    content: "",
    metaTitle: "",
    metaDesc: "",
    isPublished: false,
  });
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const fetchPages = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/admin/cms/pages", {
        params: { page, limit: 10 },
      });
      setPages(data.data || []);
      setPagination(
        data.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 }
      );
    } catch {
      /* empty */
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchPages();
  }, [fetchPages]);

  useEffect(() => {
    if (feedback) {
      const t = setTimeout(() => setFeedback(null), 3000);
      return () => clearTimeout(t);
    }
  }, [feedback]);

  const openCreate = () => {
    setForm({
      slug: "",
      title: "",
      content: "",
      metaTitle: "",
      metaDesc: "",
      isPublished: false,
    });
    setModal({ mode: "create" });
  };

  const openEdit = (p: CmsPage) => {
    setForm({
      slug: p.slug,
      title: p.title,
      content: p.content || "",
      metaTitle: p.metaTitle || "",
      metaDesc: p.metaDesc || "",
      isPublished: p.isPublished,
    });
    setModal({ mode: "edit", page: p });
  };

  const handleSave = async () => {
    setActionLoading(true);
    try {
      const payload = {
        ...form,
        content: form.content || null,
        metaTitle: form.metaTitle || null,
        metaDesc: form.metaDesc || null,
      };
      if (modal?.mode === "create") {
        await api.post("/admin/cms/pages", payload);
        setFeedback({ type: "success", message: "Halaman berhasil dibuat" });
      } else if (modal?.page) {
        await api.put(`/admin/cms/pages/${modal.page.id}`, payload);
        setFeedback({ type: "success", message: "Halaman berhasil diperbarui" });
      }
      setModal(null);
      fetchPages();
    } catch (err: any) {
      setFeedback({
        type: "error",
        message:
          err.response?.data?.message || "Gagal menyimpan halaman",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (p: CmsPage) => {
    if (!confirm(`Hapus halaman "${p.title}"?`)) return;
    try {
      await api.delete(`/admin/cms/pages/${p.id}`);
      setFeedback({ type: "success", message: "Halaman berhasil dihapus" });
      fetchPages();
    } catch {
      setFeedback({ type: "error", message: "Gagal menghapus halaman" });
    }
  };

  const handleTogglePublish = async (p: CmsPage) => {
    try {
      await api.put(`/admin/cms/pages/${p.id}`, {
        isPublished: !p.isPublished,
      });
      setFeedback({
        type: "success",
        message: p.isPublished
          ? "Halaman disembunyikan"
          : "Halaman dipublikasikan",
      });
      fetchPages();
    } catch {
      setFeedback({
        type: "error",
        message: "Gagal mengubah status publikasi",
      });
    }
  };

  return (
    <div className="space-y-4">
      {feedback && (
        <div
          className={`px-4 py-3 rounded-lg text-sm font-medium ${
            feedback.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {feedback.message}
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={openCreate}
          className="px-4 py-2.5 text-sm font-medium text-white bg-komuna-blue rounded-lg hover:bg-komuna-navy transition-colors"
        >
          + Tambah Halaman
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl p-4 shadow-sm animate-pulse"
            >
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-1/4" />
            </div>
          ))}
        </div>
      ) : pages.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-sm">
          <svg
            className="h-12 w-12 text-gray-300 mx-auto mb-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p className="text-gray-500">Belum ada halaman CMS</p>
          <p className="text-sm text-gray-400 mt-1">
            Klik "Tambah Halaman" untuk membuat halaman baru
          </p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left px-4 py-3 font-medium text-gray-500">
                      Halaman
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500 hidden md:table-cell">
                      Slug
                    </th>
                    <th className="text-center px-4 py-3 font-medium text-gray-500">
                      Status
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500 hidden md:table-cell">
                      Diperbarui
                    </th>
                    <th className="text-right px-4 py-3 font-medium text-gray-500">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {pages.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-gray-900">
                            {p.title}
                          </p>
                          {p.metaTitle && (
                            <p className="text-xs text-gray-400 mt-0.5">
                              {p.metaTitle}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <code className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600">
                          /{p.slug}
                        </code>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleTogglePublish(p)}
                          className={`px-2 py-0.5 rounded-full text-xs font-medium cursor-pointer transition-colors ${
                            p.isPublished
                              ? "bg-green-100 text-green-700 hover:bg-green-200"
                              : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                          }`}
                        >
                          {p.isPublished ? "Published" : "Draft"}
                        </button>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-gray-500 text-xs">
                        {formatDateTime(p.updatedAt)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEdit(p)}
                            className="px-3 py-1.5 text-xs font-medium text-komuna-blue bg-komuna-blue/10 rounded-lg hover:bg-komuna-blue/20"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(p)}
                            className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100"
                          >
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {pagination.totalPages > 1 && (
            <div className="flex justify-center items-center gap-1 mt-6">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-2 rounded-lg text-sm font-medium border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40"
              >
                Prev
              </button>
              {Array.from(
                { length: Math.min(pagination.totalPages, 7) },
                (_, i) => i + 1
              ).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium ${
                    p === page
                      ? "bg-komuna-blue text-white"
                      : "bg-white border border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() =>
                  setPage((p) => Math.min(pagination.totalPages, p + 1))
                }
                disabled={page === pagination.totalPages}
                className="px-3 py-2 rounded-lg text-sm font-medium border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 rounded-t-xl">
              <h3 className="text-lg font-semibold text-komuna-navy">
                {modal.mode === "create"
                  ? "Tambah Halaman"
                  : "Edit Halaman"}
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Judul *
                  </label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        title: e.target.value,
                        slug:
                          modal.mode === "create"
                            ? e.target.value
                                .toLowerCase()
                                .replace(/[^a-z0-9]+/g, "-")
                                .replace(/(^-|-$)/g, "")
                            : form.slug,
                      })
                    }
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-komuna-blue/30"
                    placeholder="Judul halaman"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Slug *
                  </label>
                  <div className="flex items-center gap-0">
                    <span className="px-3 py-2.5 bg-gray-50 border border-r-0 border-gray-200 rounded-l-lg text-sm text-gray-400">
                      /
                    </span>
                    <input
                      type="text"
                      value={form.slug}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          slug: e.target.value
                            .toLowerCase()
                            .replace(/[^a-z0-9-]/g, ""),
                        })
                      }
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-r-lg text-sm focus:outline-none focus:ring-2 focus:ring-komuna-blue/30"
                      placeholder="slug-halaman"
                    />
                  </div>
                  {modal.mode === "create" && (
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {pageSlugs.map((s) => (
                        <button
                          key={s.value}
                          type="button"
                          onClick={() =>
                            setForm({ ...form, slug: s.value, title: s.label })
                          }
                          className="px-2 py-0.5 text-xs bg-komuna-teal/10 text-komuna-teal rounded hover:bg-komuna-teal/20 transition-colors"
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Konten
                </label>
                <textarea
                  value={form.content}
                  onChange={(e) =>
                    setForm({ ...form, content: e.target.value })
                  }
                  rows={10}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm resize-y focus:outline-none focus:ring-2 focus:ring-komuna-blue/30"
                  placeholder="Konten halaman (mendukung HTML)"
                />
              </div>

              <div className="border-t pt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  SEO Settings
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Meta Title
                    </label>
                    <input
                      type="text"
                      value={form.metaTitle}
                      onChange={(e) =>
                        setForm({ ...form, metaTitle: e.target.value })
                      }
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-komuna-blue/30"
                      placeholder="Judul untuk SEO (opsional)"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Meta Description
                    </label>
                    <textarea
                      value={form.metaDesc}
                      onChange={(e) =>
                        setForm({ ...form, metaDesc: e.target.value })
                      }
                      rows={2}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-komuna-blue/30"
                      placeholder="Deskripsi untuk SEO (opsional)"
                    />
                  </div>
                </div>
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <div
                  className={`relative w-10 h-6 rounded-full transition-colors ${
                    form.isPublished ? "bg-komuna-blue" : "bg-gray-300"
                  }`}
                  onClick={() =>
                    setForm({ ...form, isPublished: !form.isPublished })
                  }
                >
                  <div
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      form.isPublished ? "translate-x-4" : ""
                    }`}
                  />
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {form.isPublished ? "Published" : "Draft"}
                </span>
              </label>
            </div>
            <div className="sticky bottom-0 bg-white border-t px-6 py-4 rounded-b-xl flex justify-end gap-3">
              <button
                onClick={() => setModal(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Batal
              </button>
              <button
                onClick={handleSave}
                disabled={actionLoading || !form.title.trim() || !form.slug.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-komuna-blue rounded-lg hover:bg-komuna-navy disabled:opacity-50"
              >
                {actionLoading ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function BannersTab() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState<{
    mode: "create" | "edit";
    banner?: Banner;
  } | null>(null);
  const [form, setForm] = useState({
    title: "",
    imageUrl: "",
    linkUrl: "",
    position: "HOME_TOP",
    isActive: true,
  });
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const fetchBanners = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/admin/cms/banners", {
        params: { page, limit: 10 },
      });
      setBanners(data.data || []);
      setPagination(
        data.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 }
      );
    } catch {
      /* empty */
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  useEffect(() => {
    if (feedback) {
      const t = setTimeout(() => setFeedback(null), 3000);
      return () => clearTimeout(t);
    }
  }, [feedback]);

  const openCreate = () => {
    setForm({
      title: "",
      imageUrl: "",
      linkUrl: "",
      position: "HOME_TOP",
      isActive: true,
    });
    setModal({ mode: "create" });
  };

  const openEdit = (b: Banner) => {
    setForm({
      title: b.title,
      imageUrl: b.imageUrl,
      linkUrl: b.linkUrl || "",
      position: b.position,
      isActive: b.isActive,
    });
    setModal({ mode: "edit", banner: b });
  };

  const handleSave = async () => {
    setActionLoading(true);
    try {
      const payload = {
        ...form,
        linkUrl: form.linkUrl || null,
      };
      if (modal?.mode === "create") {
        await api.post("/admin/cms/banners", payload);
        setFeedback({ type: "success", message: "Banner berhasil dibuat" });
      } else if (modal?.banner) {
        await api.put(`/admin/cms/banners/${modal.banner.id}`, payload);
        setFeedback({ type: "success", message: "Banner berhasil diperbarui" });
      }
      setModal(null);
      fetchBanners();
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err.response?.data?.message || "Gagal menyimpan banner",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (b: Banner) => {
    if (!confirm(`Hapus banner "${b.title}"?`)) return;
    try {
      await api.delete(`/admin/cms/banners/${b.id}`);
      setFeedback({ type: "success", message: "Banner berhasil dihapus" });
      fetchBanners();
    } catch {
      setFeedback({ type: "error", message: "Gagal menghapus banner" });
    }
  };

  const handleToggleActive = async (b: Banner) => {
    try {
      await api.put(`/admin/cms/banners/${b.id}`, {
        isActive: !b.isActive,
      });
      setFeedback({
        type: "success",
        message: b.isActive ? "Banner dinonaktifkan" : "Banner diaktifkan",
      });
      fetchBanners();
    } catch {
      setFeedback({
        type: "error",
        message: "Gagal mengubah status banner",
      });
    }
  };

  return (
    <div className="space-y-4">
      {feedback && (
        <div
          className={`px-4 py-3 rounded-lg text-sm font-medium ${
            feedback.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {feedback.message}
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={openCreate}
          className="px-4 py-2.5 text-sm font-medium text-white bg-komuna-blue rounded-lg hover:bg-komuna-navy transition-colors"
        >
          + Tambah Banner
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl p-4 shadow-sm animate-pulse"
            >
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-1/4" />
            </div>
          ))}
        </div>
      ) : banners.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-sm">
          <svg
            className="h-12 w-12 text-gray-300 mx-auto mb-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="text-gray-500">Belum ada banner</p>
          <p className="text-sm text-gray-400 mt-1">
            Klik "Tambah Banner" untuk membuat banner baru
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {banners.map((b) => (
              <div
                key={b.id}
                className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden ${
                  !b.isActive ? "opacity-60" : ""
                }`}
              >
                <div className="aspect-video bg-gray-100 relative">
                  <img
                    src={b.imageUrl}
                    alt={b.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                  <div className="absolute top-2 left-2 flex gap-1">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        positionColors[b.position] || "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {positionLabels[b.position] || b.position}
                    </span>
                  </div>
                  <div className="absolute top-2 right-2">
                    <button
                      onClick={() => handleToggleActive(b)}
                      className={`px-2 py-0.5 rounded-full text-xs font-medium cursor-pointer transition-colors ${
                        b.isActive
                          ? "bg-green-100 text-green-700 hover:bg-green-200"
                          : "bg-gray-200 text-gray-500 hover:bg-gray-300"
                      }`}
                    >
                      {b.isActive ? "Aktif" : "Nonaktif"}
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-gray-900 truncate">
                    {b.title}
                  </h3>
                  {b.linkUrl && (
                    <p className="text-xs text-gray-400 mt-1 truncate">
                      {b.linkUrl}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    Dibuat {formatDate(b.createdAt)}
                  </p>
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t">
                    <button
                      onClick={() => openEdit(b)}
                      className="flex-1 px-3 py-1.5 text-xs font-medium text-komuna-blue bg-komuna-blue/10 rounded-lg hover:bg-komuna-blue/20"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(b)}
                      className="flex-1 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {pagination.totalPages > 1 && (
            <div className="flex justify-center items-center gap-1 mt-6">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-2 rounded-lg text-sm font-medium border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40"
              >
                Prev
              </button>
              {Array.from(
                { length: Math.min(pagination.totalPages, 7) },
                (_, i) => i + 1
              ).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium ${
                    p === page
                      ? "bg-komuna-blue text-white"
                      : "bg-white border border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() =>
                  setPage((p) => Math.min(pagination.totalPages, p + 1))
                }
                disabled={page === pagination.totalPages}
                className="px-3 py-2 rounded-lg text-sm font-medium border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 rounded-t-xl">
              <h3 className="text-lg font-semibold text-komuna-navy">
                {modal.mode === "create" ? "Tambah Banner" : "Edit Banner"}
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Judul Banner *
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) =>
                    setForm({ ...form, title: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-komuna-blue/30"
                  placeholder="Judul banner"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL Gambar *
                </label>
                <input
                  type="url"
                  value={form.imageUrl}
                  onChange={(e) =>
                    setForm({ ...form, imageUrl: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-komuna-blue/30"
                  placeholder="https://example.com/banner.jpg"
                />
                {form.imageUrl && (
                  <div className="mt-2 rounded-lg overflow-hidden border border-gray-200 aspect-video bg-gray-50">
                    <img
                      src={form.imageUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL Tautan
                </label>
                <input
                  type="url"
                  value={form.linkUrl}
                  onChange={(e) =>
                    setForm({ ...form, linkUrl: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-komuna-blue/30"
                  placeholder="https://example.com (opsional)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Posisi *
                </label>
                <select
                  value={form.position}
                  onChange={(e) =>
                    setForm({ ...form, position: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-komuna-blue/30"
                >
                  <option value="HOME_TOP">Homepage Atas</option>
                  <option value="HOME_MIDDLE">Homepage Tengah</option>
                  <option value="HOME_BOTTOM">Homepage Bawah</option>
                  <option value="SIDEBAR">Sidebar</option>
                </select>
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <div
                  className={`relative w-10 h-6 rounded-full transition-colors ${
                    form.isActive ? "bg-komuna-blue" : "bg-gray-300"
                  }`}
                  onClick={() =>
                    setForm({ ...form, isActive: !form.isActive })
                  }
                >
                  <div
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      form.isActive ? "translate-x-4" : ""
                    }`}
                  />
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {form.isActive ? "Aktif" : "Nonaktif"}
                </span>
              </label>
            </div>
            <div className="sticky bottom-0 bg-white border-t px-6 py-4 rounded-b-xl flex justify-end gap-3">
              <button
                onClick={() => setModal(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Batal
              </button>
              <button
                onClick={handleSave}
                disabled={
                  actionLoading || !form.title.trim() || !form.imageUrl.trim()
                }
                className="px-4 py-2 text-sm font-medium text-white bg-komuna-blue rounded-lg hover:bg-komuna-navy disabled:opacity-50"
              >
                {actionLoading ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
