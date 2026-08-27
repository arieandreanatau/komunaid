"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import api from "@/lib/api";
import { useAuth } from "@/components/auth-provider";
import { useContextStore } from "@/components/sidebar";
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
  agendas: z
    .array(
      z.object({
        session: z.string().min(1, "Nama sesi wajib").max(200),
        description: z.string().optional(),
        startTime: z.string().optional(),
        endTime: z.string().optional(),
        room: z.string().optional(),
        speakerName: z.string().optional(),
      })
    )
    .max(30, "Maksimal 30 sesi")
    .optional(),
  speakers: z
    .array(
      z.object({
        name: z.string().min(1, "Nama pembicara wajib").max(200),
        photo: z.string().optional(),
        bio: z.string().optional(),
        position: z.string().optional(),
        institution: z.string().optional(),
        topic: z.string().optional(),
      })
    )
    .max(30, "Maksimal 30 pembicara")
    .optional(),
  tickets: z
    .array(
      z.object({
        name: z.string().min(1, "Nama tiket wajib").max(200),
        description: z.string().optional(),
        price: z.coerce.number().min(0, "Harga tidak boleh negatif"),
        quota: z.coerce.number().min(1).optional().nullable(),
      })
    )
    .max(10, "Maksimal 10 tiket")
    .optional(),
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

const TOTAL_STEPS = 7;

