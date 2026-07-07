import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { calculatePagination, buildPaginatedResponse } from '@komunaid/shared';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async listByUser(userId: string, query: { page?: number; limit?: number; unreadOnly?: boolean }) {
    const { skip, take, page, limit } = calculatePagination(query.page, query.limit);

    const where: any = { userId };
    if (query.unreadOnly) where.readAt = null;

    const [notifications, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.notification.count({ where }),
    ]);

    const unreadCount = await this.prisma.notification.count({
      where: { userId, readAt: null },
    });

    return {
      success: true,
      ...buildPaginatedResponse(notifications, total, page, limit),
      unreadCount,
      message: 'Notifications listed',
    };
  }

  async markRead(id: string, userId: string) {
    const notification = await this.prisma.notification.findUnique({ where: { id } });
    if (!notification) throw new NotFoundException('Notification not found');
    if (notification.userId !== userId) throw new ForbiddenException('Not your notification');

    const updated = await this.prisma.notification.update({
      where: { id },
      data: { readAt: new Date() },
    });

    return { success: true, data: updated, message: 'Notification marked as read' };
  }

  async markAllRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    });

    return { success: true, message: 'All notifications marked as read' };
  }
}
