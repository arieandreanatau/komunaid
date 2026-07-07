# KomunaID REST API v1 Specification

## Overview

- **Base URL:** `/api/v1`
- **Content-Type:** `application/json`
- **Authentication:** Bearer Token (JWT)
- **API Version:** 1.0.0

---

## Health

### GET `/health`

**Description:** Check API health status.

**Auth Required:** No

**Response 200:**

```json
{
  "success": true,
  "data": {
    "status": "ok",
    "timestamp": "2024-01-01T00:00:00.000Z"
  },
  "message": "Service is healthy"
}
```

---

## Conventions

### Response Format

All endpoints return a consistent JSON envelope:

```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully",
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

### Error Format

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}
```

### HTTP Status Codes

| Code | Meaning                                 |
| ---- | --------------------------------------- |
| 200  | Success                                 |
| 201  | Created                                 |
| 204  | No Content                              |
| 400  | Bad Request / Validation Error          |
| 401  | Unauthorized (missing or invalid token) |
| 403  | Forbidden (insufficient permissions)    |
| 404  | Not Found                               |
| 409  | Conflict (duplicate resource)           |
| 422  | Unprocessable Entity                    |
| 429  | Too Many Requests                       |
| 500  | Internal Server Error                   |

### Pagination Parameters

| Parameter | Type    | Default     | Description                            |
| --------- | ------- | ----------- | -------------------------------------- |
| page      | integer | 1           | Page number                            |
| limit     | integer | 20          | Items per page (max 100)               |
| search    | string  | —           | Search query string                    |
| sort      | string  | -created_at | Sort field (prefix `-` for descending) |

---

## 1. Authentication

### 1.1 POST `/auth/register`

**Description:** Register a new user account.

**Auth Required:** No

**Request Body:**

```json
{
  "email": "string (required, valid email)",
  "password": "string (required, min 8 characters)",
  "firstName": "string (optional)",
  "lastName": "string (optional)",
  "username": "string (required, 3-50 chars, alphanumeric + hyphens)"
}
```

**Response 201:**

```json
{
  "success": true,
  "data": {
    "user": { "id": 1, "email": "user@example.com", "username": "johndoe" },
    "accessToken": "jwt_access_token",
    "refreshToken": "jwt_refresh_token"
  },
  "message": "Registration successful. Please verify your email."
}
```

**Errors:** 400 (validation), 409 (email/username taken)

---

### 1.2 POST `/auth/login`

**Description:** Authenticate user and return tokens.

**Auth Required:** No

**Request Body:**

```json
{
  "email": "string (required)",
  "password": "string (required)"
}
```

**Response 200:**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "username": "johndoe",
      "firstName": "John",
      "lastName": "Doe",
      "avatar": "url"
    },
    "accessToken": "jwt_access_token",
    "refreshToken": "jwt_refresh_token"
  },
  "message": "Login successful"
}
```

**Errors:** 400, 401 (invalid credentials), 403 (suspended)

---

### 1.3 POST `/auth/refresh`

**Description:** Refresh access token using refresh token.

**Auth Required:** No (requires refresh token in body)

**Request Body:**

```json
{
  "refreshToken": "string (required)"
}
```

**Response 200:**

```json
{
  "success": true,
  "data": {
    "accessToken": "new_jwt_access_token",
    "refreshToken": "new_jwt_refresh_token"
  },
  "message": "Token refreshed successfully"
}
```

**Errors:** 401 (invalid/expired refresh token)

---

### 1.4 POST `/auth/logout`

**Description:** Invalidate refresh token and log out.

**Auth Required:** Yes

**Request Body:** None

**Response 200:**

```json
{
  "success": true,
  "data": null,
  "message": "Logged out successfully"
}
```

---

### 1.5 POST `/auth/forgot-password`

**Description:** Send password reset email.

**Auth Required:** No

**Request Body:**

```json
{
  "email": "string (required, valid email)"
}
```

**Response 200:**

```json
{
  "success": true,
  "data": null,
  "message": "If the email exists, a reset link has been sent."
}
```

**Note:** Always returns 200 to prevent email enumeration.

---

### 1.6 POST `/auth/reset-password`

**Description:** Reset password using token from email.

**Auth Required:** No

**Request Body:**

```json
{
  "token": "string (required)",
  "password": "string (required, min 8 characters)"
}
```

**Response 200:**

```json
{
  "success": true,
  "data": null,
  "message": "Password reset successful"
}
```

**Errors:** 400 (invalid/expired token)

---

## 2. Profile

### 2.1 GET `/users/me`

**Description:** Get current authenticated user's full profile.

**Auth Required:** Yes

**Response 200:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "user@example.com",
    "username": "johndoe",
    "firstName": "John",
    "lastName": "Doe",
    "avatar": "url",
    "bio": "Hello world",
    "location": "Berlin, Germany",
    "phone": "+49123456789",
    "emailVerified": true,
    "isActive": true,
    "isSuspended": false,
    "interests": ["tech", "music"],
    "roles": [{ "id": 1, "name": "MEMBER", "scope": null, "scopeId": null }],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "Profile retrieved"
}
```

---

### 2.2 PATCH `/users/me`

**Description:** Update current user's profile.

**Auth Required:** Yes

**Request Body:**

```json
{
  "firstName": "string (optional)",
  "lastName": "string (optional)",
  "avatar": "string (optional)",
  "bio": "string (optional, max 500 chars)",
  "location": "string (optional)",
  "phone": "string (optional)",
  "interests": ["string"] (optional)
}
```

**Response 200:**

