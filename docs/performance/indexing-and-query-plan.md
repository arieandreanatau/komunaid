# KomunaID Indexing & Query Plan

## 1. Indexing Strategy Overview

KomunaID uses MySQL 8 with Prisma ORM. Indexing follows these principles:

1. **Index on foreign keys** — every `@@index` on FK columns for JOIN performance
2. **Unique constraints** — composite unique indexes for business logic guarantees
3. **Query-driven indexing** — indexes added based on expected query patterns
4. **Soft delete filter** — `deletedAt` indexed for filtered queries
5. **Pagination support** — indexes support cursor-based and offset pagination

### Index Naming Convention

- Single-column indexes: `@@index(columnName)`
- Composite indexes: `@@index([col1, col2])`
- Unique constraints: `@@unique(col1, col2)`
- Named indexes: `@@index(name: "idx_name", column)`

---

## 2. Current Indexes

### users

```prisma
@@index(email)        // Login lookups, uniqueness check
@@index(username)     // Profile lookups, username search
@@index(deletedAt)    // Soft delete filter
```

| Index       | Columns     | Purpose                       | Cardinality |
| ----------- | ----------- | ----------------------------- | ----------- |
| `email`     | `email`     | Login, password reset, lookup | High        |
| `username`  | `username`  | Profile URL, search           | High        |
| `deletedAt` | `deletedAt` | Active user filter            | Low         |

### communities

```prisma
@@index(slug)       // URL-friendly lookup
@@index(status)     // Filter by PENDING, APPROVED, SUSPENDED
@@index(ownerId)    // "My communities" query
@@index(category)   // Category filter
@@index(deletedAt)  // Soft delete filter
```

| Index       | Columns     | Purpose                         | Cardinality |
| ----------- | ----------- | ------------------------------- | ----------- |
| `slug`      | `slug`      | URL lookup, unique per org      | High        |
| `status`    | `status`    | Admin filtering, public listing | Low-Medium  |
| `ownerId`   | `ownerId`   | Owner's community list          | Medium      |
| `category`  | `category`  | Category-based browsing         | Low-Medium  |
| `deletedAt` | `deletedAt` | Active communities filter       | Low         |

### community_members

```prisma
@@index(communityId)                    // Members of a community
@@index(userId)                         // Communities a user belongs to
@@unique(communityId, userId)           // Prevent duplicate membership
```

| Index         | Columns                 | Purpose                | Cardinality |
| ------------- | ----------------------- | ---------------------- | ----------- |
| `communityId` | `communityId`           | List community members | Medium      |
| `userId`      | `userId`                | User's community list  | Medium      |
| `unique`      | `(communityId, userId)` | Membership uniqueness  | High        |

### organization_members

```prisma
@@index(organizationId)                 // Members of an org
@@index(userId)                         // Orgs a user belongs to
@@unique(organizationId, userId)        // Prevent duplicate membership
```

| Index            | Columns                    | Purpose               | Cardinality |
| ---------------- | -------------------------- | --------------------- | ----------- |
| `organizationId` | `organizationId`           | List org members      | Medium      |
| `userId`         | `userId`                   | User's org list       | Medium      |
| `unique`         | `(organizationId, userId)` | Membership uniqueness | High        |

### events

```prisma
@@index(slug)         // URL-friendly lookup
@@index(status)       // Filter by status
@@index(createdById)  // "My events" query
@@index(category)     // Category filter
@@index(startDate)    // Upcoming events query
@@index(deletedAt)    // Soft delete filter
```

| Index         | Columns       | Purpose                      | Cardinality |
| ------------- | ------------- | ---------------------------- | ----------- |
| `slug`        | `slug`        | URL lookup                   | High        |
| `status`      | `status`      | Admin filtering, public list | Low-Medium  |
| `createdById` | `createdById` | Creator's event list         | Medium      |
| `category`    | `category`    | Category-based browsing      | Low-Medium  |
| `startDate`   | `startDate`   | Upcoming events, calendar    | High        |
| `deletedAt`   | `deletedAt`   | Active events filter         | Low         |

