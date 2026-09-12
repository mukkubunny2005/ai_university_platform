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
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CourseSemestersService } from './course-semesters.service';
import {
  CreateCourseSemesterDto,
  UpdateCourseSemesterDto,
} from './dto/create-course-semester.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Course Semesters')
@ApiBearerAuth('bearer')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('course-semesters')
export class CourseSemestersController {
  constructor(private readonly courseSemestersService: CourseSemestersService) {}

  @Get()
  @ApiOperation({
    summary: 'List all course-semester mappings with optional filters',
  })
  @ApiQuery({
    name: 'courseId',
    required: false,
    description: 'Filter by Course UUID',
  })
  @ApiQuery({
    name: 'academicYearId',
    required: false,
    description: 'Filter by Academic Year UUID',
  })
  @ApiQuery({
    name: 'semesterNumber',
    required: false,
    description: 'Filter by Semester Number (1-8)',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Course semester mappings fetched successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(
    @Query('courseId') courseId?: string,
    @Query('academicYearId') academicYearId?: string,
    @Query('semesterNumber') semesterNumber?: string,
  ) {
    return this.courseSemestersService.findAll({
      courseId,
      academicYearId,
      semesterNumber: semesterNumber ? parseInt(semesterNumber, 10) : undefined,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get course-semester mapping details by ID' })
  @ApiParam({ name: 'id', description: 'Course semester mapping UUID' })
  @ApiResponse({
    status: 200,
    description: 'Course semester mapping details fetched successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Course semester mapping not found' })
  async findOne(@Param('id') id: string) {
    return this.courseSemestersService.findOne(id);
  }

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Admin only: create a new course-semester-subject mapping',
  })
  @ApiResponse({
    status: 201,
    description: 'Course semester mapping created successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden: Admins only' })
  @ApiResponse({
    status: 404,
    description: 'Course, Subject, or Academic Year not found',
  })
  @ApiResponse({
    status: 409,
    description:
      'This course-semester-subject mapping already exists for the given academic year',
  })
  async create(@Body() dto: CreateCourseSemesterDto) {
    return this.courseSemestersService.create(dto);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Admin only: update course-semester mapping details',
  })
  @ApiParam({ name: 'id', description: 'Course semester mapping UUID' })
  @ApiResponse({
    status: 200,
    description: 'Course semester mapping updated successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden: Admins only' })
  @ApiResponse({
    status: 404,
    description: 'Course semester mapping or referenced entity not found',
  })
  @ApiResponse({
    status: 409,
    description:
      'This course-semester-subject mapping already exists for the given academic year',
  })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCourseSemesterDto,
  ) {
    return this.courseSemestersService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Admin only: delete course-semester mapping' })
  @ApiParam({ name: 'id', description: 'Course semester mapping UUID' })
  @ApiResponse({
    status: 200,
    description: 'Course semester mapping deleted successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden: Admins only' })
  @ApiResponse({ status: 404, description: 'Course semester mapping not found' })
  async remove(@Param('id') id: string) {
    return this.courseSemestersService.remove(id);
  }
}
