import { describe, it, expect } from "vitest";
import {
  registerSchema,
  loginSchema,
  createCommunitySchema,
  createEventSchema,
  eventQuerySchema,
  createVolunteerOpportunitySchema,
  createReportSchema,
  paginationSchema,
  contactMessageSchema,
  adminBulkActionSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  updateInterestsSchema,
  joinCommunitySchema,
  handleJoinRequestSchema,
  reviewReportSchema,
  assignRoleSchema,
  createCategorySchema,
  updateCategorySchema,
  updateProfileSchema,
  submitCommunitySchema,
  adminReviewCommunitySchema,
  suspendCommunitySchema,
  createCommunityMediaSchema,
  createOrganizationSchema,
  volunteerPositionSchema,
  applyVolunteerSchema,
  reviewVolunteerApplicationSchema,
  adminResolveReportSchema,
  adminBroadcastNotificationSchema,
  adminCreateCmsPageSchema,
  adminCreateBannerSchema,
  adminResetPasswordSchema,
  adminModerationWarningSchema,
  adminUpdateUserStatusSchema,
  adminSecuritySettingsSchema,
  adminForceLogoutSchema,
  adminLockUserSchema,
  adminUnlockUserSchema,
  adminReviewVolunteerSchema,
  adminReviewEventSchema,
  adminCreateNotificationTemplateSchema,
  changeMemberRoleSchema,
  changeOrganizationMemberRoleSchema,
  updateCommunitySettingsSchema,
  updateCommunityBannerSchema,
  updateCommunityLogoSchema,
  updateCommunityProfileSchema,
  updateOrganizationBannerSchema,
  updateOrganizationLogoSchema,
  updateOrganizationProfileSchema,
  updateOrganizationSettingsSchema,
} from "@komunaid/shared";

function expectValid(schema: any, data: any) {
  const result = schema.safeParse(data);
  expect(result.success).toBe(true);
  return result;
}

function expectInvalid(schema: any, data: any) {
  const result = schema.safeParse(data);
  expect(result.success).toBe(false);
  return result;
}

describe("eventQuerySchema", () => {
  it("accepts REJECTED event status", () => {
    expectValid(eventQuerySchema, { status: "REJECTED" });
  });
});

const VALID_USER = {
  name: "John Doe",
  username: "johndoe",
  email: "john@example.com",
  password: "StrongPass1",
  confirmPassword: "StrongPass1",
};

const VALID_COMMUNITY = {
  name: "My Community",
};

const VALID_EVENT = {
  title: "Community Event",
  eventDate: "2026-12-01T10:00:00.000Z",
  quota: 50,
};

const VALID_VOLUNTEER = {
  title: "Volunteer Opportunity",
  eventId: "evt_123",
  positions: [{ name: "Coordinator" }],
};

const VALID_REPORT = {
  targetType: "COMMUNITY",
  targetId: "target_123",
  reason: "SPAM",
};

const VALID_CONTACT = {
  name: "Jane Doe",
  email: "jane@example.com",
  subject: "Feedback",
  message: "This is a test message with more than ten characters.",
};

const VALID_BULK = {
  ids: ["id1", "id2"],
  action: "DELETE",
};

// ==========================================
// registerSchema
// ==========================================
describe("registerSchema", () => {
  it("should accept valid registration data", () => {
    expectValid(registerSchema, VALID_USER);
  });

  it("should reject name shorter than 2 chars", () => {
    expectInvalid(registerSchema, { ...VALID_USER, name: "J" });
  });

  it("should reject username shorter than 3 chars", () => {
    expectInvalid(registerSchema, { ...VALID_USER, username: "ab" });
  });

  it("should reject invalid email", () => {
    expectInvalid(registerSchema, { ...VALID_USER, email: "not-an-email" });
  });

  it("should reject password without uppercase", () => {
    expectInvalid(registerSchema, {
      ...VALID_USER,
      password: "strongpass1",
      confirmPassword: "strongpass1",
    });
  });

  it("should reject password without number", () => {
    expectInvalid(registerSchema, {
      ...VALID_USER,
      password: "StrongPass",
      confirmPassword: "StrongPass",
    });
  });

  it("should reject password without lowercase", () => {
    expectInvalid(registerSchema, {
      ...VALID_USER,
      password: "STRONGPASS1",
      confirmPassword: "STRONGPASS1",
    });
  });

  it("should reject password shorter than 8 chars", () => {
    expectInvalid(registerSchema, {
      ...VALID_USER,
      password: "Str1",
      confirmPassword: "Str1",
    });
  });

  it("should reject mismatched passwords", () => {
    expectInvalid(registerSchema, {
      ...VALID_USER,
      confirmPassword: "DifferentPass1",
    });
  });

  it("should accept name at exactly 2 chars (boundary)", () => {
    expectValid(registerSchema, { ...VALID_USER, name: "Jo" });
  });

  it("should accept username at exactly 3 chars (boundary)", () => {
    expectValid(registerSchema, { ...VALID_USER, username: "abc" });
  });

  it("should reject empty name", () => {
    expectInvalid(registerSchema, { ...VALID_USER, name: "" });
  });

  it("should reject username with special characters", () => {
    expectInvalid(registerSchema, { ...VALID_USER, username: "john-doe" });
  });

  it("should reject empty username", () => {
    expectInvalid(registerSchema, { ...VALID_USER, username: "" });
  });

  it("should reject username longer than 30 chars", () => {
    expectInvalid(registerSchema, { ...VALID_USER, username: "a".repeat(31) });
  });
});

// ==========================================
// loginSchema
// ==========================================
describe("loginSchema", () => {
  it("should accept valid identifier and password", () => {
    expectValid(loginSchema, { identifier: "john@example.com", password: "pass123" });
  });

  it("should reject empty identifier", () => {
    expectInvalid(loginSchema, { identifier: "", password: "pass123" });
  });

  it("should reject empty password", () => {
    expectInvalid(loginSchema, { identifier: "john@example.com", password: "" });
  });

  it("should reject missing identifier", () => {
    expectInvalid(loginSchema, { password: "pass123" });
  });

  it("should reject missing password", () => {
    expectInvalid(loginSchema, { identifier: "john@example.com" });
  });

  it("should accept username as identifier", () => {
    expectValid(loginSchema, { identifier: "johndoe", password: "pass123" });
  });
});

