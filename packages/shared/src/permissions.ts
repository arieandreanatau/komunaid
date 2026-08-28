/**
 * Single source of truth for KomunaID's role vocabularies and the
 * "can this actor do X in this scope" predicate.
 *
 * Before this module, five independent role vocabularies existed across the
 * codebase (three in apps/web/components/sidebar/*, one ad hoc `isOwner`
 * boolean in the community dashboard, and the real server-side truth in
 * apps/api/src/middleware/rbac.ts). One of them invented a role, `OFFICER`,
 * that appears in zero Prisma schema, zero @komunaid/shared schema, and zero
 * apps/api file -- it can never be issued by the server. Every web call site
 * that gated on `OFFICER` really meant "any community role above plain
 * MEMBER" (an officer, in the ordinary-language sense) -- see
 * `isCommunityOfficer` below, which expresses that correctly using only real
 * roles.
 *
 * Like feature-flags.ts (its sibling in this package), this module is plain
 * data + pure functions on purpose: it must stay usable from both the
 * Node/Hono API and the Next.js web app, including the Edge runtime, so it
 * has no Prisma import, no Next import, no Hono import -- @komunaid/shared
 * depends only on zod. Two adapters consume it: apps/api's RBAC middleware
 * and route handlers, and apps/web's sidebar + community dashboard.
 */

// Upstream source of truth: packages/database/prisma/schema.prisma:96-100
// (`enum PlatformRole`). Keep this list in sync by hand -- there is no
// codegen link between the Prisma schema and this package.
export const PLATFORM_ROLES = ["SUPER_ADMIN", "PLATFORM_ADMIN", "MEMBER"] as const;
export type PlatformRole = (typeof PLATFORM_ROLES)[number];

// Upstream source of truth: packages/database/prisma/schema.prisma:200-206
// (`enum CommunityRole`).
export const COMMUNITY_ROLES = [
  "OWNER",
  "ADMIN",
  "EVENT_MANAGER",
  "VOLUNTEER_COORDINATOR",
  "MEMBER",
] as const;
export type CommunityRole = (typeof COMMUNITY_ROLES)[number];

// Upstream source of truth: packages/database/prisma/schema.prisma:457-461
// (`enum OrganizationRole`). A separate, smaller enum from CommunityRole --
// organizations have no EVENT_MANAGER/VOLUNTEER_COORDINATOR tier.
export const ORGANIZATION_ROLES = ["OWNER", "ADMIN", "MEMBER"] as const;
export type OrganizationRole = (typeof ORGANIZATION_ROLES)[number];

/**
 * `CommunityRole`/`OrganizationRole` minus `OWNER`, for the two routes that
 * can change a member's role but can never be used to promote someone to (or
 * demote someone from) ownership: `changeMemberRoleSchema` and
 * `changeOrganizationMemberRoleSchema` in packages/shared/src/index.ts. Both
 * derive their Zod enum from these lists so the omission reads as intent,
 * not as a literal someone forgot to update.
 */
// Cast to a non-empty tuple (rather than left as a plain array) so these are
// still accepted directly by `z.enum(...)`, which requires `[string, ...string[]]`.
// The cast only asserts shape; the values are still genuinely filtered from
// the canonical lists above, not re-typed by hand.
export const COMMUNITY_ROLES_EXCLUDING_OWNER = COMMUNITY_ROLES.filter(
  (role) => role !== "OWNER"
) as [Exclude<CommunityRole, "OWNER">, ...Exclude<CommunityRole, "OWNER">[]];
export const ORGANIZATION_ROLES_EXCLUDING_OWNER = ORGANIZATION_ROLES.filter(
  (role) => role !== "OWNER"
) as [Exclude<OrganizationRole, "OWNER">, ...Exclude<OrganizationRole, "OWNER">[]];

export function isPlatformRole(value: string | null | undefined): value is PlatformRole {
  return !!value && (PLATFORM_ROLES as readonly string[]).includes(value);
}

export function isCommunityRole(value: string | null | undefined): value is CommunityRole {
  return !!value && (COMMUNITY_ROLES as readonly string[]).includes(value);
}

export function isOrganizationRole(value: string | null | undefined): value is OrganizationRole {
  return !!value && (ORGANIZATION_ROLES as readonly string[]).includes(value);
}

/**
 * Numeric ranking for "at least this level" checks (nav visibility,
 * sidebar's "communities I manage" list). EVENT_MANAGER and
 * VOLUNTEER_COORDINATOR are siblings, not ordered relative to each other --
 * they share a level -- because neither role's server-side authority is a
 * superset of the other's (see COMMUNITY_ACTION_ROLES below: EVENT_MANAGER
 * can manage events but not volunteer programs, and vice versa).
 */