```json
{
  "success": true,
  "data": { "updated user object" },
  "message": "Profile updated successfully"
}
```

**Errors:** 400 (validation)

---

### 2.3 GET `/users/:username`

**Description:** Get a user's public profile by username.

**Auth Required:** No

**Response 200:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "johndoe",
    "firstName": "John",
    "lastName": "Doe",
    "avatar": "url",
    "bio": "Hello world",
    "location": "Berlin, Germany",
    "interests": ["tech", "music"],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "communitiesCount": 5,
    "organizationsCount": 2
  },
  "message": "User profile retrieved"
}
```

**Errors:** 404 (user not found)

---

## 3. Role Requests

### 3.1 POST `/role-requests`

**Description:** Submit a role upgrade request.

**Auth Required:** Yes

**Request Body:**

```json
{
  "requestedRoleId": "integer (required)",
  "reason": "string (required, min 10 chars)"
}
```

**Response 201:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "userId": 5,
    "requestedRoleId": 3,
    "status": "PENDING",
    "reason": "I manage a community with 500+ members...",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "Role upgrade request submitted"
}
```

**Errors:** 400 (validation), 409 (pending request already exists)

---

### 3.2 GET `/role-requests`

**Description:** List all role upgrade requests (admin only).

**Auth Required:** Yes (PLATFORM_ADMIN+)

**Query Parameters:**

| Parameter | Type    | Default | Description                                   |
| --------- | ------- | ------- | --------------------------------------------- |
| status    | string  | —       | Filter by status: PENDING, APPROVED, REJECTED |
| page      | integer | 1       | Page number                                   |
| limit     | integer | 20      | Items per page                                |

**Response 200:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user": { "id": 5, "username": "johndoe", "email": "john@example.com" },
      "requestedRole": { "id": 3, "name": "COMMUNITY_OWNER" },
      "status": "PENDING",
      "reason": "I manage a community with 500+ members...",
      "reviewedBy": null,
      "reviewedAt": null,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 15, "totalPages": 1 },
  "message": "Role requests retrieved"
}
```

---

### 3.3 PATCH `/role-requests/:id`

**Description:** Approve or reject a role upgrade request (admin only).

**Auth Required:** Yes (PLATFORM_ADMIN+)

**Request Body:**

```json
{
  "status": "APPROVED | REJECTED (required)",
  "reviewNote": "string (optional)"
}
```

**Response 200:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "userId": 5,
    "requestedRoleId": 3,
    "status": "APPROVED",
    "reviewedById": 1,
    "reviewedAt": "2024-01-02T00:00:00.000Z",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-02T00:00:00.000Z"
  },
  "message": "Role request approved"
}
```

**Errors:** 400 (validation), 403 (forbidden), 404 (not found)

**Side Effects:** When approved, automatically creates a user_role_assignment for the user with the requested role.

---

## 4. Communities

### 4.1 GET `/communities`

**Description:** List all active communities.

**Auth Required:** No

**Query Parameters:**

| Parameter      | Type    | Default     | Description                   |
| -------------- | ------- | ----------- | ----------------------------- |
| page           | integer | 1           | Page number                   |
| limit          | integer | 20          | Items per page                |
| search         | string  | —           | Search by name or description |
| sort           | string  | -created_at | Sort field                    |
| category       | string  | —           | Filter by category            |
| status         | string  | APPROVED    | Filter by status (admin only) |
| membershipType | string  | —           | Filter by membership_type     |
| isVerified     | boolean | —           | Filter verified communities   |

**Response 200:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Berlin Tech Meetup",
      "slug": "berlin-tech-meetup",
      "shortDescription": "Monthly tech meetup in Berlin",
      "logo": "url",
      "banner": "url",
      "category": "Technology",
      "location": "Berlin, Germany",
      "membershipType": "open",
      "isVerified": true,
      "status": "APPROVED",
      "owner": { "id": 2, "username": "owner1" },
      "membersCount": 150,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 50, "totalPages": 3 },
  "message": "Communities retrieved"
}
```

---

### 4.2 GET `/communities/:slug`

**Description:** Get a single community by slug.

**Auth Required:** No

**Response 200:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Berlin Tech Meetup",
    "slug": "berlin-tech-meetup",
    "description": "Full markdown description...",
    "shortDescription": "Monthly tech meetup in Berlin",
    "logo": "url",
    "banner": "url",
    "category": "Technology",
    "location": "Berlin, Germany",
    "website": "https://berlin-tech.de",
    "contactEmail": "hello@berlin-tech.de",
    "foundedAt": "2023-01-01",
    "membershipType": "open",
    "maxMembers": null,
    "isVerified": true,
    "status": "APPROVED",
    "owner": { "id": 2, "username": "owner1", "avatar": "url" },
    "members": [
      {
        "id": 2,
        "username": "owner1",
        "avatar": "url",
        "role": "OWNER",
        "joinedAt": "2023-01-01T00:00:00.000Z"
      }
    ],
    "categories": [{ "id": 1, "name": "Technology", "slug": "technology" }],
    "postsCount": 25,
    "eventsCount": 10,
    "membersCount": 150,
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "Community retrieved"
}
```

**Errors:** 404 (not found)

---

### 4.3 POST `/communities`

**Description:** Create a new community.

**Auth Required:** Yes

**Request Body:**

