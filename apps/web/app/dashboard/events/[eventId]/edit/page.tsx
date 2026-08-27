"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { useAuth } from "@/components/auth-provider";

const eventSchema = z.object({
  title: z.string().min(3, "Judul minimal 3 karakter").max(200, "Judul maksimal 200 karakter"),
  description: z.string().min(10, "Deskripsi minimal 10 karakter").max(5000, "Deskripsi maksimal 5000 karakter"),
  categoryIds: z.array(z.string()).min(1, "Pilih minimal satu kategori"),
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
        session: z.string().min(1, "Nama sesi wajib"),
        description: z.string().optional(),
        startTime: z.string().optional(),
        endTime: z.string().optional(),
        room: z.string().optional(),
        speakerName: z.string().optional(),
      })
    )
    .optional(),
  speakers: z
    .array(
      z.object({
        name: z.string().min(1, "Nama pembicara wajib"),
        photo: z.string().optional(),
        bio: z.string().optional(),
        position: z.string().optional(),
        institution: z.string().optional(),
        topic: z.string().optional(),
      })
    )
    .optional(),
  tickets: z
    .array(
      z.object({
        name: z.string().min(1, "Nama tiket wajib"),
        description: z.string().optional(),
        price: z.coerce.number().min(0, "Harga tidak boleh negatif"),
        quota: z.coerce.number().min(1).optional().nullable(),
      })
    )
    .optional(),
});

type EventFormData = z.infer<typeof eventSchema>;

interface Category {
  id: string;
  name: string;
  icon: string;
}

interface EventData {
  id: string;
  title: string;
  description: string;
  eventDate: string;
  endDate: string;
  timezone: string;
  locationType: string;
  location: string;
  meetingUrl: string;
  onlineUrl: string;
  quota: number;
  allowWaitlist: boolean;
  coverImage: string;
  thumbnail: string;
  status: string;
  categories: Array<{ id: string; name: string }>;
  community: { id: string; name: string } | null;
  organization: { id: string; name: string } | null;
  agendas?: Array<{
    id: string;
    session: string;
    description: string | null;
    startTime: string | null;
    endTime: string | null;
    room: string | null;
    speakerName: string | null;
  }>;
  speakers?: Array<{
    id: string;
    name: string;
    photo: string | null;
    bio: string | null;
    position: string | null;
    institution: string | null;
    topic: string | null;
  }>;
  tickets?: Array<{
    id: string;
    name: string;
    description: string | null;
    price: number | string;
    quota: number | null;
  }>;
}

