"use client";

import { can, type CommunityRole } from "@komunaid/shared";
import { AddressSelector, type AddressValue } from "@/components/address-selector";
import type { CommunitySettingsToggles, PengaturanForm } from "./types";

export function PengaturanTab({
  form,
  setForm,
  onSave,
  saving,
  success,
  error,
  role,
  categories,
  communitySettingsForm,
  setCommunitySettingsForm,
  onSaveCommunitySettings,
  communitySettingsLoading,
  communitySettingsSaving,
  communitySettingsSuccess,
  communitySettingsError,
}: {
  form: PengaturanForm;
  setForm: (v: PengaturanForm) => void;
  onSave: () => void;
  saving: boolean;
  success: string;
  error: string;
  /** The viewer's own community role. `canManage` (editSettings) and the
   * Danger Zone's visibility (manageDangerZone) are both derived from this
   * through can() -- never from an ownership boolean. */
  role: CommunityRole | null;
  categories: { id: string; name: string; icon: string }[];
  communitySettingsForm: CommunitySettingsToggles;
  setCommunitySettingsForm: (v: CommunitySettingsToggles) => void;
  onSaveCommunitySettings: () => void;
  communitySettingsLoading: boolean;
  communitySettingsSaving: boolean;
  communitySettingsSuccess: string;
  communitySettingsError: string;
}) {
  const canManage = can(role, "editSettings");
  const canManageDangerZone = can(role, "manageDangerZone");
  const address: AddressValue = {
    address: form.address,
    province: form.province,
    city: form.city,
    district: form.district,
    village: form.village,
    postalCode: form.postalCode,
  };
  const toggleCategory = (id: string) => {
    const current = form.categoryIds || [];
    setForm({
      ...form,
      categoryIds: current.includes(id) ? current.filter((c) => c !== id) : [...current, id],
    });
  };
  return (
      <div className="space-y-5">
        <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h3 className="text-lg font-semibold text-komuna-navy mb-2">Pengaturan Komunitas</h3>
        <p className="mb-6 text-sm text-slate-500">General, visibility, lokasi, dan detail operasional komunitas.</p>

      {success && (
        <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm p-3 rounded-lg flex items-center gap-2">
          <svg className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {success}
        </div>
      )}

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-lg flex items-center gap-2">
          <svg className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          {error}
        </div>
      )}

      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nama Komunitas</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            disabled={!canManage}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue outline-none disabled:bg-gray-50 disabled:text-gray-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            disabled={!canManage}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue outline-none resize-none disabled:bg-gray-50 disabled:text-gray-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Visibilitas</label>
            <select
              value={form.visibility}
              onChange={(e) => setForm({ ...form, visibility: e.target.value })}
              disabled={!canManage}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue outline-none disabled:bg-gray-50"
            >
              <option value="PUBLIC">Publik</option>
              <option value="PRIVATE">Privat</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipe Keanggotaan</label>
            <select
              value={form.membershipType}
              onChange={(e) => setForm({ ...form, membershipType: e.target.value })}
              disabled={!canManage}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue outline-none disabled:bg-gray-50"
            >
              <option value="OPEN">Terbuka</option>
              <option value="RESTRICTED">Terbatas</option>
            </select>
          </div>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-bold text-komuna-navy">Lokasi</h4>
          <AddressSelector value={address} onChange={(next) => setForm({ ...form, ...next })} disabled={!canManage} />
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Alamat 2 <span className="text-gray-400 font-normal">(opsional)</span></label>
              <input
                type="text"
                value={form.address2}
                onChange={(e) => setForm({ ...form, address2: e.target.value })}
                disabled={!canManage}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue outline-none disabled:bg-gray-50 disabled:text-gray-500"
                placeholder="Blok A No. 5, RT 01/RW 02"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Negara</label>
              <input
                type="text"
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
                disabled={!canManage}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue outline-none disabled:bg-gray-50 disabled:text-gray-500"
                placeholder="Indonesia"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
          <input
            type="url"
            value={form.website}
            onChange={(e) => setForm({ ...form, website: e.target.value })}
            disabled={!canManage}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue outline-none disabled:bg-gray-50 disabled:text-gray-500"
            placeholder="https://example.com"
          />
        </div>

        <div className="border-t border-gray-100 pt-5">
          <h4 className="mb-3 text-sm font-bold text-komuna-navy">Media</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">URL Banner</label>
              <input
                type="url"
                value={form.banner}
                onChange={(e) => setForm({ ...form, banner: e.target.value })}
                disabled={!canManage}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue outline-none disabled:bg-gray-50 disabled:text-gray-500"
                placeholder="https://example.com/banner.jpg"
              />
              {form.banner && (
                <div className="mt-2 rounded-lg overflow-hidden border border-gray-200 h-32 bg-gray-100">
                  <img src={form.banner} alt="Preview Banner" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">URL Logo</label>
              <input
                type="url"
                value={form.logo}
                onChange={(e) => setForm({ ...form, logo: e.target.value })}
                disabled={!canManage}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue outline-none disabled:bg-gray-50 disabled:text-gray-500"
                placeholder="https://example.com/logo.png"
              />
              {form.logo && (
                <div className="mt-2 h-20 w-20 rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                  <img src={form.logo} alt="Preview Logo" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                </div>
              )}
            </div>
          </div>
        </div>

        {categories.length > 0 && (
          <div className="border-t border-gray-100 pt-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">Kategori</label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => {
                const isSelected = form.categoryIds?.includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => toggleCategory(cat.id)}
                    disabled={!canManage}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors disabled:opacity-50 ${
                      isSelected ? "bg-komuna-blue text-white border-komuna-blue" : "bg-white text-gray-600 border-gray-200 hover:border-komuna-blue/50 hover:text-komuna-blue"
                    }`}
                  >
                    {cat.icon && <span className="mr-1">{cat.icon}</span>}
                    {cat.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="border-t border-gray-100 pt-5">
          <label className="block text-sm font-medium text-gray-700 mb-1">Tag</label>
          <input
            type="text"
            value={form.tagsInput}
            onChange={(e) => setForm({ ...form, tagsInput: e.target.value })}
            disabled={!canManage}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue outline-none disabled:bg-gray-50 disabled:text-gray-500"
            placeholder="Pisahkan dengan koma: javascript, react, nodejs"
          />
          <p className="mt-1 text-xs text-gray-400">Pisahkan dengan koma, maksimal 10 tag</p>
        </div>

        {canManage && (
          <div className="flex justify-end pt-2">
            <button
              onClick={onSave}
              disabled={saving}
              className="px-5 py-2 bg-komuna-blue text-white text-sm font-medium rounded-lg hover:bg-komuna-navy disabled:opacity-50 transition-colors inline-flex items-center gap-2"
            >
              {saving && <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              {saving ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        )}

        {!canManage && (
          <p className="text-xs text-gray-400 text-right pt-2">Anda tidak memiliki izin untuk mengubah pengaturan ini.</p>
        )}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h3 className="text-lg font-semibold text-komuna-navy mb-2">Pengaturan Interaksi</h3>
          <p className="mb-6 text-sm text-slate-500">Kontrol visibilitas anggota, event, dan postingan komunitas.</p>

          {communitySettingsSuccess && (
            <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm p-3 rounded-lg flex items-center gap-2">
              <svg className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {communitySettingsSuccess}
            </div>
          )}

          {communitySettingsError && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-lg flex items-center gap-2">
              <svg className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              {communitySettingsError}
            </div>
          )}

          {communitySettingsLoading ? (
            <div className="py-6 text-center text-sm text-gray-400">Memuat pengaturan komunitas...</div>
          ) : (
            <div className="space-y-4">
              {([
                { key: "allowMemberPost" as const, label: "Izinkan Anggota Posting", desc: "Anggota dapat membuat postingan di komunitas." },
                { key: "requireApproval" as const, label: "Persetujuan Wajib", desc: "Postingan anggota harus disetujui admin sebelum tampil." },
                { key: "showMemberList" as const, label: "Tampilkan Daftar Anggota", desc: "Daftar anggota terlihat di halaman publik komunitas." },
                { key: "showEventList" as const, label: "Tampilkan Daftar Event", desc: "Event terlihat di halaman publik komunitas." },
              ]).map((item, i) => (
                <div key={item.key}>
                  {i > 0 && <div className="border-t border-gray-100 mb-4" />}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-700">{item.label}</p>
                      <p className="text-xs text-gray-500">{item.desc}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => canManage && setCommunitySettingsForm({ ...communitySettingsForm, [item.key]: !communitySettingsForm[item.key] })}
                      disabled={!canManage}
                      aria-pressed={communitySettingsForm[item.key]}
                      className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors disabled:opacity-50 ${
                        communitySettingsForm[item.key] ? "bg-komuna-blue" : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          communitySettingsForm[item.key] ? "translate-x-7" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              ))}
              {canManage && (
                <div className="flex justify-end pt-2">
                  <button
                    onClick={onSaveCommunitySettings}
                    disabled={communitySettingsSaving}
                    className="px-5 py-2 bg-komuna-blue text-white text-sm font-medium rounded-lg hover:bg-komuna-navy disabled:opacity-50 transition-colors inline-flex items-center gap-2"
                  >
                    {communitySettingsSaving && <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                    {communitySettingsSaving ? "Menyimpan..." : "Simpan Pengaturan Komunitas"}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {canManageDangerZone && (
          <div className="rounded-xl border border-red-200 bg-red-50/40 p-5">
            <p className="text-sm font-bold text-red-700">Danger Zone</p>
            <p className="mt-1 text-sm text-red-600">Deactivate dan delete memerlukan governance API dengan audit trail. Action belum diekspos sampai endpoint terverifikasi.</p>
          </div>
        )}
      </div>
    </div>
  );
}
