import { IsString, IsEnum, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResolveReportDto {
  @ApiProperty({ enum: ['RESOLVED', 'DISMISSED'] })
  @IsEnum(['RESOLVED', 'DISMISSED'])
  status: string;

  @ApiProperty()
  @IsString()
  @MinLength(5)
  @MaxLength(2000)
  resolution: string;
}
