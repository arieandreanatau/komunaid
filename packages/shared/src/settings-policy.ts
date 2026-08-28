/**
 * Single source of truth for what KomunaID's four settings switches mean,
 * for both communities and organizations from one definition.
 *
 * `CommunitySettings` and `OrganizationSettings` (packages/database/prisma/schema.prisma)
 * are byte-identical in shape -- four booleans, same names, same defaults --
 * so this module treats them as one `SettingsRecord` rather than duplicating
 * the same four `if` statements per entity type.
 *
 * Both relations are optional 1:1 (`communityId String @unique` /
 * `organizationId String @unique`, no required back-reference), so an
 * entity can have `settings === null` if the row was never created. Every
 * function here treats `null` as "use the schema defaults" -- the same
 * defaults Prisma assigns the columns (`allowMemberPost: true,
 * requireApproval: false, showMemberList: true, showEventList: true`) --
 * so a community or organization that never saved settings behaves exactly
 * as it did before this module existed. See SETTINGS_DEFAULTS below.
 *
 * Like feature-flags.ts and permissions.ts (its siblings in this package),
 * this module is plain data + pure functions on purpose: it must stay
 * usable from both the Node/Hono API and the Next.js web app, so it has no
 * Prisma import, no Next import, no Hono import -- @komunaid/shared depends
 * only on zod. It takes a plain settings-shaped record as a parameter; it
 * does not know Prisma exists.
 */

/**
 * The shape shared by `CommunitySettings` and `OrganizationSettings`.
 * Upstream source of truth: packages/database/prisma/schema.prisma,
 * `model CommunitySettings` / `model OrganizationSettings`.
 */
export interface SettingsRecord {
  allowMemberPost: boolean;
  requireApproval: boolean;
  showMemberList: boolean;
  showEventList: boolean;
}

/**
 * A settings record as read from Prisma, which is `null` when the entity
 * never had a settings row created for it (or the row was never saved).
 */
export type MaybeSettingsRecord = SettingsRecord | null | undefined;

/**
 * Schema defaults, mirrored by hand from packages/database/prisma/schema.prisma
 * (`@default(true)` / `@default(false)` on each column) and from the
 * `create` block both `POST /communities` and `POST /organizations` use
 * when eagerly creating a settings row. Keep this in sync if the schema
 * defaults ever change.
 */
export const SETTINGS_DEFAULTS: SettingsRecord = {
  allowMemberPost: true,
  requireApproval: false,
  showMemberList: true,
  showEventList: true,
};

/**
 * Resolve a possibly-null settings record to a concrete one, falling back
 * to SETTINGS_DEFAULTS field-by-field so a never-saved settings row reads
 * exactly as if it had been saved with today's schema defaults.
 */
export function resolveSettings(settings: MaybeSettingsRecord): SettingsRecord {
  if (!settings) return SETTINGS_DEFAULTS;
  return {
    allowMemberPost: settings.allowMemberPost,
    requireApproval: settings.requireApproval,
    showMemberList: settings.showMemberList,
    showEventList: settings.showEventList,
  };
}

/**
 * Is the member list visible to a public (non-member) caller? `=== false`
 * is deliberate, not `!settings?.showMemberList`: it is what makes a
 * never-saved (`null`) settings record default to visible, matching
 * SETTINGS_DEFAULTS.showMemberList.
 */
export function isMemberListPublic(settings: MaybeSettingsRecord): boolean {
  return settings?.showMemberList !== false;
}

/**
 * Is the event list visible to a public (non-member) caller? Same
 * null-safe `=== false` shape as isMemberListPublic, so a never-saved
 * settings record defaults to visible.
 */
export function isEventListPublic(settings: MaybeSettingsRecord): boolean {
  return settings?.showEventList !== false;
}

/**
 * May a plain MEMBER create content (forum threads/replies)? Pengurus
 * (any role above plain MEMBER) are never gated by this switch -- see
 * isCommunityOfficer in ./permissions -- this only answers the question
 * for the switch itself, callers decide who it applies to.
 */
export function canMembersPost(settings: MaybeSettingsRecord): boolean {
  return settings?.allowMemberPost !== false;
}

/**
 * Does a join request need review before the requester becomes an active
 * member? `=== true` (not `!== false`) is deliberate here, the opposite
 * polarity from the visibility switches: requireApproval defaults to
 * `false` (open), so a never-saved settings record must default to "no
 * approval needed", not the other way around.
 */
export function requiresJoinApproval(settings: MaybeSettingsRecord): boolean {
  return settings?.requireApproval === true;
}

/**
 * Whether a visitor who is not a member/owner should be shown a
 * public-facing payload gated by one of the two visibility switches
 * (member list or event list). Hiding is outward only: an existing member
 * or the owner always sees the payload regardless of the switch, so this
 * only ever narrows what a stranger sees, never what a member sees.
 */
export function isVisibleToPublic(isPublic: boolean, isMemberOrOwner: boolean): boolean {
  return isPublic || isMemberOrOwner;
}
