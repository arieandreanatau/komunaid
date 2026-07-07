# KomunaID Low-Level Design

| Item         | Detail           |
| ------------ | ---------------- |
| **Project**  | KomunaID         |
| **Document** | Low-Level Design |
| **Date**     | 7 Juli 2026      |
| **Status**   | Completed        |

---

## 1. NestJS Module Architecture

### 1.1 Controller → Service → Repository Pattern

Setiap feature module di KomunaID mengikuti pola tiga lapis:

```
┌─────────────────────────────────────────────────────┐
│                    Controller                         │
│  • Handles HTTP request/response                     │
│  • Validates input via DTO + ValidationPipe          │
│  • Delegates to Service                              │
│  • Transforms output (already handled by interceptor)│
└──────────────────────┬──────────────────────────────┘
                       │ calls
                       ▼
┌─────────────────────────────────────────────────────┐
│                     Service                          │
│  • Contains business logic                           │
│  • Orchestrates Prisma queries                       │
│  • Calls other services (DI)                         │
│  • Emits side effects (notifications, audit)         │
└──────────────────────┬──────────────────────────────┘
                       │ calls
                       ▼
┌─────────────────────────────────────────────────────┐
│                   PrismaService                      │
│  • Database access via Prisma Client                 │
│  • Connection pooling managed by Prisma              │
│  • Transactions via $transaction                     │
│  • No raw SQL (prefer Prisma query API)              │
└─────────────────────────────────────────────────────┘
```

### 1.2 Module Structure

```
modules/
└── [module-name]/
    ├── [module-name].module.ts      Module definition
    ├── [module-name].controller.ts  Route handlers
    ├── [module-name].service.ts     Business logic
    ├── dto/
    │   ├── create-[entity].dto.ts   Input DTO for create
    │   ├── update-[entity].dto.ts   Input DTO for update
    │   ├── query-[entity].dto.ts    Query params DTO
    │   └── [entity]-response.dto.ts Response DTO (optional)
    ├── entities/
    │   └── [entity].entity.ts       Entity type (optional, Prisma types used)
    └── [module-name].spec.ts        Unit tests
```

### 1.3 Module Registration

```typescript
// modules/communities/communities.module.ts
@Module({
  imports: [PrismaModule, AuthModule, forwardRef(() => NotificationsModule)],
  controllers: [CommunitiesController],
  providers: [CommunitiesService],
  exports: [CommunitiesService],
})
export class CommunitiesModule {}
```

### 1.4 Controller Pattern

```typescript
@Controller('communities')
@UseGuards(AuthGuard, RolesGuard)
export class CommunitiesController {
  constructor(private readonly communitiesService: CommunitiesService) {}

  @Post()
  @Roles('MEMBER')
  @HttpCode(201)
  async create(@CurrentUser() user: UserPayload, @Body() dto: CreateCommunityDto) {
    return this.communitiesService.create(user.id, dto);
  }

  @Get(':slug')
  @Public()
  async findBySlug(@Param('slug') slug: string) {
    return this.communitiesService.findBySlug(slug);
  }

  @Patch(':id')
  @Roles('COMMUNITY_OWNER', 'COMMUNITY_ADMIN')
  @ScopedPermission('COMMUNITY', 'id')
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateCommunityDto) {
    return this.communitiesService.update(id, dto);
  }
}
```

### 1.5 Service Pattern

```typescript
@Injectable()
export class CommunitiesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationsService,
  ) {}

  async create(ownerId: string, dto: CreateCommunityDto) {
    const slug = await this.generateUniqueSlug(dto.name);

    const community = await this.prisma.community.create({
      data: {
        ...dto,
        slug,
        ownerId,
        status: 'PENDING',
      },
      include: { owner: true },
    });

    // Auto-assign owner role
    await this.prisma.userRoleAssignment.create({
      data: {
        userId: ownerId,
        roleId: await this.getRoleId('COMMUNITY_OWNER'),
        scope: 'COMMUNITY',
        scopeId: community.id,
      },
    });

    // Auto-add as member
    await this.prisma.communityMember.create({
      data: {
        communityId: community.id,
        userId: ownerId,
        role: 'OWNER',
      },
    });

    return community;
  }
}
```

---

## 2. Common Layer Design

### 2.1 PrismaService Singleton

```typescript
// common/prisma/prisma.service.ts
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }

  async executeTransaction<T>(fn: (prisma: PrismaClient) => Promise<T>): Promise<T> {
    return this.$transaction(fn);
  }
}
```

**Key behaviors:**

