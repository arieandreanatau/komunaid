# 05 — AUTHENTICATION & AUTHORIZATION DESIGN

**Date:** 2026-07-09
**Version:** 1.0.0

---

## Authentication Mechanism

| Component | Technology | Details |
|-----------|-----------|---------|
| Token Format | JWT (JSON Web Token) | Signed with HMAC-SHA256 |
| Token Library | jose | Edge-compatible JWT |
| Password Hash | bcryptjs | 10 rounds salt |
| Cookie Strategy | httpOnly, secure, sameSite | No XSS exposure |
| Token Storage | Server-side cookies | Not accessible via JS |

---

## Token Design

### Access Token

| Field | Value |
|-------|-------|
| Payload | userId, email, roles[] |
| Expiry | 15 minutes |
| Storage | Cookie `access_token` (httpOnly) |

### Refresh Token

| Field | Value |
|-------|-------|
| Payload | userId, tokenVersion |
| Expiry | 30 days |
| Storage | Cookie `refresh_token` (httpOnly) |

---

## Cookie Configuration

```typescript
// Access Token Cookie
{
  name: 'access_token',
  httpOnly: true,
  secure: true,       // HTTPS only
  sameSite: 'lax',    // CSRF protection
  path: '/',
  maxAge: 15 * 60     // 15 minutes
}

// Refresh Token Cookie
{
  name: 'refresh_token',
  httpOnly: true,
  secure: true,
  sameSite: 'lax',
  path: '/',
  maxAge: 30 * 24 * 60 * 60  // 30 days
}
```

---

## Authentication Flows

### Registration Flow

```
1. Guest submits { name, email, password, confirmPassword }
2. Validate input (Zod: registerSchema)
3. Check email uniqueness → 409 if exists
4. Hash password (bcryptjs, 10 rounds)
5. INSERT User { email, password, name, status: ACTIVE }
6. INSERT UserRole { userId, role: MEMBER }
7. Generate access_token (JWT, 15min)
8. Generate refresh_token (JWT, 30 days)
9. Set cookies (httpOnly, secure, sameSite)
10. INSERT AuditLog { actionType: USER_REGISTER }
11. INSERT ActivityHistory { action: USER_REGISTER }
12. Return 201 { user, accessToken, refreshToken }
```

### Login Flow

```
1. Guest submits { email, password }
2. Validate input (Zod: loginSchema)
3. Find User by email → 404 if not found
4. Compare password (bcryptjs) → 401 if mismatch
5. Check user.status → 403 if SUSPENDED/DEACTIVATED
6. Fetch user roles (UserRole)
7. Generate access_token (JWT, 15min)
8. Generate refresh_token (JWT, 30 days)
9. Set cookies
10. INSERT AuditLog { actionType: USER_LOGIN }
11. Return 200 { user, accessToken, refreshToken }
```

### Token Refresh Flow

```
1. Client sends refresh_token cookie
2. Validate JWT signature
3. Find User by userId → 404 if not found
4. Check user.status → 403 if suspended
5. Generate new access_token (15min)
6. Generate new refresh_token (30 days) — rotation
7. Set new cookies
8. Return 200 { accessToken, refreshToken }
```

### Logout Flow

```
1. Member sends request with cookies
2. Clear access_token cookie (maxAge: 0)
3. Clear refresh_token cookie (maxAge: 0)
4. INSERT AuditLog { actionType: USER_LOGOUT }
5. Return 200 { message: "Logout berhasil" }
```

### Password Reset Flow *(PLANNED)*

```
1. Guest submits { email }
2. Validate input (Zod: forgotPasswordSchema)
3. Find User by email
4. IF found: Generate reset token (JWT, 1hr expiry)
5. Store token hash in DB or cache
6. Send email with reset link
7. ALWAYS return same response (prevent enumeration)
8. Return 200 { message: "Link reset password telah dikirim" }

--- Reset Flow ---

1. User clicks link → /reset-password?token=xxx
2. User submits { token, password, confirmPassword }
3. Validate input (Zod: resetPasswordSchema)
4. Verify JWT signature + expiry
5. Find User by userId from token
6. Hash new password
7. UPDATE User.password
8. Invalidate old refresh tokens
9. Return 200 { message: "Password berhasil diubah" }
```

---

## Authorization: RBAC

### Platform Roles

```
┌─────────────────────────────────────────┐
│              Platform RBAC               │
├─────────────────────────────────────────┤
│  SUPER_ADMIN                            │
│    └─ Can: everything + role management  │
│                                         │
│  PLATFORM_ADMIN                         │
│    └─ Can: manage users, approve,        │
│       moderate reports                   │
│                                         │
│  MEMBER                                 │
│    └─ Can: CRUD own data, join,          │
│       create community/org/event         │
└─────────────────────────────────────────┘
```

