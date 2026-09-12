import { apiClient } from './client';
import { ApiResponse, Section } from '../../types';

export const sectionsApi = {
  getAll: async (filters?: {
    departmentId?: string;
    courseId?: string;
    batchId?: string;
    academicYearId?: string;
    semesterNumber?: number;
  }) => {
    const params: Record<string, string> = {};
    if (filters?.departmentId) params.departmentId = filters.departmentId;
    if (filters?.courseId) params.courseId = filters.courseId;
    if (filters?.batchId) params.batchId = filters.batchId;
    if (filters?.academicYearId) params.academicYearId = filters.academicYearId;
    if (filters?.semesterNumber) params.semesterNumber = String(filters.semesterNumber);
    const res = await apiClient.get<ApiResponse<Section[]>>('/sections', { params });
    return res.data.data;
  },

  getById: async (id: string) => {
    const res = await apiClient.get<ApiResponse<Section>>(`/sections/${id}`);
    return res.data.data;
  },

  create: async (data: {
    name: string;
    semesterNumber: number;
    departmentId: string;
    courseId: string;
    academicYearId: string;
    batchId: string;
    maxCapacity?: number;
  }) => {
    const res = await apiClient.post<ApiResponse<Section>>('/sections', data);
    return res.data.data;
  },

  update: async (
    id: string,
    data: {
      name?: string;
      semesterNumber?: number;
      departmentId?: string;
      courseId?: string;
      academicYearId?: string;
      batchId?: string;
      maxCapacity?: number;
    },
  ) => {
    const res = await apiClient.patch<ApiResponse<Section>>(`/sections/${id}`, data);
    return res.data.data;
  },

  delete: async (id: string) => {
    const res = await apiClient.delete<ApiResponse<null>>(`/sections/${id}`);
    return res.data;
  },
};