// ==========================================
// forgotPasswordSchema
// ==========================================
describe("forgotPasswordSchema", () => {
  it("should accept valid email identifier", () => {
    expectValid(forgotPasswordSchema, { identifier: "john@example.com" });
  });

  it("should accept valid username identifier", () => {
    expectValid(forgotPasswordSchema, { identifier: "johndoe" });
  });

  it("should reject empty identifier", () => {
    expectInvalid(forgotPasswordSchema, { identifier: "" });
  });

  it("should reject missing identifier", () => {
    expectInvalid(forgotPasswordSchema, {});
  });
});

// ==========================================
// resetPasswordSchema
// ==========================================
describe("resetPasswordSchema", () => {
  const validData = {
    token: "abc123",
    password: "StrongPass1",
    confirmPassword: "StrongPass1",
  };

  it("should accept valid reset data", () => {
    expectValid(resetPasswordSchema, validData);
  });

  it("should reject empty token", () => {
    expectInvalid(resetPasswordSchema, { ...validData, token: "" });
  });

  it("should reject mismatched passwords", () => {
    expectInvalid(resetPasswordSchema, { ...validData, confirmPassword: "Different1" });
  });

  it("should reject weak password", () => {
    expectInvalid(resetPasswordSchema, { ...validData, password: "weak", confirmPassword: "weak" });
  });
});

// ==========================================
// changePasswordSchema
// ==========================================
describe("changePasswordSchema", () => {
  const validData = {
    currentPassword: "OldPass1",
    newPassword: "NewStrong1",
    confirmNewPassword: "NewStrong1",
  };

  it("should accept valid change password data", () => {
    expectValid(changePasswordSchema, validData);
  });

  it("should reject empty current password", () => {
    expectInvalid(changePasswordSchema, { ...validData, currentPassword: "" });
  });

  it("should reject mismatched new passwords", () => {
    expectInvalid(changePasswordSchema, {
      ...validData,
      confirmNewPassword: "Different1",
    });
  });

  it("should reject weak new password", () => {
    expectInvalid(changePasswordSchema, {
      ...validData,
      newPassword: "weak",
      confirmNewPassword: "weak",
    });
  });
});

// ==========================================
// updateInterestsSchema
// ==========================================
describe("updateInterestsSchema", () => {
  it("should accept valid interests array", () => {
    expectValid(updateInterestsSchema, { interests: ["tech", "music"] });
  });

  it("should accept empty interests array", () => {
    expectValid(updateInterestsSchema, { interests: [] });
  });

  it("should reject more than 20 interests", () => {
    expectInvalid(updateInterestsSchema, {
      interests: Array.from({ length: 21 }, (_, i) => `interest${i}`),
    });
  });
});

// ==========================================
// joinCommunitySchema
// ==========================================
describe("joinCommunitySchema", () => {
  it("should accept empty body", () => {
    expectValid(joinCommunitySchema, {});
  });

  it("should accept with optional message", () => {
    expectValid(joinCommunitySchema, { message: "I want to join" });
  });

  it("should reject message longer than 500 chars", () => {
    expectInvalid(joinCommunitySchema, { message: "a".repeat(501) });
  });
});

// ==========================================
// handleJoinRequestSchema
// ==========================================
describe("handleJoinRequestSchema", () => {
  it("should accept approve action", () => {
    expectValid(handleJoinRequestSchema, { action: "approve" });
  });

  it("should accept reject action", () => {
    expectValid(handleJoinRequestSchema, { action: "reject" });
  });

  it("should reject invalid action", () => {
    expectInvalid(handleJoinRequestSchema, { action: "delete" });
  });
});

// ==========================================
// reviewReportSchema
// ==========================================
describe("reviewReportSchema", () => {
  it("should accept SUSPENDED action", () => {
    expectValid(reviewReportSchema, { action: "SUSPENDED" });
  });

  it("should accept DISMISSED action", () => {
    expectValid(reviewReportSchema, { action: "DISMISSED" });
  });

  it("should accept with optional note", () => {
    expectValid(reviewReportSchema, { action: "SUSPENDED", note: "Violation found" });
  });

  it("should reject invalid action", () => {
    expectInvalid(reviewReportSchema, { action: "BANNED" });
  });
});

// ==========================================
// assignRoleSchema
// ==========================================
describe("assignRoleSchema", () => {
  it("should accept SUPER_ADMIN", () => {
    expectValid(assignRoleSchema, { role: "SUPER_ADMIN" });
  });

  it("should accept PLATFORM_ADMIN", () => {
    expectValid(assignRoleSchema, { role: "PLATFORM_ADMIN" });
  });

  it("should accept MEMBER", () => {
    expectValid(assignRoleSchema, { role: "MEMBER" });
  });

  it("should reject invalid role", () => {
    expectInvalid(assignRoleSchema, { role: "GUEST" });
  });
});

// ==========================================
// createCategorySchema
// ==========================================
describe("createCategorySchema", () => {
  it("should accept valid category", () => {
    expectValid(createCategorySchema, { name: "Technology" });
  });

  it("should reject name shorter than 2 chars", () => {
    expectInvalid(createCategorySchema, { name: "T" });
  });

  it("should accept with optional description and icon", () => {
    expectValid(createCategorySchema, {
      name: "Health",
      description: "Health related",
      icon: "health-icon",
    });
  });

  it("should reject name longer than 50 chars", () => {
    expectInvalid(createCategorySchema, { name: "a".repeat(51) });
  });
});

// ==========================================
// updateCategorySchema
// ==========================================
describe("updateCategorySchema", () => {
  it("should accept partial update", () => {
    expectValid(updateCategorySchema, { name: "New Name" });
  });

  it("should accept empty update", () => {
    expectValid(updateCategorySchema, {});
  });
});

