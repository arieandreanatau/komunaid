# Bug Report

## Open Release Blockers

| ID | Severity | Module | Status | Evidence |
|---|---|---|---|---|
| S0-01 | S0 | Database migration | BLOCKED | Clean/equivalence migration test cannot run: Docker unavailable, MySQL CLI absent. |
| S0-02 | S0 | Operations | BLOCKED | Backup, restore, and rollback procedure exists; no execution evidence. |
| S1-01 | S1 | Community media | BLOCKED | Private/draft disclosure finding remains; active `communities.ts` ownership unresolved. |
| S1-03 | S1 | Organization events | BLOCKED | Private/deleted event leakage remains; active `organizations.ts` ownership unresolved. |
| SEC-DEP-01 | S1 | Dependencies | FAIL | `pnpm audit --audit-level=high`: 7 high vulnerabilities. |
| E2E-01 | S1 | Automation | BLOCKED | Isolated DB/runtime unavailable; production not used. |

## Verified Fixes

| ID | Severity | Fix | Regression Evidence | Status |
|---|---|---|---|---|
| S1-02 | S1 | Atomic refresh-token consume | `refresh-token.test.ts`, 26 tests | VERIFIED FIXED at unit level |
| S1-04 | S1 | Admin mutation hierarchy shared guard | API suite and typecheck | PARTIAL: hierarchy matrix incomplete |
| API-01 | S2 | `/reports/my` static route order | reports route regression | VERIFIED FIXED |
| SEC-01 | S1 | Untrusted proxy header rate-limit bypass | rate limiter regressions | VERIFIED FIXED |
| WEB-01 | S2 | Internal error disclosure | web unit/build regression | VERIFIED FIXED |
