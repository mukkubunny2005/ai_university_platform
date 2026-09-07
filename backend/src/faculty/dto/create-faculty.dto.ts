import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateFacultyDto {
  @ApiProperty({ example: 'Dr. Alan Turing', description: 'Full name of the faculty member' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @ApiProperty({ example: 'alan.turing@aiuniversity.edu', description: 'Institutional email address' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  @IsEmail({}, { message: 'Invalid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiProperty({ example: 'Faculty@123', description: 'Initial account password (min 6 characters)' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString({ message: 'Password must be a string' })
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password: string;

  @ApiProperty({ example: 'FAC-CSE-001', description: 'Unique institutional faculty employee ID' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toUpperCase() : value))
  @IsString({ message: 'Faculty ID must be a string' })
  @IsNotEmpty({ message: 'Faculty ID is required' })
  facultyId: string;

  @ApiProperty({ example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', description: 'Department UUID' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString({ message: 'Department ID must be a string' })
  @IsNotEmpty({ message: 'Department ID is required' })
  departmentId: string;

  @ApiProperty({ example: 'Professor & Department Chair', description: 'Academic position/title' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString({ message: 'Designation must be a string' })
  @IsNotEmpty({ message: 'Designation is required' })
  designation: string;
}

export class UpdateFacultyDto {
  @ApiPropertyOptional({ example: 'Dr. Alan M. Turing', description: 'Updated full name' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsOptional()
  @IsString({ message: 'Name must be a string' })
  name?: string;

  @ApiPropertyOptional({ example: 'alan.turing.updated@aiuniversity.edu', description: 'Updated institutional email' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  @IsOptional()
  @IsEmail({}, { message: 'Invalid email address' })
  email?: string;

  @ApiPropertyOptional({ example: 'FAC-CSE-001', description: 'Updated institutional faculty employee ID' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toUpperCase() : value))
  @IsOptional()
  @IsString({ message: 'Faculty ID must be a string' })
  facultyId?: string;

  @ApiPropertyOptional({ description: 'Department UUID' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsOptional()
  @IsString({ message: 'Department ID must be a string' })
  departmentId?: string;

  @ApiPropertyOptional({ example: 'Distinguished Professor', description: 'Updated academic position/title' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsOptional()
  @IsString({ message: 'Designation must be a string' })
  designation?: string;
}

