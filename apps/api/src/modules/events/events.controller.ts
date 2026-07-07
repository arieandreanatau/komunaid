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
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuditLogInterceptor } from '../../common/interceptors/audit-log.interceptor';

@ApiTags('Events')
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  @ApiOperation({ summary: 'List events' })
  async list(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('category') category?: string,
    @Query('isOnline') isOnline?: boolean,
    @Query('sort') sort?: string,
  ) {
    return this.eventsService.list({ page, limit, search, category, isOnline, sort });
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get event by slug' })
  async getBySlug(@Param('slug') slug: string) {
    return this.eventsService.getBySlug(slug);
  }

  @Post()
  @UseGuards(AuthGuard)
  @UseInterceptors(AuditLogInterceptor)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create event' })
  async create(@CurrentUser('id') userId: string, @Body() dto: CreateEventDto) {
    return this.eventsService.create(userId, dto);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @UseInterceptors(AuditLogInterceptor)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update event' })
  async update(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateEventDto,
  ) {
    return this.eventsService.update(id, userId, dto);
  }

  @Post(':id/register')
  @UseGuards(AuthGuard)
  @UseInterceptors(AuditLogInterceptor)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Register for event' })
  async register(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.eventsService.register(id, userId);
  }

  @Post(':id/unregister')
  @UseGuards(AuthGuard)
  @UseInterceptors(AuditLogInterceptor)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Unregister from event' })
  async unregister(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.eventsService.unregister(id, userId);
  }

  @Patch(':id/status')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'PLATFORM_ADMIN')
  @UseInterceptors(AuditLogInterceptor)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: approve/reject event' })
  async updateStatus(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body('status') status: string,
    @Body('reason') reason?: string,
  ) {
    return this.eventsService.updateStatus(id, userId, status, reason);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @UseInterceptors(AuditLogInterceptor)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete event (owner)' })
  async delete(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.eventsService.softDelete(id, userId);
  }
}
