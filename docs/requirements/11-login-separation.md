# 11 — LOGIN SEPARATION REQUIREMENT

**Status:** Draft
**Last Updated:** 2026-06-25

---

## 1. URL Structure

| Aktor | Login URL | Dashboard URL | Logout Redirect |
|-------|-----------|---------------|-----------------|
| Superadmin | `/admin/login` | `/superadmin/dashboard` | `/admin/login` |
| Platform Admin | `/admin/login` | `/superadmin/dashboard` | `/admin/login` |
| Member | `/login` | `/member/dashboard` | `/login` |
| Community Owner | `/login` | `/community-own/dashboard` | `/login` |
| Brand Owner | `/login` | `/brand/dashboard` | `/login` |
| Company Owner | `/login` | `/company/dashboard` | `/login` |

---

## 2. Register

| ID | Requirement |
|----|-------------|
| LS-001 | Register hanya untuk public user (`/register`) |
| LS-002 | Superadmin tidak register dari public page |
| LS-003 | Setelah register, redirect ke onboarding |

---

## 3. Redirect Logic

| ID | Role | Redirect |
|----|------|----------|
| LS-010 | superadmin | `/superadmin/dashboard` |
| LS-011 | platform_admin | `/superadmin/dashboard` |
| LS-012 | member | `/member/dashboard` |
| LS-013 | community_owner | `/community-own/dashboard` |
| LS-014 | brand_owner | `/brand/dashboard` |
| LS-015 | company_owner | `/company/dashboard` |
| LS-016 | Belum ada role khusus | `/member/dashboard` |

---

## 4. Middleware

| ID | Requirement |
|----|-------------|
| LS-020 | `admin` middleware: hanya superadmin & platform_admin |
| LS-021 | `not.superadmin`: mencegah superadmin akses area user biasa |
| LS-022 | `role:xxx`: Spatie middleware untuk role-specific routes |

---

## 5. Security

| ID | Requirement |
|----|-------------|
| LS-030 | Jangan menyebabkan redirect loop |
| LS-031 | Jangan langsung ke beranda jika flow tidak diinginkan |
| LS-032 | Superadmin logout ke `/admin/login`, bukan `/login` |
| LS-033 | User biasa logout ke `/login`, bukan `/admin/login` |

---

## 6. Status Existing

Login separation **sudah diterapkan** dalam codebase:
- `/admin/login` → `Superadmin\LoginController`
- `/login` → `Auth\AuthenticatedSessionController`
- Role-based redirect di `HandleInertiaRequests` middleware
- `EnsureSuperadmin` & `EnsureNotSuperadmin` middleware aktif
