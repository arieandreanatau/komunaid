export interface Community {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string | null;
  logo: string | null;
  banner: string | null;
  category: string;
  location: string | null;
  website: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  foundedAt: Date | null;
  membershipType: MembershipType;
  maxMembers: number | null;
  isVerified: boolean;
  status: CommunityStatus;
  statusReason: string | null;
  approvedAt: Date | null;
  approvedById: string | null;
  rejectedAt: Date | null;
  rejectedById: string | null;
  suspendedAt: Date | null;
  suspendedReason: string | null;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  owner?: {
    id: string;
    firstName: string;
    lastName: string;
    avatar: string | null;
  };
  _count?: {
    members: number;
    posts: number;
    events: number;
  };
}

export type CommunityStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED' | 'ARCHIVED';

export type MembershipType = 'OPEN' | 'REQUEST' | 'INVITE_ONLY' | 'CLOSED';

export type CommunityMemberRole = 'OWNER' | 'ADMIN' | 'MODERATOR' | 'MEMBER';

export type CommunityMemberStatus = 'ACTIVE' | 'INACTIVE' | 'BANNED';

export interface CommunityMember {
  id: string;
  communityId: string;
  userId: string;
  role: CommunityMemberRole;
  joinedAt: Date;
  status: CommunityMemberStatus;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    avatar: string | null;
    username: string;
  };
}

export interface CreateCommunityInput {
  name: string;
  description: string;
  shortDescription?: string;
  category: string;
  location?: string;
  website?: string;
  contactEmail?: string;
  contactPhone?: string;
  membershipType: MembershipType;
  maxMembers?: number;
}

export interface UpdateCommunityInput {
  name?: string;
  description?: string;
  shortDescription?: string;
  logo?: string;
  banner?: string;
  category?: string;
  location?: string;
  website?: string;
  contactEmail?: string;
  contactPhone?: string;
  membershipType?: MembershipType;
  maxMembers?: number;
}

export interface CommunityQuery {
  search?: string;
  category?: string;
  location?: string;
  status?: CommunityStatus;
  membershipType?: MembershipType;
  page?: number;
  limit?: number;
  sort?: 'newest' | 'oldest' | 'name' | 'members';
}
