/// <reference types="vite/client" /> // vite ^4.4.0

/*
Human Tasks:
1. Create a .env file in the web project root with all required environment variables
2. Ensure Auth0 tenant is properly configured and credentials are obtained
3. Validate that all environment variables follow the specified validation patterns:
   - VITE_API_URL: Must be a valid HTTP/HTTPS URL
   - VITE_AUTH0_DOMAIN: Must be a valid Auth0 domain
   - VITE_AUTH0_CLIENT_ID: Must be a 32-character alphanumeric string
   - VITE_API_TIMEOUT: Must be a positive integer
*/

// REQ: Environment Configuration - Type definitions for web frontend configuration
// Defines the structure of environment variables available in the application
interface ImportMetaEnv {
  /**
   * Full URL of the MCA application API endpoint
   * @pattern ^https?://[\w.-]+(?::\d+)?(?:/[\w.-]*)*$
   */
  readonly VITE_API_URL: string;

  /**
   * Auth0 tenant domain for authentication
   * @pattern ^[\w.-]+\.auth0\.com$
   */
  readonly VITE_AUTH0_DOMAIN: string;

  /**
   * Auth0 application client ID
   * @pattern ^[a-zA-Z0-9]{32}$
   */
  readonly VITE_AUTH0_CLIENT_ID: string;

  /**
   * Auth0 API audience identifier
   */
  readonly VITE_AUTH0_AUDIENCE: string;

  /**
   * Base URL for API requests
   */
  readonly VITE_API_BASE_URL: string;

  /**
   * API version string (e.g., 'v1')
   */
  readonly VITE_API_VERSION: string;

  /**
   * API request timeout in milliseconds
   * @pattern ^\d+$
   */
  readonly VITE_API_TIMEOUT: string;
}

// REQ: Web Frontend Development Environment - TypeScript development environment configuration
// REQ: Security Configuration - Type definitions for secure authentication configuration
// Augments the ImportMeta interface to include typed environment variables
interface ImportMeta {
  readonly env: ImportMetaEnv;
}