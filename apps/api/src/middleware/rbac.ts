import { Context, Next } from "hono";
import { prisma } from "@komunaid/database";
import { isAtLeastCommunityRole, type PlatformRole } from "@komunaid/shared";

const roleCache = new Map<string, { roles: string[]; expiresAt: number }>();
const ROLE_CACHE_TTL = 10 * 1000; // 10 seconds
const ROLE_CACHE_MAX_SIZE = 10000;
let lastRoleCacheCleanup = 0;
const ROLE_CACHE_CLEANUP_INTERVAL = 60 * 1000;

function cleanupRoleCache() {
  const now = Date.now();
  if (now - lastRoleCacheCleanup < ROLE_CACHE_CLEANUP_INTERVAL) return;
  lastRoleCacheCleanup = now;
  for (const [key, record] of roleCache.entries()) {
    if (now > record.expiresAt) {
      roleCache.delete(key);
    }
  }
  if (roleCache.size > ROLE_CACHE_MAX_SIZE) {
    const entries = Array.from(roleCache.entries());
    const toDelete = entries.slice(0, entries.length - ROLE_CACHE_MAX_SIZE);
    for (const [key] of toDelete) {
      roleCache.delete(key);
    }
  }
}

export function invalidateRoleCache(userId: string) {
  roleCache.delete(userId);
}

function getCachedRoles(userId: string): Promise<{ role: string }[]> {
  cleanupRoleCache();
  const cached = roleCache.get(userId);
  if (cached && Date.now() < cached.expiresAt) {
    return Promise.resolve(cached.roles.map(r => ({ role: r })));
  }
  return prisma.userRole.findMany({
    where: { userId },
    select: { role: true },
  }).then(roles => {
    roleCache.set(userId, { roles: roles.map(r => r.role), expiresAt: Date.now() + ROLE_CACHE_TTL });
    return roles;
  });
}

export function requireRole(...roles: PlatformRole[]) {
  return async (c: Context, next: Next) => {
    const user = c.get("user");

    if (!user) {
      throw new Error("Unauthorized");
    }

    const userRoles = await getCachedRoles(user.id);

    const hasRole = userRoles.some((r) => roles.includes(r.role as PlatformRole));

    if (!hasRole) {
      throw new Error("Forbidden");
    }

    c.set("userRoles", userRoles.map((r) => r.role));

    await next();
  };
}

export function requireAnyRole(...roles: PlatformRole[]) {
  return requireRole(...roles);
}

export function requireSuperAdmin() {
  return requireRole("SUPER_ADMIN");
}

export function requirePlatformAdmin() {
  return requireRole("SUPER_ADMIN", "PLATFORM_ADMIN");
}

export async function requireCommunityOwner(c: Context, next: Next) {
  const user = c.get("user");
  const communityId = c.req.param("communityId") || c.req.query("communityId");

  if (!user || !communityId) {
    throw new Error("Forbidden");
  }

  const membership = await prisma.communityMember.findUnique({
    where: {
      communityId_userId: {
        communityId,
        userId: user.id,
      },
    },
  });

  if (!membership || !isAtLeastCommunityRole(membership.role, "OWNER") || membership.status !== "ACTIVE" || membership.deletedAt != null) {
    throw new Error("Forbidden");
  }

  await next();
}

export async function requireCommunityAdmin(c: Context, next: Next) {
  const user = c.get("user");
  const communityId = c.req.param("communityId") || c.req.query("communityId");

  if (!user || !communityId) {
    throw new Error("Forbidden");
  }

  const membership = await prisma.communityMember.findUnique({
    where: {
      communityId_userId: {
        communityId,
        userId: user.id,
      },
    },
  });

  if (!membership || !isAtLeastCommunityRole(membership.role, "ADMIN") || membership.status !== "ACTIVE" || membership.deletedAt != null) {
    throw new Error("Forbidden");
  }

  await next();
}

export async function requireOrganizationOwner(c: Context, next: Next) {
  const user = c.get("user");
  const organizationId = c.req.param("organizationId") || c.req.query("organizationId");

  if (!user || !organizationId) {
    throw new Error("Forbidden");
  }

  const membership = await prisma.organizationMember.findUnique({
    where: {
      organizationId_userId: {
        organizationId,
        userId: user.id,
      },
    },
  });

  if (!membership || membership.role !== "OWNER" || membership.status !== "ACTIVE" || membership.deletedAt != null) {
    throw new Error("Forbidden");
  }

  await next();
}

export async function requireOrganizationAdmin(c: Context, next: Next) {
  const user = c.get("user");
  const organizationId = c.req.param("organizationId") || c.req.query("organizationId");

  if (!user || !organizationId) {
    throw new Error("Forbidden");
  }

  const membership = await prisma.organizationMember.findUnique({
    where: {
      organizationId_userId: {
        organizationId,
        userId: user.id,
      },
    },
  });

  if (!membership || !["OWNER", "ADMIN"].includes(membership.role) || membership.status !== "ACTIVE" || membership.deletedAt != null) {
    throw new Error("Forbidden");
  }

  await next();
}
