# 13 — Backend Structure

> KomunaID Super Admin MVP — Platform Governance Module

---

## Monorepo Structure

```
komuna-id/
├── apps/
│   ├── api/                              # Hono REST API
│   │   ├── src/
│   │   │   ├── index.ts                  # Entry point, Hono app setup
│   │   │   ├── server.ts                 # HTTP server (Node.js serve)
│   │   │   ├── routes/
│   │   │   │   ├── index.ts              # Root router aggregator
│   │   │   │   ├── admin/
│   │   │   │   │   ├── index.ts          # Admin route aggregator
│   │   │   │   │   ├── dashboard.ts      # GET /dashboard, /dashboard/growth
│   │   │   │   │   ├── users.ts          # Users CRUD & actions
│   │   │   │   │   ├── roles.ts          # Roles listing
│   │   │   │   │   ├── communities.ts    # Communities management
│   │   │   │   │   ├── events.ts         # Events management
│   │   │   │   │   ├── volunteers.ts     # Volunteers management
│   │   │   │   │   ├── reports.ts        # Reports management
│   │   │   │   │   ├── cms.ts            # CMS pages & banners
│   │   │   │   │   ├── categories.ts     # Categories CRUD
│   │   │   │   │   ├── masterData.ts     # Master data endpoints
│   │   │   │   │   ├── auditLogs.ts      # Audit logs
│   │   │   │   │   ├── notifications.ts  # Notifications & templates
│   │   │   │   │   ├── settings.ts       # Platform settings
│   │   │   │   │   └── security.ts       # Security features
│   │   │   │   └── v1/
│   │   │   │       └── index.ts          # Public V1 routes
│   │   │   ├── middleware/
│   │   │   │   ├── index.ts              # Middleware chain
│   │   │   │   ├── auth.ts               # JWT authentication
│   │   │   │   ├── rbac.ts               # Role-Based Access Control
│   │   │   │   ├── rateLimiter.ts        # Rate limiting
│   │   │   │   ├── validator.ts          # Zod request validation
│   │   │   │   ├── errorHandler.ts       # Global error handler
│   │   │   │   ├── requestId.ts          # Request ID injection
│   │   │   │   └── audit.ts             # Audit logging middleware
│   │   │   ├── services/
│   │   │   │   ├── dashboard.service.ts
│   │   │   │   ├── user.service.ts
│   │   │   │   ├── community.service.ts
│   │   │   │   ├── event.service.ts
│   │   │   │   ├── volunteer.service.ts
│   │   │   │   ├── report.service.ts
│   │   │   │   ├── cms.service.ts
│   │   │   │   ├── category.service.ts
│   │   │   │   ├── masterData.service.ts
│   │   │   │   ├── auditLog.service.ts
│   │   │   │   ├── notification.service.ts
│   │   │   │   ├── settings.service.ts
│   │   │   │   └── security.service.ts
│   │   │   ├── repositories/
│   │   │   │   ├── user.repository.ts
│   │   │   │   ├── community.repository.ts
│   │   │   │   ├── event.repository.ts
│   │   │   │   ├── volunteer.repository.ts
│   │   │   │   ├── report.repository.ts
│   │   │   │   ├── cms.repository.ts
│   │   │   │   ├── category.repository.ts
│   │   │   │   ├── masterData.repository.ts
│   │   │   │   ├── auditLog.repository.ts
│   │   │   │   ├── notification.repository.ts
│   │   │   │   ├── settings.repository.ts
│   │   │   │   ├── loginHistory.repository.ts
│   │   │   │   └── security.repository.ts
│   │   │   ├── validators/
│   │   │   │   ├── admin.schema.ts       # Zod schemas for admin endpoints
│   │   │   │   └── common.schema.ts      # Common validation (pagination, ID, etc.)
│   │   │   ├── lib/
│   │   │   │   ├── prisma.ts             # Prisma client singleton
│   │   │   │   ├── jwt.ts                # JWT sign/verify helpers
│   │   │   │   ├── password.ts           # Password hash/compare (bcrypt)
│   │   │   │   ├── email.ts              # Email sender (Nodemailer / Resend)
│   │   │   │   ├── storage.ts            # File storage (S3 / local)
│   │   │   │   └── logger.ts             # Pino logger setup
│   │   │   ├── types/
│   │   │   │   ├── admin.ts              # Admin-specific types
│   │   │   │   └── index.ts              # Shared types
│   │   │   └── utils/
│   │   │       ├── pagination.ts         # Pagination helpers
│   │   │       ├── date.ts               # Date formatting helpers
│   │   │       └── response.ts           # Standard response builders
│   │   ├── prisma/
│   │   │   ├── schema.prisma             # Prisma schema
│   │   │   ├── seed.ts                   # Database seed script
│   │   │   └── migrations/               # Auto-generated migrations
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── .env
│   │
│   └── web/                              # Next.js 15 App Router
│       ├── app/
│       │   ├── (admin)/
│       │   │   ├── layout.tsx
│       │   │   └── ... (admin pages)
│       │   └── layout.tsx
│       ├── components/
│       ├── hooks/
│       ├── lib/
│       │   ├── api-client.ts             # Axios/fetch wrapper
│       │   └── utils.ts
│       ├── package.json
│       └── next.config.ts
│
├── packages/
│   ├── database/
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   └── migrations/
│   │   ├── src/
│   │   │   ├── index.ts                  # Re-export PrismaClient
│   │   │   └── client.ts                 # PrismaClient singleton
│   │   └── package.json
│   │
│   ├── shared/
│   │   ├── src/
│   │   │   ├── schemas/
│   │   │   │   ├── admin.ts              # Shared Zod schemas
│   │   │   │   ├── user.ts
│   │   │   │   ├── community.ts
│   │   │   │   ├── event.ts
│   │   │   │   └── index.ts
│   │   │   └── types/
│   │   │       └── index.ts
│   │   └── package.json
│   │
│   └── constants/
│       ├── src/
│       │   ├── roles.ts                  # Role constants
│       │   ├── status.ts                 # Status enums
│       │   ├── permissions.ts            # Permission definitions
│       │   ├── cms.ts                    # CMS constants
│       │   └── index.ts
│       └── package.json
│
├── package.json                          # Root package.json (pnpm workspace)
├── pnpm-workspace.yaml
├── turbo.json                            # Turborepo config
└── tsconfig.base.json
```

