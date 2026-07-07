import Link from 'next/link';
import Image from 'next/image';
import { Calendar, MapPin, Users } from 'lucide-react';
import { cn, formatDate, formatNumber } from '@/lib/utils';

interface EventCardProps {
  slug: string;
  title: string;
  description: string;
  banner?: string | null;
  date: string;
  location: string;
  category?: string;
  attendeeCount?: number;
  className?: string;
}

export function EventCard({
  slug,
  title,
  description,
  banner,
  date,
  location,
  category,
  attendeeCount,
  className,
}: EventCardProps) {
  return (
    <Link href={`/events/${slug}`}>
      <div
        className={cn(
          'card group cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5 overflow-hidden p-0',
          className,
        )}
      >
        <div className="relative h-44 w-full bg-gray-100">
          {banner ? (
            <Image src={banner} alt={title} fill className="object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-royal to-teal">
              <Calendar className="h-12 w-12 text-white/50" />
            </div>
          )}
          {category && (
            <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-royal backdrop-blur-sm">
              {category}
            </span>
          )}
        </div>
        <div className="p-5">
          <h3 className="mb-2 font-semibold text-gray-900 group-hover:text-royal transition-colors line-clamp-1">
            {title}
          </h3>
          <p className="mb-3 text-sm text-gray-500 line-clamp-2">{description}</p>
          <div className="flex flex-col gap-1.5 text-xs text-gray-400">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              {formatDate(date)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              {location}
            </span>
            {attendeeCount !== undefined && (
              <span className="inline-flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" />
                {formatNumber(attendeeCount)} peserta
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
