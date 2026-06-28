# 33 — SECURITY AUDIT

## 33.1 Strengths
- `php artisan test` 201/201 pass; no test-side bypass of policy.
- Spatie Permissions used (industry standard).
- `audit_logs`, `login_logs`, `approval_logs` are populated by code.
- Banned / suspended users are blocked at `AuthenticatedSessionController@store` and `isBannedOrSuspended()`.
- Superadmin is forced to use `/admin/login`.

## 33.2 Findings

| # | Finding | Severity | Action |
|---|---|---|---|
| SEC-01 | No login throttle | High | Add `throttle:5,1` to POST `/login` |
| SEC-02 | No `RolesAndPermissionsSeeder` | High | Add seeder |
| SEC-03 | Password policy is 8-char minimum only | Medium | Add complexity hint (UX only) |
| SEC-04 | MFA not enabled for superadmin | Medium (Phase 2) | TOTP optional |
| SEC-05 | No file upload MIME sniff (only extension) | Medium | Add `mimes:` + `mimetypes:` on `StoreEventGalleryRequest` etc. |
| SEC-06 | No rate limit on `/forgot-password` | Medium | Add `throttle:3,1` |
| SEC-07 | `/superadmin/login` 404 (not 405) | Low | Add alias or document |
| SEC-08 | No content security policy header | Medium | Add CSP via middleware |
| SEC-09 | No HSTS | Medium | Add `Strict-Transport-Security` |
| SEC-10 | No `Referrer-Policy` | Low | Add `same-origin` |
| SEC-11 | Error pages could leak env in `APP_DEBUG=true` | Low | Ensure `APP_DEBUG=false` on production |
| SEC-12 | Audit log writes do not cover all admin actions | Medium | Add `AuditService::log` calls in approval and role-change actions |
| SEC-13 | Export endpoints may not enforce scope strictly | High | Re-verify in P1 retest |
| SEC-14 | Public S3 / object storage not configured | Low | Document in deployment |
| SEC-15 | No CSRF on admin chat endpoints? | Verify | Add `web` group |
| SEC-16 | `last_login_ip` stored without consent notice | Low | Add privacy notice |

## 33.3 Recommendations summary
- Apply P1 fixes in this audit.
- Schedule security review after P1 retest.
- Pen-test before GA.
