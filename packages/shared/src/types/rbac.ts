import { z } from 'zod';

export const RoleNameEnum = z.enum([
  'SUPER_ADMIN',
  'PLATFORM_ADMIN',
  'ORG_OWNER',
  'ORG_ADMIN',
  'COMMUNITY_OWNER',
  'COMMUNITY_ADMIN',
  'EVENT_MANAGER',
  'MEMBER',
]);

export type RoleName = z.infer<typeof RoleNameEnum>;

export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
}

export interface ScopedPermission {
  permission: Permission;
  scope: 'PLATFORM' | 'COMMUNITY' | 'ORGANIZATION';
  scopeId?: string;
}
