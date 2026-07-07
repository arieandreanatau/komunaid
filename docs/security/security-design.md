# KomunaID Security Design

## 1. Security Principles

KomunaID follows these core security principles:

1. **Defense in Depth** — multiple layers of security controls; no single point of failure
2. **Principle of Least Privilege** — users receive only the minimum permissions required
3. **Separation of Duties** — critical actions require multiple roles or approval steps
4. **Fail Securely** — errors do not expose sensitive data or bypass security controls
5. **Default Deny** — all requests are denied unless explicitly allowed
6. **Audit Everything** — all mutations are logged with actor, action, and timestamp
7. **No Security by Obscurity** — security does not depend on hiding implementation details

---

## 2. Authentication Security

### JWT Token Architecture

KomunaID uses a dual-token system:

| Token         | Purpose                  | Default Expiry | Storage         |
| ------------- | ------------------------ | -------------- | --------------- |
| Access Token  | API authentication       | 15 minutes     | Memory/client   |
| Refresh Token | Obtain new access tokens | 30 days        | HttpOnly cookie |

### Token Payload Design

**Access Token Payload:**

```json
{
  "sub": "user-uuid",
  "email": "user@example.com",
  "roles": ["MEMBER", "COMMUNITY_OWNER"],
  "scopes": [
    { "type": "COMMUNITY", "id": 12, "roles": ["COMMUNITY_OWNER"] },
    { "type": "ORGANIZATION", "id": 5, "roles": ["ORG_MEMBER"] }
  ],
  "iat": 1700000000,
  "exp": 1700604800,
  "type": "access"
}
```

**Refresh Token Payload:**

```json
{
  "sub": "user-uuid",
  "jti": "unique-token-id",
  "iat": 1700000000,
  "exp": 1702592000,
  "type": "refresh"
}
```

### Password Reset Token

| Property   | Value                                  |
| ---------- | -------------------------------------- |
| Expiry     | 1 hour                                 |
| Single-use | Yes — invalidated after use            |
| Stored     | HS256 JWT with 1 hour expiry           |
| Payload    | `{ sub, type: "password-reset", jti }` |

### JWT Secrets

Three separate secrets to limit blast radius:

| Secret                      | Purpose               | Algorithm |
| --------------------------- | --------------------- | --------- |
| `JWT_ACCESS_SECRET`         | Access token signing  | HS256     |
| `JWT_REFRESH_SECRET`        | Refresh token signing | HS256     |
| `JWT_PASSWORD_RESET_SECRET` | Password reset tokens | HS256     |

**Requirements:**

- Minimum 256-bit random values
- Rotated periodically without invalidating existing tokens
- Stored in environment variables, never in code

### Password Hashing

| Parameter   | Value    | Rationale                         |
| ----------- | -------- | --------------------------------- |
| Algorithm   | bcrypt   | Industry standard, GPU-resistant  |
| Salt Rounds | 12       | ~250ms on modern hardware         |
| Max Length  | 72 bytes | bcrypt limitation; hash truncated |

Passwords are **never** stored in plaintext. The `password` column in the users table stores only the bcrypt hash.

### Password Policies

| Policy               | Requirement                   |
| -------------------- | ----------------------------- |
| Minimum length       | 8 characters                  |
| Complexity           | No enforced complexity (MVP)  |
| History              | No password reuse check (MVP) |
| Reset token expiry   | 1 hour                        |
| Failed login lockout | Not enforced (MVP)            |

---

## 3. Authorization Security

### RBAC with Role Hierarchy

Roles follow a strict hierarchy (see `rbac.md`). Higher-level roles implicitly include all permissions of lower-level roles within the same scope.

### Scoped Permissions

Roles can be scoped to three levels:

| Scope          | Applies To                               |
| -------------- | ---------------------------------------- |
| `PLATFORM`     | Entire platform (all resources)          |
| `ORGANIZATION` | Resources within a specific organization |
| `COMMUNITY`    | Resources within a specific community    |

### Guard Chain