// ==========================================
// updateProfileSchema
// ==========================================
describe("updateProfileSchema", () => {
  it("should accept empty update", () => {
    expectValid(updateProfileSchema, {});
  });

  it("should accept valid avatar URL", () => {
    expectValid(updateProfileSchema, { avatar: "https://example.com/avatar.jpg" });
  });

  it("should accept relative avatar path from upload", () => {
    expectValid(updateProfileSchema, { avatar: "/uploads/avatars/2026-01-01/avatar-12345.jpg" });
  });

  it("should reject empty avatar string via min(1)", () => {
    expectInvalid(updateProfileSchema, { avatar: "" });
  });

  it("should accept valid bio", () => {
    expectValid(updateProfileSchema, { bio: "Hello, I am John." });
  });

  it("should reject name shorter than 2 chars", () => {
    expectInvalid(updateProfileSchema, { name: "J" });
  });

  it("should accept valid phone number", () => {
    expectValid(updateProfileSchema, { phone: "+62 812-3456-7890" });
  });

  it("should accept phone with digits, spaces, dashes, parens", () => {
    expectValid(updateProfileSchema, { phone: "(021) 123-4567" });
  });

  it("should reject phone with invalid characters", () => {
    expectInvalid(updateProfileSchema, { phone: "abc!@#$" });
  });

  it("should accept empty phone string (clear phone)", () => {
    expectValid(updateProfileSchema, { phone: "" });
  });
});

// ==========================================
// createCommunitySchema
// ==========================================
describe("createCommunitySchema", () => {
  it("should accept valid minimal data", () => {
    expectValid(createCommunitySchema, VALID_COMMUNITY);
  });

  it("should reject name shorter than 3 chars", () => {
    expectInvalid(createCommunitySchema, { name: "ab" });
  });

  it("should accept name at exactly 3 chars (boundary)", () => {
    expectValid(createCommunitySchema, { name: "abc" });
  });

  it("should accept with all optional fields", () => {
    expectValid(createCommunitySchema, {
      name: "Full Community",
      description: "A detailed description",
      coverImage: "https://example.com/cover.jpg",
      logo: "https://example.com/logo.png",
      banner: "https://example.com/banner.jpg",
      location: "Jakarta",
      website: "https://example.com",
      contactEmail: "contact@example.com",
      contactPhone: "08123456789",
      membershipType: "RESTRICTED",
      visibility: "PRIVATE",
      categoryIds: ["cat1"],
      tags: ["tech"],
    });
  });

  it("should reject invalid coverImage URL", () => {
    expectInvalid(createCommunitySchema, {
      name: "Test",
      coverImage: "not-a-url",
    });
  });

  it("should reject invalid website URL", () => {
    expectInvalid(createCommunitySchema, {
      name: "Test",
      website: "invalid-url",
    });
  });

  it("should reject invalid contactEmail", () => {
    expectInvalid(createCommunitySchema, {
      name: "Test",
      contactEmail: "not-email",
    });
  });

  it("should reject name longer than 100 chars", () => {
    expectInvalid(createCommunitySchema, { name: "a".repeat(101) });
  });

  it("should reject more than 5 categoryIds", () => {
    expectInvalid(createCommunitySchema, {
      name: "Test",
      categoryIds: ["1", "2", "3", "4", "5", "6"],
    });
  });

  it("should reject more than 10 tags", () => {
    expectInvalid(createCommunitySchema, {
      name: "Test",
      tags: Array.from({ length: 11 }, (_, i) => `tag${i}`),
    });
  });

  it("should reject invalid membershipType", () => {
    expectInvalid(createCommunitySchema, {
      name: "Test",
      membershipType: "FREE",
    });
  });

  it("should reject invalid visibility", () => {
    expectInvalid(createCommunitySchema, {
      name: "Test",
      visibility: "HIDDEN",
    });
  });

  it("should default membershipType to OPEN", () => {
    const result = expectValid(createCommunitySchema, VALID_COMMUNITY);
    expect((result as any).data.membershipType).toBe("OPEN");
  });

  it("should default visibility to PUBLIC", () => {
    const result = expectValid(createCommunitySchema, VALID_COMMUNITY);
    expect((result as any).data.visibility).toBe("PUBLIC");
  });
});

// ==========================================
// updateCommunitySettingsSchema
// ==========================================
describe("updateCommunitySettingsSchema", () => {
  it("should accept empty update", () => {
    expectValid(updateCommunitySettingsSchema, {});
  });

  it("should accept boolean values", () => {
    expectValid(updateCommunitySettingsSchema, {
      allowMemberPost: true,
      requireApproval: false,
      showMemberList: true,
      showEventList: false,
    });
  });

  it("should reject non-boolean values", () => {
    expectInvalid(updateCommunitySettingsSchema, {
      allowMemberPost: "yes",
    });
  });
});

// ==========================================
// updateCommunityBannerSchema
// ==========================================
describe("updateCommunityBannerSchema", () => {
  it("should accept valid URL", () => {
    expectValid(updateCommunityBannerSchema, { banner: "https://example.com/banner.jpg" });
  });

  it("should accept empty string", () => {
    expectValid(updateCommunityBannerSchema, { banner: "" });
  });

  it("should accept undefined (omit)", () => {
    expectValid(updateCommunityBannerSchema, {});
  });

  it("should reject invalid URL", () => {
    expectInvalid(updateCommunityBannerSchema, { banner: "not-a-url" });
  });
});

// ==========================================
// updateCommunityLogoSchema
// ==========================================
describe("updateCommunityLogoSchema", () => {
  it("should accept valid URL", () => {
    expectValid(updateCommunityLogoSchema, { logo: "https://example.com/logo.png" });
  });

  it("should accept empty string", () => {
    expectValid(updateCommunityLogoSchema, { logo: "" });
  });

  it("should reject invalid URL", () => {
    expectInvalid(updateCommunityLogoSchema, { logo: "not-a-url" });
  });
});

// ==========================================
// updateCommunityProfileSchema
// ==========================================
describe("updateCommunityProfileSchema", () => {
  it("should accept empty update", () => {
    expectValid(updateCommunityProfileSchema, {});
  });

  it("should accept valid data", () => {
    expectValid(updateCommunityProfileSchema, {
      name: "New Name",
      description: "New description",
      location: "Bandung",
    });
  });

  it("should accept empty string website (clear)", () => {
    expectValid(updateCommunityProfileSchema, { website: "" });
  });

  it("should reject invalid website URL", () => {
    expectInvalid(updateCommunityProfileSchema, { website: "invalid" });
  });
});

// ==========================================
// submitCommunitySchema
// ==========================================
describe("submitCommunitySchema", () => {
  it("should accept empty object", () => {
    expectValid(submitCommunitySchema, {});
  });
});

