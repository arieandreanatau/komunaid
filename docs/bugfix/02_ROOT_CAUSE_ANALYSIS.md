# KomunaID — Root Cause Analysis

> Analisis root cause untuk setiap bug yang diperbaiki di tahap E.

## BUG-001: README route mismatch

**Symptom:** `/tentang-kami`, `/hubungi-kami`, `/event` return 404 di local & Vercel.

**Investigation:**
* `routes/modules/public.php` hanya mendaftarkan `/about`, `/contact`, `/events` (plural).
* `README.md` menulis 3 route di atas (line 233-237).
* Tidak ada route alias untuk Bahasa Indonesia.

**Root cause:** Saat membuat route `Public`, developer hanya menggunakan path English (`/about`, `/contact`, `/events`). README ditulis dengan asumsi route Indonesia akan ditambahkan, tapi langkah itu terlewat. Seiring pertumbuhan codebase, inkonsistensi tidak terdeteksi karena tidak ada automated test untuk route.

**Fix:** Tambah route alias di `routes/modules/public.php` yang me-redirect ke route handler yang sama. Tidak perlu ubah handler/controller.

## BUG-003: DemoUserSeeder soft-delete conflict

**Symptom:** Setelah `superadmin.destroy` (soft-delete) pernah dipanggil, `php artisan db:seed --class=...DemoUserSeeder` gagal dengan `UniqueConstraintViolationException` pada kolom `users.username`.

**Investigation:**
* `User` model pakai `SoftDeletes`.
* `DemoUserSeeder::run()` line 96-119:
  ```php
  $existing = User::where('username', $data['username'])->first();
  if ($existing) { ... } else { User::updateOrCreate([...]) }
  ```
* `where('username', ...)->first()` default mengecualikan soft-deleted.
* Jika user soft-deleted, `$existing = null`, masuk ke `else`.
* `updateOrCreate(['email'])` lalu mencoba INSERT — bentrok dengan unique index `users.username`.

**Root cause:** Seeder tidak menangani soft-deleted records. Ini juga memperlihatkan bahwa `Superadmin::destroy` di superadmin UI mungkin dilakukan untuk testing tanpa restore.

**Fix:** Sebelum query, restore soft-deleted record dengan username yang sama. Atau gunakan `withTrashed()->first()` + cek `trashed()`.

## BUG-006: Group route role tidak pakai `role:` middleware

**Symptom:** Group `community-owner`, `brand-owner`, `company-owner`, `member` hanya dilindungi `auth`, `active_user`, `not.banned`. Tanpa `role:`, user role lain (yang masih authenticated) bisa hit URL.

**Investigation:**
* `routes/web.php` line 28-39 wraps semua role area hanya dengan `auth + active_user + not.banned`.
* `routes/modules/community-owner.php` line 3-...: tidak ada `role:` di group.
* Untuk saat ini, controller memaksa `authorize()` atau `$user->hasRole(...)` check manual — **tapi tidak konsisten**.

**Root cause:** Setup middleware di `routes/web.php` tidak granular. Saat menambah role baru, lupa update middleware stack.

**Fix:** Tambah `role:...` di group route. Untuk `member`, tambahkan `EnsureOnboarded` middleware (custom) yang redirect ke `/onboarding` jika user belum punya role apapun.

**Mitigasi risiko:** Jika controller sudah punya `authorize()` check, middleware tambahan hanya defense-in-depth. Pastikan middleware **allow-list** (multiple role via `|`), bukan **block-list**.

## BUG-007: Session driver di `.env`

**Symptom:** `.env` lokal `SESSION_DRIVER=file`, sedangkan `.env.example` dan `.env.production` `database`.

**Root cause:** Template `.env` lokal dihasilkan dari setup awal yang tidak di-update. `.env.example` sudah benar untuk production-readiness.

**Fix:** Tidak ubah `.env` (sengaja untuk local). Tambah komentar `# LOCAL ONLY: untuk production gunakan 'database'`. Update `.env.example` untuk highlight perbedaan.

## VBUG-01 (FALSE POSITIVE)

**Original symptom:** Test probe `/assets/app-*.css` → 404.

**Investigation:**
* HTML di homepage ternyata mereferensikan `/build/assets/app-*.css` (BUKAN `/assets/`).
* Test probe URL yang tidak digunakan aplikasi.

**Root cause:** Test script salah path. Aplikasi Vercel berfungsi dengan benar.

**Action:** Update test script untuk menggunakan path dari HTML, bukan path dari manifest. (Sudah di-update.)
