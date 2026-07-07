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
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuditLogInterceptor } from '../../common/interceptors/audit-log.interceptor';

@ApiTags('Posts')
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get('community/:communityId/posts')
  @ApiOperation({ summary: 'List posts for a community' })
  async listByCommunity(
    @Param('communityId') communityId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
    @Query('sort') sort?: string,
  ) {
    return this.postsService.listByCommunity(communityId, { page, limit, status, sort });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get post by ID' })
  async getById(@Param('id') id: string) {
    return this.postsService.getById(id);
  }

  @Post('community/:communityId/posts')
  @UseGuards(AuthGuard)
  @UseInterceptors(AuditLogInterceptor)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create post in community' })
  async create(
    @Param('communityId') communityId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreatePostDto,
  ) {
    return this.postsService.create(communityId, userId, dto);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @UseInterceptors(AuditLogInterceptor)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update post' })
  async update(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() dto: UpdatePostDto,
  ) {
    return this.postsService.update(id, userId, dto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @UseInterceptors(AuditLogInterceptor)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete post (owner)' })
  async delete(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.postsService.softDelete(id, userId);
  }

  @Patch(':id/flag')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'PLATFORM_ADMIN')
  @UseInterceptors(AuditLogInterceptor)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: flag/unflag post' })
  async flag(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body('flagged') flagged: boolean,
    @Body('reason') reason?: string,
  ) {
    return this.postsService.flag(id, userId, flagged, reason);
  }
}
