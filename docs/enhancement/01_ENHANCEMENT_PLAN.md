# KomunaID — Enhancement Plan

> Tahap F: enhancement berdasarkan gap analysis.
> Tanggal: 2026-06-28.

## F1 — MVP (sudah diimplementasikan di audit ini)

1. **Security headers middleware** ✅
   - `app/Http/Middleware/SecurityHeaders.php` (baru)
   - `X-Content-Type-Options: nosniff`
   - `X-Frame-Options: SAMEORIGIN`
   - `Referrer-Policy: strict-origin-when-cross-origin`
   - `Permissions-Policy: geolocation=(), microphone=(), camera=()`
   - Di-append di `bootstrap/app.php` ke semua web response.

2. **Indonesian route aliases** ✅
   - `/tentang-kami` → `about`
   - `/hubungi-kami` → `contact`
   - `/event` → `events`
   - Lihat `routes/modules/public.php`.

3. **DemoUserSeeder idempotency fix** ✅
   - Restore soft-deleted user sebelum update.
   - Mengatasi `UniqueConstraintViolationException` saat re-seed.

4. **DatabaseSeeder graceful optional seeders** ✅
   - 3 master seeder yang mungkin tidak ada di-wrap dengan `class_exists()`.

5. **Automated tests** ✅
   - `tests/Feature/PublicRoutingTest.php` — 16 tests
   - `tests/Feature/AuthFlowTest.php` — 4 tests
   - **20 tests baru**, semua PASS.

## F1.5 — Penemuan (selama audit)

* Repo **sudah punya 22 file test** (Auth, AdminChat, Banned, Brand, Cms, Community, Company, Cron, Documentation, EventFinance, Event, HttpPolicy, LanguageSwitcher, Member, Multilanguage, Premium, PublicPage, RoleAccess, RouteNaming, Security, Superadmin). README & CLAUDE.md outdated.
* **24 file test** setelah augmentasi.

## F2 — Medium Priority (di-backlog)

| ID | Item | Effort | Catatan |
|----|------|--------|---------|
| F2-01 | Notification center UI (bell icon, /notifications) | M | Tabel `custom_notifications` ada, controller parsial. |
| F2-02 | Email notification (SMTP production) | M | Setup SES/Postmark. |
| F2-03 | File upload validation terpusat (image only, max 2MB) | S | Sebagian sudah ada. |
| F2-04 | Audit log index `(action, created_at)` | S | Migration baru. |
| F2-05 | Soft delete untuk `Community`, `Event`, `Brand`, `Company` | M | User sudah, lain belum. |
| F2-06 | Export CSV untuk semua report (saat ini sebagian) | S | Sudah ada `CsvExportService`. |
| F2-07 | Bookmark event (saat ini hanya community) | S | Tambah `event_bookmarks` table. |
| F2-08 | Member recommendation engine berdasarkan interest | M | Query sederhana. |
| F2-09 | Public Campaign page | M | Tambah `Public\CampaignController`. |
| F2-10 | FAQ master data + page | S | Tambah `Faq` model + migration. |
| F2-11 | CSP headers (script-src, style-src whitelist) | S | Update SecurityHeaders. |
| F2-12 | README sync ke route aktual | S | Update table di README. |

## F3 — Advanced (di-backlog)

| ID | Item | Effort | Catatan |
|----|------|--------|---------|
| F3-01 | Payment gateway (Midtrans/Xendit) | L | Butuh akun produksi. |
| F3-02 | Wallet top-up flow | M | Extend `WalletService`. |
| F3-03 | Refund flow | M | Tambah `WalletTransaction` type 'refund'. |
| F3-04 | Real-time chat (Laravel Reverb) | L | Butuh server ws. |
| F3-05 | QR check-in event | M | Library `simplesoftwareio/simple-qrcode` atau `bacon-qr-code`. |
| F3-06 | Certificate generator (PDF) | M | Library `barryvdh/laravel-dompdf`. |
| F3-07 | Product & product category | M | Tambah `products` + `product_categories`. |
| F3-08 | Job/internship marketplace | L | Sub-modul baru. |
| F3-09 | Sponsorship package | M | Sub-modul. |
| F3-10 | Campaign analytics (impression, CTR) | M | Event tracking. |
| F3-11 | Multi-language ID/EN/SU | L | Translation files. |
| F3-12 | 2FA superadmin | M | Library `pragmarx/google2fa-laravel`. |
| F3-13 | API routes for mobile app | L | Pakai Sanctum. |
| F3-14 | CI workflow (GitHub Actions) | M | Run tests + lint. |
| F3-15 | Konsolidasi `regions` vs `master_regions` | S | Migration deprecate salah satu. |
| F3-16 | Email templates & notification templates master data | S | Tambah `email_templates` + `notification_templates`. |
| F3-17 | Bahasa Sunda admin UI | M | Translation. |
| F3-18 | Reputation & badge | L | Algoritma. |

## F4 — Backlog Infrastruktur

| ID | Item |
|----|------|
| F4-01 | Setup CI (GitHub Actions) untuk run test + pint |
| F4-02 | Setup Vercel environment per branch (preview deployment) |
| F4-03 | Setup error monitoring (Sentry / Flare) |
| F4-04 | Setup uptime monitoring (Vercel Analytics) |
| F4-05 | Backup database otomatis (cron di Vercel) |
