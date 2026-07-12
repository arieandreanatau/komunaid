# KOMUNAID — REGRESSION REPORT

**Date:** 2026-07-12
**Mode:** Post-Remediation Regression Validation

---

## REGRESSION ANALYSIS

### Changes That Could Cause Regression

| Change | Risk | Mitigation |
|--------|:----:|------------|
| MySQL backtick syntax | LOW | Only changes raw SQL format, same semantics |
| `requireSuperAdmin()` on CMS contact | LOW | Adds restriction (more secure, not less) |
| Token refresh interceptor | MEDIUM | New behavior — 401 triggers refresh attempt |
| Local JWT verification in middleware | MEDIUM | No API call — faster but skips server-side status check |
| XSS sanitization rewrite | LOW | Same input/output contract, more patterns blocked |
| `forceLogoutSchema` | LOW | New schema, backward compatible |
| Pagination bounds | LOW | Adds limits, existing clients unaffected |
| Composite indexes | LOW | Additive, no query changes |
| AuditLog restrict delete | LOW | Prevents cascade, more secure |

### Test Fix Verification

| Test File | Before | After | Regression |
|-----------|--------|-------|:----------:|
| `auth.integration.test.ts` | `toContain([201, 500])` | `toBe(201)` | ✅ NO |
| `admin.integration.test.ts` | 4 instances of `toContain(500)` | All `toBe(200)` | ✅ NO |
| `events.integration.test.ts` | 3 instances of `toContain` with 500 | All fixed | ✅ NO |
| `rbac.integration.test.ts` | `toContain([200, 500])` | `toBe(200)` | ✅ NO |

### Integration Matrix

| Module → Module | Before | After | Regression |
|-----------------|:------:|:-----:|:----------:|
| Auth → Event Registration | ❌ (broken SQL) | ✅ | ✅ FIXED |
| CMS → Auth | ❌ (no auth) | ✅ | ✅ FIXED |
| Frontend → Auth | ❌ (no refresh) | ✅ | ✅ FIXED |
| Middleware → Performance | ❌ (API call) | ✅ | ✅ FIXED |

## OVERALL REGRESSION STATUS: ✅ PASS — No regressions detected
