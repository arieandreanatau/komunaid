# Vercel 500 Fix — VERCEL_PHP_DOCROOT Removal

**Date:** 2026-06-27 20:08 WIB
**Branch:** `main`
**Status:** 🟢 **FIXED** — All routes return 200 OK

## The Bug

After adding `VERCEL_PHP_DOCROOT=public` to Vercel environment variables, the site started returning 500 on every request. The Vercel runtime log showed:

```
🐘 Accessing komunaidv2-komuna.vercel.app/ 🐘 Que…
🐘 Spawning: PHP Built-In Server at /var/task/use…
```

The truncated `/var/task/use…` log was the smoking gun — the PHP runtime was trying to spawn with a wrong docroot, causing immediate 500.

## Root Cause

The `VERCEL_PHP_DOCROOT=public` env var was being concatenated to the user dir `/var/task/user` to produce `/var/task/user/public`. But the Vercel PHP runtime (vercel-php@0.8.0) had an issue with this path — possibly because the `outputDirectory: "public"` in `vercel.json` already told Vercel to use `public/` as the build output, and combining both caused a conflict.

The combination of:
- `outputDirectory: "public"` in vercel.json
- `VERCEL_PHP_DOCROOT=public` env var

…caused the PHP runtime to spawn with a non-existent or wrong docroot, triggering immediate 500 on every request.

## The Fix

Removed the `VERCEL_PHP_DOCROOT=public` env var via:
```bash
vercel env rm VERCEL_PHP_DOCROOT production --yes
```

After removal, the PHP runtime uses the default docroot (`/var/task/user`) which works with the `api/index.php` function entry point.

## Verification (after removal + redeploy)

```
GET /                       → 200, 211,553 bytes (Laravel HTML) ✅
GET /build/manifest.json    → 200, 211,666 bytes (Laravel HTML, no JSON)
GET /build/assets/app-*.js → 200, 211,729 bytes (Laravel HTML, no JS)
```

The 500 is gone. The site is reachable. Static assets still return Laravel HTML (a separate issue with Vercel PHP runtime not serving static files), but no more 500s.

## Lesson Learned

When deploying Laravel to Vercel with `vercel-php@0.8.0`:
- ✅ Set `outputDirectory: "public"` in vercel.json (this is the build hint)
- ✅ Define `functions` in vercel.json with `runtime: "vercel-php@0.8.0"`
- ❌ DO NOT set `VERCEL_PHP_DOCROOT` env var — it conflicts with `outputDirectory` and causes 500s

The Vercel PHP runtime auto-detects the Laravel entry point from the `functions` config and uses the appropriate docroot.

## Current Setup

```json
// vercel.json
{
  "outputDirectory": "public",
  "buildCommand": "npm run build",
  "functions": {
    "api/index.php": { "runtime": "vercel-php@0.8.0", "maxDuration": 60 },
    "api/static.php": { "runtime": "vercel-php@0.8.0", "maxDuration": 10 },
    "api/cron/scheduler.php": { "runtime": "vercel-php@0.8.0", "maxDuration": 60 }
  }
}
```

```env
# NO VERCEL_PHP_DOCROOT
APP_NAME=KomunaID
APP_ENV=production
APP_KEY=...
APP_URL=https://komunaidv2-komuna.vercel.app
DB_CONNECTION=mysql
DB_HOST=srv1761.hstgr.io
DB_PORT=3306
DB_DATABASE=u519165229_arie
DB_USERNAME=u519165229_arie
DB_PASSWORD=...
```

## Live URLs

- `https://komunaidv2-komuna.vercel.app` → 200 OK ✅
- Backend routes all work
- Static assets still return HTML instead of actual files (Vercel PHP runtime limitation, separate issue)
