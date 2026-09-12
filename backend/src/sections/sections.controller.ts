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
import { SectionsService } from './sections.service';
import { CreateSectionDto, UpdateSectionDto } from './dto/create-section.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Sections')
@ApiBearerAuth('bearer')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('sections')
export class SectionsController {
  constructor(private readonly sectionsService: SectionsService) {}

  @Get()
  @ApiOperation({
    summary: 'List all sections with optional filters',
    description: 'Retrieve sections with optional filtering by department, course, batch, academic year, and semester number.',
  })
  @ApiQuery({ name: 'departmentId', required: false, description: 'Filter by department UUID' })
  @ApiQuery({ name: 'courseId', required: false, description: 'Filter by course UUID' })
  @ApiQuery({ name: 'batchId', required: false, description: 'Filter by batch UUID' })
  @ApiQuery({ name: 'academicYearId', required: false, description: 'Filter by academic year UUID' })
  @ApiQuery({ name: 'semesterNumber', required: false, description: 'Filter by semester number (1-8)' })
  @ApiResponse({ status: 200, description: 'Sections fetched successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized: missing or invalid token' })
  async findAll(
    @Query('departmentId') departmentId?: string,
    @Query('courseId') courseId?: string,
    @Query('batchId') batchId?: string,
    @Query('academicYearId') academicYearId?: string,
    @Query('semesterNumber') semesterNumber?: string,
  ) {
    return this.sectionsService.findAll({
      departmentId,
      courseId,
      batchId,
      academicYearId,
      semesterNumber: semesterNumber ? parseInt(semesterNumber, 10) : undefined,
    });
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get section details by ID',
    description: 'Retrieve section details including assigned students, department, course, academic year, and batch.',
  })
  @ApiParam({ name: 'id', description: 'Section UUID' })
  @ApiResponse({ status: 200, description: 'Section details fetched successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized: missing or invalid token' })
  @ApiResponse({ status: 404, description: 'Section not found' })
  async findOne(@Param('id') id: string) {
    return this.sectionsService.findOne(id);
  }

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Admin only: create a new section',
    description: 'Create a new section under a department, course, academic year, and batch. Requires ADMIN role.',
  })
  @ApiResponse({ status: 201, description: 'Section created successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request: validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized: missing or invalid token' })
  @ApiResponse({ status: 403, description: 'Forbidden: Admins only' })
  @ApiResponse({ status: 404, description: 'Department, course, academic year, or batch not found' })
  @ApiResponse({ status: 409, description: 'Section with this combination already exists' })
  async create(@Body() dto: CreateSectionDto) {
    return this.sectionsService.create(dto);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Admin only: update section details',
    description: 'Update section name, capacity, or relation references. Requires ADMIN role.',
  })
  @ApiParam({ name: 'id', description: 'Section UUID' })
  @ApiResponse({ status: 200, description: 'Section updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request: validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized: missing or invalid token' })
  @ApiResponse({ status: 403, description: 'Forbidden: Admins only' })
  @ApiResponse({ status: 404, description: 'Section or referenced entity not found' })
  @ApiResponse({ status: 409, description: 'Section with this combination already exists' })
  async update(@Param('id') id: string, @Body() dto: UpdateSectionDto) {
    return this.sectionsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Admin only: delete section',
    description: 'Delete a section if no students are assigned to it. Requires ADMIN role.',
  })
  @ApiParam({ name: 'id', description: 'Section UUID' })
  @ApiResponse({ status: 200, description: 'Section deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized: missing or invalid token' })
  @ApiResponse({ status: 403, description: 'Forbidden: Admins only' })
  @ApiResponse({ status: 404, description: 'Section not found' })
  @ApiResponse({ status: 409, description: 'Cannot delete section because students are assigned to it' })
  async remove(@Param('id') id: string) {
    return this.sectionsService.remove(id);
  }
}
