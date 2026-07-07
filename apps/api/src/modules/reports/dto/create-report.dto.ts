import { IsString, IsOptional, IsEnum, MaxLength, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateReportDto {
  @ApiProperty({ enum: ['USER', 'COMMUNITY', 'ORGANIZATION', 'EVENT', 'POST', 'COMMENT'] })
  @IsEnum(['USER', 'COMMUNITY', 'ORGANIZATION', 'EVENT', 'POST', 'COMMENT'])
  targetType: string;

  @ApiProperty()
  @IsString()
  targetId: string;

  @ApiProperty()
  @IsString()
  @MinLength(5)
  @MaxLength(200)
  reason: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;
}
