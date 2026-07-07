export const UserRole = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  PLATFORM_ADMIN: 'PLATFORM_ADMIN',
  ORG_OWNER: 'ORG_OWNER',
  ORG_ADMIN: 'ORG_ADMIN',
  COMMUNITY_OWNER: 'COMMUNITY_OWNER',
  COMMUNITY_ADMIN: 'COMMUNITY_ADMIN',
  EVENT_MANAGER: 'EVENT_MANAGER',
  MEMBER: 'MEMBER',
} as const;

export const CommunityStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  SUSPENDED: 'SUSPENDED',
  ARCHIVED: 'ARCHIVED',
} as const;

export const MembershipType = {
  OPEN: 'OPEN',
  REQUEST: 'REQUEST',
  INVITE_ONLY: 'INVITE_ONLY',
  CLOSED: 'CLOSED',
} as const;

export const OrganizationStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  SUSPENDED: 'SUSPENDED',
  ARCHIVED: 'ARCHIVED',
} as const;

export const EventStatus = {
  DRAFT: 'DRAFT',
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  CANCELLED: 'CANCELLED',
  COMPLETED: 'COMPLETED',
} as const;

export const EventRegistrationStatus = {
  REGISTERED: 'REGISTERED',
  CANCELLED: 'CANCELLED',
  WAITLISTED: 'WAITLISTED',
  CHECKED_IN: 'CHECKED_IN',
} as const;

export const PostStatus = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
  ARCHIVED: 'ARCHIVED',
  FLAGGED: 'FLAGGED',
} as const;

export const ReportTargetType = {
  USER: 'USER',
  COMMUNITY: 'COMMUNITY',
  EVENT: 'EVENT',
  ORGANIZATION: 'ORGANIZATION',
  POST: 'POST',
} as const;

export const ReportStatus = {
  PENDING: 'PENDING',
  UNDER_REVIEW: 'UNDER_REVIEW',
  RESOLVED: 'RESOLVED',
  DISMISSED: 'DISMISSED',
} as const;

export const NotificationType = {
  SYSTEM: 'SYSTEM',
  APPROVAL: 'APPROVAL',
  REJECTION: 'REJECTION',
  EVENT: 'EVENT',
  COMMUNITY: 'COMMUNITY',
  MODERATION: 'MODERATION',
} as const;

export const ContactMessageStatus = {
  UNREAD: 'UNREAD',
  READ: 'READ',
  REPLIED: 'REPLIED',
} as const;

export const CommunityMemberRole = {
  OWNER: 'OWNER',
  ADMIN: 'ADMIN',
  MODERATOR: 'MODERATOR',
  MEMBER: 'MEMBER',
} as const;

export const CommunityMemberStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  BANNED: 'BANNED',
} as const;

export const OrganizationMemberRole = {
  OWNER: 'OWNER',
  ADMIN: 'ADMIN',
  MEMBER: 'MEMBER',
} as const;

export const CategoryType = {
  COMMUNITY: 'COMMUNITY',
  EVENT: 'EVENT',
  ORGANIZATION: 'ORGANIZATION',
} as const;
