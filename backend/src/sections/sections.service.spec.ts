import { Test, TestingModule } from '@nestjs/testing';
import { SectionsService } from './sections.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { CreateSectionDto, UpdateSectionDto } from './dto/create-section.dto';

describe('SectionsService', () => {
  let service: SectionsService;
  let prisma: any;

  const mockPrisma = {
    section: {
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
    academicYear: {
      findUnique: jest.fn(),
    },
    batch: {
      findUnique: jest.fn(),
    },
  };

  const mockSection = {
    id: 'sec-1',
    name: 'A',
    semesterNumber: 1,
    departmentId: 'dept-1',
    courseId: 'course-1',
    academicYearId: 'ay-1',
    batchId: 'batch-1',
    maxCapacity: 60,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    department: { id: 'dept-1', name: 'Computer Science', code: 'CSE' },
    course: { id: 'course-1', name: 'B.Tech CSE', code: 'BTECH-CSE' },
    academicYear: { id: 'ay-1', code: 'AY2026-27', name: '2026-2027' },
    batch: { id: 'batch-1', name: 'Batch 2026', code: 'B2026' },
    _count: { students: 0 },
  };

  const mockSectionWithStudents = {
    ...mockSection,
    students: [
      {
        id: 'stud-1',
        studentId: 'STU001',
        user: {
          name: 'Jane Doe',
          email: 'jane@example.com',
        },
      },
    ],
    _count: { students: 1 },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SectionsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<SectionsService>(SectionsService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('findAll returns sections', async () => {
      mockPrisma.section.findMany.mockResolvedValueOnce([mockSection]);

      const result = await service.findAll();

      expect(result.message).toBe('Sections fetched successfully');
      expect(result.data).toEqual([mockSection]);
      expect(mockPrisma.section.findMany).toHaveBeenCalledWith({
        where: {},
        include: {
          department: true,
          course: true,
          academicYear: true,
          batch: true,
          _count: {
            select: { students: true },
          },
        },
        orderBy: { name: 'asc' },
      });
    });

    it('findAll with filters', async () => {
      mockPrisma.section.findMany.mockResolvedValueOnce([mockSection]);

      const filters = {
        departmentId: 'dept-1',
        courseId: 'course-1',
        batchId: 'batch-1',
        academicYearId: 'ay-1',
        semesterNumber: 1,
      };

      const result = await service.findAll(filters);

      expect(result.message).toBe('Sections fetched successfully');
      expect(result.data).toEqual([mockSection]);
      expect(mockPrisma.section.findMany).toHaveBeenCalledWith({
        where: {
          departmentId: 'dept-1',
          courseId: 'course-1',
          batchId: 'batch-1',
          academicYearId: 'ay-1',
          semesterNumber: 1,
        },
        include: {
          department: true,
          course: true,
          academicYear: true,
          batch: true,
          _count: {
            select: { students: true },
          },
        },
        orderBy: { name: 'asc' },
      });
    });
  });

  describe('findOne', () => {
    it('findOne returns a section', async () => {
      mockPrisma.section.findUnique.mockResolvedValueOnce(mockSectionWithStudents);

      const result = await service.findOne('sec-1');

      expect(result.message).toBe('Section details fetched successfully');
      expect(result.data).toEqual(mockSectionWithStudents);
      expect(mockPrisma.section.findUnique).toHaveBeenCalledWith({
        where: { id: 'sec-1' },
        include: {
          department: true,
          course: true,
          academicYear: true,
          batch: true,
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
          _count: {
            select: { students: true },
          },
        },
      });
    });

    it('findOne throws NotFoundException', async () => {
      mockPrisma.section.findUnique.mockResolvedValueOnce(null);

      await expect(service.findOne('invalid-id')).rejects.toThrow('Section with ID invalid-id not found');
    });
  });

  describe('create', () => {
    const createDto: CreateSectionDto = {
      name: 'A',
      semesterNumber: 1,
      departmentId: 'dept-1',
      courseId: 'course-1',
      academicYearId: 'ay-1',
      batchId: 'batch-1',
      maxCapacity: 60,
    };

    it('create succeeds', async () => {
      mockPrisma.department.findUnique.mockResolvedValueOnce({ id: 'dept-1' });
      mockPrisma.course.findUnique.mockResolvedValueOnce({ id: 'course-1' });
      mockPrisma.academicYear.findUnique.mockResolvedValueOnce({ id: 'ay-1' });
      mockPrisma.batch.findUnique.mockResolvedValueOnce({ id: 'batch-1' });
      mockPrisma.section.findUnique.mockResolvedValueOnce(null);
      mockPrisma.section.create.mockResolvedValueOnce(mockSection);

      const result = await service.create(createDto);

      expect(result.message).toBe('Section created successfully');
      expect(result.data).toEqual(mockSection);
      expect(mockPrisma.section.create).toHaveBeenCalledWith({
        data: {
          name: 'A',
          semesterNumber: 1,
          departmentId: 'dept-1',
          courseId: 'course-1',
          academicYearId: 'ay-1',
          batchId: 'batch-1',
          maxCapacity: 60,
        },
        include: {
          department: true,
          course: true,
          academicYear: true,
          batch: true,
          _count: {
            select: { students: true },
          },
        },
      });
    });

    it('create throws ConflictException for duplicate composite key', async () => {
      mockPrisma.department.findUnique.mockResolvedValueOnce({ id: 'dept-1' });
      mockPrisma.course.findUnique.mockResolvedValueOnce({ id: 'course-1' });
      mockPrisma.academicYear.findUnique.mockResolvedValueOnce({ id: 'ay-1' });
      mockPrisma.batch.findUnique.mockResolvedValueOnce({ id: 'batch-1' });
      mockPrisma.section.findUnique.mockResolvedValueOnce({ id: 'existing-id' });

      await expect(service.create(createDto)).rejects.toThrow('Section with this combination already exists');
    });

    it('create throws NotFoundException if department does not exist', async () => {
      mockPrisma.department.findUnique.mockResolvedValueOnce(null);

      await expect(service.create(createDto)).rejects.toThrow(`Department with ID ${createDto.departmentId} not found`);
    });

    it('create throws NotFoundException if course does not exist', async () => {
      mockPrisma.department.findUnique.mockResolvedValueOnce({ id: 'dept-1' });
      mockPrisma.course.findUnique.mockResolvedValueOnce(null);

      await expect(service.create(createDto)).rejects.toThrow(`Course with ID ${createDto.courseId} not found`);
    });

    it('create throws NotFoundException if academic year does not exist', async () => {
      mockPrisma.department.findUnique.mockResolvedValueOnce({ id: 'dept-1' });
      mockPrisma.course.findUnique.mockResolvedValueOnce({ id: 'course-1' });
      mockPrisma.academicYear.findUnique.mockResolvedValueOnce(null);

      await expect(service.create(createDto)).rejects.toThrow(`Academic year with ID ${createDto.academicYearId} not found`);
    });

    it('create throws NotFoundException if batch does not exist', async () => {
      mockPrisma.department.findUnique.mockResolvedValueOnce({ id: 'dept-1' });
      mockPrisma.course.findUnique.mockResolvedValueOnce({ id: 'course-1' });
      mockPrisma.academicYear.findUnique.mockResolvedValueOnce({ id: 'ay-1' });
      mockPrisma.batch.findUnique.mockResolvedValueOnce(null);

      await expect(service.create(createDto)).rejects.toThrow(`Batch with ID ${createDto.batchId} not found`);
    });
  });

  describe('update', () => {
    const updateDto: UpdateSectionDto = {
      name: 'B',
      maxCapacity: 70,
    };

    it('update succeeds', async () => {
      mockPrisma.section.findUnique
        .mockResolvedValueOnce(mockSection)
        .mockResolvedValueOnce(null);
      mockPrisma.section.update.mockResolvedValueOnce({
        ...mockSection,
        name: 'B',
        maxCapacity: 70,
      });

      const result = await service.update('sec-1', updateDto);

      expect(result.message).toBe('Section updated successfully');
      expect(result.data.name).toBe('B');
      expect(mockPrisma.section.update).toHaveBeenCalledWith({
        where: { id: 'sec-1' },
        data: {
          name: 'B',
          maxCapacity: 70,
        },
        include: {
          department: true,
          course: true,
          academicYear: true,
          batch: true,
          _count: {
            select: { students: true },
          },
        },
      });
    });

    it('update throws NotFoundException if section not found', async () => {
      mockPrisma.section.findUnique.mockResolvedValueOnce(null);

      await expect(service.update('invalid-id', updateDto)).rejects.toThrow('Section with ID invalid-id not found');
    });

    it('update throws ConflictException if duplicate composite key exists', async () => {
      mockPrisma.section.findUnique
        .mockResolvedValueOnce(mockSection)
        .mockResolvedValueOnce({ id: 'other-sec', name: 'B' });

      await expect(service.update('sec-1', updateDto)).rejects.toThrow('Section with this combination already exists');
    });

    it('update validates new departmentId if changed', async () => {
      mockPrisma.section.findUnique.mockResolvedValueOnce(mockSection);
      mockPrisma.department.findUnique.mockResolvedValueOnce(null);

      await expect(service.update('sec-1', { departmentId: 'dept-new' })).rejects.toThrow('Department with ID dept-new not found');
    });

    it('update validates new courseId if changed', async () => {
      mockPrisma.section.findUnique.mockResolvedValueOnce(mockSection);
      mockPrisma.course.findUnique.mockResolvedValueOnce(null);

      await expect(service.update('sec-1', { courseId: 'course-new' })).rejects.toThrow('Course with ID course-new not found');
    });

    it('update validates new academicYearId if changed', async () => {
      mockPrisma.section.findUnique.mockResolvedValueOnce(mockSection);
      mockPrisma.academicYear.findUnique.mockResolvedValueOnce(null);

      await expect(service.update('sec-1', { academicYearId: 'ay-new' })).rejects.toThrow('Academic year with ID ay-new not found');
    });

    it('update validates new batchId if changed', async () => {
      mockPrisma.section.findUnique.mockResolvedValueOnce(mockSection);
      mockPrisma.batch.findUnique.mockResolvedValueOnce(null);

      await expect(service.update('sec-1', { batchId: 'batch-new' })).rejects.toThrow('Batch with ID batch-new not found');
    });
  });

  describe('remove', () => {
    it('remove succeeds', async () => {
      mockPrisma.section.findUnique.mockResolvedValueOnce({
        ...mockSection,
        _count: { students: 0 },
      });
      mockPrisma.section.delete.mockResolvedValueOnce(mockSection);

      const result = await service.remove('sec-1');

      expect(result.message).toBe('Section deleted successfully');
      expect(result.data).toBeNull();
      expect(mockPrisma.section.delete).toHaveBeenCalledWith({ where: { id: 'sec-1' } });
    });

    it('remove throws ConflictException when students assigned', async () => {
      mockPrisma.section.findUnique.mockResolvedValueOnce({
        ...mockSection,
        _count: { students: 5 },
      });

      await expect(service.remove('sec-1')).rejects.toThrow(
        'Cannot delete section because students are assigned to it. Reassign or remove students first.',
      );
    });

    it('remove throws NotFoundException if section not found', async () => {
      mockPrisma.section.findUnique.mockResolvedValueOnce(null);

      await expect(service.remove('invalid-id')).rejects.toThrow('Section with ID invalid-id not found');
    });
  });
});