const TIMEZONES = [
  "Asia/Jakarta",
  "Asia/Makassar",
  "Asia/Jayapura",
  "UTC",
];

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

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.eventId as string;
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingEvent, setLoadingEvent] = useState(true);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    reset,
    formState: { errors },
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

  const { data: eventData } = useQuery({
    queryKey: ["event", eventId],
    enabled: !!isAuthenticated && !!eventId,
    queryFn: async () => {
      const res = await api.get(`/events/${eventId}`);
      return (res.data.event || res.data.data) as EventData;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: EventFormData) => {
      const payload: Record<string, unknown> = {
        title: data.title.trim(),
        description: data.description.trim(),
        categoryIds: data.categoryIds,
        eventDate: localDateTimeToIso(data.eventDate, data.timezone),
        endDate: data.endDate ? localDateTimeToIso(data.endDate, data.timezone) : undefined,
        timezone: data.timezone,
        locationType: data.locationType,
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
          startTime: agenda.startTime || undefined,
          endTime: agenda.endTime || undefined,
          room: agenda.room?.trim() || undefined,
          speakerName: agenda.speakerName?.trim() || undefined,
        }));
      } else {
        payload.agendas = [];
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
      } else {
        payload.speakers = [];
      }

      if (data.tickets && data.tickets.length > 0) {
        payload.tickets = data.tickets.map((ticket) => ({
          name: ticket.name.trim(),
          description: ticket.description?.trim() || undefined,
          price: Number(ticket.price),
          quota: ticket.quota ? Number(ticket.quota) : undefined,
        }));
      } else {
        payload.tickets = [];
      }

      return api.patch(`/events/${eventId}`, payload);
    },
    onSuccess: () => {
      router.push(`/dashboard/events/${eventId}`);
    },
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get("/categories");
        setCategories(res.data.data || []);
      } catch {
        console.error("Gagal memuat kategori");
      }
    };
    if (isAuthenticated) fetchCategories();
  }, [isAuthenticated]);

  useEffect(() => {
    if (eventData) {
      const toLocalDatetime = (dateStr: string) => {
        if (!dateStr) return "";
        const d = new Date(dateStr);
        return d.toISOString().slice(0, 16);
      };
      reset({
        title: eventData.title || "",
        description: eventData.description || "",
        categoryIds: eventData.categories?.map((c) => c.id) || [],
        communityId: eventData.community?.id || null,
        organizationId: eventData.organization?.id || null,
        eventDate: toLocalDatetime(eventData.eventDate),
        endDate: eventData.endDate ? toLocalDatetime(eventData.endDate) : null,
        timezone: eventData.timezone || "Asia/Jakarta",
        locationType: (eventData.locationType as "OFFLINE" | "ONLINE" | "HYBRID") || "OFFLINE",
        location: eventData.location || "",
        meetingUrl: eventData.meetingUrl || "",
        onlineUrl: eventData.onlineUrl || "",
        quota: eventData.quota || 50,
        allowWaitlist: eventData.allowWaitlist || false,
        coverImage: eventData.coverImage || "",
        thumbnail: eventData.thumbnail || "",
        agendas: (eventData.agendas || []).map((a) => ({
          session: a.session,
          description: a.description || "",
          startTime: a.startTime ? toLocalDatetime(a.startTime) : "",
          endTime: a.endTime ? toLocalDatetime(a.endTime) : "",
          room: a.room || "",
          speakerName: a.speakerName || "",
        })),
        speakers: (eventData.speakers || []).map((s) => ({
          name: s.name,
          photo: s.photo || "",
          bio: s.bio || "",
          position: s.position || "",
          institution: s.institution || "",
          topic: s.topic || "",
        })),
        tickets: (eventData.tickets || []).map((t) => ({
          name: t.name,
          description: t.description || "",
          price: Number(t.price),
          quota: t.quota,
        })),
      });
      setLoadingEvent(false);
    }
  }, [eventData, reset]);

  const toggleCategory = (id: string) => {
    const current = formValues.categoryIds;
    if (current.includes(id)) {
      setValue("categoryIds", current.filter((c) => c !== id), { shouldValidate: true });
    } else {
      setValue("categoryIds", [...current, id], { shouldValidate: true });
    }
  };

  const onSubmit = (data: EventFormData) => {
    updateMutation.mutate(data);
  };

  if (authLoading || loadingEvent) {
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
          href={`/dashboard/events/${eventId}`}
          className="text-sm text-komuna-blue hover:underline flex items-center gap-1"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Kembali ke Dashboard Event
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h1 className="text-2xl font-bold text-komuna-navy mb-6">Edit Event</h1>

        {updateMutation.isError && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-lg flex items-center gap-2">
            <svg className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            Gagal memperbarui event. Silakan coba lagi.
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-komuna-navy">Informasi Dasar</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Judul Event <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register("title")}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue text-sm"
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
          </div>

          {/* Schedule */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-komuna-navy">Jadwal</h2>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Selesai</label>
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
            </div>
          </div>

          {/* Location */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-komuna-navy">Lokasi</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipe Lokasi</label>
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
                    <span className="text-sm font-medium text-gray-700 capitalize">
                      {type === "OFFLINE" ? "Offline" : type === "ONLINE" ? "Online" : "Hybrid"}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {(formValues.locationType === "OFFLINE" || formValues.locationType === "HYBRID") && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lokasi</label>
                <input
                  type="text"
                  {...register("location")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue text-sm"
                />
              </div>
            )}

            {(formValues.locationType === "ONLINE" || formValues.locationType === "HYBRID") && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">URL Meeting</label>
                  <input
                    type="url"
                    {...register("meetingUrl")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">URL Online</label>
                  <input
                    type="url"
                    {...register("onlineUrl")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue text-sm"
                  />
                </div>
              </>
            )}
          </div>

          {/* Capacity */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-komuna-navy">Kapasitas</h2>
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

          {/* Media */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-komuna-navy">Media</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">URL Cover Image</label>
              <input
                type="text"
                {...register("coverImage")}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue text-sm"
              />
              {formValues.coverImage && (
                <div className="mt-2">
                  <img
                    src={formValues.coverImage}
                    alt="Cover preview"
                    className="w-full h-40 object-cover rounded border border-gray-200"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">URL Thumbnail</label>
              <input
                type="text"
                {...register("thumbnail")}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue text-sm"
              />
            </div>
          </div>

          {/* Agendas */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-komuna-navy">Agenda</h2>
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
                        />
                        {errors.agendas?.[index]?.session && (
                          <p className="mt-1 text-xs text-red-500">{errors.agendas?.[index]?.session?.message}</p>
                        )}
                      </div>
                      <button type="button" onClick={() => agendaFields.remove(index)} className="mt-5 text-gray-400 hover:text-red-500 transition-colors" aria-label="Hapus sesi">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
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
                        <input type="text" {...register(`agendas.${index}.room`)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-komuna-blue text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Pembicara</label>
                        <input type="text" {...register(`agendas.${index}.speakerName`)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-komuna-blue text-sm" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Deskripsi Sesi</label>
                      <textarea rows={2} {...register(`agendas.${index}.description`)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-komuna-blue text-sm resize-none" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Speakers */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-komuna-navy">Pembicara</h2>
              <button
                type="button"
                onClick={() => speakerFields.append({ name: "", photo: "", bio: "", position: "", institution: "", topic: "" })}
                className="px-3 py-1.5 text-sm font-medium text-komuna-blue border border-komuna-blue/30 rounded-lg hover:bg-komuna-blue/5 transition-colors"
              >
                + Tambah Pembicara
              </button>
            </div>
            {speakerFields.fields.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4 border border-dashed border-gray-200 rounded-lg">Belum ada pembicara.</p>
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
                        />
                        {errors.speakers?.[index]?.name && (
                          <p className="mt-1 text-xs text-red-500">{errors.speakers?.[index]?.name?.message}</p>
                        )}
                      </div>
                      <button type="button" onClick={() => speakerFields.remove(index)} className="mt-5 text-gray-400 hover:text-red-500 transition-colors" aria-label="Hapus pembicara">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
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
          </div>

          {/* Tickets */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-komuna-navy">Tiket</h2>
              <button
                type="button"
                onClick={() => ticketFields.append({ name: "", description: "", price: 0, quota: null })}
                className="px-3 py-1.5 text-sm font-medium text-komuna-blue border border-komuna-blue/30 rounded-lg hover:bg-komuna-blue/5 transition-colors"
              >
                + Tambah Tiket
              </button>
            </div>
            {ticketFields.fields.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4 border border-dashed border-gray-200 rounded-lg">Belum ada tiket. Event gratis jika tidak ada tiket berbayar.</p>
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
                        />
                        {errors.tickets?.[index]?.name && (
                          <p className="mt-1 text-xs text-red-500">{errors.tickets?.[index]?.name?.message}</p>
                        )}
                      </div>
                      <button type="button" onClick={() => ticketFields.remove(index)} className="mt-5 text-gray-400 hover:text-red-500 transition-colors" aria-label="Hapus tiket">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
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
          </div>

          <div className="flex items-center gap-3 pt-4">
            <Link
              href={`/dashboard/events/${eventId}`}
              className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Batal
            </Link>
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="px-6 py-2 bg-komuna-blue text-white text-sm font-medium rounded-lg hover:bg-komuna-navy disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              {updateMutation.isPending && (
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              {updateMutation.isPending ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
