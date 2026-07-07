# KomunaID Backend Module Design

| Item         | Detail                |
| ------------ | --------------------- |
| **Project**  | KomunaID              |
| **Document** | Backend Module Design |
| **Date**     | 7 Juli 2026           |
| **Status**   | Completed             |

---

## 1. Auth Module

### Responsibility

Manajemen autentikasi pengguna: registrasi, login, refresh token, logout, forgot/reset password, email verification.

### Controller Endpoints

| Method | Path                        | Auth                   | Description                      |
| ------ | --------------------------- | ---------------------- | -------------------------------- |
| POST   | `/auth/register`            | Public                 | Register new user                |
| POST   | `/auth/login`               | Public                 | Login with email + password      |
| POST   | `/auth/refresh`             | Public (refresh token) | Refresh access token             |
| POST   | `/auth/logout`              | Bearer                 | Logout, invalidate refresh token |
| POST   | `/auth/forgot-password`     | Public                 | Request password reset email     |
| POST   | `/auth/reset-password`      | Public                 | Reset password with token        |
| POST   | `/auth/verify-email`        | Public                 | Verify email with token          |
| POST   | `/auth/resend-verification` | Bearer                 | Resend verification email        |
| GET    | `/auth/me`                  | Bearer                 | Get current user profile + roles |

### Service Methods

- `register(dto)` → Create user, hash password, send verification email, assign MEMBER role
- `login(dto)` → Validate credentials, generate access + refresh tokens
- `refresh(refreshToken)` → Verify refresh token, rotate, return new pair
- `logout(userId)` → Invalidate refresh token
- `forgotPassword(email)` → Generate reset token, send email
- `resetPassword(token, newPassword)` → Verify token, update password, invalidate sessions
- `verifyEmail(token)` → Mark email as verified
- `resendVerification(userId)` → Generate new verification token, send email
- `getMe(userId)` → Return user profile with roles and scoped assignments

### Dependencies

- `PrismaModule` — User, Role, UserRoleAssignment CRUD
- `JwtService` — Token generation and verification
- `EmailAdapter` — Send verification and reset emails
- `NotificationService` — Welcome notification after verification

### Key Business Rules

- Password must be ≥ 8 chars, include uppercase, lowercase, number
- Email must be unique (case-insensitive check)
- Username must be unique, alphanumeric + underscores, 3-30 chars
- Refresh token rotated on each use; old token invalidated
- Email verification required before accessing most features
- Password reset token expires in 1 hour
- Failed login attempts tracked (future: account lockout)

---

## 2. Users Module

### Responsibility

Manajemen profil pengguna: profile CRUD, public profile, username lookup.

### Controller Endpoints

| Method | Path                   | Auth                   | Description                    |
| ------ | ---------------------- | ---------------------- | ------------------------------ |
| GET    | `/users/me`            | Bearer                 | Get own full profile           |
| PATCH  | `/users/me`            | Bearer                 | Update own profile             |
| PATCH  | `/users/me/avatar`     | Bearer                 | Upload/update avatar           |
| GET    | `/users/:username`     | Public                 | Get public profile by username |
| GET    | `/users`               | Admin                  | List users (admin)             |
| GET    | `/users/:id`           | Admin                  | Get user by ID (admin)         |
| PATCH  | `/users/:id/suspend`   | Admin (PLATFORM_ADMIN) | Suspend user                   |
| PATCH  | `/users/:id/unsuspend` | Admin (PLATFORM_ADMIN) | Unsuspend user                 |

### Service Methods

- `getMe(userId)` → Return full profile with stats
- `updateProfile(userId, dto)` → Update first name, last name, bio, location, phone, interests
- `updateAvatar(userId, file)` → Upload to S3, update avatar URL
- `getPublicProfile(username)` → Return public-facing profile (limited fields)
- `listUsers(queryDto)` → Admin: paginated user list with filters
- `getUserById(id)` → Admin: full user details
- `suspendUser(id, reason)` → Admin: suspend user account
- `unsuspendUser(id)` → Admin: reactivate user account

### Dependencies

- `PrismaModule` — User CRUD
- `UploadsService` — Avatar upload handling
- `NotificationService` — Notify user on suspend/unsuspend

### Key Business Rules

- Users can only edit their own profile (except admin)
- Avatar max 2MB, JPEG/PNG/WebP only
- Suspend requires reason; user cannot login while suspended
- Public profile excludes: email, phone, interests, internal fields
- Username changes limited to once per 30 days (future)

---

## 3. Roles Module

