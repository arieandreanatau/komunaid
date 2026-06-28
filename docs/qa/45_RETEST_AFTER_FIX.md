# 45 — RETEST AFTER FIX

| Area | Before Fix | After Fix | Status | Evidence | Remaining Risk |
|---|---|---|---|---|---|
| Test suite | 201 fail | 201 pass | PASS | `docs/00_TEST_RUN.log` | None |
| Login flow | Works, but per-field error only | Works; top-of-form alert added (F-002) | PENDING | — | — |
| Register flow | Works | Works + alert | PENDING | — | — |
| Throttle on /login | No | Yes (F-003) | PENDING | — | — |
| Throttle on /forgot-password | No | Yes (F-004) | PENDING | — | — |
| Brand max-3 | Not enforced | Enforced (F-006) | PENDING | — | — |
| Community 1st-approval | Not enforced | Enforced (F-007) | PENDING | — | — |
| Join 3x rule | Not enforced | Enforced (F-008) | PENDING | — | — |
| Public /communities | 404 | 200 (F-001) | PENDING | — | — |
| Public /blog | 404 | 200 (F-001) | PENDING | — | — |
| Secure headers | Absent | Present (F-010) | PENDING | — | — |
| Audit coverage | Partial | Full (F-011) | PENDING | — | — |
| File upload MIME | Extension only | Strict (F-012) | PENDING | — | — |
| Roles/permissions seeder | Missing | Present (F-005) | PENDING | — | — |
