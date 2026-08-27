import { describe, expect, it } from "vitest";
import { isRegistrationOpen, registrationState } from "../../../src/services/content-lifecycle";

const now = new Date("2026-09-10T00:00:00.000Z");

describe("content registration lifecycle", () => {
  it("keeps approved content closed before opening date", () => {
    const input = { status: "APPROVED", registrationOpensAt: "2026-09-11T00:00:00.000Z", registrationDeadline: "2026-09-20T00:00:00.000Z", now };
    expect(isRegistrationOpen(input)).toBe(false);
    expect(registrationState(input)).toBe("NOT_OPEN");
  });

  it("opens registration only in the registration window", () => {
    const input = { status: "REGISTRATION_OPEN", registrationOpensAt: "2026-09-01T00:00:00.000Z", registrationDeadline: "2026-09-20T00:00:00.000Z", now };
    expect(isRegistrationOpen(input)).toBe(true);
    expect(registrationState(input)).toBe("OPEN");
  });

  it("derives an open registration window after approval date", () => {
    const input = { status: "APPROVED", registrationOpensAt: "2026-09-01T00:00:00.000Z", registrationDeadline: "2026-09-20T00:00:00.000Z", now };
    expect(isRegistrationOpen(input)).toBe(true);
    expect(registrationState(input)).toBe("OPEN");
  });

  it("closes registration after deadline", () => {
    const input = { status: "REGISTRATION_OPEN", registrationOpensAt: "2026-09-01T00:00:00.000Z", registrationDeadline: "2026-09-09T00:00:00.000Z", now };
    expect(isRegistrationOpen(input)).toBe(false);
    expect(registrationState(input)).toBe("CLOSED");
  });
});
