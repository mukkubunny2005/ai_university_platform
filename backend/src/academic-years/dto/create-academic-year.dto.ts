import { IsString, IsNotEmpty, IsDateString, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType, OmitType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CreateAcademicYearDto {
  @ApiProperty({ example: '2025-2026', description: 'Unique academic year code' })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  code: string;

  @ApiProperty({ example: 'Academic Year 2025-2026' })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  name: string;

  @ApiProperty({ example: '2025-06-01T00:00:00.000Z' })
  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @ApiProperty({ example: '2026-05-31T00:00:00.000Z' })
  @IsDateString()
  @IsNotEmpty()
  endDate: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateAcademicYearDto extends PartialType(CreateAcademicYearDto) {}
