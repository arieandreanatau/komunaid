import Link from 'next/link';
import Image from 'next/image';
import { Users, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatNumber, truncate } from '@/lib/utils';

interface CommunityCardProps {
  slug: string;
  name: string;
  description: string;
  logo?: string | null;
  memberCount: number;
  category?: string;
  location?: string;
  className?: string;
}

export function CommunityCard({
  slug,
  name,
  description,
  logo,
  memberCount,
  category,
  location,
  className,
}: CommunityCardProps) {
  return (
    <Link href={`/communities/${slug}`}>
      <div
        className={cn(
          'card group cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5',
          className,
        )}
      >
        <div className="mb-4 flex items-start gap-4">
          <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl bg-gray-100">
            {logo ? (
              <Image
                src={logo}
                alt={name}
                width={48}
                height={48}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-royal text-lg font-bold text-white">
                {name.charAt(0)}
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-gray-900 group-hover:text-royal transition-colors">
              {name}
            </h3>
            {category && (
              <span className="inline-block mt-1 rounded-full bg-teal/10 px-2 py-0.5 text-xs font-medium text-teal">
                {category}
              </span>
            )}
          </div>
        </div>
        <p className="mb-4 text-sm text-gray-500 line-clamp-2">{truncate(description, 120)}</p>
        <div className="flex items-center gap-4 text-xs text-gray-400">
          <span className="inline-flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {formatNumber(memberCount)} anggota
          </span>
          {location && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {truncate(location, 30)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
