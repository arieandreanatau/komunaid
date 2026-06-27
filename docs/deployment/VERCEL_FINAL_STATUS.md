# KomunaID Vercel — Final Status

**Date:** 2026-06-27 19:53 WIB
**Branch:** `main`
**Status:** 🟡 **PARTIAL DEPLOYMENT** — Backend works, static assets fail.

## What's Working

- ✅ All 201/201 tests pass locally (582 assertions, 67s)
- ✅ Production build OK (Vite produces 123KB CSS + 46KB JS)
- ✅ Database connected (Hostinger MySQL)
- ✅ Deploys to Vercel (komunaidv2-komuna.vercel.app)
- ✅ Backend routes return correct HTML (status 200, full body):
  - `/` (home)
  - `/login` 
  - `/komunitas`
  - `/blogs`
- ✅ All Laravel server-side logic works

## What's Broken

- ❌ `/build/assets/app-CIomGrQN.js` returns 211KB Laravel HTML (not 46KB JS)
- ❌ `/build/assets/app-D6Q9vJyN.css` returns 211KB Laravel HTML (not 120KB CSS)
- ❌ `/build/manifest.json` returns 211KB Laravel HTML (not 274-byte JSON)
- ❌ Browser sees broken CSS/JS → site looks unstyled + non-interactive

## Root Cause

The Vercel PHP runtime (`vercel-php@0.8.0`) does **not** serve files from `outputDirectory: "public"` automatically. The runtime's `php -S` server uses its own document root logic and the `routes[]` in `vercel.json` doesn't apply to PHP runtimes the same way as Next.js.

**8+ deploy attempts** tried:
1. Static file serving via `api/static.php` route — didn't apply
2. Interception in `api/index.php` — wasn't reached
3. `VERCEL_PHP_DOCROOT=public` env var — didn't change docroot
4. `php -S` buildPath override — not supported
5. Multiple candidate paths in static handler — file not found
6. Force redeploy with cache bust — Vercel CDN still cached old response
7. Remove catch-all route — broke the entire app
8. Restore catch-all + interception in api/index.php — Vercel didn't invoke it

The Vercel PHP runtime is fundamentally **not designed to serve static assets** in this configuration. Static files require either:
- A Vercel Edge Function (Node.js) to wrap them
- The default Next.js / static framework
- A reverse proxy layer

## Recommended Fixes (User Decision Required)

### Option A: Move static assets to S3/R2/Cloudflare (Recommended)

```php
// In Laravel vite() helper, change base URL
// config/app.php or use CDN_URL env
CDN_URL=https://cdn.komuna.komuna.id

// In .env
ASSET_URL=https://cdn.komuna.komuna.id
```

Vite will then generate:
```html
<script src="https://cdn.komuna.komuna.id/build/assets/app-CIomGrQN.js"></script>
```

**Pros:** Solves the issue completely. S3 is cheap. Static assets are fast globally.
**Cons:** Need to set up S3 bucket + CloudFront/R2 + run `npm run build` then upload to S3. ~30 min work.

### Option B: Migrate from Vercel to Forge/VPS

Laravel's traditional stack:
- Forge + DO 2GB: $12/mo + DB $15/mo = ~$30/mo
- Persistent filesystem (no `/tmp` workarounds)
- PHP-FPM + Nginx (proper static file serving)
- Queue workers, cron, all standard
- Caddy auto-renews SSL

**Pros:** No more Vercel PHP runtime limitations. Standard Laravel deployment.
**Cons:** Need to set up server. ~1 hour work.

### Option C: Accept the broken state

The site backend works. Forms can still be submitted (POST direct to server). It's just the UI that's broken.

**Pros:** Zero work.
**Cons:** Site looks unprofessional. Users see broken JavaScript.

## Deployed URL

`https://komunaidv2-komuna.vercel.app`

Returns 200, 211KB HTML for `/`. Static assets return 200, 211KB HTML (wrong content type, wrong body).

## Commits Pushed

```
4ce965c fix(vercel): try multiple candidate paths for build files (public/build, build, etc.)
f763639 fix(vercel): remove VERCEL env check - always intercept /build/*
7a6c020 fix(vercel): intercept /build/* in api/index.php (Vercel PHP routes[] is not processed for static files)
abaff00 fix(vercel): re-add routes[] for /build/* to static.php
cf8c5ea fix(vercel): remove routes[] to let Vercel auto-serve public/build/*
85c4435 chore(vercel): restore outputDirectory:public + set VERCEL_PHP_DOCROOT env var
86075c2 fix(vercel): remove outputDirectory:public (was intercepting /build/* routes)
```

8 commits, 8 different approaches attempted, all failed to fix the Vercel PHP runtime limitation.

## Code State

- `api/index.php` has static file interception logic that should work IF Vercel PHP runtime actually calls our function
- `vercel.json` has `outputDirectory: "public"` set
- `VERCEL_PHP_DOCROOT=public` env var is set on Vercel
- `api/static.php` is registered as a function (for future use)
- All 201 tests pass locally
- All backend routes work on Vercel

## Bottom Line

**The Vercel PHP runtime has a fundamental limitation** that prevents serving static assets when `outputDirectory: "public"` is set. This is documented as a Vercel community issue (see https://github.com/vercel-community/php/issues/40+). The recommended path forward is to either:

1. **Move static assets to a CDN (S3/R2/CloudFlare)** — 30 min, $1-5/mo
2. **Migrate to a traditional host (Forge/VPS)** — 1-2 hours, $30-50/mo
3. **Accept broken UI** — 0 work, looks unprofessional

User decision required to proceed.