```json
{
  "name": "string (required, 3-100 chars)",
  "description": "string (optional)",
  "shortDescription": "string (optional, max 255 chars)",
  "logo": "string (optional)",
  "banner": "string (optional)",
  "category": "string (optional)",
  "location": "string (optional)",
  "website": "string (optional, valid URL)",
  "contactEmail": "string (optional, valid email)",
  "contactPhone": "string (optional)",
  "membershipType": "open | approval | invite_only (default: open)",
  "maxMembers": "integer (optional)"
}
```

**Response 201:**

```json
{
  "success": true,
  "data": { "created community object" },
  "message": "Community created successfully"
}
```

**Side Effects:** Creator is automatically assigned as community owner.

**Errors:** 400 (validation), 409 (name/slug taken)

---

### 4.4 PATCH `/communities/:id`

**Description:** Update a community (owner/admin only).

**Auth Required:** Yes (COMMUNITY_OWNER+ for that community)

**Request Body:**

```json
{
  "name": "string (optional)",
  "description": "string (optional)",
  "shortDescription": "string (optional)",
  "logo": "string (optional)",
  "banner": "string (optional)",
  "category": "string (optional)",
  "location": "string (optional)",
  "website": "string (optional)",
  "contactEmail": "string (optional)",
  "contactPhone": "string (optional)",
  "membershipType": "string (optional)",
  "maxMembers": "integer (optional)"
}
```

**Response 200:**

```json
{
  "success": true,
  "data": { "updated community object" },
  "message": "Community updated successfully"
}
```

**Errors:** 400, 403, 404

---

### 4.5 DELETE `/communities/:id`

**Description:** Soft-delete a community (owner only).

**Auth Required:** Yes (COMMUNITY_OWNER for that community)

**Response 200:**

```json
{
  "success": true,
  "data": null,
  "message": "Community deleted successfully"
}
```

**Errors:** 403, 404

---

### 4.6 POST `/communities/:id/join`

**Description:** Join a community.

**Auth Required:** Yes

**Request Body:** None

**Response 201:**

```json
{
  "success": true,
  "data": {
    "communityId": 1,
    "userId": 5,
    "role": "MEMBER",
    "status": "active",
    "joinedAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "Successfully joined the community"
}
```

**Errors:** 400 (already member), 403 (invite only), 404 (community not found), 400 (community full)

---

### 4.7 POST `/communities/:id/leave`

**Description:** Leave a community.

**Auth Required:** Yes

**Response 200:**

```json
{
  "success": true,
  "data": null,
  "message": "Successfully left the community"
}
```

**Errors:** 400 (owner cannot leave), 404 (not a member)

---

### 4.8 POST `/communities/:id/members/approve`

**Description:** Approve a pending member request (admin only).

**Auth Required:** Yes (COMMUNITY_ADMIN+ for that community)

**Request Body:**

```json
{
  "userId": "integer (required)"
}
```

**Response 200:**

```json
{
  "success": true,
  "data": { "approved membership" },
  "message": "Member approved"
}
```

**Errors:** 403, 404

---

### 4.9 POST `/communities/:id/members/reject`

**Description:** Reject a pending member request (admin only).

**Auth Required:** Yes (COMMUNITY_ADMIN+ for that community)

**Request Body:**

```json
{
  "userId": "integer (required)",
  "reason": "string (optional)"
}
```

**Response 200:**

```json
{
  "success": true,
  "data": null,
  "message": "Member request rejected"
}
```

**Errors:** 403, 404

---

### 4.10 PATCH `/communities/:id/status`

**Description:** Update community status (platform admin only).

**Auth Required:** Yes (PLATFORM_ADMIN+)

**Request Body:**

```json
{
  "status": "APPROVED | REJECTED | SUSPENDED | ARCHIVED (required)",
  "statusReason": "string (required if rejecting/suspending)"
}
```

**Response 200:**

```json
{
  "success": true,
  "data": { "updated community with new status" },
  "message": "Community status updated"
}
```

**Errors:** 400, 403, 404

---

## 5. Community Members

### 5.1 GET `/communities/:id/members`

**Description:** List members of a community.

**Auth Required:** Yes

**Query Parameters:**

| Parameter | Type    | Default | Description        |
| --------- | ------- | ------- | ------------------ |
| page      | integer | 1       | Page number        |
| limit     | integer | 20      | Items per page     |
| search    | string  | —       | Search by username |
| role      | string  | —       | Filter by role     |
| status    | string  | active  | Filter by status   |

**Response 200:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user": {
        "id": 2,
        "username": "owner1",
        "avatar": "url",
        "firstName": "John",
        "lastName": "Doe"
      },
      "role": "OWNER",
      "status": "active",
      "joinedAt": "2023-01-01T00:00:00.000Z"
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 150, "totalPages": 8 },
  "message": "Members retrieved"
}
```

---

### 5.2 PATCH `/communities/:id/members/:userId/role`

**Description:** Update a member's role (owner/admin only).

**Auth Required:** Yes (COMMUNITY_OWNER+ for that community)

**Request Body:**

```json
{
  "role": "ADMIN | MODERATOR | MEMBER (required)"
}
```

**Response 200:**

```json
{
  "success": true,
  "data": { "updated member" },
  "message": "Member role updated"
}
```

**Errors:** 400 (cannot change own role), 403, 404

---

### 5.3 PATCH `/communities/:id/members/:userId/ban`

**Description:** Ban/unban a community member (admin only).

**Auth Required:** Yes (COMMUNITY_ADMIN+ for that community)

**Request Body:**

```json
{
  "status": "banned | active (required)",
  "reason": "string (required if banning)"
}
```

**Response 200:**

```json
{
  "success": true,
  "data": { "updated member with banned status" },
  "message": "Member banned"
}
```

**Errors:** 400 (cannot ban owner), 403, 404

---

## 6. Organizations

### 6.1 GET `/organizations`

**Description:** List all active organizations.

**Auth Required:** No

**Query Parameters:**

| Parameter | Type    | Default     | Description                   |
| --------- | ------- | ----------- | ----------------------------- |
| page      | integer | 1           | Page number                   |
| limit     | integer | 20          | Items per page                |
| search    | string  | —           | Search by name                |
| sort      | string  | -created_at | Sort field                    |
| industry  | string  | —           | Filter by industry            |
| status    | string  | APPROVED    | Filter by status (admin only) |

**Response 200:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "TechCorp Berlin",
      "slug": "techcorp-berlin",
      "shortDescription": "Leading tech company",
      "logo": "url",
      "banner": "url",
      "industry": "Technology",
      "location": "Berlin, Germany",
      "size": "51-200",
      "status": "APPROVED",
      "owner": { "id": 2, "username": "orgowner" },
      "membersCount": 120,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 30, "totalPages": 2 },
  "message": "Organizations retrieved"
}
```