### Responsibility

Manajemen role: assignment, upgrade requests, scoped role management.

### Controller Endpoints

| Method | Path                  | Auth           | Description                 |
| ------ | --------------------- | -------------- | --------------------------- |
| GET    | `/roles`              | Bearer         | List all available roles    |
| POST   | `/roles/assign`       | Bearer (admin) | Assign role to user         |
| DELETE | `/roles/assign/:id`   | Bearer (admin) | Revoke role assignment      |
| GET    | `/roles/my-roles`     | Bearer         | Get current user's roles    |
| GET    | `/roles/user/:userId` | Bearer (admin) | Get user's role assignments |
| POST   | `/role-requests`      | Bearer         | Request role upgrade        |

### Service Methods

- `listRoles()` → Return all system roles
- `assignRole(dto)` → Assign role to user with optional scope
- `revokeRole(assignmentId)` → Remove role assignment
- `getMyRoles(userId)` → Return user's platform + scoped roles
- `getUserRoles(userId, requesterId)` → Admin: get user's role assignments
- `requestUpgrade(userId, dto)` → Create role upgrade request

### Dependencies

- `PrismaModule` — Role, UserRoleAssignment CRUD
- `NotificationService` — Notify admin on upgrade request
- `CommunitiesService` — Validate community scope exists
- `OrganizationsService` — Validate organization scope exists

### Key Business Rules

- Only users with sufficient role level can assign higher roles
- Scoped roles require valid scope + scopeId (community/org must exist)
- Role assignment logged to audit trail
- Users cannot assign SUPER_ADMIN or PLATFORM_ADMIN (only SUPER_ADMIN can)
- Duplicate assignments rejected (unique constraint: userId, roleId, scope, scopeId)

---

## 4. Communities Module

### Responsibility

Community CRUD, membership join/leave/approve/reject, status management, slug-based lookup.

### Controller Endpoints

| Method | Path                              | Auth                   | Description                  |
| ------ | --------------------------------- | ---------------------- | ---------------------------- |
| POST   | `/communities`                    | Bearer                 | Create community             |
| GET    | `/communities`                    | Public                 | List communities (paginated) |
| GET    | `/communities/:slug`              | Public                 | Get community by slug        |
| PATCH  | `/communities/:id`                | Bearer (owner/admin)   | Update community             |
| DELETE | `/communities/:id`                | Bearer (owner)         | Soft delete community        |
| POST   | `/communities/:id/join`           | Bearer                 | Request to join community    |
| POST   | `/communities/:id/leave`          | Bearer                 | Leave community              |
| POST   | `/communities/:id/approve-member` | Bearer (admin)         | Approve member request       |
| POST   | `/communities/:id/reject-member`  | Bearer (admin)         | Reject member request        |
| GET    | `/communities/:id/members`        | Public                 | List community members       |
| PATCH  | `/communities/:id/status`         | Admin (PLATFORM_ADMIN) | Approve/reject community     |

### Service Methods

- `create(ownerId, dto)` → Create community, auto-assign owner role, set PENDING status
- `findAll(queryDto)` → Paginated list with filters (category, status, search)
- `findBySlug(slug)` → Public community profile with stats
- `update(id, dto)` → Owner/admin update community details
- `delete(id)` → Soft delete (owner only, must be sole owner)
- `requestJoin(communityId, userId)` → Add membership request
- `leave(communityId, userId)` → Remove membership
- `approveMember(communityId, userId, adminId)` → Approve pending member
- `rejectMember(communityId, userId, adminId)` → Reject pending member
- `listMembers(communityId, queryDto)` → Paginated member list
- `updateStatus(id, status, adminId, reason)` → Admin: approve/reject/suspend community

### Dependencies

- `PrismaModule` — Community, CommunityMember, UserRoleAssignment CRUD
- `RolesService` — Auto-assign community roles
- `NotificationService` — Notify on join request, approval, rejection
- `UploadsService` — Logo/banner upload

### Key Business Rules

- Community name must be unique within platform
- Slug auto-generated from name, must be unique
- PENDING communities not visible in public listings
- OPEN membership: auto-approve; INVITE_ONLY: admin must approve
- maxMembers enforced (if set)
- Owner can transfer ownership
- Community deletion soft-deletes and hides from listings
- Only owner can delete community; PLATFORM_ADMIN can suspend

---

## 5. Community Members Module

### Responsibility

Member list, member role management, ban/unban within a community.

### Controller Endpoints

