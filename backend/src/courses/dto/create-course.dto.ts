import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCourseDto {
  @ApiProperty({ example: 'B.Tech in Computer Science and Engineering' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'BTECH-CSE' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiPropertyOptional({ example: '4-year engineering program' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Department UUID' })
  @IsString()
  @IsNotEmpty()
  departmentId: string;
}

export class UpdateCourseDto {
  @ApiPropertyOptional({ example: 'B.Tech in Computer Science and Engineering' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'BTECH-CSE' })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({ example: 'Updated description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Department UUID' })
  @IsOptional()
  @IsString()
  departmentId?: string;
}
