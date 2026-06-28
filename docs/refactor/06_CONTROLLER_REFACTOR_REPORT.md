# 06 — Controller Refactor Report

## Perubahan
| Old Controller | New Controller | Logic Moved To Service | Risk | Test |
|---|---|---|---|---|
| `Auth\RegisteredUserController` | `Simplified\Auth\RegisterController` | `Auth\RegisterMemberService` | low (coexist) | ✅ |
| `Auth\AuthenticatedSessionController` | `Simplified\Auth\LoginController` | `Auth\LoginService` | low (coexist) | ✅ |
| (manual dashboard) | `Simplified\Dashboard\DashboardController` | none | low | manual |
| (legacy `Member\RoleRequestController`) | `Simplified\Submission\SubmissionController` | `EntitySubmissionService` | medium (replaces role-request flow) | ✅ |
| (legacy `Superadmin\ApprovalCenterController`) | `Simplified\Admin\ApprovalController` | `ApprovalService` | medium | ✅ |

## Aturan yang Diterapkan
1. Controller tipis — hanya orchestrate.
2. Business logic di Service (Registration, Login, Submission, Approval).
3. Validasi di FormRequest.
4. Audit log di AuditLogService.
5. Notification di NotificationService.
6. File upload di FileUploadService.
7. ApprovalService generik untuk community/brand/company (polymorphic config).

## Generic Approval Pattern
`ApprovalService::approve(Model $entity, User $admin, ?Request $request)` menerima Community/Brand/Company. Method private `resolveConfig()` memilih:
- role owner yang di-grant
- template notifikasi
- action string untuk audit log

## Risk & Mitigasi
- **Risk**: legacy controllers masih hidup → potentially confusing.
- **Mitigation**: keep both, document in `13_CHANGELOG.md`. Disable legacy setelah user migration.
