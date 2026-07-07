export interface Event {
  id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription: string | null;
  banner: string | null;
  startDate: Date;
  endDate: Date;
  startTime: string | null;
  endTime: string | null;
  location: string | null;
  locationUrl: string | null;
  isOnline: boolean;
  onlineUrl: string | null;
  category: string;
  capacity: number | null;
  registrationDeadline: Date | null;
  status: EventStatus;
  statusReason: string | null;
  approvedAt: Date | null;
  approvedById: string | null;
  createdById: string;
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  creator?: {
    id: string;
    firstName: string;
    lastName: string;
    avatar: string | null;
  };
  community?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  organization?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  _count?: {
    registrations: number;
  };
}

export type EventStatus = 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED';

export type EventRegistrationStatus = 'REGISTERED' | 'CANCELLED' | 'WAITLISTED' | 'CHECKED_IN';

export interface EventRegistration {
  id: string;
  eventId: string;
  userId: string;
  status: EventRegistrationStatus;
  registeredAt: Date;
  cancelledAt: Date | null;
  checkedInAt: Date | null;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    avatar: string | null;
    username: string;
  };
}

export interface CreateEventInput {
  title: string;
  description: string;
  shortDescription?: string;
  startDate: string;
  endDate: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  locationUrl?: string;
  isOnline: boolean;
  onlineUrl?: string;
  category: string;
  capacity?: number;
  registrationDeadline?: string;
  communityId?: string;
  organizationId?: string;
}

export interface UpdateEventInput {
  title?: string;
  description?: string;
  shortDescription?: string;
  banner?: string;
  startDate?: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  locationUrl?: string;
  isOnline?: boolean;
  onlineUrl?: string;
  category?: string;
  capacity?: number;
  registrationDeadline?: string;
}

export interface EventQuery {
  search?: string;
  category?: string;
  status?: EventStatus;
  isOnline?: boolean;
  startDate?: string;
  endDate?: string;
  communityId?: string;
  organizationId?: string;
  page?: number;
  limit?: number;
  sort?: 'newest' | 'oldest' | 'date' | 'popular';
}
