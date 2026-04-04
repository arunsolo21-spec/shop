export interface Order {
  id: number;
  orderId: string;
  userId?: number;
  totalAmount: number;
  status: OrderStatus;
  paymentMethod: string;
  createdAt: string;
  updatedAt?: string;
  user?: {
    id: number;
    name: string;
    email: string;
    phone: string;
  };
  items: OrderItem[];
  address?: {
    street: string;
    landmark?: string;
    city: string;
    district?: string;
    state: string;
    zip: string;
  } | null;
}

export interface OrderItem {
  id?: number;
  productId: number;
  name?: string;
  image?: string;
  price: number;
  quantity: number;
}

export interface OrderCreate {
  items: {
    productId: number;
    quantity: number;
  }[];
  addressId: number;
  paymentMethod: string;
}

export interface OrderUpdate {
  status?: OrderStatus;
  paymentMethod?: string;
  addressId?: number;
}

export interface OrderStats {
  totalOrders: number;
  pendingOrders: number;
  confirmedOrders: number;
  packedOrders: number;
  outForDeliveryOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
}

export type OrderStatus = 
  | 'PENDING'
  | 'CONFIRMED'
  | 'PACKED'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED';

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}