---

## Middleware Chain

Request flow untuk semua admin endpoint:

```
Incoming Request
    │
    ▼
[1] requestId
    │  Menambahkan unique ID ke setiap request untuk tracing
    │
    ▼
[2] errorHandler (onError)
    │  Global error handler, menangkap semua error dan mengembalikan
    │  response format yang konsisten
    │
    ▼
[3] rateLimiter
    │  Rate limiting per IP dan per user
    │  Config: 100 req/user/min, 200 req/IP/min
    │
    ▼
[4] cors
    │  CORS policy, mengizinkan origin dari apps/web
    │
    ▼
[5] auth (JWT)
    │  Verifikasi JWT token dari header Authorization
    │  Decode user data dan attach ke context
    │  Reject jika token invalid/expired
    │
    ▼
[6] rbac (Role-Based Access Control)
    │  Cek role user: hanya SUPER_ADMIN yang boleh akses
    │  Permission matrix berdasarkan endpoint
    │  Reject jika tidak memiliki izin
    │
    ▼
[7] validator (Zod)
    │  Validasi request body, query params, path params
    │  Menggunakan schema dari packages/shared
    │  Reject dengan 400 jika validasi gagal
    │
    ▼
[8] audit (opsional, untuk write operations)
    │  Log aksi admin ke AuditLog table
    │  Record: user, action, entity, changes, IP, user agent
    │
    ▼
Route Handler
    │  Memanggil service layer
    │
    ▼
Service Layer
    │  Business logic, validasi bisnis, orchestration
    │  Memanggil repository layer
    │
    ▼
Repository Layer
    │  Database operations via Prisma
    │  Query building, pagination, filtering
    │
    ▼
Response
    │  Format: { success: true, data: {...} }
    │  Atau: { success: false, error: {...} }
```

