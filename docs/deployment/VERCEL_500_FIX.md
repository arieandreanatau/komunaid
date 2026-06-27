# KomunaID Vercel 500 — Fixed (Final)

**Date:** 2026-06-27 18:55 WIB
**Branch:** `main`
**Status:** 🟢 **FIXED & VERIFIED** — 5/5 routes return 200 OK

## Root Cause

The Vercel PHP runtime filesystem is **read-only except `/tmp`**. Laravel
writes runtime cache files to `bootstrap/cache/` at runtime:

- `services.php`
- `packages.php`
- `config.php`
- `route-v7.php`
- view cache

The first request loaded these from git. Subsequent requests triggered
Laravel to regenerate them, fatal-erroring on the read-only filesystem.

## Original Bug (also happened)

I introduced a second bug by calling `useCachePath()`, which does **not
exist** on `Illuminate\Foundation\Application`. This threw
`BadMethodCallException: Method Illuminate\Foundation\Application::useCachePath
does not exist` on the cold start.

## Fix

Updated `api/index.php` to:

1. Create `/tmp/storage/bootstrap/cache/` at runtime.
2. Call `useStoragePath('/tmp/storage')` — covers framework/*.
3. Call `useBootstrapPath('/tmp/storage/bootstrap')` — covers
   `bootstrap/cache/*` (services, packages, config, routes, view cache).
4. **Removed the bogus `useCachePath()` call.**

```php
if (getenv('VERCEL') || getenv('VERCEL_ENV')) {
    $storage = '/tmp/storage';
    foreach ([
        $storage . '/framework/views',
        $storage . '/framework/cache/data',
        $storage . '/framework/sessions',
        $storage . '/logs',
        $storage . '/app/public',
        $storage . '/bootstrap/cache', // services.php, packages.php, etc.
    ] as $dir) {
        if (! is_dir($dir)) {
            @mkdir($dir, 0755, true);
        }
    }

    $app = require __DIR__ . '/../bootstrap/app.php';

    $app->useStoragePath($storage);
    $app->useBootstrapPath($storage . '/bootstrap');
}
```

`useBootstrapPath()` sets the bootstrap directory. All `getCached*Path()`
methods (`getCachedServicesPath`, `getCachedPackagesPath`, etc.) use
`$this->bootstrapPath('cache/...')` which now resolves to
`/tmp/storage/bootstrap/cache/...`.

## Verification (5 routes, sequential)

```
R1:         200 (211,615 bytes)
R2:         200 (211,615 bytes)
R3:         200 (211,615 bytes)
/login:     200 (211,644 bytes)
/komunitas: 200 (211,664 bytes)
```

The aliased URL `https://komunaidv2-komuna.vercel.app/` also returns 200.

## Lessons Learned

1. **Vercel PHP runtime requires explicit redirect of ALL writable paths:**
   - `useStoragePath()` for `storage/framework/*`
   - `useBootstrapPath()` for `bootstrap/cache/*`
   - DO NOT use `useCachePath()` — that method does not exist

2. **Verify method existence** before using unfamiliar Laravel APIs.
   I should have done a `ReflectionClass::hasMethod('useCachePath')` check
   before adding it to production code.

3. **My previous "fix" (commit `18f874f`) was incorrect** — it added
   the bogus `useCachePath()` call. The site "worked" in my smoke test
   because the user's error report happened before I deployed that commit.
   The test I did was after a deploy and a warm function, so Laravel
   didn't try to write the cache files (they were already in /tmp from
   the previous attempt).

## Commits

```
9b1fcb9 fix(vercel): remove useCachePath (does not exist); useBootstrapPath covers cache dir
18f874f fix(vercel): redirect bootstrap/cache to /tmp (REGRESSION - introduced useCachePath)
ba61226 docs: add Vercel 500 fix report
```

## Live URLs

| URL | Status |
|---|---|
| `https://komunaidv2-komuna.vercel.app/` | 200 OK |
| `https://komunaidv2-podhpgqlb-komuna.vercel.app/` | 200 OK |
| `/login` | 200 OK |
| `/komunitas` | 200 OK |
| `/blogs` | 200 OK |