- Singleton: one PrismaClient instance shared across all modules
- Auto-connect on module initialization
- Transaction helper for multi-step operations

### 2.2 AuthGuard

```typescript
// common/guards/auth.guard.ts
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(request);

    if (!token) {
      // Check if route is public
      const reflector = new Reflector();
      const isPublic = reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);
      return isPublic;
    }

    try {
      const payload = await this.jwtService.verifyAsync(token);
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        include: {
          roles: {
            include: { role: true },
          },
        },
      });

      if (!user || !user.isActive || user.deletedAt) {
        throw new UnauthorizedException('Account not found or inactive');
      }

      request.user = {
        id: user.id,
        email: user.email,
        username: user.username,
        roles: user.roles.map((r) => ({
          name: r.role.name,
          scope: r.scope,
          scopeId: r.scopeId,
        })),
      };

      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  private extractToken(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
```

### 2.3 RolesGuard

```typescript
// common/guards/roles.guard.ts
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    if (!user) return false;

    // Check platform-level roles
    return requiredRoles.some((role) => user.roles.some((r) => r.name === role && !r.scope));
  }
}
```

### 2.4 ScopedPermissionGuard

```typescript
// common/guards/scoped-permission.guard.ts
@Injectable()
export class ScopedPermissionGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const reflector = new Reflector();
    const permission = reflector.getAllAndOverride<ScopedPermission>(SCOPED_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!permission) return true;

    const request = context.switchToHttp().getRequest();
    const { user } = request;

    if (!user) return false;

    // Super admin bypasses all scoped permissions
    if (user.roles.some((r) => r.name === 'SUPER_ADMIN')) return true;

    // Extract scopeId from params
    const scopeId = this.extractScopeId(request, permission.paramName);

    // Check scoped role assignment
    const assignment = await this.prisma.userRoleAssignment.findFirst({
      where: {
        userId: user.id,
        scope: permission.scope,
        scopeId,
      },
      include: { role: true },
    });

    if (!assignment) return false;

    return permission.roles.includes(assignment.role.name);
  }
}
```

### 2.5 AuditLogInterceptor

```typescript
// common/interceptors/audit-log.interceptor.ts
@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(private readonly prisma: PrismaService) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const { user, method, url } = request;

    // Only audit mutations (POST, PATCH, PUT, DELETE)
    if (!['POST', 'PATCH', 'PUT', 'DELETE'].includes(method)) {
      return next.handle();
    }

    const reflector = new Reflector();
    const auditConfig = reflector.getAllAndOverride<AuditConfig>(AUDIT_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!auditConfig) return next.handle();

    const startTime = Date.now();

    return next.handle().pipe(
      tap(async (response) => {
        try {
          await this.prisma.auditLog.create({
            data: {
              userId: user?.id || 'system',
              action: `${method} ${url}`,
              entityType: auditConfig.entityType,
              entityId: response?.id || 'unknown',
              newValues: method !== 'DELETE' ? JSON.stringify(response) : null,
              ipAddress: request.ip,
              userAgent: request.headers['user-agent']?.substring(0, 500),
              metadata: JSON.stringify({
                duration: Date.now() - startTime,
                requestId: request.headers['x-request-id'],
              }),
            },
          });
        } catch (error) {
          // Audit log failure should not break the request
        }
      }),
    );
  }
}
```

### 2.6 TransformResponseInterceptor

```typescript
// common/interceptors/transform-response.interceptor.ts
@Injectable()
export class TransformResponseInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    return next.handle().pipe(
      map((data) => {
        // If data already has 'success' field, return as-is (custom response)
        if (data && typeof data === 'object' && 'success' in data) {
          return data;
        }

        // Extract meta if present (pagination)
        const { meta, ...rest } = data || {};

        return {
          success: true,
          data: rest,
          message: 'Operation completed successfully',
          ...(meta && { meta }),
          meta: {
            requestId: context.switchToHttp().getRequest().headers['x-request-id'],
          },
        };
      }),
    );
  }
}
```

### 2.7 RequestIdMiddleware

```typescript
// common/middleware/request-id.middleware.ts
@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction) {
    const requestId = (req.headers['x-request-id'] as string) || uuidv4();
    req.headers['x-request-id'] = requestId;
    next();
  }
}
```

---

## 3. DTO Pattern

### 3.1 Base Principles

- All input validated via `class-validator` decorators
- `whitelist: true` strips unknown properties
- `transform: true` auto-transforms payload to DTO class instances
- Response DTOs are optional — Prisma return types used directly

### 3.2 Create DTO Example

