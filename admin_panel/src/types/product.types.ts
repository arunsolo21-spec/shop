import { ApiResponse } from './api.types';

export interface Product {
  id: number;
  name: string;
  brand: string;
  variant: string;
  price: number;
  mrp: number;
  discount: number;
  description?: string | null;
  shortDescription?: string | null;
  imageUrl?: string | null;
  inStock: boolean;
  quantity: number;
  isFeatured: boolean;
  isBestseller: boolean;
  showOnHome: boolean;
  searchKeywords: string[];
  subCategoryId?: number | null;
  createdAt: string;
  updatedAt: string;
  subCategory?: SubCategory | null;
}

export interface ProductCreate {
  name: string;
  brand: string;
  variant?: string;
  price: number;
  mrp: number;
  discount?: number;
  description?: string;
  shortDescription?: string;
  imageUrl?: string;
  inStock?: boolean;
  quantity?: number;
  isFeatured?: boolean;
  isBestseller?: boolean;
  showOnHome?: boolean;
  searchKeywords?: string[];
  subCategoryId?: number;
}

export interface ProductUpdate extends Partial<ProductCreate> {}

export interface Category {
  id: number;
  name: string;
  image?: string | null;
  isActive: boolean;
  priority: number;
  createdAt: string;
  updatedAt: string;
  subCategories?: SubCategory[];
  _count?: {
    subCategories: number;
    products: number;
  };
}

export interface CategoryCreate {
  name: string;
  image?: string;
  isActive?: boolean;
  priority?: number;
}

export interface CategoryUpdate extends Partial<CategoryCreate> {}

export interface SubCategory {
  id: number;
  name: string;
  image?: string | null;
  isActive: boolean;
  priority: number;
  categoryId: number;
  category?: Category;
  createdAt: string;
  updatedAt: string;
}

export interface SubCategoryCreate {
  name: string;
  image?: string;
  isActive?: boolean;
  priority?: number;
  categoryId: number;
}

export interface SubCategoryUpdate extends Partial<SubCategoryCreate> {}
export interface Banner {
  id: number;
  imageUrl: string;
  targetScreen?: string | null;
  targetId?: string | null;
  isActive: boolean;
  priority: number;
  createdAt: string;
  updatedAt?: string;
}

export interface BannerCreate {
  imageUrl: string;
  targetScreen?: string;
  targetId?: string;
  isActive?: boolean;
  priority?: number;
}

export interface BannerUpdate extends Partial<BannerCreate> {}

export interface ProductFilters {
  search?: string;
  categoryId?: number;
  subCategoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  isFeatured?: boolean;
  sortBy?: 'price' | 'name' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasMore: boolean;
}

export type { ApiResponse };