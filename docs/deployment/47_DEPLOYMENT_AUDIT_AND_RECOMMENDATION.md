# 47 — DEPLOYMENT AUDIT AND RECOMMENDATION

## 47.1 Current deployment
- **Host**: Vercel (serverless PHP via `api/index.php`).
- **Build**: `npm run build` produces `public/build/`.
- **Server runtime**: PHP 8.x via Vercel.
- **DB**: external MySQL (not in repo).

## 47.2 Audit findings
| # | Item | Status | Notes |
|---|---|---|---|
| D-01 | `vercel.json` | OK | routes `api/*` → `api/index.php` |
| D-02 | `api/index.php` | OK | front controller present |
| D-03 | PHP runtime | OK | Vercel supports PHP runtime |
| D-04 | APP_KEY | OK | `.env` (never commit) |
| D-05 | APP_URL | OK | `https://komunaidv2-komuna.vercel.app/` |
| D-06 | DB env | OK | must be set per environment |
| D-07 | SESSION_DRIVER | RISK | `file` driver is **not durable** on serverless; switch to `database` or cookie-based |
| D-08 | CACHE_DRIVER | RISK | `file` is fine for read-mostly; for write-heavy use `database` or `redis` |
| D-09 | FILESYSTEM_DISK | RISK | `public` is local; on serverless uploads may be lost. Use S3 / R2 |
| D-10 | storage writable | RISK | ephemeral filesystem; uploads can be lost |
| D-11 | public/build | OK | bundled into the deploy |
| D-12 | queue | RISK | `database` queue is fine but cron / worker is needed; on Vercel use a separate worker |
| D-13 | scheduler | RISK | Vercel cron must be configured for `php artisan schedule:run` |
| D-14 | DB migration strategy | RISK | No automatic migration on Vercel; must run manually or via deploy hook |
| D-15 | logging | OK | Vercel captures stdout / stderr |
| D-16 | error visibility | RISK | `APP_DEBUG=false` on production |
| D-17 | HTTPS | OK | Vercel provides TLS |
| D-18 | domain | OK | `komunaidv2-komuna.vercel.app` |
| D-19 | rollback | OK | Vercel keeps prior deployments; instant rollback |
| D-20 | PHP extensions | Verify | fileinfo, gd, intl, mbstring required |

## 47.3 Verdict on Vercel as a Laravel full-app host

**Vercel is not ideal for KomunaID as a long-term production host.** Reasoning:
1. The PHP runtime on Vercel is serverless and cold-starts on every request → tail latency and per-request cost.
2. The filesystem is ephemeral → user uploads (community logos, event galleries, profile photos) are not durable.
3. Session state must be moved to database/cookie/Redis → the `file` driver in `.env` is unsafe.
4. Queue workers and scheduler require external infrastructure.
5. MySQL needs to be managed elsewhere (PlanetScale / RDS / a VPS-hosted MySQL).
6. Logging, monitoring, and secrets management are easier on a VPS or managed host.

**However**, Vercel is a perfectly fine host for the **public marketing surface** of KomunaID — landing page, blog, about, contact, and the auth pages — as the current deployment shows.

## 47.4 Recommended architecture (production)

| Layer | Choice | Notes |
|---|---|---|
| Public marketing surface | Vercel | landing, blog, about, contact |
| App surface (auth, dashboards) | Laravel Forge / Ploi.io / RunCloud on a VPS (DigitalOcean / Linode / Vultr) | durable filesystem, cron, queues, real MySQL |
| Database | MySQL 8 on the same VPS (or managed RDS) | daily backup, 30-day rotation |
| Object storage | S3 / Cloudflare R2 | for community / event / profile uploads |
| Cache / session / queue | Redis (managed) | for production |
| Mail | Mailgun / Postmark / Amazon SES | for password reset + notifications |
| Monitoring | Laravel Telescope (local) + Sentry / Bugsnag (prod) | — |
| CI | GitHub Actions | `php artisan test`, `npm run build` |

## 47.5 Code change vs hosting change
- **Code change** required regardless of host:
  - SESSION_DRIVER = `database` (or `cookie` if staying serverless).
  - FILESYSTEM_DISK = `s3` (or `r2`).
  - QUEUE_CONNECTION = `database` (with external worker) or `redis`.
  - All secrets via env, never committed.
- **Hosting change** for production:
  - Move app surface to a VPS / Forge / Ploi.
  - Keep Vercel for public surface (optional).
  - Configure S3 bucket + IAM user.
  - Configure SMTP provider.
  - Set up daily DB snapshot.

## 47.6 Migration strategy
1. Provision target host + DB.
2. `php artisan migrate --force` (after DB import).
3. Seed master data.
4. `npm run build`.
5. Point DNS or proxy.
6. Smoke test on new host.
7. Decommission Vercel app surface (keep marketing if desired).
