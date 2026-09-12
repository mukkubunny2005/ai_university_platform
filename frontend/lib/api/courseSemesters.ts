import { apiClient } from './client';
import { ApiResponse, CourseSemester } from '../../types';

export const courseSemestersApi = {
  getAll: async (filters?: {
    courseId?: string;
    academicYearId?: string;
    semesterNumber?: number;
  }) => {
    const params: Record<string, string> = {};
    if (filters?.courseId) params.courseId = filters.courseId;
    if (filters?.academicYearId) params.academicYearId = filters.academicYearId;
    if (filters?.semesterNumber) params.semesterNumber = String(filters.semesterNumber);
    const res = await apiClient.get<ApiResponse<CourseSemester[]>>('/course-semesters', { params });
    return res.data.data;
  },

  getById: async (id: string) => {
    const res = await apiClient.get<ApiResponse<CourseSemester>>(`/course-semesters/${id}`);
    return res.data.data;
  },

  create: async (data: {
    courseId: string;
    semesterNumber: number;
    subjectId: string;
    academicYearId: string;
  }) => {
    const res = await apiClient.post<ApiResponse<CourseSemester>>('/course-semesters', data);
    return res.data.data;
  },

  update: async (
    id: string,
    data: {
      courseId?: string;
      semesterNumber?: number;
      subjectId?: string;
      academicYearId?: string;
    },
  ) => {
    const res = await apiClient.patch<ApiResponse<CourseSemester>>(`/course-semesters/${id}`, data);
    return res.data.data;
  },

  delete: async (id: string) => {
    const res = await apiClient.delete<ApiResponse<null>>(`/course-semesters/${id}`);
    return res.data;
  },
};
