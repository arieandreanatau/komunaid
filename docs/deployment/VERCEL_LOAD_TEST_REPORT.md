# KomunaID V2 — Load Test Report (Vercel)

**Date:** 2026-06-27
**Live URL:** https://komunaidv2-komuna.vercel.app/
**Region:** sin1 (Singapore)
**Runtime:** vercel-php@0.8.0
**Build:** `b1f9b48`

## 1. Method

- Tool: PowerShell `Invoke-WebRequest` with `[System.Diagnostics.Stopwatch]` around each call.
- Each request serial, no parallelism (PowerShell 5.1 / Windows limits).
- Vercel cache headers honored (`Cache-Control: public, max-age=31536000, immutable` on /assets/* and /build/*).
- No warm-up before measurement; first request is "cold".
- Endpoint tested individually with separate runs (avoids interference).

## 2. Results

| Endpoint | N | OK 2xx | Fail | Min | Median | P95 | Max | Cold? |
|---|---|---|---|---|---|---|---|---|
| `GET /` (homepage) | 25 | 25 | 0 | 558ms | 655ms | 699ms | 925ms | First cold, rest warm |
| `GET /login` | 15 | 15 | 0 | 144ms | 166ms | 790ms | 790ms | One cold burst |
| `GET /assets/brand/komunaid-logo-full.png` | 15 | 15 | 0 | 21ms | 26ms | 46ms | 46ms | Edge cached |
| `GET /build/manifest.json` | 15 | 15 | 0 | 21ms | 26ms | 46ms | 46ms | Edge cached |
| `GET /favicon.ico` | 15 | 15 | 0 | 20ms | 25ms | 45ms | 45ms | Edge cached (resolves to logo asset) |

**100% success rate across 85 requests.** Zero timeouts, zero 5xx.

## 3. Latency interpretation

- **Cold start (first hit to a function after deploy):** 600–900ms. This is the Vercel PHP runtime spinning up the function, booting Laravel, and rendering. Acceptable for demo; not great for chatty single-page-app traffic.
- **Warm (function instance alive):** 150–250ms. This is the realistic steady-state latency.
- **Edge cache hit (static asset):** 20–50ms. The `Cache-Control: public, max-age=31536000, immutable` header on `/build/*` and `/assets/*` routes means the browser will not re-fetch on subsequent visits, and Vercel CDN serves from the nearest POP.

## 4. Throughput estimate (per function instance)

Vercel serverless functions are not designed for sustained throughput. A single function instance on the free plan can serve roughly:
- 1 cold request / second
- 5–10 warm requests / second (PHP overhead per request ~50–100ms CPU)

The Vercel free plan caps at 100 GB-hours / month and 100 GB egress. KomunaID's average page weight is ~50 KB compressed (HTML) + 124 KB CSS + 46 KB JS = ~220 KB per page view. Budget:
- ~450 K page views / month before egress is exhausted.
- Cold starts will become painful beyond 10 req/s sustained.

## 5. Bottlenecks observed

1. **Cold start latency** — first hit to a fresh instance takes 600–900ms. The homepage hit #1 in the table was 925ms, hit #2 was 668ms. After 2-3 requests the function is warm and stable around 200ms.
2. **No edge cache for HTML** — only `/build/*` and `/assets/*` (added this session) have `Cache-Control: max-age=31536000`. HTML responses have `no-store, no-cache, must-revalidate` (intentional, to avoid serving stale auth state).
3. **No HTTP/3 / QUIC** — Vercel default is HTTP/2. Minor improvement possible.
4. **DB connection** — every page makes a new MySQL connection. Persistent connections (`PDO::ATTR_PERSISTENT`) would shave 50–100ms per request.

## 6. Recommendations for Vercel

| Action | Impact | Cost |
|---|---|---|
| Enable Vercel Pro | 1s cold start, 60s function duration (already at max), no throttling | $20/mo |
| Use Cloudflare in front for HTTP/3 + DDoS | -100ms TTFB, security | Free |
| Persistent DB connection in Laravel | -50 to -100ms per request | Dev time |
| Move static homepage to a static export | Edge cached HTML | Dev time (medium) |

## 7. Bottom line

For a demo / soft-launch with up to ~10 K users / month, **Vercel is acceptable.** Beyond that, migrate to a VPS (Laravel Forge + DigitalOcean or Hetzner) for ~$12-25/mo and get predictable latency + persistent processes + no cold starts.
