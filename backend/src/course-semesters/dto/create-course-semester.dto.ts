import { IsInt, IsUUID, IsNotEmpty, Min, Max } from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateCourseSemesterDto {
  @ApiProperty({ description: 'Course UUID' })
  @IsUUID()
  @IsNotEmpty()
  courseId: string;

  @ApiProperty({ example: 1, description: 'Semester number (1-8)' })
  @IsInt()
  @Min(1)
  @Max(8)
  @Type(() => Number)
  semesterNumber: number;

  @ApiProperty({ description: 'Subject UUID' })
  @IsUUID()
  @IsNotEmpty()
  subjectId: string;

  @ApiProperty({ description: 'Academic Year UUID' })
  @IsUUID()
  @IsNotEmpty()
  academicYearId: string;
}

export class UpdateCourseSemesterDto extends PartialType(CreateCourseSemesterDto) {}
