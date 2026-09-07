import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateSubjectDto {
  @ApiProperty({ example: 'Data Structures and Algorithms', description: 'Full title of the subject' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString({ message: 'Subject name must be a string' })
  @IsNotEmpty({ message: 'Subject name is required' })
  name: string;

  @ApiProperty({ example: 'CS201', description: 'Unique subject code' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toUpperCase() : value))
  @IsString({ message: 'Subject code must be a string' })
  @IsNotEmpty({ message: 'Subject code is required' })
  code: string;

  @ApiPropertyOptional({ example: 4, description: 'Academic credit value (defaults to 3, min 1)' })
  @IsOptional()
  @IsInt({ message: 'Credits must be an integer' })
  @Min(1, { message: 'Credits must be at least 1' })
  credits?: number;

  @ApiPropertyOptional({ example: 'Fundamental algorithms and complexity analysis', description: 'Subject curriculum overview' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;

  @ApiProperty({ example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', description: 'UUID of the parent course' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString({ message: 'Course ID must be a string' })
  @IsNotEmpty({ message: 'Course ID is required' })
  courseId: string;

  @ApiPropertyOptional({ example: 'f1e2d3c4-b5a6-7890-1234-56789abcdef0', description: 'UUID of assigned faculty (optional)' })
  @Transform(({ value }) => (typeof value === 'string' ? (value.trim() || undefined) : value))
  @IsOptional()
  @IsString({ message: 'Faculty ID must be a string' })
  facultyId?: string | null;
}

export class UpdateSubjectDto extends PartialType(CreateSubjectDto) {
  @ApiPropertyOptional({ description: 'Faculty UUID (pass null or empty string to unassign faculty)' })
  @IsOptional()
  facultyId?: string | null;
}