---

## Service Layer Pattern

Setiap service mengikuti pola berikut:

```typescript
// services/user.service.ts

import { UserRepository } from '../repositories/user.repository'
import { AuditLogService } from './auditLog.service'
import { NotFoundError, ValidationError } from '../lib/errors'

export class UserService {
  constructor(
    private userRepo: UserRepository,
    private auditLogService: AuditLogService
  ) {}

  async getUsers(params: GetUsersParams) {
    // 1. Build query params
    const { page, limit, search, role, status, sortBy, sortOrder } = params

    // 2. Call repository
    const { users, total } = await this.userRepo.findAll({
      page, limit, search, role, status, sortBy, sortOrder
    })

    // 3. Transform data (if needed)
    const transformedUsers = users.map(this.transformUser)

    // 4. Return structured response
    return {
      users: transformedUsers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }
  }

  async suspendUser(userId: string, reason: string, performedBy: string) {
    // 1. Validate user exists
    const user = await this.userRepo.findById(userId)
    if (!user) throw new NotFoundError('Pengguna tidak ditemukan')

    // 2. Validate business rules
    if (user.status === 'SUSPENDED') {
      throw new ValidationError('Pengguna sudah ditangguhkan')
    }

    // 3. Perform action
    const updated = await this.userRepo.updateStatus(userId, 'SUSPENDED', {
      suspensionReason: reason,
      suspendedAt: new Date(),
      suspendedUntil: duration ? calculateEndDate(duration) : null
    })

    // 4. Log audit
    await this.auditLogService.log({
      userId: performedBy,
      action: 'USER_SUSPENDED',
      entityType: 'User',
      entityId: userId,
      description: `Pengguna ${user.name} ditangguhkan`,
      metadata: { reason, duration }
    })

    // 5. Send notification (async, fire-and-forget)
    this.notificationService.sendSuspensionNotice(userId, reason)

    return updated
  }

  private transformUser(user: any) {
    // Transform database model ke API response format
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      // ...
    }
  }
}
```

---

## Repository Layer Pattern

```typescript
// repositories/user.repository.ts

import { PrismaClient, Prisma } from '@prisma/client'
import { prisma } from '../lib/prisma'

export class UserRepository {
  private db: PrismaClient

  constructor() {
    this.db = prisma
  }

  async findAll(params: FindAllParams) {
    const { page, limit, search, role, status, sortBy, sortOrder } = params
    const skip = (page - 1) * limit

    const where: Prisma.UserWhereInput = {}

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ]
    }
    if (role) where.role = role
    if (status) where.status = status

    const orderBy: Prisma.UserOrderByWithRelationInput = {
      [sortBy || 'createdAt']: sortOrder || 'desc'
    }

    const [users, total] = await Promise.all([
      this.db.user.findMany({ where, orderBy, skip, take: limit }),
      this.db.user.count({ where })
    ])

    return { users, total }
  }

  async findById(id: string) {
    return this.db.user.findUnique({
      where: { id },
      include: {
        communities: {
          include: { community: true }
        }
      }
    })
  }

  async updateStatus(id: string, status: string, metadata?: any) {
    return this.db.user.update({
      where: { id },
      data: { status, ...metadata }
    })
  }
}
```

---

## Prisma Client Singleton

```typescript
// lib/prisma.ts

import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

---

## Error Handling

```typescript
// lib/errors.ts

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: any[]
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource tidak ditemukan') {
    super(404, 'NOT_FOUND', message)
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Validasi gagal', details?: any[]) {
    super(400, 'VALIDATION_ERROR', message, details)
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Tidak memiliki izin') {
    super(403, 'FORBIDDEN', message)
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Konflik data') {
    super(409, 'CONFLICT', message)
  }
}
```

---

## Error Handler Middleware

```typescript
// middleware/errorHandler.ts

