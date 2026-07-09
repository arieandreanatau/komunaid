# 13 — IMPLEMENTATION GUIDE

**Date:** 2026-07-09
**Version:** 1.0.0

---

## Coding Conventions

### TypeScript

```
- Strict mode enabled
- Explicit return types on functions
- Interface over type (for objects)
- Enums for fixed sets (mapped to Prisma enums)
- No `any` — use `unknown` if needed
```

### File Naming

```
apps/api/src/
  routes/          → kebab-case: auth.ts, communities.ts
  middleware/      → kebab-case: auth.ts, rbac.ts
  services/        → kebab-case: audit.ts
  lib/             → kebab-case: response.ts, logger.ts

apps/web/app/
  page.tsx         → PascalCase component name
  layout.tsx       → PascalCase component name

packages/shared/src/
  index.ts         → Exports all schemas + types
```

### Component Naming

```tsx
// React components: PascalCase
// File: community-card.tsx → export function CommunityCard()
// File: event-detail.tsx → export function EventDetailPage()

// Custom hooks: camelCase with `use` prefix
// File: use-communities.ts → export function useCommunities()
```

---

## Folder Structure

```
apps/api/src/
├── index.ts              Entry point (Hono app)
├── middleware/
│   ├── auth.ts           JWT + cookie auth
│   ├── rbac.ts           Role-based access control
│   ├── security.ts       Headers, rate limit, size limit
│   └── validate.ts       Zod validation middleware
├── routes/
│   ├── auth.ts           Authentication endpoints
│   ├── users.ts          User profile endpoints
│   ├── communities.ts    Community CRUD + membership
│   ├── organizations.ts  Organization CRUD
│   ├── events.ts         Event CRUD + registration
│   ├── reports.ts        Report creation + user reports
│   ├── admin.ts          Admin dashboard + management
│   └── categories.ts     Category CRUD
├── services/
│   └── audit.ts          Immutable audit log service
└── lib/
    ├── response.ts       Response helpers
    └── logger.ts         Pino logger

apps/web/
├── app/                  Next.js App Router pages
├── components/
│   ├── providers.tsx     QueryClient + Auth providers
│   └── auth-provider.tsx Auth context
├── lib/
│   ├── api.ts            Axios instance
│   └── auth.ts           Zustand auth store
└── middleware.ts         Route protection

packages/
├── shared/src/index.ts   Zod schemas + TS types
├── constants/src/index.ts App constants
├── utils/src/index.ts    Utility functions
├── ui/src/               React components (Button, Card, Input)
└── database/prisma/      Schema + seed
```

---

## API Route Pattern

```typescript
// apps/api/src/routes/example.ts
import { Hono } from 'hono'
import { authMiddleware } from '../middleware/auth'
import { requirePlatformAdmin } from '../middleware/rbac'
import { validate } from '../middleware/validate'
import { someSchema } from '@komunaid/shared'
import { successResponse, paginatedResponse } from '../lib/response'
import { prisma } from '@komunaid/database'

const app = new Hono()

// Public route
app.get('/', async (c) => {
  const { page = 1, limit = 20, search } = c.req.query()
  const skip = (Number(page) - 1) * Number(limit)

  const [data, total] = await Promise.all([
    prisma.model.findMany({
      where: { deletedAt: null, ...(search && { name: { contains: search } }) },
      skip,
      take: Number(limit),
    }),
    prisma.model.count({ where: { deletedAt: null } }),
  ])

  return c.json(paginatedResponse(data, Number(page), Number(limit), total))
})

// Protected route with validation
app.post('/', authMiddleware, validate(someSchema), async (c) => {
  const user = c.get('user')
  const body = c.req.valid('json')

  const result = await prisma.model.create({ data: { ...body, userId: user.id } })

  return c.json(successResponse(result, 'Created'), 201)
})

// Admin route
app.get('/admin', authMiddleware, requirePlatformAdmin, async (c) => {
  const data = await prisma.model.findMany()
  return c.json(successResponse(data))
})

export default app
```

---

## Frontend Page Pattern

