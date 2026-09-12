import { Test, TestingModule } from '@nestjs/testing';
import { CourseSemestersController } from './course-semesters.controller';
import { CourseSemestersService } from './course-semesters.service';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

describe('CourseSemestersController', () => {
  let controller: CourseSemestersController;
  let service: CourseSemestersService;
  let reflector: Reflector;

  const mockCourseSemestersService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CourseSemestersController],
      providers: [
        {
          provide: CourseSemestersService,
          useValue: mockCourseSemestersService,
        },
        Reflector,
      ],
    }).compile();

    controller = module.get<CourseSemestersController>(
      CourseSemestersController,
    );
    service = module.get<CourseSemestersService>(CourseSemestersService);
    reflector = module.get<Reflector>(Reflector);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('findAll delegates to service', async () => {
      const mockResult = {
        message: 'Course semester mappings fetched successfully',
        data: [{ id: 'cs-1' }],
      };
      mockCourseSemestersService.findAll.mockResolvedValueOnce(mockResult);

      const result = await controller.findAll('course-1', 'ay-1', '2');

      expect(result).toBe(mockResult);
      expect(mockCourseSemestersService.findAll).toHaveBeenCalledWith({
        courseId: 'course-1',
        academicYearId: 'ay-1',
        semesterNumber: 2,
      });
    });

    it('findAll delegates to service with undefined filters when omitted', async () => {
      const mockResult = {
        message: 'Course semester mappings fetched successfully',
        data: [],
      };
      mockCourseSemestersService.findAll.mockResolvedValueOnce(mockResult);

      const result = await controller.findAll();

      expect(result).toBe(mockResult);
      expect(mockCourseSemestersService.findAll).toHaveBeenCalledWith({
        courseId: undefined,
        academicYearId: undefined,
        semesterNumber: undefined,
      });
    });
  });

  describe('findOne', () => {
    it('findOne delegates to service', async () => {
      const mockResult = {
        message: 'Course semester mapping details fetched successfully',
        data: { id: 'cs-1' },
      };
      mockCourseSemestersService.findOne.mockResolvedValueOnce(mockResult);

      const result = await controller.findOne('cs-1');

      expect(result).toBe(mockResult);
      expect(mockCourseSemestersService.findOne).toHaveBeenCalledWith('cs-1');
    });
  });

  describe('create', () => {
    it('should be decorated with @Roles(Role.ADMIN)', () => {
      const roles = reflector.get<Role[]>(ROLES_KEY, controller.create);
      expect(roles).toContain(Role.ADMIN);
    });

    it('create delegates to service', async () => {
      const dto = {
        courseId: 'c-1',
        semesterNumber: 1,
        subjectId: 's-1',
        academicYearId: 'ay-1',
      };
      const mockResult = {
        message: 'Course semester mapping created successfully',
        data: { id: 'cs-1', ...dto },
      };
      mockCourseSemestersService.create.mockResolvedValueOnce(mockResult);

      const result = await controller.create(dto);

      expect(result).toBe(mockResult);
      expect(mockCourseSemestersService.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('update', () => {
    it('should be decorated with @Roles(Role.ADMIN)', () => {
      const roles = reflector.get<Role[]>(ROLES_KEY, controller.update);
      expect(roles).toContain(Role.ADMIN);
    });

    it('update delegates to service', async () => {
      const dto = { semesterNumber: 2 };
      const mockResult = {
        message: 'Course semester mapping updated successfully',
        data: { id: 'cs-1', semesterNumber: 2 },
      };
      mockCourseSemestersService.update.mockResolvedValueOnce(mockResult);

      const result = await controller.update('cs-1', dto);

      expect(result).toBe(mockResult);
      expect(mockCourseSemestersService.update).toHaveBeenCalledWith('cs-1', dto);
    });
  });

  describe('remove', () => {
    it('should be decorated with @Roles(Role.ADMIN)', () => {
      const roles = reflector.get<Role[]>(ROLES_KEY, controller.remove);
      expect(roles).toContain(Role.ADMIN);
    });

    it('remove delegates to service', async () => {
      const mockResult = {
        message: 'Course semester mapping deleted successfully',
        data: null,
      };
      mockCourseSemestersService.remove.mockResolvedValueOnce(mockResult);

      const result = await controller.remove('cs-1');

      expect(result).toBe(mockResult);
      expect(mockCourseSemestersService.remove).toHaveBeenCalledWith('cs-1');
    });
  });
});
