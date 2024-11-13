/**
 * Human Tasks:
 * 1. Verify Auth0 tenant and application configuration
 * 2. Ensure Auth0 callback URLs are properly configured
 * 3. Confirm API identifier matches the audience value
 * 4. Verify CORS origins are configured in Auth0 dashboard
 * 5. Test authentication flow in development environment
 */

// @auth0/auth0-spa-js v2.1.0
import { Auth0Client } from '@auth0/auth0-spa-js';
import { authConfig, AUTH_STORAGE_KEYS } from '../config/auth.config';
import apiClient from './api.service';

/**
 * Interface for authenticated user profile data
 * @implements Authorization Model requirement from 7.1.2 Authorization Model
 */
export interface UserProfile {
  sub: string;
  email: string;
  name: string;
  roles: string[];
  picture: string;
}

/**
 * Interface for authentication state
 * @implements Authentication Methods requirement from 7.1.1 Authentication Methods
 */
export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: UserProfile | null;
  error: string | null;
}

// Authentication state management
let auth0Client: Auth0Client | null = null;
let authState: AuthState = {
  isAuthenticated: false,
  isLoading: true,
  user: null,
  error: null
};

/**
 * Initializes the Auth0 client with configuration
 * @implements Authentication Methods requirement from 7.1.1 Authentication Methods
 */
const initializeAuth = async (): Promise<Auth0Client> => {
  try {
    if (!auth0Client) {
      auth0Client = new Auth0Client({
        domain: authConfig.domain,
        clientId: authConfig.clientId,
        authorizationParams: {
          redirect_uri: authConfig.redirectUri,
          audience: authConfig.audience,
          scope: authConfig.scope
        },
        cacheLocation: 'localstorage',
        useRefreshTokens: true
      });
      await auth0Client.checkSession();
    }
    return auth0Client;
  } catch (error) {
    authState.error = error instanceof Error ? error.message : 'Failed to initialize Auth0';
    throw error;
  }
};

/**
 * Initiates the login process with Auth0
 * @implements Authentication Methods requirement from 7.1.1 Authentication Methods
 */
const login = async (): Promise<void> => {
  try {
    const client = await initializeAuth();
    await client.loginWithRedirect({
      authorizationParams: {
        redirect_uri: authConfig.redirectUri,
        audience: authConfig.audience,
        scope: authConfig.scope
      }
    });
  } catch (error) {
    authState.error = error instanceof Error ? error.message : 'Login failed';
    throw error;
  }
};

/**
 * Logs out the user and clears authentication state
 * @implements Authentication Methods requirement from 7.1.1 Authentication Methods
 */
const logout = async (): Promise<void> => {
  try {
    const client = await initializeAuth();
    Object.values(AUTH_STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
    await client.logout({
      logoutParams: {
        returnTo: window.location.origin
      }
    });
    authState = {
      isAuthenticated: false,
      isLoading: false,
      user: null,
      error: null
    };
  } catch (error) {
    authState.error = error instanceof Error ? error.message : 'Logout failed';
    throw error;
  }
};

/**
 * Retrieves the current access token
 * @implements Authentication Methods requirement from 7.1.1 Authentication Methods
 */
const getAccessToken = async (): Promise<string> => {
  try {
    const client = await initializeAuth();
    const token = await client.getTokenSilently({
      authorizationParams: {
        audience: authConfig.audience,
        scope: authConfig.scope
      }
    });
    localStorage.setItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN, token);
    localStorage.setItem(AUTH_STORAGE_KEYS.TOKEN_EXPIRY, (Date.now() + 3600000).toString());
    return token;
  } catch (error) {
    authState.error = error instanceof Error ? error.message : 'Failed to get access token';
    throw error;
  }
};

/**
 * Retrieves the authenticated user's profile
 * @implements Authorization Model requirement from 7.1.2 Authorization Model
 */
const getUserProfile = async (): Promise<UserProfile> => {
  try {
    const client = await initializeAuth();
    const user = await client.getUser();
    if (!user) {
      throw new Error('User profile not found');
    }

    const profile: UserProfile = {
      sub: user.sub ?? '',
      email: user.email ?? '',
      name: user.name ?? '',
      roles: (user['https://api.dollarfunding.com/roles'] as string[]) || [],
      picture: user.picture ?? ''
    };

    localStorage.setItem(AUTH_STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
    authState.user = profile;
    return profile;
  } catch (error) {
    authState.error = error instanceof Error ? error.message : 'Failed to get user profile';
    throw error;
  }
};

/**
 * Checks and renews the authentication session
 * @implements Authentication Methods requirement from 7.1.1 Authentication Methods
 */
const checkSession = async (): Promise<void> => {
  try {
    const client = await initializeAuth();
    const expiryTime = localStorage.getItem(AUTH_STORAGE_KEYS.TOKEN_EXPIRY);
    
    if (expiryTime && Date.now() > parseInt(expiryTime)) {
      const token = await client.getTokenSilently({
        authorizationParams: {
          audience: authConfig.audience,
          scope: authConfig.scope
        }
      });
      localStorage.setItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN, token);
      localStorage.setItem(AUTH_STORAGE_KEYS.TOKEN_EXPIRY, (Date.now() + 3600000).toString());
    }

    const isAuthenticated = await client.isAuthenticated();
    authState.isAuthenticated = isAuthenticated;
    
    if (isAuthenticated && !authState.user) {
      await getUserProfile();
    }
    
    authState.isLoading = false;
  } catch (error) {
    authState.error = error instanceof Error ? error.message : 'Session check failed';
    throw error;
  }
};

/**
 * Authentication service object
 * @implements Authentication Methods requirement from 7.1.1 Authentication Methods
 */
export const authService = {
  login,
  logout,
  getAccessToken,
  getUserProfile,
  checkSession
};