---

### 6.2 GET `/organizations/:slug`

**Description:** Get a single organization by slug.

**Auth Required:** No

**Response 200:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "TechCorp Berlin",
    "slug": "techcorp-berlin",
    "description": "Full markdown description...",
    "shortDescription": "Leading tech company",
    "logo": "url",
    "banner": "url",
    "industry": "Technology",
    "location": "Berlin, Germany",
    "website": "https://techcorp.de",
    "contactEmail": "info@techcorp.de",
    "foundedAt": "2015-01-01",
    "size": "51-200",
    "status": "APPROVED",
    "owner": { "id": 2, "username": "orgowner", "avatar": "url" },
    "membersCount": 120,
    "eventsCount": 15,
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "Organization retrieved"
}
```

**Errors:** 404

---

### 6.3 POST `/organizations`

**Description:** Create a new organization.

**Auth Required:** Yes

**Request Body:**

```json
{
  "name": "string (required, 3-100 chars)",
  "description": "string (optional)",
  "shortDescription": "string (optional, max 255 chars)",
  "logo": "string (optional)",
  "banner": "string (optional)",
  "industry": "string (optional)",
  "location": "string (optional)",
  "website": "string (optional, valid URL)",
  "contactEmail": "string (optional, valid email)",
  "foundedAt": "string (optional, date YYYY-MM-DD)",
  "size": "1-10 | 11-50 | 51-200 | 201-500 | 501-1000 | 1000+ (optional)"
}
```

**Response 201:**

```json
{
  "success": true,
  "data": { "created organization object" },
  "message": "Organization created successfully"
}
```

**Side Effects:** Creator is automatically assigned as organization owner.

**Errors:** 400, 409 (name/slug taken)

---

### 6.4 PATCH `/organizations/:id`

**Description:** Update an organization (owner/admin only).

**Auth Required:** Yes (ORG_OWNER+ for that organization)

**Request Body:**

```json
{
  "name": "string (optional)",
  "description": "string (optional)",
  "shortDescription": "string (optional)",
  "logo": "string (optional)",
  "banner": "string (optional)",
  "industry": "string (optional)",
  "location": "string (optional)",
  "website": "string (optional)",
  "contactEmail": "string (optional)",
  "foundedAt": "string (optional)",
  "size": "string (optional)"
}
```

**Response 200:**

```json
{
  "success": true,
  "data": { "updated organization object" },
  "message": "Organization updated successfully"
}
```

**Errors:** 400, 403, 404

---

### 6.5 POST `/organizations/:id/join`

**Description:** Join an organization.

**Auth Required:** Yes

**Response 201:**

```json
{
  "success": true,
  "data": {
    "organizationId": 1,
    "userId": 5,
    "role": "MEMBER",
    "status": "active",
    "joinedAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "Successfully joined the organization"
}
```

**Errors:** 400 (already member), 403, 404

---

### 6.6 POST `/organizations/:id/leave`

**Description:** Leave an organization.

**Auth Required:** Yes

**Response 200:**

```json
{
  "success": true,
  "data": null,
  "message": "Successfully left the organization"
}
```

**Errors:** 400 (owner cannot leave), 404

---

### 6.7 PATCH `/organizations/:id/status`

**Description:** Update organization status (platform admin only).

**Auth Required:** Yes (PLATFORM_ADMIN+)

**Request Body:**

```json
{
  "status": "APPROVED | REJECTED | SUSPENDED (required)",
  "statusReason": "string (required if rejecting/suspending)"
}
```

**Response 200:**

```json
{
  "success": true,
  "data": { "updated organization" },
  "message": "Organization status updated"
}
```

**Errors:** 400, 403, 404

---

## 7. Events

### 7.1 GET `/events`

**Description:** List all active events.

**Auth Required:** No

**Query Parameters:**

| Parameter     | Type    | Default     | Description                             |
| ------------- | ------- | ----------- | --------------------------------------- |
| page          | integer | 1           | Page number                             |
| limit         | integer | 20          | Items per page                          |
| search        | string  | —           | Search by title                         |
| sort          | string  | -start_date | Sort field                              |
| category      | string  | —           | Filter by category                      |
| status        | string  | APPROVED    | Filter by status                        |
| isOnline      | boolean | —           | Filter online events                    |
| isFeatured    | boolean | —           | Filter featured events                  |
| startDateFrom | string  | —           | Filter start_date >= value (YYYY-MM-DD) |
| startDateTo   | string  | —           | Filter start_date <= value (YYYY-MM-DD) |

**Response 200:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Berlin Tech Meetup #42",
      "slug": "berlin-tech-meetup-42",
      "shortDescription": "Monthly tech meetup",
      "banner": "url",
      "startDate": "2024-02-15",
      "endDate": "2024-02-15",
      "startTime": "18:30",
      "endTime": "21:00",
      "location": "TechHub Berlin",
      "isOnline": false,
      "category": "Technology",
      "capacity": 100,
      "status": "APPROVED",
      "isFeatured": true,
      "createdBy": { "id": 2, "username": "eventmgr" },
      "registrationsCount": 65,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 45, "totalPages": 3 },
  "message": "Events retrieved"
}
```

---

### 7.2 GET `/events/:slug`

**Description:** Get a single event by slug.

**Auth Required:** No

**Response 200:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Berlin Tech Meetup #42",
    "slug": "berlin-tech-meetup-42",
    "description": "Full markdown description...",
    "shortDescription": "Monthly tech meetup",
    "banner": "url",
    "startDate": "2024-02-15",
    "endDate": "2024-02-15",
    "startTime": "18:30",
    "endTime": "21:00",
    "location": "TechHub Berlin",
    "locationUrl": "https://maps.google.com/...",
    "isOnline": false,
    "onlineUrl": null,
    "category": "Technology",
    "capacity": 100,
    "registrationDeadline": "2024-02-14T23:59:59.000Z",
    "status": "APPROVED",
    "isFeatured": true,
    "createdBy": { "id": 2, "username": "eventmgr", "avatar": "url" },
    "community": { "id": 1, "name": "Berlin Tech Meetup", "slug": "berlin-tech-meetup" },
    "organization": null,
    "registrationsCount": 65,
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "Event retrieved"
}
```

**Errors:** 404

---

### 7.3 POST `/events`

**Description:** Create a new event.

**Auth Required:** Yes

**Request Body:**

```json
{
  "title": "string (required, 3-200 chars)",
  "description": "string (optional)",
  "shortDescription": "string (optional, max 255 chars)",
  "banner": "string (optional)",
  "startDate": "string (required, YYYY-MM-DD)",
  "endDate": "string (optional, YYYY-MM-DD)",
  "startTime": "string (optional, HH:MM)",
  "endTime": "string (optional, HH:MM)",
  "location": "string (optional)",
  "locationUrl": "string (optional, valid URL)",
  "isOnline": "boolean (default: false)",
  "onlineUrl": "string (optional, valid URL)",
  "category": "string (optional)",
  "capacity": "integer (optional)",
  "registrationDeadline": "string (optional, ISO 8601 datetime)"
}
```

**Response 201:**

```json
{
  "success": true,
  "data": { "created event object" },
  "message": "Event created successfully"
}
```

**Errors:** 400, 409 (slug taken)

---

### 7.4 PATCH `/events/:id`

**Description:** Update an event (creator/manager only).

**Auth Required:** Yes (EVENT_MANAGER+ for the event's context)

**Request Body:** Same as POST `/events` (all fields optional)

**Response 200:**

```json
{
  "success": true,
  "data": { "updated event object" },
  "message": "Event updated successfully"
}
```

**Errors:** 400, 403, 404

---

### 7.5 POST `/events/:id/register`

**Description:** Register for an event.

**Auth Required:** Yes

**Response 201:**

```json
{
  "success": true,
  "data": {
    "eventId": 1,
    "userId": 5,
    "status": "registered",
    "registeredAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "Successfully registered for the event"
}
```

**Errors:** 400 (already registered, event full, registration deadline passed), 404

---

### 7.6 POST `/events/:id/cancel-registration`

**Description:** Cancel event registration.

**Auth Required:** Yes

**Response 200:**

```json
{
  "success": true,
  "data": null,
  "message": "Registration cancelled"
}
```

**Errors:** 400 (not registered), 404

---

### 7.7 PATCH `/events/:id/status`

**Description:** Update event status (platform admin only).

**Auth Required:** Yes (PLATFORM_ADMIN+)

**Request Body:**

```json
{
  "status": "APPROVED | CANCELLED (required)",
  "statusReason": "string (optional)"
}
```

**Response 200:**

```json
{
  "success": true,
  "data": { "updated event" },
  "message": "Event status updated"
}
```

**Errors:** 400, 403, 404

---

### 7.8 POST `/events/:id/link-community`

**Description:** Link an event to a community.

**Auth Required:** Yes (COMMUNITY_ADMIN+ for that community)

**Request Body:**

```json
{
  "communityId": "integer (required)"
}
```

**Response 201:**

```json
{
  "success": true,
  "data": {
    "eventId": 1,
    "communityId": 1,
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "Event linked to community"
}
```

**Errors:** 400 (already linked), 403, 404

---

## 8. Notifications

### 8.1 GET `/notifications`

**Description:** List current user's notifications.

**Auth Required:** Yes

**Query Parameters:**

| Parameter | Type    | Default | Description        |
| --------- | ------- | ------- | ------------------ |
| page      | integer | 1       | Page number        |
| limit     | integer | 20      | Items per page     |
| isRead    | boolean | —       | Filter read/unread |

**Response 200:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "type": "COMMUNITY_INVITE",
      "title": "Community Invitation",
      "message": "You have been invited to join Berlin Tech Meetup",
      "data": { "communityId": 1, "communitySlug": "berlin-tech-meetup" },
      "isRead": false,
      "readAt": null,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 10, "totalPages": 1 },
  "message": "Notifications retrieved"
}
```

---

### 8.2 PATCH `/notifications/:id/read`

**Description:** Mark a notification as read.

**Auth Required:** Yes

**Response 200:**

```json
{
  "success": true,
  "data": { "id": 1, "isRead": true, "readAt": "2024-01-01T00:00:00.000Z" },
  "message": "Notification marked as read"
}
```

**Errors:** 404

---

### 8.3 PATCH `/notifications/read-all`

**Description:** Mark all notifications as read.

**Auth Required:** Yes

**Response 200:**

```json
{
  "success": true,
  "data": { "count": 10 },
  "message": "All notifications marked as read"
}
```

---

### 8.4 DELETE `/notifications/:id`

**Description:** Delete a notification.

**Auth Required:** Yes

**Response 200:**

```json
{
  "success": true,
  "data": null,
  "message": "Notification deleted"
}
```

**Errors:** 404

---

## 9. Reports

### 9.1 POST `/reports`

**Description:** Submit a content/user report.

**Auth Required:** Yes

**Request Body:**

```json
{
  "targetType": "user | community | organization | post | event | comment (required)",
  "targetId": "integer (required)",
  "reason": "spam | harassment | hate_speech | violence | inappropriate | misinformation | copyright | other (required)",
  "description": "string (optional, max 1000 chars)"
}
```

**Response 201:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "reporterId": 5,
    "targetType": "post",
    "targetId": 10,
    "reason": "spam",
    "status": "PENDING",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "Report submitted successfully"
}
```

**Errors:** 400, 409 (duplicate report)

---

### 9.2 GET `/reports`

**Description:** List all reports (admin only).

**Auth Required:** Yes (PLATFORM_ADMIN+)

**Query Parameters:**

| Parameter  | Type    | Default | Description           |
| ---------- | ------- | ------- | --------------------- |
| page       | integer | 1       | Page number           |
| limit      | integer | 20      | Items per page        |
| status     | string  | —       | Filter by status      |
| targetType | string  | —       | Filter by target type |
| reason     | string  | —       | Filter by reason      |

**Response 200:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "reporter": { "id": 5, "username": "reporter1" },
      "targetType": "post",
      "targetId": 10,
      "reason": "spam",
      "description": "This post contains spam links...",
      "status": "PENDING",
      "resolvedBy": null,
      "resolvedAt": null,
      "resolution": null,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 25, "totalPages": 2 },
  "message": "Reports retrieved"
}
```

---

### 9.3 PATCH `/reports/:id/resolve`

**Description:** Resolve a report (admin only).

**Auth Required:** Yes (PLATFORM_ADMIN+)

**Request Body:**

```json
{
  "status": "RESOLVED | DISMISSED (required)",
  "resolution": "string (required)"
}
```

**Response 200:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "status": "RESOLVED",
    "resolvedById": 1,
    "resolvedAt": "2024-01-02T00:00:00.000Z",
    "resolution": "Content removed for spam."
  },
  "message": "Report resolved"
}
```

**Errors:** 400, 403, 404

---

## 10. Admin

### 10.1 GET `/admin/dashboard/stats`

**Description:** Get platform statistics dashboard.

**Auth Required:** Yes (PLATFORM_ADMIN+)

**Response 200:**

```json
{
  "success": true,
  "data": {
    "totalUsers": 5000,
    "activeUsers": 4500,
    "newUsersThisMonth": 200,
    "totalCommunities": 150,
    "activeCommunities": 120,
    "pendingCommunities": 15,
    "totalOrganizations": 50,
    "activeOrganizations": 45,
    "pendingOrganizations": 8,
    "totalEvents": 300,
    "activeEvents": 45,
    "totalPosts": 2000,
    "pendingReports": 10,
    "totalRoleRequests": 25
  },
  "message": "Dashboard stats retrieved"
}
```

---

### 10.2 GET `/admin/users`

**Description:** List all users (admin only).

**Auth Required:** Yes (PLATFORM_ADMIN+)

**Query Parameters:**

| Parameter   | Type    | Default     | Description                     |
| ----------- | ------- | ----------- | ------------------------------- |
| page        | integer | 1           | Page number                     |
| limit       | integer | 20          | Items per page                  |
| search      | string  | —           | Search by name, email, username |
| sort        | string  | -created_at | Sort field                      |
| isActive    | boolean | —           | Filter by active status         |
| isSuspended | boolean | —           | Filter by suspended status      |
| roleId      | integer | —           | Filter by role                  |

**Response 200:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "email": "user@example.com",
      "username": "johndoe",
      "firstName": "John",
      "lastName": "Doe",
      "avatar": "url",
      "isActive": true,
      "isSuspended": false,
      "emailVerified": true,
      "roles": [{ "id": 1, "name": "MEMBER" }],
      "createdAt": "2024-01-01T00:00:00.000Z",
      "lastLoginAt": "2024-01-15T00:00:00.000Z"
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 5000, "totalPages": 250 },
  "message": "Users retrieved"
}
```

