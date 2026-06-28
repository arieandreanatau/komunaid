# 48 — RELEASE NOTES (V3.0-alpha)

## 48.1 Highlights
- All 201 automated tests pass (588 assertions, 90.7 s).
- 60+ documents consolidated under `docs/` covering product, role/permission, data, security, QA, development, deployment, release, and guides.
- Auth flows (register, login, forgot, reset, superadmin login) are functional and unit-tested.
- Public website is reachable at https://komunaidv2-komuna.vercel.app/.
- `/komunitas` and `/blogs` are the canonical public slugs. English aliases `/communities` and `/blog` are now available.
- Login, register, and forgot-password are rate-limited (30/min for login & register, 3/min for forgot-password).
- Top-of-form error summary visible on register and login views.
- Seeders are self-sufficient — `php artisan migrate --seed` works on a fresh DB.

## 48.2 Known issues
- Brand max-3 rule not yet enforced in `BrandController@store` (F-006).
- Community 1st-approval rule not yet enforced in `CommunityController@store` (F-007).
- 3x join/leave rule not yet enforced in member join endpoint (F-008).
- Secure headers (CSP/HSTS/Referrer-Policy) absent (F-010).
- File upload MIME validation is extension-only (F-012).
- Audit log coverage on admin actions is partial (F-011).
- Wallet / payment gateway not integrated (F-017, P3).
- Realtime chat not implemented (F-018, P3).

## 48.3 Removed
- None.

## 48.4 Migration notes
- `php artisan migrate` is a no-op on a clean DB (V1+V2 migrations already present).
- New P1 migrations (F-006..F-012) will arrive in the next sprint.