const COMMUNITY_ROLE_LEVEL: Record<CommunityRole, number> = {
  OWNER: 4,
  ADMIN: 3,
  EVENT_MANAGER: 2,
  VOLUNTEER_COORDINATOR: 2,
  MEMBER: 1,
};

export function communityRoleLevel(role: string | null | undefined): number {
  if (!isCommunityRole(role)) return 0;
  return COMMUNITY_ROLE_LEVEL[role];
}

export function isAtLeastCommunityRole(
  role: string | null | undefined,
  minimum: CommunityRole
): boolean {
  return communityRoleLevel(role) >= communityRoleLevel(minimum);
}

/**
 * "Any community officer" -- any role with more authority than plain
 * MEMBER. This is what the phantom `OFFICER` role at the old web call sites
 * (apps/web/components/sidebar/navigation.ts, global-sidebar.tsx,
 * context-switcher.tsx) was meant to express: OWNER, ADMIN, EVENT_MANAGER,
 * or VOLUNTEER_COORDINATOR, never plain MEMBER. Unlike `OFFICER`, this
 * function can only ever be true for a role the server can actually issue.
 */
export function isCommunityOfficer(role: string | null | undefined): boolean {
  return communityRoleLevel(role) > COMMUNITY_ROLE_LEVEL.MEMBER;
}

/**
 * Actions gated at community scope, and the exact set of roles the API
 * accepts for each one today. Kept as explicit allow-lists rather than a
 * single numeric cutoff because EVENT_MANAGER and VOLUNTEER_COORDINATOR are
 * siblings (see COMMUNITY_ROLE_LEVEL) with non-overlapping authority.
 *
 * Verified against apps/api/src/routes/communities.ts's `requireCommunityAdmin`
 * / `requireCommunityOwner` guards, apps/api/src/routes/events.ts's
 * `canManageEvent`, and apps/api/src/routes/volunteer-programs.ts's officer
 * check -- keep this table in sync if any of those guards change.
 */
export type CommunityAction =
  /** GET /communities/:id/members -- open to any active member. */
  | "viewMembers"
  /** Remove/restore/ban a member -- requireCommunityAdmin. */
  | "manageMembers"
  /** Promote/demote a member's role -- requireCommunityOwner (can never be used to grant/revoke OWNER itself). */
  | "changeMemberRole"
  /** Administer the officer roster (the dashboard's "Pengurus" tab) -- requireCommunityAdmin. */
  | "managePengurus"
  /** View/approve/reject join requests -- requireCommunityAdmin. */
  | "handleJoinRequests"
  /** Create/update/delete community media (announcements, news, gallery) -- requireCommunityAdmin. */
  | "manageMedia"
  /** Edit community profile/settings (name, visibility, banner, interaction toggles, ...) -- requireCommunityAdmin. */
  | "editSettings"
  /** View the community insight/analytics dashboard -- requireCommunityAdmin. */
  | "viewInsights"
  /** Create/update/publish community events -- OWNER, ADMIN, or EVENT_MANAGER. */
  | "manageEvents"
  /** Create/update volunteer programs -- OWNER, ADMIN, or VOLUNTEER_COORDINATOR. */
  | "manageVolunteerPrograms";

const COMMUNITY_ACTION_ROLES: Record<CommunityAction, readonly CommunityRole[]> = {
  viewMembers: ["OWNER", "ADMIN", "EVENT_MANAGER", "VOLUNTEER_COORDINATOR", "MEMBER"],
  manageMembers: ["OWNER", "ADMIN"],
  changeMemberRole: ["OWNER"],
  managePengurus: ["OWNER", "ADMIN"],
  handleJoinRequests: ["OWNER", "ADMIN"],
  manageMedia: ["OWNER", "ADMIN"],
  editSettings: ["OWNER", "ADMIN"],
  viewInsights: ["OWNER", "ADMIN"],
  manageEvents: ["OWNER", "ADMIN", "EVENT_MANAGER"],
  manageVolunteerPrograms: ["OWNER", "ADMIN", "VOLUNTEER_COORDINATOR"],
};

/**
 * "Can this actor do `action` in a community they hold `role` in?"
 * The single predicate every adapter (sidebar nav filtering, the community
 * dashboard's tab gating, the API's organizer-authorization helper) should
 * call instead of re-typing a role list.
 */
export function can(role: string | null | undefined, action: CommunityAction): boolean {
  if (!isCommunityRole(role)) return false;
  return COMMUNITY_ACTION_ROLES[action].includes(role);
}
