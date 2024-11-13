/**
 * Human Tasks:
 * 1. Verify Auth0 configuration in development and production environments
 * 2. Test authentication flow with middleware integration
 * 3. Validate session refresh behavior and token expiration handling
 * 4. Ensure proper error handling and state updates in Redux store
 */

// @reduxjs/toolkit v1.9.5
import { Middleware } from '@reduxjs/toolkit';
// redux v4.2.1
import { AnyAction } from 'redux';
import { authService } from '../../services/auth.service';
import { actions as authActions } from '../slices/authSlice';

/**
 * Interface for auth middleware actions
 * @implements Authentication Methods requirement from 7.1.1 Authentication Methods
 */
interface AuthMiddlewareAction extends AnyAction {
  type: string;
  payload: any;
}

// Auth action types
const AUTH_ACTIONS = {
  LOGIN: 'auth/login',
  LOGOUT: 'auth/logout',
  CHECK_SESSION: 'auth/checkSession'
};

/**
 * Handles authentication-related actions in the middleware using Auth0
 * @implements Authentication Methods requirement from 7.1.1 Authentication Methods
 */
const handleAuthAction = async (action: AuthMiddlewareAction): Promise<void> => {
  try {
    switch (action.type) {
      case AUTH_ACTIONS.LOGIN:
        await authService.login();
        break;
      case AUTH_ACTIONS.LOGOUT:
        await authService.logout();
        break;
      case AUTH_ACTIONS.CHECK_SESSION:
        await authService.checkSession();
        break;
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Authentication operation failed';
    throw new Error(errorMessage);
  }
};

/**
 * Periodically checks authentication session validity with Auth0
 * @implements Session Management requirement from 7.1.1 Authentication Methods
 */
const checkAuthSession = async (): Promise<void> => {
  try {
    const token = await authService.getAccessToken();
    if (token) {
      await authService.checkSession();
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Session check failed';
    throw new Error(errorMessage);
  }
};

/**
 * Creates the authentication middleware for Redux store that handles Auth0 integration
 * @implements Authentication Methods requirement from 7.1.1 Authentication Methods
 */
const createAuthMiddleware = (): Middleware => {
  return store => next => async (action: AuthMiddlewareAction) => {
    // First, pass the action to the next middleware
    const result = next(action);

    try {
      switch (action.type) {
        case AUTH_ACTIONS.LOGIN:
          store.dispatch(authActions.setLoading(true));
          await handleAuthAction(action);
          break;

        case AUTH_ACTIONS.LOGOUT:
          store.dispatch(authActions.setLoading(true));
          await handleAuthAction(action);
          store.dispatch(authActions.clearAuth());
          break;

        case AUTH_ACTIONS.CHECK_SESSION:
          await handleAuthAction(action);
          // Schedule next session check (every 15 minutes)
          setTimeout(() => {
            store.dispatch({ type: AUTH_ACTIONS.CHECK_SESSION });
          }, 15 * 60 * 1000);
          break;
      }
    } catch (error) {
      store.dispatch(authActions.setError(error instanceof Error ? error.message : 'Authentication error'));
    } finally {
      if (action.type.startsWith('auth/')) {
        store.dispatch(authActions.setLoading(false));
      }
    }

    return result;
  };
};

/**
 * Configured auth middleware instance for Redux store with Auth0 integration
 * @implements Authentication Methods requirement from 7.1.1 Authentication Methods
 */
export const authMiddleware = createAuthMiddleware();