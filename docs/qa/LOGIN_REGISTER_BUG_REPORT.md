# KomunaID V2 — Login / Register Bug Report

## Status

Login and register on Vercel are **functional**. The original report "login/register tidak bisa" was a combination of three issues, none of which were a true auth/database/CSRF/Vercel-runtime failure.

## 1. Login Field Name Confusion (root cause of most user complaints)

The login form uses `name="login"` for the email-or-username field (not `name="email"`). This is intentional: a single field accepts either identifier. The LiveTester must use:

```
POST /login
_token=<csrf>
login=<email or username>
password=<password>
```

Submitting only `email=...` (omitting `login=...`) correctly returns:

```
HTTP/1.1 302 Found
Location: /login
```

and the page re-renders with the error **"Email atau username wajib diisi."**

**Fix (UX, not bug):** keep the form's `name="login"` (it is the more inclusive design), but add a small note above the field that says "Gunakan email atau username" (already present in the placeholder) and verify the validation error is rendered. The error is already shown in red via `text-komuna-danger` on the re-rendered GET — confirmed live.

## 2. Superadmin Dashboard Rendering Bug (B1)

### Symptom (live, before fix)

In `/superadmin/dashboard` the "Latest Users" and "Latest Communities" tables rendered literal Blade text in some `<td>` cells:

```html
<td class="px-4 py-3">@include("superadmin.partials.status-badge", ["status" => "active"])</td>
```

Rows for `banned` and `rejected` rendered the correct badge. Rows for `active` did not.

### Root cause

`resources/views/superadmin/partials/status-badge.blade.php` was authored as a Blade **component** (uses `@props(['status' => 'active'])` and a `@php` block that runs `match($status)`). However, every call site (22+ files) used `@include('superadmin.partials.status-badge', ['status' => ...])`, not `<x-superadmin.partials.status-badge :status="..." />`.

The `@props` directive is only valid in a component class / anonymous component / `<x-tag>`-rendered view. When `@include` evaluates the file, the `@props` directive is left unparsed. On PHP 8.2 + Laravel 11.54 + Vercel serverless, the resulting unparsed directive can either:
- silently fall through (the variable is `null` and the file is dropped — which produced the literal `@include` text in the output), or
- throw a Blade compilation error that is swallowed by the catch-all Laravel exception handler (returning an empty cell).

### Fix applied

Removed `@props` from the partial and let it read `$status` from the `@include` data scope. All 22 call sites are unchanged.

```blade
@php
    $status = $status ?? 'active';
    $styles = match($status) { ... };
@endphp
<span class="... rounded-full text-xs font-medium border {{ $styles }}">
    {{ ucfirst((string) $status) }}
</span>
```

### Verification

After redeploy: dashboard returns 5 `bg-[#16A34A]/10` (green active) badge spans and 0 leaked `@include` strings.

## 3. Register

No bug. POST `/register` with valid fields returns 302 → `/onboarding`, user is created, session is persisted, and the new user appears in `superadmin/dashboard` "Latest Users" within the same Vercel function run.

## 4. CSRF, Session, Cookie

- `XSRF-TOKEN` and `komunaid_session` cookies set on GET `/login`.
- CSRF token validated on POST (no 419 responses observed).
- Session driver `database` works on Vercel (per `.env.production` + `api/index.php` redirecting `storage/framework/sessions` to `/tmp/storage/framework/sessions`).
- Cookie domain / path: not explicitly set in `.env.production`; defaults are correct for the apex domain.

## 5. Database

- `DB_CONNECTION=mysql` against `srv1761.hstgr.io` works from Vercel (login + register both write rows).
- Tables seeded (superadmin, member, community.owner, brand.owner, company.owner, banned, suspended demo accounts + 13 communities + 3 blog posts) — all visible in superadmin dashboard.
- `sessions` table populated.

## 6. What was NOT a bug

- "Tidak ada pesan error" — actually the error IS shown (`text-komuna-danger` red text) but only after the redirect. In some scenarios where the user landed on the page from a stale tab, the form action POSTed to an old URL. Not seen during audit.
- Vercel cold start latency (1.5–3 s on first hit) — normal for serverless, not a bug.
