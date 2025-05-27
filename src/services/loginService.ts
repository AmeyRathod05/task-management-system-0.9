import api from './api';
import axios, { AxiosError } from 'axios';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export const loginService = {
  /**
   * Log out the user by clearing tokens and user data
   */
  logout: async (): Promise<void> => {
    try {
      // Call the logout API using the centralized API instance
      await api.post('/admin/logout');
      
      // Clear all authentication data
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      
      // Clear the cookie
      if (typeof document !== 'undefined') {
        document.cookie = 'auth_token=; path=/; max-age=0; SameSite=Strict';
      }
    } catch (error) {
      // Even if API call fails, we should still clear local data
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      
      if (typeof document !== 'undefined') {
        document.cookie = 'auth_token=; path=/; max-age=0; SameSite=Strict';
      }
    }
  },

  /**
   * Authenticate user with email and password
   * @param credentials User credentials (email and password)
   * @returns Promise with login response containing token and user data
   */
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    try {
      const response = await api.post<LoginResponse>('/admin/login', credentials);
      const responseData = response.data;
      if (responseData?.token) {
        loginService.saveToken(responseData.token);
        if (responseData.user) {
          loginService.saveUser(responseData.user);
        }
      }
      return responseData;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        if (axiosError.response) {
          const errorData = axiosError.response.data as { message?: string };
          throw new Error(errorData?.message || 'Login failed. Please check your credentials.');
        } else if (axiosError.request) {
          throw new Error('No response from server. Please try again later.');
        }
      }
      throw new Error('An error occurred during login. Please try again.');
    }
  },

  /**
   * Check if user is authenticated by verifying token
   * @returns Boolean indicating if user is authenticated
   */
  isAuthenticated: (): boolean => {
    if (typeof window === 'undefined') return false;
    
    const token = localStorage.getItem('auth_token');
    return !!token;
  },

  /**
   * Save authentication token to both local storage and cookies
   * @param token JWT token
   */
  saveToken: (token: string): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
      // Set cookie with Secure and HttpOnly flags in production
      const isProduction = process.env.NODE_ENV === 'production';
      const cookieOptions = [
        `auth_token=${token}`,
        'path=/',
        `max-age=${60 * 60 * 24}`, // 1 day
        'SameSite=Strict',
        isProduction ? 'Secure' : '',
        isProduction ? 'HttpOnly' : ''
      ].filter(Boolean).join('; ');
      
      document.cookie = cookieOptions;
    }
  },

  /**
   * Get authentication token from local storage
   * @returns JWT token or null if not found
   */
  getToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    
    return localStorage.getItem('auth_token');
  },

  /**
   * Save user data to local storage
   * @param user User data to save
   */
  saveUser: (user: LoginResponse['user']): void => {
    localStorage.setItem('user', JSON.stringify(user));
  },

  /**
   * Get user data from local storage
   * @returns User data or null if not found
   */
  getUser: (): LoginResponse['user'] | null => {
    if (typeof window === 'undefined') return null;
    
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  }
};

export default loginService;
