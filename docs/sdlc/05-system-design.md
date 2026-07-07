# Tahap 05 — System Design

| Item           | Detail               |
| -------------- | -------------------- |
| **Project**    | KomunaID             |
| **Tahap**      | 05 — System Design   |
| **Status**     | Completed            |
| **Tanggal**    | 7 Juli 2026          |
| **SDLC Phase** | 05                   |
| **Oleh**       | AI Engineering Agent |

---

## 1. Ringkasan System Design

Tahap 05 mendokumentasikan seluruh aspek teknis sistem KomunaID — dari arsitektur tingkat tinggi hingga desain module-level, dari strategi keamanan hingga rencana deployment. Dokumen tahap ini menjadi referensi utama selama fase implementasi (Tahap 06).

Hasil utama tahap ini:

- High-level design: container diagram, monorepo structure, data flow, deployment architecture
- Low-level design: NestJS module pattern, common layer, DTO, error handling, logging, caching, file upload
- System architecture: principles, technology decisions, frontend/backend/database architecture
- Module design: endpoint inventory, service methods, business rules untuk semua 12 module
- Prisma schema: 23 core tables sudah terdefinisi
- API contract: REST API v1 dengan OpenAPI/Swagger

---

## 2. Architecture Overview

### 2.1 Pattern: Modular Monolith

KomunaID mengadopsi **modular monolith** menggunakan NestJS. Setiap feature module memiliki batas yang jelas antara controller, service, dan data access layer. Module berkomunikasi melalui NestJS dependency injection, bukan HTTP calls.

### 2.2 Monorepo Structure

```
komunaid/
├── apps/
│   ├── api/                    NestJS REST API (port 4000)
│   └── web/                    Next.js 15 frontend (port 3000)
├── packages/
│   ├── database/               Prisma schema, migrations, seed
│   └── shared/                 Types, enums, validators, utils
├── tools/                      Build/dev tooling
├── docs/                       Project documentation
└── .github/workflows/          CI/CD pipelines
```

### 2.3 Key Design Decisions

| Decision | Choice               | Rationale                          |
| -------- | -------------------- | ---------------------------------- |
| Database | MySQL 8              | Team preference, managed hosting   |
| Backend  | NestJS               | Structured modules, DI, TypeScript |
| Frontend | Next.js 15           | SSR + SEO, App Router              |
| ORM      | Prisma               | Type-safe, migration management    |
| Auth     | JWT access + refresh | Stateless, scalable                |
| Roles    | Scoped RBAC          | Fine-grained permissions per scope |
| Monorepo | pnpm workspaces      | Shared code, atomic changes        |

---

## 3. Technology Stack

| Layer                  | Technology          | Version | Purpose                  |
| ---------------------- | ------------------- | ------- | ------------------------ |
| **Runtime**            | Node.js             | 20 LTS  | Server runtime           |
| **Package Manager**    | pnpm                | 9.x     | Monorepo management      |
| **Backend Framework**  | NestJS              | 10.x    | API server               |
| **Frontend Framework** | Next.js             | 15.x    | Web application          |
| **Database**           | MySQL               | 8.x     | Primary data store       |
| **ORM**                | Prisma              | 6.10.x  | Type-safe DB access      |
| **Validation**         | class-validator     | 0.14.x  | DTO validation (API)     |
| **Validation**         | Zod                 | 3.x     | Shared validators        |
| **Auth**               | @nestjs/jwt         | 10.x    | JWT token management     |
| **Auth**               | bcrypt              | 5.x     | Password hashing         |
| **API Docs**           | @nestjs/swagger     | 7.x     | OpenAPI generation       |
| **HTTP Client**        | axios               | 1.x     | External API calls       |
| **Email**              | Resend / nodemailer | —       | Transactional email      |
| **Storage**            | S3-compatible       | —       | File/media storage       |
| **CSS**                | Tailwind CSS        | 3.x     | Utility-first styling    |
| **UI Components**      | shadcn/ui           | —       | Pre-built components     |
| **State Management**   | React Query         | 5.x     | Server state             |
| **Testing**            | Jest                | 29.x    | Unit + integration tests |
| **E2E Testing**        | Supertest           | 6.x     | API integration tests    |
| **CI/CD**              | GitHub Actions      | —       | Automated pipeline       |
| **Hosting (FE)**       | Vercel              | —       | Frontend deployment      |
| **Hosting (API)**      | Docker / Cloud Run  | —       | API deployment           |

