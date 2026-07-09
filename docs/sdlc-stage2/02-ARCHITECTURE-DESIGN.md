# 02 — ARCHITECTURE DESIGN

**Date:** 2026-07-09
**Version:** 1.0.0

---

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      CLIENTS                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Browser     │  │   Mobile     │  │   API Client │  │
│  │   (Web App)   │  │   (Future)   │  │   (Future)   │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  │
└─────────┼──────────────────┼──────────────────┼─────────┘
          │                  │                  │
          ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js 15)                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐ │
│  │ App Router│  │ Server   │  │ Client   │  │ Shared │ │
│  │ (SSR/SSG) │  │Components│  │Components│  │ Packages│ │
│  └──────────┘  └──────────┘  └──────────┘  └────────┘ │
│  ┌──────────────────────────────────────────────────┐  │
│  │  State: Zustand + TanStack Query + React Context │  │
│  └──────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────┘
                         │ HTTP (JSON)
                         ▼
┌─────────────────────────────────────────────────────────┐
│                   BACKEND (Hono.js)                      │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Middleware Chain                                 │  │
│  │  CORS → Security → RateLimit → Auth → RBAC →     │  │
│  │  Validate → Route Handler                        │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │  Routes   │  │ Services │  │ Lib      │             │
│  │  (8 mod)  │  │ (audit)  │  │ (resp)   │             │
│  └──────────┘  └──────────┘  └──────────┘             │
└────────────────────────┬────────────────────────────────┘
                         │ Prisma Client
                         ▼
┌─────────────────────────────────────────────────────────┐
│                   DATABASE (MySQL 8.x)                   │
│  ┌──────────────────────────────────────────────────┐  │
│  │  16 Models: User, UserRole, Community,            │  │
│  │  CommunityMember, JoinRequest, Organization,      │  │
│  │  OrganizationMember, Event, EventRegistration,   │  │
│  │  Category, Report, AuditLog, Notification,       │  │
│  │  UserInterest, ActivityHistory, Setting           │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## Layer Architecture

### Layer Separation

```
┌────────────────────────────────────────┐
│           Presentation Layer            │
│  Next.js App Router (SSR/CSR/RSC)      │
│  Pages, Components, Layouts            │
├────────────────────────────────────────┤
│           Application Layer            │
│  Zustand (client state)                │
│  TanStack Query (server state)         │
│  React Context (auth state)            │
├────────────────────────────────────────┤
│           API Layer                     │
│  Hono Routes → Handlers                │
│  Middleware (Auth, RBAC, Validate)      │
├────────────────────────────────────────┤
│           Service Layer                 │
│  AuditService, Future: EmailService    │
├────────────────────────────────────────┤
│           Data Access Layer             │
│  Prisma Client (ORM)                   │
│  Repository Pattern (planned)          │
├────────────────────────────────────────┤
│           Database Layer                │
│  MySQL 8.x                             │
└────────────────────────────────────────┘
```

---

## Monorepo Structure

```
komunaid/
├── apps/
│   ├── api/                    @komunaid/api
│   │   ├── prisma/
│   │   │   ├── schema.prisma   (Prisma schema)
│   │   │   └── seed.ts         (Seed data)
│   │   └── src/
│   │       ├── index.ts        (Hono entry point)
│   │       ├── middleware/     (auth, rbac, security, validate)
│   │       ├── routes/         (8 route modules)
│   │       ├── services/       (audit)
│   │       └── lib/            (response, logger)
│   └── web/                    @komunaid/web
│       ├── app/                (Next.js App Router)
│       ├── components/         (providers, auth-provider)
│       ├── lib/                (api client, auth store)
│       └── middleware.ts       (route protection)
├── packages/
│   ├── constants/              @komunaid/constants
│   ├── database/               @komunaid/database
│   │   └── prisma/             (schema, seed)
│   ├── shared/                 @komunaid/shared
│   │   └── src/                (Zod schemas + types)
│   ├── ui/                     @komunaid/ui
│   │   └── src/                (Button, Card, Input)
│   └── utils/                  @komunaid/utils
│       └── src/                (slug, format, sanitize)
└── docs/
    ├── sdlc-stage1/            (Requirements)
    └── sdlc-stage2/            (System Design)
```

---

## Data Flow Diagrams

### Authentication Flow

