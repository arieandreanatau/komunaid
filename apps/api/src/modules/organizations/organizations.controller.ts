import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  UseInterceptors,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuditLogInterceptor } from '../../common/interceptors/audit-log.interceptor';

@ApiTags('Organizations')
@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Get()
  @ApiOperation({ summary: 'List organizations' })
  async list(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('industry') industry?: string,
    @Query('location') location?: string,
    @Query('sort') sort?: string,
  ) {
    return this.organizationsService.list({ page, limit, search, industry, location, sort });
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get organization by slug' })
  async getBySlug(@Param('slug') slug: string) {
    return this.organizationsService.getBySlug(slug);
  }

  @Post()
  @UseGuards(AuthGuard)
  @UseInterceptors(AuditLogInterceptor)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create organization' })
  async create(@CurrentUser('id') userId: string, @Body() dto: CreateOrganizationDto) {
    return this.organizationsService.create(userId, dto);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @UseInterceptors(AuditLogInterceptor)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update organization' })
  async update(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateOrganizationDto,
  ) {
    return this.organizationsService.update(id, userId, dto);
  }

  @Post(':id/join')
  @UseGuards(AuthGuard)
  @UseInterceptors(AuditLogInterceptor)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Join organization' })
  async join(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.organizationsService.join(id, userId);
  }

  @Post(':id/leave')
  @UseGuards(AuthGuard)
  @UseInterceptors(AuditLogInterceptor)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Leave organization' })
  async leave(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.organizationsService.leave(id, userId);
  }

  @Patch(':id/status')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'PLATFORM_ADMIN')
  @UseInterceptors(AuditLogInterceptor)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: approve/reject organization' })
  async updateStatus(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body('status') status: string,
    @Body('reason') reason?: string,
  ) {
    return this.organizationsService.updateStatus(id, userId, status, reason);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @UseInterceptors(AuditLogInterceptor)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete organization (owner)' })
  async delete(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.organizationsService.softDelete(id, userId);
  }
}
