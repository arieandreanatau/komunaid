# Permission Matrix — KomunaID Super Admin MVP

## 1. Overview

Dokumen ini mendefinisikan matriks izin untuk setiap aksi admin di seluruh modul Platform Governance. Setiap aksi ditmapping ke role yang diperlukan untuk melaksanakannya.

### Role Definitions

| Role | Deskripsi | Level |
|------|-----------|-------|
| `SUPER_ADMIN` | Admin tertinggi, memiliki akses penuh ke seluruh fitur platform | 1 |
| `PLATFORM_ADMIN` | Admin platform, memiliki akses ke fitur operasional | 2 |
| `MEMBER` | Anggota biasa, akses terbatas ke fitur publik | 3 |

---

## 2. Authentication Module

| Action | Endpoint | SUPER_ADMIN | PLATFORM_ADMIN | MEMBER |
|--------|----------|:-----------:|:--------------:|:------:|
| Login | `POST /api/v1/auth/login` | ✅ | ✅ | ✅ |
| Logout | `POST /api/v1/auth/logout` | ✅ | ✅ | ✅ |
| Refresh Token | `POST /api/v1/auth/refresh` | ✅ | ✅ | ✅ |
| Forgot Password | `POST /api/v1/auth/forgot-password` | ✅ | ✅ | ✅ |
| Reset Password | `POST /api/v1/auth/reset-password` | ✅ | ✅ | ✅ |
| Change Password | `PUT /api/v1/auth/change-password` | ✅ | ✅ | ❌ |
| View Login History | `GET /api/v1/auth/login-history` | ✅ | ✅ | ❌ |
| View All Login History | `GET /api/v1/auth/login-history/all` | ✅ | ❌ | ❌ |
| Enable 2FA | `POST /api/v1/auth/2fa/enable` | ✅ | ✅ | ❌ |
| Disable 2FA | `POST /api/v1/auth/2fa/disable` | ✅ | ✅ | ❌ |

---

## 3. Dashboard Module

| Action | Endpoint | SUPER_ADMIN | PLATFORM_ADMIN | MEMBER |
|--------|----------|:-----------:|:--------------:|:------:|
| View Dashboard | `GET /api/v1/admin/dashboard` | ✅ | ✅ | ❌ |
| View Statistics | `GET /api/v1/admin/dashboard/stats` | ✅ | ✅ | ❌ |
| View Growth Chart | `GET /api/v1/admin/dashboard/growth` | ✅ | ✅ | ❌ |
| View Recent Activity | `GET /api/v1/admin/dashboard/activity` | ✅ | ✅ | ❌ |
| View Pending Reviews | `GET /api/v1/admin/dashboard/pending` | ✅ | ✅ | ❌ |
| View Moderation Queue | `GET /api/v1/admin/dashboard/moderation` | ✅ | ✅ | ❌ |
| Quick Actions | `POST /api/v1/admin/dashboard/quick-actions` | ✅ | ✅ | ❌ |

---

## 4. Member Management Module

| Action | Endpoint | SUPER_ADMIN | PLATFORM_ADMIN | MEMBER |
|--------|----------|:-----------:|:--------------:|:------:|
| List Members | `GET /api/v1/admin/members` | ✅ | ✅ | ❌ |
| Search Members | `GET /api/v1/admin/members/search` | ✅ | ✅ | ❌ |
| View Member Detail | `GET /api/v1/admin/members/:id` | ✅ | ✅ | ❌ |
| Deactivate Account | `PUT /api/v1/admin/members/:id/deactivate` | ✅ | ✅ | ❌ |
| Reactivate Account | `PUT /api/v1/admin/members/:id/reactivate` | ✅ | ❌ | ❌ |
| Reset Member Password | `POST /api/v1/admin/members/:id/reset-password` | ✅ | ✅ | ❌ |
| Assign Role | `PUT /api/v1/admin/members/:id/role` | ✅ | ❌ | ❌ |
| Export Members | `GET /api/v1/admin/members/export` | ✅ | ✅ | ❌ |
| View Member Communities | `GET /api/v1/admin/members/:id/communities` | ✅ | ✅ | ❌ |

---

