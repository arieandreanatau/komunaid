# KomunaID Role & Permission Review

## Roles (defined via Spatie Permission)

| Role | Created By | Permissions | Description |
|---|---|---|---|
| `superadmin` | SuperadminSeeder | All permissions via Gate | Platform-level administrator. Full access. |
| `platform_admin` | (role not yet seeded) | TBD | Operational admin (mid-tier). Tested in RedirectByRoleServiceTest. |
| `admin` | (alias for superadmin) | All | Legacy alias. |
| `member` | RoleSeeder | Public + member features | Default role for new users. |
| `community_owner` | RoleSeeder | Community owner features | Owner of a Community. |
| `community_pengurus` | (role name) | TBD | Internal community management role. Defined in code; not actively seeded. |
| `community_volunteer` | (role name) | TBD | Volunteer within a community. |
| `brand_owner` | RoleSeeder | Brand owner features | Owner of a Brand. |
| `brand_staff` | RoleSeeder | Limited brand features | Staff member of a Brand. |
| `company_owner` | RoleSeeder | Company owner features | Owner of a Company. |
| `event_volunteer` | (role name) | TBD | Volunteer for a specific event. |

## Permission Model

- **Library:** Spatie Laravel Permission 6.25.0
- **Storage:** 5 Spatie tables (`permissions`, `roles`, `model_has_permissions`, `model_has_roles`, `role_has_permissions`)
- **Default guard:** `web`
- **Super admin:** Implicit (any user with `superadmin` role bypasses Gate checks)
- **Custom middleware aliases** (in `bootstrap/app.php`):
  - `role` → `Spatie\Permission\Middleware\RoleMiddleware`
  - `permission` → `Spatie\Permission\Middleware\PermissionMiddleware`
  - `role_or_permission` → `Spatie\Permission\Middleware\RoleOrPermissionMiddleware`

## Custom Middleware (KomunaID-specific)

| Alias | Class | Behavior |
|---|---|---|
| `admin` | `App\Http\Middleware\EnsureSuperadmin` | User must have `superadmin` role. |
| `not.superadmin` | `App\Http\Middleware\EnsureNotSuperadmin` | User must NOT have `superadmin` role. |
| `active_user` | `App\Http\Middleware\ActiveUser` | User authenticated, not banned (`banned_at` null, `status != 'banned'`, `status != 'suspended'`). |
| `not.banned` | `App\Http\Middleware\EnsureNotBanned` | User authenticated and not banned/suspended. Redirects to `account.restricted` if banned. |
| `cron.token` | `App\Http\Middleware\VerifyCronToken` | Validates `?token=` query param against `CRON_SECRET` env var. |

## Route → Role → Middleware Matrix

| Route Group | Middleware | Required Role |
|---|---|---|
| `/` `/about` `/contact` `/blogs/*` `/komunitas` `/events` | web | (none) |
| `/login` `/register` `/forgot-password` `/reset-password/*` | web, guest | (none) |
| `/admin/login` | web, guest | (none) |
| `/admin/logout` | web, auth | superadmin |
| `/account-restricted` | web | (none) |
| `/dashboard` | web, auth | any auth |
| `/onboarding/*` | web, auth | any auth |
| `/komunitas/{slug}/(join\|leave\|report)` | web, auth, active_user | any auth |
| `/member/*` | web, auth, active_user | any auth (incl. member) |
| `/community-own/*` | web, auth, active_user, not.banned, role:community_owner | community_owner |
| `/brand/*` | web, auth, active_user, not.banned, role:brand_owner\|brand_staff | brand_owner OR brand_staff |
| `/company-owner/*` | web, auth, active_user, not.banned, role:company_owner\|superadmin | company_owner OR superadmin |
| `/superadmin/*` | web, auth, admin (EnsureSuperadmin) | superadmin |
| `/api/cron/scheduler` | web, cron.token | (token in env) |

## Policies (registered in `AppServiceProvider::boot()`)

| Model | Policy | Notes |
|---|---|---|
| Community | CommunityPolicy | view, update, delete, manage-members |
| Brand | BrandPolicy | view, update, delete, manage-staff |
| Event | EventPolicy | view, register, cancel, manage |
| CollaborationRequest | CollaborationRequestPolicy | accept, reject, complete |
| Company | CompanyPolicy | view, update, manage-brands |
| Blog | CmsPolicy | view, create, update, delete |
| HomepageSection | CmsPolicy | manage |
| ContactSetting | CmsPolicy | update |
| Suggestion | CmsPolicy | review, archive |
| DocumentationFile | DocumentationPolicy | view, generate, download, delete |

## RedirectByRoleService Logic

Priority (highest to lowest):

1. `banned_at` is set → `/account-restricted`
2. `status == 'suspended' || 'banned'` → `/account-restricted`
3. `superadmin` role → `/superadmin/dashboard`
4. `platform_admin` role → `/superadmin/dashboard`
5. `company_owner` role → `/company-owner/dashboard`
6. `brand_owner` OR `brand_staff` role → `/brand/dashboard`
7. `community_owner` role → `/community/dashboard` (note: community module is at `/community-own` URL, but route name is `community.dashboard`)
8. `community_admin` OR `community_staff` role → `/member/dashboard`
9. `community_volunteer` role → `/member/dashboard`
10. `event_volunteer` role → `/member/dashboard`
11. `member` role → `/member/dashboard`
12. (no role) → `/onboarding`

## Role Request Flow

1. User logs in with no role (or `member` role) → goes to `/onboarding`
2. Submits a role request via `/onboarding/role-request` POST
3. `RoleRequest` model row created with `status='pending'`
4. Superadmin sees it in `/superadmin/approval-center` and `/superadmin/role-requests`
5. Superadmin approves via POST `/superadmin/role-requests/{id}/approve`
6. Service:
   - Updates `RoleRequest.status = 'approved'`
   - Calls `$user->assignRole($requestedRole)` (Spatie)
   - Logs to `audit_logs` and `approval_logs`
7. User redirected to `DashboardRedirectController` which uses `RedirectByRoleService` to land on the right dashboard

## Test Coverage

- `tests/Unit/RedirectByRoleServiceTest.php` — 9 tests covering all role branches
- `tests/Feature/RoleAccessTest.php` — role-based route access
- `tests/Feature/AuthTest.php` — register assigns `member` role automatically
- `tests/Feature/HttpPolicyEnforcementTest.php` — superadmin can access any company
- `tests/Feature/CmsPolicyTest.php` — CMS policy enforcement
- `tests/Feature/CompanyPolicyTest.php` — company policy enforcement
- `tests/Feature/DocumentationPolicyTest.php` — documentation policy
- `tests/Feature/SecurityTest.php` — general security
- `tests/Feature/BannedAndSuspendedTest.php` — banned user blocked (NEW in R10)

## Known Issues / Phase 2

- `platform_admin`, `community_pengurus`, `community_volunteer`, `event_volunteer` roles are referenced in code but not seeded in `Master/RoleSeeder.php`. New users cannot get these roles via the standard flow. Acceptable for MVP since the redirect service handles them gracefully.
- Permission strings (not just role names) are not heavily used. Code mostly relies on `role:` middleware rather than granular `permission:` checks. Spatie infrastructure is in place but underutilized. **Phase 2:** add granular permissions for `create-community`, `manage-events`, `export-finance`, etc.
