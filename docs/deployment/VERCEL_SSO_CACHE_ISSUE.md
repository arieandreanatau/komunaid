# Vercel SSO Cache Issue

**Date:** 2026-06-27 19:11 WIB
**Branch:** `main`
**Status:** ⚠️ Workaround applied (Cache-Control: no-store); dashboard action needed.

## Symptom

User reported in browser console:
```
Failed to load resource: the server responded with a status of 404 ()
app-CIomGrQN.js:1  Failed to load resource
```

The `app-CIomGrQN.js` is the KomunaID JS asset (from `public/build/manifest.json`).

## Root Cause

The Vercel CDN is **caching a stale Vercel SSO login page** at `https://komunaidv2-komuna.vercel.app/`. The SSO page's HTML references Vercel's own Next.js JS bundles (`/_next/static/...`), but the browser thinks the page is at the KomunaID URL and tries to load `app-CIomGrQN.js` from the same origin → 404.

### How it happened

1. User is logged in to Vercel in their browser (cookie set on `vercel.com`).
2. Vercel's Deployment Protection for `komunaidv2` shows SSO login challenge.
3. Browser follows the redirect to Vercel's own `/login` page.
4. Vercel CDN **caches the SSO page** at `https://komunaidv2-komuna.vercel.app/` with `X-Vercel-Cache: HIT`.
5. Subsequent requests get the cached SSO page even after the deployment is public.

### Evidence

Request headers for `https://komunaidv2-komuna.vercel.app/`:
```
X-Matched-Path: /login
X-Nextjs-Prerender: 1
X-Nextjs-Stale-Time: 300
X-Vercel-Cache: HIT
Server: Vercel
Vary: rsc, next-router-state-tree, next-router-prefetch, next-router-segment-prefetch
```

These are Vercel's Next.js CDN headers, NOT Laravel's. The body is Vercel's own login HTML.

## Workarounds Applied (code-side)

1. **Cache-Control: no-store** added to `api/index.php`:
   ```php
   $response->headers->set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
   $response->headers->set('Pragma', 'no-cache');
   ```

   This prevents the **origin** (Laravel) from being cacheable. But Vercel's CDN may still cache at the edge based on Vercel's own rules (premium feature, project settings).

## Required Action (dashboard-side)

The user must clear Vercel's edge cache. Options:

### Option A: Hard refresh the browser
- Chrome/Edge: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
- This bypasses the browser cache. Combined with new deployment, should refresh.

### Option B: Disable Vercel Deployment Protection (recommended)
1. Go to https://vercel.com/komuna/komunaidv2/settings/deployment-protection
2. Turn OFF "Vercel Authentication" (Standard Protection)
3. Save. Future deployments will be publicly accessible without SSO challenge.

### Option C: Add a custom domain
- Custom domains bypass Vercel SSO by default.
- Vercel dashboard → Settings → Domains → Add `komuna.komuna.id`
- Update DNS, wait for propagation.

### Option D: Vercel CLI cache invalidation (premium)
- `vercel cache invalidate <url>` (only available on Pro plan)
- Re-deploy also helps: `vercel deploy --prod --force`

## My Recommendation

**Option B** (disable Vercel Authentication). This is the MVP and should be public. If you want auth on preview deployments but not production, use a separate preview project.

## Commit
```
a3f542e fix(vercel): set Cache-Control: no-store to prevent Vercel CDN from serving stale auth pages
```

Pushed: `919e25e..a3f542e main -> main`

## Test Sequence (after user clears cache)

```
GET /             → 200, body 211KB (Laravel app)
GET /build/manifest.json          → 200, JSON
GET /build/assets/app-CIomGrQN.js → 200, 46KB JS
GET /build/assets/app-DHhcuQFu.css → 200, 120KB CSS
```

The server (Laravel + Vercel PHP runtime) is functioning correctly. The browser cache is the only remaining issue.
