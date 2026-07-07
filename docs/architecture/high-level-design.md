# KomunaID High-Level Design

| Item         | Detail            |
| ------------ | ----------------- |
| **Project**  | KomunaID          |
| **Document** | High-Level Design |
| **Date**     | 7 Juli 2026       |
| **Status**   | Completed         |

---

## 1. System Context Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          KomunaID Platform                                   │
│                                                                             │
│  ┌──────────┐     ┌──────────────┐     ┌──────────────────────────────┐    │
│  │  Client   │     │    CDN        │     │       Next.js Frontend       │    │
│  │ (Browser) │────▶│  (Vercel)     │────▶│    (apps/web - port 3000)    │    │
│  └──────────┘     └──────────────┘     └──────────┬───────────────────┘    │
│                                                     │                       │
│                                                     │ HTTP/REST            │
│                                                     ▼                       │
│                                        ┌──────────────────────────────┐    │
│                                        │     REST API (NestJS)        │    │
│                                        │    (apps/api - port 4000)    │    │
│                                        └──────┬───────────────────────┘    │
│                                               │                            │
│                              ┌────────────────┼────────────────┐           │
│                              │                │                │           │
│                              ▼                ▼                ▼           │
│                    ┌──────────────┐  ┌──────────────┐  ┌──────────┐       │
│                    │  MySQL 8     │  │ Object       │  │ Email    │       │
│                    │  Database    │  │ Storage      │  │ Service  │       │
│                    │              │  │ (S3/Vercel)  │  │ (Resend) │       │
│                    └──────────────┘  └──────────────┘  └──────────┘       │
│                                                                             │
│                              ┌──────────────────────┐                      │
│                              │ In-App Notification   │                      │
│                              │ (DB-based)            │                      │
│                              └──────────────────────┘                      │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Context Actors

| Actor                   | Interaction                                                                                  |
| ----------------------- | -------------------------------------------------------------------------------------------- |
| **End User (Browser)**  | Accesses the platform via web browser, authenticates, interacts with communities/orgs/events |
| **Platform Admin**      | Manages users, roles, settings, reviews reports via admin dashboard                          |
| **Community/Org Owner** | Creates and manages their community/organization, approves members                           |
| **Event Manager**       | Creates events, manages registrations, handles attendees                                     |

---

## 2. Container Diagram

### 2.1 Next.js Web Application

| Property             | Value                         |
| -------------------- | ----------------------------- |
| **Package**          | `apps/web` (`@komunaid/web`)  |
| **Framework**        | Next.js 15 App Router         |
| **Port**             | 3000 (dev)                    |
| **Deployment**       | Vercel (Edge Network)         |
| **UI Library**       | Tailwind CSS + shadcn/ui      |
| **State Management** | React Query (server state)    |
| **Auth**             | JWT stored in httpOnly cookie |

**Responsibilities:**

- Server-side rendering for SEO-critical pages
- Client-side interactivity for dashboard/management pages
- Form handling with client-side validation (Zod)
- Image optimization via next/image
- Route protection via middleware

### 2.2 NestJS API Server

| Property       | Value                                  |
| -------------- | -------------------------------------- |
| **Package**    | `apps/api` (`@komunaid/api`)           |
| **Framework**  | NestJS 10                              |
| **Port**       | 4000 (dev)                             |
| **Deployment** | Docker container (Cloud Run / Railway) |
| **API Style**  | REST v1 with JSON                      |
| **Docs**       | Swagger/OpenAPI at `/api/docs`         |

**Responsibilities:**

- Business logic for all 13 feature modules
- JWT authentication & authorization
- Input validation via class-validator
- Audit logging for mutations
- File upload via presigned URLs
- Email sending via adapter pattern

### 2.3 MySQL Database

| Property       | Value                         |
| -------------- | ----------------------------- |
| **Engine**     | MySQL 8                       |
| **ORM**        | Prisma 6.10                   |
| **Tables**     | 19 core tables                |
| **Connection** | Connection pooling via Prisma |

**Responsibilities:**

- Persistent storage for all platform data
- Referential integrity via foreign keys
- Query performance via strategic indexes
- Soft deletes for data recovery

### 2.4 Object Storage

