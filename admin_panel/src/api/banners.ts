import axiosInstance from './axios';
import { Banner, BannerCreate, BannerUpdate, ApiResponse } from '../types/product.types';

export const bannersApi = {
  getAll: async (): Promise<Banner[]> => {
    try {
      const response = await axiosInstance.get<ApiResponse<Banner[]>>('/banners');
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Failed to fetch banners');
      }
      return response.data.data || [];
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch banners');
    }
  },

  getActive: async (): Promise<Banner[]> => {
    try {
      const response = await axiosInstance.get<ApiResponse<Banner[]>>('/banners/active');
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Failed to fetch active banners');
      }
      return response.data.data || [];
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch active banners');
    }
  },

  getById: async (id: number): Promise<Banner> => {
    try {
      const response = await axiosInstance.get<ApiResponse<Banner>>(`/banners/${id}`);
      if (!response.data?.success || !response.data?.data) {
        throw new Error(response.data?.message || 'Banner not found');
      }
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch banner');
    }
  },

  create: async (bannerData: BannerCreate): Promise<Banner> => {
    try {
      const response = await axiosInstance.post<ApiResponse<Banner>>('/banners', bannerData);
      if (!response.data?.success || !response.data?.data) {
        throw new Error(response.data?.message || 'Failed to create banner');
      }
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to create banner');
    }
  },

  update: async (id: number, bannerData: BannerUpdate): Promise<Banner> => {
    try {
      const response = await axiosInstance.put<ApiResponse<Banner>>(`/banners/${id}`, bannerData);
      if (!response.data?.success || !response.data?.data) {
        throw new Error(response.data?.message || 'Failed to update banner');
      }
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to update banner');
    }
  },

  delete: async (id: number): Promise<void> => {
    try {
      const response = await axiosInstance.delete<ApiResponse<void>>(`/banners/${id}`);
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Failed to delete banner');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to delete banner');
    }
  },

  uploadImage: async (file: File): Promise<{ imageUrl: string }> => {
  try {
    console.log('📤 [API] Starting image upload...');
    console.log('📁 File:', file.name, 'Size:', file.size, 'Type:', file.type);
    
    const formData = new FormData();
    formData.append('image', file);
    
    console.log('📤 [API] Sending POST request to /upload/image...');
    
    const response = await axiosInstance.post<ApiResponse<{ imageUrl: string }>>('/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    
    console.log('✅ [API] Response received:', response);
    console.log('✅ [API] Response data:', response.data);
    
    if (!response.data?.success) {
      console.error('❌ [API] Upload failed - success is false');
      throw new Error(response.data?.message || 'Failed to upload image');
    }
    
    if (!response.data?.data?.imageUrl) {
      console.error('❌ [API] Upload failed - no imageUrl in response');
      throw new Error('No image URL in response');
    }
    
    console.log('✅ [API] Upload successful:', response.data.data.imageUrl);
    return response.data.data;
  } catch (error: any) {
    console.error('❌ [API] Upload error:', error);
    console.error('❌ [API] Error response:', error.response?.data);
    console.error('❌ [API] Error status:', error.response?.status);
    console.error('❌ [API] Error message:', error.message);
    throw new Error(error.response?.data?.message || error.message || 'Failed to upload image');
  }
},

  updatePriority: async (id: number, priority: number): Promise<Banner> => {
    try {
      const response = await axiosInstance.patch<ApiResponse<Banner>>(`/banners/${id}/priority`, { priority });
      if (!response.data?.success || !response.data?.data) {
        throw new Error(response.data?.message || 'Failed to update priority');
      }
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to update priority');
    }
  },

  toggleStatus: async (id: number): Promise<Banner> => {
    try {
      const response = await axiosInstance.patch<ApiResponse<Banner>>(`/banners/${id}/toggle-status`);
      if (!response.data?.success || !response.data?.data) {
        throw new Error(response.data?.message || 'Failed to toggle status');
      }
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to toggle status');
    }
  },
};