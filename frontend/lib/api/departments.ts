import { apiClient } from './client';
import { ApiResponse, Department } from '../../types';

export const departmentsApi = {
  getAll: async () => {
    const res = await apiClient.get<ApiResponse<Department[]>>('/departments');
    return res.data.data;
  },

  getById: async (id: string) => {
    const res = await apiClient.get<ApiResponse<Department>>(`/departments/${id}`);
    return res.data.data;
  },

  create: async (data: { name: string; code: string; description?: string }) => {
    const res = await apiClient.post<ApiResponse<Department>>('/departments', data);
    return res.data.data;
  },

  update: async (id: string, data: { name?: string; code?: string; description?: string }) => {
    const res = await apiClient.patch<ApiResponse<Department>>(`/departments/${id}`, data);
    return res.data.data;
  },

  delete: async (id: string) => {
    const res = await apiClient.delete<ApiResponse<null>>(`/departments/${id}`);
    return res.data;
  },
};