| Property           | Value                                        |
| ------------------ | -------------------------------------------- |
| **Provider**       | S3-compatible (AWS S3 / Vercel Blob)         |
| **Access Pattern** | Presigned URLs                               |
| **File Types**     | Images (avatars, banners, covers), documents |

**Responsibilities:**

- Store user-uploaded files (avatars, banners, event images)
- Serve files via CDN
- Presigned URL generation for secure uploads
- File type and size validation

### 2.5 Email Service

| Property      | Value                            |
| ------------- | -------------------------------- |
| **Provider**  | Resend (primary) / SMTP fallback |
| **Pattern**   | Adapter interface                |
| **Templates** | Transactional emails             |

**Responsibilities:**

- Send verification emails
- Send password reset emails
- Send notification digests (future)
- Send event reminders (future)

---

## 3. Monorepo Package Structure

```
komunaid/
├── apps/
│   ├── api/                            NestJS REST API
│   │   ├── src/
│   │   │   ├── main.ts                 Bootstrap entry
│   │   │   ├── app.module.ts           Root module
│   │   │   ├── common/                 Shared infrastructure
│   │   │   └── modules/               13 feature modules
│   │   ├── test/                       API tests
│   │   ├── Dockerfile                  API container
│   │   ├── nest-cli.json              NestJS config
│   │   ├── tsconfig.json              TypeScript config
│   │   └── package.json               Dependencies
│   │
│   └── web/                            Next.js Frontend
│       ├── src/
│       │   ├── app/                    App Router pages
│       │   ├── components/             React components
│       │   ├── lib/                    Utilities, API client
│       │   ├── hooks/                  Custom React hooks
│       │   └── types/                  Frontend types
│       ├── public/                     Static assets
│       ├── next.config.ts              Next.js config
│       ├── tailwind.config.ts          Tailwind config
│       ├── tsconfig.json               TypeScript config
│       └── package.json                Dependencies
│
├── packages/
│   ├── database/                       Prisma package
│   │   ├── prisma/
│   │   │   ├── schema.prisma           Database schema
│   │   │   ├── migrations/             Migration files
│   │   │   └── seed.ts                 Seed script
│   │   ├── src/
│   │   │   └── index.ts               PrismaClient singleton
│   │   └── package.json
│   │
│   └── shared/                         Shared package
│       ├── src/
│       │   ├── types/                  TypeScript types
│       │   ├── enums/                  Enum definitions
│       │   ├── validators/             Zod validators
│       │   ├── constants/              App constants
│       │   │   └── roles.ts            Role hierarchy
│       │   └── utils/                  Utility functions
│       └── package.json
│
├── tools/                              Build & dev tooling
├── docs/                               Project documentation
├── .github/workflows/                  CI/CD pipelines
├── pnpm-workspace.yaml                Workspace config
└── package.json                        Root package.json
```

### Package Dependencies

```
@komunaid/api
  ├── @komunaid/database    (Prisma client)
  └── @komunaid/shared      (Types, validators)

@komunaid/web
  └── @komunaid/shared      (Types, validators)

@komunaid/database
  └── (prisma - external)

@komunaid/shared
  └── (zod - external)
```

---

## 4. Data Flow

### 4.1 Request Lifecycle

```
Client Request
      │
      ▼
┌─────────────────────────────┐
│ 1. Vercel Edge / CDN        │  Static assets served from edge
└─────────────┬───────────────┘
              │ Dynamic request
              ▼
┌─────────────────────────────┐
│ 2. Next.js Frontend         │  SSR/CSR routing
│    (App Router)             │
└─────────────┬───────────────┘
              │ API call (fetch/axios)
              ▼
┌─────────────────────────────┐
│ 3. NestJS API               │
│    ├─ RequestIdMiddleware   │  Stamps x-request-id
│    ├─ AuthGuard             │  JWT verify → load user + roles
│    ├─ RolesGuard            │  Check platform roles
│    ├─ ScopedPermissionGuard │  Check scoped permissions
│    ├─ ValidationPipe        │  DTO validation (whitelist + transform)
│    ├─ Controller            │  Route handling
│    ├─ Service               │  Business logic
│    ├─ PrismaService         │  Database queries
│    ├─ TransformInterceptor  │  Wrap response: { success, data, message, meta }
│    └─ AuditLogInterceptor   │  Log mutations to audit_logs
└─────────────┬───────────────┘
              │ SQL queries
              ▼
┌─────────────────────────────┐
│ 4. MySQL 8                  │  Execute queries, return results
└─────────────────────────────┘
```

