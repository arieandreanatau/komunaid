# 02 — Folder Inventory

## Ringkasan Struktur Saat Ini

| Path | Type | Purpose | Status |
|---|---|---|---|
| `app/Http/Controllers/Auth/` | 8 controllers | Login, register, onboarding, password reset | active (legacy) |
| `app/Http/Controllers/Member/` | 16 controllers | Fitur dashboard member | active (legacy) |
| `app/Http/Controllers/CommunityOwner/` | many | Kelola komunitas | active (legacy) |
| `app/Http/Controllers/BrandOwner/` | many | Kelola brand | active (legacy) |
| `app/Http/Controllers/CompanyOwner/` | many | Kelola perusahaan | active (legacy) |
| `app/Http/Controllers/Public/` | many | Halaman publik | active (legacy) |
| `app/Http/Controllers/Superadmin/` | 25+ controllers | Admin panel | active (legacy) |
| `app/Http/Controllers/Shared/` | misc | Cron, helper | active (legacy) |
| `app/Http/Controllers/Simplified/**` | 5 controllers | **Baru: v2 single-flow** | active (v2) |
| `app/Services/Simplified/**` | 7 services | Business logic v2 | active (v2) |
| `app/Http/Requests/Simplified/**` | 7 requests | Validation v2 | active (v2) |
| `app/Models/` | 73 model | Domain model | active (mostly) |
| `app/Enums/` | 13 enums | Status/role enum | active |
| `database/migrations/` | 110+ | Schema | active (banyak legacy) |
| `routes/web.php` | single entry | Load modules | active |
| `routes/modules/` | 10 files | Per-role routes | active |
| `routes/modules/simplified.php` | new | v2 routes | active (v2) |
| `resources/views/auth/` | views | Auth UI | active (legacy) |
| `resources/views/member/` | many | Member UI | active (legacy) |
| `resources/views/simplified/**` | 14+ views | v2 UI | active (v2) |
| `resources/views/superadmin/` | 30+ views | Admin UI | active (legacy) |
| `tests/` | empty | PHPUnit (belum ada test) | unknown |

## Status Code
- **active** = dipakai live.
- **legacy** = berasal dari versi lama tapi masih dipakai.
- **unused_candidate** = tidak ditemukan referensi.
- **archive_candidate** = masih berguna sebagai referensi tapi bisa diarsipkan.
