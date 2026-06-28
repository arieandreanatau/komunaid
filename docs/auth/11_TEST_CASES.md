# 11 — Test Cases (Simplified Flow v2)

## A. Register
- ✅ Register valid → user dibuat, `member` role di-assign, profile dibuat, auto-login → `/v2/dashboard`.
- ✅ Email duplicate → error unique tampil.
- ✅ Username duplicate → error unique tampil.
- ✅ Password konfirmasi salah → error tampil.
- ✅ `agree_terms` tidak dicentang → error tampil.
- ✅ Password < 8 → error tampil.
- ✅ Username < 4 atau > 30 → error tampil.

## B. Login
- ✅ Login via email valid → redirect dashboard.
- ✅ Login via username valid → redirect dashboard.
- ✅ Password salah → "Email/username atau password salah." tampil.
- ✅ User tidak ditemukan → pesan sama (tidak bocorin user existence).
- ✅ User suspended → redirect ke `account.restricted`.
- ✅ LoginLog tercatat (success/failure).
- ✅ Audit log `user_logged_in`.
- ✅ Logout → session invalidated, redirect login.

## C. Dashboard
- ✅ Member baru melihat ringkasan profil + 3 tombol ajukan.
- ✅ Submission `pending_approval` tampil di banner kuning.
- ✅ Submission `need_revision` tampil dengan link.
- ✅ Submission `rejected` tampil dengan `rejection_reason`.
- ✅ Submission `approved` tampil di section "Kelola Entity".
- ✅ Admin melihat Admin Panel card dengan counters.

## D. Pengajuan Community
- ✅ Submit valid → community `pending_approval`, `community_members` `owner_candidate/pending`.
- ✅ User **tidak** dapat role `community_owner` sebelum approval.
- ✅ Validasi gagal → error tampil di form.
- ✅ Logo/banner valid (jpg/png/webp, ukuran sesuai).
- ✅ File >2MB ditolak.
- ✅ Notification admin & user dibuat.
- ✅ Audit log `community_submitted`.

## E. Pengajuan Brand
- ✅ Pola sama dengan D (ganti entity `brand`).
- ✅ `company_relation = under_existing_company` → `company_id` required.
- ✅ Pivot `brand_members` dibuat.

## F. Pengajuan Company
- ✅ Pola sama dengan D (ganti entity `company`).
- ✅ Pivot `company_members` (tabel baru) dibuat.

## G. Approval
- ✅ Admin approve community → `status=approved`, `approved_by/at` terisi, role `community_owner` granted, pivot `owner/active`, notifikasi, audit log.
- ✅ Admin reject → wajib `rejection_reason`; status=rejected; pivot=rejected.
- ✅ Admin request revision → wajib `revision_notes`; status=need_revision.
- ✅ Admin suspend → status=suspended.
- ✅ Sama untuk brand & company.

## H. Permission
- ✅ Guest tidak bisa akses `/v2/dashboard` (auth middleware).
- ✅ Member tidak bisa akses `/v2/admin/approvals*` (role middleware).
- ✅ User tidak bisa approve entity sendiri (403).
- ✅ User tidak bisa akses manage entity milik orang lain.
- ✅ Superadmin bisa akses approval.

## I. Build & Route
- ✅ `php artisan optimize:clear` sukses.
- ✅ `php artisan route:list` sukses, 31 route `simplified.*`.
- ✅ `php artisan migrate:status` sukses.
- ✅ `scripts/smoke_simplified.php` PASS 28/28.

## Cara Menjalankan
```bash
php scripts/smoke_simplified.php
```
Output: `PASS ...` per check, `TOTAL FAILURES: 0` di akhir.
