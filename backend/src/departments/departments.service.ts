import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDepartmentDto, UpdateDepartmentDto } from './dto/create-department.dto';

@Injectable()
export class DepartmentsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const departments = await this.prisma.department.findMany({
      include: {
        _count: {
          select: {
            courses: true,
            students: true,
            faculty: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return {
      message: 'Departments fetched successfully',
      data: departments,
    };
  }

  async findOne(id: string) {
    const department = await this.prisma.department.findUnique({
      where: { id },
      include: {
        courses: {
          include: {
            subjects: true,
          },
        },
        faculty: {
          include: {
            user: {
              select: { name: true, email: true },
            },
          },
        },
        students: {
          include: {
            user: {
              select: { name: true, email: true },
            },
          },
        },
        _count: {
          select: {
            courses: true,
            students: true,
            faculty: true,
          },
        },
      },
    });

    if (!department) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }

    return {
      message: 'Department details fetched successfully',
      data: department,
    };
  }

  async create(dto: CreateDepartmentDto) {
    const code = dto.code.trim().toUpperCase();
    const existing = await this.prisma.department.findUnique({
      where: { code },
    });

    if (existing) {
      throw new ConflictException(`Department code "${code}" already exists`);
    }

    const department = await this.prisma.department.create({
      data: {
        name: dto.name.trim(),
        code,
        description: dto.description?.trim(),
      },
    });

    return {
      message: 'Department created successfully',
      data: department,
    };
  }

  async update(id: string, dto: UpdateDepartmentDto) {
    const department = await this.prisma.department.findUnique({ where: { id } });
    if (!department) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }

    const data: Record<string, any> = {};
    if (dto.name) data.name = dto.name.trim();
    if (dto.description !== undefined) data.description = dto.description?.trim();

    if (dto.code) {
      const code = dto.code.trim().toUpperCase();
      if (code !== department.code) {
        const existing = await this.prisma.department.findUnique({ where: { code } });
        if (existing) {
          throw new ConflictException(`Department code "${code}" is already in use`);
        }
        data.code = code;
      }
    }

    const updated = await this.prisma.department.update({
      where: { id },
      data,
    });

    return {
      message: 'Department updated successfully',
      data: updated,
    };
  }

  async remove(id: string) {
    const department = await this.prisma.department.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            courses: true,
            students: true,
            faculty: true,
          },
        },
      },
    });

    if (!department) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }

    if (
      department._count.courses > 0 ||
      department._count.students > 0 ||
      department._count.faculty > 0
    ) {
      throw new BadRequestException(
        'Cannot delete department that contains associated courses, students, or faculty. Reassign or remove them first.',
      );
    }

    await this.prisma.department.delete({ where: { id } });

    return {
      message: 'Department deleted successfully',
      data: null,
    };
  }
}
