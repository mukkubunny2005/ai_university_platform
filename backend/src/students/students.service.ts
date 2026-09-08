import {
  ConflictException,
  ForbiddenException,
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

  async findOne(id: string, currentUser?: { id: string; role: Role }) {
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

    // IDOR protection: A student can only view their own record
    if (currentUser && currentUser.role === Role.STUDENT && student.userId !== currentUser.id) {
      throw new ForbiddenException("You are not authorized to view another student's profile");
    }

    return {
      message: 'Student details retrieved successfully',
      data: student,
    };
  }

  async create(dto: CreateStudentDto) {
    const normalizedEmail = dto.email.toLowerCase().trim();
    const normalizedStudentId = dto.studentId.trim().toUpperCase();

    const existingUser = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const existingStudentId = await this.prisma.student.findUnique({
      where: { studentId: normalizedStudentId },
    });
    if (existingStudentId) {
      throw new ConflictException(`Student ID "${normalizedStudentId}" is already assigned`);
    }

    const dept = await this.prisma.department.findUnique({
      where: { id: dto.departmentId },
    });
    if (!dept) {
      throw new NotFoundException(`Department with ID ${dto.departmentId} not found`);
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const student = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: dto.name.trim(),
          email: normalizedEmail,
          passwordHash,
          role: Role.STUDENT,
        },
      });

      return tx.student.create({
        data: {
          userId: user.id,
          studentId: normalizedStudentId,
          departmentId: dto.departmentId,
          semester: dto.semester,
        },
        include: {
          user: {
            select: { id: true, name: true, email: true, role: true, createdAt: true },
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

    const userUpdates: Record<string, any> = {};
    if (dto.name !== undefined) userUpdates.name = dto.name.trim();

    if (dto.email !== undefined) {
      const normalizedEmail = dto.email.toLowerCase().trim();
      if (normalizedEmail !== student.user.email) {
        const existingUser = await this.prisma.user.findUnique({
          where: { email: normalizedEmail },
        });
        if (existingUser) {
          throw new ConflictException('User with this email already exists');
        }
        userUpdates.email = normalizedEmail;
      }
    }

    const studentUpdates: Record<string, any> = {};
    if (dto.studentId !== undefined) {
      const normalizedStudentId = dto.studentId.trim().toUpperCase();
      if (normalizedStudentId !== student.studentId) {
        const existingStudent = await this.prisma.student.findUnique({
          where: { studentId: normalizedStudentId },
        });
        if (existingStudent) {
          throw new ConflictException(`Student ID "${normalizedStudentId}" is already assigned`);
        }
        studentUpdates.studentId = normalizedStudentId;
      }
    }

    if (dto.departmentId !== undefined) {
      const dept = await this.prisma.department.findUnique({
        where: { id: dto.departmentId },
      });
      if (!dept) {
        throw new NotFoundException(`Department with ID ${dto.departmentId} not found`);
      }
      studentUpdates.departmentId = dto.departmentId;
    }

    if (dto.semester !== undefined) {
      studentUpdates.semester = dto.semester;
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      if (Object.keys(userUpdates).length > 0) {
        await tx.user.update({
          where: { id: student.userId },
          data: userUpdates,
        });
      }

      return tx.student.update({
        where: { id },
        data: studentUpdates,
        include: {
          user: {
            select: { id: true, name: true, email: true, role: true, createdAt: true },
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

    // Cascade delete: deleting user automatically cascades to Student model
    await this.prisma.user.delete({ where: { id: student.userId } });

    return {
      message: 'Student deleted successfully',
      data: null,
    };
  }
}
