import { Test, TestingModule } from '@nestjs/testing';
import { SectionsController } from './sections.controller';
import { SectionsService } from './sections.service';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { CreateSectionDto, UpdateSectionDto } from './dto/create-section.dto';

describe('SectionsController', () => {
  let controller: SectionsController;
  let service: SectionsService;
  let reflector: Reflector;

  const mockSectionsService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SectionsController],
      providers: [
        { provide: SectionsService, useValue: mockSectionsService },
        Reflector,
      ],
    }).compile();

    controller = module.get<SectionsController>(SectionsController);
    service = module.get<SectionsService>(SectionsService);
    reflector = module.get<Reflector>(Reflector);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('findAll delegates to service with parsed filters', async () => {
      const mockResult = {
        message: 'Sections fetched successfully',
        data: [{ id: 'sec-1', name: 'A' }],
      };
      mockSectionsService.findAll.mockResolvedValueOnce(mockResult);

      const result = await controller.findAll('dept-1', 'course-1', 'batch-1', 'ay-1', '2');

      expect(result).toBe(mockResult);
      expect(mockSectionsService.findAll).toHaveBeenCalledWith({
        departmentId: 'dept-1',
        courseId: 'course-1',
        batchId: 'batch-1',
        academicYearId: 'ay-1',
        semesterNumber: 2,
      });
    });

    it('findAll delegates to service with undefined filters when not provided', async () => {
      const mockResult = {
        message: 'Sections fetched successfully',
        data: [],
      };
      mockSectionsService.findAll.mockResolvedValueOnce(mockResult);

      const result = await controller.findAll();

      expect(result).toBe(mockResult);
      expect(mockSectionsService.findAll).toHaveBeenCalledWith({
        departmentId: undefined,
        courseId: undefined,
        batchId: undefined,
        academicYearId: undefined,
        semesterNumber: undefined,
      });
    });
  });

  describe('findOne', () => {
    it('findOne delegates to service', async () => {
      const mockResult = {
        message: 'Section details fetched successfully',
        data: { id: 'sec-1', name: 'A' },
      };
      mockSectionsService.findOne.mockResolvedValueOnce(mockResult);

      const result = await controller.findOne('sec-1');

      expect(result).toBe(mockResult);
      expect(mockSectionsService.findOne).toHaveBeenCalledWith('sec-1');
    });
  });

  describe('create', () => {
    it('create should be decorated with @Roles(Role.ADMIN)', () => {
      const roles = reflector.get<Role[]>(ROLES_KEY, controller.create);
      expect(roles).toContain(Role.ADMIN);
    });

    it('create delegates to service', async () => {
      const dto: CreateSectionDto = {
        name: 'A',
        semesterNumber: 1,
        departmentId: 'dept-1',
        courseId: 'course-1',
        academicYearId: 'ay-1',
        batchId: 'batch-1',
        maxCapacity: 60,
      };
      const mockResult = {
        message: 'Section created successfully',
        data: { id: 'sec-1', ...dto },
      };
      mockSectionsService.create.mockResolvedValueOnce(mockResult);

      const result = await controller.create(dto);

      expect(result).toBe(mockResult);
      expect(mockSectionsService.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('update', () => {
    it('update should be decorated with @Roles(Role.ADMIN)', () => {
      const roles = reflector.get<Role[]>(ROLES_KEY, controller.update);
      expect(roles).toContain(Role.ADMIN);
    });

    it('update delegates to service', async () => {
      const dto: UpdateSectionDto = {
        name: 'B',
        maxCapacity: 70,
      };
      const mockResult = {
        message: 'Section updated successfully',
        data: { id: 'sec-1', ...dto },
      };
      mockSectionsService.update.mockResolvedValueOnce(mockResult);

      const result = await controller.update('sec-1', dto);

      expect(result).toBe(mockResult);
      expect(mockSectionsService.update).toHaveBeenCalledWith('sec-1', dto);
    });
  });

  describe('remove', () => {
    it('remove should be decorated with @Roles(Role.ADMIN)', () => {
      const roles = reflector.get<Role[]>(ROLES_KEY, controller.remove);
      expect(roles).toContain(Role.ADMIN);
    });

    it('remove delegates to service', async () => {
      const mockResult = {
        message: 'Section deleted successfully',
        data: null,
      };
      mockSectionsService.remove.mockResolvedValueOnce(mockResult);

      const result = await controller.remove('sec-1');

      expect(result).toBe(mockResult);
      expect(mockSectionsService.remove).toHaveBeenCalledWith('sec-1');
    });
  });
});
