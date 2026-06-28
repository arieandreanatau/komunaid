# KomunaID — Local Bug List

> Bug yang ditemukan selama audit + testing lokal.
> Tanggal: 2026-06-28.

## BUG-001: README route mismatch
- **Modul:** Public
- **Role:** Guest
- **Step:** Buka `README.md` bagian "Main Routes" atau "Public"
- **Expected:** Klik `/tentang-kami`, `/hubungi-kami`, `/event` → 200
- **Actual:** 404 (route tidak ada; yang ada `/about`, `/contact`, `/events`)
- **Severity:** High (broken doc)
- **Root Cause:** `routes/modules/public.php` tidak pernah di-update untuk menambahkan alias Indonesia. README ditulis dengan asumsi route ID akan ditambahkan.
- **Fix Plan:** Tambah route alias `/tentang-kami` → `about`, `/hubungi-kami` → `contact`, dan `/event` → `events.directory` di `routes/modules/public.php`. (Lihat `bugfix/03_FIXED_BUG_LIST.md`.)
- **Status:** FIXED di fase E.

## BUG-002: README bare-prefix routes
- **Modul:** Public
- **Role:** Guest
- **Step:** GET `/member`, `/superadmin`, `/community-own`, `/brand`, `/company-owner`
- **Expected:** 302 ke login (per README)
- **Actual:** 404 (route prefix ada tapi tidak ada route di root prefix, hanya sub-paths)
- **Severity:** Medium (doc bug)
- **Root Cause:** Route group di `routes/modules/*.php` selalu punya path setelah prefix, tidak pernah root-only.
- **Fix Plan:** Update README menggunakan path lengkap (mis. `/member/dashboard`) atau tambah route root di masing-masing module. **Disini memilih update README** karena route dashboard sudah ada.
- **Status:** FIXED.

## BUG-003: Demo seeder tidak idempotent untuk soft-deleted user
- **Modul:** Seeder / Auth
- **Role:** Developer / CI
- **Step:** Jalankan `php artisan db:seed` setelah `superadmin.destroy` pernah dieksekusi.
- **Expected:** Seeder restore / update user
- **Actual:** `UniqueConstraintViolationException` karena `User::where('username', ...)->first()` excludes soft-deleted rows, lalu `updateOrCreate(['email'])` triggers INSERT.
- **Severity:** High (blokir seeder, demo tidak stabil)
- **Root Cause:** `DemoUserSeeder::run()` lines 96-119 tidak menangani soft-deleted records.
- **Fix Plan:** Patch seeder untuk `withTrashed()->first()` dan `restore()` jika soft-deleted. (Lihat `bugfix/03_FIXED_BUG_LIST.md`.)
- **Status:** FIXED.

## BUG-004: APP_URL di .env tidak konsisten
- **Modul:** Config
- **Role:** Developer
- **Step:** Bandingkan `.env` dengan `.env.example`
- **Expected:** Konsisten
- **Actual:** `.env` APP_URL=`http://localhost/komunaid`; `.env.example` APP_URL=`http://127.0.0.1:8000`. Server dijalankan di `:8000` jadi redirect URL masih OK.
- **Severity:** Low
- **Root Cause:** Developer copy-paste `.env` dari template lama.
- **Fix Plan:** Standarkan ke `http://127.0.0.1:8000`. Otomatis dilakukan dengan `php artisan serve` default.
- **Status:** FIXED (rebuilt `.env` dengan port 8000).

## BUG-005: Tidak ada automated test
- **Modul:** Quality
- **Role:** -
- **Step:** `php artisan test`
- **Expected:** Test suite jalan
- **Actual:** 0 tests (hanya boilerplate)
- **Severity:** High
- **Root Cause:** TestFeature & TestUnit hanya berisi `CreatesApplication` + `TestCase` skeleton.
- **Fix Plan:** Tahap F: tulis minimal test untuk Auth flow + Public routing.
- **Status:** BACKLOG (F1).

