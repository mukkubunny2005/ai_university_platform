import { apiClient } from './client';
import { ApiResponse, AcademicYear } from '../../types';

export const academicYearsApi = {
  getAll: async () => {
    const res = await apiClient.get<ApiResponse<AcademicYear[]>>('/academic-years');
    return res.data.data;
  },

  getById: async (id: string) => {
    const res = await apiClient.get<ApiResponse<AcademicYear>>(`/academic-years/${id}`);
    return res.data.data;
  },

  create: async (data: { code: string; name: string; startDate: string; endDate: string; isActive?: boolean }) => {
    const res = await apiClient.post<ApiResponse<AcademicYear>>('/academic-years', data);
    return res.data.data;
  },

  update: async (id: string, data: { code?: string; name?: string; startDate?: string; endDate?: string; isActive?: boolean }) => {
    const res = await apiClient.patch<ApiResponse<AcademicYear>>(`/academic-years/${id}`, data);
    return res.data.data;
  },

  activate: async (id: string) => {
    const res = await apiClient.patch<ApiResponse<AcademicYear>>(`/academic-years/${id}/activate`);
    return res.data.data;
  },

  delete: async (id: string) => {
    const res = await apiClient.delete<ApiResponse<null>>(`/academic-years/${id}`);
    return res.data;
  },
};
