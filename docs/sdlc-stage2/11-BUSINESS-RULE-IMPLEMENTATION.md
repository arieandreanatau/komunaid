# 11 — BUSINESS RULE IMPLEMENTATION

**Date:** 2026-07-09
**Version:** 1.0.0

---

## Business Rules Map

| # | Rule | Module | Implementation Location | Status |
|---|------|--------|------------------------|--------|
| 1 | Registrasi Member | Auth | POST /auth/register, registerSchema | ✅ |
| 2 | Approval Community | Community, Admin | POST /communities, PUT /admin/communities/:id/approve | ✅ |
| 3 | Approval Organization | Organization, Admin | POST /organizations, PUT /admin/organizations/:id/approve | ✅ |
| 4 | RBAC | All | middleware/rbac.ts, middleware/auth.ts | ✅ |
| 5 | Scoped Permission | Community, Organization | RBAC middleware (community/org member check) | ✅ |
| 6 | Multi Role | Community, Organization | CommunityMember.role, OrganizationMember.role | ✅ |
| 7 | Join Request | Community | POST /communities/:id/join, PUT /communities/:id/join-requests/:rid | ✅ |
| 8 | Event Capacity | Event | POST /events/:id/register (quota check) | ✅ |
| 9 | Event Date Validation | Event | Zod schema + route handler (eventDate > now) | ✅ |
| 10 | Report Abuse | Member, Admin | POST /reports, PUT /admin/reports/:id/resolve | ✅ |
| 11 | Soft Delete | All major entities | schema.prisma (deletedAt field) | ✅ |
| 12 | Audit Trail | Admin | services/audit.ts (immutable) | ✅ |
| 13 | Pagination | All list endpoints | paginatedResponse helper | ✅ |
| 14 | Search | Communities, Events, Users | SQL contains query | ✅ |
| 15 | Filter | Admin endpoints | Status, date filters | ✅ |
| 16 | Validation | All API inputs | Zod schemas in @komunaid/shared | ✅ |

---

## Rule 1: Registrasi Member

**Rule:** Users register with email/password. Default role is MEMBER.

**Implementation:**

```typescript
// POST /auth/register
// 1. Validate (registerSchema)
// 2. Check email uniqueness
// 3. Hash password (bcryptjs, 10 rounds)
// 4. INSERT User { email, password, name, status: ACTIVE }
// 5. INSERT UserRole { userId, role: MEMBER }
// 6. Generate JWT tokens
// 7. Set cookies
// 8. INSERT AuditLog { actionType: USER_REGISTER }
```

**Database:** User (status: ACTIVE) + UserRole (role: MEMBER)
**Validation:** Zod registerSchema (name 2-100, email valid, password min 8)
**Audit:** USER_REGISTER

---

## Rule 2: Approval Community

**Rule:** Communities require Platform Admin approval before becoming visible.

**Implementation:**

```typescript
// POST /communities
// → Community { status: PENDING }

// PUT /admin/communities/:communityId/approve
// → Community { status: APPROVED }
// → AuditLog { before: { status: PENDING }, after: { status: APPROVED } }

// PUT /admin/communities/:communityId/suspend
// → Community { status: SUSPENDED }
// → AuditLog { before: { status: APPROVED }, after: { status: SUSPENDED } }
```

**Database:** Community.status (PENDING → APPROVED → SUSPENDED)
**RBAC:** requirePlatformAdmin
**Audit:** COMMUNITY_APPROVE, COMMUNITY_SUSPEND

---

## Rule 3: Approval Organization

**Rule:** Organizations require Platform Admin approval before becoming visible.

**Implementation:**

```typescript
// POST /organizations
// → Organization { status: PENDING }

// PUT /admin/organizations/:organizationId/approve
// → Organization { status: APPROVED }
// → AuditLog { before: { status: PENDING }, after: { status: APPROVED } }
```

**Database:** Organization.status (PENDING → APPROVED → SUSPENDED)
**RBAC:** requirePlatformAdmin
**Audit:** ORG_APPROVE, ORG_SUSPEND

---

## Rule 4: RBAC

**Rule:** Actions restricted based on platform and scoped roles.

**Implementation:**

```
Platform Roles (user_roles table):
  SUPER_ADMIN → everything
  PLATFORM_ADMIN → manage users, approve, moderate
  MEMBER → own data, create, join

Community Roles (community_members table):
  OWNER → full control
  ADMIN → manage members, join requests
  EVENT_MANAGER → create events
  MEMBER → view, leave

Organization Roles (organization_members table):
  OWNER → full control
  ADMIN → manage members, create events
  MEMBER → view
```

**Middleware:** requireRole, requireSuperAdmin, requirePlatformAdmin, requireCommunityOwner, requireCommunityAdmin, requireOrganizationOwner

---

## Rule 5: Scoped Permission

**Rule:** Permissions scoped to specific community/organization.

**Implementation:**

```
1. User has no global "community admin" power
2. CommunityMember.role checked per-community
3. OrganizationMember.role checked per-org
4. Middleware extracts resource ID from params
5. Queries CommunityMember/OrganizationMember with userId + resourceId
6. Checks role level
```

---

## Rule 6: Multi Role

**Rule:** Users can have different roles in different communities/organizations.

**Implementation:**

```
CommunityMember: UNIQUE(communityId, userId)
  → User can be OWNER in Community A and MEMBER in Community B

OrganizationMember: UNIQUE(organizationId, userId)
  → User can be OWNER in Org A and ADMIN in Org B

No global role conflict — scoped roles are independent.
```

---

## Rule 7: Join Request

**Rule:** RESTRICTED communities require admin approval.

**Implementation:**

