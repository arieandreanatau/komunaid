# KomunaID — Local Test Plan

> **Target:** end-to-end manual + scripted smoke test pada `http://127.0.0.1:8000` (XAMPP + Laravel serve).
> **Env:** local, MySQL `komunaid`, seeders master + demo.
> **Test framework:** PHPUnit 11 terinstal, namun **fitur belum ada** (lihat G33). Plan ini menyediakan 2 jenis test:
> 1. **Smoke HTTP** — `Invoke-WebRequest` terhadap endpoint kunci.
> 2. **Flow-based script** — login → aksi per role, validasi redirect & response code.
> 3. **Browser manual checklist** — dijalankan oleh QA engineer.

## 1. Prasyarat

* XAMPP aktif: Apache (`Apache2.4`) + MySQL.
* `php artisan migrate` selesai.
* `php artisan db:seed` selesai (roles, superadmin, demo users, demo communities, demo brands, demo collaborations).
* `php artisan storage:link` selesai.
* `php artisan serve --host=127.0.0.1 --port=8000` aktif.

## 2. Test Account yang Digunakan

(Sumber: `README.md` + `test_logins.php` + `database/seeders/Demo/DemoUserSeeder.php`)

| Role | Email | Password | Tujuan test |
|------|-------|----------|-------------|
| Superadmin | `superadmin@komuna.test` | `password` | Full admin |
| Superadmin (alt) | `superadmin@komuna.id` | `password` | Backup superadmin |
| Platform admin | `admin@komuna.test` | `password` | Limited admin |
| Member | `member@komuna.test` | `password` | Member flow |
| Community Owner | `community.owner@komuna.test` | `password` | Community flow |
| Brand Owner | `brand.owner@komuna.test` | `password` | Brand flow |
| Company Owner | `company.owner@komuna.test` | `password` | Company flow |
| Banned | `banned@komuna.test` | `password` | Negative test |
| Suspended | `suspended@komuna.test` | `password` | Negative test |

Catatan: `test_logins.php` memakai `Password123!`. Default seeder memakai `password`. **Test akan memakai default seeder (`password`)**.

## 3. Test Matrix

### 3.1 Public / Guest

| ID | Aksi | Expected |
|----|------|----------|
| P01 | GET / | 200, title "KomunaID" |
| P02 | GET /komunitas | 200, list komunitas |
| P03 | GET /komunitas/{slug-existing} | 200, detail |
| P04 | GET /events | 200, list event |
| P05 | GET /events/{slug-existing} | 200, detail event |
| P06 | GET /blog | 200 |
| P07 | GET /about | 200 |
| P08 | GET /contact | 200 |
| P09 | GET /login | 200 |
| P10 | GET /register | 200 |
| P11 | GET /tentang-kami | **404 — README mismatch** (BUG) |
| P12 | GET /hubungi-kami | **404 — README mismatch** (BUG) |
| P13 | GET /event | **404 — README mismatch** (BUG) |
| P14 | GET /up | 200 (health) |

### 3.2 Member

| ID | Aksi | Expected |
|----|------|----------|
| M01 | POST /login (member@komuna.test) | 302 ke /member |
| M02 | GET /member | 200 dashboard |
| M03 | GET /member/profile | 200 |
| M04 | PUT /member/profile (update bio) | 302, success |
| M05 | GET /komunitas → klik Join | 302, success, pivot aktif |
| M06 | Klik Leave | 302, status=left |
| M07 | GET /member/communities | 200, list |
| M08 | GET /events/{slug} → Register | 302, event_registration created |
| M09 | GET /member/events | 200 |
| M10 | POST /logout | 302 ke / |

### 3.3 Community Owner

| ID | Aksi | Expected |
|----|------|----------|
| C01 | Login community.owner | 302 /community-own |
| C02 | GET /community-own | 200 dashboard |
| C03 | POST /community-own/communities (create) | 302, status=pending |
| C04 | Superadmin approve | status=approved |
| C05 | Edit komunitas | 302, success |
| C06 | Add member | 302, success |
| C07 | Remove member | 302, success |
| C08 | Ban member | 302, success, CommunityBan record |
| C09 | Create event | 302, status=pending |
| C10 | Superadmin approve event | status=approved |
| C11 | Open volunteer campaign | 302, success |
| C12 | Get dashboard | 200, metric update |

### 3.4 Brand Owner

| ID | Aksi | Expected |
|----|------|----------|
| B01 | Login brand.owner | 302 /brand |
| B02 | GET /brand | 200 |
| B03 | POST /brand/brands (create) | 302, pending |
| B04 | Superadmin approve | approved |
| B05 | Create campaign | 302 |
| B06 | Create proposal ke komunitas | 302, status=draft |
| B07 | Get /brand/proposals | 200 |

### 3.5 Company Owner

| ID | Aksi | Expected |
|----|------|----------|
| CO01 | Login company.owner | 302 /company-owner |
| CO02 | POST /company-owner/companies (create) | 302, pending |
| CO03 | Superadmin approve | approved |
| CO04 | Add brand under company | 302, success |
| CO05 | Dashboard | 200 |

### 3.6 Superadmin

| ID | Aksi | Expected |
|----|------|----------|
| S01 | Login superadmin@komuna.test (via /admin/login) | 302 /superadmin |
| S02 | GET /superadmin | 200 dashboard |
| S03 | GET /superadmin/approval-center | 200 |
| S04 | POST /superadmin/approval-center/communities/{id}/approve | 302, success |
| S05 | POST /superadmin/brands/{id}/approve | 302, success |
| S06 | POST /superadmin/companies/{id}/approve | 302, success |
| S07 | GET /superadmin/users | 200 |
| S08 | POST /superadmin/members/{id}/ban | 302, banned_at terisi |
| S09 | GET /superadmin/audit-logs | 200 |
| S10 | GET /superadmin/master-data | 200 |
| S11 | GET /superadmin/cms/homepage | 200 |
| S12 | GET /superadmin/cms/blogs | 200 |
| S13 | Export /superadmin/communities/export | 200 CSV |

### 3.7 Negative

| ID | Aksi | Expected |
|----|------|----------|
| N01 | Login banned user | 302 ke /account-restricted |
| N02 | Login suspended user | 302 ke /account-restricted |
| N03 | Superadmin mencoba login di /login (bukan /admin/login) | error "akun superadmin harus login di admin panel" |
| N04 | Guest GET /superadmin | 302 ke /admin/login (lihat `redirectGuestsTo`) |
| N05 | Member GET /superadmin | 403 |
| N06 | Community owner GET /superadmin | 403 |
| N07 | Brand owner GET /superadmin | 403 |

## 4. Script Plan

Lokasi: `scripts/local_smoke.ps1` (akan ditulis pada tahap E) — script yang menjalankan:
1. `Invoke-WebRequest` ke semua endpoint di P*, M*, C*, B*, CO*, S*, N*.
2. Login cycle untuk tiap role.
3. Output CSV: `endpoint,role,expected,actual,status_code,passed`.

## 5. Alat Ukur

- HTTP status code
- HTML title (`<title>`)
- URL redirect (`Location` header)
- Database record count (via `php artisan tinker --execute='echo ...'`)

## 6. Exit Criteria

- Semua ✅ harus passed.
- Semua ❌ (negative) harus blocked/redirected sesuai expected.
- Bug list harus lengkap dan diberi severity.
- Tidak ada 500 error di log (`storage/logs/laravel.log`).
