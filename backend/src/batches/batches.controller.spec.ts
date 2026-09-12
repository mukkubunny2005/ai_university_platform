import { Test, TestingModule } from '@nestjs/testing';
import { BatchesController } from './batches.controller';
import { BatchesService } from './batches.service';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { CreateBatchDto, UpdateBatchDto } from './dto/create-batch.dto';

describe('BatchesController', () => {
  let controller: BatchesController;
  let service: BatchesService;
  let reflector: Reflector;

  const mockBatchesService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BatchesController],
      providers: [
        { provide: BatchesService, useValue: mockBatchesService },
        Reflector,
      ],
    }).compile();

    controller = module.get<BatchesController>(BatchesController);
    service = module.get<BatchesService>(BatchesService);
    reflector = module.get<Reflector>(Reflector);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should delegate to service.findAll with departmentId and courseId', async () => {
      const mockResult = {
        message: 'Batches fetched successfully',
        data: [{ id: 'batch-1', name: '2023-2027 CSE Batch' }],
      };
      mockBatchesService.findAll.mockResolvedValueOnce(mockResult);

      const result = await controller.findAll('dept-1', 'course-1');
      expect(result).toBe(mockResult);
      expect(mockBatchesService.findAll).toHaveBeenCalledWith('dept-1', 'course-1');
    });

    it('should delegate to service.findAll with undefined when query params omitted', async () => {
      const mockResult = {
        message: 'Batches fetched successfully',
        data: [],
      };
      mockBatchesService.findAll.mockResolvedValueOnce(mockResult);

      const result = await controller.findAll();
      expect(result).toBe(mockResult);
      expect(mockBatchesService.findAll).toHaveBeenCalledWith(undefined, undefined);
    });
  });

  describe('findOne', () => {
    it('should delegate to service.findOne with id', async () => {
      const mockResult = {
        message: 'Batch details fetched successfully',
        data: { id: 'batch-1', name: '2023-2027 CSE Batch' },
      };
      mockBatchesService.findOne.mockResolvedValueOnce(mockResult);

      const result = await controller.findOne('batch-1');
      expect(result).toBe(mockResult);
      expect(mockBatchesService.findOne).toHaveBeenCalledWith('batch-1');
    });
  });

  describe('create', () => {
    it('should be decorated with @Roles(Role.ADMIN)', () => {
      const roles = reflector.get<Role[]>(ROLES_KEY, controller.create);
      expect(roles).toContain(Role.ADMIN);
    });

    it('should delegate to service.create with dto', async () => {
      const dto: CreateBatchDto = {
        name: '2023-2027 CSE Batch',
        code: '2023-CSE',
        startYear: 2023,
        endYear: 2027,
        departmentId: 'dept-1',
        courseId: 'course-1',
      };
      const mockResult = {
        message: 'Batch created successfully',
        data: { id: 'batch-1', ...dto },
      };
      mockBatchesService.create.mockResolvedValueOnce(mockResult);

      const result = await controller.create(dto);
      expect(result).toBe(mockResult);
      expect(mockBatchesService.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('update', () => {
    it('should be decorated with @Roles(Role.ADMIN)', () => {
      const roles = reflector.get<Role[]>(ROLES_KEY, controller.update);
      expect(roles).toContain(Role.ADMIN);
    });

    it('should delegate to service.update with id and dto', async () => {
      const dto: UpdateBatchDto = {
        name: 'Updated Batch Name',
      };
      const mockResult = {
        message: 'Batch updated successfully',
        data: { id: 'batch-1', name: 'Updated Batch Name' },
      };
      mockBatchesService.update.mockResolvedValueOnce(mockResult);

      const result = await controller.update('batch-1', dto);
      expect(result).toBe(mockResult);
      expect(mockBatchesService.update).toHaveBeenCalledWith('batch-1', dto);
    });
  });

  describe('remove', () => {
    it('should be decorated with @Roles(Role.ADMIN)', () => {
      const roles = reflector.get<Role[]>(ROLES_KEY, controller.remove);
      expect(roles).toContain(Role.ADMIN);
    });

    it('should delegate to service.remove with id', async () => {
      const mockResult = {
        message: 'Batch deleted successfully',
        data: null,
      };
      mockBatchesService.remove.mockResolvedValueOnce(mockResult);

      const result = await controller.remove('batch-1');
      expect(result).toBe(mockResult);
      expect(mockBatchesService.remove).toHaveBeenCalledWith('batch-1');
    });
  });
});