## 5. Community Approval Module

| Action | Endpoint | SUPER_ADMIN | PLATFORM_ADMIN | MEMBER |
|--------|----------|:-----------:|:--------------:|:------:|
| List Pending Communities | `GET /api/v1/admin/community-approvals` | ✅ | ✅ | ❌ |
| View Community Detail | `GET /api/v1/admin/community-approvals/:id` | ✅ | ✅ | ❌ |
| Approve Community | `POST /api/v1/admin/community-approvals/:id/approve` | ✅ | ✅ | ❌ |
| Request Revision | `POST /api/v1/admin/community-approvals/:id/revision` | ✅ | ✅ | ❌ |
| Reject Community | `POST /api/v1/admin/community-approvals/:id/reject` | ✅ | ✅ | ❌ |
| View Approval History | `GET /api/v1/admin/community-approvals/:id/history` | ✅ | ✅ | ❌ |
| Bulk Approve | `POST /api/v1/admin/community-approvals/bulk-approve` | ✅ | ❌ | ❌ |
| Bulk Reject | `POST /api/v1/admin/community-approvals/bulk-reject` | ✅ | ❌ | ❌ |

---

## 6. Community Management Module

| Action | Endpoint | SUPER_ADMIN | PLATFORM_ADMIN | MEMBER |
|--------|----------|:-----------:|:--------------:|:------:|
| List Communities | `GET /api/v1/admin/communities` | ✅ | ✅ | ❌ |
| View Community Detail | `GET /api/v1/admin/communities/:id` | ✅ | ✅ | ❌ |
| Suspend Community | `PUT /api/v1/admin/communities/:id/suspend` | ✅ | ✅ | ❌ |
| Reactivate Community | `PUT /api/v1/admin/communities/:id/reactivate` | ✅ | ❌ | ❌ |
| Delete Community | `DELETE /api/v1/admin/communities/:id` | ✅ | ❌ | ❌ |
| List Categories | `GET /api/v1/admin/community-categories` | ✅ | ✅ | ❌ |
| Create Category | `POST /api/v1/admin/community-categories` | ✅ | ✅ | ❌ |
| Update Category | `PUT /api/v1/admin/community-categories/:id` | ✅ | ✅ | ❌ |
| Delete Category | `DELETE /api/v1/admin/community-categories/:id` | ✅ | ❌ | ❌ |
| View Community Stats | `GET /api/v1/admin/communities/:id/stats` | ✅ | ✅ | ❌ |

---

## 7. Event Management Module

| Action | Endpoint | SUPER_ADMIN | PLATFORM_ADMIN | MEMBER |
|--------|----------|:-----------:|:--------------:|:------:|
| List Events | `GET /api/v1/admin/events` | ✅ | ✅ | ❌ |
| View Event Detail | `GET /api/v1/admin/events/:id` | ✅ | ✅ | ❌ |
| Approve Event | `POST /api/v1/admin/events/:id/approve` | ✅ | ✅ | ❌ |
| Cancel Event | `PUT /api/v1/admin/events/:id/cancel` | ✅ | ✅ | ❌ |
| Edit Event | `PUT /api/v1/admin/events/:id` | ✅ | ✅ | ❌ |
| Delete Event | `DELETE /api/v1/admin/events/:id` | ✅ | ❌ | ❌ |
| View Event Participants | `GET /api/v1/admin/events/:id/participants` | ✅ | ✅ | ❌ |
| Export Participants | `GET /api/v1/admin/events/:id/participants/export` | ✅ | ✅ | ❌ |

---

## 8. Volunteer Management Module

| Action | Endpoint | SUPER_ADMIN | PLATFORM_ADMIN | MEMBER |
|--------|----------|:-----------:|:--------------:|:------:|
| List Volunteers | `GET /api/v1/admin/volunteers` | ✅ | ✅ | ❌ |
| View Volunteer Detail | `GET /api/v1/admin/volunteers/:id` | ✅ | ✅ | ❌ |
| Approve Volunteer | `PUT /api/v1/admin/volunteers/:id/approve` | ✅ | ✅ | ❌ |
| Revoke Volunteer | `PUT /api/v1/admin/volunteers/:id/revoke` | ✅ | ✅ | ❌ |
| Assign to Event | `POST /api/v1/admin/volunteers/:id/assign` | ✅ | ✅ | ❌ |
| Unassign from Event | `DELETE /api/v1/admin/volunteers/:id/unassign/:eventId` | ✅ | ✅ | ❌ |
| View Volunteer Stats | `GET /api/v1/admin/volunteers/stats` | ✅ | ✅ | ❌ |
| Export Volunteers | `GET /api/v1/admin/volunteers/export` | ✅ | ✅ | ❌ |

