"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import api from "@/lib/api";
import { Header } from "@/components/header";
import { useAuth } from "@/components/auth-provider";

interface Category {
  id: string;
  name: string;
  icon: string;
}

interface OrganizationDetail {
  id: string;
  name: string;
  slug: string;
  description: string;
  logo: string | null;
  banner: string | null;
  country: string | null;
  province: string | null;
  city: string | null;
  website: string | null;
  instagram: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  industry: string | null;
  visibility: string;
  status: string;
  owner: { id: string; name: string; avatar: string | null };
  memberCount: number;
  categories: Array<{ id: string; name: string }>;
  tags: Array<{ id: string; tag: string }>;
}

interface EditOrganizationForm {
  name: string;
  description: string;
  categoryIds: string[];
  logo: string;
  banner: string;
  country: string;
  province: string;
  city: string;
  website: string;
  instagram: string;
  contactEmail: string;
  contactPhone: string;
  industry: string;
  visibility: "PUBLIC" | "PRIVATE";
  tagsInput: string;
}

export default function EditOrganizationPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const [categories, setCategories] = useState<Category[]>([]);
  const [organization, setOrganization] = useState<OrganizationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [notAuthorized, setNotAuthorized] = useState(false);
  const [notEditable, setNotEditable] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<EditOrganizationForm>({
    defaultValues: {
      name: "",
      description: "",
      categoryIds: [],
      logo: "",
      banner: "",
      country: "",
      province: "",
      city: "",
      website: "",
      instagram: "",
      contactEmail: "",
      contactPhone: "",
      industry: "",
      visibility: "PUBLIC",
      tagsInput: "",
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
        const [orgRes, categoriesRes] = await Promise.all([
          api.get(`/organizations/${slug}`),
          api.get("/categories"),
        ]);

        const org = orgRes.data.organization || orgRes.data.data;
        setOrganization(org);
        setCategories(categoriesRes.data.data || []);

        if (org.status !== "DRAFT" && org.status !== "REVISION_REQUIRED") {
          setNotEditable(true);
          return;
        }

        if (user && org.owner.id !== user.id) {
          const hasAdminRole = user.roles?.includes("admin") || user.roles?.includes("SUPER_ADMIN");
          if (!hasAdminRole) {
            setNotAuthorized(true);
            return;
          }
        }

        reset({
          name: org.name,
          description: org.description || "",
          categoryIds: org.categories?.map((c: { id: string }) => c.id) || [],
          logo: org.logo || "",
          banner: org.banner || "",
          country: org.country || "",
          province: org.province || "",
          city: org.city || "",
          website: org.website || "",
          instagram: org.instagram || "",
          contactEmail: org.contactEmail || "",
          contactPhone: org.contactPhone || "",
          industry: org.industry || "",
          visibility: org.visibility as "PUBLIC" | "PRIVATE",
          tagsInput: org.tags?.map((t: { id: string; tag: string }) => t.tag).join(", ") || "",
        });
      } catch {
        setError("Gagal memuat data organisasi");
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && user) {
      fetchData();
    }
  }, [slug, isAuthenticated, user, reset]);

  const selectedCategories = watch("categoryIds");

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

  const onSubmit = async (data: EditOrganizationForm) => {
    if (!organization) return;
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
        categoryIds: data.categoryIds,
        logo: data.logo || undefined,
        banner: data.banner || undefined,
        country: data.country || undefined,
        province: data.province || undefined,
        city: data.city || undefined,
        website: data.website || undefined,
        instagram: data.instagram || undefined,
        contactEmail: data.contactEmail || undefined,
        contactPhone: data.contactPhone || undefined,
        industry: data.industry || undefined,
        visibility: data.visibility,
        tags,
      };

      await api.patch(`/organizations/${organization.id}`, payload);
      setSuccess("Organisasi berhasil diperbarui!");
      setTimeout(() => {
        router.push(`/organizations/${organization.slug}`);
      }, 1000);
    } catch (err: any) {
      const msg =
        err.response?.data?.message || "Gagal memperbarui organisasi. Silakan coba lagi.";
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
                Anda tidak memiliki izin untuk mengedit organisasi ini. Hanya pemilik atau admin yang dapat mengedit.
              </p>
              <Link
                href={`/organizations/${slug}`}
                className="inline-block px-5 py-2.5 text-sm font-medium text-white bg-komuna-blue rounded-lg hover:bg-komuna-navy transition-colors"
              >
                Kembali ke Organisasi
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (notEditable) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-16">
          <div className="max-w-lg mx-auto text-center">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
              <svg
                className="mx-auto h-12 w-12 text-amber-400 mb-4"
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
                Tidak Dapat Diedit
              </h2>
              <p className="text-gray-500 text-sm mb-6">
                Organisasi ini hanya dapat diedit saat statusnya <strong>Draft</strong> atau <strong>Perlu Revisi</strong>.
              </p>
              <Link
                href={`/organizations/${slug}`}
                className="inline-block px-5 py-2.5 text-sm font-medium text-white bg-komuna-blue rounded-lg hover:bg-komuna-navy transition-colors"
              >
                Kembali ke Organisasi
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-16">
          <div className="max-w-lg mx-auto text-center">
            <h2 className="text-2xl font-bold text-komuna-navy mb-2">
              Organisasi Tidak Ditemukan
            </h2>
            <Link
              href="/organizations"
              className="text-sm text-komuna-blue hover:underline"
            >
              Kembali ke Direktori Organisasi
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
              href={`/organizations/${slug}`}
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
              Kembali ke {organization.name}
            </Link>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h1 className="text-2xl font-bold text-komuna-navy mb-6">
              Edit Organisasi
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
                  Nama Organisasi <span className="text-red-500">*</span>
                </label>
                <input
                  id="name"
                  type="text"
                  {...register("name", {
                    required: "Nama organisasi wajib diisi",
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
                  placeholder="Contoh: PT Teknologi Nusantara"
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
                  Deskripsi <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  {...register("description", {
                    required: "Deskripsi wajib diisi",
                    maxLength: {
                      value: 2000,
                      message: "Deskripsi maksimal 2000 karakter",
                    },
                  })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue text-sm resize-none"
                  placeholder="Jelaskan tentang organisasi Anda..."
                />
                {errors.description && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.description.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="industry"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Industri
                </label>
                <input
                  id="industry"
                  type="text"
                  {...register("industry")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue text-sm"
                  placeholder="Contoh: Teknologi, Pendidikan"
                />
              </div>

              {categories.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kategori <span className="text-red-500">*</span>
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

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label
                    htmlFor="country"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Negara
                  </label>
                  <input
                    id="country"
                    type="text"
                    {...register("country")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue text-sm"
                    placeholder="Indonesia"
                  />
                </div>
                <div>
                  <label
                    htmlFor="province"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Provinsi
                  </label>
                  <input
                    id="province"
                    type="text"
                    {...register("province")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue text-sm"
                    placeholder="Jawa Barat"
                  />
                </div>
                <div>
                  <label
                    htmlFor="city"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Kota
                  </label>
                  <input
                    id="city"
                    type="text"
                    {...register("city")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue text-sm"
                    placeholder="Bandung"
                  />
                </div>
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
                      value: /^(https?:\/\/.+)?$/,
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="instagram"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Instagram
                  </label>
                  <input
                    id="instagram"
                    type="text"
                    {...register("instagram")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue text-sm"
                    placeholder="@organisasi"
                  />
                </div>
                <div>
                  <label
                    htmlFor="contactEmail"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Email
                  </label>
                  <input
                    id="contactEmail"
                    type="email"
                    {...register("contactEmail", {
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: "Format email tidak valid",
                      },
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue text-sm"
                    placeholder="kontak@example.com"
                  />
                  {errors.contactEmail && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.contactEmail.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="contactPhone"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Telepon
                  </label>
                  <input
                    id="contactPhone"
                    type="text"
                    {...register("contactPhone")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue text-sm"
                    placeholder="+62 812xxxxxxx"
                  />
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
                  placeholder="Pisahkan dengan koma: teknologi, startup, digital"
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
                  href={`/organizations/${slug}`}
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