### 4.2 Authentication Flow

```
1. User submits credentials → POST /api/v1/auth/login
2. AuthController → AuthService.login()
3. Validate credentials (bcrypt compare)
4. Generate access token (15 min) + refresh token (30 days)
5. Return tokens to client
6. Client stores access token (memory) + refresh token (cookie)
7. Subsequent requests: Authorization: Bearer <access_token>
8. AuthGuard verifies JWT, loads user from DB
9. On token expiry: POST /api/v1/auth/refresh → new access token
```

### 4.3 File Upload Flow

```
1. Client requests presigned URL → POST /api/v1/uploads/presigned-url
2. API generates presigned URL (S3 PUT) + creates MediaAsset record
3. Client uploads file directly to S3 using presigned URL
4. Client notifies API → PATCH /api/v1/uploads/{id}/confirm
5. API updates MediaAsset status to COMPLETED
```

### 4.4 Notification Flow

```
1. Service performs action (e.g., event registration)
2. Service calls NotificationService.create()
3. NotificationService inserts into notifications table
4. User's next API request includes unread count in response
5. Client fetches notifications list → GET /api/v1/notifications
6. User marks as read → PATCH /api/v1/notifications/{id}/read
```

---

## 5. Deployment Architecture

### 5.1 Frontend Deployment (Vercel)

```
GitHub Push → Vercel Build → Preview/Production Deployment
                                │
                                ├── Build: next build
                                ├── Output: Static + Serverless Functions
                                ├── Edge: Middleware (auth redirect)
                                └── Domain: komunaid.vercel.app → custom domain
```

| Property    | Value                             |
| ----------- | --------------------------------- |
| Platform    | Vercel                            |
| Build       | Automatic on push to main/preview |
| Environment | Vercel Environment Variables      |
| Domains     | Custom domain with SSL            |
| Preview     | Per-PR preview deployments        |

### 5.2 API Deployment (Containerized)

```
GitHub Push → Docker Build → Container Registry → Cloud Run / Railway
                                                      │
                                                      ├── Port: 4000
                                                      ├── Replicas: Auto-scaling
                                                      ├── Health: /api/v1/health
                                                      └── Env: Environment Variables
```

| Property     | Value                                  |
| ------------ | -------------------------------------- |
| Container    | Docker (multi-stage build)             |
| Registry     | Docker Hub / GitHub Container Registry |
| Runtime      | Google Cloud Run / Railway             |
| Scaling      | Auto-scaling (0-10 instances)          |
| Health Check | GET /api/v1/health                     |

### 5.3 Database (Managed MySQL)

| Property   | Value                                    |
| ---------- | ---------------------------------------- |
| Provider   | PlanetScale / AWS RDS / Google Cloud SQL |
| Engine     | MySQL 8                                  |
| Connection | Prisma connection pool                   |
| Backups    | Daily automated backups                  |
| Migrations | `prisma migrate deploy` in CI/CD         |

### 5.4 Environment Strategy

| Environment     | Frontend           | API               | Database      |
| --------------- | ------------------ | ----------------- | ------------- |
| **Development** | localhost:3000     | localhost:4000    | Local MySQL   |
| **Preview**     | Vercel preview URL | Cloud Run staging | Staging DB    |
| **Production**  | komunaid.com       | Cloud Run prod    | Production DB |

---

## 6. Integration Points

### 6.1 Email Provider

| Property  | Value                                 |
| --------- | ------------------------------------- |
| Primary   | Resend (API-based)                    |
| Fallback  | SMTP (nodemailer)                     |
| Dev Mode  | Console adapter (logs to console)     |
| Interface | `EmailAdapter` (send, sendTemplate)   |
| Templates | Verification, password reset, welcome |

