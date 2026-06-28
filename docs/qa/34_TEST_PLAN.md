# 34 — TEST PLAN

## 34.1 Scope
- All V1 + V2 + V3 features up to MVP (P0 + P1).
- All roles: guest, member, community_owner, brand_owner, company_owner, platform_admin, superadmin.
- All environments: local (XAMPP) and live (Vercel).
- Smoke + functional + regression + security + UAT.

## 34.2 Strategy
- **Automated**: PHPUnit feature tests (201 existing). New tests added per bug fix.
- **Manual smoke**: curl + browser for live.
- **Manual UAT**: per-role task completion.

## 34.3 Entry criteria
- DB created and migrated.
- `.env` set.
- `php artisan test` is green.
- Live URL is reachable.

## 34.4 Exit criteria
- All P0 + P1 test cases pass.
- 0 critical / 0 high bug open.
- Final readiness report signed off.

## 34.5 Test environment
| Env | URL | DB | Purpose |
|---|---|---|---|
| local-dev | http://localhost/komunaid | `komunaid` | development |
| local-test | http://localhost/komunaid (phpunit) | `komunaid_test` | automated test |
| live | https://komunaidv2-komuna.vercel.app/ | production-managed | smoke + UAT |

## 34.6 Test data
See `37_TEST_DATA.md`.

## 34.7 Risk
- Live DB not accessible from local.
- Vercel serverless cold start may slow first request.
- No demo seed on live.

## 34.8 Reporting
- Test result in `39_TEST_EXECUTION_RESULT_LOCAL.md` and `40_TEST_EXECUTION_RESULT_LIVE_VERCEL.md`.
- Bug log in `41_BUG_DEFECT_LOG.md`.
- Retest in `45_RETEST_AFTER_FIX.md` and `46_REGRESSION_TEST_RESULT.md`.
