import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  MinLength,
} from 'class-validator';

export class CreateStudentDto {
  @ApiProperty({ example: 'John Doe', description: 'Student full name' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty({ message: 'Name cannot be empty' })
  name: string;

  @ApiProperty({ example: 'john.student@aiuniversity.edu', description: 'Student institutional email' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  @IsEmail({}, { message: 'Please provide a valid institutional email' })
  email: string;

  @ApiProperty({ example: 'Student@123', description: 'Initial account password (min 6 characters)' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;

  @ApiProperty({ example: 'STU-2026-042', description: 'Unique human-readable student roll number' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toUpperCase() : value))
  @IsString()
  @IsNotEmpty({ message: 'Student ID cannot be empty' })
  studentId: string;

  @ApiProperty({ example: 'd3b07384-d113-4a0b-9343-982845c48529', description: 'Department UUID' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsUUID(undefined, { message: 'departmentId must be a valid UUID' })
  departmentId: string;

  @ApiProperty({ example: 1, description: 'Current academic semester (1-12)', default: 1 })
  @Type(() => Number)
  @IsInt({ message: 'Semester must be an integer' })
  @Min(1, { message: 'Semester must be at least 1' })
  @Max(12, { message: 'Semester cannot exceed 12' })
  semester: number;

  @ApiPropertyOptional({ description: 'Batch UUID' })
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsUUID(undefined, { message: 'batchId must be a valid UUID' })
  batchId?: string;

  @ApiPropertyOptional({ description: 'Section UUID' })
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsUUID(undefined, { message: 'sectionId must be a valid UUID' })
  sectionId?: string;
}

export class UpdateStudentDto {
  @ApiPropertyOptional({ example: 'Johnathan Doe', description: 'Updated student full name' })
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'johnathan.student@aiuniversity.edu', description: 'Updated institutional email' })
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  @IsEmail({}, { message: 'Please provide a valid institutional email' })
  email?: string;

  @ApiPropertyOptional({ example: 'STU-2026-042', description: 'Updated student roll number' })
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toUpperCase() : value))
  @IsString()
  studentId?: string;

  @ApiPropertyOptional({ example: 'd3b07384-d113-4a0b-9343-982845c48529', description: 'Updated Department UUID' })
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsUUID(undefined, { message: 'departmentId must be a valid UUID' })
  departmentId?: string;

  @ApiPropertyOptional({ example: 2, description: 'Updated academic semester (1-12)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Semester must be an integer' })
  @Min(1, { message: 'Semester must be at least 1' })
  @Max(12, { message: 'Semester cannot exceed 12' })
  semester?: number;

  @ApiPropertyOptional({ description: 'Updated Batch UUID' })
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsUUID(undefined, { message: 'batchId must be a valid UUID' })
  batchId?: string;

  @ApiPropertyOptional({ description: 'Updated Section UUID' })
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsUUID(undefined, { message: 'sectionId must be a valid UUID' })
  sectionId?: string;
}
