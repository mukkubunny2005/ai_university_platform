import { Test, TestingModule } from '@nestjs/testing';
import {
  CourseSemestersService,
  COURSE_SEMESTER_INCLUDE,
} from './course-semesters.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('CourseSemestersService', () => {
  let service: CourseSemestersService;
  let prisma: any;

  const mockPrisma = {
    courseSemester: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    course: {
      findUnique: jest.fn(),
    },
    subject: {
      findUnique: jest.fn(),
    },
    academicYear: {
      findUnique: jest.fn(),
    },
  };

  const mockCourseSemester = {
    id: 'cs-1',
    courseId: 'c-1',
    semesterNumber: 1,
    subjectId: 's-1',
    academicYearId: 'ay-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    course: {
      id: 'c-1',
      name: 'Computer Science',
      code: 'CS',
      department: { id: 'd-1', name: 'Engineering', code: 'ENG' },
    },
    subject: {
      id: 's-1',
      name: 'Data Structures',
      code: 'CS101',
      credits: 4,
    },
    academicYear: {
      id: 'ay-1',
      code: '2024-2025',
      name: 'Academic Year 2024-2025',
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CourseSemestersService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<CourseSemestersService>(CourseSemestersService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('findAll returns course-semesters', async () => {
      mockPrisma.courseSemester.findMany.mockResolvedValueOnce([mockCourseSemester]);

      const result = await service.findAll();

      expect(result.message).toBe('Course semester mappings fetched successfully');
      expect(result.data).toEqual([mockCourseSemester]);
      expect(mockPrisma.courseSemester.findMany).toHaveBeenCalledWith({
        where: {},
        include: COURSE_SEMESTER_INCLUDE,
        orderBy: { semesterNumber: 'asc' },
      });
    });

    it('findAll with filters', async () => {
      mockPrisma.courseSemester.findMany.mockResolvedValueOnce([mockCourseSemester]);

      const filters = {
        courseId: 'c-1',
        academicYearId: 'ay-1',
        semesterNumber: 1,
      };
      const result = await service.findAll(filters);

      expect(result.message).toBe('Course semester mappings fetched successfully');
      expect(result.data).toEqual([mockCourseSemester]);
      expect(mockPrisma.courseSemester.findMany).toHaveBeenCalledWith({
        where: {
          courseId: 'c-1',
          academicYearId: 'ay-1',
          semesterNumber: 1,
        },
        include: COURSE_SEMESTER_INCLUDE,
        orderBy: { semesterNumber: 'asc' },
      });
    });
  });

  describe('findOne', () => {
    it('findOne returns a course-semester', async () => {
      mockPrisma.courseSemester.findUnique.mockResolvedValueOnce(mockCourseSemester);

      const result = await service.findOne('cs-1');

      expect(result.message).toBe(
        'Course semester mapping details fetched successfully',
      );
      expect(result.data).toEqual(mockCourseSemester);
      expect(mockPrisma.courseSemester.findUnique).toHaveBeenCalledWith({
        where: { id: 'cs-1' },
        include: COURSE_SEMESTER_INCLUDE,
      });
    });

    it('findOne throws NotFoundException', async () => {
      mockPrisma.courseSemester.findUnique.mockResolvedValueOnce(null);

      await expect(service.findOne('cs-999')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    const createDto = {
      courseId: 'c-1',
      semesterNumber: 1,
      subjectId: 's-1',
      academicYearId: 'ay-1',
    };

    it('create succeeds', async () => {
      mockPrisma.course.findUnique.mockResolvedValueOnce({ id: 'c-1' });
      mockPrisma.subject.findUnique.mockResolvedValueOnce({ id: 's-1' });
      mockPrisma.academicYear.findUnique.mockResolvedValueOnce({ id: 'ay-1' });
      mockPrisma.courseSemester.findUnique.mockResolvedValueOnce(null);
      mockPrisma.courseSemester.create.mockResolvedValueOnce(mockCourseSemester);

      const result = await service.create(createDto);

      expect(result.message).toBe('Course semester mapping created successfully');
      expect(result.data).toEqual(mockCourseSemester);
      expect(mockPrisma.courseSemester.create).toHaveBeenCalledWith({
        data: createDto,
        include: COURSE_SEMESTER_INCLUDE,
      });
    });

    it('create throws ConflictException for duplicate mapping', async () => {
      mockPrisma.course.findUnique.mockResolvedValueOnce({ id: 'c-1' });
      mockPrisma.subject.findUnique.mockResolvedValueOnce({ id: 's-1' });
      mockPrisma.academicYear.findUnique.mockResolvedValueOnce({ id: 'ay-1' });
      mockPrisma.courseSemester.findUnique.mockResolvedValueOnce({
        id: 'existing-cs',
      });

      await expect(
        service.create(createDto),
      ).rejects.toThrow(
        'This course-semester-subject mapping already exists for the given academic year',
      );
    });

    it('create throws NotFoundException for invalid courseId', async () => {
      mockPrisma.course.findUnique.mockResolvedValueOnce(null);

      await expect(service.create(createDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('create throws NotFoundException for invalid subjectId', async () => {
      mockPrisma.course.findUnique.mockResolvedValueOnce({ id: 'c-1' });
      mockPrisma.subject.findUnique.mockResolvedValueOnce(null);

      await expect(service.create(createDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('create throws NotFoundException for invalid academicYearId', async () => {
      mockPrisma.course.findUnique.mockResolvedValueOnce({ id: 'c-1' });
      mockPrisma.subject.findUnique.mockResolvedValueOnce({ id: 's-1' });
      mockPrisma.academicYear.findUnique.mockResolvedValueOnce(null);

      await expect(service.create(createDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    const existing = {
      id: 'cs-1',
      courseId: 'c-1',
      semesterNumber: 1,
      subjectId: 's-1',
      academicYearId: 'ay-1',
    };

    it('update succeeds', async () => {
      const updated = { ...mockCourseSemester, semesterNumber: 2 };
      mockPrisma.courseSemester.findUnique.mockResolvedValueOnce(existing);
      mockPrisma.courseSemester.findUnique.mockResolvedValueOnce(null);
      mockPrisma.courseSemester.update.mockResolvedValueOnce(updated);

      const result = await service.update('cs-1', { semesterNumber: 2 });

      expect(result.message).toBe('Course semester mapping updated successfully');
      expect(result.data).toEqual(updated);
      expect(mockPrisma.courseSemester.update).toHaveBeenCalledWith({
        where: { id: 'cs-1' },
        data: { semesterNumber: 2 },
        include: COURSE_SEMESTER_INCLUDE,
      });
    });

    it('update throws NotFoundException if course semester mapping not found', async () => {
      mockPrisma.courseSemester.findUnique.mockResolvedValueOnce(null);

      await expect(service.update('cs-999', { semesterNumber: 2 })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('update throws ConflictException if updated key fields duplicate an existing record', async () => {
      mockPrisma.courseSemester.findUnique.mockResolvedValueOnce(existing);
      mockPrisma.courseSemester.findUnique.mockResolvedValueOnce({
        id: 'other-cs-id',
      });

      await expect(
        service.update('cs-1', { semesterNumber: 2 }),
      ).rejects.toThrow(ConflictException);
    });

    it('update validates courseId when changed', async () => {
      mockPrisma.courseSemester.findUnique.mockResolvedValueOnce(existing);
      mockPrisma.course.findUnique.mockResolvedValueOnce(null);

      await expect(
        service.update('cs-1', { courseId: 'invalid-c' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('update validates subjectId when changed', async () => {
      mockPrisma.courseSemester.findUnique.mockResolvedValueOnce(existing);
      mockPrisma.subject.findUnique.mockResolvedValueOnce(null);

      await expect(
        service.update('cs-1', { subjectId: 'invalid-s' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('update validates academicYearId when changed', async () => {
      mockPrisma.courseSemester.findUnique.mockResolvedValueOnce(existing);
      mockPrisma.academicYear.findUnique.mockResolvedValueOnce(null);

      await expect(
        service.update('cs-1', { academicYearId: 'invalid-ay' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('remove succeeds', async () => {
      mockPrisma.courseSemester.findUnique.mockResolvedValueOnce(mockCourseSemester);
      mockPrisma.courseSemester.delete.mockResolvedValueOnce(mockCourseSemester);

      const result = await service.remove('cs-1');

      expect(result.message).toBe('Course semester mapping deleted successfully');
      expect(result.data).toBeNull();
      expect(mockPrisma.courseSemester.delete).toHaveBeenCalledWith({
        where: { id: 'cs-1' },
      });
    });

    it('remove throws NotFoundException', async () => {
      mockPrisma.courseSemester.findUnique.mockResolvedValueOnce(null);

      await expect(service.remove('cs-999')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