---

## 9. Moderation Module

| Action | Endpoint | SUPER_ADMIN | PLATFORM_ADMIN | MEMBER |
|--------|----------|:-----------:|:--------------:|:------:|
| List Reports | `GET /api/v1/admin/moderations` | ✅ | ✅ | ❌ |
| View Report Detail | `GET /api/v1/admin/moderations/:id` | ✅ | ✅ | ❌ |
| Issue Warning | `POST /api/v1/admin/moderations/:id/warn` | ✅ | ✅ | ❌ |
| Suspend User | `POST /api/v1/admin/moderations/:id/suspend` | ✅ | ✅ | ❌ |
| Permanent Suspend | `POST /api/v1/admin/moderations/:id/permanent-suspend` | ✅ | ❌ | ❌ |
| Remove Content | `DELETE /api/v1/admin/moderations/:id/content` | ✅ | ✅ | ❌ |
| Dismiss Report | `POST /api/v1/admin/moderations/:id/dismiss` | ✅ | ✅ | ❌ |
| Handle Appeal | `PUT /api/v1/admin/moderations/:id/appeal` | ✅ | ❌ | ❌ |
| View Moderation History | `GET /api/v1/admin/moderations/history/:userId` | ✅ | ✅ | ❌ |

---

## 10. CMS Module

| Action | Endpoint | SUPER_ADMIN | PLATFORM_ADMIN | MEMBER |
|--------|----------|:-----------:|:--------------:|:------:|
| List Pages | `GET /api/v1/admin/cms/pages` | ✅ | ✅ | ❌ |
| View Page | `GET /api/v1/admin/cms/pages/:id` | ✅ | ✅ | ❌ |
| Create Page | `POST /api/v1/admin/cms/pages` | ✅ | ✅ | ❌ |
| Update Page | `PUT /api/v1/admin/cms/pages/:id` | ✅ | ✅ | ❌ |
| Delete Page | `DELETE /api/v1/admin/cms/pages/:id` | ✅ | ❌ | ❌ |
| Publish Page | `POST /api/v1/admin/cms/pages/:id/publish` | ✅ | ✅ | ❌ |
| Unpublish Page | `POST /api/v1/admin/cms/pages/:id/unpublish` | ✅ | ✅ | ❌ |
| View Page Versions | `GET /api/v1/admin/cms/pages/:id/versions` | ✅ | ✅ | ❌ |
| Restore Version | `POST /api/v1/admin/cms/pages/:id/versions/:versionId/restore` | ✅ | ❌ | ❌ |
| List Banners | `GET /api/v1/admin/cms/banners` | ✅ | ✅ | ❌ |
| Create Banner | `POST /api/v1/admin/cms/banners` | ✅ | ✅ | ❌ |
| Update Banner | `PUT /api/v1/admin/cms/banners/:id` | ✅ | ✅ | ❌ |
| Delete Banner | `DELETE /api/v1/admin/cms/banners/:id` | ✅ | ❌ | ❌ |
| Upload Media | `POST /api/v1/admin/cms/media` | ✅ | ✅ | ❌ |

---

## 11. Notifications Module

