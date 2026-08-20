"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import api, { unwrapApiData } from "@/lib/api";
import { Header } from "@/components/header";
import { useAuth } from "@/components/auth-provider";

interface Category {
  id: string;
  name: string;
  icon: string;
}

interface CommunityDetail {
  id: string;
  name: string;
  slug: string;
  description: string;
  coverImage: string | null;
  logo: string | null;
  banner: string | null;
  location: string | null;
  address1: string | null;
  address2: string | null;
  postalCode: string | null;
  village: string | null;
  district: string | null;
  country: string | null;
  province: string | null;
  city: string | null;
  website: string | null;
  membershipType: string;
  visibility: string;
  status: string;
  owner: { id: string; name: string; avatar: string | null };
  memberCount: number;
  categories: Array<{ id: string; name: string }>;
  tags: Array<{ id: string; tag: string }>;
}

interface EditCommunityForm {
  name: string;
  description: string;
  location: string;
  address1: string;
  address2: string;
  postalCode: string;
  village: string;
  district: string;
  country: string;
  province: string;
  city: string;
  website: string;
  membershipType: "OPEN" | "RESTRICTED";
  visibility: "PUBLIC" | "PRIVATE";
  categoryIds: string[];
  tagsInput: string;
  banner: string;
  logo: string;
}

