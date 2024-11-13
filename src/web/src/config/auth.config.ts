/**
 * Human Tasks:
 * 1. Create Auth0 tenant and application if not already done
 * 2. Configure Auth0 application callback URLs in Auth0 dashboard
 * 3. Set up Auth0 API identifier for audience value
 * 4. Configure allowed CORS origins in Auth0 dashboard
 * 5. Set up appropriate roles and permissions in Auth0
 */

// @auth0/auth0-spa-js v2.1.0
import { Auth0ClientOptions } from '@auth0/auth0-spa-js';

/**
 * Interface defining the authentication configuration structure
 * @implements Security Architecture requirement from 4.4.2 Security Architecture
 */
export interface AuthConfig {
  domain: string;
  clientId: string;
  audience: string;
  scope: string;
  redirectUri: string;
}

/**
 * Storage keys for authentication data in browser storage
 * @implements Authentication Methods requirement from 7.1.1 Authentication Methods
 */
export const AUTH_STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  ID_TOKEN: 'id_token',
  USER_PROFILE: 'user_profile',
  TOKEN_EXPIRY: 'token_expiry'
} as const;

/**
 * Default authentication configuration values for Auth0 integration
 * @implements Role-Based Access Control requirement from 7.1.3 Role-Based Access Control
 */
export const AUTH_DEFAULTS = {
  SCOPE: 'openid profile email',
  RESPONSE_TYPE: 'token id_token',
  TOKEN_RENEWAL_BUFFER: 300000, // 5 minutes in milliseconds
  SESSION_CHECK_INTERVAL: 60000  // 1 minute in milliseconds
} as const;

/**
 * Auth0 configuration for the MCA application
 * @implements Authentication Methods requirement from 7.1.1 Authentication Methods
 */
export const authConfig: AuthConfig = {
  domain: 'dollarfunding.us.auth0.com',
  clientId: 'YOUR_AUTH0_CLIENT_ID', // To be replaced with actual client ID
  audience: 'https://api.dollarfunding.com',
  scope: AUTH_DEFAULTS.SCOPE,
  redirectUri: `${window.location.origin}/callback`
} as const;

/**
 * Auth0 client configuration options
 * @implements Security Architecture requirement from 4.4.2 Security Architecture
 */
export const auth0Config: Auth0ClientOptions = {
  domain: authConfig.domain,
  clientId: authConfig.clientId,
  authorizationParams: {
    audience: authConfig.audience,
    scope: authConfig.scope,
    redirect_uri: authConfig.redirectUri,
    response_type: AUTH_DEFAULTS.RESPONSE_TYPE
  },
  cacheLocation: 'localstorage',
  useRefreshTokens: true,
  useRefreshTokensFallback: true,
  sessionCheckExpiryDays: 1,
  advancedOptions: {
    defaultScope: authConfig.scope
  }
} as const;