# 03 — File Classification

| Area | File | Classification | Notes |
|---|---|---|---|
| Auth | `RegisteredUserController.php` | legacy | akan digantikan `Simplified\Auth\RegisterController` |
| Auth | `AuthenticatedSessionController.php` | legacy | akan digantikan `Simplified\Auth\LoginController` |
| Auth | `OnboardingController.php` | archive_candidate | tidak relevan di v2 (langsung dashboard) |
| Auth | `AccountRestrictedController.php` | active | dipakai saat akun suspended |
| Member | `Member/RoleRequestController.php` | legacy | mekanisme lama minta role; di v2 pakai submission+approval |
| Member | `Member/DashboardController.php` | legacy | dashboard lama (multi-tab per-role) |
| Public/* | public pages | active | tidak diubah |
| CommunityOwner/* | full module | legacy | di v2, owner cukup pakai approval lalu akses via role middleware |
| BrandOwner/* | full module | legacy | sama |
| CompanyOwner/* | full module | legacy | sama |
| Superadmin/ApprovalCenterController.php | active (legacy) | approval lama (RoleRequest based) |
| Superadmin/{AuditLog,LoginLog,Brand,…}Controller.php | active (legacy) | admin tools |
| **Simplified/** | new | active (v2) |

## Rekomendasi
1. **JANGAN hapus** legacy controller/view sampai migrasi penuh selesai.
2. **Archive** ke `docs/archive/code/2026-06-28/` hanya jika tidak ada referensi di route, test, atau view.
3. Legacy `RoleRequest` flow akan dinonaktifkan setelah admin migrasi ke `ApprovalService` baru (planned).
