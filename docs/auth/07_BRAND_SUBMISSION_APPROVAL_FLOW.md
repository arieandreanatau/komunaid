# 07 — Brand Submission & Approval Flow

## Submission
- Route: `GET/POST /v2/dashboard/apply/brand`
- View: `resources/views/simplified/submissions/brand/create.blade.php`
- Form Request: `App\Http\Requests\Simplified\Submission\SubmitBrandRequest`
- Service: `EntitySubmissionService::submitBrand`

## Field Submission
| Field | Tipe | Validasi |
|---|---|---|
| brand_name | string | required, unique, max 255 |
| brand_description | text | required, min 30 |
| industry | string | nullable |
| website | url | nullable |
| logo | file | nullable, image, max 2MB |
| banner | file | nullable, image, max 4MB |
| company_relation | enum | required, in:independent,under_existing_company,will_create_company_later |
| company_id | int | required_if:company_relation,under_existing_company |
| contact_email | email | nullable |
| contact_phone | string | nullable |

## Data Disimpan
- `brands`: `owner_id`, `status=pending_approval`, `submitted_at`, `company_id` (jika applicable).
- `brand_members`: `role=owner_candidate`, `status=pending`.

## Approval Routes (admin)
- `GET    /v2/admin/approvals/brands?status=…`
- `GET    /v2/admin/approvals/brands/{id}`
- `POST   /v2/admin/approvals/brands/{id}/approve`
- `POST   /v2/admin/approvals/brands/{id}/reject`
- `POST   /v2/admin/approvals/brands/{id}/request-revision`
- `POST   /v2/admin/approvals/brands/{id}/suspend`

## Aksi
Lihat `docs/auth/06_COMMUNITY_SUBMISSION_APPROVAL_FLOW.md` (pola sama, ganti `community` ↔ `brand`).

## Self-Approval Guard
- `abort_if($brand->owner_id === Auth::id(), 403)`.
