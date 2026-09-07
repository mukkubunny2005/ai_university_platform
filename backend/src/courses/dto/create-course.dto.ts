import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCourseDto {
  @ApiProperty({
    example: 'B.Tech in Computer Science and Engineering',
    description: 'Full name of the academic degree or program',
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString({ message: 'Course name must be a string' })
  @IsNotEmpty({ message: 'Course name is required' })
  name: string;

  @ApiProperty({
    example: 'BTECH-CSE',
    description: 'Unique uppercase course code identifier',
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toUpperCase() : value))
  @IsString({ message: 'Course code must be a string' })
  @IsNotEmpty({ message: 'Course code is required' })
  code: string;

  @ApiPropertyOptional({
    example: '4-year undergraduate engineering program',
    description: 'Optional overview and objectives of the degree program',
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsOptional()
  @IsString({ message: 'Course description must be a string' })
  description?: string;

  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    description: 'UUID of the department offering this course',
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString({ message: 'Department ID must be a string' })
  @IsNotEmpty({ message: 'Department ID is required' })
  departmentId: string;
}

export class UpdateCourseDto extends PartialType(CreateCourseDto) {}

