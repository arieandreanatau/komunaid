# KomunaID Coding Standards

This document defines the coding standards, naming conventions, and maintainability guidelines for the KomunaID platform. All contributors must follow these standards to ensure consistency across the codebase.

---

## Table of Contents

1. [TypeScript Standards](#1-typescript-standards)
2. [Naming Conventions](#2-naming-conventions)
3. [File Organization](#3-file-organization)
4. [API Conventions](#4-api-conventions)
5. [Git Conventions](#5-git-conventions)
6. [Error Handling](#6-error-handling)
7. [Security Conventions](#7-security-conventions)
8. [Formatting & Linting](#8-formatting--linting)

---

## 1. TypeScript Standards

The root `tsconfig.json` enforces `strict: true`. All code must adhere to strict TypeScript mode.

### 1.1 Strict Mode

- **Always enabled.** No `@ts-ignore` or `@ts-expect-error` without a linked issue and explanatory comment.
- Use `unknown` instead of `any` when the type is genuinely not known. Cast or narrow with type guards.
- Prefer `as const` assertions for literal unions and enum-like objects instead of TypeScript `enum`.

```typescript
// Good
const ROLES = ['SUPER_ADMIN', 'PLATFORM_ADMIN', 'USER'] as type;
type Role = (typeof ROLES)[number];

// Avoid
enum Roles {
  SuperAdmin = 'SUPER_ADMIN',
  // ...
}
```

### 1.2 Types vs Interfaces

- Use `interface` for object shapes (DTOs, payloads, entity shapes).
- Use `type` for unions, intersections, mapped types, and utility types.

```typescript
// Interface for object shape
interface UserPayload {
  id: string;
  email: string;
  roles: string[];
}

// Type for union
type ReportStatus = 'PENDING' | 'RESOLVED' | 'DISMISSED';
```

### 1.3 Explicit Return Types

- Public functions and exported methods should have explicit return types.
- Private/internal helper functions may omit return types if the inference is trivial.

```typescript
// Good
async getUserById(id: string): Promise<User | null> {
  return this.prisma.user.findUnique({ where: { id } });
}
```

### 1.4 Null Handling

- Use `undefined` for optional parameters, `null` for explicit absence.
- Prefer optional chaining (`?.`) and nullish coalescing (`??`) over manual checks.

### 1.5 Avoid `enum`

- Use `as const` objects + derived union types instead of TypeScript `enum` to avoid reverse-mapping issues and tree-shaking problems.

---

## 2. Naming Conventions

| Element             | Convention                  | Example                                        |
| ------------------- | --------------------------- | ---------------------------------------------- |
| Variables           | `camelCase`                 | `userId`, `communityName`                      |
| Functions / Methods | `camelCase`                 | `getUserById`, `createCommunity`               |
| Classes             | `PascalCase`                | `CommunitiesService`, `AuthGuard`              |
| Interfaces          | `PascalCase`, no `I` prefix | `UserPayload`, `CreateCommunityDto`            |
| Type Aliases        | `PascalCase`                | `ReportStatus`, `PaginationQuery`              |
| Constants           | `SCREAMING_SNAKE_CASE`      | `ROLES_KEY`, `DEFAULT_PAGE_SIZE`               |
| Files (TS)          | `kebab-case`                | `auth.controller.ts`, `communities.service.ts` |
| Files (React)       | `PascalCase`                | `CommunityCard.tsx`, `UserAvatar.tsx`          |
| Prisma Models       | `PascalCase`                | `User`, `Community`, `CommunityMember`         |
| DB Tables           | `snake_case` via `@@map`    | `users`, `community_members`                   |
| DB Columns          | `snake_case` via `@map`     | `user_id`, `community_id`, `created_at`        |
| Env Variables       | `SCREAMING_SNAKE_CASE`      | `JWT_SECRET`, `DATABASE_URL`                   |
| API Paths           | `kebab-case`                | `/role-requests`, `/community-members`         |
| Route Parameters    | `camelCase`                 | `/communities/:communityId`                    |

---

## 3. File Organization

### 3.1 Monorepo Structure

```
komunaid/
├── apps/
│   ├── api/                    # NestJS backend
│   │   ├── src/
│   │   │   ├── app.module.ts
│   │   │   ├── main.ts
│   │   │   ├── common/         # Shared infrastructure
│   │   │   │   ├── config/
│   │   │   │   ├── decorators/
│   │   │   │   ├── dto/
│   │   │   │   ├── email/
│   │   │   │   ├── filters/
│   │   │   │   ├── guards/
│   │   │   │   ├── interceptors/
│   │   │   │   ├── middleware/
│   │   │   │   └── prisma/
│   │   │   └── modules/        # Feature modules
│   │   │       ├── auth/
│   │   │       ├── communities/
│   │   │       ├── events/
│   │   │       └── ...
│   │   ├── tsconfig.json
│   │   └── package.json
│   └── web/                    # Next.js frontend
├── packages/
│   ├── shared/                 # Shared types, utils, constants
│   │   └── src/
│   │       ├── types/
│   │       ├── utils/
│   │       ├── constants/
│   │       └── validators/
│   └── database/               # Prisma schema, migrations, seed
│       └── prisma/
│           └── schema.prisma
```

### 3.2 Module Structure

Each NestJS feature module follows this structure:

```
modules/<module-name>/
├── <module-name>.module.ts       # Module definition
├── <module-name>.controller.ts   # HTTP handlers
├── <module-name>.service.ts      # Business logic
├── <module-name>.spec.ts         # Unit tests
└── dto/
    ├── create-<entity>.dto.ts    # Input DTOs for creation
    ├── update-<entity>.dto.ts    # Input DTOs for update
    └── query-<entity>.dto.ts     # Query parameter DTOs (if needed)
```

### 3.3 Common Infrastructure

Shared NestJS infrastructure lives in `apps/api/src/common/`:

| Directory       | Purpose                                                                 |
| --------------- | ----------------------------------------------------------------------- |
| `decorators/`   | Custom decorators (`@CurrentUser()`, `@Roles()`, `@ScopedPermission()`) |
| `filters/`      | Exception filters (`HttpExceptionFilter`)                               |
| `guards/`       | Auth and authorization guards (`AuthGuard`, `RolesGuard`)               |
| `interceptors/` | Request/response interceptors (`AuditLogInterceptor`)                   |
| `middleware/`   | Express middleware (`RequestIdMiddleware`)                              |
| `prisma/`       | Prisma service and module                                               |
| `email/`        | Email sending service                                                   |
| `config/`       | Configuration helpers                                                   |

### 3.4 Shared Package

Shared types, utilities, and constants live in `packages/shared/src/`:

- **`types/`** — TypeScript interfaces and type aliases shared between frontend and backend. Each domain has its own file (`user.ts`, `community.ts`, etc.) re-exported from `types/index.ts`.
- **`utils/`** — Pure utility functions (date formatting, slug generation, etc.).
- **`constants/`** — Shared constants (role names, status enums, etc.).
- **`validators/`** — Shared validation rules.

### 3.5 Database Package

The `packages/database/` package contains:

- `prisma/schema.prisma` — Single source of truth for the database schema.
- `prisma/seed.ts` — Database seeding script.
- Prisma Client is generated and exported for use across apps.

---

## 4. API Conventions

### 4.1 RESTful Design

- Use **nouns** for resources, **HTTP methods** for actions.
- All routes prefixed with `/api/v1`.

| Method   | Path                      | Action                |
| -------- | ------------------------- | --------------------- |
| `GET`    | `/communities`            | List communities      |
| `GET`    | `/communities/:slug`      | Get community by slug |
| `POST`   | `/communities`            | Create community      |
| `PATCH`  | `/communities/:id`        | Update community      |
| `DELETE` | `/communities/:id`        | Soft delete community |
| `POST`   | `/communities/:id/join`   | Join community        |
| `POST`   | `/communities/:id/leave`  | Leave community       |
| `PATCH`  | `/communities/:id/status` | Admin: update status  |

### 4.2 Response Format

All API responses follow a consistent structure defined in `packages/shared/src/types/common.ts`:

**Success (single resource):**

```json
{
  "success": true,
  "data": { "id": "...", "name": "..." },
  "message": "Community created successfully"
}
```

**Success (list with pagination):**

```json
{
  "success": true,
  "data": [{ "id": "...", "name": "..." }],
  "message": "Communities retrieved successfully",
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

**Error:**

```json
{
  "success": false,
  "data": null,
  "message": "Validation failed",
  "errors": {
    "body": ["name must be longer than 3 characters"]
  },
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

### 4.3 Pagination

Standard query parameters:

| Parameter | Type     | Default      | Description                     |
| --------- | -------- | ------------ | ------------------------------- |
| `page`    | `number` | `1`          | Page number                     |
| `limit`   | `number` | `20`         | Items per page                  |
| `search`  | `string` | —            | Full-text search query          |
| `sort`    | `string` | `created_at` | Sort field                      |
| `order`   | `string` | `desc`       | Sort direction (`asc` / `desc`) |

### 4.4 HTTP Status Codes

| Code                        | Usage                              |
| --------------------------- | ---------------------------------- |
| `200 OK`                    | Successful GET, PATCH, or action   |
| `201 Created`               | Successful POST (resource created) |
| `204 No Content`            | Successful DELETE                  |
| `400 Bad Request`           | Validation errors                  |
| `401 Unauthorized`          | Missing or invalid auth token      |
| `403 Forbidden`             | Authenticated but not authorized   |
| `404 Not Found`             | Resource not found                 |
| `409 Conflict`              | Duplicate resource                 |
| `422 Unprocessable Entity`  | Business logic validation failure  |
| `500 Internal Server Error` | Unexpected server errors           |

### 4.5 Swagger Documentation

Every controller and DTO must have Swagger decorators:

- `@ApiTags()` on controllers for grouping.
- `@ApiOperation()` on every route handler.
- `@ApiProperty()` / `@ApiPropertyOptional()` on all DTO fields.
- `@ApiBearerAuth()` on protected routes.
- Swagger UI available at `/api/docs`.

### 4.6 Validation

Global `ValidationPipe` is configured in `main.ts` with:

- `whitelist: true` — Strip unknown properties.
- `forbidNonWhitelisted: true` — Throw on unknown properties.
- `transform: true` — Auto-transform payloads to DTO instances.
- `enableImplicitConversion: true` — Auto-convert query params.

All DTOs must use `class-validator` decorators for validation.

---

## 5. Git Conventions

### 5.1 Branch Naming

```
feature/<short-description>     # New features
fix/<short-description>         # Bug fixes
chore/<short-description>       # Maintenance, refactoring
docs/<short-description>        # Documentation only
```

Examples:

- `feature/community-role-management`
- `fix/event-registration-duplicate`
- `chore/upgrade-nestjs-v10`

### 5.2 Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]
```

**Types:**

| Type       | Usage                              |
| ---------- | ---------------------------------- |
| `feat`     | New feature                        |
| `fix`      | Bug fix                            |
| `docs`     | Documentation changes              |
| `style`    | Formatting, no code change         |
| `refactor` | Code restructuring, no feature/fix |
| `test`     | Adding or updating tests           |
| `chore`    | Build, CI, dependency changes      |

**Examples:**

- `feat(communities): add community role management`
- `fix(auth): prevent token expiry race condition`
- `docs(api): update Swagger examples for events`
- `refactor(users): extract user validation into shared validator`

### 5.3 Pull Requests

- Title must be descriptive and match commit convention.
- Reference related issues: `Closes #123` or `Relates to #456`.
- PR description should include: what changed, why, and how to test.
- All CI checks must pass before merge.
- Require at least one review before merge.

---

## 6. Error Handling

### 6.1 NestJS Exceptions

Use NestJS built-in HTTP exceptions for all API errors:

```typescript
import { NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';

// In service or controller
throw new NotFoundException('Community not found');
throw new ForbiddenException('You are not the owner of this community');
throw new ConflictException('User is already a member of this community');
```

### 6.2 Global Exception Filter

`HttpExceptionFilter` (`apps/api/src/common/filters/http-exception.filter.ts`) catches all unhandled exceptions and returns a consistent error response. Do not bypass this filter.

### 6.3 Error Response Structure

All errors are returned in the standard format:

```json
{
  "success": false,
  "data": null,
  "message": "Human-readable error message",
  "errors": {},
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

### 6.4 Logging

- Log all unexpected errors with full context (user ID, request ID, operation name).
- Never log sensitive data (passwords, tokens, secrets).
- Use NestJS `Logger` class, not `console.log`.

```typescript
import { Logger } from '@nestjs/common';

private readonly logger = new Logger(CommunitiesService.name);

// In catch block
this.logger.error(`Failed to create community`, error.stack);
```

### 6.5 Never Expose Internals

- Do not return stack traces, SQL errors, or internal file paths to the client.
- Map internal errors to user-friendly messages at the controller/filter level.
- Use the global exception filter to catch anything that slips through.

---

## 7. Security Conventions

### 7.1 Authentication

- Use `@UseGuards(AuthGuard)` on protected routes.
- Access the authenticated user via `@CurrentUser()` decorator.
- Extract specific user properties with `@CurrentUser('id')`.

```typescript
@Post()
@UseGuards(AuthGuard)
@ApiBearerAuth()
async create(@CurrentUser('id') userId: string, @Body() dto: CreateCommunityDto) {
  return this.communitiesService.create(userId, dto);
}
```

### 7.2 Authorization

- Use `@UseGuards(AuthGuard, RolesGuard)` for role-based access.
- Apply `@Roles('SUPER_ADMIN', 'PLATFORM_ADMIN')` to restrict to specific roles.
- Use `@ScopedPermission()` for resource-level permissions.

### 7.3 Input Validation

- **Every** controller endpoint that accepts input must use validated DTOs.
- DTOs must use `class-validator` decorators (`@IsString()`, `@IsOptional()`, `@MaxLength()`, etc.).
- Global `ValidationPipe` enforces validation at the controller level.
- Never trust client input — validate and sanitize everything.

### 7.4 Secrets and Sensitive Data

- **Never** log passwords, tokens, or API keys.
- **Never** commit secrets to version control.
- Environment variables are the source of truth for secrets (`JWT_SECRET`, `DATABASE_URL`, etc.).
- Use `.env` files locally; never include `.env` in commits.

### 7.5 CORS

CORS is configured in `main.ts` with `origin` from `CORS_ORIGIN` env variable, defaulting to `http://localhost:3000`. Credentials are enabled for cookie-based auth.

### 7.6 Password Handling

- Passwords must be hashed with bcrypt before storage.
- Never return password hashes in API responses.
- DTOs for user creation/update should accept `password` but the service must hash it before persisting.

---

## 8. Formatting & Linting

### 8.1 Prettier

Configuration (`.prettierrc`):

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2,
  "arrowParens": "always"
}
```

Run `prettier --write` before committing. All code must conform to these settings.

### 8.2 ESLint

Configuration (`.eslintrc.cjs`):

```javascript
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: { project: true },
  plugins: ['@typescript-eslint'],
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  rules: {
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/explicit-function-return-type': 'off',
    'no-console': ['warn', { allow: ['warn', 'error'] }],
  },
};
```

Key rules:

- `no-explicit-any: warn` — Avoid `any`. Use `unknown` and narrow with type guards.
- `no-unused-vars: warn` — Prefix unused parameters with `_`.
- `no-console: warn` — Use NestJS `Logger` instead of `console.log`.
- `explicit-function-return-type: off` — Inference is acceptable for internal functions.

### 8.3 Pre-commit Checks

Before committing, ensure:

1. `npm run lint` passes with no errors.
2. `npm run build` (or `tsc --noEmit`) compiles without errors.
3. Prettier formatting is applied.

---

## Quick Reference Checklist

Before submitting code, verify:

- [ ] TypeScript strict mode — no `any` types, no `@ts-ignore`
- [ ] Naming follows conventions (camelCase functions, PascalCase classes, kebab-case files)
- [ ] DTOs have `class-validator` decorators and `@ApiProperty` decorators
- [ ] Controllers have `@ApiTags`, `@ApiOperation`, `@ApiBearerAuth` where applicable
- [ ] Service methods have explicit return types
- [ ] Errors use NestJS exceptions, not raw `throw new Error()`
- [ ] No secrets, passwords, or tokens in logs
- [ ] Tests pass (`*.spec.ts` files)
- [ ] Linting and formatting pass
- [ ] Branch and commit follow naming conventions
