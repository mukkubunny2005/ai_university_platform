import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateCourseSemesterDto,
  UpdateCourseSemesterDto,
} from './dto/create-course-semester.dto';

export const COURSE_SEMESTER_INCLUDE = {
  course: {
    include: {
      department: true,
    },
  },
  subject: true,
  academicYear: true,
};

@Injectable()
export class CourseSemestersService {
  constructor(private prisma: PrismaService) {}

  async findAll(filters: {
    courseId?: string;
    academicYearId?: string;
    semesterNumber?: number;
  } = {}) {
    const where: Record<string, any> = {};

    if (filters.courseId) {
      where.courseId = filters.courseId;
    }
    if (filters.academicYearId) {
      where.academicYearId = filters.academicYearId;
    }
    if (filters.semesterNumber !== undefined) {
      where.semesterNumber = filters.semesterNumber;
    }

    const courseSemesters = await this.prisma.courseSemester.findMany({
      where,
      include: COURSE_SEMESTER_INCLUDE,
      orderBy: { semesterNumber: 'asc' },
    });

    return {
      message: 'Course semester mappings fetched successfully',
      data: courseSemesters,
    };
  }

  async findOne(id: string) {
    const courseSemester = await this.prisma.courseSemester.findUnique({
      where: { id },
      include: COURSE_SEMESTER_INCLUDE,
    });

    if (!courseSemester) {
      throw new NotFoundException(`Course semester mapping with ID "${id}" not found`);
    }

    return {
      message: 'Course semester mapping details fetched successfully',
      data: courseSemester,
    };
  }

  async create(dto: CreateCourseSemesterDto) {
    const course = await this.prisma.course.findUnique({
      where: { id: dto.courseId },
    });
    if (!course) {
      throw new NotFoundException(`Course with ID "${dto.courseId}" not found`);
    }

    const subject = await this.prisma.subject.findUnique({
      where: { id: dto.subjectId },
    });
    if (!subject) {
      throw new NotFoundException(`Subject with ID "${dto.subjectId}" not found`);
    }

    const academicYear = await this.prisma.academicYear.findUnique({
      where: { id: dto.academicYearId },
    });
    if (!academicYear) {
      throw new NotFoundException(
        `Academic year with ID "${dto.academicYearId}" not found`,
      );
    }

    const existing = await this.prisma.courseSemester.findUnique({
      where: {
        courseId_semesterNumber_subjectId_academicYearId: {
          courseId: dto.courseId,
          semesterNumber: dto.semesterNumber,
          subjectId: dto.subjectId,
          academicYearId: dto.academicYearId,
        },
      },
    });
    if (existing) {
      throw new ConflictException(
        'This course-semester-subject mapping already exists for the given academic year',
      );
    }

    const courseSemester = await this.prisma.courseSemester.create({
      data: {
        courseId: dto.courseId,
        semesterNumber: dto.semesterNumber,
        subjectId: dto.subjectId,
        academicYearId: dto.academicYearId,
      },
      include: COURSE_SEMESTER_INCLUDE,
    });

    return {
      message: 'Course semester mapping created successfully',
      data: courseSemester,
    };
  }

  async update(id: string, dto: UpdateCourseSemesterDto) {
    const current = await this.prisma.courseSemester.findUnique({
      where: { id },
    });
    if (!current) {
      throw new NotFoundException(`Course semester mapping with ID "${id}" not found`);
    }

    if (dto.courseId && dto.courseId !== current.courseId) {
      const course = await this.prisma.course.findUnique({
        where: { id: dto.courseId },
      });
      if (!course) {
        throw new NotFoundException(`Course with ID "${dto.courseId}" not found`);
      }
    }

    if (dto.subjectId && dto.subjectId !== current.subjectId) {
      const subject = await this.prisma.subject.findUnique({
        where: { id: dto.subjectId },
      });
      if (!subject) {
        throw new NotFoundException(`Subject with ID "${dto.subjectId}" not found`);
      }
    }

    if (dto.academicYearId && dto.academicYearId !== current.academicYearId) {
      const academicYear = await this.prisma.academicYear.findUnique({
        where: { id: dto.academicYearId },
      });
      if (!academicYear) {
        throw new NotFoundException(
          `Academic year with ID "${dto.academicYearId}" not found`,
        );
      }
    }

    const courseId = dto.courseId ?? current.courseId;
    const semesterNumber = dto.semesterNumber ?? current.semesterNumber;
    const subjectId = dto.subjectId ?? current.subjectId;
    const academicYearId = dto.academicYearId ?? current.academicYearId;

    const isKeyChanged =
      courseId !== current.courseId ||
      semesterNumber !== current.semesterNumber ||
      subjectId !== current.subjectId ||
      academicYearId !== current.academicYearId;

    if (isKeyChanged) {
      const existing = await this.prisma.courseSemester.findUnique({
        where: {
          courseId_semesterNumber_subjectId_academicYearId: {
            courseId,
            semesterNumber,
            subjectId,
            academicYearId,
          },
        },
      });
      if (existing && existing.id !== id) {
        throw new ConflictException(
          'This course-semester-subject mapping already exists for the given academic year',
        );
      }
    }

    const updated = await this.prisma.courseSemester.update({
      where: { id },
      data: {
        ...(dto.courseId !== undefined && { courseId: dto.courseId }),
        ...(dto.semesterNumber !== undefined && { semesterNumber: dto.semesterNumber }),
        ...(dto.subjectId !== undefined && { subjectId: dto.subjectId }),
        ...(dto.academicYearId !== undefined && { academicYearId: dto.academicYearId }),
      },
      include: COURSE_SEMESTER_INCLUDE,
    });

    return {
      message: 'Course semester mapping updated successfully',
      data: updated,
    };
  }

  async remove(id: string) {
    const current = await this.prisma.courseSemester.findUnique({
      where: { id },
    });
    if (!current) {
      throw new NotFoundException(`Course semester mapping with ID "${id}" not found`);
    }

    await this.prisma.courseSemester.delete({
      where: { id },
    });

    return {
      message: 'Course semester mapping deleted successfully',
      data: null,
    };
  }
}
