# 05 — Entity Submission Flow (Umum)

## Konsep
Komunitas, Brand, Perusahaan **bukan akun** melainkan **entity** yang dibuat oleh user yang sudah login. Status awalnya `pending_approval`; role owner baru diberikan saat admin approve.

## Routes
- `GET  /v2/dashboard/apply/community`
- `POST /v2/dashboard/apply/community`
- `GET  /v2/dashboard/apply/brand`
- `POST /v2/dashboard/apply/brand`
- `GET  /v2/dashboard/apply/company`
- `POST /v2/dashboard/apply/company`

## Controller
`App\Http\Controllers\Simplified\Submission\SubmissionController`

## Service
`App\Services\Simplified\EntitySubmissionService`

## Form Request
- `SubmitCommunityRequest`
- `SubmitBrandRequest`
- `SubmitCompanyRequest`

## Service Pendukung
- `App\Services\Simplified\FileUploadService` — handle upload logo/banner.
- `App\Services\Simplified\NotificationService` — kirim notifikasi.
- `App\Services\Simplified\AuditLogService` — tulis audit log.

## Syarat
- User harus login (`auth`).
- User `status = active` dan tidak `banned_at`/suspended (di FormRequest `authorize()`).

## Tabel Terdampak (per submission)
- `communities` / `brands` / `companies` (insert + status `pending_approval`, `submitted_at = now()`).
- `community_members` / `brand_members` / `company_members` (pivot dengan `role=owner_candidate`, `status=pending`).
- `custom_notifications` (1 untuk user, N untuk admin).
- `audit_logs` (`community_submitted` / `brand_submitted` / `company_submitted`).

## File Upload
- Disimpan di disk `public` dengan folder `communities/`, `brands/`, `companies/`.
- Validasi: `image`, `mimes:jpg,jpeg,png,webp`, max 2MB (logo) / 4MB (banner).
- Nama file random (20 char) untuk menghindari tebakan.

## Aturan Penting
- ❌ Tidak assign `community_owner` / `brand_owner` / `company_owner` saat submit.
- ✅ Hanya `owner_candidate` di pivot + `pending_approval` di entity.
- ✅ User tetap `member` sampai admin approve.
- ✅ User tidak bisa approve entity sendiri (dicek di controller dengan `abort_if`).
