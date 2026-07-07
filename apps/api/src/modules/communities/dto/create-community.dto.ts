import { IsString, IsOptional, IsEnum, IsInt, MaxLength, MinLength, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCommunityDto {
  @ApiProperty()
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  name: string;

  @ApiProperty()
  @IsString()
  @MinLength(10)
  description: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(300)
  shortDescription?: string;

  @ApiProperty()
  @IsString()
  category: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  location?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  website?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  contactEmail?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  contactPhone?: string;

  @ApiProperty({ enum: ['OPEN', 'REQUEST', 'INVITE_ONLY', 'CLOSED'] })
  @IsEnum(['OPEN', 'REQUEST', 'INVITE_ONLY', 'CLOSED'])
  membershipType: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Max(100000)
  maxMembers?: number;
}
