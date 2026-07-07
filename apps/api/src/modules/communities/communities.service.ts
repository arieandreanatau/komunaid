import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateCommunityDto } from './dto/create-community.dto';
import { UpdateCommunityDto } from './dto/update-community.dto';
import { generateSlug, calculatePagination, buildPaginatedResponse } from '@komunaid/shared';

@Injectable()
export class CommunitiesService {
  constructor(private prisma: PrismaService) {}

  async list(query: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
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
    if (query.category) where.category = query.category;
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

    const [communities, total] = await Promise.all([
      this.prisma.community.findMany({
        where,
        skip,
        take,
        orderBy,
        include: {
          owner: { select: { id: true, firstName: true, lastName: true, avatar: true } },
          _count: { select: { members: true, posts: true, events: true } },
        },
      }),
      this.prisma.community.count({ where }),
    ]);

    return {
      success: true,
      ...buildPaginatedResponse(communities, total, page, limit),
      message: 'Communities listed',
    };
  }

  async getBySlug(slug: string) {
    const community = await this.prisma.community.findUnique({
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
        _count: { select: { members: true, posts: true, events: true } },
      },
    });
    if (!community) throw new NotFoundException('Community not found');
    return { success: true, data: community, message: 'Community fetched' };
  }

  async create(userId: string, dto: CreateCommunityDto) {
    const slug = generateSlug(dto.name);
    const existing = await this.prisma.community.findUnique({ where: { slug } });
    if (existing) throw new ConflictException('Community with this name already exists');

    const community = await this.prisma.community.create({
      data: {
        ...dto,
        slug,
        ownerId: userId,
        status: 'PENDING',
      },
    });

    await this.prisma.communityMember.create({
      data: { communityId: community.id, userId, role: 'OWNER' },
    });

    return { success: true, data: community, message: 'Community created, pending approval' };
  }

  async update(id: string, userId: string, dto: UpdateCommunityDto) {
    const community = await this.prisma.community.findUnique({ where: { id, deletedAt: null } });
    if (!community) throw new NotFoundException('Community not found');
    if (community.ownerId !== userId)
      throw new ForbiddenException('Only the owner can update this community');

    const updated = await this.prisma.community.update({ where: { id }, data: dto });
    return { success: true, data: updated, message: 'Community updated' };
  }

  async join(communityId: string, userId: string) {
    const community = await this.prisma.community.findUnique({
      where: { id: communityId, deletedAt: null },
    });
    if (!community) throw new NotFoundException('Community not found');
    if (community.status !== 'APPROVED') throw new BadRequestException('Community is not active');
    if (community.membershipType === 'CLOSED') throw new ForbiddenException('Community is closed');

    const existing = await this.prisma.communityMember.findUnique({
      where: { communityId_userId: { communityId, userId } },
    });
    if (existing) {
      if (existing.status === 'BANNED')
        throw new ForbiddenException('You are banned from this community');
      throw new ConflictException('Already a member or pending');
    }

    if (community.maxMembers) {
      const activeCount = await this.prisma.communityMember.count({
        where: { communityId, status: 'ACTIVE' },
      });
      if (activeCount >= community.maxMembers) {
        throw new BadRequestException('Community has reached maximum member capacity');
      }
    }

    const memberStatus = community.membershipType === 'REQUEST' ? 'INACTIVE' : 'ACTIVE';

    const member = await this.prisma.communityMember.create({
      data: { communityId, userId, role: 'MEMBER', status: memberStatus },
    });

    const message =
      memberStatus === 'INACTIVE'
        ? 'Join request submitted, pending owner approval'
        : 'Joined community';

    if (memberStatus === 'INACTIVE') {
      await this.prisma.notification.create({
        data: {
          userId: community.ownerId,
          type: 'COMMUNITY',
          title: 'New join request',
          message: `A member has requested to join "${community.name}". Please approve or reject.`,
        },
      });
    }

    return { success: true, data: member, message };
  }

  async approveMember(communityId: string, memberId: string, ownerId: string) {
    const community = await this.prisma.community.findUnique({
      where: { id: communityId, deletedAt: null },
    });
    if (!community) throw new NotFoundException('Community not found');
    if (community.ownerId !== ownerId)
      throw new ForbiddenException('Only the owner can approve members');

    const member = await this.prisma.communityMember.findUnique({
      where: { communityId_userId: { communityId, userId: memberId } },
    });
    if (!member) throw new NotFoundException('Member not found');
    if (member.status !== 'INACTIVE')
      throw new BadRequestException('Member is not pending approval');

    const updated = await this.prisma.communityMember.update({
      where: { communityId_userId: { communityId, userId: memberId } },
      data: { status: 'ACTIVE' },
    });

    await this.prisma.notification.create({
      data: {
        userId: memberId,
        type: 'COMMUNITY',
        title: 'Join request approved',
        message: `Your request to join "${community.name}" has been approved.`,
      },
    });

    return { success: true, data: updated, message: 'Member approved' };
  }

  async rejectMember(communityId: string, memberId: string, ownerId: string) {
    const community = await this.prisma.community.findUnique({
      where: { id: communityId, deletedAt: null },
    });
    if (!community) throw new NotFoundException('Community not found');
    if (community.ownerId !== ownerId)
      throw new ForbiddenException('Only the owner can reject members');

    const member = await this.prisma.communityMember.findUnique({
      where: { communityId_userId: { communityId, userId: memberId } },
    });
    if (!member) throw new NotFoundException('Member not found');
    if (member.status !== 'INACTIVE')
      throw new BadRequestException('Member is not pending approval');

    await this.prisma.communityMember.delete({
      where: { communityId_userId: { communityId, userId: memberId } },
    });

    return { success: true, message: 'Member rejected' };
  }

  async leave(communityId: string, userId: string) {
    const member = await this.prisma.communityMember.findUnique({
      where: { communityId_userId: { communityId, userId } },
    });
    if (!member) throw new NotFoundException('Not a member');
    if (member.role === 'OWNER')
      throw new ForbiddenException('Owner cannot leave. Transfer ownership first.');

    await this.prisma.communityMember.delete({
      where: { communityId_userId: { communityId, userId } },
    });

    return { success: true, message: 'Left community' };
  }

  async updateStatus(id: string, adminId: string, status: string, reason?: string) {
    const allowedStatuses = ['APPROVED', 'REJECTED', 'SUSPENDED'];
    if (!allowedStatuses.includes(status)) {
      throw new BadRequestException(`Invalid status. Allowed: ${allowedStatuses.join(', ')}`);
    }

    const community = await this.prisma.community.findUnique({ where: { id } });
    if (!community) throw new NotFoundException('Community not found');

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

    const updated = await this.prisma.community.update({ where: { id }, data: updateData });

    const notificationTypeMap: Record<string, string> = {
      APPROVED: 'APPROVAL',
      REJECTED: 'REJECTION',
      SUSPENDED: 'MODERATION',
    };

    await this.prisma.notification.create({
      data: {
        userId: community.ownerId,
        type: notificationTypeMap[status],
        title: `Community ${status.toLowerCase()}`,
        message: `Your community "${community.name}" has been ${status.toLowerCase()}.${reason ? ` Reason: ${reason}` : ''}`,
      },
    });

    return { success: true, data: updated, message: `Community ${status.toLowerCase()}` };
  }

  async softDelete(id: string, userId: string) {
    const community = await this.prisma.community.findUnique({ where: { id, deletedAt: null } });
    if (!community) throw new NotFoundException('Community not found');
    if (community.ownerId !== userId) throw new ForbiddenException('Only the owner can delete');

    await this.prisma.community.update({ where: { id }, data: { deletedAt: new Date() } });
    return { success: true, message: 'Community deleted' };
  }
}
