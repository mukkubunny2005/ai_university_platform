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
import { CoursesService } from './courses.service';
import { CreateCourseDto, UpdateCourseDto } from './dto/create-course.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Courses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('courses')
export class CoursesController {
  constructor(private coursesService: CoursesService) {}

  @Get()
  @ApiOperation({ summary: 'List all courses with optional department filtering' })
  @ApiQuery({ name: 'departmentId', required: false, description: 'Filter courses by department UUID' })
  @ApiResponse({ status: 200, description: 'Courses list fetched' })
  async findAll(@Query('departmentId') departmentId?: string) {
    return this.coursesService.findAll(departmentId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get course details with subjects and department' })
  @ApiResponse({ status: 200, description: 'Course details fetched' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  async findOne(@Param('id') id: string) {
    return this.coursesService.findOne(id);
  }

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Admin only: create a new course' })
  @ApiResponse({ status: 201, description: 'Course created' })
  @ApiResponse({ status: 403, description: 'Forbidden: Admins only' })
  @ApiResponse({ status: 409, description: 'Course code already exists' })
  async create(@Body() dto: CreateCourseDto) {
    return this.coursesService.create(dto);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Admin only: update course details' })
  @ApiResponse({ status: 200, description: 'Course updated' })
  @ApiResponse({ status: 403, description: 'Forbidden: Admins only' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  async update(@Param('id') id: string, @Body() dto: UpdateCourseDto) {
    return this.coursesService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Admin only: delete course' })
  @ApiResponse({ status: 200, description: 'Course deleted' })
  @ApiResponse({ status: 400, description: 'Cannot delete course with associated subjects' })
  @ApiResponse({ status: 403, description: 'Forbidden: Admins only' })
  async remove(@Param('id') id: string) {
    return this.coursesService.remove(id);
  }
}
