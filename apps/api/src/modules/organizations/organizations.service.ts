import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { generateSlug, calculatePagination, buildPaginatedResponse } from '@komunaid/shared';

@Injectable()
export class OrganizationsService {
  constructor(private prisma: PrismaService) {}

  async list(query: {
    page?: number;
    limit?: number;
    search?: string;
    industry?: string;
    location?: string;
    sort?: string;
  }) {
    const { skip, take, page, limit } = calculatePagination(query.page, query.limit);

    const where: any = { deletedAt: null, status: 'APPROVED' };
    if (query.search) {
      where.OR = [
        { name: { contains: query.search } },
        { description: { contains: query.search } },
      ];
    }
    if (query.industry) where.industry = query.industry;
    if (query.location) where.location = { contains: query.location };

    const orderBy: any = (() => {
      switch (query.sort) {
        case 'oldest':
          return { createdAt: 'asc' } as const;
        case 'name':
          return { name: 'asc' } as const;
        case 'members':
          return { members: { _count: 'desc' } } as const;
        default:
          return { createdAt: 'desc' } as const;
      }
    })();

    const [organizations, total] = await Promise.all([
      this.prisma.organization.findMany({
        where,
        skip,
        take,
        orderBy,
        include: {
          owner: { select: { id: true, firstName: true, lastName: true, avatar: true } },
          _count: { select: { members: true } },
        },
      }),
      this.prisma.organization.count({ where }),
    ]);

    return {
      success: true,
      ...buildPaginatedResponse(organizations, total, page, limit),
      message: 'Organizations listed',
    };
  }

  async getBySlug(slug: string) {
    const organization = await this.prisma.organization.findUnique({
      where: { slug, deletedAt: null },
      include: {
        owner: {
          select: { id: true, firstName: true, lastName: true, avatar: true, username: true },
        },
        members: {
          where: { status: 'ACTIVE' },
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true, avatar: true, username: true },
            },
          },
          take: 10,
        },
        _count: { select: { members: true, events: true } },
      },
    });
    if (!organization) throw new NotFoundException('Organization not found');
    return { success: true, data: organization, message: 'Organization fetched' };
  }

  async create(userId: string, dto: CreateOrganizationDto) {
    const slug = generateSlug(dto.name);
    const existing = await this.prisma.organization.findUnique({ where: { slug } });
    if (existing) throw new ConflictException('Organization with this name already exists');

    const organization = await this.prisma.organization.create({
      data: {
        ...dto,
        size: dto.size != null ? String(dto.size) : undefined,
        slug,
        ownerId: userId,
        status: 'PENDING',
      },
    });

    await this.prisma.organizationMember.create({
      data: { organizationId: organization.id, userId, role: 'OWNER' },
    });

    return { success: true, data: organization, message: 'Organization created, pending approval' };
  }

  async update(id: string, userId: string, dto: UpdateOrganizationDto) {
    const organization = await this.prisma.organization.findUnique({
      where: { id, deletedAt: null },
    });
    if (!organization) throw new NotFoundException('Organization not found');
    if (organization.ownerId !== userId)
      throw new ForbiddenException('Only the owner can update this organization');

    const updateData: any = { ...dto };
    if (dto.size != null) updateData.size = String(dto.size);
    const updated = await this.prisma.organization.update({ where: { id }, data: updateData });
    return { success: true, data: updated, message: 'Organization updated' };
  }

  async join(organizationId: string, userId: string) {
    const organization = await this.prisma.organization.findUnique({
      where: { id: organizationId, deletedAt: null },
    });
    if (!organization) throw new NotFoundException('Organization not found');
    if (organization.status !== 'APPROVED')
      throw new BadRequestException('Organization is not active');

    const existing = await this.prisma.organizationMember.findUnique({
      where: { organizationId_userId: { organizationId, userId } },
    });
    if (existing) throw new ConflictException('Already a member');

    const member = await this.prisma.organizationMember.create({
      data: { organizationId, userId, role: 'MEMBER' },
    });

    return { success: true, data: member, message: 'Joined organization' };
  }

  async leave(organizationId: string, userId: string) {
    const member = await this.prisma.organizationMember.findUnique({
      where: { organizationId_userId: { organizationId, userId } },
    });
    if (!member) throw new NotFoundException('Not a member');
    if (member.role === 'OWNER')
      throw new ForbiddenException('Owner cannot leave. Transfer ownership first.');

    await this.prisma.organizationMember.delete({
      where: { organizationId_userId: { organizationId, userId } },
    });

    return { success: true, message: 'Left organization' };
  }

  async updateStatus(id: string, adminId: string, status: string, reason?: string) {
    const allowedStatuses = ['APPROVED', 'REJECTED', 'SUSPENDED'];
    if (!allowedStatuses.includes(status)) {
      throw new BadRequestException(`Invalid status. Allowed: ${allowedStatuses.join(', ')}`);
    }

    const organization = await this.prisma.organization.findUnique({ where: { id } });
    if (!organization) throw new NotFoundException('Organization not found');

    const updateData: any = { status };
    if (status === 'APPROVED') {
      updateData.approvedAt = new Date();
      updateData.approvedById = adminId;
    } else if (status === 'REJECTED') {
      updateData.statusReason = reason;
      updateData.rejectedAt = new Date();
      updateData.rejectedById = adminId;
    } else if (status === 'SUSPENDED') {
      updateData.statusReason = reason;
      updateData.suspendedAt = new Date();
      updateData.suspendedReason = reason;
    }

    const updated = await this.prisma.organization.update({ where: { id }, data: updateData });

    const notificationTypeMap: Record<string, string> = {
      APPROVED: 'APPROVAL',
      REJECTED: 'REJECTION',
      SUSPENDED: 'MODERATION',
    };

    await this.prisma.notification.create({
      data: {
        userId: organization.ownerId,
        type: notificationTypeMap[status],
        title: `Organization ${status.toLowerCase()}`,
        message: `Your organization "${organization.name}" has been ${status.toLowerCase()}.${reason ? ` Reason: ${reason}` : ''}`,
      },
    });

    return { success: true, data: updated, message: `Organization ${status.toLowerCase()}` };
  }

  async softDelete(id: string, userId: string) {
    const organization = await this.prisma.organization.findUnique({
      where: { id, deletedAt: null },
    });
    if (!organization) throw new NotFoundException('Organization not found');
    if (organization.ownerId !== userId) throw new ForbiddenException('Only the owner can delete');

    await this.prisma.organization.update({ where: { id }, data: { deletedAt: new Date() } });
    return { success: true, message: 'Organization deleted' };
  }
}
