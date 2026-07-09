import { Context, Next } from "hono";
import { prisma } from "@komunaid/database";

type PlatformRole = "SUPER_ADMIN" | "PLATFORM_ADMIN" | "MEMBER";

const roleCache = new Map<string, { roles: string[]; expiresAt: number }>();
const ROLE_CACHE_TTL = 60 * 1000; // 1 minute

function getCachedRoles(userId: string): Promise<{ role: string }[]> {
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

  if (!membership || membership.role !== "OWNER") {
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

  if (!membership || !["OWNER", "ADMIN"].includes(membership.role)) {
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

  if (!membership || membership.role !== "OWNER") {
    throw new Error("Forbidden");
  }

  await next();
}