```
EmailAdapter Interface:
  ├── send(to, subject, html) → Promise<void>
  ├── sendTemplate(to, template, data) → Promise<void>
  └── Adapters:
      ├── ResendEmailAdapter (production)
      ├── SmtpEmailAdapter (fallback)
      └── ConsoleEmailAdapter (development)
```

### 6.2 Object Storage

| Property        | Value                                                     |
| --------------- | --------------------------------------------------------- |
| Provider        | S3-compatible (AWS S3 / Vercel Blob)                      |
| Access          | Presigned URLs (PUT for upload, GET for download)         |
| Buckets         | `komunaid-avatars`, `komunaid-banners`, `komunaid-events` |
| File Validation | Type whitelist, max size 5MB                              |
| Tracking        | `media_assets` table records all uploads                  |

### 6.3 Logging

| Level   | Usage                               | Destination             |
| ------- | ----------------------------------- | ----------------------- |
| `error` | System errors, unhandled exceptions | Console + file (future) |
| `warn`  | Deprecation, performance warnings   | Console                 |
| `info`  | Request lifecycle, business events  | Console                 |
| `debug` | Development debugging               | Console (dev only)      |

**Structured Format:**

```json
{
  "level": "info",
  "timestamp": "2026-07-07T10:00:00.000Z",
  "context": "AuthService",
  "message": "User logged in",
  "requestId": "uuid",
  "userId": "uuid"
}
```

### 6.4 Monitoring (Future-Ready)

| Tool            | Purpose                            | Status                     |
| --------------- | ---------------------------------- | -------------------------- |
| Health Check    | GET /api/v1/health                 | Implemented                |
| Structured Logs | JSON log format                    | Implemented                |
| Audit Logs      | Mutation trail                     | Implemented                |
| APM             | Application performance monitoring | Planned (Sentry / Datadog) |
| Error Tracking  | Exception capture                  | Planned (Sentry)           |
| Uptime          | Service availability               | Planned (Betterstack)      |

---

## 7. CI/CD Pipeline

### 7.1 GitHub Actions Workflow

```yaml
# .github/workflows/ci.yml

name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  lint:
    name: Lint
    runs-on: ubuntu-latest
    steps:
      - Checkout
      - Setup pnpm
      - Install dependencies
      - Run: pnpm lint

  typecheck:
    name: Type Check
    runs-on: ubuntu-latest
    steps:
      - Checkout
      - Setup pnpm
      - Install dependencies
      - Run: pnpm typecheck

  test:
    name: Test
    runs-on: ubuntu-latest
    services:
      mysql:
        image: mysql:8
        env:
          MYSQL_ROOT_PASSWORD: test
          MYSQL_DATABASE: komunaid_test
    steps:
      - Checkout
      - Setup pnpm
      - Install dependencies
      - Run: prisma migrate deploy
      - Run: pnpm test

  build:
    name: Build
    needs: [lint, typecheck, test]
    runs-on: ubuntu-latest
    steps:
      - Checkout
      - Setup pnpm
      - Install dependencies
      - Run: pnpm build

  deploy-preview:
    name: Deploy Preview
    needs: [build]
    if: github.event_name == 'pull_request'
    runs-on: ubuntu-latest
    steps:
      - Deploy to Vercel (preview)
      - Deploy API to Cloud Run (staging)

  deploy-production:
    name: Deploy Production
    needs: [build]
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - Deploy to Vercel (production)
      - Deploy API to Cloud Run (production)
      - Run: prisma migrate deploy (production DB)
```

### 7.2 Pipeline Stages

| Stage                 | Tools                       | Gate         |
| --------------------- | --------------------------- | ------------ |
| **Lint**              | ESLint, Prettier            | Must pass    |
| **Type Check**        | TypeScript                  | Must pass    |
| **Test**              | Jest, Supertest             | Must pass    |
| **Build**             | Next.js build, NestJS build | Must pass    |
| **Deploy Preview**    | Vercel, Cloud Run           | Auto on PR   |
| **Deploy Production** | Vercel, Cloud Run, Prisma   | Auto on main |

### 7.3 Branch Strategy

