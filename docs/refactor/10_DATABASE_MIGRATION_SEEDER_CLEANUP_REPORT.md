# 10 — Database Migration & Seeder Cleanup Report

## Migration Baru (v2)
| File | Perubahan | Risk | Action |
|---|---|---|---|
| `2026_06_28_093405_add_simplified_approval_fields_to_entities_table` | tambah `approved_by/at`, `rejection_reason`, `revision_notes`, `submitted_at` ke communities/brands/companies | low (nullable) | applied |
| `2026_06_28_094054_expand_simplified_status_enum_on_entities` | ENUM `status` di communities/brands diperluas ke simplified set | medium (existing data valid) | applied |
| `2026_06_28_094134_expand_community_member_role_status_enum` | ENUM `role` & `status` di community_members diperluas | low (backfilled pending) | applied |
| `2026_06_28_094244_expand_brand_member_status_enum` | ENUM `status` di brand_members diperluas | low | applied |
| `2026_06_28_094307_add_tax_number_to_companies_table` | tambah `tax_number` ke companies | low (nullable) | applied |
| `2026_06_28_094341_create_company_members_table` | tabel baru company-user pivot | low | applied |
| `2026_06_28_094439_add_default_role_default_to_users` | set DB default `default_role=member`, `status=active` (NOT NULL) | medium (existing rows dibackfill dulu) | applied |

## Migration Lama
- 100+ migration lama **tidak dihapus** (sudah pernah jalan di environment apapun).
- Audit v1/v2 alignment migration `2026_06_27_000001` sudah ada sebelumnya.

## Seeder
- RoleSeeder, PermissionSeeder, dan seeder lain **tidak diubah** (Spatie roles sudah ada).
- Tidak ada duplicate seeder yang ditemukan.

## Idempotency
- Semua migration baru pakai `if (!Schema::hasColumn(...))` atau ENUM `MODIFY` — aman dijalankan berulang.
- Smoke test membersihkan data dengan `forceDelete()` agar repeatable.
