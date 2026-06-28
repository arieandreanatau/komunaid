# 31 — TECHNICAL SPECIFICATION

## Stack
- **Backend**: Laravel 11.54, PHP 8.2.
- **Database**: MySQL 8 / MariaDB 10.6+.
- **Frontend**: Blade + Tailwind v4 (`@tailwindcss/vite`) + Alpine.js (optional).
- **Build**: Vite 5.
- **Permissions**: Spatie `spatie/laravel-permission` 6.25.
- **Hosting (current)**: Vercel (PHP serverless via `api/index.php`).
- **Recommended for production**: Laravel Forge / Ploi.io / RunCloud / CloudPanel on a VPS.

## Directory structure (top level)
```
app/
  Console/
  Exceptions/
  Http/
    Controllers/
      Auth/
      BrandOwner/
      CommunityOwner/
      CompanyOwner/
      Member/
      RoleRequest/
      Superadmin/
    Middleware/
    Requests/
  Models/
  Providers/
  Services/
    Auth/
bootstrap/
config/
database/
  migrations/  ← 105 files
  seeders/
  factories/
docs/
public/
  assets/
  build/      ← Vite output
resources/
  css/app.css ← Tailwind v4 @theme
  js/app.js
  views/
routes/
  web.php
  console.php
storage/
tests/
  Feature/
  Unit/
vercel.json
vite.config.js
```

## CSS pipeline
- `resources/css/app.css` contains:
  - `@import "tailwindcss";`
  - `@theme { --color-komuna-*: … }` — defines the entire Komuna color palette.
- `vite.config.js` uses `@tailwindcss/vite`.
- `npm run build` produces `public/build/assets/*` and `manifest.json`.
- Layouts reference `komuna-*` classes which resolve to the CSS variables.

## Auth pipeline
- Form-based session auth.
- Default guard `web`.
- `AuthenticatedSessionController` resolves `email OR username` via `login` field.
- `RegisterRequest` allows nullable email + username but enforces "at least one".
- Superadmin login is via `/admin/login` only.

## Database access
- Eloquent ORM.
- Policies (where defined) gate model access.
- All state changes funnel through controllers + FormRequest; no direct DB writes from Blade.

## Errors
- `APP_DEBUG=true` in local, `false` in production.
- Custom error pages for 401/403/404/500.

## Queue
- `QUEUE_CONNECTION=database` on local; switch to `redis` in production.
- A scheduler runs via cron / external scheduler for emails, exports, donations receipt, etc.

## Observability
- `storage/logs/laravel.log` (single + stack).
- `login_logs`, `audit_logs`, `approval_logs` for security audit.
- `exports` for export history.
