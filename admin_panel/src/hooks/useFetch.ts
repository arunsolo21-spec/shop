import { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../api/axios';
import { ApiResponse } from '../types/api.types';

interface UseFetchOptions {
  immediate?: boolean;
  skip?: boolean;
}

interface UseFetchReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  mutate: (data: T) => void;
}

export function useFetch<T = any>(
  url: string,
  options: UseFetchOptions = {}
): UseFetchReturn<T> {
  const { immediate = true, skip = false } = options;
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (skip) return;
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get<ApiResponse<T>>(url);
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Request failed');
      }
      setData(response.data.data || null);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch data';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [url, skip]);

  useEffect(() => {
    if (immediate && !skip) {
      fetchData();
    }
  }, [fetchData, immediate, skip]);

  const refetch = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  const mutate = useCallback((newData: T) => {
    setData(newData);
  }, []);

  return { data, loading, error, refetch, mutate };
}

export default useFetch;