# 09 — Role Assignment After Approval

## Prinsip
- `member` diberikan saat register.
- `community_owner` / `brand_owner` / `company_owner` hanya diberikan **setelah entity approved**.
- Role lanjutan (`admin`, `core_team`, `volunteer`, `employee`, `intern`) tidak dibahas di MVP v2; struktur sudah tersedia di ENUM dan role.

## Mekanisme
1. Admin klik Approve.
2. `ApprovalService::approve(Model $entity, User $admin)`:
   - Update entity ke `status=approved`.
   - Update pivot (`role=owner`, `status=active`).
   - **Grant role ke user via `User::assignRole()` (Spatie).**
   - Audit log + notifikasi.
3. Middleware `role:community_owner` di route kelola komunitas akan mulai mengizinkan user tersebut.

## Anti-Bypass
- Role **tidak pernah** di-grant dari controller submission (cuma `owner_candidate` di pivot).
- Role **tidak pernah** di-grant dari request user langsung.
- Hanya `ApprovalService` yang menjalankan `assignRole` untuk owner.

## Audit
- Setiap perubahan role menghasilkan entri di `audit_logs` (action `community_approved` / `brand_approved` / `company_approved`).

## Contoh
- User A daftar → role `member`.
- User A ajukan komunitas → entity `pending_approval`, pivot `owner_candidate`.
- Admin approve → role `member` + `community_owner` (Spatie).
- User A sekarang bisa akses route dengan middleware `role:community_owner`.