---

## 4. Module Map

### 4.1 Backend Modules (13 modules)

| #   | Module            | Path                         | Description                                                                 |
| --- | ----------------- | ---------------------------- | --------------------------------------------------------------------------- |
| 1   | Auth              | `modules/auth/`              | Registrasi, login, refresh token, forgot/reset password, email verification |
| 2   | Users             | `modules/users/`             | Profile CRUD, public profile, username lookup                               |
| 3   | Roles             | `modules/roles/`             | Role assignment, upgrade requests, scoped roles                             |
| 4   | Communities       | `modules/communities/`       | Community CRUD, membership, approval, slug-based lookup                     |
| 5   | Community Members | `modules/community-members/` | Member list, role management, ban/unban                                     |
| 6   | Organizations     | `modules/organizations/`     | Organization CRUD, membership, approval, slug-based lookup                  |
| 7   | Events            | `modules/events/`            | Event CRUD, registration, cancellation, approval, capacity                  |
| 8   | Notifications     | `modules/notifications/`     | In-app notification list, mark read, mark all read                          |
| 9   | Reports           | `modules/reports/`           | Content reporting, admin review, resolve/dismiss                            |
| 10  | Admin             | `modules/admin/`             | Dashboard stats, user management, platform settings, audit logs             |
| 11  | Uploads           | `modules/uploads/`           | Presigned URL generation, media asset tracking                              |
| 12  | Audit Logs        | `modules/audit-logs/`        | Query audit logs, log creation via interceptor                              |
| 13  | Contact           | `modules/contact/`           | Contact form submissions, admin inquiry management                          |

### 4.2 Common Layer

| Component                    | Path                   | Purpose                        |
| ---------------------------- | ---------------------- | ------------------------------ |
| PrismaModule                 | `common/prisma/`       | Database connection singleton  |
| AuthGuard                    | `common/guards/`       | JWT verification, user loading |
| RolesGuard                   | `common/guards/`       | Platform-level role check      |
| ScopedPermissionGuard        | `common/guards/`       | Scope-based permission check   |
| AuditLogInterceptor          | `common/interceptors/` | Automatic mutation logging     |
| TransformResponseInterceptor | `common/interceptors/` | Uniform response wrapping      |
| RequestIdMiddleware          | `common/middleware/`   | x-request-id stamping          |
| EmailAdapter                 | `common/email/`        | Email sending interface        |
| ExceptionFilter              | `common/filters/`      | Global error handling          |

---

## 5. Database Overview

### 5.1 Core Tables (22 tables)

| #   | Table                   | Model              | Purpose                             |
| --- | ----------------------- | ------------------ | ----------------------------------- |
| 1   | `users`                 | User               | User accounts & profiles            |
| 2   | `roles`                 | Role               | Role definitions (system roles)     |
| 3   | `user_role_assignments` | UserRoleAssignment | Scoped role assignments             |
| 4   | `communities`           | Community          | Community entities                  |
| 5   | `community_members`     | CommunityMember    | Community membership                |
| 6   | `community_events`      | CommunityEvent     | Community-Event junction            |
| 7   | `community_categories`  | CommunityCategory  | Community-Category junction         |
| 8   | `community_roles`       | CommunityRole      | Community-specific role definitions |
| 9   | `organizations`         | Organization       | Organization entities               |
| 10  | `organization_members`  | OrganizationMember | Organization membership             |
| 11  | `organization_events`   | OrganizationEvent  | Organization-Event junction         |
| 12  | `events`                | Event              | Event entities                      |
| 13  | `event_registrations`   | EventRegistration  | Event registration                  |
| 14  | `categories`            | Category           | Hierarchical categories             |
| 15  | `posts`                 | Post               | Community posts                     |
| 16  | `reports`               | Report             | Content reports                     |
| 17  | `notifications`         | Notification       | In-app notifications                |
| 18  | `audit_logs`            | AuditLog           | Audit trail                         |
| 19  | `contact_messages`      | ContactMessage     | Contact form submissions            |
| 20  | `settings`              | Setting            | Platform settings (KV)              |
| 21  | `media_assets`          | MediaAsset         | File upload tracking                |
| 22  | `role_upgrade_requests` | RoleUpgradeRequest | Role upgrade request tracking       |

### 5.2 Key Relationships

