# KomunaID Integration Design

## 1. Object Storage Integration

### Provider

S3-compatible object storage (Vercel Blob in production, AWS S3 as alternative).

### Access Pattern

Presigned URLs — files are never uploaded through the NestJS server directly.

```
Client → POST /uploads/presigned-url → Server generates presigned URL
Client → PUT presigned-url → Storage provider
Client → POST /uploads/confirm → Server creates MediaAsset record
```

### Buckets

| Bucket               | Purpose                    |
| -------------------- | -------------------------- |
| `komunaid-avatars`   | User profile pictures      |
| `komunaid-banners`   | Community/org cover images |
| `komunaid-events`    | Event media                |
| `komunaid-posts`     | Post attachments           |
| `komunaid-documents` | PDF documents, reports     |

### File Types

| Upload Type | Allowed MIME Types                           |
| ----------- | -------------------------------------------- |
| Avatar      | `image/jpeg`, `image/png`, `image/webp`      |
| Banner      | `image/jpeg`, `image/png`, `image/webp`      |
| Document    | `application/pdf`, `image/jpeg`, `image/png` |
| Post        | `image/jpeg`, `image/png`, `image/webp`      |

### Size Limits

| Upload Type | Max Size | Rationale       |
| ----------- | -------- | --------------- |
| Avatar      | 2 MB     | Profile picture |
| Banner      | 5 MB     | Cover image     |
| Document    | 10 MB    | PDFs, reports   |
| Post        | 5 MB     | Inline media    |

### Authentication

- Presigned URL with 15-minute expiry
- Server generates URL with PUT method and content-type constraint
- SDK: `@aws-sdk/s3-request-presigner`

### Security

- No directory listing on storage buckets
- Presigned URLs expire after 15 minutes
- Users can only generate URLs for their own uploads
- File type validated server-side before URL generation

---

## 2. Email Integration

### Provider

| Environment | Provider | Method        |
| ----------- | -------- | ------------- |
| Production  | Resend   | HTTPS API     |
| Development | Console  | `console.log` |

### Adapter Pattern

```typescript
interface EmailAdapter {
  send(to: string, subject: string, html: string): Promise<void>;
}

class ResendEmailAdapter implements EmailAdapter { ... }
class ConsoleEmailAdapter implements EmailAdapter { ... }
```

Selected at startup based on `NODE_ENV`.

### Templates

| Template           | Trigger                     |
| ------------------ | --------------------------- |
| Verification       | User registration           |
| Password Reset     | Forgot password request     |
| Welcome            | First successful login      |
| Event Registration | User registers for event    |
| Community Approved | Membership request approved |

### Rate Limits

| Tier        | Daily Limit | Monthly Limit |
| ----------- | ----------- | ------------- |
| Resend Free | 100         | 3,000         |
| Resend Pro  | 50,000      | 500,000       |

### Fallback

- Development: emails logged to console (`ConsoleEmailAdapter`)
- Production: Resend API failure returns error; no retry queue (MVP)
- Future: retry queue with exponential backoff

---

## 3. In-App Notification

### Storage

MySQL `notifications` table — persisted, queryable, soft-deletable.

### Trigger Flow

```
Service layer detects event (e.g., membership approved)
  → Creates Notification record
    → Client polls on next page load / React Query refetch
```

### Notification Types

| Type         | Description                    |
| ------------ | ------------------------------ |
| `SYSTEM`     | Platform-wide announcements    |
| `APPROVAL`   | Membership or request approved |
| `REJECTION`  | Membership or request rejected |
| `EVENT`      | Event updates, reminders       |
| `COMMUNITY`  | Community-level announcements  |
| `MODERATION` | Content moderation actions     |

### Delivery

- **Client polls** on page load and via React Query background refetch
- No WebSocket or push notification (MVP)
- Unread count cached in-memory with 5-minute TTL

### Unread Count

```typescript
// In-memory cache
const unreadCache = new Map<string, { count: number; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
```

- Invalidated on new notification creation
- Refreshed on user action (mark as read, dismiss)

---

## 4. Third-Party Services

| Service          | Purpose             | Integration Method      | Fallback                    |
| ---------------- | ------------------- | ----------------------- | --------------------------- |
| Resend           | Transactional email | HTTPS REST API          | Console logging             |
| S3 / Vercel Blob | File storage        | Presigned URL (SDK)     | Error logged, upload fails  |
| Hostinger        | MySQL database      | TCP connection (Prisma) | Error thrown, request fails |
| Google OAuth     | Social login        | OAuth 2.0 redirect      | Email/password only         |

### Error Handling

All third-party integrations follow the same pattern:

1. **Try** the external call
2. **Catch** the error
3. **Log** structured error with context
4. **Throw** or **return gracefully** based on criticality

Critical services (database, auth) throw and propagate the error.
Non-critical services (email, storage) log and degrade gracefully.

---

## 5. Future Integrations (Post-MVP)

| Service                  | Purpose                 | Priority | Notes                             |
| ------------------------ | ----------------------- | -------- | --------------------------------- |
| Redis                    | Caching layer           | P1       | Session cache, rate limit counter |
| Meilisearch              | Full-text search        | P1       | Community/post search             |
| Firebase Cloud Messaging | Push notifications      | P2       | Mobile/web push                   |
| WebSocket (Socket.io)    | Real-time notifications | P2       | Live notification delivery        |
| Sentry                   | Error tracking          | P2       | Production error monitoring       |
| Stripe                   | Payment processing      | P3       | Premium features, donations       |
| SendGrid                 | Bulk email              | P3       | Newsletter, mass communication    |

### Migration Path

- Resend → SendGrid for bulk email (when volume exceeds Resend free tier)
- In-memory cache → Redis (when single-instance cache is insufficient)
- Polling → WebSocket (when real-time UX is required)
