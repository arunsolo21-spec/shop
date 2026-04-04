import axiosInstance from './axios';
import { User, UserUpdate, ApiResponse, Address, AddressCreate } from '../types/auth.types';

export const usersApi = {
  getAll: async (): Promise<User[]> => {
    try {
      const response = await axiosInstance.get<ApiResponse<User[]>>('/users');
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Failed to fetch users');
      }
      return response.data.data || [];
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch users');
    }
  },

  getById: async (id: number): Promise<User> => {
    try {
      const response = await axiosInstance.get<ApiResponse<User>>(`/users/${id}`);
      if (!response.data?.success || !response.data?.data) {
        throw new Error(response.data?.message || 'User not found');
      }
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch user');
    }
  },

  getProfile: async (): Promise<User> => {
    try {
      const response = await axiosInstance.get<ApiResponse<User>>('/users/profile');
      if (!response.data?.success || !response.data?.data) {
        throw new Error(response.data?.message || 'Failed to fetch profile');
      }
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch profile');
    }
  },

  updateProfile: async (userData: UserUpdate): Promise<User> => {
    try {
      const response = await axiosInstance.put<ApiResponse<User>>('/users/profile', userData);
      if (!response.data?.success || !response.data?.data) {
        throw new Error(response.data?.message || 'Failed to update profile');
      }
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to update profile');
    }
  },

  getAddresses: async (userId?: number): Promise<Address[]> => {
    try {
      const url = userId ? `/users/${userId}/addresses` : '/users/addresses';
      const response = await axiosInstance.get<ApiResponse<Address[]>>(url);
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Failed to fetch addresses');
      }
      return response.data.data || [];
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch addresses');
    }
  },

  createAddress: async (addressData: AddressCreate): Promise<Address> => {
    try {
      const response = await axiosInstance.post<ApiResponse<Address>>(`/users/addresses`, addressData);
      if (!response.data?.success || !response.data?.data) {
        throw new Error(response.data?.message || 'Failed to create address');
      }
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to create address');
    }
  },

  updateAddress: async (addressId: number, addressData: Partial<AddressCreate>): Promise<Address> => {
    try {
      const response = await axiosInstance.put<ApiResponse<Address>>(`/users/addresses/${addressId}`, addressData);
      if (!response.data?.success || !response.data?.data) {
        throw new Error(response.data?.message || 'Failed to update address');
      }
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to update address');
    }
  },

  deleteAddress: async (addressId: number): Promise<void> => {
    try {
      const response = await axiosInstance.delete<ApiResponse<void>>(`/users/addresses/${addressId}`);
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Failed to delete address');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to delete address');
    }
  },

  setDefaultAddress: async (addressId: number): Promise<void> => {
    try {
      const response = await axiosInstance.post<ApiResponse<void>>(`/users/addresses/${addressId}/set-default`);
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Failed to set default address');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to set default address');
    }
  },

  updateUser: async (id: number, userData: UserUpdate): Promise<User> => {
    try {
      const response = await axiosInstance.put<ApiResponse<User>>(`/users/${id}`, userData);
      if (!response.data?.success || !response.data?.data) {
        throw new Error(response.data?.message || 'Failed to update user');
      }
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to update user');
    }
  },

  blockUser: async (id: number, isActive: boolean): Promise<User> => {
    try {
      const response = await axiosInstance.patch<ApiResponse<User>>(`/users/${id}/block`, { isActive });
      if (!response.data?.success || !response.data?.data) {
        throw new Error(response.data?.message || 'Failed to update user status');
      }
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to update user status');
    }
  },

  deleteUser: async (id: number): Promise<void> => {
    try {
      const response = await axiosInstance.delete<ApiResponse<void>>(`/users/${id}`);
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Failed to delete user');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to delete user');
    }
  },
};