| Method | Path                                     | Auth                 | Description              |
| ------ | ---------------------------------------- | -------------------- | ------------------------ |
| GET    | `/communities/:id/members`               | Public               | List members (paginated) |
| PATCH  | `/communities/:id/members/:userId/role`  | Bearer (owner/admin) | Change member role       |
| POST   | `/communities/:id/members/:userId/ban`   | Bearer (owner/admin) | Ban member               |
| POST   | `/communities/:id/members/:userId/unban` | Bearer (owner/admin) | Unban member             |
| GET    | `/communities/:id/members/pending`       | Bearer (owner/admin) | List pending members     |

### Service Methods

- `listMembers(communityId, queryDto)` → Paginated list with role, join date
- `updateMemberRole(communityId, userId, newRole, adminId)` → Change member role
- `banMember(communityId, userId, adminId, reason)` → Ban member from community
- `unbanMember(communityId, userId, adminId)` → Restore banned member
- `listPending(communityId, queryDto)` → List pending membership requests

### Dependencies

- `PrismaModule` — CommunityMember CRUD
- `NotificationService` — Notify on ban/unban, role change

### Key Business Rules

- Owner cannot be banned or removed
- Admin can manage MEMBER and GUEST roles
- Owner can manage ADMIN roles
- Banned members cannot rejoin without unban
- Member role changes logged to audit trail
- Minimum one owner required at all times

---

## 6. Organizations Module

### Responsibility

Organization CRUD, membership, approval, slug-based lookup.

### Controller Endpoints

| Method | Path                                | Auth                 | Description                    |
| ------ | ----------------------------------- | -------------------- | ------------------------------ |
| POST   | `/organizations`                    | Bearer               | Create organization            |
| GET    | `/organizations`                    | Public               | List organizations (paginated) |
| GET    | `/organizations/:slug`              | Public               | Get organization by slug       |
| PATCH  | `/organizations/:id`                | Bearer (owner/admin) | Update organization            |
| DELETE | `/organizations/:id`                | Bearer (owner)       | Soft delete organization       |
| POST   | `/organizations/:id/join`           | Bearer               | Request to join                |
| POST   | `/organizations/:id/leave`          | Bearer               | Leave organization             |
| POST   | `/organizations/:id/approve-member` | Bearer (admin)       | Approve member                 |
| POST   | `/organizations/:id/reject-member`  | Bearer (admin)       | Reject member                  |
| GET    | `/organizations/:id/members`        | Public               | List members                   |
| PATCH  | `/organizations/:id/status`         | Admin                | Approve/reject org             |

### Service Methods

- `create(ownerId, dto)` → Create organization, auto-assign owner, set PENDING
- `findAll(queryDto)` → Paginated list with filters
- `findBySlug(slug)` → Public org profile
- `update(id, dto)` → Owner/admin update details
- `delete(id)` → Soft delete
- `requestJoin(orgId, userId)` → Membership request
- `leave(orgId, userId)` → Remove membership
- `approveMember(orgId, userId, adminId)` → Approve pending member
- `rejectMember(orgId, userId, adminId)` → Reject pending member
- `listMembers(orgId, queryDto)` → Paginated member list
- `updateStatus(id, status, adminId, reason)` → Admin status change

### Dependencies

- `PrismaModule` — Organization, OrganizationMember, UserRoleAssignment
- `RolesService` — Auto-assign organization roles
- `NotificationService` — Membership notifications
- `UploadsService` — Logo/banner upload

### Key Business Rules

- Same patterns as Communities module (with org-specific fields: industry, size)
- Organization approval required before visibility
- Slug must be unique across platform
- Owner cannot leave without transferring ownership
- Organization events linked via OrganizationEvent junction table

---

## 7. Events Module

### Responsibility

Event CRUD, registration, cancellation, approval, capacity management.

### Controller Endpoints

| Method | Path                        | Auth                     | Description             |
| ------ | --------------------------- | ------------------------ | ----------------------- |
| POST   | `/events`                   | Bearer                   | Create event            |
| GET    | `/events`                   | Public                   | List events (paginated) |
| GET    | `/events/:slug`             | Public                   | Get event by slug       |
| PATCH  | `/events/:id`               | Bearer (creator/manager) | Update event            |
| DELETE | `/events/:id`               | Bearer (creator/manager) | Soft delete event       |
| POST   | `/events/:id/register`      | Bearer                   | Register for event      |
| POST   | `/events/:id/cancel`        | Bearer                   | Cancel registration     |
| POST   | `/events/:id/checkin`       | Bearer (manager)         | Check-in attendee       |
| GET    | `/events/:id/registrations` | Bearer (manager)         | List registrations      |
| PATCH  | `/events/:id/status`        | Admin                    | Approve/reject event    |
| POST   | `/events/:id/feature`       | Admin                    | Toggle featured status  |

