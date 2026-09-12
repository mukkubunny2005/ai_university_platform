import { Test, TestingModule } from '@nestjs/testing';
import { BatchesService } from './batches.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';

describe('BatchesService', () => {
  let service: BatchesService;
  let prisma: any;

  const mockPrisma = {
    batch: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    department: {
      findUnique: jest.fn(),
    },
    course: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BatchesService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<BatchesService>(BatchesService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should fetch all batches ordered by startYear desc with relations and counts', async () => {
      const mockBatches = [
        {
          id: 'batch-1',
          name: '2023-2027 CSE Batch',
          code: '2023-CSE',
          startYear: 2023,
          endYear: 2027,
          departmentId: 'dept-1',
          courseId: 'course-1',
          department: { id: 'dept-1', name: 'Computer Science' },
          course: { id: 'course-1', name: 'B.Tech CSE' },
          _count: { students: 120, sections: 2 },
        },
        {
          id: 'batch-2',
          name: '2022-2026 CSE Batch',
          code: '2022-CSE',
          startYear: 2022,
          endYear: 2026,
          departmentId: 'dept-1',
          courseId: 'course-1',
          department: { id: 'dept-1', name: 'Computer Science' },
          course: { id: 'course-1', name: 'B.Tech CSE' },
          _count: { students: 115, sections: 2 },
        },
      ];
      mockPrisma.batch.findMany.mockResolvedValueOnce(mockBatches);

      const result = await service.findAll();
      expect(result.data).toHaveLength(2);
      expect(result.message).toBe('Batches fetched successfully');
      expect(mockPrisma.batch.findMany).toHaveBeenCalledWith({
        where: {},
        include: {
          department: true,
          course: true,
          _count: {
            select: {
              students: true,
              sections: true,
            },
          },
        },
        orderBy: { startYear: 'desc' },
      });
    });

    it('should filter batches by departmentId when provided', async () => {
      mockPrisma.batch.findMany.mockResolvedValueOnce([]);

      const result = await service.findAll('dept-123');
      expect(result.data).toEqual([]);
      expect(mockPrisma.batch.findMany).toHaveBeenCalledWith({
        where: { departmentId: 'dept-123' },
        include: {
          department: true,
          course: true,
          _count: {
            select: {
              students: true,
              sections: true,
            },
          },
        },
        orderBy: { startYear: 'desc' },
      });
    });

    it('should filter batches by courseId when provided', async () => {
      mockPrisma.batch.findMany.mockResolvedValueOnce([]);

      await service.findAll(undefined, 'course-123');
      expect(mockPrisma.batch.findMany).toHaveBeenCalledWith({
        where: { courseId: 'course-123' },
        include: {
          department: true,
          course: true,
          _count: {
            select: {
              students: true,
              sections: true,
            },
          },
        },
        orderBy: { startYear: 'desc' },
      });
    });

    it('should filter batches by both departmentId and courseId when provided', async () => {
      mockPrisma.batch.findMany.mockResolvedValueOnce([]);

      await service.findAll('dept-1', 'course-1');
      expect(mockPrisma.batch.findMany).toHaveBeenCalledWith({
        where: { departmentId: 'dept-1', courseId: 'course-1' },
        include: {
          department: true,
          course: true,
          _count: {
            select: {
              students: true,
              sections: true,
            },
          },
        },
        orderBy: { startYear: 'desc' },
      });
    });
  });

  describe('findOne', () => {
    it('should return batch details with department, course, students, sections, and counts', async () => {
      const mockBatch = {
        id: 'batch-1',
        name: '2023-2027 CSE Batch',
        code: '2023-CSE',
        startYear: 2023,
        endYear: 2027,
        departmentId: 'dept-1',
        courseId: 'course-1',
        department: { id: 'dept-1', name: 'Computer Science' },
        course: { id: 'course-1', name: 'B.Tech CSE' },
        students: [
          {
            id: 'student-1',
            studentId: 'STU001',
            user: { name: 'John Doe', email: 'john@example.com' },
          },
        ],
        sections: [{ id: 'sec-1', name: 'Section A' }],
        _count: { students: 1, sections: 1 },
      };
      mockPrisma.batch.findUnique.mockResolvedValueOnce(mockBatch);

      const result = await service.findOne('batch-1');
      expect(result.data).toEqual(mockBatch);
      expect(result.message).toBe('Batch details fetched successfully');
      expect(mockPrisma.batch.findUnique).toHaveBeenCalledWith({
        where: { id: 'batch-1' },
        include: {
          department: true,
          course: true,
          students: {
            include: {
              user: {
                select: {
                  name: true,
                  email: true,
                },
              },
            },
          },
          sections: true,
          _count: {
            select: {
              students: true,
              sections: true,
            },
          },
        },
      });
    });

    it('should throw NotFoundException if batch is not found', async () => {
      mockPrisma.batch.findUnique.mockResolvedValueOnce(null);

      await expect(service.findOne('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    const createDto = {
      name: ' 2023-2027 CSE Batch ',
      code: ' 2023-cse ',
      startYear: 2023,
      endYear: 2027,
      departmentId: 'dept-1',
      courseId: 'course-1',
    };

    it('should successfully create a batch', async () => {
      mockPrisma.batch.findUnique.mockResolvedValueOnce(null);
      mockPrisma.department.findUnique.mockResolvedValueOnce({
        id: 'dept-1',
        name: 'Computer Science',
      });
      mockPrisma.course.findUnique.mockResolvedValueOnce({
        id: 'course-1',
        name: 'B.Tech CSE',
        departmentId: 'dept-1',
      });
      const createdBatch = {
        id: 'batch-1',
        name: '2023-2027 CSE Batch',
        code: '2023-CSE',
        startYear: 2023,
        endYear: 2027,
        departmentId: 'dept-1',
        courseId: 'course-1',
        department: { id: 'dept-1', name: 'Computer Science' },
        course: { id: 'course-1', name: 'B.Tech CSE' },
      };
      mockPrisma.batch.create.mockResolvedValueOnce(createdBatch);

      const result = await service.create(createDto);

      expect(mockPrisma.batch.create).toHaveBeenCalledWith({
        data: {
          name: '2023-2027 CSE Batch',
          code: '2023-CSE',
          startYear: 2023,
          endYear: 2027,
          departmentId: 'dept-1',
          courseId: 'course-1',
        },
        include: {
          department: true,
          course: true,
        },
      });
      expect(result.message).toBe('Batch created successfully');
      expect(result.data).toEqual(createdBatch);
    });

    it('should throw BadRequestException for invalid years (endYear <= startYear)', async () => {
      await expect(
        service.create({
          ...createDto,
          startYear: 2025,
          endYear: 2023,
        }),
      ).rejects.toThrow(BadRequestException);

      await expect(
        service.create({
          ...createDto,
          startYear: 2025,
          endYear: 2025,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw ConflictException for duplicate code', async () => {
      mockPrisma.batch.findUnique.mockResolvedValueOnce({
        id: 'existing-batch',
        code: '2023-CSE',
      });

      await expect(service.create(createDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw NotFoundException if department does not exist', async () => {
      mockPrisma.batch.findUnique.mockResolvedValueOnce(null);
      mockPrisma.department.findUnique.mockResolvedValueOnce(null);

      await expect(service.create(createDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if course does not exist', async () => {
      mockPrisma.batch.findUnique.mockResolvedValueOnce(null);
      mockPrisma.department.findUnique.mockResolvedValueOnce({
        id: 'dept-1',
      });
      mockPrisma.course.findUnique.mockResolvedValueOnce(null);

      await expect(service.create(createDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if course does not belong to department', async () => {
      mockPrisma.batch.findUnique.mockResolvedValueOnce(null);
      mockPrisma.department.findUnique.mockResolvedValueOnce({
        id: 'dept-1',
      });
      mockPrisma.course.findUnique.mockResolvedValueOnce({
        id: 'course-1',
        departmentId: 'dept-2',
      });

      await expect(service.create(createDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('update', () => {
    const existingBatch = {
      id: 'batch-1',
      name: '2023-2027 CSE Batch',
      code: '2023-CSE',
      startYear: 2023,
      endYear: 2027,
      departmentId: 'dept-1',
      courseId: 'course-1',
    };

    it('should update batch successfully', async () => {
      mockPrisma.batch.findUnique.mockResolvedValueOnce(existingBatch);
      const updatedBatch = {
        ...existingBatch,
        name: 'Updated Batch Name',
        department: { id: 'dept-1' },
        course: { id: 'course-1' },
      };
      mockPrisma.batch.update.mockResolvedValueOnce(updatedBatch);

      const result = await service.update('batch-1', {
        name: 'Updated Batch Name',
      });

      expect(result.message).toBe('Batch updated successfully');
      expect(mockPrisma.batch.update).toHaveBeenCalledWith({
        where: { id: 'batch-1' },
        data: { name: 'Updated Batch Name' },
        include: { department: true, course: true },
      });
    });

    it('should throw NotFoundException if batch to update does not exist', async () => {
      mockPrisma.batch.findUnique.mockResolvedValueOnce(null);

      await expect(
        service.update('missing-id', { name: 'New Name' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException if new code is already in use', async () => {
      mockPrisma.batch.findUnique.mockResolvedValueOnce(existingBatch);
      mockPrisma.batch.findUnique.mockResolvedValueOnce({
        id: 'other-batch',
        code: 'NEW-CODE',
      });

      await expect(
        service.update('batch-1', { code: 'new-code' }),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw BadRequestException if updated years are invalid', async () => {
      mockPrisma.batch.findUnique.mockResolvedValueOnce(existingBatch);

      await expect(
        service.update('batch-1', { startYear: 2028 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if new department does not exist', async () => {
      mockPrisma.batch.findUnique.mockResolvedValueOnce(existingBatch);
      mockPrisma.department.findUnique.mockResolvedValueOnce(null);

      await expect(
        service.update('batch-1', { departmentId: 'missing-dept' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if course does not belong to new department', async () => {
      mockPrisma.batch.findUnique.mockResolvedValueOnce(existingBatch);
      mockPrisma.department.findUnique.mockResolvedValueOnce({ id: 'dept-2' });
      mockPrisma.course.findUnique.mockResolvedValueOnce({
        id: 'course-1',
        departmentId: 'dept-1',
      });

      await expect(
        service.update('batch-1', { departmentId: 'dept-2' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    it('should remove batch successfully when no students or sections exist', async () => {
      mockPrisma.batch.findUnique.mockResolvedValueOnce({
        id: 'batch-1',
        _count: { students: 0, sections: 0 },
      });
      mockPrisma.batch.delete.mockResolvedValueOnce({ id: 'batch-1' });

      const result = await service.remove('batch-1');
      expect(result.message).toBe('Batch deleted successfully');
      expect(result.data).toBeNull();
      expect(mockPrisma.batch.delete).toHaveBeenCalledWith({
        where: { id: 'batch-1' },
      });
    });

    it('should throw NotFoundException if batch to remove is not found', async () => {
      mockPrisma.batch.findUnique.mockResolvedValueOnce(null);

      await expect(service.remove('missing-id')).rejects.toThrow(
        NotFoundException,
      );
      expect(mockPrisma.batch.delete).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when students exist', async () => {
      mockPrisma.batch.findUnique.mockResolvedValueOnce({
        id: 'batch-1',
        _count: { students: 5, sections: 0 },
      });

      await expect(service.remove('batch-1')).rejects.toThrow(
        ConflictException,
      );
      expect(mockPrisma.batch.delete).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when sections exist', async () => {
      mockPrisma.batch.findUnique.mockResolvedValueOnce({
        id: 'batch-1',
        _count: { students: 0, sections: 2 },
      });

      await expect(service.remove('batch-1')).rejects.toThrow(
        ConflictException,
      );
      expect(mockPrisma.batch.delete).not.toHaveBeenCalled();
    });
  });
});
