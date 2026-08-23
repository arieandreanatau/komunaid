import Link from "next/link";

export interface VolunteerPositionCard {
  id: string;
  name: string;
  requiredQty: number;
}

export interface VolunteerCardData {
  id: string;
  title: string;
  slug: string;
  description: string;
  coverImage?: string | null;
  thumbnail?: string | null;
  status: string;
  registrationDeadline: string;
  activityStartDate?: string | null;
  startDate?: string | null;
  location?: string | null;
  organizer?: { id: string; name: string; avatar?: string | null } | null;
  positions?: VolunteerPositionCard[];
  applicationCount: number;
  createdAt?: string;
}

export const VOLUNTEER_STATUS_MAP: Record<string, { label: string; className: string }> = {
  OPEN: { label: "Open", className: "bg-green-100 text-green-700" },
  CLOSED: { label: "Closed", className: "bg-red-100 text-red-700" },
  DRAFT: { label: "Draft", className: "bg-gray-100 text-gray-600" },
  PUBLISHED: { label: "Diterbitkan", className: "bg-blue-100 text-blue-700" },
  ARCHIVED: { label: "Diarsipkan", className: "bg-gray-200 text-gray-700" },
  SCHEDULED: { label: "Terjadwal", className: "bg-blue-100 text-blue-700" },
  REGISTRATION_OPEN: { label: "Pendaftaran Dibuka", className: "bg-green-100 text-green-700" },
  REGISTRATION_CLOSED: { label: "Pendaftaran Ditutup", className: "bg-red-100 text-red-700" },
  ONGOING: { label: "Berlangsung", className: "bg-purple-100 text-purple-700" },
  COMPLETED: { label: "Selesai", className: "bg-gray-200 text-gray-700" },
  CANCELLED: { label: "Dibatalkan", className: "bg-red-100 text-red-700" },
  UNDER_REVIEW: { label: "Dalam Review", className: "bg-yellow-100 text-yellow-700" },
  REVISION_REQUIRED: { label: "Perlu Revisi", className: "bg-yellow-100 text-yellow-700" },
  APPROVED: { label: "Disetujui", className: "bg-green-100 text-green-700" },
};

export function formatVolunteerDate(dateStr?: string | null) {
  if (!dateStr) return "Tanggal menyusul";
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function VolunteerCard({ opportunity }: { opportunity: VolunteerCardData }) {
  const statusInfo = VOLUNTEER_STATUS_MAP[opportunity.status];
  return (
    <Link
      href={`/volunteer/${opportunity.slug}`}
      className="group overflow-hidden rounded-2xl border border-komuna-forest/10 bg-white transition duration-200 hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="h-44 relative overflow-hidden">
        {opportunity.coverImage || opportunity.thumbnail ? (
          <img
            src={opportunity.coverImage || opportunity.thumbnail!}
            alt={opportunity.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="h-full bg-gradient-to-br from-komuna-teal to-komuna-aqua flex items-center justify-center">
            <span className="text-white text-5xl font-bold opacity-30">{opportunity.title[0]}</span>
          </div>
        )}
        {statusInfo && (
          <span className={`absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/90 ${statusInfo.className}`}>
            {statusInfo.label}
          </span>
        )}
      </div>
      <div className="p-5">
        <p className="text-xs font-bold text-komuna-coral">
          {formatVolunteerDate(opportunity.startDate || opportunity.activityStartDate || opportunity.registrationDeadline)}
        </p>
        <h3 className="mt-2 font-semibold text-komuna-dark mb-2 line-clamp-1 group-hover:text-komuna-forest transition-colors">
          {opportunity.title}
        </h3>
        <p className="text-sm text-komuna-dark/65 line-clamp-2 mb-3 min-h-10">{opportunity.description}</p>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-komuna-dark/55 mb-2">
          {opportunity.location && (
            <>
              <span className="inline-flex items-center gap-1">
                <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {opportunity.location}
              </span>
              <span className="text-komuna-coral">&middot;</span>
            </>
          )}
          <span>{opportunity.applicationCount} pendaftar</span>
        </div>
        {opportunity.positions && opportunity.positions.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {opportunity.positions.slice(0, 3).map((pos) => (
              <span key={pos.id} className="px-2.5 py-0.5 bg-komuna-teal/10 text-komuna-teal rounded-full text-xs font-bold">
                {pos.name}
              </span>
            ))}
          </div>
        )}
        <span className="mt-1 inline-block text-sm font-bold text-komuna-forest">Lihat Detail &rarr;</span>
      </div>
    </Link>
  );
}

export function VolunteerCardSkeleton() {
  return (
    <div className="rounded-2xl border border-komuna-forest/10 bg-white overflow-hidden animate-pulse">
      <div className="h-44 bg-komuna-soft" />
      <div className="p-5 space-y-3">
        <div className="h-3 bg-komuna-soft rounded w-1/3" />
        <div className="h-4 bg-komuna-soft rounded w-3/4" />
        <div className="h-3 bg-komuna-soft rounded w-full" />
        <div className="h-3 bg-komuna-soft rounded w-1/2" />
      </div>
    </div>
  );
}
