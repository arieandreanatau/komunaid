# 29 — ROUTE / CONTROLLER / SERVICE PLAN

## 29.1 Conventions
- Route name pattern: `{module}.{action}.{sub?}` (e.g., `community.events.create`).
- Route URL pattern: kebab-case.
- Controller: `{Module}\{Action}Controller@method`.
- Service: `App\Services\{Module}\{Name}Service`.

## 29.2 Sample route files
- `routes/web.php` (auth, public, member, community, brand, company, admin, superadmin)
- `routes/api.php` (Phase 3, public API)

## 29.3 Controllers (existing, audited)
- `Auth\AuthenticatedSessionController` — login, logout.
- `Auth\RegisteredUserController` — register.
- `Auth\PasswordResetLinkController` — forgot.
- `Auth\NewPasswordController` — reset.
- `Auth\AccountRestrictedController` — restricted landing.
- `Auth\OnboardingController` — onboarding wizard.
- `Member\*` — dashboard, profile, gallery, interest, friend, wallet, donation, report, event registration, event volunteer, role request.
- `CommunityOwner\*` — community, subgroup, region, member management, event, collaboration.
- `BrandOwner\*` — brand, staff, campaign, collaboration, event, settings.
- `CompanyOwner\*` — company, brand, collaboration, event, staff.
- `Superadmin\*` — dashboard, approval, login log, audit, user, master, CMS, finance, health, settings.
- `RoleRequest\*` — store, reject.

## 29.4 Services
- `App\Services\Auth\RedirectByRoleService` — role-based redirect.
- `App\Services\NotificationService` — dispatch custom notification.
- `App\Services\AuditService` — log action.
- `App\Services\ExportService` — schedule + write CSV.
- `App\Services\EventFinanceService` (planned) — fee calculation + summary.

## 29.5 Middleware
- `auth` (default)
- `verified` (optional)
- `role:{name}` (custom)
- `throttle:5,1` (login)
- `account.active` (custom — banned/suspended → restricted)