---

### 10.3 PATCH `/admin/users/:id/suspend`

**Description:** Suspend or unsuspend a user.

**Auth Required:** Yes (PLATFORM_ADMIN+)

**Request Body:**

```json
{
  "isSuspended": "boolean (required)",
  "reason": "string (required if suspending)"
}
```

**Response 200:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "isSuspended": true,
    "suspendedAt": "2024-01-01T00:00:00.000Z",
    "suspendedReason": "Violation of terms"
  },
  "message": "User suspended"
}
```

**Errors:** 400, 403, 404

---

### 10.4 POST `/admin/roles/assign`

**Description:** Assign a role to a user.

**Auth Required:** Yes (PLATFORM_ADMIN+)

**Request Body:**

```json
{
  "userId": "integer (required)",
  "roleId": "integer (required)",
  "scope": "COMMUNITY | ORGANIZATION (optional, null for global)",
  "scopeId": "integer (optional, required if scope is set)"
}
```

**Response 201:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "userId": 5,
    "roleId": 3,
    "scope": "COMMUNITY",
    "scopeId": 1,
    "grantedById": 1,
    "grantedAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "Role assigned successfully"
}
```

**Errors:** 400, 403, 409 (already assigned)

---

### 10.5 GET `/admin/audit-logs`

**Description:** List audit logs (admin only).

