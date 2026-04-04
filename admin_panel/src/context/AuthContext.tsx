import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { authApi } from '../api/auth';
import { User, UserRole } from '../types/auth.types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const initializeAuth = useCallback(async () => {
    try {
      const storedToken = localStorage.getItem('admin_token');
      const storedUser = localStorage.getItem('admin_user');
      
      if (!storedToken || !storedUser) {
        setIsLoading(false);
        return;
      }

      const parsedUser = JSON.parse(storedUser) as User;
      
      if (parsedUser.role === 'ADMIN') {
        setToken(storedToken);
        setUser(parsedUser);
      } else {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authApi.login(email, password);

      if (response.user.role !== 'ADMIN') {
        setError('Access denied. Admin privileges required.');
        setIsLoading(false);
        return false;
      }

      setToken(response.access_token);
      setUser({
        ...response.user,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      localStorage.setItem('admin_token', response.access_token);
      localStorage.setItem('admin_user', JSON.stringify({
        ...response.user,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));

      setIsLoading(false);
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Login failed';
      setError(errorMessage);
      setIsLoading(false);
      return false;
    }
  };

  const logout = useCallback(() => {
    authApi.logout();
    setUser(null);
    setToken(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    isLoading,
    error,
    login,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;