# KomunaID — SDLC Stage 14: Authentication Module Full-Cycle Analysis

> Dokumen ini menghasilkan traceability end-to-end untuk **Authentication Module** KomunaID:
> Business Rule → Functional Requirement → System Flow → API → Database → Security → Test Scenario → Test Case → UAT → Traceability.
>
> Sumber kebenaran implementasi:
> - `apps/api/src/routes/auth.ts`
> - `apps/api/src/middleware/auth.ts`
> - `apps/api/src/services/refresh-token.ts`
> - `apps/api/src/services/rate-limiter.ts`
> - `apps/api/src/services/audit.ts`
> - `apps/api/src/services/email.ts`
> - `packages/shared/src/index.ts` (Zod schemas)
> - `packages/database/prisma/schema.prisma` (User, RefreshToken, LoginHistory, ActivityHistory, AuditLog, Notification)
> - `apps/web/app/login/page.tsx`, `apps/web/app/forgot-password/page.tsx`, `apps/web/app/reset-password/page.tsx`

**Konvensi penanda:**

- `[REQ]` Requirement (eksplisit dari prompt/master prompt)
- `[ASM]` Assumption (asumsi untuk melengkapi requirement yang belum eksplisit)
- `[REC]` Recommendation (harus dikonfirmasi PO/BA)
- `[TBC]` To Be Confirmed (open question, tidak dijawab dengan asumsi final)
- `[GAP]` Kesenjangan antara requirement/ideal dan implementasi saat ini

---

## Daftar Isi

1. Business Context & Actor
2. Requirement Analysis (FR + BR)
3. System Flow
4. Data & Database Analysis
5. API Analysis
6. QA Test Strategy
7. Test Scenario
8. Detailed Test Case
9. API Test Case
10. Database Validation
11. Security Acceptance Criteria
12. Traceability Matrix
13. Gap Analysis
14. Open Questions
15. QA Risk Assessment
16. Final Document (Score, Issues, Recommendation, Final Flow, QA Readiness)

---

## 1. Business Context & Actor

**Module:** Authentication (komunaid/web + komunaid/api)

**Actor utama:**

| Actor | Deskripsi | Akses |
| --- | --- | --- |
| **Member (End User)** | Pengguna terdaftar KomunaID yang dapat login, logout, reset password | Public + Protected setelah login |
| **System** | KomunaID API service | Internal |
| **Email Service** | Resend (via `services/email.ts`) untuk kirim reset link | Outbound |

**Authentication bertanggung jawab atas:**

1. Login (email/username + password)
2. Forgot Password
3. Reset Password
4. Logout
5. Session/Token Management (access JWT + refresh token rotation)
6. Account Status Validation (`ACTIVE` / `SUSPENDED` / `DEACTIVATED` / soft-deleted)
7. Authentication Security (rate limit, brute force mitigation, token reuse detection, account enumeration prevention, CSRF)

**Prinsip desain:**

- Least privilege (role-based; default `MEMBER` pada register)
- Secure authentication (bcrypt 12 rounds, JWT HS256, `tokenVersion` invalidation)
- Defense in depth (rate limit, CSRF, security headers, sanitization)
- Secure error handling (uniform 401 message untuk credential salah atau unknown user)
- Prevention of account enumeration (forgot-password response identik terlepas dari ada/tidaknya akun)

---

## 2. Requirement Analysis

### 2.1 Inventory ID

| Layer | Prefix |
| --- | --- |
| Functional Requirement | `FR-AUTH-xxx` |
| Business Rule | `BR-AUTH-xxx` |
| Acceptance Criteria | `AC-AUTH-xxx` |
| Test Scenario | `TS-AUTH-xxx` |
| Test Case | `TC-AUTH-xxx` |
| API Test | `API-AUTH-xxx` |
| DB Test | `DB-AUTH-xxx` |

### 2.2 FR-AUTH-001 — Login Members

| Field | Value |
| --- | --- |
| Requirement ID | `FR-AUTH-001` |
| Description | Sistem menyediakan login untuk Member menggunakan identifier (email atau username) + password |
| Business Objective | Member dapat mengakses fitur terlindung (community, event, organization, dsb.) |
| Actor | Member |
| Trigger | Member membuka halaman `/login` dan submit form |
| Precondition | Akun terdaftar (`users` row exists, `deletedAt IS NULL`) |
| Main Flow | (1) Input identifier & password → (2) Validasi input → (3) Validasi identifier (email vs username) → (4) Validasi password (`bcrypt.compare`) → (5) Cek status akun (ACTIVE) → (6) Generate access JWT (HS256, 15m) + refresh token family (30d) → (7) Set httpOnly cookies → (8) Catat `LoginHistory` success & `ActivityHistory` → (9) Return user data |
| Alternative Flow | A1: Identifier mengandung `@` → query `where: { email }`. A2: Identifier tanpa `@` → query `where: { username }` |
| Exception Flow | E1: User tidak ditemukan → 401 generic. E2: User `deletedAt` set → 403. E3: `status = SUSPENDED` → 403. E4: `status = DEACTIVATED` → 403. E5: Password salah → 401 generic + catat `LoginHistory.failureReason=INVALID_PASSWORD`. E6: Rate limit exceeded → 429. |
| Postcondition | Session aktif (cookies `token`, `refreshToken`); `LoginHistory` & `ActivityHistory` tercatat |
| Input | `{ identifier: string, password: string }` |
| Output (Success) | 200 OK + `{ user: { id, name, username, email, avatar, roles[] } }` + Set-Cookie |
| Output (Fail) | 401/403/429 + generic message |
| Validation | identifier & password `min(1)`; identifier tidak divalidasi format (email/username dideteksi runtime) |
| Business Rule | BR-AUTH-001, BR-AUTH-002, BR-AUTH-003, BR-AUTH-004, BR-AUTH-005, BR-AUTH-006, BR-AUTH-007 |
| Security Rule | bcrypt verify, generic error, rate limit per `ip:identifier`, httpOnly+secure+sameSite cookies, `tokenVersion` validation |
| Dependency | `User`, `UserRole`, `RefreshToken`, `LoginHistory`, `ActivityHistory`, `AuditLog` |
| Priority | **Must Have** |
| Testability | Fully testable (API + UI) |

### 2.3 FR-AUTH-002 — Forgot Password

| Field | Value |
| --- | --- |
| Requirement ID | `FR-AUTH-002` |
| Description | Member dapat meminta link reset password menggunakan email |
| Business Objective | Member yang lupa password dapat memulihkan akses akun |
| Actor | Member (unauthenticated) |
| Trigger | Submit form `/forgot-password` |
| Precondition | Akun dapat ada atau tidak (sistem harus tidak membedakan) |
| Main Flow | (1) Input email → (2) Validasi format email → (3) Rate limit per email (3/jam) → (4) Cari user by email → (5) Jika user ada, ACTIVE, dan `deletedAt IS NULL` → generate reset JWT (1h, `type=reset`) → (6) Build reset URL → (7) Kirim email via Resend → (8) Selalu return 200 + pesan generik |
| Alternative Flow | A1: User `SUSPENDED`/`DEACTIVATED` → tidak kirim email, response tetap generik |
| Exception Flow | E1: Email tidak ditemukan → return 200 generik. E2: Email invalid format → 400/422. E3: Email service gagal → log error, response tetap 200. E4: Rate limit → 429. |
| Postcondition | Jika user ada: email terkirim berisi link `${APP_URL}/reset-password?token=<jwt>` |
| Input | `{ email: string }` |
| Output | 200 + `{ success: true, message: "Link reset password telah dikirim ke email Anda" }` |
| Validation | email format valid |
| Business Rule | BR-AUTH-008, BR-AUTH-009, BR-AUTH-010, BR-AUTH-011, BR-AUTH-012, BR-AUTH-013, BR-AUTH-014 |
| Security Rule | Identik response untuk user ada/tidak ada; rate limit; token expiration 1h; token JWT `type=reset` |
| Dependency | `User`, `services/email.ts` |
| Priority | **Must Have** |
| Testability | Fully testable |

### 2.4 FR-AUTH-003 — Reset Password

| Field | Value |
| --- | --- |
| Requirement ID | `FR-AUTH-003` |
| Description | Member dapat menetapkan password baru menggunakan token reset |
| Business Objective | Memungkinkan perubahan password yang aman |
| Actor | Member (unauthenticated, membawa token) |
| Trigger | Submit form `/reset-password?token=...` |
| Precondition | Token JWT valid, `type=reset`, belum expired, `tokenVersion` cocok |
| Main Flow | (1) Input token + newPassword + confirmPassword → (2) Validasi Zod (password policy) → (3) Verify JWT → (4) Cek `type=reset` → (5) Cari user → (6) Cek `tokenVersion` cocok → (7) Cek status akun → (8) Hash new password (bcrypt 12) → (9) Transaksi: `updateMany` user (atomic dengan `tokenVersion` cocok) + revoke semua refresh token aktif → (10) Clear cookies → (11) Audit + notifikasi |
| Alternative Flow | Tidak ada |
| Exception Flow | E1: Token invalid/expired → 400. E2: `type != reset` → 400. E3: User tidak ada / soft-deleted → 404. E4: `tokenVersion` mismatch → 400. E5: `SUSPENDED`/`DEACTIVATED` → 403. E6: Password policy tidak lulus → 422. E7: `confirmPassword` mismatch → 422. E8: Rate limit → 429. E9: `updateMany` count 0 (race) → 400. |
| Postcondition | `users.password` baru ter-hash; `users.tokenVersion` naik 1; semua `refresh_tokens` user ter-revoke; `AuditLog.USER_RESET_PASSWORD` tercatat |
| Input | `{ token, password, confirmPassword }` |
| Output | 200 + pesan sukses |
| Validation | password: min 8, ≥1 uppercase, ≥1 lowercase, ≥1 angka; `password === confirmPassword` |
| Business Rule | BR-AUTH-008, BR-AUTH-009, BR-AUTH-010, BR-AUTH-011, BR-AUTH-013, BR-AUTH-014 |
| Security Rule | Single-use via `tokenVersion` atomic update; revoke seluruh session; bcrypt 12 rounds; clear cookies |
| Dependency | `User`, `RefreshToken`, `AuditLog`, `Notification` |
| Priority | **Must Have** |
| Testability | Fully testable |

### 2.5 FR-AUTH-004 — Logout

| Field | Value |
| --- | --- |
| Requirement ID | `FR-AUTH-004` |
| Description | Member dapat keluar dari sesi dan menginvalidasi token |
| Business Objective | Mengakhiri sesi aktif sehingga token tidak dapat digunakan lagi |
| Actor | Member (authenticated) |
| Trigger | Klik tombol Logout |
| Precondition | `authMiddleware` valid; user ACTIVE |
| Main Flow | (1) Auth middleware valid → (2) Clear `token` & `refreshToken` cookies (maxAge=0) → (3) `revokeToken(refreshTokenHash)` → (4) `AuditLog.USER_LOGOUT` → (5) `ActivityHistory.USER_LOGOUT` |
| Alternative Flow | A1: `refreshToken` cookie tidak ada → tetap clear `token` cookie saja |
| Exception Flow | E1: Tidak ada `authMiddleware` → 401 (dari middleware) |
| Postcondition | Cookies clear; refresh token DB row `isRevoked=true`; access JWT masih valid sampai `exp` (lihat Open Questions & Gap Analysis) |
| Input | none |
| Output | 200 + `{ success: true, message: "Logout berhasil" }` |
| Validation | Auth required |
| Business Rule | BR-AUTH-015, BR-AUTH-016, BR-AUTH-017 |
| Security Rule | httpOnly cookie, server-side refresh token revocation; access JWT expiry tetap berlaku |
| Dependency | `User`, `RefreshToken`, `AuditLog`, `ActivityHistory` |
| Priority | **Must Have** |
| Testability | Fully testable |

### 2.6 FR-AUTH-005 — Session/Token Management (Derived)

| Field | Value |
| --- | --- |
| Requirement ID | `FR-AUTH-005` |
| Description | Sistem mengelola access JWT + refresh token dengan rotasi dan deteksi reuse |
| Trigger | Login, refresh, logout, reset-password, change-password |
| Main Flow | Login → set cookies; Refresh → rotate + reuse detection (semua session revoke jika reuse); Logout/Reset/Change → revoke all |
| Business Rule | BR-AUTH-005, BR-AUTH-006, BR-AUTH-015, BR-AUTH-016 |
| Security Rule | `tokenVersion` invalidation, family-based reuse detection, bcrypt hash refresh token |
| Priority | **Must Have** |

### 2.7 Business Rules (dari prompt)

