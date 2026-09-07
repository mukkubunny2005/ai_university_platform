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
import { SubjectsService } from './subjects.service';
import { CreateSubjectDto, UpdateSubjectDto } from './dto/create-subject.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Subjects')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('subjects')
export class SubjectsController {
  constructor(private subjectsService: SubjectsService) {}

  @Get()
  @ApiOperation({ summary: 'List all subjects with course and assigned faculty' })
  @ApiQuery({ name: 'courseId', required: false, description: 'Filter by Course UUID' })
  @ApiQuery({ name: 'facultyId', required: false, description: 'Filter by Faculty UUID' })
  @ApiResponse({ status: 200, description: 'Subjects list fetched' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(
    @Query('courseId') courseId?: string,
    @Query('facultyId') facultyId?: string,
  ) {
    return this.subjectsService.findAll(courseId, facultyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get subject details by ID' })
  @ApiResponse({ status: 200, description: 'Subject details fetched' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Subject not found' })
  async findOne(@Param('id') id: string) {
    return this.subjectsService.findOne(id);
  }

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Admin only: create a new subject' })
  @ApiResponse({ status: 201, description: 'Subject created' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden: Admins only' })
  @ApiResponse({ status: 404, description: 'Course or Faculty not found' })
  @ApiResponse({ status: 409, description: 'Subject code already exists' })
  async create(@Body() dto: CreateSubjectDto) {
    return this.subjectsService.create(dto);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Admin only: update subject details or assign faculty' })
  @ApiResponse({ status: 200, description: 'Subject updated' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden: Admins only' })
  @ApiResponse({ status: 404, description: 'Subject, Course, or Faculty not found' })
  @ApiResponse({ status: 409, description: 'Subject code already in use' })
  async update(@Param('id') id: string, @Body() dto: UpdateSubjectDto) {
    return this.subjectsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Admin only: delete subject' })
  @ApiResponse({ status: 200, description: 'Subject deleted' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden: Admins only' })
  @ApiResponse({ status: 404, description: 'Subject not found' })
  async remove(@Param('id') id: string) {
    return this.subjectsService.remove(id);
  }
}