**Auth Required:** Yes (PLATFORM_ADMIN+)

**Query Parameters:**

| Parameter  | Type    | Default | Description                 |
| ---------- | ------- | ------- | --------------------------- |
| page       | integer | 1       | Page number                 |
| limit      | integer | 50      | Items per page              |
| userId     | integer | —       | Filter by user              |
| action     | string  | —       | Filter by action            |
| entityType | string  | —       | Filter by entity type       |
| startDate  | string  | —       | Filter from date (ISO 8601) |
| endDate    | string  | —       | Filter to date (ISO 8601)   |

**Response 200:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user": { "id": 2, "username": "admin" },
      "action": "community.create",
      "entityType": "community",
      "entityId": 1,
      "oldValues": null,
      "newValues": { "name": "Berlin Tech" },
      "metadata": null,
      "ipAddress": "127.0.0.1",
      "userAgent": "Mozilla/5.0...",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "meta": { "page": 1, "limit": 50, "total": 10000, "totalPages": 200 },
  "message": "Audit logs retrieved"
}
```

---

### 10.6 GET `/admin/settings`

**Description:** List all platform settings.

**Auth Required:** Yes (PLATFORM_ADMIN+)

**Response 200:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "key": "platform.name",
      "value": "KomunaID",
      "type": "string",
      "description": "Platform name",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "message": "Settings retrieved"
}
```

