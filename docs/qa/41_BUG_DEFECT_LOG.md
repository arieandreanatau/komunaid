# 41 — BUG DEFECT LOG

| Bug ID | Date | Env | Module | Role | Severity | Priority | Summary | Steps to Reproduce | Expected | Actual | Evidence | Root Cause | Status | Assignee | Fix | Retest |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| BUG-001 | 2026-06-27 | local-test | Test infra | n/a | **Critical** | P0 | `komunaid_test` database missing, 201 tests fail | `php artisan test` | All tests pass | All tests fail with "Unknown database 'komunaid_test'" | `docs/00_TEST_RUN.log` | No setup script | **RESOLVED** | dev | `CREATE DATABASE komunaid_test` + `migrate --env=testing` | 201/201 pass |
| BUG-002 | 2026-06-27 | live | Public | guest | High | P1 | `/communities` returns 404 | `curl https://.../communities` | 200 | 404 | curl | No English alias; actual URL is `/komunitas` | **RESOLVED** | dev | Added `/communities` alias in `routes/modules/public.php` | Smoke test post-deploy |
| BUG-003 | 2026-06-27 | live | Public | guest | High | P1 | `/blog` returns 404 | `curl https://.../blog` | 200 | 404 | curl | No English alias; actual URL is `/blogs` | **RESOLVED** | dev | Added `/blog` alias in `routes/modules/public.php` | Smoke test post-deploy |
| BUG-004 | 2026-06-27 | local | Auth UX | guest | Medium | P1 | No top-of-form error on register/login | submit invalid | Error visible | Per-field only | code review | UX gap | **RESOLVED** | dev | Added `@if($errors->any()) <x-alert type="error" :message="$errors->first()"/>` in both views | Visual check |
| BUG-005 | 2026-06-27 | local | Security | any | High | P1 | No login throttle | 5 failed in 1 min | 429 | No throttle | code review | Missing middleware | **RESOLVED** | dev | `throttle:10,1` on POST /login | TC-SEC-01 scheduled |
| BUG-006 | 2026-06-27 | local | Ops | superadmin | High | P1 | No roles/permissions seeder | `migrate --seed` on fresh DB | Roles + permissions present | Seeder crashed on missing users | code review | `CommunityOwnerSeeder` required demo users | **RESOLVED** | dev | Made `CommunityOwnerSeeder` self-sufficient | `php artisan db:seed` now succeeds |
| BUG-007 | 2026-06-27 | local | Brand | brand_owner | High | P1 | Brand max-3 rule not enforced | create 4th brand | Blocked | Allowed | code review | Missing check | OPEN | dev | Add check in `BrandController@store` | — |
| BUG-008 | 2026-06-27 | local | Community | community_owner | High | P1 | 1st-approval rule not enforced | submit 2nd while 1st pending | Blocked | Allowed | code review | Missing check | OPEN | dev | Add check in `CommunityController@store` | — |
| BUG-009 | 2026-06-27 | live | Public | guest | Low | P3 | `/superadmin/login` 404 | curl | Alias or doc | 404 | curl | URL naming | OPEN | dev | Document canonical URL `/admin/login` | — |
| BUG-010 | 2026-06-27 | local | Security | any | Medium | P1 | No forgot-password throttle | 3+ in 1 min | 429 | No throttle | code review | Missing middleware | **RESOLVED** | dev | `throttle:3,1` on POST /forgot-password | TC-SEC-02 scheduled |
| BUG-011 | 2026-06-27 | local | Community | member | Medium | P1 | 3x join/leave rule not enforced | 4th join | Blocked | Allowed | code review | Missing check | OPEN | dev | Add check via `MemberJoinHistory` | — |
| BUG-012 | 2026-06-27 | local | Security | any | Medium | P2 | File upload MIME not strictly validated | upload `.exe` | Rejected | Extension-only | code review | Validation gap | OPEN | dev | Add `mimes:` + `mimetypes:` | — |
| BUG-013 | 2026-06-27 | local | Ops | any | Medium | P1 | Missing CSP / HSTS / Referrer-Policy | inspect response | Headers present | Absent | code review | Missing middleware | OPEN | dev | Add `SecureHeaders` middleware | — |
| BUG-014 | 2026-06-27 | local | UX | member | Low | P2 | Wallet screen lacks "what is this?" | inspect | Onboarding tooltip | None | code review | UX gap | OPEN | dev | Add tooltip | — |
| BUG-015 | 2026-06-27 | local | Audit | superadmin | Medium | P1 | Audit log writes inconsistent | inspect code | All admin actions | Some missing | code review | Coverage gap | OPEN | dev | Add `AuditService::log` | — |

## Bug resolution summary
- **RESOLVED in this audit**: BUG-001, BUG-002, BUG-003, BUG-004, BUG-005, BUG-006, BUG-010
- **OPEN** (P1/P2/P3 in backlog): BUG-007, BUG-008, BUG-009, BUG-011, BUG-012, BUG-013, BUG-014, BUG-015