| Branch      | Purpose               | Deploy Target            |
| ----------- | --------------------- | ------------------------ |
| `main`      | Production-ready code | Production               |
| `develop`   | Integration branch    | Staging                  |
| `feature/*` | Feature development   | Preview (PR)             |
| `hotfix/*`  | Production fixes      | Production (after merge) |

### 7.4 Quality Gates

- [ ] All lint rules pass (zero warnings in CI)
- [ ] All TypeScript types check (zero errors)
- [ ] Test coverage ≥ 80% for business logic
- [ ] Build succeeds for all packages
- [ ] No security vulnerabilities in dependencies (audit)
- [ ] Database migrations are backward-compatible

---

## 8. Container Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              KomunaID Platform                                   │
│                                                                                 │
│  ┌──────────────┐   HTTPS    ┌──────────────────┐   HTTPS    ┌───────────────┐ │
│  │              │───────────▶│                  │───────────▶│               │ │
│  │   Client     │            │  CDN (Vercel     │            │  Next.js      │ │
│  │  (Browser)   │◀───────────│  Edge Network)   │◀───────────│  Web App      │ │
│  │              │            │                  │            │  (apps/web)   │ │
│  └──────────────┘            └──────────────────┘            │  Port: 3000   │ │
│                                                              └───────┬───────┘ │
│                                                                      │         │
│                                                                  HTTP/REST     │
│                                                                      │         │
│                                                              ┌───────▼───────┐ │
│                                                              │               │ │
│                                                              │  NestJS API   │ │
│                                                              │  (apps/api)   │ │
│                                                              │  Port: 4000   │ │
│                                                              │               │ │
│  ┌───────────────────────────────────────────────────────────┼───────────────┘ │
│  │                          │           │           │                           │
│  │              TCP         │  HTTPS    │  HTTPS    │   DB Write               │
│  │            ┌─────────────┼───────────┼───────────┼──────────┐               │
│  │            │             │           │           │          │               │
│  │            ▼             ▼           ▼           ▼          ▼               │
│  │  ┌──────────────┐ ┌───────────┐ ┌─────────┐ ┌────────────────────────┐    │
│  │  │  MySQL 8     │ │  S3/Vercel│ │ Resend  │ │ notifications table    │    │
│  │  │  Database    │ │  Blob     │ │  Email  │ │ (in-app notification)  │    │
│  │  │  (Hostinger) │ │  Storage  │ │ Service │ │                        │    │
│  │  └──────────────┘ └───────────┘ └─────────┘ └────────────────────────┘    │
│  └────────────────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Container Inventory

| Container                     | Technology                                     | Port        | Responsibility                                                                                                                       |
| ----------------------------- | ---------------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| **Client (Browser)**          | Modern browser (Chrome, Firefox, Safari, Edge) | N/A         | User interface rendering, form submission, JWT storage (httpOnly cookie), client-side routing                                        |
| **CDN (Vercel Edge Network)** | Vercel Edge                                    | 443 (HTTPS) | Static asset caching, edge middleware (auth redirects, A/B testing), DDoS protection, global edge delivery                           |
| **Next.js Web App**           | Next.js 15 App Router, React 19, Tailwind CSS  | 3000        | SSR/SSG page rendering, API route proxying, image optimization, middleware-based route protection, form handling with Zod validation |
| **NestJS API**                | NestJS 10, TypeScript, Prisma 6.10             | 4000        | Business logic for all 13 feature modules, JWT auth, input validation, audit logging, presigned URL generation, email dispatch       |
| **MySQL 8 Database**          | MySQL 8, managed (Hostinger)                   | 3306 (TCP)  | Persistent data storage, 19 core tables, referential integrity, strategic indexing, soft deletes                                     |
| **Object Storage**            | S3-compatible (Vercel Blob)                    | 443 (HTTPS) | File storage (avatars, banners, event images, documents), presigned URL uploads, CDN-backed file serving                             |
| **Email Service**             | Resend API                                     | 443 (HTTPS) | Transactional email delivery (verification, password reset, welcome), template rendering                                             |
| **Notifications Table**       | MySQL 8 (within managed DB)                    | N/A         | In-app notification storage, read/unread state, DB-write pattern for real-time notification creation                                 |

---

