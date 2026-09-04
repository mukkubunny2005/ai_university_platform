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
import { FacultyService } from './faculty.service';
import { CreateFacultyDto, UpdateFacultyDto } from './dto/create-faculty.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Faculty')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('faculty')
export class FacultyController {
  constructor(private facultyService: FacultyService) {}

  @Get()
  @ApiOperation({ summary: 'List all faculty members' })
  @ApiQuery({ name: 'departmentId', required: false })
  @ApiResponse({ status: 200, description: 'Faculty members list fetched' })
  async findAll(@Query('departmentId') departmentId?: string) {
    return this.facultyService.findAll(departmentId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get faculty member details by ID' })
  @ApiResponse({ status: 200, description: 'Faculty details fetched' })
  @ApiResponse({ status: 404, description: 'Faculty not found' })
  async findOne(@Param('id') id: string) {
    return this.facultyService.findOne(id);
  }

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Admin only: create faculty member' })
  @ApiResponse({ status: 201, description: 'Faculty member created' })
  @ApiResponse({ status: 403, description: 'Forbidden: Admins only' })
  async create(@Body() dto: CreateFacultyDto) {
    return this.facultyService.create(dto);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Admin only: update faculty member' })
  @ApiResponse({ status: 200, description: 'Faculty member updated' })
  @ApiResponse({ status: 403, description: 'Forbidden: Admins only' })
  async update(@Param('id') id: string, @Body() dto: UpdateFacultyDto) {
    return this.facultyService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Admin only: delete faculty member' })
  @ApiResponse({ status: 200, description: 'Faculty member deleted' })
  @ApiResponse({ status: 403, description: 'Forbidden: Admins only' })
  async remove(@Param('id') id: string) {
    return this.facultyService.remove(id);
  }
}