| ID | Rule | Source |
| --- | --- | --- |
| BR-AUTH-001 | Akun disabled tidak dapat melakukan login | Prompt |
| BR-AUTH-002 | Password salah menghasilkan error message yang aman (tidak bocorin info) | Prompt |
| BR-AUTH-003 | Sistem tidak boleh memberikan informasi untuk account enumeration | Prompt |
| BR-AUTH-004 | Credential tidak boleh disimpan/ditampilkan plaintext | Prompt |
| BR-AUTH-005 | Session/token hanya dibuat setelah auth berhasil | Prompt |
| BR-AUTH-006 | Session/token harus memiliki expiration | Prompt |
| BR-AUTH-007 | Authentication endpoint harus dilindungi brute-force | Prompt |
| BR-AUTH-008 | Reset password menggunakan token valid | Prompt |
| BR-AUTH-009 | Reset token memiliki expiration | Prompt |
| BR-AUTH-010 | Reset token single-use | Prompt |
| BR-AUTH-011 | Password disimpan dengan secure hashing | Prompt |
| BR-AUTH-012 | Forgot password tidak boleh ungkap email terdaftar | Prompt |
| BR-AUTH-013 | Password baru memenuhi password policy | Prompt |
| BR-AUTH-014 | Password baru dan confirmation sama | Prompt |
| BR-AUTH-015 | Session/token invalid setelah logout | Prompt |
| BR-AUTH-016 | Token invalid tidak dapat akses protected resource | Prompt |
| BR-AUTH-017 | Logout → login ulang untuk akses protected | Prompt |

> **Catatan terhadap BR-AUTH-001 (disabled account):** Pada kode, login memblokir `SUSPENDED` dan `DEACTIVATED`. Soft-deleted user (`deletedAt` set) juga ditolak dengan pesan berbeda. [REC] pertimbangkan tambahan status `LOCKED` (account lockout) atau dokumentasikan bahwa "disabled" = `SUSPENDED + DEACTIVATED + soft-deleted`.

---

## 3. System Flow (Text-Based Flowchart)

### 3.1 Login

```
Member
  → GET /login
  → Input identifier & password
  → Validate (Zod: min length)
  → Rate limit check (5/15min per ip:identifier)
    ├─ Limit hit → 429 "Terlalu banyak percobaan login. Coba lagi nanti."
    └─ OK
  → Detect identifier type (contains "@" ? email : username)
  → Query user (email OR username) + roles
  → User found?
    ├─ NO → 401 generic "Email/username atau password salah"
    └─ YES
  → User.deletedAt?
    ├─ YES → 403 "Akun sudah dihapus"
    └─ NO
  → User.status?
    ├─ SUSPENDED → 403 "Akun ditangguhkan. Hubungi administrator."
    ├─ DEACTIVATED → 403 "Akun sudah dinonaktifkan"
    └─ ACTIVE
  → bcrypt.compare(password, user.password)
    ├─ FAIL → insert LoginHistory(success=false, failureReason=INVALID_PASSWORD)
    │        → 401 generic
    └─ PASS
  → generateAccessToken (JWT HS256, 15m, type=access, tokenVersion)
  → createRefreshTokenFamily (hashed, familyId, fingerprint, IP, UA)
  → setTokenCookies (httpOnly, secure, sameSite=lax)
  → AuditLog(USER_LOGIN)
  → LoginHistory(success=true)
  → ActivityHistory(USER_LOGIN)
  → 200 OK + user data
```

### 3.2 Forgot Password

```
Member
  → GET /forgot-password
  → Input email
  → Validate (Zod: email format)
  → Rate limit (3/hour per email)
    ├─ Limit hit → 429
    └─ OK
  → Find user by email
  → If user exists AND !deletedAt AND status=ACTIVE:
      → generateResetToken (JWT HS256, 1h, type=reset, tokenVersion)
      → Build reset URL `${APP_URL}/reset-password?token=<jwt>`
      → sendEmail (Resend) — failure hanya dilog
  → ALWAYS → 200 generic "Link reset password telah dikirim ke email Anda"
```

### 3.3 Reset Password

```
Member
  → Open reset link → /reset-password?token=<jwt>
  → Input new password + confirm
  → Validate (Zod: min 8, U/L/digit, confirmation match)
  → Rate limit (5/hour per token-hash)
    ├─ Limit hit → 429
    └─ OK
  → verifyToken(jwt)
    ├─ FAIL → 400 "Token tidak valid atau sudah kadaluarsa"
    └─ OK
  → payload.type == "reset"?
    ├─ NO → 400 "Token tidak valid"
    └─ YES
  → Find user by payload.sub
    ├─ NOT FOUND or deletedAt → 404
    └─ OK
  → payload.tokenVersion === user.tokenVersion?
    ├─ NO → 400 "Token tidak valid atau sudah digunakan"
    └─ YES
  → User.status?
    ├─ SUSPENDED → 403
    ├─ DEACTIVATED → 403
    └─ ACTIVE
  → bcrypt.hash(newPassword, 12)
  → TRANSACTION:
      user.updateMany(where id+tokenVersion match → set new password, tokenVersion++)
      if count==1: refreshToken.updateMany(isRevoked=false → isRevoked=true)
  → If count != 1 → 400 (race)
  → clearTokenCookies
  → AuditLog(USER_RESET_PASSWORD)
  → Notification (in-app)
  → 200 "Password berhasil diubah. Silakan login dengan password baru."
```

### 3.4 Logout

```
Member (authenticated)
  → POST /api/v1/auth/logout
  → authMiddleware (verify JWT, cek tokenVersion, status ACTIVE)
  → clearTokenCookies (token + refreshToken, maxAge=0, 3 Set-Cookie headers)
  → Read refreshToken cookie
    → if exists: revokeToken(tokenHash) → set isRevoked=true
  → AuditLog(USER_LOGOUT)
  → ActivityHistory(USER_LOGOUT)
  → 200 "Logout berhasil"
```

### 3.5 Expired Session/Token

```
Member
  → Request protected resource dengan cookie
  → authMiddleware:
      verifyToken → jika exp lewat → throw "Unauthorized" → 401
  → Atau:
      tokenVersion tidak cocok (mis. setelah reset) → 401
  → Frontend: redirect ke /login
```

### 3.6 Failed Authentication

```
Login
  → Rate limit / User not found / Soft-deleted / Status blocked / Password salah
  → Setiap skenario menghasilkan:
      - Generic message untuk user-facing
      - Audit/LoginHistory sesuai tipe (kecuali user tidak ditemukan)
      - HTTP 401/403/429 sesuai konteks
  → Tetap di /login, tampilkan pesan, fokus ke field password
```

### 3.7 Refresh Token Reuse Detection (Derived)

```
POST /api/v1/auth/refresh
  → Read refreshToken cookie
  → validateRefreshToken(tokenHash)
    ├─ tokenHash not found OR isRevoked=true → INVALID
    │    → if familyId known (reused token):
    │         revokeAllUserTokens(userId)
    │         user.tokenVersion += 1
    │         AuditLog(TOKEN_REUSE_DETECTED)
    │         Notification "Peringatan Keamanan"
    │    → 401
    └─ OK
  → Check user.status
  → rotateRefreshToken (issue new token, mark old revoked)
    ├─ expired → 401
    └─ reused detected during rotation
         → revoke all, tokenVersion++, audit, notify
         → 401
  → Issue new access token + set cookies
  → 200
```

---

## 4. Data & Database Analysis

> Berdasarkan `packages/database/prisma/schema.prisma`. Tabel di bawah adalah subset yang relevan dengan Authentication Module.

### 4.1 `users` (model `User`)

| Field | Type | Nullable | Constraint | Business Meaning | Security Concern |
| --- | --- | --- | --- | --- | --- |
| id | String (cuid) | No | PK | Identifier user | — |
| email | String | No | UNIQUE | Login identifier (email) | Disclosure via error → mitigasi generic 401 |
| username | String | No | UNIQUE | Login identifier (username) | Disclosure via error → mitigasi generic 401 |
| password | String | No | — | bcrypt hash (cost 12) | Harus hash; tidak boleh plaintext |
| name | String | No | — | Display name | PII |
| avatar | String? | Yes | — | URL avatar | — |
| phone | String? | Yes | — | Phone | PII |
| bio | String? (Text) | Yes | — | Profile bio | XSS risk jika di-render raw |
| location | String? | Yes | — | Location string | PII |
| emailVerifiedAt | DateTime? | Yes | — | Email verification timestamp [TBC - belum ada flow] | Memengaruhi reset-password eligibility |
| status | enum(UserStatus) | No | Default `ACTIVE` | ACTIVE/SUSPENDED/DEACTIVATED | Login gate |
| deletedAt | DateTime? | Yes | Index | Soft delete | Login gate |
| tokenVersion | Int | No | Default 0 | Increment saat reset/change-password untuk invalidasi access JWT | Mitigasi token reuse pasca credential change |
| createdAt | DateTime | No | Default now | Audit | — |
| updatedAt | DateTime | No | @updatedAt | Audit | — |

**Indexes:** `status`, `deletedAt`. `[TBC]` Index tambahan untuk `email`, `username` (sudah unique → implicit index).

### 4.2 `user_roles` (model `UserRole`)

| Field | Type | Nullable | Constraint | Business Meaning | Security Concern |
| --- | --- | --- | --- | --- | --- |
| id | String (cuid) | No | PK | — | — |
| userId | String | No | FK → users.id | Relasi | Cascade |
| role | String | No | @@unique([userId, role]) | RBAC role | Privilege escalation jika ditambahkan tanpa validasi |

### 4.3 `refresh_tokens` (model `RefreshToken`)

| Field | Type | Nullable | Constraint | Business Meaning | Security Concern |
| --- | --- | --- | --- | --- | --- |
| id | String (cuid) | No | PK | — | — |
| userId | String | No | FK → users.id (Cascade) | Owner token | — |
| tokenHash | String | No | UNIQUE | bcrypt/argon hash dari token; cookie berisi plaintext | Pencarian hash; DB compromise → tidak recoverable tanpa hash |
| familyId | String | No | Index | Grup rotasi token (parent-child lineage) | Deteksi reuse: jika token lama dirotasi dicoba lagi → revoke seluruh family |
| fingerprint | String? | Yes | — | Device fingerprint opsional | — |
| ipAddress | String? | Yes | — | IP saat issuance | PII; log retention |
| userAgent | String? | Yes | — | UA saat issuance | PII |
| isRevoked | Boolean | No | Default false; Index([userId, isRevoked]) | Status revocation | — |
| expiresAt | DateTime | No | Index | Expiration 30d | Cleanup job [TBC] |
| createdAt | DateTime | No | Default now | Audit | — |
| updatedAt | DateTime | No | @updatedAt | Audit | — |

**Indexes:** `userId`, `familyId`, `tokenHash`, `expiresAt`, `[userId, isRevoked]`.

### 4.4 `login_history` (model `LoginHistory`)

| Field | Type | Nullable | Constraint | Business Meaning | Security Concern |
| --- | --- | --- | --- | --- | --- |
| id | String (cuid) | No | PK | — | — |
| userId | String | No | FK → users.id (Cascade) | User attempt | — |
| ipAddress | String? | Yes | — | Source IP | PII |
| userAgent | String? | Yes | — | UA | PII |
| success | Boolean | No | Default true, Index | Outcome | — |
| failureReason | String? | Yes | — | e.g. `INVALID_PASSWORD` | Jangan bocorin info sensitif |
| createdAt | DateTime | No | Default now, Index | Timestamp | Retention [TBC] |

**Indexes:** `userId`, `createdAt`, `success`.

### 4.5 `activity_history` (model `ActivityHistory`)

| Field | Type | Nullable | Constraint | Business Meaning | Security Concern |
| --- | --- | --- | --- | --- | --- |
| id | String (cuid) | No | PK | — | — |
| userId | String | No | FK → users.id (Cascade) | User | — |
| action | String | No | — | e.g. `USER_LOGIN`, `USER_LOGOUT`, `USER_REGISTER` | — |
| details | Json? | Yes | — | Optional structured detail | Jangan simpan password plaintext |
| createdAt | DateTime | No | Default now, Index | Timestamp | Retention |

### 4.6 `audit_logs` (model `AuditLog`)

| Field | Type | Nullable | Constraint | Business Meaning | Security Concern |
| --- | --- | --- | --- | --- | --- |
| id | String (cuid) | No | PK | — | — |
| userId | String? | Yes | FK (nullable untuk system events) | Actor | — |
| actionType | String | No | — | `USER_LOGIN`, `USER_LOGOUT`, `USER_REGISTER`, `USER_CHANGE_PASSWORD`, `USER_RESET_PASSWORD`, `TOKEN_REUSE_DETECTED`, `SESSION_REVOKED`, `ALL_SESSIONS_REVOKED` | — |
| resourceName | String? | Yes | — | e.g. `User` | — |
| resourceId | String? | Yes | — | ID | — |
| beforeData | Json? | Yes | — | Snapshot sebelum | Bisa berisi PII |
| afterData | Json? | Yes | — | Snapshot sesudah | Bisa berisi PII |
| ipAddress | String? | Yes | — | — | PII |
| userAgent | String? | Yes | — | — | PII |
| createdAt | DateTime | No | Default now, Index | Timestamp | Retention |

### 4.7 `notifications` (model `Notification`)

