# KomunaID V2 — Vercel Deployment Root Cause

## 1. Vercel Config Snapshot

`vercel.json` (post-fix):

```json
{
  "outputDirectory": "public",
  "framework": null,
  "buildCommand": "npm run build",
  "functions": {
    "api/index.php":      { "runtime": "vercel-php@0.8.0", "maxDuration": 60 },
    "api/static.php":     { "runtime": "vercel-php@0.8.0", "maxDuration": 10 },
    "api/cron/scheduler.php": { "runtime": "vercel-php@0.8.0", "maxDuration": 60 }
  },
  "routes": [
    { "src": "/build/(.*)",   "headers": {"Cache-Control":"public, max-age=31536000, immutable"}, "dest": "/api/static.php" },
    { "src": "/assets/(.*)",  "headers": {"Cache-Control":"public, max-age=31536000, immutable"}, "dest": "/api/static.php" },
    { "src": "/favicon.ico",  "headers": {"Cache-Control":"public, max-age=31536000, immutable"}, "dest": "/api/static.php" },
    { "src": "/(.*)",         "dest": "/api/index.php" }
  ],
  "crons": [
    { "path": "/api/cron/scheduler?token=__CRON_SECRET__", "schedule": "0 0 * * *" }
  ],
  "regions": ["sin1"]
}
```

## 2. Why login/register are NOT a Vercel problem

- `api/index.php` boots Laravel, points storage + bootstrap cache to `/tmp/storage/...`, captures the request, hands it to the kernel, and sends the response.
- Session driver is `database` (in `.env.production`), not file, so cold-start statelessness is fine.
- `APP_KEY` is set in Vercel env (otherwise encrypted session cookies would 500). Verified indirectly: a 302 to `/superadmin/dashboard` after a fresh POST means the session was encrypted and decrypted correctly across the function boundary.
- Database (Hostinger MySQL) is reachable from Vercel's `sin1` region.
- CSRF token is issued on GET, validated on POST (no 419 observed).

## 3. Static asset 404 (the real production bug found)

The Vercel PHP runtime does **not** auto-serve files from `public/` when a function is registered for that path. Because `api/index.php` is the catch-all destination, every URL — including `/assets/brand/komunaid-logo-full.png` and `/favicon.ico` — was being handed to Laravel, which then tried to match a route, failed, and returned the default 404 page.

The pre-existing workaround in `vercel.json` only covered `/build/(.*)` (Vite assets). Anything outside `/build/` was broken.

## 4. Fix

- Added explicit `routes` entries for `/assets/(.*)` and `/favicon.ico` pointing to `/api/static.php`.
- Generalized `api/static.php` to detect the prefix and serve from `public/<prefix-stripped-path>`. For `/favicon.ico` it serves `public/assets/brand/komunaid-logo-full.png` directly.
- Added the same fallback in `api/index.php` as a defense-in-depth, so even if `vercel.json` is misconfigured the function still serves the file.

## 5. Things that look like Vercel problems but are not

| Symptom | Real cause |
|---|---|
| "Login tidak bisa" | form uses `name="login"` (not `email`); user submitted wrong field, error shown but interpreted as system error |
| Superadmin dashboard 3 cells with `@include(...)` text | Blade component called via `@include`; `@props` directive unparsed; fix in `status-badge.blade.php` |
| 404 on `/assets/brand/...` | `vercel.json` only routed `/build/*` to `static.php`; fixed by adding `/assets/*` and `/favicon.ico` routes |
| Cold start latency 1.5–3 s | inherent to serverless PHP, not a bug |
| `php artisan route:list` shows `local.ERROR: The "--columns" option does not exist` | local PHP CLI syntax error in the test command, irrelevant to runtime |

## 6. Vercel still recommended?

**With notes.**
- ✅ Acceptable for: demo, soft launch, low-traffic V2.
- ⚠️ Limits to keep in mind:
  - `/tmp` ephemeral storage means file cache, file sessions, file logs, and uploaded files (if not on S3) vanish between cold starts. The current config mitigates this with `database` driver for sessions + cache, but `storage/logs/laravel.log` is still on `/tmp` and disappears on cold start.
  - No long-lived queue worker. The `QUEUE_CONNECTION=database` will only process jobs if something calls `php artisan queue:work` (currently none).
  - Cron is limited to once-per-day, no second-resolution scheduling.
  - `maxDuration: 60s` is the absolute upper bound for any single request.
- 🚫 Not acceptable for: high-traffic production where you need sticky sessions, persistent uploads, sub-second cold starts, or websockets.

## 7. Recommended next step

Keep Vercel for the demo, but plan migration to Laravel Forge (or any VPS with PHP 8.2 + MySQL + Redis) before opening to the public. Move the `database` queue to `redis` once on a real host.
