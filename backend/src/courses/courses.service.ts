import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCourseDto, UpdateCourseDto } from './dto/create-course.dto';

@Injectable()
export class CoursesService {
  constructor(private prisma: PrismaService) {}

  async findAll(departmentId?: string) {
    const where: Record<string, any> = {};
    if (departmentId) {
      where.departmentId = departmentId;
    }

    const courses = await this.prisma.course.findMany({
      where,
      include: {
        department: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        _count: {
          select: {
            subjects: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return {
      message: 'Courses fetched successfully',
      data: courses,
    };
  }

  async findOne(id: string) {
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: {
        department: true,
        subjects: {
          include: {
            faculty: {
              include: {
                user: {
                  select: { name: true, email: true },
                },
              },
            },
          },
        },
      },
    });

    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }

    return {
      message: 'Course details fetched successfully',
      data: course,
    };
  }

  async create(dto: CreateCourseDto) {
    const code = dto.code.trim().toUpperCase();
    const existing = await this.prisma.course.findUnique({ where: { code } });
    if (existing) {
      throw new ConflictException(`Course code "${code}" already exists`);
    }

    const department = await this.prisma.department.findUnique({
      where: { id: dto.departmentId },
    });
    if (!department) {
      throw new BadRequestException('Department does not exist');
    }

    const course = await this.prisma.course.create({
      data: {
        name: dto.name.trim(),
        code,
        description: dto.description?.trim(),
        departmentId: dto.departmentId,
      },
      include: {
        department: true,
      },
    });

    return {
      message: 'Course created successfully',
      data: course,
    };
  }

  async update(id: string, dto: UpdateCourseDto) {
    const course = await this.prisma.course.findUnique({ where: { id } });
    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }

    const data: Record<string, any> = {};
    if (dto.name) data.name = dto.name.trim();
    if (dto.description !== undefined) data.description = dto.description?.trim();

    if (dto.code) {
      const code = dto.code.trim().toUpperCase();
      if (code !== course.code) {
        const existing = await this.prisma.course.findUnique({ where: { code } });
        if (existing) {
          throw new ConflictException(`Course code "${code}" already in use`);
        }
        data.code = code;
      }
    }

    if (dto.departmentId) {
      const department = await this.prisma.department.findUnique({
        where: { id: dto.departmentId },
      });
      if (!department) {
        throw new BadRequestException('Specified department does not exist');
      }
      data.departmentId = dto.departmentId;
    }

    const updated = await this.prisma.course.update({
      where: { id },
      data,
      include: {
        department: true,
      },
    });

    return {
      message: 'Course updated successfully',
      data: updated,
    };
  }

  async remove(id: string) {
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: {
        _count: {
          select: { subjects: true },
        },
      },
    });

    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }

    if (course._count.subjects > 0) {
      throw new BadRequestException(
        'Cannot delete course with associated subjects. Remove or reassign subjects first.',
      );
    }

    await this.prisma.course.delete({ where: { id } });

    return {
      message: 'Course deleted successfully',
      data: null,
    };
  }
}
