export const EVENT_PUBLIC_STATUSES = [
  "SUBMITTED",
  "IN_REVIEW",
  "APPROVED",
  "PUBLISHED",
  "REGISTRATION_OPEN",
  "REGISTRATION_CLOSED",
  "ONGOING",
  "COMPLETED",
] as const;

export const VOLUNTEER_PUBLIC_STATUSES = [
  "SUBMITTED",
  "UNDER_REVIEW",
  "APPROVED",
  "SCHEDULED",
  "REGISTRATION_OPEN",
  "REGISTRATION_CLOSED",
  "ONGOING",
  "COMPLETED",
] as const;

export function isRegistrationOpen(input: { status: string; registrationOpensAt?: Date | string | null; registrationDeadline?: Date | string | null; now?: Date }) {
  const now = input.now || new Date();
  if (input.status !== "REGISTRATION_OPEN" && !["APPROVED", "PUBLISHED", "SCHEDULED"].includes(input.status)) return false;
  if (input.status !== "REGISTRATION_OPEN" && !input.registrationOpensAt) return false;
  if (input.registrationOpensAt && new Date(input.registrationOpensAt) > now) return false;
  if (input.registrationDeadline && new Date(input.registrationDeadline) <= now) return false;
  return true;
}

export function registrationState(input: { status: string; registrationOpensAt?: Date | string | null; registrationDeadline?: Date | string | null; now?: Date }) {
  const now = input.now || new Date();
  if (isRegistrationOpen(input)) return "OPEN" as const;
  if (input.registrationDeadline && new Date(input.registrationDeadline) <= now) return "CLOSED" as const;
  return "NOT_OPEN" as const;
}