// ==========================================
// adminReviewCommunitySchema
// ==========================================
describe("adminReviewCommunitySchema", () => {
  it("should accept empty (no note)", () => {
    expectValid(adminReviewCommunitySchema, {});
  });

  it("should accept with note", () => {
    expectValid(adminReviewCommunitySchema, { note: "Looks good" });
  });

  it("should reject note longer than 2000 chars", () => {
    expectInvalid(adminReviewCommunitySchema, { note: "a".repeat(2001) });
  });
});

// ==========================================
// suspendCommunitySchema
// ==========================================
describe("suspendCommunitySchema", () => {
  it("should accept valid reason", () => {
    expectValid(suspendCommunitySchema, { reason: "Violation of terms" });
  });

  it("should reject empty reason", () => {
    expectInvalid(suspendCommunitySchema, { reason: "" });
  });

  it("should reject reason longer than 2000 chars", () => {
    expectInvalid(suspendCommunitySchema, { reason: "a".repeat(2001) });
  });
});

// ==========================================
// createCommunityMediaSchema
// ==========================================
describe("createCommunityMediaSchema", () => {
  it("should accept valid media data", () => {
    expectValid(createCommunityMediaSchema, {
      title: "Announcement",
      content: "This is important news for all members.",
    });
  });

  it("should reject title shorter than 3 chars", () => {
    expectInvalid(createCommunityMediaSchema, {
      title: "ab",
      content: "This is important news.",
    });
  });

  it("should reject content shorter than 10 chars", () => {
    expectInvalid(createCommunityMediaSchema, {
      title: "Title",
      content: "Short",
    });
  });

  it("should default type to ANNOUNCEMENT", () => {
    const result = expectValid(createCommunityMediaSchema, {
      title: "News",
      content: "This is the content.",
    });
    expect((result as any).data.type).toBe("ANNOUNCEMENT");
  });

  it("should default isPublished to false", () => {
    const result = expectValid(createCommunityMediaSchema, {
      title: "News",
      content: "This is the content.",
    });
    expect((result as any).data.isPublished).toBe(false);
  });
});

// ==========================================
// changeMemberRoleSchema
// ==========================================
describe("changeMemberRoleSchema", () => {
  it("should accept ADMIN", () => {
    expectValid(changeMemberRoleSchema, { role: "ADMIN" });
  });

  it("should accept EVENT_MANAGER", () => {
    expectValid(changeMemberRoleSchema, { role: "EVENT_MANAGER" });
  });

  it("should accept MEMBER", () => {
    expectValid(changeMemberRoleSchema, { role: "MEMBER" });
  });

  it("should reject invalid role", () => {
    expectInvalid(changeMemberRoleSchema, { role: "GUEST" });
  });
});

// ==========================================
// changeOrganizationMemberRoleSchema
// ==========================================
describe("changeOrganizationMemberRoleSchema", () => {
  it("should accept ADMIN", () => {
    expectValid(changeOrganizationMemberRoleSchema, { role: "ADMIN" });
  });

  it("should accept MEMBER", () => {
    expectValid(changeOrganizationMemberRoleSchema, { role: "MEMBER" });
  });

  it("should reject invalid role", () => {
    expectInvalid(changeOrganizationMemberRoleSchema, { role: "OWNER" });
  });
});

// ==========================================
// createEventSchema
// ==========================================
describe("createEventSchema", () => {
  it("should accept valid event data", () => {
    expectValid(createEventSchema, VALID_EVENT);
  });

  it("should reject missing title", () => {
    expectInvalid(createEventSchema, {
      eventDate: "2026-12-01T10:00:00.000Z",
      quota: 50,
    });
  });

  it("should reject missing eventDate", () => {
    expectInvalid(createEventSchema, {
      title: "Event",
      quota: 50,
    });
  });

  it("should reject invalid eventDate format", () => {
    expectInvalid(createEventSchema, {
      ...VALID_EVENT,
      eventDate: "2026-12-01",
    });
  });

  it("should reject quota less than 1", () => {
    expectInvalid(createEventSchema, {
      ...VALID_EVENT,
      quota: 0,
    });
  });

  it("should accept quota at exactly 1 (boundary)", () => {
    expectValid(createEventSchema, { ...VALID_EVENT, quota: 1 });
  });

  it("should reject title shorter than 3 chars", () => {
    expectInvalid(createEventSchema, { ...VALID_EVENT, title: "ab" });
  });

  it("should accept with all optional fields", () => {
    expectValid(createEventSchema, {
      ...VALID_EVENT,
      description: "Full event",
      coverImage: "https://example.com/cover.jpg",
      location: "Jakarta Convention Center",
      locationType: "HYBRID",
      isOnline: true,
      onlineUrl: "https://meet.example.com",
      contactName: "Admin",
      contactEmail: "admin@example.com",
      contactPhone: "08123456789",
      visibility: "PRIVATE",
      categoryIds: ["cat1"],
      gallery: ["https://example.com/img1.jpg"],
    });
  });

  it("should reject invalid locationType", () => {
    expectInvalid(createEventSchema, {
      ...VALID_EVENT,
      locationType: "VIRTUAL",
    });
  });

  it("should reject invalid onlineUrl", () => {
    expectInvalid(createEventSchema, {
      ...VALID_EVENT,
      onlineUrl: "not-a-url",
    });
  });

  it("should reject more than 5 categoryIds", () => {
    expectInvalid(createEventSchema, {
      ...VALID_EVENT,
      categoryIds: ["1", "2", "3", "4", "5", "6"],
    });
  });

  it("should default locationType to OFFLINE", () => {
    const result = expectValid(createEventSchema, VALID_EVENT);
    expect((result as any).data.locationType).toBe("OFFLINE");
  });

  it("default visibility should be PUBLIC", () => {
    const result = expectValid(createEventSchema, VALID_EVENT);
    expect((result as any).data.visibility).toBe("PUBLIC");
  });

  it("default timezone should be Asia/Jakarta", () => {
    const result = expectValid(createEventSchema, VALID_EVENT);
    expect((result as any).data.timezone).toBe("Asia/Jakarta");
  });
});

