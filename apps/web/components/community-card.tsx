import Link from "next/link";

export interface CommunityCardData {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  coverImage: string | null;
  logo: string | null;
  banner: string | null;
  location: string | null;
  province: string | null;
  city: string | null;
  membershipType: string;
  visibility: string;
  status: string;
  owner?: { id: string; name: string; avatar: string | null } | null;
  memberCount: number;
  eventCount: number;
  categories?: { id: string; name: string }[];
  tags?: { id: string; tag: string }[];
  createdAt?: string;
}

export function CommunityCard({ community }: { community: CommunityCardData }) {
  return (
    <Link
      href={`/communities/${community.slug}`}
      className="group overflow-hidden rounded-2xl border border-komuna-forest/10 bg-white transition duration-200 hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="h-44 relative overflow-hidden">
        {community.coverImage || community.logo ? (
          <img
            src={community.coverImage || community.logo!}
            alt={community.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="h-full bg-gradient-to-br from-komuna-forest to-komuna-dark flex items-center justify-center">
            <span className="text-white text-5xl font-bold opacity-30">
              {community.name[0]}
            </span>
          </div>
        )}
        {community.membershipType && (
          <span
            className={`absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-xs font-bold ${
              community.membershipType === "OPEN"
                ? "bg-white/90 text-komuna-forest"
                : "bg-komuna-navy/80 text-white"
            }`}
          >
            {community.membershipType === "OPEN" ? "Terbuka" : "Terbatas"}
          </span>
        )}
      </div>
      <div className="p-5">
        <p className="text-xs font-bold text-komuna-coral">{community.categories?.[0]?.name || "Komunitas"}</p>
        <h3 className="mt-2 font-semibold text-komuna-dark mb-2 line-clamp-1 group-hover:text-komuna-forest transition-colors">
          {community.name}
        </h3>
        <p className="text-sm text-komuna-dark/65 line-clamp-2 mb-3 min-h-10">
          {community.description || "Komunitas untuk bertumbuh bersama."}
        </p>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-komuna-dark/55 mb-2">
          {community.location && (
            <>
              <span className="inline-flex items-center gap-1">
                <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {community.location}
              </span>
              <span className="text-komuna-coral">&middot;</span>
            </>
          )}
          <span>{community.memberCount} anggota</span>
          <span className="text-komuna-coral">&middot;</span>
          <span>{community.eventCount} event</span>
        </div>
        <span className="mt-1 inline-block text-sm font-bold text-komuna-forest">Lihat Komunitas &rarr;</span>
      </div>
    </Link>
  );
}

export function CommunityCardSkeleton() {
  return (
    <div className="rounded-2xl border border-komuna-forest/10 bg-white overflow-hidden animate-pulse">
      <div className="h-44 bg-komuna-soft" />
      <div className="p-5 space-y-3">
        <div className="h-3 bg-komuna-soft rounded w-1/4" />
        <div className="h-4 bg-komuna-soft rounded w-3/4" />
        <div className="h-3 bg-komuna-soft rounded w-full" />
        <div className="h-3 bg-komuna-soft rounded w-1/2" />
      </div>
    </div>
  );
}