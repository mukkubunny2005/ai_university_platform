import { IsString, IsNotEmpty, IsInt, IsUUID, Min } from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';

export class CreateBatchDto {
  @ApiProperty({ example: '2023-2027 CSE Batch' })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  name: string;

  @ApiProperty({ example: '2023-CSE' })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim().toUpperCase())
  code: string;

  @ApiProperty({ example: 2023 })
  @IsInt()
  @Min(2000)
  @Type(() => Number)
  startYear: number;

  @ApiProperty({ example: 2027 })
  @IsInt()
  @Min(2000)
  @Type(() => Number)
  endYear: number;

  @ApiProperty({ description: 'Department UUID' })
  @IsUUID()
  @IsNotEmpty()
  departmentId: string;

  @ApiProperty({ description: 'Course UUID' })
  @IsUUID()
  @IsNotEmpty()
  courseId: string;
}

export class UpdateBatchDto extends PartialType(CreateBatchDto) {}