// ==========================================
// volunteerPositionSchema
// ==========================================
describe("volunteerPositionSchema", () => {
  it("should accept valid position", () => {
    expectValid(volunteerPositionSchema, { name: "Coordinator" });
  });

  it("should reject name shorter than 2 chars", () => {
    expectInvalid(volunteerPositionSchema, { name: "C" });
  });

  it("should default requiredQty to 1", () => {
    const result = expectValid(volunteerPositionSchema, { name: "Helper" });
    expect((result as any).data.requiredQty).toBe(1);
  });

  it("should reject requiredQty less than 1", () => {
    expectInvalid(volunteerPositionSchema, { name: "Helper", requiredQty: 0 });
  });
});

// ==========================================
// createVolunteerOpportunitySchema
// ==========================================
describe("createVolunteerOpportunitySchema", () => {
  it("should accept valid data with positions", () => {
    expectValid(createVolunteerOpportunitySchema, VALID_VOLUNTEER);
  });

  it("should reject empty positions array", () => {
    expectInvalid(createVolunteerOpportunitySchema, {
      ...VALID_VOLUNTEER,
      positions: [],
    });
  });

  it("should reject missing positions", () => {
    expectInvalid(createVolunteerOpportunitySchema, {
      title: "Volunteer",
      eventId: "evt_123",
    });
  });

  it("should reject title shorter than 3 chars", () => {
    expectInvalid(createVolunteerOpportunitySchema, {
      ...VALID_VOLUNTEER,
      title: "ab",
    });
  });

  it("should reject missing eventId", () => {
    expectInvalid(createVolunteerOpportunitySchema, {
      title: "Volunteer",
      positions: [{ name: "Helper" }],
    });
  });

  it("should reject more than 20 positions", () => {
    expectInvalid(createVolunteerOpportunitySchema, {
      ...VALID_VOLUNTEER,
      positions: Array.from({ length: 21 }, (_, i) => ({ name: `Pos${i}` })),
    });
  });

  it("should accept with optional date fields", () => {
    expectValid(createVolunteerOpportunitySchema, {
      ...VALID_VOLUNTEER,
      registrationDeadline: "2026-11-01T00:00:00.000Z",
      briefingDate: "2026-11-15T08:00:00.000Z",
      activityStartDate: "2026-12-01T07:00:00.000Z",
      activityEndDate: "2026-12-02T17:00:00.000Z",
    });
  });
});

// ==========================================
// applyVolunteerSchema
// ==========================================
describe("applyVolunteerSchema", () => {
  const validApply = {
    positionId: "pos_123",
    motivation: "I want to help the community with my skills",
    agreement: true,
  };

  it("should accept valid application", () => {
    expectValid(applyVolunteerSchema, validApply);
  });

  it("should reject missing positionId", () => {
    expectInvalid(applyVolunteerSchema, {
      ...validApply,
      positionId: "",
    });
  });

  it("should reject motivation shorter than 10 chars", () => {
    expectInvalid(applyVolunteerSchema, {
      ...validApply,
      motivation: "Short",
    });
  });

  it("should reject agreement false", () => {
    expectInvalid(applyVolunteerSchema, {
      ...validApply,
      agreement: false,
    });
  });

  it("should reject missing agreement", () => {
    expectInvalid(applyVolunteerSchema, {
      positionId: "pos_123",
      motivation: "I want to help the community",
    });
  });
});

// ==========================================
// reviewVolunteerApplicationSchema
// ==========================================
describe("reviewVolunteerApplicationSchema", () => {
  it("should accept ACCEPTED", () => {
    expectValid(reviewVolunteerApplicationSchema, { action: "ACCEPTED" });
  });

  it("should accept REJECTED", () => {
    expectValid(reviewVolunteerApplicationSchema, { action: "REJECTED" });
  });

  it("should accept with optional note", () => {
    expectValid(reviewVolunteerApplicationSchema, {
      action: "ACCEPTED",
      note: "Good profile",
    });
  });

  it("should reject invalid action", () => {
    expectInvalid(reviewVolunteerApplicationSchema, { action: "PENDING" });
  });
});

// ==========================================
// createReportSchema
// ==========================================
describe("createReportSchema", () => {
  it("should accept valid report", () => {
    expectValid(createReportSchema, VALID_REPORT);
  });

  it("should accept with optional description", () => {
    expectValid(createReportSchema, {
      ...VALID_REPORT,
      description: "This content is inappropriate",
    });
  });

  it("should reject invalid targetType", () => {
    expectInvalid(createReportSchema, {
      ...VALID_REPORT,
      targetType: "PAGE",
    });
  });

  it("should reject invalid reason", () => {
    expectInvalid(createReportSchema, {
      ...VALID_REPORT,
      reason: "BAD",
    });
  });

  it("should accept all valid targetType values", () => {
    for (const type of ["COMMUNITY", "EVENT", "USER", "ORGANIZATION"]) {
      expectValid(createReportSchema, { ...VALID_REPORT, targetType: type });
    }
  });

  it("should accept all valid reason values", () => {
    const reasons = [
      "SPAM", "HARASSMENT", "INAPPROPRIATE_CONTENT",
      "MISINFORMATION", "COPYRIGHT_VIOLATION", "OTHER",
    ];
    for (const reason of reasons) {
      expectValid(createReportSchema, { ...VALID_REPORT, reason });
    }
  });

  it("should reject missing targetId", () => {
    expectInvalid(createReportSchema, {
      targetType: "COMMUNITY",
      reason: "SPAM",
    });
  });
});

// ==========================================
// adminResolveReportSchema
// ==========================================
describe("adminResolveReportSchema", () => {
  it("should accept DISMISSED", () => {
    expectValid(adminResolveReportSchema, { action: "DISMISSED" });
  });

  it("should accept SUSPENDED", () => {
    expectValid(adminResolveReportSchema, { action: "SUSPENDED" });
  });

  it("should reject invalid action", () => {
    expectInvalid(adminResolveReportSchema, { action: "BANNED" });
  });
});

