# 05 — Route Refactor Report

## Status
Routes sudah modular melalui `routes/modules/*.php` (sebelum refactor). Yang ditambahkan di v2:

| Old Route | New Route | Controller | Status |
|---|---|---|---|
| (n/a) | `/v2/register` | Simplified\Auth\RegisterController | added |
| (n/a) | `/v2/login` | Simplified\Auth\LoginController | added |
| (n/a) | `/v2/logout` | Simplified\Auth\LoginController | added |
| (n/a) | `/v2/dashboard` | Simplified\Dashboard\DashboardController | added |
| (n/a) | `/v2/dashboard/submissions` | Simplified\Dashboard\SubmissionsController | added |
| (n/a) | `/v2/dashboard/apply/community` | Simplified\Submission\SubmissionController | added |
| (n/a) | `/v2/dashboard/apply/brand` | Simplified\Submission\SubmissionController | added |
| (n/a) | `/v2/dashboard/apply/company` | Simplified\Submission\SubmissionController | added |
| (n/a) | `/v2/admin/approvals*` (15 routes) | Simplified\Admin\ApprovalController | added |

## Legacy Routes (kept, NOT deleted)
Semua route lama di `/`, `/member`, `/community-own`, `/brand`, `/company`, `/superadmin` tetap hidup untuk backward compatibility.

## Rekomendasi
- Setelah transisi penuh: redirect root `/` → `/v2/dashboard` untuk user yang login.
- Legacy controllers/views tetap di-namespace lama; tidak dipindah untuk menghindari breakage.
- v2 namespace baru `App\Http\Controllers\Simplified\*` mengikuti target struktur dari prompt.
