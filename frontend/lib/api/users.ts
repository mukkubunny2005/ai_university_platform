import { apiClient } from './client';
import { ApiResponse, Role, User } from '../../types';

export const usersApi = {
  getAll: async () => {
    const res = await apiClient.get<ApiResponse<User[]>>('/users');
    return res.data.data;
  },

  getById: async (id: string) => {
    const res = await apiClient.get<ApiResponse<User>>(`/users/${id}`);
    return res.data.data;
  },

  create: async (data: { name: string; email: string; password: string; role: Role }) => {
    const res = await apiClient.post<ApiResponse<User>>('/users', data);
    return res.data.data;
  },

  update: async (id: string, data: { name?: string; password?: string }) => {
    const res = await apiClient.patch<ApiResponse<User>>(`/users/${id}`, data);
    return res.data.data;
  },

  delete: async (id: string) => {
    const res = await apiClient.delete<ApiResponse<null>>(`/users/${id}`);
    return res.data;
  },
};