### event_registrations

```prisma
@@index(eventId)                          // Event attendees
@@index(userId)                           // User's event registrations
@@unique(eventId, userId)                 // Prevent duplicate registration
```

| Index     | Columns             | Purpose                 | Cardinality |
| --------- | ------------------- | ----------------------- | ----------- |
| `eventId` | `eventId`           | List event attendees    | Medium      |
| `userId`  | `userId`            | User's event list       | Medium      |
| `unique`  | `(eventId, userId)` | Registration uniqueness | High        |

### posts

```prisma
@@index(communityId)                    // Posts in a community
@@index(authorId)                       // Author's posts
@@index(status)                         // Draft, published, archived
@@index(deletedAt)                      // Soft delete filter
@@unique(communityId, slug)             // Unique slug per community
```

| Index         | Columns               | Purpose                      | Cardinality |
| ------------- | --------------------- | ---------------------------- | ----------- |
| `communityId` | `communityId`         | Community post feed          | Medium      |
| `authorId`    | `authorId`            | Author's post history        | Medium      |
| `status`      | `status`              | Published/draft filter       | Low         |
| `deletedAt`   | `deletedAt`           | Active posts filter          | Low         |
| `unique`      | `(communityId, slug)` | URL uniqueness per community | High        |

### notifications

```prisma
@@index(userId)       // User's notifications
@@index(isRead)       // Unread filter
@@index(createdAt)    // Chronological ordering
```

| Index       | Columns     | Purpose                  | Cardinality |
| ----------- | ----------- | ------------------------ | ----------- |
| `userId`    | `userId`    | User's notification list | High        |
| `isRead`    | `isRead`    | Unread count             | Low         |
| `createdAt` | `createdAt` | Chronological ordering   | High        |

### reports

```prisma
@@index(status)               // Pending, resolved, dismissed
@@index(targetType, targetId) // Find reports about specific entity
@@index(reporterId)           // Reporter's report history
```

| Index        | Columns                  | Purpose                 | Cardinality |
| ------------ | ------------------------ | ----------------------- | ----------- |
| `status`     | `status`                 | Admin queue filtering   | Low         |
| `targetType` | `(targetType, targetId)` | Entity-specific reports | Medium      |
| `reporterId` | `reporterId`             | Reporter's submissions  | Medium      |

### audit_logs

```prisma
@@index(userId)                     // User's audit trail
@@index(action)                     // Filter by action type
@@index(entityType, entityId)       // Entity-specific audit
@@index(createdAt)                  // Chronological ordering
```

| Index        | Columns                  | Purpose               | Cardinality |
| ------------ | ------------------------ | --------------------- | ----------- |
| `userId`     | `userId`                 | User's action history | Medium      |
| `action`     | `action`                 | Action type filtering | Low-Medium  |
| `entityType` | `(entityType, entityId)` | Entity audit trail    | Medium      |
| `createdAt`  | `createdAt`              | Date range queries    | High        |

### categories

```prisma
@@index(type)      // COMMUNITY, EVENT, ORGANIZATION
@@index(isActive)   // Active categories only
@@index(slug)       // URL-friendly lookup
```

| Index      | Columns    | Purpose                 | Cardinality |
| ---------- | ---------- | ----------------------- | ----------- |
| `type`     | `type`     | Category type filtering | Low         |
| `isActive` | `isActive` | Active categories       | Low         |
| `slug`     | `slug`     | URL lookup              | High        |

### settings

```prisma
@@index(key)    // Setting lookup by key
```

| Index | Columns | Purpose              | Cardinality |
| ----- | ------- | -------------------- | ----------- |
| `key` | `key`   | Configuration lookup | High        |

### contact_messages

```prisma
@@index(status)    // NEW, READ, REPLIED, ARCHIVED
```