## 9. Component Diagram — NestJS API

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                          NestJS API (apps/api)                                │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │                       AppModule (Root)                                   │ │
│  │                                                                         │ │
│  │  ┌────────────┐ ┌────────────┐ ┌──────────────┐ ┌──────────────────┐  │ │
│  │  │   Auth     │ │   Users    │ │  Communities │ │  Organizations   │  │ │
│  │  │   Module   │ │   Module   │ │    Module    │ │     Module       │  │ │
│  │  └────────────┘ └────────────┘ └──────────────┘ └──────────────────┘  │ │
│  │                                                                         │ │
│  │  ┌────────────┐ ┌────────────┐ ┌──────────────┐ ┌──────────────────┐  │ │
│  │  │  Events    │ │   Posts    │ │ Categories   │ │  Notifications   │  │ │
│  │  │  Module    │ │   Module   │ │   Module     │ │     Module       │  │ │
│  │  └────────────┘ └────────────┘ └──────────────┘ └──────────────────┘  │ │
│  │                                                                         │ │
│  │  ┌────────────┐ ┌────────────┐ ┌──────────────┐ ┌──────────────────┐  │ │
│  │  │  Reports   │ │   Admin    │ │   Contact    │ │  Config Module   │  │ │
│  │  │  Module    │ │   Module   │ │   Module     │ │  (@nestjs/config)│  │ │
│  │  └────────────┘ └────────────┘ └──────────────┘ └──────────────────┘  │ │
│  │                                                                         │ │
│  │  ┌──────────────────────────────────────────────────────────────────┐  │ │
│  │  │                       Common Layer                                │  │ │
│  │  │  PrismaModule         AuthGuard            RolesGuard           │  │ │
│  │  │  ScopedPermissionGuard  AuditLogInterceptor  TransformResponseInterceptor │ │
│  │  │  EmailModule          RequestIdMiddleware   ExceptionFilter      │  │ │
│  │  └──────────────────────────────────────────────────────────────────┘  │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Module Registry

| Module                  | Responsibility                                   | Key Services                                  | Dependencies                                   |
| ----------------------- | ------------------------------------------------ | --------------------------------------------- | ---------------------------------------------- |
| **AuthModule**          | Authentication, token management, password flows | `AuthService`, `JwtStrategy`, `LocalStrategy` | `UsersModule`, `EmailModule`, `PrismaModule`   |
| **UsersModule**         | User CRUD, profile management, role assignment   | `UsersService`, `UsersController`             | `PrismaModule`, `EmailModule`, `ObjectStorage` |
| **CommunitiesModule**   | Community CRUD, membership, settings             | `CommunitiesService`, `MembershipsService`    | `PrismaModule`, `NotificationsModule`          |
| **OrganizationsModule** | Organization CRUD, team management               | `OrganizationsService`, `TeamsService`        | `PrismaModule`, `NotificationsModule`          |
| **EventsModule**        | Event CRUD, registration, attendance             | `EventsService`, `RegistrationsService`       | `PrismaModule`, `NotificationsModule`          |
| **PostsModule**         | Post CRUD, comments, likes                       | `PostsService`, `CommentsService`             | `PrismaModule`, `NotificationsModule`          |
| **CategoriesModule**    | Category CRUD, hierarchical tagging              | `CategoriesService`                           | `PrismaModule`                                 |
| **NotificationsModule** | In-app notification creation, read state         | `NotificationsService`                        | `PrismaModule`                                 |
| **ReportsModule**       | Report submission, review workflow               | `ReportsService`                              | `PrismaModule`, `NotificationsModule`          |
| **AdminModule**         | Platform admin dashboard, user/role mgmt         | `AdminService`, `AuditLogService`             | `PrismaModule`, `UsersModule`                  |
| **ContactModule**       | Contact form submission, admin review            | `ContactService`                              | `PrismaModule`, `EmailModule`                  |
| **PrismaModule**        | Database connection, ORM singleton               | `PrismaService`                               | `@prisma/client`                               |
| **EmailModule**         | Email dispatch via adapter pattern               | `EmailService`, `EmailAdapter`                | `ResendEmailAdapter` / `ConsoleEmailAdapter`   |

### Common Layer Components

