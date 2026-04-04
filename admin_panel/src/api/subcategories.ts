import axiosInstance from './axios';
import { SubCategory, SubCategoryCreate, SubCategoryUpdate, ApiResponse } from '../types/product.types';

interface SubcategoriesQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: number;
}

interface PaginatedSubcategoriesResponse {
  data: SubCategory[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasMore: boolean;
}

export const subcategoriesApi = {
  getAll: async (params?: SubcategoriesQueryParams): Promise<PaginatedSubcategoriesResponse> => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.search) queryParams.append('search', params.search);
      if (params?.categoryId) queryParams.append('categoryId', params.categoryId.toString());

      const response = await axiosInstance.get<ApiResponse<PaginatedSubcategoriesResponse>>(`/subcategories?${queryParams.toString()}`);
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Failed to fetch subcategories');
      }
      return response.data.data || { data: [], total: 0, page: 1, pageSize: 20, totalPages: 0, hasMore: false };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch subcategories');
    }
  },

  getByCategory: async (categoryId: number): Promise<SubCategory[]> => {
    try {
      const response = await axiosInstance.get<ApiResponse<SubCategory[]>>(`/subcategories?categoryId=${categoryId}`);
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Failed to fetch subcategories');
      }
      return response.data.data || [];
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch subcategories');
    }
  },

  getById: async (id: number): Promise<SubCategory> => {
    try {
      const response = await axiosInstance.get<ApiResponse<SubCategory>>(`/subcategories/${id}`);
      if (!response.data?.success || !response.data?.data) {
        throw new Error(response.data?.message || 'Subcategory not found');
      }
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch subcategory');
    }
  },

  create: async (data: SubCategoryCreate): Promise<SubCategory> => {
    try {
      const response = await axiosInstance.post<ApiResponse<SubCategory>>('/subcategories', data);
      if (!response.data?.success || !response.data?.data) {
        throw new Error(response.data?.message || 'Failed to create subcategory');
      }
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to create subcategory');
    }
  },

  update: async (id: number, data: SubCategoryUpdate): Promise<SubCategory> => {
    try {
      const response = await axiosInstance.put<ApiResponse<SubCategory>>(`/subcategories/${id}`, data);
      if (!response.data?.success || !response.data?.data) {
        throw new Error(response.data?.message || 'Failed to update subcategory');
      }
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to update subcategory');
    }
  },

  delete: async (id: number): Promise<void> => {
    try {
      const response = await axiosInstance.delete<ApiResponse<void>>(`/subcategories/${id}`);
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Failed to delete subcategory');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to delete subcategory');
    }
  },

  toggleStatus: async (id: number, isActive: boolean): Promise<SubCategory> => {
    try {
      const response = await axiosInstance.patch<ApiResponse<SubCategory>>(`/subcategories/${id}/status`, { isActive });
      if (!response.data?.success || !response.data?.data) {
        throw new Error(response.data?.message || 'Failed to update status');
      }
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to update status');
    }
  },

  updatePriority: async (id: number, priority: number): Promise<SubCategory> => {
    try {
      const response = await axiosInstance.patch<ApiResponse<SubCategory>>(`/subcategories/${id}/priority`, { priority });
      if (!response.data?.success || !response.data?.data) {
        throw new Error(response.data?.message || 'Failed to update priority');
      }
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to update priority');
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
};