### Scoped Roles: Community

```
┌─────────────────────────────────────────┐
│           Community RBAC                 │
├─────────────────────────────────────────┤
│  OWNER                                  │
│    └─ Can: full control                  │
│                                         │
│  ADMIN                                   │
│    └─ Can: manage members, join requests │
│                                         │
│  EVENT_MANAGER                          │
│    └─ Can: create/manage events          │
│                                         │
│  MEMBER                                  │
│    └─ Can: view, leave                   │
└─────────────────────────────────────────┘
```

### Scoped Roles: Organization

```
┌─────────────────────────────────────────┐
│          Organization RBAC               │
├─────────────────────────────────────────┤
│  OWNER                                  │
│    └─ Can: full control                  │
│                                         │
│  ADMIN                                   │
│    └─ Can: manage members, create events │
│                                         │
│  MEMBER                                  │
│    └─ Can: view                          │
└─────────────────────────────────────────┘
```

---

## Middleware Chain

### authMiddleware

```
Input: Request with cookies
Process:
  1. Extract access_token from cookie
  2. Verify JWT signature (jose)
  3. Decode payload → { userId, email, roles[] }
  4. Fetch User from DB → verify exists + status=ACTIVE
  5. Attach user to context: c.set('user', user)
  6. Forward to next middleware
Error:
  - Missing token → 401 "Unauthorized"
  - Invalid/expired token → 401 "Token tidak valid"
  - User not found → 401 "User tidak ditemukan"
  - User suspended → 403 "Akun ditangguhkan"
```

### optionalAuthMiddleware

```
Same as authMiddleware but:
  - If no token → forward (user = null)
  - If valid token → attach user
  - Used for public routes that behave differently for authenticated users
```

### requireRole(...roles)

```
Input: platform roles array
Process:
  1. Check c.get('user') exists (must come after authMiddleware)
  2. Fetch user's platform roles from UserRole
  3. Check if user has at least one of required roles
  4. Forward if authorized
Error: 403 "Forbidden"
```

### requirePlatformAdmin()

```
Equivalent to: requireRole(SUPER_ADMIN, PLATFORM_ADMIN)
```

### requireSuperAdmin()

```
Equivalent to: requireRole(SUPER_ADMIN)
```

### requireCommunityOwner

```
Process:
  1. Extract communityId from params
  2. Fetch CommunityMember where userId + communityId
  3. Check role === OWNER
Error: 403 "Forbidden"
```

### requireCommunityAdmin

```
Process:
  1. Extract communityId from params
  2. Fetch CommunityMember where userId + communityId
  3. Check role in [OWNER, ADMIN]
Error: 403 "Forbidden"
```

### requireOrganizationOwner

```
Process:
  1. Extract organizationId from params
  2. Fetch OrganizationMember where userId + organizationId
  3. Check role === OWNER
Error: 403 "Forbidden"
```

---

## Frontend Auth State

### Zustand Store (Client)

```
State:
  - user: User | null
  - isAuthenticated: boolean
  - isLoading: boolean

Actions:
  - login(user, tokens) → set user + cookies
  - logout() → clear user + cookies + redirect
  - updateUser(data) → merge user data
```

### React Context (AuthProvider)

```
On Mount:
  1. Check if access_token cookie exists
  2. IF exists: GET /auth/me
  3. IF success: set user, isAuthenticated = true
  4. IF fail: clear state, isAuthenticated = false
  5. isLoading = false
```

### Axios Interceptor

```
Request:
  - Attach Bearer token from cookie
  - Set baseURL: http://localhost:3001/api/v1

Response:
  - IF 401: clear cookies, redirect to /login
  - IF success: return data
```

### Middleware (Next.js)

```
Protected Routes (require token):
  /dashboard/**
  /profile/**
  /settings/**
  /admin/**

Redirect if Authenticated:
  /login → /
  /register → /
```

---

## Security Considerations

| Concern | Mitigation |
|---------|-----------|
| XSS | httpOnly cookies, no JS access to tokens |
| CSRF | sameSite: 'lax', CSRF token (planned) |
| Token Theft | Short-lived access (15min), refresh rotation |
| Password Brute Force | Rate limiting (100/15min) |
| Email Enumeration | Same response for forgot-password regardless of email |
| Role Escalation | Server-side RBAC middleware on all protected routes |
| Session Fixation | New tokens on every login |
| Token Replay | Refresh token rotation (new token each refresh) |

---

*Document generated: 2026-07-09*
*Stage: SDLC Stage 2 — System Analysis & Solution Design*
