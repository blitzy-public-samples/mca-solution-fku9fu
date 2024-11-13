/**
 * Human Tasks:
 * 1. Verify Auth0 configuration in development and production environments
 * 2. Test authentication flow end-to-end with Auth0 integration
 * 3. Validate role-based access control behavior
 * 4. Ensure proper error handling and user feedback in components
 */

// react v18.2.0
import { useEffect } from 'react';
// react-redux v8.1.0
import { useDispatch, useSelector } from 'react-redux';
// react-router-dom v6.11.0
import { useNavigate } from 'react-router-dom';

import { authService, UserProfile } from '../../services/auth.service';
import { authSlice, authAsyncActions } from '../../redux/slices/authSlice';

/**
 * Interface for useAuth hook return value
 * @implements Authentication Methods requirement from 7.1.1 Authentication Methods
 */
interface UseAuthReturn {
  isAuthenticated: boolean;
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

/**
 * Custom React hook that provides authentication functionality and state management
 * @implements Authentication Methods requirement from 7.1.1 Authentication Methods
 * @implements Role-Based Access Control requirement from 7.1.3 Role-Based Access Control (RBAC)
 * @returns {UseAuthReturn} Authentication state and methods
 */
export const useAuth = (): UseAuthReturn => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Select authentication state from Redux store
  const authState = useSelector((state: any) => state.auth);

  /**
   * Check authentication session on component mount
   * @implements Authentication Methods requirement from 7.1.1 Authentication Methods
   */
  useEffect(() => {
    const checkAuth = async () => {
      try {
        await dispatch(authAsyncActions.checkSessionAsync());
      } catch (error) {
        // Session check failed, user will need to log in again
        navigate('/login');
      }
    };

    checkAuth();
  }, [dispatch, navigate]);

  /**
   * Handle user login
   * @implements Authentication Methods requirement from 7.1.1 Authentication Methods
   */
  const login = async (): Promise<void> => {
    try {
      await dispatch(authAsyncActions.loginAsync());
      navigate('/dashboard');
    } catch (error) {
      // Login error is handled by the async thunk and stored in Redux state
      navigate('/login');
    }
  };

  /**
   * Handle user logout
   * @implements Authentication Methods requirement from 7.1.1 Authentication Methods
   */
  const logout = async (): Promise<void> => {
    try {
      await dispatch(authAsyncActions.logoutAsync());
      navigate('/login');
    } catch (error) {
      // Logout error is handled by the async thunk and stored in Redux state
      console.error('Logout failed:', error);
    }
  };

  return {
    isAuthenticated: authState.isAuthenticated,
    user: authState.user,
    loading: authState.isLoading,
    error: authState.error,
    login,
    logout
  };
};