export default function EditCommunityPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const [categories, setCategories] = useState<Category[]>([]);
  const [community, setCommunity] = useState<CommunityDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [notAuthorized, setNotAuthorized] = useState(false);

  const [countries, setCountries] = useState<string[]>([]);
  const [provinces, setProvinces] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [kelurahanList, setKelurahanList] = useState<string[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingKelurahan, setLoadingKelurahan] = useState(false);
  const [loadingPostalCode, setLoadingPostalCode] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<EditCommunityForm>({
    defaultValues: {
      name: "",
      description: "",
      location: "",
      address1: "",
      address2: "",
      postalCode: "",
      village: "",
      district: "",
      country: "",
      province: "",
      city: "",
      website: "",
      membershipType: "OPEN",
      visibility: "PUBLIC",
      categoryIds: [],
      tagsInput: "",
      banner: "",
      logo: "",
    },
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (!slug) return;

    const fetchData = async () => {
      try {
        const [communityRes, categoriesRes, countryRes, provinceRes] = await Promise.all([
          api.get(`/communities/${slug}`),
          api.get("/categories"),
          api.get("/master-data/countries"),
          api.get("/master-data/provinces"),
        ]);

        const comm = unwrapApiData<CommunityDetail>(communityRes);
        setCommunity(comm);
        setCategories(categoriesRes.data.data || []);
        setCountries(countryRes.data.data || []);
        setProvinces(provinceRes.data.data || []);
        setCities([]);
        setDistricts([]);
        setKelurahanList([]);

        if (user && comm.owner.id !== user.id) {
          const hasAdminRole = user.roles?.includes("admin") || user.roles?.includes("SUPER_ADMIN");
          if (!hasAdminRole) {
            setNotAuthorized(true);
            return;
          }
        }

        reset({
          name: comm.name,
          description: comm.description || "",
          location: comm.location || "",
          address1: comm.address1 || "",
          address2: comm.address2 || "",
          postalCode: comm.postalCode || "",
          village: comm.village || "",
          district: comm.district || "",
          country: comm.country || "",
          province: comm.province || "",
          city: comm.city || "",
          website: comm.website || "",
          membershipType: comm.membershipType as "OPEN" | "RESTRICTED",
          visibility: comm.visibility as "PUBLIC" | "PRIVATE",
          categoryIds: comm.categories.map((c: { id: string }) => c.id),
          tagsInput: comm.tags.map((t: { id: string; tag: string }) => t.tag).join(", "),
          banner: comm.banner || comm.coverImage || "",
          logo: comm.logo || "",
        });
      } catch {
        console.error("Failed to fetch community data");
        setError("Gagal memuat data komunitas");
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && user) {
      fetchData();
    }
  }, [slug, isAuthenticated, user, reset]);

  const selectedCategories = watch("categoryIds");
  const selectedProvince = watch("province");
  const selectedCity = watch("city");
  const selectedDistrict = watch("district");
  const selectedVillage = watch("village");

  useEffect(() => {
    if (!selectedProvince) {
      setCities([]);
      setDistricts([]);
      setKelurahanList([]);
      return;
    }
    const controller = new AbortController();
    setLoadingCities(true);
    api
      .get(`/master-data/cities?province=${encodeURIComponent(selectedProvince)}`, { signal: controller.signal })
      .then((res) => setCities(res.data.data || []))
      .catch(() => setCities([]))
      .finally(() => setLoadingCities(false));
    return () => controller.abort();
  }, [selectedProvince]);

  useEffect(() => {
    if (!selectedCity) {
      setDistricts([]);
      setKelurahanList([]);
      return;
    }
    const controller = new AbortController();
    setLoadingDistricts(true);
    api
      .get(`/master-data/districts?city=${encodeURIComponent(selectedCity)}`, { signal: controller.signal })
      .then((res) => setDistricts(res.data.data || []))
      .catch(() => setDistricts([]))
      .finally(() => setLoadingDistricts(false));
    return () => controller.abort();
  }, [selectedCity]);

  useEffect(() => {
    if (!selectedDistrict) {
      setKelurahanList([]);
      return;
    }
    const controller = new AbortController();
    setLoadingKelurahan(true);
    api
      .get(`/master-data/kelurahan?district=${encodeURIComponent(selectedDistrict)}`, { signal: controller.signal })
      .then((res) => setKelurahanList(res.data.data || []))
      .catch(() => setKelurahanList([]))
      .finally(() => setLoadingKelurahan(false));
    return () => controller.abort();
  }, [selectedDistrict]);

  useEffect(() => {
    if (!selectedVillage) {
      return;
    }
    const controller = new AbortController();
    setLoadingPostalCode(true);
    const params = new URLSearchParams({ village: selectedVillage });
    if (selectedDistrict) params.set("district", selectedDistrict);
    api
      .get(`/master-data/postal-codes?${params.toString()}`, { signal: controller.signal })
      .then((res) => {
        const list = res.data?.data || [];
        if (list.length > 0) {
          const matched =
            list.find(
              (item: any) =>
                item.village?.toLowerCase() === selectedVillage.toLowerCase() &&
                (!selectedDistrict || item.district?.toLowerCase() === selectedDistrict.toLowerCase())
            ) || list[0];
          setValue("postalCode", matched.code || "");
        }
      })
      .catch(() => {})
      .finally(() => setLoadingPostalCode(false));
    return () => controller.abort();
  }, [selectedVillage, selectedDistrict, setValue]);

  const toggleCategory = (id: string) => {
    const current = selectedCategories || [];
    if (current.includes(id)) {
      setValue(
        "categoryIds",
        current.filter((c) => c !== id),
        { shouldValidate: true }
      );
    } else {
      setValue("categoryIds", [...current, id], { shouldValidate: true });
    }
  };

  const onSubmit = async (data: EditCommunityForm) => {
    if (!community) return;
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const tags = data.tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
        .slice(0, 10);

      const payload = {
        name: data.name,
        description: data.description || undefined,
        location: data.location || undefined,
        address1: data.address1 || undefined,
        address2: data.address2 || undefined,
        postalCode: data.postalCode || undefined,
        village: data.village || undefined,
        district: data.district || undefined,
        country: data.country || undefined,
        province: data.province || undefined,
        city: data.city || undefined,
        website: data.website || undefined,
        membershipType: data.membershipType,
        visibility: data.visibility,
        categoryIds: data.categoryIds,
        tags,
        banner: data.banner || undefined,
        logo: data.logo || undefined,
      };

      await api.put(`/communities/${community.id}`, payload);
      setSuccess("Komunitas berhasil diperbarui!");
      setTimeout(() => {
        router.push(`/communities/${community.slug}`);
      }, 1000);
    } catch (err: any) {
      const msg =
        err.response?.data?.message || "Gagal memperbarui komunitas. Silakan coba lagi.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-komuna-blue border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  if (notAuthorized) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-16">
          <div className="max-w-lg mx-auto text-center">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
              <svg
                className="mx-auto h-12 w-12 text-red-400 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
              <h2 className="text-xl font-bold text-komuna-navy mb-2">
                Akses Ditolak
              </h2>
              <p className="text-gray-500 text-sm mb-6">
                Anda tidak memiliki izin untuk mengedit komunitas ini. Hanya pemilik atau admin yang dapat mengedit.
              </p>
              <Link
                href={`/communities/${slug}`}
                className="inline-block px-5 py-2.5 text-sm font-medium text-white bg-komuna-blue rounded-lg hover:bg-komuna-navy transition-colors"
              >
                Kembali ke Komunitas
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!community) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-16">
          <div className="max-w-lg mx-auto text-center">
            <h2 className="text-2xl font-bold text-komuna-navy mb-2">
              Komunitas Tidak Ditemukan
            </h2>
            <Link
              href="/communities"
              className="text-sm text-komuna-blue hover:underline"
            >
              Kembali ke Direktori Komunitas
            </Link>
          </div>
        </main>
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
              href={`/communities/${slug}`}
              className="text-sm text-komuna-blue hover:underline flex items-center gap-1"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Kembali ke {community.name}
            </Link>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h1 className="text-2xl font-bold text-komuna-navy mb-6">
              Edit Komunitas
            </h1>

            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-lg flex items-center gap-2">
                <svg
                  className="h-5 w-5 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 bg-green-50 border border-green-200 text-green-700 text-sm p-3 rounded-lg flex items-center gap-2">
                <svg
                  className="h-5 w-5 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Nama Komunitas <span className="text-red-500">*</span>
                </label>
                <input
                  id="name"
                  type="text"
                  {...register("name", {
                    required: "Nama komunitas wajib diisi",
                    minLength: {
                      value: 3,
                      message: "Nama minimal 3 karakter",
                    },
                    maxLength: {
                      value: 100,
                      message: "Nama maksimal 100 karakter",
                    },
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue text-sm"
                  placeholder="Contoh: Komunitas Developer Bandung"
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Deskripsi
                </label>
                <textarea
                  id="description"
                  {...register("description", {
                    maxLength: {
                      value: 2000,
                      message: "Deskripsi maksimal 2000 karakter",
                    },
                  })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue text-sm resize-none"
                  placeholder="Jelaskan tentang komunitas Anda..."
                />
                {errors.description && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.description.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="address1"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Alamat 1
                </label>
                <input
                  id="address1"
                  type="text"
                  {...register("address1")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue text-sm"
                  placeholder="Contoh: Jl. Asia Afrika No. 1"
                />
              </div>

              <div>
                <label
                  htmlFor="address2"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Alamat 2 <span className="text-gray-400 font-normal">(opsional)</span>
                </label>
                <input
                  id="address2"
                  type="text"
                  {...register("address2")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue text-sm"
                  placeholder="Contoh: Blok A No. 5, RT 01/RW 02"
                />
              </div>

              <div>
                <label
                  htmlFor="kelurahan"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Kelurahan <span className="text-red-500">*</span>
                </label>
                <select
                  id="kelurahan"
                  value={selectedVillage}
                  onChange={(e) => {
                    setValue("village", e.target.value);
                    setValue("postalCode", "");
                  }}
                  disabled={!selectedDistrict || loadingKelurahan}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue text-sm bg-white disabled:bg-gray-50"
                >
                  <option value="">{loadingKelurahan ? "Memuat kelurahan..." : "-- Pilih Kelurahan --"}</option>
                  {kelurahanList.map((k) => (
                    <option key={k} value={k}>{k}</option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="district"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Kecamatan <span className="text-red-500">*</span>
                </label>
                <select
                  id="district"
                  value={selectedDistrict}
                  onChange={(e) => {
                    setValue("district", e.target.value);
                    setValue("village", "");
                    setValue("postalCode", "");
                    setKelurahanList([]);
                  }}
                  disabled={!selectedCity || loadingDistricts}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue text-sm bg-white disabled:bg-gray-50"
                >
                  <option value="">{loadingDistricts ? "Memuat kecamatan..." : "-- Pilih Kecamatan --"}</option>
                  {districts.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label
                    htmlFor="city"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Kota/Kabupaten
                  </label>
                  <select
                    id="city"
                    value={selectedCity}
                    onChange={(e) => {
                      setValue("city", e.target.value);
                      setValue("district", "");
                      setValue("village", "");
                      setValue("postalCode", "");
                      setDistricts([]);
                      setKelurahanList([]);
                    }}
                    disabled={!selectedProvince || loadingCities}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue text-sm bg-white disabled:bg-gray-50"
                  >
                    <option value="">{loadingCities ? "Memuat kota..." : "-- Pilih Kota/Kabupaten --"}</option>
                    {cities.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="province"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Provinsi
                  </label>
                  <select
                    id="province"
                    value={selectedProvince}
                    onChange={(e) => {
                      setValue("province", e.target.value);
                      setValue("city", "");
                      setValue("district", "");
                      setValue("village", "");
                      setValue("postalCode", "");
                      setCities([]);
                      setDistricts([]);
                      setKelurahanList([]);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue text-sm bg-white"
                  >
                    <option value="">-- Pilih Provinsi --</option>
                    {provinces.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="country"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Negara
                  </label>
                  <select
                    id="country"
                    {...register("country")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue text-sm bg-white"
                  >
                    <option value="">-- Pilih Negara --</option>
                    {countries.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="postalCode"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Kode Pos <span className="text-gray-400 font-normal">(auto generate)</span>
                </label>
                <input
                  id="postalCode"
                  type="text"
                  {...register("postalCode")}
                  maxLength={5}
                  readOnly
                  disabled={loadingPostalCode}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue text-sm bg-gray-50 disabled:opacity-60"
                  placeholder={loadingPostalCode ? "Mencari kode pos..." : "Otomatis terisi saat memilih kelurahan"}
                />
              </div>

              <div>
                <label
                  htmlFor="website"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Website
                </label>
                <input
                  id="website"
                  type="url"
                  {...register("website", {
                    pattern: {
                      value: /^https?:\/\/.+/,
                      message: "URL harus valid (https://...)",
                    },
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue text-sm"
                  placeholder="https://example.com"
                />
                {errors.website && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.website.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="membershipType"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Tipe Keanggotaan
                  </label>
                  <select
                    id="membershipType"
                    {...register("membershipType")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue text-sm bg-white"
                  >
                    <option value="OPEN">Terbuka</option>
                    <option value="RESTRICTED">Terbatas</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="visibility"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Visibilitas
                  </label>
                  <select
                    id="visibility"
                    {...register("visibility")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue text-sm bg-white"
                  >
                    <option value="PUBLIC">Publik</option>
                    <option value="PRIVATE">Privat</option>
                  </select>
                </div>
              </div>

              {categories.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kategori
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((cat) => {
                      const isSelected = selectedCategories?.includes(cat.id);
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
                <label
                  htmlFor="tagsInput"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Tag
                </label>
                <input
                  id="tagsInput"
                  type="text"
                  {...register("tagsInput", {
                    validate: (value) => {
                      if (!value) return true;
                      const tags = value
                        .split(",")
                        .map((t) => t.trim())
                        .filter(Boolean);
                      if (tags.length > 10) return "Maksimal 10 tag";
                      return true;
                    },
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue text-sm"
                  placeholder="Pisahkan dengan koma: javascript, react, nodejs"
                />
                <p className="mt-1 text-xs text-gray-400">
                  Pisahkan dengan koma, maksimal 10 tag
                </p>
                {errors.tagsInput && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.tagsInput.message}
                  </p>
                )}
              </div>

              <div className="border-t border-gray-100 pt-5">
                <h2 className="text-lg font-semibold text-komuna-navy mb-4">
                  Manajemen Media
                </h2>

                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="banner"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      URL Banner
                    </label>
                    <input
                      id="banner"
                      type="url"
                      {...register("banner", {
                        pattern: {
                          value: /^(https?:\/\/.+)?$/,
                          message: "URL harus valid",
                        },
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue text-sm"
                      placeholder="https://example.com/banner.jpg"
                    />
                    <p className="mt-1 text-xs text-gray-400">
                      Banner ditampilkan di bagian atas halaman komunitas
                    </p>
                    {errors.banner && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.banner.message}
                      </p>
                    )}
                    {watch("banner") && (
                      <div className="mt-2 rounded-lg overflow-hidden border border-gray-200 h-32 bg-gray-100">
                        <img
                          src={watch("banner")}
                          alt="Preview Banner"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                          }}
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="logo"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      URL Logo
                    </label>
                    <input
                      id="logo"
                      type="url"
                      {...register("logo", {
                        pattern: {
                          value: /^(https?:\/\/.+)?$/,
                          message: "URL harus valid",
                        },
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue text-sm"
                      placeholder="https://example.com/logo.png"
                    />
                    <p className="mt-1 text-xs text-gray-400">
                      Logo komunitas ditampilkan di direktori dan profil
                    </p>
                    {errors.logo && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.logo.message}
                      </p>
                    )}
                    {watch("logo") && (
                      <div className="mt-2 h-20 w-20 rounded-lg overflow-hidden border border-gray-200 bg-gray-100 flex items-center justify-center">
                        <img
                          src={watch("logo")}
                          alt="Preview Logo"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Link
                  href={`/communities/${slug}`}
                  className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Batal
                </Link>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-komuna-blue text-white text-sm font-medium rounded-lg hover:bg-komuna-navy disabled:opacity-50 transition-colors flex items-center gap-2"
                >
                  {submitting && (
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}
                  {submitting ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