| Index    | Columns  | Purpose               | Cardinality |
| -------- | -------- | --------------------- | ----------- |
| `status` | `status` | Admin queue filtering | Low         |

### user_role_assignments

```prisma
@@index(userId)                                // User's roles
@@index(roleId)                                // Role's assignments
@@unique(userId, roleId, scope, scopeId)       // Prevent duplicate assignments
```

| Index    | Columns                            | Purpose                | Cardinality |
| -------- | ---------------------------------- | ---------------------- | ----------- |
| `userId` | `userId`                           | User's role list       | Medium      |
| `roleId` | `roleId`                           | Role's assignment list | Medium      |
| `unique` | `(userId, roleId, scope, scopeId)` | Assignment uniqueness  | High        |

---

## 3. Recommended Additional Indexes

### Community Search

```prisma
// For community name search (LIKE '%query%')
@@index([name])
```

**Rationale:** Full-text search on community names requires a separate index. Consider using MySQL `FULLTEXT` index for better search performance:

```sql
ALTER TABLE communities ADD FULLTEXT INDEX idx_community_name_search (name, description);
```

### Event Search

```prisma
// For event title search
@@index([title])
```

**Rationale:** Similar to community search; event title search benefits from a dedicated index. Consider `FULLTEXT` for production:

```sql
ALTER TABLE events ADD FULLTEXT INDEX idx_event_title_search (title, description);
```

### Published Posts Listing

```prisma
// For listing published posts in a community, sorted by date
@@index([status, publishedAt])
```

**Rationale:** Most common post query is "show me published posts in this community, newest first." This composite index covers both the filter and sort.

### Unread Notification Count

```prisma
// For counting unread notifications per user
@@index([userId, isRead])
```

**Rationale:** The unread count query (`WHERE userId = ? AND isRead = false`) is high-frequency. A composite index avoids scanning all user notifications.

### User Audit Trail

```prisma
// For user's recent activity, ordered by date
@@index([userId, createdAt])
```

**Rationale:** Admin user detail pages show recent activity. This composite index covers both the filter and sort efficiently.

### Additional Recommendations

| Table           | Index                                | Use Case                      |
| --------------- | ------------------------------------ | ----------------------------- |
| `communities`   | `[status, createdAt]`                | Admin community list (newest) |
| `events`        | `[status, startDate]`                | Upcoming events listing       |
| `posts`         | `[communityId, status, publishedAt]` | Community post feed           |
| `notifications` | `[userId, isRead, createdAt]`        | Dashboard notification list   |
| `audit_logs`    | `[action, createdAt]`                | Action-type audit trail       |
| `reports`       | `[status, createdAt]`                | Admin report queue            |

---

## 4. Common Query Patterns

### Community List (Paginated, Filtered, Sorted)

```typescript
// Prisma query
const communities = await prisma.community.findMany({
  where: {
    deletedAt: null,
    status: 'APPROVED',
    ...(category && { category }),
  },
  orderBy: { createdAt: 'desc' },
  take: 20,
  skip: offset,
  select: {
    id: true,
    name: true,
    slug: true,
    description: true,
    category: true,
    memberCount: true,
    createdAt: true,
  },
});
```

**Index used:** `status` + `category` for filtering, `createdAt` for ordering.

**Optimization:** Add composite index `(status, category, createdAt)` if this is the most common query.

### Community Members List

```typescript
const members = await prisma.communityMember.findMany({
  where: {
    communityId,
    deletedAt: null,
  },
  include: {
    user: {
      select: {
        id: true,
        username: true,
        avatarUrl: true,
      },
    },
  },
  orderBy: { joinedAt: 'desc' },
  take: 50,
  skip: offset,
});
```

**Index used:** `communityId` index.

**Note:** The `include` on `user` creates a JOIN. Prisma handles this efficiently with a single query.

### Event List (Upcoming, Filtered by Category)

