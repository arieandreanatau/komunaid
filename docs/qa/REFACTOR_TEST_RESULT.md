# KomunaID Refactor Test Result

See `architecture/REFACTOR_TEST_RESULT.md` for the canonical test result table.

## Quick Status

- **Tests:** 196 passed
- **Assertions:** 575
- **Duration:** 66.34s
- **Build:** green
- **Composer:** valid
- **Lint:** all controllers, models, services parse OK

## Pre/Post Summary

| Metric | Before | After |
|---|---|---|
| Test count | 188 | 196 (+8 from new regression tests) |
| Assertion count | 246 | 575 (+329 from new tests) |
| Files in routes/ | 1 (745 lines) | 8 (35 + 7 modules) |
| Migrations | 95 | 96 (+1 audit) |
| Build size | 136KB CSS, 46KB JS | same (no UI changes) |
| Duplicate route names | 0 | 0 |

## Test Run Command

```bash
cd C:\Xampp\htdocs\komunaid
php artisan optimize:clear
php artisan test
```

Expected output ending:
```
Tests:    196 passed (575 assertions)
Duration: ~66s
```
