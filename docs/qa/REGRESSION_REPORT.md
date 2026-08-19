# Regression Report

Date: 2026-08-14.

| Command | Result | Evidence |
|---|---|---|
| `pnpm test` | PASS | 37 files, 923 tests |
| `pnpm test:web` | PASS | 7 files, 65 tests |
| `pnpm --filter @komunaid/database exec prisma validate` | PASS | Prisma schema valid |
| `pnpm test:e2e` | RUNNING / NOT COMPLETE | 990 tests discovered; initial 3 Chromium accessibility tests passed; foreground run exceeded 120 seconds |
| `pnpm security:audit` | FAIL | 14 findings, 7 high |

Regression PASS does not close migration, dependency, E2E-isolation, or active-route security blockers.
