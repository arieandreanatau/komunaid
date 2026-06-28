# KomunaID — Vercel Test Cases

> URL: `https://komunaidv2-komuna.vercel.app`
> Tanggal: 2026-06-28

| ID | Modul | Role | Aksi | Expected | Actual | Status | Severity |
|----|-------|------|------|----------|--------|--------|----------|
| VTC01 | Public | Guest | GET / | 200 | 200 | ✅ | - |
| VTC02 | Public | Guest | GET /komunitas | 200 | 200 | ✅ | - |
| VTC03 | Public | Guest | GET /events | 200 | 200 | ✅ | - |
| VTC04 | Public | Guest | GET /about | 200 | 200 | ✅ | - |
| VTC05 | Public | Guest | GET /contact | 200 | 200 | ✅ | - |
| VTC06 | Public | Guest | GET /blog | 200 (alias) | 404 | ❌ | Medium |
| VTC07 | Public | Guest | GET /blogs | 200 | 200 | ✅ | - |
| VTC08 | Public | Guest | GET /up | 200 | 200 | ✅ | - |
| VTC09 | Public | Guest | GET /tentang-kami | 200 (per README) | 404 | ❌ | High |
| VTC10 | Public | Guest | GET /hubungi-kami | 200 (per README) | 404 | ❌ | High |
| VTC11 | Public | Guest | GET /event | 200 (per README) | 404 | ❌ | High |
| VTC12 | Public | Guest | GET /nonexistent | 404 | 404 | ✅ | - |
| VTC13 | Asset | Guest | GET /build/manifest.json | 200 | 200 | ✅ | - |
| VTC14 | Asset | Guest | GET /assets/app-B_bpLXJ6.css | 200 (per manifest) | **404** | ❌ | **Critical** |
| VTC15 | Asset | Guest | GET /assets/app-CIomGrQN.js | 200 (per manifest) | **404** | ❌ | **Critical** |
| VTC16 | Asset | Guest | GET /build/assets/app-B_bpLXJ6.css | 200 | 200 | ✅ | - |
| VTC17 | Asset | Guest | GET /favicon.ico | 200 | 200 | ✅ | - |
| VTC18 | Asset | Guest | GET /assets/brand/komunaid-logo-full.png | 200 | 200 | ✅ | - |
| VTC19 | Auth | platform@komuna.id | POST /login (Password123!) | 302 → /superadmin/dashboard | 302 → /superadmin/dashboard | ✅ | - |
| VTC20 | Auth | company@komuna.id | POST /login | 302 → /company-owner/dashboard | 302 → /company-owner/dashboard | ✅ | - |
| VTC21 | Auth | community-staff@komuna.id | POST /login | 302 → /member/dashboard | 302 → /member/dashboard | ✅ | - |
| VTC22 | Auth | brand-staff@komuna.id | POST /login | 302 → /brand/dashboard | 302 → /brand/dashboard | ✅ | - |
| VTC23 | Auth | community-admin@komuna.id | POST /login | 302 → /member/dashboard | 302 → /member/dashboard | ✅ | - |
| VTC24 | Auth | volunteer@komuna.id | POST /login | 302 → /member/dashboard | 302 → /member/dashboard | ✅ | - |
| VTC25 | Auth | banned@komuna.id | POST /login | 302 → /account-restricted | 302 → /account-restricted | ✅ | - |
| VTC26 | Auth | premium@komuna.id | POST /login | 302 → /member/dashboard | 302 → /member/dashboard | ✅ | - |
| VTC27 | Auth | member@komuna.id | POST /login | 302 → /member/dashboard | 302 → /login (FAIL) | ❌ | Medium (password berbeda / user inactive) |
| VTC28 | Auth | community@komuna.id | POST /login | 302 → /community-own/dashboard | 302 → /login (FAIL) | ❌ | Medium |
| VTC29 | Auth | brand@komuna.id | POST /login | 302 → /brand/dashboard | 302 → /login (FAIL) | ❌ | Medium |
| VTC30 | Header | Guest | / response cache-control | no-cache | no-cache | ✅ | - |
| VTC31 | Header | Guest | /build/* cache-control | immutable, 1y | immutable, 1y | ✅ | - |
| VTC32 | Header | Guest | /assets/* (working) cache-control | immutable, 1y | immutable, 1y | ✅ | - |

## Ringkasan

- **Total: 32** | **PASS: 24** | **FAIL: 8**
- **Critical FAIL:** VTC14, VTC15 — manifest mengatakan asset ada di `/assets/` tapi Vercel serve 404. Assets hanya ada di `/build/assets/`. Kemungkinan besar `vite.config.js` atau `api/static.php` salah path resolution.
- **High FAIL:** VTC09-VTC11 — README routes tidak ada (sama dengan bug di local).
- **Medium FAIL:** VTC27-VTC29 — `member@komuna.id`, `community@komuna.id`, `brand@komuna.id` tidak bisa login (kemungkinan password diubah atau user inactive). 8 dari 11 prod user OK.

## File Bukti

- `scripts/vercel_smoke.php` — basic smoke
- `scripts/vercel_inspect.php` — inspect content
- `scripts/vercel_login.php` — login dengan local users
- `scripts/vercel_login_prod.php` — login dengan prod users
- `scripts/vercel_login_debug.php` — debug login
- `scripts/vercel_assets.php` — cek asset
- `scripts/vercel_path_probe.php` — probe path
- `scripts/get_manifest.php` — ambil manifest
