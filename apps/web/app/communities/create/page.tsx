"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { Header } from "@/components/header";
import { useAuth } from "@/components/auth-provider";

interface Category {
  id: string;
  name: string;
  icon: string;
}

interface WizardForm {
  name: string;
  description: string;
  categoryIds: string[];
  customCategory: string;
  logo: string;
  banner: string;
  address1: string;
  address2: string;
  postalCode: string;
  village: string;
  district: string;
  province: string;
  city: string;
  hasBasecamp: boolean;
  website: string;
  instagram: string;
  contactEmail: string;
  contactPhone: string;
  membershipType: "OPEN" | "RESTRICTED";
}

const TOTAL_STEPS = 6;

const STEP_LABELS = [
  "Informasi Dasar",
  "Branding",
  "Lokasi",
  "Kontak",
  "Keanggotaan",
  "Ringkasan",
];

const initialForm: WizardForm = {
  name: "",
  description: "",
  categoryIds: [],
  customCategory: "",
  logo: "",
  banner: "",
  address1: "",
  address2: "",
  postalCode: "",
  village: "",
  district: "",
  province: "",
  city: "",
  hasBasecamp: false,
  website: "",
  instagram: "",
  contactEmail: "",
  contactPhone: "",
  membershipType: "OPEN",
};