```
Browser                    API (Hono)              Database
  │                           │                       │
  │  POST /auth/register      │                       │
  │  {name, email, password}  │                       │
  ├──────────────────────────►│                       │
  │                           │  Validate (Zod)       │
  │                           │  Hash password        │
  │                           │  INSERT User          │
  │                           ├──────────────────────►│
  │                           │  INSERT UserRole      │
  │                           ├──────────────────────►│
  │                           │  Generate JWT pair    │
  │                           │  INSERT AuditLog      │
  │                           ├──────────────────────►│
  │  Set-Cookie: access_token │                       │
  │  Set-Cookie: refresh_token│                       │
  │◄──────────────────────────┤                       │
  │  201 {user, tokens}       │                       │
```

### Community Join Flow (RESTRICTED)

```
Member                    API                    CommunityAdmin
  │                         │                        │
  │ POST /communities/:id/join│                       │
  ├────────────────────────►│                        │
  │                         │ Check membership type   │
  │                         │ → RESTRICTED            │
  │                         │ INSERT JoinRequest      │
  │                         │ (status=PENDING)        │
  │  201 {request}          │                        │
  │◄────────────────────────┤                        │
  │                         │                        │
  │                         │    GET /communities/:id/join-requests
  │                         │◄───────────────────────┤
  │                         │    200 {requests}       │
  │                         │───────────────────────►│
  │                         │                        │
  │                         │  PUT /communities/:id/join-requests/:rid
  │                         │  {status: APPROVED}    │
  │                         │◄───────────────────────┤
  │                         │ INSERT CommunityMember  │
  │                         │ UPDATE JoinRequest      │
  │                         │ INSERT AuditLog         │
  │                         │  200 {success}          │
  │                         │───────────────────────►│
```

### Event Registration Flow

```
Member                    API                     EventManager
  │                         │                        │
  │ POST /events/:id/register│                       │
  ├────────────────────────►│                        │
  │                         │ Check event status     │
  │                         │ Check quota            │
  │                         │ Count registrations    │
  │                         │ IF quota > count:      │
  │                         │   status = CONFIRMED   │
  │                         │ ELSE:                  │
  │                         │   status = WAITLISTED  │
  │                         │ INSERT EventRegistration│
  │                         │ INSERT AuditLog         │
  │  200 {registration}     │                        │
  │◄────────────────────────┤                        │
```

---

## Repository Pattern (Planned)

```
┌─────────────────────────────────────────┐
│              Route Handler               │
├─────────────────────────────────────────┤
│           Service Layer                  │
│  (Business logic, validation)           │
├─────────────────────────────────────────┤
│          Repository Layer                │
│  ┌──────────┐ ┌──────────────────────┐  │
│  │ UserRepo  │ │ CommunityRepo        │  │
│  │ EventRepo │ │ OrganizationRepo     │  │
│  │ ReportRepo│ │ NotificationRepo     │  │
│  └──────────┘ └──────────────────────┘  │
├─────────────────────────────────────────┤
│           Prisma Client                  │
│  (Direct query in current implementation)│
└─────────────────────────────────────────┘
```

**Current State:** Routes use Prisma directly.
**Planned:** Extract repository layer for testability and separation of concerns.

---

## Error Handling Architecture

### Global Error Handler

```
Request → Middleware → Route Handler
                          │
                          ▼ (error thrown)
                   Global Error Handler
                          │
                          ▼
              ┌───────────────────────┐
              │ UnauthorizedException  │ → 401
              │ ForbiddenException     │ → 403
              │ NotFoundException      │ → 404
              │ ValidationException    │ → 422
              │ AppError              │ → 400/500
              │ UnknownError          │ → 500
              └───────────────────────┘
```

### Response Format

```json
// Success
{
  "success": true,
  "message": "...",
  "data": { ... }
}

// Error
{
  "success": false,
  "message": "...",
  "errors": { ... }
}

// Paginated
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

---

## Caching Strategy

| Data Type | Strategy | TTL |
|-----------|----------|-----|
| Public pages (SSG) | Next.js ISR | 60s staleTime |
| API list responses | TanStack Query | 60s staleTime |
| Auth state | Zustand + cookie | Session |
| Audit logs | No cache (immutable) | — |
| Settings | No cache (volatile) | — |

---

## Performance Design

| Strategy | Implementation |
|----------|---------------|
| Server-Side Rendering | Next.js App Router (landing, static pages) |
| Client-Side Rendering | React Client Components (dashboard, forms) |
| Database Indexes | Indexes on userId, communityId, status, slug |
| Pagination | Default 20, max 100 per page |
| Image Optimization | Next.js remotePatterns for external images |
| Code Splitting | Next.js automatic splitting per route |
| Bundle Optimization | pnpm workspaces, shared packages |

---

*Document generated: 2026-07-09*
*Stage: SDLC Stage 2 — System Analysis & Solution Design*