### Service Methods

- `create(creatorId, dto)` → Create event, link to community/org if provided
- `findAll(queryDto)` → Paginated list with filters (category, date range, online/offline)
- `findBySlug(slug)` → Public event detail with registration count
- `update(id, dto)` → Creator/manager update event
- `delete(id)` → Soft delete
- `register(eventId, userId)` → Register for event, check capacity
- `cancelRegistration(eventId, userId)` → Cancel registration
- `checkIn(eventId, userId, managerId)` → Mark attendee as checked in
- `listRegistrations(eventId, queryDto)` → Paginated attendee list
- `updateStatus(id, status, adminId, reason)` → Admin approve/reject
- `toggleFeature(id)` → Admin: toggle featured status

### Dependencies

- `PrismaModule` — Event, EventRegistration, CommunityEvent, OrganizationEvent
- `NotificationService` — Registration confirmation, event updates
- `CommunitiesService` — Validate community exists
- `OrganizationsService` — Validate organization exists

### Key Business Rules

- Event must have startDate < endDate
- Capacity enforced: reject registration when full
- registrationDeadline must be before startDate
- DRAFT events not visible in public listings
- Creator can manage their own events
- EVENT_MANAGER role required for managing community/org events
- Cancelled registrations free up capacity
- Checked-in status tracked for attendance analytics

---

## 8. Notifications Module

### Responsibility

In-app notification management: list, mark read, mark all read, create (internal).

### Controller Endpoints

| Method | Path                          | Auth   | Description                           |
| ------ | ----------------------------- | ------ | ------------------------------------- |
| GET    | `/notifications`              | Bearer | List user's notifications (paginated) |
| GET    | `/notifications/unread-count` | Bearer | Get unread notification count         |
| PATCH  | `/notifications/:id/read`     | Bearer | Mark notification as read             |
| PATCH  | `/notifications/read-all`     | Bearer | Mark all notifications as read        |
| DELETE | `/notifications/:id`          | Bearer | Delete notification                   |

### Service Methods

- `list(userId, queryDto)` → Paginated notifications (newest first)
- `getUnreadCount(userId)` → Count of unread notifications
- `markAsRead(notificationId, userId)` → Mark single notification as read
- `markAllAsRead(userId)` → Mark all as read
- `delete(notificationId, userId)` → Delete single notification
- `create(userId, dto)` → Internal: create notification (called by other services)

### Dependencies

- `PrismaModule` — Notification CRUD

### Key Business Rules

- Users can only see/modify their own notifications
- Read timestamp (readAt) set when marked as read
- Notifications ordered by createdAt descending
- Delete only hides from user; data retained for audit
- Notification creation is internal only (no public endpoint)
- Unread count cached in memory (5 min TTL)

---

## 9. Reports Module

### Responsibility

Content reporting: submit report, list reports (admin), resolve/dismiss.

### Controller Endpoints

| Method | Path                   | Auth                   | Description             |
| ------ | ---------------------- | ---------------------- | ----------------------- |
| POST   | `/reports`             | Bearer                 | Submit a report         |
| GET    | `/reports`             | Admin (PLATFORM_ADMIN) | List all reports        |
| GET    | `/reports/:id`         | Admin                  | Get report detail       |
| PATCH  | `/reports/:id/resolve` | Admin                  | Resolve report          |
| PATCH  | `/reports/:id/dismiss` | Admin                  | Dismiss report          |
| GET    | `/reports/my-reports`  | Bearer                 | List user's own reports |

### Service Methods

- `submit(reporterId, dto)` → Create report (targetType + targetId)
- `findAll(queryDto)` → Admin: paginated report list with filters
- `findOne(id)` → Admin: report detail with target info
- `resolve(id, adminId, resolution)` → Resolve report, take action on target
- `dismiss(id, adminId, reason)` → Dismiss report as false positive
- `listMyReports(userId, queryDto)` → User's submitted reports

### Dependencies

- `PrismaModule` — Report CRUD
- `NotificationService` — Notify reporter on resolution
- `CommunitiesService` — Validate/act on reported community content
- `OrganizationsService` — Validate/act on reported org content
- `EventsService` — Validate/act on reported events

### Key Business Rules