## BUG-006: Middleware role tidak diterapkan di group route role-specific
- **Modul:** Auth
- **Role:** Cross-role
- **Step:** Login sebagai `member`, akses `/superadmin/dashboard` (seharusnya 403/302). Atau akses `/brand/dashboard` (seharusnya 302 ke login atau 403).
- **Expected:** Superadmin route dilindungi middleware `admin`. Member ke `/brand/dashboard` harusnya redirect ke login atau 403.
- **Actual:** Middleware `admin` (EnsureSuperadmin) aktif, tapi group `brand-owner` dan `company-owner` tidak punya `role:` middleware — controller harus enforce manual. Jika controller lalai, user role lain bisa akses.
- **Severity:** Medium (tergantung controller)
- **Fix Plan:** Tahap F3: tambah middleware `role:brand_owner|brand_staff` di group `brand-owner`, dst.
- **Status:** BACKLOG (F3). Tergantung verifikasi per controller (lihat `04_ROLE_PERMISSION_AUDIT.md` RP1).

## BUG-007: Session driver `file` di .env lokal
- **Modul:** Config
- **Role:** -
- **Step:** Inspect `.env`
- **Expected:** `SESSION_DRIVER=database` (Vercel-safe) atau komentar.
- **Actual:** `SESSION_DRIVER=file`. Aman untuk local XAMPP, tapi bahaya jika `.env` di-copy ke production.
- **Severity:** Low (config drift)
- **Fix Plan:** Tahap F: dokumentasikan di `.env.example` agar `file` hanya untuk local.
- **Status:** OPEN (sengaja untuk local). Tambah komentar di `.env`.

## BUG-008: Master seeder `DatabaseSeeder.php` mereferensikan `Master\CommunityOwnerSeeder` dan `Master\CommunitySeeder` yang mungkin tidak ada
- **Modul:** Seeder
- **Role:** -
- **Step:** `php artisan db:seed`
- **Expected:** 14 master seeders dipanggil
- **Actual:** `DatabaseSeeder.php` lines 48-49 mereferensikan `Master\CommunityOwnerSeeder`, `Master\CommunitySeeder`, dan `Master\WalletTransactionSeeder` (line 50). Saat dijalankan pertama kali, akan error jika file tidak ada.
- **Severity:** Medium
- **Fix Plan:** Tahap F: verifikasi file ada atau hapus dari DatabaseSeeder.
- **Status:** OPEN. (Tidak error pada smoke test ini karena saya hanya menjalankan RoleSeeder manual.)

## BUG-009: `Member` redirect saat tidak punya role apapun
- **Modul:** Auth
- **Role:** User baru register
- **Step:** Register user baru, lalu login.
- **Expected:** Redirect ke onboarding atau dashboard.
- **Actual:** Redirect ke `/onboarding` (diperiksa di `test_login_flow.php` — `member@komuna.test` dengan `roles=[]` redirect ke `/onboarding`).
- **Severity:** Info (bukan bug, melainkan by design).
- **Fix Plan:** Tidak perlu.
- **Status:** OBSERVED.

## BUG-010: Tidak ada index di `audit_logs.created_at` & `login_logs.created_at`
- **Modul:** DB performance
- **Role:** -
- **Step:** Lihat migration.
- **Expected:** Index untuk query reporting.
- **Actual:** Tidak ada di migration.
- **Severity:** Low
- **Fix Plan:** Tahap F3: tambah index.
- **Status:** BACKLOG.

## BUG-011: Duplikasi tabel `regions` vs `master_regions`
- **Modul:** DB
- **Role:** -
- **Step:** Inspect `regions` dan `master_regions`
- **Expected:** Satu tabel master region.
- **Actual:** Dua tabel dengan struktur mirip.
- **Severity:** Medium
- **Fix Plan:** Tahap F3: konsolidasi via migration baru (deprecate `regions` jika terbukti tidak dipakai).
- **Status:** BACKLOG.

## BUG-012: `AccountRestrictedController` adalah invokable tanpa method `__invoke`
- **Modul:** Auth
- **Role:** Banned/Suspended
- **Step:** GET `/account-restricted`
- **Expected:** 200
- **Actual:** 200 (terbukti). Jadi method `__invoke` ada. **FALSE POSITIVE.**
- **Status:** CLOSED.
