# 25 — DATA SECURITY & PRIVACY POLICY

## 25.1 Data classification

| Class | Examples | Storage | Exposure | Retention |
|---|---|---|---|---|
| Public | community name, event title, public profile photo | plain | public endpoints | unlimited |
| Internal | last login, internal notes, role | plain | auth user + admin | 2 years |
| Sensitive (PII) | email, phone, address | plain (with access control) | auth user + admin + scope | until user delete + 30 days |
| Sensitive (auth) | password | bcrypt | never | until user delete |
| Sensitive (token) | remember_token, password_reset_tokens, sanctum | plain (one-way usage) | never | until invalid |
| Sensitive (financial) | wallet balance, transaction history | plain (with audit) | self + admin | 7 years (UU PDP + tax) |
| Sensitive (audit) | audit_logs | plain (immutable) | superadmin / platform_admin | 7 years |

## 25.2 Encryption / masking
- Passwords: `bcrypt` (Laravel default).
- Tokens: opaque random strings, not derivable.
- Email / phone: shown in masked form on admin list (`em***@gmail.com`, `+62-812-****-1234`).
- IP in `login_logs` and `audit_logs`: stored as-is for security; not exposed in public APIs.

## 25.3 Access control
- Backend policy is source of truth.
- Cross-org read returns 403.
- Export restricted to caller scope, logged in `exports`.
- Admin endpoints require `superadmin` OR `platform_admin`.

## 25.4 Retention
- Personal data: until account deletion + 30 days, then hard delete (cascade).
- Audit logs: 7 years.
- Login logs: 1 year.
- Export files: 30 days.
- Soft-deleted users: 30 days before hard delete (cascading).

## 25.5 Right of data subject (UU PDP)
- **Access**: profile + download own data via `/member/reports`.
- **Correct**: `/member/profile`.
- **Delete**: `/member/account/delete` → confirm → soft delete.
- **Object**: opt-out of marketing emails via notification preferences.

## 25.6 Logging
- Never log password, token, or `Authorization` header.
- Sanitize `$_REQUEST` in any custom log line.
- `error_log` / Laravel log must not include form payload.

## 25.7 Backup
- Daily `mysqldump` encrypted at rest.
- 30-day rotation.
- Restore drill quarterly.