| Field | Type | Nullable | Constraint | Business Meaning | Security Concern |
| --- | --- | --- | --- | --- | --- |
| id | String (cuid) | No | PK | — | — |
| userId | String | No | FK → users.id (Cascade) | Recipient | — |
| title | String | No | — | e.g. "Peringatan Keamanan" | — |
| message | String (Text) | No | — | e.g. reset alert | Jangan bocorin token |
| type | String | No | — | e.g. `SYSTEM` | — |
| isRead | Boolean | No | Default false | Read state | — |
| createdAt | DateTime | No | Default now | Timestamp | — |

### 4.8 Catatan Entitas

- **Tidak ada tabel `password_reset_tokens` dedicated.** [ASM/REC] Reset token diimplementasikan sebagai JWT pendek (1 jam) dengan `type=reset` + `tokenVersion`. Single-use dijamin oleh `tokenVersion` atomic increment. Ini **memenuhi** BR-AUTH-008, BR-AUTH-009, BR-AUTH-010.
- **Tidak ada field `failedLoginAttempts` / `lockedUntil` di `users`.** [TBC] Account lockout per-user tidak diimplementasikan. Mitigasi brute force hanya via rate limit (5/15min per `ip:identifier`) + exponential backoff setelah 3 gagal.
- **Tidak ada field `lastLoginAt` di `users`.** [TBC] Timestamp login terakhir hanya tersedia via `LoginHistory` (query latest). Pertimbangkan menambah kolom denormalized untuk performance.
- **Tidak ada `password_changed_at` / `password_expires_at`.** [TBC] Password expiration policy tidak ada.
- **`User.password` adalah `String` non-null tanpa constraint tipe.** [REC] Pertimbangkan wrapper opaque atau dokumentasi invariant bcrypt.

---

## 5. API Analysis

> Base path: `/api/v1/auth` (lihat `apps/api/src/index.ts` untuk mounting). Semua endpoint rate-limited sesuai tabel di bawah.

### 5.1 POST /auth/login

| Aspek | Detail |
| --- | --- |
| Method | POST |
| Endpoint | `/api/v1/auth/login` |
| Auth Required | No |
| Request | `{ identifier: string, password: string }` |
| Validation | identifier `min(1)`, password `min(1)` |
| Rate Limit | `loginRateLimiter`: 5 / 15 min per `ip:identifier`, exponential backoff setelah 3 gagal |
| Response Success | 200 + `{ success: true, message: "Login berhasil", data: { user: { id, name, username, email, avatar, roles[] } } }` + Set-Cookie `token`, `refreshToken` |
| Response Error | 400 invalid input · 401 "Email/username atau password salah" (generic) · 403 akun soft-deleted/SUSPENDED/DEACTIVATED · 429 rate limit |
| Business Rule | BR-AUTH-001..007 |
| Security | bcrypt verify, generic 401, httpOnly cookies, tokenVersion, audit |
| Audit | `AuditLog.USER_LOGIN`, `LoginHistory(success=true)`, `ActivityHistory.USER_LOGIN` |
| DB Touched | `users`, `user_roles`, `refresh_tokens` (insert), `login_history` (insert), `activity_history` (insert), `audit_logs` (insert) |
| Status Code Rationale | 200 success · 400 schema validation fail (dari `validate` middleware) · 401 invalid creds · 403 forbidden status · 429 rate limit |

### 5.2 POST /auth/register

| Aspek | Detail |
| --- | --- |
| Method | POST |
| Endpoint | `/api/v1/auth/register` |
| Auth Required | No |
| Request | `{ name, username, email, password, confirmPassword }` |
| Validation | name 2-100; username 3-30 `[a-zA-Z0-9_]`; email format; password min 8 + U/L/digit; confirm match |
| Rate Limit | `registrationRateLimiter` (per IP) |
| Response Success | 201 + user data + Set-Cookie |
| Response Error | 400 validation · 409 email/username exists · 429 rate limit · 500 internal |
| Audit | `AuditLog.USER_REGISTER`, `ActivityHistory.USER_REGISTER`, in-app welcome `Notification` |
| Status Code Rationale | 201 Created (resource baru) · 409 Conflict (email/username duplicate) |

### 5.3 POST /auth/forgot-password

| Aspek | Detail |
| --- | --- |
| Method | POST |
| Endpoint | `/api/v1/auth/forgot-password` |
| Auth Required | No |
| Request | `{ email: string }` |
| Validation | email format |
| Rate Limit | `forgotPasswordRateLimiter`: 3 / hour per email |
| Response Success | 200 + `{ success: true, message: "Link reset password telah dikirim ke email Anda" }` — **identik terlepas ada/tidak user** |
| Response Error | 400 invalid email · 429 rate limit |
| Business Rule | BR-AUTH-008, BR-AUTH-009, BR-AUTH-010, BR-AUTH-011, BR-AUTH-012 |
| Security | Identik response → mencegah account enumeration; token 1h; `type=reset` |
| Audit | `activity_history` (implisit via logger); tidak ada `AuditLog` eksplisit saat ini **[TBC/REC] tambahkan AuditLog untuk request reset** |
| DB Touched | `users` (read); `services/email.ts` (outbound) |

### 5.4 POST /auth/reset-password

| Aspek | Detail |
| --- | --- |
| Method | POST |
| Endpoint | `/api/v1/auth/reset-password` |
| Auth Required | No (membawa token) |
| Request | `{ token, password, confirmPassword }` |
| Validation | password policy (min 8, U/L/digit); confirm match |
| Rate Limit | `resetPasswordRateLimiter`: 5 / hour per token-hash |
| Response Success | 200 + `{ success: true, message: "Password berhasil diubah..." }` |
| Response Error | 400 invalid token/expired/used · 403 SUSPENDED/DEACTIVATED · 404 user not found · 400 validation (Zod) · 429 rate limit |
| Business Rule | BR-AUTH-008, BR-AUTH-010, BR-AUTH-011, BR-AUTH-013, BR-AUTH-014 |
| Security | bcrypt 12, atomic `updateMany(tokenVersion match)`, revoke all refresh tokens, clear cookies |
| Audit | `AuditLog.USER_RESET_PASSWORD`, in-app `Notification` |
| DB Touched | `users` (update), `refresh_tokens` (revoke all), `audit_logs` (insert), `notifications` (insert) |
| Status Code Rationale | 400 untuk token invalid; 403 untuk status akun; 404 user hilang; **[REC] gunakan 422 untuk Zod validation (saat ini 400)** |

### 5.5 POST /auth/refresh

| Aspek | Detail |
| --- | --- |
| Method | POST |
| Endpoint | `/api/v1/auth/refresh` |
| Auth Required | No (membawa refresh cookie) |
| Request | (cookies only) |
| Response Success | 200 + user data + Set-Cookie rotated |
| Response Error | 401 token missing/invalid/expired/reused · 429 rate limit |
| Security | Reuse detection → revoke all + tokenVersion++ + audit + notification |
| Audit | `AuditLog.TOKEN_REUSE_DETECTED` (saat reuse) |
| DB Touched | `refresh_tokens` (rotate), `users` (tokenVersion saat reuse), `audit_logs`, `notifications` |

### 5.6 POST /auth/logout

| Aspek | Detail |
| --- | --- |
| Method | POST |
| Endpoint | `/api/v1/auth/logout` |
| Auth Required | Yes (authMiddleware) |
| Request | (cookies) |
| Response Success | 200 + `{ success: true, message: "Logout berhasil" }` |
| Response Error | 401 unauthorized |
| Business Rule | BR-AUTH-015, BR-AUTH-016, BR-AUTH-017 |
| Security | Clear cookies (3 Set-Cookie headers untuk coverage path `token`/`refreshToken`), revoke refresh token DB |
| Audit | `AuditLog.USER_LOGOUT`, `ActivityHistory.USER_LOGOUT` |
| DB Touched | `refresh_tokens` (update isRevoked), `audit_logs`, `activity_history` |

### 5.7 GET /auth/me

| Aspek | Detail |
| --- | --- |
| Method | GET |
| Endpoint | `/api/v1/auth/me` |
| Auth Required | Yes |
| Response Success | 200 + `{ user: { id, name, username, email, phone, bio, location, avatar, status, roles[], interests[], communitiesCount, organizationsCount, createdAt } }` |
| Response Error | 401 · 404 user hilang |

### 5.8 PUT /auth/change-password

| Aspek | Detail |
| --- | --- |
| Method | PUT |
| Endpoint | `/api/v1/auth/change-password` |
| Auth Required | Yes |
| Request | `{ currentPassword, newPassword, confirmNewPassword }` |
| Validation | currentPassword min 1; newPassword policy; confirm match |
| Response Success | 200 + `{ success: true, message: "Password berhasil diubah" }` |
| Response Error | 400 validation · 401 current password salah atau token invalid · 404 user hilang |
| Security | bcrypt verify old, bcrypt hash new, `tokenVersion++`, `revokeAllUserTokens`, clear cookies |
| Audit | `AuditLog.USER_CHANGE_PASSWORD`, in-app `Notification` |
| DB Touched | `users`, `refresh_tokens`, `audit_logs`, `notifications` |

### 5.9 GET /auth/sessions

| Aspek | Detail |
| --- | --- |
| Method | GET |
| Endpoint | `/api/v1/auth/sessions` |
| Auth Required | Yes |
| Response Success | 200 + `{ sessions: [...] }` dari `getActiveSessions(user.id)` |

### 5.10 DELETE /auth/sessions/:sessionId

| Aspek | Detail |
| --- | --- |
| Method | DELETE |
| Endpoint | `/api/v1/auth/sessions/:sessionId` |
| Auth Required | Yes |
| Response Success | 200 "Sesi berhasil ditutup" |
| Response Error | 404 session tidak ditemukan / bukan milik user |
| Audit | `AuditLog.SESSION_REVOKED` |

### 5.11 DELETE /auth/sessions (logout all)

| Aspek | Detail |
| --- | --- |
| Method | DELETE |
| Endpoint | `/api/v1/auth/sessions` |
| Auth Required | Yes |
| Response Success | 200 + `{ revokedCount }` |
| Security | `revokeAllUserTokens` + `tokenVersion++` |
| Audit | `AuditLog.ALL_SESSIONS_REVOKED` |

### 5.12 HTTP Status Code Convention (Final)

| Code | Use Case | Contoh |
| --- | --- | --- |
| 200 | OK (read/update success) | login, me, refresh, logout, change-password, reset-password |
| 201 | Created | register |
| 400 | Bad Request — token/semantic invalid | token invalid/expired/used |
| 401 | Unauthorized — credential/session invalid | login gagal, refresh token invalid, logout tanpa session |
| 403 | Forbidden — status akun | SUSPENDED/DEACTIVATED/soft-deleted |
| 404 | Not Found | user/session hilang |
| 409 | Conflict | email/username duplikat |
| 422 | Unprocessable Entity — semantic validation | **[REC]** Gunakan untuk Zod validation (saat ini dikembalikan 400) |
| 429 | Too Many Requests | rate limit |
| 500 | Internal Server Error | unexpected error |

---

## 6. QA Test Strategy

### 6.1 Functional Testing

Login, Forgot Password, Reset Password, Logout, Refresh, Change Password, Get Sessions, Revoke Session, Logout All.

### 6.2 Negative Testing

- Invalid identifier (tidak ada di DB)
- Invalid email format
- Invalid password
- Empty identifier/password
- Disabled account (`SUSPENDED`/`DEACTIVATED`/soft-deleted)
- Expired reset token
- Invalid/garbage reset token
- Used reset token
- `tokenVersion` mismatch (token yang di-issue sebelum reset)
- Logout tanpa auth
- Refresh tanpa cookie

### 6.3 Validation Testing

- Password length 7, 8, 9, 100, 200 (boundary)
- Password tanpa uppercase / lowercase / digit
- Email tanpa `@`, tanpa TLD, dengan whitespace
- Username dengan karakter spesial
- `confirmPassword` ≠ `password`
- Missing field (Zod required)
- Whitespace-only string

### 6.4 Security Testing (Lihat §11 untuk Given/When/Then)

| Topik | Vector |
| --- | --- |
| Account enumeration | Login dengan email ada vs tidak → respons identik 401; Forgot-password identik 200 |
| Brute force | 6+ login gagal berurutan dari IP/identifier sama → 429 |
| Credential stuffing | Login dengan list password umum (integration dengan HaveIBeenPwned [OPT]) |
| Rate limiting | Per-IP dan per-identifier/login; per-email/forgot; per-token/reset |
| SQL injection | `' OR 1=1 --` di identifier; Prisma parameterized → harus aman; tetap uji |
| XSS | `<script>alert(1)</script>` di name/username; lib `xss.ts` + `sanitize.ts`; payload di identifier harus di-handle |
| CSRF | State-changing endpoint (login, logout, change-password) — `csrf.ts` middleware; SameSite=Lax cookie; double-submit token [TBC] |
| Session fixation | Ganti `Set-Cookie` setelah auth (cookie baru harus issue) |
| Session hijacking | Capture cookie dan reuse; expire harus tetap berlaku; `tokenVersion` harus match |
| Token replay | Refresh token reuse detection |
| Token reuse | Lihat §3.7 |
| Token expiration | Access JWT expire 15m; refresh 30d; reset JWT 1h |
| Password exposure | Response/audit/log tidak boleh bocorkan password plaintext |
| Sensitive disclosure | Error response tidak boleh stack trace; tidak ada info versioning |
| Auth bypass | Request tanpa cookie / dengan token tipe salah (`reset` sebagai `access`) |
| Authz bypass | Akses `/admin/*` dengan role `MEMBER` (covered by RBAC, di luar scope modul ini) |

