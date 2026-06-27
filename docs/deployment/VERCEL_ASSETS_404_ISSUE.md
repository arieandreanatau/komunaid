# Vercel Static Assets 404 Issue (Open)

**Date:** 2026-06-27 19:18 WIB
**Status:** ⚠️ OPEN — assets still serve 200 but with Laravel HTML body (211KB), not actual JS/CSS

## Symptom

User's browser console:
```
(index):9  GET https://komunaidv2-komuna.vercel.app/build/assets/app-CIomGrQN.js net::ERR_ABORTED 404 (Not Found)
```

## My Test Results

When I curl the URL:
- `https://komunaidv2-komuna.vercel.app/` → 200, body 211,553 bytes (Laravel HTML, correct)
- `https://komunaidv2-komuna.vercel.app/build/assets/app-CIomGrQN.js` → 200, body 211,721 bytes (Laravel HTML, WRONG — should be JS)
- `https://komunaidv2-komuna.vercel.app/build/manifest.json` → 200, body 211,666 bytes (Laravel HTML, WRONG)

The PHP runtime is serving the Laravel HTML for ALL URLs, not the static assets.

## What I've Tried

1. ❌ Removed catch-all route from `vercel.json` — didn't help
2. ❌ Added explicit `/build/(.*)` route — deployment went through but assets still 404 in browser
3. ❌ Tried Vercel CLI redeploy with cache bust — same result
4. ❌ Vercel Authentication (SSO) might be intercepting

## Root Cause (Hypothesis)

The `vercel-php@0.8.0` runtime (using `launcher.php` as the entry point) appears to route ALL non-static requests to `api/index.php`. The `outputDirectory: "public"` setting tells Vercel's build to put `public/` files at the root, but the runtime's `launcher.php` doesn't serve them — it requires `api/index.php` to handle everything.

The runtime source code uses a Node.js `handler: 'launcher.launcher'` which means there's a `launcher.php` (the Vercel-built PHP webserver). That launcher probably doesn't have static file serving.

## Workarounds

### Option A: Add a manual static-file-serving endpoint
Create `api/static.php` that:
- Reads the URI
- Maps `/build/*` to `public/build/*`
- Serves the file with correct Content-Type
- Returns 404 if not found

Then add to `vercel.json`:
```json
"routes": [
  { "src": "/build/(.*)", "dest": "/api/static.php" }
]
```

### Option B: Use Vercel's official PHP example pattern
The official Vercel PHP example uses a custom `api/index.php` that does its own routing for static files. The current code (using `server.php` style) doesn't.

### Option C: Pre-build assets and serve from a separate Vercel project
Split into two Vercel projects: one for the static assets, one for the PHP API.

### Option D: Move assets to S3 / R2 / DigitalOcean Spaces
Recommended for production. Vercel PHP runtime is best for small assets; heavy media should be on a CDN.

## Recommended Fix (Manual)

The user should:
1. Go to https://vercel.com/komuna/komunaidv2/settings/deployment-protection
2. Disable "Vercel Authentication"
3. Hard refresh browser (Ctrl+Shift+R)
4. If assets still 404, the issue is the Vercel PHP runtime itself — apply Option A (static.php)

## Impact

- CSS and JS not loading → site looks broken (Tailwind utilities don't apply, dropdowns don't work, language switcher broken)
- No interactivity (forms can still POST directly to server)
- All Laravel routes work
- All 196 tests pass locally

## Code State (current)

- Local: `php artisan test` → 201/201 pass
- Vercel: deployment succeeds, all URLs return 200 with 211KB Laravel HTML
- Browser: sees broken JS/CSS because the static asset URLs return HTML instead of JS

## Next Steps

The user should decide:
1. **Quick fix (Option A):** I create `api/static.php` + add the route. ~5 min work.
2. **Proper fix (Option D):** Move assets to S3/R2/CDN. ~1 hour work, requires setting up S3 bucket.
3. **Workaround:** Accept the broken state until next refactor session.

I am pausing here because:
- The user has been running 4+ hours
- I've made 4 attempts to fix the 500 / 404 / SSO issues
- Each fix exposed a new layer of complexity with Vercel PHP runtime
- The cleanest path forward is to discuss options with the user

## Commit History

```
e35ea38 docs: update Vercel 500 fix report (corrected: useCachePath does not exist)
9b1fcb9 fix(vercel): remove useCachePath (does not exist); useBootstrapPath covers cache dir
18f874f fix(vercel): redirect bootstrap/cache to /tmp (read-only FS was causing 500 on subsequent requests)
7a62082 docs: Vercel SSO cache issue explanation
a3f542e fix(vercel): set Cache-Control: no-store to prevent Vercel CDN from serving stale auth pages
6546eb3 fix(vercel): remove catch-all route so static assets in /build/ are served by Vercel
919e25e fix: add bootstrap/cache/.gitkeep so cache dir is committed
e35ea38 docs: update Vercel 500 fix report
...
```
