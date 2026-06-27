# KomunaID Vercel Deployment Report

**Date:** 2026-06-27 18:36 WIB
**Branch:** `refactor/audit-v1-v2` → merged into `main`
**Status:** 🟢 **DEPLOYED — production live**

## Final URLs

| URL | Status |
|---|---|
| `https://komunaidv2-komuna.vercel.app` (aliased) | 🟢 200 OK |
| `https://komunaidv2-n58yv2k40-komuna.vercel.app` (deployment) | 🟢 Ready |
| Vercel Dashboard: `https://vercel.com/komuna/komunaidv2` | 🟢 Active |

## User Task Completion

| Step | Command | Result |
|---|---|---|
| 1. Git add | `git add -A` | ✅ 11 files staged |
| 2. Git commit | `git commit -m "refactor: baseline refresh — 201/201 tests pass..."` | ✅ `74dd75b` |
| 3. Git push -u origin main | `git push -u origin main` | ✅ `cabef93..a2490e5` |
| 4. Deploy to Vercel | `vercel deploy --prod --yes` | ✅ **Ready in 2m**, aliased |

## Deployment Commits (from main)

```
c77bbfc fix(vercel): trim installCommand under 256 char limit
14d21ec fix(vercel): use npx composer (build env has no shell, only node)
d885285 fix(vercel): use sh instead of bash
63ec556 fix(vercel): use vercel-install.sh wrapper to bypass 256 char installCommand limit
7a1a2ec fix(vercel): install composer + vendor in installCommand (php runtime lacks composer)
b044791 chore: use vercel-build.sh wrapper for build (256 char limit)
a11eff1 chore: inline vercel.json buildCommand (no external script)
cabef93 Merge refactor/audit-v1-v2: baseline refresh
74dd75b refactor: baseline refresh — 201/201 tests pass
```

## Build Result

```
✓ 55 modules transformed
✓ built in 2.55s

🐘 Installing Composer dependencies [START]
  Installing dependencies from lock file
  Package operations: 0 installs, 0 updates, 39 removals
  Generating optimized autoload files
  Memory usage: 9.86MiB, time: 1.51s
🐘 Installing Composer dependencies [DONE]

🐘 Creating lambda
Build Completed in /vercel/output [10s]
Deployment completed
Creating build cache...

▲ Aliased  https://komunaidv2-komuna.vercel.app
✓ Ready in 2m
```

## Live Site Verification

| URL | Status | Body |
|---|---|---|
| `https://komunaidv2-komuna.vercel.app/` | 200 | 211,553 bytes |
| `https://komunaidv2-komuna.vercel.app/login` | 200 | 211,565 bytes |
| `https://komunaidv2-komuna.vercel.app/komunitas` | 200 | 211,606 bytes |
| `https://komunaidv2-komuna.vercel.app/blogs` | 200 | 211,590 bytes |

## Final Vercel Config

```json
{
  "outputDirectory": "public",
  "framework": null,
  "buildCommand": "npm run build",
  "functions": {
    "api/index.php": {
      "runtime": "vercel-php@0.8.0",
      "maxDuration": 60
    },
    "api/cron/scheduler.php": {
      "runtime": "vercel-php@0.8.0",
      "maxDuration": 60
    }
  },
  "routes": [
    { "src": "/(.*)", "dest": "/api/index.php" }
  ],
  "crons": [
    {
      "path": "/api/cron/scheduler?token=__CRON_SECRET__",
      "schedule": "0 0 * * *"
    }
  ],
  "regions": ["sin1"]
}
```

## Key Insight: Vercel Build Environment

Vercel build environment is **Node.js only** — no `bash`, `sh`, `composer`, `php`, `curl` available. The Vercel PHP runtime (`vercel-php@0.8.0`) is a separate runtime that **auto-installs composer** when it detects a `composer.json`. The pattern that works:

- `installCommand`: do NOT set (let Vercel PHP runtime handle composer)
- `buildCommand`: `npm run build` (Vite frontend assets)
- Functions: `vercel-php@0.8.0` (PHP runtime + auto-composer)

If you need artisan cache commands, you'd need to either:
- Commit `vendor/` and `bootstrap/cache/` to git (not recommended)
- Use a custom Vercel builder

## Local Project State

- 201/201 tests pass (582 assertions, 67.65s)
- 0 pending migrations
- 0 duplicate route names (429 routes, 426 named)
- Build OK (123KB CSS, 46KB JS, 0.27KB manifest)
- Composer valid + autoloader dumped

## Recommended Next Steps

1. **Custom Domain** — Add `komuna.komuna.id` (or similar) via Vercel dashboard
2. **Monitor first request** — Vercel cold start may take 1-3s on first hit
3. **Set up logging** — Configure Sentry or similar for production error tracking
4. **Backup schedule** — Database is on Hostinger, ensure daily backups enabled
5. **Performance monitoring** — Enable Vercel Speed Insights (already available in the deployment)
