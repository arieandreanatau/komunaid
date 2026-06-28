# 08 — Company Submission & Approval Flow

## Submission
- Route: `GET/POST /v2/dashboard/apply/company`
- View: `resources/views/simplified/submissions/company/create.blade.php`
- Form Request: `App\Http\Requests\Simplified\Submission\SubmitCompanyRequest`
- Service: `EntitySubmissionService::submitCompany`

## Field Submission
| Field | Tipe | Validasi |
|---|---|---|
| company_name | string | required, unique, max 255 |
| description | text | required, min 30 |
| industry | string | nullable |
| website | url | nullable |
| legal_name | string | nullable |
| tax_number | string | nullable (MVP, tidak dipaksa) |
| address | text | nullable |
| contact_email | email | nullable |
| contact_phone | string | nullable |
| logo | file | nullable, image, max 2MB |

## Data Disimpan
- `companies`: `owner_id`, `status=pending_approval`, `submitted_at`, `tax_number`, dll.
- `company_members` (tabel baru): `role=owner_candidate`, `status=pending`.

## Approval Routes (admin)
- `GET    /v2/admin/approvals/companies?status=…`
- `GET    /v2/admin/approvals/companies/{id}`
- `POST   /v2/admin/approvals/companies/{id}/approve`
- `POST   /v2/admin/approvals/companies/{id}/reject`
- `POST   /v2/admin/approvals/companies/{id}/request-revision`
- `POST   /v2/admin/approvals/companies/{id}/suspend`

## Aksi
Pola identik dengan community. `ApprovalService` otomatis memilih config `company_owner` dan `company_*` actions.

## Self-Approval Guard
- `abort_if($company->owner_id === Auth::id(), 403)`.

## Catatan MVP
- Verifikasi legal penuh (akta, NPWP valid) **tidak** diwajibkan di MVP.
- `legal_name` & `tax_number` optional.