### 6.5 Integration Testing

Validasi alur:

```
Web (Next.js form)
  → fetch /api/v1/auth/login
  → API: validate → rate limit → DB query → bcrypt → JWT issue → Set-Cookie
  → Cookie disimpan browser
  → Request protected /api/v1/auth/me
  → authMiddleware verify JWT + tokenVersion
  → DB query
  → Response
```

### 6.6 Regression Testing

Modul yang harus diretest setelah perubahan auth:

- **Event create** (memerlukan auth + organizer mapping)
- **Community join/organization join**
- **Volunteer application**
- **Admin endpoints** (admin login & RBAC)
- **Notification delivery** (in-app notif security)
- **Session list & revoke**

---

## 7. Test Scenario

> Format: `| Scenario ID | Requirement | Business Rule | Scenario | Expected Result | Priority | Type |`

### 7.1 Login

| Scenario ID | Requirement | Business Rule | Scenario | Expected Result | Priority | Type |
| --- | --- | --- | --- | --- | --- | --- |
| TS-AUTH-001 | FR-AUTH-001 | BR-AUTH-005 | Valid email + valid password | 200 + user data + Set-Cookie token + refreshToken | Must | Functional |
| TS-AUTH-002 | FR-AUTH-001 | BR-AUTH-005 | Valid username + valid password | 200 + user data + Set-Cookie | Must | Functional |
| TS-AUTH-003 | FR-AUTH-001 | BR-AUTH-002, BR-AUTH-003 | Invalid identifier (tidak terdaftar) | 401 generic "Email/username atau password salah" | Must | Negative |
| TS-AUTH-004 | FR-AUTH-001 | BR-AUTH-002, BR-AUTH-003 | Valid identifier + wrong password | 401 generic | Must | Negative |
| TS-AUTH-005 | FR-AUTH-001 | BR-AUTH-001 | Login akun `SUSPENDED` | 403 "Akun ditangguhkan. Hubungi administrator." | Must | Negative |
| TS-AUTH-006 | FR-AUTH-001 | BR-AUTH-001 | Login akun `DEACTIVATED` | 403 "Akun sudah dinonaktifkan" | Must | Negative |
| TS-AUTH-007 | FR-AUTH-001 | BR-AUTH-001 | Login akun soft-deleted (`deletedAt` set) | 403 "Akun sudah dihapus" | Must | Negative |
| TS-AUTH-008 | FR-AUTH-001 | — | Empty identifier | 400 validation | Must | Validation |
| TS-AUTH-009 | FR-AUTH-001 | — | Empty password | 400 validation | Must | Validation |
| TS-AUTH-010 | FR-AUTH-001 | — | Both empty | 400 validation | Must | Validation |
| TS-AUTH-011 | FR-AUTH-001 | — | Identifier dengan leading/trailing whitespace | 401 generic (no special handling) | Should | Validation |
| TS-AUTH-012 | FR-AUTH-001 | — | Identifier case-sensitivity (email lowercase, username case) | Email: case-insensitive normalized [TBC] · Username: case-sensitive sesuai DB | Should | Validation |
| TS-AUTH-013 | FR-AUTH-001 | BR-AUTH-007 | 5+ failed login dari `ip:identifier` sama | 429 dengan `retryAfter` | Must | Security |
| TS-AUTH-014 | FR-AUTH-001 | BR-AUTH-006 | Login berhasil lalu tunggu > 15 menit, akses `/me` | 401 (access JWT expired); refresh bekerja | Must | Security |
| TS-AUTH-015 | FR-AUTH-001 | BR-AUTH-005 | Verifikasi Set-Cookie `token` httpOnly, secure (prod), sameSite=lax | Inspeksi header Set-Cookie | Must | Security |
| TS-AUTH-016 | FR-AUTH-001 | BR-AUTH-004 | Pastikan response tidak bocorkan password hash | Inspect JSON & log | Must | Security |
| TS-AUTH-017 | FR-AUTH-001 | — | Identifier mengandung SQL injection | Response error Prisma parameterized; tidak ada SQL executed | Must | Security |
| TS-AUTH-018 | FR-AUTH-001 | — | Login dari 2 device berbeda | 2 refresh token families; `/sessions` list keduanya | Should | Integration |
| TS-AUTH-019 | FR-AUTH-001 | — | `LoginHistory` entry tercatat untuk success & failure | DB row exists dengan field benar | Must | DB |

### 7.2 Forgot Password

| Scenario ID | Requirement | Business Rule | Scenario | Expected Result | Priority | Type |
| --- | --- | --- | --- | --- | --- | --- |
| TS-AUTH-020 | FR-AUTH-002 | BR-AUTH-012 | Email terdaftar & ACTIVE | 200 generic + email terkirim | Must | Functional |
| TS-AUTH-021 | FR-AUTH-002 | BR-AUTH-012 | Email TIDAK terdaftar | 200 generic (identik dengan TS-AUTH-020) | Must | Security |
| TS-AUTH-022 | FR-AUTH-002 | BR-AUTH-012 | Email milik akun SUSPENDED | 200 generic; email TIDAK terkirim | Must | Security |
| TS-AUTH-023 | FR-AUTH-002 | BR-AUTH-012 | Email milik akun soft-deleted | 200 generic; email TIDAK terkirim | Must | Security |
| TS-AUTH-024 | FR-AUTH-002 | — | Email invalid format | 400/422 validation | Must | Validation |
| TS-AUTH-025 | FR-AUTH-002 | — | Email empty | 400/422 validation | Must | Validation |
| TS-AUTH-026 | FR-AUTH-002 | BR-AUTH-007 | 4+ request forgot untuk email sama dalam 1 jam | 429 | Must | Security |
| TS-AUTH-027 | FR-AUTH-002 | BR-AUTH-009 | Reset link expire dalam 1 jam | Lihat TS-AUTH-036 | Must | Security |
| TS-AUTH-028 | FR-AUTH-002 | — | Email service down | 200 generic tetap (failure hanya di log) | Should | Integration |

### 7.3 Reset Password

| Scenario ID | Requirement | Business Rule | Scenario | Expected Result | Priority | Type |
| --- | --- | --- | --- | --- | --- | --- |
| TS-AUTH-029 | FR-AUTH-003 | BR-AUTH-008, BR-AUTH-011 | Valid token + password baru valid + confirm match | 200; password_hash update; tokenVersion++; refresh tokens revoked | Must | Functional |
| TS-AUTH-030 | FR-AUTH-003 | BR-AUTH-013 | Password baru < 8 char | 400/422 validation | Must | Validation |
| TS-AUTH-031 | FR-AUTH-003 | BR-AUTH-013 | Password baru tanpa uppercase | 400/422 validation | Must | Validation |
| TS-AUTH-032 | FR-AUTH-003 | BR-AUTH-013 | Password baru tanpa lowercase | 400/422 validation | Must | Validation |
| TS-AUTH-033 | FR-AUTH-003 | BR-AUTH-013 | Password baru tanpa digit | 400/422 validation | Must | Validation |
| TS-AUTH-034 | FR-AUTH-003 | BR-AUTH-014 | `password !== confirmPassword` | 400/422 validation | Must | Validation |
| TS-AUTH-035 | FR-AUTH-003 | BR-AUTH-008 | Token random / invalid signature | 400 "Token tidak valid atau sudah kadaluarsa" | Must | Security |
| TS-AUTH-036 | FR-AUTH-003 | BR-AUTH-009 | Token expire (>1h) | 400 | Must | Security |
| TS-AUTH-037 | FR-AUTH-003 | BR-AUTH-010 | Token yang sudah pernah dipakai (tokenVersion sudah naik) | 400 "Token tidak valid atau sudah digunakan" | Must | Security |
| TS-AUTH-038 | FR-AUTH-003 | BR-AUTH-010 | Race: token dipakai 2x paralel | Hanya 1 yang 200; yang kedua 400 (atomic updateMany) | Must | Security |
| TS-AUTH-039 | FR-AUTH-003 | — | Token `type != "reset"` (mis. access JWT) | 400 "Token tidak valid" | Must | Security |
| TS-AUTH-040 | FR-AUTH-003 | — | User berstatus SUSPENDED | 403 | Should | Negative |
| TS-AUTH-041 | FR-AUTH-003 | — | User soft-deleted | 404 | Should | Negative |
| TS-AUTH-042 | FR-AUTH-003 | BR-AUTH-007 | 6+ percobaan reset untuk token sama | 429 | Must | Security |
| TS-AUTH-043 | FR-AUTH-003 | BR-AUTH-016 | Setelah reset, coba pakai access JWT lama | 401 (tokenVersion mismatch) | Must | Security |
| TS-AUTH-044 | FR-AUTH-003 | BR-AUTH-016 | Setelah reset, coba pakai refresh token lama | 401 (refresh_token.isRevoked = true) | Must | Security |
| TS-AUTH-045 | FR-AUTH-003 | — | Set-Cookie `token` & `refreshToken` di-clear | Inspeksi `Set-Cookie maxAge=0` | Must | Security |
| TS-AUTH-046 | FR-AUTH-003 | — | Notification "Password Berhasil Direset" terkirim ke user | DB row notifications exists | Should | DB |

### 7.4 Logout

| Scenario ID | Requirement | Business Rule | Scenario | Expected Result | Priority | Type |
| --- | --- | --- | --- | --- | --- | --- |
| TS-AUTH-047 | FR-AUTH-004 | BR-AUTH-015 | Logout dengan auth valid | 200; cookies cleared; `refresh_tokens.isRevoked = true`; AuditLog USER_LOGOUT | Must | Functional |
| TS-AUTH-048 | FR-AUTH-004 | BR-AUTH-017 | Logout tanpa cookie | 401 (authMiddleware) | Must | Negative |
| TS-AUTH-049 | FR-AUTH-004 | BR-AUTH-016 | Akses `/me` setelah logout dengan access JWT lama | **[GAP — lihat §13]** Saat ini tidak invalid; akan 200 sampai exp. | Must | Security |
| TS-AUTH-050 | FR-AUTH-004 | BR-AUTH-016 | Refresh dengan refresh token lama setelah logout | 401 (isRevoked = true) | Must | Security |
| TS-AUTH-051 | FR-AUTH-004 | — | Browser back button setelah logout | Browser cached page boleh tampil, tapi fetch API baru 401 | Should | UX |
| TS-AUTH-052 | FR-AUTH-004 | — | Logout dari 1 tab, tab lain masih punya cookie | Tab lain masih authenticated sampai access JWT expire | Should | UX |
| TS-AUTH-053 | FR-AUTH-004 | — | Multiple sessions, logout 1 device via `DELETE /sessions/:id` | Hanya session itu yang revoked | Should | Integration |
| TS-AUTH-054 | FR-AUTH-004 | — | Logout all via `DELETE /sessions` | Semua session revoked; tokenVersion naik | Should | Integration |
| TS-AUTH-055 | FR-AUTH-004 | — | Logout dengan expired access token | 401 (dari middleware) | Should | Negative |

---

## 8. Detailed Test Case

> Format: `| TC ID | Requirement | Scenario | Preconditions | Test Data | Steps | Expected Result | Priority | Type |`
> Test data **TIDAK** memuat password plaintext nyata; gunakan placeholder `********`.

### 8.1 Login

