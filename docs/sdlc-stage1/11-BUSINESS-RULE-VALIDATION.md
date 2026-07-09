# 11 — BUSINESS RULE VALIDATION

**Date:** 2026-07-09
**Version:** 1.0.0

---

## Validation Summary

| Business Rule | Coverage | Requirement IDs | Status |
|--------------|----------|-----------------|--------|
| Registrasi Member | ✅ Covered | AUTH-001, AUTH-002 | Implemented |
| Approval Community | ✅ Covered | COM-001, COM-002, ADM-004 | Implemented (API) |
| Approval Organization | ✅ Covered | ORG-001, ORG-002, ADM-005 | Implemented (API) |
| RBAC | ✅ Covered | AUTH-002, COM-006, COM-007, ADM-002, ADM-003 | Implemented |
| Scoped Permission | ✅ Covered | COM-005, ORG-003, MEM-001 | Implemented |
| Multi Role | ✅ Covered | Community (OWNER/ADMIN/EVENT_MANAGER/MEMBER), Organization (OWNER/ADMIN/MEMBER) | Implemented |
| Join Request | ✅ Covered | COM-004, COM-006 | Implemented (API) |
| Event Capacity | ✅ Covered | EVT-002 (quota check, waitlist) | Implemented (API) |
| Event Date Validation | ✅ Covered | EVT-001 (schema validates datetime) | Implemented |
| Report Abuse | ✅ Covered | MEM-008, ADM-006 | Implemented (API) |
| Soft Delete | ✅ Covered | Schema: deletedAt on User, Community, Organization, Event | Schema defined |
| Audit Trail | ✅ Covered | ADM-007, AuditService immutable | Implemented |
| Pagination | ✅ Covered | All list endpoints support page/limit | Implemented |
| Search | ✅ Covered | Communities, Events, Users (contains query) | Implemented |
| Filter | ✅ Covered | Status filters on admin endpoints | Implemented |
| Validation | ✅ Covered | Zod schemas for all inputs | Implemented |

---

## Detailed Validation

### 1. Registrasi Member

**Rule:** Users must register with email/password. Default role is MEMBER.

**Implementation:**
- `POST /auth/register` — creates User + UserRole(MEMBER)
- Zod schema validates name (2-100 chars), email (valid format), password (min 8)
- bcryptjs password hashing
- JWT token generation + cookie setting

**Test Scenarios:**
- Valid registration → Account created, user logged in
- Duplicate email → Error "Email sudah terdaftar"
- Short password → Error "Password minimal 8 karakter"
- Mismatched passwords → Error "Password tidak cocok"

---

### 2. Approval Community

**Rule:** Communities require Platform Admin approval before becoming visible.

**Implementation:**
- Community default status: PENDING
- `PUT /admin/communities/:id/approve` — changes to APPROVED
- `PUT /admin/communities/:id/suspend` — changes to SUSPENDED
- Audit log created on each status change

**Test Scenarios:**
- Admin approves pending community → Status = APPROVED
- Admin suspends community → Status = SUSPENDED
- Non-admin attempts approval → 403 Forbidden

---

### 3. Approval Organization

**Rule:** Organizations require Platform Admin approval before becoming visible.

**Implementation:**
- Organization default status: PENDING
- `PUT /admin/organizations/:id/approve` — changes to APPROVED
- `PUT /admin/organizations/:id/suspend` — changes to SUSPENDED
- Audit log created on each status change

---

### 4. RBAC (Role-Based Access Control)

**Rule:** Actions are restricted based on platform roles and scoped roles.

**Implementation:**
- Platform: SUPER_ADMIN > PLATFORM_ADMIN > MEMBER
- Community: OWNER > ADMIN > EVENT_MANAGER > MEMBER
- Organization: OWNER > ADMIN > MEMBER
- Middleware: `requireRole()`, `requireSuperAdmin()`, `requirePlatformAdmin()`, `requireCommunityOwner`, `requireCommunityAdmin`, `requireOrganizationOwner`

**Test Scenarios:**
- Member cannot access admin routes → 403
- Community Member cannot approve join requests → 403
- Organization Member cannot create events → 403
- Super Admin can change user roles → 200

---

### 5. Scoped Permission

**Rule:** Permissions are scoped to specific communities/organizations.

**Implementation:**
- CommunityMember model links user to community with role
- OrganizationMember model links user to organization with role
- Middleware checks membership before allowing scoped actions

---

### 6. Multi Role

**Rule:** Users can have different roles in different communities/organizations.

**Implementation:**
- CommunityMember: unique constraint on (communityId, userId)
- OrganizationMember: unique constraint on (organizationId, userId)
- A user can be OWNER in one community and MEMBER in another

---

### 7. Join Request

**Rule:** RESTRICTED communities require admin approval for membership.

**Implementation:**
- JoinRequest model: communityId, userId, status (PENDING/APPROVED/REJECTED)
- `POST /communities/:id/join` — creates JoinRequest for RESTRICTED
- `PUT /communities/:id/join-requests/:requestId` — approve/reject

---

### 8. Event Capacity

**Rule:** Events have a quota. Registration is first-come-first-served.

**Implementation:**
- Event.quota field (int, min 1)
- EventRegistration count checked against quota
- CONFIRMED if quota available, WAITLISTED if full

---

### 9. Event Date Validation

**Rule:** Event dates must be in the future.

**Implementation:**
- Zod schema: `eventDate: z.string().datetime()`
- Custom validation in route handler checks `eventDate > now()`

---

### 10. Report Abuse

**Rule:** Users can report communities, events, users, or organizations.

**Implementation:**
- Report model: polymorphic (targetType + targetId)
- Reasons: SPAM, HARASSMENT, INAPPROPRIATE_CONTENT, MISINFORMATION, COPYRIGHT_VIOLATION, OTHER
- Duplicate check: unique per (reporterId, targetType, targetId)

---

### 11. Soft Delete

**Rule:** Major entities use soft delete (deletedAt field).

**Implementation:**
- User, Community, Organization, Event all have `deletedAt DateTime?`
- All queries filter by `deletedAt: null`
- No hard deletes in application code

---

### 12. Audit Trail

**Rule:** All administrative actions are logged immutably.

**Implementation:**
- AuditLog model: userId, actionType, resourceName, resourceId, beforeData, afterData, ipAddress
- `createAuditLog()` — INSERT only
- `getAuditLogs()` — READ only
- FORBIDDEN: update, delete, soft delete on audit logs

---

### 13. Pagination

**Rule:** All list endpoints support pagination.

**Implementation:**
- Default: page=1, limit=20
- Maximum: limit=100
- Response includes: pagination { page, limit, total, totalPages }

---

### 14. Search

**Rule:** Users can search communities, events, organizations.

**Implementation:**
- SQL `contains` query on name/title fields
- Search parameter on list endpoints

---

### 15. Filter

**Rule:** List endpoints support filtering.

**Implementation:**
- Status filter on admin endpoints
- Upcoming filter on events
- Category filter (planned)

---

### 16. Validation

**Rule:** All API inputs are validated.

**Implementation:**
- Zod schemas in @komunaid/shared
- Middleware integrates Zod validation
- Consistent error response format

---

## Coverage: 16/16 (100%)
