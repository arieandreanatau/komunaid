"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { Header } from "@/components/header";
import { useAuth } from "@/components/auth-provider";
import { FeatureDisabledBanner } from "@/components/feature-disabled-banner";
import { featureFlags } from "@/lib/feature-flags";

interface Category {
  id: string;
  name: string;
  icon: string;
}

interface WizardForm {
  name: string;
  description: string;
  categoryIds: string[];
  logo: string;
  banner: string;
  address1: string;
  address2: string;
  postalCode: string;
  kelurahan: string;
  district: string;
  country: string;
  province: string;
  city: string;
  website: string;
  instagram: string;
  contactEmail: string;
  contactPhone: string;
  industry: string;
}

const TOTAL_STEPS = 5;

const STEP_LABELS = [
  "Informasi Dasar",
  "Branding",
  "Lokasi",
  "Kontak",
  "Ringkasan",
];

const initialForm: WizardForm = {
  name: "",
  description: "",
  categoryIds: [],
  logo: "",
  banner: "",
  address1: "",
  address2: "",
  postalCode: "",
  kelurahan: "",
  district: "",
  country: "",
  province: "",
  city: "",
  website: "",
  instagram: "",
  contactEmail: "",
  contactPhone: "",
  industry: "",
};

export default function CreateOrganizationPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<WizardForm>(initialForm);
  const [categories, setCategories] = useState<Category[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [stepErrors, setStepErrors] = useState<string[]>([]);

  const [countries, setCountries] = useState<string[]>([]);
  const [provinces, setProvinces] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [kelurahan, setKelurahan] = useState<string[]>([]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await api.get("/categories");
        setCategories(data.data || []);
      } catch {
        console.error("Gagal memuat kategori");
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        const [countryRes, provinceRes, cityRes, districtRes, kelurahanRes] = await Promise.all([
          api.get("/master-data/countries"),
          api.get("/master-data/provinces"),
          api.get("/master-data/cities"),
          api.get("/master-data/districts"),
          api.get("/master-data/kelurahan"),
        ]);
        setCountries(countryRes.data.data || []);
        setProvinces(provinceRes.data.data || []);
        const cityData = cityRes.data.data;
        setCities(Array.isArray(cityData) ? cityData : []);
        setDistricts(districtRes.data.data || []);
        setKelurahan(kelurahanRes.data.data || []);
      } catch {
        console.error("Gagal memuat data master");
      }
    };
    fetchMasterData();
  }, []);

  const updateField = (field: keyof WizardForm, value: string | string[]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setStepErrors([]);
  };

  const toggleCategory = (id: string) => {
    const current = form.categoryIds;
    if (current.includes(id)) {
      updateField(
        "categoryIds",
        current.filter((c) => c !== id)
      );
    } else {
      updateField("categoryIds", [...current, id]);
    }
  };

  const validateStep = (s: number): string[] => {
    const errs: string[] = [];
    if (s === 1) {
      if (!form.name.trim()) errs.push("Nama organisasi wajib diisi");
      else if (form.name.trim().length < 3) errs.push("Nama minimal 3 karakter");
      else if (form.name.trim().length > 100) errs.push("Nama maksimal 100 karakter");
      if (!form.description.trim()) errs.push("Deskripsi wajib diisi");
      else if (form.description.trim().length > 2000) errs.push("Deskripsi maksimal 2000 karakter");
      if (form.categoryIds.length === 0) errs.push("Pilih minimal satu kategori");
    }
    if (s === 4) {
      if (form.website && !/^https?:\/\/.+/.test(form.website)) {
        errs.push("URL website harus valid (https://...)");
      }
      if (form.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contactEmail)) {
        errs.push("Format email tidak valid");
      }
    }
    return errs;
  };

  const handleNext = () => {
    const errs = validateStep(step);
    if (errs.length > 0) {
      setStepErrors(errs);
      return;
    }
    setStepErrors([]);
    setStep((prev) => Math.min(prev + 1, TOTAL_STEPS));
  };

  const handleBack = () => {
    setStepErrors([]);
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError("");
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        categoryIds: form.categoryIds,
        logo: form.logo || undefined,
        banner: form.banner || undefined,
        address1: form.address1 || undefined,
        address2: form.address2 || undefined,
        postalCode: form.postalCode || undefined,
        kelurahan: form.kelurahan || undefined,
        district: form.district || undefined,
        country: form.country || undefined,
        province: form.province || undefined,
        city: form.city || undefined,
        website: form.website || undefined,
        instagram: form.instagram || undefined,
        contactEmail: form.contactEmail || undefined,
        contactPhone: form.contactPhone || undefined,
        industry: form.industry || undefined,
      };
      await api.post("/organizations", payload);
      router.push("/dashboard/my-organization-submissions");
    } catch (err: any) {
      const msg =
        err.response?.data?.message || "Gagal membuat organisasi. Silakan coba lagi.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const getSelectedCategoryNames = () => {
    return categories
      .filter((c) => form.categoryIds.includes(c.id))
      .map((c) => `${c.icon ? c.icon + " " : ""}${c.name}`)
      .join(", ");
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-komuna-blue border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  if (!featureFlags.organization) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <FeatureDisabledBanner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <Link
              href="/organizations"
              className="text-sm text-komuna-blue hover:underline flex items-center gap-1"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Kembali ke Direktori Organisasi
            </Link>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h1 className="text-2xl font-bold text-komuna-navy mb-6">
              Buat Organisasi Baru
            </h1>

            <div className="flex items-center justify-between mb-8">
              {Array.from({ length: TOTAL_STEPS }).map((_, i) => {
                const num = i + 1;
                const isActive = num === step;
                const isCompleted = num < step;
                return (
                  <div key={num} className="flex items-center">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                          isActive
                            ? "bg-komuna-blue text-white"
                            : isCompleted
                              ? "bg-komuna-teal text-white"
                              : "bg-gray-200 text-gray-500"
                        }`}
                      >
                        {isCompleted ? (
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          num
                        )}
                      </div>
                      <span className="text-xs mt-1 text-gray-500 hidden sm:block">{STEP_LABELS[i]}</span>
                    </div>
                    {i < TOTAL_STEPS - 1 && (
                      <div
                        className={`w-8 sm:w-12 h-0.5 mx-1 ${
                          num < step ? "bg-komuna-teal" : "bg-gray-200"
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            {stepErrors.length > 0 && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-lg">
                <ul className="list-disc list-inside space-y-1">
                  {stepErrors.map((e, i) => (
                    <li key={i}>{e}</li>
                  ))}
                </ul>
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

            {step === 1 && (
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Organisasi <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    maxLength={100}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue text-sm"
                    placeholder="Contoh: PT Teknologi Nusantara"
                  />
                  <p className="mt-1 text-xs text-gray-400">{form.name.length}/100</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Deskripsi <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) => updateField("description", e.target.value)}
                    maxLength={2000}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue text-sm resize-none"
                    placeholder="Jelaskan tentang organisasi Anda..."
                  />
                  <p className="mt-1 text-xs text-gray-400">{form.description.length}/2000</p>
                </div>

                {categories.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kategori <span className="text-red-500">*</span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {categories.map((cat) => {
                        const isSelected = form.categoryIds.includes(cat.id);
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => toggleCategory(cat.id)}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                              isSelected
                                ? "bg-komuna-blue text-white border-komuna-blue"
                                : "bg-white text-gray-600 border-gray-200 hover:border-komuna-blue/50 hover:text-komuna-blue"
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Industri
                  </label>
                  <input
                    type="text"
                    value={form.industry}
                    onChange={(e) => updateField("industry", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue text-sm"
                    placeholder="Contoh: Teknologi, Pendidikan, Kesehatan"
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL Logo
                  </label>
                  <input
                    type="text"
                    value={form.logo}
                    onChange={(e) => updateField("logo", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue text-sm"
                    placeholder="/logo_organisasi.png"
                  />
                  {form.logo && (
                    <div className="mt-2">
                      <img
                        src={form.logo}
                        alt="Logo preview"
                        className="h-16 w-16 object-contain rounded border border-gray-200"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL Banner
                  </label>
                  <input
                    type="text"
                    value={form.banner}
                    onChange={(e) => updateField("banner", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue text-sm"
                    placeholder="https://example.com/banner.jpg"
                  />
                  {form.banner && (
                    <div className="mt-2">
                      <img
                        src={form.banner}
                        alt="Banner preview"
                        className="w-full h-32 object-cover rounded border border-gray-200"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Negara <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.country}
                    onChange={(e) => updateField("country", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue text-sm bg-white"
                  >
                    <option value="">-- Pilih Negara --</option>
                    {countries.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Alamat 1 <span className="text-gray-400 font-normal">(opsional)</span>
                  </label>
                  <input
                    type="text"
                    value={form.address1}
                    onChange={(e) => updateField("address1", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue text-sm"
                    placeholder="Contoh: Jl. Asia Afrika No. 1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Alamat 2 <span className="text-gray-400 font-normal">(opsional)</span>
                  </label>
                  <input
                    type="text"
                    value={form.address2}
                    onChange={(e) => updateField("address2", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue text-sm"
                    placeholder="Contoh: Blok A No. 5, RT 01/RW 02"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Provinsi <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.province}
                    onChange={(e) => updateField("province", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue text-sm bg-white"
                  >
                    <option value="">-- Pilih Provinsi --</option>
                    {provinces.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kota/Kabupaten <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.city}
                    onChange={(e) => updateField("city", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue text-sm bg-white"
                  >
                    <option value="">-- Pilih Kota/Kabupaten --</option>
                    {cities.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kecamatan <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.district}
                    onChange={(e) => updateField("district", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue text-sm bg-white"
                  >
                    <option value="">-- Pilih Kecamatan --</option>
                    {districts.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kelurahan <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.kelurahan}
                    onChange={(e) => updateField("kelurahan", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue text-sm bg-white"
                  >
                    <option value="">-- Pilih Kelurahan --</option>
                    {kelurahan.map((k) => (
                      <option key={k} value={k}>{k}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kode Pos <span className="text-gray-400 font-normal">(auto generate)</span>
                  </label>
                  <input
                    type="text"
                    value={form.postalCode}
                    onChange={(e) => updateField("postalCode", e.target.value)}
                    maxLength={5}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue text-sm bg-gray-50"
                    placeholder="Otomatis terisi saat memilih kelurahan"
                  />
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Website
                  </label>
                  <input
                    type="url"
                    value={form.website}
                    onChange={(e) => updateField("website", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue text-sm"
                    placeholder="https://example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Instagram
                  </label>
                  <input
                    type="text"
                    value={form.instagram}
                    onChange={(e) => updateField("instagram", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue text-sm"
                    placeholder="@organisasi"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={form.contactEmail}
                    onChange={(e) => updateField("contactEmail", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue text-sm"
                    placeholder="kontak@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telepon
                  </label>
                  <input
                    type="text"
                    value={form.contactPhone}
                    onChange={(e) => updateField("contactPhone", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue text-sm"
                    placeholder="+62 812xxxxxxx"
                  />
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-4">
                <p className="text-sm text-gray-500 mb-4">
                  Pastikan semua data sudah benar sebelum mengirim.
                </p>

                <div className="bg-gray-50 rounded-lg border border-gray-200 divide-y divide-gray-200">
                  <div className="p-3">
                    <span className="text-xs font-medium text-gray-500 uppercase">Nama</span>
                    <p className="text-sm text-gray-900">{form.name}</p>
                  </div>
                  <div className="p-3">
                    <span className="text-xs font-medium text-gray-500 uppercase">Deskripsi</span>
                    <p className="text-sm text-gray-900">{form.description}</p>
                  </div>
                  <div className="p-3">
                    <span className="text-xs font-medium text-gray-500 uppercase">Kategori</span>
                    <p className="text-sm text-gray-900">{getSelectedCategoryNames() || "-"}</p>
                  </div>
                  <div className="p-3">
                    <span className="text-xs font-medium text-gray-500 uppercase">Industri</span>
                    <p className="text-sm text-gray-900">{form.industry || "-"}</p>
                  </div>
                  <div className="p-3">
                    <span className="text-xs font-medium text-gray-500 uppercase">Logo</span>
                    <p className="text-sm text-gray-900">{form.logo || "-"}</p>
                  </div>
                  <div className="p-3">
                    <span className="text-xs font-medium text-gray-500 uppercase">Banner</span>
                    <p className="text-sm text-gray-900">{form.banner || "-"}</p>
                  </div>
                  <div className="p-3">
                    <span className="text-xs font-medium text-gray-500 uppercase">Lokasi</span>
                    <div className="text-sm text-gray-900 space-y-1">
                      {form.address1 && <p>Alamat 1: {form.address1}</p>}
                      {form.address2 && <p>Alamat 2: {form.address2}</p>}
                      {form.province && <p>Provinsi: {form.province}</p>}
                      {form.city && <p>Kota/Kabupaten: {form.city}</p>}
                      {form.district && <p>Kecamatan: {form.district}</p>}
                      {form.kelurahan && <p>Kelurahan: {form.kelurahan}</p>}
                      {form.postalCode && <p>Kode Pos: {form.postalCode}</p>}
                      {!form.address1 && !form.address2 && !form.kelurahan && !form.city && !form.province && <p>-</p>}
                    </div>
                  </div>
                  <div className="p-3">
                    <span className="text-xs font-medium text-gray-500 uppercase">Website</span>
                    <p className="text-sm text-gray-900">{form.website || "-"}</p>
                  </div>
                  <div className="p-3">
                    <span className="text-xs font-medium text-gray-500 uppercase">Instagram</span>
                    <p className="text-sm text-gray-900">{form.instagram || "-"}</p>
                  </div>
                  <div className="p-3">
                    <span className="text-xs font-medium text-gray-500 uppercase">Email</span>
                    <p className="text-sm text-gray-900">{form.contactEmail || "-"}</p>
                  </div>
                  <div className="p-3">
                    <span className="text-xs font-medium text-gray-500 uppercase">Telepon</span>
                    <p className="text-sm text-gray-900">{form.contactPhone || "-"}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 pt-6">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={submitting}
                  className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Kembali
                </button>
              ) : (
                <Link
                  href="/organizations"
                  className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Batal
                </Link>
              )}

              {step < TOTAL_STEPS ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-2 bg-komuna-blue text-white text-sm font-medium rounded-lg hover:bg-komuna-navy transition-colors"
                >
                  Selanjutnya
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="px-6 py-2 bg-komuna-blue text-white text-sm font-medium rounded-lg hover:bg-komuna-navy disabled:opacity-50 transition-colors flex items-center gap-2"
                >
                  {submitting && (
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}
                  {submitting ? "Membuat..." : "Buat Organisasi"}
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
