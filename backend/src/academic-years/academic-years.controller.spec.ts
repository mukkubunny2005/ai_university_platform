import { Test, TestingModule } from '@nestjs/testing';
import { AcademicYearsController } from './academic-years.controller';
import { AcademicYearsService } from './academic-years.service';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { CreateAcademicYearDto, UpdateAcademicYearDto } from './dto/create-academic-year.dto';

describe('AcademicYearsController', () => {
  let controller: AcademicYearsController;
  let service: AcademicYearsService;
  let reflector: Reflector;

  const mockAcademicYearsService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    activate: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AcademicYearsController],
      providers: [
        { provide: AcademicYearsService, useValue: mockAcademicYearsService },
        Reflector,
      ],
    }).compile();

    controller = module.get<AcademicYearsController>(AcademicYearsController);
    service = module.get<AcademicYearsService>(AcademicYearsService);
    reflector = module.get<Reflector>(Reflector);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should delegate to service.findAll and return result', async () => {
      const mockResult = {
        message: 'Academic years fetched successfully',
        data: [{ id: 'year-1', code: '2025-2026', name: 'Academic Year 2025-2026' }],
      };
      mockAcademicYearsService.findAll.mockResolvedValueOnce(mockResult);

      const result = await controller.findAll();

      expect(result).toBe(mockResult);
      expect(mockAcademicYearsService.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should delegate to service.findOne with id and return result', async () => {
      const mockResult = {
        message: 'Academic year details fetched successfully',
        data: { id: 'year-1', code: '2025-2026', name: 'Academic Year 2025-2026' },
      };
      mockAcademicYearsService.findOne.mockResolvedValueOnce(mockResult);

      const result = await controller.findOne('year-1');

      expect(result).toBe(mockResult);
      expect(mockAcademicYearsService.findOne).toHaveBeenCalledWith('year-1');
    });
  });

  describe('create', () => {
    it('should be decorated with @Roles(Role.ADMIN)', () => {
      const roles = reflector.get<Role[]>(ROLES_KEY, controller.create);
      expect(roles).toContain(Role.ADMIN);
    });

    it('should delegate to service.create with dto and return result', async () => {
      const dto: CreateAcademicYearDto = {
        code: '2025-2026',
        name: 'Academic Year 2025-2026',
        startDate: '2025-06-01T00:00:00.000Z',
        endDate: '2026-05-31T00:00:00.000Z',
        isActive: false,
      };
      const mockResult = {
        message: 'Academic year created successfully',
        data: { id: 'year-1', ...dto },
      };
      mockAcademicYearsService.create.mockResolvedValueOnce(mockResult);

      const result = await controller.create(dto);

      expect(result).toBe(mockResult);
      expect(mockAcademicYearsService.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('update', () => {
    it('should be decorated with @Roles(Role.ADMIN)', () => {
      const roles = reflector.get<Role[]>(ROLES_KEY, controller.update);
      expect(roles).toContain(Role.ADMIN);
    });

    it('should delegate to service.update with id and dto and return result', async () => {
      const dto: UpdateAcademicYearDto = {
        name: 'Updated Academic Year 2025-2026',
      };
      const mockResult = {
        message: 'Academic year updated successfully',
        data: { id: 'year-1', code: '2025-2026', ...dto },
      };
      mockAcademicYearsService.update.mockResolvedValueOnce(mockResult);

      const result = await controller.update('year-1', dto);

      expect(result).toBe(mockResult);
      expect(mockAcademicYearsService.update).toHaveBeenCalledWith('year-1', dto);
    });
  });

  describe('activate', () => {
    it('should be decorated with @Roles(Role.ADMIN)', () => {
      const roles = reflector.get<Role[]>(ROLES_KEY, controller.activate);
      expect(roles).toContain(Role.ADMIN);
    });

    it('should delegate to service.activate with id and return result', async () => {
      const mockResult = {
        message: 'Academic year activated successfully',
        data: { id: 'year-1', code: '2025-2026', isActive: true },
      };
      mockAcademicYearsService.activate.mockResolvedValueOnce(mockResult);

      const result = await controller.activate('year-1');

      expect(result).toBe(mockResult);
      expect(mockAcademicYearsService.activate).toHaveBeenCalledWith('year-1');
    });
  });

  describe('remove', () => {
    it('should be decorated with @Roles(Role.ADMIN)', () => {
      const roles = reflector.get<Role[]>(ROLES_KEY, controller.remove);
      expect(roles).toContain(Role.ADMIN);
    });

    it('should delegate to service.remove with id and return result', async () => {
      const mockResult = {
        message: 'Academic year deleted successfully',
        data: null,
      };
      mockAcademicYearsService.remove.mockResolvedValueOnce(mockResult);

      const result = await controller.remove('year-1');

      expect(result).toBe(mockResult);
      expect(mockAcademicYearsService.remove).toHaveBeenCalledWith('year-1');
    });
  });
});