import { ErrorHandler } from 'hono'
import { AppError } from '../lib/errors'
import { logger } from '../lib/logger'

export const errorHandler: ErrorHandler = (err, c) => {
  if (err instanceof AppError) {
    return c.json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details
      }
    }, err.statusCode as any)
  }

  logger.error({ err }, 'Unhandled error')

  return c.json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Kesalahan server internal'
    }
  }, 500)
}
```

---

## Authentication Middleware

```typescript
// middleware/auth.ts

import { Context, Next } from 'hono'
import { verifyToken } from '../lib/jwt'
import { UnauthorizedError } from '../lib/errors'

export const authMiddleware = async (c: Context, next: Next) => {
  const authHeader = c.req.header('Authorization')

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedError('Token tidak ditemukan')
  }

  const token = authHeader.split(' ')[1]

  try {
    const payload = await verifyToken(token)
    c.set('user', payload)
    await next()
  } catch {
    throw new UnauthorizedError('Token tidak valid atau sudah kedaluwarsa')
  }
}
```

---

## RBAC Middleware

```typescript
// middleware/rbac.ts

import { Context, Next } from 'hono'
import { ForbiddenError } from '../lib/errors'

export const requireRole = (...roles: string[]) => {
  return async (c: Context, next: Next) => {
    const user = c.get('user')

    if (!user || !roles.includes(user.role)) {
      throw new ForbiddenError('Tidak memiliki izin untuk mengakses resource ini')
    }

    await next()
  }
}

// Usage:
// router.get('/admin/users', authMiddleware, requireRole('SUPER_ADMIN'), handler)
```

---

## Rate Limiter Middleware

```typescript
// middleware/rateLimiter.ts

import { Context, Next } from 'hono'
import { RateLimiter } from '../lib/rateLimiter'

const limiter = new RateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // per user
  ipMax: 200 // per IP
})

export const rateLimiterMiddleware = async (c: Context, next: Next) => {
  const userId = c.get('user')?.id
  const ip = c.req.header('x-forwarded-for') || 'unknown'

  const allowed = await limiter.check(userId || ip)
  if (!allowed) {
    return c.json({
      success: false,
      error: {
        code: 'RATE_LIMITED',
        message: 'Terlalu banyak request. Silakan coba lagi nanti.'
      }
    }, 429)
  }

  await next()
}
```

---

## Validator Middleware

```typescript
// middleware/validator.ts

import { Context, Next } from 'hono'
import { ZodSchema } from 'zod'
import { ValidationError } from '../lib/errors'

export const validate = (schema: ZodSchema, source: 'body' | 'query' | 'params' = 'body') => {
  return async (c: Context, next: Next) => {
    let data: any

    switch (source) {
      case 'body':
        data = await c.req.json()
        break
      case 'query':
        data = Object.fromEntries(new URL(c.req.url).searchParams)
        break
      case 'params':
        data = c.req.param()
        break
    }

    const result = schema.safeParse(data)

    if (!result.success) {
      const details = result.error.errors.map(e => ({
        field: e.path.join('.'),
        message: e.message
      }))
      throw new ValidationError('Validasi gagal', details)
    }

    c.set('validatedData', result.data)
    await next()
  }
}
```

---

## Audit Log Middleware

```typescript
// middleware/audit.ts

import { Context, Next } from 'hono'
import { AuditLogRepository } from '../repositories/auditLog.repository'

const auditLogRepo = new AuditLogRepository()

export const auditMiddleware = (action: string, entityType: string) => {
  return async (c: Context, next: Next) => {
    await next()

    const user = c.get('user')
    const method = c.req.method
    const id = c.req.param('id')

    await auditLogRepo.create({
      userId: user.id,
      action,
      entityType,
      entityId: id,
      description: `${action} on ${entityType}`,
      ipAddress: c.req.header('x-forwarded-for'),
      userAgent: c.req.header('user-agent'),
      metadata: {
        method,
        path: c.req.path,
        statusCode: c.res.status
      }
    })
  }
}
```

---

## Route Registration

```typescript
// routes/admin/index.ts

