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
import { CommunitiesService } from './communities.service';
import { CreateCommunityDto } from './dto/create-community.dto';
import { UpdateCommunityDto } from './dto/update-community.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuditLogInterceptor } from '../../common/interceptors/audit-log.interceptor';

@ApiTags('Communities')
@Controller('communities')
export class CommunitiesController {
  constructor(private readonly communitiesService: CommunitiesService) {}

  @Get()
  @ApiOperation({ summary: 'List communities' })
  async list(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('category') category?: string,
    @Query('location') location?: string,
    @Query('sort') sort?: string,
  ) {
    return this.communitiesService.list({ page, limit, search, category, location, sort });
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get community by slug' })
  async getBySlug(@Param('slug') slug: string) {
    return this.communitiesService.getBySlug(slug);
  }

  @Post()
  @UseGuards(AuthGuard)
  @UseInterceptors(AuditLogInterceptor)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create community' })
  async create(@CurrentUser('id') userId: string, @Body() dto: CreateCommunityDto) {
    return this.communitiesService.create(userId, dto);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @UseInterceptors(AuditLogInterceptor)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update community' })
  async update(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateCommunityDto,
  ) {
    return this.communitiesService.update(id, userId, dto);
  }

  @Post(':id/join')
  @UseGuards(AuthGuard)
  @UseInterceptors(AuditLogInterceptor)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Join community' })
  async join(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.communitiesService.join(id, userId);
  }

  @Post(':id/leave')
  @UseGuards(AuthGuard)
  @UseInterceptors(AuditLogInterceptor)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Leave community' })
  async leave(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.communitiesService.leave(id, userId);
  }

  @Post(':id/members/:memberId/approve')
  @UseGuards(AuthGuard)
  @UseInterceptors(AuditLogInterceptor)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Owner: approve member' })
  async approveMember(
    @Param('id') id: string,
    @Param('memberId') memberId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.communitiesService.approveMember(id, memberId, userId);
  }

  @Post(':id/members/:memberId/reject')
  @UseGuards(AuthGuard)
  @UseInterceptors(AuditLogInterceptor)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Owner: reject member' })
  async rejectMember(
    @Param('id') id: string,
    @Param('memberId') memberId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.communitiesService.rejectMember(id, memberId, userId);
  }

  @Patch(':id/status')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'PLATFORM_ADMIN')
  @UseInterceptors(AuditLogInterceptor)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: approve/reject/suspend community' })
  async updateStatus(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body('status') status: string,
    @Body('reason') reason?: string,
  ) {
    return this.communitiesService.updateStatus(id, userId, status, reason);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @UseInterceptors(AuditLogInterceptor)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete community (owner)' })
  async delete(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.communitiesService.softDelete(id, userId);
  }
}
