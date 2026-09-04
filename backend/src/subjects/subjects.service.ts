import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSubjectDto, UpdateSubjectDto } from './dto/create-subject.dto';

@Injectable()
export class SubjectsService {
  constructor(private prisma: PrismaService) {}

  async findAll(courseId?: string, facultyId?: string) {
    const where: Record<string, any> = {};
    if (courseId) where.courseId = courseId;
    if (facultyId) where.facultyId = facultyId;

    const subjects = await this.prisma.subject.findMany({
      where,
      include: {
        course: {
          select: {
            id: true,
            name: true,
            code: true,
            department: {
              select: { id: true, name: true, code: true },
            },
          },
        },
        faculty: {
          select: {
            id: true,
            facultyId: true,
            designation: true,
            user: {
              select: { name: true, email: true },
            },
          },
        },
      },
      orderBy: { code: 'asc' },
    });

    return {
      message: 'Subjects fetched successfully',
      data: subjects,
    };
  }

  async findOne(id: string) {
    const subject = await this.prisma.subject.findUnique({
      where: { id },
      include: {
        course: {
          include: {
            department: true,
          },
        },
        faculty: {
          include: {
            user: {
              select: { name: true, email: true },
            },
            department: true,
          },
        },
      },
    });

    if (!subject) {
      throw new NotFoundException(`Subject with ID ${id} not found`);
    }

    return {
      message: 'Subject details fetched successfully',
      data: subject,
    };
  }

  async create(dto: CreateSubjectDto) {
    const code = dto.code.trim().toUpperCase();
    const existing = await this.prisma.subject.findUnique({ where: { code } });
    if (existing) {
      throw new ConflictException(`Subject code "${code}" already exists`);
    }

    const course = await this.prisma.course.findUnique({
      where: { id: dto.courseId },
    });
    if (!course) {
      throw new BadRequestException('Course does not exist');
    }

    if (dto.facultyId) {
      const faculty = await this.prisma.faculty.findUnique({
        where: { id: dto.facultyId },
      });
      if (!faculty) {
        throw new BadRequestException('Assigned faculty does not exist');
      }
    }

    const subject = await this.prisma.subject.create({
      data: {
        name: dto.name.trim(),
        code,
        credits: dto.credits,
        courseId: dto.courseId,
        facultyId: dto.facultyId || null,
      },
      include: {
        course: true,
        faculty: {
          include: {
            user: { select: { name: true, email: true } },
          },
        },
      },
    });

    return {
      message: 'Subject created successfully',
      data: subject,
    };
  }

  async update(id: string, dto: UpdateSubjectDto) {
    const subject = await this.prisma.subject.findUnique({ where: { id } });
    if (!subject) {
      throw new NotFoundException(`Subject with ID ${id} not found`);
    }

    const data: Record<string, any> = {};
    if (dto.name) data.name = dto.name.trim();
    if (dto.credits !== undefined) data.credits = dto.credits;

    if (dto.code) {
      const code = dto.code.trim().toUpperCase();
      if (code !== subject.code) {
        const existing = await this.prisma.subject.findUnique({ where: { code } });
        if (existing) {
          throw new ConflictException(`Subject code "${code}" already in use`);
        }
        data.code = code;
      }
    }

    if (dto.courseId) {
      const course = await this.prisma.course.findUnique({
        where: { id: dto.courseId },
      });
      if (!course) {
        throw new BadRequestException('Course does not exist');
      }
      data.courseId = dto.courseId;
    }

    if (dto.facultyId !== undefined) {
      if (dto.facultyId) {
        const faculty = await this.prisma.faculty.findUnique({
          where: { id: dto.facultyId },
        });
        if (!faculty) {
          throw new BadRequestException('Faculty does not exist');
        }
        data.facultyId = dto.facultyId;
      } else {
        data.facultyId = null;
      }
    }

    const updated = await this.prisma.subject.update({
      where: { id },
      data,
      include: {
        course: true,
        faculty: {
          include: {
            user: { select: { name: true, email: true } },
          },
        },
      },
    });

    return {
      message: 'Subject updated successfully',
      data: updated,
    };
  }

  async remove(id: string) {
    const subject = await this.prisma.subject.findUnique({ where: { id } });
    if (!subject) {
      throw new NotFoundException(`Subject with ID ${id} not found`);
    }

    await this.prisma.subject.delete({ where: { id } });

    return {
      message: 'Subject deleted successfully',
      data: null,
    };
  }
}