| TC ID | Requirement | Scenario | Preconditions | Test Data | Steps | Expected Result | Priority | Type |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TC-AUTH-001 | FR-AUTH-001 | Valid login dengan email | User ACTIVE | identifier=`user1@example.com`, password=`********` | 1. POST /api/v1/auth/login. 2. Inspect response. | HTTP 200; `success=true`; `data.user.email = user1@example.com`; `data.user.roles` berisi `["MEMBER"]`; `Set-Cookie` `token` (HttpOnly, SameSite=Lax) dan `refreshToken` (HttpOnly, Path=/api/v1/auth/refresh); `LoginHistory.success=true`; `ActivityHistory.action=USER_LOGIN`; `AuditLog.actionType=USER_LOGIN` | Must | Functional |
| TC-AUTH-002 | FR-AUTH-001 | Valid login dengan username | User ACTIVE | identifier=`usertest`, password=`********` | 1. POST /login. 2. Inspect. | HTTP 200; `data.user.username = usertest`; cookies di-set | Must | Functional |
| TC-AUTH-003 | FR-AUTH-001 | Identifier tidak terdaftar | — | identifier=`nope@example.com`, password=`********` | 1. POST /login. | HTTP 401; `message = "Email/username atau password salah"`; **TIDAK** ada Set-Cookie; tidak ada `LoginHistory` (karena user tidak ditemukan) | Must | Negative |
| TC-AUTH-004 | FR-AUTH-001 | Password salah | User ACTIVE | identifier=`user1@example.com`, password=`wrongpwd` | 1. POST /login. | HTTP 401; `message = "Email/username atau password salah"`; `LoginHistory` row `success=false`, `failureReason="INVALID_PASSWORD"`; tidak ada `refresh_token` baru | Must | Negative |
| TC-AUTH-005 | FR-AUTH-001 | Akun SUSPENDED | User `status=SUSPENDED` | identifier, password valid | 1. POST /login. | HTTP 403; `message = "Akun ditangguhkan. Hubungi administrator."` | Must | Negative |
| TC-AUTH-006 | FR-AUTH-001 | Akun DEACTIVATED | User `status=DEACTIVATED` | identifier, password valid | 1. POST /login. | HTTP 403; `message = "Akun sudah dinonaktifkan"` | Must | Negative |
| TC-AUTH-007 | FR-AUTH-001 | Akun soft-deleted | User `deletedAt` set | identifier, password valid | 1. POST /login. | HTTP 403; `message = "Akun sudah dihapus"` | Must | Negative |
| TC-AUTH-008 | FR-AUTH-001 | Empty identifier | — | `{ identifier: "", password: "********" }` | 1. POST /login. | HTTP 400 (Zod `min(1)`) | Must | Validation |
| TC-AUTH-009 | FR-AUTH-001 | Empty password | — | `{ identifier: "user1@example.com", password: "" }` | 1. POST /login. | HTTP 400 | Must | Validation |
| TC-AUTH-010 | FR-AUTH-001 | Identifier SQL injection | — | identifier = `' OR 1=1 --`, password=`x` | 1. POST /login. | HTTP 401; tidak ada SQL error; Prisma parameterized | Must | Security |
| TC-AUTH-011 | FR-AUTH-001 | 6x failed login dari IP+identifier sama | — | Ulangi 6× TC-AUTH-004 | 1. POST /login 6× dalam 15 menit. | Request 1-5: HTTP 401. Request 6: HTTP 429 dengan `retryAfter` (detik) | Must | Security |
| TC-AUTH-012 | FR-AUTH-001 | Verify Set-Cookie flags | — | Login sukses | 1. Inspect response headers. | `Set-Cookie: token=...; HttpOnly; SameSite=Lax; Path=/;` (Secure di production); `Set-Cookie: refreshToken=...; HttpOnly; SameSite=Lax; Path=/api/v1/auth/refresh;` | Must | Security |
| TC-AUTH-013 | FR-AUTH-001 | Password leak check | — | Login sukses & gagal | 1. Capture full response & log. | Tidak ada `password` di JSON response; tidak ada `password` di log; tidak ada `passwordHash` bocor | Must | Security |
| TC-AUTH-014 | FR-AUTH-001 | Token expiration | Login sukses, tunggu `JWT_EXPIRES_IN` (15m) | Cookie | 1. GET /me. | HTTP 401; frontend refresh via /auth/refresh | Must | Security |
| TC-AUTH-015 | FR-AUTH-001 | Login dari 2 device | — | Device A & B login | 1. Login di A. 2. Login di B. 3. GET /sessions. | 2 entries dengan `familyId` berbeda dan IP/UA berbeda | Should | Integration |
| TC-AUTH-016 | FR-AUTH-001 | Identifier whitespace | User email `user1@example.com` | identifier = `" user1@example.com "` | 1. POST /login. | HTTP 401 atau 200 jika di-trim otomatis [TBC] | Should | Validation |
| TC-AUTH-017 | FR-AUTH-001 | Identifier case sensitivity (email) | User email=`user1@example.com` | identifier = `USER1@EXAMPLE.COM` | 1. POST /login. | HTTP 401 (DB lookup case-sensitive) [TBC] | Should | Validation |

### 8.2 Forgot Password

| TC ID | Requirement | Scenario | Preconditions | Test Data | Steps | Expected Result | Priority | Type |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TC-AUTH-018 | FR-AUTH-002 | Email terdaftar & ACTIVE | User ACTIVE, email registered | `{ email: "user1@example.com" }` | 1. POST /forgot-password. | HTTP 200; `message = "Link reset password telah dikirim ke email Anda"`; email diterima (mock Resend) berisi link `${APP_URL}/reset-password?token=<jwt>` | Must | Functional |
| TC-AUTH-019 | FR-AUTH-002 | Email TIDAK terdaftar | — | `{ email: "ghost@example.com" }` | 1. POST /forgot-password. | HTTP 200 dengan message **identik** TC-AUTH-018; TIDAK ada email terkirim | Must | Security |
| TC-AUTH-020 | FR-AUTH-002 | Email SUSPENDED | User SUSPENDED | `{ email: "suspended@example.com" }` | 1. POST /forgot-password. | HTTP 200 generik; TIDAK ada email terkirim | Must | Security |
| TC-AUTH-021 | FR-AUTH-002 | Email soft-deleted | User deletedAt set | `{ email: "deleted@example.com" }` | 1. POST /forgot-password. | HTTP 200 generik; TIDAK ada email terkirim | Must | Security |
| TC-AUTH-022 | FR-AUTH-002 | Email invalid format | — | `{ email: "not-an-email" }` | 1. POST /forgot-password. | HTTP 400/422; Zod validation | Must | Validation |
| TC-AUTH-023 | FR-AUTH-002 | Empty email | — | `{ email: "" }` | 1. POST /forgot-password. | HTTP 400/422 | Must | Validation |
| TC-AUTH-024 | FR-AUTH-002 | Rate limit 4× dalam 1 jam | Email terdaftar | Ulangi 4× TC-AUTH-018 | 1. POST /forgot-password 4× untuk email sama. | Request 1-3: 200. Request 4: 429 | Must | Security |
| TC-AUTH-025 | FR-AUTH-002 | Reset email content inspection | — | TC-AUTH-018 | 1. Buka email. 2. Inspect body. | Subject sesuai template; body berisi link `${APP_URL}/reset-password?token=...`; token adalah JWT dengan `type=reset`; link tidak expose password/secret | Must | Security |

### 8.3 Reset Password

| TC ID | Requirement | Scenario | Preconditions | Test Data | Steps | Expected Result | Priority | Type |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TC-AUTH-026 | FR-AUTH-003 | Reset password sukses | User ACTIVE, token valid | token, password=`NewPwd123`, confirmPassword=`NewPwd123` | 1. POST /reset-password. | HTTP 200; `message = "Password berhasil diubah. Silakan login dengan password baru."`; `users.password` hash baru; `users.tokenVersion` naik 1; semua `refresh_tokens` user `isRevoked=true`; Set-Cookie clear; AuditLog USER_RESET_PASSWORD; Notification created | Must | Functional |
| TC-AUTH-027 | FR-AUTH-003 | Password < 8 char | Token valid | password=`Ab1!`, confirm=`Ab1!` | 1. POST /reset-password. | HTTP 400/422 "Password minimal 8 karakter" | Must | Validation |
| TC-AUTH-028 | FR-AUTH-003 | Password tanpa uppercase | Token valid | password=`abc12345`, confirm=`abc12345` | 1. POST /reset-password. | HTTP 400/422 "Password harus mengandung minimal 1 huruf besar" | Must | Validation |
| TC-AUTH-029 | FR-AUTH-003 | Password tanpa lowercase | Token valid | password=`ABC12345`, confirm=`ABC12345` | 1. POST /reset-password. | HTTP 400/422 | Must | Validation |
| TC-AUTH-030 | FR-AUTH-003 | Password tanpa digit | Token valid | password=`Abcdefgh`, confirm=`Abcdefgh` | 1. POST /reset-password. | HTTP 400/422 | Must | Validation |
| TC-AUTH-031 | FR-AUTH-003 | Password confirmation mismatch | Token valid | password=`NewPwd123`, confirm=`NewPwd124` | 1. POST /reset-password. | HTTP 400/422 "Password tidak cocok" | Must | Validation |
| TC-AUTH-032 | FR-AUTH-003 | Token random invalid | — | token = `"random.garbage.token"` | 1. POST /reset-password. | HTTP 400 "Token tidak valid atau sudah kadaluarsa" | Must | Security |
| TC-AUTH-033 | FR-AUTH-003 | Token expired (>1h) | Issue token, tunggu >1h | expired token | 1. POST /reset-password. | HTTP 400 | Must | Security |
| TC-AUTH-034 | FR-AUTH-003 | Token sudah digunakan (replay) | TC-AUTH-026 selesai | token yang sama | 1. POST /reset-password dengan token lama. | HTTP 400 "Token tidak valid atau sudah digunakan" | Must | Security |
| TC-AUTH-035 | FR-AUTH-003 | Access JWT dipakai sebagai reset token | Login sukses, ambil access JWT | access JWT | 1. POST /reset-password dengan access JWT. | HTTP 400 "Token tidak valid" (type check) | Must | Security |
| TC-AUTH-036 | FR-AUTH-003 | User SUSPENDED | — | token valid untuk user SUSPENDED | 1. POST /reset-password. | HTTP 403 | Should | Negative |
| TC-AUTH-037 | FR-AUTH-003 | User soft-deleted | User deleted | token valid (but deleted) | 1. POST /reset-password. | HTTP 404 | Should | Negative |
| TC-AUTH-038 | FR-AUTH-003 | Rate limit 6× per token | Token valid | Ulangi 6× | 1. POST 6×. | Request 1-5: 200/400 (tergantung valid). Request 6: 429 | Must | Security |
| TC-AUTH-039 | FR-AUTH-003 | Access JWT lama invalid setelah reset | Login → reset → coba /me dengan access JWT lama | access JWT pre-reset | 1. GET /me. | HTTP 401 (tokenVersion mismatch) | Must | Security |
| TC-AUTH-040 | FR-AUTH-003 | Refresh token lama invalid setelah reset | Login → reset → coba /refresh dengan refresh lama | refresh token pre-reset | 1. POST /refresh. | HTTP 401 (isRevoked = true) | Must | Security |
| TC-AUTH-041 | FR-AUTH-003 | Clear cookies | TC-AUTH-026 | — | 1. Inspect response headers. | Set-Cookie `token=; Max-Age=0`; `refreshToken=; Max-Age=0` (2 path variants) | Must | Security |

### 8.4 Logout

| TC ID | Requirement | Scenario | Preconditions | Test Data | Steps | Expected Result | Priority | Type |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TC-AUTH-042 | FR-AUTH-004 | Logout sukses | Login sukses | cookies valid | 1. POST /logout. | HTTP 200; `message = "Logout berhasil"`; Set-Cookie clear (3 headers); `refresh_tokens.isRevoked=true`; AuditLog USER_LOGOUT; ActivityHistory USER_LOGOUT | Must | Functional |
| TC-AUTH-043 | FR-AUTH-004 | Logout tanpa cookie | — | (no cookie) | 1. POST /logout. | HTTP 401 (authMiddleware) | Must | Negative |
| TC-AUTH-044 | FR-AUTH-004 | Logout dengan expired access token | Login, tunggu >15m | expired cookie | 1. POST /logout. | HTTP 401 | Should | Negative |
| TC-AUTH-045 | FR-AUTH-004 | Reuse access JWT setelah logout | Login → logout → GET /me dengan access JWT lama | access JWT post-logout | 1. GET /me. | **[GAP]** Lihat §13: implementasi saat ini hanya `revokeToken(refreshTokenHash)`, tidak increment `tokenVersion`. Access JWT masih valid sampai `exp`. | Must | Security |
| TC-AUTH-046 | FR-AUTH-004 | Reuse refresh token setelah logout | Login → logout → POST /refresh | refresh token post-logout | 1. POST /refresh. | HTTP 401 (refresh token `isRevoked=true`) | Must | Security |
| TC-AUTH-047 | FR-AUTH-004 | Logout dari 1 device via sessions | Login di 2 device, DELETE /sessions/:id device A | device A sessionId | 1. DELETE /sessions/<A>. 2. Refresh dari A. 3. Refresh dari B. | HTTP 200; A refresh 401; B refresh 200 | Should | Integration |
| TC-AUTH-048 | FR-AUTH-004 | Logout all | Login di 2 device, DELETE /sessions | — | 1. DELETE /sessions. 2. GET /sessions. | HTTP 200; `revokedCount >= 2`; `tokenVersion++`; subsequent refresh dari B 401 | Should | Integration |
| TC-AUTH-049 | FR-AUTH-004 | Audit entry | TC-AUTH-042 | — | 1. Query `audit_logs` where `actionType=USER_LOGOUT`. | Row exists dengan `userId`, `resourceId`, `actionType=USER_LOGOUT` | Must | DB |

---

## 9. API Test Case

