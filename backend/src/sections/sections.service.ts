import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSectionDto, UpdateSectionDto } from './dto/create-section.dto';

export interface SectionFilters {
  departmentId?: string;
  courseId?: string;
  batchId?: string;
  academicYearId?: string;
  semesterNumber?: number;
}

@Injectable()
export class SectionsService {
  constructor(private prisma: PrismaService) {}

  async findAll(filters?: SectionFilters) {
    const where: Record<string, any> = {};

    if (filters?.departmentId) {
      where.departmentId = filters.departmentId;
    }
    if (filters?.courseId) {
      where.courseId = filters.courseId;
    }
    if (filters?.batchId) {
      where.batchId = filters.batchId;
    }
    if (filters?.academicYearId) {
      where.academicYearId = filters.academicYearId;
    }
    if (filters?.semesterNumber !== undefined) {
      where.semesterNumber = filters.semesterNumber;
    }

    const sections = await this.prisma.section.findMany({
      where,
      include: {
        department: true,
        course: true,
        academicYear: true,
        batch: true,
        _count: {
          select: {
            students: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return {
      message: 'Sections fetched successfully',
      data: sections,
    };
  }

  async findOne(id: string) {
    const section = await this.prisma.section.findUnique({
      where: { id },
      include: {
        department: true,
        course: true,
        academicYear: true,
        batch: true,
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
        _count: {
          select: {
            students: true,
          },
        },
      },
    });

    if (!section) {
      throw new NotFoundException(`Section with ID ${id} not found`);
    }

    return {
      message: 'Section details fetched successfully',
      data: section,
    };
  }

  async create(dto: CreateSectionDto) {
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
      throw new NotFoundException(`Course with ID ${dto.courseId} not found`);
    }

    const academicYear = await this.prisma.academicYear.findUnique({
      where: { id: dto.academicYearId },
    });
    if (!academicYear) {
      throw new NotFoundException(`Academic year with ID ${dto.academicYearId} not found`);
    }

    const batch = await this.prisma.batch.findUnique({
      where: { id: dto.batchId },
    });
    if (!batch) {
      throw new NotFoundException(`Batch with ID ${dto.batchId} not found`);
    }

    const name = dto.name.trim().toUpperCase();

    const existing = await this.prisma.section.findUnique({
      where: {
        departmentId_courseId_semesterNumber_academicYearId_batchId_name: {
          departmentId: dto.departmentId,
          courseId: dto.courseId,
          semesterNumber: dto.semesterNumber,
          academicYearId: dto.academicYearId,
          batchId: dto.batchId,
          name,
        },
      },
    });
    if (existing) {
      throw new ConflictException('Section with this combination already exists');
    }

    const section = await this.prisma.section.create({
      data: {
        name,
        semesterNumber: dto.semesterNumber,
        departmentId: dto.departmentId,
        courseId: dto.courseId,
        academicYearId: dto.academicYearId,
        batchId: dto.batchId,
        ...(dto.maxCapacity !== undefined ? { maxCapacity: dto.maxCapacity } : {}),
      },
      include: {
        department: true,
        course: true,
        academicYear: true,
        batch: true,
        _count: {
          select: {
            students: true,
          },
        },
      },
    });

    return {
      message: 'Section created successfully',
      data: section,
    };
  }

  async update(id: string, dto: UpdateSectionDto) {
    const section = await this.prisma.section.findUnique({ where: { id } });
    if (!section) {
      throw new NotFoundException(`Section with ID ${id} not found`);
    }

    if (dto.departmentId !== undefined && dto.departmentId !== section.departmentId) {
      const department = await this.prisma.department.findUnique({
        where: { id: dto.departmentId },
      });
      if (!department) {
        throw new NotFoundException(`Department with ID ${dto.departmentId} not found`);
      }
    }

    if (dto.courseId !== undefined && dto.courseId !== section.courseId) {
      const course = await this.prisma.course.findUnique({
        where: { id: dto.courseId },
      });
      if (!course) {
        throw new NotFoundException(`Course with ID ${dto.courseId} not found`);
      }
    }

    if (dto.academicYearId !== undefined && dto.academicYearId !== section.academicYearId) {
      const academicYear = await this.prisma.academicYear.findUnique({
        where: { id: dto.academicYearId },
      });
      if (!academicYear) {
        throw new NotFoundException(`Academic year with ID ${dto.academicYearId} not found`);
      }
    }

    if (dto.batchId !== undefined && dto.batchId !== section.batchId) {
      const batch = await this.prisma.batch.findUnique({
        where: { id: dto.batchId },
      });
      if (!batch) {
        throw new NotFoundException(`Batch with ID ${dto.batchId} not found`);
      }
    }

    const departmentId = dto.departmentId ?? section.departmentId;
    const courseId = dto.courseId ?? section.courseId;
    const semesterNumber = dto.semesterNumber ?? section.semesterNumber;
    const academicYearId = dto.academicYearId ?? section.academicYearId;
    const batchId = dto.batchId ?? section.batchId;
    const name = dto.name !== undefined ? dto.name.trim().toUpperCase() : section.name;

    const keyChanged =
      dto.departmentId !== undefined ||
      dto.courseId !== undefined ||
      dto.semesterNumber !== undefined ||
      dto.academicYearId !== undefined ||
      dto.batchId !== undefined ||
      dto.name !== undefined;

    if (keyChanged) {
      const existing = await this.prisma.section.findUnique({
        where: {
          departmentId_courseId_semesterNumber_academicYearId_batchId_name: {
            departmentId,
            courseId,
            semesterNumber,
            academicYearId,
            batchId,
            name,
          },
        },
      });
      if (existing && existing.id !== id) {
        throw new ConflictException('Section with this combination already exists');
      }
    }

    const data: Record<string, any> = {};
    if (dto.name !== undefined) data.name = name;
    if (dto.semesterNumber !== undefined) data.semesterNumber = dto.semesterNumber;
    if (dto.departmentId !== undefined) data.departmentId = dto.departmentId;
    if (dto.courseId !== undefined) data.courseId = dto.courseId;
    if (dto.academicYearId !== undefined) data.academicYearId = dto.academicYearId;
    if (dto.batchId !== undefined) data.batchId = dto.batchId;
    if (dto.maxCapacity !== undefined) data.maxCapacity = dto.maxCapacity;

    const updated = await this.prisma.section.update({
      where: { id },
      data,
      include: {
        department: true,
        course: true,
        academicYear: true,
        batch: true,
        _count: {
          select: {
            students: true,
          },
        },
      },
    });

    return {
      message: 'Section updated successfully',
      data: updated,
    };
  }

  async remove(id: string) {
    const section = await this.prisma.section.findUnique({
      where: { id },
      include: {
        _count: {
          select: { students: true },
        },
      },
    });

    if (!section) {
      throw new NotFoundException(`Section with ID ${id} not found`);
    }

    if (section._count.students > 0) {
      throw new ConflictException(
        'Cannot delete section because students are assigned to it. Reassign or remove students first.',
      );
    }

    await this.prisma.section.delete({ where: { id } });

    return {
      message: 'Section deleted successfully',
      data: null,
    };
  }
}