- User → UserRoleAssignment → Role (scoped by COMMUNITY/ORGANIZATION/PLATFORM)
- User → CommunityMember → Community (with role: OWNER/ADMIN/MEMBER)
- User → OrganizationMember → Organization (with role: OWNER/ADMIN/MEMBER)
- User → EventRegistration → Event (status: REGISTERED/CANCELLED/CHECKED_IN)
- Community → Post (community posts)
- Community → CommunityEvent → Event (event linked to community)
- Organization → OrganizationEvent → Event (event linked to organization)
- User → Report (reporter + resolver)
- User → Notification (per-user notifications)
- User → AuditLog (mutation trail)
- Category → Category (self-referencing parent/child)

### 5.3 Indexing Strategy

- Primary keys: UUID (VARCHAR(36)) with clustered index
- Unique constraints: email, username, slug (community, organization, event, post, category)
- Composite indexes: `[userId, roleId, scope, scopeId]` on UserRoleAssignment
- Foreign key indexes: all relation columns
- Soft delete index: `deletedAt` on soft-deletable entities
- Query optimization: status indexes on Community, Organization, Event, Post, Report

---

## 6. API Design Overview

### 6.1 REST API v1 Structure

```
/api/v1/
├── /auth              Register, login, refresh, logout, password reset
├── /users             Profile CRUD, username lookup
├── /roles             Role management, assignment
├── /communities       Community CRUD, membership
├── /organizations     Organization CRUD, membership
├── /events            Event CRUD, registration
├── /posts             Community posts
├── /categories        Category management
├── /notifications     User notifications
├── /reports           Content reports
├── /admin             Dashboard, user mgmt, settings
├── /uploads           Presigned URL, media tracking
└── /audit-logs        Audit log query
```

### 6.2 Response Format

```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed",
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

### 6.3 Error Format

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [...]
  },
  "meta": {
    "requestId": "uuid"
  }
}
```

### 6.4 Authentication

- **Access Token**: Short-lived (15 min), sent via `Authorization: Bearer <token>`
- **Refresh Token**: Long-lived (30 days), stored in httpOnly cookie or request body
- **Public Endpoints**: GET on public profiles, events, communities (read-only)

### 6.5 Pagination

- Cursor-based for infinite scroll feeds
- Offset-based for admin tables
- Default page size: 20, max: 100

---

## 7. Security Overview

### 7.1 Authentication & Authorization

| Mechanism          | Implementation                              |
| ------------------ | ------------------------------------------- |
| Password Hashing   | bcrypt with 12 rounds                       |
| JWT Access Token   | HS256, 15 min expiry                        |
| JWT Refresh Token  | 30 days, rotation on use                    |
| Role-Based Access  | Platform-level roles (SUPER_ADMIN → MEMBER) |
| Scoped Permissions | UserRoleAssignment with scope + scopeId     |
| Email Verification | Token-based verification flow               |

### 7.2 Guard Chain

```
Request → RequestIdMiddleware → AuthGuard → RolesGuard → ScopedPermissionGuard → Controller
```

### 7.3 Security Measures

- **Rate Limiting**: Apply at API gateway or NestJS Throttler module
- **Input Validation**: class-validator with whitelist + transform
- **SQL Injection**: Prevented by Prisma parameterized queries
- **XSS**: React DOM escaping + CSP headers
- **CSRF**: SameSite cookies + CSRF token for state-changing operations
- **Audit Logging**: All mutations logged with user, action, entity, old/new values
- **Soft Deletes**: Data recovery possible, no hard deletes on core entities
- **File Upload**: Presigned URLs only, no direct server upload, file type validation

### 7.4 Role Hierarchy

| Role            | Level | Scope              |
| --------------- | ----- | ------------------ |
| SUPER_ADMIN     | 100   | Platform-wide      |
| PLATFORM_ADMIN  | 80    | Platform-wide      |
| ORG_OWNER       | 60    | Organization scope |
| ORG_ADMIN       | 50    | Organization scope |
| COMMUNITY_OWNER | 40    | Community scope    |
| COMMUNITY_ADMIN | 30    | Community scope    |
| EVENT_MANAGER   | 20    | Event scope        |
| MEMBER          | 10    | Basic access       |

---

## 8. Performance Overview

### 8.1 Database Optimization

- **Indexing**: All foreign keys, unique constraints, frequently queried columns indexed
- **Query Optimization**: Prisma `select` and `include` for minimal data transfer
- **Connection Pooling**: Prisma connection pool (default: num_physical_cpus * 2 + 1)
- **N+1 Prevention**: Eager loading via Prisma `include`, avoid loop queries

