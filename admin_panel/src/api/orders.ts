import axiosInstance from './axios';
import { Order, OrderCreate, OrderUpdate, OrderStats, ApiResponse } from '../types/order.types';

export const ordersApi = {
  getAll: async (): Promise<Order[]> => {
    try {
      const response = await axiosInstance.get<ApiResponse<Order[]>>('/orders');
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Failed to fetch orders');
      }
      return response.data.data || [];
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch orders');
    }
  },

  getById: async (id: number): Promise<Order> => {
    try {
      const response = await axiosInstance.get<ApiResponse<Order>>(`/orders/${id}`);
      if (!response.data?.success || !response.data?.data) {
        throw new Error(response.data?.message || 'Order not found');
      }
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch order');
    }
  },

  create: async (orderData: OrderCreate): Promise<Order> => {
    try {
      const response = await axiosInstance.post<ApiResponse<Order>>('/orders', orderData);
      if (!response.data?.success || !response.data?.data) {
        throw new Error(response.data?.message || 'Failed to create order');
      }
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to create order');
    }
  },

  getAllAdmin: async (status?: string, page?: number, limit?: number): Promise<any> => {
    try {
      console.log('📦 [API] Fetching admin orders...', { status, page, limit });
      
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      if (page) params.append('page', page.toString());
      if (limit) params.append('limit', limit.toString());
      
      const url = `/orders/admin/all?${params.toString()}`;
      console.log('📦 [API] Request URL:', url);
      
      const response = await axiosInstance.get<ApiResponse<any>>(url);
      console.log('✅ [API] Full Response:', response);
      console.log('✅ [API] Response data:', response.data);
      console.log('✅ [API] Response data.data:', response.data?.data);
      
      if (!response.data?.success) {
        console.error('❌ [API] Failed to fetch orders:', response.data?.message);
        throw new Error(response.data?.message || 'Failed to fetch orders');
      }
      
      if (!response.data?.data) {
        console.warn('⚠️ [API] No data in response');
        return {
          data: [],
          total: 0,
          page: 1,
          totalPages: 0,
          hasMore: false,
        };
      }
      
      console.log('✅ [API] Successfully fetched', response.data.data?.length || 0, 'orders');
      return response.data.data;
    } catch (error: any) {
      console.error('❌ [API] Error fetching orders:', error);
      console.error('❌ [API] Error response:', error.response?.data);
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch orders');
    }
  },

  getByIdAdmin: async (id: number): Promise<Order> => {
    try {
      const response = await axiosInstance.get<ApiResponse<Order>>(`/orders/admin/${id}`);
      if (!response.data?.success || !response.data?.data) {
        throw new Error(response.data?.message || 'Order not found');
      }
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch order');
    }
  },

  updateStatus: async (id: number, status: string): Promise<any> => {
    try {
      console.log('🔄 [API] Updating order', id, 'status to', status);
      const response = await axiosInstance.patch<ApiResponse<any>>(`/orders/admin/${id}/status`, {
        status,
      });
      console.log('✅ [API] Status update response:', response.data);
      
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Failed to update order status');
      }
      return response.data;
    } catch (error: any) {
      console.error('❌ [API] Status update error:', error);
      console.error('❌ [API] Error response:', error.response?.data);
      throw new Error(error.response?.data?.message || error.message || 'Failed to update order status');
    }
  },

  getStats: async (): Promise<OrderStats> => {
    try {
      const response = await axiosInstance.get<ApiResponse<OrderStats>>('/orders/admin/stats/summary');
      if (!response.data?.success || !response.data?.data) {
        throw new Error(response.data?.message || 'Failed to fetch order stats');
      }
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch order stats');
    }
  },
};