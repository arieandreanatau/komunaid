import { ROLE_HIERARCHY, ROLE_PERMISSIONS } from '../constants/roles';
import type { RoleName } from '../types/rbac';

export function isRoleHigherOrEqual(userRole: string, requiredRole: string): boolean {
  const userLevel = ROLE_HIERARCHY[userRole as RoleName] ?? 0;
  const requiredLevel = ROLE_HIERARCHY[requiredRole as RoleName] ?? 0;
  return userLevel >= requiredLevel;
}

export function hasPermission(roleName: string, permission: string): boolean {
  const permissions = ROLE_PERMISSIONS[roleName as RoleName];
  if (!permissions) return false;
  if (permissions.includes('*')) return true;
  return permissions.includes(permission);
}

export function canAccessScopedResource(
  roleName: string,
  permission: string,
  userScopeId: string | null,
  resourceScopeId: string,
): boolean {
  if (!hasPermission(roleName, permission)) return false;
  if (userScopeId === null || userScopeId === resourceScopeId) return true;
  return false;
}

export function isAdminRole(roleName: string): boolean {
  return roleName === 'SUPER_ADMIN' || roleName === 'PLATFORM_ADMIN';
}

export function getHighestRole(roles: string[]): string | null {
  if (roles.length === 0) return null;
  return roles.reduce((highest, current) => {
    const hLevel = ROLE_HIERARCHY[highest as RoleName] ?? 0;
    const cLevel = ROLE_HIERARCHY[current as RoleName] ?? 0;
    return cLevel > hLevel ? current : highest;
  });
}

export function buildAuditLogData(
  action: string,
  entityType: string,
  entityId: string,
  oldValues?: Record<string, unknown>,
  newValues?: Record<string, unknown>,
  metadata?: Record<string, unknown>,
) {
  return {
    action,
    entityType,
    entityId,
    oldValues: oldValues || null,
    newValues: newValues || null,
    metadata: metadata || null,
  };
}
