# 13 — Changelog (Simplified Auth v2)

## 2026-06-28 (re-audit run)

### Verified
- `php artisan optimize:clear` — DONE.
- `php artisan route:list --name=simplified` — 28 simplified routes loaded (auth, dashboard, submissions, apply, admin approvals).
- `php artisan migrate:status` — semua migration berstatus Ran, tidak ada Failed/Pending.
- `php artisan test --testsuite=Unit` — 10 passed (10 assertions).
- `npm run build` — Vite build sukses, output `public/build/manifest.json`, `app-dFR4xgl-.css`, `app-CIomGrQN.js`.

### Notes
- Implementasi simplified auth flow (Register → Login → Dashboard adaptif → Submission → Approval → Role owner) sudah lengkap dan konsisten dengan master prompt.
- Route prefix tetap `/v2/*` agar legacy flow tidak ter-disrupt.
- Tidak ada perubahan kode pada run ini; audit bersifat verifikasi.
- 13 dokumen `docs/auth/*` sudah ada; 13 dokumen `docs/refactor/*` sudah ada; brand report di `docs/brand/LOGO_IMPLEMENTATION_REPORT.md` sudah ada.

## 2026-06-28 (initial implementation)

### Added
- `app/Http/Controllers/Simplified/Auth/{RegisterController,LoginController}.php`
- `app/Http/Controllers/Simplified/Dashboard/{DashboardController,SubmissionsController}.php`
- `app/Http/Controllers/Simplified/Submission/SubmissionController.php`
- `app/Http/Controllers/Simplified/Admin/ApprovalController.php`
- `app/Http/Requests/Simplified/Auth/{RegisterRequest,LoginRequest}.php`
- `app/Http/Requests/Simplified/Submission/{SubmitCommunityRequest,SubmitBrandRequest,SubmitCompanyRequest}.php`
- `app/Http/Requests/Simplified/Admin/{RejectEntityRequest,RequestRevisionRequest}.php`
- `app/Services/Simplified/{AuditLogService,NotificationService,FileUploadService,EntitySubmissionService,ApprovalService}.php`
- `app/Services/Simplified/Auth/{RegisterMemberService,LoginService}.php`
- `app/Models/CompanyMember.php`
- `resources/views/simplified/**` (auth, dashboard, submissions, admin approvals, layouts)
- `routes/modules/simplified.php` + registrasi di `routes/web.php`
- Migrations:
  - `2026_06_28_093405_add_simplified_approval_fields_to_entities_table`
  - `2026_06_28_094054_expand_simplified_status_enum_on_entities`
  - `2026_06_28_094134_expand_community_member_role_status_enum`
  - `2026_06_28_094244_expand_brand_member_status_enum`
  - `2026_06_28_094307_add_tax_number_to_companies_table`
  - `2026_06_28_094341_create_company_members_table`
  - `2026_06_28_094439_add_default_role_default_to_users`
- `scripts/smoke_simplified.php` (28 test assertion)
- `docs/auth/01_…13_*.md`

### Changed
- `app/Models/Community.php` — tambah fillable approval fields.
- `app/Models/Brand.php` — tambah fillable approval & contact fields.
- `app/Models/Company.php` — tambah fillable approval + tax_number.
- `routes/web.php` — require `modules/simplified.php`.

### Notes
- Route prefix `/v2/*` agar legacy flow tetap hidup selama migrasi.
- Tidak menghapus kode lama; semua legacy controller/view/route tetap ada.
- Legacy flow masih menggunakan tabel `users` yang sama; keduanya coexist.