### 8.2 API Performance

- **Response Compression**: gzip via NestJS compression middleware
- **Pagination**: Mandatory for list endpoints, prevent unbounded queries
- **Caching**: In-memory cache for hot data (categories, settings, public profiles)
- **Rate Limiting**: Protect against abuse

### 8.3 Frontend Performance

- **SSR/SSG**: Next.js server-side rendering for SEO-critical pages
- **Code Splitting**: Automatic with Next.js App Router
- **Image Optimization**: Next.js Image component with lazy loading
- **Font Optimization**: next/font for zero layout shift
- **Bundle Analysis**: @next/bundle-analyzer for monitoring

### 8.4 Scalability Considerations

- Horizontal scaling: Stateless API behind load balancer
- Database read replicas: Future-ready with Prisma
- CDN: Vercel edge network for frontend assets
- Background jobs: Future queue system for heavy operations

---

## 9. Document Index

### 9.1 Phase 5 Output Documents

| #   | Document              | Path                                          | Description                                               |
| --- | --------------------- | --------------------------------------------- | --------------------------------------------------------- |
| 1   | System Design         | `docs/sdlc/05-system-design.md`               | Master system design document                             |
| 2   | High-Level Design     | `docs/architecture/high-level-design.md`      | Container diagrams, monorepo, data flow, deployment       |
| 3   | Low-Level Design      | `docs/architecture/low-level-design.md`       | Module patterns, common layer, DTO, error handling        |
| 4   | System Architecture   | `docs/architecture/system-architecture.md`    | Architecture principles, tech decisions, component design |
| 5   | Module Design         | `docs/architecture/module-design.md`          | All 13 module specifications                              |
| 6   | Prisma Schema         | `packages/database/prisma/schema.prisma`      | Database schema (22 tables)                               |
| 7   | API Specification     | `docs/api/api-specification.md`               | REST API v1 endpoints                                     |
| 8   | Architecture Overview | `docs/architecture/system-architecture.md`    | Architecture principles, tech decisions                   |
| 9   | ERD                   | `docs/database/erd.md`                        | Entity-relationship diagram                               |
| 10  | Data Dictionary       | `docs/database/data-dictionary.md`            | Table and field definitions                               |
| 11  | RBAC                  | `docs/security/rbac.md`                       | Role-based access control design                          |
| 12  | Permission Matrix     | `docs/security/permission-matrix.md`          | Role-permission mapping                                   |
| 13  | Security Design       | `docs/security/security-design.md`            | Security architecture and controls                        |
| 14  | Indexing & Query Plan | `docs/performance/indexing-and-query-plan.md` | Database indexing strategy                                |
| 15  | OpenAPI Draft         | `docs/api/openapi-draft.yaml`                 | OpenAPI specification draft                               |

### 9.2 Supporting Documents

| #   | Document                    | Path                                               |
| --- | --------------------------- | -------------------------------------------------- |
| 1   | Requirements                | `docs/requirements/brd.md`                         |
| 2   | Non-Functional Requirements | `docs/requirements/non-functional-requirements.md` |
| 3   | Feature Requirements        | `docs/requirements/feature-requirements.md`        |
| 4   | Security                    | `docs/security.md`                                 |
| 5   | Deployment                  | `docs/deployment.md`                               |
| 6   | Database                    | `docs/database.md`                                 |
| 7   | Development Guide           | `docs/development.md`                              |
| 8   | UI/UX Design                | `docs/sdlc/04-ui-ux-design.md`                     |

---

## 10. Checklist Tahap 5

### 10.1 Architecture Decisions

- [x] Modular monolith pattern dipilih (NestJS)
- [x] Monorepo structure dengan pnpm workspaces
- [x] Frontend: Next.js 15 App Router
- [x] Backend: NestJS dengan feature modules
- [x] Database: MySQL 8 dengan Prisma ORM
- [x] Authentication: JWT access + refresh token
- [x] Authorization: Scoped RBAC dengan UserRoleAssignment
- [x] File storage: Presigned URL pattern (S3-compatible)
- [x] Email: Adapter pattern (Resend/SMTP + Console)
- [x] Deployment: Vercel (FE) + Containerized API + Managed MySQL

### 10.2 Module Design

