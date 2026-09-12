import { IsString, IsNotEmpty, IsInt, IsUUID, Min, Max, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';

export class CreateSectionDto {
  @ApiProperty({ example: 'A', description: 'Section name (A, B, C, D)' })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim().toUpperCase())
  name: string;

  @ApiProperty({ example: 1, description: 'Semester number (1-8)' })
  @IsInt()
  @Min(1)
  @Max(8)
  @Type(() => Number)
  semesterNumber: number;

  @ApiProperty({ description: 'Department UUID' })
  @IsUUID()
  @IsNotEmpty()
  departmentId: string;

  @ApiProperty({ description: 'Course UUID' })
  @IsUUID()
  @IsNotEmpty()
  courseId: string;

  @ApiProperty({ description: 'Academic Year UUID' })
  @IsUUID()
  @IsNotEmpty()
  academicYearId: string;

  @ApiProperty({ description: 'Batch UUID' })
  @IsUUID()
  @IsNotEmpty()
  batchId: string;

  @ApiPropertyOptional({ example: 60, description: 'Maximum student capacity' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(200)
  @Type(() => Number)
  maxCapacity?: number;
}

export class UpdateSectionDto extends PartialType(CreateSectionDto) {}