```tsx
// apps/web/app/communities/page.tsx
'use client'

import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useState } from 'react'

export default function CommunitiesPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['communities', page, search],
    queryFn: () => api.get('/communities', { params: { page, search } }),
    staleTime: 60_000,
  })

  if (isLoading) return <LoadingSkeleton />

  return (
    <div>
      <SearchInput value={search} onChange={setSearch} />
      <CommunityGrid communities={data?.data.data} />
      <Pagination
        page={page}
        totalPages={data?.data.pagination.totalPages}
        onPageChange={setPage}
      />
    </div>
  )
}
```

---

## Form Pattern

```tsx
// apps/web/app/dashboard/profile/page.tsx
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { updateProfileSchema } from '@komunaid/shared'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

export default function ProfilePage() {
  const queryClient = useQueryClient()

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(updateProfileSchema),
  })

  const mutation = useMutation({
    mutationFn: (data) => api.put('/users/profile', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      // Show success toast
    },
  })

  return (
    <form onSubmit={handleSubmit((data) => mutation.mutate(data))}>
      <Input label="Nama" {...register('name')} error={errors.name?.message} />
      <Input label="Bio" {...register('bio')} error={errors.bio?.message} />
      <Button type="submit" loading={mutation.isPending}>Simpan</Button>
    </form>
  )
}
```

---

## Prisma Query Patterns

### Soft Delete Filter

```typescript
// Always filter deleted records
const communities = await prisma.community.findMany({
  where: { deletedAt: null },
})
```

### Pagination

```typescript
const skip = (page - 1) * limit
const [data, total] = await Promise.all([
  prisma.model.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
  prisma.model.count({ where }),
])
```

### Transaction

```typescript
await prisma.$transaction([
  prisma.community.create({ data: communityData }),
  prisma.communityMember.create({ data: { communityId, userId, role: 'OWNER' } }),
])
```

### Include Relations

```typescript
const community = await prisma.community.findUnique({
  where: { slug },
  include: {
    owner: { select: { id: true, name: true, avatar: true } },
    members: { include: { user: { select: { id: true, name: true, avatar: true } } } },
    events: { where: { status: 'APPROVED' }, orderBy: { eventDate: 'asc' } },
    categories: { include: { category: true } },
  },
})
```

---

## Environment Setup

### Development

```bash
# 1. Clone repository
git clone <repo-url>
cd komunaid

# 2. Install dependencies
pnpm install

# 3. Setup environment
cp .env.example .env.development
# Edit .env.development with local values

# 4. Setup database
cd packages/database
pnpm prisma generate
pnpm prisma migrate dev
pnpm prisma db seed

# 5. Start development
pnpm dev
```

### Required Environment Variables

```bash
# Database
DATABASE_URL="mysql://root:password@localhost:3306/komunaid_dev"

# JWT
JWT_SECRET="your-secret-key-min-32-chars"
JWT_REFRESH_SECRET="your-refresh-secret-min-32-chars"

# CORS
CORS_ORIGIN="http://localhost:3000"

# Frontend
NEXT_PUBLIC_API_URL="http://localhost:3001/api/v1"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## Testing Strategy (Planned)

| Type | Tool | Coverage |
|------|------|----------|
| Unit Tests | Vitest | Utils, services |
| Integration Tests | Vitest + Supertest | API endpoints |
| E2E Tests | Playwright | Critical user flows |
| Type Checking | tsc --noEmit | All packages |

### Test File Structure

```
apps/api/src/
  routes/__tests__/
    auth.test.ts
    communities.test.ts
  services/__tests__/
    audit.test.ts

apps/web/
  __tests__/
    components/
    pages/

packages/
  utils/__tests__/
    slug.test.ts
```

---

## Code Quality Rules

| Rule | Tool | Configuration |
|------|------|--------------|
| TypeScript strict | tsc | tsconfig.json strict: true |
| Linting | ESLint | .eslintrc.json |
| Formatting | Prettier | .prettierrc |
| Import order | ESLint plugin | @typescript-eslint |
| No console.log | ESLint rule | In production |
| No unused vars | TypeScript | noUnusedLocals |

---

*Document generated: 2026-07-09*
*Stage: SDLC Stage 2 — System Analysis & Solution Design*
