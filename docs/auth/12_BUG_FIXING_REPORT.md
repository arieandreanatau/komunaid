# 12 — Bug Fixing Report

| Bug ID | Summary | Root Cause | Fix | Retest |
|---|---|---|---|---|
| B01 | `pending_approval` ditolak oleh `communities.status` ENUM | ENUM lama `('pending','approved','rejected','archived')` | Migration `2026_06_28_094054_expand_simplified_status_enum_on_entities` | ✅ |
| B02 | `owner_candidate` ditolak oleh `community_members.role` ENUM | ENUM lama `('member','volunteer','admin')` | Migration `2026_06_28_094134_expand_community_member_role_status_enum` | ✅ |
| B03 | `rejected` ditolak oleh `brand_members.status` ENUM | ENUM lama `('pending','active','inactive')` | Migration `2026_06_28_094244_expand_brand_member_status_enum` | ✅ |
| B04 | `tax_number` column missing di `companies` | Belum ada kolom | Migration `2026_06_28_094307_add_tax_number_to_companies_table` | ✅ |
| B05 | `approved_by/approved_at/rejection_reason/revision_notes` tidak tersimpan di Community | Tidak ada di `$fillable` model | Edit `App\Models\Community::$fillable` | ✅ |
| B06 | Sama untuk Brand | Tidak ada di `$fillable` | Edit `App\Models\Brand::$fillable` (termasuk `logo`, `banner`, `contact_*`) | ✅ |
| B07 | Sama untuk Company | Tidak ada di `$fillable` | Edit `App\Models\Company::$fillable` (tambah `tax_number`) | ✅ |
| B08 | `company_brand_members` butuh `brand_id` NOT NULL | Tabel itu adalah pivot 3-arah (company-brand-user) | Buat tabel `company_members` baru + model `App\Models\CompanyMember` | ✅ |
| B09 | `users.default_role` dan `users.status` tidak punya DB default | Default di application layer saja | Migration `2026_06_28_094439_add_default_role_default_to_users` (set NOT NULL DEFAULT) | ✅ |

## Verifikasi
- `php scripts/smoke_simplified.php` → **28 PASS / 0 FAIL**
- `php artisan route:list` → 31 route `simplified.*` terdaftar.
- Tidak ada secret/tidak ada password plain text (semua via `Hash::make`).
