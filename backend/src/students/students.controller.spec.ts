import { Test, TestingModule } from '@nestjs/testing';
import { StudentsController } from './students.controller';
import { StudentsService } from './students.service';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

describe('StudentsController', () => {
  let controller: StudentsController;
  let service: StudentsService;
  let reflector: Reflector;

  const mockStudentsService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StudentsController],
      providers: [
        { provide: StudentsService, useValue: mockStudentsService },
        Reflector,
      ],
    }).compile();

    controller = module.get<StudentsController>(StudentsController);
    service = module.get<StudentsService>(StudentsService);
    reflector = module.get<Reflector>(Reflector);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should be decorated with @Roles(Role.ADMIN, Role.FACULTY)', () => {
      const roles = reflector.get<Role[]>(ROLES_KEY, controller.findAll);
      expect(roles).toContain(Role.ADMIN);
      expect(roles).toContain(Role.FACULTY);
    });

    it('should call service.findAll with departmentId and return list', async () => {
      const mockResult = {
        message: 'Students retrieved successfully',
        data: [{ id: 'stu-1', studentId: 'STU-2026-001' }],
      };
      mockStudentsService.findAll.mockResolvedValueOnce(mockResult);

      const result = await controller.findAll('dept-1');
      expect(result).toBe(mockResult);
      expect(mockStudentsService.findAll).toHaveBeenCalledWith('dept-1');
    });
  });

  describe('findOne', () => {
    it('should call service.findOne with id and current user', async () => {
      const mockUser = { id: 'u-1', role: Role.STUDENT };
      const mockResult = {
        message: 'Student details retrieved successfully',
        data: { id: 'stu-1', studentId: 'STU-2026-001' },
      };
      mockStudentsService.findOne.mockResolvedValueOnce(mockResult);

      const result = await controller.findOne('stu-1', mockUser);
      expect(result).toBe(mockResult);
      expect(mockStudentsService.findOne).toHaveBeenCalledWith('stu-1', mockUser);
    });
  });

  describe('create', () => {
    it('should be decorated with @Roles(Role.ADMIN)', () => {
      const roles = reflector.get<Role[]>(ROLES_KEY, controller.create);
      expect(roles).toContain(Role.ADMIN);
    });

    it('should call service.create with dto', async () => {
      const dto = {
        name: 'John Doe',
        email: 'john@student.edu',
        password: 'Password123',
        studentId: 'STU-2026-001',
        departmentId: 'dept-1',
        semester: 1,
      };
      const mockResult = {
        message: 'Student created successfully',
        data: { id: 'stu-1', ...dto },
      };
      mockStudentsService.create.mockResolvedValueOnce(mockResult);

      const result = await controller.create(dto);
      expect(result).toBe(mockResult);
      expect(mockStudentsService.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('update', () => {
    it('should be decorated with @Roles(Role.ADMIN)', () => {
      const roles = reflector.get<Role[]>(ROLES_KEY, controller.update);
      expect(roles).toContain(Role.ADMIN);
    });

    it('should call service.update with id and dto', async () => {
      const dto = { semester: 2 };
      const mockResult = {
        message: 'Student updated successfully',
        data: { id: 'stu-1', semester: 2 },
      };
      mockStudentsService.update.mockResolvedValueOnce(mockResult);

      const result = await controller.update('stu-1', dto);
      expect(result).toBe(mockResult);
      expect(mockStudentsService.update).toHaveBeenCalledWith('stu-1', dto);
    });
  });

  describe('remove', () => {
    it('should be decorated with @Roles(Role.ADMIN)', () => {
      const roles = reflector.get<Role[]>(ROLES_KEY, controller.remove);
      expect(roles).toContain(Role.ADMIN);
    });

    it('should call service.remove with id', async () => {
      const mockResult = {
        message: 'Student deleted successfully',
        data: null,
      };
      mockStudentsService.remove.mockResolvedValueOnce(mockResult);

      const result = await controller.remove('stu-1');
      expect(result).toBe(mockResult);
      expect(mockStudentsService.remove).toHaveBeenCalledWith('stu-1');
    });
  });
});
