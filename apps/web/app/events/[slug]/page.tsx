"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { useAuth } from "@/components/auth-provider";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { getInitial } from "@/lib/initial";

interface Event {
  id: string;
  title: string;
  slug: string;
  description: string;
  coverImage: string;
  thumbnail: string;
  location: string;
  locationType: string;
  isOnline: boolean;
  meetingUrl: string;
  onlineUrl: string;
  eventDate: string;
  endDate: string;
  timezone: string;
  status: string;
  quota: number;
  registeredCount: number;
  waitlistCount: number;
  allowWaitlist: boolean;
  community: { id: string; name: string; slug: string; logo: string | null } | null;
  organization: { id: string; name: string; slug: string; logo: string | null } | null;
  createdBy: { id: string; name: string; avatar: string | null; username: string };
  categories: Array<{ id: string; name: string }>;
  contactEmail: string;
  contactPhone: string;
  gallery: Array<{ id: string; url: string; caption: string | null }>;
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
  tickets?: Array<{ id: string; name: string; description: string | null; price: string; quota: number | null }>;
  userRegistration: {
    id: string;
    status: string;
    attendance: string;
  } | null;
  isSaved: boolean;
}

const REG_STATUS_MAP: Record<string, { label: string; className: string }> = {
  CONFIRMED: { label: "Dikonfirmasi", className: "bg-green-100 text-green-700 border-green-200" },
  PENDING: { label: "Menunggu", className: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  WAITLISTED: { label: "Waiting List", className: "bg-orange-100 text-orange-700 border-orange-200" },
  CANCELLED: { label: "Dibatalkan", className: "bg-red-100 text-red-700 border-red-200" },
  REJECTED: { label: "Ditolak", className: "bg-red-100 text-red-700 border-red-200" },
};

const RELATED_STATUS_MAP: Record<string, { label: string; className: string }> = {
  DRAFT: { label: "Draft", className: "bg-gray-100 text-gray-600" },
  PUBLISHED: { label: "Diterbitkan", className: "bg-blue-100 text-blue-700" },
  REGISTRATION_OPEN: { label: "Pendaftaran Buka", className: "bg-green-100 text-green-700" },
  REGISTRATION_CLOSED: { label: "Pendaftaran Tutup", className: "bg-yellow-100 text-yellow-700" },
  ONGOING: { label: "Berlangsung", className: "bg-purple-100 text-purple-700" },
  COMPLETED: { label: "Selesai", className: "bg-green-200 text-green-800" },
  CANCELLED: { label: "Dibatalkan", className: "bg-red-100 text-red-700" },
  ARCHIVED: { label: "Diarsipkan", className: "bg-gray-200 text-gray-700" },
};

export default function EventDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [saveError, setSaveError] = useState("");

  const { data: event, isLoading, error } = useQuery({
    queryKey: ["event", slug],
    enabled: !!slug,
    queryFn: async () => {
      const { data } = await api.get(`/events/${slug}`);
      return (data.event || data.data) as Event;
    },
  });

  const { data: relatedEvents } = useQuery({
    queryKey: ["relatedEvents", slug],
    enabled: !!event,
    queryFn: async () => {
      const { data } = await api.get("/events", { params: { limit: 3, upcoming: "true" } });
      const events = (data.data || data.events || []) as Event[];
      return events.filter((e) => e.slug !== slug).slice(0, 3);
    },
  });

  const [registerError, setRegisterError] = useState("");

  const registerMutation = useMutation({
    mutationFn: async () => {
      setRegisterError("");
      return api.post(`/events/${event!.id}/register`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event", slug] });
      setRegisterModalOpen(false);
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || "Gagal mendaftar event. Silakan coba lagi.";
      setRegisterError(msg);
    },
  });

  const cancelRegistrationMutation = useMutation({
    mutationFn: async () => {
      return api.delete(`/events/${event!.id}/register`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event", slug] });
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      setSaveError("");
      if (event!.isSaved) {
        return api.delete(`/events/${event!.id}/save`);
      }
      return api.post(`/events/${event!.id}/save`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event", slug] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["mySavedEvents"] });
    },
    onError: (error: any) => {
      setSaveError(error.response?.data?.message || "Gagal memperbarui event tersimpan.");
    },
  });

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDateShort = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-komuna-cream">
        <div className="text-center">
          <div className="h-12 w-12 border-4 border-komuna-forest border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-komuna-dark/60">Memuat event...</p>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen flex flex-col bg-komuna-cream">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="font-display text-3xl font-semibold tracking-[-0.03em] text-komuna-dark mb-2">Event Tidak Ditemukan</h2>
            <p className="text-komuna-dark/65 mb-6">Event yang kamu cari tidak tersedia atau telah dihapus.</p>
            <Link href="/events" className="inline-flex items-center gap-2 px-5 py-2.5 bg-komuna-forest text-white rounded-xl font-bold hover:bg-komuna-dark transition-colors">
              Kembali ke Direktori Event
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const registration = event.userRegistration;
  const isRegistered = registration && registration.status !== "CANCELLED" && registration.status !== "REJECTED";
  const canRegister = (event.status === "REGISTRATION_OPEN" || event.status === "PUBLISHED") && (!isRegistered || registration?.status === "CANCELLED");
  const canCancel = isRegistered && event.status !== "COMPLETED" && event.status !== "CANCELLED";
  const regInfo = registration ? REG_STATUS_MAP[registration.status] : null;
  const quotaPercent = event.quota > 0 ? Math.round((event.registeredCount / event.quota) * 100) : 0;
  const isFull = event.registeredCount >= event.quota;

  return (
    <div className="min-h-screen flex flex-col bg-komuna-cream">
      <Header />

      <main className="container mx-auto px-4 py-8 flex-1">
        <div className="max-w-5xl mx-auto">
          <Breadcrumbs items={[{ label: "Event", href: "/events" }, { label: event.title }]} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Cover */}
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                {event.coverImage ? (
                  <img src={event.coverImage} alt={event.title} className="w-full h-64 md:h-80 object-cover" />
                ) : (
                  <div className="h-64 md:h-80 bg-gradient-to-br from-komuna-teal to-komuna-aqua flex items-center justify-center">
                    <span className="text-white text-7xl font-bold opacity-20">{event.title[0]}</span>
                  </div>
                )}
              </div>

              {/* Title & Meta */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  {event.categories.length > 0 && event.categories.map((cat) => (
                    <span key={cat.id} className="px-2.5 py-0.5 bg-komuna-blue/5 text-komuna-blue rounded-full text-xs font-medium">
                      {cat.name}
                    </span>
                  ))}
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    event.locationType === "ONLINE" ? "bg-blue-100 text-blue-700" :
                    event.locationType === "HYBRID" ? "bg-purple-100 text-purple-700" :
                    "bg-gray-100 text-gray-700"
                  }`}>
                    {event.locationType === "ONLINE" ? "Online" : event.locationType === "HYBRID" ? "Hybrid" : "Offline"}
                  </span>
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-komuna-navy mb-4">{event.title}</h1>

                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-gray-600 mb-4">
                  <span className="inline-flex items-center gap-1.5">
                    <svg className="h-4 w-4 text-komuna-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    {event.registeredCount} peserta
                  </span>
                  {event.community && (
                    <span className="inline-flex items-center gap-1.5">
                      <svg className="h-4 w-4 text-komuna-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                      {event.community.name}
                    </span>
                  )}
                </div>

                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-center gap-3">
                    <svg className="h-5 w-5 text-komuna-blue flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <div>
                      <p className="font-medium text-gray-900">{formatDate(event.eventDate)}</p>
                      {event.endDate && (
                        <p className="text-gray-500">s/d {formatDate(event.endDate)}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <svg className="h-5 w-5 text-komuna-blue flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <div>
                      {event.locationType === "ONLINE" || event.locationType === "HYBRID" ? (
                        <div>
                          {event.meetingUrl && (
                            <a href={event.meetingUrl} target="_blank" rel="noopener noreferrer" className="text-komuna-blue hover:underline">
                              {event.meetingUrl}
                            </a>
                          )}
                        </div>
                      ) : null}
                      {event.location && <p className="text-gray-900">{event.location}</p>}
                      {!event.location && event.locationType === "ONLINE" && <p>Online Event</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <svg className="h-5 w-5 text-komuna-blue flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <div>
                      {event.contactEmail && <p>{event.contactEmail}</p>}
                      {event.contactPhone && <p>{event.contactPhone}</p>}
                      {!event.contactEmail && !event.contactPhone && <p className="text-gray-400">-</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <svg className="h-5 w-5 text-komuna-blue flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p>Timezone: {event.timezone}</p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-komuna-navy mb-3">Tentang Event</h2>
                <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{event.description}</p>
              </div>

              {/* Agenda */}
              {event.agendas && event.agendas.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-lg font-semibold text-komuna-navy mb-4">Agenda</h2>
                  <div className="space-y-3">
                    {event.agendas.map((agenda, idx) => (
                      <div key={agenda.id} className="flex gap-4 p-4 rounded-lg border border-gray-100">
                        <div className="flex-shrink-0 text-center w-12">
                          <span className="block text-sm font-bold text-komuna-blue">{idx + 1}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-1">
                            <h3 className="font-medium text-komuna-navy text-sm">{agenda.session}</h3>
                            {agenda.speakerName && (
                              <span className="px-2 py-0.5 bg-komuna-teal/10 text-komuna-teal rounded-full text-xs font-medium">
                                {agenda.speakerName}
                              </span>
                            )}
                          </div>
                          {(agenda.startTime || agenda.endTime) && (
                            <p className="text-xs text-gray-500 mb-1">
                              {agenda.startTime ? new Date(agenda.startTime).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) : "-"}
                              {agenda.endTime ? ` – ${new Date(agenda.endTime).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}` : ""}
                              {agenda.room ? ` · ${agenda.room}` : ""}
                            </p>
                          )}
                          {agenda.description && <p className="text-sm text-gray-600">{agenda.description}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Speakers */}
              {event.speakers && event.speakers.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-lg font-semibold text-komuna-navy mb-4">Pembicara</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {event.speakers.map((speaker) => (
                      <div key={speaker.id} className="p-4 rounded-lg border border-gray-100 text-center">
                        {speaker.photo ? (
                          <img src={speaker.photo} alt={speaker.name} className="h-16 w-16 rounded-full object-cover mx-auto mb-2" />
                        ) : (
                          <div className="h-16 w-16 rounded-full bg-komuna-blue/10 flex items-center justify-center mx-auto mb-2">
                            <span className="text-komuna-blue font-bold text-lg">{getInitial(speaker.name)}</span>
                          </div>
                        )}
                        <h3 className="font-medium text-komuna-navy text-sm">{speaker.name}</h3>
                        {(speaker.position || speaker.institution) && (
                          <p className="text-xs text-gray-500 mt-0.5">
                            {[speaker.position, speaker.institution].filter(Boolean).join(" · ")}
                          </p>
                        )}
                        {speaker.topic && <p className="text-xs text-komuna-teal mt-1 italic">{speaker.topic}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Gallery */}
              {event.gallery && event.gallery.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-lg font-semibold text-komuna-navy mb-4">Galeri</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {event.gallery.map((item) => (
                      <div key={item.id} className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                        <img src={item.url} alt={item.caption || ""} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Related Events */}
              {relatedEvents && relatedEvents.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-lg font-semibold text-komuna-navy mb-4">Event Terkait</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {relatedEvents.map((re) => {
                      const statusInfo = RELATED_STATUS_MAP[re.status];
                      return (
                        <Link key={re.id} href={`/events/${re.slug}`} className="bg-gray-50 rounded-lg overflow-hidden hover:shadow-md transition-shadow group">
                          <div className="h-32 relative overflow-hidden">
                            {re.coverImage || re.thumbnail ? (
                              <img src={re.coverImage || re.thumbnail} alt={re.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="h-full bg-gradient-to-br from-komuna-blue to-komuna-teal flex items-center justify-center"><span className="text-white text-7xl font-bold opacity-20">{getInitial(re.title)}</span></div>
                      )}
                            {statusInfo && <span className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-xs font-medium ${statusInfo.className}`}>{statusInfo.label}</span>}
                          </div>
                          <div className="p-3">
                            <h3 className="font-medium text-komuna-navy text-sm line-clamp-1 group-hover:text-komuna-blue transition-colors">{re.title}</h3>
                            <p className="text-xs text-gray-500 mt-1">{new Date(re.eventDate).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</p>
                            <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                              <span>{re.locationType === "ONLINE" ? "Online" : re.location || "TBD"}</span>
                              <span>&middot;</span>
                              <span>{re.registeredCount}/{re.quota}</span>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Registration Card */}
              <div className="bg-white rounded-xl shadow-sm p-6 sticky top-20">
                <div className="text-center mb-4">
                  <div className="text-3xl font-bold text-komuna-navy">{event.registeredCount}</div>
                  <p className="text-sm text-gray-500">/ {event.quota} peserta</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-gradient-to-r from-komuna-blue to-komuna-teal h-2 rounded-full transition-all"
                      style={{ width: `${Math.min(quotaPercent, 100)}%` }}
                    />
                  </div>
                </div>

                {registration && isRegistered && (
                  <div className={`text-center py-3 rounded-lg border mb-4 ${regInfo?.className || ""}`}>
                    <p className="text-sm font-medium">{regInfo?.label || registration.status}</p>
                    {registration.attendance && registration.attendance !== "REGISTERED" && (
                      <p className="text-xs mt-1 opacity-75">
                        Kehadiran: {registration.attendance === "CHECKED_IN" ? "Hadir" : registration.attendance === "CHECKED_OUT" ? "Selesai" : registration.attendance}
                      </p>
                    )}
                  </div>
                )}

                {canRegister && (
                  <button
                    onClick={() => {
                      if (!isAuthenticated) {
                        window.location.href = `/login?redirect=${encodeURIComponent(`/events/${slug}`)}`;
                        return;
                      }
                      setRegisterModalOpen(true);
                    }}
                    disabled={isFull && !event.allowWaitlist}
                    className="w-full py-3 bg-komuna-blue text-white rounded-lg hover:bg-komuna-navy transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isFull && event.allowWaitlist ? "Join Waiting List" : isFull ? "Kuota Penuh" : "Daftar Event"}
                  </button>
                )}

                {canCancel && (
                  <button
                    onClick={() => {
                      if (confirm("Yakin ingin membatalkan pendaftaran?")) {
                        cancelRegistrationMutation.mutate();
                      }
                    }}
                    disabled={cancelRegistrationMutation.isPending}
                    className="w-full py-3 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium text-sm disabled:opacity-50"
                  >
                    {cancelRegistrationMutation.isPending ? "Membatalkan..." : "Batalkan Pendaftaran"}
                  </button>
                )}

                {!isAuthenticated && !canRegister && event.status !== "COMPLETED" && event.status !== "CANCELLED" && (
                  <Link
                    href={`/login?redirect=${encodeURIComponent(`/events/${slug}`)}`}
                    className="w-full py-3 bg-komuna-blue text-white rounded-lg hover:bg-komuna-navy transition-colors font-medium text-center block"
                  >
                    Masuk untuk Mendaftar
                  </Link>
                )}

                {event.status === "COMPLETED" && (
                  <div className="text-center py-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-500 font-medium">Event Selesai</p>
                  </div>
                )}

                {event.status === "CANCELLED" && (
                  <div className="text-center py-3 bg-red-50 rounded-lg border border-red-200">
                    <p className="text-sm text-red-600 font-medium">Event Dibatalkan</p>
                  </div>
                )}

                {event.allowWaitlist && (
                  <p className="text-xs text-gray-400 text-center mt-2">Waiting List tersedia ({event.waitlistCount} mengantri)</p>
                )}

                {/* Share */}
                <button
                  onClick={() => {
                    if (!isAuthenticated) {
                      window.location.href = `/login?redirect=${encodeURIComponent(`/events/${slug}`)}`;
                      return;
                    }
                    saveMutation.mutate();
                  }}
                  disabled={saveMutation.isPending}
                  aria-pressed={event.isSaved}
                  className={`w-full mt-3 py-2.5 border rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50 ${event.isSaved ? "border-komuna-blue bg-komuna-blue/5 text-komuna-blue" : "border-gray-300 text-gray-600 hover:bg-gray-50"}`}
                >
                  <svg className="h-4 w-4" fill={event.isSaved ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-4-7 4V5z" />
                  </svg>
                  {saveMutation.isPending ? "Memproses..." : event.isSaved ? "Tersimpan" : "Simpan Event"}
                </button>
                {saveError && <p role="alert" className="mt-2 text-center text-xs text-red-600">{saveError}</p>}

                <button
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({ title: event.title, url: window.location.href });
                    } else {
                      navigator.clipboard.writeText(window.location.href);
                      alert("Link disalin!");
                    }
                  }}
                  className="w-full mt-2 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm text-gray-600 flex items-center justify-center gap-2"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  Bagikan
                </button>
              </div>

              {/* Organizer */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-sm font-medium text-gray-500 mb-3">Diselenggarakan oleh</h3>
                {event.community && (
                  <Link href={`/communities/${event.community.slug}`} className="flex items-center gap-3 hover:bg-gray-50 rounded-lg p-2 -m-2 transition-colors">
                    {event.community.logo ? (
                      <img src={event.community.logo} alt={event.community.name} className="h-10 w-10 rounded-lg object-cover" />
                    ) : (
                      <div className="h-10 w-10 rounded-lg bg-komuna-blue/10 flex items-center justify-center">
                        <span className="text-komuna-blue font-bold text-sm">{getInitial(event.community.name)}</span>
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{event.community.name}</p>
                      <p className="text-xs text-gray-500">Komunitas</p>
                    </div>
                  </Link>
                )}
                {event.organization && !event.community && (
                  <Link href={`/organizations/${event.organization.slug}`} className="flex items-center gap-3 hover:bg-gray-50 rounded-lg p-2 -m-2 transition-colors">
                    {event.organization.logo ? (
                      <img src={event.organization.logo} alt={event.organization.name} className="h-10 w-10 rounded-lg object-cover" />
                    ) : (
                      <div className="h-10 w-10 rounded-lg bg-komuna-teal/10 flex items-center justify-center">
                        <span className="text-komuna-teal font-bold text-sm">{getInitial(event.organization.name)}</span>
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{event.organization.name}</p>
                      <p className="text-xs text-gray-500">Organisasi</p>
                    </div>
                  </Link>
                )}
                {!event.community && !event.organization && event.createdBy && (
                  <div className="flex items-center gap-3">
                    {event.createdBy.avatar ? (
                      <img src={event.createdBy.avatar} alt={event.createdBy.name} className="h-10 w-10 rounded-full object-cover" />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-komuna-navy/10 flex items-center justify-center">
                        <span className="text-komuna-navy font-bold text-sm">{getInitial(event.createdBy.name)}</span>
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{event.createdBy.name}</p>
                      <p className="text-xs text-gray-500">@{event.createdBy.username}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Register Modal */}
      {registerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setRegisterModalOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
            <button
              onClick={() => setRegisterModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h3 className="text-lg font-semibold text-komuna-navy mb-1">Daftar Event</h3>
            <p className="text-sm text-gray-500 mb-4">
              Kamu akan mendaftar untuk <strong>{event.title}</strong>.
              {isFull && event.allowWaitlist && (
                <span className="block text-orange-600 mt-1">Kuota penuh, kamu akan masuk waiting list.</span>
              )}
            </p>

            {registerError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {registerError}
              </div>
            )}

            <div className="bg-gray-50 rounded-lg p-3 mb-4 text-sm">
              <div className="flex justify-between mb-1">
                <span className="text-gray-500">Tanggal</span>
                <span className="text-gray-900">{formatDateShort(event.eventDate)}</span>
              </div>
              <div className="flex justify-between mb-1">
                <span className="text-gray-500">Lokasi</span>
                <span className="text-gray-900">{event.locationType === "ONLINE" ? "Online" : event.location || "TBD"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Kuota</span>
                <span className="text-gray-900">{event.registeredCount}/{event.quota}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setRegisterModalOpen(false)}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors text-sm"
              >
                Batal
              </button>
              <button
                onClick={() => registerMutation.mutate()}
                disabled={registerMutation.isPending}
                className="flex-1 px-4 py-2.5 bg-komuna-blue text-white rounded-lg font-medium hover:bg-komuna-navy transition-colors text-sm disabled:opacity-50 inline-flex items-center justify-center gap-2"
              >
                {registerMutation.isPending && (
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                {isFull && event.allowWaitlist ? "Join Waiting List" : "Konfirmasi Daftar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
