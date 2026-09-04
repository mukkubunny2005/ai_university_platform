import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateFacultyDto {
  @ApiProperty({ example: 'Dr. Alan Turing' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'alan.turing@aiuniversity.edu' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Faculty@123' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'FAC-CSE-001' })
  @IsString()
  @IsNotEmpty()
  facultyId: string;

  @ApiProperty({ description: 'Department UUID' })
  @IsString()
  @IsNotEmpty()
  departmentId: string;

  @ApiProperty({ example: 'Professor & Department Chair' })
  @IsString()
  @IsNotEmpty()
  designation: string;
}

export class UpdateFacultyDto {
  @ApiPropertyOptional({ example: 'Dr. Alan M. Turing' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'FAC-CSE-001' })
  @IsOptional()
  @IsString()
  facultyId?: string;

  @ApiPropertyOptional({ description: 'Department UUID' })
  @IsOptional()
  @IsString()
  departmentId?: string;

  @ApiPropertyOptional({ example: 'Distinguished Professor' })
  @IsOptional()
  @IsString()
  designation?: string;
}