| Component                        | Type          | Responsibility                                                                  |
| -------------------------------- | ------------- | ------------------------------------------------------------------------------- |
| **PrismaModule**                 | Global Module | Provides `PrismaService` singleton for database access across all modules       |
| **AuthGuard**                    | Guard         | Validates JWT access tokens, loads user context into request                    |
| **RolesGuard**                   | Guard         | Checks platform-level roles (ADMIN, USER, MODERATOR) against route requirements |
| **ScopedPermissionGuard**        | Guard         | Validates scoped permissions (community/org-level) for resource access          |
| **AuditLogInterceptor**          | Interceptor   | Records all mutations (POST, PATCH, DELETE) to `audit_logs` table               |
| **TransformResponseInterceptor** | Interceptor   | Wraps all responses in `{ success, data, message, meta }` envelope              |
| **RequestIdMiddleware**          | Middleware    | Stamps `x-request-id` UUID header on every incoming request                     |
| **ExceptionFilter**              | Filter        | Catches unhandled exceptions, returns structured error responses                |
| **EmailModule**                  | Global Module | Provides `EmailService` with pluggable adapter (Resend/SMTP/Console)            |

---

## 10. Deployment Diagram

### 10.1 Production Environment

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                           PRODUCTION ENVIRONMENT                                   │
│                                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────────┐ │
│  │                          Vercel (Edge Network)                               │ │
│  │                                                                             │ │
│  │  ┌───────────────────┐     ┌──────────────────────────────────────────┐    │ │
│  │  │  CDN / Edge       │────▶│  Next.js SSR/SSG                         │    │ │
│  │  │  (Static Assets)  │     │  apps/web                                │    │ │
│  │  │  TLS 1.3          │     │  Serverless Functions                    │    │ │
│  │  │  Port: 443        │     │  Port: 3000 (internal)                  │    │ │
│  │  └───────────────────┘     └──────────────────────────────────────────┘    │ │
│  └─────────────────────────────────────────────────────────────────────────────┘ │
│                                          │                                        │
│                                     HTTPS / REST                                  │
│                                          │                                        │
│  ┌───────────────────────────────────────┼────────────────────────────────────┐  │
│  │                          Docker Container                                  │  │
│  │                                                                             │  │
│  │  ┌──────────────────────────────────────────────────────────────────┐      │  │
│  │  │  NestJS API                                                     │      │  │
│  │  │  apps/api                                                       │      │  │
│  │  │  Port: 4000                                                     │      │  │
│  │  │  Health: GET /api/v1/health                                     │      │  │
│  │  │  Auto-scaling: 0–10 instances                                   │      │  │
│  │  └──────────────────────────────────────────────────────────────────┘      │  │
│  └────────────────────────────────────────────────────────────────────────────┘  │
│        │                │                │                │                        │
│   TCP/TLS 3306    HTTPS 443         HTTPS 443         DB Write                   │
│        │                │                │                │                        │
│        ▼                ▼                ▼                ▼                        │
│  ┌──────────┐  ┌──────────────┐  ┌─────────────┐  ┌──────────────────────┐      │
│  │ MySQL 8  │  │ S3/Vercel    │  │ Resend API  │  │ notifications table  │      │
│  │ Hostinger│  │ Blob Storage │  │ (Email)     │  │ (in MySQL)           │      │
│  │ Port:    │  │ Port: 443    │  │ Port: 443   │  │                      │      │
│  │ 3306     │  │ TLS 1.3      │  │ TLS 1.3     │  │                      │      │
│  └──────────┘  └──────────────┘  └─────────────┘  └──────────────────────┘      │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### 10.2 Production Infrastructure Table

| Resource                 | Technology                  | Network           | Port | Protocol         | Security                                      |
| ------------------------ | --------------------------- | ----------------- | ---- | ---------------- | --------------------------------------------- |
| **Vercel Edge Network**  | Vercel CDN + Serverless     | Public Internet   | 443  | HTTPS            | TLS 1.3, DDoS protection, WAF                 |
| **Next.js Web App**      | Next.js 15 SSR/SSG          | Internal (Vercel) | 3000 | HTTP (internal)  | Isolated within Vercel runtime                |
| **NestJS API Container** | Docker (multi-stage)        | Private/Managed   | 4000 | HTTP (behind LB) | Container isolation, env vars for secrets     |
| **MySQL 8 Database**     | Managed (Hostinger)         | Private network   | 3306 | TCP/TLS          | SSL required, IP whitelist, encrypted at rest |
| **Object Storage**       | S3-compatible (Vercel Blob) | Public (CDN)      | 443  | HTTPS            | TLS 1.3, presigned URLs, bucket policies      |
| **Email Service**        | Resend API                  | Public Internet   | 443  | HTTPS            | TLS 1.3, API key authentication               |