```
Request
  → AuthGuard (validate JWT, attach user)
    → RolesGuard (check required role exists)
      → ScopedPermissionGuard (check scope matches resource)
        → Controller (handle request)
```

**Guard behaviors:**

- `AuthGuard` — rejects unauthenticated requests with 401
- `RolesGuard` — rejects requests missing required roles with 403
- `ScopedPermissionGuard` — rejects requests where role scope doesn't match resource with 403

### SUPER_ADMIN Bypass

SUPER_ADMIN (level 100) bypasses all role and scope checks. This is implemented in `RolesGuard`:

```typescript
if (user.roles.some((r) => r.name === 'SUPER_ADMIN')) {
  return true; // Skip all checks
}
```

---

## 4. Input Validation

### NestJS ValidationPipe

All incoming DTOs are validated using class-validator and class-transformer:

```typescript
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true, // Strip unknown properties
    forbidNonWhitelisted: true, // Throw 400 for unknown properties
    transform: true, // Auto-transform to DTO types
    transformOptions: {
      enableImplicitConversion: true,
    },
  }),
);
```

### Zod Validators (Shared Package)

For runtime validation in shared packages and libraries:

```typescript
import { z } from 'zod';

export const CreateCommunitySchema = z.object({
  name: z.string().min(3).max(100),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  description: z.string().max(2000).optional(),
  category: z.string().optional(),
});
```

### SQL Injection Prevention

- **Prisma ORM** — all queries use parameterized statements; raw SQL requires explicit `Prisma.sql` tagged templates
- **No string concatenation** in SQL queries
- **Input sanitization** via ValidationPipe strips unexpected characters

### XSS Prevention

- **Content Security Policy** — configured at the reverse proxy level
- **Sanitize HTML** — if rich text is accepted, use DOMPurify on the server side

### Output Encoding

- **Next.js / React DOM** — auto-escapes all rendered content; `dangerouslySetInnerHTML` is never used without prior sanitization
- **API responses** — all responses use `Content-Type: application/json`; no raw HTML responses
- **DOMPurify** — applied to any user-generated rich text before rendering (server-side and client-side)
- **Template engines** — NestJS responses are JSON by default; no server-side HTML templates

---

## 5. CSRF Protection

### SameSite Cookie Policy

| Cookie        | SameSite                    | Secure | HttpOnly | Path   |
| ------------- | --------------------------- | ------ | -------- | ------ |
| Refresh Token | Strict                      | Yes    | Yes      | `/api` |
| Access Token  | N/A (not stored in cookies) | —      | —        | —      |

Refresh token uses `SameSite=Strict` to prevent cross-site request forgery via cookie attachment.

### Double-Submit Cookie Pattern

For state-changing operations that require additional CSRF protection:

1. Server sets a CSRF token in a non-HttpOnly cookie
2. Client reads the cookie and includes the token in a custom header (`X-CSRF-Token`)
3. Server validates the header value matches the cookie value
4. Mismatch results in 403 Forbidden

### Implementation Notes

- CSRF protection is **recommended for production** — not enforced in MVP
- State-changing operations already require JWT authentication, which mitigates most CSRF vectors
- The refresh token cookie (`SameSite=Strict`) provides the primary CSRF defense
- Double-submit pattern is the recommended approach for additional hardening

---

## 6. API Security

### CORS Configuration

```typescript
app.enableCors({
  origin: process.env.ALLOWED_ORIGINS.split(','),
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  credentials: true,
  maxAge: 86400, // 24 hours preflight cache
});
```

### Rate Limiting

**Recommended implementation using `@nestjs/throttler`:**

```typescript
ThrottlerModule.forRoot([
  {
    ttl: 60000, // 1 minute window
    limit: 100, // 100 requests per window per IP
  },
]);
```

**Endpoint-specific limits:**

| Endpoint                      | Rate Limit | Rationale              |
| ----------------------------- | ---------- | ---------------------- |
| `POST /auth/login`            | 5/minute   | Prevent brute force    |
| `POST /auth/register`         | 3/minute   | Prevent spam accounts  |
| `POST /auth/forgot-password`  | 3/minute   | Prevent email flooding |
| `POST /uploads/presigned-url` | 20/minute  | Prevent storage abuse  |
| General API                   | 100/minute | Standard API usage     |

