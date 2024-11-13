// @package react-router-dom@6.14.2

/**
 * Human Tasks:
 * 1. Ensure all route paths are registered in the application router
 * 2. Update authentication configuration to protect relevant routes
 * 3. Configure route guards based on user roles and permissions
 */

/**
 * Route constants for the MCA application
 * Implements UI Design Specifications (5.1 USER INTERFACE DESIGN/5.1.1 Design Specifications)
 * Supports defined interface elements and navigation structure
 */

/**
 * Authentication routes
 * Implements Authentication & Authorization requirements (7. SECURITY CONSIDERATIONS/7.1 AUTHENTICATION AND AUTHORIZATION)
 */
export const AUTH = {
  LOGIN: '/login',
  LOGOUT: '/logout',
  CALLBACK: '/callback'
} as const;

/**
 * Dashboard routes
 * Implements User Interface Navigation (SYSTEM DESIGN/USER INTERFACE DESIGN/Interface Elements)
 */
export const DASHBOARD = {
  INDEX: '/',
  HOME: '/dashboard'
} as const;

/**
 * Application management routes
 * Implements User Interface Navigation (SYSTEM DESIGN/USER INTERFACE DESIGN/Interface Elements)
 */
export const APPLICATIONS = {
  LIST: '/applications',
  DETAIL: '/applications/:id',
  NEW: '/applications/new',
  EDIT: '/applications/:id/edit'
} as const;

/**
 * Document management routes
 * Implements User Interface Navigation (SYSTEM DESIGN/USER INTERFACE DESIGN/Interface Elements)
 */
export const DOCUMENTS = {
  VIEWER: '/documents/:id',
  UPLOAD: '/documents/upload'
} as const;

/**
 * Webhook configuration routes
 * Implements User Interface Navigation (SYSTEM DESIGN/USER INTERFACE DESIGN/Interface Elements)
 */
export const WEBHOOKS = {
  LIST: '/webhooks',
  CONFIG: '/webhooks/config',
  NEW: '/webhooks/new',
  EDIT: '/webhooks/:id'
} as const;

/**
 * Settings and profile routes
 * Implements User Interface Navigation (SYSTEM DESIGN/USER INTERFACE DESIGN/Interface Elements)
 */
export const SETTINGS = {
  INDEX: '/settings',
  PROFILE: '/settings/profile',
  PREFERENCES: '/settings/preferences',
  NOTIFICATIONS: '/settings/notifications'
} as const;

/**
 * Type definitions for route parameters
 */
export type RouteParams = {
  id: string;
  type: string;
};

/**
 * Combined routes object for centralized access
 * Implements UI Design Specifications (5.1 USER INTERFACE DESIGN/5.1.1 Design Specifications)
 */
export const ROUTES = {
  AUTH,
  DASHBOARD,
  APPLICATIONS,
  DOCUMENTS,
  WEBHOOKS,
  SETTINGS
} as const;