### 10.3 Development Environment

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                          DEVELOPMENT ENVIRONMENT                                  │
│                                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────────┐ │
│  │                          Local Machine                                       │ │
│  │                                                                             │ │
│  │  ┌───────────────────────────────┐   ┌──────────────────────────────────┐  │ │
│  │  │  pnpm dev                     │   │  docker-compose                  │  │ │
│  │  │                               │   │                                  │  │ │
│  │  │  ┌─────────────────────────┐  │   │  ┌────────────────────────────┐ │  │ │
│  │  │  │  Next.js Web App       │  │   │  │  MySQL 8                   │ │  │ │
│  │  │  │  apps/web              │  │   │  │  Port: 3306                │ │  │ │
│  │  │  │  Port: 3000            │  │   │  │  Database: komunaid_dev    │ │  │ │
│  │  │  └─────────────────────────┘  │   │  └────────────────────────────┘ │  │ │
│  │  │                               │   │                                  │  │ │
│  │  │  ┌─────────────────────────┐  │   │  ┌────────────────────────────┐ │  │ │
│  │  │  │  NestJS API             │  │   │  │  MinIO (optional)          │ │  │ │
│  │  │  │  apps/api               │  │   │  │  S3-compatible local       │ │  │ │
│  │  │  │  Port: 4000             │  │   │  │  Port: 9000                │ │  │ │
│  │  │  └─────────────────────────┘  │   │  └────────────────────────────┘ │  │ │
│  │  │                               │   │                                  │  │ │
│  │  │  ┌─────────────────────────┐  │   └──────────────────────────────────┘  │ │
│  │  │  │  Console Email Adapter  │  │                                         │ │
│  │  │  │  (logs to terminal)     │  │                                         │ │
│  │  │  └─────────────────────────┘  │                                         │ │
│  │  └───────────────────────────────┘                                         │ │
│  └─────────────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### 10.4 Development Infrastructure Table

| Resource            | Technology                           | Network   | Port | Protocol | Notes                            |
| ------------------- | ------------------------------------ | --------- | ---- | -------- | -------------------------------- |
| **Next.js Web App** | Next.js 15 (dev mode)                | localhost | 3000 | HTTP     | Hot reload, HMR enabled          |
| **NestJS API**      | NestJS 10 (dev mode)                 | localhost | 4000 | HTTP     | Watch mode, debug enabled        |
| **MySQL 8**         | Docker container                     | localhost | 3306 | TCP      | `docker-compose up mysql`        |
| **Object Storage**  | MinIO (optional) or local filesystem | localhost | 9000 | HTTP     | MinIO Console at :9001           |
| **Email Service**   | Console adapter                      | N/A       | N/A  | N/A      | Emails logged to terminal output |
| **Prisma Studio**   | `prisma studio`                      | localhost | 5555 | HTTP     | Database browser/editor          |

### 10.5 Security Summary

| Layer              | Mechanism                                                                |
| ------------------ | ------------------------------------------------------------------------ |
| **Transport**      | TLS 1.3 on all external connections (HTTPS)                              |
| **Authentication** | JWT: Access token (15 min), Refresh token (30 days, httpOnly cookie)     |
| **Authorization**  | Platform roles + scoped permissions via Guards                           |
| **API Security**   | Rate limiting, CORS whitelist, input validation (class-validator + Zod)  |
| **Database**       | SSL connection, IP whitelist, encrypted at rest, connection pooling      |
| **Secrets**        | Environment variables (never committed), Vercel encrypted env vars       |
| **Storage**        | Presigned URLs (time-limited), file type whitelist, max size enforcement |
