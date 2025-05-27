'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import loginService, { LoginCredentials } from '@/services/loginService';
import { EyeIcon, EyeCloseIcon } from '@/icons';
import { useAuth } from '@/hooks/useAuth';

interface LoginFormProps {
  redirectPath?: string;
}

const LoginForm: React.FC<LoginFormProps> = ({ redirectPath = '/admin' }) => {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: '',
    password: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push(redirectPath);
    }
  }, [isAuthenticated, redirectPath, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await loginService.login(credentials);
      
      // Check if login was successful and we have a token
      if (response && response.token) {
        // Use router for client-side navigation if possible
        if (typeof window !== 'undefined') {
          // Force a full page reload to ensure all auth state is refreshed
          window.location.href = redirectPath;
        } else {
          router.push(redirectPath);
        }
      } else {
        throw new Error('Login failed. No authentication token received.');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Authentication failed. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-lg dark:bg-gray-900">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Login</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Enter your credentials to access the admin dashboard
        </p>
      </div>

      {error && (
        <div className="p-4 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-900/30 dark:text-red-400">
          {error}
        </div>
      )}

      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={credentials.email}
            onChange={handleChange}
            className="block w-full px-3 py-2 mt-1 text-gray-900 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm appearance-none dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-brand-500 focus:border-brand-500"
            placeholder="admin@example.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Password
          </label>
          <div className="relative mt-1">
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              value={credentials.password}
              onChange={handleChange}
              className="block w-full px-3 py-2 text-gray-900 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm appearance-none dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-brand-500 focus:border-brand-500"
              placeholder="••••••••"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 dark:text-gray-400"
              onClick={togglePasswordVisibility}
            >
              {showPassword ? <EyeCloseIcon /> : <EyeIcon />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="w-4 h-4 text-brand-600 border-gray-300 rounded focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800"
            />
            <label htmlFor="remember-me" className="block ml-2 text-sm text-gray-700 dark:text-gray-300">
              Remember me
            </label>
          </div>

          <div className="text-sm">
            <a href="#" className="font-medium text-brand-600 hover:text-brand-500 dark:text-brand-400">
              Forgot password?
            </a>
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={loading}
            className="flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-brand-600 border border-transparent rounded-md shadow-sm hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <svg className="w-5 h-5 mr-3 -ml-1 text-white animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing in...
              </>
            ) : (
              'Sign in'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;
