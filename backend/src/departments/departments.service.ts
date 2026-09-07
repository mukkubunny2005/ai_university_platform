import {
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
              select: { id: true, name: true, email: true },
            },
          },
        },
        students: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
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
      throw new NotFoundException(`Department with ID "${id}" not found`);
    }

    return {
      message: 'Department details fetched successfully',
      data: department,
    };
  }

  async create(dto: CreateDepartmentDto) {
    const name = dto.name.trim();
    const code = dto.code.trim().toUpperCase();

    const existing = await this.prisma.department.findUnique({
      where: { code },
    });

    if (existing) {
      throw new ConflictException(`Department code "${code}" already exists`);
    }

    const department = await this.prisma.department.create({
      data: {
        name,
        code,
        description: dto.description?.trim(),
      },
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

    return {
      message: 'Department created successfully',
      data: department,
    };
  }

  async update(id: string, dto: UpdateDepartmentDto) {
    const department = await this.prisma.department.findUnique({ where: { id } });
    if (!department) {
      throw new NotFoundException(`Department with ID "${id}" not found`);
    }

    const data: Record<string, any> = {};
    if (dto.name !== undefined) data.name = dto.name.trim();
    if (dto.description !== undefined) data.description = dto.description?.trim();

    if (dto.code !== undefined) {
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
      throw new NotFoundException(`Department with ID "${id}" not found`);
    }

    if (department._count.students > 0) {
      throw new ConflictException(
        `Cannot delete department "${department.name}" because ${department._count.students} student(s) are associated with it. Reassign or remove students first.`,
      );
    }

    if (department._count.faculty > 0) {
      throw new ConflictException(
        `Cannot delete department "${department.name}" because ${department._count.faculty} faculty member(s) are associated with it. Reassign or remove faculty first.`,
      );
    }

    if (department._count.courses > 0) {
      throw new ConflictException(
        `Cannot delete department "${department.name}" because ${department._count.courses} course(s) are associated with it. Reassign or remove courses first.`,
      );
    }

    await this.prisma.department.delete({ where: { id } });

    return {
      message: 'Department deleted successfully',
      data: null,
    };
  }
}