---

### 10.7 PATCH `/admin/settings`

**Description:** Update platform settings (batch update).

**Auth Required:** Yes (PLATFORM_ADMIN+)

**Request Body:**

```json
{
  "settings": [
    {
      "key": "string (required)",
      "value": "string (required)"
    }
  ]
}
```

**Response 200:**

```json
{
  "success": true,
  "data": [{ "key": "platform.name", "value": "KomunaID" }],
  "message": "Settings updated"
}
```

**Errors:** 400, 403

---

### 10.8 GET `/admin/reports`

**Description:** Alias for GET `/reports` — listed here for admin endpoint group completeness.

**Auth Required:** Yes (PLATFORM_ADMIN+)

**Response:** Same as Section 9.2

---

## 11. Upload

### 11.1 POST `/uploads/presigned-url`

**Description:** Get a presigned URL for uploading a file to S3.

**Auth Required:** Yes

**Request Body:**

```json
{
  "filename": "string (required, e.g., 'photo.png')",
  "mimeType": "string (required, e.g., 'image/png')",
  "size": "integer (required, file size in bytes)",
  "entityType": "string (optional, entity type to associate)",
  "entityId": "integer (optional, entity ID to associate)"
}
```

**Response 200:**

```json
{
  "success": true,
  "data": {
    "uploadUrl": "https://s3.amazonaws.com/bucket/presigned-url",
    "fileUrl": "https://s3.amazonaws.com/bucket/unique-filename.png",
    "mediaAsset": {
      "id": 1,
      "filename": "abc123-photo.png",
      "originalFilename": "photo.png",
      "mimeType": "image/png",
      "size": 1024000,
      "url": "https://s3.amazonaws.com/bucket/abc123-photo.png",
      "thumbnailUrl": "https://s3.amazonaws.com/bucket/abc123-photo-thumb.png",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  },
  "message": "Presigned URL generated"
}
```

**Errors:** 400 (invalid file type or size), 413 (file too large)

---

### 11.2 DELETE `/uploads/media/:id`

**Description:** Delete an uploaded media asset.

**Auth Required:** Yes (owner only)

**Response 200:**

```json
{
  "success": true,
  "data": null,
  "message": "Media asset deleted"
}
```

**Errors:** 403, 404

---

## 12. Audit Log

### 12.1 GET `/audit-logs`

**Description:** List audit logs for the current user.

**Auth Required:** Yes

**Query Parameters:**

| Parameter  | Type    | Default | Description           |
| ---------- | ------- | ------- | --------------------- |
| page       | integer | 1       | Page number           |
| limit      | integer | 20      | Items per page        |
| action     | string  | —       | Filter by action      |
| entityType | string  | —       | Filter by entity type |
| startDate  | string  | —       | Filter from date      |
| endDate    | string  | —       | Filter to date        |

**Response 200:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "action": "user.login",
      "entityType": "user",
      "entityId": 1,
      "metadata": { "method": "email" },
      "ipAddress": "127.0.0.1",
      "userAgent": "Mozilla/5.0...",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 100, "totalPages": 5 },
  "message": "Audit logs retrieved"
}
```

---

### 12.2 GET `/audit-logs/:id`

**Description:** Get a single audit log entry detail.

**Auth Required:** Yes

**Response 200:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "user": { "id": 2, "username": "admin" },
    "action": "community.create",
    "entityType": "community",
    "entityId": 1,
    "oldValues": null,
    "newValues": {
      "name": "Berlin Tech Meetup",
      "slug": "berlin-tech-meetup",
      "status": "PENDING"
    },
    "metadata": { "source": "api" },
    "ipAddress": "127.0.0.1",
    "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)...",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "Audit log retrieved"
}
```

