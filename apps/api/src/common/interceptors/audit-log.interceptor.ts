import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(private prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body, user, params } = request;

    if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') {
      return next.handle();
    }

    return next.handle().pipe(
      tap(async (response) => {
        try {
          const entityType = this.extractEntityType(url);
          const entityId = params?.id || response?.data?.id || body?.id;
          const action = this.mapMethodToAction(method, url);

          if (entityType && action) {
            await this.prisma.auditLog.create({
              data: {
                userId: user?.id || 'system',
                action,
                entityType,
                entityId: entityId || 'unknown',
                newValues: method !== 'DELETE' ? JSON.stringify(body || {}) : null,
                ipAddress: request.ip || request.headers['x-forwarded-for'] || null,
                userAgent: request.headers['user-agent'] || null,
              },
            });
          }
        } catch (error) {
          console.error('Audit log error:', error);
        }
      }),
    );
  }

  private extractEntityType(url: string): string | null {
    const segments = url.split('/').filter(Boolean);
    const entityMap: Record<string, string> = {
      users: 'USER',
      communities: 'COMMUNITY',
      organizations: 'ORGANIZATION',
      events: 'EVENT',
      posts: 'POST',
      categories: 'CATEGORY',
      reports: 'REPORT',
      notifications: 'NOTIFICATION',
      roles: 'ROLE',
      settings: 'SETTING',
    };

    for (const segment of segments) {
      if (entityMap[segment]) return entityMap[segment];
    }
    return null;
  }

  private mapMethodToAction(method: string, url: string): string | null {
    const methodMap: Record<string, string> = {
      POST: 'CREATE',
      PATCH: 'UPDATE',
      PUT: 'UPDATE',
      DELETE: 'DELETE',
    };

    const action = methodMap[method];
    if (!action) return null;

    if (url.includes('approve')) return 'APPROVE';
    if (url.includes('reject')) return 'REJECT';
    if (url.includes('suspend')) return 'SUSPEND';
    if (url.includes('restore')) return 'RESTORE';
    if (url.includes('assign')) return 'ASSIGN_ROLE';

    return action;
  }
}