### HTTPS Enforcement

- HTTPS enforced at the reverse proxy (nginx/Cloudflare)
- HSTS header: `Strict-Transport-Security: max-age=31536000; includeSubDomains`
- HTTP requests redirected to HTTPS

### Request Size Limits

| Resource         | Max Size |
| ---------------- | -------- |
| JSON body        | 1 MB     |
| URL-encoded body | 1 MB     |
| Form data        | 10 MB    |
| File uploads     | 10 MB    |

### Security Headers

| Header                      | Value                                      |
| --------------------------- | ------------------------------------------ |
| `X-Content-Type-Options`    | `nosniff`                                  |
| `X-Frame-Options`           | `DENY`                                     |
| `X-XSS-Protection`          | `1; mode=block`                            |
| `Referrer-Policy`           | `strict-origin-when-cross-origin`          |
| `Content-Security-Policy`   | `default-src 'self'`                       |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains`      |
| `Permissions-Policy`        | `camera=(), microphone=(), geolocation=()` |

---

## 7. Data Security

### Soft Deletes

All major entities support soft deletes via a `deletedAt` column:

| Entity         | Has `deletedAt` | Notes                                |
| -------------- | --------------- | ------------------------------------ |
| User           | ✅              | User accounts are never hard-deleted |
| Community      | ✅              | Preserves member history             |
| Organization   | ✅              | Preserves member history             |
| Event          | ✅              | Preserves registration data          |
| Post           | ✅              | Preserves thread context             |
| Category       | ✅              | Preserves historical categorization  |
| Report         | ❌              | Reports are kept permanently         |
| Notification   | ❌              | Users can dismiss individually       |
| AuditLog       | ❌              | Never deleted                        |
| ContactMessage | ✅              | Admin-managed                        |

### Hard Delete Policy

- Hard deletes are **never** available through the API
- Only SUPER_ADMIN can perform hard deletes via database access
- Hard deletes require explicit confirmation and are logged

### Email Verification

| Column             | Type    | Description                     |
| ------------------ | ------- | ------------------------------- |
| `emailVerified`    | Boolean | Whether email has been verified |
| `emailVerifyToken` | String  | Token sent to user's email      |

**MVP limitation:** Email verification is not enforced. Users can access all features regardless of verification status.

### Suspension Mechanism

| Column            | Type     | Description                         |
| ----------------- | -------- | ----------------------------------- |
| `isSuspended`     | Boolean  | Whether user is currently suspended |
| `suspendedReason` | String   | Reason for suspension               |
| `suspendedAt`     | DateTime | When suspension occurred            |
| `suspendedBy`     | String   | Who issued the suspension           |

**Suspension behaviors:**

- Suspended users cannot perform any write operations
- Suspended users can still view public content
- Suspension is logged in AuditLog
- Only PLATFORM_ADMIN+ can suspend users

---

## 8. Encryption

### Data at Rest

| Layer        | Mechanism                             | Notes                             |
| ------------ | ------------------------------------- | --------------------------------- |
| Database     | MySQL encryption (managed service)    | Transparent Data Encryption (TDE) |
| File Storage | S3/Vercel Blob server-side encryption | AES-256 by default                |
| Backups      | Encrypted at rest by managed service  | Same as database encryption       |

### Data in Transit

| Layer          | Mechanism                          | Notes                      |
| -------------- | ---------------------------------- | -------------------------- |
| Client ↔ API   | TLS 1.2+ enforced at reverse proxy | HSTS header enforces HTTPS |
| API ↔ Database | TLS enabled on connection string   | Managed service default    |
| API ↔ Storage  | HTTPS to S3/Vercel Blob endpoints  | SDK handles TLS            |
| API ↔ Email    | HTTPS to Resend API                | SDK handles TLS            |

### Password Hashing

| Property    | Value    | Notes                            |
| ----------- | -------- | -------------------------------- |
| Algorithm   | bcrypt   | GPU-resistant, industry standard |
| Salt Rounds | 12       | ~250ms on modern hardware        |
| Max Input   | 72 bytes | bcrypt limitation                |

Passwords are **hashed, not encrypted** — they cannot be reversed. Stored as bcrypt hash in the `password` column.

### JWT Token Signing

| Token Type     | Algorithm | Secret Length | Storage              |
| -------------- | --------- | ------------- | -------------------- |
| Access Token   | HS256     | 256-bit min   | Environment variable |
| Refresh Token  | HS256     | 256-bit min   | Environment variable |
| Password Reset | HS256     | 256-bit min   | Environment variable |

### Sensitive Data Handling

| Rule                                | Enforcement                         |
| ----------------------------------- | ----------------------------------- |
| Passwords never logged              | Logger filters `password` fields    |
| Tokens never in URLs                | Tokens sent in headers/cookies only |
| PII in audit logs encrypted at rest | Database-level encryption           |
| API keys in environment variables   | Never committed to source control   |
| Secrets rotated periodically        | Without invalidating active tokens  |

---

## 9. Audit & Monitoring

### AuditLogInterceptor

All non-GET mutations are automatically logged via `AuditLogInterceptor`:

```typescript
@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, user, body, ip, headers } = request;
    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: () =>
          this.log({
            userId: user?.id,
            action: `${method} ${url}`,
            entityType: this.extractEntityType(url),
            entityId: this.extractEntityId(url, body),
            details: { body, ip, userAgent: headers['user-agent'] },
            duration: Date.now() - startTime,
          }),
        error: (err) =>
          this.log({
            userId: user?.id,
            action: `${method} ${url}`,
            details: { error: err.message, ip },
            status: 'FAILED',
          }),
      }),
    );
  }
}
```

### AuditLog Schema

```prisma
model AuditLog {
  id         String    @id @default(uuid()) @db.VarChar(36)
  userId     String    @db.VarChar(36)
  action     String    @db.VarChar(100)
  entityType String    @db.VarChar(50)
  entityId   String    @db.VarChar(36)
  oldValues  String?   @db.Text
  newValues  String?   @db.Text
  metadata   String?   @db.Text
  ipAddress  String?   @db.VarChar(45)
  userAgent  String?   @db.VarChar(500)
  createdAt  DateTime  @default(now())

  @@index([userId])
  @@index([action])
  @@index([entityType, entityId])
  @@index([createdAt])
}
```

### Structured Logging

Use NestJS Logger with consistent format:

```typescript
this.logger.log({
  message: 'User registered',
  userId: user.id,
  email: user.email,
  ip: request.ip,
  userAgent: request.headers['user-agent'],
  timestamp: new Date().toISOString(),
});
```

### IP Address Tracking

- `ip` field captured in AuditLog for every mutation
- `user-agent` header captured for device identification
- IP used for rate limiting and abuse detection

---

## 10. File Upload Security

### Presigned URL Pattern

Files are never uploaded directly to the NestJS server. Instead:

1. Client requests a presigned URL from `/uploads/presigned-url`
2. Server generates a time-limited presigned URL (5 minute expiry)
3. Client uploads directly to the storage provider (S3, GCS, etc.)
4. Client confirms upload; server creates `MediaAsset` record

```
Client → POST /uploads/presigned-url → Server returns presigned URL
Client → PUT presigned-url → Storage provider
Client → POST /uploads/confirm → Server creates MediaAsset record
```

### File Type Validation

| Upload Type | Allowed MIME Types                           |
| ----------- | -------------------------------------------- |
| Avatar      | `image/jpeg`, `image/png`, `image/webp`      |
| Banner      | `image/jpeg`, `image/png`, `image/webp`      |
| Document    | `application/pdf`, `image/jpeg`, `image/png` |
| General     | `image/*`, `application/pdf`, `video/mp4`    |

### Size Limits

| Upload Type | Max Size | Rationale            |
| ----------- | -------- | -------------------- |
| Avatar      | 2 MB     | Profile picture      |
| Banner      | 5 MB     | Cover image          |
| Document    | 5 MB     | Attachments, reports |
| General     | 10 MB    | Event media, posts   |

### Media Asset Tracking

```prisma
model MediaAsset {
  id               String    @id @default(uuid()) @db.VarChar(36)
  userId           String    @db.VarChar(36)
  filename         String    @db.VarChar(255)
  originalFilename String    @db.VarChar(255)
  mimeType         String    @db.VarChar(100)
  size             Int       @db.Int
  url              String    @db.VarChar(1000)
  thumbnailUrl     String?   @db.VarChar(1000)
  altText          String?   @db.VarChar(255)
  entityType       String?   @db.VarChar(50)
  entityId         String?   @db.VarChar(36)
  createdAt        DateTime  @default(now())

  @@index([userId])
}
```

### Storage Security

- **No directory listing** on storage provider
- **Signed URLs** expire after 5 minutes
- **Access control** — users can only delete their own media
- **Virus scanning** — recommended for production (not MVP)

---

## 11. Password Policies

### Current Implementation

| Policy                 | Implementation                            |
| ---------------------- | ----------------------------------------- |
| Minimum length         | 8 characters (enforced in DTO validation) |
| Maximum length         | 72 bytes (bcrypt limitation)              |
| Hashing                | bcrypt, 12 salt rounds                    |
| Storage                | Hash only; plaintext never stored         |
| Reset flow             | Email with time-limited token             |
| Reset token expiry     | 1 hour                                    |
| Reset token single-use | Yes — invalidated after use               |
| Failed login tracking  | Not implemented (MVP)                     |

### Password Reset Flow

```
1. User requests reset → POST /auth/forgot-password
2. Server generates token, hashes it, stores in DB
3. Server sends email with reset link (client-side URL with token)
4. User clicks link → client-side form
5. User submits new password → POST /auth/reset-password
6. Server validates token, updates password, invalidates token
7. All existing refresh tokens invalidated
```

---

## 12. Known Security Gaps (MVP)

### Rate Limiting Not Yet Implemented

| Risk                | Impact              | Mitigation             |
| ------------------- | ------------------- | ---------------------- |
| Brute force attacks | Account compromise  | Strong password policy |
| API abuse           | Resource exhaustion | Infrastructure limits  |
| Spam registration   | Data pollution      | Manual moderation      |

**Status:** Recommended for implementation before production launch.

### Email Verification Not Enforced

| Risk                | Impact               | Mitigation                 |
| ------------------- | -------------------- | -------------------------- |
| Fake email accounts | Spam, phishing       | Manual account review      |
| Bounced emails      | Failed notifications | Email validation at signup |

**Status:** `emailVerified` column exists but is not checked. Should be enforced before public launch.

### No 2FA/MFA Yet

| Risk                | Impact                  | Mitigation             |
| ------------------- | ----------------------- | ---------------------- |
| Account compromise  | Unauthorized access     | Strong JWT expiry      |
| Credential stuffing | Mass account compromise | Rate limiting (future) |

**Status:** Recommended for admin accounts at minimum.

### No IP Allowlisting

| Risk                      | Impact                 | Mitigation                |
| ------------------------- | ---------------------- | ------------------------- |
| Unauthorized admin access | Admin panel compromise | Role-based access control |

**Status:** Consider for admin endpoints in production.

### Additional Gaps

| Gap                            | Risk Level | Priority |
| ------------------------------ | ---------- | -------- |
| No request signing             | Medium     | P2       |
| No webhook verification        | Low        | P3       |
| No CSRF protection for cookies | Medium     | P2       |
| No CSP headers at app level    | Low        | P3       |
| No input sanitization for HTML | Medium     | P2       |

### Production Hardening Checklist

- [ ] Implement rate limiting (`@nestjs/throttler`)
- [ ] Enforce email verification
- [ ] Add 2FA for admin accounts
- [ ] Implement CSRF protection
- [ ] Add CSP headers
- [ ] Enable audit log retention policy
- [ ] Set up security monitoring/alerts
- [ ] Implement request signing for webhooks
- [ ] Add IP allowlisting for admin endpoints
- [ ] Configure log rotation and retention
