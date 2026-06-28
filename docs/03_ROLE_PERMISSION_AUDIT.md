# KomunaID — Role & Permission Audit

## 1. Definisi Role

Lokasi: `app/Enums/UserRole.php` + `database/seeders/Master/RoleSeeder.php`.

| Role | Slug | Default akses |
|------|------|---------------|
| Superadmin | `superadmin` | Full admin, `/superadmin/*`, `/admin/login` |
| Platform Admin | `platform_admin` | Terbatas, dashboard superadmin |
| Member | `member` | `/member/*` |
| Community Owner | `community_owner` | `/community-own/*` |
| Brand Owner | `brand_owner` | `/brand/*` |
| Brand Staff | `brand_staff` | `/brand/*` (terbatas) |
| Company Owner | `company_owner` | `/company-owner/*` |
| Community Admin | `community_admin` | `/member/*` (admin komunitas) |
| Community Staff | `community_staff` | `/member/*` |
| Community Volunteer | `community_volunteer` | `/member/*` |
| Event Volunteer | `event_volunteer` | `/member/*` |
| Platform Admin (lama `admin`) | `admin` | legacy alias |

> Catatan: README menyebut "11 roles" — implementasi punya 11 (sesuai). Role `admin` lama kemungkinan sudah digabung ke `superadmin` (lihat `RoleSeeder`).

## 2. Middleware Stack

`bootstrap/app.php` mendaftarkan alias:
- `role`, `permission`, `role_or_permission` (Spatie)
- `admin` → `EnsureSuperadmin`
- `not.superadmin` → `EnsureNotSuperadmin`
- `active_user` → `ActiveUser`
- `not.banned` → `EnsureNotBanned`
- `cron.token` → `VerifyCronToken`

## 3. Route-level Guard (Audit)

| Group | Middleware | Catatan |
|-------|------------|---------|
| Public | (none) | OK |
| Auth | `auth` | OK |
| Member (di `routes/modules/member.php`) | `auth` saja | ⚠️ Tidak ada `role:member`. User baru yang belum dipilih role onboarding tetap bisa masuk halaman member. (Periksa `OnboardingController`.) |
| Community Owner | `auth`, `active_user`, `not.banned` | Tidak ada `role:community_owner`! Jadi user non-owner bisa hit URL. (Lihat catatan di bawah.) |
| Brand Owner | `auth`, `active_user`, `not.banned` | Sama, tidak ada `role:brand_owner|brand_staff` |
| Company Owner | `auth`, `active_user`, `not.banned` | Sama |
| Superadmin | `auth`, `admin` | ✅ (admin = EnsureSuperadmin) |

**Temuan:**
- Middleware `active_user` mengecek `users.status = 'active'`. User yang dibuat admin secara default berstatus `active` (periksa `User` casts dan seeder). Aman.
- Karena group role-specific tidak pakai middleware `role:`, **controller harus enforce role** di setiap method. (Cross-check dengan `BrandOwner/DashboardController` untuk konfirmasi.)

## 4. Post-Login Redirect

`app/Services/Auth/RedirectByRoleService.php` mengembalikan route:
- `superadmin` → `superadmin.dashboard`
- `platform_admin` → `superadmin.dashboard`
- `company_owner` → `company-owner.dashboard`
- `brand_owner|brand_staff` → `brand.dashboard`
- `community_owner` → `community.dashboard`
- `community_admin|community_staff|community_volunteer|event_volunteer` → `member.dashboard`
- `member` → `member.dashboard`
- default → `onboarding`

## 5. Ditemukan Risiko

| # | Risiko | Severity | Mitigasi |
|---|--------|----------|----------|
| RP1 | Group route community/brand/company tidak pakai `role:` middleware. | **High** | Tambah middleware `role:` di group (lihat `bugfix/03_FIXED_BUG_LIST.md`) |
| RP2 | `User::getDashboardRoute()` mengecek `isBannedOrSuspended()` lagi, tetapi `AuthenticatedSessionController::create()` tidak memanggil method ini — duplikasi logika. | Low | Refactor |
| RP3 | `RoleRequestService` dipanggil via `app(...)` di beberapa tempat. Tidak ada error handling jika service gagal resolve. | Low | Binding di service provider |
| RP4 | `EnsureSuperadmin` — periksa apakah `hasRole('superadmin')` dipakai, bukan `role === 'superadmin'`. (Cross-check `EnsureSuperadmin.php`.) | TBD | Lihat `04` |

## 6. Rekomendasi

1. Tambahkan middleware `role:community_owner` di group `community-owner.php` (di routes).
2. Tambahkan middleware `role:brand_owner|brand_staff` di group `brand-owner.php`.
3. Tambahkan middleware `role:company_owner` di group `company-owner.php`.
4. Untuk `member.php`, tetap biarkan `auth` saja tapi tambahkan `redirect()->route('onboarding')` jika `getDashboardRoute()` = onboarding.
5. Di setiap controller di `BrandOwner/`, `CommunityOwner/`, `CompanyOwner/`, `Member/`, tambahkan `authorize()` via Policy atau `abort_unless($user->hasRole(...))`.
