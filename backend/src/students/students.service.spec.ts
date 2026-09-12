import { Test, TestingModule } from '@nestjs/testing';
import { StudentsService } from './students.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

jest.mock('bcryptjs');

describe('StudentsService', () => {
  let service: StudentsService;
  let prisma: any;

  const mockPrisma = {
    student: {
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
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StudentsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<StudentsService>(StudentsService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all students', async () => {
      const mockStudents = [
        {
          id: 'stu-1',
          studentId: 'STU-2026-001',
          user: { id: 'u-1', name: 'John Doe', email: 'john@student.edu', role: Role.STUDENT },
          department: { id: 'dept-1', name: 'Computer Science', code: 'CSE' },
          semester: 1,
        },
      ];
      mockPrisma.student.findMany.mockResolvedValueOnce(mockStudents);

      const result = await service.findAll();
      expect(result.data).toHaveLength(1);
      expect(result.message).toBe('Students retrieved successfully');
      expect(mockPrisma.student.findMany).toHaveBeenCalledWith({
        where: {},
        include: {
          user: {
            select: { id: true, name: true, email: true, role: true, createdAt: true },
          },
          department: {
            select: { id: true, name: true, code: true },
          },
          batch: {
            select: { id: true, name: true, code: true },
          },
          section: {
            select: { id: true, name: true, semesterNumber: true },
          },
        },
        orderBy: { studentId: 'asc' },
      });
    });

    it('should filter students by departmentId when provided', async () => {
      mockPrisma.student.findMany.mockResolvedValueOnce([]);

      await service.findAll('dept-123');
      expect(mockPrisma.student.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { departmentId: 'dept-123' },
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return student details for admin or faculty', async () => {
      const mockStudent = {
        id: 'stu-1',
        userId: 'u-1',
        studentId: 'STU-2026-001',
        user: { name: 'John Doe' },
        department: { name: 'CSE', courses: [] },
      };
      mockPrisma.student.findUnique.mockResolvedValueOnce(mockStudent);

      const result = await service.findOne('stu-1', { id: 'admin-id', role: Role.ADMIN });
      expect(result.data).toEqual(mockStudent);
      expect(result.message).toBe('Student details retrieved successfully');
    });

    it('should allow student to access their own record', async () => {
      const mockStudent = {
        id: 'stu-1',
        userId: 'u-1',
        studentId: 'STU-2026-001',
        user: { name: 'John Doe' },
        department: { name: 'CSE', courses: [] },
      };
      mockPrisma.student.findUnique.mockResolvedValueOnce(mockStudent);

      const result = await service.findOne('stu-1', { id: 'u-1', role: Role.STUDENT });
      expect(result.data).toEqual(mockStudent);
    });

    it('should throw ForbiddenException if student tries to access another student record (IDOR)', async () => {
      const mockStudent = {
        id: 'stu-1',
        userId: 'u-1',
        studentId: 'STU-2026-001',
      };
      mockPrisma.student.findUnique.mockResolvedValueOnce(mockStudent);

      await expect(
        service.findOne('stu-1', { id: 'u-different', role: Role.STUDENT }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if student not found', async () => {
      mockPrisma.student.findUnique.mockResolvedValueOnce(null);

      await expect(service.findOne('missing-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create user and student transactionally with hashed password', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce(null);
      mockPrisma.student.findUnique.mockResolvedValueOnce(null);
      mockPrisma.department.findUnique.mockResolvedValueOnce({ id: 'dept-1', name: 'CSE' });
      (bcrypt.hash as jest.Mock).mockResolvedValueOnce('hashed_password_123');

      const mockTx = {
        user: {
          create: jest.fn().mockResolvedValueOnce({ id: 'user-1' }),
        },
        student: {
          create: jest.fn().mockResolvedValueOnce({
            id: 'stu-1',
            studentId: 'STU-2026-001',
            user: { id: 'user-1', name: 'John Doe', email: 'john@student.edu' },
          }),
        },
      };

      mockPrisma.$transaction.mockImplementationOnce((callback: any) => callback(mockTx));

      const result = await service.create({
        name: '  John Doe  ',
        email: '  JOHN@student.edu ',
        password: 'Password123',
        studentId: 'stu-2026-001',
        departmentId: 'dept-1',
        semester: 1,
      });

      expect(bcrypt.hash).toHaveBeenCalledWith('Password123', 10);
      expect(mockTx.user.create).toHaveBeenCalledWith({
        data: {
          name: 'John Doe',
          email: 'john@student.edu',
          passwordHash: 'hashed_password_123',
          role: 'STUDENT',
        },
      });
      expect(mockTx.student.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-1',
          studentId: 'STU-2026-001',
          departmentId: 'dept-1',
          semester: 1,
          batchId: null,
          sectionId: null,
        },
        include: {
          user: {
            select: { id: true, name: true, email: true, role: true, createdAt: true },
          },
          department: true,
          batch: true,
          section: true,
        },
      });
      expect(result.data.studentId).toBe('STU-2026-001');
    });

    it('should throw ConflictException if email already exists', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce({ id: 'existing-user' });

      await expect(
        service.create({
          name: 'John Doe',
          email: 'john@student.edu',
          password: 'Password123',
          studentId: 'STU-2026-001',
          departmentId: 'dept-1',
          semester: 1,
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException if studentId already exists', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce(null);
      mockPrisma.student.findUnique.mockResolvedValueOnce({ id: 'existing-stu' });

      await expect(
        service.create({
          name: 'John Doe',
          email: 'john@student.edu',
          password: 'Password123',
          studentId: 'STU-2026-001',
          departmentId: 'dept-1',
          semester: 1,
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw NotFoundException if department does not exist', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce(null);
      mockPrisma.student.findUnique.mockResolvedValueOnce(null);
      mockPrisma.department.findUnique.mockResolvedValueOnce(null);

      await expect(
        service.create({
          name: 'John Doe',
          email: 'john@student.edu',
          password: 'Password123',
          studentId: 'STU-2026-001',
          departmentId: 'non-existent-dept',
          semester: 1,
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update student and user details successfully', async () => {
      const mockExisting = {
        id: 'stu-1',
        userId: 'user-1',
        studentId: 'STU-2026-001',
        user: { email: 'john@student.edu' },
      };
      mockPrisma.student.findUnique.mockResolvedValueOnce(mockExisting);
      mockPrisma.department.findUnique.mockResolvedValueOnce({ id: 'dept-2' });

      const mockTx = {
        user: { update: jest.fn().mockResolvedValueOnce({}) },
        student: {
          update: jest.fn().mockResolvedValueOnce({
            id: 'stu-1',
            semester: 2,
          }),
        },
      };
      mockPrisma.$transaction.mockImplementationOnce((callback: any) => callback(mockTx));

      const result = await service.update('stu-1', {
        name: 'Johnathan Doe',
        semester: 2,
        departmentId: 'dept-2',
      });

      expect(result.message).toBe('Student updated successfully');
      expect(mockTx.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { name: 'Johnathan Doe' },
      });
      expect(mockTx.student.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'stu-1' },
          data: expect.objectContaining({ semester: 2, departmentId: 'dept-2' }),
        }),
      );
    });

    it('should throw NotFoundException if student not found', async () => {
      mockPrisma.student.findUnique.mockResolvedValueOnce(null);

      await expect(service.update('missing', { name: 'New' })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ConflictException if new email is already in use by another user', async () => {
      mockPrisma.student.findUnique.mockResolvedValueOnce({
        id: 'stu-1',
        user: { email: 'john@student.edu' },
      });
      mockPrisma.user.findUnique.mockResolvedValueOnce({ id: 'other-user' });

      await expect(
        service.update('stu-1', { email: 'other@student.edu' }),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException if new studentId is already in use', async () => {
      mockPrisma.student.findUnique.mockResolvedValueOnce({
        id: 'stu-1',
        studentId: 'STU-2026-001',
        user: { email: 'john@student.edu' },
      });
      mockPrisma.student.findUnique.mockResolvedValueOnce({ id: 'other-stu' });

      await expect(
        service.update('stu-1', { studentId: 'STU-2026-002' }),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw NotFoundException if new department does not exist', async () => {
      mockPrisma.student.findUnique.mockResolvedValueOnce({
        id: 'stu-1',
        studentId: 'STU-2026-001',
        user: { email: 'john@student.edu' },
      });
      mockPrisma.department.findUnique.mockResolvedValueOnce(null);

      await expect(
        service.update('stu-1', { departmentId: 'missing-dept' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete user cascading to student', async () => {
      mockPrisma.student.findUnique.mockResolvedValueOnce({
        id: 'stu-1',
        userId: 'user-1',
      });
      mockPrisma.user.delete.mockResolvedValueOnce({});

      const result = await service.remove('stu-1');
      expect(result.message).toBe('Student deleted successfully');
      expect(mockPrisma.user.delete).toHaveBeenCalledWith({ where: { id: 'user-1' } });
    });

    it('should throw NotFoundException if student to delete is not found', async () => {
      mockPrisma.student.findUnique.mockResolvedValueOnce(null);

      await expect(service.remove('missing')).rejects.toThrow(NotFoundException);
    });
  });
});
