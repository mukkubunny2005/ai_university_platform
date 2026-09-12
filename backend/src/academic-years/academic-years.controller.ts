import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AcademicYearsService } from './academic-years.service';
import { CreateAcademicYearDto, UpdateAcademicYearDto } from './dto/create-academic-year.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Academic Years')
@ApiBearerAuth('bearer')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('academic-years')
export class AcademicYearsController {
  constructor(private readonly academicYearsService: AcademicYearsService) {}

  @Get()
  @ApiOperation({
    summary: 'List all academic years',
    description: 'Retrieve all academic years ordered by start date descending with section and course semester counts.',
  })
  @ApiResponse({ status: 200, description: 'Academic years fetched successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized: missing or invalid token' })
  async findAll() {
    return this.academicYearsService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get academic year details by ID',
    description: 'Retrieve academic year details with section and course semester counts.',
  })
  @ApiParam({ name: 'id', description: 'Academic year UUID' })
  @ApiResponse({ status: 200, description: 'Academic year details fetched successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized: missing or invalid token' })
  @ApiResponse({ status: 404, description: 'Academic year not found' })
  async findOne(@Param('id') id: string) {
    return this.academicYearsService.findOne(id);
  }

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Admin only: create a new academic year',
    description: 'Create an academic year. Validates code uniqueness and ensures start date is before end date.',
  })
  @ApiResponse({ status: 201, description: 'Academic year created successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request: validation failed or invalid date range' })
  @ApiResponse({ status: 401, description: 'Unauthorized: missing or invalid token' })
  @ApiResponse({ status: 403, description: 'Forbidden: admin role required' })
  @ApiResponse({ status: 409, description: 'Conflict: academic year code already exists' })
  async create(@Body() dto: CreateAcademicYearDto) {
    return this.academicYearsService.create(dto);
  }

  @Patch(':id/activate')
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Admin only: activate an academic year and deactivate all others',
    description: 'Admin only: activate an academic year and deactivate all others in a transaction.',
  })
  @ApiParam({ name: 'id', description: 'Academic year UUID' })
  @ApiResponse({ status: 200, description: 'Academic year activated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized: missing or invalid token' })
  @ApiResponse({ status: 403, description: 'Forbidden: admin role required' })
  @ApiResponse({ status: 404, description: 'Academic year not found' })
  async activate(@Param('id') id: string) {
    return this.academicYearsService.activate(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Admin only: update academic year details',
    description: 'Update academic year fields. Validates code uniqueness and date range if modified.',
  })
  @ApiParam({ name: 'id', description: 'Academic year UUID' })
  @ApiResponse({ status: 200, description: 'Academic year updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request: invalid payload or invalid date range' })
  @ApiResponse({ status: 401, description: 'Unauthorized: missing or invalid token' })
  @ApiResponse({ status: 403, description: 'Forbidden: admin role required' })
  @ApiResponse({ status: 404, description: 'Academic year not found' })
  @ApiResponse({ status: 409, description: 'Conflict: academic year code already in use' })
  async update(@Param('id') id: string, @Body() dto: UpdateAcademicYearDto) {
    return this.academicYearsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Admin only: delete academic year',
    description: 'Delete an academic year. Fails with 409 Conflict if associated sections or course semesters exist.',
  })
  @ApiParam({ name: 'id', description: 'Academic year UUID' })
  @ApiResponse({ status: 200, description: 'Academic year deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized: missing or invalid token' })
  @ApiResponse({ status: 403, description: 'Forbidden: admin role required' })
  @ApiResponse({ status: 404, description: 'Academic year not found' })
  @ApiResponse({
    status: 409,
    description: 'Conflict: cannot delete academic year while related sections or course semesters exist',
  })
  async remove(@Param('id') id: string) {
    return this.academicYearsService.remove(id);
  }
}
