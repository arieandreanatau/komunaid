# 04 — API DESIGN

**Date:** 2026-07-09
**Version:** 1.0.0

---

## API Overview

| Property | Value |
|----------|-------|
| Base URL | `http://localhost:3001/api/v1` |
| Format | JSON |
| Auth | Bearer token (JWT) via httpOnly cookie |
| Versioning | URL path prefix `/api/v1/` |

---

## Global Response Format

### Success

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error

```json
{
  "success": false,
  "message": "Error description",
  "errors": { "field": ["Error message"] }
}
```

### Paginated

```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

---

## Middleware Pipeline

```
Request
  │
  ├─ securityHeaders()
  ├─ rateLimiter(100/15min)
  ├─ requestSizeLimit(10mb)
  ├─ cors()
  │
  ├─ [Public Routes] → Handler
  │
  ├─ [Protected Routes]
  │   ├─ optionalAuthMiddleware() / authMiddleware()
  │   ├─ requireRole() / requirePlatformAdmin() / requireSuperAdmin()
  │   ├─ requireCommunityOwner / requireCommunityAdmin
  │   ├─ requireOrganizationOwner
  │   └─ Handler
  │
  └─ Global Error Handler
```

---

## Authentication Routes

### POST /auth/register

**Auth:** Guest (unauthenticated)
**Request:**

```json
{
  "name": "string (2-100 chars)",
  "email": "string (valid email)",
  "password": "string (min 8 chars)",
  "confirmPassword": "string"
}
```

**Response (201):**

```json
{
  "success": true,
  "message": "Registrasi berhasil",
  "data": {
    "user": {
      "id": "cuid",
      "name": "string",
      "email": "string",
      "avatar": null
    },
    "accessToken": "string (JWT)",
    "refreshToken": "string (JWT)"
  }
}
```

**Errors:** 400 (validation), 409 (email exists), 500

---

### POST /auth/login

**Auth:** Guest
**Request:**

```json
{
  "email": "string",
  "password": "string"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Login berhasil",
  "data": {
    "user": {
      "id": "cuid",
      "name": "string",
      "email": "string",
      "avatar": "string?"
    },
    "accessToken": "string",
    "refreshToken": "string"
  }
}
```

**Errors:** 400 (validation), 401 (invalid credentials), 403 (suspended)

---

### POST /auth/refresh

**Auth:** httpOnly cookie (refresh_token)
**Response (200):**

```json
{
  "success": true,
  "message": "Token refreshed",
  "data": {
    "accessToken": "string (new)",
    "refreshToken": "string (new)"
  }
}
```

---

### POST /auth/logout

**Auth:** Member (authenticated)
**Response (200):**

```json
{
  "success": true,
  "message": "Logout berhasil"
}
```

---

### GET /auth/me

**Auth:** Member
**Response (200):**

```json
{
  "success": true,
  "data": {
    "id": "cuid",
    "name": "string",
    "email": "string",
    "avatar": "string?",
    "phone": "string?",
    "bio": "string?",
    "location": "string?",
    "status": "ACTIVE",
    "roles": ["MEMBER"],
    "createdAt": "datetime"
  }
}
```

---

### PUT /auth/change-password

**Auth:** Member
**Request:**

```json
{
  "currentPassword": "string",
  "newPassword": "string (min 8)",
  "confirmNewPassword": "string"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Password berhasil diubah"
}
```

---

### POST /auth/forgot-password *(PLANNED)*

**Auth:** Guest
**Request:**

```json
{
  "email": "string"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Link reset password telah dikirim"
}
```

**Design Notes:** Always return success to prevent email enumeration.

---

### POST /auth/reset-password *(PLANNED)*

**Auth:** Guest (with reset token)
**Request:**

```json
{
  "token": "string",
  "password": "string (min 8)",
  "confirmPassword": "string"
}
```

---

## User Routes

### GET /users/profile

**Auth:** Member
**Response (200):** Full user profile with roles and interests.

### PUT /users/profile

**Auth:** Member
**Request:**

```json
{
  "name": "string (2-100)",
  "phone": "string?",
  "bio": "string?",
  "location": "string?",
  "avatar": "string?"
}
```

### GET /users/:id

**Auth:** Public
**Response (200):** Public user profile (name, avatar, bio, location, joinedCommunities count).

### PUT /users/interests

**Auth:** Member
**Request:**

```json
{
  "interests": ["string", "string"]
}
```

### GET /users/notifications

**Auth:** Member
**Query:** `page`, `limit`, `unreadOnly` (boolean)
**Response:** Paginated notifications.

### PUT /users/notifications/:id/read

**Auth:** Member
**Response:** Mark single notification as read.

### GET /users/activity

**Auth:** Member
**Query:** `page`, `limit`
**Response:** Paginated activity history.

---

## Community Routes

### GET /communities

**Auth:** Public
**Query:** `page`, `limit`, `search`, `status` (admin only)
**Response:** Paginated approved communities.

### GET /communities/:slug

**Auth:** Public
**Response:** Community detail with members, events, categories.

### POST /communities

**Auth:** Member
**Request:**

```json
{
  "name": "string (3-100)",
  "description": "string?",
  "coverImage": "string?",
  "logo": "string?",
  "location": "string?",
  "website": "string?",
  "membershipType": "OPEN | RESTRICTED",
  "categoryIds": ["string"]
}
```

**Behavior:** Creates Community (PENDING) + CommunityMember (OWNER).

### PUT /communities/:communityId

**Auth:** Community Owner
**Request:** Same as create (partial update).

### POST /communities/:communityId/join

**Auth:** Member
**Behavior:**
- OPEN → Creates CommunityMember (ACTIVE)
- RESTRICTED → Creates JoinRequest (PENDING)

### POST /communities/:communityId/leave

**Auth:** Member (not OWNER)
**Behavior:** Removes CommunityMember.

### GET /communities/:communityId/join-requests

**Auth:** Community Admin+
**Response:** Paginated pending join requests.

### PUT /communities/:communityId/join-requests/:requestId

**Auth:** Community Admin+
**Request:**

```json
{
  "status": "APPROVED | REJECTED"
}
```

**Behavior:** Updates JoinRequest, creates CommunityMember if APPROVED.

### GET /communities/:communityId/members

**Auth:** Community Member+
**Response:** Paginated member list.

---

## Organization Routes

### GET /organizations

**Auth:** Public
**Query:** `page`, `limit`, `search`
**Response:** Paginated approved organizations.

### GET /organizations/:slug

**Auth:** Public
**Response:** Organization detail with members, events.

### POST /organizations

**Auth:** Member
**Request:**

```json
{
  "name": "string (3-100)",
  "description": "string?",
  "logo": "string?",
  "website": "string?",
  "location": "string?",
  "industry": "string?"
}
```

**Behavior:** Creates Organization (PENDING) + OrganizationMember (OWNER).

### PUT /organizations/:organizationId

**Auth:** Organization Owner

---

## Event Routes

### GET /events

**Auth:** Public
**Query:** `page`, `limit`, `search`, `communityId`, `organizationId`, `upcoming` (boolean)
**Response:** Paginated events.

### GET /events/:slug

**Auth:** Public
**Response:** Event detail with registration status (if authenticated).

### POST /events

**Auth:** Community Event Manager+ or Organization Admin+
**Request:**

```json
{
  "title": "string (3-200)",
  "description": "string?",
  "coverImage": "string?",
  "location": "string?",
  "isOnline": "boolean",
  "onlineUrl": "string?",
  "eventDate": "datetime (future)",
  "endDate": "datetime?",
  "quota": "integer (min 1)",
  "communityId": "string?",
  "organizationId": "string?",
  "categoryIds": ["string"]
}
```

**Validation:** eventDate must be in the future. quota >= 1.

### POST /events/:eventId/register

**Auth:** Member
**Behavior:**
- Check event status (must be APPROVED)
- Check quota → CONFIRMED or WAITLISTED
- Create EventRegistration

### DELETE /events/:eventId/register

**Auth:** Member
**Behavior:** Cancel registration (status → CANCELLED).

---

## Report Routes

### POST /reports

**Auth:** Member
**Request:**

```json
{
  "targetType": "COMMUNITY | EVENT | USER | ORGANIZATION",
  "targetId": "string",
  "reason": "SPAM | HARASSMENT | INAPPROPRIATE_CONTENT | MISINFORMATION | COPYRIGHT_VIOLATION | OTHER",
  "description": "string?"
}
```

### GET /reports/my

**Auth:** Member
**Response:** User's own reports.

---

## Category Routes

### GET /categories

**Auth:** Public
**Response:** All active categories.

### POST /categories

**Auth:** Platform Admin
**Request:**

```json
{
  "name": "string (2-50)",
  "description": "string?",
  "icon": "string?"
}
```

### PUT /categories/:categoryId

**Auth:** Platform Admin

### DELETE /categories/:categoryId

**Auth:** Platform Admin
**Behavior:** Soft delete (isActive → false).

---

## Admin Routes

### GET /admin/stats

**Auth:** Platform Admin
**Response:**

```json
{
  "success": true,
  "data": {
    "totalUsers": "integer",
    "totalCommunities": "integer",
    "totalOrganizations": "integer",
    "totalEvents": "integer",
    "pendingCommunities": "integer",
    "pendingOrganizations": "integer",
    "openReports": "integer",
    "activeUsers": "integer"
  }
}
```

### GET /admin/users

**Auth:** Platform Admin
**Query:** `page`, `limit`, `search`, `status`, `role`

### PUT /admin/users/:userId/suspend

**Auth:** Platform Admin

### PUT /admin/users/:userId/activate

**Auth:** Platform Admin

### PUT /admin/users/:userId/role

**Auth:** Super Admin
**Request:**

```json
{
  "role": "SUPER_ADMIN | PLATFORM_ADMIN | MEMBER"
}
```

### GET /admin/communities/pending

**Auth:** Platform Admin
**Response:** Paginated pending communities.

### PUT /admin/communities/:communityId/approve

**Auth:** Platform Admin

### PUT /admin/communities/:communityId/suspend

**Auth:** Platform Admin

### GET /admin/organizations/pending

**Auth:** Platform Admin

### PUT /admin/organizations/:organizationId/approve

**Auth:** Platform Admin

### PUT /admin/organizations/:organizationId/suspend

**Auth:** Platform Admin

### GET /admin/reports

**Auth:** Platform Admin
**Query:** `page`, `limit`, `status`, `targetType`

### PUT /admin/reports/:reportId/resolve

**Auth:** Platform Admin
**Request:**

```json
{
  "status": "SUSPENDED | DISMISSED"
}
```

### GET /admin/audit-logs

**Auth:** Super Admin
**Query:** `page`, `limit`, `userId`, `actionType`, `resourceName`, `startDate`, `endDate`

---

## Planned New Endpoints

| Endpoint | Method | Auth | Module | Priority |
|----------|--------|------|--------|----------|
| /auth/forgot-password | POST | Guest | Auth | High |
| /auth/reset-password | POST | Guest | Auth | High |
| /admin/settings | GET | Super Admin | Admin | Medium |
| /admin/settings | PUT | Super Admin | Admin | Medium |
| /events/:eventId/participants | GET | Event Manager+ | Event | Medium |
| /users/communities | GET | Member | Member | Medium |
| /users/events | GET | Member | Member | Medium |

---

## HTTP Status Codes

| Code | Usage |
|------|-------|
| 200 | Success |
| 201 | Created |
| 400 | Validation error |
| 401 | Unauthorized (no token / invalid) |
| 403 | Forbidden (insufficient role) |
| 404 | Resource not found |
| 409 | Conflict (duplicate) |
| 422 | Unprocessable entity |
| 429 | Rate limit exceeded |
| 500 | Internal server error |

---

*Document generated: 2026-07-09*
*Stage: SDLC Stage 2 — System Analysis & Solution Design*
