import { apiClient } from './client';
import { ApiResponse, Subject } from '../../types';

export const subjectsApi = {
  getAll: async (courseId?: string, facultyId?: string) => {
    const params: Record<string, string> = {};
    if (courseId) params.courseId = courseId;
    if (facultyId) params.facultyId = facultyId;

    const res = await apiClient.get<ApiResponse<Subject[]>>('/subjects', { params });
    return res.data.data;
  },

  getById: async (id: string) => {
    const res = await apiClient.get<ApiResponse<Subject>>(`/subjects/${id}`);
    return res.data.data;
  },

  create: async (data: {
    name: string;
    code: string;
    credits: number;
    courseId: string;
    facultyId?: string;
  }) => {
    const res = await apiClient.post<ApiResponse<Subject>>('/subjects', data);
    return res.data.data;
  },

  update: async (
    id: string,
    data: {
      name?: string;
      code?: string;
      credits?: number;
      courseId?: string;
      facultyId?: string | null;
    },
  ) => {
    const res = await apiClient.patch<ApiResponse<Subject>>(`/subjects/${id}`, data);
    return res.data.data;
  },

  delete: async (id: string) => {
    const res = await apiClient.delete<ApiResponse<null>>(`/subjects/${id}`);
    return res.data;
  },
};
