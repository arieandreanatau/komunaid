import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { generateSlug, calculatePagination, buildPaginatedResponse } from '@komunaid/shared';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  async list(query: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    isOnline?: boolean;
    sort?: string;
  }) {
    const { skip, take, page, limit } = calculatePagination(query.page, query.limit);

    const where: any = { deletedAt: null, status: 'APPROVED' };
    if (query.search) {
      where.OR = [
        { title: { contains: query.search } },
        { description: { contains: query.search } },
      ];
    }
    if (query.category) where.category = query.category;
    if (query.isOnline !== undefined) where.isOnline = query.isOnline;

    const orderBy: any = (() => {
      switch (query.sort) {
        case 'oldest':
          return { createdAt: 'asc' } as const;
        case 'date':
          return { startDate: 'asc' } as const;
        case 'popular':
          return { registrations: { _count: 'desc' } } as const;
        default:
          return { startDate: 'desc' } as const;
      }
    })();

    const [events, total] = await Promise.all([
      this.prisma.event.findMany({
        where,
        skip,
        take,
        orderBy,
        include: {
          creator: { select: { id: true, firstName: true, lastName: true, avatar: true } },
          _count: { select: { registrations: true } },
        },
      }),
      this.prisma.event.count({ where }),
    ]);

    return {
      success: true,
      ...buildPaginatedResponse(events, total, page, limit),
      message: 'Events listed',
    };
  }

  async getBySlug(slug: string) {
    const event = await this.prisma.event.findUnique({
      where: { slug, deletedAt: null },
      include: {
        creator: {
          select: { id: true, firstName: true, lastName: true, avatar: true, username: true },
        },
        registrations: {
          include: {
            user: { select: { id: true, firstName: true, lastName: true, avatar: true } },
          },
          take: 20,
        },
        _count: { select: { registrations: true } },
      },
    });
    if (!event) throw new NotFoundException('Event not found');
    return { success: true, data: event, message: 'Event fetched' };
  }

  async create(userId: string, dto: CreateEventDto) {
    const slug = generateSlug(dto.title);

    const existingEvent = await this.prisma.event.findUnique({ where: { slug } });
    if (existingEvent) {
      const uniqueSlug = `${slug}-${Date.now()}`;
      const event = await this.prisma.event.create({
        data: {
          ...dto,
          slug: uniqueSlug,
          createdById: userId,
          status: 'PENDING',
        },
      });
      return { success: true, data: event, message: 'Event created, pending approval' };
    }

    const event = await this.prisma.event.create({
      data: {
        ...dto,
        slug,
        createdById: userId,
        status: 'PENDING',
      },
    });

    return { success: true, data: event, message: 'Event created, pending approval' };
  }

  async update(id: string, userId: string, dto: UpdateEventDto) {
    const event = await this.prisma.event.findUnique({ where: { id, deletedAt: null } });
    if (!event) throw new NotFoundException('Event not found');
    if (event.createdById !== userId)
      throw new ForbiddenException('Only the creator can update this event');

    const updated = await this.prisma.event.update({ where: { id }, data: dto });
    return { success: true, data: updated, message: 'Event updated' };
  }

  async register(eventId: string, userId: string) {
    const event = await this.prisma.event.findUnique({ where: { id: eventId, deletedAt: null } });
    if (!event) throw new NotFoundException('Event not found');
    if (event.status !== 'APPROVED') throw new BadRequestException('Event is not active');

    const existing = await this.prisma.eventRegistration.findUnique({
      where: { eventId_userId: { eventId, userId } },
    });
    if (existing) throw new ConflictException('Already registered');

    const registration = await this.prisma.$transaction(async (tx: any) => {
      if (event.capacity) {
        const count = await tx.eventRegistration.count({
          where: { eventId, status: { not: 'CANCELLED' } },
        });
        if (count >= event.capacity) throw new BadRequestException('Event is at full capacity');
      }

      return tx.eventRegistration.create({
        data: { eventId, userId },
      });
    });

    return { success: true, data: registration, message: 'Registered for event' };
  }

  async unregister(eventId: string, userId: string) {
    const registration = await this.prisma.eventRegistration.findUnique({
      where: { eventId_userId: { eventId, userId } },
    });
    if (!registration) throw new NotFoundException('Not registered for this event');

    await this.prisma.eventRegistration.update({
      where: { eventId_userId: { eventId, userId } },
      data: { status: 'CANCELLED', cancelledAt: new Date() },
    });

    return { success: true, message: 'Unregistered from event' };
  }

  async updateStatus(id: string, adminId: string, status: string, reason?: string) {
    const allowedStatuses = ['APPROVED', 'REJECTED'];
    if (!allowedStatuses.includes(status)) {
      throw new BadRequestException(`Invalid status. Allowed: ${allowedStatuses.join(', ')}`);
    }

    const event = await this.prisma.event.findUnique({ where: { id } });
    if (!event) throw new NotFoundException('Event not found');

    const updateData: any = { status };
    if (status === 'APPROVED') {
      updateData.approvedAt = new Date();
      updateData.approvedById = adminId;
    } else if (status === 'REJECTED') {
      updateData.statusReason = reason;
      updateData.rejectedAt = new Date();
    }

    const updated = await this.prisma.event.update({ where: { id }, data: updateData });

    const notificationType = status === 'APPROVED' ? 'APPROVAL' : 'REJECTION';
    await this.prisma.notification.create({
      data: {
        userId: event.createdById,
        type: notificationType,
        title: `Event ${status.toLowerCase()}`,
        message: `Your event "${event.title}" has been ${status.toLowerCase()}.${reason ? ` Reason: ${reason}` : ''}`,
      },
    });

    return { success: true, data: updated, message: `Event ${status.toLowerCase()}` };
  }

  async softDelete(id: string, userId: string) {
    const event = await this.prisma.event.findUnique({ where: { id, deletedAt: null } });
    if (!event) throw new NotFoundException('Event not found');
    if (event.createdById !== userId) throw new ForbiddenException('Only the creator can delete');

    await this.prisma.event.update({ where: { id }, data: { deletedAt: new Date() } });
    return { success: true, message: 'Event deleted' };
  }
}
