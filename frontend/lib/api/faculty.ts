import { apiClient } from './client';
import { ApiResponse, Faculty } from '../../types';

export const facultyApi = {
  getAll: async (departmentId?: string) => {
    const params = departmentId ? { departmentId } : {};
    const res = await apiClient.get<ApiResponse<Faculty[]>>('/faculty', { params });
    return res.data.data;
  },

  getById: async (id: string) => {
    const res = await apiClient.get<ApiResponse<Faculty>>(`/faculty/${id}`);
    return res.data.data;
  },

  create: async (data: {
    name: string;
    email: string;
    password: string;
    facultyId: string;
    departmentId: string;
    designation: string;
  }) => {
    const res = await apiClient.post<ApiResponse<Faculty>>('/faculty', data);
    return res.data.data;
  },

  update: async (
    id: string,
    data: {
      name?: string;
      facultyId?: string;
      departmentId?: string;
      designation?: string;
    },
  ) => {
    const res = await apiClient.patch<ApiResponse<Faculty>>(`/faculty/${id}`, data);
    return res.data.data;
  },

  delete: async (id: string) => {
    const res = await apiClient.delete<ApiResponse<null>>(`/faculty/${id}`);
    return res.data;
  },
};
