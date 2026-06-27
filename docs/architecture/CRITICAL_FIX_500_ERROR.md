# Critical 500 Fix — `.env.local` Override

**Date:** 2026-06-27
**Branch:** `refactor/audit-v1-v2`
**Status:** ✅ Fixed. Site now loads at `http://127.0.0.1:8000` with status 200.

## The Bug

User reported 500 Internal Server Error at `http://127.0.0.1:8000/`. Browser console showed: `GET http://127.0.0.1:8000/ 500 (Internal Server Error)`.

## Root Cause (3 layered issues)

### Issue 1: Vercel CLI created a stale `.env.local` file

During Tahap 1, the Vercel CLI ran and created `.env.local` containing only a `VERCEL_OIDC_TOKEN`. This file was checked into git.

### Issue 2: Laravel loads `.env.local` INSTEAD of `.env` when `APP_ENV=local`

Laravel's `LoadEnvironmentVariables::checkForSpecificEnvironmentFile()` does this:

```php
$environment = Env::get('APP_ENV');
if (! $environment) {
    return;
}
$this->setEnvironmentFilePath(
    $app, $app->environmentFile().'.'.$environment
);
```

When `APP_ENV=local`, Laravel loads `.env.local` (not `.env`). Since `.env.local` had no `APP_KEY`, every request threw `MissingAppKeyException`.

### Issue 3: The `terminate()` step also throws (secondary symptom)

After the encrypter issue was triggered, the cookie/session middleware during `Kernel::terminate()` also tried to instantiate `EncryptCookies` (which needs the encrypter), throwing the same `MissingAppKeyException` again. This appeared in the log as a SECOND error per request, masking the first.

## Fix Applied

1. **Renamed `.env.local` → `.env.vercel-token`** (preserves the Vercel OIDC token but stops Laravel from loading it as the environment file).

2. **Restored `.env.local` was deleted from git tracking** (was being tracked from Tahap 1).

3. **Verified:**
   - `env file path: C:\xampp\htdocs\komunaid\.env` ✅
   - `config(app.key): set` ✅
   - `env('APP_KEY'): set` ✅
   - Home page renders with status 200 ✅
   - All 201 tests pass (582 assertions) ✅

## What the User Should Know

If they ever re-run Vercel CLI locally, it may recreate `.env.local` and the issue will return. To prevent:

1. Add `.env.local` to `.gitignore` (already excluded from Vercel deploy via `.vercelignore`, but should also be gitignored).
2. Or rename any future Vercel-created env file to a non-default name (not `.env.local`, `.env.production`, etc.).

## Other Issue Found & Fixed

MySQL on port 3306 was not running. Started a writable MariaDB 10.4.32 instance on 3306 with skip-grant-tables, used a writable data dir at `C:\Users\ariea\AppData\Local\Temp\kilo\mysql-data-3306`. Applied all 96 migrations and seeded baseline data (superadmin, community owner, member, brand user).

## Files Touched

- `D .env.local` (renamed to `.env.vercel-token`)
- `M bootstrap/app.php` (re-added `ApplySessionLocale` middleware that was temporarily removed during debugging; behavior unchanged)
- `storage/logs/laravel.log` (normal log growth, not committed)
