import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStudentDto, UpdateStudentDto } from './dto/create-student.dto';
import * as bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';

@Injectable()
export class StudentsService {
  constructor(private prisma: PrismaService) {}

  async findAll(departmentId?: string) {
    const where: Record<string, any> = {};
    if (departmentId) where.departmentId = departmentId;

    const students = await this.prisma.student.findMany({
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
      },
      orderBy: { studentId: 'asc' },
    });

    return {
      message: 'Students retrieved successfully',
      data: students,
    };
  }

  async findOne(id: string) {
    const student = await this.prisma.student.findUnique({
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
        department: {
          include: {
            courses: {
              include: {
                subjects: {
                  include: {
                    faculty: {
                      include: {
                        user: { select: { name: true, email: true } },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }

    return {
      message: 'Student retrieved successfully',
      data: student,
    };
  }

  async create(dto: CreateStudentDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
    });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const existingStudentId = await this.prisma.student.findUnique({
      where: { studentId: dto.studentId.trim() },
    });
    if (existingStudentId) {
      throw new ConflictException(`Student ID "${dto.studentId}" is already assigned`);
    }

    const dept = await this.prisma.department.findUnique({
      where: { id: dto.departmentId },
    });
    if (!dept) {
      throw new BadRequestException('Department does not exist');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const student = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: dto.name.trim(),
          email: dto.email.toLowerCase().trim(),
          passwordHash,
          role: Role.STUDENT,
        },
      });

      return tx.student.create({
        data: {
          userId: user.id,
          studentId: dto.studentId.trim(),
          departmentId: dto.departmentId,
          semester: dto.semester,
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
      message: 'Student created successfully',
      data: student,
    };
  }

  async update(id: string, dto: UpdateStudentDto) {
    const student = await this.prisma.student.findUnique({
      where: { id },
      include: { user: true },
    });
    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }

    if (dto.studentId && dto.studentId !== student.studentId) {
      const existing = await this.prisma.student.findUnique({
        where: { studentId: dto.studentId.trim() },
      });
      if (existing) {
        throw new ConflictException(`Student ID "${dto.studentId}" is already assigned`);
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
          where: { id: student.userId },
          data: { name: dto.name.trim() },
        });
      }

      return tx.student.update({
        where: { id },
        data: {
          studentId: dto.studentId ? dto.studentId.trim() : undefined,
          departmentId: dto.departmentId || undefined,
          semester: dto.semester !== undefined ? dto.semester : undefined,
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
      message: 'Student updated successfully',
      data: updated,
    };
  }

  async remove(id: string) {
    const student = await this.prisma.student.findUnique({ where: { id } });
    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }

    // Cascade delete user
    await this.prisma.user.delete({ where: { id: student.userId } });

    return {
      message: 'Student deleted successfully',
      data: null,
    };
  }
}