const STEP_LABELS = [
  "Informasi Dasar",
  "Jadwal",
  "Lokasi",
  "Kapasitas",
  "Media",
  "Detail & Tiket",
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
  const { activeContextType, activeCommunity } = useContextStore();
  const presetCommunityId = searchParams.get("communityId") || "";
  const contextCommunityId = presetCommunityId || (activeContextType === "community" ? activeCommunity?.id || "" : "");
  const contextCommunitySlug = activeContextType === "community" ? activeCommunity?.slug : undefined;
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
    control,
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
      agendas: [],
      speakers: [],
      tickets: [],
    },
  });

  const agendaFields = useFieldArray({ control, name: "agendas" });
  const speakerFields = useFieldArray({ control, name: "speakers" });
  const ticketFields = useFieldArray({ control, name: "tickets" });

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

      if (data.agendas && data.agendas.length > 0) {
        payload.agendas = data.agendas.map((agenda) => ({
          session: agenda.session.trim(),
          description: agenda.description?.trim() || undefined,
          startTime: agenda.startTime ? localDateTimeToIso(agenda.startTime, data.timezone) : undefined,
          endTime: agenda.endTime ? localDateTimeToIso(agenda.endTime, data.timezone) : undefined,
          room: agenda.room?.trim() || undefined,
          speakerName: agenda.speakerName?.trim() || undefined,
        }));
      }

      if (data.speakers && data.speakers.length > 0) {
        payload.speakers = data.speakers.map((speaker) => ({
          name: speaker.name.trim(),
          photo: speaker.photo?.trim() || undefined,
          bio: speaker.bio?.trim() || undefined,
          position: speaker.position?.trim() || undefined,
          institution: speaker.institution?.trim() || undefined,
          topic: speaker.topic?.trim() || undefined,
        }));
      }

      if (data.tickets && data.tickets.length > 0) {
        payload.tickets = data.tickets.map((ticket) => ({
          name: ticket.name.trim(),
          description: ticket.description?.trim() || undefined,
          price: Number(ticket.price),
          quota: ticket.quota ? Number(ticket.quota) : undefined,
        }));
      }

      return api.post("/events", payload);
    },
    onSuccess: (res) => {
      const eventId = res.data.event?.id || res.data.data?.id;
      router.push(eventId ? `/dashboard/events/${eventId}` : "/dashboard/events");
    },
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      const redirect = contextCommunitySlug
        ? `/dashboard/communities/${contextCommunitySlug}/events/create`
        : "/dashboard/events/create";
      router.push(`/login?redirect=${encodeURIComponent(redirect)}`);
    }
  }, [isAuthenticated, authLoading, router, contextCommunitySlug]);

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

        if (contextCommunityId) {
          const community = organizersList.find((o) => o.type === "community" && o.id === contextCommunityId);
          if (community) {
            setLockedCommunity({ id: community.id, name: community.name, authorized: true });
            setValue("communityId", community.id, { shouldValidate: true });
            setValue("organizationId", null, { shouldValidate: true });
          } else {
            const profileCommunities = profile?.communities || [];
            const known = profileCommunities.find((c: { id: string }) => c.id === contextCommunityId);
            setLockedCommunity({
              id: contextCommunityId,
              name: known?.name || activeCommunity?.name || "Komunitas ini",
              authorized: false,
            });
          }
        }
      } catch {
        console.error("Gagal memuat data");
      }
    };
    if (isAuthenticated) fetchData();
  }, [isAuthenticated, contextCommunityId, activeCommunity?.name, setValue]);

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

          {/* Step 6: Detail & Tickets */}
          {step === 6 && (
            <div className="space-y-8">
              {/* Agendas */}
              <section>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">Agenda</h3>
                    <p className="text-xs text-gray-500">Susunan acara event (opsional)</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => agendaFields.append({ session: "", description: "", startTime: "", endTime: "", room: "", speakerName: "" })}
                    className="px-3 py-1.5 text-sm font-medium text-komuna-blue border border-komuna-blue/30 rounded-lg hover:bg-komuna-blue/5 transition-colors"
                  >
                    + Tambah Sesi
                  </button>
                </div>
                {agendaFields.fields.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-4 border border-dashed border-gray-200 rounded-lg">
                    Belum ada agenda. Tambahkan sesi acara.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {agendaFields.fields.map((field, index) => (
                      <div key={field.id} className="border border-gray-200 rounded-lg p-4 space-y-3 bg-gray-50/50">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <label className="block text-xs font-medium text-gray-600 mb-1">Nama Sesi</label>
                            <input
                              type="text"
                              {...register(`agendas.${index}.session`)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-komuna-blue text-sm"
                              placeholder="Contoh: Pembukaan & Registrasi"
                            />
                            {errors.agendas?.[index]?.session && (
                              <p className="mt-1 text-xs text-red-500">{errors.agendas?.[index]?.session?.message}</p>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => agendaFields.remove(index)}
                            className="mt-5 text-gray-400 hover:text-red-500 transition-colors"
                            aria-label="Hapus sesi"
                          >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Mulai</label>
                            <input type="datetime-local" {...register(`agendas.${index}.startTime`)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-komuna-blue text-sm" />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Selesai</label>
                            <input type="datetime-local" {...register(`agendas.${index}.endTime`)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-komuna-blue text-sm" />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Ruang / Lokasi Sesi</label>
                            <input type="text" {...register(`agendas.${index}.room`)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-komuna-blue text-sm" placeholder="Contoh: Ruang A" />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Pembicara</label>
                            <input type="text" {...register(`agendas.${index}.speakerName`)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-komuna-blue text-sm" placeholder="Nama pembicara sesi" />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Deskripsi Sesi</label>
                          <textarea
                            rows={2}
                            {...register(`agendas.${index}.description`)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-komuna-blue text-sm resize-none"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Speakers */}
              <section>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">Pembicara</h3>
                    <p className="text-xs text-gray-500">Narasumber atau pembicara event (opsional)</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => speakerFields.append({ name: "", photo: "", bio: "", position: "", institution: "", topic: "" })}
                    className="px-3 py-1.5 text-sm font-medium text-komuna-blue border border-komuna-blue/30 rounded-lg hover:bg-komuna-blue/5 transition-colors"
                  >
                    + Tambah Pembicara
                  </button>
                </div>
                {speakerFields.fields.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-4 border border-dashed border-gray-200 rounded-lg">
                    Belum ada pembicara.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {speakerFields.fields.map((field, index) => (
                      <div key={field.id} className="border border-gray-200 rounded-lg p-4 space-y-3 bg-gray-50/50">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <label className="block text-xs font-medium text-gray-600 mb-1">Nama</label>
                            <input
                              type="text"
                              {...register(`speakers.${index}.name`)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-komuna-blue text-sm"
                              placeholder="Nama lengkap pembicara"
                            />
                            {errors.speakers?.[index]?.name && (
                              <p className="mt-1 text-xs text-red-500">{errors.speakers?.[index]?.name?.message}</p>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => speakerFields.remove(index)}
                            className="mt-5 text-gray-400 hover:text-red-500 transition-colors"
                            aria-label="Hapus pembicara"
                          >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Jabatan</label>
                            <input type="text" {...register(`speakers.${index}.position`)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-komuna-blue text-sm" />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Institusi</label>
                            <input type="text" {...register(`speakers.${index}.institution`)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-komuna-blue text-sm" />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Topik</label>
                            <input type="text" {...register(`speakers.${index}.topic`)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-komuna-blue text-sm" />
                          </div>
                          <div className="sm:col-span-2">
                            <label className="block text-xs font-medium text-gray-600 mb-1">Foto (URL)</label>
                            <input type="text" {...register(`speakers.${index}.photo`)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-komuna-blue text-sm" placeholder="https://..." />
                          </div>
                          <div className="sm:col-span-2">
                            <label className="block text-xs font-medium text-gray-600 mb-1">Bio</label>
                            <textarea rows={2} {...register(`speakers.${index}.bio`)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-komuna-blue text-sm resize-none" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Tickets */}
              <section>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">Tiket</h3>
                    <p className="text-xs text-gray-500">
                      Tipe tiket & harga (opsional). Tanpa payment gateway, daftar menunggu pembayaran manual.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => ticketFields.append({ name: "", description: "", price: 0 })}
                    className="px-3 py-1.5 text-sm font-medium text-komuna-blue border border-komuna-blue/30 rounded-lg hover:bg-komuna-blue/5 transition-colors"
                  >
                    + Tambah Tiket
                  </button>
                </div>
                {ticketFields.fields.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-4 border border-dashed border-gray-200 rounded-lg">
                    Belum ada tiket. Event gratis jika tidak ada tiket berbayar.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {ticketFields.fields.map((field, index) => (
                      <div key={field.id} className="border border-gray-200 rounded-lg p-4 space-y-3 bg-gray-50/50">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <label className="block text-xs font-medium text-gray-600 mb-1">Nama Tiket</label>
                            <input
                              type="text"
                              {...register(`tickets.${index}.name`)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-komuna-blue text-sm"
                              placeholder="Contoh: Early Bird, VIP"
                            />
                            {errors.tickets?.[index]?.name && (
                              <p className="mt-1 text-xs text-red-500">{errors.tickets?.[index]?.name?.message}</p>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => ticketFields.remove(index)}
                            className="mt-5 text-gray-400 hover:text-red-500 transition-colors"
                            aria-label="Hapus tiket"
                          >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Harga (Rp)</label>
                            <input type="number" min={0} {...register(`tickets.${index}.price`)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-komuna-blue text-sm" />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Kuota (Opsional)</label>
                            <input type="number" min={1} {...register(`tickets.${index}.quota`)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-komuna-blue text-sm" placeholder="Kosongkan jika tanpa batas" />
                          </div>
                          <div className="sm:col-span-2">
                            <label className="block text-xs font-medium text-gray-600 mb-1">Deskripsi</label>
                            <input type="text" {...register(`tickets.${index}.description`)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-komuna-blue text-sm" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          )}

          {/* Step 7: Review */}
          {step === 7 && (
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
                {formValues.agendas && formValues.agendas.length > 0 && (
                  <div className="p-3">
                    <span className="text-xs font-medium text-gray-500 uppercase">Agenda</span>
                    <p className="text-sm text-gray-900">{formValues.agendas.length} sesi</p>
                  </div>
                )}
                {formValues.speakers && formValues.speakers.length > 0 && (
                  <div className="p-3">
                    <span className="text-xs font-medium text-gray-500 uppercase">Pembicara</span>
                    <p className="text-sm text-gray-900">{formValues.speakers.map((s) => s.name).join(", ")}</p>
                  </div>
                )}
                {formValues.tickets && formValues.tickets.length > 0 && (
                  <div className="p-3">
                    <span className="text-xs font-medium text-gray-500 uppercase">Tiket</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {formValues.tickets.map((t, i) => (
                        <span key={i} className="px-2 py-0.5 bg-komuna-blue/10 text-komuna-blue rounded text-xs font-medium">
                          {t.name} — {Number(t.price) > 0 ? `Rp ${Number(t.price).toLocaleString("id-ID")}` : "Gratis"}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
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
