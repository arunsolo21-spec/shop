/**
 * Generic Key-Value Record
 */
export type RecordType<T = any> = Record<string, T>;

/**
 * Nullable Type Helper
 */
export type Nullable<T> = T | null;

/**
 * Optional Type Helper
 */
export type Optional<T> = T | undefined;

/**
 * Async Function Type
 */
export type AsyncFunction<T = void> = () => Promise<T>;

/**
 * Event Handler Type
 */
export type EventHandler<T = Event> = (event: T) => void;

/**
 * Change Handler Type
 */
export type ChangeHandler<T = any> = (value: T) => void;

/**
 * Form Data Type
 */
export interface FormData {
  [key: string]: string | number | boolean | File | null;
}

/**
 * Pagination State
 */
export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

/**
 * Loading State
 */
export interface LoadingState {
  isLoading: boolean;
  isSubmitting: boolean;
  isFetching: boolean;
}

/**
 * Error State
 */
export interface ErrorState {
  hasError: boolean;
  errorMessage: string | null;
  errorCode: number | null;
}

/**
 * Success State
 */
export interface SuccessState {
  isSuccess: boolean;
  successMessage: string | null;
}

/**
 * API State (Combined)
 */
export interface ApiState<T = any> extends LoadingState, ErrorState, SuccessState {
  data: T | null;
}

/**
 * Sort Configuration
 */
export interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}

/**
 * Filter Configuration
 */
export interface FilterConfig {
  field: string;
  value: any;
  operator: 'equals' | 'contains' | 'greaterThan' | 'lessThan' | 'in';
}

/**
 * Toast Notification
 */
export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

/**
 * Confirmation Dialog
 */
export interface ConfirmDialog {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}