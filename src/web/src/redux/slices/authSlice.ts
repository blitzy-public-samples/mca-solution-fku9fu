/**
 * Human Tasks:
 * 1. Verify Auth0 configuration matches the environment settings
 * 2. Test authentication flow end-to-end in development environment
 * 3. Validate token storage and session management behavior
 * 4. Ensure proper error handling and user feedback in the UI
 */

// @reduxjs/toolkit v1.9.5
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authService, UserProfile } from '../../services/auth.service';
import { AUTH_STORAGE_KEYS } from '../../config/auth.config';

/**
 * Interface for authentication state in Redux store
 * @implements Authentication Methods requirement from 7.1.1 Authentication Methods
 */
interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: UserProfile | null;
  error: string | null;
}

/**
 * Initial state for authentication slice
 * @implements Authentication Methods requirement from 7.1.1 Authentication Methods
 */
const initialState: AuthState = {
  isAuthenticated: false,
  isLoading: false,
  user: null,
  error: null
};

/**
 * Async thunk for handling user login through Auth0
 * @implements Authentication Methods requirement from 7.1.1 Authentication Methods
 */
export const loginAsync = createAsyncThunk(
  'auth/login',
  async (_, { dispatch }) => {
    try {
      dispatch(setLoading(true));
      await authService.login();
      const profile = await authService.getUserProfile();
      dispatch(setUser(profile));
      dispatch(setAuthenticated(true));
    } catch (error) {
      dispatch(setError(error instanceof Error ? error.message : 'Login failed'));
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  }
);

/**
 * Async thunk for handling user logout
 * @implements Authentication Methods requirement from 7.1.1 Authentication Methods
 */
export const logoutAsync = createAsyncThunk(
  'auth/logout',
  async (_, { dispatch }) => {
    try {
      dispatch(setLoading(true));
      await authService.logout();
      dispatch(clearAuth());
    } catch (error) {
      dispatch(setError(error instanceof Error ? error.message : 'Logout failed'));
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  }
);

/**
 * Async thunk for checking and renewing auth session
 * @implements Authentication Methods requirement from 7.1.1 Authentication Methods
 */
export const checkSessionAsync = createAsyncThunk(
  'auth/checkSession',
  async (_, { dispatch }) => {
    try {
      await authService.checkSession();
      const storedProfile = localStorage.getItem(AUTH_STORAGE_KEYS.USER_PROFILE);
      
      if (storedProfile) {
        const profile = JSON.parse(storedProfile) as UserProfile;
        dispatch(setUser(profile));
        dispatch(setAuthenticated(true));
      } else {
        const profile = await authService.getUserProfile();
        dispatch(setUser(profile));
        dispatch(setAuthenticated(true));
      }
    } catch (error) {
      dispatch(setError(error instanceof Error ? error.message : 'Session check failed'));
      dispatch(clearAuth());
      throw error;
    }
  }
);

/**
 * Auth slice with reducers and actions
 * @implements Authorization Model requirement from 7.1.2 Authorization Model
 */
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthenticated: (state, action: PayloadAction<boolean>) => {
      state.isAuthenticated = action.payload;
    },
    setUser: (state, action: PayloadAction<UserProfile>) => {
      state.user = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearAuth: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.error = null;
    }
  }
});

// Export actions and reducer
export const {
  setAuthenticated,
  setUser,
  setLoading,
  setError,
  clearAuth
} = authSlice.actions;

export const authActions = authSlice.actions;

export const authAsyncActions = {
  loginAsync,
  logoutAsync,
  checkSessionAsync
};

export default authSlice.reducer;