```typescript
const events = await prisma.event.findMany({
  where: {
    deletedAt: null,
    status: 'PUBLISHED',
    startDate: { gte: new Date() },
    ...(category && { category }),
  },
  orderBy: { startDate: 'asc' },
  take: 20,
  skip: offset,
  select: {
    id: true,
    title: true,
    slug: true,
    startDate: true,
    endDate: true,
    category: true,
    _count: {
      select: { registrations: true },
    },
  },
});
```

**Index used:** `status` + `startDate` + `category`.

**Optimization:** Add composite index `(status, startDate, category)` for this query pattern.

### User Dashboard (My Communities, My Events, Notifications)

```typescript
// Parallel queries for dashboard
const [myCommunities, myEvents, unreadNotifications] = await Promise.all([
  prisma.communityMember.findMany({
    where: { userId, deletedAt: null },
    include: { community: { select: { id: true, name: true, slug: true, avatarUrl: true } } },
    take: 10,
  }),
  prisma.eventRegistration.findMany({
    where: { userId, event: { startDate: { gte: new Date() } } },
    include: { event: { select: { id: true, title: true, slug: true, startDate: true } } },
    take: 10,
  }),
  prisma.notification.findMany({
    where: { userId, isRead: false },
    orderBy: { createdAt: 'desc' },
    take: 20,
  }),
]);
```

**Indexes used:** `communityMember.userId`, `eventRegistration.userId`, `notification(userId, isRead, createdAt)`.

**Optimization:** The unread notification count can be cached in Redis for frequently accessed dashboards.

### Admin Dashboard Stats

```typescript
const stats = await Promise.all([
  prisma.user.count({ where: { deletedAt: null } }),
  prisma.community.count({ where: { deletedAt: null, status: 'APPROVED' } }),
  prisma.event.count({
    where: { deletedAt: null, status: 'PUBLISHED', startDate: { gte: new Date() } },
  }),
  prisma.report.count({ where: { status: 'PENDING' } }),
  prisma.post.count({ where: { deletedAt: null, status: 'PUBLISHED' } }),
]);
```

**Optimization:** For high-traffic dashboards, consider materialized counters or Redis caching. These COUNT queries scan full tables without indexes on status alone.

### Search Across Communities/Events/Organizations

```typescript
// Community search
const communities = await prisma.community.findMany({
  where: {
    deletedAt: null,
    OR: [
      { name: { contains: query, mode: 'insensitive' } },
      { description: { contains: query, mode: 'insensitive' } },
    ],
  },
  take: 20,
});
```

**Optimization:** MySQL `LIKE '%query%'` cannot use standard B-tree indexes. Options:

1. Add `FULLTEXT` index and use `MATCH() AGAINST()`
2. Use Elasticsearch/Meilisearch for production search
3. Implement trigram index with `pg_trgm` equivalent

### Audit Log Queries

```typescript
// By user
const logs = await prisma.auditLog.findMany({
  where: { userId },
  orderBy: { createdAt: 'desc' },
  take: 50,
  skip: offset,
});

// By date range
const logs = await prisma.auditLog.findMany({
  where: {
    createdAt: { gte: startDate, lte: endDate },
    action: actionType,
  },
  orderBy: { createdAt: 'desc' },
  take: 100,
});

// By entity
const logs = await prisma.auditLog.findMany({
  where: { entityType, entityId },
  orderBy: { createdAt: 'desc' },
});
```

**Indexes used:** `userId`, `(action, createdAt)`, `(entityType, entityId)`.

---

## 5. Query Optimization Notes

### Use Prisma Select to Avoid Over-Fetching

```typescript
// ❌ Bad — fetches all columns
const users = await prisma.user.findMany();

// ✅ Good — only fetches needed columns
const users = await prisma.user.findMany({
  select: {
    id: true,
    username: true,
    email: true,
    avatarUrl: true,
  },
});
```

### Use Prisma Include Sparingly