- [x] Auth module: register, login, refresh, logout, forgot/reset password, email verification
- [x] Users module: profile CRUD (me, public), username lookup
- [x] Roles module: role assignment, upgrade requests, scoped roles
- [x] Communities module: CRUD, membership join/leave/approve/reject, status
- [x] Community Members module: member list, role management, ban/unban
- [x] Organizations module: CRUD, membership, approval, slug lookup
- [x] Events module: CRUD, registration, cancellation, approval, capacity
- [x] Notifications module: list, mark read, mark all read
- [x] Reports module: submit, list (admin), resolve/dismiss
- [x] Admin module: dashboard stats, user mgmt, role assignment, settings, audit logs
- [x] Uploads module: presigned URL, media asset tracking
- [x] Audit Logs module: query logs, log creation via interceptor
- [x] Contact module: contact form submissions, admin inquiry management

### 10.3 Database Design

- [x] User & Auth tables: users, roles, user_role_assignments
- [x] Community tables: communities, community_members, community_events
- [x] Organization tables: organizations, organization_members, organization_events
- [x] Event tables: events, event_registrations
- [x] Content tables: categories, posts
- [x] System tables: reports, notifications, audit_logs, contact_messages, settings, media_assets
- [x] Indexes: all foreign keys, unique constraints, query-critical columns
- [x] Soft deletes: deletedAt on User, Community, Organization, Event, Post
- [x] Slug-based routing: communities, organizations, events, posts, categories

### 10.4 API Design

- [x] REST API v1 structure defined
- [x] Response format standardized: { success, data, message, meta }
- [x] Error format standardized: { success, error: { code, message, details } }
- [x] Pagination: offset-based + cursor-based
- [x] Authentication: Bearer token via Authorization header
- [x] Public endpoints identified for read-only access

### 10.5 Security

- [x] Guard chain: AuthGuard → RolesGuard → ScopedPermissionGuard
- [x] Password hashing: bcrypt 12 rounds
- [x] JWT: short-lived access + long-lived refresh with rotation
- [x] Input validation: class-validator whitelist + transform
- [x] Audit logging: all mutations tracked
- [x] File upload: presigned URL pattern only
- [x] Rate limiting: planned for API gateway

### 10.6 Performance

- [x] Database indexing strategy defined
- [x] N+1 query prevention via Prisma include
- [x] Response compression via gzip
- [x] Pagination mandatory for list endpoints
- [x] Caching strategy: in-memory for hot data
- [x] SSR/SSG for frontend SEO
- [x] Image optimization via Next.js Image

### 10.7 Prisma Schema

- [x] 23 core tables defined in schema.prisma
- [x] All models use UUID primary keys (VARCHAR(36))
- [x] snake_case column mapping via @map
- [x] Table name mapping via @@map
- [x] All relations defined with proper cascading
- [x] Composite unique constraints (UserRoleAssignment, CommunityMember, etc.)
- [x] Indexes defined for all query patterns

### 10.8 OpenAPI / Swagger

- [x] Swagger UI configured at /api/docs
- [x] API metadata: title, description, version
- [x] Bearer auth scheme configured
- [x] DTOs decorated for schema generation
- [x] Endpoint groups tagged by module

---

## 11. Next Phase

### Tahap 6 — Implementation

Setelah system design selesai, fase berikutnya adalah **Tahap 6: Implementation** yang meliputi:

1. **Project Setup**
   - Initialize pnpm monorepo
   - Configure NestJS backend scaffold
   - Configure Next.js 15 frontend scaffold
   - Setup Prisma with MySQL connection
   - Setup shared package

2. **Core Infrastructure**
   - PrismaService singleton
   - AuthGuard + JWT configuration
   - RolesGuard + ScopedPermissionGuard
   - Global exception filter
   - Request ID middleware
   - Response transform interceptor
   - Audit log interceptor

3. **Module Implementation** (berurutan berdasarkan dependency)
   - Auth → Users → Roles → Communities → Organizations → Events
   - Posts, Categories, Notifications, Reports
   - Admin, Uploads, Audit Logs, Contact

4. **Frontend Implementation**
   - Design system + base components
   - Authentication pages
   - Dashboard pages
   - Feature pages per module

5. **Testing**
   - Unit tests untuk setiap service
   - Integration tests untuk API endpoints
   - E2E tests untuk critical flows

6. **Deployment**
   - CI/CD pipeline setup
   - Frontend deployment (Vercel)
   - API deployment (containerized)
   - Database migration + seed
