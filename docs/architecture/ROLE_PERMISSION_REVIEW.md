# KomunaID — Role & Permission Review

**Last updated:** 2026-06-25
**Source of truth:** Spatie Laravel Permission

---

## 1. Roles

| Role | Guard | Description |
|---|---|---|
| `superadmin` | web | Full access. Bypasses all policies. |
| `admin_platform` | web | Operational admin (approval center, audit logs, login logs, master data). |
| `member` | web | Default post-registration role. Access to member dashboard. |
| `community_owner` | web | Owns one or more communities. Access to community-owner dashboard. |
| `community_pengurus` | web | Community management role (internal structure). |
| `community_volunteer` | web | Community-level volunteer. |
| `brand_owner` | web | Owns one or more brands. Access to brand-owner dashboard. |
| `company_owner` | web | Owns one or more companies. Access to company-owner dashboard. |
| `event_volunteer` | web | Event-level volunteer. |

---

## 2. Account State (Custom `users.status`)

| Status | Effect |
|---|---|
| `active` | Normal access |
| `banned` | Blocked at login + middleware `not.banned` rejects. Logged in `login_logs`. |
| `suspended` | Same as banned (shorter, time-bound in concept). |

---

## 3. Middleware Enforcement

| Alias | Class | Used For |
|---|---|---|
| `auth` | Laravel | All authenticated routes |
| `guest` | Laravel | Login/register/forgot/reset |
| `role:{name}` | Spatie | Single role |
| `role:{r1}\|{r2}` | Spatie | Multiple roles (OR) |
| `permission:{perm}` | Spatie | Single permission |
| `admin` | EnsureSuperadmin | superadmin OR admin_platform |
| `not.superadmin` | EnsureNotSuperadmin | Block superadmin from user auth |
| `active_user` | ActiveUser | status = active |
| `not.banned` | EnsureNotBanned | status != banned/suspended |
| `cron.token` | VerifyCronToken (NEW) | Match `?token=` to `CRON_SECRET` |

---

## 4. Route → Role Mapping

| Route Group | Allowed Roles |
|---|---|
| `/` `/komunitas` `/events` `/blogs` `/about` `/contact` `/language/*` | (guest) |
| `/login` `/register` `/forgot-password` `/reset-password/*` | (guest) |
| `/dashboard` `/onboarding/*` | auth |
| `/member/*` | `member` \| `admin_platform` \| `superadmin` |
| `/community-own/*` | `community_owner` \| `admin_platform` \| `superadmin` |
| `/brand/*` | `brand_owner` \| `admin_platform` \| `superadmin` |
| `/company-owner/*` | `company_owner` \| `admin_platform` \| `superadmin` |
| `/superadmin/*` | `superadmin` \| `admin_platform` |
| `/api/cron/scheduler` | token-protected (any IP, valid token) |

---

## 5. Policies

| Policy | Resource | Used In |
|---|---|---|
| `CommunityPolicy` | `Community` | `CommunityController@update`, `MemberController`, `RegionController`, `SubgroupController`, `EventController` (community scope) |
| `EventPolicy` | `Event` | `EventController` actions (publish, cancel, archive) |
| `BrandPolicy` | `Brand` | `BrandController` actions (update, destroy, staff) |
| `CollaborationRequestPolicy` | `CollaborationRequest` | V1 accept/reject/cancel/complete |
| `AdminConversationPolicy` | `AdminConversation` | `AdminChatController` (superadmin only in practice) |

**Missing (Phase 2 / optional):**
- `CompanyPolicy` — currently role middleware only
- `CmsPolicy` — superadmin only
- `DocumentationPolicy` — superadmin only
- `CollaborationProposalPolicy` — currently role middleware only

---

## 6. Role Request Flow

1. User registers → `member` role assigned (auto).
2. User logs in → redirected to `/member/dashboard`.
3. User visits `/onboarding/role-request` → chooses target role (`community_owner`, `brand_owner`, `company_owner`).
4. POST `/onboarding/role-request` → `role_requests` row created with status `pending`.
5. Superadmin visits `/superadmin/role-requests` → approve/reject.
6. On approve → `RoleRequestService` (NEW) updates status, assigns Spatie role, logs to `approval_logs`.
7. On reject → status `rejected` with note; user notified (Phase 2: email).

---

## 7. Banned/Suspended Handling

- Login attempt → `EnsureNotBanned` blocks.
- Authenticated request to dashboard → `not.banned` middleware redirects to `/account/restricted`.
- Superadmin can change `users.status` from `/superadmin/members/{user}` (POST `ban`/`activate`/`suspend`).

---

## 8. Tests Covering Role Access

- `Tests\Feature\RoleAccessTest` — 13 tests covering all role boundaries.
- `Tests\Feature\SecurityTest` — 4 tests for banned/suspended.
- `Tests\Feature\AuthTest` — banned cannot login, suspended cannot login.
- `Tests\Feature\RedirectByRoleServiceTest` — 10 unit tests for redirect logic per role/status.