```typescript
// POST /communities/:communityId/join
// IF membershipType === 'OPEN':
//   → INSERT CommunityMember { status: ACTIVE }
// IF membershipType === 'RESTRICTED':
//   → INSERT JoinRequest { status: PENDING }

// PUT /communities/:communityId/join-requests/:requestId
// IF status === 'APPROVED':
//   → UPDATE JoinRequest { status: APPROVED }
//   → INSERT CommunityMember { status: ACTIVE }
// IF status === 'REJECTED':
//   → UPDATE JoinRequest { status: REJECTED }
```

**Database:** JoinRequest (status: PENDING → APPROVED/REJECTED)
**RBAC:** requireCommunityAdmin

---

## Rule 8: Event Capacity

**Rule:** Events have quota. Registration is first-come-first-served.

**Implementation:**

```typescript
// POST /events/:eventId/register
// 1. Check event.status === 'APPROVED'
// 2. COUNT EventRegistration WHERE eventId AND status != CANCELLED
// 3. IF count < event.quota:
//      → status = CONFIRMED
// 4. ELSE:
//      → status = WAITLISTED
// 5. INSERT EventRegistration
```

**Database:** Event.quota (int), EventRegistration.status (CONFIRMED/WAITLISTED)

---

## Rule 9: Event Date Validation

**Rule:** Event dates must be in the future.

**Implementation:**

```typescript
// Zod schema: eventDate: z.string().datetime()
// Route handler:
//   IF new Date(eventDate) <= new Date():
//     → Return 400 "Tanggal event harus di masa depan"
```

---

## Rule 10: Report Abuse

**Rule:** Users can report communities, events, users, organizations.

**Implementation:**

```typescript
// POST /reports
// 1. Validate targetType, targetId, reason
// 2. Check duplicate: existing report by same reporter for same target
//    → IF exists: Return 409 "Anda sudah melaporkan target ini"
// 3. INSERT Report { reporterId, targetType, targetId, reason, status: OPEN }

// PUT /admin/reports/:reportId/resolve
// 1. Update Report { status: SUSPENDED/DISMISSED, reviewedBy, reviewedAt }
// 2. IF SUSPENDED: Update target entity status
// 3. INSERT AuditLog
```

**Database:** Report (polymorphic: targetType + targetId)
**Reasons:** SPAM, HARASSMENT, INAPPROPRIATE_CONTENT, MISINFORMATION, COPYRIGHT_VIOLATION, OTHER

---

## Rule 11: Soft Delete

**Rule:** Major entities use soft delete.

**Implementation:**

```
Models with deletedAt:
  - User
  - Community
  - Organization
  - Event

Query Pattern:
  WHERE deletedAt IS NULL

Delete Operation:
  UPDATE entity SET deletedAt = NOW() WHERE id = ?

No hard deletes in application code.
```

---

## Rule 12: Audit Trail

**Rule:** All administrative actions logged immutably.

**Implementation:**

```typescript
// services/audit.ts
// createAuditLog(params):
//   INSERT AuditLog { userId, actionType, resourceName, resourceId, beforeData, afterData, ipAddress }
//
// getAuditLogs(params):
//   SELECT * FROM audit_logs WHERE ... ORDER BY createdAt DESC
//
// CONSTRAINT: No UPDATE, No DELETE on audit_logs table
```

**Actions tracked:** 24 action types (USER_*, COMMUNITY_*, ORG_*, EVENT_*, REPORT_*)

---

## Rule 13: Pagination

**Rule:** All list endpoints support pagination.

**Implementation:**

```
Query params: page (default 1), limit (default 20, max 100)

Response:
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}

Implementation: paginatedResponse(data, page, limit, total) helper
```

---

## Rule 14: Search

**Rule:** Users can search communities, events, organizations.

**Implementation:**

```
Query param: search (string)

SQL: WHERE name LIKE '%search%' (via Prisma contains)

Fields searched:
  - Community: name
  - Event: title
  - Organization: name
  - User: name, email (admin only)
```

---

## Rule 15: Filter

**Rule:** List endpoints support filtering.

**Implementation:**

```
Community filter:
  - status (admin only): PENDING, APPROVED, SUSPENDED, ARCHIVED
  - membershipType: OPEN, RESTRICTED

Event filter:
  - upcoming: boolean (eventDate > now)
  - communityId: string
  - organizationId: string
  - status: PENDING, APPROVED, ONGOING, COMPLETED

User filter (admin):
  - status: ACTIVE, SUSPENDED, DEACTIVATED
  - role: SUPER_ADMIN, PLATFORM_ADMIN, MEMBER

Report filter (admin):
  - status: OPEN, UNDER_REVIEW, DISMISSED, SUSPENDED
  - targetType: COMMUNITY, EVENT, USER, ORGANIZATION
```

---

## Rule 16: Validation

**Rule:** All API inputs validated.

**Implementation:**

```
Zod schemas in @komunaid/shared:

  registerSchema       → name, email, password, confirmPassword
  loginSchema          → email, password
  forgotPasswordSchema → email
  resetPasswordSchema  → token, password, confirmPassword
  updateProfileSchema  → name, phone, bio, location, avatar
  createCommunitySchema → name, description, membershipType, ...
  updateCommunitySchema → name, description, ...
  createOrganizationSchema → name, description, industry, ...
  updateOrganizationSchema → name, description, ...
  createEventSchema    → title, eventDate, quota, ...
  updateEventSchema    → title, eventDate, quota, ...
  paginationSchema     → page, limit
  createReportSchema   → targetType, targetId, reason

Middleware: validate(schema, source) → Zod parse → 422 on error
```

---

*Document generated: 2026-07-09*
*Stage: SDLC Stage 2 — System Analysis & Solution Design*
