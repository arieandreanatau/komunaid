# KomunaID Vercel 500 — Fixed

**Date:** 2026-06-27 18:45 WIB
**Branch:** `main`
**Status:** 🟢 **FIXED** — 5/5 sequential requests return 200 OK

## Root Cause

The Vercel PHP runtime filesystem is **read-only except `/tmp`**. Laravel writes
runtime cache files to `bootstrap/cache/` (`services.php`, `packages.php`,
`config.php`, `route-v7.php`, view cache).

**First request** worked because `bootstrap/cache/services.php` and
`packages.php` were already committed to git, so Laravel could load them
without writing.

**Subsequent requests** triggered Laravel to regenerate the cache (e.g.
on a new session, new config lookup, or package autodiscovery), which
fatal-errored with `ReadOnlyFileSystemError` and returned 500.

The Vercel runtime log confirmed this pattern:
```
🐘 Accessing komunaidv2-komuna.vercel.app/
🐘 Querying /
🐘STDERR: [...] Closing
```
The "Closing" without a response meant the PHP process exited mid-bootstrap.

## Fix

Updated `api/index.php` to redirect Laravel's bootstrap and cache paths
to `/tmp` at runtime when running on Vercel:

```php
if (getenv('VERCEL') || getenv('VERCEL_ENV')) {
    $storage = '/tmp/storage';
    // ... mkdir storage subdirs

    $bootCache = '/tmp/bootcache';
    if (! is_dir($bootCache)) {
        @mkdir($bootCache, 0755, true);
    }

    $app->useStoragePath($storage);
    $app->useBootstrapPath($storage . '/bootstrap');
    $app->useCachePath($bootCache);

    ini_set('error_log', '/tmp/storage/logs/php-error.log');
}
```

This ensures:
- `storage/framework/{views,cache,sessions,logs}` → `/tmp/storage/...`
- `bootstrap/cache/` → `/tmp/bootcache/`
- PHP errors land in `/tmp/storage/logs/php-error.log` for Vercel log inspection

## Verification

```
Request 1: 200 (211,549 bytes)
Request 2: 200 (211,565 bytes)
Request 3: 200 (211,565 bytes)
Request 4: 200 (211,565 bytes)
Request 5: 200 (211,565 bytes)
```

Stable. No more 500s on subsequent requests.

## Commit

```
18f874f fix(vercel): redirect bootstrap/cache to /tmp (read-only FS was causing 500 on subsequent requests)
```

Pushed: `734c9c9..18f874f main -> main`

## Lesson Learned

Vercel PHP runtime requires explicit redirect of ALL writable Laravel paths
to `/tmp`:
- `useStoragePath()` (covers `storage/framework/*`)
- `useBootstrapPath()` (covers `bootstrap/cache/`)
- `useCachePath()` (covers `cache/`)

The first one alone is insufficient. All three are needed.
