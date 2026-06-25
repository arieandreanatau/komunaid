# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

KomunaID is a Laravel 11 platform connecting communities, brands, and members in one ecosystem. Server-rendered Blade UI, MySQL via Eloquent, role-based access with Spatie Permission. Docs (in Indonesian) live in `docs/` — `docs/README.md` is the index; `docs/04-architecture.md`, `docs/06-roles-permissions.md`, and `docs/07-api-endpoints.md` are the most useful references.

> **`source-code-laravel/` is a stale duplicate, not the live app.** The canonical application is the repository root (Laravel 11, 25 models, Vercel deploy wiring). Ignore `source-code-laravel/` unless explicitly asked — its README describes the old XAMPP/Laravel 12 setup and does not reflect current code.

## Commands

```bash
composer install              # PHP deps
npm install                   # Frontend deps (Vite)

php artisan migrate           # Run migrations (29 migrations)
php artisan migrate:fresh --seed   # Reset DB + seed (roles, categories, demo communities/owners)
php artisan db:seed           # Seed only

npm run dev                   # Vite dev server (HMR)
npm run build                 # Build assets to public/build
php artisan serve             # Local app server

./vendor/bin/pint             # Format/lint (Laravel Pint)
./vendor/bin/phpunit          # Run tests (PHPUnit 11)
./vendor/bin/phpunit --filter=testName   # Run a single test
```

Note: there is currently no `tests/` directory or `phpunit.xml` — the test toolchain is installed but no suite exists yet. Add `phpunit.xml` and a `tests/` tree before writing tests.

## Architecture

**Role-segmented MVC.** Every authenticated area is partitioned by role, and this partition is mirrored consistently across three layers — keep them in sync when adding features:

- **Routes** (`routes/web.php`, single file ~274 lines): grouped by `prefix` + `role:` middleware. Public routes first, then `auth` group containing nested prefixes: `member/` (`role` not required), `community-own/` (`role:community_owner`), `brand/` (`role:brand_owner|brand_staff`), `superadmin/` (`role:superadmin`).
- **Controllers** (`app/Http/Controllers/<Role>/`): namespaced by role — `Superadmin/`, `CommunityOwner/`, `BrandOwner/`, `Member/`, plus `Guest/` (public) and `Auth/` (custom Breeze-derived controllers). The same domain concept often has one controller per role (e.g. `Superadmin/CommunityController` vs `CommunityOwner/CommunityController`).
- **FormRequests** (`app/Http/Requests/<Role>/`): validation is also role-namespaced.

**Authorization** uses Spatie roles for route gating + Laravel **Policies** (`app/Policies/`: Brand, Community, Event, CollaborationRequest) for record-level checks inside controllers. The six roles are seeded by `RoleSeeder` and defined canonically in `app/Enums/UserRole.php`: `superadmin`, `member`, `community_owner`, `brand_owner`, `community_staff`, `brand_staff`.

**Post-login routing** is centralized in `User::getDashboardRoute()` (`app/Models/User.php`) — it returns the dashboard route for the user's highest role. `AuthenticatedSessionController` special-cases superadmin then defers to this method. Add new role dashboards there.

**Enums** (`app/Enums/`) are backed string enums used for model casts and status logic: `ApprovalStatus`, `CampaignStatus`, `CollaborationType`, `RequestedRole`, `UserRole`. Reuse these rather than hardcoding status strings.

**Middleware aliases** (`role`, `permission`, `role_or_permission`) are registered in `bootstrap/app.php` (Laravel 11 has no `Kernel.php` — middleware, routing, and exceptions are all configured here).

## Domain model

Core flow: a `User` (Spatie `HasRoles`) requests an elevated role via `RoleRequest` → superadmin approves in the Approval Center → user gains `community_owner`/`brand_owner` and can create `Community` (with `CommunityCategory`, `CommunityRegion`, `CommunitySubgroup`, `CommunityMember`) or `Brand` (with `Campaign`, `BrandMember`/staff). Communities run `Event`s (registration, payment confirmation, gallery, chat threads). Brands and communities connect through `CollaborationRequest` (`CollaborationType` enum). `ApprovalLog`/`AuditLog` record administrative actions.

## Deployment (Vercel)

Deployed as a PHP serverless function via `vercel-php@0.6.0`. `api/index.php` is the entry point (boots `bootstrap/app.php` and dispatches the HTTP kernel). `vercel.json` routes `/storage/*` to static files and everything else to `api/index.php`; `outputDirectory` is `public`. **`vendor/` is committed** (it is un-ignored in `.gitignore`) so the function has dependencies at runtime. Production env (see `.env.example`) expects an external MySQL host and uses `database` drivers for cache/queue/session.
