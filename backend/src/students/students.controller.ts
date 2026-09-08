import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { StudentsService } from './students.service';
import { CreateStudentDto, UpdateStudentDto } from './dto/create-student.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@ApiTags('Students')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('students')
export class StudentsController {
  constructor(private studentsService: StudentsService) {}

  @Get()
  @Roles(Role.ADMIN, Role.FACULTY)
  @ApiOperation({ summary: 'List all students with optional department filter (Admin and Faculty)' })
  @ApiQuery({ name: 'departmentId', required: false, description: 'Filter students by department UUID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Students list fetched successfully' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized: missing or invalid JWT' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden: Admins and Faculty only' })
  async findAll(@Query('departmentId') departmentId?: string) {
    return this.studentsService.findAll(departmentId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get student details by ID (Admin, Faculty, or Student self)' })
  @ApiParam({ name: 'id', description: 'Student UUID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Student details fetched successfully' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized: missing or invalid JWT' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden: Cannot access another student profile' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Student not found' })
  async findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.studentsService.findOne(id, user);
  }

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Admin only: create a student account and profile' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Student account created successfully' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Validation failed' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized: missing or invalid JWT' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden: Admins only' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Department not found' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Email or Student ID already exists' })
  async create(@Body() dto: CreateStudentDto) {
    return this.studentsService.create(dto);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Admin only: update student details' })
  @ApiParam({ name: 'id', description: 'Student UUID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Student updated successfully' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Validation failed' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized: missing or invalid JWT' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden: Admins only' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Student or Department not found' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Email or Student ID conflict' })
  async update(@Param('id') id: string, @Body() dto: UpdateStudentDto) {
    return this.studentsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Admin only: delete student account' })
  @ApiParam({ name: 'id', description: 'Student UUID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Student deleted successfully' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized: missing or invalid JWT' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden: Admins only' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Student not found' })
  async remove(@Param('id') id: string) {
    return this.studentsService.remove(id);
  }
}