| Action | Endpoint | SUPER_ADMIN | PLATFORM_ADMIN | MEMBER |
|--------|----------|:-----------:|:--------------:|:------:|
| List Notifications | `GET /api/v1/admin/notifications` | ✅ | ✅ | ❌ |
| Send Manual Notification | `POST /api/v1/admin/notifications/send` | ✅ | ✅ | ❌ |
| Send Bulk Notification | `POST /api/v1/admin/notifications/bulk` | ✅ | ❌ | ❌ |
| List Templates | `GET /api/v1/admin/notifications/templates` | ✅ | ✅ | ❌ |
| Create Template | `POST /api/v1/admin/notifications/templates` | ✅ | ✅ | ❌ |
| Update Template | `PUT /api/v1/admin/notifications/templates/:id` | ✅ | ✅ | ❌ |
| Delete Template | `DELETE /api/v1/admin/notifications/templates/:id` | ✅ | ❌ | ❌ |
| View Notification Stats | `GET /api/v1/admin/notifications/stats` | ✅ | ✅ | ❌ |
| View Send History | `GET /api/v1/admin/notifications/history` | ✅ | ✅ | ❌ |
| Update Channel Settings | `PUT /api/v1/admin/notifications/channels` | ✅ | ❌ | ❌ |

---

## 12. Audit Log Module

| Action | Endpoint | SUPER_ADMIN | PLATFORM_ADMIN | MEMBER |
|--------|----------|:-----------:|:--------------:|:------:|
| List Audit Logs | `GET /api/v1/admin/audit-logs` | ✅ | ❌ | ❌ |
| View Log Detail | `GET /api/v1/admin/audit-logs/:id` | ✅ | ❌ | ❌ |
| Export Logs | `GET /api/v1/admin/audit-logs/export` | ✅ | ❌ | ❌ |
| View Real-time Stream | `WS /api/v1/admin/audit-logs/stream` | ✅ | ❌ | ❌ |
| Configure Retention | `PUT /api/v1/admin/audit-logs/retention` | ✅ | ❌ | ❌ |

---

## 13. Data Master Module

| Action | Endpoint | SUPER_ADMIN | PLATFORM_ADMIN | MEMBER |
|--------|----------|:-----------:|:--------------:|:------:|
| List Categories | `GET /api/v1/admin/data-master/categories` | ✅ | ✅ | ❌ |
| Create Category | `POST /api/v1/admin/data-master/categories` | ✅ | ✅ | ❌ |
| Update Category | `PUT /api/v1/admin/data-master/categories/:id` | ✅ | ✅ | ❌ |
| Delete Category | `DELETE /api/v1/admin/data-master/categories/:id` | ✅ | ❌ | ❌ |
| List Tags | `GET /api/v1/admin/data-master/tags` | ✅ | ✅ | ❌ |
| Create Tag | `POST /api/v1/admin/data-master/tags` | ✅ | ✅ | ❌ |
| Update Tag | `PUT /api/v1/admin/data-master/tags/:id` | ✅ | ✅ | ❌ |
| Delete Tag | `DELETE /api/v1/admin/data-master/tags/:id` | ✅ | ❌ | ❌ |
| List Skills | `GET /api/v1/admin/data-master/skills` | ✅ | ✅ | ❌ |
| Create Skill | `POST /api/v1/admin/data-master/skills` | ✅ | ✅ | ❌ |
| Update Skill | `PUT /api/v1/admin/data-master/skills/:id` | ✅ | ✅ | ❌ |
| Delete Skill | `DELETE /api/v1/admin/data-master/skills/:id` | ✅ | ❌ | ❌ |
| List Locations | `GET /api/v1/admin/data-master/locations` | ✅ | ✅ | ❌ |
| Create Location | `POST /api/v1/admin/data-master/locations` | ✅ | ✅ | ❌ |
| Update Location | `PUT /api/v1/admin/data-master/locations/:id` | ✅ | ✅ | ❌ |
| Delete Location | `DELETE /api/v1/admin/data-master/locations/:id` | ✅ | ❌ | ❌ |
| Import Data Master | `POST /api/v1/admin/data-master/import` | ✅ | ❌ | ❌ |
| Export Data Master | `GET /api/v1/admin/data-master/export` | ✅ | ✅ | ❌ |
| Platform Config | `GET/PUT /api/v1/admin/data-master/config` | ✅ | ❌ | ❌ |

---

## 14. Security Module

