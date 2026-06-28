# 46 — REGRESSION TEST RESULT

After every fix that touches `routes/`, `app/Http/Controllers/`, `app/Models/`, or any migration, run:

```
php artisan optimize:clear
php artisan route:list
php artisan migrate:status
php artisan test
npm run build
composer validate
composer dump-autoload
```

Expected:
- `route:list` succeeds and shows the expected count.
- `migrate:status` shows all migrations RAN, no `Pending` migrations.
- `php artisan test` is 100% green.
- `npm run build` is green.
- No new deprecations in PHP 8.4 or Laravel 11.

| Run | Date | Commands | Result | Notes |
|---|---|---|---|---|
| #1 (initial) | 2026-06-27 | all | route:list OK, migrate:status OK, npm build OK, test 201 FAIL | test DB missing |
| #2 (post DB fix) | 2026-06-27 | all | 201/201 PASS, npm build OK, composer valid | stabilization baseline |

Re-run after each fix in F-001 → F-012.
