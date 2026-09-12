import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAcademicYearDto, UpdateAcademicYearDto } from './dto/create-academic-year.dto';

@Injectable()
export class AcademicYearsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const academicYears = await this.prisma.academicYear.findMany({
      orderBy: { startDate: 'desc' },
      include: {
        _count: {
          select: {
            sections: true,
            courseSemesters: true,
          },
        },
      },
    });

    return {
      message: 'Academic years fetched successfully',
      data: academicYears,
    };
  }

  async findOne(id: string) {
    const academicYear = await this.prisma.academicYear.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            sections: true,
            courseSemesters: true,
          },
        },
      },
    });

    if (!academicYear) {
      throw new NotFoundException(`Academic year with ID "${id}" not found`);
    }

    return {
      message: 'Academic year details fetched successfully',
      data: academicYear,
    };
  }

  async create(dto: CreateAcademicYearDto) {
    const code = dto.code.trim();

    const existing = await this.prisma.academicYear.findUnique({
      where: { code },
    });

    if (existing) {
      throw new ConflictException(`Academic year code "${code}" already exists`);
    }

    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new BadRequestException('Invalid start date or end date format');
    }

    if (endDate <= startDate) {
      throw new BadRequestException('End date must be after start date');
    }

    const academicYear = await this.prisma.academicYear.create({
      data: {
        code,
        name: dto.name.trim(),
        startDate,
        endDate,
        isActive: dto.isActive ?? false,
      },
      include: {
        _count: {
          select: {
            sections: true,
            courseSemesters: true,
          },
        },
      },
    });

    return {
      message: 'Academic year created successfully',
      data: academicYear,
    };
  }

  async update(id: string, dto: UpdateAcademicYearDto) {
    const academicYear = await this.prisma.academicYear.findUnique({
      where: { id },
    });

    if (!academicYear) {
      throw new NotFoundException(`Academic year with ID "${id}" not found`);
    }

    if (dto.code !== undefined && dto.code.trim() !== academicYear.code) {
      const code = dto.code.trim();
      const existing = await this.prisma.academicYear.findUnique({
        where: { code },
      });

      if (existing) {
        throw new ConflictException(`Academic year code "${code}" already exists`);
      }
    }

    const startDate = dto.startDate !== undefined ? new Date(dto.startDate) : academicYear.startDate;
    const endDate = dto.endDate !== undefined ? new Date(dto.endDate) : academicYear.endDate;

    if (dto.startDate !== undefined && isNaN(startDate.getTime())) {
      throw new BadRequestException('Invalid start date format');
    }

    if (dto.endDate !== undefined && isNaN(endDate.getTime())) {
      throw new BadRequestException('Invalid end date format');
    }

    if (endDate <= startDate) {
      throw new BadRequestException('End date must be after start date');
    }

    const updated = await this.prisma.academicYear.update({
      where: { id },
      data: {
        ...(dto.code !== undefined && { code: dto.code.trim() }),
        ...(dto.name !== undefined && { name: dto.name.trim() }),
        ...(dto.startDate !== undefined && { startDate }),
        ...(dto.endDate !== undefined && { endDate }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
      include: {
        _count: {
          select: {
            sections: true,
            courseSemesters: true,
          },
        },
      },
    });

    return {
      message: 'Academic year updated successfully',
      data: updated,
    };
  }

  async activate(id: string) {
    const existing = await this.prisma.academicYear.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Academic year with ID "${id}" not found`);
    }

    const [_, activated] = await this.prisma.$transaction([
      this.prisma.academicYear.updateMany({
        where: { id: { not: id } },
        data: { isActive: false },
      }),
      this.prisma.academicYear.update({
        where: { id },
        data: { isActive: true },
        include: {
          _count: {
            select: {
              sections: true,
              courseSemesters: true,
            },
          },
        },
      }),
    ]);

    return {
      message: 'Academic year activated successfully',
      data: activated,
    };
  }

  async remove(id: string) {
    const academicYear = await this.prisma.academicYear.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            sections: true,
            courseSemesters: true,
          },
        },
      },
    });

    if (!academicYear) {
      throw new NotFoundException(`Academic year with ID "${id}" not found`);
    }

    if (academicYear._count.sections > 0) {
      throw new ConflictException(
        `Cannot delete academic year "${academicYear.name}" because ${academicYear._count.sections} section(s) are associated with it. Reassign or remove sections first.`,
      );
    }

    if (academicYear._count.courseSemesters > 0) {
      throw new ConflictException(
        `Cannot delete academic year "${academicYear.name}" because ${academicYear._count.courseSemesters} course semester(s) are associated with it. Reassign or remove course semesters first.`,
      );
    }

    await this.prisma.academicYear.delete({
      where: { id },
    });

    return {
      message: 'Academic year deleted successfully',
      data: null,
    };
  }
}
