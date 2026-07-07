# KomunaID System Architecture

| Item         | Detail              |
| ------------ | ------------------- |
| **Project**  | KomunaID            |
| **Document** | System Architecture |
| **Date**     | 7 Juli 2026         |
| **Status**   | Completed           |

---

## 1. Architecture Principles

### 1.1 Core Principles

| Principle                         | Description                                       | Application                              |
| --------------------------------- | ------------------------------------------------- | ---------------------------------------- |
| **Separation of Concerns**        | Setiap bagian sistem punya tanggung jawab tunggal | Controller ≠ Service ≠ Prisma            |
| **Modularity**                    | Sistem terbagi dalam module yang independent      | 12 feature modules dengan boundary jelas |
| **Single Responsibility**         | Setiap class/function hanya melakukan satu hal    | Service methods, guard responsibilities  |
| **DRY (Don't Repeat Yourself)**   | Hindari kode duplikat, gunakan shared utilities   | `@komunaid/shared`, common layer         |
| **Composition over Inheritance**  | Gunakan composition untuk reuse                   | NestJS modules, service injection        |
| **Convention over Configuration** | Ikuti convention yang sudah ada                   | File naming, module structure            |
| **Fail Fast**                     | Validasi input secepat mungkin                    | ValidationPipe, Guard checks             |
| **Defense in Depth**              | Multiple layers of security                       | Auth + Roles + Scoped + Validation       |

### 1.2 Design Values

- **Maintainability**: Codebase mudah dipahami dan dimodifikasi
- **Testability**: Setiap komponen bisa di-test secara isolated
- **Scalability**: Horizontal scaling tanpa perubahan kode
- **Observability**: Logging, audit, health check untuk debugging
- **Security**: JWT, RBAC, input validation, audit logging

---

## 2. Technology Decisions

### 2.1 MySQL over PostgreSQL

| Factor           | MySQL 8                                   | PostgreSQL               |
| ---------------- | ----------------------------------------- | ------------------------ |
| Team Experience  | ✅ Team lebih familiar                    | ❌ Learning curve        |
| Hosting          | ✅ PlanetScale, AWS RDS, Google Cloud SQL | ✅ Supabase, AWS RDS     |
| JSON Support     | ✅ JSON columns supported                 | ✅ Better JSON operators |
| Full-Text Search | ✅ FULLTEXT index                         | ✅ tsvector              |
| Decision         | ✅ **Dipilih**                            | —                        |

**Rationale**: Team preference untuk MySQL. PlanetScale menawarkan branching workflow yang bagus untuk migration management.

### 2.2 NestJS over Express/Fastify

| Factor            | NestJS             | Express             | Fastify             |
| ----------------- | ------------------ | ------------------- | ------------------- |
| Structure         | ✅ Modular, DI     | ❌ Manual structure | ❌ Manual structure |
| TypeScript        | ✅ First-class     | ⚠️ With config      | ✅ With config      |
| Guards/Middleware | ✅ Built-in        | ❌ Manual           | ❌ Manual           |
| Swagger           | ✅ @nestjs/swagger | ❌ Manual setup     | ❌ Manual setup     |
| Decision          | ✅ **Dipilih**     | —                   | —                   |

**Rationale**: NestJS provides enterprise-grade structure, dependency injection, and built-in support for guards, interceptors, and pipes — ideal for a multi-role platform.

### 2.3 Next.js 15 over Vite/Remix

| Factor     | Next.js 15           | Vite           | Remix          |
| ---------- | -------------------- | -------------- | -------------- |
| SSR        | ✅ App Router        | ⚠️ Manual      | ✅ Built-in    |
| SEO        | ✅ Server components | ❌ Client-side | ✅ Server-side |
| Deployment | ✅ Vercel native     | ⚠️ Manual      | ⚠️ Manual      |
| Ecosystem  | ✅ Largest           | ✅ Growing     | ⚠️ Smaller     |
| Decision   | ✅ **Dipilih**       | —              | —              |

**Rationale**: Next.js 15 App Router provides SSR, SSG, and ISR out of the box. Vercel deployment is seamless. Largest React ecosystem for components and libraries.

### 2.4 Prisma over TypeORM/Drizzle

| Factor      | Prisma                  | TypeORM          | Drizzle         |
| ----------- | ----------------------- | ---------------- | --------------- |
| Type Safety | ✅ Auto-generated types | ⚠️ Manual        | ✅ Schema-first |
| Migrations  | ✅ `prisma migrate`     | ⚠️ Auto/generate | ✅ Manual       |
| DX          | ✅ Best (Prisma Studio) | ⚠️ Good          | ⚠️ Good         |
| Performance | ⚠️ Good                 | ✅ Good          | ✅ Best         |
| Decision    | ✅ **Dipilih**          | —                | —               |

**Rationale**: Prisma provides excellent developer experience with auto-generated types, migration management, and Prisma Studio for database inspection. Performance is adequate for our scale.

### 2.5 JWT over Session-based Auth

| Factor         | JWT            | Session-based |
| -------------- | -------------- | ------------- |
| Scalability    | ✅ Stateless   | ❌ Stateful   |
| Multi-device   | ✅ Yes         | ⚠️ Limited    |
| Revocation     | ⚠️ Harder      | ✅ Easy       |
| Implementation | ✅ Standard    | ⚠️ More setup |
| Decision       | ✅ **Dipilih** | —             |

**Rationale**: JWT stateless auth scales better for future mobile apps. Refresh token rotation provides session management capability.

---

## 3. Frontend Architecture

### 3.1 Framework: Next.js 15 App Router

```
apps/web/src/
├── app/
│   ├── (auth)/                    Auth route group (no layout)
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   ├── forgot-password/page.tsx
│   │   └── reset-password/page.tsx
│   ├── (dashboard)/               Dashboard route group (sidebar layout)
│   │   ├── layout.tsx
│   │   ├── page.tsx               Dashboard home
│   │   ├── communities/
│   │   ├── organizations/
│   │   ├── events/
│   │   └── settings/
│   ├── (public)/                  Public pages (header layout)
│   │   ├── layout.tsx
│   │   ├── page.tsx               Landing page
│   │   ├── communities/
│   │   ├── organizations/
│   │   ├── events/
│   │   └── [username]/
│   ├── layout.tsx                 Root layout
│   ├── not-found.tsx
│   └── error.tsx
├── components/
│   ├── ui/                        shadcn/ui components
│   ├── layout/                    Layout components (Header, Sidebar, Footer)
│   ├── auth/                      Auth-specific components
│   ├── communities/               Community-specific components
│   ├── organizations/             Organization-specific components
│   ├── events/                    Event-specific components
│   └── shared/                    Shared components
├── lib/
│   ├── api.ts                     API client (axios/fetch wrapper)
│   ├── auth.ts                    Auth utilities
│   ├── utils.ts                   General utilities
│   └── design-tokens.ts          Design tokens
├── hooks/
│   ├── useAuth.ts                 Auth hook
│   ├── useCommunity.ts            Community data hooks
│   └── ...                        Other data hooks
└── types/
    └── index.ts                   Frontend types
```

### 3.2 Server vs Client Components

| Component Type                        | Usage                         | Example                           |
| ------------------------------------- | ----------------------------- | --------------------------------- |
| **Server Component** (default)        | Data fetching, static content | Community list page, Event detail |
| **Client Component** (`'use client'`) | Interactivity, forms, state   | Login form, Search bar, Modals    |
| **Layout Component**                  | Persistent UI                 | Header, Sidebar, Footer           |

### 3.3 State Management: React Query

| State Type       | Solution                     | Example                      |
| ---------------- | ---------------------------- | ---------------------------- |
| **Server State** | React Query (TanStack Query) | API data, pagination, cache  |
| **Client State** | React useState/useContext    | UI state, modals, form state |
| **URL State**    | Next.js searchParams         | Filters, pagination, search  |

```typescript
// React Query example
export function useCommunities(query: QueryCommunityDto) {
  return useQuery({
    queryKey: ['communities', query],
    queryFn: () => api.get('/communities', { params: query }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
```

### 3.4 Styling: Tailwind CSS + shadcn/ui

- **Utility-first**: Tailwind CSS for rapid development
- **Components**: shadcn/ui for pre-built, accessible components
- **Design Tokens**: Centralized in `lib/design-tokens.ts`
- **Dark Mode**: CSS variable based, system preference detection
- **Responsive**: Mobile-first, breakpoints at sm/md/lg/xl

### 3.5 API Client

```typescript
// lib/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1',
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    if (error.response?.status === 401) {
      // Attempt refresh
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        return api(error.config);
      }
      // Redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);
```

---

## 4. Backend Architecture

### 4.1 NestJS Modular Monolith

```
┌─────────────────────────────────────────────────────┐
│                   AppModule                           │
│                                                       │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐            │
│  │ Auth     │ │ Users    │ │ Roles    │            │
│  │ Module   │ │ Module   │ │ Module   │            │
│  └──────────┘ └──────────┘ └──────────┘            │
│                                                       │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐            │
│  │ Communi- │ │ Organi-  │ │ Events   │            │
│  │ ties     │ │ zations  │ │ Module   │            │
│  └──────────┘ └──────────┘ └──────────┘            │
│                                                       │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐            │
│  │ Posts    │ │ Catego-  │ │ Notifi-  │            │
│  │ Module   │ │ ries     │ │ cations  │            │
│  └──────────┘ └──────────┘ └──────────┘            │
│                                                       │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐            │
│  │ Reports  │ │ Admin    │ │ Contact  │            │
│  │ Module   │ │ Module   │ │ Module   │            │
│  └──────────┘ └──────────┘ └──────────┘            │
│                                                       │
│  ┌──────────────────────────────────────┐           │
│  │         Common Layer                  │           │
│  │  PrismaModule | Auth | Guards        │           │
│  │  Interceptors | Filters | Middleware  │           │
│  │  Email | Config | Decorators         │           │
│  └──────────────────────────────────────┘           │
└─────────────────────────────────────────────────────┘
```

### 4.2 Module Boundaries

- **Each module** owns its controller, service, DTOs
- **Cross-module** communication via NestJS DI (inject service)
- **No circular dependencies** — use `forwardRef()` when needed
- **Shared infrastructure** in `common/` — never in feature modules

### 4.3 Dependency Graph

```
Auth ──────────▶ Users
  │               │
  ▼               ▼
Roles ◀──── Community Members
  │               │
  ▼               ▼
Communities ◀── Posts
  │
  ▼
Organizations ◀── Events
                    │
                    ▼
              Notifications ◀── Reports
                    │
                    ▼
                  Admin
```

### 4.4 Shared Common Layer

| Component                    | Location               | Purpose             |
| ---------------------------- | ---------------------- | ------------------- |
| PrismaModule                 | `common/prisma/`       | Database connection |
| AuthGuard                    | `common/guards/`       | JWT verification    |
| RolesGuard                   | `common/guards/`       | Platform role check |
| ScopedPermissionGuard        | `common/guards/`       | Scope-based check   |
| AuditLogInterceptor          | `common/interceptors/` | Mutation logging    |
| TransformResponseInterceptor | `common/interceptors/` | Response wrapping   |
| RequestIdMiddleware          | `common/middleware/`   | Request ID stamp    |
| EmailAdapter                 | `common/email/`        | Email abstraction   |
| AllExceptionsFilter          | `common/filters/`      | Error handling      |
| CurrentUser decorator        | `common/decorators/`   | User extraction     |
| Roles decorator              | `common/decorators/`   | Role metadata       |
| ScopedPermission decorator   | `common/decorators/`   | Scope metadata      |

---

## 5. Database Architecture

### 5.1 MySQL 8 Configuration

| Setting   | Value              | Reason                             |
| --------- | ------------------ | ---------------------------------- |
| Engine    | InnoDB             | ACID, row-level locking            |
| Charset   | utf8mb4            | Full Unicode support (emoji, etc.) |
| Collation | utf8mb4_unicode_ci | Case-insensitive comparison        |
| Timezone  | UTC                | Consistent timezone handling       |

### 5.2 Prisma ORM Strategy

| Aspect        | Decision                                      |
| ------------- | --------------------------------------------- |
| Primary Keys  | UUID (VARCHAR(36)) — distributed-friendly     |
| Column Naming | snake_case via `@map`                         |
| Table Naming  | snake_case via `@@map`                        |
| Timestamps    | `createdAt` + `updatedAt` + `deletedAt`       |
| Soft Deletes  | On User, Community, Organization, Event, Post |
| Cascading     | `onDelete: Cascade` for owned relationships   |

### 5.3 Migration Strategy

```
Development Flow:
1. Edit schema.prisma
2. Run: pnpm prisma migrate dev --name description
3. Review generated SQL in migrations/
4. Commit migration files to git

Production Flow:
1. Merge to main branch
2. CI/CD runs: pnpm prisma migrate deploy
3. Apply pending migrations in order
4. No manual SQL — Prisma manages all migrations
```

### 5.4 Seed Strategy

```typescript
// packages/database/prisma/seed.ts
// Seeds:
// 1. System roles (SUPER_ADMIN → MEMBER)
// 2. Default categories (Technology, Education, etc.)
// 3. Platform settings (site name, maintenance mode, etc.)
// 4. Admin user (admin@komunaid.com)
// 5. Sample data (for development only)
```

### 5.5 Index Strategy

| Index Type      | Application           | Example                          |
| --------------- | --------------------- | -------------------------------- |
| **Primary**     | All tables            | UUID primary key                 |
| **Unique**      | Email, username, slug | User email, Community slug       |
| **Composite**   | Scoped roles          | [userId, roleId, scope, scopeId] |
| **Foreign Key** | All relations         | communityId, userId, eventId     |
| **Query**       | Filter columns        | status, category, startDate      |
| **Soft Delete** | deletedAt             | Filter out deleted records       |

---

## 6. Authentication Architecture

### 6.1 JWT Token Design

```
Access Token (15 min):
{
  "sub": "user-uuid",
  "email": "user@example.com",
  "username": "user123",
  "iat": 1720358400,
  "exp": 1720359300
}

Refresh Token (30 days):
{
  "sub": "user-uuid",
  "type": "refresh",
  "iat": 1720358400,
  "exp": 1722864000
}
```

### 6.2 Token Flow

```
Login:
1. POST /auth/login { email, password }
2. Validate credentials (bcrypt)
3. Generate access token (15 min)
4. Generate refresh token (30 days)
5. Return { accessToken, refreshToken }

Authenticated Request:
1. Authorization: Bearer <accessToken>
2. AuthGuard verifies JWT
3. Load user + roles from DB
4. Attach to request.user

Token Refresh:
1. POST /auth/refresh { refreshToken }
2. Verify refresh token
3. Rotate: invalidate old, issue new
4. Return { accessToken, refreshToken }

Logout:
1. POST /auth/logout
2. Invalidate refresh token
3. Client clears tokens
```

### 6.3 Password Hashing

| Parameter  | Value                     |
| ---------- | ------------------------- |
| Algorithm  | bcrypt                    |
| Rounds     | 12                        |
| Max Length | 72 bytes (bcrypt limit)   |
| Frontend   | Never hash on client side |

### 6.4 Role-Based Access Control

```
Guard Chain:
Request → AuthGuard → RolesGuard → ScopedPermissionGuard → Controller

Platform Roles (no scope):
  SUPER_ADMIN (100) → everything
  PLATFORM_ADMIN (80) → user management, settings
  MEMBER (10) → basic access

Scoped Roles (with scope + scopeId):
  ORG_OWNER (60) → full org management
  ORG_ADMIN (50) → org member management
  COMMUNITY_OWNER (40) → full community management
  COMMUNITY_ADMIN (30) → community member management
  EVENT_MANAGER (20) → event management
  MEMBER (10) → community org member
```

### 6.5 Email Verification

```
1. User registers → unverified account
2. Generate verification token (crypto.randomBytes)
3. Store token hash in DB (or use JWT with short expiry)
4. Send verification email with link
5. User clicks link → GET /auth/verify-email?token=xxx
6. Update user.emailVerified = true
7. User can now access full features
```

### 6.6 Password Reset

```
1. User requests reset → POST /auth/forgot-password { email }
2. Generate reset token (crypto.randomBytes)
3. Store token hash with expiry (1 hour)
4. Send reset email with link
5. User clicks link → enters new password
6. POST /auth/reset-password { token, newPassword }
7. Verify token, update password
8. Invalidate all refresh tokens (force re-login)
```

---

## 7. File Storage Architecture

### 7.1 Presigned URL Pattern

```
┌────────┐     ┌──────────┐     ┌──────────┐
│ Client  │────▶│ API      │────▶│ S3       │
│ Browser │     │ NestJS   │     │ Storage  │
└────────┘     └──────────┘     └──────────┘

Flow:
1. Client → API: Request presigned URL
   POST /uploads/presigned-url
   { fileName, fileType, fileSize, entityType, entityId }

2. API:
   a. Validate file type (whitelist)
   b. Validate file size (per category)
   c. Create MediaAsset record (PENDING)
   d. Generate S3 presigned URL (PUT, 15 min expiry)
   e. Return { uploadUrl, assetId, url }

3. Client → S3: Upload file directly
   PUT { uploadUrl }
   Body: file binary

4. Client → API: Confirm upload
   PATCH /uploads/{assetId}/confirm

5. API:
   a. Update MediaAsset status → COMPLETED
   b. Return asset metadata
```

### 7.2 Storage Buckets

| Bucket               | Purpose                     | Access                |
| -------------------- | --------------------------- | --------------------- |
| `komunaid-avatars`   | User profile photos         | Public read           |
| `komunaid-banners`   | Community/org/event banners | Public read           |
| `komunaid-events`    | Event cover images          | Public read           |
| `komunaid-posts`     | Post cover images           | Public read           |
| `komunaid-documents` | Uploaded documents          | Private (signed URLs) |

### 7.3 MediaAsset Table

```sql
CREATE TABLE media_assets (
  id VARCHAR(36) PRIMARY KEY,
  file_name VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  size INT NOT NULL,
  url VARCHAR(500) NOT NULL,
  thumbnail_url VARCHAR(500),
  uploaded_by VARCHAR(36) NOT NULL,
  entity_type VARCHAR(50),
  entity_id VARCHAR(36),
  status VARCHAR(20) DEFAULT 'PENDING',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME ON UPDATE CURRENT_TIMESTAMP
);
```

### 7.4 Security

- **No direct server upload**: Files go directly to S3
- **Type validation**: Whitelist MIME types + magic byte verification
- **Size limits**: Per-category limits enforced at API level
- **Presigned URL expiry**: 15 min for upload, 1 hour for download
- **Access control**: Private files use signed URLs
- **Cleanup**: Orphaned PENDING records cleaned periodically

---

## 8. Email Architecture

### 8.1 EmailAdapter Interface

```typescript
interface EmailAdapter {
  send(options: SendEmailOptions): Promise<void>;
  sendTemplate<T>(options: SendTemplateOptions<T>): Promise<void>;
}

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

interface SendTemplateOptions<T> {
  to: string | string[];
  template: EmailTemplate;
  data: T;
}
```

### 8.2 Adapter Implementations

| Adapter            | Environment      | Behavior                    |
| ------------------ | ---------------- | --------------------------- |
| **ResendAdapter**  | Production       | Sends via Resend API        |
| **SmtpAdapter**    | Staging/Fallback | Sends via SMTP (nodemailer) |
| **ConsoleAdapter** | Development      | Logs email to console       |

### 8.3 Email Templates

| Template               | Trigger                  | Content                         |
| ---------------------- | ------------------------ | ------------------------------- |
| **Verification**       | User registration        | Email verification link         |
| **Password Reset**     | Forgot password request  | Password reset link             |
| **Welcome**            | After email verification | Welcome message                 |
| **Event Registration** | Event signup             | Registration confirmation       |
| **Community Approved** | Admin approval           | Community approved notification |

### 8.4 Template Strategy

- Templates stored as HTML files or inline strings
- Variable interpolation via template engine (Handlebars or string replace)
- Responsive email design (mobile-friendly)
- Fallback plain text version
- Unsubscribe link (for future marketing emails)

---

## 9. Notification Architecture

### 9.1 In-App Notification System

Notifications are database-driven, displayed in the web interface:

```typescript
interface Notification {
  id: string;
  userId: string; // Recipient
  type: string; // EVENT_REGISTRATION, COMMUNITY_APPROVED, etc.
  title: string; // Short title
  message: string; // Detailed message
  data?: string; // JSON: { entityType, entityId, actionUrl }
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
}
```

### 9.2 Notification Types

| Type                 | Trigger                  | Example                                   |
| -------------------- | ------------------------ | ----------------------------------------- |
| `EVENT_REGISTRATION` | User registers for event | "You registered for Tech Meetup"          |
| `EVENT_CANCELLATION` | Event cancelled          | "Tech Meetup has been cancelled"          |
| `COMMUNITY_APPROVED` | Admin approves community | "Your community has been approved"        |
| `COMMUNITY_REJECTED` | Admin rejects community  | "Your community needs changes"            |
| `MEMBER_JOINED`      | User joins community     | "New member joined your community"        |
| `MEMBER_LEFT`        | User leaves community    | "A member left your community"            |
| `REPORT_RESOLVED`    | Admin resolves report    | "Your report has been reviewed"           |
| `ROLE_ASSIGNED`      | Admin assigns role       | "You've been promoted to Community Admin" |

### 9.3 Notification Creation Flow

```
Service Action → NotificationService.create() → notifications table
                         │
                         ▼
                  Notification created
                         │
                         ▼
                  Client polls/unreads on next request
                  GET /notifications → unread count in response
```

### 9.4 Future Enhancements

- **Email notifications**: Send digest emails for important notifications
- **Push notifications**: Browser push API / Firebase Cloud Messaging
- **Real-time**: WebSocket for live notification updates
- **Notification preferences**: User can configure which notifications to receive

---

## 10. Monitoring & Observability

### 10.1 Structured Logging

All logs output as JSON for machine parsing:

```json
{
  "level": "info",
  "timestamp": "2026-07-07T10:00:00.000Z",
  "context": "CommunitiesService",
  "message": "Community created",
  "requestId": "a1b2c3d4",
  "userId": "user-uuid",
  "communityId": "community-uuid",
  "duration": 45
}
```

### 10.2 Audit Trail

Every mutation is recorded in `audit_logs`:

| Field        | Purpose                            |
| ------------ | ---------------------------------- |
| `userId`     | Who performed the action           |
| `action`     | What was done (HTTP method + path) |
| `entityType` | What entity was affected           |
| `entityId`   | Which specific entity              |
| `oldValues`  | Previous state (JSON)              |
| `newValues`  | New state (JSON)                   |
| `ipAddress`  | Client IP                          |
| `userAgent`  | Client user agent                  |
| `metadata`   | Duration, requestId, etc.          |

### 10.3 Health Check Endpoint

```
GET /api/v1/health

Response:
{
  "status": "healthy",
  "timestamp": "2026-07-07T10:00:00.000Z",
  "uptime": 86400,
  "checks": {
    "database": { "status": "up", "latency": 2 },
    "memory": { "status": "ok", "usage": "45%" }
  }
}
```

### 10.4 APM Integration (Future)

| Tool            | Purpose                                | Status  |
| --------------- | -------------------------------------- | ------- |
| **Sentry**      | Error tracking, performance monitoring | Planned |
| **Datadog**     | APM, infrastructure monitoring         | Planned |
| **Betterstack** | Uptime monitoring                      | Planned |
| **Grafana**     | Dashboard, alerting                    | Planned |

### 10.5 Key Metrics to Monitor

| Metric                         | Alert Threshold |
| ------------------------------ | --------------- |
| API response time (p95)        | > 500ms         |
| API error rate                 | > 1%            |
| Database connection pool usage | > 80%           |
| Memory usage                   | > 80%           |
| CPU usage                      | > 70%           |
| Failed login attempts          | > 10/min per IP |
| Queue depth (future)           | > 100           |

### 10.6 Log Retention

| Log Type         | Retention | Storage        |
| ---------------- | --------- | -------------- |
| Application logs | 30 days   | Console / file |
| Audit logs       | 1 year    | Database       |
| Error logs       | 90 days   | Sentry         |
| Access logs      | 30 days   | Cloud provider |
