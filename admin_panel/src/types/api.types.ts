/**
 * Generic API Response Structure
 * All backend responses follow this pattern
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  statusCode?: number;
  timestamp?: string;
}

/**
 * Paginated Response for list endpoints
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasMore: boolean;
}

/**
 * API Error Response Structure
 */
export interface ApiError {
  success: false;
  statusCode: number;
  message: string;
  error?: string;
  timestamp: string;
  path?: string;
}

/**
 * Upload Response for image/file uploads
 */
export interface UploadResponse {
  imageUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
}

/**
 * Query Parameters for list endpoints
 */
export interface ListQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  status?: string;
  categoryId?: number;
  subCategoryId?: number;
}

/**
 * Generic ID Parameter
 */
export interface IdParam {
  id: number;
}