"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import api from "@/lib/api";
import { useAuth } from "@/components/auth-provider";
import { eventOrganizers, type Organizer } from "@/lib/event-organizers";

const eventSchema = z.object({
  title: z.string().min(3, "Judul minimal 3 karakter").max(200, "Judul maksimal 200 karakter"),
  description: z.string().min(10, "Deskripsi minimal 10 karakter").max(5000, "Deskripsi maksimal 5000 karakter"),
  categoryIds: z.array(z.string()).min(1, "Pilih minimal satu kategori").max(5, "Maksimal 5 kategori"),
  communityId: z.string().optional().nullable(),
  organizationId: z.string().optional().nullable(),
  eventDate: z.string().min(1, "Tanggal event wajib diisi"),
  endDate: z.string().optional().nullable(),
  timezone: z.string().min(1, "Timezone wajib diisi"),
  locationType: z.enum(["OFFLINE", "ONLINE", "HYBRID"]),
  location: z.string().optional().nullable(),
  meetingUrl: z.string().optional().nullable(),
  onlineUrl: z.string().optional().nullable(),
  quota: z.coerce.number().min(1, "Kuota minimal 1").max(100000, "Kuota maksimal 100.000"),
  allowWaitlist: z.boolean(),
  coverImage: z.string().optional().nullable(),
  thumbnail: z.string().optional().nullable(),
}).refine((data) => Boolean(data.communityId || data.organizationId), {
  message: "Pilih komunitas atau organisasi penyelenggara",
  path: ["communityId"],
});

type EventFormData = z.infer<typeof eventSchema>;

interface Category {
  id: string;
  name: string;
  icon: string;
}

const TIMEZONE_OFFSETS: Record<string, number> = {
  "Asia/Jakarta": 7,
  "Asia/Makassar": 8,
  "Asia/Jayapura": 9,
  UTC: 0,
};

function localDateTimeToIso(value: string, timezone: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(value);
  const offset = TIMEZONE_OFFSETS[timezone];
  if (!match || offset === undefined) throw new Error("Format tanggal atau timezone tidak valid");

  const [, year, month, day, hour, minute, second = "0"] = match;
  return new Date(Date.UTC(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour) - offset,
    Number(minute),
    Number(second)
  )).toISOString();
}

const TOTAL_STEPS = 6;

const STEP_LABELS = [
  "Informasi Dasar",
  "Jadwal",
  "Lokasi",
  "Kapasitas",
  "Media",
  "Ringkasan",
];

const TIMEZONES = [
  "Asia/Jakarta",
  "Asia/Makassar",
  "Asia/Jayapura",
  "UTC",
];

