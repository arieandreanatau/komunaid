# 07 — View Refactor Report

## Perubahan v2
| View | Path | Status |
|---|---|---|
| `simplified/layouts/guest.blade.php` | resources/views/simplified/layouts | new |
| `simplified/layouts/dashboard.blade.php` | resources/views/simplified/layouts | new |
| `simplified/auth/register.blade.php` | resources/views/simplified/auth | new |
| `simplified/auth/login.blade.php` | resources/views/simplified/auth | new |
| `simplified/dashboard/index.blade.php` | resources/views/simplified/dashboard | new |
| `simplified/dashboard/submissions/index.blade.php` | new | new |
| `simplified/dashboard/submissions/show.blade.php` | new | new |
| `simplified/submissions/community/create.blade.php` | new | new |
| `simplified/submissions/brand/create.blade.php` | new | new |
| `simplified/submissions/company/create.blade.php` | new | new |
| `simplified/admin/approvals/index.blade.php` | new | new |
| `simplified/admin/approvals/communities/{index,show}.blade.php` | new | new |
| `simplified/admin/approvals/brands/{index,show}.blade.php` | new | new |
| `simplified/admin/approvals/companies/{index,show}.blade.php` | new | new |

## Rekomendasi
- Layout app: `layouts/app.blade.php`, `layouts/guest.blade.php`, `layouts/dashboard.blade.php`, `layouts/admin.blade.php`.
- View lama tetap dipakai oleh legacy controllers; tidak ada referensi yang diupdate.
- Setelah transisi, view lama akan diarsipkan ke `resources/views/_archive/`.
- Hindari nama view generik seperti `new.blade.php`, `test.blade.php`, `backup.blade.php` di production.
