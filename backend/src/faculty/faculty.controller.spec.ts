import { Test, TestingModule } from '@nestjs/testing';
import { FacultyController } from './faculty.controller';
import { FacultyService } from './faculty.service';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

describe('FacultyController', () => {
  let controller: FacultyController;
  let service: FacultyService;
  let reflector: Reflector;

  const mockFacultyService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FacultyController],
      providers: [
        { provide: FacultyService, useValue: mockFacultyService },
        Reflector,
      ],
    }).compile();

    controller = module.get<FacultyController>(FacultyController);
    service = module.get<FacultyService>(FacultyService);
    reflector = module.get<Reflector>(Reflector);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should call service.findAll with departmentId and return list', async () => {
      const mockResult = {
        message: 'Faculty members retrieved successfully',
        data: [{ id: 'fac-1', facultyId: 'FAC-001' }],
      };
      mockFacultyService.findAll.mockResolvedValueOnce(mockResult);

      const result = await controller.findAll('dept-1');
      expect(result).toBe(mockResult);
      expect(mockFacultyService.findAll).toHaveBeenCalledWith('dept-1');
    });
  });

  describe('findOne', () => {
    it('should call service.findOne with id and return faculty details', async () => {
      const mockResult = {
        message: 'Faculty details retrieved successfully',
        data: { id: 'fac-1', facultyId: 'FAC-001' },
      };
      mockFacultyService.findOne.mockResolvedValueOnce(mockResult);

      const result = await controller.findOne('fac-1');
      expect(result).toBe(mockResult);
      expect(mockFacultyService.findOne).toHaveBeenCalledWith('fac-1');
    });
  });

  describe('create', () => {
    it('should be decorated with @Roles(Role.ADMIN)', () => {
      const roles = reflector.get<Role[]>(ROLES_KEY, controller.create);
      expect(roles).toContain(Role.ADMIN);
    });

    it('should call service.create with dto', async () => {
      const dto = {
        name: 'Dr. Turing',
        email: 'alan@turing.edu',
        password: 'Password123',
        facultyId: 'FAC-001',
        departmentId: 'dept-1',
        designation: 'Professor',
      };
      const mockResult = {
        message: 'Faculty created successfully',
        data: { id: 'fac-1', ...dto },
      };
      mockFacultyService.create.mockResolvedValueOnce(mockResult);

      const result = await controller.create(dto);
      expect(result).toBe(mockResult);
      expect(mockFacultyService.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('update', () => {
    it('should be decorated with @Roles(Role.ADMIN)', () => {
      const roles = reflector.get<Role[]>(ROLES_KEY, controller.update);
      expect(roles).toContain(Role.ADMIN);
    });

    it('should call service.update with id and dto', async () => {
      const dto = { designation: 'Dean' };
      const mockResult = {
        message: 'Faculty updated successfully',
        data: { id: 'fac-1', designation: 'Dean' },
      };
      mockFacultyService.update.mockResolvedValueOnce(mockResult);

      const result = await controller.update('fac-1', dto);
      expect(result).toBe(mockResult);
      expect(mockFacultyService.update).toHaveBeenCalledWith('fac-1', dto);
    });
  });

  describe('remove', () => {
    it('should be decorated with @Roles(Role.ADMIN)', () => {
      const roles = reflector.get<Role[]>(ROLES_KEY, controller.remove);
      expect(roles).toContain(Role.ADMIN);
    });

    it('should call service.remove with id', async () => {
      const mockResult = {
        message: 'Faculty deleted successfully',
        data: null,
      };
      mockFacultyService.remove.mockResolvedValueOnce(mockResult);

      const result = await controller.remove('fac-1');
      expect(result).toBe(mockResult);
      expect(mockFacultyService.remove).toHaveBeenCalledWith('fac-1');
    });
  });
});
