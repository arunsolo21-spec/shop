import { useState, useEffect, useCallback } from 'react';

interface UseLocalStorageReturn<T> {
  value: T | null;
  setValue: (value: T | null) => void;
  removeValue: () => void;
  error: string | null;
}

export function useLocalStorage<T>(key: string): UseLocalStorageReturn<T> {
  const [value, setValueState] = useState<T | null>(() => {
    try {
      const item = localStorage.getItem(key);
      if (item) {
        return JSON.parse(item) as T;
      }
      return null;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
    }
  });

  const [error, setError] = useState<string | null>(null);

  const setValue = useCallback((newValue: T | null) => {
    try {
      if (newValue === null) {
        localStorage.removeItem(key);
        setValueState(null);
      } else {
        localStorage.setItem(key, JSON.stringify(newValue));
        setValueState(newValue);
      }
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to save to localStorage');
      console.error('Error saving to localStorage:', err);
    }
  }, [key]);

  const removeValue = useCallback(() => {
    try {
      localStorage.removeItem(key);
      setValueState(null);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to remove from localStorage');
      console.error('Error removing from localStorage:', err);
    }
  }, [key]);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue === null) {
        setValueState(null);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key]);

  return {
    value,
    setValue,
    removeValue,
    error,
  };
}

export default useLocalStorage;