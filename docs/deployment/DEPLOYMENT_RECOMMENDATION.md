# KomunaID — Deployment Recommendation

**Last updated:** 2026-06-25

---

## 1. Chosen Stack

| Layer | Service | Reason |
|---|---|---|
| Application | **Vercel** (serverless PHP via `vercel-php@0.8.0`) | User choice; zero-ops for PHP, free tier OK for MVP |
| Database | **Hostinger MySQL** (external) | User choice; existing hosting |
| File storage | **Cloudflare R2** (S3-compatible) | Cheapest egress; no file lost on Vercel cold start |
| Scheduler | **Vercel Cron Jobs** | Native to Vercel; no separate service |
| Email | TBD (Phase 2: Resend / Mailgun / SES) | Out of MVP scope |
| Cache / Session / Queue | MySQL (database driver) | Serverless-safe; tables exist |
| Frontend assets | Vite build, committed in `public/build/` + rebuilt in `vercel.json` buildCommand | |

---

## 2. Vercel Project Setup

### 2.1 Environment Variables (set in Vercel project, NOT in code)

| Key | Example | Notes |
|---|---|---|
| `APP_NAME` | `KomunaID` | |
| `APP_ENV` | `production` | |
| `APP_KEY` | `base64:...` | generate via `php artisan key:generate --show` locally |
| `APP_DEBUG` | `false` | MUST be false in production |
| `APP_URL` | `https://komunaid.example.com` | |
| `APP_LOCALE` | `id` | |
| `APP_FALLBACK_LOCALE` | `id` | |
| `APP_FAKER_LOCALE` | `id_ID` | |
| `LOG_CHANNEL` | `stderr` | Vercel captures stderr |
| `LOG_LEVEL` | `info` | |
| `DB_CONNECTION` | `mysql` | |
| `DB_HOST` | Hostinger MySQL host (e.g. `srv123.hostinger.com`) | |
| `DB_PORT` | `3306` | |
| `DB_DATABASE` | `u123_komunaid` | |
| `DB_USERNAME` | `u123_komunaid` | |
| `DB_PASSWORD` | (secret) | |
| `SESSION_DRIVER` | `database` | |
| `SESSION_LIFETIME` | `120` | |
| `CACHE_STORE` | `database` | |
| `QUEUE_CONNECTION` | `database` | |
| `FILESYSTEM_DISK` | `s3` | |
| `AWS_ACCESS_KEY_ID` | R2 access key | |
| `AWS_SECRET_ACCESS_KEY` | R2 secret | |
| `AWS_DEFAULT_REGION` | `auto` | R2 |
| `AWS_BUCKET` | `komunaid-uploads` | R2 bucket |
| `AWS_ENDPOINT` | `https://<accountid>.r2.cloudflarestorage.com` | R2 endpoint |
| `AWS_URL` | `https://uploads.komunaid.example.com` | public R2 custom domain (optional) |
| `AWS_USE_PATH_STYLE_ENDPOINT` | `false` | |
| `CRON_SECRET` | 64-char random string | Used by Vercel Cron |
| `MAIL_MAILER` | `log` (Phase 1) → `smtp` (Phase 2) | |
| `MAIL_HOST` | TBD | |
| `MAIL_PORT` | `587` | |
| `MAIL_USERNAME` | TBD | |
| `MAIL_PASSWORD` | TBD | |
| `MAIL_ENCRYPTION` | `tls` | |
| `MAIL_FROM_ADDRESS` | `no-reply@komunaid.example.com` | |
| `MAIL_FROM_NAME` | `${APP_NAME}` | |

### 2.2 Build & Output

- `buildCommand` defined in `vercel.json` runs:
  1. `composer install --no-dev --optimize-autoloader`
  2. `npm ci && npm run build`
  3. `php artisan package:discover`
  4. `php artisan storage:link` (no-op on Vercel since storage is R2)
  5. `php artisan view:cache`
  6. `php artisan config:cache`
  7. `php artisan route:cache`
- `outputDirectory`: `public`
- `installCommand`: skipped (handled in build)

### 2.3 Routing

