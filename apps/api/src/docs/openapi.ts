const securitySchemes = {
  cookieAuth: {
    type: "apiKey",
    in: "cookie",
    name: "accessToken",
    description: "JWT access token set as HTTP-only cookie after login",
  },
  csrfToken: {
    type: "apiKey",
    in: "header",
    name: "X-CSRF-Token",
    description: "CSRF token required for all mutating requests (POST/PUT/PATCH/DELETE)",
  },
};

const bearerAuth = [{ cookieAuth: [] }];

const schemas = {
  SuccessResponse: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      message: { type: "string" },
    },
  },
  ErrorResponse: {
    type: "object",
    properties: {
      success: { type: "boolean", example: false },
      message: { type: "string" },
      error: {
        type: "object",
        properties: {
          code: { type: "string" },
          message: { type: "string" },
        },
      },
    },
  },
  PaginationMeta: {
    type: "object",
    properties: {
      page: { type: "integer" },
      limit: { type: "integer" },
      total: { type: "integer" },
      totalPages: { type: "integer" },
    },
  },
  User: {
    type: "object",
    properties: {
      id: { type: "string", format: "uuid" },
      name: { type: "string" },
      username: { type: "string" },
      email: { type: "string", format: "email" },
      avatar: { type: "string", nullable: true },
      phone: { type: "string", nullable: true },
      bio: { type: "string", nullable: true },
      location: { type: "string", nullable: true },
      status: { type: "string", enum: ["ACTIVE", "SUSPENDED", "DEACTIVATED"] },
      roles: { type: "array", items: { type: "string" } },
      interests: { type: "array", items: { type: "string" } },
      createdAt: { type: "string", format: "date-time" },
    },
  },
  Community: {
    type: "object",
    properties: {
      id: { type: "string", format: "uuid" },
      name: { type: "string" },
      slug: { type: "string" },
      description: { type: "string" },
      coverImage: { type: "string", nullable: true },
      logo: { type: "string", nullable: true },
      banner: { type: "string", nullable: true },
      location: { type: "string", nullable: true },
      membershipType: { type: "string", enum: ["OPEN", "APPROVAL", "INVITE_ONLY"] },
      status: { type: "string", enum: ["DRAFT", "PENDING", "APPROVED", "REVISION_REQUIRED", "ARCHIVED", "REJECTED"] },
      visibility: { type: "string", enum: ["PUBLIC", "PRIVATE"] },
      owner: { type: "object", properties: { id: { type: "string" }, name: { type: "string" }, avatar: { type: "string", nullable: true } } },
      memberCount: { type: "integer" },
      eventCount: { type: "integer" },
      categories: { type: "array", items: { type: "object" } },
      tags: { type: "array", items: { type: "string" } },
      createdAt: { type: "string", format: "date-time" },
    },
  },
  Event: {
    type: "object",
    properties: {
      id: { type: "string", format: "uuid" },
      title: { type: "string" },
      slug: { type: "string" },
      description: { type: "string" },
      coverImage: { type: "string", nullable: true },
      location: { type: "string" },
      locationType: { type: "string" },
      isOnline: { type: "boolean" },
      eventDate: { type: "string", format: "date-time" },
      endDate: { type: "string", format: "date-time", nullable: true },
      quota: { type: "integer" },
      status: { type: "string", enum: ["DRAFT", "PUBLISHED", "REGISTRATION_OPEN", "REGISTRATION_CLOSED", "ONGOING", "COMPLETED", "CANCELLED", "ARCHIVED"] },
      visibility: { type: "string", enum: ["PUBLIC", "PRIVATE"] },
      registeredCount: { type: "integer" },
      community: { type: "object", nullable: true },
      organization: { type: "object", nullable: true },
      createdBy: { type: "object" },
      categories: { type: "array", items: { type: "object" } },
      createdAt: { type: "string", format: "date-time" },
    },
  },
  VolunteerOpportunity: {
    type: "object",
    properties: {
      id: { type: "string", format: "uuid" },
      title: { type: "string" },
      slug: { type: "string" },
      description: { type: "string" },
      status: { type: "string", enum: ["DRAFT", "PUBLISHED", "OPEN", "CLOSED", "ARCHIVED"] },
      registrationDeadline: { type: "string", format: "date-time", nullable: true },
      event: { type: "object" },
      createdBy: { type: "object" },
      positions: { type: "array", items: { type: "object" } },
      applicationCount: { type: "integer" },
      createdAt: { type: "string", format: "date-time" },
    },
  },
  Notification: {
    type: "object",
    properties: {
      id: { type: "string", format: "uuid" },
      title: { type: "string" },
      message: { type: "string" },
      type: { type: "string", enum: ["SYSTEM", "COMMUNITY", "EVENT", "ORGANIZATION", "APPROVAL"] },
      isRead: { type: "boolean" },
      link: { type: "string", nullable: true },
      createdAt: { type: "string", format: "date-time" },
    },
  },
  Report: {
    type: "object",
    properties: {
      id: { type: "string", format: "uuid" },
      targetType: { type: "string", enum: ["USER", "COMMUNITY", "EVENT", "ORGANIZATION"] },
      targetId: { type: "string", format: "uuid" },
      reason: { type: "string" },
      description: { type: "string", nullable: true },
      status: { type: "string", enum: ["OPEN", "UNDER_REVIEW", "RESOLVED", "DISMISSED"] },
      createdAt: { type: "string", format: "date-time" },
    },
  },
};

