import { Test, TestingModule } from '@nestjs/testing';
import { DepartmentsService } from './departments.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';

describe('DepartmentsService', () => {
  let service: DepartmentsService;
  let prisma: any;

  const mockPrisma = {
    department: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DepartmentsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<DepartmentsService>(DepartmentsService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new department successfully', async () => {
      mockPrisma.department.findUnique.mockResolvedValueOnce(null);
      mockPrisma.department.create.mockResolvedValueOnce({
        id: 'dept-1',
        name: 'Computer Science',
        code: 'CSE',
        description: 'CS Dept',
      });

      const result = await service.create({
        name: 'Computer Science',
        code: 'CSE',
        description: 'CS Dept',
      });

      expect(result.data.code).toBe('CSE');
      expect(result.data.name).toBe('Computer Science');
    });

    it('should throw ConflictException if department code already exists', async () => {
      mockPrisma.department.findUnique.mockResolvedValueOnce({
        id: 'existing-id',
        code: 'CSE',
      });

      await expect(
        service.create({
          name: 'Computer Science Duplicate',
          code: 'CSE',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('should return list of all departments with counts', async () => {
      const mockList = [
        { id: '1', name: 'CSE', code: 'CSE', _count: { courses: 2, students: 10, faculty: 3 } },
        { id: '2', name: 'AIDS', code: 'AIDS', _count: { courses: 1, students: 5, faculty: 2 } },
      ];
      mockPrisma.department.findMany.mockResolvedValueOnce(mockList);

      const result = await service.findAll();
      expect(result.data).toHaveLength(2);
      expect(result.data[0].code).toBe('CSE');
    });
  });

  describe('remove', () => {
    it('should reject deletion if department has linked courses or students', async () => {
      mockPrisma.department.findUnique.mockResolvedValueOnce({
        id: 'dept-1',
        _count: { courses: 1, students: 0, faculty: 0 },
      });

      await expect(service.remove('dept-1')).rejects.toThrow(BadRequestException);
    });

    it('should delete empty department successfully', async () => {
      mockPrisma.department.findUnique.mockResolvedValueOnce({
        id: 'dept-empty',
        _count: { courses: 0, students: 0, faculty: 0 },
      });
      mockPrisma.department.delete.mockResolvedValueOnce({ id: 'dept-empty' });

      const result = await service.remove('dept-empty');
      expect(result.data).toBeNull();
    });
  });
});
