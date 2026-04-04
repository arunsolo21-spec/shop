import axiosInstance from './axios';
import { Product, ProductCreate, ProductUpdate, ApiResponse } from '../types/product.types';

interface ProductsQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: number;
  subCategoryId?: number;
  sortBy?: 'name' | 'price' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

interface PaginatedProductsResponse {
  data: Product[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasMore: boolean;
}

export const productsApi = {
  getAll: async (params?: ProductsQueryParams): Promise<PaginatedProductsResponse> => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.search) queryParams.append('search', params.search);
      if (params?.categoryId) queryParams.append('categoryId', params.categoryId.toString());
      if (params?.subCategoryId) queryParams.append('subCategoryId', params.subCategoryId.toString());
      if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);
      
      const response = await axiosInstance.get<ApiResponse<PaginatedProductsResponse>>(`/products?${queryParams.toString()}`);
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Failed to fetch products');
      }
      return response.data.data || { data: [], total: 0, page: 1, pageSize: 12, totalPages: 0, hasMore: false };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch products');
    }
  },

  getById: async (id: number): Promise<Product> => {
    try {
      const response = await axiosInstance.get<ApiResponse<Product>>(`/products/${id}`);
      if (!response.data?.success || !response.data?.data) {
        throw new Error(response.data?.message || 'Product not found');
      }
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch product');
    }
  },

  create: async (productData: ProductCreate): Promise<Product> => {
    try {
      const response = await axiosInstance.post<ApiResponse<Product>>('/products', productData);
      if (!response.data?.success || !response.data?.data) {
        throw new Error(response.data?.message || 'Failed to create product');
      }
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to create product');
    }
  },

  update: async (id: number, productData: ProductUpdate): Promise<Product> => {
    try {
      const response = await axiosInstance.put<ApiResponse<Product>>(`/products/${id}`, productData);
      if (!response.data?.success || !response.data?.data) {
        throw new Error(response.data?.message || 'Failed to update product');
      }
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to update product');
    }
  },

  delete: async (id: number): Promise<void> => {
    try {
      const response = await axiosInstance.delete<ApiResponse<void>>(`/products/${id}`);
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Failed to delete product');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to delete product');
    }
  },

  updateStock: async (id: number, quantity: number, inStock: boolean): Promise<Product> => {
    try {
      const response = await axiosInstance.patch<ApiResponse<Product>>(`/products/${id}/stock`, { quantity, inStock });
      if (!response.data?.success || !response.data?.data) {
        throw new Error(response.data?.message || 'Failed to update stock');
      }
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to update stock');
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