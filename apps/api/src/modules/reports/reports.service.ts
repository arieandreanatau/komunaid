import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateReportDto } from './dto/create-report.dto';
import { ResolveReportDto } from './dto/resolve-report.dto';
import { calculatePagination, buildPaginatedResponse } from '@komunaid/shared';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateReportDto) {
    const report = await this.prisma.report.create({
      data: {
        ...dto,
        reporterId: userId,
        status: 'PENDING',
      },
    });

    return { success: true, data: report, message: 'Report submitted' };
  }

  async list(query: { page?: number; limit?: number; status?: string; targetType?: string }) {
    const { skip, take, page, limit } = calculatePagination(query.page, query.limit);

    const where: any = {};
    if (query.status) where.status = query.status;
    if (query.targetType) where.targetType = query.targetType;

    const [reports, total] = await Promise.all([
      this.prisma.report.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          reporter: { select: { id: true, firstName: true, lastName: true, email: true } },
          resolver: { select: { id: true, firstName: true, lastName: true } },
        },
      }),
      this.prisma.report.count({ where }),
    ]);

    return {
      success: true,
      ...buildPaginatedResponse(reports, total, page, limit),
      message: 'Reports listed',
    };
  }

  async resolve(id: string, adminId: string, dto: ResolveReportDto) {
    const report = await this.prisma.report.findUnique({ where: { id } });
    if (!report) throw new NotFoundException('Report not found');
    if (report.status !== 'PENDING') throw new ForbiddenException('Report is not pending');

    const updated = await this.prisma.report.update({
      where: { id },
      data: {
        status: dto.status,
        resolution: dto.resolution,
        resolvedAt: new Date(),
        resolvedById: adminId,
      },
    });

    if (report.reporterId) {
      await this.prisma.notification.create({
        data: {
          userId: report.reporterId,
          type: 'SYSTEM',
          title: 'Report resolved',
          message: `Your report has been ${dto.status.toLowerCase()}.${dto.resolution ? ` Note: ${dto.resolution}` : ''}`,
        },
      });
    }

    return { success: true, data: updated, message: `Report ${dto.status.toLowerCase()}` };
  }
}
