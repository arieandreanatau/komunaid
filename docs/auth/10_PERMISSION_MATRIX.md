# 10 — Permission Matrix

## Role Spatie (canonical)
- `member` — default untuk semua user.
- `community_owner` — granted saat community approved.
- `brand_owner` — granted saat brand approved.
- `company_owner` — granted saat company approved.
- `superadmin` — admin platform (seeded).
- `admin_platform` — admin platform (seeded).

## Middleware Alias
Laravel 11: `bootstrap/app.php` mendaftarkan alias:
- `role` → `Spatie\Permission\Middleware\RoleMiddleware`
- `permission` → `Spatie\Permission\Middleware\PermissionMiddleware`
- `role_or_permission` → `Spatie\Permission\Middleware\RoleOrPermissionMiddleware`

## Matriks Akses (v2)

| Route | Middleware | Required Role |
|---|---|---|
| `/v2/register`, `/v2/login` | guest | (none) |
| `/v2/logout` | auth | (any logged in) |
| `/v2/dashboard` | auth | (any logged in) |
| `/v2/dashboard/submissions*` | auth | (any logged in) |
| `/v2/dashboard/apply/*` | auth + active + not banned | (any logged in) |
| `/v2/admin/approvals*` | auth + role | `superadmin` atau `admin_platform` |
| Admin approve/reject/suspend | auth + role + self-approval guard | admin + entity.owner_id != auth.id |

## Per Entity
- Hanya entity **approved** yang bisa diakses menu "Kelola" di dashboard.
- User **bukan** owner yang approved entity tidak bisa manage (cek di controller/Policies).

## Anti Bypass
- Semua aksi admin melewati `role:superadmin|admin_platform` middleware.
- ApprovalService tidak bisa dipanggil dari request user (route admin only).
- `self-approval guard` dicek di controller sebelum service dipanggil.
