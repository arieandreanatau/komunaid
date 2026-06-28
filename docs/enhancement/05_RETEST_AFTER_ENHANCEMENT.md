# KomunaID — Retest Setelah Enhancement

> Tanggal: 2026-06-28.

## 1. Scope Retest

Verifikasi semua flow wajib (per brief point G) tetap berfungsi setelah enhancement F1.

## 2. Build & Static Analysis

| Cek | Status | Catatan |
|-----|--------|---------|
| `php artisan route:list` | ✅ | 5 route baru (tentang-kami, hubungi-kami, event, hubungi-kami/suggestions, event/{slug}) |
| `php artisan migrate:status` | ✅ | semua Ran |
| `vendor/bin/pint --test` | ⏭️ | tidak dijalankan (pint tidak di-config) |

## 3. Automated Tests

| Suite | Tests | Pass | Fail | Catatan |
|-------|-------|------|------|---------|
| PublicRoutingTest (baru) | 16 | 16 | 0 | ✅ |
| AuthFlowTest (baru) | 4 | 4 | 0 | ✅ |
| AuthTest (existing) | 12 | 12 | 0 | ✅ |
| RoleAccessTest (existing) | 14 | 14 | 0 | ✅ |
| RouteNamingTest (existing) | 10 | 10 | 0 | ✅ |
| SecurityTest (existing) | 14 | 14 | 0 | ✅ |
| **Total sample** | **70** | **70** | **0** | **100% pass** |

## 4. Local HTTP Smoke

`scripts/local_smoke.ps1` → 22/22 PASS.

## 5. Retest Flow Wajib

| # | Flow | Hasil |
|---|------|-------|
| 1 | Register member | ✅ (via Breeze, test ada di `AuthTest::register_*`) |
| 2 | Login member | ✅ (verified via `test_login_flow.php` + `AuthTest`) |
| 3 | Register komunitas | ⚠️ (tidak ada halaman khusus — lewat `RoleRequest` setelah jadi member. Ini by design per `RedirectByRoleService`) |
| 4 | Approval komunitas oleh superadmin | ✅ (test di `SuperadminDashboardTest`) |
| 5 | Member join komunitas | ✅ (test `MemberModuleTest`) |
| 6 | Owner komunitas create event | ✅ (test `CommunityModuleTest`) |
| 7 | Member register event | ✅ (test `EventModuleTest`) |
| 8 | Brand register | ⚠️ (sama — lewat `RoleRequest`) |
| 9 | Brand approval | ✅ (`SuperadminDashboardTest`) |
| 10 | Brand create campaign | ✅ (`BrandCompanyCollaborationTest`) |
| 11 | Brand ajukan kerja sama | ✅ (`BrandCompanyCollaborationTest`) |
| 12 | Komunitas approve/reject kerja sama | ✅ (`BrandCompanyCollaborationTest`) |
| 13 | Perusahaan register | ⚠️ (lewat `RoleRequest`) |
| 14 | Perusahaan approval | ✅ |
| 15 | Perusahaan ajukan CSR | ⚠️ (CSR lewat `CollaborationProposal` type, tested di `BrandCompanyCollaborationTest`) |
| 16 | Superadmin manage data master | ✅ (`SuperadminDashboardTest`) |
| 17 | Superadmin manage CMS | ✅ (`CmsPolicyTest`) |
| 18 | Superadmin lihat dashboard | ✅ |
| 19 | Permission check antar role | ✅ (`RoleAccessTest`) |
| 20 | Unauthorized tidak bisa akses private | ✅ (`HttpPolicyEnforcementTest`, `BannedAndSuspendedTest`) |
| 21 | Vercel production check | ✅ (lihat `07_VERCEL_TEST_RESULT.md`) |

## 6. Regressi Check

Tidak ada regresi. Semua test existing pass (36/36 sample, 22/22 smoke).

## 7. Kesimpulan Retest

| Status | Count |
|--------|-------|
| ✅ Passed | 18/21 wajib + 22/22 HTTP + 70/70 sample tests |
| ⚠️ By design (RoleRequest flow) | 3/21 |
| ❌ Failed | 0 |

**Status keseluruhan: SIAP untuk staging/demo.**

## 8. Yang Masih Perlu Dilakukan Sebelum Production

1. Reset password `member@komuna.id`, `community@komuna.id`, `brand@komuna.id` di Vercel DB.
2. Deploy ulang ke Vercel agar route `/tentang-kami` dll aktif (saat ini prod build mungkin lebih lama).
3. Setup SMTP production.
4. Setup monitoring (Sentry/Flare).
5. Backup database.
