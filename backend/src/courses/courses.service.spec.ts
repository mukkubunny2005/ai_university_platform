import { Test, TestingModule } from '@nestjs/testing';
import { CoursesService } from './courses.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException, ConflictException } from '@nestjs/common';

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

  describe('create', () => {
    it('should create course successfully when code is unique and department exists', async () => {
      mockPrisma.course.findUnique.mockResolvedValueOnce(null);
      mockPrisma.department.findUnique.mockResolvedValueOnce({ id: 'dept-1', name: 'CSE' });
      mockPrisma.course.create.mockResolvedValueOnce({
        id: 'course-1',
        name: 'B.Tech CSE',
        code: 'BTECH-CSE',
        departmentId: 'dept-1',
      });

      const result = await service.create({
        name: 'B.Tech CSE',
        code: 'BTECH-CSE',
        departmentId: 'dept-1',
      });

      expect(result.data.code).toBe('BTECH-CSE');
      expect(result.data.name).toBe('B.Tech CSE');
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

    it('should throw BadRequestException if department does not exist', async () => {
      mockPrisma.course.findUnique.mockResolvedValueOnce(null);
      mockPrisma.department.findUnique.mockResolvedValueOnce(null);

      await expect(
        service.create({
          name: 'Course Name',
          code: 'NEW-COURSE',
          departmentId: 'non-existing-dept',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should fetch all courses', async () => {
      mockPrisma.course.findMany.mockResolvedValueOnce([
        { id: '1', name: 'Course 1', code: 'C1' },
        { id: '2', name: 'Course 2', code: 'C2' },
      ]);

      const result = await service.findAll();
      expect(result.data).toHaveLength(2);
    });
  });
});
