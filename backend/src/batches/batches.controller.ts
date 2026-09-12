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
import { BatchesService } from './batches.service';
import { CreateBatchDto, UpdateBatchDto } from './dto/create-batch.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Batches')
@ApiBearerAuth('bearer')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('batches')
export class BatchesController {
  constructor(private batchesService: BatchesService) {}

  @Get()
  @ApiOperation({
    summary: 'List all batches with optional department and course filtering',
    description: 'Retrieve batches ordered by startYear descending, optionally filtered by departmentId and/or courseId.',
  })
  @ApiQuery({
    name: 'departmentId',
    required: false,
    description: 'Filter batches by department UUID',
  })
  @ApiQuery({
    name: 'courseId',
    required: false,
    description: 'Filter batches by course UUID',
  })
  @ApiResponse({ status: 200, description: 'Batches fetched successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(
    @Query('departmentId') departmentId?: string,
    @Query('courseId') courseId?: string,
  ) {
    return this.batchesService.findAll(departmentId, courseId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get batch details by ID',
    description: 'Retrieve comprehensive batch details including department, course, enrolled students, sections, and counts.',
  })
  @ApiParam({ name: 'id', description: 'Batch UUID' })
  @ApiResponse({ status: 200, description: 'Batch details fetched successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Batch not found' })
  async findOne(@Param('id') id: string) {
    return this.batchesService.findOne(id);
  }

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Admin only: create a new batch',
    description: 'Create a new batch after validating unique code, valid academic years, and valid department-course relationship.',
  })
  @ApiResponse({ status: 201, description: 'Batch created successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request: invalid years or course does not belong to department' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden: Admins only' })
  @ApiResponse({ status: 404, description: 'Department or course not found' })
  @ApiResponse({ status: 409, description: 'Batch code already exists' })
  async create(@Body() dto: CreateBatchDto) {
    return this.batchesService.create(dto);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Admin only: update batch details',
    description: 'Update batch metadata, academic years, or department/course associations with validation.',
  })
  @ApiParam({ name: 'id', description: 'Batch UUID' })
  @ApiResponse({ status: 200, description: 'Batch updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request: invalid years or course mismatch' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden: Admins only' })
  @ApiResponse({ status: 404, description: 'Batch, department, or course not found' })
  @ApiResponse({ status: 409, description: 'Batch code already in use' })
  async update(@Param('id') id: string, @Body() dto: UpdateBatchDto) {
    return this.batchesService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Admin only: delete batch',
    description: 'Delete a batch if it has no associated students or sections.',
  })
  @ApiParam({ name: 'id', description: 'Batch UUID' })
  @ApiResponse({ status: 200, description: 'Batch deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden: Admins only' })
  @ApiResponse({ status: 404, description: 'Batch not found' })
  @ApiResponse({ status: 409, description: 'Cannot delete batch with associated students or sections' })
  async remove(@Param('id') id: string) {
    return this.batchesService.remove(id);
  }
}
