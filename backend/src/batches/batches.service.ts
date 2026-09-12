import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBatchDto, UpdateBatchDto } from './dto/create-batch.dto';

@Injectable()
export class BatchesService {
  constructor(private prisma: PrismaService) {}

  async findAll(departmentId?: string, courseId?: string) {
    const where: Record<string, any> = {};
    if (departmentId) {
      where.departmentId = departmentId;
    }
    if (courseId) {
      where.courseId = courseId;
    }

    const batches = await this.prisma.batch.findMany({
      where,
      include: {
        department: true,
        course: true,
        _count: {
          select: {
            students: true,
            sections: true,
          },
        },
      },
      orderBy: { startYear: 'desc' },
    });

    return {
      message: 'Batches fetched successfully',
      data: batches,
    };
  }

  async findOne(id: string) {
    const batch = await this.prisma.batch.findUnique({
      where: { id },
      include: {
        department: true,
        course: true,
        students: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
        sections: true,
        _count: {
          select: {
            students: true,
            sections: true,
          },
        },
      },
    });

    if (!batch) {
      throw new NotFoundException(`Batch with ID ${id} not found`);
    }

    return {
      message: 'Batch details fetched successfully',
      data: batch,
    };
  }

  async create(dto: CreateBatchDto) {
    if (dto.endYear <= dto.startYear) {
      throw new BadRequestException('End year must be greater than start year');
    }

    const code = dto.code.trim().toUpperCase();
    const existingCode = await this.prisma.batch.findUnique({
      where: { code },
    });
    if (existingCode) {
      throw new ConflictException(`Batch code "${code}" already exists`);
    }

    const department = await this.prisma.department.findUnique({
      where: { id: dto.departmentId },
    });
    if (!department) {
      throw new NotFoundException(`Department with ID ${dto.departmentId} not found`);
    }

    const course = await this.prisma.course.findUnique({
      where: { id: dto.courseId },
    });
    if (!course) {
      throw new BadRequestException(`Course with ID ${dto.courseId} not found`);
    }
    if (course.departmentId !== dto.departmentId) {
      throw new BadRequestException('Course does not belong to the specified department');
    }

    const batch = await this.prisma.batch.create({
      data: {
        name: dto.name.trim(),
        code,
        startYear: dto.startYear,
        endYear: dto.endYear,
        departmentId: dto.departmentId,
        courseId: dto.courseId,
      },
      include: {
        department: true,
        course: true,
      },
    });

    return {
      message: 'Batch created successfully',
      data: batch,
    };
  }

  async update(id: string, dto: UpdateBatchDto) {
    const batch = await this.prisma.batch.findUnique({ where: { id } });
    if (!batch) {
      throw new NotFoundException(`Batch with ID ${id} not found`);
    }

    const data: Record<string, any> = {};

    if (dto.name !== undefined) {
      data.name = dto.name.trim();
    }

    if (dto.code !== undefined) {
      const code = dto.code.trim().toUpperCase();
      if (code !== batch.code) {
        const existing = await this.prisma.batch.findUnique({ where: { code } });
        if (existing) {
          throw new ConflictException(`Batch code "${code}" already in use`);
        }
        data.code = code;
      }
    }

    const startYear = dto.startYear !== undefined ? dto.startYear : batch.startYear;
    const endYear = dto.endYear !== undefined ? dto.endYear : batch.endYear;
    if (dto.startYear !== undefined || dto.endYear !== undefined) {
      if (endYear <= startYear) {
        throw new BadRequestException('End year must be greater than start year');
      }
      if (dto.startYear !== undefined) data.startYear = dto.startYear;
      if (dto.endYear !== undefined) data.endYear = dto.endYear;
    }

    const targetDepartmentId = dto.departmentId ?? batch.departmentId;
    const targetCourseId = dto.courseId ?? batch.courseId;

    if (dto.departmentId !== undefined) {
      const department = await this.prisma.department.findUnique({
        where: { id: dto.departmentId },
      });
      if (!department) {
        throw new NotFoundException(`Department with ID ${dto.departmentId} not found`);
      }
      data.departmentId = dto.departmentId;
    }

    if (dto.courseId !== undefined) {
      const course = await this.prisma.course.findUnique({
        where: { id: dto.courseId },
      });
      if (!course) {
        throw new BadRequestException(`Course with ID ${dto.courseId} not found`);
      }
      data.courseId = dto.courseId;
    }

    if (dto.departmentId !== undefined || dto.courseId !== undefined) {
      const course = await this.prisma.course.findUnique({
        where: { id: targetCourseId },
      });
      if (!course) {
        throw new BadRequestException(`Course with ID ${targetCourseId} not found`);
      }
      if (course.departmentId !== targetDepartmentId) {
        throw new BadRequestException('Course does not belong to the specified department');
      }
    }

    const updated = await this.prisma.batch.update({
      where: { id },
      data,
      include: {
        department: true,
        course: true,
      },
    });

    return {
      message: 'Batch updated successfully',
      data: updated,
    };
  }

  async remove(id: string) {
    const batch = await this.prisma.batch.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            students: true,
            sections: true,
          },
        },
      },
    });

    if (!batch) {
      throw new NotFoundException(`Batch with ID ${id} not found`);
    }

    if (batch._count.students > 0) {
      throw new ConflictException(
        'Cannot delete batch because students are associated with it. Reassign or remove students first.',
      );
    }

    if (batch._count.sections > 0) {
      throw new ConflictException(
        'Cannot delete batch because sections are associated with it. Reassign or remove sections first.',
      );
    }

    await this.prisma.batch.delete({ where: { id } });

    return {
      message: 'Batch deleted successfully',
      data: null,
    };
  }
}
