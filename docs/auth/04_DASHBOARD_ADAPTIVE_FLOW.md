# 04 — Dashboard Adaptive Flow

## Route
- `GET /v2/dashboard`

## Controller
`App\Http\Controllers\Simplified\Dashboard\DashboardController`

## View
`resources/views/simplified/dashboard/index.blade.php`

## Layout
`resources/views/simplified/layouts/dashboard.blade.php`

## Data yang Dimuat
1. `$user` — user yang login.
2. `$pendingCommunities` — community milik user dengan status `pending_approval`/`need_revision`/`rejected`.
3. `$pendingBrands` — sama untuk brand.
4. `$pendingCompanies` — sama untuk company.
5. `$approvedCommunities/Brands/Companies` — entity approved milik user.
6. `$isAdmin` — true jika user punya role `superadmin` atau `admin_platform`.
7. `$adminCounts` — jumlah pending approval per entity (hanya untuk admin).

## Section Tampilan

### A. Pending Submission Banner
- Ditampilkan jika ada entity dengan status `pending_approval`/`need_revision`/`rejected`.
- Tautan ke `/v2/dashboard/submissions`.

### B. Approved Entity Cards
- 1 card per entity approved dengan label jenis + tanggal approve.

### C. Quick Actions
- 3 tombol ajukan: Komunitas, Brand, Perusahaan.

### D. Profile Summary
- Nama, username, email, status, role, login terakhir.

### E. Admin Section
- Hanya untuk `superadmin` / `admin_platform`.
- Link ke `/v2/admin/approvals`.

## Sidebar
- Profile, Pengajuan Saya, Ajukan Komunitas/Brand/Perusahaan, Admin Panel (jika admin), Logout.
