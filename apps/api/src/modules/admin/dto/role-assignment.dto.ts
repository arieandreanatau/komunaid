import { IsString, IsOptional, IsUUID, MinLength, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RoleAssignmentDto {
  @ApiProperty()
  @IsUUID()
  userId: string;

  @ApiProperty()
  @IsString()
  @MinLength(2)
  roleName: string;

  @ApiPropertyOptional({ enum: ['COMMUNITY', 'ORGANIZATION', 'PLATFORM'] })
  @IsOptional()
  @IsIn(['COMMUNITY', 'ORGANIZATION', 'PLATFORM'])
  scope?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  scopeId?: string;
}
