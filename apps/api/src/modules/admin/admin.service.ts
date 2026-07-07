import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { RoleAssignmentDto } from './dto/role-assignment.dto';
import { AuditLogQueryDto } from './dto/audit-log-query.dto';
import { calculatePagination, buildPaginatedResponse } from '@komunaid/shared';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats(userId: string) {
    const [
      totalUsers,
      activeUsers,
      suspendedUsers,
      totalCommunities,
      pendingCommunities,
      totalOrganizations,
      pendingOrganizations,
      totalEvents,
      pendingEvents,
      totalPosts,
      pendingReports,
    ] = await Promise.all([
      this.prisma.user.count({ where: { deletedAt: null } }),
      this.prisma.user.count({ where: { deletedAt: null, isActive: true } }),
      this.prisma.user.count({ where: { deletedAt: null, isSuspended: true } }),
      this.prisma.community.count({ where: { deletedAt: null } }),
      this.prisma.community.count({ where: { deletedAt: null, status: 'PENDING' } }),
      this.prisma.organization.count({ where: { deletedAt: null } }),
      this.prisma.organization.count({ where: { deletedAt: null, status: 'PENDING' } }),
      this.prisma.event.count({ where: { deletedAt: null } }),
      this.prisma.event.count({ where: { deletedAt: null, status: 'PENDING' } }),
      this.prisma.post.count({ where: { deletedAt: null } }),
      this.prisma.report.count({ where: { status: 'PENDING' } }),
    ]);

    const recentUsers = await this.prisma.user.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        avatar: true,
        createdAt: true,
      },
    });

    return {
      success: true,
      data: {
        users: { total: totalUsers, active: activeUsers, suspended: suspendedUsers },
        communities: { total: totalCommunities, pending: pendingCommunities },
        organizations: { total: totalOrganizations, pending: pendingOrganizations },
        events: { total: totalEvents, pending: pendingEvents },
        posts: { total: totalPosts },
        reports: { pending: pendingReports },
        recentUsers,
      },
      message: 'Dashboard stats fetched',
    };
  }

  async listUsers(query: { page?: number; limit?: number; search?: string; status?: string }) {
    const { skip, take, page, limit } = calculatePagination(query.page, query.limit);

    const where: any = { deletedAt: null };
    if (query.search) {
      where.OR = [
        { firstName: { contains: query.search } },
        { lastName: { contains: query.search } },
        { email: { contains: query.search } },
        { username: { contains: query.search } },
      ];
    }
    if (query.status === 'suspended') where.isSuspended = true;
    if (query.status === 'active') where.isActive = true;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          username: true,
          avatar: true,
          isActive: true,
          isSuspended: true,
          emailVerified: true,
          createdAt: true,
          lastLoginAt: true,
          roles: { include: { role: true } },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      success: true,
      ...buildPaginatedResponse(users, total, page, limit),
      message: 'Users listed',
    };
  }

  async suspendUser(id: string, adminId: string, suspended: boolean, reason?: string) {
    const user = await this.prisma.user.findUnique({ where: { id, deletedAt: null } });
    if (!user) throw new NotFoundException('User not found');
    if (user.id === adminId) throw new ForbiddenException('Cannot suspend yourself');

    const updated = await this.prisma.user.update({
      where: { id },
      data: {
        isSuspended: suspended,
        suspendedAt: suspended ? new Date() : null,
        suspendedReason: suspended ? reason : null,
      },
    });

    await this.prisma.notification.create({
      data: {
        userId: id,
        type: suspended ? 'WARNING' : 'SYSTEM',
        title: suspended ? 'Account suspended' : 'Account restored',
        message: suspended
          ? `Your account has been suspended.${reason ? ` Reason: ${reason}` : ''}`
          : 'Your account has been restored.',
      },
    });

    return {
      success: true,
      data: { id: updated.id, isSuspended: updated.isSuspended },
      message: suspended ? 'User suspended' : 'User restored',
    };
  }

  async assignRole(adminId: string, dto: RoleAssignmentDto) {
    const user = await this.prisma.user.findUnique({ where: { id: dto.userId, deletedAt: null } });
    if (!user) throw new NotFoundException('User not found');

    const role = await this.prisma.role.findFirst({ where: { name: dto.roleName } });
    if (!role) throw new NotFoundException('Role not found');

    const scopeFilter: any = {
      userId: dto.userId,
      roleId: role.id,
    };
    if (dto.scope) {
      scopeFilter.scope = dto.scope;
      scopeFilter.scopeId = dto.scopeId || null;
    } else {
      scopeFilter.scope = null;
      scopeFilter.scopeId = null;
    }

    const existing = await this.prisma.userRoleAssignment.findFirst({
      where: scopeFilter,
    });
    if (existing) throw new ConflictException('User already has this role');

    const userRoleAssignment = await this.prisma.userRoleAssignment.create({
      data: {
        userId: dto.userId,
        roleId: role.id,
        scope: dto.scope || null,
        scopeId: dto.scopeId || null,
        grantedById: adminId,
      },
    });

    return { success: true, data: userRoleAssignment, message: `Role ${dto.roleName} assigned` };
  }

  async getAuditLogs(query: AuditLogQueryDto) {
    const { skip, take, page, limit } = calculatePagination(query.page, query.limit);

    const where: any = {};
    if (query.userId) where.userId = query.userId;
    if (query.action) where.action = query.action;
    if (query.entityType) where.entityType = query.entityType;
    if (query.startDate || query.endDate) {
      where.createdAt = {};
      if (query.startDate) where.createdAt.gte = new Date(query.startDate);
      if (query.endDate) where.createdAt.lte = new Date(query.endDate);
    }

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      success: true,
      ...buildPaginatedResponse(logs, total, page, limit),
      message: 'Audit logs listed',
    };
  }

  async getSettings() {
    const settings = await this.prisma.setting.findMany({
      orderBy: { key: 'asc' },
    });

    const settingsMap = settings.reduce(
      (acc: any, setting: any) => {
        acc[setting.key] = setting.value;
        return acc;
      },
      {} as Record<string, string>,
    );

    return { success: true, data: settingsMap, message: 'Settings fetched' };
  }

  async updateSettings(userId: string, settings: Record<string, any>) {
    const updates = await Promise.all(
      Object.entries(settings).map(([key, value]) =>
        this.prisma.setting.upsert({
          where: { key },
          update: { value: String(value), updatedById: userId },
          create: { key, value: String(value), updatedById: userId },
        }),
      ),
    );

    return { success: true, data: updates, message: 'Settings updated' };
  }
}
