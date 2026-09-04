import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto, UpdateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        student: {
          select: {
            id: true,
            studentId: true,
            semester: true,
            department: { select: { id: true, name: true, code: true } },
          },
        },
        faculty: {
          select: {
            id: true,
            facultyId: true,
            designation: true,
            department: { select: { id: true, name: true, code: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      message: 'Users retrieved successfully',
      data: users,
    };
  }

  async findOne(id: string, currentUserId: string, currentUserRole: Role) {
    if (currentUserRole !== Role.ADMIN && currentUserId !== id) {
      throw new ForbiddenException('Access denied to other user accounts');
    }

    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        student: {
          include: { department: true },
        },
        faculty: {
          include: { department: true, subjects: true },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      message: 'User retrieved successfully',
      data: user,
    };
  }

  async create(dto: CreateUserDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
    });

    if (existing) {
      throw new ConflictException('User with this email already exists');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        name: dto.name.trim(),
        email: dto.email.toLowerCase().trim(),
        passwordHash,
        role: dto.role,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return {
      message: 'User created successfully',
      data: user,
    };
  }

  async update(id: string, dto: UpdateUserDto, currentUserId: string, currentUserRole: Role) {
    if (currentUserRole !== Role.ADMIN && currentUserId !== id) {
      throw new ForbiddenException('Access denied to update this profile');
    }

    const data: Record<string, any> = {};
    if (dto.name) data.name = dto.name.trim();
    if (dto.password) data.passwordHash = await bcrypt.hash(dto.password, 10);

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        updatedAt: true,
      },
    });

    return {
      message: 'User updated successfully',
      data: updatedUser,
    };
  }

  async remove(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.user.delete({ where: { id } });

    return {
      message: 'User deleted successfully',
      data: null,
    };
  }
}
