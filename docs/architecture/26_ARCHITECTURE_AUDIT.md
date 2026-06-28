# 26 — ARCHITECTURE AUDIT

| Layer | Current | Target | Gap | Severity |
|---|---|---|---|---|
| Routing | `routes/web.php` is a single file | Module-prefixed route files (already partial) | Already grouped by `prefix`; OK | Low |
| Controllers | `app/Http/Controllers/{Module}` | Per module | Good | Low |
| Models | `app/Models` flat | Module subfolders if large | 69 models — accept flat for now | Low |
| FormRequest | Per-route validation classes | Per-route | Good | Low |
| Middleware | `web` group, `auth`, `verified`, `role`-like custom | Add `throttle:5,1` on login | Add in P1 | Medium |
| Policy | Per model | Per model | Mixed coverage; verify | Medium |
| Service | `app/Services/Auth/RedirectByRoleService` | Module services | Good | Low |
| Repository | None | None (use Eloquent directly) | OK for MVP | Low |
| View | `resources/views/{module}` | Module subfolders | OK | Low |
| Layouts | `app.blade.php`, `guest.blade.php`, `admin.blade.php` | Tailwind v4 theme | OK | Low |
| Asset | Vite + Tailwind v4 inline theme | OK | Add PWA manifest | Low |
| Error handling | Custom 403/404 | OK | OK | Low |
| Logging | stack / single | OK | OK | Low |
| Config | `config/*` | OK | OK | Low |
| Test | 201 tests, all green | Increase coverage on P2 features | Add P2 tests | Low |

## 26.1 Strengths
- Comprehensive migrations covering V1 + V2.
- 201/201 tests green after fixing test DB.
- Brand identity consistent (Tailwind v4 `@theme`).
- Public page on Vercel serves 200.

## 26.2 Weaknesses
- No centralized roles/permissions seeder for production.
- Login throttling not applied to `/login`.
- `/communities` and `/blog` 404 on live.
- Wallet / payment module is schema-only.
- Realtime chat not implemented.
