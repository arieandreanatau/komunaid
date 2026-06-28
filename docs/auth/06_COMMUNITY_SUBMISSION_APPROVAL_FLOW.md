# 06 — Community Submission & Approval Flow

## Submission
- Route: `GET/POST /v2/dashboard/apply/community`
- View: `resources/views/simplified/submissions/community/create.blade.php`
- Form Request: `App\Http\Requests\Simplified\Submission\SubmitCommunityRequest`
- Service: `EntitySubmissionService::submitCommunity`

## Field Submission
| Field | Tipe | Validasi |
|---|---|---|
| community_name | string | required, unique, max 255 |
| category_id | int | required, exists:community_categories |
| description | text | required, min 30 |
| address | text | nullable |
| province, city | string | nullable |
| contact_email | email | nullable |
| contact_phone | string | nullable |
| social_media | string | nullable |
| logo | file | nullable, image, jpg/png/webp, max 2MB |
| banner | file | nullable, image, jpg/png/webp, max 4MB |

## Data Disimpan
- `communities`: `owner_id = auth user`, `status = pending_approval`, `submitted_at = now()`.
- `community_members`: `role = owner_candidate`, `status = pending`.

## Approval Routes (admin)
- `GET    /v2/admin/approvals/communities?status=…`
- `GET    /v2/admin/approvals/communities/{id}`
- `POST   /v2/admin/approvals/communities/{id}/approve`
- `POST   /v2/admin/approvals/communities/{id}/reject`
- `POST   /v2/admin/approvals/communities/{id}/request-revision`
- `POST   /v2/admin/approvals/communities/{id}/suspend`

## Aksi Approve
- Service: `ApprovalService::approve(Community $community, User $admin)`.
- Update: `status=approved`, `approved_by`, `approved_at`, hapus `rejection_reason/revision_notes`.
- `community_members`: `role=owner`, `status=active`, set `approved_by/at`.
- User mendapat role `community_owner` (Spatie).
- Notifikasi ke user: `community_approved`.
- Audit log: `community_approved`.

## Aksi Reject
- Wajib `rejection_reason` (FormRequest).
- Update: `status=rejected`, simpan `rejection_reason`.
- `community_members.status = rejected`.
- Notifikasi + audit log `community_rejected`.

## Request Revision
- Wajib `revision_notes`.
- Update: `status=need_revision`, simpan `revision_notes`.
- Notifikasi + audit log `community_revision_requested`.

## Suspend
- Update: `status=suspended`.
- Audit log `community_suspended`.

## Self-Approval Guard
- `abort_if($community->owner_id === Auth::id(), 403)` di setiap aksi admin.
