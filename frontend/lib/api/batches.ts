import { apiClient } from './client';
import { ApiResponse, Batch } from '../../types';

export const batchesApi = {
  getAll: async (departmentId?: string, courseId?: string) => {
    const params: Record<string, string> = {};
    if (departmentId) params.departmentId = departmentId;
    if (courseId) params.courseId = courseId;
    const res = await apiClient.get<ApiResponse<Batch[]>>('/batches', { params });
    return res.data.data;
  },

  getById: async (id: string) => {
    const res = await apiClient.get<ApiResponse<Batch>>(`/batches/${id}`);
    return res.data.data;
  },

  create: async (data: {
    name: string;
    code: string;
    startYear: number;
    endYear: number;
    departmentId: string;
    courseId: string;
  }) => {
    const res = await apiClient.post<ApiResponse<Batch>>('/batches', data);
    return res.data.data;
  },

  update: async (
    id: string,
    data: {
      name?: string;
      code?: string;
      startYear?: number;
      endYear?: number;
      departmentId?: string;
      courseId?: string;
    },
  ) => {
    const res = await apiClient.patch<ApiResponse<Batch>>(`/batches/${id}`, data);
    return res.data.data;
  },

  delete: async (id: string) => {
    const res = await apiClient.delete<ApiResponse<null>>(`/batches/${id}`);
    return res.data;
  },
};