// ==========================================
// paginationSchema
// ==========================================
describe("paginationSchema", () => {
  it("should accept valid page/limit", () => {
    expectValid(paginationSchema, { page: 2, limit: 10 });
  });

  it("should default page to 1", () => {
    const result = expectValid(paginationSchema, {});
    expect((result as any).data.page).toBe(1);
  });

  it("should default limit to 20", () => {
    const result = expectValid(paginationSchema, {});
    expect((result as any).data.limit).toBe(20);
  });

  it("should default sort to desc", () => {
    const result = expectValid(paginationSchema, {});
    expect((result as any).data.sort).toBe("desc");
  });

  it("should default orderBy to createdAt", () => {
    const result = expectValid(paginationSchema, {});
    expect((result as any).data.orderBy).toBe("createdAt");
  });

  it("should accept limit at max 100", () => {
    expectValid(paginationSchema, { limit: 100 });
  });

  it("should reject limit greater than 100", () => {
    expectInvalid(paginationSchema, { limit: 101 });
  });

  it("should reject page less than 1", () => {
    expectInvalid(paginationSchema, { page: 0 });
  });

  it("should reject limit less than 1", () => {
    expectInvalid(paginationSchema, { limit: 0 });
  });

  it("should reject non-integer page", () => {
    expectInvalid(paginationSchema, { page: 1.5 });
  });

  it("should accept string number for page (coerce)", () => {
    const result = expectValid(paginationSchema, { page: "3", limit: "5" });
    expect((result as any).data.page).toBe(3);
    expect((result as any).data.limit).toBe(5);
  });

  it("should accept optional search", () => {
    expectValid(paginationSchema, { search: "community" });
  });
});

// ==========================================
// contactMessageSchema
// ==========================================
describe("contactMessageSchema", () => {
  it("should accept valid contact message", () => {
    expectValid(contactMessageSchema, VALID_CONTACT);
  });

  it("should default category to GENERAL", () => {
    const result = expectValid(contactMessageSchema, VALID_CONTACT);
    expect((result as any).data.category).toBe("GENERAL");
  });

  it("should reject message shorter than 10 chars", () => {
    expectInvalid(contactMessageSchema, {
      ...VALID_CONTACT,
      message: "Short",
    });
  });

  it("should reject invalid category", () => {
    expectInvalid(contactMessageSchema, {
      ...VALID_CONTACT,
      category: "INVALID",
    });
  });

  it("should accept all valid categories", () => {
    const categories = [
      "GENERAL", "FEEDBACK", "COMPLAINT",
      "SUGGESTION", "PARTNERSHIP", "OTHER",
    ];
    for (const category of categories) {
      expectValid(contactMessageSchema, { ...VALID_CONTACT, category });
    }
  });

  it("should reject name shorter than 2 chars", () => {
    expectInvalid(contactMessageSchema, {
      ...VALID_CONTACT,
      name: "J",
    });
  });

  it("should reject invalid email", () => {
    expectInvalid(contactMessageSchema, {
      ...VALID_CONTACT,
      email: "not-email",
    });
  });

  it("should reject subject shorter than 3 chars", () => {
    expectInvalid(contactMessageSchema, {
      ...VALID_CONTACT,
      subject: "Hi",
    });
  });

  it("should reject empty fields", () => {
    expectInvalid(contactMessageSchema, {
      name: "",
      email: "",
      subject: "",
      message: "",
    });
  });
});

// ==========================================
// adminBulkActionSchema
// ==========================================
describe("adminBulkActionSchema", () => {
  it("should accept valid bulk action", () => {
    expectValid(adminBulkActionSchema, VALID_BULK);
  });

  it("should accept with optional reason", () => {
    expectValid(adminBulkActionSchema, {
      ...VALID_BULK,
      reason: "Terms violation",
    });
  });

  it("should reject empty ids", () => {
    expectInvalid(adminBulkActionSchema, { ids: [], action: "DELETE" });
  });

  it("should reject more than 100 ids", () => {
    expectInvalid(adminBulkActionSchema, {
      ids: Array.from({ length: 101 }, (_, i) => `id${i}`),
      action: "DELETE",
    });
  });

  it("should accept exactly 100 ids (boundary)", () => {
    expectValid(adminBulkActionSchema, {
      ids: Array.from({ length: 100 }, (_, i) => `id${i}`),
      action: "DELETE",
    });
  });

  it("should accept exactly 1 id", () => {
    expectValid(adminBulkActionSchema, { ids: ["id1"], action: "SUSPEND" });
  });

  it("should reject invalid action", () => {
    expectInvalid(adminBulkActionSchema, {
      ids: ["id1"],
      action: "BAN",
    });
  });

  it("should accept all valid actions", () => {
    const actions = ["DELETE", "SUSPEND", "ACTIVATE", "ARCHIVE", "RESTORE"];
    for (const action of actions) {
      expectValid(adminBulkActionSchema, { ids: ["id1"], action });
    }
  });
});

// ==========================================
// adminBroadcastNotificationSchema
// ==========================================
describe("adminBroadcastNotificationSchema", () => {
  it("should accept valid broadcast", () => {
    expectValid(adminBroadcastNotificationSchema, {
      title: "System Update",
      message: "Scheduled maintenance tonight",
    });
  });

  it("should reject empty title", () => {
    expectInvalid(adminBroadcastNotificationSchema, {
      title: "",
      message: "Hello",
    });
  });

  it("should reject empty message", () => {
    expectInvalid(adminBroadcastNotificationSchema, {
      title: "Title",
      message: "",
    });
  });

  it("should accept with optional type and targetRoles", () => {
    expectValid(adminBroadcastNotificationSchema, {
      title: "Notice",
      message: "Important update for admins",
      type: "SYSTEM",
      targetRoles: ["SUPER_ADMIN", "PLATFORM_ADMIN"],
    });
  });

  it("should reject invalid type", () => {
    expectInvalid(adminBroadcastNotificationSchema, {
      title: "Notice",
      message: "Hello",
      type: "INVALID",
    });
  });
});

