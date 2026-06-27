# KomunaID Deployment Recommendation

## Final Recommendation: Vercel (with hardening) for MVP, Forge for Production

This document captures the final deployment recommendation after the V1+V2 audit and refactor.

### Why Vercel for MVP

- The Vercel PHP runtime + Laravel 11 already work in the current codebase (see `api/index.php` and `api/cron/scheduler.php`).
- The build command in `vercel.json` handles composer install, npm build, and Laravel cache prewarming.
- Cost: Vercel Pro $20/month + Upstash Redis $0–10/month + PlanetScale/Neon MySQL $0–29/month + Cloudflare R2 $0–5/month.
- Total MVP cost: ~$30–65/month.
- Zero sysadmin work.

### Why Move Off Vercel for Production

| Limitation | Impact |
|---|---|
| 60s function timeout | Long finance aggregation will 504 |
| No persistent filesystem | Uploaded files lost on cold start without S3/R2 |
| No built-in queue worker | Sync queue blocks request; no proper async processing |
| No WebSocket support | Admin chat works (HTTP polling) but feels sluggish |
| Serverless cost spikes | If traffic surges, costs scale linearly |
| 1000 build minutes/month | Fine for normal use, can hit cap with frequent deploys |

### Recommended Production Target

**Laravel Forge on DigitalOcean** (4GB droplet, $24/month) + DigitalOcean Managed MySQL ($15/month) + Upstash Redis ($10/month). Total ~$50/month. Provides:

- Persistent filesystem (uploads work natively)
- Persistent MySQL with daily backups
- Redis for cache/session/queue
- Queue worker + scheduler pre-configured
- Free Let's Encrypt SSL
- 24/7 uptime
- Horizontal scaling via load balancer + 2nd droplet once >5k users

### Decision Matrix

| Team Size | Traffic | Recommendation |
|---|---|---|
| 1 dev, MVP | <1k users | Vercel + external services |
| 1–3 devs, growth | 1k–10k users | Forge on DO 2GB |
| 3–10 devs, scale | 10k+ users | Forge on DO 4GB + managed DB + Redis cluster + CDN |
| 10+ devs, enterprise | 50k+ users | AWS ECS or GCP Cloud Run with custom Laravel image |

### For This Project

Recommendation: **stay on Vercel for the first 3 months** (faster iteration, no DevOps hiring needed), then **move to Forge** once any of:
- Upload traffic exceeds 1GB/day
- Queue jobs regularly exceed 30s
- A real-time feature is requested
- Team grows beyond 2 developers

### Required Reading Before Deploying

- `VERCEL_HARDENING.md` — env var checklist + Vercel-specific gotchas
- `NON_VERCEL_FALLBACK.md` — Forge/Ploi/RunCloud/cPanel steps

### Final Risk Statement

Vercel is **technically viable** for KomunaID as of June 2026 but requires:
1. External MySQL (cannot use sqlite)
2. External Redis for cache + session
3. External object storage for uploads
4. Per-route `maxDuration` configuration for heavy operations
5. Daily monitoring of Vercel function logs (Vercel cold start behavior is non-deterministic)

If the team can commit to those 5 items, Vercel is fine. If any of those are skipped, expect partial outages, lost uploads, and 5xx errors within 1 week of launch.
