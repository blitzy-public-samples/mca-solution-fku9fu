// @package @reduxjs/toolkit@1.9.5

/**
 * Human Tasks:
 * 1. Configure error tracking service to capture API errors
 * 2. Set up performance monitoring for API request durations
 * 3. Review and adjust retry configurations based on production metrics
 */

import { Middleware, isRejectedWithValue, isPending, isFulfilled } from '@reduxjs/toolkit';
import { apiClient, handleApiError } from '../../services/api.service';
import type { AxiosError } from 'axios';

// Constants for API request configuration
const API_REQUEST_TIMEOUT = 30000;
const MAX_RETRIES = 3;

// Interface for API-related Redux actions
interface ApiAction {
  type: string;
  payload: any;
  meta: {
    requestId: string;
    requestStatus: 'pending' | 'fulfilled' | 'rejected';
  };
}

/**
 * REQ: API Architecture (5. SYSTEM DESIGN/5.3 API DESIGN/5.3.1 API Architecture)
 * Creates Redux middleware for handling API requests and responses with JWT authentication
 * and standardized error handling
 */
const createApiMiddleware = (): Middleware => {
  return (store) => (next) => async (action) => {
    // Skip non-API actions
    if (!action.type?.includes('/api/')) {
      return next(action);
    }

    // Process different states of API requests
    if (isPending(action)) {
      return handleApiRequest(action as ApiAction, store);
    }

    if (isFulfilled(action)) {
      // Log successful API requests for monitoring
      console.debug(`API Request Success: ${action.type}`, {
        requestId: action.meta?.requestId,
        timestamp: new Date().toISOString()
      });
      return next(action);
    }

    if (isRejectedWithValue(action)) {
      // Handle API errors with consistent error formatting
      const error = action.payload as AxiosError;
      try {
        const formattedError = handleApiError(error);
        return next({
          ...action,
          payload: formattedError
        });
      } catch (handledError) {
        return next({
          ...action,
          payload: handledError
        });
      }
    }

    return next(action);
  };
};

/**
 * REQ: Interface Specifications (5. SYSTEM DESIGN/5.3 API DESIGN/5.3.2 Interface Specifications)
 * Processes API request actions and manages request lifecycle
 */
const handleApiRequest = async (action: ApiAction, store: any): Promise<void> => {
  const { type, payload } = action;
  const requestId = action.meta?.requestId;

  try {
    // Extract API request details from action type
    const [baseType, method, ...pathParts] = type.split('/');
    const path = `/${pathParts.join('/')}`;

    // Configure request options
    const options = {
      method,
      timeout: API_REQUEST_TIMEOUT,
      ...payload?.options,
      headers: {
        ...payload?.options?.headers
      }
    };

    // Make API request with retry logic
    let retryCount = 0;
    let lastError: any;

    while (retryCount < MAX_RETRIES) {
      try {
        const response = await apiClient.request({
          url: path,
          ...options,
          data: payload?.data
        });

        // Dispatch success action
        store.dispatch({
          type: `${type}/fulfilled`,
          payload: response.data,
          meta: {
            requestId,
            requestStatus: 'fulfilled'
          }
        });

        return;
      } catch (error) {
        lastError = error;
        retryCount++;

        if (retryCount < MAX_RETRIES) {
          // Exponential backoff delay
          await new Promise(resolve => 
            setTimeout(resolve, Math.pow(2, retryCount) * 1000)
          );
        }
      }
    }

    // If all retries failed, handle the error
    throw lastError;
  } catch (error) {
    // Dispatch error action
    store.dispatch({
      type: `${type}/rejected`,
      payload: error,
      meta: {
        requestId,
        requestStatus: 'rejected'
      }
    });
  }
};

// Export configured middleware instance
export const apiMiddleware = createApiMiddleware();
export { handleApiRequest };