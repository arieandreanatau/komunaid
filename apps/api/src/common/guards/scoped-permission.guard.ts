import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SCOPED_PERMISSION_KEY } from '../decorators/scoped-permission.decorator';

@Injectable()
export class ScopedPermissionGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermission = this.reflector.getAllAndOverride<string>(SCOPED_PERMISSION_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPermission) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.roles) {
      throw new ForbiddenException('Access denied');
    }

    const userRoles = user.roles as Array<{
      name: string;
      scope?: string | null;
      scopeId?: string | null;
    }>;

    const hasPermission = userRoles.some((role) => {
      if (role.name === 'SUPER_ADMIN') return true;

      if (role.name === 'PLATFORM_ADMIN') {
        return true;
      }

      if (role.scope && role.scopeId) {
        const paramScopeId =
          request.params.communityId || request.params.organizationId || request.params.id;
        if (paramScopeId && role.scopeId === paramScopeId) {
          return true;
        }
      }

      return false;
    });

    if (!hasPermission) {
      throw new ForbiddenException('Insufficient scoped permissions');
    }

    return true;
  }
}
