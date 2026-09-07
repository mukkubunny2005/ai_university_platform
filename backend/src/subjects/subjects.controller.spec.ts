import { Test, TestingModule } from '@nestjs/testing';
import { SubjectsController } from './subjects.controller';
import { SubjectsService } from './subjects.service';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

describe('SubjectsController', () => {
  let controller: SubjectsController;
  let service: SubjectsService;
  let reflector: Reflector;

  const mockSubjectsService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubjectsController],
      providers: [
        { provide: SubjectsService, useValue: mockSubjectsService },
        Reflector,
      ],
    }).compile();

    controller = module.get<SubjectsController>(SubjectsController);
    service = module.get<SubjectsService>(SubjectsService);
    reflector = module.get<Reflector>(Reflector);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should call service.findAll and return subjects list', async () => {
      const mockResult = {
        message: 'Subjects fetched successfully',
        data: [{ id: 's-1', name: 'DSA', code: 'CS201' }],
      };
      mockSubjectsService.findAll.mockResolvedValueOnce(mockResult);

      const result = await controller.findAll('course-1', 'fac-1');
      expect(result).toBe(mockResult);
      expect(mockSubjectsService.findAll).toHaveBeenCalledWith('course-1', 'fac-1');
    });
  });

  describe('findOne', () => {
    it('should call service.findOne with id and return subject details', async () => {
      const mockResult = {
        message: 'Subject details fetched successfully',
        data: { id: 's-1', name: 'DSA', code: 'CS201' },
      };
      mockSubjectsService.findOne.mockResolvedValueOnce(mockResult);

      const result = await controller.findOne('s-1');
      expect(result).toBe(mockResult);
      expect(mockSubjectsService.findOne).toHaveBeenCalledWith('s-1');
    });
  });

  describe('create', () => {
    it('should be decorated with @Roles(Role.ADMIN)', () => {
      const roles = reflector.get<Role[]>(ROLES_KEY, controller.create);
      expect(roles).toContain(Role.ADMIN);
    });

    it('should call service.create with dto', async () => {
      const dto = {
        name: 'Data Structures',
        code: 'CS201',
        courseId: 'c-1',
      };
      const mockResult = {
        message: 'Subject created successfully',
        data: { id: 's-1', ...dto },
      };
      mockSubjectsService.create.mockResolvedValueOnce(mockResult);

      const result = await controller.create(dto);
      expect(result).toBe(mockResult);
      expect(mockSubjectsService.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('update', () => {
    it('should be decorated with @Roles(Role.ADMIN)', () => {
      const roles = reflector.get<Role[]>(ROLES_KEY, controller.update);
      expect(roles).toContain(Role.ADMIN);
    });

    it('should call service.update with id and dto', async () => {
      const dto = { name: 'Advanced DSA' };
      const mockResult = {
        message: 'Subject updated successfully',
        data: { id: 's-1', name: 'Advanced DSA' },
      };
      mockSubjectsService.update.mockResolvedValueOnce(mockResult);

      const result = await controller.update('s-1', dto);
      expect(result).toBe(mockResult);
      expect(mockSubjectsService.update).toHaveBeenCalledWith('s-1', dto);
    });
  });

  describe('remove', () => {
    it('should be decorated with @Roles(Role.ADMIN)', () => {
      const roles = reflector.get<Role[]>(ROLES_KEY, controller.remove);
      expect(roles).toContain(Role.ADMIN);
    });

    it('should call service.remove with id', async () => {
      const mockResult = {
        message: 'Subject deleted successfully',
        data: null,
      };
      mockSubjectsService.remove.mockResolvedValueOnce(mockResult);

      const result = await controller.remove('s-1');
      expect(result).toBe(mockResult);
      expect(mockSubjectsService.remove).toHaveBeenCalledWith('s-1');
    });
  });
});
