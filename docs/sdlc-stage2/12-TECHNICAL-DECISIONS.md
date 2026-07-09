# 12 — TECHNICAL DECISIONS

**Date:** 2026-07-09
**Version:** 1.0.0

---

## Architecture Decisions

### ADR-001: Monorepo with pnpm Workspaces

**Context:** Multi-package project (API, Web, Shared packages)
**Decision:** pnpm workspaces monorepo
**Rationale:**
- Shared TypeScript types between API and Web
- Single dependency management
- Atomic commits across packages
- Type safety across boundaries
**Alternatives Considered:**
- npm workspaces: Slower, less disk-efficient
- Turborepo: More complex, not needed at MVP scale
- Separate repos: Loses type safety, harder to maintain

---

### ADR-002: Hono.js as Backend Framework

**Context:** Need lightweight, fast API framework
**Decision:** Hono.js 4.7
**Rationale:**
- Ultra-lightweight (14KB)
- Edge-runtime compatible
- Built-in middleware ecosystem
- TypeScript-first
- Express-like API but faster
**Alternatives Considered:**
- Express: Verbose, slower, aging
- Fastify: Heavier, more complex
- NestJS: Too complex for MVP
- tRPC: Overkill for REST API

---

### ADR-003: Next.js 15 App Router

**Context:** Need SSR, SSG, and CSR capabilities
**Decision:** Next.js 15 with App Router
**Rationale:**
- React Server Components for SEO
- File-based routing
- Built-in optimization (images, fonts, code splitting)
- ISR for static pages
- Large ecosystem
**Alternatives Considered:**
- Pages Router: Legacy, less flexible
- Remix: Smaller ecosystem
- Vite + React Router: No SSR

---

### ADR-004: Prisma as ORM

**Context:** Need type-safe database access
**Decision:** Prisma 6.9
**Rationale:**
- Full TypeScript type generation
- Migration management
- Schema-first approach
- Excellent DX
- MySQL support
**Alternatives Considered:**
- Drizzle: Less mature
- TypeORM: More verbose
- Knex: Query builder only
- Raw SQL: No type safety

---

### ADR-005: JWT with httpOnly Cookies

**Context:** Need secure authentication
**Decision:** JWT access + refresh tokens in httpOnly cookies
**Rationale:**
- No XSS token theft (httpOnly)
- No localStorage exposure
- Short-lived access (15min) limits damage
- Refresh rotation for session continuity
**Alternatives Considered:**
- localStorage + Bearer: Vulnerable to XSS
- Session-based: Requires server-side session store
- Opaque tokens: More DB queries

---

### ADR-006: Zod for Validation

**Context:** Need shared validation between API and Web
**Decision:** Zod 3.24 schemas in @komunaid/shared
**Rationale:**
- Shared schemas (API + Web use same rules)
- TypeScript type inference from schemas
- Runtime validation + static types
- Composable schemas
**Alternatives Considered:**
- Yup: Slower, less TypeScript support
- Joi: Heavier, no type inference
- Superstruct: Smaller ecosystem

---

### ADR-007: Zustand + TanStack Query

**Context:** Need client state and server state management
**Decision:** Zustand for client state, TanStack Query for server state
**Rationale:**
- Zustand: Minimal boilerplate, no providers needed
- TanStack Query: Caching, background refetch, optimistic updates
- Clear separation of concerns
**Alternatives Considered:**
- Redux Toolkit: Too verbose
- Jotai: Atomic model, less suited for server state
- React Context only: No caching

---

### ADR-008: Tailwind CSS

**Context:** Need consistent, maintainable styling
**Decision:** Tailwind CSS 3.4
**Rationale:**
- Utility-first: fast prototyping
- Consistent design system via config
- Small production CSS (purge)
- shadcn/ui compatible
**Alternatives Considered:**
- CSS Modules: More file management
- Styled Components: Runtime overhead
- Sass: More verbose

---

### ADR-009: MySQL over PostgreSQL

**Context:** Need relational database
**Decision:** MySQL 8.x
**Rationale:**
- Team familiarity
- Wide hosting support
- Good Prisma support
- Adequate for MVP scale
**Trade-offs:**
- No JSONB (using JSON column type)
- No array type (using separate tables)
- Less full-text search (using LIKE queries)
**Future Consideration:** PostgreSQL if advanced features needed

---

### ADR-010: Repository Pattern (Planned)

**Context:** Current routes use Prisma directly
**Decision:** Extract repository layer before scaling
**Rationale:**
- Testability (mock repositories)
- Separation of concerns
- Easier to swap ORM later
- Cleaner route handlers
**Timeline:** After MVP, before production scale
**Pattern:**

```
Route → Service → Repository → Prisma
```

---

## Design Decisions

### DD-001: Polymorphic Reports

**Context:** Users can report communities, events, users, organizations
**Decision:** Polymorphic (targetType + targetId) instead of separate tables
**Rationale:**
- Single Report table
- Extensible (add new target types without schema changes)
- Simpler queries
**Trade-off:** No referential integrity on targetId

---

### DD-002: Soft Delete Pattern

**Context:** Need to preserve data for audit
**Decision:** deletedAt field on major entities
**Rationale:**
- Data preservation
- Audit trail integrity
- Recovery possible
- No hard deletes
**Trade-off:** Queries must always filter by deletedAt IS NULL

---

### DD-003: Slug-Based URLs

**Context:** Need SEO-friendly URLs
**Decision:** Slug field on Community, Organization, Event
**Rationale:**
- Human-readable URLs
- SEO optimized
- Shareable links
**Implementation:** createSlug() from @komunaid/utils

---

### DD-004: Free-Text Interests

**Context:** Users can set interests
**Decision:** Free-text strings instead of predefined categories
**Rationale:**
- Flexibility for users
- No maintenance of interest list
- Can evolve to tag-based search
**Trade-off:** Inconsistent naming (future: normalize with AI/ML)

---

### DD-005: In-Memory Rate Limiting (MVP)

**Context:** Need rate limiting
**Decision:** In-memory Map-based rate limiter
**Rationale:**
- Zero dependencies
- Adequate for single-instance MVP
- Simple implementation
**Trade-off:** Lost on server restart, not shared across instances
**Future:** Redis-based for production multi-instance

---

## Technology Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Language | TypeScript | Type safety, shared types |
| Runtime | Node.js 20+ | LTS, ecosystem |
| Package Manager | pnpm 9+ | Speed, disk efficiency |
| Node Version | .nvmrc: 20 | LTS |
| API Format | REST JSON | Simplicity, Hono convention |
| Auth Tokens | JWT (jose) | Edge-compatible, fast |
| Password Hash | bcryptjs | Battle-tested |
| Logging | Pino | Fast, structured |
| Testing | Vitest (planned) | Fast, compatible |
| Linting | ESLint (planned) | Code quality |

---

*Document generated: 2026-07-09*
*Stage: SDLC Stage 2 — System Analysis & Solution Design*
