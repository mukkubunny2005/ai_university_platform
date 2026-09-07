import { Test, TestingModule } from '@nestjs/testing';
import { SubjectsService } from './subjects.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('SubjectsService', () => {
  let service: SubjectsService;
  let prisma: any;

  const mockPrisma = {
    subject: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    course: {
      findUnique: jest.fn(),
    },
    faculty: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubjectsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<SubjectsService>(SubjectsService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all subjects', async () => {
      const mockSubjects = [
        { id: '1', name: 'DSA', code: 'CS201', credits: 4 },
        { id: '2', name: 'OS', code: 'CS202', credits: 3 },
      ];
      mockPrisma.subject.findMany.mockResolvedValueOnce(mockSubjects);

      const result = await service.findAll();
      expect(result.data).toHaveLength(2);
      expect(result.message).toBe('Subjects fetched successfully');
      expect(mockPrisma.subject.findMany).toHaveBeenCalledWith({
        where: {},
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
    });

    it('should filter by courseId and facultyId when provided', async () => {
      mockPrisma.subject.findMany.mockResolvedValueOnce([]);

      await service.findAll('course-1', 'fac-1');
      expect(mockPrisma.subject.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { courseId: 'course-1', facultyId: 'fac-1' },
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return subject details if found', async () => {
      const mockSubject = { id: 's-1', name: 'DSA', code: 'CS201' };
      mockPrisma.subject.findUnique.mockResolvedValueOnce(mockSubject);

      const result = await service.findOne('s-1');
      expect(result.data).toEqual(mockSubject);
      expect(result.message).toBe('Subject details fetched successfully');
    });

    it('should throw NotFoundException if subject does not exist', async () => {
      mockPrisma.subject.findUnique.mockResolvedValueOnce(null);

      await expect(service.findOne('invalid-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create subject without faculty successfully', async () => {
      mockPrisma.subject.findUnique.mockResolvedValueOnce(null);
      mockPrisma.course.findUnique.mockResolvedValueOnce({ id: 'c-1', name: 'B.Tech' });
      mockPrisma.subject.create.mockResolvedValueOnce({
        id: 's-1',
        name: 'Data Structures',
        code: 'CS201',
        credits: 4,
        courseId: 'c-1',
        facultyId: null,
      });

      const result = await service.create({
        name: '  Data Structures  ',
        code: 'cs201 ',
        credits: 4,
        courseId: 'c-1',
      });

      expect(mockPrisma.subject.create).toHaveBeenCalledWith({
        data: {
          name: 'Data Structures',
          code: 'CS201',
          credits: 4,
          courseId: 'c-1',
          facultyId: null,
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
      expect(result.data.code).toBe('CS201');
    });

    it('should create subject with faculty successfully', async () => {
      mockPrisma.subject.findUnique.mockResolvedValueOnce(null);
      mockPrisma.course.findUnique.mockResolvedValueOnce({ id: 'c-1', name: 'B.Tech' });
      mockPrisma.faculty.findUnique.mockResolvedValueOnce({ id: 'fac-1', facultyId: 'FAC001' });
      mockPrisma.subject.create.mockResolvedValueOnce({
        id: 's-1',
        name: 'Data Structures',
        code: 'CS201',
        credits: 3,
        courseId: 'c-1',
        facultyId: 'fac-1',
      });

      const result = await service.create({
        name: 'Data Structures',
        code: 'CS201',
        courseId: 'c-1',
        facultyId: 'fac-1',
      });

      expect(result.data.facultyId).toBe('fac-1');
      expect(mockPrisma.subject.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ credits: 3, facultyId: 'fac-1' }),
        }),
      );
    });

    it('should throw ConflictException if subject code already exists', async () => {
      mockPrisma.subject.findUnique.mockResolvedValueOnce({ id: 's-existing', code: 'CS201' });

      await expect(
        service.create({
          name: 'Duplicate Subject',
          code: 'CS201',
          courseId: 'c-1',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw NotFoundException if course does not exist', async () => {
      mockPrisma.subject.findUnique.mockResolvedValueOnce(null);
      mockPrisma.course.findUnique.mockResolvedValueOnce(null);

      await expect(
        service.create({
          name: 'Subject',
          code: 'CS999',
          courseId: 'non-existent-course',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if assigned faculty does not exist', async () => {
      mockPrisma.subject.findUnique.mockResolvedValueOnce(null);
      mockPrisma.course.findUnique.mockResolvedValueOnce({ id: 'c-1' });
      mockPrisma.faculty.findUnique.mockResolvedValueOnce(null);

      await expect(
        service.create({
          name: 'Subject',
          code: 'CS999',
          courseId: 'c-1',
          facultyId: 'non-existent-faculty',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update subject details successfully', async () => {
      mockPrisma.subject.findUnique.mockResolvedValueOnce({
        id: 's-1',
        name: 'Old Name',
        code: 'OLD101',
      });
      mockPrisma.subject.update.mockResolvedValueOnce({
        id: 's-1',
        name: 'New Name',
        code: 'OLD101',
      });

      const result = await service.update('s-1', { name: 'New Name' });
      expect(result.message).toBe('Subject updated successfully');
      expect(mockPrisma.subject.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 's-1' },
          data: { name: 'New Name' },
        }),
      );
    });

    it('should unassign faculty when facultyId is null', async () => {
      mockPrisma.subject.findUnique.mockResolvedValueOnce({
        id: 's-1',
        name: 'Subject',
        code: 'CS101',
        facultyId: 'fac-1',
      });
      mockPrisma.subject.update.mockResolvedValueOnce({
        id: 's-1',
        facultyId: null,
      });

      await service.update('s-1', { facultyId: null });
      expect(mockPrisma.subject.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { facultyId: null },
        }),
      );
    });

    it('should throw NotFoundException if subject does not exist', async () => {
      mockPrisma.subject.findUnique.mockResolvedValueOnce(null);

      await expect(service.update('invalid-id', { name: 'Any' })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ConflictException if new code belongs to another subject', async () => {
      mockPrisma.subject.findUnique.mockResolvedValueOnce({
        id: 's-1',
        code: 'CS101',
      });
      // Code uniqueness check finds another subject
      mockPrisma.subject.findUnique.mockResolvedValueOnce({
        id: 's-2',
        code: 'CS102',
      });

      await expect(service.update('s-1', { code: 'CS102' })).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw NotFoundException if new course does not exist', async () => {
      mockPrisma.subject.findUnique.mockResolvedValueOnce({
        id: 's-1',
        code: 'CS101',
      });
      mockPrisma.course.findUnique.mockResolvedValueOnce(null);

      await expect(service.update('s-1', { courseId: 'missing-course' })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if new faculty does not exist', async () => {
      mockPrisma.subject.findUnique.mockResolvedValueOnce({
        id: 's-1',
        code: 'CS101',
      });
      mockPrisma.faculty.findUnique.mockResolvedValueOnce(null);

      await expect(service.update('s-1', { facultyId: 'missing-faculty' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should delete subject successfully', async () => {
      mockPrisma.subject.findUnique.mockResolvedValueOnce({ id: 's-1', name: 'DSA' });
      mockPrisma.subject.delete.mockResolvedValueOnce({ id: 's-1' });

      const result = await service.remove('s-1');
      expect(result.message).toBe('Subject deleted successfully');
      expect(mockPrisma.subject.delete).toHaveBeenCalledWith({ where: { id: 's-1' } });
    });

    it('should throw NotFoundException if subject does not exist', async () => {
      mockPrisma.subject.findUnique.mockResolvedValueOnce(null);

      await expect(service.remove('missing-id')).rejects.toThrow(NotFoundException);
    });
  });
});
