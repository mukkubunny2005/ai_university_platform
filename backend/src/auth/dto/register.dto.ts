import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import {
  IsEmail,
  IsEnum,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'Jane Doe', description: 'Full name of the user' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  name: string;

  @ApiProperty({ example: 'jane.doe@aiuniversity.edu', description: 'Institutional email address' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Secret@123', description: 'Password (min 6 characters)' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'Secret@123', description: 'Password confirmation' })
  @IsString()
  @MinLength(6)
  confirmPassword: string;

  @ApiProperty({
    enum: [Role.STUDENT, Role.FACULTY],
    example: Role.STUDENT,
    description: 'Account role (STUDENT or FACULTY only. ADMIN cannot be registered publicly)',
  })
  @IsEnum(Role)
  @IsIn([Role.STUDENT, Role.FACULTY], {
    message: 'Public registration allows only STUDENT or FACULTY roles',
  })
  role: Role;

  @ApiPropertyOptional({ example: 'STU-2026-101', description: 'Student ID (if role is STUDENT)' })
  @IsOptional()
  @IsString()
  studentId?: string;

  @ApiPropertyOptional({ example: 'FAC-2026-101', description: 'Faculty ID (if role is FACULTY)' })
  @IsOptional()
  @IsString()
  facultyId?: string;

  @ApiProperty({
    example: 'c14e81e4-07fc-478e-8747-c0127a42a8bc',
    description: 'Academic Department UUID',
  })
  @IsNotEmpty({ message: 'Please select an academic department' })
  @IsUUID(undefined, { message: 'departmentId must be a valid Department UUID' })
  departmentId: string;

  @ApiPropertyOptional({ example: 1, description: 'Current semester (for students)' })
  @IsOptional()
  @IsInt()
  @Min(1)
  semester?: number;

  @ApiPropertyOptional({ example: 'Assistant Professor', description: 'Designation (for faculty)' })
  @IsOptional()
  @IsString()
  designation?: string;
}
