import { apiClient } from './client';
import { ApiResponse, Course } from '../../types';

export const coursesApi = {
  getAll: async (departmentId?: string) => {
    const params = departmentId ? { departmentId } : {};
    const res = await apiClient.get<ApiResponse<Course[]>>('/courses', { params });
    return res.data.data;
  },

  getById: async (id: string) => {
    const res = await apiClient.get<ApiResponse<Course>>(`/courses/${id}`);
    return res.data.data;
  },

  create: async (data: { name: string; code: string; description?: string; departmentId: string }) => {
    const res = await apiClient.post<ApiResponse<Course>>('/courses', data);
    return res.data.data;
  },

  update: async (
    id: string,
    data: { name?: string; code?: string; description?: string; departmentId?: string },
  ) => {
    const res = await apiClient.patch<ApiResponse<Course>>(`/courses/${id}`, data);
    return res.data.data;
  },

  delete: async (id: string) => {
    const res = await apiClient.delete<ApiResponse<null>>(`/courses/${id}`);
    return res.data;
  },

  remove: async (id: string) => {
    const res = await apiClient.delete<ApiResponse<null>>(`/courses/${id}`);
    return res.data;
  },
};