export default function CreateCommunityPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<WizardForm>(initialForm);
  const [categories, setCategories] = useState<Category[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [stepErrors, setStepErrors] = useState<string[]>([]);

  const [provinces, setProvinces] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [villages, setVillages] = useState<string[]>([]);
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingVillages, setLoadingVillages] = useState(false);
  const [loadingPostalCode, setLoadingPostalCode] = useState(false);

  const [logoUploading, setLogoUploading] = useState(false);
  const [bannerUploading, setBannerUploading] = useState(false);

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
    const fetchProvinces = async () => {
      setLoadingProvinces(true);
      try {
        const { data } = await api.get("/master-data/provinces");
        setProvinces(data.data || []);
      } catch {
        setProvinces([]);
      } finally {
        setLoadingProvinces(false);
      }
    };
    fetchProvinces();
  }, []);

  useEffect(() => {
    if (!form.province) {
      setCities([]);
      setDistricts([]);
      setVillages([]);
      return;
    }
    const fetchCities = async () => {
      setLoadingCities(true);
      try {
        const { data } = await api.get(`/master-data/cities?province=${encodeURIComponent(form.province)}`);
        setCities(data.data || []);
      } catch {
        setCities([]);
      } finally {
        setLoadingCities(false);
      }
    };
    fetchCities();
    setForm((prev) => ({ ...prev, city: "", district: "", village: "" }));
  }, [form.province]);

  useEffect(() => {
    if (!form.city) {
      setDistricts([]);
      setVillages([]);
      return;
    }
    const fetchDistricts = async () => {
      setLoadingDistricts(true);
      try {
        const { data } = await api.get(`/master-data/districts?city=${encodeURIComponent(form.city)}`);
        setDistricts(data.data || []);
      } catch {
        setDistricts([]);
      } finally {
        setLoadingDistricts(false);
      }
    };
    fetchDistricts();
    setForm((prev) => ({ ...prev, district: "", village: "" }));
  }, [form.city]);

  useEffect(() => {
    if (!form.district) {
      setVillages([]);
      return;
    }
    const fetchVillages = async () => {
      setLoadingVillages(true);
      try {
        const { data } = await api.get(`/master-data/villages?district=${encodeURIComponent(form.district)}`);
        setVillages(data.data || []);
      } catch {
        setVillages([]);
      } finally {
        setLoadingVillages(false);
      }
    };
    fetchVillages();
    setForm((prev) => ({ ...prev, village: "" }));
  }, [form.district]);

  useEffect(() => {
    if (!form.village) {
      return;
    }
    const fetchPostalCode = async () => {
      setLoadingPostalCode(true);
      try {
        const params = new URLSearchParams({ village: form.village });
        if (form.district) params.set("district", form.district);
        const { data } = await api.get(`/master-data/postal-codes?${params.toString()}`);
        if (data.success && data.data && data.data.length > 0) {
          const matched = data.data.find(
            (item: any) =>
              item.village?.toLowerCase() === form.village.toLowerCase() &&
              (!form.district || item.district?.toLowerCase() === form.district.toLowerCase())
          ) || data.data[0];
          setForm((prev) => ({ ...prev, postalCode: matched.code || "" }));
        }
      } catch {
        // silent
      } finally {
        setLoadingPostalCode(false);
      }
    };
    fetchPostalCode();
  }, [form.village, form.district]);

  const updateField = (field: keyof WizardForm, value: string | string[] | boolean) => {
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

  const handleFileUpload = async (file: File, type: "logo" | "banner") => {
    if (type === "logo") setLogoUploading(true);
    else setBannerUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const { data } = await api.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (data.success) {
        updateField(type, data.data.url);
      } else {
        setError(data.message || "Gagal upload file");
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || "Gagal upload file";
      setError(msg);
    } finally {
      if (type === "logo") setLogoUploading(false);
      else setBannerUploading(false);
    }
  };

  const validateStep = (s: number): string[] => {
    const errs: string[] = [];
    if (s === 1) {
      if (!form.name.trim()) errs.push("Nama komunitas wajib diisi");
      else if (form.name.trim().length < 3) errs.push("Nama minimal 3 karakter");
      else if (form.name.trim().length > 100) errs.push("Nama maksimal 100 karakter");
      if (!form.description.trim()) errs.push("Deskripsi wajib diisi");
      else if (form.description.trim().length > 2000) errs.push("Deskripsi maksimal 2000 karakter");
      if (form.categoryIds.length === 0 && !form.customCategory.trim()) errs.push("Pilih minimal satu kategori");
      if (form.customCategory.trim() && form.customCategory.trim().length > 50) errs.push("Nama kategori custom maksimal 50 karakter");
    }
    if (s === 3) {
      if (form.hasBasecamp) {
        if (!form.province) errs.push("Provinsi wajib dipilih");
        if (!form.city) errs.push("Kota/Kabupaten wajib dipilih");
        if (!form.district) errs.push("Kecamatan wajib dipilih");
        if (!form.village) errs.push("Desa/Kelurahan wajib dipilih");
      }
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
      const payload: Record<string, any> = {
        name: form.name.trim(),
        description: form.description.trim(),
        categoryIds: form.categoryIds.length > 0 ? form.categoryIds : undefined,
        customCategory: form.customCategory.trim() || undefined,
        logo: form.logo || undefined,
        banner: form.banner || undefined,
        address1: form.hasBasecamp ? (form.address1 || undefined) : undefined,
        address2: form.hasBasecamp ? (form.address2 || undefined) : undefined,
        postalCode: form.hasBasecamp ? (form.postalCode || undefined) : undefined,
        village: form.hasBasecamp ? (form.village || undefined) : undefined,
        district: form.hasBasecamp ? (form.district || undefined) : undefined,
        province: form.hasBasecamp ? (form.province || undefined) : undefined,
        city: form.hasBasecamp ? (form.city || undefined) : undefined,
        country: "Indonesia",
        website: form.website || undefined,
        instagram: form.instagram || undefined,
        contactEmail: form.contactEmail || undefined,
        contactPhone: form.contactPhone || undefined,
        membershipType: form.membershipType,
        visibility: "PUBLIC",
      };
      const response = await api.post("/communities", payload);
      router.push("/dashboard/my-submissions");
    } catch (err: any) {
      const msg =
        err.response?.data?.message || "Gagal membuat komunitas. Silakan coba lagi.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const getSelectedCategoryNames = () => {
    const names = categories
      .filter((c) => form.categoryIds.includes(c.id))
      .map((c) => `${c.icon ? c.icon + " " : ""}${c.name}`);
    if (form.customCategory.trim()) names.push(form.customCategory.trim());
    return names.join(", ");
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-komuna-blue border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <Link
              href="/communities"
              className="text-sm text-komuna-blue hover:underline flex items-center gap-1"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Kembali ke Direktori Komunitas
            </Link>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h1 className="text-2xl font-bold text-komuna-navy mb-6">
              Buat Komunitas Baru
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
                    Nama Komunitas <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    maxLength={100}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue text-sm"
                    placeholder="Contoh: Komunitas Developer Bandung"
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
                    placeholder="Jelaskan tentang komunitas Anda..."
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
                      <button
                        type="button"
                        onClick={() => {
                          if (form.customCategory.trim()) {
                            updateField("customCategory", "");
                          } else {
                            updateField("customCategory", " ");
                          }
                        }}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                          form.customCategory.trim()
                            ? "bg-komuna-blue text-white border-komuna-blue"
                            : "bg-white text-gray-600 border-gray-200 hover:border-komuna-blue/50 hover:text-komuna-blue"
                        }`}
                      >
                        Lainnya
                      </button>
                    </div>
                    {form.customCategory.trim() || form.customCategory === " " ? (
                      <div className="mt-3">
                        <input
                          type="text"
                          value={form.customCategory === " " ? "" : form.customCategory}
                          onChange={(e) => updateField("customCategory", e.target.value)}
                          maxLength={50}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue text-sm"
                          placeholder="Masukkan nama kategori..."
                          autoFocus
                        />
                        <p className="mt-1 text-xs text-gray-400">{(form.customCategory === " " ? "" : form.customCategory).length}/50</p>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Logo <span className="text-gray-400 font-normal">(opsional)</span>
                  </label>
                  <div className="flex items-center gap-3">
                    <label className="flex-1 flex items-center justify-center px-4 py-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-komuna-blue/50 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file, "logo");
                        }}
                        disabled={logoUploading}
                      />
                      {logoUploading ? (
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <div className="h-4 w-4 border-2 border-komuna-blue border-t-transparent rounded-full animate-spin" />
                          Mengupload...
                        </div>
                      ) : (
                        <div className="text-center">
                          <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <p className="mt-1 text-sm text-gray-500">Klik untuk upload logo</p>
                          <p className="mt-1 text-xs text-gray-400">JPG, PNG, GIF, WebP (maks. 5MB)</p>
                        </div>
                      )}
                    </label>
                    {form.logo && !logoUploading && (
                      <div className="relative">
                        <img
                          src={form.logo}
                          alt="Logo preview"
                          className="h-20 w-20 object-contain rounded border border-gray-200"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => updateField("logo", "")}
                          className="absolute -top-2 -right-2 h-5 w-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                        >
                          &times;
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="mt-2">
                    <p className="text-xs text-gray-400 mb-1">Atau masukkan URL:</p>
                    <input
                      type="text"
                      value={form.logo.startsWith("data:") ? "" : form.logo}
                      onChange={(e) => updateField("logo", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue text-sm"
                      placeholder="https://example.com/logo.png"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Banner <span className="text-gray-400 font-normal">(opsional)</span>
                  </label>
                  <div>
                    <label className="flex items-center justify-center px-4 py-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-komuna-blue/50 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file, "banner");
                        }}
                        disabled={bannerUploading}
                      />
                      {bannerUploading ? (
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <div className="h-4 w-4 border-2 border-komuna-blue border-t-transparent rounded-full animate-spin" />
                          Mengupload...
                        </div>
                      ) : (
                        <div className="text-center">
                          <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <p className="mt-1 text-sm text-gray-500">Klik untuk upload banner</p>
                          <p className="mt-1 text-xs text-gray-400">JPG, PNG, GIF, WebP (maks. 5MB)</p>
                        </div>
                      )}
                    </label>
                    {form.banner && !bannerUploading && (
                      <div className="mt-2 relative">
                        <img
                          src={form.banner}
                          alt="Banner preview"
                          className="w-full h-32 object-cover rounded border border-gray-200"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => updateField("banner", "")}
                          className="absolute top-2 right-2 h-5 w-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                        >
                          &times;
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="mt-2">
                    <p className="text-xs text-gray-400 mb-1">Atau masukkan URL:</p>
                    <input
                      type="text"
                      value={form.banner.startsWith("data:") ? "" : form.banner}
                      onChange={(e) => updateField("banner", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue text-sm"
                      placeholder="https://example.com/banner.jpg"
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-5">
                <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Punya Basecamp / Sekretariat</p>
                    <p className="text-xs text-gray-400 mt-0.5">Jika tidak memiliki, data lokasi tidak wajib diisi</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      updateField("hasBasecamp", !form.hasBasecamp);
                      if (!form.hasBasecamp) {
                        updateField("province", "");
                        updateField("city", "");
                        updateField("district", "");
                        updateField("village", "");
                        updateField("address1", "");
                        updateField("address2", "");
                        updateField("postalCode", "");
                      }
                    }}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-komuna-blue focus:ring-offset-2 ${form.hasBasecamp ? "bg-komuna-blue" : "bg-gray-200"}`}
                    role="switch"
                    aria-checked={form.hasBasecamp}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${form.hasBasecamp ? "translate-x-6" : "translate-x-1"}`} />
                  </button>
                </div>

                {form.hasBasecamp && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Alamat 1 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={form.address1}
                        onChange={(e) => updateField("address1", e.target.value)}
                        maxLength={120}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue text-sm"
                        placeholder="Contoh: Jl. Asia Afrika No. 1"
                      />
                      <p className="mt-1 text-xs text-gray-400">{form.address1.length}/120</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Alamat 2 <span className="text-gray-400 font-normal">(opsional)</span>
                      </label>
                      <input
                        type="text"
                        value={form.address2}
                        onChange={(e) => updateField("address2", e.target.value)}
                        maxLength={120}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue text-sm"
                        placeholder="Contoh: Blok A No. 5, RT 01/RW 02"
                      />
                      <p className="mt-1 text-xs text-gray-400">{form.address2.length}/120</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Provinsi <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={form.province}
                        onChange={(e) => updateField("province", e.target.value)}
                        disabled={loadingProvinces}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue text-sm bg-white disabled:bg-gray-100"
                      >
                        <option value="">{loadingProvinces ? "Memuat..." : "-- Pilih Provinsi --"}</option>
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
                        disabled={!form.province || loadingCities}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue text-sm bg-white disabled:bg-gray-100"
                      >
                        <option value="">{loadingCities ? "Memuat..." : "-- Pilih Kota/Kabupaten --"}</option>
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
                        disabled={!form.city || loadingDistricts}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue text-sm bg-white disabled:bg-gray-100"
                      >
                        <option value="">{loadingDistricts ? "Memuat..." : "-- Pilih Kecamatan --"}</option>
                        {districts.map((d) => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Desa/Kelurahan <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={form.village}
                        onChange={(e) => updateField("village", e.target.value)}
                        disabled={!form.district || loadingVillages}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue text-sm bg-white disabled:bg-gray-100"
                      >
                        <option value="">{loadingVillages ? "Memuat..." : "-- Pilih Desa/Kelurahan --"}</option>
                        {villages.map((v) => (
                          <option key={v} value={v}>{v}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Kode Pos <span className="text-gray-400 font-normal">(auto generate)</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={form.postalCode}
                          readOnly
                          maxLength={5}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue text-sm bg-gray-50"
                          placeholder={loadingPostalCode ? "Mencari kode pos..." : "Otomatis terisi saat memilih kelurahan"}
                        />
                          {loadingPostalCode && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <div className="h-4 w-4 border-2 border-komuna-blue border-t-transparent rounded-full animate-spin" />
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
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
                    placeholder="@komunaid"
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipe Keanggotaan
                </label>

                <label
                  className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                    form.membershipType === "OPEN"
                      ? "border-komuna-blue bg-komuna-blue/5"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="membershipType"
                    value="OPEN"
                    checked={form.membershipType === "OPEN"}
                    onChange={() => updateField("membershipType", "OPEN")}
                    className="mt-0.5 text-komuna-blue focus:ring-komuna-blue"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-900">Terbuka (OPEN)</span>
                    <p className="text-sm text-gray-500">Siapapun dapat bergabung langsung</p>
                  </div>
                </label>

                <label
                  className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                    form.membershipType === "RESTRICTED"
                      ? "border-komuna-blue bg-komuna-blue/5"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="membershipType"
                    value="RESTRICTED"
                    checked={form.membershipType === "RESTRICTED"}
                    onChange={() => updateField("membershipType", "RESTRICTED")}
                    className="mt-0.5 text-komuna-blue focus:ring-komuna-blue"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-900">Terbatas (RESTRICTED)</span>
                    <p className="text-sm text-gray-500">Membutuhkan persetujuan admin</p>
                  </div>
                </label>
              </div>
            )}

            {step === 6 && (
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
                    <span className="text-xs font-medium text-gray-500 uppercase">Logo</span>
                    {form.logo ? (
                      <img src={form.logo} alt="Logo" className="h-12 w-12 object-contain rounded border border-gray-200 mt-1" />
                    ) : (
                      <p className="text-sm text-gray-900">-</p>
                    )}
                  </div>
                  <div className="p-3">
                    <span className="text-xs font-medium text-gray-500 uppercase">Banner</span>
                    {form.banner ? (
                      <img src={form.banner} alt="Banner" className="w-full h-20 object-cover rounded border border-gray-200 mt-1" />
                    ) : (
                      <p className="text-sm text-gray-900">-</p>
                    )}
                  </div>
                  <div className="p-3">
                    <span className="text-xs font-medium text-gray-500 uppercase">Lokasi</span>
                    <div className="text-sm text-gray-900 space-y-1">
                      {form.address1 && <p>Alamat 1: {form.address1}</p>}
                      {form.address2 && <p>Alamat 2: {form.address2}</p>}
                      {form.province && <p>Provinsi: {form.province}</p>}
                      {form.city && <p>Kota/Kabupaten: {form.city}</p>}
                      {form.district && <p>Kecamatan: {form.district}</p>}
                      {form.village && <p>Kelurahan: {form.village}</p>}
                      {form.postalCode && <p>Kode Pos: {form.postalCode}</p>}
                      {!form.address1 && !form.address2 && !form.village && !form.city && !form.province && <p>-</p>}
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
                  <div className="p-3">
                    <span className="text-xs font-medium text-gray-500 uppercase">Tipe Keanggotaan</span>
                    <p className="text-sm text-gray-900">
                      {form.membershipType === "OPEN" ? "Terbuka (OPEN)" : "Terbatas (RESTRICTED)"}
                    </p>
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
                  href="/communities"
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
                  {submitting ? "Membuat..." : "Buat Komunitas"}
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