import { Hono } from 'hono'
import { authMiddleware } from '../../middleware/auth'
import { requireRole } from '../../middleware/rbac'
import { rateLimiterMiddleware } from '../../middleware/rateLimiter'

import dashboardRoutes from './dashboard'
import userRoutes from './users'
import roleRoutes from './roles'
import communityRoutes from './communities'
import eventRoutes from './events'
import volunteerRoutes from './volunteers'
import reportRoutes from './reports'
import cmsRoutes from './cms'
import categoryRoutes from './categories'
import masterDataRoutes from './masterData'
import auditLogRoutes from './auditLogs'
import notificationRoutes from './notifications'
import settingsRoutes from './settings'
import securityRoutes from './security'

const admin = new Hono()

// Global middleware untuk semua admin routes
admin.use('*', authMiddleware)
admin.use('*', requireRole('SUPER_ADMIN'))
admin.use('*', rateLimiterMiddleware)

// Mount routes
admin.route('/dashboard', dashboardRoutes)
admin.route('/users', userRoutes)
admin.route('/roles', roleRoutes)
admin.route('/communities', communityRoutes)
admin.route('/events', eventRoutes)
admin.route('/volunteers', volunteerRoutes)
admin.route('/reports', reportRoutes)
admin.route('/cms', cmsRoutes)
admin.route('/categories', categoryRoutes)
admin.route('/master-data', masterDataRoutes)
admin.route('/audit-logs', auditLogRoutes)
admin.route('/notifications', notificationRoutes)
admin.route('/settings', settingsRoutes)
admin.route('/security', securityRoutes)

export default admin
```

---

## Dependency Injection

Menggunakan constructor injection tanpa DI container:

```typescript
// Factory function untuk bootstrap services

import { UserRepository } from '../repositories/user.repository'
import { AuditLogService } from './auditLog.service'
import { NotificationService } from './notification.service'
import { UserService } from './user.service'

export function createUserService(): UserService {
  const userRepo = new UserRepository()
  const auditLogService = new AuditLogService()
  const notificationService = new NotificationService()
  return new UserService(userRepo, auditLogService, notificationService)
}
```

---

## Response Format

Semua endpoint mengikuti format response standar:

```typescript
// utils/response.ts

export function successResponse<T>(data: T, statusCode = 200) {
  return {
    success: true,
    data,
    ...(statusCode === 201 ? { message: 'Berhasil dibuat' } : {})
  }
}

export function listResponse<T>(data: T[], total: number, page: number, limit: number) {
  return {
    success: true,
    data: {
      items: data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }
  }
}

export function errorResponse(code: string, message: string, details?: any[]) {
  return {
    success: false,
    error: {
      code,
      message,
      ...(details && { details })
    }
  }
}
```

---

## Package Dependencies

### apps/api

```json
{
  "dependencies": {
    "hono": "^4.x",
    "@prisma/client": "^6.x",
    "jsonwebtoken": "^9.x",
    "bcryptjs": "^2.x",
    "zod": "^3.x",
    "pino": "^9.x",
    "pino-pretty": "^11.x",
    "nodemailer": "^6.x",
    "@aws-sdk/client-s3": "^3.x",
    "date-fns": "^4.x"
  },
  "devDependencies": {
    "tsx": "^4.x",
    "typescript": "^5.x",
    "@types/node": "^22.x",
    "prisma": "^6.x"
  }
}
```

### packages/database

```json
{
  "dependencies": {
    "@prisma/client": "^6.x"
  },
  "devDependencies": {
    "prisma": "^6.x",
    "typescript": "^5.x"
  }
}
```

### packages/shared

```json
{
  "dependencies": {
    "zod": "^3.x"
  },
  "devDependencies": {
    "typescript": "^5.x"
  }
}
```

### packages/constants

```json
{
  "devDependencies": {
    "typescript": "^5.x"
  }
}
```
