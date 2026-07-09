# 10 — INTEGRATION DESIGN

**Date:** 2026-07-09
**Version:** 1.0.0

---

## Integration Overview

| Integration | Type | Status | Priority |
|-------------|------|--------|----------|
| API ↔ Database (Prisma) | Internal | ✅ Active | Critical |
| Web ↔ API (Axios) | Internal | ✅ Active | Critical |
| Web ↔ API (Cookies) | Internal | ✅ Active | Critical |
| Shared Schemas | Internal | ✅ Active | Critical |
| Email Service | External | 🔲 Planned | High |
| File Upload | External | 🔲 Planned | Medium |
| Analytics | External | 🔲 Planned | Low |

---

## Internal Integrations

### API ↔ Database

```
Technology: Prisma Client 6.9
Connection: MySQL via DATABASE_URL
Pattern: Direct Prisma queries in route handlers
Connection Pool: Prisma default (5 + 10 * num_cores)

Migration: prisma migrate dev/deploy
Seed: prisma db seed
Generate: prisma generate
```

### Web ↔ API

```
Technology: Axios instance (apps/web/lib/api.ts)
Base URL: NEXT_PUBLIC_API_URL
Auth: Bearer token from httpOnly cookie
Timeout: Default (no explicit timeout set)
Error Handling: 401 → redirect to /login

Request Interceptor:
  - Read token from cookie (js-cookie)
  - Set Authorization: Bearer <token>

Response Interceptor:
  - IF 401: clear cookies, redirect to /login
  - IF success: return response.data
```

### Shared Packages

```
@komunaid/shared
  - Zod schemas (validation)
  - TypeScript type exports
  - Used by: API (validation), Web (form validation)
  - Path: packages/shared/src/index.ts

@komunaid/constants
  - API_VERSION, API_PREFIX
  - Pagination defaults
  - APP_NAME, APP_URL, API_URL
  - MAX_UPLOAD_SIZE, ALLOWED_IMAGE_TYPES
  - Used by: API, Web

@komunaid/utils
  - createSlug()
  - formatNumber()
  - sanitizeHtml()
  - Used by: API (slug generation), Web (display)

@komunaid/ui
  - Button, Card, Input components
  - Used by: Web
  - Path: packages/ui/src/
```

---

## External Integrations (Planned)

### Email Service

```
Purpose: Password reset emails, notification emails
Options:
  1. SMTP (Nodemailer) — self-hosted
  2. SendGrid — cloud
  3. Resend — modern API

Recommended: Resend (simple API, free tier)

Integration Point:
  - POST /auth/forgot-password → generate token → send email
  - Community/Event notifications → batch email

Configuration:
  RESEND_API_KEY=...
  EMAIL_FROM=noreply@komunaid.com
```

### File Upload

```
Purpose: Avatar, cover image, logo uploads
Options:
  1. Local filesystem (storage/)
  2. Cloudinary
  3. AWS S3
  4. Uploadthing

Recommended: Cloudinary (free tier, image optimization)

Integration Point:
  - User avatar upload
  - Community cover image + logo
  - Organization logo
  - Event cover image

Configuration:
  CLOUDINARY_CLOUD_NAME=...
  CLOUDINARY_API_KEY=...
  CLOUDINARY_API_SECRET=...
```

### Analytics (Future)

```
Purpose: Platform usage analytics
Options:
  1. Google Analytics 4
  2. Plausible
  3. Custom analytics (AuditLog based)

Recommended: Custom (leverage existing AuditLog)

Integration Point:
  - AuditLog aggregation queries
  - User activity metrics
  - Community/event growth tracking
```

---

## Package Dependencies

### @komunaid/api

```
Dependencies:
  hono                          ^4.7.0
  @hono/node-server            ^1.14.0
  @prisma/client                ^6.9.0
  jose                          ^6.0.11
  bcryptjs                      ^3.0.2
  zod                           ^3.24.0
  pino                          ^9.6.0
  pino-pretty                   ^13.0.0
  cors                          ^2.8.5

DevDependencies:
  prisma                        ^6.9.0
  typescript                    ^5.8.0
  @types/node
  @types/cors
  @types/bcryptjs
  tsx                           ^4.19.0
```

### @komunaid/web

```
Dependencies:
  next                          ^15.1.0
  react                         ^19.0.0
  react-dom                     ^19.0.0
  @tanstack/react-query         ^5.64.0
  zustand                       ^5.0.3
  axios                         ^1.7.0
  js-cookie                     ^3.0.5
  react-hook-form               ^7.54.0
  @hookform/resolvers           ^3.9.0
  zod                           ^3.24.0
  tailwindcss                   ^3.4.0
  tailwindcss-animate           ^1.0.7
  class-variance-authority      ^0.7.0
  clsx                          ^2.1.0
  tailwind-merge                ^2.6.0

DevDependencies:
  typescript                    ^5.8.0
  @types/node
  @types/react
  @types/react-dom
  autoprefixer                  ^10.4.0
  postcss                       ^8.4.0
```

---

## Inter-Package Communication

```
┌──────────────┐    imports     ┌──────────────┐
│  @komunaid/  │◄──────────────│  @komunaid/  │
│    shared    │                │     api      │
└──────────────┘                └──────────────┘
       ▲                              │
       │ imports                      │ imports
       │                              ▼
┌──────────────┐                ┌──────────────┐
│  @komunaid/  │                │  @komunaid/  │
│     web      │                │  database    │
└──────────────┘                └──────────────┘
       │                              │
       │ imports                      │ imports
       ▼                              ▼
┌──────────────┐                ┌──────────────┐
│  @komunaid/  │                │   Prisma     │
│    ui        │                │   Client     │
└──────────────┘                └──────────────┘
```

### Import Rules

| Package | Can Import From |
|---------|----------------|
| @komunaid/api | @komunaid/shared, @komunaid/constants, @komunaid/utils, @komunaid/database |
| @komunaid/web | @komunaid/shared, @komunaid/constants, @komunaid/utils, @komunaid/ui |
| @komunaid/shared | zod (external only) |
| @komunaid/constants | — (no imports) |
| @komunaid/utils | — (no imports) |
| @komunaid/ui | react, tailwind-merge, clsx, cva |

---

## API Versioning Strategy

```
Current: /api/v1/*
Future:  /api/v2/* (when breaking changes needed)

Strategy:
  - URL path versioning (/api/v1/, /api/v2/)
  - Both versions run simultaneously during migration
  - Old version deprecated with 6-month notice
  - Client update required before old version removal
```

---

## Error Propagation

```
Prisma Error → Route Handler → Global Error Handler → Client
                  │
                  ├─ PrismaClientKnownRequestError → mapped to AppError
                  ├─ PrismaClientValidationError → 400
                  └─ UnknownError → 500

Axios Error → Web App → Error Display
                  │
                  ├─ 401 → redirect to /login
                  ├─ 403 → show "Akses ditolak"
                  ├─ 404 → show "Tidak ditemukan"
                  ├─ 422 → show validation errors
                  └─ 500 → show "Terjadi kesalahan"
```

---

*Document generated: 2026-07-09*
*Stage: SDLC Stage 2 — System Analysis & Solution Design*