export const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "KomunaID API",
    description: "REST API for KomunaID platform — Indonesian community & volunteer management.",
    version: "0.1.0",
    contact: { name: "KomunaID Team" },
  },
  servers: [
    { url: "/api/v1", description: "API v1" },
  ],
  components: {
    securitySchemes,
    schemas,
  },
  tags: [
    { name: "Auth", description: "Authentication & session management" },
    { name: "Users", description: "User profiles, notifications & activity" },
    { name: "Communities", description: "Community CRUD, membership & management" },
    { name: "Organizations", description: "Organization CRUD, membership & management" },
    { name: "Events", description: "Event lifecycle, registration & participants" },
    { name: "Volunteer", description: "Volunteer opportunities, applications & attendance" },
    { name: "Reports", description: "Content moderation reports" },
    { name: "Categories", description: "Category management" },
    { name: "Master Data", description: "Geographic & reference data" },
    { name: "Upload", description: "File upload (images)" },
    { name: "Organization Structure", description: "Org structure hierarchy" },
    { name: "Contact Messages", description: "Contact form & admin management" },
    { name: "Admin", description: "Platform admin endpoints (dashboard, users, roles, CMS, etc.)" },
  ],
  paths: {
    // ==================== AUTH ====================
    "/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Register new user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "username", "email", "password"],
                properties: {
                  name: { type: "string" },
                  username: { type: "string" },
                  email: { type: "string", format: "email" },
                  password: { type: "string", minLength: 8 },
                },
              },
            },
          },
        },
        responses: {
          "201": { description: "Registration successful", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, data: { type: "object", properties: { user: { $ref: "#/components/schemas/User" } } } } } } } },
          "409": { description: "Email or username already taken" },
          "429": { description: "Rate limit exceeded" },
        },
      },
    },
    "/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login with email/username and password",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["identifier", "password"],
                properties: {
                  identifier: { type: "string", description: "Email or username" },
                  password: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Login successful. Sets accessToken and refreshToken cookies." },
          "401": { description: "Invalid credentials" },
          "403": { description: "Account suspended or deactivated" },
          "429": { description: "Rate limit exceeded" },
        },
      },
    },
    "/auth/refresh": {
      post: {
        tags: ["Auth"],
        summary: "Refresh access token",
        description: "Uses refreshToken cookie to issue a new access token and rotate the refresh token.",
        responses: {
          "200": { description: "Token refreshed" },
          "401": { description: "Invalid or expired refresh token" },
        },
      },
    },
    "/auth/logout": {
      post: {
        tags: ["Auth"],
        summary: "Logout current session",
        security: bearerAuth,
        responses: {
          "200": { description: "Logout successful. Clears cookies." },
        },
      },
    },
    "/auth/me": {
      get: {
        tags: ["Auth"],
        summary: "Get current user info",
        security: bearerAuth,
        responses: {
          "200": { description: "Current user data" },
          "401": { description: "Unauthorized" },
        },
      },
    },
    "/auth/change-password": {
      put: {
        tags: ["Auth"],
        summary: "Change password",
        security: bearerAuth,
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["currentPassword", "newPassword"],
                properties: {
                  currentPassword: { type: "string" },
                  newPassword: { type: "string", minLength: 8 },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Password changed" },
          "401": { description: "Current password incorrect" },
        },
      },
    },
    "/auth/forgot-password": {
      post: {
        tags: ["Auth"],
        summary: "Request password reset email",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email"],
                properties: { email: { type: "string", format: "email" } },
              },
            },
          },
        },
        responses: {
          "200": { description: "Reset email sent (always returns success for security)" },
        },
      },
    },
    "/auth/reset-password": {
      post: {
        tags: ["Auth"],
        summary: "Reset password with token",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["token", "password"],
                properties: {
                  token: { type: "string" },
                  password: { type: "string", minLength: 8 },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Password reset" },
          "400": { description: "Invalid or expired token" },
        },
      },
    },
    "/auth/sessions": {
      get: {
        tags: ["Auth"],
        summary: "List active sessions",
        security: bearerAuth,
        responses: { "200": { description: "List of sessions" } },
      },
      delete: {
        tags: ["Auth"],
        summary: "Revoke all sessions",
        security: bearerAuth,
        responses: { "200": { description: "All sessions revoked" } },
      },
    },
    "/auth/sessions/{sessionId}": {
      delete: {
        tags: ["Auth"],
        summary: "Revoke a specific session",
        security: bearerAuth,
        parameters: [{ name: "sessionId", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": { description: "Session revoked" },
          "404": { description: "Session not found" },
        },
      },
    },

    // ==================== USERS ====================
    "/users/profile": {
      get: {
        tags: ["Users"],
        summary: "Get own profile with communities, organizations, events, notifications",
        security: bearerAuth,
        responses: { "200": { description: "Profile data" } },
      },
      put: {
        tags: ["Users"],
        summary: "Update own profile",
        security: bearerAuth,
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  phone: { type: "string" },
                  bio: { type: "string" },
                  location: { type: "string" },
                  avatar: { type: "string" },
                },
              },
            },
          },
        },
        responses: { "200": { description: "Profile updated" } },
      },
    },
    "/users/interests": {
      put: {
        tags: ["Users"],
        summary: "Update user interests",
        security: bearerAuth,
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["interests"],
                properties: { interests: { type: "array", items: { type: "string" }, maxItems: 20 } },
              },
            },
          },
        },
        responses: { "200": { description: "Interests updated" } },
      },
    },
    "/users/{id}": {
      get: {
        tags: ["Users"],
        summary: "Get public user profile by ID",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": { description: "Public profile" },
          "404": { description: "User not found" },
        },
      },
    },
    "/users/notifications": {
      get: {
        tags: ["Users"],
        summary: "List notifications",
        security: bearerAuth,
        parameters: [
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", default: 20 } },
          { name: "unread", in: "query", schema: { type: "string", enum: ["true", "false"] } },
        ],
        responses: { "200": { description: "Notifications list with pagination" } },
      },
    },
    "/users/notifications/{id}/read": {
      put: {
        tags: ["Users"],
        summary: "Mark notification as read",
        security: bearerAuth,
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Notification marked as read" } },
      },
    },
    "/users/notifications/read-all": {
      put: {
        tags: ["Users"],
        summary: "Mark all notifications as read",
        security: bearerAuth,
        responses: { "200": { description: "All notifications marked as read" } },
      },
    },
    "/users/activity": {
      get: {
        tags: ["Users"],
        summary: "Get activity history",
        security: bearerAuth,
        parameters: [
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", default: 20 } },
        ],
        responses: { "200": { description: "Activity history with pagination" } },
      },
    },

    // ==================== COMMUNITIES ====================
    "/communities": {
      get: {
        tags: ["Communities"],
        summary: "List communities (public, paginated, filterable)",
        parameters: [
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", default: 20 } },
          { name: "search", in: "query", schema: { type: "string" } },
          { name: "membershipType", in: "query", schema: { type: "string", enum: ["OPEN", "APPROVAL", "INVITE_ONLY"] } },
          { name: "categoryId", in: "query", schema: { type: "string" } },
          { name: "city", in: "query", schema: { type: "string" } },
          { name: "province", in: "query", schema: { type: "string" } },
          { name: "tag", in: "query", schema: { type: "string" } },
          { name: "orderBy", in: "query", schema: { type: "string", enum: ["createdAt", "name", "memberCount"] } },
          { name: "sort", in: "query", schema: { type: "string", enum: ["asc", "desc"], default: "desc" } },
        ],
        responses: { "200": { description: "Community list with pagination" } },
      },
      post: {
        tags: ["Communities"],
        summary: "Create a new community (starts as DRAFT)",
        security: bearerAuth,
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "description", "membershipType"],
                properties: {
                  name: { type: "string" },
                  description: { type: "string" },
                  location: { type: "string" },
                  address: { type: "string" },
                  website: { type: "string" },
                  membershipType: { type: "string", enum: ["OPEN", "APPROVAL", "INVITE_ONLY"] },
                  visibility: { type: "string", enum: ["PUBLIC", "PRIVATE"] },
                  categoryIds: { type: "array", items: { type: "string" } },
                  tags: { type: "array", items: { type: "string" } },
                  customCategory: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          "201": { description: "Community created as draft" },
        },
      },
    },
    "/communities/featured/list": {
      get: {
        tags: ["Communities"],
        summary: "Get featured communities (top by member count)",
        responses: { "200": { description: "Featured communities" } },
      },
    },
    "/communities/new/list": {
      get: {
        tags: ["Communities"],
        summary: "Get newest communities",
        responses: { "200": { description: "Newest communities" } },
      },
    },
    "/communities/popular/list": {
      get: {
        tags: ["Communities"],
        summary: "Get popular communities (by member count)",
        responses: { "200": { description: "Popular communities" } },
      },
    },
    "/communities/meta/provinces": {
      get: {
        tags: ["Communities"],
        summary: "List distinct provinces from communities",
        responses: { "200": { description: "Province list" } },
      },
    },
    "/communities/my/submissions": {
      get: {
        tags: ["Communities"],
        summary: "List user's community submissions",
        security: bearerAuth,
        parameters: [
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", default: 10 } },
          { name: "status", in: "query", schema: { type: "string" } },
        ],
        responses: { "200": { description: "User's submissions with pagination" } },
      },
    },
    "/communities/{slug}": {
      get: {
        tags: ["Communities"],
        summary: "Get community detail by slug",
        parameters: [{ name: "slug", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": { description: "Community detail" },
          "403": { description: "Private community, membership required" },
          "404": { description: "Not found" },
        },
      },
    },
    "/communities/{communityId}": {
      patch: {
        tags: ["Communities"],
        summary: "Update community (owner, draft/revision only)",
        security: bearerAuth,
        parameters: [{ name: "communityId", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          content: { "application/json": { schema: { type: "object" } } },
        },
        responses: { "200": { description: "Community updated" } },
      },
      put: {
        tags: ["Communities"],
        summary: "Update community (admin/owner, approved status)",
        security: bearerAuth,
        parameters: [{ name: "communityId", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          content: { "application/json": { schema: { type: "object" } } },
        },
        responses: { "200": { description: "Community updated" } },
      },
    },
    "/communities/{communityId}/submit": {
      post: {
        tags: ["Communities"],
        summary: "Submit community for admin review",
        security: bearerAuth,
        parameters: [{ name: "communityId", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Submitted for review" } },
      },
    },
    "/communities/{communityId}/archive": {
      post: {
        tags: ["Communities"],
        summary: "Archive community (owner only)",
        security: bearerAuth,
        parameters: [{ name: "communityId", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Community archived" } },
      },
    },
    "/communities/{communityId}/dashboard": {
      get: {
        tags: ["Communities"],
        summary: "Get community dashboard (admin/owner)",
        security: bearerAuth,
        parameters: [{ name: "communityId", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Dashboard data" } },
      },
    },
    "/communities/{communityId}/insight": {
      get: {
        tags: ["Communities"],
        summary: "Get community insights & analytics (admin)",
        security: bearerAuth,
        parameters: [{ name: "communityId", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Insight data" } },
      },
    },
    "/communities/{communityId}/profile": {
      put: {
        tags: ["Communities"],
        summary: "Update community profile (admin)",
        security: bearerAuth,
        parameters: [{ name: "communityId", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: { name: { type: "string" }, description: { type: "string" }, location: { type: "string" }, website: { type: "string" } },
              },
            },
          },
        },
        responses: { "200": { description: "Profile updated" } },
      },
    },
    "/communities/{communityId}/banner": {
      put: {
        tags: ["Communities"],
        summary: "Update community banner (admin)",
        security: bearerAuth,
        parameters: [{ name: "communityId", in: "path", required: true, schema: { type: "string" } }],
        requestBody: { content: { "application/json": { schema: { type: "object", properties: { banner: { type: "string" } } } } } },
        responses: { "200": { description: "Banner updated" } },
      },
    },
    "/communities/{communityId}/logo": {
      put: {
        tags: ["Communities"],
        summary: "Update community logo (admin)",
        security: bearerAuth,
        parameters: [{ name: "communityId", in: "path", required: true, schema: { type: "string" } }],
        requestBody: { content: { "application/json": { schema: { type: "object", properties: { logo: { type: "string" } } } } } },
        responses: { "200": { description: "Logo updated" } },
      },
    },
    "/communities/{communityId}/settings": {
      get: {
        tags: ["Communities"],
        summary: "Get community settings (admin)",
        security: bearerAuth,
        parameters: [{ name: "communityId", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Settings" } },
      },
      put: {
        tags: ["Communities"],
        summary: "Update community settings (admin)",
        security: bearerAuth,
        parameters: [{ name: "communityId", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  allowMemberPost: { type: "boolean" },
                  requireApproval: { type: "boolean" },
                  showMemberList: { type: "boolean" },
                  showEventList: { type: "boolean" },
                },
              },
            },
          },
        },
        responses: { "200": { description: "Settings updated" } },
      },
    },
    "/communities/{communityId}/join": {
      post: {
        tags: ["Communities"],
        summary: "Join community (or submit join request for approval-type)",
        security: bearerAuth,
        parameters: [{ name: "communityId", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          content: { "application/json": { schema: { type: "object", properties: { message: { type: "string" } } } } },
        },
        responses: { "200": { description: "Joined or request submitted" }, "201": { description: "Join request created" } },
      },
    },
    "/communities/{communityId}/leave": {
      post: {
        tags: ["Communities"],
        summary: "Leave community (owner cannot leave)",
        security: bearerAuth,
        parameters: [{ name: "communityId", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Left community" } },
      },
    },
    "/communities/{communityId}/join-requests": {
      get: {
        tags: ["Communities"],
        summary: "List join requests (admin)",
        security: bearerAuth,
        parameters: [
          { name: "communityId", in: "path", required: true, schema: { type: "string" } },
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", default: 20 } },
          { name: "search", in: "query", schema: { type: "string" } },
          { name: "status", in: "query", schema: { type: "string", default: "PENDING" } },
        ],
        responses: { "200": { description: "Join requests with pagination" } },
      },
    },
    "/communities/{communityId}/join-requests/{requestId}": {
      put: {
        tags: ["Communities"],
        summary: "Approve or reject join request (admin)",
        security: bearerAuth,
        parameters: [
          { name: "communityId", in: "path", required: true, schema: { type: "string" } },
          { name: "requestId", in: "path", required: true, schema: { type: "string" } },
        ],
        requestBody: {
          content: {
            "application/json": {
              schema: { type: "object", required: ["action"], properties: { action: { type: "string", enum: ["approve", "reject"] } } },
            },
          },
        },
        responses: { "200": { description: "Request processed" } },
      },
    },
    "/communities/{communityId}/members": {
      get: {
        tags: ["Communities"],
        summary: "List community members",
        security: bearerAuth,
        parameters: [
          { name: "communityId", in: "path", required: true, schema: { type: "string" } },
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", default: 20 } },
          { name: "search", in: "query", schema: { type: "string" } },
          { name: "role", in: "query", schema: { type: "string" } },
        ],
        responses: { "200": { description: "Members with pagination" } },
      },
    },
    "/communities/{communityId}/members/{memberId}": {
      put: {
        tags: ["Communities"],
        summary: "Change member role (owner only)",
        security: bearerAuth,
        parameters: [
          { name: "communityId", in: "path", required: true, schema: { type: "string" } },
          { name: "memberId", in: "path", required: true, schema: { type: "string" } },
        ],
        requestBody: {
          content: { "application/json": { schema: { type: "object", required: ["role"], properties: { role: { type: "string" } } } } },
        },
        responses: { "200": { description: "Role changed" } },
      },
      delete: {
        tags: ["Communities"],
        summary: "Remove member from community (admin)",
        security: bearerAuth,
        parameters: [
          { name: "communityId", in: "path", required: true, schema: { type: "string" } },
          { name: "memberId", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: { "200": { description: "Member removed" } },
      },
    },

    // ==================== ORGANIZATIONS ====================
    "/organizations": {
      get: {
        tags: ["Organizations"],
        summary: "List organizations (public, paginated)",
        parameters: [
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", default: 20 } },
          { name: "search", in: "query", schema: { type: "string" } },
          { name: "categoryId", in: "query", schema: { type: "string" } },
          { name: "orderBy", in: "query", schema: { type: "string" } },
          { name: "sort", in: "query", schema: { type: "string", enum: ["asc", "desc"] } },
        ],
        responses: { "200": { description: "Organizations list" } },
      },
      post: {
        tags: ["Organizations"],
        summary: "Create organization (DRAFT)",
        security: bearerAuth,
        requestBody: {
          required: true,
          content: { "application/json": { schema: { type: "object", required: ["name", "description"], properties: { name: { type: "string" }, description: { type: "string" }, categoryIds: { type: "array", items: { type: "string" } }, tags: { type: "array", items: { type: "string" } } } } } },
        },
        responses: { "201": { description: "Organization created" } },
      },
    },
    "/organizations/my/submissions": {
      get: {
        tags: ["Organizations"],
        summary: "List user's organization submissions",
        security: bearerAuth,
        responses: { "200": { description: "Submissions list" } },
      },
    },
    "/organizations/{slug}": {
      get: {
        tags: ["Organizations"],
        summary: "Get organization by slug",
        parameters: [{ name: "slug", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Organization detail" }, "404": { description: "Not found" } },
      },
    },
    "/organizations/{organizationId}": {
      patch: {
        tags: ["Organizations"],
        summary: "Update organization (owner, draft/revision only)",
        security: bearerAuth,
        parameters: [{ name: "organizationId", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Organization updated" } },
      },
      put: {
        tags: ["Organizations"],
        summary: "Update organization (admin/owner)",
        security: bearerAuth,
        parameters: [{ name: "organizationId", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Organization updated" } },
      },
    },
    "/organizations/{organizationId}/submit": {
      post: {
        tags: ["Organizations"],
        summary: "Submit organization for review",
        security: bearerAuth,
        parameters: [{ name: "organizationId", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Submitted" } },
      },
    },
    "/organizations/{organizationId}/archive": {
      post: {
        tags: ["Organizations"],
        summary: "Archive organization (owner)",
        security: bearerAuth,
        parameters: [{ name: "organizationId", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Archived" } },
      },
    },
    "/organizations/{organizationId}/dashboard": {
      get: {
        tags: ["Organizations"],
        summary: "Get organization dashboard (admin)",
        security: bearerAuth,
        parameters: [{ name: "organizationId", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Dashboard data" } },
      },
    },
    "/organizations/{organizationId}/insight": {
      get: {
        tags: ["Organizations"],
        summary: "Get organization insights (admin)",
        security: bearerAuth,
        parameters: [{ name: "organizationId", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Insight data" } },
      },
    },
    "/organizations/{organizationId}/join": {
      post: {
        tags: ["Organizations"],
        summary: "Join organization",
        security: bearerAuth,
        parameters: [{ name: "organizationId", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Joined" }, "201": { description: "Request submitted" } },
      },
    },
    "/organizations/{organizationId}/leave": {
      post: {
        tags: ["Organizations"],
        summary: "Leave organization",
        security: bearerAuth,
        parameters: [{ name: "organizationId", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Left" } },
      },
    },
    "/organizations/{organizationId}/join-requests": {
      get: {
        tags: ["Organizations"],
        summary: "List join requests (admin)",
        security: bearerAuth,
        parameters: [{ name: "organizationId", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Join requests" } },
      },
    },
    "/organizations/{organizationId}/join-requests/{requestId}": {
      put: {
        tags: ["Organizations"],
        summary: "Approve/reject join request (admin)",
        security: bearerAuth,
        parameters: [
          { name: "organizationId", in: "path", required: true, schema: { type: "string" } },
          { name: "requestId", in: "path", required: true, schema: { type: "string" } },
        ],
        requestBody: { content: { "application/json": { schema: { type: "object", properties: { action: { type: "string", enum: ["approve", "reject"] } } } } } },
        responses: { "200": { description: "Request processed" } },
      },
    },
    "/organizations/{organizationId}/members": {
      get: {
        tags: ["Organizations"],
        summary: "List organization members",
        security: bearerAuth,
        parameters: [{ name: "organizationId", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Members list" } },
      },
    },
    "/organizations/{organizationId}/members/{memberId}": {
      delete: {
        tags: ["Organizations"],
        summary: "Remove member (admin)",
        security: bearerAuth,
        parameters: [
          { name: "organizationId", in: "path", required: true, schema: { type: "string" } },
          { name: "memberId", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: { "200": { description: "Member removed" } },
      },
    },
    "/organizations/{organizationId}/members/{memberId}/role": {
      put: {
        tags: ["Organizations"],
        summary: "Change member role (owner only)",
        security: bearerAuth,
        parameters: [
          { name: "organizationId", in: "path", required: true, schema: { type: "string" } },
          { name: "memberId", in: "path", required: true, schema: { type: "string" } },
        ],
        requestBody: { content: { "application/json": { schema: { type: "object", required: ["role"], properties: { role: { type: "string" } } } } } },
        responses: { "200": { description: "Role changed" } },
      },
    },

    // ==================== EVENTS ====================
    "/events": {
      get: {
        tags: ["Events"],
        summary: "List events (public, paginated, filterable)",
        parameters: [
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", default: 20 } },
          { name: "search", in: "query", schema: { type: "string" } },
          { name: "communityId", in: "query", schema: { type: "string" } },
          { name: "organizationId", in: "query", schema: { type: "string" } },
          { name: "status", in: "query", schema: { type: "string" } },
          { name: "upcoming", in: "query", schema: { type: "boolean" } },
          { name: "orderBy", in: "query", schema: { type: "string", enum: ["createdAt", "eventDate", "title"] } },
          { name: "sort", in: "query", schema: { type: "string", enum: ["asc", "desc"] } },
        ],
        responses: { "200": { description: "Events list" } },
      },
      post: {
        tags: ["Events"],
        summary: "Create event (community/org manager)",
        security: bearerAuth,
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["title", "description", "eventDate", "location"],
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  location: { type: "string" },
                  locationType: { type: "string" },
                  isOnline: { type: "boolean" },
                  eventDate: { type: "string", format: "date-time" },
                  endDate: { type: "string", format: "date-time" },
                  quota: { type: "integer" },
                  allowWaitlist: { type: "boolean" },
                  visibility: { type: "string", enum: ["PUBLIC", "PRIVATE"] },
                  communityId: { type: "string" },
                  organizationId: { type: "string" },
                  categoryIds: { type: "array", items: { type: "string" } },
                },
              },
            },
          },
        },
        responses: { "201": { description: "Event created" } },
      },
    },
    "/events/my/created": {
      get: {
        tags: ["Events"],
        summary: "List events created by current user",
        security: bearerAuth,
        parameters: [
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", default: 20 } },
          { name: "status", in: "query", schema: { type: "string" } },
        ],
        responses: { "200": { description: "Created events" } },
      },
    },
    "/events/my/registered": {
      get: {
        tags: ["Events"],
        summary: "List events registered by current user",
        security: bearerAuth,
        parameters: [
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", default: 20 } },
          { name: "status", in: "query", schema: { type: "string" } },
        ],
        responses: { "200": { description: "Registered events" } },
      },
    },
    "/events/{slug}": {
      get: {
        tags: ["Events"],
        summary: "Get event by slug",
        parameters: [{ name: "slug", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Event detail" }, "404": { description: "Not found" } },
      },
    },
    "/events/{eventId}": {
      patch: {
        tags: ["Events"],
        summary: "Update event",
        security: bearerAuth,
        parameters: [{ name: "eventId", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Event updated" } },
      },
      delete: {
        tags: ["Events"],
        summary: "Delete event (soft, DRAFT/CANCELLED/COMPLETED only)",
        security: bearerAuth,
        parameters: [{ name: "eventId", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Event deleted" } },
      },
    },
    "/events/{eventId}/publish": {
      post: {
        tags: ["Events"],
        summary: "Publish event",
        security: bearerAuth,
        parameters: [{ name: "eventId", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Event published" } },
      },
    },
    "/events/{eventId}/open-registration": {
      post: {
        tags: ["Events"],
        summary: "Open event registration",
        security: bearerAuth,
        parameters: [{ name: "eventId", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Registration opened" } },
      },
    },
    "/events/{eventId}/close-registration": {
      post: {
        tags: ["Events"],
        summary: "Close event registration",
        security: bearerAuth,
        parameters: [{ name: "eventId", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Registration closed" } },
      },
    },
    "/events/{eventId}/start": {
      post: {
        tags: ["Events"],
        summary: "Start event (set to ONGOING)",
        security: bearerAuth,
        parameters: [{ name: "eventId", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Event started" } },
      },
    },
    "/events/{eventId}/complete": {
      post: {
        tags: ["Events"],
        summary: "Complete event",
        security: bearerAuth,
        parameters: [{ name: "eventId", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Event completed" } },
      },
    },
    "/events/{eventId}/cancel": {
      post: {
        tags: ["Events"],
        summary: "Cancel event (cancels all registrations, notifies users)",
        security: bearerAuth,
        parameters: [{ name: "eventId", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Event cancelled" } },
      },
    },
    "/events/{eventId}/archive": {
      post: {
        tags: ["Events"],
        summary: "Archive event",
        security: bearerAuth,
        parameters: [{ name: "eventId", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Event archived" } },
      },
    },
    "/events/{eventId}/duplicate": {
      post: {
        tags: ["Events"],
        summary: "Duplicate event as draft",
        security: bearerAuth,
        parameters: [{ name: "eventId", in: "path", required: true, schema: { type: "string" } }],
        responses: { "201": { description: "Event duplicated" } },
      },
    },
    "/events/{eventId}/register": {
      post: {
        tags: ["Events"],
        summary: "Register for event",
        security: bearerAuth,
        parameters: [{ name: "eventId", in: "path", required: true, schema: { type: "string" } }],
        responses: { "201": { description: "Registered" }, "409": { description: "Already registered" } },
      },
      delete: {
        tags: ["Events"],
        summary: "Cancel event registration",
        security: bearerAuth,
        parameters: [{ name: "eventId", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Registration cancelled" } },
      },
    },
    "/events/{eventId}/participants": {
      get: {
        tags: ["Events"],
        summary: "List event participants (organizer)",
        security: bearerAuth,
        parameters: [
          { name: "eventId", in: "path", required: true, schema: { type: "string" } },
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", default: 20 } },
          { name: "search", in: "query", schema: { type: "string" } },
          { name: "status", in: "query", schema: { type: "string" } },
        ],
        responses: { "200": { description: "Participants list" } },
      },
    },
    "/events/{eventId}/participants/{participantId}/check-in": {
      post: {
        tags: ["Events"],
        summary: "Check in participant",
        security: bearerAuth,
        parameters: [
          { name: "eventId", in: "path", required: true, schema: { type: "string" } },
          { name: "participantId", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: { "200": { description: "Checked in" } },
      },
    },
    "/events/{eventId}/participants/{participantId}/check-out": {
      post: {
        tags: ["Events"],
        summary: "Check out participant",
        security: bearerAuth,
        parameters: [
          { name: "eventId", in: "path", required: true, schema: { type: "string" } },
          { name: "participantId", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: { "200": { description: "Checked out" } },
      },
    },
    "/events/{eventId}/participants/{participantId}/approve": {
      patch: {
        tags: ["Events"],
        summary: "Approve pending participant",
        security: bearerAuth,
        parameters: [
          { name: "eventId", in: "path", required: true, schema: { type: "string" } },
          { name: "participantId", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: { "200": { description: "Participant approved" } },
      },
    },
    "/events/{eventId}/participants/{participantId}/reject": {
      patch: {
        tags: ["Events"],
        summary: "Reject pending participant",
        security: bearerAuth,
        parameters: [
          { name: "eventId", in: "path", required: true, schema: { type: "string" } },
          { name: "participantId", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: { "200": { description: "Participant rejected" } },
      },
    },
    "/events/{eventId}/participants/export": {
      get: {
        tags: ["Events"],
        summary: "Export participants as JSON",
        security: bearerAuth,
        parameters: [{ name: "eventId", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Exported participant data" } },
      },
    },
    "/events/{eventId}/dashboard": {
      get: {
        tags: ["Events"],
        summary: "Event dashboard with stats (organizer)",
        security: bearerAuth,
        parameters: [{ name: "eventId", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Dashboard data with registration trends" } },
      },
    },

    // ==================== VOLUNTEER ====================
    "/volunteer": {
      get: {
        tags: ["Volunteer"],
        summary: "List volunteer opportunities (public)",
        parameters: [
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", default: 20 } },
          { name: "search", in: "query", schema: { type: "string" } },
          { name: "status", in: "query", schema: { type: "string" } },
          { name: "eventId", in: "query", schema: { type: "string" } },
        ],
        responses: { "200": { description: "Opportunities list" } },
      },
      post: {
        tags: ["Volunteer"],
        summary: "Create volunteer opportunity (organizer)",
        security: bearerAuth,
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["eventId", "title", "description"],
                properties: {
                  eventId: { type: "string" },
                  title: { type: "string" },
                  description: { type: "string" },
                  registrationDeadline: { type: "string", format: "date-time" },
                  briefingDate: { type: "string", format: "date-time" },
                  activityStartDate: { type: "string", format: "date-time" },
                  activityEndDate: { type: "string", format: "date-time" },
                  positions: {
                    type: "array",
                    items: {
                      type: "object",
                      required: ["name", "requiredQty"],
                      properties: {
                        name: { type: "string" },
                        description: { type: "string" },
                        requiredQty: { type: "integer" },
                        requirement: { type: "string" },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        responses: { "201": { description: "Opportunity created" } },
      },
    },
    "/volunteer/my/applications": {
      get: {
        tags: ["Volunteer"],
        summary: "List user's volunteer applications",
        security: bearerAuth,
        parameters: [
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", default: 20 } },
          { name: "status", in: "query", schema: { type: "string" } },
        ],
        responses: { "200": { description: "Applications list" } },
      },
    },
    "/volunteer/dashboard/{eventId}": {
      get: {
        tags: ["Volunteer"],
        summary: "Volunteer dashboard for an event (organizer)",
        security: bearerAuth,
        parameters: [{ name: "eventId", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Volunteer dashboard stats" } },
      },
    },
    "/volunteer/detail/{slug}": {
      get: {
        tags: ["Volunteer"],
        summary: "Get volunteer opportunity by slug",
        parameters: [{ name: "slug", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Opportunity detail" }, "404": { description: "Not found" } },
      },
    },
    "/volunteer/{opportunityId}": {
      patch: {
        tags: ["Volunteer"],
        summary: "Update volunteer opportunity",
        security: bearerAuth,
        parameters: [{ name: "opportunityId", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Opportunity updated" } },
      },
      delete: {
        tags: ["Volunteer"],
        summary: "Delete volunteer opportunity (soft)",
        security: bearerAuth,
        parameters: [{ name: "opportunityId", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Opportunity deleted" } },
      },
    },
    "/volunteer/{opportunityId}/publish": {
      post: {
        tags: ["Volunteer"],
        summary: "Publish volunteer opportunity",
        security: bearerAuth,
        parameters: [{ name: "opportunityId", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Published" } },
      },
    },
    "/volunteer/{opportunityId}/close": {
      post: {
        tags: ["Volunteer"],
        summary: "Close volunteer opportunity",
        security: bearerAuth,
        parameters: [{ name: "opportunityId", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Closed" } },
      },
    },
    "/volunteer/{opportunityId}/archive": {
      post: {
        tags: ["Volunteer"],
        summary: "Archive volunteer opportunity",
        security: bearerAuth,
        parameters: [{ name: "opportunityId", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Archived" } },
      },
    },
    "/volunteer/{opportunityId}/apply": {
      post: {
        tags: ["Volunteer"],
        summary: "Apply for volunteer position",
        security: bearerAuth,
        parameters: [{ name: "opportunityId", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["positionId", "motivation", "agreement"],
                properties: {
                  positionId: { type: "string" },
                  motivation: { type: "string" },
                  experience: { type: "string" },
                  availability: { type: "string" },
                  agreement: { type: "boolean" },
                },
              },
            },
          },
        },
        responses: { "201": { description: "Application submitted" } },
      },
      delete: {
        tags: ["Volunteer"],
        summary: "Cancel volunteer application",
        security: bearerAuth,
        parameters: [{ name: "opportunityId", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Application cancelled" } },
      },
    },
    "/volunteer/{opportunityId}/applications": {
      get: {
        tags: ["Volunteer"],
        summary: "List applications (organizer)",
        security: bearerAuth,
        parameters: [
          { name: "opportunityId", in: "path", required: true, schema: { type: "string" } },
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", default: 20 } },
          { name: "status", in: "query", schema: { type: "string" } },
          { name: "positionId", in: "query", schema: { type: "string" } },
        ],
        responses: { "200": { description: "Applications list" } },
      },
    },
    "/volunteer/applications/{applicationId}/accept": {
      patch: {
        tags: ["Volunteer"],
        summary: "Accept volunteer application",
        security: bearerAuth,
        parameters: [{ name: "applicationId", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          content: { "application/json": { schema: { type: "object", properties: { action: { type: "string", enum: ["ACCEPTED"] }, reviewNote: { type: "string" } } } } },
        },
        responses: { "200": { description: "Application accepted" } },
      },
    },
    "/volunteer/applications/{applicationId}/reject": {
      patch: {
        tags: ["Volunteer"],
        summary: "Reject volunteer application",
        security: bearerAuth,
        parameters: [{ name: "applicationId", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          content: { "application/json": { schema: { type: "object", properties: { action: { type: "string", enum: ["REJECTED"] }, reviewNote: { type: "string" } } } } },
        },
        responses: { "200": { description: "Application rejected" } },
      },
    },
    "/volunteer/applications/{applicationId}/assign": {
      patch: {
        tags: ["Volunteer"],
        summary: "Assign volunteer to shift",
        security: bearerAuth,
        parameters: [{ name: "applicationId", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  picUserId: { type: "string" },
                  shiftStart: { type: "string", format: "date-time" },
                  shiftEnd: { type: "string", format: "date-time" },
                  notes: { type: "string" },
                },
              },
            },
          },
        },
        responses: { "200": { description: "Volunteer assigned" } },
      },
    },
    "/volunteer/attendance/{assignmentId}/check-in": {
      patch: {
        tags: ["Volunteer"],
        summary: "Check in volunteer",
        security: bearerAuth,
        parameters: [{ name: "assignmentId", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Checked in" } },
      },
    },
    "/volunteer/attendance/{assignmentId}/check-out": {
      patch: {
        tags: ["Volunteer"],
        summary: "Check out volunteer",
        security: bearerAuth,
        parameters: [{ name: "assignmentId", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Checked out" } },
      },
    },

    // ==================== REPORTS ====================
    "/reports": {
      post: {
        tags: ["Reports"],
        summary: "Create a report",
        security: bearerAuth,
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["targetType", "targetId", "reason"],
                properties: {
                  targetType: { type: "string", enum: ["USER", "COMMUNITY", "EVENT", "ORGANIZATION"] },
                  targetId: { type: "string" },
                  reason: { type: "string" },
                  description: { type: "string" },
                },
              },
            },
          },
        },
        responses: { "201": { description: "Report created" }, "409": { description: "Already reported" } },
      },
    },
    "/reports/my": {
      get: {
        tags: ["Reports"],
        summary: "List own reports",
        security: bearerAuth,
        parameters: [
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", default: 20 } },
        ],
        responses: { "200": { description: "Reports list" } },
      },
    },
    "/reports/{reportId}": {
      get: {
        tags: ["Reports"],
        summary: "Get report by ID (own reports only)",
        security: bearerAuth,
        parameters: [{ name: "reportId", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Report detail" }, "403": { description: "Not your report" } },
      },
    },

    // ==================== CATEGORIES ====================
    "/categories": {
      get: {
        tags: ["Categories"],
        summary: "List active categories (public)",
        responses: { "200": { description: "Categories list" } },
      },
      post: {
        tags: ["Categories"],
        summary: "Create category (admin only)",
        security: bearerAuth,
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name"],
                properties: { name: { type: "string" }, description: { type: "string" }, icon: { type: "string" }, type: { type: "string", enum: ["COMMUNITY", "EVENT"] } },
              },
            },
          },
        },
        responses: { "201": { description: "Category created" } },
      },
    },
    "/categories/{categoryId}": {
      put: {
        tags: ["Categories"],
        summary: "Update category (admin)",
        security: bearerAuth,
        parameters: [{ name: "categoryId", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Category updated" } },
      },
      delete: {
        tags: ["Categories"],
        summary: "Deactivate category (admin)",
        security: bearerAuth,
        parameters: [{ name: "categoryId", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Category deactivated" } },
      },
    },

    // ==================== MASTER DATA ====================
    "/master-data/countries": {
      get: {
        tags: ["Master Data"],
        summary: "List countries",
        responses: { "200": { description: "Country list" } },
      },
    },
    "/master-data/provinces": {
      get: {
        tags: ["Master Data"],
        summary: "List provinces (optionally filtered by country)",
        parameters: [{ name: "country", in: "query", schema: { type: "string" } }],
        responses: { "200": { description: "Province list" } },
      },
    },
    "/master-data/cities": {
      get: {
        tags: ["Master Data"],
        summary: "List cities (optionally filtered by province)",
        parameters: [{ name: "province", in: "query", schema: { type: "string" } }],
        responses: { "200": { description: "City list" } },
      },
    },
    "/master-data/districts": {
      get: {
        tags: ["Master Data"],
        summary: "List districts (optionally filtered by city)",
        parameters: [{ name: "city", in: "query", schema: { type: "string" } }],
        responses: { "200": { description: "District list" } },
      },
    },
    "/master-data/villages": {
      get: {
        tags: ["Master Data"],
        summary: "List villages (optionally filtered by district)",
        parameters: [{ name: "district", in: "query", schema: { type: "string" } }],
        responses: { "200": { description: "Village list" } },
      },
    },
    "/master-data/postal-codes": {
      get: {
        tags: ["Master Data"],
        summary: "Lookup postal codes by village/district",
        parameters: [
          { name: "village", in: "query", schema: { type: "string" } },
          { name: "district", in: "query", schema: { type: "string" } },
        ],
        responses: { "200": { description: "Postal codes list" } },
      },
    },

    // ==================== UPLOAD ====================
    "/upload": {
      post: {
        tags: ["Upload"],
        summary: "Upload image (JPEG, PNG, GIF, WebP, max 5MB)",
        security: bearerAuth,
        requestBody: {
          required: true,
          content: { "multipart/form-data": { schema: { type: "object", required: ["file"], properties: { file: { type: "string", format: "binary" } } } } },
        },
        responses: { "200": { description: "File uploaded, returns data URL" } },
      },
    },

    // ==================== ORG STRUCTURE ====================
    "/organization-structure": {
      get: {
        tags: ["Organization Structure"],
        summary: "Get full org structure (public, hierarchical)",
        responses: { "200": { description: "Org structure tree" } },
      },
    },
    "/organization-structure/flat": {
      get: {
        tags: ["Organization Structure"],
        summary: "Get flat org structure (public)",
        responses: { "200": { description: "Flat structure list" } },
      },
    },
    "/organization-structure/admin/all": {
      get: {
        tags: ["Organization Structure"],
        summary: "Get all structures including inactive (super admin)",
        security: bearerAuth,
        responses: { "200": { description: "All structures" } },
      },
    },
    "/organization-structure/admin": {
      post: {
        tags: ["Organization Structure"],
        summary: "Create structure node (super admin)",
        security: bearerAuth,
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["title"],
                properties: { title: { type: "string" }, description: { type: "string" }, imageUrl: { type: "string" }, parentId: { type: "string" }, position: { type: "integer" } },
              },
            },
          },
        },
        responses: { "201": { description: "Structure node created" } },
      },
    },
    "/organization-structure/admin/{id}": {
      put: {
        tags: ["Organization Structure"],
        summary: "Update structure node (super admin)",
        security: bearerAuth,
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Node updated" } },
      },
      delete: {
        tags: ["Organization Structure"],
        summary: "Delete structure node (super admin)",
        security: bearerAuth,
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Node deleted" } },
      },
    },
    "/organization-structure/admin/{structureId}/members": {
      post: {
        tags: ["Organization Structure"],
        summary: "Add member to structure (super admin)",
        security: bearerAuth,
        parameters: [{ name: "structureId", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "position"],
                properties: { name: { type: "string" }, position: { type: "string" }, email: { type: "string" }, phone: { type: "string" }, avatar: { type: "string" }, bio: { type: "string" }, order: { type: "integer" } },
              },
            },
          },
        },
        responses: { "201": { description: "Member added" } },
      },
    },
    "/organization-structure/admin/members/{memberId}": {
      put: {
        tags: ["Organization Structure"],
        summary: "Update structure member (super admin)",
        security: bearerAuth,
        parameters: [{ name: "memberId", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Member updated" } },
      },
      delete: {
        tags: ["Organization Structure"],
        summary: "Delete structure member (super admin)",
        security: bearerAuth,
        parameters: [{ name: "memberId", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Member deleted" } },
      },
    },

    // ==================== CONTACT MESSAGES ====================
    "/contact-messages": {
      post: {
        tags: ["Contact Messages"],
        summary: "Submit contact message (guest)",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "email", "subject", "message"],
                properties: {
                  name: { type: "string" },
                  email: { type: "string", format: "email" },
                  subject: { type: "string" },
                  message: { type: "string" },
                  category: { type: "string", enum: ["GENERAL", "FEEDBACK", "COMPLAINT", "SUGGESTION", "PARTNERSHIP", "OTHER"] },
                },
              },
            },
          },
        },
        responses: { "201": { description: "Message submitted" } },
      },
    },
    "/contact-messages/admin": {
      get: {
        tags: ["Contact Messages"],
        summary: "List contact messages (admin)",
        security: bearerAuth,
        parameters: [
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", default: 20 } },
          { name: "status", in: "query", schema: { type: "string" } },
          { name: "search", in: "query", schema: { type: "string" } },
        ],
        responses: { "200": { description: "Messages list" } },
      },
    },
    "/contact-messages/admin/{id}": {
      get: {
        tags: ["Contact Messages"],
        summary: "Get contact message (admin)",
        security: bearerAuth,
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Message detail" } },
      },
      put: {
        tags: ["Contact Messages"],
        summary: "Update contact message status/reply (admin)",
        security: bearerAuth,
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          content: { "application/json": { schema: { type: "object", properties: { status: { type: "string" }, reply: { type: "string" } } } } },
        },
        responses: { "200": { description: "Message updated" } },
      },
      delete: {
        tags: ["Contact Messages"],
        summary: "Delete contact message (admin)",
        security: bearerAuth,
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Message deleted" } },
      },
    },

    // ==================== ADMIN ====================
    "/admin/dashboard": {
      get: {
        tags: ["Admin"],
        summary: "Platform dashboard stats",
        security: bearerAuth,
        responses: { "200": { description: "Dashboard statistics" } },
      },
    },
    "/admin/users": {
      get: {
        tags: ["Admin"],
        summary: "List all users (admin)",
        security: bearerAuth,
        responses: { "200": { description: "Users list with pagination" } },
      },
    },
    "/admin/users/{userId}": {
      get: {
        tags: ["Admin"],
        summary: "Get user detail (admin)",
        security: bearerAuth,
        parameters: [{ name: "userId", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "User detail" } },
      },
      patch: {
        tags: ["Admin"],
        summary: "Update user status/roles (admin)",
        security: bearerAuth,
        parameters: [{ name: "userId", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "User updated" } },
      },
    },
    "/admin/roles": {
      get: {
        tags: ["Admin"],
        summary: "List user roles",
        security: bearerAuth,
        responses: { "200": { description: "Roles list" } },
      },
    },
    "/admin/roles/{userId}": {
      put: {
        tags: ["Admin"],
        summary: "Update user roles (super admin)",
        security: bearerAuth,
        parameters: [{ name: "userId", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          content: { "application/json": { schema: { type: "object", required: ["roles"], properties: { roles: { type: "array", items: { type: "string" } } } } } },
        },
        responses: { "200": { description: "Roles updated" } },
      },
    },
    "/admin/communities": {
      get: {
        tags: ["Admin"],
        summary: "List communities with admin filters",
        security: bearerAuth,
        responses: { "200": { description: "Communities list" } },
      },
    },
    "/admin/communities/{communityId}": {
      patch: {
        tags: ["Admin"],
        summary: "Approve/reject/update community (admin)",
        security: bearerAuth,
        parameters: [{ name: "communityId", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Community updated" } },
      },
    },
    "/admin/organizations": {
      get: {
        tags: ["Admin"],
        summary: "List organizations with admin filters",
        security: bearerAuth,
        responses: { "200": { description: "Organizations list" } },
      },
    },
    "/admin/organizations/{organizationId}": {
      patch: {
        tags: ["Admin"],
        summary: "Approve/reject/update organization (admin)",
        security: bearerAuth,
        parameters: [{ name: "organizationId", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Organization updated" } },
      },
    },
    "/admin/events": {
      get: {
        tags: ["Admin"],
        summary: "List all events (admin)",
        security: bearerAuth,
        responses: { "200": { description: "Events list" } },
      },
    },
    "/admin/volunteers": {
      get: {
        tags: ["Admin"],
        summary: "List all volunteer opportunities (admin)",
        security: bearerAuth,
        responses: { "200": { description: "Volunteer list" } },
      },
    },
    "/admin/reports": {
      get: {
        tags: ["Admin"],
        summary: "List all reports (admin)",
        security: bearerAuth,
        responses: { "200": { description: "Reports list" } },
      },
    },
    "/admin/reports/{reportId}": {
      patch: {
        tags: ["Admin"],
        summary: "Review report (admin)",
        security: bearerAuth,
        parameters: [{ name: "reportId", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          content: { "application/json": { schema: { type: "object", properties: { status: { type: "string" }, reviewNote: { type: "string" } } } } },
        },
        responses: { "200": { description: "Report reviewed" } },
      },
    },
    "/admin/settings": {
      get: {
        tags: ["Admin"],
        summary: "Get platform settings",
        security: bearerAuth,
        responses: { "200": { description: "Settings" } },
      },
      put: {
        tags: ["Admin"],
        summary: "Update platform settings (super admin)",
        security: bearerAuth,
        responses: { "200": { description: "Settings updated" } },
      },
    },
    "/admin/audit": {
      get: {
        tags: ["Admin"],
        summary: "List audit logs (super admin)",
        security: bearerAuth,
        responses: { "200": { description: "Audit logs" } },
      },
    },
    "/admin/notifications": {
      get: {
        tags: ["Admin"],
        summary: "List notifications (admin)",
        security: bearerAuth,
        responses: { "200": { description: "Notifications list" } },
      },
      post: {
        tags: ["Admin"],
        summary: "Send bulk notification (admin)",
        security: bearerAuth,
        responses: { "200": { description: "Notification sent" } },
      },
    },
    "/admin/security": {
      get: {
        tags: ["Admin"],
        summary: "Security overview (super admin)",
        security: bearerAuth,
        responses: { "200": { description: "Security data" } },
      },
    },
    "/admin/cms": {
      get: {
        tags: ["Admin"],
        summary: "List CMS pages/banners (admin)",
        security: bearerAuth,
        responses: { "200": { description: "CMS content" } },
      },
      post: {
        tags: ["Admin"],
        summary: "Create CMS page/banner (admin)",
        security: bearerAuth,
        responses: { "201": { description: "CMS content created" } },
      },
    },
    "/admin/cms/{id}": {
      put: {
        tags: ["Admin"],
        summary: "Update CMS page/banner (admin)",
        security: bearerAuth,
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "CMS content updated" } },
      },
      delete: {
        tags: ["Admin"],
        summary: "Delete CMS page/banner (admin)",
        security: bearerAuth,
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "CMS content deleted" } },
      },
    },
  },
} as const;

export type OpenApiSpec = typeof openApiSpec;
