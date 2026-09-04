import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFacultyDto, UpdateFacultyDto } from './dto/create-faculty.dto';
import * as bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';

@Injectable()
export class FacultyService {
  constructor(private prisma: PrismaService) {}

  async findAll(departmentId?: string) {
    const where: Record<string, any> = {};
    if (departmentId) where.departmentId = departmentId;

    const facultyList = await this.prisma.faculty.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
          },
        },
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
      orderBy: { facultyId: 'asc' },
    });

    return {
      message: 'Faculty members retrieved successfully',
      data: facultyList,
    };
  }

  async findOne(id: string) {
    const faculty = await this.prisma.faculty.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
          },
        },
        department: true,
        subjects: {
          include: {
            course: true,
          },
        },
      },
    });

    if (!faculty) {
      throw new NotFoundException(`Faculty member with ID ${id} not found`);
    }

    return {
      message: 'Faculty details retrieved successfully',
      data: faculty,
    };
  }

  async create(dto: CreateFacultyDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
    });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const existingFacultyId = await this.prisma.faculty.findUnique({
      where: { facultyId: dto.facultyId.trim() },
    });
    if (existingFacultyId) {
      throw new ConflictException(`Faculty ID "${dto.facultyId}" is already assigned`);
    }

    const dept = await this.prisma.department.findUnique({
      where: { id: dto.departmentId },
    });
    if (!dept) {
      throw new BadRequestException('Department does not exist');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const faculty = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: dto.name.trim(),
          email: dto.email.toLowerCase().trim(),
          passwordHash,
          role: Role.FACULTY,
        },
      });

      return tx.faculty.create({
        data: {
          userId: user.id,
          facultyId: dto.facultyId.trim(),
          departmentId: dto.departmentId,
          designation: dto.designation.trim(),
        },
        include: {
          user: {
            select: { id: true, name: true, email: true, role: true },
          },
          department: true,
        },
      });
    });

    return {
      message: 'Faculty created successfully',
      data: faculty,
    };
  }

  async update(id: string, dto: UpdateFacultyDto) {
    const faculty = await this.prisma.faculty.findUnique({
      where: { id },
      include: { user: true },
    });
    if (!faculty) {
      throw new NotFoundException(`Faculty member with ID ${id} not found`);
    }

    if (dto.facultyId && dto.facultyId !== faculty.facultyId) {
      const existing = await this.prisma.faculty.findUnique({
        where: { facultyId: dto.facultyId.trim() },
      });
      if (existing) {
        throw new ConflictException(`Faculty ID "${dto.facultyId}" is already assigned`);
      }
    }

    if (dto.departmentId) {
      const dept = await this.prisma.department.findUnique({
        where: { id: dto.departmentId },
      });
      if (!dept) {
        throw new BadRequestException('Department does not exist');
      }
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      if (dto.name) {
        await tx.user.update({
          where: { id: faculty.userId },
          data: { name: dto.name.trim() },
        });
      }

      return tx.faculty.update({
        where: { id },
        data: {
          facultyId: dto.facultyId ? dto.facultyId.trim() : undefined,
          departmentId: dto.departmentId || undefined,
          designation: dto.designation ? dto.designation.trim() : undefined,
        },
        include: {
          user: {
            select: { id: true, name: true, email: true, role: true },
          },
          department: true,
        },
      });
    });

    return {
      message: 'Faculty updated successfully',
      data: updated,
    };
  }

  async remove(id: string) {
    const faculty = await this.prisma.faculty.findUnique({ where: { id } });
    if (!faculty) {
      throw new NotFoundException(`Faculty member with ID ${id} not found`);
    }

    // Unassign subjects before deleting
    await this.prisma.subject.updateMany({
      where: { facultyId: id },
      data: { facultyId: null },
    });

    await this.prisma.user.delete({ where: { id: faculty.userId } });

    return {
      message: 'Faculty deleted successfully',
      data: null,
    };
  }
}
