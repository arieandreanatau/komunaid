"use client";

import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";

interface NotificationItem {
  id: string; title: string; message: string; type: string; isRead: boolean; link: string | null;
  user: { id: string; name: string; email: string }; createdAt: string;
}
interface Template { id: string; name: string; title: string; message: string; type: string; isActive: boolean; createdAt: string; }
interface Pagination { page: number; limit: number; total: number; totalPages: number; }

const typeColors: Record<string, string> = {
  SYSTEM: "bg-gray-100 text-gray-600", COMMUNITY: "bg-blue-100 text-blue-700",
  ORGANIZATION: "bg-teal-100 text-teal-700", EVENT: "bg-purple-100 text-purple-700",
  REPORT: "bg-red-100 text-red-700", APPROVAL: "bg-green-100 text-green-700",
};

function formatTime(d: string) { return new Date(d).toLocaleString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }); }

export default function NotificationsPage() {
  const [activeSection, setActiveSection] = useState<"queue" | "templates">("queue");
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [typeFilter, setTypeFilter] = useState("");
  const [broadcastModal, setBroadcastModal] = useState(false);
  const [broadcastForm, setBroadcastForm] = useState({ title: "", message: "", type: "SYSTEM", targetRoles: [] as string[] });
  const [templateModal, setTemplateModal] = useState<{ mode: "create" | "edit"; template?: Template } | null>(null);
  const [templateForm, setTemplateForm] = useState({ name: "", title: "", message: "", type: "SYSTEM" });
  const [actionLoading, setActionLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = { page, limit: 20 };
      if (typeFilter) params.type = typeFilter;
      const { data } = await api.get("/admin/notifications", { params });
      setNotifications(data.data || []);
      setPagination(data.pagination || { page: 1, limit: 20, total: 0, totalPages: 1 });
    } catch { /* empty */ }
    finally { setLoading(false); }
  }, [page, typeFilter]);

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/admin/notification-templates");
      setTemplates(data.data || []);
    } catch { /* empty */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (activeSection === "queue") fetchNotifications();
    else fetchTemplates();
  }, [activeSection, fetchNotifications, fetchTemplates]);

  const handleBroadcast = async () => {
    setActionLoading(true);
    try {
      await api.post("/admin/notifications/broadcast", broadcastForm);
      setBroadcastModal(false);
      setBroadcastForm({ title: "", message: "", type: "SYSTEM", targetRoles: [] });
      if (activeSection === "queue") fetchNotifications();
    } catch { /* empty */ }
    finally { setActionLoading(false); }
  };

  const handleSaveTemplate = async () => {
    setActionLoading(true);
    try {
      if (templateModal?.mode === "create") {
        await api.post("/admin/notification-templates", templateForm);
      } else if (templateModal?.template) {
        await api.put(`/admin/notification-templates/${templateModal.template.id}`, templateForm);
      }
      setTemplateModal(null); fetchTemplates();
    } catch { /* empty */ }
    finally { setActionLoading(false); }
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm("Hapus template ini?")) return;
    try { await api.delete(`/admin/notification-templates/${id}`); fetchTemplates(); }
    catch { /* empty */ }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-komuna-navy">Notification Management</h1>
          <p className="text-sm text-gray-500 mt-1">Kelola notifikasi dan template platform</p></div>
        <div className="flex gap-2">
          <button onClick={() => setBroadcastModal(true)}
            className="px-4 py-2.5 text-sm font-medium text-white bg-komuna-blue rounded-lg hover:bg-komuna-navy transition-colors">
            Broadcast
          </button>
          {activeSection === "templates" && (
            <button onClick={() => { setTemplateModal({ mode: "create" }); setTemplateForm({ name: "", title: "", message: "", type: "SYSTEM" }); }}
              className="px-4 py-2.5 text-sm font-medium text-white bg-komuna-teal rounded-lg hover:bg-komuna-teal/90 transition-colors">
              + Template
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-1 bg-white rounded-lg p-1 shadow-sm w-fit">
        {([["queue", "Notifikasi"], ["templates", "Template"]] as const).map(([k, v]) => (
          <button key={k} onClick={() => setActiveSection(k)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeSection === k ? "bg-komuna-blue text-white" : "text-gray-600 hover:bg-gray-100"}`}>
            {v}
          </button>
        ))}
      </div>

      {activeSection === "queue" && (
        <>
          <div className="flex gap-1 bg-white rounded-lg p-1 shadow-sm overflow-x-auto">
            {[{ v: "", l: "Semua" }, { v: "SYSTEM", l: "System" }, { v: "COMMUNITY", l: "Komunitas" }, { v: "ORGANIZATION", l: "Organisasi" }, { v: "EVENT", l: "Event" }, { v: "APPROVAL", l: "Approval" }].map((t) => (
              <button key={t.v} onClick={() => { setTypeFilter(t.v); setPage(1); }}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${typeFilter === t.v ? "bg-komuna-blue text-white" : "text-gray-600 hover:bg-gray-100"}`}>
                {t.l}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="space-y-3">{Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-4 shadow-sm animate-pulse flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gray-200" />
                <div className="flex-1"><div className="h-4 bg-gray-200 rounded w-1/3 mb-1" /><div className="h-3 bg-gray-200 rounded w-1/4" /></div>
              </div>
            ))}</div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl shadow-sm"><p className="text-gray-500">Tidak ada notifikasi</p></div>
          ) : (
            <>
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                  <thead><tr className="border-b bg-gray-50">
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Judul</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500 hidden md:table-cell">Pesan</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Tipe</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500 hidden md:table-cell">User</th>
                    <th className="text-center px-4 py-3 font-medium text-gray-500">Status</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500 hidden md:table-cell">Waktu</th>
                  </tr></thead>
                  <tbody className="divide-y">
                    {notifications.map((n) => (
                      <tr key={n.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3"><p className="font-medium text-gray-900 truncate max-w-[200px]">{n.title}</p></td>
                        <td className="px-4 py-3 hidden md:table-cell"><p className="text-gray-500 text-xs truncate max-w-[300px]">{n.message}</p></td>
                        <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${typeColors[n.type] || ""}`}>{n.type}</span></td>
                        <td className="px-4 py-3 hidden md:table-cell text-xs text-gray-500">{n.user.name}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`h-2 w-2 rounded-full inline-block ${n.isRead ? "bg-gray-300" : "bg-komuna-blue"}`} />
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell text-xs text-gray-400">{formatTime(n.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {pagination.totalPages > 1 && (
                <div className="flex justify-center items-center gap-1 mt-4">
                  <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                    className="px-3 py-2 rounded-lg text-sm font-medium border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40">Prev</button>
                  {Array.from({ length: Math.min(pagination.totalPages, 7) }, (_, i) => i + 1).map((p) => (
                    <button key={p} onClick={() => setPage(p)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium ${p === page ? "bg-komuna-blue text-white" : "bg-white border border-gray-200 hover:bg-gray-50"}`}>{p}</button>
                  ))}
                  <button onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))} disabled={page === pagination.totalPages}
                    className="px-3 py-2 rounded-lg text-sm font-medium border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40">Next</button>
                </div>
              )}
            </>
          )}
        </>
      )}

      {activeSection === "templates" && (
        loading ? (
          <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-5 shadow-sm animate-pulse"><div className="h-4 bg-gray-200 rounded w-1/3" /></div>
          ))}</div>
        ) : templates.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm"><p className="text-gray-500">Belum ada template</p></div>
        ) : (
          <div className="space-y-3">
            {templates.map((t) => (
              <div key={t.id} className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-komuna-navy">{t.name}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${typeColors[t.type] || ""}`}>{t.type}</span>
                      {!t.isActive && <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">Nonaktif</span>}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{t.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{t.message}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => { setTemplateModal({ mode: "edit", template: t }); setTemplateForm({ name: t.name, title: t.title, message: t.message, type: t.type }); }}
                      className="px-3 py-1.5 text-xs font-medium text-komuna-blue bg-komuna-blue/10 rounded-lg hover:bg-komuna-blue/20">Edit</button>
                    <button onClick={() => handleDeleteTemplate(t.id)}
                      className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100">Hapus</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {broadcastModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 p-6">
            <h3 className="text-lg font-semibold text-komuna-navy mb-4">Broadcast Notifikasi</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Judul *</label>
                <input type="text" value={broadcastForm.title} onChange={(e) => setBroadcastForm({ ...broadcastForm, title: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-komuna-blue/30" placeholder="Judul notifikasi" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pesan *</label>
                <textarea value={broadcastForm.message} onChange={(e) => setBroadcastForm({ ...broadcastForm, message: e.target.value })} rows={4}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-komuna-blue/30" placeholder="Isi pesan notifikasi" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipe</label>
                <select value={broadcastForm.type} onChange={(e) => setBroadcastForm({ ...broadcastForm, type: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-komuna-blue/30">
                  <option value="SYSTEM">System</option><option value="COMMUNITY">Komunitas</option>
                  <option value="ORGANIZATION">Organisasi</option><option value="EVENT">Event</option>
                  <option value="APPROVAL">Approval</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Target Role</label>
                <div className="flex flex-wrap gap-2">
                  {[{ v: "SUPER_ADMIN", l: "Super Admin" }, { v: "PLATFORM_ADMIN", l: "Platform Admin" }, { v: "MEMBER", l: "Member" }].map((r) => (
                    <label key={r.v} className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg text-sm cursor-pointer">
                      <input type="checkbox" checked={broadcastForm.targetRoles.includes(r.v)}
                        onChange={(e) => {
                          const roles = e.target.checked ? [...broadcastForm.targetRoles, r.v] : broadcastForm.targetRoles.filter((x) => x !== r.v);
                          setBroadcastForm({ ...broadcastForm, targetRoles: roles });
                        }}
                        className="rounded border-gray-300 text-komuna-blue focus:ring-komuna-blue" />
                      {r.l}
                    </label>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-1">Kosongkan untuk mengirim ke semua user</p>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setBroadcastModal(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Batal</button>
              <button onClick={handleBroadcast} disabled={actionLoading || !broadcastForm.title || !broadcastForm.message}
                className="px-4 py-2 text-sm font-medium text-white bg-komuna-blue rounded-lg hover:bg-komuna-navy disabled:opacity-50">
                {actionLoading ? "Mengirim..." : "Kirim Broadcast"}
              </button>
            </div>
          </div>
        </div>
      )}

      {templateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 p-6">
            <h3 className="text-lg font-semibold text-komuna-navy mb-4">{templateModal.mode === "create" ? "Tambah Template" : "Edit Template"}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama *</label>
                <input type="text" value={templateForm.name} onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-komuna-blue/30" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Judul *</label>
                <input type="text" value={templateForm.title} onChange={(e) => setTemplateForm({ ...templateForm, title: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-komuna-blue/30" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pesan *</label>
                <textarea value={templateForm.message} onChange={(e) => setTemplateForm({ ...templateForm, message: e.target.value })} rows={4}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-komuna-blue/30" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipe</label>
                <select value={templateForm.type} onChange={(e) => setTemplateForm({ ...templateForm, type: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-komuna-blue/30">
                  <option value="SYSTEM">System</option><option value="COMMUNITY">Komunitas</option>
                  <option value="ORGANIZATION">Organisasi</option><option value="EVENT">Event</option>
                  <option value="APPROVAL">Approval</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setTemplateModal(null)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Batal</button>
              <button onClick={handleSaveTemplate} disabled={actionLoading || !templateForm.name || !templateForm.title || !templateForm.message}
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
