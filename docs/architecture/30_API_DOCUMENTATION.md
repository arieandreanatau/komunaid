# 30 — API DOCUMENTATION (V3.0 internal)

## Public API (Phase 3)
- `GET /api/v1/communities?region=&category=&page=` — public community directory.
- `GET /api/v1/communities/{slug}` — public community detail.
- `GET /api/v1/events?region=&type=&page=` — public event directory.
- `GET /api/v1/events/{slug}` — public event detail.
- `GET /api/v1/blog?page=` — public blog.
- `POST /api/v1/contact` — contact form.

## Authenticated API
- `POST /api/v1/auth/login` — JSON login, returns token.
- `POST /api/v1/auth/logout`
- `POST /api/v1/auth/register`
- `GET /api/v1/me`
- `PATCH /api/v1/me`
- `POST /api/v1/communities/{slug}/join`
- `DELETE /api/v1/communities/{slug}/leave`
- `POST /api/v1/events/{slug}/register`
- `GET /api/v1/notifications`
- `POST /api/v1/notifications/{id}/read`

## Admin API
- `GET /api/v1/admin/communities?status=pending`
- `POST /api/v1/admin/communities/{id}/approve`
- `POST /api/v1/admin/communities/{id}/reject`
- (Same pattern for brand, company, role-request, event, user, audit)

All API endpoints require a Bearer token (Sanctum) and enforce the same backend policies as web.
