import { Test, TestingModule } from '@nestjs/testing';
import { AcademicYearsService } from './academic-years.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';

describe('AcademicYearsService', () => {
  let service: AcademicYearsService;
  let prisma: any;

  const mockPrisma = {
    academicYear: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      delete: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AcademicYearsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<AcademicYearsService>(AcademicYearsService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all academic years ordered by startDate desc with counts', async () => {
      const mockList = [
        {
          id: 'year-2',
          code: '2026-2027',
          name: 'Academic Year 2026-2027',
          startDate: new Date('2026-06-01T00:00:00.000Z'),
          endDate: new Date('2027-05-31T00:00:00.000Z'),
          isActive: false,
          _count: { sections: 4, courseSemesters: 8 },
        },
        {
          id: 'year-1',
          code: '2025-2026',
          name: 'Academic Year 2025-2026',
          startDate: new Date('2025-06-01T00:00:00.000Z'),
          endDate: new Date('2026-05-31T00:00:00.000Z'),
          isActive: true,
          _count: { sections: 6, courseSemesters: 12 },
        },
      ];
      mockPrisma.academicYear.findMany.mockResolvedValueOnce(mockList);

      const result = await service.findAll();

      expect(mockPrisma.academicYear.findMany).toHaveBeenCalledWith({
        orderBy: { startDate: 'desc' },
        include: {
          _count: {
            select: {
              sections: true,
              courseSemesters: true,
            },
          },
        },
      });
      expect(result.data).toHaveLength(2);
      expect(result.data[0].code).toBe('2026-2027');
      expect(result.message).toBe('Academic years fetched successfully');
    });
  });

  describe('findOne', () => {
    it('should return an academic year by id with counts', async () => {
      const mockYear = {
        id: 'year-1',
        code: '2025-2026',
        name: 'Academic Year 2025-2026',
        startDate: new Date('2025-06-01T00:00:00.000Z'),
        endDate: new Date('2026-05-31T00:00:00.000Z'),
        isActive: true,
        _count: { sections: 2, courseSemesters: 4 },
      };
      mockPrisma.academicYear.findUnique.mockResolvedValueOnce(mockYear);

      const result = await service.findOne('year-1');

      expect(mockPrisma.academicYear.findUnique).toHaveBeenCalledWith({
        where: { id: 'year-1' },
        include: {
          _count: {
            select: {
              sections: true,
              courseSemesters: true,
            },
          },
        },
      });
      expect(result.data).toEqual(mockYear);
      expect(result.message).toBe('Academic year details fetched successfully');
    });

    it('should throw NotFoundException if academic year not found', async () => {
      mockPrisma.academicYear.findUnique.mockResolvedValueOnce(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(NotFoundException);
      expect(mockPrisma.academicYear.findUnique).toHaveBeenCalledWith({
        where: { id: 'non-existent' },
        include: {
          _count: {
            select: {
              sections: true,
              courseSemesters: true,
            },
          },
        },
      });
    });
  });

  describe('create', () => {
    const createDto = {
      code: '2025-2026',
      name: 'Academic Year 2025-2026',
      startDate: '2025-06-01T00:00:00.000Z',
      endDate: '2026-05-31T00:00:00.000Z',
      isActive: false,
    };

    it('should create an academic year successfully', async () => {
      mockPrisma.academicYear.findUnique.mockResolvedValueOnce(null);
      const createdYear = {
        id: 'year-1',
        code: '2025-2026',
        name: 'Academic Year 2025-2026',
        startDate: new Date(createDto.startDate),
        endDate: new Date(createDto.endDate),
        isActive: false,
        _count: { sections: 0, courseSemesters: 0 },
      };
      mockPrisma.academicYear.create.mockResolvedValueOnce(createdYear);

      const result = await service.create(createDto);

      expect(mockPrisma.academicYear.findUnique).toHaveBeenCalledWith({
        where: { code: '2025-2026' },
      });
      expect(mockPrisma.academicYear.create).toHaveBeenCalledWith({
        data: {
          code: '2025-2026',
          name: 'Academic Year 2025-2026',
          startDate: new Date(createDto.startDate),
          endDate: new Date(createDto.endDate),
          isActive: false,
        },
        include: {
          _count: {
            select: {
              sections: true,
              courseSemesters: true,
            },
          },
        },
      });
      expect(result.data).toEqual(createdYear);
      expect(result.message).toBe('Academic year created successfully');
    });

    it('should throw ConflictException for duplicate code', async () => {
      mockPrisma.academicYear.findUnique.mockResolvedValueOnce({
        id: 'existing-id',
        code: '2025-2026',
      });

      await expect(service.create(createDto)).rejects.toThrow(ConflictException);
      expect(mockPrisma.academicYear.create).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException for invalid dates when endDate <= startDate', async () => {
      mockPrisma.academicYear.findUnique.mockResolvedValueOnce(null);

      await expect(
        service.create({
          ...createDto,
          startDate: '2026-06-01T00:00:00.000Z',
          endDate: '2025-06-01T00:00:00.000Z',
        }),
      ).rejects.toThrow(BadRequestException);
      expect(mockPrisma.academicYear.create).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException for invalid date format', async () => {
      mockPrisma.academicYear.findUnique.mockResolvedValueOnce(null);

      await expect(
        service.create({
          ...createDto,
          startDate: 'invalid-date',
          endDate: '2026-05-31T00:00:00.000Z',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('update', () => {
    const existingYear = {
      id: 'year-1',
      code: '2025-2026',
      name: 'Academic Year 2025-2026',
      startDate: new Date('2025-06-01T00:00:00.000Z'),
      endDate: new Date('2026-05-31T00:00:00.000Z'),
      isActive: false,
    };

    it('should update an academic year successfully', async () => {
      mockPrisma.academicYear.findUnique.mockResolvedValueOnce(existingYear);
      const updatedYear = {
        ...existingYear,
        name: 'Updated Academic Year 2025-2026',
        _count: { sections: 0, courseSemesters: 0 },
      };
      mockPrisma.academicYear.update.mockResolvedValueOnce(updatedYear);

      const result = await service.update('year-1', {
        name: 'Updated Academic Year 2025-2026',
      });

      expect(mockPrisma.academicYear.update).toHaveBeenCalledWith({
        where: { id: 'year-1' },
        data: {
          name: 'Updated Academic Year 2025-2026',
        },
        include: {
          _count: {
            select: {
              sections: true,
              courseSemesters: true,
            },
          },
        },
      });
      expect(result.data).toEqual(updatedYear);
      expect(result.message).toBe('Academic year updated successfully');
    });

    it('should throw NotFoundException if academic year to update does not exist', async () => {
      mockPrisma.academicYear.findUnique.mockResolvedValueOnce(null);

      await expect(
        service.update('non-existent', { name: 'New Name' }),
      ).rejects.toThrow(NotFoundException);
      expect(mockPrisma.academicYear.update).not.toHaveBeenCalled();
    });

    it('should throw ConflictException if new code already exists', async () => {
      mockPrisma.academicYear.findUnique
        .mockResolvedValueOnce(existingYear)
        .mockResolvedValueOnce({ id: 'year-2', code: '2026-2027' });

      await expect(
        service.update('year-1', { code: '2026-2027' }),
      ).rejects.toThrow(ConflictException);
      expect(mockPrisma.academicYear.update).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if updated endDate <= startDate', async () => {
      mockPrisma.academicYear.findUnique.mockResolvedValueOnce(existingYear);

      await expect(
        service.update('year-1', { endDate: '2024-05-31T00:00:00.000Z' }),
      ).rejects.toThrow(BadRequestException);
      expect(mockPrisma.academicYear.update).not.toHaveBeenCalled();
    });
  });

  describe('activate', () => {
    it('should deactivate others and activate target academic year', async () => {
      const existingYear = {
        id: 'year-1',
        code: '2025-2026',
        name: 'Academic Year 2025-2026',
        startDate: new Date('2025-06-01T00:00:00.000Z'),
        endDate: new Date('2026-05-31T00:00:00.000Z'),
        isActive: false,
      };
      const activatedYear = {
        ...existingYear,
        isActive: true,
        _count: { sections: 2, courseSemesters: 4 },
      };

      mockPrisma.academicYear.findUnique.mockResolvedValueOnce(existingYear);
      mockPrisma.$transaction.mockResolvedValueOnce([
        { count: 3 },
        activatedYear,
      ]);

      const result = await service.activate('year-1');

      expect(mockPrisma.academicYear.findUnique).toHaveBeenCalledWith({
        where: { id: 'year-1' },
      });
      expect(mockPrisma.academicYear.updateMany).toHaveBeenCalledWith({
        where: { id: { not: 'year-1' } },
        data: { isActive: false },
      });
      expect(mockPrisma.academicYear.update).toHaveBeenCalledWith({
        where: { id: 'year-1' },
        data: { isActive: true },
        include: {
          _count: {
            select: {
              sections: true,
              courseSemesters: true,
            },
          },
        },
      });
      expect(mockPrisma.$transaction).toHaveBeenCalled();
      expect(result.data).toEqual(activatedYear);
      expect(result.message).toBe('Academic year activated successfully');
    });

    it('should throw NotFoundException if academic year to activate does not exist', async () => {
      mockPrisma.academicYear.findUnique.mockResolvedValueOnce(null);

      await expect(service.activate('non-existent')).rejects.toThrow(NotFoundException);
      expect(mockPrisma.$transaction).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove academic year when no sections or course semesters exist', async () => {
      const existingYear = {
        id: 'year-1',
        name: 'Academic Year 2025-2026',
        _count: { sections: 0, courseSemesters: 0 },
      };
      mockPrisma.academicYear.findUnique.mockResolvedValueOnce(existingYear);
      mockPrisma.academicYear.delete.mockResolvedValueOnce(existingYear);

      const result = await service.remove('year-1');

      expect(mockPrisma.academicYear.findUnique).toHaveBeenCalledWith({
        where: { id: 'year-1' },
        include: {
          _count: {
            select: {
              sections: true,
              courseSemesters: true,
            },
          },
        },
      });
      expect(mockPrisma.academicYear.delete).toHaveBeenCalledWith({
        where: { id: 'year-1' },
      });
      expect(result.message).toBe('Academic year deleted successfully');
      expect(result.data).toBeNull();
    });

    it('should throw NotFoundException if academic year to remove does not exist', async () => {
      mockPrisma.academicYear.findUnique.mockResolvedValueOnce(null);

      await expect(service.remove('non-existent')).rejects.toThrow(NotFoundException);
      expect(mockPrisma.academicYear.delete).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when sections exist', async () => {
      const existingYear = {
        id: 'year-1',
        name: 'Academic Year 2025-2026',
        _count: { sections: 3, courseSemesters: 0 },
      };
      mockPrisma.academicYear.findUnique.mockResolvedValueOnce(existingYear);

      await expect(service.remove('year-1')).rejects.toThrow(ConflictException);
      expect(mockPrisma.academicYear.delete).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when course semesters exist', async () => {
      const existingYear = {
        id: 'year-1',
        name: 'Academic Year 2025-2026',
        _count: { sections: 0, courseSemesters: 5 },
      };
      mockPrisma.academicYear.findUnique.mockResolvedValueOnce(existingYear);

      await expect(service.remove('year-1')).rejects.toThrow(ConflictException);
      expect(mockPrisma.academicYear.delete).not.toHaveBeenCalled();
    });
  });
});
