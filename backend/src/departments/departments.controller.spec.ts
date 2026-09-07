import { Test, TestingModule } from '@nestjs/testing';
import { DepartmentsController } from './departments.controller';
import { DepartmentsService } from './departments.service';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../common/decorators/public.decorator';
import { ROLES_KEY } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

describe('DepartmentsController', () => {
  let controller: DepartmentsController;
  let service: DepartmentsService;
  let reflector: Reflector;

  const mockDepartmentsService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DepartmentsController],
      providers: [
        { provide: DepartmentsService, useValue: mockDepartmentsService },
        Reflector,
      ],
    }).compile();

    controller = module.get<DepartmentsController>(DepartmentsController);
    service = module.get<DepartmentsService>(DepartmentsService);
    reflector = module.get<Reflector>(Reflector);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should be marked as @Public() so registration page can fetch departments without authentication', () => {
      const isPublic = reflector.get<boolean>(IS_PUBLIC_KEY, controller.findAll);
      expect(isPublic).toBe(true);
    });

    it('should call service.findAll and return response', async () => {
      const mockResult = {
        message: 'Departments fetched successfully',
        data: [{ id: '1', name: 'Computer Science', code: 'CSE' }],
      };
      mockDepartmentsService.findAll.mockResolvedValueOnce(mockResult);

      const result = await controller.findAll();
      expect(result).toBe(mockResult);
      expect(mockDepartmentsService.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should call service.findOne with id', async () => {
      const mockResult = {
        message: 'Department details fetched successfully',
        data: { id: 'dept-1', name: 'Computer Science', code: 'CSE' },
      };
      mockDepartmentsService.findOne.mockResolvedValueOnce(mockResult);

      const result = await controller.findOne('dept-1');
      expect(result).toBe(mockResult);
      expect(mockDepartmentsService.findOne).toHaveBeenCalledWith('dept-1');
    });
  });

  describe('create', () => {
    it('should be decorated with @Roles(Role.ADMIN)', () => {
      const roles = reflector.get<Role[]>(ROLES_KEY, controller.create);
      expect(roles).toContain(Role.ADMIN);
    });

    it('should call service.create with dto', async () => {
      const dto = { name: 'Computer Science', code: 'CSE', description: 'Desc' };
      const mockResult = {
        message: 'Department created successfully',
        data: { id: 'dept-1', ...dto },
      };
      mockDepartmentsService.create.mockResolvedValueOnce(mockResult);

      const result = await controller.create(dto);
      expect(result).toBe(mockResult);
      expect(mockDepartmentsService.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('update', () => {
    it('should be decorated with @Roles(Role.ADMIN)', () => {
      const roles = reflector.get<Role[]>(ROLES_KEY, controller.update);
      expect(roles).toContain(Role.ADMIN);
    });

    it('should call service.update with id and dto', async () => {
      const dto = { name: 'Updated Name' };
      const mockResult = {
        message: 'Department updated successfully',
        data: { id: 'dept-1', name: 'Updated Name', code: 'CSE' },
      };
      mockDepartmentsService.update.mockResolvedValueOnce(mockResult);

      const result = await controller.update('dept-1', dto);
      expect(result).toBe(mockResult);
      expect(mockDepartmentsService.update).toHaveBeenCalledWith('dept-1', dto);
    });
  });

  describe('remove', () => {
    it('should be decorated with @Roles(Role.ADMIN)', () => {
      const roles = reflector.get<Role[]>(ROLES_KEY, controller.remove);
      expect(roles).toContain(Role.ADMIN);
    });

    it('should call service.remove with id', async () => {
      const mockResult = {
        message: 'Department deleted successfully',
        data: null,
      };
      mockDepartmentsService.remove.mockResolvedValueOnce(mockResult);

      const result = await controller.remove('dept-1');
      expect(result).toBe(mockResult);
      expect(mockDepartmentsService.remove).toHaveBeenCalledWith('dept-1');
    });
  });
});
