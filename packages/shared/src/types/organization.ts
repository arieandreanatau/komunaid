export interface Organization {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string | null;
  logo: string | null;
  banner: string | null;
  industry: string | null;
  location: string | null;
  website: string | null;
  contactEmail: string | null;
  foundedAt: Date | null;
  size: string | null;
  status: OrganizationStatus;
  statusReason: string | null;
  approvedAt: Date | null;
  approvedById: string | null;
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
    events: number;
  };
}

export type OrganizationStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED' | 'ARCHIVED';

export type OrganizationMemberRole = 'OWNER' | 'ADMIN' | 'MEMBER';

export interface OrganizationMember {
  id: string;
  organizationId: string;
  userId: string;
  role: OrganizationMemberRole;
  joinedAt: Date;
  status: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    avatar: string | null;
    username: string;
  };
}

export interface CreateOrganizationInput {
  name: string;
  description: string;
  shortDescription?: string;
  industry?: string;
  location?: string;
  website?: string;
  contactEmail?: string;
  foundedAt?: string;
  size?: string;
}

export interface UpdateOrganizationInput {
  name?: string;
  description?: string;
  shortDescription?: string;
  logo?: string;
  banner?: string;
  industry?: string;
  location?: string;
  website?: string;
  contactEmail?: string;
  foundedAt?: string;
  size?: string;
}
