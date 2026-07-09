# 07 — SECURITY DESIGN

**Date:** 2026-07-09
**Version:** 1.0.0

---

## Threat Model

| Threat | Severity | Mitigation | Status |
|--------|----------|------------|--------|
| XSS (Cross-Site Scripting) | High | httpOnly cookies, input sanitization, React auto-escaping | ✅ |
| CSRF (Cross-Site Request Forgery) | High | sameSite: 'lax', future: CSRF token | ✅ Partial |
| SQL Injection | High | Prisma ORM (parameterized queries) | ✅ |
| Brute Force | Medium | Rate limiting (100/15min) | ✅ |
| Token Theft | Medium | Short-lived access (15min), refresh rotation | ✅ |
| Password Cracking | Medium | bcryptjs (10 rounds), min 8 chars | ✅ |
| Email Enumeration | Low | Same response for forgot-password | ✅ Planned |
| Role Escalation | High | Server-side RBAC on all routes | ✅ |
| Session Fixation | Medium | New tokens on every login | ✅ |
| Data Leakage | Medium | Soft delete, no hard deletes | ✅ |
| Audit Tampering | High | Immutable AuditLog (INSERT only) | ✅ |
| Insecure Headers | Medium | Security headers middleware | ✅ |
| Request Body Abuse | Low | 10MB body size limit | ✅ |
| CORS Misconfiguration | Medium | Whitelist origin | ✅ |

---

## Security Headers

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'
```

---

## Rate Limiting

| Scope | Limit | Window | Strategy |
|-------|-------|--------|----------|
| Global | 100 requests | 15 minutes | In-memory Map per IP |
| Auth endpoints | Same | Same | Covered by global |
| Admin endpoints | Same | Same | Covered by global |

**Implementation:** `Map<ip, { count, resetTime }>` in memory.

**Planned Enhancement:** Redis-based rate limiting for production multi-instance.

---

## Input Validation

### Layer 1: Zod Schema (API)

```
All API inputs validated via Zod schemas from @komunaid/shared:

  registerSchema: name (2-100), email (valid), password (min 8), confirmPassword
  loginSchema: email, password
  createCommunitySchema: name (3-100), description, membershipType
  createEventSchema: title (3-200), eventDate (datetime), quota (min 1)
  createReportSchema: targetType, targetId, reason
  paginationSchema: page (min 1), limit (1-100)
  ... (12 schemas total)
```

### Layer 2: Prisma (Database)

```
Prisma schema enforces:
  - Type safety (String, Int, Boolean, DateTime, Json)
  - UNIQUE constraints (email, slug, communityId+userId)
  - NOT NULL constraints
  - Enum validation
  - Foreign key relationships
```

### Layer 3: Application Logic

```
Business rules enforced in route handlers:
  - Email uniqueness check (register)
  - Slug uniqueness (community, org, event)
  - Capacity check (event registration)
  - Date validation (eventDate > now)
  - Membership check (scoped actions)
  - Status checks (APPROVED before join)
```

---

## Password Security

| Aspect | Implementation |
|--------|---------------|
| Hashing Algorithm | bcryptjs |
| Salt Rounds | 10 |
| Min Length | 8 characters |
| Complexity | No special requirement (MVP) |
| Storage | Only hash stored in DB |
| Comparison | bcrypt.compare() |

---

## JWT Security

| Aspect | Implementation |
|--------|---------------|
| Algorithm | HMAC-SHA256 |
| Access Token TTL | 15 minutes |
| Refresh Token TTL | 30 days |
| Payload | userId, email, roles[] |
| Secret | Environment variable (JWT_SECRET) |
| Verification | jose.jwtVerify() |
| Storage | httpOnly cookies (not localStorage) |
| Rotation | New refresh token on each refresh |

---

## CORS Configuration

```typescript
{
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000'
  ],
  credentials: true,  // Allow cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}