// ==========================================
// adminCreateCmsPageSchema
// ==========================================
describe("adminCreateCmsPageSchema", () => {
  it("should accept valid CMS page", () => {
    expectValid(adminCreateCmsPageSchema, {
      slug: "about-us",
      title: "About Us",
      content: "<p>We are KomunaID</p>",
    });
  });

  it("should reject slug shorter than 2 chars", () => {
    expectInvalid(adminCreateCmsPageSchema, {
      slug: "a",
      title: "Page",
      content: "Content",
    });
  });

  it("should reject slug with uppercase", () => {
    expectInvalid(adminCreateCmsPageSchema, {
      slug: "About-Us",
      title: "Page",
      content: "Content",
    });
  });

  it("should reject slug with spaces", () => {
    expectInvalid(adminCreateCmsPageSchema, {
      slug: "about us",
      title: "Page",
      content: "Content",
    });
  });

  it("should accept slug with numbers and hyphens", () => {
    expectValid(adminCreateCmsPageSchema, {
      slug: "page-2024",
      title: "Page 2024",
      content: "Content here",
    });
  });

  it("should default isPublished to false", () => {
    const result = expectValid(adminCreateCmsPageSchema, {
      slug: "test",
      title: "Test",
      content: "Content",
    });
    expect((result as any).data.isPublished).toBe(false);
  });
});

// ==========================================
// adminCreateBannerSchema
// ==========================================
describe("adminCreateBannerSchema", () => {
  it("should accept valid banner", () => {
    expectValid(adminCreateBannerSchema, {
      title: "Promo Banner",
      imageUrl: "https://example.com/banner.jpg",
    });
  });

  it("should reject invalid imageUrl", () => {
    expectInvalid(adminCreateBannerSchema, {
      title: "Banner",
      imageUrl: "not-a-url",
    });
  });

  it("should default position to 0", () => {
    const result = expectValid(adminCreateBannerSchema, {
      title: "Banner",
      imageUrl: "https://example.com/banner.jpg",
    });
    expect((result as any).data.position).toBe(0);
  });

  it("should default isActive to true", () => {
    const result = expectValid(adminCreateBannerSchema, {
      title: "Banner",
      imageUrl: "https://example.com/banner.jpg",
    });
    expect((result as any).data.isActive).toBe(true);
  });

  it("should reject position less than 0", () => {
    expectInvalid(adminCreateBannerSchema, {
      title: "Banner",
      imageUrl: "https://example.com/banner.jpg",
      position: -1,
    });
  });
});

// ==========================================
// adminResetPasswordSchema
// ==========================================
describe("adminResetPasswordSchema", () => {
  it("should accept valid password", () => {
    expectValid(adminResetPasswordSchema, { newPassword: "StrongPass1" });
  });

  it("should reject password shorter than 8 chars", () => {
    expectInvalid(adminResetPasswordSchema, { newPassword: "Str1" });
  });

  it("should reject password without uppercase", () => {
    expectInvalid(adminResetPasswordSchema, { newPassword: "lowercase1" });
  });

  it("should reject password without lowercase", () => {
    expectInvalid(adminResetPasswordSchema, { newPassword: "UPPERCASE1" });
  });

  it("should reject password without number", () => {
    expectInvalid(adminResetPasswordSchema, { newPassword: "NoNumbersHere" });
  });
});

// ==========================================
// adminModerationWarningSchema
// ==========================================
describe("adminModerationWarningSchema", () => {
  it("should accept valid reason", () => {
    expectValid(adminModerationWarningSchema, { reason: "Spam detected" });
  });

  it("should reject empty reason", () => {
    expectInvalid(adminModerationWarningSchema, { reason: "" });
  });

  it("should reject reason longer than 2000 chars", () => {
    expectInvalid(adminModerationWarningSchema, { reason: "a".repeat(2001) });
  });
});

// ==========================================
// adminUpdateUserStatusSchema
// ==========================================
describe("adminUpdateUserStatusSchema", () => {
  it("should accept ACTIVE", () => {
    expectValid(adminUpdateUserStatusSchema, { status: "ACTIVE" });
  });

  it("should accept SUSPENDED", () => {
    expectValid(adminUpdateUserStatusSchema, { status: "SUSPENDED" });
  });

  it("should accept DEACTIVATED", () => {
    expectValid(adminUpdateUserStatusSchema, { status: "DEACTIVATED" });
  });

  it("should accept with optional reason", () => {
    expectValid(adminUpdateUserStatusSchema, {
      status: "SUSPENDED",
      reason: "Terms violation",
    });
  });

  it("should reject invalid status", () => {
    expectInvalid(adminUpdateUserStatusSchema, { status: "BANNED" });
  });
});

// ==========================================
// adminForceLogoutSchema / adminLockUserSchema / adminUnlockUserSchema
// ==========================================
describe("adminForceLogoutSchema", () => {
  it("should accept valid userId", () => {
    expectValid(adminForceLogoutSchema, { userId: "user_123" });
  });

  it("should reject empty userId", () => {
    expectInvalid(adminForceLogoutSchema, { userId: "" });
  });
});

describe("adminLockUserSchema", () => {
  it("should accept valid userId", () => {
    expectValid(adminLockUserSchema, { userId: "user_123" });
  });

  it("should reject empty userId", () => {
    expectInvalid(adminLockUserSchema, { userId: "" });
  });
});

describe("adminUnlockUserSchema", () => {
  it("should accept valid userId", () => {
    expectValid(adminUnlockUserSchema, { userId: "user_123" });
  });

  it("should reject empty userId", () => {
    expectInvalid(adminUnlockUserSchema, { userId: "" });
  });
});

// ==========================================
// adminSecuritySettingsSchema
// ==========================================
describe("adminSecuritySettingsSchema", () => {
  it("should accept empty (all optional)", () => {
    expectValid(adminSecuritySettingsSchema, {});
  });

  it("should accept valid settings", () => {
    expectValid(adminSecuritySettingsSchema, {
      maxLoginAttempts: 5,
      lockoutDurationMinutes: 30,
      sessionTimeoutMinutes: 60,
      requirePasswordChange: true,
      enforceStrongPasswords: true,
      twoFactorEnabled: false,
      ipWhitelist: ["192.168.1.1"],
      ipBlacklist: ["10.0.0.1"],
    });
  });

  it("should reject maxLoginAttempts less than 1", () => {
    expectInvalid(adminSecuritySettingsSchema, { maxLoginAttempts: 0 });
  });

  it("should reject lockoutDurationMinutes greater than 1440", () => {
    expectInvalid(adminSecuritySettingsSchema, { lockoutDurationMinutes: 1441 });
  });

  it("should reject sessionTimeoutMinutes less than 5", () => {
    expectInvalid(adminSecuritySettingsSchema, { sessionTimeoutMinutes: 4 });
  });

  it("should reject more than 100 IP whitelist entries", () => {
    expectInvalid(adminSecuritySettingsSchema, {
      ipWhitelist: Array.from({ length: 101 }, (_, i) => `192.168.1.${i}`),
    });
  });
});