```typescript
// ❌ Bad — N+1 query risk with nested includes
const posts = await prisma.post.findMany({
  include: {
    author: true,
    community: {
      include: {
        members: true, // Loads ALL members for each post's community
      },
    },
  },
});

// ✅ Good — flat includes with selection
const posts = await prisma.post.findMany({
  include: {
    author: {
      select: { id: true, username: true, avatarUrl: true },
    },
    community: {
      select: { id: true, name: true, slug: true },
    },
  },
});
```

### Cursor-Based Pagination for Large Datasets

```typescript
// ❌ Offset pagination — slow for large datasets
const posts = await prisma.post.findMany({
  skip: 10000, // MySQL must scan 10000 rows
  take: 20,
});

// ✅ Cursor pagination — consistent performance
const posts = await prisma.post.findMany({
  where: {
    communityId,
    deletedAt: null,
    ...(cursor && { createdAt: { lt: cursor } }),
  },
  orderBy: { createdAt: 'desc' },
  take: 21, // Fetch one extra to determine if more pages exist
});
const hasMore = posts.length > 20;
const data = posts.slice(0, 20);
```

### Soft Delete Filter in Every Query

```typescript
// Every query must include this filter
where: {
  deletedAt: null,
  ...otherFilters,
}
```

**Recommendation:** Use a Prisma middleware to automatically add `deletedAt: null` to all queries:

```typescript
prisma.$use(async (params, next) => {
  if (params.action === 'findMany') {
    params.args.where = {
      ...params.args.where,
      deletedAt: null,
    };
  }
  return next(params);
});
```

### Read Replicas for High-Traffic Scenarios

For production deployments with high read traffic:

```typescript
// Use read replicas for queries
const prismaRead = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_READ_URL, // Read replica
    },
  },
});

// Write operations use primary
const prismaWrite = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL, // Primary
    },
  },
});
```

---

## 6. Connection Pooling

### Prisma Connection Pool Configuration

```env
# Connection string with pool settings
DATABASE_URL="mysql://user:pass@host:3306/komunaid?connection_limit=20&pool_timeout=10"
```

| Parameter          | Description                    | Default |
| ------------------ | ------------------------------ | ------- |
| `connection_limit` | Maximum number of connections  | 10      |
| `pool_timeout`     | Seconds to wait for connection | 10      |
| `connection_limit` | Recommended for production     | 20      |

### MySQL Connection Limits

```sql
-- Check current max connections
SHOW VARIABLES LIKE 'max_connections';

-- Recommended for production
SET GLOBAL max_connections = 200;
```

### Recommended Pool Sizes

| Deployment    | Pool Size | Rationale                            |
| ------------- | --------- | ------------------------------------ |
| Development   | 5         | Minimal concurrency                  |
| Serverless    | 5-10      | Limited per-invocation resources     |
| Containerized | 20+       | Shared container, higher concurrency |
| High-traffic  | 50+       | Multiple concurrent users            |

### Connection Pool Monitoring

```typescript
// Monitor pool usage
const metrics = await prisma.$queryRaw`
  SELECT 
    (SELECT COUNT(*) FROM information_schema.processlist 
     WHERE user = 'komunaid_user') as active_connections,
    (SELECT @@max_connections) as max_connections
`;

// Alert if pool utilization > 80%
const utilization = metrics[0].active_connections / metrics[0].max_connections;
if (utilization > 0.8) {
  logger.warn('Connection pool utilization high', { utilization });
}
```

### Connection Pool Best Practices

1. **Don't create new PrismaClient instances per request** — reuse the singleton
2. **Close idle connections** — configure `connection_timeout` appropriately
3. **Monitor connection count** — set up alerts for pool exhaustion
4. **Use connection pooling at the application level** — Prisma handles this automatically
5. **Consider PgBouncer equivalent for MySQL** — ProxySQL for connection multiplexing

### Serverless Considerations

