import {
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
    const normalizedEmail = dto.email.toLowerCase().trim();
    const normalizedFacultyId = dto.facultyId.trim().toUpperCase();

    const existingUser = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const existingFacultyId = await this.prisma.faculty.findUnique({
      where: { facultyId: normalizedFacultyId },
    });
    if (existingFacultyId) {
      throw new ConflictException(`Faculty ID "${normalizedFacultyId}" is already assigned`);
    }

    const dept = await this.prisma.department.findUnique({
      where: { id: dto.departmentId },
    });
    if (!dept) {
      throw new NotFoundException(`Department with ID ${dto.departmentId} not found`);
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const faculty = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: dto.name.trim(),
          email: normalizedEmail,
          passwordHash,
          role: Role.FACULTY,
        },
      });

      return tx.faculty.create({
        data: {
          userId: user.id,
          facultyId: normalizedFacultyId,
          departmentId: dto.departmentId,
          designation: dto.designation.trim(),
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

    const userUpdates: Record<string, any> = {};
    if (dto.name !== undefined) userUpdates.name = dto.name.trim();

    if (dto.email !== undefined) {
      const normalizedEmail = dto.email.toLowerCase().trim();
      if (normalizedEmail !== faculty.user.email) {
        const existingUser = await this.prisma.user.findUnique({
          where: { email: normalizedEmail },
        });
        if (existingUser) {
          throw new ConflictException('User with this email already exists');
        }
        userUpdates.email = normalizedEmail;
      }
    }

    const facultyUpdates: Record<string, any> = {};
    if (dto.facultyId !== undefined) {
      const normalizedFacultyId = dto.facultyId.trim().toUpperCase();
      if (normalizedFacultyId !== faculty.facultyId) {
        const existingFaculty = await this.prisma.faculty.findUnique({
          where: { facultyId: normalizedFacultyId },
        });
        if (existingFaculty) {
          throw new ConflictException(`Faculty ID "${normalizedFacultyId}" is already assigned`);
        }
        facultyUpdates.facultyId = normalizedFacultyId;
      }
    }

    if (dto.departmentId !== undefined) {
      const dept = await this.prisma.department.findUnique({
        where: { id: dto.departmentId },
      });
      if (!dept) {
        throw new NotFoundException(`Department with ID ${dto.departmentId} not found`);
      }
      facultyUpdates.departmentId = dto.departmentId;
    }

    if (dto.designation !== undefined) {
      facultyUpdates.designation = dto.designation.trim();
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      if (Object.keys(userUpdates).length > 0) {
        await tx.user.update({
          where: { id: faculty.userId },
          data: userUpdates,
        });
      }

      return tx.faculty.update({
        where: { id },
        data: facultyUpdates,
        include: {
          user: {
            select: { id: true, name: true, email: true, role: true, createdAt: true },
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

    await this.prisma.$transaction(async (tx) => {
      // Unassign subjects before deleting
      await tx.subject.updateMany({
        where: { facultyId: id },
        data: { facultyId: null },
      });

      // Deleting user automatically cascades to Faculty model
      await tx.user.delete({ where: { id: faculty.userId } });
    });

    return {
      message: 'Faculty deleted successfully',
      data: null,
    };
  }
}