**Errors:** 403 (can only view own logs unless admin), 404

---

## Endpoint Summary

| #   | Method | Path                                  | Auth                 | Description          |
| --- | ------ | ------------------------------------- | -------------------- | -------------------- |
| 1   | GET    | /health                               | No                   | Health check         |
| 2   | POST   | /auth/register                        | No                   | Register new user    |
| 3   | POST   | /auth/login                           | No                   | Login                |
| 4   | POST   | /auth/refresh                         | No                   | Refresh token        |
| 5   | POST   | /auth/logout                          | Yes                  | Logout               |
| 6   | POST   | /auth/forgot-password                 | No                   | Send reset email     |
| 7   | POST   | /auth/reset-password                  | No                   | Reset password       |
| 8   | GET    | /users/me                             | Yes                  | Get own profile      |
| 9   | PATCH  | /users/me                             | Yes                  | Update own profile   |
| 10  | GET    | /users/:username                      | No                   | Get public profile   |
| 11  | POST   | /role-requests                        | Yes                  | Submit role request  |
| 12  | GET    | /role-requests                        | Yes (Admin)          | List role requests   |
| 13  | PATCH  | /role-requests/:id                    | Yes (Admin)          | Review role request  |
| 14  | GET    | /communities                          | No                   | List communities     |
| 15  | GET    | /communities/:slug                    | No                   | Get community        |
| 16  | POST   | /communities                          | Yes                  | Create community     |
| 17  | PATCH  | /communities/:id                      | Yes (Owner)          | Update community     |
| 18  | DELETE | /communities/:id                      | Yes (Owner)          | Delete community     |
| 19  | POST   | /communities/:id/join                 | Yes                  | Join community       |
| 20  | POST   | /communities/:id/leave                | Yes                  | Leave community      |
| 21  | POST   | /communities/:id/members/approve      | Yes (Admin)          | Approve member       |
| 22  | POST   | /communities/:id/members/reject       | Yes (Admin)          | Reject member        |
| 23  | PATCH  | /communities/:id/status               | Yes (Platform Admin) | Update status        |
| 24  | GET    | /communities/:id/members              | Yes                  | List members         |
| 25  | PATCH  | /communities/:id/members/:userId/role | Yes (Owner)          | Update member role   |
| 26  | PATCH  | /communities/:id/members/:userId/ban  | Yes (Admin)          | Ban member           |
| 27  | GET    | /organizations                        | No                   | List organizations   |
| 28  | GET    | /organizations/:slug                  | No                   | Get organization     |
| 29  | POST   | /organizations                        | Yes                  | Create organization  |
| 30  | PATCH  | /organizations/:id                    | Yes (Owner)          | Update organization  |
| 31  | POST   | /organizations/:id/join               | Yes                  | Join organization    |
| 32  | POST   | /organizations/:id/leave              | Yes                  | Leave organization   |
| 33  | PATCH  | /organizations/:id/status             | Yes (Platform Admin) | Update status        |
| 34  | GET    | /events                               | No                   | List events          |
| 35  | GET    | /events/:slug                         | No                   | Get event            |
| 36  | POST   | /events                               | Yes                  | Create event         |
| 37  | PATCH  | /events/:id                           | Yes (Manager)        | Update event         |
| 38  | POST   | /events/:id/register                  | Yes                  | Register for event   |
| 39  | POST   | /events/:id/cancel-registration       | Yes                  | Cancel registration  |
| 40  | PATCH  | /events/:id/status                    | Yes (Platform Admin) | Update status        |
| 41  | POST   | /events/:id/link-community            | Yes (Admin)          | Link to community    |
| 42  | GET    | /notifications                        | Yes                  | List notifications   |
| 43  | PATCH  | /notifications/:id/read               | Yes                  | Mark as read         |
| 44  | PATCH  | /notifications/read-all               | Yes                  | Mark all as read     |
| 45  | DELETE | /notifications/:id                    | Yes                  | Delete notification  |
| 46  | POST   | /reports                              | Yes                  | Submit report        |
| 47  | GET    | /reports                              | Yes (Admin)          | List reports         |
| 48  | PATCH  | /reports/:id/resolve                  | Yes (Admin)          | Resolve report       |
| 49  | GET    | /admin/dashboard/stats                | Yes (Platform Admin) | Dashboard stats      |
| 50  | GET    | /admin/users                          | Yes (Platform Admin) | List users           |
| 51  | PATCH  | /admin/users/:id/suspend              | Yes (Platform Admin) | Suspend user         |
| 52  | POST   | /admin/roles/assign                   | Yes (Platform Admin) | Assign role          |
| 53  | GET    | /admin/audit-logs                     | Yes (Platform Admin) | List audit logs      |
| 54  | GET    | /admin/settings                       | Yes (Platform Admin) | Get settings         |
| 55  | PATCH  | /admin/settings                       | Yes (Platform Admin) | Update settings      |
| 56  | GET    | /admin/reports                        | Yes (Platform Admin) | List reports         |
| 57  | POST   | /uploads/presigned-url                | Yes                  | Get presigned URL    |
| 58  | DELETE | /uploads/media/:id                    | Yes                  | Delete media         |
| 59  | GET    | /audit-logs                           | Yes                  | List own audit logs  |
| 60  | GET    | /audit-logs/:id                       | Yes                  | Get audit log detail |

**Total: 60 endpoints**