| Action | Endpoint | SUPER_ADMIN | PLATFORM_ADMIN | MEMBER |
|--------|----------|:-----------:|:--------------:|:------:|
| List Active Sessions | `GET /api/v1/admin/security/sessions` | ✅ | ❌ | ❌ |
| Revoke Session | `DELETE /api/v1/admin/security/sessions/:id` | ✅ | ❌ | ❌ |
| Configure IP Whitelist | `PUT /api/v1/admin/security/ip-whitelist` | ✅ | ❌ | ❌ |
| View IP Whitelist | `GET /api/v1/admin/security/ip-whitelist` | ✅ | ❌ | ❌ |
| Configure Rate Limiting | `PUT /api/v1/admin/security/rate-limiting` | ✅ | ❌ | ❌ |
| View Rate Limiting | `GET /api/v1/admin/security/rate-limiting` | ✅ | ❌ | ❌ |
| Configure Password Policy | `PUT /api/v1/admin/security/password-policy` | ✅ | ❌ | ❌ |
| View Password Policy | `GET /api/v1/admin/security/password-policy` | ✅ | ❌ | ❌ |
| Configure Login Attempts | `PUT /api/v1/admin/security/login-attempts` | ✅ | ❌ | ❌ |
| View Security Alerts | `GET /api/v1/admin/security/alerts` | ✅ | ❌ | ❌ |
| Dismiss Alert | `PUT /api/v1/admin/security/alerts/:id/dismiss` | ✅ | ❌ | ❌ |

---

## 15. Settings Module

| Action | Endpoint | SUPER_ADMIN | PLATFORM_ADMIN | MEMBER |
|--------|----------|:-----------:|:--------------:|:------:|
| View Profile | `GET /api/v1/admin/settings/profile` | ✅ | ✅ | ❌ |
| Update Profile | `PUT /api/v1/admin/settings/profile` | ✅ | ✅ | ❌ |
| Change Password | `PUT /api/v1/admin/settings/password` | ✅ | ✅ | ❌ |
| View Notification Prefs | `GET /api/v1/admin/settings/notifications` | ✅ | ✅ | ❌ |
| Update Notification Prefs | `PUT /api/v1/admin/settings/notifications` | ✅ | ✅ | ❌ |
| View Platform Settings | `GET /api/v1/admin/settings/platform` | ✅ | ✅ | ❌ |
| Update Platform Settings | `PUT /api/v1/admin/settings/platform` | ✅ | ❌ | ❌ |
| View Email Settings | `GET /api/v1/admin/settings/email` | ✅ | ❌ | ❌ |
| Update Email Settings | `PUT /api/v1/admin/settings/email` | ✅ | ❌ | ❌ |
| Test Email | `POST /api/v1/admin/settings/email/test` | ✅ | ❌ | ❌ |
| View Appearance Settings | `GET /api/v1/admin/settings/appearance` | ✅ | ✅ | ❌ |
| Update Appearance Settings | `PUT /api/v1/admin/settings/appearance` | ✅ | ❌ | ❌ |

---

## 16. Summary Statistics

| Module | Total Actions | SUPER_ADMIN Only | PLATFORM_ADMIN | Shared |
|--------|:------------:|:----------------:|:--------------:|:------:|
| Authentication | 10 | 1 | 9 | 0 |
| Dashboard | 7 | 0 | 7 | 0 |
| Member Management | 9 | 2 | 7 | 0 |
| Community Approval | 8 | 2 | 6 | 0 |
| Community Management | 10 | 3 | 7 | 0 |
| Event Management | 8 | 1 | 7 | 0 |
| Volunteer Management | 8 | 0 | 8 | 0 |
| Moderation | 9 | 2 | 7 | 0 |
| CMS | 14 | 3 | 11 | 0 |
| Notifications | 10 | 3 | 7 | 0 |
| Audit Log | 5 | 5 | 0 | 0 |
| Data Master | 19 | 7 | 12 | 0 |
| Security | 11 | 11 | 0 | 0 |
| Settings | 12 | 5 | 7 | 0 |
| **Total** | **140** | **45** | **95** | **0** |

### Role Access Distribution

- **SUPER_ADMIN**: 140/140 actions (100%)
- **PLATFORM_ADMIN**: 95/140 actions (67.9%)
- **MEMBER**: 0/140 actions (0%) — Member akses melalui API terpisah
