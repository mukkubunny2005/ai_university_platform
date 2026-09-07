import { apiClient } from './client';
import { ApiResponse, Department } from '../../types';

export interface CreateDepartmentPayload {
  name: string;
  code: string;
  description?: string;
}

export interface UpdateDepartmentPayload {
  name?: string;
  code?: string;
  description?: string;
}

export const departmentsApi = {
  getAll: async (): Promise<Department[]> => {
    const res = await apiClient.get<ApiResponse<Department[]>>('/departments');
    return res.data.data;
  },

  getById: async (id: string): Promise<Department> => {
    const res = await apiClient.get<ApiResponse<Department>>(`/departments/${id}`);
    return res.data.data;
  },

  create: async (data: CreateDepartmentPayload): Promise<Department> => {
    const res = await apiClient.post<ApiResponse<Department>>('/departments', data);
    return res.data.data;
  },

  update: async (id: string, data: UpdateDepartmentPayload): Promise<Department> => {
    const res = await apiClient.patch<ApiResponse<Department>>(`/departments/${id}`, data);
    return res.data.data;
  },

  delete: async (id: string): Promise<ApiResponse<null>> => {
    const res = await apiClient.delete<ApiResponse<null>>(`/departments/${id}`);
    return res.data;
  },

  remove: async (id: string): Promise<ApiResponse<null>> => {
    const res = await apiClient.delete<ApiResponse<null>>(`/departments/${id}`);
    return res.data;
  },
};
