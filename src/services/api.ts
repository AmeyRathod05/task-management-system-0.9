import axios from 'axios';
import loginService from './loginService';

// Get the API URL from environment variables
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

console.log('API Base URL:', BASE_URL);

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout
});

// Add a request interceptor to include the token in headers
api.interceptors.request.use(
  (config) => {
    const token = loginService.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
