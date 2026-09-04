import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateSubjectDto {
  @ApiProperty({ example: 'Data Structures and Algorithms' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'CS201' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ example: 4, description: 'Subject credit value (min 1)' })
  @IsInt()
  @Min(1)
  credits: number;

  @ApiProperty({ description: 'Course UUID' })
  @IsString()
  @IsNotEmpty()
  courseId: string;

  @ApiPropertyOptional({ description: 'Faculty UUID (optional)' })
  @IsOptional()
  @IsString()
  facultyId?: string;
}

export class UpdateSubjectDto {
  @ApiPropertyOptional({ example: 'Data Structures and Algorithms' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'CS201' })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({ example: 4 })
  @IsOptional()
  @IsInt()
  @Min(1)
  credits?: number;

  @ApiPropertyOptional({ description: 'Course UUID' })
  @IsOptional()
  @IsString()
  courseId?: string;

  @ApiPropertyOptional({ description: 'Faculty UUID (pass null or valid ID)' })
  @IsOptional()
  @IsString()
  facultyId?: string | null;
}