```

---

## RBAC Enforcement

### Middleware Application Map

| Route | Auth | RBAC |
|-------|------|------|
| POST /auth/register | Guest | None |
| POST /auth/login | Guest | None |
| POST /auth/refresh | Cookie | None |
| POST /auth/logout | Member | None |
| GET /auth/me | Member | None |
| GET /users/profile | Member | None |
| PUT /users/profile | Member | None |
| GET /users/:id | Public | None |
| PUT /users/interests | Member | None |
| GET /users/notifications | Member | None |
| GET /users/activity | Member | None |
| GET /communities | Public | None |
| GET /communities/:slug | Public | None |
| POST /communities | Member | requireRole(MEMBER+) |
| PUT /communities/:id | Member | requireCommunityOwner |
| POST /communities/:id/join | Member | requireRole(MEMBER+) |
| POST /communities/:id/leave | Member | requireRole(MEMBER+) |
| GET /communities/:id/join-requests | Member | requireCommunityAdmin |
| PUT /communities/:id/join-requests/:rid | Member | requireCommunityAdmin |
| GET /communities/:id/members | Member | requireCommunityMember |
| GET /organizations | Public | None |
| GET /organizations/:slug | Public | None |
| POST /organizations | Member | requireRole(MEMBER+) |
| PUT /organizations/:id | Member | requireOrganizationOwner |
| GET /events | Public | None |
| GET /events/:slug | Public | None |
| POST /events | Member | requireEventCreationRole |
| POST /events/:id/register | Member | requireRole(MEMBER+) |
| DELETE /events/:id/register | Member | requireRole(MEMBER+) |
| POST /reports | Member | requireRole(MEMBER+) |
| GET /reports/my | Member | None |
| GET /admin/stats | Member | requirePlatformAdmin |
| GET /admin/users | Member | requirePlatformAdmin |
| PUT /admin/users/:id/suspend | Member | requirePlatformAdmin |
| PUT /admin/users/:id/activate | Member | requirePlatformAdmin |
| PUT /admin/users/:id/role | Member | requireSuperAdmin |
| GET /admin/communities/pending | Member | requirePlatformAdmin |
| PUT /admin/communities/:id/approve | Member | requirePlatformAdmin |
| PUT /admin/communities/:id/suspend | Member | requirePlatformAdmin |
| GET /admin/organizations/pending | Member | requirePlatformAdmin |
| PUT /admin/organizations/:id/approve | Member | requirePlatformAdmin |
| PUT /admin/organizations/:id/suspend | Member | requirePlatformAdmin |
| GET /admin/reports | Member | requirePlatformAdmin |
| PUT /admin/reports/:id/resolve | Member | requirePlatformAdmin |
| GET /admin/audit-logs | Member | requireSuperAdmin |
| CRUD /categories | Varies | Platform Admin for write |

---

## Audit Trail Design

### Immutable AuditLog

```
Actions Logged:
  USER_REGISTER, USER_LOGIN, USER_LOGOUT
  USER_SUSPEND, USER_ACTIVATE, USER_ROLE_CHANGE
  COMMUNITY_CREATE, COMMUNITY_APPROVE, COMMUNITY_SUSPEND
  COMMUNITY_MEMBER_JOIN, COMMUNITY_MEMBER_LEAVE, COMMUNITY_MEMBER_BAN
  JOIN_REQUEST_APPROVE, JOIN_REQUEST_REJECT
  ORG_CREATE, ORG_APPROVE, ORG_SUSPEND
  EVENT_CREATE, EVENT_REGISTER, EVENT_CANCEL_REGISTRATION
  REPORT_CREATE, REPORT_RESOLVE, REPORT_DISMISS

Data Captured:
  - userId (who)
  - actionType (what)
  - resourceName (which resource type)
  - resourceId (which resource)
  - beforeData (previous state, JSON)
  - afterData (new state, JSON)
  - ipAddress (where from)
  - createdAt (when)

Constraints:
  - INSERT only
  - No UPDATE
  - No DELETE
  - No soft delete (no deletedAt)
```

---

## Soft Delete Strategy

| Model | Field | Query Pattern |
|-------|-------|--------------|
| User | deletedAt | `WHERE deletedAt IS NULL` |
| Community | deletedAt | `WHERE deletedAt IS NULL` |
| Organization | deletedAt | `WHERE deletedAt IS NULL` |
| Event | deletedAt | `WHERE deletedAt IS NULL` |

**Cascade Behavior:** Soft-deleted parent records still have active children.

---

## Data Privacy

| Concern | Implementation |
|---------|---------------|
| Password Storage | bcryptjs hash only |
| Email Exposure | Only in profile, not in public listings |
| PII in Logs | No passwords/tokens in audit logs |
| Cookie Security | httpOnly, secure, sameSite |
| API Error Messages | Generic messages, no stack traces in production |

---

## Environment Security

| Secret | Location | Description |
|--------|----------|-------------|
| DATABASE_URL | .env | MySQL connection string |
| JWT_SECRET | .env | JWT signing secret |
| JWT_REFRESH_SECRET | .env | Refresh token secret |
| CORS_ORIGIN | .env | Allowed origin |
| NODE_ENV | .env | production/development |

**Rules:**
- Never commit .env to git
- Use .env.example for documentation
- Different secrets per environment
- Rotate secrets periodically

---

*Document generated: 2026-07-09*
*Stage: SDLC Stage 2 — System Analysis & Solution Design*
