import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { StudentsService } from './students.service';
import { CreateStudentDto, UpdateStudentDto } from './dto/create-student.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Students')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('students')
export class StudentsController {
  constructor(private studentsService: StudentsService) {}

  @Get()
  @Roles(Role.ADMIN, Role.FACULTY)
  @ApiOperation({ summary: 'List all students (Admin and Faculty)' })
  @ApiQuery({ name: 'departmentId', required: false })
  @ApiResponse({ status: 200, description: 'Students list fetched' })
  async findAll(@Query('departmentId') departmentId?: string) {
    return this.studentsService.findAll(departmentId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get student details by ID' })
  @ApiResponse({ status: 200, description: 'Student details fetched' })
  @ApiResponse({ status: 404, description: 'Student not found' })
  async findOne(@Param('id') id: string) {
    return this.studentsService.findOne(id);
  }

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Admin only: create a student account' })
  @ApiResponse({ status: 201, description: 'Student created' })
  @ApiResponse({ status: 403, description: 'Forbidden: Admins only' })
  async create(@Body() dto: CreateStudentDto) {
    return this.studentsService.create(dto);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Admin only: update student details' })
  @ApiResponse({ status: 200, description: 'Student updated' })
  @ApiResponse({ status: 403, description: 'Forbidden: Admins only' })
  async update(@Param('id') id: string, @Body() dto: UpdateStudentDto) {
    return this.studentsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Admin only: delete student' })
  @ApiResponse({ status: 200, description: 'Student deleted' })
  @ApiResponse({ status: 403, description: 'Forbidden: Admins only' })
  async remove(@Param('id') id: string) {
    return this.studentsService.remove(id);
  }
}
