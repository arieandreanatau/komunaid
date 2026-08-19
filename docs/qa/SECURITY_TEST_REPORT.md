# Security Test Report

## Fixed and Tested

- Untrusted `X-Forwarded-For`/`X-Real-IP` ignored unless `TRUSTED_PROXIES=true`.
- Refresh token single-use consume is conditional and transaction-scoped.
- Platform admin cannot mutate platform-level target accounts through suspend, activate, archive, or restore routes.
- Global web error boundary no longer displays raw exception message.

## Open

- Community media public/private/draft authorization regression blocked by active route work.
- Organization public detail private/deleted event regression blocked by active route work.
- Dependency audit: 7 high findings.
- Real MySQL concurrent refresh verification unavailable.

## Production Non-Destructive Check

- `https://komuna.my.id/health`: `200`, `{"status":"ok"}`.
- `https://komuna.my.id/api/v1/health`: `404`.
- No production mutation or security attack was performed.
