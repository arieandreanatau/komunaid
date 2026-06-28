# 02 — LIVE VERCEL AUDIT

URL: https://komunaidv2-komuna.vercel.app/
Date: 2026-06-27
Method: HTTP HEAD/GET via curl with redirect following. No credentials used.

## Route status matrix

| # | Page/Flow | URL | Expected | Actual | Status | Evidence | Suspected Cause | Priority | Action |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Landing | `/` | Public 200 + brand hero | 200, hero, communities grid, blog preview, footer present | OK | curl | — | — | — |
| 2 | Login | `/login` | Form with email/username + password | 200, form rendered with field "Email atau Username" | OK | curl | — | — | — |
| 3 | Register | `/register` | Form with name/username/email/password/confirm | 200, form rendered | OK | curl | — | — | — |
| 4 | Forgot password | `/forgot-password` | Form + email | 200, form rendered | OK | curl | — | — | — |
| 5 | Reset password | `/reset-password/{token}` | Form to set new password | 200 (template loads even with bogus token) | OK | curl | — | — | — |
| 6 | Communities | `/komunitas` (actual) | Public directory | 200, full filter + search + 11 communities | OK | curl | Actual route uses Indonesian slug `/komunitas`; `/communities` returns 404 because no alias exists | P3 | Add `/communities` and `/blog` aliases for international/SEO friendliness |
| 6b | Communities alias | `/communities` | Public directory | **404** | FAIL | curl | No alias; original implementation uses Indonesian slug only | P3 | Add 301 alias `/communities → /komunitas` |
| 7 | Events | `/events` | Public event directory | 200, page rendered | OK | curl | — | — | — |
| 8 | Blog | `/blogs` (actual) | Public blog index | 200, full filter + 4 articles | OK | curl | Actual route uses `/blogs` (plural); `/blog` returns 404 because no alias | P3 | Add `/blog` alias |
| 8b | Blog alias | `/blog` | Public blog index | **404** | FAIL | curl | No alias; `/blog` singular missing | P3 | Add 301 alias `/blog → /blogs` |
| 9 | About | `/about` | Public about | 200 | OK | curl | — | — | — |
| 10 | Contact | `/contact` | Public contact | 200 | OK | curl | — | — | — |
| 11 | Admin login | `/admin/login` | Superadmin login form | 200 | OK | curl | — | — | — |
| 12 | Superadmin login | `/superadmin/login` | Superadmin login | **404** | FAIL | curl | The actual route is `admin.login` (path `/admin/login`); `/superadmin/login` does not exist | LOW | Document canonical URL; either keep `/admin/login` only or alias `/superadmin/login` to it |
| 13 | Onboarding (guest) | `/onboarding` | Redirect to login | 302 → `/login` | OK | curl | Auth middleware enforced (correct) | — | — |

## Behavioral observations from public landing
- Brand "KomunaID — Connect, Community, Grow" displays.
- Tagline "CONNECT • COMMUNITY • GROW" appears in footer.
- Navbar shows: Beranda, Komunitas, Events, Blog, Tentang Kami, Hubungi Kami.
- Recommended Communities section shows 6 seeded communities (Laravel Indonesia, React Jakarta, Startup Bandung, UI/UX Surabaya, Running Jakarta, DevOps Indonesia) with city/online labels, category, member count.
- "Cara Kerja KomunaID" 5-step block present.
- Dual CTA section: "Untuk Komunitas" / "Untuk Brand & Perusahaan".
- Blog list shows 3 latest articles with author "Super Admin".
- Suggestion form "Punya Saran untuk KomunaID?" present.
- Language switcher visible (Bahasa Indonesia / English).

## Issues that can only be confirmed with credentials
- Real login success on production DB.
- Real register flow on production DB.
- Role-redirect on production.
- Superadmin approval flow on production.
- File upload (community logo, event gallery) on production storage.
- Real transactional email (forgot-password reset link).

**Action**: ask the project owner for a non-production demo account for full UAT, or run the full role-based UAT against local + DB snapshot.

## Recommended follow-ups
| ID | Item | Priority | Owner |
|---|---|---|---|
| LIVE-001 | Add `/communities` and `/blog` routes to public website | P1 | dev |
| LIVE-002 | Add `superadmin/login → admin/login` redirect or alias | P3 | dev |
| LIVE-003 | Add top-of-form error summary to register and login views | P1 | dev |
| LIVE-004 | Add `og:image` and `twitter:card` for landing | P2 | dev |
| LIVE-005 | Add sitemap.xml route for public SEO | P2 | dev |
