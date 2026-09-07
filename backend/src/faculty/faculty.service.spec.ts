import { Test, TestingModule } from '@nestjs/testing';
import { FacultyService } from './faculty.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConflictException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

jest.mock('bcryptjs');

describe('FacultyService', () => {
  let service: FacultyService;
  let prisma: any;

  const mockPrisma = {
    faculty: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    department: {
      findUnique: jest.fn(),
    },
    subject: {
      updateMany: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FacultyService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<FacultyService>(FacultyService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all faculty members', async () => {
      const mockFaculty = [
        {
          id: 'fac-1',
          facultyId: 'FAC-001',
          user: { name: 'Dr. Turing', email: 'alan@turing.edu' },
          department: { name: 'CSE', code: 'CSE' },
          _count: { subjects: 2 },
        },
      ];
      mockPrisma.faculty.findMany.mockResolvedValueOnce(mockFaculty);

      const result = await service.findAll();
      expect(result.data).toHaveLength(1);
      expect(result.message).toBe('Faculty members retrieved successfully');
      expect(mockPrisma.faculty.findMany).toHaveBeenCalledWith({
        where: {},
        include: {
          user: {
            select: { id: true, name: true, email: true, role: true, createdAt: true },
          },
          department: {
            select: { id: true, name: true, code: true },
          },
          _count: {
            select: { subjects: true },
          },
        },
        orderBy: { facultyId: 'asc' },
      });
    });

    it('should filter faculty by departmentId when provided', async () => {
      mockPrisma.faculty.findMany.mockResolvedValueOnce([]);

      await service.findAll('dept-123');
      expect(mockPrisma.faculty.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { departmentId: 'dept-123' },
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return faculty details with subjects', async () => {
      const mockFac = {
        id: 'fac-1',
        facultyId: 'FAC-001',
        user: { name: 'Dr. Turing' },
        department: { name: 'CSE' },
        subjects: [],
      };
      mockPrisma.faculty.findUnique.mockResolvedValueOnce(mockFac);

      const result = await service.findOne('fac-1');
      expect(result.data).toEqual(mockFac);
      expect(result.message).toBe('Faculty details retrieved successfully');
    });

    it('should throw NotFoundException if faculty not found', async () => {
      mockPrisma.faculty.findUnique.mockResolvedValueOnce(null);

      await expect(service.findOne('missing-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create user and faculty transactionally with hashed password', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce(null);
      mockPrisma.faculty.findUnique.mockResolvedValueOnce(null);
      mockPrisma.department.findUnique.mockResolvedValueOnce({ id: 'dept-1', name: 'CSE' });
      (bcrypt.hash as jest.Mock).mockResolvedValueOnce('hashed_password_123');

      const mockTx = {
        user: {
          create: jest.fn().mockResolvedValueOnce({ id: 'user-1' }),
        },
        faculty: {
          create: jest.fn().mockResolvedValueOnce({
            id: 'fac-1',
            facultyId: 'FAC-001',
            user: { id: 'user-1', name: 'Dr. Turing', email: 'alan@turing.edu' },
          }),
        },
      };

      mockPrisma.$transaction.mockImplementationOnce((callback: any) => callback(mockTx));

      const result = await service.create({
        name: '  Dr. Turing  ',
        email: '  ALAN@turing.edu ',
        password: 'Password123',
        facultyId: 'fac-001',
        departmentId: 'dept-1',
        designation: 'Professor',
      });

      expect(bcrypt.hash).toHaveBeenCalledWith('Password123', 10);
      expect(mockTx.user.create).toHaveBeenCalledWith({
        data: {
          name: 'Dr. Turing',
          email: 'alan@turing.edu',
          passwordHash: 'hashed_password_123',
          role: 'FACULTY',
        },
      });
      expect(mockTx.faculty.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-1',
          facultyId: 'FAC-001',
          departmentId: 'dept-1',
          designation: 'Professor',
        },
        include: {
          user: {
            select: { id: true, name: true, email: true, role: true, createdAt: true },
          },
          department: true,
        },
      });
      expect(result.data.facultyId).toBe('FAC-001');
    });

    it('should throw ConflictException if email already exists', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce({ id: 'existing-user' });

      await expect(
        service.create({
          name: 'Dr. Turing',
          email: 'alan@turing.edu',
          password: 'Password123',
          facultyId: 'FAC-001',
          departmentId: 'dept-1',
          designation: 'Professor',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException if facultyId already exists', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce(null);
      mockPrisma.faculty.findUnique.mockResolvedValueOnce({ id: 'existing-fac' });

      await expect(
        service.create({
          name: 'Dr. Turing',
          email: 'alan@turing.edu',
          password: 'Password123',
          facultyId: 'FAC-001',
          departmentId: 'dept-1',
          designation: 'Professor',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw NotFoundException if department does not exist', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce(null);
      mockPrisma.faculty.findUnique.mockResolvedValueOnce(null);
      mockPrisma.department.findUnique.mockResolvedValueOnce(null);

      await expect(
        service.create({
          name: 'Dr. Turing',
          email: 'alan@turing.edu',
          password: 'Password123',
          facultyId: 'FAC-001',
          departmentId: 'non-existent-dept',
          designation: 'Professor',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update faculty and user details successfully', async () => {
      const mockExisting = {
        id: 'fac-1',
        userId: 'user-1',
        facultyId: 'FAC-001',
        user: { email: 'alan@turing.edu' },
      };
      mockPrisma.faculty.findUnique.mockResolvedValueOnce(mockExisting);
      mockPrisma.department.findUnique.mockResolvedValueOnce({ id: 'dept-2' });

      const mockTx = {
        user: { update: jest.fn().mockResolvedValueOnce({}) },
        faculty: {
          update: jest.fn().mockResolvedValueOnce({
            id: 'fac-1',
            designation: 'Dean',
          }),
        },
      };
      mockPrisma.$transaction.mockImplementationOnce((callback: any) => callback(mockTx));

      const result = await service.update('fac-1', {
        name: 'Dr. Alan Turing, PhD',
        designation: 'Dean',
        departmentId: 'dept-2',
      });

      expect(result.message).toBe('Faculty updated successfully');
      expect(mockTx.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { name: 'Dr. Alan Turing, PhD' },
      });
      expect(mockTx.faculty.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'fac-1' },
          data: expect.objectContaining({ designation: 'Dean', departmentId: 'dept-2' }),
        }),
      );
    });

    it('should throw NotFoundException if faculty not found', async () => {
      mockPrisma.faculty.findUnique.mockResolvedValueOnce(null);

      await expect(service.update('missing', { name: 'New' })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ConflictException if new email is already in use by another user', async () => {
      mockPrisma.faculty.findUnique.mockResolvedValueOnce({
        id: 'fac-1',
        user: { email: 'alan@turing.edu' },
      });
      mockPrisma.user.findUnique.mockResolvedValueOnce({ id: 'other-user' });

      await expect(
        service.update('fac-1', { email: 'other@turing.edu' }),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException if new facultyId is already in use', async () => {
      mockPrisma.faculty.findUnique.mockResolvedValueOnce({
        id: 'fac-1',
        facultyId: 'FAC-001',
        user: { email: 'alan@turing.edu' },
      });
      mockPrisma.faculty.findUnique.mockResolvedValueOnce({ id: 'other-fac' });

      await expect(
        service.update('fac-1', { facultyId: 'FAC-002' }),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw NotFoundException if new department does not exist', async () => {
      mockPrisma.faculty.findUnique.mockResolvedValueOnce({
        id: 'fac-1',
        facultyId: 'FAC-001',
        user: { email: 'alan@turing.edu' },
      });
      mockPrisma.department.findUnique.mockResolvedValueOnce(null);

      await expect(
        service.update('fac-1', { departmentId: 'missing-dept' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should unassign subjects and delete user cascading to faculty', async () => {
      mockPrisma.faculty.findUnique.mockResolvedValueOnce({
        id: 'fac-1',
        userId: 'user-1',
      });

      const mockTx = {
        subject: { updateMany: jest.fn().mockResolvedValueOnce({}) },
        user: { delete: jest.fn().mockResolvedValueOnce({}) },
      };
      mockPrisma.$transaction.mockImplementationOnce((callback: any) => callback(mockTx));

      const result = await service.remove('fac-1');
      expect(result.message).toBe('Faculty deleted successfully');
      expect(mockTx.subject.updateMany).toHaveBeenCalledWith({
        where: { facultyId: 'fac-1' },
        data: { facultyId: null },
      });
      expect(mockTx.user.delete).toHaveBeenCalledWith({ where: { id: 'user-1' } });
    });

    it('should throw NotFoundException if faculty to delete is not found', async () => {
      mockPrisma.faculty.findUnique.mockResolvedValueOnce(null);

      await expect(service.remove('missing')).rejects.toThrow(NotFoundException);
    });
  });
});
