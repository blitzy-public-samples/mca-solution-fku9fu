// @package axios@1.4.0

/**
 * Human Tasks:
 * 1. Configure environment variables for VITE_API_BASE_URL in .env files
 * 2. Set up SSL certificates for HTTPS communication
 * 3. Configure JWT token storage and refresh mechanism
 * 4. Set up rate limiting rules on the server side
 */

import axios, { AxiosError, AxiosInstance } from 'axios';
import { ROUTES } from '../constants/routes.constants';

/**
 * API configuration constants
 * Implements API Architecture (5. SYSTEM DESIGN/5.3 API DESIGN/5.3.1 API Architecture)
 */
export const API_CONFIG = {
  BASE_URL: process.env.VITE_API_BASE_URL,
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
  MAX_UPLOAD_SIZE: 10485760 // 10MB in bytes
} as const;

/**
 * API endpoints configuration aligned with route constants
 * Implements Interface Specifications (5. SYSTEM DESIGN/5.3 API DESIGN/5.3.2 Interface Specifications)
 */
const API_ENDPOINTS = {
  APPLICATIONS: {
    LIST: '/api/v1/applications',
    DETAIL: '/api/v1/applications/:id',
    CREATE: '/api/v1/applications',
    UPDATE: '/api/v1/applications/:id',
    DELETE: '/api/v1/applications/:id'
  },
  DOCUMENTS: {
    UPLOAD: '/api/v1/documents/upload',
    DOWNLOAD: '/api/v1/documents/:id/download',
    PROCESS: '/api/v1/documents/:id/process'
  },
  WEBHOOKS: {
    LIST: '/api/v1/webhooks',
    CREATE: '/api/v1/webhooks',
    UPDATE: '/api/v1/webhooks/:id',
    DELETE: '/api/v1/webhooks/:id',
    TEST: '/api/v1/webhooks/:id/test'
  }
} as const;

/**
 * Handles API errors and standardizes error responses
 * Implements API Architecture (5. SYSTEM DESIGN/5.3 API DESIGN/5.3.1 API Architecture)
 */
export const handleApiError = (error: AxiosError): {
  message: string;
  status: number;
  details: any;
  context: {
    url: string;
    method: string;
  };
} => {
  const status = error.response?.status || 500;
  const details = error.response?.data || {};
  
  let message = 'An unexpected error occurred';
  
  switch (status) {
    case 400:
      message = 'Invalid request parameters';
      break;
    case 401:
      message = 'Authentication required';
      break;
    case 403:
      message = 'Access forbidden';
      break;
    case 404:
      message = 'Resource not found';
      break;
    case 413:
      message = 'File size exceeds maximum limit';
      break;
    case 429:
      message = 'Too many requests';
      break;
    case 500:
      message = 'Internal server error';
      break;
    case 503:
      message = 'Service temporarily unavailable';
      break;
  }

  if (!error.response) {
    message = error.code === 'ECONNABORTED' 
      ? 'Request timeout'
      : 'Network error';
  }

  return {
    message,
    status,
    details,
    context: {
      url: error.config?.url || '',
      method: error.config?.method?.toUpperCase() || ''
    }
  };
};

/**
 * Creates and configures an axios instance with interceptors and retry logic
 * Implements API Architecture (5. SYSTEM DESIGN/5.3 API DESIGN/5.3.1 API Architecture)
 */
const createAxiosInstance = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    timeout: API_CONFIG.TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  });

  // Request interceptor for authentication
  instance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('jwt_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      // Validate upload size for file uploads
      if (config.data instanceof FormData) {
        const fileField = config.data.get('file');
        if (fileField instanceof File && fileField.size > API_CONFIG.MAX_UPLOAD_SIZE) {
          return Promise.reject(new Error('File size exceeds maximum limit'));
        }
      }
      
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor for error handling and token refresh
  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      // Handle token refresh
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        const refreshToken = localStorage.getItem('refresh_token');
        
        if (refreshToken) {
          try {
            const response = await instance.post('/api/v1/auth/refresh', {
              refresh_token: refreshToken
            });
            
            const { token } = response.data;
            localStorage.setItem('jwt_token', token);
            originalRequest.headers.Authorization = `Bearer ${token}`;
            
            return instance(originalRequest);
          } catch (refreshError) {
            localStorage.removeItem('jwt_token');
            localStorage.removeItem('refresh_token');
            window.location.href = ROUTES.AUTH.LOGIN;
            return Promise.reject(refreshError);
          }
        }
      }

      // Implement retry logic
      if (!originalRequest._retryCount) {
        originalRequest._retryCount = 0;
      }

      if (originalRequest._retryCount < API_CONFIG.RETRY_ATTEMPTS) {
        originalRequest._retryCount++;
        
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve(instance(originalRequest));
          }, API_CONFIG.RETRY_DELAY * originalRequest._retryCount);
        });
      }

      return Promise.reject(error);
    }
  );

  return instance;
};

/**
 * Export configured axios instance
 * Implements API Architecture (5. SYSTEM DESIGN/5.3 API DESIGN/5.3.1 API Architecture)
 */
export const apiClient = createAxiosInstance();