```typescript
// dto/create-community.dto.ts
import { IsString, IsOptional, MaxLength, IsUrl, IsEmail } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCommunityDto {
  @ApiProperty({ example: 'Komunitas React Indonesia' })
  @IsString()
  @MaxLength(200)
  name: string;

  @ApiPropertyOptional({ example: 'Komunitas developer React di Indonesia' })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  shortDescription?: string;

  @ApiProperty({ example: 'Komunitas untuk developer React...' })
  @IsString()
  description: string;

  @ApiProperty({ example: 'TECHNOLOGY' })
  @IsString()
  @MaxLength(100)
  category: string;

  @ApiPropertyOptional({ example: 'Jakarta, Indonesia' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  location?: string;

  @ApiPropertyOptional({ example: 'https://reactindonesia.dev' })
  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  website?: string;

  @ApiPropertyOptional({ example: 'contact@reactindonesia.dev' })
  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  contactEmail?: string;
}
```

### 3.3 Query DTO Example

```typescript
// dto/query-community.dto.ts
import { IsOptional, IsString, IsEnum, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryCommunityDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: ['OPEN', 'CLOSED', 'INVITE_ONLY'] })
  @IsOptional()
  @IsEnum(['OPEN', 'CLOSED', 'INVITE_ONLY'])
  membershipType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}
```

### 3.4 Global Validation Pipe Configuration

```typescript
// main.ts
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
  }),
);
```

---

## 4. Error Handling

### 4.1 Global Exception Filter

```typescript
// common/filters/http-exception.filter.ts
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const requestId = request.headers['x-request-id'];

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let code = 'INTERNAL_ERROR';
    let details: any = null;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        message = (exceptionResponse as any).message || message;
        code = (exceptionResponse as any).error || code;
        details = (exceptionResponse as any).details || null;
      }
    } else if (exception instanceof PrismaClientKnownRequestError) {
      // Handle Prisma errors
      switch (exception.code) {
        case 'P2002':
          status = HttpStatus.CONFLICT;
          message = 'Resource already exists';
          code = 'DUPLICATE_ENTRY';
          break;
        case 'P2025':
          status = HttpStatus.NOT_FOUND;
          message = 'Resource not found';
          code = 'NOT_FOUND';
          break;
        default:
          message = 'Database error';
          code = 'DATABASE_ERROR';
      }
    } else if (exception instanceof Error) {
      this.logger.error(`Unhandled error: ${exception.message}`, exception.stack);
    }

    response.status(status).json({
      success: false,
      error: {
        code,
        message: Array.isArray(message) ? message[0] : message,
        ...(details && { details }),
      },
      meta: {
        requestId,
        timestamp: new Date().toISOString(),
      },
    });
  }
}
```

### 4.2 Custom HttpException Classes

```typescript
// common/exceptions/
export class NotFoundException extends HttpException {
  constructor(message = 'Resource not found') {
    super(message, HttpStatus.NOT_FOUND);
  }
}

export class ForbiddenException extends HttpException {
  constructor(message = 'Insufficient permissions') {
    super(message, HttpStatus.FORBIDDEN);
  }
}

export class ConflictException extends HttpException {
  constructor(message = 'Resource already exists') {
    super(message, HttpStatus.CONFLICT);
  }
}

export class BadRequestException extends HttpException {
  constructor(message = 'Bad request', details?: any) {
    super({ message, details }, HttpStatus.BAD_REQUEST);
  }
}
```

