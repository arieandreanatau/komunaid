# API Test Report

## Production Architecture Discovery

Evidence shows web app embeds Hono through `apps/web/app/api/[...path]/route.ts`.

- Browser API base URL in `apps/web/lib/api.ts` is same-origin `/api/v1`.
- `apps/web/next.config.js` rewrites `/health` to `/api/health`.
- `https://komuna.my.id/health` returned `{"status":"ok"}` on 2026-08-13.
- `https://komuna.my.id/api/v1/health` returned 404.
- `https://komuna.my.id/api/health` returned 404.
- `https://api.komuna.id/health` was unreachable.

## Decision

Current observed production health contract is `https://komuna.my.id/health`. Documentation claiming `api.komuna.id` or requiring production `/api/v1/health` is stale or deployment-inconsistent. No production routing or DNS change was made.

## Remaining Work

Verify deployed catch-all route and authenticated API paths using dedicated test account in staging before release. Update public deployment documentation after deployment owner confirms canonical production API topology.
