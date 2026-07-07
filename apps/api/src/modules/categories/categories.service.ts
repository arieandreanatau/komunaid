import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { generateSlug } from '@komunaid/shared';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async list(type?: string) {
    const where: any = { deletedAt: null };
    if (type) where.type = type;

    const categories = await this.prisma.category.findMany({
      where,
      orderBy: { name: 'asc' },
      include: {
        children: { where: {}, orderBy: { name: 'asc' } },
        parent: true,
        _count: { select: { children: true } },
      },
    });

    return { success: true, data: categories, message: 'Categories listed' };
  }

  async create(dto: CreateCategoryDto) {
    const slug = generateSlug(dto.name);
    const existing = await this.prisma.category.findFirst({ where: { slug } });
    if (existing) throw new ConflictException('Category with this name already exists');

    if (dto.parentId) {
      const parent = await this.prisma.category.findUnique({ where: { id: dto.parentId } });
      if (!parent) throw new NotFoundException('Parent category not found');
    }

    const category = await this.prisma.category.create({
      data: {
        ...dto,
        slug,
      },
    });

    return { success: true, data: category, message: 'Category created' };
  }

  async update(id: string, dto: UpdateCategoryDto) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) throw new NotFoundException('Category not found');

    const updateData: any = { ...dto };
    if (dto.name) {
      updateData.slug = generateSlug(dto.name);
    }

    if (dto.parentId && dto.parentId === id) {
      throw new ConflictException('Category cannot be its own parent');
    }

    const updated = await this.prisma.category.update({ where: { id }, data: updateData });
    return { success: true, data: updated, message: 'Category updated' };
  }

  async softDelete(id: string) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) throw new NotFoundException('Category not found');

    const children = await this.prisma.category.count({ where: { parentId: id } });
    if (children > 0)
      throw new ConflictException(
        'Cannot delete category with children. Reassign or delete children first.',
      );

    await this.prisma.category.update({ where: { id }, data: { isActive: false } });
    return { success: true, message: 'Category deleted' };
  }
}
