export const ACTIVE_MEMBERSHIP_STATUS = "ACTIVE";

export interface ProfileMembership {
  id: string;
  name: string;
  role: string;
  status: string;
}

export interface Organizer {
  id: string;
  name: string;
  type: "community" | "organization";
}

export function eventOrganizers(profile: { communities?: ProfileMembership[]; organizations?: ProfileMembership[] } | null | undefined): Organizer[] {
  const communities = (profile?.communities || [])
    .filter((membership) => membership.status === ACTIVE_MEMBERSHIP_STATUS && ["OWNER", "ADMIN", "EVENT_MANAGER"].includes(membership.role))
    .map((membership) => ({ id: membership.id, name: membership.name, type: "community" as const }));
  const organizations = (profile?.organizations || [])
    .filter((membership) => membership.status === ACTIVE_MEMBERSHIP_STATUS && ["OWNER", "ADMIN"].includes(membership.role))
    .map((membership) => ({ id: membership.id, name: membership.name, type: "organization" as const }));

  return communities;
}
