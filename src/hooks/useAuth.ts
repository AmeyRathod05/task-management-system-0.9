import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import loginService, { LoginCredentials } from '@/services/loginService';

export type UseAuthReturn = {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<any>;
  logout: () => Promise<void>;
};

export const useAuth = (): UseAuthReturn => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = () => {
      const token = loginService.getToken();
      setIsAuthenticated(!!token);
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  // Login function
  const login = useCallback(async (credentials: { email: string; password: string }) => {
    try {
      const response = await loginService.login(credentials);
      setIsAuthenticated(true);
      return response;
    } catch (error) {
      setIsAuthenticated(false);
      throw error;
    }
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    try {
      await loginService.logout();
    } finally {
      setIsAuthenticated(false);
      router.push('/login');
    }
  }, [router]);

  return {
    isAuthenticated,
    isLoading,
    login,
    logout,
  };
};

export default useAuth;
