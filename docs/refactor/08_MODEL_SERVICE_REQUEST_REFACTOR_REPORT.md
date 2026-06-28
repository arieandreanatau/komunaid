# 08 — Model, Service, Request Refactor Report

## Model Changes (v2)
- `Community::fillable` — tambah `approved_by/at`, `rejection_reason`, `revision_notes`, `submitted_at`.
- `Brand::fillable` — tambah approval fields + `logo`, `banner`, `contact_*`.
- `Company::fillable` — tambah approval + `tax_number`.
- `CompanyMember` (new) — pivot company-user.

## Service Classes (new)
- `Auth\RegisterMemberService` — register + create profile + assign role member + audit.
- `Auth\LoginService` — authenticate + login log + audit.
- `EntitySubmissionService` — submit community/brand/company, set owner_candidate, notify admin+user, audit.
- `ApprovalService` — generic approve/reject/revision/suspend untuk 3 entity.
- `AuditLogService` — wrapper AuditLog::create.
- `NotificationService` — CustomNotification::create untuk user & admin.
- `FileUploadService` — file upload ke disk `public`.

## Request Classes (new)
- `Auth\RegisterRequest` — name, username, email, phone, password, agree_terms.
- `Auth\LoginRequest` — login, password, remember.
- `Submission\SubmitCommunityRequest` — community_name, category_id, description, files.
- `Submission\SubmitBrandRequest` — brand_name, brand_description, company_relation, company_id, files.
- `Submission\SubmitCompanyRequest` — company_name, description, legal_name, tax_number, files.
- `Admin\RejectEntityRequest` — rejection_reason.
- `Admin\RequestRevisionRequest` — revision_notes.

## Custom Error Messages
Semua FormRequest punya method `messages()` dengan pesan bahasa Indonesia yang ramah user.

## Authorization
- `authorize()` di FormRequest memastikan user active + not banned sebelum submission.
- `authorize()` di admin FormRequest memastikan user punya role superadmin/admin_platform.
- Self-approval guard dilakukan di controller (lebih eksplisit).
