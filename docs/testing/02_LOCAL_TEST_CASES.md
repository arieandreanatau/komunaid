# KomunaID — Local Test Cases

> Detail test case yang dijalankan secara otomatis dan manual.
> Tanggal: 2026-06-28. Environment: `http://127.0.0.1:8000`, MySQL `komunaid`, demo seeder sudah dijalankan.

| ID | Modul | Role | Aksi | Expected | Actual | Status | Severity | Bukti |
|----|-------|------|------|----------|--------|--------|----------|-------|
| TC01 | Public | Guest | GET / | 200, title "KomunaID" | 200, 46206 bytes | ✅ PASS | - | `local_smoke_results.csv` |
| TC02 | Public | Guest | GET /komunitas | 200 | 200, 40419 | ✅ PASS | - | CSV |
| TC03 | Public | Guest | GET /events | 200 | 200, 16026 | ✅ PASS | - | CSV |
| TC04 | Public | Guest | GET /blog | 200 | 200, 22008 | ✅ PASS | - | CSV |
| TC05 | Public | Guest | GET /about | 200 | 200, 18567 | ✅ PASS | - | CSV |
| TC06 | Public | Guest | GET /contact | 200 | 200, 20825 | ✅ PASS | - | CSV |
| TC07 | Public | Guest | GET /tentang-kami | 200 (per README) | 404 | ❌ FAIL | High | `check_unauth.php` |
| TC08 | Public | Guest | GET /hubungi-kami | 200 (per README) | 404 | ❌ FAIL | High | `check_unauth.php` |
| TC09 | Public | Guest | GET /event | 200 (per README) | 404 | ❌ FAIL | High | `check_unauth.php` |
| TC10 | Public | Guest | GET /member | 302 → /login (per README) | 404 (route not exist) | ❌ FAIL | Medium | README salah, bukan /member tapi /member/dashboard |
| TC11 | Public | Guest | GET /superadmin | 302 → /admin/login (per README) | 404 | ❌ FAIL | Medium | Sama — perlu /superadmin/dashboard |
| TC12 | Public | Guest | GET /community-own | 302 → /login (per README) | 404 | ❌ FAIL | Medium | Sama |
| TC13 | Public | Guest | GET /brand | 302 → /login (per README) | 404 | ❌ FAIL | Medium | Sama |
| TC14 | Public | Guest | GET /company-owner | 302 → /login (per README) | 404 | ❌ FAIL | Medium | Sama |
| TC15 | Public | Guest | GET /member/dashboard | 302 → /login | 302 → /login | ✅ PASS | - | `check_unauth2.php` |
| TC16 | Public | Guest | GET /superadmin/dashboard | 302 → /admin/login | 302 → /admin/login | ✅ PASS | - | `check_unauth2.php` |
| TC17 | Public | Guest | GET /community-own/dashboard | 302 → /login | 302 → /login | ✅ PASS | - | `check_unauth2.php` |
| TC18 | Public | Guest | GET /brand/dashboard | 302 → /login | 302 → /login | ✅ PASS | - | `check_unauth2.php` |
| TC19 | Public | Guest | GET /company-owner/dashboard | 302 → /login | 302 → /login | ✅ PASS | - | `check_unauth2.php` |
| TC20 | Public | Guest | GET /admin/login | 200 | 200, 4122 | ✅ PASS | - | CSV |
| TC21 | Public | Guest | GET /up (health) | 200 | 200, 1937 | ✅ PASS | - | CSV |
| TC22 | Public | Guest | GET /nonexistent | 404 | 404 | ✅ PASS | - | CSV |
| TC23 | Auth | Member | POST /login (member@komuna.test/password) | 302 → /member/dashboard | 302 → /member/dashboard | ✅ PASS | - | `test_login_flow.php` |
| TC24 | Auth | Community Owner | POST /login (community.owner@komuna.test/password) | 302 → /community-own/dashboard | 302 → /community-own/dashboard | ✅ PASS | - | `test_login_flow.php` |
| TC25 | Auth | Brand Owner | POST /login (brand.owner@komuna.test/password) | 302 → /brand/dashboard | 302 → /brand/dashboard | ✅ PASS | - | `test_login_flow.php` |
| TC26 | Auth | Company Owner | POST /login (company.owner@komuna.test/password) | 302 → /company-owner/dashboard | 302 → /company-owner/dashboard | ✅ PASS | - | `test_login_flow.php` |
| TC27 | Auth | Platform Admin | POST /login (admin@komuna.test/password) | 302 → /superadmin/dashboard | 302 → /superadmin/dashboard | ✅ PASS | - | `test_login_flow.php` |
| TC28 | Auth | Banned | POST /login (banned@komuna.test/password) | 302 → /account-restricted | 302 → /account-restricted | ✅ PASS | - | `test_login_flow.php` |
| TC29 | Auth | Suspended | POST /login (suspended@komuna.test/password) | 302 → /account-restricted | 302 → /account-restricted | ✅ PASS | - | `test_login_flow.php` |
| TC30 | Auth | Wrong password | POST /login (member@komuna.test/WRONG) | 302 → /login with error | 302 → /login | ✅ PASS | - | `test_login_flow.php` |
| TC31 | Auth | Superadmin | POST /login (superadmin@komuna.test/password) | error "login di admin panel" | 302 → /login with error | ✅ PASS | - | `test_login_flow.php` |

## Ringkasan

- **Total: 31** | **PASS: 22** | **FAIL: 9**
- Semua FAIL terkait **inkonsistensi README** (bukan bug fungsional inti).
- **Auth redirect logic berfungsi dengan benar** untuk semua role yang valid.
- **Demo users** perlu di-seed manual; seeder di DatabaseSeeder hanya jalan jika `APP_ENV=local || APP_DEBUG=true` — `APP_ENV=local` di `.env`, tapi `APP_DEBUG=true`. Setelah saya run manual, semua OK.

## Lokasi File Bukti

- `storage/qa/local_smoke_results.csv` — hasil smoke test endpoint publik
- `scripts/local_smoke.ps1` — script smoke
- `scripts/test_login_flow.php` — script login per role
- `scripts/check_unauth.php` dan `check_unauth2.php` — cek redirect guest
- `scripts/check_users.php` — audit user DB
- `scripts/force_reseed_demo_users.php` — restore soft-deleted user + reseed
