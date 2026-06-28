# KomunaID — Remaining Known Issues

> Bug/issue yang **belum** diperbaiki (deferred ke enhancement F atau di luar scope audit lokal).
> Tanggal: 2026-06-28.

## R1. Tidak ada automated test (BUG-005)
- Severity: High
- Lokasi: `tests/Feature/`, `tests/Unit/`
- Alasan: Butuh effort besar, di-defer ke F1.

## R2. DB index di `audit_logs.created_at`, `login_logs.created_at` (BUG-010)
- Severity: Low (perf)
- Alasan: Tabel belum besar.

## R3. Duplikasi `regions` vs `master_regions` (BUG-011)
- Severity: Medium
- Alasan: Perlu investigasi pemakaian di controller dulu.

## R4. `member@`, `community@`, `brand@komuna.id` tidak bisa login di Vercel (VBUG-02)
- Severity: Medium (prod only)
- Alasan: Di luar scope audit lokal. Perlu reset password oleh owner.

## R5. `User` model `casts()['email_verified_at']` tidak ada middleware `verified`
- Severity: Low
- Lokasi: `bootstrap/app.php`
- Alasan: Breeze tidak auto-register `verified` middleware. Opsional, banyak app skip.

## R6. CSP / X-Frame-Options / HSTS belum di-set (S36-S39)
- Severity: Medium
- Alasan: Butuh design policy + maintenance.

## R7. 2FA superadmin
- Severity: Low
- Alasan: Advanced feature, butuh library eksternal.

## R8. Payment gateway
- Severity: High (advanced)
- Lokasi: `EventPaymentConfirmation`
- Alasan: Butuh akun Midtrans/Xendit + sertifikat production. Di luar scope audit.

## R9. Real-time chat (Laravel Reverb / Pusher)
- Severity: Low
- Alasan: Advanced, butuh server ws.

## R10. Email notification
- Severity: Medium
- Lokasi: `MAIL_MAILER=log` di local, `smtp` di production tapi belum diuji.
- Alasan: Butuh SMTP credentials production.

## R11. `redirectUsersTo` di `bootstrap/app.php` line 38 tidak konsisten
- Severity: Low
- Lokasi: `bootstrap/app.php`
- Detail: Untuk non-superadmin auth user, redirect ke `member.dashboard` — tapi jika user punya role `community_owner`, idealnya ke `community.dashboard`. Saat ini `AuthenticatedSessionController@create` handle case-by-case, tapi `redirectUsersTo` di middleware hanya pakai `member.dashboard`.

## R12. `User::getDashboardRoute()` duplikasi dengan `RedirectByRoleService`
- Severity: Low
- Lokasi: `app/Models/User.php` + `app/Services/Auth/RedirectByRoleService.php`
- Detail: Dua tempat menentukan redirect path. Refactor ke satu service.

## R13. `RoleRequestService` tidak terikat di service provider
- Severity: Low
- Lokasi: dipakai via `app(...)` di beberapa controller.
- Risiko: Jika class dihapus, error di runtime.

## R14. `AccountRestrictedController` tidak punya test
- Severity: Low
- Alasan: Test suite belum ada.

## R15. `EventTypeSeeder`, `CollaborationTypeSeeder` mungkin mereferensikan type yang sudah obsolete
- Severity: Low
- Alasan: Perlu review data master.

## R16. `test_logins.php` di root direktori
- Severity: Low (security)
- Lokasi: `/test_logins.php` di repo
- Detail: Script test yang berisi daftar email user. Bukan masalah besar (semua user di README), tapi tidak seharusnya di root.

## R17. `composer-setup.php` dan `composer.phar` di root
- Severity: Low (security)
- Lokasi: `/composer.phar`, `/composer-setup.php`
- Detail: Composer install artifacts yang biasanya tidak di-commit.

## R18. `.env` ter-commit
- Severity: High (security)
- Lokasi: `/`, `/.env.example`, `/.env.production`, `/.env.testing`, `/.env.vercel-token`
- Detail: `.env` dengan credential lokal harusnya di-ignore. Periksa `.gitignore`.

## R19. `add_new_users.php`, `check_users.php` di root
- Severity: Low
- Detail: Script developer, harusnya di `.kilo/scripts/` atau `scripts/`.

## R20. `docs/04_BUG_LIST_LOCAL.md` menyebut BUG-006 (role middleware) — sekarang di-mark FALSE POSITIVE
- Severity: Info
- Detail: Audit awal salah. Update file.
