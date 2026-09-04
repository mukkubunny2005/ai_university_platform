import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';

export class CreateDepartmentDto {
  @ApiProperty({ example: 'Computer Science & Engineering' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'CSE' })
  @IsString()
  @IsNotEmpty()
  @Length(2, 10)
  code: string;

  @ApiPropertyOptional({ example: 'Department focusing on computer science systems and software' })
  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateDepartmentDto {
  @ApiPropertyOptional({ example: 'Computer Science & Engineering' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'CSE' })
  @IsOptional()
  @IsString()
  @Length(2, 10)
  code?: string;

  @ApiPropertyOptional({ example: 'Updated department description' })
  @IsOptional()
  @IsString()
  description?: string;
}
