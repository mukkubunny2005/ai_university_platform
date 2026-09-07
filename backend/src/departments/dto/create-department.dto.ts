import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';

export class CreateDepartmentDto {
  @ApiProperty({ example: 'Computer Science and Engineering', description: 'Full formal name of the academic department' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString({ message: 'Department name must be a string' })
  @IsNotEmpty({ message: 'Department name is required' })
  name: string;

  @ApiProperty({ example: 'CSE', description: 'Unique code identifier for the department (2-10 characters)' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toUpperCase() : value))
  @IsString({ message: 'Department code must be a string' })
  @IsNotEmpty({ message: 'Department code is required' })
  @Length(2, 10, { message: 'Department code must be between 2 and 10 characters' })
  code: string;

  @ApiPropertyOptional({ example: 'Department of Computer Science and Engineering', description: 'Optional description of departmental curriculum and objectives' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsOptional()
  @IsString({ message: 'Department description must be a string' })
  description?: string;
}

export class UpdateDepartmentDto extends PartialType(CreateDepartmentDto) {}
