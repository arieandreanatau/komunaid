import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  UseInterceptors,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { RoleAssignmentDto } from './dto/role-assignment.dto';
import { AuditLogQueryDto } from './dto/audit-log-query.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuditLogInterceptor } from '../../common/interceptors/audit-log.interceptor';

@ApiTags('Admin')
@Controller('admin')
@UseGuards(AuthGuard, RolesGuard)
@Roles('SUPER_ADMIN', 'PLATFORM_ADMIN')
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard/stats')
  @ApiOperation({ summary: 'Admin: get dashboard statistics' })
  async getDashboardStats(@CurrentUser('id') userId: string) {
    return this.adminService.getDashboardStats(userId);
  }

  @Get('users')
  @ApiOperation({ summary: 'Admin: list users with management info' })
  async listUsers(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('status') status?: string,
  ) {
    return this.adminService.listUsers({ page, limit, search, status });
  }

  @Patch('users/:id/suspend')
  @UseInterceptors(AuditLogInterceptor)
  @ApiOperation({ summary: 'Admin: suspend/unsuspend user' })
  async suspendUser(
    @Param('id') id: string,
    @CurrentUser('id') adminId: string,
    @Body('suspended') suspended: boolean,
    @Body('reason') reason?: string,
  ) {
    return this.adminService.suspendUser(id, adminId, suspended, reason);
  }

  @Post('roles/assign')
  @UseInterceptors(AuditLogInterceptor)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Admin: assign role to user' })
  async assignRole(@CurrentUser('id') adminId: string, @Body() dto: RoleAssignmentDto) {
    return this.adminService.assignRole(adminId, dto);
  }

  @Get('audit-logs')
  @ApiOperation({ summary: 'Admin: get audit logs' })
  async getAuditLogs(@Query() query: AuditLogQueryDto) {
    return this.adminService.getAuditLogs(query);
  }

  @Get('settings')
  @ApiOperation({ summary: 'Admin: get platform settings' })
  async getSettings() {
    return this.adminService.getSettings();
  }

  @Patch('settings')
  @UseInterceptors(AuditLogInterceptor)
  @ApiOperation({ summary: 'Admin: update platform settings' })
  async updateSettings(@CurrentUser('id') userId: string, @Body() settings: Record<string, any>) {
    return this.adminService.updateSettings(userId, settings);
  }
}