- Users can only submit reports, not view others' reports
- targetType: USER, COMMUNITY, ORGANIZATION, EVENT, POST
- Duplicate reports (same user + target) rejected
- Resolution includes action taken (warning, content removal, account suspension)
- Report status: PENDING → RESOLVED or DISMISSED
- Reporter notified when report is resolved or dismissed

---

## 10. Admin Module

### Responsibility

Platform administration: dashboard stats, user management, role assignment, platform settings, audit logs.

### Controller Endpoints

| Method | Path                                   | Auth                   | Description                      |
| ------ | -------------------------------------- | ---------------------- | -------------------------------- |
| GET    | `/admin/dashboard`                     | Admin (PLATFORM_ADMIN) | Dashboard statistics             |
| GET    | `/admin/users`                         | Admin                  | List all users (with filters)    |
| GET    | `/admin/users/:id`                     | Admin                  | Get user detail                  |
| PATCH  | `/admin/users/:id/status`              | Admin                  | Activate/suspend user            |
| POST   | `/admin/users/:id/roles`               | Admin                  | Assign role to user              |
| DELETE | `/admin/users/:id/roles/:assignmentId` | Admin                  | Revoke role                      |
| GET    | `/admin/communities`                   | Admin                  | List all communities             |
| PATCH  | `/admin/communities/:id/status`        | Admin                  | Approve/reject/suspend community |
| GET    | `/admin/organizations`                 | Admin                  | List all organizations           |
| PATCH  | `/admin/organizations/:id/status`      | Admin                  | Approve/reject/suspend org       |
| GET    | `/admin/events`                        | Admin                  | List all events                  |
| PATCH  | `/admin/events/:id/status`             | Admin                  | Approve/reject event             |
| GET    | `/admin/settings`                      | Admin                  | Get all platform settings        |
| PATCH  | `/admin/settings`                      | Admin                  | Update platform settings         |
| GET    | `/admin/audit-logs`                    | Admin                  | Query audit logs                 |

### Service Methods

- `getDashboardStats()` → Aggregate stats: users, communities, orgs, events, reports
- `listUsers(queryDto)` → Paginated user list with role/status filters
- `getUserDetail(id)` → Full user detail with role assignments
- `updateUserStatus(id, status, adminId, reason)` → Activate/suspend user
- `assignRole(dto)` → Assign role to user (platform or scoped)
- `revokeRole(assignmentId)` → Remove role assignment
- `listCommunities(queryDto)` → All communities with status filter
- `updateCommunityStatus(id, status, adminId, reason)` → Approve/reject/suspend
- `listOrganizations(queryDto)` → All organizations with status filter
- `updateOrganizationStatus(id, status, adminId, reason)` → Approve/reject/suspend
- `listEvents(queryDto)` → All events with status filter
- `updateEventStatus(id, status, adminId, reason)` → Approve/reject event
- `getSettings()` → Return all platform settings
- `updateSettings(dto, adminId)` → Update platform settings
- `getAuditLogs(queryDto)` → Query audit logs with filters

### Dependencies

- `PrismaModule` — All entity CRUD
- `RolesService` — Role assignment
- `CommunitiesService` — Community status management
- `OrganizationsService` — Organization status management
- `EventsService` — Event status management
- `NotificationService` — Notify users on status changes

### Key Business Rules

- Only PLATFORM_ADMIN and SUPER_ADMIN can access admin endpoints
- Dashboard stats cached for 5 minutes
- All admin actions logged to audit trail
- Settings changes broadcast via notification (future)
- Bulk operations rate-limited (future)
- Admin cannot demote SUPER_ADMIN (only SUPER_ADMIN can)

---

## 11. Uploads Module

### Responsibility

Presigned URL generation, media asset tracking.

### Controller Endpoints

| Method | Path                     | Auth   | Description                  |
| ------ | ------------------------ | ------ | ---------------------------- |
| POST   | `/uploads/presigned-url` | Bearer | Request presigned upload URL |
| PATCH  | `/uploads/:id/confirm`   | Bearer | Confirm upload completion    |
| GET    | `/uploads/:id`           | Bearer | Get media asset details      |
| DELETE | `/uploads/:id`           | Bearer | Delete media asset           |
| POST   | `/uploads`               | Bearer | Direct upload (small files)  |

### Service Methods

- `requestPresignedUrl(userId, dto)` → Validate, create MediaAsset (PENDING), generate S3 presigned URL
- `confirmUpload(assetId, userId)` → Update status to COMPLETED, return final URL
- `getAsset(id, userId)` → Get media asset metadata
- `deleteAsset(id, userId)` → Delete from S3 and MediaAsset record
- `directUpload(userId, file)` → Upload file directly, create MediaAsset (COMPLETED)

