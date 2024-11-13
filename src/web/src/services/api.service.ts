// @package axios@1.4.0

/**
 * Human Tasks:
 * 1. Configure JWT token storage mechanism in the application
 * 2. Set up error tracking/monitoring service integration
 * 3. Configure rate limiting and retry policies in load balancer/API gateway
 * 4. Review and adjust timeout and file size limits based on production metrics
 */

import axios, { AxiosError, AxiosInstance } from 'axios';
import { API_CONFIG } from '../config/api.config';
import { Application } from '../interfaces/application.interface';
import { Document } from '../interfaces/document.interface';
import { WebhookConfig } from '../interfaces/webhook.interface';

/**
 * REQ: API Architecture (5. SYSTEM DESIGN/5.3 API DESIGN/5.3.1 API Architecture)
 * Creates and configures an axios instance with base configuration, interceptors, and retry logic
 */
const createApiClient = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    timeout: API_CONFIG.TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  });

  // Request interceptor for authentication and file size validation
  instance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('jwt_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      if (config.data instanceof FormData) {
        const file = config.data.get('file') as File;
        if (file && file.size > API_CONFIG.MAX_UPLOAD_SIZE) {
          return Promise.reject(new Error('File size exceeds maximum allowed size'));
        }
      }

      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor for error handling and retries
  instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as any;

      if (!originalRequest._retry && error.response?.status === 401) {
        originalRequest._retry = true;
        try {
          const refreshToken = localStorage.getItem('refresh_token');
          const response = await instance.post('/api/v1/auth/refresh', { refreshToken });
          const newToken = response.data.token;
          localStorage.setItem('jwt_token', newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return instance(originalRequest);
        } catch (refreshError) {
          localStorage.removeItem('jwt_token');
          localStorage.removeItem('refresh_token');
          return Promise.reject(refreshError);
        }
      }

      if (!originalRequest._retryCount) {
        originalRequest._retryCount = 0;
      }

      if (originalRequest._retryCount < API_CONFIG.RETRY_ATTEMPTS) {
        originalRequest._retryCount++;
        return new Promise((resolve) => {
          setTimeout(() => resolve(instance(originalRequest)), 
            1000 * originalRequest._retryCount);
        });
      }

      return Promise.reject(handleApiError(error));
    }
  );

  return instance;
};

/**
 * REQ: Interface Specifications (5. SYSTEM DESIGN/5.3 API DESIGN/5.3.2 Interface Specifications)
 * Retrieves a paginated list of MCA applications
 */
export const getApplications = async (params: {
  page: number;
  limit: number;
  status?: string;
}): Promise<{ data: Application[]; total: number; page: number }> => {
  try {
    const response = await apiClient.get('/api/v1/applications', { params });
    return response.data;
  } catch (error) {
    throw handleApiError(error as AxiosError);
  }
};

/**
 * REQ: Interface Specifications (5. SYSTEM DESIGN/5.3 API DESIGN/5.3.2 Interface Specifications)
 * Retrieves a single application by ID
 */
export const getApplicationById = async (id: string): Promise<Application> => {
  try {
    const response = await apiClient.get(`/api/v1/applications/${id}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error as AxiosError);
  }
};

/**
 * REQ: Integration Requirements (5. SYSTEM DESIGN/5.3 API DESIGN/5.3.3 Integration Requirements)
 * Uploads a document for an application
 */
export const uploadDocument = async (
  applicationId: string,
  file: File,
  type: string
): Promise<Document> => {
  try {
    if (file.size > API_CONFIG.MAX_UPLOAD_SIZE) {
      throw new Error('File size exceeds maximum allowed size');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    formData.append('applicationId', applicationId);

    const response = await apiClient.post('/api/v1/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    return response.data;
  } catch (error) {
    throw handleApiError(error as AxiosError);
  }
};

/**
 * REQ: Integration Requirements (5. SYSTEM DESIGN/5.3 API DESIGN/5.3.3 Integration Requirements)
 * Creates or updates a webhook configuration
 */
export const configureWebhook = async (config: WebhookConfig): Promise<WebhookConfig> => {
  try {
    const method = config.id ? 'put' : 'post';
    const url = config.id 
      ? `/api/v1/webhooks/${config.id}`
      : '/api/v1/webhooks';

    const response = await apiClient[method](url, config);
    return response.data;
  } catch (error) {
    throw handleApiError(error as AxiosError);
  }
};

/**
 * REQ: API Architecture (5. SYSTEM DESIGN/5.3 API DESIGN/5.3.1 API Architecture)
 * Processes API errors and formats them for consistent error handling
 */
const handleApiError = (error: AxiosError): never => {
  const status = error.response?.status || 500;
  const data = error.response?.data || {};

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
    case 429:
      message = 'Too many requests';
      break;
    case 500:
      message = 'Internal server error';
      break;
  }

  throw {
    message,
    status,
    data,
    timestamp: new Date().toISOString(),
    path: error.config?.url
  };
};

// Initialize and export the API client instance
export const apiClient = createApiClient();