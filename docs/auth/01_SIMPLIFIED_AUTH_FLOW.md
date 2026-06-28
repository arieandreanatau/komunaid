# KomunaID — Simplified Auth Flow (v2)

## 1. Tujuan

Menggantikan 4 alur registrasi/login (member, komunitas, brand, perusahaan) menjadi **satu alur terpadu** dengan prinsip:

1. Satu akun per orang (`users`).
2. Pendaftaran otomatis sebagai `member`.
3. Login tunggal (`/v2/login`) via email **atau** username.
4. Komunitas, Brand, Perusahaan = **entity** yang diajukan dari dashboard, bukan akun terpisah.
5. Entity berstatus `pending_approval` hingga admin approve.
6. Setelah approve, user mendapat **role tambahan** (`community_owner` / `brand_owner` / `company_owner`).
7. User bisa memiliki banyak entity dan banyak role.

## 2. Route Lengkap (v2)

| Method | URI | Middleware | Controller |
|---|---|---|---|
| GET | `/v2/register` | web, guest | `Simplified\Auth\RegisterController@create` |
| POST | `/v2/register` | web, guest | `Simplified\Auth\RegisterController@store` |
| GET | `/v2/login` | web, guest | `Simplified\Auth\LoginController@create` |
| POST | `/v2/login` | web, guest | `Simplified\Auth\LoginController@store` |
| POST | `/v2/logout` | web, auth | `Simplified\Auth\LoginController@destroy` |
| GET | `/v2/dashboard` | web, auth | `Simplified\Dashboard\DashboardController@index` |
| GET | `/v2/dashboard/submissions` | web, auth | `Simplified\Dashboard\SubmissionsController@index` |
| GET | `/v2/dashboard/submissions/{type}/{id}` | web, auth | `Simplified\Dashboard\SubmissionsController@show` |
| GET | `/v2/dashboard/apply/community` | web, auth | `Simplified\Submission\SubmissionController@createCommunity` |
| POST | `/v2/dashboard/apply/community` | web, auth | `Simplified\Submission\SubmissionController@storeCommunity` |
| GET | `/v2/dashboard/apply/brand` | web, auth | `Simplified\Submission\SubmissionController@createBrand` |
| POST | `/v2/dashboard/apply/brand` | web, auth | `Simplified\Submission\SubmissionController@storeBrand` |
| GET | `/v2/dashboard/apply/company` | web, auth | `Simplified\Submission\SubmissionController@createCompany` |
| POST | `/v2/dashboard/apply/company` | web, auth | `Simplified\Submission\SubmissionController@storeCompany` |
| GET | `/v2/admin/approvals` | web, auth, role | `Simplified\Admin\ApprovalController@index` |
| GET | `/v2/admin/approvals/communities` | web, auth, role | `…@communities` |
| GET | `/v2/admin/approvals/communities/{id}` | web, auth, role | `…@showCommunity` |
| POST | `/v2/admin/approvals/communities/{id}/approve` | web, auth, role | `…@approveCommunity` |
| POST | `/v2/admin/approvals/communities/{id}/reject` | web, auth, role | `…@rejectCommunity` |
| POST | `/v2/admin/approvals/communities/{id}/request-revision` | web, auth, role | `…@revisionCommunity` |
| POST | `/v2/admin/approvals/communities/{id}/suspend` | web, auth, role | `…@suspendCommunity` |
| GET | `/v2/admin/approvals/brands` | web, auth, role | `…@brands` |
| GET | `/v2/admin/approvals/brands/{id}` | web, auth, role | `…@showBrand` |
| POST | `/v2/admin/approvals/brands/{id}/approve` | web, auth, role | `…@approveBrand` |
| POST | `/v2/admin/approvals/brands/{id}/reject` | web, auth, role | `…@rejectBrand` |
| POST | `/v2/admin/approvals/brands/{id}/request-revision` | web, auth, role | `…@revisionBrand` |
| POST | `/v2/admin/approvals/brands/{id}/suspend` | web, auth, role | `…@suspendBrand` |
| GET | `/v2/admin/approvals/companies` | web, auth, role | `…@companies` |
| GET | `/v2/admin/approvals/companies/{id}` | web, auth, role | `…@showCompany` |
| POST | `/v2/admin/approvals/companies/{id}/approve` | web, auth, role | `…@approveCompany` |
| POST | `/v2/admin/approvals/companies/{id}/reject` | web, auth, role | `…@rejectCompany` |
| POST | `/v2/admin/approvals/companies/{id}/request-revision` | web, auth, role | `…@revisionCompany` |
| POST | `/v2/admin/approvals/companies/{id}/suspend` | web, auth, role | `…@suspendCompany` |

Catatan: route prefix `/v2` agar tidak konflik dengan legacy flow di `/`.

## 3. Acceptance Criteria

Lihat `docs/auth/12_BUG_FIXING_REPORT.md` dan hasil `scripts/smoke_simplified.php` (28/28 PASS).