// ==========================================
// adminReviewVolunteerSchema
// ==========================================
describe("adminReviewVolunteerSchema", () => {
  it("should accept ACCEPTED", () => {
    expectValid(adminReviewVolunteerSchema, { action: "ACCEPTED" });
  });

  it("should accept REJECTED", () => {
    expectValid(adminReviewVolunteerSchema, { action: "REJECTED" });
  });

  it("should accept with note", () => {
    expectValid(adminReviewVolunteerSchema, {
      action: "ACCEPTED",
      note: "Great experience",
    });
  });

  it("should reject invalid action", () => {
    expectInvalid(adminReviewVolunteerSchema, { action: "PENDING" });
  });
});

// ==========================================
// adminReviewEventSchema
// ==========================================
describe("adminReviewEventSchema", () => {
  it("should accept PUBLISHED", () => {
    expectValid(adminReviewEventSchema, { action: "PUBLISHED" });
  });

  it("should accept CANCELLED", () => {
    expectValid(adminReviewEventSchema, { action: "CANCELLED" });
  });

  it("should accept ARCHIVED", () => {
    expectValid(adminReviewEventSchema, { action: "ARCHIVED" });
  });

  it("should reject invalid action", () => {
    expectInvalid(adminReviewEventSchema, { action: "DRAFT" });
  });
});

// ==========================================
// adminCreateNotificationTemplateSchema
// ==========================================
describe("adminCreateNotificationTemplateSchema", () => {
  it("should accept valid template", () => {
    expectValid(adminCreateNotificationTemplateSchema, {
      name: "Welcome",
      title: "Welcome to KomunaID",
      message: "Thank you for joining",
    });
  });

  it("should reject empty name", () => {
    expectInvalid(adminCreateNotificationTemplateSchema, {
      name: "",
      title: "Title",
      message: "Message",
    });
  });

  it("should reject empty title", () => {
    expectInvalid(adminCreateNotificationTemplateSchema, {
      name: "Template",
      title: "",
      message: "Message",
    });
  });

  it("should reject empty message", () => {
    expectInvalid(adminCreateNotificationTemplateSchema, {
      name: "Template",
      title: "Title",
      message: "",
    });
  });

  it("should accept with optional type", () => {
    expectValid(adminCreateNotificationTemplateSchema, {
      name: "Event",
      title: "New Event",
      message: "Check out this event",
      type: "EVENT",
    });
  });

  it("should reject invalid type", () => {
    expectInvalid(adminCreateNotificationTemplateSchema, {
      name: "Template",
      title: "Title",
      message: "Message",
      type: "INVALID",
    });
  });
});

// ==========================================
// createOrganizationSchema
// ==========================================
describe("createOrganizationSchema", () => {
  it("should accept valid minimal data", () => {
    expectValid(createOrganizationSchema, { name: "My Org" });
  });

  it("should reject name shorter than 3 chars", () => {
    expectInvalid(createOrganizationSchema, { name: "ab" });
  });

  it("should accept with optional fields", () => {
    expectValid(createOrganizationSchema, {
      name: "Tech Org",
      description: "Technology organization",
      logo: "https://example.com/logo.png",
      website: "https://example.com",
      location: "Jakarta",
      industry: "Technology",
      visibility: "PRIVATE",
    });
  });

  it("should reject invalid logo URL", () => {
    expectInvalid(createOrganizationSchema, {
      name: "Org",
      logo: "not-url",
    });
  });

  it("should reject invalid website URL", () => {
    expectInvalid(createOrganizationSchema, {
      name: "Org",
      website: "not-url",
    });
  });

  it("should default visibility to PUBLIC", () => {
    const result = expectValid(createOrganizationSchema, { name: "Org" });
    expect((result as any).data.visibility).toBe("PUBLIC");
  });
});

// ==========================================
// updateOrganizationBannerSchema / updateOrganizationLogoSchema
// ==========================================
describe("updateOrganizationBannerSchema", () => {
  it("should accept valid URL", () => {
    expectValid(updateOrganizationBannerSchema, { banner: "https://example.com/banner.jpg" });
  });

  it("should accept empty string", () => {
    expectValid(updateOrganizationBannerSchema, { banner: "" });
  });

  it("should reject invalid URL", () => {
    expectInvalid(updateOrganizationBannerSchema, { banner: "invalid" });
  });
});

describe("updateOrganizationLogoSchema", () => {
  it("should accept valid URL", () => {
    expectValid(updateOrganizationLogoSchema, { logo: "https://example.com/logo.png" });
  });

  it("should accept empty string", () => {
    expectValid(updateOrganizationLogoSchema, { logo: "" });
  });

  it("should reject invalid URL", () => {
    expectInvalid(updateOrganizationLogoSchema, { logo: "invalid" });
  });
});

// ==========================================
// updateOrganizationProfileSchema
// ==========================================
describe("updateOrganizationProfileSchema", () => {
  it("should accept empty update", () => {
    expectValid(updateOrganizationProfileSchema, {});
  });

  it("should accept valid data", () => {
    expectValid(updateOrganizationProfileSchema, {
      name: "New Org Name",
      industry: "Finance",
    });
  });

  it("should accept empty string website (clear)", () => {
    expectValid(updateOrganizationProfileSchema, { website: "" });
  });

  it("should accept empty string contactEmail (clear)", () => {
    expectValid(updateOrganizationProfileSchema, { contactEmail: "" });
  });

  it("should reject invalid website URL", () => {
    expectInvalid(updateOrganizationProfileSchema, { website: "invalid" });
  });
});

// ==========================================
// updateOrganizationSettingsSchema
// ==========================================
describe("updateOrganizationSettingsSchema", () => {
  it("should accept empty update", () => {
    expectValid(updateOrganizationSettingsSchema, {});
  });

  it("should accept boolean values", () => {
    expectValid(updateOrganizationSettingsSchema, {
      allowMemberPost: true,
      requireApproval: false,
    });
  });

  it("should reject non-boolean values", () => {
    expectInvalid(updateOrganizationSettingsSchema, {
      allowMemberPost: "yes",
    });
  });
});
