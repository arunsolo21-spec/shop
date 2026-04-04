import axiosInstance from './axios';
import { LoginResponse, ApiResponse, User } from '../types/auth.types';

export const authApi = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    try {
      const response = await axiosInstance.post<ApiResponse<LoginResponse>>('/auth/login', { email, password });
      
      if (!response.data?.success || !response.data?.data) {
        throw new Error(response.data?.message || 'Login failed');
      }
      
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Login failed');
    }
  },

  register: async (name: string, email: string, password: string, phone?: string): Promise<LoginResponse> => {
    try {
      const response = await axiosInstance.post<ApiResponse<LoginResponse>>('/auth/register', { name, email, password, phone });
      
      if (!response.data?.success || !response.data?.data) {
        throw new Error(response.data?.message || 'Registration failed');
      }
      
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Registration failed');
    }
  },

  forgotPassword: async (email: string): Promise<{ message: string }> => {
    try {
      const response = await axiosInstance.post<ApiResponse<{ message: string }>>('/auth/forgot-password', { email });
      
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Failed to send reset email');
      }
      
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to send reset email');
    }
  },

  resetPassword: async (email: string, token: string, newPassword: string): Promise<{ message: string }> => {
    try {
      const response = await axiosInstance.post<ApiResponse<{ message: string }>>('/auth/reset-password', { email, token, newPassword });
      
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Failed to reset password');
      }
      
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to reset password');
    }
  },

  logout: (): void => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
  },

  getCurrentUser: async (): Promise<User> => {
    try {
      const response = await axiosInstance.get<ApiResponse<User>>('/users/profile');
      
      if (!response.data?.success || !response.data?.data) {
        throw new Error(response.data?.message || 'Failed to fetch user');
      }
      
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch user');
    }
  },
};