- `vercel.json` routes: all requests → `api/index.php` (the serverless entry).
- Vercel health check: `/up` (Laravel's built-in).

### 2.4 Cron

```json
"crons": [
  { "path": "/api/cron/scheduler?token=__CRON_SECRET__", "schedule": "* * * * *" }
]
```

Vercel resolves `__CRON_SECRET__` at deploy time with the env var. Route is protected by `VerifyCronToken` middleware (constant-time compare against `CRON_SECRET`).

### 2.5 .vercelignore

Configured in `.vercelignore` to exclude:
- `.git`, `.idea`, `.vscode`, `.kilo`, `.claude`
- `node_modules`, `tests`, `docs`
- `.env*` files (env set in Vercel)
- `storage/framework/*` (regenerated)
- `composer-setup.php`, `composer.phar`
- `*.log`

---

## 3. Hostinger MySQL Setup

1. Login to hPanel → **Databases → Remote MySQL**.
2. Add a remote host: **Allow `%`** (all IPs) **OR** specific Vercel egress IP range (if Pro/Enterprise).
3. Create database `u123_komunaid`.
4. Note host (`srvXXX.hostinger.com`), port (3306), user, password.
5. Set in Vercel env.

**Note:** If Hostinger blocks all remote access, fallback: use **PlanetScale** (free tier MySQL with public connection) or **Neon** (Postgres — requires Laravel migration to Postgres).

---

## 4. Cloudflare R2 Setup

1. Login to Cloudflare dashboard → R2 → Create bucket `komunaid-uploads`.
2. Generate API token with **Object Read & Write** scope on this bucket.
3. Set CORS:
   ```json
   [{
     "AllowedOrigins": ["https://komunaid.example.com"],
     "AllowedMethods": ["GET", "PUT", "POST"],
     "AllowedHeaders": ["*"],
     "ExposeHeaders": ["ETag"],
     "MaxAgeSeconds": 3600
   }]
   ```
4. (Optional) Connect custom domain `uploads.komunaid.example.com` for public URLs.
5. Set R2 credentials in Vercel env.

---

## 5. Pre-Deploy Checklist

- [ ] All env vars set in Vercel project.
- [ ] `APP_DEBUG=false`.
- [ ] Hostinger MySQL allows remote connection from Vercel.
- [ ] R2 bucket + credentials ready.
- [ ] `CRON_SECRET` set (long random).
- [ ] Vercel project connected to GitHub repo (branch `refactor/v1-v2-audit` or `main`).
- [ ] Build passes locally (`composer install --no-dev && npm ci && npm run build`).
- [ ] `php artisan route:list` shows 427 routes (426 existing + 1 cron).
- [ ] `php artisan migrate:status` shows all green.

## 6. Deploy Steps

1. Push branch to GitHub.
2. Vercel auto-detects `vercel.json` and runs buildCommand.
3. Wait for "Build Successful".
4. Visit `https://<deployment>.vercel.app/up` → expect 200 OK.
5. Visit `https://<deployment>.vercel.app/` → expect 200 OK with homepage.
6. Test login (member, superadmin).
7. Manually trigger cron: `curl 'https://<deployment>.vercel.app/api/cron/scheduler?token=<CRON_SECRET>'` → expect `{"ok":true,"ran_at":"..."}`.

## 7. Post-Deploy Monitoring

- Vercel dashboard → Logs: filter by `stderr` for Laravel logs.
- Vercel dashboard → Functions: monitor `api/index.php` invocation count + duration.
- Database: monitor Hostinger MySQL slow query log.
- R2: monitor storage usage.
- Cron: Vercel dashboard → Crons → history.

## 8. Rollback

If deploy fails:
1. Vercel → Deployments → click previous successful → "Promote to Production".
2. DB: Hostinger has automatic daily backup. Restore via hPanel.
3. R2: data is on Cloudflare, safe.

## 9. Fallback: VPS + Laravel Forge

If Vercel serverless proves unworkable (DB connection limits, cold start latency, R2 cost):
- **Laravel Forge** ($12/mo) on **DigitalOcean** ($6/mo droplet).
- Full PHP-FPM + Nginx + Supervisor for queue.
- Cron via Forge scheduled jobs.
- File storage on droplet volume (no R2 needed).
- Total: ~$18/mo.

## 10. Production-Readiness Summary

| Area | Status | Notes |
|---|---|---|
| Code | **Ready** | 149 tests passing, structure refactored |
| Build | **Ready** | npm + composer build green |
| Routes | **Ready** | 427 routes, 0 errors |
| DB | **Ready** | 99 migrations applied, schema stable |
| Tests | **Ready** | 149 passing, 14 test files |
| Vercel config | **Ready** | vercel.json updated, cron + build step |
| Vercel env | **Not set** (operator action) | Must be set in Vercel project |
| Hostinger MySQL remote | **Verify** (operator action) | Must allow Vercel egress |
| R2 setup | **Not set** (operator action) | Bucket + credentials |
| Production URL DNS | **Not set** (operator action) | Point domain to Vercel |
| APP_KEY | **Not set** (operator action) | Generate + set in Vercel |

**Production readiness:** **Ready with Notes** — code and config are ready; operator must provision Hostinger/R2/Vercel env before deploy.
