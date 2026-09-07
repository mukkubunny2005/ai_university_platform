import { Test, TestingModule } from '@nestjs/testing';
import { CoursesController } from './courses.controller';
import { CoursesService } from './courses.service';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

describe('CoursesController', () => {
  let controller: CoursesController;
  let service: CoursesService;
  let reflector: Reflector;

  const mockCoursesService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CoursesController],
      providers: [
        { provide: CoursesService, useValue: mockCoursesService },
        Reflector,
      ],
    }).compile();

    controller = module.get<CoursesController>(CoursesController);
    service = module.get<CoursesService>(CoursesService);
    reflector = module.get<Reflector>(Reflector);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should call service.findAll with departmentId and return courses', async () => {
      const mockResult = {
        message: 'Courses fetched successfully',
        data: [{ id: '1', name: 'B.Tech CSE', code: 'BTECH-CSE' }],
      };
      mockCoursesService.findAll.mockResolvedValueOnce(mockResult);

      const result = await controller.findAll('dept-1');
      expect(result).toBe(mockResult);
      expect(mockCoursesService.findAll).toHaveBeenCalledWith('dept-1');
    });

    it('should call service.findAll with undefined when no departmentId is provided', async () => {
      const mockResult = {
        message: 'Courses fetched successfully',
        data: [],
      };
      mockCoursesService.findAll.mockResolvedValueOnce(mockResult);

      const result = await controller.findAll();
      expect(result).toBe(mockResult);
      expect(mockCoursesService.findAll).toHaveBeenCalledWith(undefined);
    });
  });

  describe('findOne', () => {
    it('should call service.findOne with id and return course details', async () => {
      const mockResult = {
        message: 'Course details fetched successfully',
        data: { id: 'course-1', name: 'B.Tech CSE', code: 'BTECH-CSE' },
      };
      mockCoursesService.findOne.mockResolvedValueOnce(mockResult);

      const result = await controller.findOne('course-1');
      expect(result).toBe(mockResult);
      expect(mockCoursesService.findOne).toHaveBeenCalledWith('course-1');
    });
  });

  describe('create', () => {
    it('should be decorated with @Roles(Role.ADMIN)', () => {
      const roles = reflector.get<Role[]>(ROLES_KEY, controller.create);
      expect(roles).toContain(Role.ADMIN);
    });

    it('should call service.create with dto', async () => {
      const dto = {
        name: 'B.Tech CSE',
        code: 'BTECH-CSE',
        departmentId: 'dept-1',
        description: 'Engineering degree',
      };
      const mockResult = {
        message: 'Course created successfully',
        data: { id: 'course-1', ...dto },
      };
      mockCoursesService.create.mockResolvedValueOnce(mockResult);

      const result = await controller.create(dto);
      expect(result).toBe(mockResult);
      expect(mockCoursesService.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('update', () => {
    it('should be decorated with @Roles(Role.ADMIN)', () => {
      const roles = reflector.get<Role[]>(ROLES_KEY, controller.update);
      expect(roles).toContain(Role.ADMIN);
    });

    it('should call service.update with id and dto', async () => {
      const dto = { name: 'Updated Course Name' };
      const mockResult = {
        message: 'Course updated successfully',
        data: { id: 'course-1', name: 'Updated Course Name', code: 'BTECH-CSE' },
      };
      mockCoursesService.update.mockResolvedValueOnce(mockResult);

      const result = await controller.update('course-1', dto);
      expect(result).toBe(mockResult);
      expect(mockCoursesService.update).toHaveBeenCalledWith('course-1', dto);
    });
  });

  describe('remove', () => {
    it('should be decorated with @Roles(Role.ADMIN)', () => {
      const roles = reflector.get<Role[]>(ROLES_KEY, controller.remove);
      expect(roles).toContain(Role.ADMIN);
    });

    it('should call service.remove with id', async () => {
      const mockResult = {
        message: 'Course deleted successfully',
        data: null,
      };
      mockCoursesService.remove.mockResolvedValueOnce(mockResult);

      const result = await controller.remove('course-1');
      expect(result).toBe(mockResult);
      expect(mockCoursesService.remove).toHaveBeenCalledWith('course-1');
    });
  });
});
