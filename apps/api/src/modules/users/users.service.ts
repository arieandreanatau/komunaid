import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { calculatePagination, buildPaginatedResponse } from '@komunaid/shared';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId, deletedAt: null },
      include: {
        roles: {
          include: { role: true },
          where: { scopeId: null },
        },
        communityMemberships: {
          include: { community: { select: { id: true, name: true, slug: true, logo: true } } },
          where: { status: 'ACTIVE' },
        },
      },
    });

    if (!user) throw new NotFoundException('User not found');

    const { passwordHash, ...profile } = user as any;
    return { success: true, data: profile, message: 'Profile fetched' };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId, deletedAt: null },
    });

    if (!user) throw new NotFoundException('User not found');

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: dto,
    });

    const { passwordHash, ...profile } = updated as any;
    return { success: true, data: profile, message: 'Profile updated' };
  }

  async getUserById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id, deletedAt: null },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        username: true,
        avatar: true,
        bio: true,
        location: true,
        createdAt: true,
      },
    });

    if (!user) throw new NotFoundException('User not found');
    return { success: true, data: user, message: 'User fetched' };
  }

  async listUsers(query: { page?: number; limit?: number; search?: string }) {
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
}
