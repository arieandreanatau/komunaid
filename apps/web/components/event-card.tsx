import Link from "next/link";

export interface EventCardData {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  coverImage: string | null;
  thumbnail: string | null;
  location?: string | null;
  locationType?: string | null;
  eventDate: string;
  status: string;
  quota: number;
  registeredCount?: number;
  community?: { name: string; slug: string } | null;
  organization?: { name: string; slug: string } | null;
  categories?: { id: string; name: string }[];
}

export const EVENT_STATUS_MAP: Record<string, { label: string; className: string }> = {
  DRAFT: { label: "Draft", className: "bg-gray-100 text-gray-600" },
  SUBMITTED: { label: "Menunggu review", className: "bg-amber-100 text-amber-700" },
  IN_REVIEW: { label: "Sedang ditinjau", className: "bg-amber-100 text-amber-700" },
  REVISION_REQUESTED: { label: "Perlu revisi", className: "bg-orange-100 text-orange-700" },
  REJECTED: { label: "Ditolak", className: "bg-red-100 text-red-700" },
  APPROVED: { label: "Disetujui", className: "bg-emerald-100 text-emerald-700" },
  PUBLISHED: { label: "Diterbitkan", className: "bg-blue-100 text-blue-700" },
  REGISTRATION_OPEN: { label: "Pendaftaran Buka", className: "bg-green-100 text-green-700" },
  REGISTRATION_CLOSED: { label: "Pendaftaran Tutup", className: "bg-yellow-100 text-yellow-700" },
  ONGOING: { label: "Berlangsung", className: "bg-purple-100 text-purple-700" },
  COMPLETED: { label: "Selesai", className: "bg-green-200 text-green-800" },
  CANCELLED: { label: "Dibatalkan", className: "bg-red-100 text-red-700" },
  ARCHIVED: { label: "Diarsipkan", className: "bg-gray-200 text-gray-700" },
};

export function formatEventDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function EventCard({ event }: { event: EventCardData }) {
  const statusInfo = EVENT_STATUS_MAP[event.status];
  return (
    <Link
      href={`/events/${event.slug}`}
      className="group overflow-hidden rounded-2xl border border-komuna-forest/10 bg-white transition duration-200 hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="h-44 relative overflow-hidden">
        {event.coverImage || event.thumbnail ? (
          <img
            src={event.coverImage || event.thumbnail!}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="h-full bg-gradient-to-br from-komuna-blue to-komuna-teal flex items-center justify-center">
            <span className="text-white text-5xl font-bold opacity-30">{event.title[0]}</span>
          </div>
        )}
        {statusInfo && (
          <span className={`absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/90 ${statusInfo.className}`}>
            {statusInfo.label}
          </span>
        )}
      </div>
      <div className="p-5">
        <p className="text-xs font-bold text-komuna-coral">{formatEventDate(event.eventDate)}</p>
        <h3 className="mt-2 font-semibold text-komuna-dark mb-2 line-clamp-1 group-hover:text-komuna-forest transition-colors">
          {event.title}
        </h3>
        <p className="text-sm text-komuna-dark/65 line-clamp-2 mb-3 min-h-10">{event.description ?? ""}</p>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-komuna-dark/55 mb-2">
          <span className="inline-flex items-center gap-1">
            <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {event.locationType === "ONLINE" ? "Online" : event.location || "Lokasi TBD"}
          </span>
          <span className="text-komuna-coral">&middot;</span>
          <span>{event.registeredCount}/{event.quota} peserta</span>
        </div>
        {(event.community || event.organization) && (
          <p className="text-xs font-semibold text-komuna-forest">oleh {event.community?.name || event.organization?.name}</p>
        )}
        <span className="mt-2 inline-block text-sm font-bold text-komuna-forest">Lihat Event &rarr;</span>
      </div>
    </Link>
  );
}

export function EventCardSkeleton() {
  return (
    <div className="rounded-2xl border border-komuna-forest/10 bg-white overflow-hidden animate-pulse">
      <div className="h-44 bg-komuna-soft" />
      <div className="p-5 space-y-3">
        <div className="h-3 bg-komuna-soft rounded w-1/3" />
        <div className="h-4 bg-komuna-soft rounded w-3/4" />
        <div className="h-3 bg-komuna-soft rounded w-full" />
      </div>
    </div>
  );
}
