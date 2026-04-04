import axiosInstance from './axios';
import { Category, CategoryCreate, CategoryUpdate, ApiResponse } from '../types/product.types';

export const categoriesApi = {
  getAll: async (): Promise<Category[]> => {
    try {
      const response = await axiosInstance.get<ApiResponse<Category[]>>('/categories');
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Failed to fetch categories');
      }
      return response.data.data || [];
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch categories');
    }
  },

  getById: async (id: number): Promise<Category> => {
    try {
      const response = await axiosInstance.get<ApiResponse<Category>>(`/categories/${id}`);
      if (!response.data?.success || !response.data?.data) {
        throw new Error(response.data?.message || 'Category not found');
      }
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch category');
    }
  },

  create: async (categoryData: CategoryCreate): Promise<Category> => {
    try {
      const response = await axiosInstance.post<ApiResponse<Category>>('/categories', categoryData);
      if (!response.data?.success || !response.data?.data) {
        throw new Error(response.data?.message || 'Failed to create category');
      }
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to create category');
    }
  },

  update: async (id: number, categoryData: CategoryUpdate): Promise<Category> => {
    try {
      const response = await axiosInstance.put<ApiResponse<Category>>(`/categories/${id}`, categoryData);
      if (!response.data?.success || !response.data?.data) {
        throw new Error(response.data?.message || 'Failed to update category');
      }
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to update category');
    }
  },

  delete: async (id: number): Promise<void> => {
    try {
      const response = await axiosInstance.delete<ApiResponse<void>>(`/categories/${id}`);
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Failed to delete category');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to delete category');
    }
  },

  uploadImage: async (file: File): Promise<{ imageUrl: string }> => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      const response = await axiosInstance.post<ApiResponse<{ imageUrl: string }>>('/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (!response.data?.success || !response.data?.data) {
        throw new Error(response.data?.message || 'Failed to upload image');
      }
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to upload image');
    }
  },

  toggleStatus: async (id: number, isActive: boolean): Promise<Category> => {
    try {
      const response = await axiosInstance.patch<ApiResponse<Category>>(`/categories/${id}/status`, { isActive });
      if (!response.data?.success || !response.data?.data) {
        throw new Error(response.data?.message || 'Failed to update status');
      }
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to update status');
    }
  },

  updatePriority: async (id: number, priority: number): Promise<Category> => {
    try {
      const response = await axiosInstance.patch<ApiResponse<Category>>(`/categories/${id}/priority`, { priority });
      if (!response.data?.success || !response.data?.data) {
        throw new Error(response.data?.message || 'Failed to update priority');
      }
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to update priority');
    }
  },
};