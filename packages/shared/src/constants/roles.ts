import { UserRole } from './enums';

export const ROLE_HIERARCHY: Record<string, number> = {
  [UserRole.SUPER_ADMIN]: 100,
  [UserRole.PLATFORM_ADMIN]: 80,
  [UserRole.ORG_OWNER]: 60,
  [UserRole.ORG_ADMIN]: 50,
  [UserRole.COMMUNITY_OWNER]: 40,
  [UserRole.COMMUNITY_ADMIN]: 30,
  [UserRole.EVENT_MANAGER]: 20,
  [UserRole.MEMBER]: 10,
};

export const ROLE_PERMISSIONS: Record<string, string[]> = {
  [UserRole.SUPER_ADMIN]: ['*'],
  [UserRole.PLATFORM_ADMIN]: [
    'user:read',
    'user:update',
    'user:suspend',
    'community:read',
    'community:approve',
    'community:reject',
    'community:suspend',
    'community:delete',
    'organization:read',
    'organization:approve',
    'organization:reject',
    'organization:suspend',
    'organization:delete',
    'event:read',
    'event:approve',
    'event:reject',
    'event:cancel',
    'event:feature',
    'report:read',
    'report:resolve',
    'category:read',
    'category:create',
    'category:update',
    'category:delete',
    'audit:read',
    'settings:read',
    'settings:update',
    'notification:read',
    'notification:create',
    'dashboard:admin',
  ],
  [UserRole.ORG_OWNER]: [
    'org-members:read',
    'org-members:manage',
    'org-event:create',
    'org-event:update',
    'org-event:delete',
    'org-settings:update',
    'org-insight:read',
  ],
  [UserRole.ORG_ADMIN]: [
    'org-members:read',
    'org-members:invite',
    'org-event:create',
    'org-event:update',
    'org-insight:read',
  ],
  [UserRole.COMMUNITY_OWNER]: [
    'community-members:read',
    'community-members:manage',
    'community-post:create',
    'community-post:update',
    'community-post:delete',
    'community-event:create',
    'community-event:update',
    'community-event:delete',
    'community-settings:update',
    'community-insight:read',
  ],
  [UserRole.COMMUNITY_ADMIN]: [
    'community-members:read',
    'community-members:manage',
    'community-post:create',
    'community-post:update',
    'community-post:moderate',
    'community-event:create',
    'community-event:update',
    'community-insight:read',
  ],
  [UserRole.EVENT_MANAGER]: [
    'community-event:create',
    'community-event:update',
    'community-event:manage-registrations',
  ],
  [UserRole.MEMBER]: [
    'profile:read',
    'profile:update',
    'community:join',
    'community:leave',
    'event:register',
    'event:unregister',
    'report:create',
    'notification:read',
  ],
};

export const PUBLIC_ROLES = [UserRole.MEMBER] as const;

export const ADMIN_ROLES = [UserRole.SUPER_ADMIN, UserRole.PLATFORM_ADMIN] as const;

export const DEFAULT_COMMUNITY_PERMISSIONS = [
  'community-members:read',
  'community-post:create',
  'community-post:update',
  'community-event:create',
  'community-insight:read',
];

export const DEFAULT_ORG_PERMISSIONS = ['org-members:read', 'org-event:create', 'org-insight:read'];
