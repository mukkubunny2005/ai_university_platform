import { apiClient } from './client';
import { ApiResponse, Student } from '../../types';

export const studentsApi = {
  getAll: async (departmentId?: string) => {
    const params = departmentId ? { departmentId } : {};
    const res = await apiClient.get<ApiResponse<Student[]>>('/students', { params });
    return res.data.data;
  },

  getById: async (id: string) => {
    const res = await apiClient.get<ApiResponse<Student>>(`/students/${id}`);
    return res.data.data;
  },

  create: async (data: {
    name: string;
    email: string;
    password: string;
    studentId: string;
    departmentId: string;
    semester: number;
    batchId?: string | null;
    sectionId?: string | null;
  }) => {
    const res = await apiClient.post<ApiResponse<Student>>('/students', data);
    return res.data.data;
  },

  update: async (
    id: string,
    data: {
      name?: string;
      email?: string;
      studentId?: string;
      departmentId?: string;
      semester?: number;
      batchId?: string | null;
      sectionId?: string | null;
    },
  ) => {
    const res = await apiClient.patch<ApiResponse<Student>>(`/students/${id}`, data);
    return res.data.data;
  },

  delete: async (id: string) => {
    const res = await apiClient.delete<ApiResponse<null>>(`/students/${id}`);
    return res.data;
  },

  remove: async (id: string) => {
    return studentsApi.delete(id);
  },
};
