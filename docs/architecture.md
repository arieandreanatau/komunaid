# Architecture

## Overview

KomunaID is a **pnpm monorepo** connecting individuals, communities, organizations, and events into a collaborative platform.

```
komunaid/
├── apps/
│   ├── api/            NestJS REST API (port 4000)
│   └── web/            Next.js frontend (port 3000)
├── packages/
│   ├── shared/         Types, constants, validators, utils (zod)
│   └── database/       Prisma schema, migrations, seed
├── tools/              Build/dev tooling
├── docs/               Project documentation
└── .github/workflows/  CI/CD pipelines
```

## Packages

| Package             | Name                 | Purpose                                                        |
| ------------------- | -------------------- | -------------------------------------------------------------- |
| `apps/api`          | `@komunaid/api`      | NestJS backend — auth, business logic, REST endpoints          |
| `apps/web`          | `@komunaid/web`      | Next.js 15 frontend — SSR, React Query, Tailwind + shadcn/ui   |
| `packages/shared`   | `@komunaid/shared`   | Shared TypeScript types, Zod validators, RBAC utils, constants |
| `packages/database` | `@komunaid/database` | Prisma schema, migrations, seed script, singleton client       |

## API Module Structure (`apps/api/src`)

```
src/
├── main.ts                     Bootstrap, Swagger, global pipes, CORS
├── app.module.ts               Root module — imports all feature modules
├── common/
│   ├── config/                 ConfigModule setup
│   ├── decorators/             @CurrentUser, @Roles, @ScopedPermission
│   ├── dto/                    Shared DTOs
│   ├── email/                  EmailAdapter interface + SMTP/Console adapters
│   ├── filters/                Exception filters
│   ├── guards/                 AuthGuard, RolesGuard, ScopedPermissionGuard
│   ├── interceptors/           AuditLogInterceptor, TransformResponseInterceptor
│   ├── middleware/              RequestIdMiddleware (x-request-id)
│   └── prisma/                 PrismaModule, PrismaService
└── modules/
    ├── auth/                   Register, login, refresh, forgot/reset password
    ├── users/                  User profile CRUD
    ├── communities/            Community CRUD, membership, approval
    ├── organizations/          Organization CRUD, membership, approval
    ├── events/                 Event CRUD, registration, approval
    ├── posts/                  Community posts
    ├── categories/             Category management
    ├── notifications/          User notifications
    ├── reports/                Content reporting
    ├── admin/                  Dashboard, user mgmt, role assignment, audit logs
    └── contact/                Contact form messages
```

## Module Boundaries

- Each feature module owns its own `controller → service → DTO` stack.
- Shared infrastructure lives in `common/` (guards, interceptors, Prisma, email).
- `@komunaid/shared` is the **only** cross-package dependency for types and validation.
- `@komunaid/database` provides the Prisma client singleton and schema — consumed by `apps/api`.
- `@komunaid/web` depends only on `@komunaid/shared` for types and validators.

## Data Flow

```
Client (Next.js)  ──HTTP──▶  API (NestJS)  ──ORM──▶  MySQL (Prisma)
                                  │
                          ┌───────┴───────┐
                          │  Guards        │ AuthGuard → JWT verify → attach user
                          │  Interceptors  │ AuditLog, TransformResponse
                          │  Pipes         │ ValidationPipe (whitelist + transform)
                          └───────────────┘
```

1. Request hits NestJS global prefix `/api/v1`.
2. `RequestIdMiddleware` stamps `x-request-id`.
3. `AuthGuard` verifies JWT, loads user + roles from DB.
4. `RolesGuard` / `ScopedPermissionGuard` check RBAC.
5. Controller delegates to Service.
6. Service uses PrismaService for DB operations.
7. `TransformResponseInterceptor` wraps output in `{ success, data, message, meta }`.
8. `AuditLogInterceptor` records mutations for admin audit trail.

## Key Design Decisions

- **MySQL** over PostgreSQL — team preference, hosted on managed MySQL 8.
- **JWT access + refresh tokens** — stateless auth, refresh token for long-lived sessions.
- **Scoped roles** — `UserRoleAssignment` supports `scope` (COMMUNITY/ORGANIZATION/PLATFORM) + `scopeId` for fine-grained permissions.
- **Soft deletes** — `deletedAt` on User, Community, Organization, Event, Post.
- **Slug-based routing** — communities, organizations, events, and posts use slugs as public identifiers.