### Dependencies

- `PrismaModule` — MediaAsset CRUD
- `ConfigService` — S3 configuration (bucket, region, credentials)

### Key Business Rules

- File type whitelist: JPEG, PNG, WebP for images; PDF for documents
- Max size: 2MB (avatar), 5MB (banner, event cover, post cover), 10MB (document)
- Presigned URL expiry: 15 minutes for upload
- PENDING assets cleaned up after 30 minutes (scheduled job, future)
- Users can only delete their own assets
- Entity-linked assets: entityType + entityId for relational tracking
- Orphaned assets (no entity link) cleaned periodically

---

## 12. Audit Logs Module

### Responsibility

Audit log querying and creation via interceptor. Logs all mutations for compliance and debugging.

### Controller Endpoints

| Method | Path                           | Auth                   | Description                  |
| ------ | ------------------------------ | ---------------------- | ---------------------------- |
| GET    | `/audit-logs`                  | Admin (PLATFORM_ADMIN) | Query audit logs             |
| GET    | `/audit-logs/:id`              | Admin                  | Get audit log detail         |
| GET    | `/audit-logs/entity/:type/:id` | Admin                  | Get logs for specific entity |

### Service Methods

- `query(queryDto)` → Paginated audit log list with filters
- `findById(id)` → Single audit log detail
- `findByEntity(entityType, entityId)` → All logs for specific entity
- `create(dto)` → Internal: create audit log entry (called by interceptor)

### Dependencies

- `PrismaModule` — AuditLog CRUD

### Key Business Rules

- Only PLATFORM_ADMIN and SUPER_ADMIN can query audit logs
- Audit logs are append-only (no update or delete)
- Old/new values stored as JSON strings
- Retention: 1 year (configurable via settings)
- Indexes on: userId, action, entityType+entityId, createdAt
- Query supports: date range, user filter, action filter, entity filter
- Audit log creation never fails the original request (try/catch in interceptor)

---

## Module Dependency Matrix

| Module            | Depends On                                                                                         |
| ----------------- | -------------------------------------------------------------------------------------------------- |
| Auth              | Prisma, JwtService, EmailAdapter, NotificationService                                              |
| Users             | Prisma, UploadsService, NotificationService                                                        |
| Roles             | Prisma, NotificationService, CommunitiesService, OrganizationsService                              |
| Communities       | Prisma, RolesService, NotificationService, UploadsService                                          |
| Community Members | Prisma, NotificationService                                                                        |
| Organizations     | Prisma, RolesService, NotificationService, UploadsService                                          |
| Events            | Prisma, NotificationService, CommunitiesService, OrganizationsService                              |
| Notifications     | Prisma                                                                                             |
| Reports           | Prisma, NotificationService, CommunitiesService, OrganizationsService, EventsService               |
| Admin             | Prisma, RolesService, CommunitiesService, OrganizationsService, EventsService, NotificationService |
| Uploads           | Prisma, ConfigService                                                                              |
| Audit Logs        | Prisma                                                                                             |
| Contact           | Prisma, NotificationService                                                                        |

---

## 13. Contact Module

### Responsibility

Contact form submissions management: submit inquiry, admin inquiry management.

### Controller Endpoints

| Method | Path                  | Auth                   | Description           |
| ------ | --------------------- | ---------------------- | --------------------- |
| POST   | `/contact`            | Public                 | Submit contact form   |
| GET    | `/contact`            | Admin (PLATFORM_ADMIN) | List all inquiries    |
| GET    | `/contact/:id`        | Admin                  | Get inquiry detail    |
| PATCH  | `/contact/:id/status` | Admin                  | Update inquiry status |

### Service Methods

- `submit(dto)` → Create contact message (name, email, subject, message)
- `findAll(queryDto)` → Admin: paginated inquiry list with status filters
- `findOne(id)` → Admin: inquiry detail
- `updateStatus(id, status, adminId)` → Admin: mark as read/archived

### Dependencies

- `PrismaModule` — ContactMessage CRUD
- `NotificationService` — Notify admin on new inquiry

### Key Business Rules

- Only PLATFORM_ADMIN and SUPER_ADMIN can view inquiries
- Contact form is public (no auth required to submit)
- Status: PENDING, READ, ARCHIVED
- Duplicate submissions rate-limited (5 per email per hour)
- Inquiry content validated for length and format