export default function CreateEventPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const presetCommunityId = searchParams.get("communityId") || "";
  const [step, setStep] = useState(1);
  const [categories, setCategories] = useState<Category[]>([]);
  const [organizers, setOrganizers] = useState<Organizer[]>([]);
  const [lockedCommunity, setLockedCommunity] = useState<{
    id: string;
    name: string;
    authorized: boolean;
  } | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    trigger,
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: "",
      description: "",
      categoryIds: [],
      communityId: null,
      organizationId: null,
      eventDate: "",
      endDate: null,
      timezone: "Asia/Jakarta",
      locationType: "OFFLINE",
      location: "",
      meetingUrl: "",
      onlineUrl: "",
      quota: 50,
      allowWaitlist: false,
      coverImage: "",
      thumbnail: "",
    },
  });

  const formValues = watch();

  const createMutation = useMutation({
    mutationFn: async (data: EventFormData) => {
      const payload: Record<string, unknown> = {
        title: data.title.trim(),
        description: data.description.trim(),
        categoryIds: data.categoryIds,
        eventDate: localDateTimeToIso(data.eventDate, data.timezone),
        endDate: data.endDate ? localDateTimeToIso(data.endDate, data.timezone) : undefined,
        timezone: data.timezone,
        locationType: data.locationType,
        isOnline: data.locationType !== "OFFLINE",
        location: data.location || undefined,
        meetingUrl: data.meetingUrl || undefined,
        onlineUrl: data.onlineUrl || undefined,
        quota: data.quota,
        allowWaitlist: data.allowWaitlist,
        coverImage: data.coverImage || undefined,
        thumbnail: data.thumbnail || undefined,
      };
      if (data.communityId) payload.communityId = data.communityId;
      if (data.organizationId) payload.organizationId = data.organizationId;
      return api.post("/events", payload);
    },
    onSuccess: (res) => {
      const slug = res.data.event?.slug || res.data.data?.slug;
      router.push(slug ? `/events/${slug}` : "/dashboard/events");
    },
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      const redirect = presetCommunityId
        ? `/dashboard/events/create?communityId=${encodeURIComponent(presetCommunityId)}`
        : "/dashboard/events/create";
      router.push(`/login?redirect=${encodeURIComponent(redirect)}`);
    }
  }, [isAuthenticated, authLoading, router, presetCommunityId]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, profileRes] = await Promise.all([
          api.get("/categories"),
          api.get("/users/profile"),
        ]);
        setCategories(catRes.data.data || []);
        const profile = profileRes.data.data?.user || profileRes.data.user;
        const organizersList = eventOrganizers(profile);
        setOrganizers(organizersList);

        if (presetCommunityId) {
          const community = organizersList.find((o) => o.type === "community" && o.id === presetCommunityId);
          if (community) {
            setLockedCommunity({ id: community.id, name: community.name, authorized: true });
            setValue("communityId", community.id, { shouldValidate: true });
            setValue("organizationId", null, { shouldValidate: true });
          } else {
            const profileCommunities = profile?.communities || [];
            const known = profileCommunities.find((c: { id: string }) => c.id === presetCommunityId);
            setLockedCommunity({
              id: presetCommunityId,
              name: known?.name || "Komunitas ini",
              authorized: false,
            });
          }
        }
      } catch {
        console.error("Gagal memuat data");
      }
    };
    if (isAuthenticated) fetchData();
  }, [isAuthenticated, presetCommunityId, setValue]);

  const toggleCategory = (id: string) => {
    const current = formValues.categoryIds;
    if (current.includes(id)) {
      setValue("categoryIds", current.filter((c) => c !== id), { shouldValidate: true });
    } else {
      setValue("categoryIds", [...current, id], { shouldValidate: true });
    }
  };

  const validateCurrentStep = async (): Promise<boolean> => {
    const stepFields: Record<number, (keyof EventFormData)[]> = {
      1: ["title", "description", "categoryIds", "communityId", "organizationId"],
      2: ["eventDate", "timezone"],
      3: ["locationType"],
      4: ["quota"],
    };
    const fields = stepFields[step];
    if (fields) {
      const valid = await trigger(fields);
      return valid;
    }
    return true;
  };

  const handleNext = async () => {
    const valid = await validateCurrentStep();
    if (valid) setStep((prev) => Math.min(prev + 1, TOTAL_STEPS));
  };

  const handleBack = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const onSubmit = (data: EventFormData) => {
    if (lockedCommunity && !lockedCommunity.authorized) return;
    createMutation.mutate(data);
  };

  const mutationError = createMutation.error as {
    response?: { data?: { message?: string; errors?: Array<{ message?: string }> } };
  } | null;
  const mutationErrorMessage =
    mutationError?.response?.data?.errors?.[0]?.message ||
    mutationError?.response?.data?.message ||
    "Gagal membuat event. Silakan coba lagi.";

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-8 w-8 border-4 border-komuna-blue border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link
          href={presetCommunityId ? `/dashboard/communities/${presetCommunityId}/events` : "/dashboard/events"}
          className="text-sm text-komuna-blue hover:underline flex items-center gap-1"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {presetCommunityId ? "Kembali ke Event Komunitas" : "Kembali ke Event Saya"}
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h1 className="text-2xl font-bold text-komuna-navy mb-6">Buat Event Baru</h1>

        <div className="sr-only" aria-live="polite">Langkah {step} dari {TOTAL_STEPS}: {STEP_LABELS[step - 1]}</div>
        <div className="mb-8" aria-label={`Progres pembuatan event: langkah ${step} dari ${TOTAL_STEPS}`}>
          <div className="mb-3 h-2 overflow-hidden rounded-full bg-gray-200" role="progressbar" aria-valuemin={1} aria-valuemax={TOTAL_STEPS} aria-valuenow={step} aria-valuetext={`Langkah ${step} dari ${TOTAL_STEPS}: ${STEP_LABELS[step - 1]}`}>
            <div className="h-full bg-komuna-blue transition-[width]" style={{ width: `${(step / TOTAL_STEPS) * 100}%` }} />
          </div>
          <ol className="flex items-center justify-between">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => {
            const num = i + 1;
            const isActive = num === step;
            const isCompleted = num < step;
            return (
              <li key={num} className="flex items-center" aria-current={isActive ? "step" : undefined}>
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
                  <span className={`text-xs mt-1 hidden sm:block ${isActive ? "font-semibold text-komuna-blue" : "text-gray-500"}`}>{STEP_LABELS[i]}</span>
                </div>
                {i < TOTAL_STEPS - 1 && (
                  <div
                    className={`w-8 sm:w-12 h-0.5 mx-1 ${
                      num < step ? "bg-komuna-teal" : "bg-gray-200"
                    }`}
                  />
                )}
              </li>
            );
          })}
          </ol>
        </div>

        {/* Error Display */}
        {createMutation.isError && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-lg flex items-center gap-2">
            <svg className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            {mutationErrorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Judul Event <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register("title")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue text-sm"
                  placeholder="Contoh: Workshop React.js untuk Pemula"
                />
                {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deskripsi <span className="text-red-500">*</span>
                </label>
                <textarea
                  {...register("description")}
                  rows={5}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue text-sm resize-none"
                  placeholder="Jelaskan tentang event Anda..."
                />
                {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kategori <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => {
                    const isSelected = formValues.categoryIds.includes(cat.id);
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
                {errors.categoryIds && <p className="mt-1 text-xs text-red-500">{errors.categoryIds.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Selenggarakan oleh <span className="text-red-500">*</span>
                </label>
                {lockedCommunity ? (
                  <div className="flex items-center justify-between px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm">
                    <span className="font-medium text-gray-800">
                      {lockedCommunity.name} (Komunitas)
                    </span>
                    {lockedCommunity.authorized ? (
                      <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded-full">
                        Terpilih
                      </span>
                    ) : (
                      <span className="text-xs text-red-600 font-medium bg-red-50 px-2 py-1 rounded-full">
                        Tanpa izin
                      </span>
                    )}
                  </div>
                ) : (
                  <select
                    value={
                      formValues.communityId
                        ? `community:${formValues.communityId}`
                        : formValues.organizationId
                          ? `organization:${formValues.organizationId}`
                          : ""
                    }
                    onChange={(e) => {
                      const [type, id] = e.target.value.split(":");
                      setValue("communityId", type === "community" ? id : null, { shouldValidate: true });
                      setValue("organizationId", type === "organization" ? id : null, { shouldValidate: true });
                    }}
                    disabled={organizers.length === 0}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue text-sm disabled:bg-gray-100"
                  >
                    <option value="">Pilih penyelenggara</option>
                    {organizers.map((organizer) => (
                      <option key={`${organizer.type}:${organizer.id}`} value={`${organizer.type}:${organizer.id}`}>
                        {organizer.name} ({organizer.type === "community" ? "Komunitas" : "Organisasi"})
                      </option>
                    ))}
                  </select>
                )}
                {lockedCommunity && !lockedCommunity.authorized && (
                  <p className="mt-1 text-xs text-red-500">
                    Anda tidak memiliki izin untuk membuat event di komunitas ini.
                  </p>
                )}
                {!lockedCommunity && organizers.length === 0 && (
                  <p className="mt-1 text-xs text-gray-500">
                    Event hanya dapat dibuat oleh pemilik komunitas atau pengelola organisasi yang disetujui.
                  </p>
                )}
                {errors.communityId && <p className="mt-1 text-xs text-red-500">{errors.communityId.message}</p>}
              </div>
            </div>
          )}

          {/* Step 2: Schedule */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tanggal Mulai <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  {...register("eventDate")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue text-sm"
                />
                {errors.eventDate && <p className="mt-1 text-xs text-red-500">{errors.eventDate.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tanggal Selesai
                </label>
                <input
                  type="datetime-local"
                  {...register("endDate")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Timezone <span className="text-red-500">*</span>
                </label>
                <select
                  {...register("timezone")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue text-sm"
                >
                  {TIMEZONES.map((tz) => (
                    <option key={tz} value={tz}>{tz}</option>
                  ))}
                </select>
                {errors.timezone && <p className="mt-1 text-xs text-red-500">{errors.timezone.message}</p>}
              </div>
            </div>
          )}

          {/* Step 3: Location */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipe Lokasi <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(["OFFLINE", "ONLINE", "HYBRID"] as const).map((type) => (
                    <label
                      key={type}
                      className={`flex flex-col items-center gap-2 p-4 border rounded-lg cursor-pointer transition-colors ${
                        formValues.locationType === type
                          ? "border-komuna-blue bg-komuna-blue/5"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="radio"
                        {...register("locationType")}
                        value={type}
                        className="text-komuna-blue focus:ring-komuna-blue"
                      />
                      <svg className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        {type === "OFFLINE" && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />}
                        {type === "ONLINE" && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />}
                        {type === "HYBRID" && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />}
                      </svg>
                      <span className="text-sm font-medium text-gray-700 capitalize">
                        {type === "OFFLINE" ? "Offline" : type === "ONLINE" ? "Online" : "Hybrid"}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {(formValues.locationType === "OFFLINE" || formValues.locationType === "HYBRID") && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Alat Lokasi
                  </label>
                  <input
                    type="text"
                    {...register("location")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue text-sm"
                    placeholder="Contoh: Gedung Techno, Jl. Soekarno-Hatta No. 1"
                  />
                </div>
              )}

              {(formValues.locationType === "ONLINE" || formValues.locationType === "HYBRID") && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      URL Meeting
                    </label>
                    <input
                      type="url"
                      {...register("meetingUrl")}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue text-sm"
                      placeholder="https://meet.google.com/xxx-xxxx-xxx"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      URL Online (Opsional)
                    </label>
                    <input
                      type="url"
                      {...register("onlineUrl")}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue text-sm"
                      placeholder="https://zoom.us/j/xxx"
                    />
                  </div>
                </>
              )}
            </div>
          )}

          {/* Step 4: Capacity */}
          {step === 4 && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kuota Peserta <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  {...register("quota")}
                  min={1}
                  max={100000}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue text-sm"
                />
                {errors.quota && <p className="mt-1 text-xs text-red-500">{errors.quota.message}</p>}
              </div>

              <label
                className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                  formValues.allowWaitlist
                    ? "border-komuna-blue bg-komuna-blue/5"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <input
                  type="checkbox"
                  {...register("allowWaitlist")}
                  className="mt-0.5 text-komuna-blue focus:ring-komuna-blue"
                />
                <div>
                  <span className="text-sm font-medium text-gray-900">Aktifkan Waiting List</span>
                  <p className="text-sm text-gray-500">Izinkan pendaftar masuk waiting list jika kuota penuh</p>
                </div>
              </label>
            </div>
          )}

          {/* Step 5: Media */}
          {step === 5 && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL Cover Image
                </label>
                <input
                  type="text"
                  {...register("coverImage")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue text-sm"
                  placeholder="https://example.com/cover.jpg"
                />
                {formValues.coverImage && (
                  <div className="mt-2">
                    <img
                      src={formValues.coverImage}
                      alt="Cover preview"
                      className="w-full h-40 object-cover rounded border border-gray-200"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL Thumbnail
                </label>
                <input
                  type="text"
                  {...register("thumbnail")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue text-sm"
                  placeholder="https://example.com/thumb.jpg"
                />
                {formValues.thumbnail && (
                  <div className="mt-2">
                    <img
                      src={formValues.thumbnail}
                      alt="Thumbnail preview"
                      className="h-24 w-24 object-cover rounded border border-gray-200"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 6: Review */}
          {step === 6 && (
            <div className="space-y-4">
              <p className="text-sm text-gray-500 mb-4">
                Pastikan semua data sudah benar sebelum mengirim.
              </p>
              <div className="bg-gray-50 rounded-lg border border-gray-200 divide-y divide-gray-200">
                <div className="p-3">
                  <span className="text-xs font-medium text-gray-500 uppercase">Judul</span>
                  <p className="text-sm text-gray-900">{formValues.title}</p>
                </div>
                <div className="p-3">
                  <span className="text-xs font-medium text-gray-500 uppercase">Deskripsi</span>
                  <p className="text-sm text-gray-900 line-clamp-3">{formValues.description}</p>
                </div>
                <div className="p-3">
                  <span className="text-xs font-medium text-gray-500 uppercase">Kategori</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {formValues.categoryIds.map((id) => {
                      const cat = categories.find((c) => c.id === id);
                      return cat ? (
                        <span key={id} className="px-2 py-0.5 bg-komuna-blue/10 text-komuna-blue rounded text-xs font-medium">
                          {cat.name}
                        </span>
                      ) : null;
                    })}
                  </div>
                </div>
                <div className="p-3">
                  <span className="text-xs font-medium text-gray-500 uppercase">Tanggal Mulai</span>
                  <p className="text-sm text-gray-900">{formValues.eventDate ? new Date(formValues.eventDate).toLocaleString("id-ID") : "-"}</p>
                </div>
                <div className="p-3">
                  <span className="text-xs font-medium text-gray-500 uppercase">Tanggal Selesai</span>
                  <p className="text-sm text-gray-900">{formValues.endDate ? new Date(formValues.endDate).toLocaleString("id-ID") : "-"}</p>
                </div>
                <div className="p-3">
                  <span className="text-xs font-medium text-gray-500 uppercase">Timezone</span>
                  <p className="text-sm text-gray-900">{formValues.timezone}</p>
                </div>
                <div className="p-3">
                  <span className="text-xs font-medium text-gray-500 uppercase">Tipe Lokasi</span>
                  <p className="text-sm text-gray-900">{formValues.locationType}</p>
                </div>
                {formValues.location && (
                  <div className="p-3">
                    <span className="text-xs font-medium text-gray-500 uppercase">Lokasi</span>
                    <p className="text-sm text-gray-900">{formValues.location}</p>
                  </div>
                )}
                {formValues.meetingUrl && (
                  <div className="p-3">
                    <span className="text-xs font-medium text-gray-500 uppercase">Meeting URL</span>
                    <p className="text-sm text-gray-900">{formValues.meetingUrl}</p>
                  </div>
                )}
                <div className="p-3">
                  <span className="text-xs font-medium text-gray-500 uppercase">Kuota</span>
                  <p className="text-sm text-gray-900">{formValues.quota} peserta</p>
                </div>
                <div className="p-3">
                  <span className="text-xs font-medium text-gray-500 uppercase">Waiting List</span>
                  <p className="text-sm text-gray-900">{formValues.allowWaitlist ? "Aktif" : "Nonaktif"}</p>
                </div>
                {formValues.coverImage && (
                  <div className="p-3">
                    <span className="text-xs font-medium text-gray-500 uppercase">Cover Image</span>
                    <p className="text-sm text-gray-900 truncate">{formValues.coverImage}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 pt-6">
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                disabled={createMutation.isPending}
                className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Kembali
              </button>
            ) : (
              <Link
                href={presetCommunityId ? `/dashboard/communities/${presetCommunityId}/events` : "/dashboard/events"}
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
                type="submit"
                disabled={createMutation.isPending}
                className="px-6 py-2 bg-komuna-blue text-white text-sm font-medium rounded-lg hover:bg-komuna-navy disabled:opacity-50 transition-colors flex items-center gap-2"
              >
                {createMutation.isPending && (
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                {createMutation.isPending ? "Membuat..." : "Buat Event"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