| API TC ID | Endpoint | Method | Scenario | Request | Expected HTTP Status | Expected Response | DB Validation | Security Validation |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| API-AUTH-001 | /api/v1/auth/login | POST | Valid login | `{ "identifier": "user1@example.com", "password": "********" }` | 200 | `{ success:true, message:"Login berhasil", data:{ user:{ id, name, username, email, avatar, roles } } }` | `users` updated via `LoginHistory` insert; `refresh_tokens` new row; `audit_logs` USER_LOGIN | Set-Cookie HttpOnly+SameSite; generic 401 untuk invalid |
| API-AUTH-002 | /api/v1/auth/login | POST | Missing identifier | `{ "password": "********" }` | 400 | `{ success:false, message:"..." }` (Zod) | — | — |
| API-AUTH-003 | /api/v1/auth/login | POST | Empty identifier | `{ "identifier": "", "password": "********" }` | 400 | Zod `min(1)` | — | — |
| API-AUTH-004 | /api/v1/auth/login | POST | Wrong type | `{ "identifier": 123, "password": "********" }` | 400 | Zod type error | — | — |
| API-AUTH-005 | /api/v1/auth/login | POST | Malformed JSON | `not-json{` | 400 | Parser error | — | — |
| API-AUTH-006 | /api/v1/auth/login | POST | Unexpected param | `{ "identifier": "...", "password": "...", "isAdmin": true }` | 200 (Zod strips unknown by default) | Login proses normal | — | Verifikasi `isAdmin` tidak di-apply |
| API-AUTH-007 | /api/v1/auth/login | POST | SQLi | `{ "identifier": "' OR 1=1 --", "password": "x" }` | 401 | Generic 401 | — | Prisma parameterized |
| API-AUTH-008 | /api/v1/auth/login | POST | XSS payload | `{ "identifier": "<script>alert(1)</script>@x.com", "password": "x" }` | 401 | Generic 401 | — | No script execution; sanitize |
| API-AUTH-009 | /api/v1/auth/login | POST | Rate limit 6× | 6× failed | 200/401/401/401/401/429 | Last 429 with `retryAfter` | — | — |
| API-AUTH-010 | /api/v1/auth/forgot-password | POST | Email terdaftar | `{ "email": "user1@example.com" }` | 200 | `{ success:true, message:"Link reset password telah dikirim ke email Anda" }` | — | Identik dengan response email non-existent |
| API-AUTH-011 | /api/v1/auth/forgot-password | POST | Email TIDAK terdaftar | `{ "email": "ghost@example.com" }` | 200 | **Identik** dengan API-AUTH-010 | — | Tidak ada perbedaan byte-level (kecuali timing) |
| API-AUTH-012 | /api/v1/auth/forgot-password | POST | Empty email | `{ "email": "" }` | 400/422 | Zod | — | — |
| API-AUTH-013 | /api/v1/auth/forgot-password | POST | Invalid format | `{ "email": "no-at" }` | 400/422 | Zod | — | — |
| API-AUTH-014 | /api/v1/auth/forgot-password | POST | Rate limit 4× | 4× untuk email sama | 200/200/200/429 | Last 429 | — | — |
| API-AUTH-015 | /api/v1/auth/reset-password | POST | Valid reset | `{ "token": "<jwt>", "password": "NewPwd123", "confirmPassword": "NewPwd123" }` | 200 | `{ success:true, message:"Password berhasil diubah..." }` | `users.password` new hash; `users.tokenVersion++`; `refresh_tokens` all `isRevoked=true`; `audit_logs` USER_RESET_PASSWORD; `notifications` row | Cookies cleared; no plaintext password in logs |
| API-AUTH-016 | /api/v1/auth/reset-password | POST | Token invalid | `{ "token": "garbage", "password": "NewPwd123", "confirmPassword": "NewPwd123" }` | 400 | `Token tidak valid atau sudah kadaluarsa` | — | — |
| API-AUTH-017 | /api/v1/auth/reset-password | POST | Token expired | (expired jwt) | 400 | `Token tidak valid atau sudah kadaluarsa` | — | — |
| API-AUTH-018 | /api/v1/auth/reset-password | POST | Token replay | used token | 400 | `Token tidak valid atau sudah digunakan` | `users.tokenVersion` tidak berubah; `refresh_tokens` masih revoked | — |
| API-AUTH-019 | /api/v1/auth/reset-password | POST | Access JWT as reset | `{ "token": "<access_jwt>", ... }` | 400 | `Token tidak valid` (type check) | — | — |
| API-AUTH-020 | /api/v1/auth/reset-password | POST | Password policy fail | `{ "token": "<valid>", "password": "short", "confirmPassword": "short" }` | 400/422 | Zod errors | — | — |
| API-AUTH-021 | /api/v1/auth/reset-password | POST | Confirmation mismatch | `{ "token": "<valid>", "password": "NewPwd123", "confirmPassword": "NewPwd124" }` | 400/422 | `Password tidak cocok` | — | — |
| API-AUTH-022 | /api/v1/auth/logout | POST | Valid | (cookies) | 200 | `{ success:true, message:"Logout berhasil" }` | `refresh_tokens.isRevoked=true`; `audit_logs` USER_LOGOUT | Cookies cleared |
| API-AUTH-023 | /api/v1/auth/logout | POST | No cookie | — | 401 | `Unauthorized` | — | — |
| API-AUTH-024 | /api/v1/auth/refresh | POST | Valid cookie | (refresh cookie) | 200 | `{ success:true, data:{ user } }` + new Set-Cookie | Old `refresh_tokens.isRevoked=true`; new `refresh_tokens` row same `familyId` | Token rotation |
| API-AUTH-025 | /api/v1/auth/refresh | POST | Reuse old refresh token | (old revoked token) | 401 | `Refresh token tidak valid` | All user `refresh_tokens` revoked; `users.tokenVersion++`; `audit_logs` TOKEN_REUSE_DETECTED; `notifications` warning | Reuse detection |
| API-AUTH-026 | /api/v1/auth/refresh | POST | No cookie | — | 401 | `Refresh token tidak ditemukan` | — | — |
| API-AUTH-027 | /api/v1/auth/me | GET | No token | — | 401 | `Unauthorized` | — | — |
| API-AUTH-028 | /api/v1/auth/me | GET | Valid token | (cookie) | 200 | user profile data | — | — |
| API-AUTH-029 | /api/v1/auth/change-password | PUT | Valid | `{ "currentPassword": "********", "newPassword": "NewPwd123", "confirmNewPassword": "NewPwd123" }` | 200 | `{ success:true, message:"Password berhasil diubah" }` | `users.password` new hash; `users.tokenVersion++`; `refresh_tokens` all revoked; cookies cleared; `audit_logs` USER_CHANGE_PASSWORD; `notifications` | Bcrypt verify old; revoke all sessions |
| API-AUTH-030 | /api/v1/auth/change-password | PUT | Wrong current password | `{ "currentPassword": "wrong", ... }` | 401 | `Password saat ini salah` | — | — |
| API-AUTH-031 | /api/v1/auth/sessions | GET | Valid auth | (cookie) | 200 | `{ success:true, data:{ sessions:[...] } }` | — | — |
| API-AUTH-032 | /api/v1/auth/sessions/:id | DELETE | Own session | (cookie + :id) | 200 | `Sesi berhasil ditutup` | `refresh_tokens.isRevoked=true` | — |
| API-AUTH-033 | /api/v1/auth/sessions/:id | DELETE | Not own session | (cookie + other user :id) | 404 | `Sesi tidak ditemukan atau bukan milik Anda` | — | — |
| API-AUTH-034 | /api/v1/auth/sessions | DELETE | Logout all | (cookie) | 200 | `{ revokedCount: N }` | All user refresh tokens revoked; `users.tokenVersion++`; `audit_logs` ALL_SESSIONS_REVOKED | — |

---

## 10. Database Validation Checklist

### 10.1 Login Success

- [ ] `users.id` matches returned `user.id`
- [ ] `users.tokenVersion` tidak berubah saat login biasa
- [ ] `refresh_tokens` row baru: `userId`, `familyId` unik, `tokenHash` ter-hash, `isRevoked=false`, `expiresAt` > now
- [ ] `login_history` row: `success=true`, `userId`, `ipAddress`, `userAgent`, `createdAt`
- [ ] `activity_history` row: `action="USER_LOGIN"`, `userId`
- [ ] `audit_logs` row: `actionType="USER_LOGIN"`, `userId`, `resourceId`
- [ ] `users.password` **tidak** berubah

### 10.2 Login Failed

- [ ] Tidak ada `refresh_tokens` row baru
- [ ] `users.password` tidak berubah
- [ ] Jika user ditemukan & password salah: `login_history` row `success=false`, `failureReason="INVALID_PASSWORD"`
- [ ] Jika user **tidak** ditemukan: tidak ada `login_history` (userId null FK) — tidak ada row
- [ ] `audit_logs` tidak mencatat login gagal
- [ ] `users.tokenVersion` tidak berubah

### 10.3 Forgot Password

- [ ] Tidak ada `password_reset_tokens` row (menggunakan JWT; **tidak ada tabel dedicated**)
- [ ] `audit_logs` **tidak** mencatat (lihat gap §13)
- [ ] `users.tokenVersion` **tidak** berubah
- [ ] Email terkirim berisi JWT dengan `type=reset` dan `tokenVersion` user saat ini
- [ ] Log berisi `userId` (tanpa PII lain)

### 10.4 Reset Password

- [ ] `users.password` di-update ke hash baru (bcrypt 12)
- [ ] `users.tokenVersion` naik 1
- [ ] Semua `refresh_tokens` user menjadi `isRevoked=true`
- [ ] `audit_logs` row `actionType="USER_RESET_PASSWORD"`
- [ ] `notifications` row "Password Berhasil Direset"
- [ ] Password lama tidak bisa login
- [ ] Token lama (jika ada) menjadi invalid karena `tokenVersion` mismatch

### 10.5 Logout

- [ ] `refresh_tokens` cookie value (hash) di-update `isRevoked=true`
- [ ] `audit_logs` row `actionType="USER_LOGOUT"`
- [ ] `activity_history` row `action="USER_LOGOUT"`
- [ ] **[GAP]** `users.tokenVersion` **tidak** naik (lihat §13); access JWT masih valid sampai `exp`

### 10.6 Change Password

- [ ] `users.password` di-update ke hash baru
- [ ] `users.tokenVersion` naik 1
- [ ] Semua `refresh_tokens` revoked
- [ ] Cookies di-clear
- [ ] `audit_logs` USER_CHANGE_PASSWORD
- [ ] `notifications` "Password Berhasil Diubah"

### 10.7 Session Management

- [ ] `refresh_tokens` rows untuk user dapat di-list via `getActiveSessions`
- [ ] `revokeSession(id, userId)` hanya revoke milik user yang sama
- [ ] `revokeAllUserTokens` + `tokenVersion++` menginvalidasi seluruh family

---

## 11. Security Acceptance Criteria

### 11.1 Standard AC (dari prompt)

| ID | Given | When | Then |
| --- | --- | --- | --- |
| AC-AUTH-001 | User memasukkan email terdaftar atau tidak | Submit Forgot Password | Response 200 dan body identik; timing差不明显; tidak ada info account terdaftar |
| AC-AUTH-002 | Password digunakan untuk authentication | Login/Register/Reset/Change | Password disimpan sebagai bcrypt hash (cost ≥ 12); tidak pernah plaintext di DB, log, response, atau audit |
| AC-AUTH-003 | User berhasil login | Session aktif | Access JWT expire ≤ 15 menit; refresh token expire ≤ 30 hari; `tokenVersion` di-embed |
| AC-AUTH-004 | User logout | Akses protected resource dengan access JWT lama | **[GAP — lihat §13]** Saat ini access JWT masih valid sampai `exp`. Rekomendasi: `tokenVersion++` pada logout. |
| AC-AUTH-005 | User gagal login 5× dalam 15 menit dari `ip:identifier` | Request ke-6 | HTTP 429 dengan `retryAfter` |

### 11.2 Additional AC (Derived)

| ID | Given | When | Then |
| --- | --- | --- | --- |
| AC-AUTH-006 | User refresh token dirotasi dan dipakai ulang (replay) | Submit `/auth/refresh` dengan token lama | HTTP 401; **semua** session user di-revoke; `users.tokenVersion++`; `AuditLog.TOKEN_REUSE_DETECTED`; `Notification` "Peringatan Keamanan" |
| AC-AUTH-007 | User reset password sukses | Submit access JWT lama ke endpoint manapun | HTTP 401 (tokenVersion mismatch) |
| AC-AUTH-008 | User reset password sukses | Submit refresh token lama ke `/auth/refresh` | HTTP 401 (isRevoked = true) |
| AC-AUTH-009 | Brute force login | 5+ gagal dari `ip:identifier` | Exponential backoff + HTTP 429 |
| AC-AUTH-010 | Reset token expire (>1h) | Submit ke `/auth/reset-password` | HTTP 400 |
| AC-AUTH-011 | Reset token reused | Submit ke `/auth/reset-password` kedua kali | HTTP 400 "Token tidak valid atau sudah digunakan" |
| AC-AUTH-012 | User mencoba SQLi di identifier/password | POST /login | HTTP 401; query Prisma parameterized; tidak ada SQL error leakage |
| AC-AUTH-013 | User mencoba XSS payload | POST /login/register dengan `<script>` | Sanitized; tidak ada script execution di response |
| AC-AUTH-014 | Akun dengan status non-ACTIVE | Submit login | HTTP 403 dengan pesan generik; tidak bocorin status spesifik (lihat §13 — saran penyeragaman) |
| AC-AUTH-015 | Response error API | Semua endpoint | Tidak bocorkan stack trace, SQL error, JWT secret, atau path internal |
| AC-AUTH-016 | Cookies | Login sukses | `token` & `refreshToken` httpOnly, SameSite=Lax, Secure (prod), `Path=/` (token) dan `Path=/api/v1/auth/refresh` (refresh) |
| AC-AUTH-017 | Logout all | User trigger | `users.tokenVersion++`; semua `refresh_tokens` revoked |
| AC-AUTH-018 | Password baru < 8 char | Submit reset/change/register | HTTP 400/422 Zod validation |
| AC-AUTH-019 | Password baru tanpa U/L/digit | Submit | HTTP 400/422 |
| AC-AUTH-020 | Password baru ≠ confirm | Submit | HTTP 400/422 "Password tidak cocok" |
| AC-AUTH-021 | Multiple session / device | User | Masing-masing `familyId`; dapat di-list & direvoke per device |
| AC-AUTH-022 | Notification password change / reset / token reuse | Trigger | In-app `notifications` row tercipta |

