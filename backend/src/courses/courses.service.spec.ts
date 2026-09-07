import { Test, TestingModule } from '@nestjs/testing';
import { CoursesService } from './courses.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('CoursesService', () => {
  let service: CoursesService;
  let prisma: any;

  const mockPrisma = {
    course: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    department: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoursesService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<CoursesService>(CoursesService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should fetch all courses with department and subjects count', async () => {
      const mockCourses = [
        {
          id: '1',
          name: 'B.Tech CSE',
          code: 'BTECH-CSE',
          department: { id: 'dept-1', name: 'CSE', code: 'CSE' },
          _count: { subjects: 5 },
        },
        {
          id: '2',
          name: 'B.Tech ECE',
          code: 'BTECH-ECE',
          department: { id: 'dept-2', name: 'ECE', code: 'ECE' },
          _count: { subjects: 3 },
        },
      ];
      mockPrisma.course.findMany.mockResolvedValueOnce(mockCourses);

      const result = await service.findAll();
      expect(result.data).toHaveLength(2);
      expect(result.message).toBe('Courses fetched successfully');
      expect(mockPrisma.course.findMany).toHaveBeenCalledWith({
        where: {},
        include: {
          department: {
            select: { id: true, name: true, code: true },
          },
          _count: {
            select: { subjects: true },
          },
        },
        orderBy: { name: 'asc' },
      });
    });

    it('should filter courses by departmentId when provided', async () => {
      mockPrisma.course.findMany.mockResolvedValueOnce([]);

      await service.findAll('dept-123');
      expect(mockPrisma.course.findMany).toHaveBeenCalledWith({
        where: { departmentId: 'dept-123' },
        include: {
          department: {
            select: { id: true, name: true, code: true },
          },
          _count: {
            select: { subjects: true },
          },
        },
        orderBy: { name: 'asc' },
      });
    });
  });

  describe('findOne', () => {
    it('should return course details with subjects and department', async () => {
      const mockCourse = {
        id: 'course-1',
        name: 'B.Tech CSE',
        code: 'BTECH-CSE',
        department: { id: 'dept-1', name: 'Computer Science' },
        subjects: [],
      };
      mockPrisma.course.findUnique.mockResolvedValueOnce(mockCourse);

      const result = await service.findOne('course-1');
      expect(result.data).toEqual(mockCourse);
      expect(result.message).toBe('Course details fetched successfully');
    });

    it('should throw NotFoundException if course does not exist', async () => {
      mockPrisma.course.findUnique.mockResolvedValueOnce(null);

      await expect(service.findOne('invalid-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create course successfully when code is unique and department exists', async () => {
      mockPrisma.course.findUnique.mockResolvedValueOnce(null);
      mockPrisma.department.findUnique.mockResolvedValueOnce({ id: 'dept-1', name: 'CSE' });
      mockPrisma.course.create.mockResolvedValueOnce({
        id: 'course-1',
        name: 'B.Tech CSE',
        code: 'BTECH-CSE',
        departmentId: 'dept-1',
        department: { id: 'dept-1', name: 'CSE' },
      });

      const result = await service.create({
        name: '  B.Tech CSE  ',
        code: 'btech-cse ',
        departmentId: 'dept-1',
        description: '  Engineering program  ',
      });

      expect(mockPrisma.course.create).toHaveBeenCalledWith({
        data: {
          name: 'B.Tech CSE',
          code: 'BTECH-CSE',
          description: 'Engineering program',
          departmentId: 'dept-1',
        },
        include: {
          department: true,
        },
      });
      expect(result.data.code).toBe('BTECH-CSE');
    });

    it('should throw ConflictException if course code already exists', async () => {
      mockPrisma.course.findUnique.mockResolvedValueOnce({ id: 'existing', code: 'BTECH-CSE' });

      await expect(
        service.create({
          name: 'B.Tech CSE Duplicate',
          code: 'BTECH-CSE',
          departmentId: 'dept-1',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw NotFoundException if department does not exist', async () => {
      mockPrisma.course.findUnique.mockResolvedValueOnce(null);
      mockPrisma.department.findUnique.mockResolvedValueOnce(null);

      await expect(
        service.create({
          name: 'Course Name',
          code: 'NEW-COURSE',
          departmentId: 'non-existing-dept',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update course details successfully', async () => {
      mockPrisma.course.findUnique.mockResolvedValueOnce({
        id: 'course-1',
        name: 'Old Name',
        code: 'OLD-CODE',
      });
      mockPrisma.department.findUnique.mockResolvedValueOnce({ id: 'dept-2', name: 'ECE' });
      mockPrisma.course.update.mockResolvedValueOnce({
        id: 'course-1',
        name: 'New Name',
        code: 'OLD-CODE',
        departmentId: 'dept-2',
      });

      const result = await service.update('course-1', {
        name: 'New Name',
        departmentId: 'dept-2',
      });

      expect(result.message).toBe('Course updated successfully');
      expect(mockPrisma.course.update).toHaveBeenCalledWith({
        where: { id: 'course-1' },
        data: {
          name: 'New Name',
          departmentId: 'dept-2',
        },
        include: {
          department: true,
        },
      });
    });

    it('should throw NotFoundException if course to update is not found', async () => {
      mockPrisma.course.findUnique.mockResolvedValueOnce(null);

      await expect(
        service.update('missing-id', { name: 'Any Name' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if target department does not exist', async () => {
      mockPrisma.course.findUnique.mockResolvedValueOnce({
        id: 'course-1',
        name: 'Course 1',
        code: 'C1',
      });
      mockPrisma.department.findUnique.mockResolvedValueOnce(null);

      await expect(
        service.update('course-1', { departmentId: 'missing-dept' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException if new code already in use by another course', async () => {
      mockPrisma.course.findUnique.mockResolvedValueOnce({
        id: 'course-1',
        name: 'Course 1',
        code: 'C1',
      });
      // Duplicate code check returns existing course
      mockPrisma.course.findUnique.mockResolvedValueOnce({
        id: 'course-2',
        code: 'C2',
      });

      await expect(
        service.update('course-1', { code: 'C2' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('remove', () => {
    it('should delete course successfully when it has zero subjects', async () => {
      mockPrisma.course.findUnique.mockResolvedValueOnce({
        id: 'course-1',
        name: 'B.Tech CSE',
        _count: { subjects: 0 },
      });
      mockPrisma.course.delete.mockResolvedValueOnce({ id: 'course-1' });

      const result = await service.remove('course-1');
      expect(result.message).toBe('Course deleted successfully');
      expect(mockPrisma.course.delete).toHaveBeenCalledWith({ where: { id: 'course-1' } });
    });

    it('should throw NotFoundException if course to delete does not exist', async () => {
      mockPrisma.course.findUnique.mockResolvedValueOnce(null);

      await expect(service.remove('missing-id')).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException (409) if course has associated subjects', async () => {
      mockPrisma.course.findUnique.mockResolvedValueOnce({
        id: 'course-1',
        name: 'B.Tech CSE',
        _count: { subjects: 4 },
      });

      await expect(service.remove('course-1')).rejects.toThrow(ConflictException);
      expect(mockPrisma.course.delete).not.toHaveBeenCalled();
    });
  });
});

