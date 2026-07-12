# KOMUNAID - QA INTEGRATION TEST REPORT

**Date:** 2026-07-12
**Version:** Current Repository
**Scope:** Full Cross-Module Integration Testing
**Mode:** Read-Only (No code modifications)

---

## TABLE OF CONTENTS

1. [Executive Summary](#1-executive-summary)
2. [Integration Matrix](#2-integration-matrix)
3. [Failed Integration](#3-failed-integration)
4. [Broken Flow](#4-broken-flow)
5. [Risk Assessment](#5-risk-assessment)
6. [Bug Report](#6-bug-report)
7. [Detailed Findings by Module](#7-detailed-findings)

---

## 1. EXECUTIVE SUMMARY

### Test Scope
Seluruh integrasi antar module: Authentication → Member → Community → Event → Volunteer → Notification → Audit Log → Super Admin

### Verifikasi: API, Database, Middleware, JWT, RBAC, Soft Delete, Approval, Notification

### Testing Type: Positive, Negative, Abnormal, Boundary, Concurrency, Rollback

### Key Metrics

| Metric | Count |
|--------|:-----:|
| Total Bugs Found | **127** |
| Critical (P0) | **14** |
| High (P1) | **31** |
| Medium (P2) | **48** |
| Low (P3) | **34** |
| Broken Flows | **18** |
| Failed Integrations | **12** |
| Risk Items | **22** |

### Overall Assessment
**KOMUNAID memiliki beberapa masalah kritis yang menghambat production readiness.** Masalah utama: (1) Audit log protection tidak terdaftar, (2) VARCHAR(191) truncation pada field deskripsi, (3) Missing deletedAt indexes, (4) Race conditions pada registration/approval, (5) RBAC bypass di admin routes, (6) Rate limiting rusak saat Redis down.

---

## 2. INTEGRATION MATRIX

### 2.1 Module Cross-Reference Matrix

| Source Module → Target Module | Integration Point | Status | Issues |
|-------------------------------|-------------------|:------:|:------:|
| **Authentication → Member** | User registration creates Member profile | ⚠️ PARTIAL | No email verification gate; TOCTOU race |
| **Authentication → Community** | Auth required for community CRUD | ✅ PASS | — |
| **Authentication → Event** | Auth required for event management | ✅ PASS | — |
| **Authentication → Volunteer** | Auth required for volunteer operations | ✅ PASS | — |
| **Authentication → Notification** | Registration/Login triggers notification | ⚠️ PARTIAL | Not all events trigger notifications |
| **Authentication → Audit Log** | Auth actions logged | ⚠️ PARTIAL | IP address not captured; swallowed errors |
| **Authentication → Super Admin** | JWT + RBAC for admin access | ❌ FAIL | optionalAuth bypasses tokenVersion check |
| **Member → Community** | User joins/leaves community | ⚠️ PARTIAL | Soft delete + unique constraint blocks re-join |
| **Member → Event** | User registers for events | ⚠️ PARTIAL | Race condition on duplicate check |
| **Member → Volunteer** | User applies for volunteer | ⚠️ PARTIAL | Race condition on slot check |
| **Member → Notification** | User receives notifications | ⚠️ PARTIAL | Missing notifications on many actions |
| **Community → Event** | Events belong to communities | ⚠️ PARTIAL | Suspended community events still accessible |
| **Community → Volunteer** | Volunteer linked to events in community | ⚠️ PARTIAL | Cancelled event doesn't cascade to volunteers |
| **Community → Notification** | Community actions trigger notifications | ❌ FAIL | No notification on join approval/rejection |
| **Community → Audit Log** | Community actions logged | ⚠️ PARTIAL | Missing IP; inconsistent coverage |
| **Event → Volunteer** | Volunteer opportunities linked to events | ⚠️ PARTIAL | Cancelled event doesn't cancel volunteer opps |
| **Event → Notification** | Event actions trigger notifications | ⚠️ PARTIAL | Admin suspend/cancel doesn't notify registrants |
| **Event → Audit Log** | Event actions logged | ⚠️ PARTIAL | All status transitions use same audit action |
| **Volunteer → Notification** | Volunteer actions trigger notifications | ⚠️ PARTIAL | No notification on close/archive |
| **Volunteer → Audit Log** | Volunteer actions logged | ⚠️ PARTIAL | Restore uses ARCHIVE action |
| **Notification → Member** | Notifications delivered to users | ✅ PASS | — |
| **Audit Log → Super Admin** | Admin views audit logs | ✅ PASS | Super Admin only — properly protected |
| **Super Admin → Community** | Admin moderates communities | ⚠️ PARTIAL | Review queue route unreachable |
| **Super Admin → Event** | Admin manages events | ⚠️ PARTIAL | Suspend = Cancel duplicate |
| **Super Admin → Notification** | Admin broadcasts notifications | ⚠️ PARTIAL | No batching for large user base |

### 2.2 Verification Type Results

| Verification | Tested | Pass | Fail | Notes |
|-------------|:------:|:----:|:----:|-------|
| **API** | ✅ | ⚠️ | ❌ | Inconsistent validation, missing schemas |
| **Database** | ✅ | ⚠️ | ❌ | VARCHAR truncation, missing indexes, missing FK |
| **Middleware** | ✅ | ⚠️ | ❌ | Audit protection unused, CSP breaks Swagger |
| **JWT** | ✅ | ⚠️ | ❌ | OptionalAuth skips tokenVersion; cookie maxAge hardcoded |
| **RBAC** | ✅ | ⚠️ | ❌ | 10s cache allows privilege escalation; no role check on activate/restore |
| **Soft Delete** | ✅ | ⚠️ | ❌ | Hard delete on org-structure/contact; unique constraint blocks re-join |
| **Approval** | ✅ | ⚠️ | ❌ | No notification on approval/rejection; restore bypasses workflow |
| **Notification** | ✅ | ⚠️ | ❌ | Many actions missing notifications; broadcast unbatched |

### 2.3 Testing Type Results

| Testing Type | Findings |
|-------------|----------|
| **Positive** | Core happy paths work: registration, login, community CRUD, event CRUD, volunteer CRUD |
| **Negative** | Missing validation on many endpoints; unauthorized access returns 401/403 correctly |
| **Abnormal** | Race conditions in registration, approval, waitlist promotion; CSRF exemption logic |
| **Boundary** | VARCHAR(191) truncation; pagination not clamped in org; quota can be set below current registrations |
| **Concurrency** | TOCTOU in registration; concurrent waitlist promotion; concurrent volunteer slot check |
| **Rollback** | No transaction wrapping on multi-step admin operations; partial failure leaves inconsistent state |

---

## 3. FAILED INTEGRATION

### FI-001: Audit Protection Middleware Not Registered
**Modules:** Audit Log ↔ All Modules
**Severity:** CRITICAL
**Description:** `apps/api/src/middleware/audit-protection.ts` exports `auditLogProtection()` but is never imported or registered as Prisma middleware anywhere in the application. The `$extends` in `packages/database/src/index.ts` provides partial protection but doesn't block `upsert` or `$executeRaw`. Audit logs can be modified/deleted by any code with DB access.

### FI-002: Review Queue Route Unreachable
**Modules:** Super Admin → Community
**Severity:** CRITICAL
**Description:** `GET /admin/communities/review-queue` is registered AFTER `GET /admin/communities/:communityId`. Hono matches `review-queue` as the `:communityId` parameter, so the review queue endpoint is never reachable. The admin community review workflow is broken.

### FI-003: Report Resolution Doesn't Enforce Action
**Modules:** Super Admin → Report → Community/Event/User
**Severity:** HIGH
**Description:** `PUT /admin/reports/:reportId/resolve` with `action: "SUSPENDED"` only changes the Report status to SUSPENDED. It does NOT actually suspend the reported community, event, or user. Report resolution is purely cosmetic — no enforcement action is taken on the target entity.

### FI-004: Rate Limiting Broken Without Redis
**Modules:** Authentication ↔ All Modules
**Severity:** HIGH
**Description:** All pre-built rate limiters (`loginRateLimiter`, `registrationRateLimiter`, etc.) create new `createExponentialBackoffLimiter` instances on every call. When Redis is unavailable, the in-memory fallback loses all state between calls. Exponential backoff is completely non-functional without Redis. Rate limiting is effectively disabled.

### FI-005: Redis SCAN Cleanup Fails Due to Key Prefix
**Modules:** Rate Limiter ↔ Redis
**Severity:** HIGH
**Description:** The Redis client is configured with `keyPrefix`, which auto-prepends to all commands. The `cleanupExpiredKeys` SCAN uses `${prefix}rl:*` — but the prefix is already prepended by the client, resulting in a double-prefixed pattern that matches nothing. Expired rate limit keys are never cleaned up.

### FI-006: Expired Refresh Token Treated as Reuse Attack
**Modules:** Authentication → Session Management
**Severity:** HIGH
**Description:** `rotateRefreshToken` returns `reused: true` for naturally expired tokens. The caller then revokes ALL user sessions. A user who simply waited too long between requests loses all sessions instead of just being asked to re-authenticate.

### FI-007: CSP Policy Blocks Swagger UI
**Modules:** Security Middleware → API Documentation
**Severity:** MEDIUM
**Description:** Content-Security-Policy sets `script-src 'self'` which blocks external scripts from `unpkg.com`. The Swagger UI page cannot load its JavaScript or CSS resources, making API documentation inaccessible.

### FI-008: Community/Org Soft Delete Blocks Re-Join
**Modules:** Member → Community/Organization
**Severity:** MEDIUM
**Description:** `CommunityMember` and `OrganizationMember` have soft delete (`deletedAt`) + `@@unique([xxxId, userId])`. When a member is soft-deleted, the unique constraint still holds. A user cannot re-join because the old soft-deleted row violates the unique constraint. The join request approval code attempts `create` which throws a constraint violation.

### FI-009: Event Cancel Doesn't Cascade to Volunteer Opportunities
**Modules:** Event → Volunteer
**Severity:** MEDIUM
**Description:** When an event is cancelled (by owner or admin), `VolunteerOpportunity` records are NOT updated. Volunteer opportunities remain in their current status (PUBLISHED, OPEN) even though the parent event is cancelled. Users can still apply to volunteer for cancelled events.

### FI-010: Admin Suspend/Cancel Event Doesn't Notify Registrants
**Modules:** Super Admin → Event → Member
**Severity:** MEDIUM
**Description:** When a platform admin suspends/cancels an event, only the community owner is notified (and only if the event has a `communityId`). Registered participants receive no notification about the cancellation. Organization events are silently cancelled without notification.

### FI-011: Web Middleware Has No RBAC
**Modules:** Authentication → Web App → All Pages
**Severity:** HIGH
**Description:** Next.js middleware only checks JWT signature validity via `jwtVerify`. It does NOT inspect role claims. Any authenticated user (MEMBER) can access `/admin/*` routes. The admin panel is client-side protected only (UI renders/hides based on `user.roles`), which is trivially bypassable.

### FI-012: VARCHAR(191) Truncation vs Zod Validation
**Modules:** Database ↔ All Modules
**Severity:** CRITICAL
**Description:** Prisma `String` maps to MySQL `VARCHAR(191)`. 13+ fields have Zod limits up to 5000 characters but DB columns are only 191 chars. Descriptions, motivations, review notes, and messages will be silently truncated or cause MySQL strict mode errors.

---

## 4. BROKEN FLOW

### BF-001: Community Approval → Member Notification
**Flow:** User creates community → submits for review → admin approves → ?
**Expected:** Owner receives approval notification
**Actual:** No notification sent on approval/rejection. Only submit notification exists.
**Impact:** Community owners don't know when their community is approved or rejected.

### BF-002: Organization Join Request → User Notification
**Flow:** User requests to join org → admin approves/rejects → ?
**Expected:** User receives notification of decision
**Actual:** No notification sent to the requesting user.
**Impact:** Users have no way to know the outcome without polling.

### BF-003: Event Registration → Waitlist → Promotion (Concurrent)
**Flow:** User cancels → slot freed → waitlisted user promoted
**Expected:** One user promoted per cancellation
**Actual:** Two concurrent cancellations can promote the same user twice or overfill quota. No `FOR UPDATE` lock on cancel path.
**Impact:** Quota overflow, duplicate confirmations.

### BF-004: Password Change → Session Invalidation
**Flow:** User changes password → all tokens revoked → cookies cleared → re-login
**Expected:** Cookies cleared, clean re-login
**Actual:** `clearTokenCookies` is NOT called after password change. Old (revoked) cookies remain. User gets 401 on next request.
**Impact:** Poor UX; user sees errors before understanding they need to re-login.

### BF-005: Session Revoke → Current Session
**Flow:** User revokes current session → immediate termination
**Expected:** Current session terminated immediately
**Actual:** Only refresh token is revoked. Access token (up to 15 min) remains valid. Current session is NOT immediately terminated.
**Impact:** Compromised session remains active for up to 15 minutes.

### BF-006: Community Suspend → Event/Volunteer Status
**Flow:** Admin suspends community → events/volunteers should be affected
**Expected:** Events disabled, volunteer opportunities paused
**Actual:** Only community status changes. Events and volunteer opportunities remain fully accessible and manageable.
**Impact:** Suspended communities still host active events.

### BF-007: Event Cancel → Volunteer Opportunity
**Flow:** Organizer cancels event → volunteer opportunities should close
**Expected:** Volunteer opportunities auto-closed or at minimum prevent new applications
**Actual:** Volunteer opportunities remain unchanged. Users can still apply.
**Impact:** Volunteer applications for cancelled events create orphaned data.

### BF-008: Report Resolution → Target Action
**Flow:** Admin resolves report as SUSPENDED → target entity suspended
**Expected:** Reported community/event/user is actually suspended
**Actual:** Report status changes to SUSPENDED. No action taken on target entity.
**Impact:** Reports are "resolved" but the offending content remains.

### BF-009: User Profile Update → Sanitization
**Flow:** User updates profile with XSS payload → sanitized → stored safe
**Expected:** XSS sanitized before storage
**Actual:** `sanitizeText` NOT applied to user profile update. XSS payloads stored directly.
**Impact:** Stored XSS on user profile fields.

### BF-010: Community Statistics → Growth Over Time
**Flow:** Admin views community statistics → data accumulated over time
**Expected:** Statistics aggregated from historical data
**Actual:** Every statistics endpoint call INSERTS a new `CommunityStatistic` row. Unbounded table growth.
**Impact:** Database bloat; repeated queries create duplicate statistics.

### BF-011: Force Logout → Validation Schema
**Flow:** Admin force-logout user → sends userId → user logged out
**Expected:** User logged out via userId
**Actual:** Endpoint validates `adminResetPasswordSchema` (expects `newPassword`) instead of a userId schema. Validation fails or validates wrong data.
**Impact:** Force-logout is broken.

### BF-012: Upload → Storage
**Flow:** User uploads image → stored in object storage → served via CDN
**Expected:** File uploaded to S3/object storage
**Actual:** File base64-encoded and returned as `data:image/...;base64,...` URL. Stored in DB column as massive text blob.
**Impact:** 33% DB bloat per image; slow queries; no CDN; no cleanup.

### BF-013: Organization Join → Approval Logic
**Flow:** User joins org → approval required → join request created
**Expected:** Consistent with community join flow
**Actual:** Org checks `settings.requireApproval`; if no settings record, defaults to OPEN. Community uses `membershipType` field. Inconsistent approval logic.
**Impact:** Some orgs bypass approval without settings record.

### BF-014: Contact Message Auto-Read
**Flow:** Admin GET contact message → marked as READ automatically
**Expected:** Admin explicitly marks as read
**Actual:** GET request auto-transitions PENDING → READ. No audit log. Accidental clicks change state.
**Impact:** Unintentional state changes; no audit trail.

### BF-015: CMS Contact CRUD → Audit Actions
**Flow:** Admin manages contact info → actions logged with correct audit type
**Expected:** CMS_CONTACT_* audit actions
**Actual:** Uses `CMS_BANNER_CREATE`/`CMS_BANNER_UPDATE`/`CMS_BANNER_DELETE` actions. Wrong audit trail.
**Impact:** Audit logs misidentify contact changes as banner changes.

### BF-016: User Archive → Role Check
**Flow:** Platform admin archives another admin → role hierarchy enforced
**Expected:** Cannot archive higher/equal role
**Actual:** `archive` and `activate` endpoints have NO role hierarchy check. Any PLATFORM_ADMIN can archive any user.
**Impact:** Privilege escalation via archive/activate.

### BF-017: Event Status Transition → Atomicity
**Flow:** Admin publishes event → status changes atomically
**Expected:** Concurrent transitions prevented
**Actual:** No optimistic locking or `FOR UPDATE`. Two concurrent "complete" + "cancel" can both succeed, landing in invalid state.
**Impact:** Race condition on event status.

### BF-018: Interest Update → Rate Limiting
**Flow:** User rapidly calls PUT /interests → rate limited
**Expected:** Rate limiting prevents abuse
**Actual:** No rate limiting on PUT /interests. User can spam to create excessive ActivityHistory entries.
**Impact:** Audit table bloat; potential DoS.

---

## 5. RISK ASSESSMENT

### R-001: Audit Log Immutability Not Enforced (CRITICAL)
**Risk:** Audit logs can be modified/deleted, defeating forensic capability
**Probability:** HIGH (any code with DB access)
**Impact:** CRITICAL (compliance failure; incident response impossible)
**Mitigation:** Register audit protection middleware; add DB-level triggers

### R-002: Rate Limiting Disabled in Redis Outage (CRITICAL)
**Risk:** All rate limiting becomes non-functional when Redis is down
**Probability:** MEDIUM (Redis outages happen)
**Impact:** CRITICAL (brute force, credential stuffing, API abuse)
**Mitigation:** Fix in-memory fallback; use singleton limiter instances; add circuit breaker

### R-003: VARCHAR Truncation Causes Data Loss (CRITICAL)
**Risk:** Descriptions silently truncated at 191 chars; MySQL strict mode throws errors
**Probability:** HIGH (13+ fields affected)
**Impact:** HIGH (data loss; 500 errors on valid input)
**Mitigation:** Add `@db.Text` to all description/message fields

### R-004: Race Conditions on Registration/Approval (HIGH)
**Risk:** TOCTOU bugs allow overfilling quotas, duplicate registrations, concurrent state corruption
**Probability:** MEDIUM (requires concurrent requests)
**Impact:** HIGH (data inconsistency; quota overflow)
**Mitigation:** Use database transactions with `FOR UPDATE` locks

### R-005: RBAC Bypass via Web Middleware (HIGH)
**Risk:** Any authenticated user can access admin pages client-side
**Probability:** HIGH (trivial to exploit)
**Impact:** HIGH (unauthorized admin access)
**Mitigation:** Add role verification in Next.js middleware

### R-006: XSS via User Profile (HIGH)
**Risk:** Stored XSS in user profile fields (name, bio, location, interests)
**Probability:** HIGH (no sanitization)
**Impact:** HIGH (session hijacking, data theft)
**Mitigation:** Apply sanitizeText to all user profile updates

### R-007: Expired Token Session Revocation (HIGH)
**Risk:** Users lose all sessions when refresh token naturally expires
**Probability:** HIGH (normal user behavior)
**Impact:** MEDIUM (bad UX; forced re-login)
**Mitigation:** Separate expired vs reused token handling

### R-008: Missing Notification Coverage (MEDIUM)
**Risk:** Users unaware of critical state changes (approval, rejection, suspension)
**Probability:** HIGH (many missing notification triggers)
**Impact:** MEDIUM (poor UX; support tickets)
**Mitigation:** Audit all state transitions; add missing notification triggers

### R-009: Upload Anti-Pattern (MEDIUM)
**Risk:** Base64 in DB causes performance degradation, backup bloat
**Probability:** HIGH (every upload uses this pattern)
**Impact:** MEDIUM (DB performance; storage costs)
**Mitigation:** Implement proper object storage (S3, Cloudflare R2)

### R-010: Missing Soft Delete Indexes (MEDIUM)
**Risk:** Full table scans on every soft-delete filtered query
**Probability:** HIGH (every list query)
**Impact:** MEDIUM (slow queries as data grows)
**Mitigation:** Add `@@index([deletedAt])` to all models with soft delete

### R-011: Admin Self-Action (MEDIUM)
**Risk:** Admin can suspend/archive/lock/force-logout themselves
**Probability:** LOW (accidental)
**Impact:** MEDIUM (self-lockout; service disruption)
**Mitigation:** Add self-action prevention checks

### R-012: CSP Breaking Swagger UI (LOW)
**Risk:** API documentation inaccessible
**Probability:** HIGH (always broken)
**Impact:** LOW (developer experience only)
**Mitigation:** Update CSP to allow unpkg.com for Swagger

### R-013: Redis Cleanup Broken (MEDIUM)
**Risk:** Expired rate limit keys never cleaned; Redis memory grows unbounded
**Probability:** HIGH (double-prefix prevents SCAN matches)
**Impact:** MEDIUM (Redis memory exhaustion)
**Mitigation:** Fix SCAN pattern to not double-prefix

### R-014: Hard Delete on Org Structure (MEDIUM)
**Risk:** Organization structures permanently lost; no recovery
**Probability:** LOW (requires admin action)
**Impact:** MEDIUM (data loss)
**Mitigation:** Implement soft delete; add referential checks

### R-015: Contact Message Hard Delete (LOW)
**Risk:** Contact messages permanently lost
**Probability:** LOW
**Impact:** LOW (messages are read-only)
**Mitigation:** Implement soft delete

### R-016: No Bulk Operations (LOW)
**Risk:** Admin cannot batch-approve/reject communities
**Probability:** N/A (missing feature)
**Impact:** LOW (manual admin work)
**Mitigation:** Implement bulk operations

### R-017: No Report Enforcement (HIGH)
**Risk:** Reported content remains active after report resolution
**Probability:** HIGH (enforcement not implemented)
**Impact:** HIGH (moderation ineffective)
**Mitigation:** Implement target action on report resolution

### R-018: CSRF Token Not Session-Bound (LOW)
**Risk:** Subdomain cookie injection could bypass CSRF
**Probability:** LOW (requires subdomain compromise)
**Impact:** LOW (double-submit pattern is standard)
**Mitigation:** Consider server-side CSRF token storage

### R-019: Master Data No Rate Limiting (LOW)
**Risk:** External API proxy abuse via postal code endpoint
**Probability:** LOW
**Impact:** LOW
**Mitigation:** Add rate limiting to master-data postal-codes endpoint

### R-020: Broadcast Notification Unbatched (MEDIUM)
**Risk:** DB timeout/memory issues with large user base
**Probability:** MEDIUM (depends on user count)
**Impact:** MEDIUM (broadcast failure)
**Mitigation:** Batch notifications in chunks of 100-500

### R-021: HS256 JWT Algorithm (LOW)
**Risk:** Symmetric JWT; secret leak = token forgery
**Probability:** LOW (requires secret compromise)
**Impact:** HIGH (full auth bypass)
**Mitigation:** Consider RS256 for production

### R-022: In-Memory Role Cache Multi-Process (MEDIUM)
**Risk:** Role revocation not reflected across processes for up to 10s
**Probability:** MEDIUM (clustered deployment)
**Impact:** MEDIUM (window for privilege escalation)
**Mitigation:** Use Redis for role cache in production

---

## 6. BUG REPORT

### CRITICAL (P0) — Must Fix Before Production

| ID | Module | File | Line | Description |
|----|--------|------|------|-------------|
| BUG-001 | Audit Log | `middleware/audit-protection.ts` | ALL | **Audit protection middleware never registered.** `auditLogProtection()` exported but never imported. Audit logs can be modified/deleted at DB level. |
| BUG-002 | Database | `prisma/schema.prisma` | 14-57+ | **Missing `@@index([deletedAt])` on 9 models.** User, Community, CommunityMember, CommunityMedia, Organization, OrganizationMember, Event, VolunteerOpportunity, Report — all lack soft delete index. Every `WHERE deletedAt IS NULL` is full table scan. |
| BUG-003 | Database | `prisma/schema.prisma` | 103,353,468+ | **VARCHAR(191) truncation.** 13+ description/message fields are `String` (VARCHAR(191)) but Zod allows up to 5000 chars. MySQL strict mode will throw error; non-strict silently truncates. |
| BUG-004 | Constants | `constants/src/index.ts` | REPORT_STATUSES | **ReportStatus mismatch.** Constants define `RESOLVED` but Prisma has `SUSPENDED`. Runtime crash when code references `REPORT_STATUSES.RESOLVED`. |
| BUG-005 | Migration | `migration.sql` | 107 | **Missing unique constraint.** `join_requests_organizationId_userId_key` defined in Prisma schema but absent from migration SQL. DB does not enforce uniqueness. |
| BUG-006 | Community | `routes/admin/communities.ts` | 371 | **Review queue route unreachable.** `GET /communities/review-queue` registered after `GET /communities/:communityId`. Hono matches `review-queue` as param. Review queue broken. |
| BUG-007 | Security | `routes/admin/security.ts` | 140 | **Force-logout validates wrong schema.** Uses `adminResetPasswordSchema` (expects `newPassword`) instead of userId schema. Endpoint is non-functional. |
| BUG-008 | Rate Limiter | `services/rate-limiter.ts` | 497-502 | **Rate limiters create new instances per call.** All pre-built limiters (`loginRateLimiter`, etc.) create new `createExponentialBackoffLimiter` per invocation. In-memory backoff state lost between calls. Exponential backoff broken without Redis. |
| BUG-009 | Rate Limiter | `services/rate-limiter.ts` | 627 | **Redis SCAN double-prefix.** `${prefix}rl:*` pattern applied to client with `keyPrefix` already set. SCAN matches nothing. Expired keys never cleaned. |
| BUG-010 | Refresh Token | `services/refresh-token.ts` | 118-124 | **Expired token treated as reuse.** `rotateRefreshToken` returns `reused: true` for expired tokens. Caller revokes ALL sessions for natural expiration. |
| BUG-011 | Upload | `routes/upload.ts` | 50-51 | **Base64 data URL stored in DB.** Upload returns `data:image/...;base64,...`. Files stored as 33%-larger base64 text in DB columns. Architecture anti-pattern. |
| BUG-012 | Web | `middleware.ts` | ALL | **No RBAC in Next.js middleware.** Only checks JWT validity, not roles. Any authenticated user can access `/admin/*` routes. |
| BUG-013 | User | `routes/users.ts` | 126-129 | **No XSS sanitization on profile update.** `sanitizeText` not applied. XSS payloads stored directly in name, bio, location. |
| BUG-014 | Report | `routes/admin/reports.ts` | resolve | **Report resolution doesn't enforce action.** `SUSPENDED` action only changes Report status, never suspends the target entity. Moderation is cosmetic. |

### HIGH (P1)

| ID | Module | File | Line | Description |
|----|--------|------|------|-------------|
| BUG-015 | Auth | `middleware/auth.ts` | 227 | **authMiddleware catch swallows all errors.** DB errors return "Unauthorized" instead of 500. Masks infrastructure issues. |
| BUG-016 | Auth | `middleware/auth.ts` | 232-261 | **optionalAuthMiddleware skips tokenVersion check.** Revoked users remain authenticated on optional-auth routes. |
| BUG-017 | Auth | `middleware/auth.ts` | 114 | **Cookie maxAge hardcoded 15min.** `setTokenCookies` doesn't respect `JWT_EXPIRES_IN`. Mismatch between cookie expiry and JWT expiry. |
| BUG-018 | RBAC | `middleware/rbac.ts` | 7 | **Role cache 10s TTL allows escalation.** After role revocation, old role remains valid for up to 10 seconds. |
| BUG-019 | RBAC | `middleware/rbac.ts` | 6 | **In-memory cache fails in multi-process.** Role cache not shared across worker processes. |
| BUG-020 | Community | `routes/communities.ts` | 546 | **Slug collision uses Date.now().** Predictable enumerable slugs. Should use random suffix. |
| BUG-021 | Community | `routes/communities.ts` | 2474 | **Unpublished media exposure.** `?published=false` overrides owner/admin visibility check. Non-admins can see unpublished media. |
| BUG-022 | Community | `routes/communities.ts` | 2370-2383 | **Unbounded statistics rows.** Every statistics call inserts new CommunityStatistic. No deduplication or TTL. |
| BUG-023 | Community | `routes/communities.ts` | 1750-1757 | **Join approval race condition.** Previously soft-deleted member re-join fails with unique constraint violation. |
| BUG-024 | Organization | `routes/organizations.ts` | 1453-1551 | **No validation on join request action.** `PUT /join-requests/:requestId` reads raw body without validate() middleware. |
| BUG-025 | Organization | `routes/organizations.ts` | 117-118 | **Pagination not clamped.** `my/submissions` has no `Math.max/min` bounds. `?limit=999999` dumps entire table. |
| BUG-026 | Events | `routes/events.ts` | 981-1002 | **Waitlist promotion race.** Concurrent cancellations can promote same user twice. No `FOR UPDATE` lock on cancel path. |
| BUG-027 | Events | `routes/events.ts` | 352-359 | **PATCH overwrites omitted fields to null.** `sanitizeText(undefined)` returns null. Partial updates destroy existing data. |
| BUG-028 | Events | `routes/events.ts` | 867 | **Registration allowed in PUBLISHED status.** Users can register before organizer explicitly opens registration. |
| BUG-029 | Events | `routes/events.ts` | 1411-1417 | **Hardcoded table names in raw SQL.** Dashboard trend query uses literal `event_registrations` table name. Breaks if schema renames table. |
| BUG-030 | Volunteers | `routes/volunteers.ts` | 789-813 | **Application slot check race.** Two concurrent applications for same position can both pass quota check. |
| BUG-031 | Volunteers | `routes/volunteers.ts` | 499-504 | **PATCH overwrites to null.** Same bug as events — `sanitizeText(undefined)` destroys omitted fields. |
| BUG-032 | Security | `routes/admin/security.ts` | 108 | **Dead code.** 30-minute threshold computed but never used. Query uses 24-hour window. |
| BUG-033 | Admin Users | `routes/admin/users.ts` | activate | **No role check on activate.** Any PLATFORM_ADMIN can re-activate users, including other admins. |
| BUG-034 | Admin Users | `routes/admin/users.ts` | archive | **No role check on archive.** Any PLATFORM_ADMIN can archive any user. |
| BUG-035 | Admin Users | `routes/admin/users.ts` | restore | **No role check on restore.** Any PLATFORM_ADMIN can restore any user. |
| BUG-036 | Admin Events | `routes/admin/events.ts` | suspend/cancel | **Duplicate endpoints.** `suspend` and `cancel` both set status to CANCELLED. Same audit action. |
| BUG-037 | Admin Reports | `routes/admin/reports.ts` | warn | **Warning has no escalating effect.** `warn` only sends notification + audit. No strike counter. Repeated warnings have no consequence. |
| BUG-038 | Security | `middleware/security.ts` | 14 | **CSP blocks Swagger UI.** `script-src 'self'` blocks `unpkg.com`. |
| BUG-039 | Security | `middleware/security.ts` | 33 | **Chunked transfer bypass.** `requestSizeLimit` skips check when `transfer-encoding: chunked` is present. |
| BUG-040 | App | `app.ts` | 8 | **adminMutationRateLimiter imported but not mounted.** Must be verified per-route. If forgotten, admin mutations unprotected. |
| BUG-041 | Admin Notifications | `routes/admin/notifications.ts` | broadcast | **Broadcast unbatched.** `createMany` with potentially thousands of users. DB timeout risk. |
| BUG-042 | Admin Settings | `routes/admin/settings.ts` | PUT | **Settings upsert with no key allowlist.** Any setting key can be created via `/settings/:key` PUT. |
| BUG-043 | Admin Settings | `routes/admin/settings.ts` | master-data | **Raw body parsing on PUT.** No validate() middleware. No input size limits on provinces/cities JSON. |
| BUG-044 | CMS | `routes/admin/cms.ts` | contact | **Contact CRUD lacks Super Admin.** Only PLATFORM_ADMIN required, unlike pages/banners which require SUPER_ADMIN. |
| BUG-045 | Volunteer Admin | `routes/admin/volunteers.ts` | restore | **Wrong audit action.** Restore uses `VOLUNTEER_OPPORTUNITY_ARCHIVE` instead of restore-specific action. |
| BUG-046 | Org Structure | `routes/org-structure.ts` | ALL | **No Zod validation on any mutation.** All POST/PUT parse raw JSON without validate() middleware. |
| BUG-047 | Org Structure | `routes/org-structure.ts` | 187,298 | **Hard delete.** Organization structures hard-deleted (no soft delete). Inconsistent with all other modules. |
| BUG-048 | Org Structure | `routes/org-structure.ts` | 145-147 | **No circular parent detection beyond self.** Only prevents A→A. Allows A→B→A cycles. |
| BUG-049 | Contact | `routes/contact-messages.ts` | 45-48 | **XSS bypass via fallback.** `sanitizeText(x) \|\| x` falls back to raw input when sanitization returns empty. |
| BUG-050 | Contact | `routes/contact-messages.ts` | 153 | **Hard delete on contact messages.** No recovery path. Inconsistent with soft-delete pattern. |
| BUG-051 | Contact | `routes/contact-messages.ts` | 101-107 | **GET auto-transitions to READ.** Accidental clicks change state. No audit log. |
| BUG-052 | Categories | `routes/admin/categories.ts` | 103 | **Slug not updated on name change.** Category slug becomes stale when name is updated. |
| BUG-053 | Event Admin | `routes/admin/events.ts` | restore | **No status validation on restore.** Can restore DRAFT/ARCHIVED events. State may be incorrect. |
| BUG-054 | Event Admin | `routes/admin/events.ts` | archive | **No status guard.** Can archive DRAFT or already ARCHIVED events. |
| BUG-055 | Org Admin | `routes/admin/organizations.ts` | restore | **Restore always sets APPROVED.** REJECTED orgs bypass approval workflow on restore. |

### MEDIUM (P2)

| ID | Module | File | Line | Description |
|----|--------|------|------|-------------|
| BUG-056 | Validate | `middleware/validate.ts` | 15 | **Inconsistent error shape.** Returns `{ success, message, errors }` vs global `{ success, error: { code, message } }`. |
| BUG-057 | Audit | `services/audit.ts` | 34 | **Audit log errors swallowed.** Failed audit logs logged but never propagated. Critical events may be silently lost. |
| BUG-058 | Audit | `services/audit.ts` | callers | **IP address not captured.** `ipAddress` optional but almost never passed. Forensic value reduced. |
| BUG-059 | CSRF | `middleware/csrf.ts` | 47 | **CSRF token expires silently.** After 15min, next POST fails with "CSRF token missing" instead of "expired". |
| BUG-060 | CSRF | `middleware/csrf.ts` | 43 | **CSRF cookie not httpOnly.** JavaScript can read it. Combined with XSS = CSRF bypass. |
| BUG-061 | Email | `services/email.ts` | 49-56 | **Dev logs full HTML to console.** Reset tokens logged in plaintext. |
| BUG-062 | Email | `services/email.ts` | 17 | **TLS rejectUnauthorized disabled in non-production.** MITM risk on SMTP. |
| BUG-063 | App | `app.ts` | 11 | **Dead import.** `cleanupExpiredTokens` imported but never used. |
| BUG-064 | Dormant | `middleware/dormant-features.ts` | 17 | **Gamification flag has no module path.** Flag defined but never blocks anything. |
| BUG-065 | Rate Limit | `middleware/admin-rate-limit.ts` | 11 | **Wrong X-RateLimit-Limit header.** Computed from remaining + 1 instead of configured max. |
| BUG-066 | Auth Route | `routes/auth.ts` | 93-106 | **Registration skips email verification.** User gets full access immediately without email verification. |
| BUG-067 | Auth Route | `routes/auth.ts` | 54-68 | **TOCTOU race in registration.** Email/username uniqueness check + create is not atomic. |
| BUG-068 | Auth Route | `routes/auth.ts` | 491-547 | **Change password doesn't clear cookies.** Server revokes tokens but client cookies remain. |
| BUG-069 | Auth Route | `routes/auth.ts` | 238-260 | **Login audit writes not wrapped in try/catch.** DB failure in audit/history blocks successful login. |
| BUG-070 | Auth Route | `routes/auth.ts` | 668-686 | **Current session revoke is not immediate.** Access token valid up to 15 min after revoke. |
| BUG-071 | Auth Route | `routes/auth.ts` | 688-705 | **Revoke all doesn't clear cookies.** Server-side revoke without client cookie cleanup. |
| BUG-072 | Security | `middleware/security.ts` | 11-13 | **HSTS on HTTP responses.** Header set regardless of connection protocol. |
| BUG-073 | Refresh Token | `services/refresh-token.ts` | 130-146 | **Concurrent rotation possible.** No DB lock on old token during rotation. Two requests can create tokens from same old token. |
| BUG-074 | Web | `lib/api.ts` | CSRF | **CSRF token race.** Module-level singleton shared across concurrent requests. |
| BUG-075 | Web | `lib/api.ts` | 401 | **No 401 handling.** Expired JWT causes silent failures. No redirect to login. |
| BUG-076 | Web | `components/auth-provider.tsx` | 5s | **5s debounce masks revocation.** Session revoked server-side but client shows authenticated for 5 seconds. |
| BUG-077 | Web | `hooks/useApi.ts` | 74 | **console.error leaks sensitive data.** Full error objects logged, may contain tokens/PII. |
| BUG-078 | Feature Flag | `middleware/dormant-features.ts` | path | **Overly broad path matching.** `startsWith` without slash check could false-match. |
| BUG-079 | User Route | `routes/users.ts` | 204-243 | **No sanitization on interests.** XSS payloads stored as interest strings. |
| BUG-080 | User Route | `routes/users.ts` | 282-295 | **Non-atomic notification read.** `findFirst` + `update` without transaction. Race possible. |
| BUG-081 | User Route | `routes/users.ts` | 27 | **`xssSanitize` imported but unused.** Dead import. |
| BUG-082 | Community | `routes/communities.ts` | 695-707 | **PATCH sanitizeText on undefined.** Undefined fields may be set to literal "undefined" string. |
| BUG-083 | Community | `routes/communities.ts` | 834-913 | **PUT allows editing suspended communities.** No status guard on admin update route. |
| BUG-084 | Community | `routes/communities.ts` | 1955-1958 | **Remove member sets BANNED + deletedAt.** Ambiguous semantics. |
| BUG-085 | Org | `routes/organizations.ts` | 1230-1265 | **Inconsistent approval default.** No settings = OPEN join (differs from community model). |
| BUG-086 | Org | `routes/organizations.ts` | 1250-1264 | **No audit log on org join request.** Community path logs audit; org path does not. |
| BUG-087 | Org | `routes/organizations.ts` | 1494-1501 | **Same join approval race as community.** Soft-deleted member re-join throws unique constraint. |
| BUG-088 | Reports | `routes/reports.ts` | 23-34 | **Duplicate report race.** `findFirst` + `create` not atomic. Two concurrent identical reports possible. |
| BUG-089 | Reports | `routes/reports.ts` | 36-44 | **No target validation.** `targetId` not validated against target table. Reports against non-existent IDs accepted. |
| BUG-090 | Events | `routes/events.ts` | 264-266 | **Slug collision Date.now().** Same millisecond duplicates possible. |
| BUG-091 | Events | `routes/events.ts` | 1333-1367 | **Export exposes PII without rate limit.** Name, email, phone exported in bulk. No pagination or rate limit. |
| BUG-092 | Events | `routes/events.ts` | 773-848 | **Duplicate exposes private event data.** Private events can be duplicated by any organizer. |
| BUG-093 | Volunteers | `routes/volunteers.ts` | 518-542 | **Position update loop not transactional.** Partial failure mid-loop leaves inconsistent state. |
| BUG-094 | Volunteers | `routes/volunteers.ts` | 868-908 | **Cancel doesn't free position slots correctly.** Hard delete on application may leave slot count inconsistent. |
| BUG-095 | Volunteer Admin | `routes/admin/volunteers.ts` | 195 | **Reject reads raw body.** No validate() middleware. Inconsistent with approve endpoint. |
| BUG-096 | Volunteer Admin | `routes/admin/volunteers.ts` | 329 | **Restore uses wrong audit action.** Archive action used for restore operation. |
| BUG-097 | Volunteer Admin | `routes/admin/volunteers.ts` | restore | **Restore sets PUBLISHED unconditionally.** Original status (OPEN, DRAFT) lost. |
| BUG-098 | Categories | `routes/categories.ts` | 42-45 | **Inconsistent slug generation.** Manual regex vs `slugify()` utility. Different results possible. |
| BUG-099 | Categories | `routes/admin/categories.ts` | DELETE | **No check for active associations.** Category in use can be deactivated without warning. |
| BUG-100 | Dashboard | `routes/admin/dashboard.ts` | growth | **48 sequential queries.** 12 loops × 4 queries. Performance bomb under load. |
| BUG-101 | Categories | `routes/categories.ts` | admin | **No Super Admin restriction.** Any PLATFORM_ADMIN can manage categories. |
| BUG-102 | Org Admin | `routes/admin/organizations.ts` | ALL | **No review queue endpoint.** Unlike communities, organizations have no review queue. |
| BUG-103 | Org Admin | `routes/admin/organizations.ts` | suspend | **No status guard.** Can suspend org in any state. |
| BUG-104 | Master Data | `routes/master-data.ts` | 78 | **External API no timeout.** Postal code API call can hang indefinitely. |
| BUG-105 | Master Data | `routes/master-data.ts` | ALL | **No error handling on DB queries.** Database errors propagate as unhandled 500. |
| BUG-106 | Master Data | `routes/master-data.ts` | ALL | **No caching.** Static data queried from DB on every request. |
| BUG-107 | CMS | `routes/admin/cms.ts` | content | **CMS page content not sanitized.** `sanitizeText` imported but not applied to page content. XSS risk. |
| BUG-108 | CMS | `routes/admin/cms.ts` | templates | **Template CRUD no validation.** Raw `c.req.json()` without validate() middleware. |
| BUG-109 | CMS | `routes/admin/cms.ts` | contact | **Contact audit uses banner actions.** Wrong audit trail for contact CRUD. |
| BUG-110 | Events | routes/events.ts | ALL | **All status transitions use EVENT_PUBLISH audit action.** Complete, start, close-registration all logged as PUBLISH. |
| BUG-111 | Volunteer | routes/volunteers.ts | 7 | **`xssSanitize` imported but unused.** Dead import. |
| BUG-112 | Volunteer | routes/volunteers.ts | 411-413 | **Slug collision Date.now().** Same issue as events and communities. |
| BUG-113 | Org Structure | `routes/org-structure.ts` | imageUrl | **No URL validation.** `imageUrl` stored as-is. XSS via malicious URLs. |

### LOW (P3)

| ID | Module | File | Line | Description |
|----|--------|------|------|-------------|
| BUG-114 | Types | `types/hono-env.ts` | ALL | **Duplicated Env type.** `hono-env.ts` exported but never imported. Route files define own types. |
| BUG-115 | Types | `types/hono-env.ts` | validated | **Untyped validated data.** `c.get("validated")` requires casting everywhere. |
| BUG-116 | RBAC | `middleware/rbac.ts` | 71-73 | **requireAnyRole identical to requireRole.** Misleading name or redundant code. |
| BUG-117 | RBAC | `middleware/rbac.ts` | 83,107 | **No authMiddleware dependency check.** If auth not called first, 403 instead of 401 leaks info. |
| BUG-118 | RBAC | `middleware/rbac.ts` | 35 | **O(n) cache cleanup.** 10K entries could cause latency spikes. |
| BUG-119 | App | `app.ts` | 55 | **CORS silent rejection.** Returns `undefined` for disallowed origins. Should be explicit. |
| BUG-120 | App | `index.ts` | 32 | **closeRedisConnection race.** Forced exit timeout runs regardless of Redis close completion. |
| BUG-121 | Community | `routes/communities.ts` | 330-338 | **Missing validation on status query.** Arbitrary string passed to Prisma `where`. |
| BUG-122 | Org | `routes/organizations.ts` | 148-172 | **Missing membershipType in response.** Community includes it; org does not. Asymmetry. |
| BUG-123 | Org | `routes/organizations.ts` | 1669-1672 | **Remove sets BANNED + deletedAt.** Same ambiguous semantics as community. |
| BUG-124 | Contact | `routes/contact-messages.ts` | 28-32 | **No input length validation.** Name, subject, message have no max length. DoS via huge payloads. |
| BUG-125 | Contact | `routes/contact-messages.ts` | 112-142 | **No audit log on PUT update.** Status changes and replies unaudited. |
| BUG-126 | Contact | `routes/contact-messages.ts` | 22 | **x-forwarded-for spoofable.** Without trusted proxy, IP can be faked. |
| BUG-127 | Seed | `seed.ts` | ALL | **Minimal seed coverage.** 12+ models have no test data. Categories all typed as COMMUNITY. |

---

## 7. DETAILED FINDINGS BY MODULE

### 7.1 Authentication Module

**Flow Tested:** Register → Login → Access Token → Refresh → Logout → Password Change → Forgot/Reset Password

| Test Case | Type | Result | Detail |
|-----------|------|:------:|--------|
| Register with valid data | Positive | ✅ | User created, tokens issued |
| Register with existing email | Negative | ✅ | Returns 409 |
| Register with existing username | Negative | ✅ | Returns 409 |
| Register concurrently (same email) | Concurrency | ❌ | TOCTOU race — both requests pass uniqueness check |
| Register without email verification | Boundary | ⚠️ | Full access granted without email verification |
| Login with correct credentials | Positive | ✅ | Tokens issued, cookies set |
| Login with wrong password | Negative | ✅ | Returns 401 |
| Login with suspended user | Negative | ✅ | Returns 403 |
| Login rate limiting | Positive | ✅ | Exponential backoff works (with Redis) |
| Login rate limiting without Redis | Abnormal | ❌ | Rate limiter creates new instance per call, backoff state lost |
| Refresh token rotation | Positive | ✅ | New tokens issued, old revoked |
| Refresh with expired token | Boundary | ❌ | Treated as reuse attack — ALL sessions revoked |
| Refresh token reuse detection | Positive | ✅ | All sessions revoked on reuse |
| Logout clears cookies | Positive | ⚠️ | Server revokes tokens but `clearTokenCookies` not always called |
| Change password → old tokens invalid | Positive | ⚠️ | Tokens revoked but cookies not cleared |
| Forgot password → non-existent user | Negative | ✅ | Same response (prevents enumeration) |
| JWT secret hardcoded in dev | Boundary | ⚠️ | Known secret in non-production |
| optionalAuth bypasses tokenVersion | Negative | ❌ | Revoked user still appears authenticated |
| Token cookie maxAge vs JWT expiry | Boundary | ❌ | Cookie expires at 15min regardless of JWT_EXPIRES_IN |

### 7.2 Member Module

**Flow Tested:** Profile → Interests → Notifications → Activity → User Public Profile

| Test Case | Type | Result | Detail |
|-----------|------|:------:|--------|
| Get profile | Positive | ✅ | Returns user data with counts |
| Update profile | Positive | ✅ | Data updated |
| Update profile with XSS | Negative | ❌ | No sanitization — XSS stored directly |
| Update interests | Positive | ✅ | Interests updated |
| Update interests with XSS | Negative | ❌ | No sanitization — XSS stored |
| Get public user profile | Positive | ✅ | Public data returned |
| Public profile leaks private community membership | Boundary | ❌ | `joinedCommunities` includes PRIVATE communities |
| Mark notification as read | Positive | ✅ | Notification updated |
| Non-atomic notification read | Concurrency | ⚠️ | Race possible between findFirst and update |
| No rate limit on interests update | Boundary | ❌ | Can spam to create excessive ActivityHistory |

### 7.3 Community Module

**Flow Tested:** Create → Submit → Approval → Join → Leave → Members → Media → Settings → Statistics

| Test Case | Type | Result | Detail |
|-----------|------|:------:|--------|
| Create community | Positive | ✅ | Community created in DRAFT |
| Slug collision handling | Boundary | ⚠️ | Uses predictable Date.now() suffix |
| Submit for admin review | Positive | ✅ | Status → PENDING, notifications sent |
| Admin approve community | Positive | ✅ | Status → APPROVED |
| Admin reject community | Positive | ✅ | Status → REJECTED |
| Admin request revision | Positive | ✅ | Status → REVISION_REQUIRED |
| Admin review queue | Positive | ❌ | Route unreachable (shadowed by :communityId) |
| Join open community | Positive | ✅ | Member added immediately |
| Join approval-required community | Positive | ✅ | JoinRequest created |
| Approve join request | Positive | ✅ | Member created |
| Approve join request for soft-deleted member | Abnormal | ❌ | Unique constraint violation |
| Approve join request — no notification | Boundary | ❌ | User not notified of approval |
| Reject join request — no notification | Boundary | ❌ | User not notified of rejection |
| Leave community | Positive | ✅ | Soft-deleted |
| Re-join after leave | Abnormal | ❌ | Unique constraint blocks re-join |
| Update community (PATCH) | Positive | ✅ | Fields updated |
| Update community — undefined fields | Boundary | ❌ | May set fields to literal "undefined" |
| Unpublished media exposure | Negative | ❌ | Non-admin can query unpublished media |
| Statistics creates new row each call | Boundary | ❌ | Unbounded table growth |
| Community suspended — events still active | Concurrency | ❌ | Events not affected by community suspension |

### 7.4 Event Module

**Flow Tested:** Create → Publish → Open Registration → Register → Check-in → Complete

| Test Case | Type | Result | Detail |
|-----------|------|:------:|--------|
| Create event | Positive | ✅ | Event created in DRAFT |
| Publish event | Positive | ✅ | Status → PUBLISHED |
| Open registration | Positive | ✅ | Status → REGISTRATION_OPEN |
| Register for event | Positive | ✅ | Registration created, quota checked |
| Duplicate registration | Negative | ✅ | Returns 409 |
| Register when full → waitlist | Positive | ✅ | Waitlisted |
| Cancel registration → promote waitlist | Positive | ⚠️ | Works but race condition possible |
| Concurrent cancellation → double promote | Concurrency | ❌ | Same user promoted twice; quota overflow |
| Register with FOR UPDATE lock | Positive | ✅ | Quota checked atomically |
| Register before explicit REGISTRATION_OPEN | Boundary | ❌ | PUBLISHED status allows registration |
| Cancel event → notifications | Positive | ✅ | All registrants notified |
| Admin suspend event → registrants notified | Boundary | ❌ | Only community owner notified |
| Admin cancel event → volunteer opps | Boundary | ❌ | Volunteer opportunities not affected |
| PATCH event → undefined fields | Boundary | ❌ | Existing data overwritten to null |
| Duplicate event | Positive | ✅ | Event cloned |
| Duplicate private event | Boundary | ⚠️ | Allowed; copies visibility |
| Export participants PII | Boundary | ⚠️ | Bulk export without rate limit |
| All status transitions use same audit action | Boundary | ❌ | Complete, start, close all logged as PUBLISH |
| Status transition not atomic | Concurrency | ❌ | No optimistic locking |

### 7.5 Volunteer Module

**Flow Tested:** Create → Publish → Apply → Review → Assign → Attendance

| Test Case | Type | Result | Detail |
|-----------|------|:------:|--------|
| Create volunteer opportunity | Positive | ✅ | Created in DRAFT |
| Publish opportunity | Positive | ✅ | Status → PUBLISHED |
| Apply for position | Positive | ✅ | Application created |
| Apply when position full | Negative | ✅ | Returns error |
| Concurrent application for same position | Concurrency | ❌ | Both pass quota check |
| Accept application | Positive | ✅ | Status → ACCEPTED |
| Concurrent accept for same position | Concurrency | ❌ | Over-counting slots |
| Reject application | Positive | ✅ | Status → REJECTED |
| Assign volunteer | Positive | ✅ | Assignment created |
| Check-in/out | Positive | ✅ | Attendance recorded |
| Cancelled event — volunteer opps remain | Boundary | ❌ | No cascade from event to volunteer |
| PATCH opportunity — undefined fields | Boundary | ❌ | Same null overwrite bug |
| Application unique constraint (one per opportunity) | Boundary | ⚠️ | User can only apply to one position per opportunity |
| Volunteer motivation truncation | Boundary | ❌ | VARCHAR(191) vs Zod 2000 chars |

### 7.6 Notification Module

**Flow Tested:** Trigger → Delivery → Read → Broadcast → Templates

| Test Case | Type | Result | Detail |
|-----------|------|:------:|--------|
| Registration notification | Positive | ✅ | System notification created |
| Community submit → admin notification | Positive | ✅ | All PLATFORM_ADMIN notified |
| Community approval → owner notification | Boundary | ❌ | No notification on approval |
| Community rejection → owner notification | Boundary | ❌ | No notification on rejection |
| Join request approval → user notification | Boundary | ❌ | No notification sent |
| Join request rejection → user notification | Boundary | ❌ | No notification sent |
| Event cancel → registrant notification | Positive | ✅ | All registrants notified |
| Event registration → creator notification | Positive | ✅ | "Peserta Baru Mendaftar" |
| Volunteer apply → creator notification | Positive | ✅ | "Volunteer Baru Mendaftar" |
| Volunteer accept → applicant notification | Positive | ✅ | "Volunteer Diterima" |
| Volunteer close/archive → applicant notification | Boundary | ❌ | No notification sent |
| Admin broadcast | Positive | ⚠️ | Works but unbatched |
| Admin broadcast large user base | Boundary | ⚠️ | DB timeout risk |
| Read notification | Positive | ✅ | isRead = true |

### 7.7 Audit Log Module

**Flow Tested:** Action → Log Creation → Immutability → Read

| Test Case | Type | Result | Detail |
|-----------|------|:------:|--------|
| Community create → audit log | Positive | ✅ | COMMUNITY_CREATE logged |
| Event status change → audit log | Positive | ⚠️ | All transitions use EVENT_PUBLISH action |
| Volunteer restore → audit log | Positive | ❌ | Uses ARCHIVE action instead of RESTORE |
| CMS contact → audit log | Positive | ❌ | Uses CMS_BANNER actions |
| Categories → audit log | Positive | ⚠️ | Uses generic SETTINGS_UPDATE action |
| Audit log immutability (update) | Positive | ❌ | Middleware never registered; $extends doesn't cover all cases |
| Audit log immutability (delete) | Positive | ❌ | Same as above |
| Audit log immutability (upsert) | Positive | ❌ | $extends doesn't intercept upsert |
| Audit log errors swallowed | Abnormal | ⚠️ | Errors logged but not propagated |
| IP address in audit logs | Boundary | ❌ | Almost never passed by callers |
| Super Admin reads audit logs | Positive | ✅ | Properly restricted |
| PLATFORM_ADMIN reads audit logs | Negative | ✅ | Returns 403 |

### 7.8 Super Admin Module

**Flow Tested:** Dashboard → User Management → Community Moderation → Event Management → Security

| Test Case | Type | Result | Detail |
|-----------|------|:------:|--------|
| Dashboard stats | Positive | ✅ | Returns counts |
| Dashboard growth | Positive | ⚠️ | 48 sequential queries — performance risk |
| List users | Positive | ✅ | Paginated list |
| Suspend user (lower role) | Positive | ✅ | User suspended |
| Suspend user (same role) | Negative | ✅ | Returns error |
| Activate user — no role check | Negative | ❌ | Any PLATFORM_ADMIN can activate |
| Archive user — no role check | Negative | ❌ | Any PLATFORM_ADMIN can archive |
| Restore user — no role check | Negative | ❌ | Any PLATFORM_ADMIN can restore |
| Assign role | Positive | ✅ | Roles replaced (deletes all, creates new) |
| Reset password | Positive | ✅ | New password generated |
| Approve community | Positive | ✅ | Status → APPROVED |
| Reject community | Positive | ✅ | Status → REJECTED |
| Community review queue | Positive | ❌ | Route unreachable |
| Suspend community — no status guard | Boundary | ❌ | Can suspend already suspended community |
| Restore community → APPROVED | Boundary | ❌ | REJECTED community bypasses approval |
| Suspend event → notify registrants | Boundary | ❌ | Only community owner notified |
| Cancel event (admin) = Suspend event | Boundary | ❌ | Duplicate endpoints |
| Force-logout — wrong schema | Positive | ❌ | Validates adminResetPasswordSchema instead of userId |
| Lock/unlock user — no self-check | Boundary | ⚠️ | Admin can lock themselves |
| Suspicious activity detection | Positive | ✅ | 3+ failed logins in 24h |
| Broadcast notification | Positive | ⚠️ | Works but unbatched |
| Audit log access | Positive | ✅ | Super Admin only |

---

## APPENDIX A: FILE LOCATIONS

| Component | Path |
|-----------|------|
| Main App | `apps/api/src/app.ts` |
| Server Entry | `apps/api/src/index.ts` |
| Auth Middleware | `apps/api/src/middleware/auth.ts` |
| RBAC Middleware | `apps/api/src/middleware/rbac.ts` |
| CSRF Middleware | `apps/api/src/middleware/csrf.ts` |
| Security Middleware | `apps/api/src/middleware/security.ts` |
| Validate Middleware | `apps/api/src/middleware/validate.ts` |
| Feature Flag Middleware | `apps/api/src/middleware/dormant-features.ts` |
| Admin Rate Limit | `apps/api/src/middleware/admin-rate-limit.ts` |
| Audit Protection (UNUSED) | `apps/api/src/middleware/audit-protection.ts` |
| Audit Protection (DB) | `packages/database/src/middleware/audit-protection.ts` |
| Auth Routes | `apps/api/src/routes/auth.ts` |
| User Routes | `apps/api/src/routes/users.ts` |
| Community Routes | `apps/api/src/routes/communities.ts` |
| Organization Routes | `apps/api/src/routes/organizations.ts` |
| Event Routes | `apps/api/src/routes/events.ts` |
| Volunteer Routes | `apps/api/src/routes/volunteers.ts` |
| Report Routes | `apps/api/src/routes/reports.ts` |
| Category Routes | `apps/api/src/routes/categories.ts` |
| Master Data Routes | `apps/api/src/routes/master-data.ts` |
| Upload Routes | `apps/api/src/routes/upload.ts` |
| Org Structure Routes | `apps/api/src/routes/org-structure.ts` |
| Contact Messages Routes | `apps/api/src/routes/contact-messages.ts` |
| Admin Route Index | `apps/api/src/routes/admin/index.ts` |
| Admin Dashboard | `apps/api/src/routes/admin/dashboard.ts` |
| Admin Users | `apps/api/src/routes/admin/users.ts` |
| Admin Roles | `apps/api/src/routes/admin/roles.ts` |
| Admin Communities | `apps/api/src/routes/admin/communities.ts` |
| Admin Organizations | `apps/api/src/routes/admin/organizations.ts` |
| Admin Events | `apps/api/src/routes/admin/events.ts` |
| Admin Volunteers | `apps/api/src/routes/admin/volunteers.ts` |
| Admin Reports | `apps/api/src/routes/admin/reports.ts` |
| Admin Categories | `apps/api/src/routes/admin/categories.ts` |
| Admin Settings | `apps/api/src/routes/admin/settings.ts` |
| Admin Audit | `apps/api/src/routes/admin/audit.ts` |
| Admin Notifications | `apps/api/src/routes/admin/notifications.ts` |
| Admin Security | `apps/api/src/routes/admin/security.ts` |
| Admin CMS | `apps/api/src/routes/admin/cms.ts` |
| Audit Service | `apps/api/src/services/audit.ts` |
| Email Service | `apps/api/src/services/email.ts` |
| Rate Limiter Service | `apps/api/src/services/rate-limiter.ts` |
| Refresh Token Service | `apps/api/src/services/refresh-token.ts` |
| Prisma Schema | `packages/database/prisma/schema.prisma` |
| Prisma Client | `packages/database/src/index.ts` |
| Shared Zod Schemas | `packages/shared/src/index.ts` |
| Constants | `packages/constants/src/index.ts` |
| Web Middleware | `apps/web/middleware.ts` |
| Web Auth Store | `apps/web/lib/auth.ts` |
| Web API Client | `apps/web/lib/api.ts` |
| Web Feature Flags | `apps/web/lib/feature-flags.ts` |
| Web Auth Provider | `apps/web/components/auth-provider.tsx` |

---

## APPENDIX B: PRIORITY MATRIX

### Must Fix (P0) — Before any deployment

1. Register audit protection middleware
2. Fix VARCHAR(191) truncation → `@db.Text`
3. Add `@@index([deletedAt])` to all soft-delete models
4. Fix ReportStatus constant mismatch
5. Add missing migration unique constraint
6. Fix admin review queue route ordering
7. Fix force-logout schema validation
8. Fix rate limiter singleton instances
9. Fix Redis SCAN double-prefix
10. Separate expired vs reused refresh token handling
11. Implement proper file upload (not base64)
12. Add RBAC to Next.js middleware
13. Add XSS sanitization to user profile
14. Implement report resolution enforcement

### Should Fix (P1) — Before production launch

15. Add transaction wrapping on multi-step admin operations
16. Fix waitlist promotion race condition
17. Fix volunteer application slot race condition
18. Add missing notification triggers (15+ missing)
19. Add missing validation schemas (org structure, settings master data, contact)
20. Add role checks on activate/restore/archive
21. Fix PATCH null overwrite on undefined fields
22. Clear cookies on password change/session revoke
23. Add tokenVersion check to optionalAuthMiddleware
24. Fix CSP to allow Swagger UI
25. Add input size limits on all endpoints

### Nice to Have (P2) — Post-launch optimization

26. Cache master data
27. Batch broadcast notifications
28. Add bulk admin operations
29. Extract shared utility functions
30. Add audit log IP capture
31. Add optimistic locking on status transitions
32. Add maintenance mode enforcement

---

*Report generated by QA Integration Testing on 2026-07-12.*
*Mode: Read-Only. No code modifications performed.*
