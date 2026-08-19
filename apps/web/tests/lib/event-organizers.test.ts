import { describe, expect, it } from "vitest";
import { eventOrganizers } from "../../lib/event-organizers";

describe("eventOrganizers", () => {
  it("includes only active memberships with organizer roles", () => {
    expect(eventOrganizers({
      communities: [
        { id: "community-active", name: "Active", role: "EVENT_MANAGER", status: "ACTIVE" },
        { id: "community-inactive", name: "Inactive", role: "ADMIN", status: "APPROVED" },
      ],
      organizations: [
        { id: "organization-active", name: "Org", role: "ADMIN", status: "ACTIVE" },
        { id: "organization-member", name: "Member", role: "MEMBER", status: "ACTIVE" },
      ],
    })).toEqual([
      { id: "community-active", name: "Active", type: "community" },
      { id: "organization-active", name: "Org", type: "organization" },
    ]);
  });
});
