# KomunaID — Project Initial Analysis

> **Audit scope:** end-to-end scan of `C:\xampp\htdocs\komunaid`
> **Date:** 2026-06-28
> **Methodology:** static read of repo + live `php artisan` + HTTP smoke test on `http://127.0.0.1:8000`
> **Auditor:** Senior Fullstack / QA / Security / Sys-Analyst combined pass

---

## 1. Tech Stack (confirmed from `composer.json`, `package.json`, repo)

| Layer            | Technology |
|------------------|------------|
| Backend framework| Laravel **11.54.0** (PHP 8.2+) |
| Frontend         | Blade server-rendered + **Vite 5** + **Tailwind CSS 4** (`@tailwindcss/vite`) |
| Database         | **MySQL 8.0** (configured; SQLite fallback exists) |
| ORM              | Eloquent (no extra query builder) |
| Auth             | Laravel **Breeze 2** (session-based) + **Sanctum 4** (mounted but unused) |
| RBAC             | **Spatie laravel-permission 6** (11 roles in `app/Enums/UserRole.php`) |
| File storage     | `public` local disk (production: `s3` / Cloudflare R2) |
| Cache/Queue/Session | file in local, database in Vercel (serverless-safe) |
| Mail             | `log` driver in dev; `smtp` placeholder for prod |
| Build / deploy   | Vite build → `public/build`. Vercel serverless via `vercel-php@0.8.0` |
| External         | none wired (no payment gateway, no real-time chat, no email) |
| Package manager  | Composer 2 + npm |
| Test framework   | PHPUnit 11 installed, **no `tests/` suite other than the Breeze boilerplate** (`tests/Feature/`, `tests/Unit/` only contain `CreatesApplication` + `TestCase` skeletons) |

---

## 2. Project Layout (live)

```
komunaid/
├── api/                      # Vercel PHP entrypoint (api/index.php, api/static.php, api/cron/scheduler.php)
├── app/
│   ├── Enums/                # ApprovalStatus, CampaignStatus, CollaborationType, RequestedRole, UserRole
│   ├── Http/
│   │   ├── Controllers/      # Auth, BrandOwner, CommunityOwner, CompanyOwner, Member, Public, Shared, Superadmin
│   │   └── Middleware/       # ActiveUser, ApplySessionLocale, EnsureNotBanned, EnsureNotSuperadmin, EnsureSuperadmin, VerifyCronToken
│   ├── Models/               # 69 Eloquent models
│   ├── Providers/            # AppServiceProvider
│   └── Services/             # 14 services across AdminChat, Auth, Brand, Collaboration, Company, Documentation, Event, Export, Finance, Premium
├── bootstrap/app.php         # Middleware aliases & routing entrypoint
├── config/                   # Laravel 11 minimal config (only files overridden are present)
├── database/
│   ├── factories/            # 9 factories
│   ├── migrations/           # 101 migration files
│   └── seeders/
│       ├── DatabaseSeeder.php
│       ├── Master/           # 14 master seeders (roles, regions, categories, plans, etc.)
│       └── Demo/             # 8 demo seeders
├── docs/                     # Pre-existing extensive documentation tree
├── lang/                     # Translation files (currently very limited: admin_chat only)
├── public/                   # Built Vite assets live in public/build/
├── resources/
│   └── views/                # auth, brand, company-owner, community-owner, components, layouts, member, public, superadmin
├── routes/
│   ├── web.php               # Root composer (loads modules/*.php)
│   └── modules/              # 7 module files: auth, public, member, community-owner, brand-owner, company-owner, superadmin
├── storage/app/{deployment,documentation,qa}
├── tests/                    # Only boilerplate (Feature, Unit + TestCase/CreatesApplication)
├── vercel.json               # Vercel config: serverless, 1 cron, 3 functions
├── composer.json / package.json
├── phpunit.xml / phpunit.xml.dist
└── .env / .env.example / .env.production / .env.testing / .env.vercel-token
```

---

## 3. Route Architecture

* **Single `routes/web.php`** loads 7 module files via `require __DIR__.'/modules/…php'`.
* Middleware aliases declared in `bootstrap/app.php`:
  `role`, `permission`, `role_or_permission` (Spatie),
  `admin` (`EnsureSuperadmin`), `not.superadmin`, `active_user`, `not.banned`, `cron.token`.
* Public routes are unguarded; auth required for everything else; superadmin is in a separate group with `admin` middleware.
* Cron route is token-protected (`VerifyCronToken`) and called by Vercel Cron (`0 0 * * *`).

---

## 4. Database Snapshot

* 101 migrations, **all 4 ran** (`php artisan migrate:status` returns `Ran` for every line; no `Pending`).
* `mysql -u root -e "SHOW DATABASES"` confirms `komunaid` exists alongside `komunaid_test`.
* 69 Eloquent models; soft deletes on critical models (`User`, etc.).

