import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Role } from '@prisma/client';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: any;
  let jwtService: any;

  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    student: {
      create: jest.fn(),
      findUnique: jest.fn(),
    },
    faculty: {
      create: jest.fn(),
      findUnique: jest.fn(),
    },
    department: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn().mockResolvedValue('mocked.jwt.token'),
    verifyAsync: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === 'JWT_ACCESS_SECRET') return 'test-access-secret';
      if (key === 'JWT_REFRESH_SECRET') return 'test-refresh-secret';
      if (key === 'JWT_ACCESS_EXPIRES_IN') return '15m';
      if (key === 'JWT_REFRESH_EXPIRES_IN') return '7d';
      return null;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should reject registration if passwords do not match', async () => {
      await expect(
        service.register({
          name: 'Jane Doe',
          email: 'jane@test.edu',
          password: 'Password1',
          confirmPassword: 'Password2',
          role: Role.STUDENT,
          departmentId: 'dept-1',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject registration if role is ADMIN', async () => {
      await expect(
        service.register({
          name: 'Fake Admin',
          email: 'admin@test.edu',
          password: 'Password1',
          confirmPassword: 'Password1',
          role: Role.ADMIN,
          departmentId: 'dept-1',
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should reject registration if email already exists', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce({ id: 'existing-id' });

      await expect(
        service.register({
          name: 'John Doe',
          email: 'existing@test.edu',
          password: 'Password1',
          confirmPassword: 'Password1',
          role: Role.STUDENT,
          departmentId: 'dept-1',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should reject registration if departmentId is missing', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce(null);

      await expect(
        service.register({
          name: 'John Doe',
          email: 'new@test.edu',
          password: 'Password1',
          confirmPassword: 'Password1',
          role: Role.STUDENT,
          departmentId: '' as any,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject registration if department does not exist', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce(null);
      mockPrisma.department.findUnique.mockResolvedValueOnce(null);

      await expect(
        service.register({
          name: 'John Doe',
          email: 'new@test.edu',
          password: 'Password1',
          confirmPassword: 'Password1',
          role: Role.STUDENT,
          departmentId: 'non-existent-dept-uuid',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should successfully register a student', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce(null); // duplicate check
      mockPrisma.department.findUnique.mockResolvedValueOnce({ id: 'dept-1' });

      const mockCreatedUser = {
        id: 'user-1',
        email: 'newstudent@test.edu',
        role: Role.STUDENT,
      };

      mockPrisma.$transaction.mockImplementation(async (callback) => {
        return callback({
          user: { create: jest.fn().mockResolvedValue(mockCreatedUser) },
          student: {
            create: jest.fn().mockResolvedValue({ id: 'stu-1' }),
            findUnique: jest.fn().mockResolvedValue(null),
          },
          faculty: {
            create: jest.fn().mockResolvedValue({ id: 'fac-1' }),
            findUnique: jest.fn().mockResolvedValue(null),
          },
        });
      });

      mockPrisma.user.update.mockResolvedValue({ id: 'user-1' });
      jest.spyOn(service, 'getMe').mockResolvedValueOnce({
        id: 'user-1',
        name: 'Jane Student',
        email: 'newstudent@test.edu',
        role: Role.STUDENT,
      } as any);

      const result = await service.register({
        name: 'Jane Student',
        email: 'newstudent@test.edu',
        password: 'Password@123',
        confirmPassword: 'Password@123',
        role: Role.STUDENT,
        departmentId: 'dept-1',
      });

      expect(result.data.tokens.accessToken).toBe('mocked.jwt.token');
      expect(result.data.user.email).toBe('newstudent@test.edu');
    });
  });

  describe('login', () => {
    it('should throw UnauthorizedException for non-existing email', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce(null);

      await expect(
        service.login({
          email: 'unknown@test.edu',
          password: 'Password@123',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for invalid password', async () => {
      const passwordHash = await bcrypt.hash('CorrectPassword', 10);
      mockPrisma.user.findUnique.mockResolvedValueOnce({
        id: 'user-1',
        email: 'user@test.edu',
        passwordHash,
        role: Role.STUDENT,
      });

      await expect(
        service.login({
          email: 'user@test.edu',
          password: 'WrongPassword',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should successfully authenticate and return tokens for valid password', async () => {
      const passwordHash = await bcrypt.hash('ValidPass@123', 10);
      mockPrisma.user.findUnique.mockResolvedValueOnce({
        id: 'user-1',
        name: 'Valid User',
        email: 'user@test.edu',
        passwordHash,
        role: Role.FACULTY,
      });
      mockPrisma.user.update.mockResolvedValue({ id: 'user-1' });

      const result = await service.login({
        email: 'user@test.edu',
        password: 'ValidPass@123',
      });

      expect(result.data.tokens.accessToken).toBe('mocked.jwt.token');
      expect(result.data.user.name).toBe('Valid User');
    });
  });
});
