"use client";

import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";
import { useAuth } from "@/components/auth-provider";

interface SettingsData {
  [key: string]: any;
}

type TabKey = "general" | "brand" | "email" | "storage" | "security" | "maintenance";

const tabs: { key: TabKey; label: string; icon: string }[] = [
  { key: "general", label: "Umum", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" },
  { key: "brand", label: "Brand", icon: "M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" },
  { key: "email", label: "Email", icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
  { key: "storage", label: "Penyimpanan", icon: "M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" },
  { key: "security", label: "Keamanan", icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" },
  { key: "maintenance", label: "Maintenance", icon: "M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" },
];

const generalFields = [
  { key: "platform_name", label: "Nama Platform", type: "text", placeholder: "KomunaID" },
  { key: "platform_description", label: "Deskripsi Platform", type: "textarea", placeholder: "Platform komunitas digital Indonesia" },
  { key: "platform_url", label: "URL Platform", type: "url", placeholder: "https://komunaid.com" },
  { key: "support_email", label: "Email Support", type: "email", placeholder: "support@komunaid.com" },
];

const brandFields = [
  { key: "brand_logo_url", label: "Logo URL", type: "url", placeholder: "https://..." },
  { key: "brand_favicon_url", label: "Favicon URL", type: "url", placeholder: "https://..." },
  { key: "brand_primary_color", label: "Warna Primer", type: "text", placeholder: "#1D4ED8" },
  { key: "brand_secondary_color", label: "Warna Sekunder", type: "text", placeholder: "#0A1D4D" },
];

const emailFields = [
  { key: "email_from_name", label: "Nama Pengirim", type: "text", placeholder: "KomunaID" },
  { key: "email_from_address", label: "Alamat Email Pengirim", type: "email", placeholder: "noreply@komunaid.com" },
  { key: "smtp_host", label: "SMTP Host", type: "text", placeholder: "smtp.gmail.com" },
  { key: "smtp_port", label: "SMTP Port", type: "text", placeholder: "587" },
];

const storageFields = [
  { key: "storage_max_upload_size", label: "Max Upload Size (MB)", type: "text", placeholder: "10" },
  { key: "storage_allowed_types", label: "Tipe File yang Diizinkan", type: "text", placeholder: "jpg,png,gif,pdf" },
  { key: "storage_provider", label: "Penyedia Storage", type: "text", placeholder: "local, s3, gcs" },
];

const securityFields = [
  { key: "security_rate_limit", label: "Rate Limit (req/15min)", type: "text", placeholder: "100" },
  { key: "security_session_timeout", label: "Session Timeout (menit)", type: "text", placeholder: "15" },
  { key: "security_max_login_attempts", label: "Max Login Attempts", type: "text", placeholder: "5" },
  { key: "security_lockout_duration", label: "Lockout Duration (menit)", type: "text", placeholder: "30" },
];

const tabFields: Record<TabKey, typeof generalFields> = {
  general: generalFields,
  brand: brandFields,
  email: emailFields,
  storage: storageFields,
  security: securityFields,
  maintenance: [],
};

export default function SettingsPage() {
  const { user } = useAuth();
  const isSuperAdmin = user?.roles?.includes("SUPER_ADMIN");
  const [activeTab, setActiveTab] = useState<TabKey>("general");
  const [settings, setSettings] = useState<SettingsData>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchSettings = useCallback(async () => {
    try {
      const { data } = await api.get("/admin/settings");
      setSettings(data.data || {});
    } catch {
      console.error("Gagal memuat pengaturan");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  if (!isSuperAdmin) {
    return <div className="text-center py-16 text-gray-500">Hanya Super Admin yang dapat mengakses halaman ini.</div>;
  }

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const fields = tabFields[activeTab];
      const payload: Record<string, any> = {};
      if (activeTab === "maintenance") {
        payload.maintenance_mode = settings.maintenance_mode || false;
        payload.maintenance_message = settings.maintenance_message || "";
      } else {
        fields.forEach((f) => {
          payload[f.key] = settings[f.key] || "";
        });
      }
      await api.put(`/admin/settings/platform/general`, payload);
      setMessage({ type: "success", text: "Pengaturan berhasil disimpan" });
    } catch {
      setMessage({ type: "error", text: "Gagal menyimpan pengaturan" });
    } finally {
      setSaving(false);
    }
  };

  const updateField = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded w-48 animate-pulse" />
        <div className="bg-white rounded-xl p-6 shadow-sm animate-pulse space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i}>
              <div className="h-4 bg-gray-200 rounded w-32 mb-2" />
              <div className="h-10 bg-gray-200 rounded w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-komuna-navy">Platform Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Konfigurasi pengaturan platform KomunaID</p>
      </div>

      {message && (
        <div className={`px-4 py-3 rounded-lg text-sm font-medium ${
          message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"
        }`}>
          {message.text}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-56 shrink-0">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-2">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.key
                    ? "bg-komuna-blue/10 text-komuna-blue"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                </svg>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-komuna-navy mb-6">
              Pengaturan {tabs.find((t) => t.key === activeTab)?.label}
            </h2>

            {activeTab === "maintenance" ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Maintenance Mode</h3>
                    <p className="text-xs text-gray-500 mt-0.5">Aktifkan untuk melakukan maintenance platform</p>
                  </div>
                  <button
                    onClick={() => updateField("maintenance_mode", !settings.maintenance_mode)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.maintenance_mode ? "bg-komuna-blue" : "bg-gray-300"
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.maintenance_mode ? "translate-x-6" : "translate-x-1"
                    }`} />
                  </button>
                </div>
                {settings.maintenance_mode && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pesan Maintenance</label>
                    <textarea
                      value={settings.maintenance_message || ""}
                      onChange={(e) => updateField("maintenance_message", e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-komuna-blue/30"
                      placeholder="Platform sedang dalam maintenance. Silakan coba lagi nanti."
                    />
                  </div>
                )}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-700">
                    Ketika maintenance mode aktif, hanya admin yang dapat mengakses platform. User lain akan melihat halaman maintenance.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                {tabFields[activeTab].map((field) => (
                  <div key={field.key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
                    {field.type === "textarea" ? (
                      <textarea
                        value={settings[field.key] || ""}
                        onChange={(e) => updateField(field.key, e.target.value)}
                        rows={3}
                        placeholder={field.placeholder}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-komuna-blue/30 focus:border-komuna-blue"
                      />
                    ) : (
                      <input
                        type={field.type}
                        value={settings[field.key] || ""}
                        onChange={(e) => updateField(field.key, e.target.value)}
                        placeholder={field.placeholder}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-komuna-blue/30 focus:border-komuna-blue"
                      />
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end mt-6 pt-4 border-t">
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2.5 text-sm font-medium text-white bg-komuna-blue rounded-lg hover:bg-komuna-navy transition-colors disabled:opacity-50"
              >
                {saving ? "Menyimpan..." : "Simpan Pengaturan"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
