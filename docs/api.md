# API Reference

## Overview

- **Base URL**: `http://localhost:4000/api/v1`
- **Format**: JSON
- **Swagger**: `http://localhost:4000/api/docs`
- **Auth**: Bearer JWT (access token in `Authorization` header)

## Authentication Flow

```
1. POST /auth/register   → { user, accessToken, refreshToken }
2. POST /auth/login      → { user, accessToken, refreshToken }
3. POST /auth/refresh     → { accessToken, refreshToken }
4. POST /auth/logout      (requires access token)
```

- **Access token**: Short-lived (`JWT_EXPIRES_IN`, default 15m). Sent as `Authorization: Bearer <token>`.
- **Refresh token**: Long-lived (`REFRESH_TOKEN_EXPIRES_IN`, default 30d). Used to obtain new access tokens.
- **Password reset**: `POST /auth/forgot-password` → email with reset link → `POST /auth/reset-password` with token.

## Response Format

All responses follow a consistent envelope:

```jsonc
// Success (single resource)
{
  "success": true,
  "data": { "id": "...", "email": "..." },
  "message": "Success"
}

// Success (paginated list)
{
  "success": true,
  "data": [ ... ],
  "message": "Success",
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}

// Error
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "email": ["Email is required"]
  }
}
```

## Pagination

All list endpoints accept query parameters:

| Param    | Type   | Default  | Description                                      |
| -------- | ------ | -------- | ------------------------------------------------ |
| `page`   | number | `1`      | Page number (1-indexed)                          |
| `limit`  | number | `20`     | Items per page (max 100)                         |
| `search` | string | —        | Full-text search query                           |
| `sort`   | string | `newest` | Sort key (`newest`, `oldest`, `name`, `popular`) |

Example:

```
GET /api/v1/communities?page=2&limit=10&search=tech&sort=popular
```

## Error Handling

| Status | Meaning                                         |
| ------ | ----------------------------------------------- |
| 400    | Bad Request — validation error or invalid input |
| 401    | Unauthorized — missing/invalid/expired token    |
| 403    | Forbidden — insufficient permissions            |
| 404    | Not Found — resource doesn't exist              |
| 409    | Conflict — duplicate email/username/slug        |
| 422    | Unprocessable Entity — business rule violation  |
| 500    | Internal Server Error                           |

## Endpoint List

### Auth

| Method | Endpoint                | Auth | Description                  |
| ------ | ----------------------- | ---- | ---------------------------- |
| POST   | `/auth/register`        | No   | Register new user            |
| POST   | `/auth/login`           | No   | Login with email + password  |
| POST   | `/auth/refresh`         | No   | Refresh access token         |
| POST   | `/auth/logout`          | Yes  | Logout                       |
| POST   | `/auth/forgot-password` | No   | Request password reset email |
| POST   | `/auth/reset-password`  | No   | Reset password with token    |

### Users

| Method | Endpoint           | Auth | Description              |
| ------ | ------------------ | ---- | ------------------------ |
| GET    | `/users/me`        | Yes  | Get current user profile |
| PATCH  | `/users/me`        | Yes  | Update own profile       |
| GET    | `/users/:username` | No   | Get public user profile  |

### Communities

| Method | Endpoint                                     | Auth  | Description                      |
| ------ | -------------------------------------------- | ----- | -------------------------------- |
| GET    | `/communities`                               | No    | List communities (paginated)     |
| GET    | `/communities/:slug`                         | No    | Get community by slug            |
| POST   | `/communities`                               | Yes   | Create community                 |
| PATCH  | `/communities/:id`                           | Yes   | Update community (owner)         |
| DELETE | `/communities/:id`                           | Yes   | Delete community (owner)         |
| POST   | `/communities/:id/join`                      | Yes   | Join community                   |
| POST   | `/communities/:id/leave`                     | Yes   | Leave community                  |
| POST   | `/communities/:id/members/:memberId/approve` | Yes   | Approve member (owner)           |
| POST   | `/communities/:id/members/:memberId/reject`  | Yes   | Reject member (owner)            |
| PATCH  | `/communities/:id/status`                    | Admin | Approve/reject/suspend community |

### Organizations

| Method | Endpoint                    | Auth  | Description                 |
| ------ | --------------------------- | ----- | --------------------------- |
| GET    | `/organizations`            | No    | List organizations          |
| GET    | `/organizations/:slug`      | No    | Get organization by slug    |
| POST   | `/organizations`            | Yes   | Create organization         |
| PATCH  | `/organizations/:id`        | Yes   | Update organization (owner) |
| POST   | `/organizations/:id/join`   | Yes   | Join organization           |
| POST   | `/organizations/:id/leave`  | Yes   | Leave organization          |
| PATCH  | `/organizations/:id/status` | Admin | Approve/reject/suspend      |

### Events

| Method | Endpoint               | Auth  | Description          |
| ------ | ---------------------- | ----- | -------------------- |
| GET    | `/events`              | No    | List events          |
| GET    | `/events/:slug`        | No    | Get event by slug    |
| POST   | `/events`              | Yes   | Create event         |
| PATCH  | `/events/:id`          | Yes   | Update event         |
| POST   | `/events/:id/register` | Yes   | Register for event   |
| POST   | `/events/:id/cancel`   | Yes   | Cancel registration  |
| PATCH  | `/events/:id/status`   | Admin | Approve/reject event |

### Posts

| Method | Endpoint              | Auth | Description                |
| ------ | --------------------- | ---- | -------------------------- |
| GET    | `/posts?communityId=` | No   | List posts for a community |
| POST   | `/posts`              | Yes  | Create post                |
| PATCH  | `/posts/:id`          | Yes  | Update post                |
| DELETE | `/posts/:id`          | Yes  | Delete post                |

### Categories

| Method | Endpoint      | Auth | Description     |
| ------ | ------------- | ---- | --------------- |
| GET    | `/categories` | No   | List categories |

### Admin

| Method | Endpoint                   | Auth  | Description                     |
| ------ | -------------------------- | ----- | ------------------------------- |
| GET    | `/admin/dashboard/stats`   | Admin | Dashboard statistics            |
| GET    | `/admin/users`             | Admin | List users with management info |
| PATCH  | `/admin/users/:id/suspend` | Admin | Suspend/unsuspend user          |
| POST   | `/admin/roles/assign`      | Admin | Assign role to user             |
| GET    | `/admin/audit-logs`        | Admin | Query audit logs                |
| GET    | `/admin/settings`          | Admin | Get platform settings           |
| PATCH  | `/admin/settings`          | Admin | Update platform settings        |

### Notifications

| Method | Endpoint                  | Auth | Description             |
| ------ | ------------------------- | ---- | ----------------------- |
| GET    | `/notifications`          | Yes  | List user notifications |
| PATCH  | `/notifications/:id/read` | Yes  | Mark as read            |
| PATCH  | `/notifications/read-all` | Yes  | Mark all as read        |

### Reports

| Method | Endpoint         | Auth  | Description     |
| ------ | ---------------- | ----- | --------------- |
| POST   | `/reports`       | Yes   | Submit a report |
| GET    | `/admin/reports` | Admin | List reports    |

### Contact

| Method | Endpoint   | Auth | Description            |
| ------ | ---------- | ---- | ---------------------- |
| POST   | `/contact` | No   | Submit contact message |