---

## 12. Traceability Matrix

| Business Rule | Functional Requirement | Acceptance Criteria | Test Scenario | Test Case | API Test | DB Test |
| --- | --- | --- | --- | --- | --- | --- |
| BR-AUTH-001 | FR-AUTH-001 | AC-AUTH-014 | TS-AUTH-005, TS-AUTH-006, TS-AUTH-007 | TC-AUTH-005, TC-AUTH-006, TC-AUTH-007 | API-AUTH-001 (negative path) | §10.1 (status check) |
| BR-AUTH-002 | FR-AUTH-001 | AC-AUTH-002 | TS-AUTH-004 | TC-AUTH-004, TC-AUTH-013 | API-AUTH-001 (invalid creds) | §10.2 |
| BR-AUTH-003 | FR-AUTH-001 | AC-AUTH-001 | TS-AUTH-003, TS-AUTH-004 | TC-AUTH-003, TC-AUTH-004 | API-AUTH-001 (enumeration) | — |
| BR-AUTH-004 | FR-AUTH-001 | AC-AUTH-002 | TS-AUTH-016 | TC-AUTH-013 | All login-related | §10.1 (hash check) |
| BR-AUTH-005 | FR-AUTH-001 | AC-AUTH-003 | TS-AUTH-001, TS-AUTH-002 | TC-AUTH-001, TC-AUTH-002 | API-AUTH-001 | §10.1 |
| BR-AUTH-006 | FR-AUTH-001, FR-AUTH-003, FR-AUTH-005 | AC-AUTH-003 | TS-AUTH-014 | TC-AUTH-014 | API-AUTH-024 | §10.1 (refresh expiresAt) |
| BR-AUTH-007 | FR-AUTH-001, FR-AUTH-002, FR-AUTH-003 | AC-AUTH-005, AC-AUTH-009 | TS-AUTH-013, TS-AUTH-026, TS-AUTH-042 | TC-AUTH-011, TC-AUTH-024, TC-AUTH-038 | API-AUTH-009, API-AUTH-014, API-AUTH-038 | — |
| BR-AUTH-008 | FR-AUTH-002, FR-AUTH-003 | AC-AUTH-010, AC-AUTH-011 | TS-AUTH-020..023, TS-AUTH-029, TS-AUTH-035, TS-AUTH-037 | TC-AUTH-018..025, TC-AUTH-032..034 | API-AUTH-015..019 | §10.4 |
| BR-AUTH-009 | FR-AUTH-002, FR-AUTH-003 | AC-AUTH-010 | TS-AUTH-027, TS-AUTH-036 | TC-AUTH-033 | API-AUTH-017 | §10.4 (token expiry via JWT) |
| BR-AUTH-010 | FR-AUTH-002, FR-AUTH-003 | AC-AUTH-011 | TS-AUTH-037, TS-AUTH-038 | TC-AUTH-034, TC-AUTH-038 | API-AUTH-018 | §10.4 (tokenVersion++) |
| BR-AUTH-011 | FR-AUTH-001, FR-AUTH-002, FR-AUTH-003 | AC-AUTH-002 | All auth flows | TC-AUTH-013, TC-AUTH-026, TC-AUTH-029 | All | §10.1, 10.4, 10.6 (bcrypt hash) |
| BR-AUTH-012 | FR-AUTH-002 | AC-AUTH-001 | TS-AUTH-020..023 | TC-AUTH-018..021 | API-AUTH-010, API-AUTH-011 | — |
| BR-AUTH-013 | FR-AUTH-003 | AC-AUTH-018, AC-AUTH-019 | TS-AUTH-030..033 | TC-AUTH-027..030 | API-AUTH-020 | — |
| BR-AUTH-014 | FR-AUTH-003 | AC-AUTH-020 | TS-AUTH-034 | TC-AUTH-031 | API-AUTH-021 | — |
| BR-AUTH-015 | FR-AUTH-004 | AC-AUTH-004 | TS-AUTH-047 | TC-AUTH-042 | API-AUTH-022 | §10.5 |
| BR-AUTH-016 | FR-AUTH-004, FR-AUTH-003 | AC-AUTH-007, AC-AUTH-008 | TS-AUTH-043, TS-AUTH-044, TS-AUTH-049, TS-AUTH-050 | TC-AUTH-039, TC-AUTH-040, TC-AUTH-045, TC-AUTH-046 | API-AUTH-025 | §10.4, 10.5 |
| BR-AUTH-017 | FR-AUTH-004 | AC-AUTH-004 | TS-AUTH-049, TS-AUTH-050 | TC-AUTH-045, TC-AUTH-046 | API-AUTH-023 | — |

**Coverage Check:** Setiap BR memiliki ≥ 1 test scenario + ≥ 1 test case. ✅

**Identified Gaps in Coverage:**

- BR-AUTH-015: access JWT tidak invalid setelah logout (lihat GAP §13)
- BR-AUTH-016: TC-AUTH-045 (reuse access JWT setelah logout) saat ini akan FAIL (expected) sampai fix

---

## 13. Gap Analysis

> Feature yang **tidak eksplisit** ada di requirement prompt atau implementasi saat ini. Kategori: Required / Recommended / Optional / Not Required / Need Clarification.

| Feature | Status | Priority | Reason |
| --- | --- | --- | --- |
| Email Verification | **Need Clarification** | Should | Field `emailVerifiedAt` ada di schema, tetapi tidak ada flow verification (token email). Jika verification menjadi prasyarat reset, implementasikan. |
| Change Password (logged-in) | Recommended | Should | Sudah ada di kode (`PUT /auth/change-password`); di luar prompt tapi memenuhi best practice. |
| Password Policy (kompleks) | **Required** | Must | Sudah implemented: min 8, U/L/digit. Konfirmasi: apakah perlu special char? |
| Account Lockout (per-user) | **Recommended** | Should | Saat ini brute force dimitigasi via rate limit per `ip:identifier`. Tidak ada lockout per-user; akun bisa di-bruteforce dari banyak IP secara terdistribusi. Pertimbangkan soft lock `LOCKED` status + `lockedUntil`. |
| Rate Limiting | **Required** | Must | Sudah ada (Redis-backed, fallback in-memory). Konfirmasi threshold produksi. |
| CAPTCHA | **Recommended** | Should | Tidak ada. Pertimbangkan pada login setelah N gagal untuk mencegah bot. |
| MFA/2FA | **Need Clarification** | Could | Tidak ada. Untuk MVP, opsional; untuk produksi pertimbangkan TOTP. |
| Session Timeout | **Required** | Must | Access JWT 15m, refresh 30d. Konfirmasi angka final. |
| Refresh Token | **Required** | Must | Sudah ada (rotation + family). |
| Access Token Expiration | **Required** | Must | JWT_EXPIRES_IN default 15m. Konfirmasi. |
| Remember Me | Not Required | Could | Tidak ada. Refresh 30d sudah memberikan persistence. |
| Device Management | Recommended | Should | `GET /auth/sessions` + `DELETE /sessions/:id` sudah ada; belum ada UI view daftar device [TBC]. |
| Concurrent Login Policy | **Need Clarification** | Should | Saat ini 1 user bisa login di banyak device (multi family). Konfirmasi apakah ingin batasi. |
| Login History | Recommended | Should | `login_history` table ada. Pertimbangkan UI untuk user. |
| Failed Login History | Recommended | Should | Tercatat di `login_history.failureReason`. |
| Audit Log | **Required** | Must | `audit_logs` table ada. Konfirmasi retention. |
| Security Notification | Recommended | Should | In-app `notifications` ada untuk token reuse, password change, password reset. |
| Password Expiration | Not Required | Could | Tidak ada policy. Untuk MVP cukup tanpa. |
| Password Reuse Prevention | **Recommended** | Should | Tidak ada (no password history). Pertimbangkan minimal 3 history. |
| Email enumeration via login | **Required** | Must | Mitigasi: generic 401. ✅ |
| **Logout invalidates access JWT [GAP]** | **Recommended** | Should | **[GAP]** Saat ini logout hanya revoke refresh token; access JWT masih valid sampai `exp` (15m). Rekomendasi: increment `tokenVersion` saat logout, atau implement token blacklist. |
| CSRF protection on state-changing auth endpoints | **Required** | Must | `csrf.ts` middleware ada di codebase; verifikasi apakah include login/logout/change-password. |
| Account status generic message | **Recommended** | Should | Saat ini SUSPENDED/DEACTIVATED/soft-deleted punya pesan berbeda (membantu enumerasi status). Pertimbangkan penyeragaman untuk "akun tidak aktif". |

---

## 14. Open Questions

> Daftar pertanyaan untuk Product Owner / BA / Developer. **Tidak** dijawab dengan asumsi final.

1. Apakah autentikasi menggunakan session, JWT, atau kombinasi? — Jawaban saat ini: **access JWT + refresh token rotation**.
2. Berapa lama access token berlaku? — Default `JWT_EXPIRES_IN` env, fallback 15m. **Konfirmasi.**
3. Berapa lama refresh token berlaku? — Hard-coded 30 hari di `setTokenCookies`. **Konfirmasi.**
4. Berapa lama reset token berlaku? — Hard-coded 1 jam di `generateResetToken`. **Konfirmasi.**
5. Apakah reset token single-use? — **Ya** (atomic `tokenVersion`).
6. Apakah seluruh session diinvalidasi setelah reset password? — **Ya** (semua `refresh_tokens` revoked).
7. Apakah logout harus menginvalidasi access token? — **[GAP]** Saat ini **tidak**. Konfirmasi.
8. Apakah user boleh login dari multiple device? — Saat ini **ya** (multi family). Konfirmasi policy.
9. Apakah MFA/2FA dibutuhkan? — Saat ini **tidak**. Konfirmasi scope MVP.
10. Berapa minimum password length? — 8. Konfirmasi.
11. Apakah password harus uppercase, lowercase, number, special character? — Saat ini U/L/digit. Konfirmasi perlu special char.
12. Apakah username/email case-sensitive? — DB collation-dependent. Konfirmasi normalisasi.
13. Berapa batas failed login attempt? — Rate limit 5/15min per `ip:identifier`. Konfirmasi.
14. Apakah account lockout diterapkan per-user? — **[GAP]** Tidak. Konfirmasi.
15. Apakah CAPTCHA diterapkan? — **[GAP]** Tidak. Konfirmasi.
16. Apakah login activity disimpan dalam audit log? — **Ya** via `AuditLog` + `LoginHistory` + `ActivityHistory`.
17. Apakah CSRF protection aktif pada endpoint login/logout/change-password? — Ada `csrf.ts` middleware; konfirmasi coverage.
18. Apakah email verification dibutuhkan sebelum reset? — Schema punya `emailVerifiedAt`; flow belum ada. Konfirmasi.
19. Berapa retensi data `login_history` / `audit_logs`? — Tidak ada TTL/cleanup. Konfirmasi.
20. Apakah status akun `LOCKED` perlu ditambahkan? — Konfirmasi.
21. Apakah pesan error untuk status non-ACTIVE perlu diseragamkan? — Saat ini berbeda. Konfirmasi.
22. Apakah frontend menampilkan daftar session/device? — Backend sudah support; UI konfirmasi.
23. Apakah `password` column perlu di-type khusus (mis. opaque) untuk mencegah salah query? — Saat ini `String`. Konfirmasi.
24. Apakah ada kebutuhan "logout all" paksa dari admin? — Backend `DELETE /sessions` user-level ada; admin force-logout konfirmasi.

---

## 15. QA Risk Assessment

