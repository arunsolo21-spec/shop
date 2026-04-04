export type UserRole = 'USER' | 'ADMIN';

export interface User {
  id: number;
  email: string;
  name: string | null;
  phone: string | null;
  role: UserRole;
  isActive: boolean;
  profileImage?: string | null;
  createdAt: string;
  updatedAt: string;
  totalOrders?: number;
  addresses?: Address[];
  orders?: Order[];
}

export interface Address {
  id: number;
  name: string;
  phone: string;
  street: string;
  landmark?: string | null;
  city: string;
  district?: string | null;
  state: string;
  zip: string;
  country: string;
  isDefault: boolean;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: number;
  orderId: string;
  userId: number;
  totalAmount: number;
  status: OrderStatus;
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
  items?: OrderItem[];
  address?: Address | null;
}

export interface OrderItem {
  id: number;
  productId: number;
  name?: string;
  image?: string;
  price: number;
  quantity: number;
}

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PACKED'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  user: {
    id: number;
    email: string;
    name: string | null;
    phone: string | null;
    role: UserRole;
    isActive: boolean;
  };
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface UserUpdate {
  name?: string;
  email?: string;
  phone?: string;
  profileImage?: string;
  isActive?: boolean;
  role?: UserRole;
}

export interface AddressCreate {
  name: string;
  phone: string;
  street: string;
  landmark?: string;
  city: string;
  district?: string;
  state?: string;
  zip: string;
  country?: string;
  isDefault?: boolean;
}

export interface AddressUpdate extends Partial<AddressCreate> {}

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  statusCode?: number;
  timestamp?: string;
}