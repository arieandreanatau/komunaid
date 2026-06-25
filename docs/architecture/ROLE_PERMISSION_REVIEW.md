# Role & Permission Review

> KomunaID uses Spatie Permission as the source of truth for roles. Middleware enforces role checks per route group.

## Roles

| Role string | Display | Default landing after login | Allowed areas |
|---|---|---|---|
| `superadmin` | Superadmin | `/superadmin/dashboard` | All admin modules |
| `admin_platform` | Admin Platform | `/superadmin/dashboard` | Operational admin (subset) |
| `member` | Member | `/member/dashboard` | Member area + public |
| `community_owner` | Community Owner | `/community-owner/dashboard` | Member area + own communities |
| `community_pengurus` | Community Pengurus | `/community-owner/dashboard` | Assigned communities |
| `community_volunteer` | Community Volunteer | `/member/dashboard` | Assigned community features |
| `brand_owner` | Brand Owner | `/brand-owner/dashboard` | Member area + own brands |
| `company_owner` | Company Owner | `/company-owner/dashboard` | Member area + own companies |
| `event_volunteer` | Event Volunteer | `/member/dashboard` | Assigned event features |

## Middleware Map

| Middleware | Class | Behavior on fail |
|---|---|---|
| `auth` | Laravel default | redirect to `login` |
| `role` | `Spatie\Permission\Middleware\RoleMiddleware` | 403 |
| `permission` | `Spatie\Permission\Middleware\PermissionMiddleware` | 403 |
| `role_or_permission` | `Spatie\Permission\Middleware\RoleOrPermissionMiddleware` | 403 |
| `admin` | `App\Http\Middleware\EnsureSuperadmin` | redirect to `admin.login` or 403, also handles banned |
| `not.superadmin` | `App\Http\Middleware\EnsureNotSuperadmin` | 403 |
| `active_user` | `App\Http\Middleware\ActiveUser` | logout + redirect |
| `not.banned` (new) | `App\Http\Middleware\EnsureNotBanned` | logout + redirect to `account.restricted` |

## Banned Handling

- Storage: `users.banned_at` (datetime) and `users.status` enum (`active`, `banned`, `suspended`).
- Superadmin area: enforced by `EnsureSuperadmin` (reads `banned_at` + `status`).
- Other areas: enforced by the new `EnsureNotBanned` middleware (added in Phase 1).
- Redirect: `account.restricted` route → shows banned message and contact info.
- Eloquent cast: `banned_at` must be cast to `datetime` on the `User` model (Phase 1 fix).

## Role Request Flow

1. Authenticated user (any role, typically `member`) submits role request via `/role-request`.
2. Superadmin sees pending request in `/superadmin/role-requests` or `/superadmin/approval`.
3. Superadmin approves → role applied to user via Spatie.
4. On next login, `RedirectByRoleService` routes user to the right dashboard.

## Open Issues / Future

- `RoleEnum` in `app/Support/Enums/` not yet created. Roles are currently strings. Recommended Phase 2 polish.
- `community_pengurus` and `community_volunteer` rely on `community_managements` rows; ensure Spatie role AND management row both exist for a pengurus user.
