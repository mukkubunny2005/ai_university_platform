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
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { DepartmentsService } from './departments.service';
import { CreateDepartmentDto, UpdateDepartmentDto } from './dto/create-department.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';
import { Role } from '@prisma/client';

@ApiTags('Departments')
@ApiBearerAuth('bearer')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('departments')
export class DepartmentsController {
  constructor(private departmentsService: DepartmentsService) {}

  @Public()
  @Get()
  @ApiOperation({
    summary: 'List all academic departments with course, student, and faculty counts',
    description: 'Public endpoint allowing all users, including unauthenticated users on the registration page, to retrieve departments.',
  })
  @ApiResponse({ status: 200, description: 'Departments list fetched successfully' })
  async findAll() {
    return this.departmentsService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get department details by ID',
    description: 'Authenticated endpoint returning department details along with its courses, faculty, and student counts.',
  })
  @ApiResponse({ status: 200, description: 'Department details fetched successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized: missing or invalid token' })
  @ApiResponse({ status: 404, description: 'Department not found' })
  async findOne(@Param('id') id: string) {
    return this.departmentsService.findOne(id);
  }

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Admin only: create a new department',
    description: 'Restricted to administrators. Validates code uniqueness and creates the department.',
  })
  @ApiResponse({ status: 201, description: 'Department created successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request: validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized: missing or invalid token' })
  @ApiResponse({ status: 403, description: 'Forbidden: admin role required' })
  @ApiResponse({ status: 409, description: 'Conflict: department code already exists' })
  async create(@Body() dto: CreateDepartmentDto) {
    return this.departmentsService.create(dto);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Admin only: update department details',
    description: 'Restricted to administrators. Updates department fields and checks code uniqueness.',
  })
  @ApiResponse({ status: 200, description: 'Department updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request: invalid payload' })
  @ApiResponse({ status: 401, description: 'Unauthorized: missing or invalid token' })
  @ApiResponse({ status: 403, description: 'Forbidden: admin role required' })
  @ApiResponse({ status: 404, description: 'Department not found' })
  @ApiResponse({ status: 409, description: 'Conflict: department code already in use' })
  async update(@Param('id') id: string, @Body() dto: UpdateDepartmentDto) {
    return this.departmentsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Admin only: delete department',
    description: 'Restricted to administrators. Fails with 409 Conflict if related students, faculty, or courses exist.',
  })
  @ApiResponse({ status: 200, description: 'Department deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized: missing or invalid token' })
  @ApiResponse({ status: 403, description: 'Forbidden: admin role required' })
  @ApiResponse({ status: 404, description: 'Department not found' })
  @ApiResponse({
    status: 409,
    description: 'Conflict: cannot delete department while related students, faculty, or courses exist',
  })
  async remove(@Param('id') id: string) {
    return this.departmentsService.remove(id);
  }
}
