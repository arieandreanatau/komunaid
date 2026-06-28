# KomunaID — Bug Fixing Report

> Tahap E: bug fixing.
> Tanggal: 2026-06-28.

## 1. Pendekatan

1. Setiap bug dilihat root cause (bukan symptom).
2. Fix diminimalkan agar tidak merusak flow lain.
3. Setiap fix besar disertai testing ulang (lihat `07_RETEST_AFTER_ENHANCEMENT.md`).

## 2. Backup / Snapshot

* `mysqldump --no-data` schema DB: lihat `scripts/db_schema_snapshot.sh`
* File `routes/modules/public.php` di-backup ke `routes/modules/public.php.bak` (tidak dilakukan karena perubahan minimal, terdokumentasi via git diff).
* `Database/Seeders/Demo/DemoUserSeeder.php` di-backup sebelum patch.

## 3. Daftar Fix

| Bug | File yang diubah | Strategi | Risiko |
|-----|------------------|----------|--------|
| BUG-001 | `routes/modules/public.php` | Tambah alias `/tentang-kami`, `/hubungi-kami`, `/event` | Rendah (tambah route, tidak mengubah yang ada) |
| BUG-002 | `README.md` | Update route list ke path valid | Tidak ada (doc only) |
| BUG-003 | `database/seeders/Demo/DemoUserSeeder.php` | Pakai `withTrashed` + `restore` | Rendah (idempotency) |
| BUG-006 | `routes/modules/community-owner.php`, `brand-owner.php`, `company-owner.php`, `member.php` | Tambah `role:` middleware | Sedang (perlu verifikasi per route) |
| BUG-007 | `.env` | Tambah komentar dokumentasi | Tidak ada |
| BUG-008 | `database/seeders/DatabaseSeeder.php` | Tambah fallback jika seeder file tidak ada | Rendah |
| VBUG-03 | `routes/modules/public.php` | Tambah `/blog` alias | Rendah |

## 4. Yang TIDAK dilakukan (di-defer ke enhancement F)

* BUG-005 (test suite) → F1
* BUG-010 (DB index) → F3
* BUG-011 (regions vs master_regions) → F3
* VBUG-01 (asset 404) → setelah re-verifikasi, ditemukan **FALSE POSITIVE** (URL HTML benar adalah `/build/assets/` bukan `/assets/`)
* VBUG-02 (3 prod user login) → di luar scope audit lokal, perlu reset password oleh owner

## 5. Verifikasi Setelah Fix

* `php artisan route:list` masih resolve.
* `php artisan migrate:status` masih `Ran`.
* Login flow tetap berfungsi untuk 8 role.
* README route valid (tidak ada 404).