---

## 5. Identified at a glance — first-pass issues

| # | Issue | Source | Severity |
|---|-------|--------|----------|
| A1 | **README ↔ routes inconsistency.** README documents `/tentang-kami`, `/hubungi-kami`, `/event`, but the route registry only exposes `/about`, `/contact`, `/events` (plural). All three README links would 404. | `routes/modules/public.php` vs `README.md` | High (broken doc links) |
| A2 | **No automated test suite.** `phpunit.xml` is present but `tests/Feature` and `tests/Unit` contain only the Breeze boilerplate. `php artisan test` passes with 0 tests. | `tests/`, `phpunit.xml` | High (no regression safety) |
| A3 | **No payment gateway, no real-time chat, no email.** Already acknowledged in `README.md` "Known Issues". | `config/services.php` (absent) | Medium (documented gap) |
| A4 | **`AccountRestrictedController` exists but I have not seen it wired beyond the route — verify the page renders 200.** Verified `200 /account-restricted`. | route & view | OK |
| A5 | **Public homepage uses Indonesian strings** but no `/id` locale switch — `LanguageController` only sets `app()->setLocale()` from URL `/language/{locale}`. | `routes/modules/public.php:43` | Low |
| A6 | **`Source-code-laravel/`** flagged by `CLAUDE.md` as a stale duplicate — present in `docs/`, must be ignored for canonical analysis. | `CLAUDE.md` | Note |
| A7 | **Demo passwords seeded in `local`.** Confirmed in `README.md` — must NOT be deployed to production as-is. | `database/seeders/Demo/*` | Note (security) |

---

## 6. Modul yang sudah ada (ringkasan 1-baris)

- Public (homepage, komunitas, event, blog, about, contact, language switch)
- Auth (Breeze-derived: register, login, forgot/reset, onboarding, restricted, separate `/admin/login` for superadmin)
- Member (dashboard, profile, interests, communities, events, friends, bookmarks, galleries, wallet, history)
- Community Owner (community CRUD, members, events, wallet, collaborations, proposals, ownership transfer)
- Brand Owner (brand CRUD, campaigns, proposals, community directory, settings, staff)
- Company Owner (company CRUD, brand management, settings, collaborations)
- Superadmin (dashboard, approval-center, master-data, CMS, admin-chat, documentation, audit/login logs, ownership transfer, feature locks, premium, translations)
- Event (full lifecycle: create, register, payment confirmation, gallery, chat threads, volunteers, donations, finance)
- Collaboration (proposals polymorphic + old `CollaborationRequest` legacy)
- Premium / Feature lock
- Admin chat
- Documentation generator
- CMS (homepage sections, blogs, pages, contact, suggestions)
- Multilanguage (only `admin_chat.php`)

## 7. Modul yang belum ada (gap yang dikonfirmasi)

- Payment gateway (Midtrans/Xendit/Stripe)
- Real-time chat (Laravel Reverb / Pusher)
- Email & push notifications
- QR check-in event
- Certificate generator
- Sponsorship package
- Job/internship marketplace
- Multi-language beyond admin_chat
- E2E / Feature automated tests
- Audit log viewer coverage for brand/company events

(Dipetakan ke `02_MODULE_GAP_ANALYSIS.md`.)

## 8. Risiko utama (yang langsung kelihatan)

1. **README link rot** dengan route nyata.
2. **Tidak ada automated test** → regresi tidak terdeteksi.
3. **Spatie roles vs route middleware** — `routes/web.php` line 28 wraps member routes only in `auth` (not `role`), so non-members can theoretically hit `/member/*` until controller-level `$user->hasRole('member')` blocks them. (Diperiksa di `04`.)
4. **Session driver `file`** di `.env` lokal — Vercel tidak akan kompatibel dengan `file` session; `.env.example` sudah benar (database) tetapi `.env` lokal masih `file`. Aman untuk lokal, tapi rawan jika ENV local dipakai sebagai acuan.
5. **Vite build** ada di `public/build/` dan `npm run dev` mendukung HMR — tidak ada yang build di audit ini (sudah built sebelumnya).

---

## 9. Kesimpulan awal

KomunaID v2.0.0-mvp adalah platform Laravel 11 + Breeze + Spatie yang **secara struktural matang**: 11 role, 69 model, 101 migration, 75+ superadmin view, 14 service. Risiko tertinggi bukan fitur yang hilang, melainkan:

* **dokumentasi yang tidak sinkron dengan route** (keruh untuk developer baru),
* **tidak ada automated test** (regression trap),
* **demo password + `local` session driver** di `.env` (bahaya jika di-copy ke production).

Sisa audit di `01_FULL_AUDIT_REPORT.md` s.d. `05_DATABASE_AUDIT.md`.