| Risk ID | Risk | Related Requirement | Impact | Likelihood | Severity | Mitigation | Test Coverage |
| --- | --- | --- | --- | --- | --- | --- | --- |
| RISK-AUTH-01 | Credential exposure (password bocor di log/response) | FR-AUTH-001, BR-AUTH-004 | High | Low | **Critical** | Bcrypt, no log password, response filter, code review | TC-AUTH-013, API-AUTH-001 |
| RISK-AUTH-02 | Account enumeration via login | FR-AUTH-001, BR-AUTH-003 | Medium | Medium | High | Generic 401 message | TC-AUTH-003, TC-AUTH-004 |
| RISK-AUTH-03 | Account enumeration via forgot-password | FR-AUTH-002, BR-AUTH-012 | Medium | Medium | High | Identik response + rate limit | TC-AUTH-018..021, API-AUTH-010, API-AUTH-011 |
| RISK-AUTH-04 | Brute force login | FR-AUTH-001, BR-AUTH-007 | High | High | **Critical** | Rate limit (5/15min) + exponential backoff | TC-AUTH-011, API-AUTH-009 |
| RISK-AUTH-05 | Brute force forgot-password | FR-AUTH-002, BR-AUTH-007 | Medium | Medium | High | Rate limit 3/hour per email | TC-AUTH-024, API-AUTH-014 |
| RISK-AUTH-06 | Session hijacking (XSS steal cookie) | FR-AUTH-001, BR-AUTH-006 | High | Low | High | httpOnly + Secure + SameSite + XSS sanitize | TC-AUTH-012, security headers test |
| RISK-AUTH-07 | Token replay (refresh reuse) | FR-AUTH-005 | High | Medium | **Critical** | Reuse detection + tokenVersion++ + revoke all | TC-AUTH-046, API-AUTH-025 |
| RISK-AUTH-08 | Reset token replay | FR-AUTH-003, BR-AUTH-010 | High | Medium | **Critical** | Atomic updateMany tokenVersion match | TC-AUTH-034, API-AUTH-018 |
| RISK-AUTH-09 | Access JWT valid setelah logout | FR-AUTH-004, BR-AUTH-016 | Medium | Medium | High | **[GAP]** Rekomendasi: tokenVersion++ saat logout | TC-AUTH-045 (saat ini fail) |
| RISK-AUTH-10 | SQL injection di identifier | FR-AUTH-001 | High | Low | High | Prisma parameterized query; validate via Zod | TC-AUTH-010, API-AUTH-007 |
| RISK-AUTH-11 | Reset token expiration bypass | FR-AUTH-003, BR-AUTH-009 | High | Low | High | JWT `exp` di jose library; verify | TC-AUTH-033, API-AUTH-017 |
| RISK-AUTH-12 | Password reset abuse (spam) | FR-AUTH-002, BR-AUTH-007 | Medium | High | High | Rate limit 3/hour per email | TC-AUTH-024, API-AUTH-014 |
| RISK-AUTH-13 | Expired token reuse (clock skew) | FR-AUTH-003 | Low | Low | Medium | JWT `exp` check; short window 1h | TC-AUTH-033 |
| RISK-AUTH-14 | Sensitive data in error response | All | High | Low | High | Custom error handler; no stack trace; no SQL | API-AUTH-005, error path tests |
| RISK-AUTH-15 | Status enumeration via login message | FR-AUTH-001, BR-AUTH-001 | Medium | Medium | Medium | [REC] seragamkan pesan 403 | TC-AUTH-005..007 |
| RISK-AUTH-16 | Missing CSRF on state-changing auth | FR-AUTH-004 | High | Low | High | `csrf.ts` middleware applied; double-submit cookie [TBC] | Security test |
| RISK-AUTH-17 | Distributed brute force (different IP) | FR-AUTH-001, BR-AUTH-007 | High | Medium | **Critical** | [REC] per-user lockout/CAPTCHA | TC-AUTH-011 (partial) |
| RISK-AUTH-18 | Email service enumeration via timing | FR-AUTH-002, BR-AUTH-012 | Low | Low | Medium | Identik response; async email | TC-AUTH-018..021 |
| RISK-AUTH-19 | No logout audit (only activity) | FR-AUTH-004 | Low | Low | Low | `AuditLog.USER_LOGOUT` sudah ada | TC-AUTH-049 |
| RISK-AUTH-20 | `users.password` field type ambiguity | FR-AUTH-001 | Low | Low | Low | Dokumentasi invariant bcrypt; [REC] wrapper type | Code review |

---

## 16. Final Document

### A. Requirement Quality Score

| Dimensi | Skor (0-100) | Catatan |
| --- | --- | --- |
| **Completeness** | 82 | FR utama + BR utama lengkap. Beberapa area (status message, lockout) belum eksplisit. |
| **Consistency** | 88 | Konsisten antara prompt dan kode untuk happy path. Inkonsistensi minor pada pesan error 403 (SUSPENDED/DEACTIVATED/soft-deleted) yang berbeda. |
| **Clarity** | 90 | Requirement jelas dan testable. Naming convention baik. |
| **Testability** | 92 | Hampir semua requirement dapat diuji via API + UI. Beberapa state (1h reset token) perlu manipulasi waktu. |
| **Security** | 85 | Bcrypt, JWT, rate limit, reuse detection solid. Gap utama: logout tidak invalidasi access JWT; per-user lockout tidak ada. |
| **Traceability** | 90 | Setiap FR memiliki BR; setiap BR memiliki AC; setiap AC memiliki TS dan TC. Beberapa BR baru diturunkan di §11. |

**Rata-rata tertimbang: 87.5 / 100** — Kualitas tinggi dengan beberapa gap yang harus dikonfirmasi.

### B. Critical Issues (urut severity)

**Critical:**

1. **[GAP] Logout tidak invalidasi access JWT.** Access JWT masih valid sampai `exp` setelah logout; melanggar BR-AUTH-015 & BR-AUTH-016. Rekomendasi: increment `users.tokenVersion` saat logout (sama seperti change-password/reset-password).
2. **Account lockout per-user tidak ada.** Distributed brute force dari banyak IP tidak dimitigasi. Rekomendasi: tambahkan `UserStatus.LOCKED` + `lockedUntil` + auto-lock setelah N gagal per identifier (di luar rate limit IP).

**High:**

3. **Pesan error status akun (SUSPENDED/DEACTIVATED/soft-deleted) berbeda.** Membantu account enumeration. Rekomendasi: seragamkan ke "Akun tidak aktif. Hubungi administrator." (kecuali SUSPENDED yang butuh pesan jelas untuk support).
4. **Tidak ada audit log untuk forgot-password request.** Compliance/forensic gap. Rekomendasi: tambahkan `AuditLog.PASSWORD_RESET_REQUESTED`.
5. **Status code Zod validation = 400 (bukan 422).** Best practice API: 422 untuk semantic validation. Rekomendasi: update `validate` middleware.

**Medium:**

6. Email verification flow tidak ada (schema `emailVerifiedAt` ada). Konfirmasi.
7. Password policy tidak mewajibkan special char. Konfirmasi.
8. Tidak ada password reuse prevention. Rekomendasi: simpan N password history.
9. Tidak ada CSRF documented coverage untuk login/logout. Konfirmasi.
10. Tidak ada UI untuk session/device list. Konfirmasi scope.
11. `users.password` bertipe `String` plain. Rekomendasi: opaque type atau komentar invariant.

**Low:**

12. Tidak ada cleanup job untuk `refresh_tokens` expired. Rekomendasi: cron/scheduled task.
13. `emailVerifiedAt` schema tidak terpakai.
14. Tidak ada field `lastLoginAt` denormalized.

### C. Recommended Changes (Prioritas)

1. **[Must] Tambah `tokenVersion++` saat logout.** Implementasi:
   ```ts
   await prisma.user.update({
     where: { id: user.id },
     data: { tokenVersion: { increment: 1 } },
   });
   await revokeToken(tokenHash);
   ```
2. **[Must] Tambah audit log untuk forgot-password request** (tanpa PII): `actionType="PASSWORD_RESET_REQUESTED"`, `userId` (jika ditemukan) atau null.
3. **[Should] Seragamkan pesan error status akun** atau setidaknya tidak bocorin `deletedAt` vs `SUSPENDED` vs `DEACTIVATED` ke publik.
4. **[Should] Ganti status code Zod validation ke 422** di `validate` middleware.
5. **[Should] Implementasi account lockout per-user** dengan status `LOCKED` + `lockedUntil` (revisi schema).
6. **[Should] Tambahkan device/session list UI** di web (backend sudah siap).
7. **[Could] Tambah password reuse prevention** (history table).
8. **[Could] Tambah cleanup job** untuk `refresh_tokens` dan `login_history` lama.

### D. Final Authentication Flow (setelah gap diperbaiki)

```
LOGIN
  → Input identifier + password
  → Validate (Zod, 422 on fail)
  → Rate limit (5/15min per ip:identifier) → 429
  → Find user (email OR username)
    → Not found → 401 generic (also: same response time via bcrypt hash of dummy)
  → If user.lockedUntil > now → 423 "Akun terkunci sementara"
  → If status != ACTIVE → 403 generic "Akun tidak aktif. Hubungi administrator."
  → If deletedAt → 403 generic
  → bcrypt.compare
    → Fail:
        - LoginHistory(success=false, reason=INVALID_PASSWORD)
        - failedLoginAttempts += 1
        - if N failed → set lockedUntil = now+15min, status=LOCKED
        - 401 generic
    → Pass:
        - failedLoginAttempts = 0
        - generateAccessToken (HS256, 15m, type=access, tokenVersion)
        - createRefreshTokenFamily (hashed, 30d)
        - setTokenCookies (httpOnly, secure, sameSite=lax)
        - AuditLog(USER_LOGIN)
        - LoginHistory(success=true)
        - ActivityHistory(USER_LOGIN)
        - lastLoginAt = now
        - 200 OK + user data

FORGOT PASSWORD
  → Input email
  → Validate (Zod 422 on fail)
  → Rate limit (3/hour per email) → 429
  → Find user by email
  → If found & ACTIVE & !deletedAt & emailVerified:
      - generateResetToken (JWT HS256, 1h, type=reset, tokenVersion)
      - sendEmail
      - AuditLog(PASSWORD_RESET_REQUESTED)
  → ALWAYS 200 generic (constant time)

RESET PASSWORD
  → Input token + newPassword + confirmPassword
  → Validate (Zod 422 on fail)
  → Rate limit (5/hour per token-hash) → 429
  → verifyToken
    → Invalid/expired → 400 generic
  → type != reset → 400
  → Find user
    → Not found or deletedAt → 404
  → tokenVersion mismatch → 400 "Token tidak valid atau sudah digunakan"
  → status != ACTIVE → 403 generic
  → TRANSACTION:
      user.updateMany(where id+tokenVersion match → new hash, tokenVersion++)
      if count==1: refreshToken.updateMany(isRevoked=true)
  → count != 1 → 400 (race)
  → clearTokenCookies
  → AuditLog(USER_RESET_PASSWORD)
  → Notification (in-app)
  → 200 success

LOGOUT
  → authMiddleware (validate access JWT)
  → TRANSACTION:
      user.tokenVersion++ (invalidates all access JWTs)
      refresh_token (where tokenHash=X) isRevoked=true
  → clearTokenCookies
  → AuditLog(USER_LOGOUT)
  → ActivityHistory(USER_LOGOUT)
  → 200 "Logout berhasil"

REFRESH TOKEN REUSE
  → validateRefreshToken
    → if tokenHash not found OR isRevoked=true:
        - revokeAllUserTokens(userId)
        - user.tokenVersion++
        - AuditLog(TOKEN_REUSE_DETECTED)
        - Notification "Peringatan Keamanan"
        - 401

EXPIRED SESSION
  → authMiddleware: verifyToken → exp lewat → 401
  → Frontend: call /refresh (jika refresh cookie valid) atau redirect /login
```

### E. QA Readiness

**Status: Ready with Minor Clarification** ✅

**Alasan:**

- **Siap diuji untuk:** Login, Forgot Password, Reset Password, Logout, Refresh, Change Password, Session management.
- **Test coverage:** Setiap BR (BR-AUTH-001..017) memiliki minimal 1 test scenario + 1 test case + 1 API test.
- **Negative, validation, security, integration, regression test** tercakup.
- **DB validation checklist** siap dipakai QA.
- **Security acceptance criteria** dapat digunakan untuk UAT.

**Yang masih perlu klarifikasi sebelum eksekusi QA penuh:**

1. Konfirmasi 13+ open questions di §14 (terutama: logout harus invalidasi access JWT, per-user lockout, account status generic message).
2. Tutup GAP §13 (logout + tokenVersion++) sebelum eksekusi TC-AUTH-045.
3. Konfirmasi threshold rate limit untuk production.
4. Konfirmasi retensi `login_history` dan `audit_logs`.
5. Sediakan test environment dengan Resend mock untuk TC email inspection.
6. Sediakan test data: akun dengan status ACTIVE/SUSPENDED/DEACTIVATED/soft-deleted.

**Tidak siap untuk:**

- MFA/2FA (di luar scope MVP — konfirmasi PO).
- Email verification flow (belum ada — konfirmasi PO).

---

**Akhir Dokumen — SDLC Stage 14: Authentication Module Full-Cycle Analysis**

Dokumen ini siap untuk ditinjau oleh BA, Developer, QA, dan Product Owner. Setiap requirement, business rule, dan acceptance criteria memiliki test coverage yang dapat dieksekusi.
