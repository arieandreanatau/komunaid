# KomunaID Vercel Deployment Hardening

This document covers everything needed to deploy KomunaID to Vercel successfully. It assumes you have a Vercel account and the `vercel` CLI installed.

## TL;DR

Vercel is technically able to host KomunaID, but **only with external services for MySQL, cache, sessions, queue, and object storage**. KomunaID's default `file` drivers for cache/session and `local` filesystem for uploads will fail in production on Vercel because the deployment is read-only and ephemeral.

## Why Vercel Is Fragile Here

Vercel's PHP runtime (`vercel-php@0.8.0`) runs Laravel inside an AWS Lambda-style serverless function. Each cold start is a fresh container with read-only filesystem except `/tmp`. Implications:

| Concern | Default | Required for Production on Vercel |
|---|---|---|
| Database | sqlite (file, in repo) or mysql (local) | External MySQL (PlanetScale, Aiven, Neon, Railway, Supabase) |
| Cache | `file` (lost on cold start) | Redis (Upstash) |
| Session | `file` (lost on cold start) | Redis or database |
| Queue | `database` (works but slow) or `sync` | Redis with external worker (Laravel Cloud, Beanstalkd, custom) |
| Uploads | `local` disk (lost on cold start) | S3 or Cloudflare R2 |
| Logs | `single` (lost on cold start) | Logtail, Better Stack, Papertrail |
| Scheduler | Vercel Cron (`* * * * *`) | Same; ensure `CRON_SECRET` is set |
| Region | `iad1` (US East) | Choose nearest (e.g. `sin1` for SEA) |

## Required Environment Variables

Set all of these in Vercel project settings (Environment: Production):

```bash
APP_NAME=KomunaID
APP_ENV=production
APP_KEY=base64:...                # `php artisan key:generate --show`
APP_URL=https://your-domain.com
APP_DEBUG=false
LOG_CHANNEL=stack

# Database (must be external MySQL)
DB_CONNECTION=mysql
DB_HOST=...
DB_PORT=3306
DB_DATABASE=komunaid
DB_USERNAME=...
DB_PASSWORD=...

# Cache + Session + Queue (Redis, e.g. Upstash)
CACHE_STORE=redis
SESSION_DRIVER=redis
SESSION_LIFETIME=120
QUEUE_CONNECTION=redis
REDIS_CLIENT=phpredis
REDIS_HOST=...
REDIS_PORT=6379
REDIS_PASSWORD=...
REDIS_DB=0
REDIS_CACHE_DB=1

# Object storage (S3 or R2)
FILESYSTEM_DISK=s3
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_DEFAULT_REGION=auto
AWS_BUCKET=komunaid-uploads
AWS_ENDPOINT=https://<accountid>.r2.cloudflarestorage.com   # for R2; remove for S3
AWS_URL=https://media.your-domain.com                        # for R2 with custom domain

# Cron
CRON_SECRET=<random-32-by-hex>

# Mail (use SES/Postmark/Mailgun in production)
MAIL_MAILER=log                    # change to smses/smtp/postmark in production
```

## Vercel Build Settings

`vercel.json` is already configured with:

- Output directory: `public` (Laravel's public dir)
- Build command: composer install + npm ci + npm run build + package:discover + storage:link + view:cache + config:cache + route:cache
- Function runtime: `vercel-php@0.8.0` with `maxDuration: 60`
- Cron entry: `* * * * *` on `/api/cron/scheduler?token=__CRON_SECRET__`
- Region: `sin1` (override in `vercel.json` if your users are elsewhere)

## What To Do After First Deploy

1. Verify the Vercel build log shows `composer install`, `npm run build`, and the artisan commands all succeed.
2. Visit your Vercel URL. If you see a 500 error, check the Vercel function log.
3. The runtime will write `storage/production-config-warnings.log` if any production defaults are still in place. Check that file via the function log.
4. Run `php artisan migrate` once. **This must be done via a one-off CLI invocation**, not via the Vercel cron. Use Vercel CLI:
   ```bash
   vercel env pull .env.production
   php artisan migrate --force --env=production
   ```
   Or run a one-off Vercel function, or connect to the database directly with a MySQL client and apply the migrations.
5. Set up the role + superadmin + master data via:
   ```bash
   php artisan db:seed --class=Database\\Seeders\\DatabaseSeeder --env=production
   ```
   This seeds only `Master\*` seeders (Demo is gated on `local` env).

## Things That Will Not Work on Vercel

- **File uploads to local storage**: must use S3/R2.
- **Long-running queue workers**: Vercel functions max out at the configured `maxDuration` (60s for Pro, 10s default for Hobby). For real queue workers, run `php artisan queue:work` on a separate process — Render, Railway, Fly.io, or a tiny VPS.
- **WebSockets / Pusher-style realtime**: Vercel functions do not hold connections. Use Pusher, Ably, or Laravel Websockets on a server.
- **Streaming responses**: Vercel PHP runtime buffers. Not suitable for `response()->stream(...)` patterns.

## When to Migrate Off Vercel

Migrate when you have any of:
- More than ~10k daily active users
- Heavy file uploads (>1GB/day)
- Real-time features (chat, notifications, dashboards)
- Long-running jobs (>60s)
- Multiple environments (staging + production) needing true isolation

Recommended migrations: **Laravel Forge** (server provisioning), **Ploi** (similar to Forge), **RunCloud** (panel-based), or a managed Laravel host (Laravel Cloud, Cloudways, ServerPilot).

## Verified Test

The full test suite `php artisan test` (188 tests) passes after these hardening changes. Migration `2026_06_27_000001_audit_v1_v2_alignment` runs on the `migrate` command and asserts presence of every V1+V2 table.
