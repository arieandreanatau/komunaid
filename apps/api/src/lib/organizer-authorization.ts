import { prisma } from "@komunaid/database";
import { can } from "@komunaid/shared";

/**
 * "Who can manage this event/volunteer opportunity" -- previously
 * byte-identical copies of `getEventOrganizerRole`, `isSuperAdmin`, and
 * `canManageEvent` lived in apps/api/src/routes/events.ts and
 * apps/api/src/routes/volunteers.ts. Both routes import this module instead.
 *
 * An event/opportunity belongs to either a community or an organization, so
 * `role` here is whichever membership role table matched -- a CommunityRole
 * (OWNER, ADMIN, EVENT_MANAGER, VOLUNTEER_COORDINATOR, MEMBER) or an
 * OrganizationRole (OWNER, ADMIN, MEMBER). `canManageEvent` below reuses
 * @komunaid/shared's `can(role, "manageEvents")`, whose allow-list (OWNER,
 * ADMIN, EVENT_MANAGER) is a superset that also covers the OrganizationRole
 * case correctly -- an OrganizationRole value is never literally
 * "EVENT_MANAGER", so the extra community-only role in the list is inert
 * for organization-owned events.
 */

export async function getEventOrganizerRole(userId: string, event: any): Promise<string | null> {
  if (event.communityId) {
    const membership = await prisma.communityMember.findUnique({
      where: { communityId_userId: { communityId: event.communityId, userId } },
    });
    return membership?.status === "ACTIVE" && membership.deletedAt === null ? membership.role : null;
  }
  if (event.organizationId) {
    const membership = await prisma.organizationMember.findUnique({
      where: { organizationId_userId: { organizationId: event.organizationId, userId } },
    });
    return membership?.status === "ACTIVE" && membership.deletedAt === null ? membership.role : null;
  }
  return null;
}

export async function isSuperAdmin(userId: string): Promise<boolean> {
  const roles = await prisma.userRole.findMany({ where: { userId }, select: { role: true } });
  return roles.some((r) => r.role === "SUPER_ADMIN");
}

export async function canManageEvent(role: string | null, userId: string, event: any): Promise<boolean> {
  if (await isSuperAdmin(userId)) return true;
  if (!role) return false;
  return can(role, "manageEvents");
}
