import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { calculatePagination, buildPaginatedResponse, generateSlug } from '@komunaid/shared';

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService) {}

  async listByCommunity(
    communityId: string,
    query: { page?: number; limit?: number; status?: string; sort?: string },
  ) {
    const { skip, take, page, limit } = calculatePagination(query.page, query.limit);

    const where: any = { communityId, deletedAt: null };
    if (query.status) where.status = query.status;
    else where.status = 'PUBLISHED';

    const orderBy: any = (() => {
      switch (query.sort) {
        case 'oldest':
          return { createdAt: 'asc' } as const;
        case 'likes':
          return { likes: { _count: 'desc' } } as const;
        case 'comments':
          return { comments: { _count: 'desc' } } as const;
        default:
          return { createdAt: 'desc' } as const;
      }
    })();

    const [posts, total] = await Promise.all([
      this.prisma.post.findMany({
        where,
        skip,
        take,
        orderBy,
        include: {
          author: {
            select: { id: true, firstName: true, lastName: true, avatar: true, username: true },
          },
          community: { select: { id: true, name: true, slug: true } },
        },
      }),
      this.prisma.post.count({ where }),
    ]);

    return {
      success: true,
      ...buildPaginatedResponse(posts, total, page, limit),
      message: 'Posts listed',
    };
  }

  async getById(id: string) {
    const post = await this.prisma.post.findUnique({
      where: { id, deletedAt: null },
      include: {
        author: {
          select: { id: true, firstName: true, lastName: true, avatar: true, username: true },
        },
        community: { select: { id: true, name: true, slug: true } },
      },
    });
    if (!post) throw new NotFoundException('Post not found');
    return { success: true, data: post, message: 'Post fetched' };
  }

  async create(communityId: string, userId: string, dto: CreatePostDto) {
    const community = await this.prisma.community.findUnique({
      where: { id: communityId, deletedAt: null },
    });
    if (!community) throw new NotFoundException('Community not found');

    const post = await this.prisma.post.create({
      data: {
        ...dto,
        slug: generateSlug(dto.title),
        communityId,
        authorId: userId,
        status: dto.status || 'DRAFT',
      },
    });

    return { success: true, data: post, message: 'Post created' };
  }

  async update(id: string, userId: string, dto: UpdatePostDto) {
    const post = await this.prisma.post.findUnique({ where: { id, deletedAt: null } });
    if (!post) throw new NotFoundException('Post not found');
    if (post.authorId !== userId)
      throw new ForbiddenException('Only the author can update this post');

    const updated = await this.prisma.post.update({ where: { id }, data: dto });
    return { success: true, data: updated, message: 'Post updated' };
  }

  async softDelete(id: string, userId: string) {
    const post = await this.prisma.post.findUnique({ where: { id, deletedAt: null } });
    if (!post) throw new NotFoundException('Post not found');
    if (post.authorId !== userId)
      throw new ForbiddenException('Only the author can delete this post');

    await this.prisma.post.update({ where: { id }, data: { deletedAt: new Date() } });
    return { success: true, message: 'Post deleted' };
  }

  async flag(id: string, adminId: string, flagged: boolean, reason?: string) {
    const post = await this.prisma.post.findUnique({ where: { id } });
    if (!post) throw new NotFoundException('Post not found');

    const updated = await this.prisma.post.update({
      where: { id },
      data: {
        status: flagged ? 'FLAGGED' : 'PUBLISHED',
      },
    });

    if (flagged) {
      await this.prisma.notification.create({
        data: {
          userId: post.authorId,
          type: 'WARNING',
          title: 'Post flagged',
          message: `Your post has been flagged by an administrator.${reason ? ` Reason: ${reason}` : ''}`,
        },
      });
    }

    return { success: true, data: updated, message: flagged ? 'Post flagged' : 'Post unflagged' };
  }
}