### 4.3 Error Response Contract

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "must be a valid email"
      }
    ]
  },
  "meta": {
    "requestId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "timestamp": "2026-07-07T10:00:00.000Z"
  }
}
```

---

## 5. Logging Strategy

### 5.1 Structured Logging

Semua log menggunakan NestJS Logger dengan format JSON untuk kemudahan parsing:

```typescript
// Structured log example
this.logger.log({
  level: 'info',
  context: 'AuthService',
  message: 'User logged in successfully',
  requestId: request.headers['x-request-id'],
  userId: user.id,
  ip: request.ip,
  userAgent: request.headers['user-agent'],
});
```

### 5.2 Log Levels

| Level   | Usage                                     | Environment      |
| ------- | ----------------------------------------- | ---------------- |
| `error` | Unhandled exceptions, system failures     | All              |
| `warn`  | Deprecation notices, performance warnings | All              |
| `info`  | Request lifecycle, business events        | All              |
| `debug` | Development debugging, query details      | Development only |

### 5.3 Audit Log Format

```typescript
interface AuditLogEntry {
  userId: string; // User who performed the action
  action: string; // e.g., "POST /api/v1/communities"
  entityType: string; // e.g., "COMMUNITY"
  entityId: string; // e.g., UUID of the community
  oldValues?: string; // JSON of previous state (updates/deletes)
  newValues?: string; // JSON of new state (creates/updates)
  ipAddress?: string; // Client IP address
  userAgent?: string; // Client user agent
  metadata?: string; // JSON of additional context
}
```

### 5.4 Context-Based Logging

```typescript
// Each module uses its own context for easy filtering
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  // Logs will show context: "AuthService"
}
```

---

## 6. Caching Strategy

### 6.1 Design Philosophy

Caching implemented sebagai **future-ready, in-memory cache**. Tidak menggunakan Redis di phase awal, tetapi dirancang agar mudah migrasi ke Redis.

### 6.2 Cache Layers

| Layer                        | Technology            | TTL   | Use Case                        |
| ---------------------------- | --------------------- | ----- | ------------------------------- |
| **L1: In-Memory**            | Map/Object            | 5 min | Hot data (categories, settings) |
| **L2: HTTP Cache**           | Cache-Control headers | 60s   | Public read endpoints           |
| **L3: Database Query Cache** | MySQL query cache     | —     | Managed by MySQL                |

### 6.3 In-Memory Cache Implementation

```typescript
// common/cache/in-memory-cache.service.ts
@Injectable()
export class InMemoryCacheService {
  private cache = new Map<string, { data: any; expiresAt: number }>();

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return entry.data as T;
  }

  set(key: string, data: any, ttlMs = 300000): void {
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + ttlMs,
    });
  }

  invalidate(pattern: string): void {
    for (const key of this.cache.keys()) {
      if (key.startsWith(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  clear(): void {
    this.cache.clear();
  }
}
```

### 6.4 Cacheable Data

| Data           | Key Pattern              | TTL    | Invalidation        |
| -------------- | ------------------------ | ------ | ------------------- |
| Categories     | `categories:{type}`      | 5 min  | On category CRUD    |
| Settings       | `settings:{key}`         | 5 min  | On setting update   |
| Public Profile | `user:public:{username}` | 5 min  | On profile update   |
| Community Slug | `community:{slug}`       | 5 min  | On community update |
| Role List      | `roles:all`              | 10 min | On role assignment  |

---

## 7. File Upload Flow

### 7.1 Presigned URL Pattern

```
┌────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│ Client  │────▶│ API      │────▶│ S3/Vercel│     │ Client   │
│         │     │ (NestJS) │     │ Storage  │     │          │
└────────┘     └──────────┘     └──────────┘     └──────────┘
     │               │               │
     │  1. POST /uploads/presigned-url
     │  { fileName, fileType, fileSize }
     │──────────────▶│               │
     │               │  2. Validate file type/size
     │               │  3. Create MediaAsset record (PENDING)
     │               │  4. Generate presigned URL (PUT)
     │               │  5. Return { uploadUrl, assetId }
     │◀──────────────│               │
     │               │               │
     │  6. PUT uploadUrl (file binary)
     │──────────────────────────────▶│
     │               │               │
     │  7. PATCH /uploads/{id}/confirm
     │──────────────▶│               │
     │               │  8. Update MediaAsset status → COMPLETED
     │               │  9. Return asset metadata
     │◀──────────────│               │
```

### 7.2 Allowed File Types

| Category        | MIME Types                        | Max Size |
| --------------- | --------------------------------- | -------- |
| **Avatar**      | image/jpeg, image/png, image/webp | 2 MB     |
| **Banner**      | image/jpeg, image/png, image/webp | 5 MB     |
| **Event Cover** | image/jpeg, image/png, image/webp | 5 MB     |
| **Post Cover**  | image/jpeg, image/png, image/webp | 5 MB     |
| **Document**    | application/pdf                   | 10 MB    |

### 7.3 MediaAsset Entity

```typescript
interface MediaAsset {
  id: string;
  fileName: string;
  originalName: string;
  mimeType: string;
  size: number; // bytes
  url: string; // final accessible URL
  thumbnailUrl?: string; // generated thumbnail (future)
  uploadedBy: string; // userId
  entityType?: string; // USER, COMMUNITY, EVENT, POST
  entityId?: string; // UUID of related entity
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  createdAt: Date;
}
```

### 7.4 Security Measures

- **File type validation**: Whitelist MIME types, verify magic bytes
- **File size limit**: Enforced at API level before generating presigned URL
- **No server-side storage**: Files go directly to object storage
- **Presigned URL expiry**: 15 minutes for upload, 1 hour for download
- **Access control**: Private files use signed URLs with expiry
- **Virus scanning**: Future integration with ClamAV or similar

---

## 8. Layer Architecture

KomunaID uses a 4-layer architecture to ensure separation of concerns and testability:

```
┌─────────────────────────────────────────┐
│  Presentation Layer (Controller)         │
│  - HTTP request/response handling        │
│  - DTO validation                        │
│  - Route definitions                     │
├─────────────────────────────────────────┤
│  Business Logic Layer (Service)          │
│  - Business rules                        │
│  - Data transformation                   │
│  - Cross-module orchestration            │
├─────────────────────────────────────────┤
│  Data Access Layer (PrismaService)       │
│  - ORM queries                           │
│  - Database transactions                 │
│  - Connection management                 │
├─────────────────────────────────────────┤
│  Infrastructure Layer (Common)           │
│  - Auth guards                           │
│  - Logging                               │
│  - Email                                 │
│  - File storage                          │
└─────────────────────────────────────────┘
```

**Layer responsibilities:**

| Layer              | Component      | Responsibilities                                                                                     |
| ------------------ | -------------- | ---------------------------------------------------------------------------------------------------- |
| **Presentation**   | Controller     | Route handling, input validation (DTO + ValidationPipe), HTTP status codes, response decoration      |
| **Business Logic** | Service        | Business rules, data transformation, cross-module orchestration, side effects (notifications, audit) |
| **Data Access**    | PrismaService  | ORM queries via Prisma Client, database transactions, connection pooling                             |
| **Infrastructure** | Common modules | Auth guards, role guards, scoped permission guards, logging, email delivery, file storage, caching   |

**Dependency rules:**

- Presentation → Business Logic → Data Access → Infrastructure
- No circular dependencies between layers
- Services communicate via DI, never directly import other module's services (use module exports)

---

## 9. Folder Structure

```
apps/api/src/
├── main.ts
├── app.module.ts
├── common/
│   ├── config/
│   │   ├── app.config.ts
│   │   ├── database.config.ts
│   │   ├── jwt.config.ts
│   │   ├── storage.config.ts
│   │   └── email.config.ts
│   ├── decorators/
│   │   ├── current-user.decorator.ts
│   │   ├── roles.decorator.ts
│   │   └── scoped-permission.decorator.ts
│   ├── dto/
│   ├── email/
│   │   ├── email.adapter.ts
│   │   ├── email.module.ts
│   │   ├── resend.adapter.ts
│   │   └── console.adapter.ts
│   ├── filters/
│   │   └── all-exceptions.filter.ts
│   ├── guards/
│   │   ├── auth.guard.ts
│   │   ├── roles.guard.ts
│   │   └── scoped-permission.guard.ts
│   ├── interceptors/
│   │   ├── audit-log.interceptor.ts
│   │   └── transform-response.interceptor.ts
│   ├── middleware/
│   │   └── request-id.middleware.ts
│   └── prisma/
│       ├── prisma.module.ts
│       └── prisma.service.ts
└── modules/
    ├── auth/
    │   ├── auth.module.ts
    │   ├── auth.controller.ts
    │   ├── auth.service.ts
    │   └── dto/
    │       ├── login.dto.ts
    │       ├── register.dto.ts
    │       ├── forgot-password.dto.ts
    │       └── reset-password.dto.ts
    ├── users/
    │   ├── users.module.ts
    │   ├── users.controller.ts
    │   ├── users.service.ts
    │   └── dto/
    ├── communities/
    │   ├── communities.module.ts
    │   ├── communities.controller.ts
    │   ├── communities.service.ts
    │   └── dto/
    ├── community-members/
    │   ├── community-members.module.ts
    │   ├── community-members.controller.ts
    │   ├── community-members.service.ts
    │   └── dto/
    ├── organizations/
    │   ├── organizations.module.ts
    │   ├── organizations.controller.ts
    │   ├── organizations.service.ts
    │   └── dto/
    ├── events/
    │   ├── events.module.ts
    │   ├── events.controller.ts
    │   ├── events.service.ts
    │   └── dto/
    ├── posts/
    │   ├── posts.module.ts
    │   ├── posts.controller.ts
    │   ├── posts.service.ts
    │   └── dto/
    ├── categories/
    │   ├── categories.module.ts
    │   ├── categories.controller.ts
    │   ├── categories.service.ts
    │   └── dto/
    ├── notifications/
    │   ├── notifications.module.ts
    │   ├── notifications.controller.ts
    │   ├── notifications.service.ts
    │   └── dto/
    ├── reports/
    │   ├── reports.module.ts
    │   ├── reports.controller.ts
    │   ├── reports.service.ts
    │   └── dto/
    ├── admin/
    │   ├── admin.module.ts
    │   ├── admin.controller.ts
    │   ├── admin.service.ts
    │   └── dto/
    ├── uploads/
    │   ├── uploads.module.ts
    │   ├── uploads.controller.ts
    │   ├── uploads.service.ts
    │   └── dto/
    ├── audit-logs/
    │   ├── audit-logs.module.ts
    │   ├── audit-logs.controller.ts
    │   ├── audit-logs.service.ts
    │   └── dto/
    └── contact/
        ├── contact.module.ts
        ├── contact.controller.ts
        ├── contact.service.ts
        └── dto/
```

---

## 10. Module Documentation

### 10.1 Auth Module

| Field              | Detail                                                                                                                                                                                                 |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Purpose**        | Handle user authentication, registration, login, and token management.                                                                                                                                 |
| **Responsibility** | Register new users with email/password, authenticate users via credentials, issue and verify JWT access/refresh tokens, handle password reset flow (forgot/reset), validate token on protected routes. |
| **Dependencies**   | `PrismaModule`, `EmailModule`, `JwtModule` (from `@nestjs/jwt`), `NotificationsModule` (for welcome email).                                                                                            |
| **Input**          | `RegisterDto` (email, password, username), `LoginDto` (email, password), `ForgotPasswordDto` (email), `ResetPasswordDto` (token, newPassword).                                                         |
| **Output**         | `AuthResponseDto` (accessToken, refreshToken, user), `MessageResponseDto` (confirmation message), `UserPayload` (attached to request by AuthGuard).                                                    |

### 10.2 Users Module

| Field              | Detail                                                                                                                                                                                                                           |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Purpose**        | Manage user profiles, public profiles, and account settings.                                                                                                                                                                     |
| **Responsibility** | Retrieve user profiles (public/private), update profile information (bio, avatar, banner), manage account settings (email, username change), handle user deactivation and soft-delete, list users with filtering and pagination. |
| **Dependencies**   | `PrismaModule`, `UploadsModule` (for avatar/banner media assets), `InMemoryCacheService` (for public profile caching).                                                                                                           |
| **Input**          | `UpdateProfileDto` (displayName, bio, avatar, banner), `QueryUserDto` (search, page, limit), `UpdateSettingsDto` (email, username).                                                                                              |
| **Output**         | `UserResponseDto` (full user profile), `PublicProfileDto` (sanitized public view), `UserListResponseDto` (paginated user list).                                                                                                  |

### 10.3 Communities Module

| Field              | Detail                                                                                                                                                                                                                                                                                             |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Purpose**        | Manage community creation, discovery, and lifecycle.                                                                                                                                                                                                                                               |
| **Responsibility** | Create new communities with auto-slug generation, retrieve community details by slug/ID, update community info (name, description, settings), list communities with filtering (category, membership type, search), manage community status (PENDING → ACTIVE → ARCHIVED), soft-delete communities. |
| **Dependencies**   | `PrismaModule`, `NotificationsModule` (for community events), `UploadsModule` (for community banner/logo), `InMemoryCacheService` (for slug caching).                                                                                                                                              |
| **Input**          | `CreateCommunityDto` (name, description, category, membershipType), `UpdateCommunityDto` (partial fields), `QueryCommunityDto` (search, category, membershipType, page, limit).                                                                                                                    |
| **Output**         | `CommunityResponseDto` (community with owner info), `CommunityListResponseDto` (paginated list), `CommunityDetailDto` (full community with member count).                                                                                                                                          |

### 10.4 Community Members Module

| Field              | Detail                                                                                                                                                                                                       |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Purpose**        | Manage membership within communities, including joins, leaves, role assignments, and invitations.                                                                                                            |
| **Responsibility** | Allow users to join open communities, handle invite-only join requests, remove members, assign/member roles within community scope, list members with role filtering, process membership approval/rejection. |
| **Dependencies**   | `PrismaModule`, `NotificationsModule` (for join/leave/approval notifications), `RolesModule` (for role assignment).                                                                                          |
| **Input**          | `JoinCommunityDto` (communityId), `RemoveMemberDto` (communityId, userId), `UpdateMemberRoleDto` (communityId, userId, role), `QueryMemberDto` (communityId, role, page, limit).                             |
| **Output**         | `CommunityMemberResponseDto` (member with user info and role), `MemberListResponseDto` (paginated member list).                                                                                              |

### 10.5 Organizations Module

| Field              | Detail                                                                                                                                                                                                                          |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Purpose**        | Manage organization entities that can host communities and events.                                                                                                                                                              |
| **Responsibility** | Create and manage organization profiles, assign organization owners and admins, link communities to organizations, retrieve organization details, list organizations with filtering, manage organization status and visibility. |
| **Dependencies**   | `PrismaModule`, `UploadsModule` (for org logo/banner), `NotificationsModule` (for org-related events), `RolesModule` (for org role assignments).                                                                                |
| **Input**          | `CreateOrganizationDto` (name, description, website, logo), `UpdateOrganizationDto` (partial fields), `QueryOrganizationDto` (search, page, limit).                                                                             |
| **Output**         | `OrganizationResponseDto` (org with owner and member count), `OrganizationListResponseDto` (paginated list).                                                                                                                    |

### 10.6 Events Module

| Field              | Detail                                                                                                                                                                                                                                                           |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Purpose**        | Manage event creation, scheduling, and RSVPs within communities or organizations.                                                                                                                                                                                |
| **Responsibility** | Create events with details (title, description, datetime, location, cover image), list events by community/org/date range, manage RSVPs (attend, maybe, decline), handle event capacity limits, send event reminders via notifications, cancel or update events. |
| **Dependencies**   | `PrismaModule`, `NotificationsModule` (for event reminders and RSVP notifications), `UploadsModule` (for event cover images), `CommunitiesModule` (for community-scoped events).                                                                                 |
| **Input**          | `CreateEventDto` (title, description, startDate, endDate, location, maxAttendees, communityId), `UpdateEventDto` (partial fields), `RsvpEventDto` (eventId, status), `QueryEventDto` (communityId, startDate, endDate, page, limit).                             |
| **Output**         | `EventResponseDto` (event with organizer info), `EventListResponseDto` (paginated list), `EventRsvpResponseDto` (RSVP status and count).                                                                                                                         |

### 10.7 Notifications Module

| Field              | Detail                                                                                                                                                                                                                                         |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Purpose**        | Centralized notification delivery and management for all platform events.                                                                                                                                                                      |
| **Responsibility** | Create and store in-app notifications, deliver notifications via email (via EmailModule), manage notification preferences per user, mark notifications as read/unread, list notifications with filtering, handle bulk notification operations. |
| **Dependencies**   | `PrismaModule`, `EmailModule` (for email delivery), `UsersModule` (for user notification preferences).                                                                                                                                         |
| **Input**          | `CreateNotificationDto` (userId, type, title, body, entityType, entityId), `QueryNotificationDto` (userId, type, isRead, page, limit), `MarkReadDto` (notificationIds).                                                                        |
| **Output**         | `NotificationResponseDto` (notification with metadata), `NotificationListResponseDto` (paginated list with unread count).                                                                                                                      |

### 10.8 Reports Module

| Field              | Detail                                                                                                                                                                                                                                         |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Purpose**        | Allow users to report content (posts, comments, profiles, communities) for moderation review.                                                                                                                                                  |
| **Responsibility** | Create report submissions with reason and category, track report status (PENDING → REVIEWED → RESOLVED → DISMISSED), list reports for admin review with filtering, resolve or dismiss reports, take automated action on high-severity reports. |
| **Dependencies**   | `PrismaModule`, `NotificationsModule` (for report status updates), `AdminModule` (for moderation workflow).                                                                                                                                    |
| **Input**          | `CreateReportDto` (entityType, entityId, reason, category, description), `UpdateReportDto` (status, resolution), `QueryReportDto` (status, entityType, page, limit).                                                                           |
| **Output**         | `ReportResponseDto` (report with reporter info), `ReportListResponseDto` (paginated list), `ReportStatsDto` (counts by status).                                                                                                                |

### 10.9 Admin Module

| Field              | Detail                                                                                                                                                                                                                                                                          |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Purpose**        | Platform administration, moderation, and system management.                                                                                                                                                                                                                     |
| **Responsibility** | Dashboard with platform statistics (users, communities, events counts), manage platform settings, moderate communities (approve/reject PENDING status), manage user accounts (activate/deactivate/ban), manage system-wide roles and permissions, export reports and analytics. |
| **Dependencies**   | `PrismaModule`, `NotificationsModule` (for admin alerts), `AuditLogsModule` (for admin action tracking), `UsersModule`, `CommunitiesModule` (for cross-module management).                                                                                                      |
| **Input**          | `DashboardQueryDto` (dateRange, metrics), `ModerateCommunityDto` (communityId, action, reason), `ManageUserDto` (userId, action), `SystemSettingsDto` (key, value).                                                                                                             |
| **Output**         | `DashboardResponseDto` (platform stats), `ModerationActionResponseDto` (action result), `SystemSettingsResponseDto` (current settings).                                                                                                                                         |

### 10.10 Uploads Module

| Field              | Detail                                                                                                                                                                                                                                                                                         |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Purpose**        | Handle file uploads via presigned URL pattern for object storage (S3/Vercel Blob).                                                                                                                                                                                                             |
| **Responsibility** | Generate presigned upload URLs for validated file types, confirm upload completion and update MediaAsset status, validate file type and size before upload, manage MediaAsset lifecycle (PENDING → COMPLETED → FAILED), associate uploaded files with entities (user, community, event, post). |
| **Dependencies**   | `PrismaModule`, `ConfigModule` (for storage configuration: bucket, region, credentials), `InMemoryCacheService` (optional, for signed URL caching).                                                                                                                                            |
| **Input**          | `CreatePresignedUrlDto` (fileName, fileType, fileSize, entityType, entityId), `ConfirmUploadDto` (assetId), `QueryMediaAssetDto` (entityType, entityId, status, page, limit).                                                                                                                  |
| **Output**         | `PresignedUrlResponseDto` (uploadUrl, assetId, expiresIn), `MediaAssetResponseDto` (complete asset metadata), `MediaAssetListResponseDto` (paginated list).                                                                                                                                    |

### 10.11 Audit Logs Module

| Field              | Detail                                                                                                                                                                                                                                                     |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Purpose**        | Track and record all significant system actions for compliance, debugging, and security.                                                                                                                                                                   |
| **Responsibility** | Record audit entries for mutations (POST/PATCH/PUT/DELETE) via interceptor, provide audit log query and export capabilities, filter logs by user, action, entity type, and date range, ensure audit entries are immutable (create-only, no update/delete). |
| **Dependencies**   | `PrismaModule`, `AdminModule` (for admin-only log access), `AuthGuard` (for user context).                                                                                                                                                                 |
| **Input**          | `AuditLogEntry` (userId, action, entityType, entityId, oldValues, newValues, ipAddress, userAgent), `QueryAuditLogDto` (userId, action, entityType, startDate, endDate, page, limit).                                                                      |
| **Output**         | `AuditLogResponseDto` (single audit entry), `AuditLogListResponseDto` (paginated list with filters).                                                                                                                                                       |

### 10.12 Roles Module (within Communities/Organizations)

| Field              | Detail                                                                                                                                                                                                                                                                               |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Purpose**        | Manage role definitions and scoped role assignments for communities and organizations.                                                                                                                                                                                               |
| **Responsibility** | Define platform-level roles (SUPER_ADMIN, ADMIN, MEMBER), define scoped roles (COMMUNITY_OWNER, COMMUNITY_ADMIN, COMMUNITY_MEMBER, ORG_OWNER, ORG_ADMIN), assign roles to users within specific scopes (community/org), revoke role assignments, list available roles by scope type. |
| **Dependencies**   | `PrismaModule`, `CommunitiesModule` (for community scope validation), `OrganizationsModule` (for org scope validation).                                                                                                                                                              |
| **Input**          | `AssignRoleDto` (userId, roleId, scope, scopeId), `RevokeRoleDto` (userId, scope, scopeId), `QueryRoleDto` (scope, scopeId).                                                                                                                                                         |
| **Output**         | `RoleAssignmentResponseDto` (assignment with role and user info), `RoleListResponseDto` (available roles for given scope).                                                                                                                                                           |

### 10.13 Contact Module

| Field              | Detail                                                                                                                                                                                                                                      |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Purpose**        | Handle contact form submissions and direct communication inquiries to platform administrators.                                                                                                                                              |
| **Responsibility** | Accept contact form submissions (name, email, subject, message), send contact notifications to admin via email, store contact submissions for tracking, auto-reply to submitter confirming receipt, rate-limit submissions to prevent spam. |
| **Dependencies**   | `PrismaModule`, `EmailModule` (for admin notification and auto-reply), `AdminModule` (for admin notification routing).                                                                                                                      |
| **Input**          | `ContactDto` (name, email, subject, message, category).                                                                                                                                                                                     |
| **Output**         | `ContactResponseDto` (submission confirmation with ticket ID).                                                                                                                                                                              |
