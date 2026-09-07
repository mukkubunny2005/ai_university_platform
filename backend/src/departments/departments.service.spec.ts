import { Test, TestingModule } from '@nestjs/testing';
import { DepartmentsService } from './departments.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConflictException, NotFoundException } from '@nestjs/common';

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
    it('should create a new department successfully with normalized uppercase code', async () => {
      mockPrisma.department.findUnique.mockResolvedValueOnce(null);
      mockPrisma.department.create.mockResolvedValueOnce({
        id: 'dept-1',
        name: 'Computer Science and Engineering',
        code: 'CSE',
        description: 'CS Dept',
        _count: { courses: 0, students: 0, faculty: 0 },
      });

      const result = await service.create({
        name: '  Computer Science and Engineering  ',
        code: '  cse  ',
        description: '  CS Dept  ',
      });

      expect(mockPrisma.department.create).toHaveBeenCalledWith({
        data: {
          name: 'Computer Science and Engineering',
          code: 'CSE',
          description: 'CS Dept',
        },
        include: {
          _count: {
            select: {
              courses: true,
              students: true,
              faculty: true,
            },
          },
        },
      });
      expect(result.data.code).toBe('CSE');
      expect(result.data.name).toBe('Computer Science and Engineering');
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
    it('should return list of all departments with student, faculty, and course counts', async () => {
      const mockList = [
        { id: '1', name: 'Computer Science', code: 'CSE', _count: { courses: 2, students: 10, faculty: 3 } },
        { id: '2', name: 'Artificial Intelligence', code: 'AIDS', _count: { courses: 1, students: 5, faculty: 2 } },
      ];
      mockPrisma.department.findMany.mockResolvedValueOnce(mockList);

      const result = await service.findAll();
      expect(result.data).toHaveLength(2);
      expect(result.data[0].code).toBe('CSE');
      expect(result.data[0]._count.students).toBe(10);
      expect(result.data[0]._count.faculty).toBe(3);
      expect(result.data[0]._count.courses).toBe(2);
    });
  });

  describe('findOne', () => {
    it('should return department details with relations when found', async () => {
      const mockDept = {
        id: 'dept-1',
        name: 'Computer Science',
        code: 'CSE',
        courses: [{ id: 'c1', name: 'B.Tech CSE', subjects: [] }],
        faculty: [],
        students: [],
        _count: { courses: 1, students: 0, faculty: 0 },
      };
      mockPrisma.department.findUnique.mockResolvedValueOnce(mockDept);

      const result = await service.findOne('dept-1');
      expect(result.data.id).toBe('dept-1');
      expect(result.data.code).toBe('CSE');
      expect(result.data.courses).toHaveLength(1);
    });

    it('should throw NotFoundException if department does not exist', async () => {
      mockPrisma.department.findUnique.mockResolvedValueOnce(null);

      await expect(service.findOne('non-existent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update department fields successfully', async () => {
      mockPrisma.department.findUnique.mockResolvedValueOnce({
        id: 'dept-1',
        name: 'Computer Science',
        code: 'CSE',
      });
      mockPrisma.department.update.mockResolvedValueOnce({
        id: 'dept-1',
        name: 'Computer Science & Engineering',
        code: 'CSE',
        description: 'Updated description',
        _count: { courses: 0, students: 0, faculty: 0 },
      });

      const result = await service.update('dept-1', {
        name: 'Computer Science & Engineering',
        description: 'Updated description',
      });

      expect(result.data.name).toBe('Computer Science & Engineering');
    });

    it('should throw NotFoundException if department to update does not exist', async () => {
      mockPrisma.department.findUnique.mockResolvedValueOnce(null);

      await expect(
        service.update('non-existent', { name: 'Updated' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException if new code is already used by another department', async () => {
      mockPrisma.department.findUnique
        .mockResolvedValueOnce({ id: 'dept-1', code: 'CSE' }) // existing target
        .mockResolvedValueOnce({ id: 'dept-2', code: 'AIDS' }); // duplicate check

      await expect(
        service.update('dept-1', { code: 'AIDS' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('remove', () => {
    it('should throw NotFoundException if department to delete does not exist', async () => {
      mockPrisma.department.findUnique.mockResolvedValueOnce(null);

      await expect(service.remove('non-existent')).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException (409) if department has linked students', async () => {
      mockPrisma.department.findUnique.mockResolvedValueOnce({
        id: 'dept-1',
        name: 'Computer Science',
        _count: { courses: 0, students: 5, faculty: 0 },
      });

      await expect(service.remove('dept-1')).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException (409) if department has linked faculty', async () => {
      mockPrisma.department.findUnique.mockResolvedValueOnce({
        id: 'dept-1',
        name: 'Computer Science',
        _count: { courses: 0, students: 0, faculty: 3 },
      });

      await expect(service.remove('dept-1')).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException (409) if department has linked courses', async () => {
      mockPrisma.department.findUnique.mockResolvedValueOnce({
        id: 'dept-1',
        name: 'Computer Science',
        _count: { courses: 2, students: 0, faculty: 0 },
      });

      await expect(service.remove('dept-1')).rejects.toThrow(ConflictException);
    });

    it('should delete empty department successfully and return null data', async () => {
      mockPrisma.department.findUnique.mockResolvedValueOnce({
        id: 'dept-empty',
        name: 'Empty Dept',
        _count: { courses: 0, students: 0, faculty: 0 },
      });
      mockPrisma.department.delete.mockResolvedValueOnce({ id: 'dept-empty' });

      const result = await service.remove('dept-empty');
      expect(result.data).toBeNull();
      expect(mockPrisma.department.delete).toHaveBeenCalledWith({ where: { id: 'dept-empty' } });
    });
  });
});