For serverless deployments (AWS Lambda, Vercel):

```typescript
// Use Prisma Accelerate for connection pooling
// or configure with connection_limit=5

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  // Reduce pool size for serverless
  __internal: {
    engine: {
      connectionLimit: 5,
    },
  },
});
```

**Recommendation:** Use Prisma Accelerate or a connection proxy (ProxySQL) for serverless deployments to avoid connection exhaustion.

---

## Appendix: Index Summary Table

| Table                   | Index Name       | Columns                            | Type   |
| ----------------------- | ---------------- | ---------------------------------- | ------ |
| `users`                 | `email`          | `email`                            | B-tree |
| `users`                 | `username`       | `username`                         | B-tree |
| `users`                 | `deletedAt`      | `deletedAt`                        | B-tree |
| `communities`           | `slug`           | `slug`                             | B-tree |
| `communities`           | `status`         | `status`                           | B-tree |
| `communities`           | `ownerId`        | `ownerId`                          | B-tree |
| `communities`           | `category`       | `category`                         | B-tree |
| `communities`           | `deletedAt`      | `deletedAt`                        | B-tree |
| `community_members`     | `communityId`    | `communityId`                      | B-tree |
| `community_members`     | `userId`         | `userId`                           | B-tree |
| `community_members`     | `unique`         | `(communityId, userId)`            | Unique |
| `organization_members`  | `organizationId` | `organizationId`                   | B-tree |
| `organization_members`  | `userId`         | `userId`                           | B-tree |
| `organization_members`  | `unique`         | `(organizationId, userId)`         | Unique |
| `events`                | `slug`           | `slug`                             | B-tree |
| `events`                | `status`         | `status`                           | B-tree |
| `events`                | `createdById`    | `createdById`                      | B-tree |
| `events`                | `category`       | `category`                         | B-tree |
| `events`                | `startDate`      | `startDate`                        | B-tree |
| `events`                | `deletedAt`      | `deletedAt`                        | B-tree |
| `event_registrations`   | `eventId`        | `eventId`                          | B-tree |
| `event_registrations`   | `userId`         | `userId`                           | B-tree |
| `event_registrations`   | `unique`         | `(eventId, userId)`                | Unique |
| `posts`                 | `communityId`    | `communityId`                      | B-tree |
| `posts`                 | `authorId`       | `authorId`                         | B-tree |
| `posts`                 | `status`         | `status`                           | B-tree |
| `posts`                 | `deletedAt`      | `deletedAt`                        | B-tree |
| `posts`                 | `unique`         | `(communityId, slug)`              | Unique |
| `notifications`         | `userId`         | `userId`                           | B-tree |
| `notifications`         | `isRead`         | `isRead`                           | B-tree |
| `notifications`         | `createdAt`      | `createdAt`                        | B-tree |
| `reports`               | `status`         | `status`                           | B-tree |
| `reports`               | `targetType`     | `(targetType, targetId)`           | B-tree |
| `reports`               | `reporterId`     | `reporterId`                       | B-tree |
| `audit_logs`            | `userId`         | `userId`                           | B-tree |
| `audit_logs`            | `action`         | `action`                           | B-tree |
| `audit_logs`            | `entityType`     | `(entityType, entityId)`           | B-tree |
| `audit_logs`            | `createdAt`      | `createdAt`                        | B-tree |
| `categories`            | `type`           | `type`                             | B-tree |
| `categories`            | `isActive`       | `isActive`                         | B-tree |
| `categories`            | `slug`           | `slug`                             | B-tree |
| `settings`              | `key`            | `key`                              | B-tree |
| `contact_messages`      | `status`         | `status`                           | B-tree |
| `user_role_assignments` | `userId`         | `userId`                           | B-tree |
| `user_role_assignments` | `roleId`         | `roleId`                           | B-tree |
| `user_role_assignments` | `unique`         | `(userId, roleId, scope, scopeId)` | Unique |
