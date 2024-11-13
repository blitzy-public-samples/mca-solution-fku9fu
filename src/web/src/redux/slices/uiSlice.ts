// @package @reduxjs/toolkit@^1.9.5

/**
 * Human Tasks:
 * 1. Configure theme detection based on system preferences using window.matchMedia
 * 2. Set up notification sound preferences in system settings
 * 3. Configure loading indicator styles in theme configuration
 * 4. Set up local storage persistence for theme preferences
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DASHBOARD } from '../../constants/routes.constants';

// Type Definitions
export type ThemeType = 'light' | 'dark' | 'system';

// Interfaces
export interface NotificationPayload {
  id: string;
  message: string;
  type: string;
  duration?: number;
}

export interface UIState {
  theme: ThemeType;
  isLoading: boolean;
  notifications: NotificationPayload[];
}

// Initial state
const initialState: UIState = {
  theme: 'system', // Default to system preference
  isLoading: false,
  notifications: [],
};

/**
 * UI Slice implementation
 * Implements:
 * - User Interface Design (5.1 USER INTERFACE DESIGN/5.1.1 Design Specifications)
 * - Loading States (5.1 USER INTERFACE DESIGN/5.1.2 Interface Elements)
 * - Notifications (5.1 USER INTERFACE DESIGN/5.1.2 Interface Elements)
 */
const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    /**
     * Theme management reducer
     * Implements theme support including light/dark mode and system preferences
     */
    setTheme: (state, action: PayloadAction<ThemeType>) => {
      const theme = action.payload;
      state.theme = theme;
      
      // Update document root class for theme
      const root = document.documentElement;
      root.classList.remove('theme-light', 'theme-dark');
      
      if (theme !== 'system') {
        root.classList.add(`theme-${theme}`);
      } else {
        // Handle system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        root.classList.add(`theme-${prefersDark ? 'dark' : 'light'}`);
      }
      
      // Persist theme preference
      localStorage.setItem('theme-preference', theme);
    },

    /**
     * Loading state management reducer
     * Implements loading states for asynchronous operations
     */
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    /**
     * Notification management reducers
     * Implements system notifications and alerts
     */
    showNotification: (state, action: PayloadAction<NotificationPayload>) => {
      const notification = {
        ...action.payload,
        id: action.payload.id || `notification-${Date.now()}-${Math.random()}`,
      };
      
      // Add notification to queue
      state.notifications.push(notification);

      // Auto-dismiss if duration specified
      if (notification.duration) {
        setTimeout(() => {
          document.dispatchEvent(
            new CustomEvent('dismissNotification', { detail: notification.id })
          );
        }, notification.duration);
      }
    },

    hideNotification: (state, action: PayloadAction<string>) => {
      const notificationId = action.payload;
      state.notifications = state.notifications.filter(
        notification => notification.id !== notificationId
      );
    },

    // Additional UI state management
    clearAllNotifications: (state) => {
      state.notifications = [];
    },

    resetUIState: (state) => {
      state.isLoading = false;
      state.notifications = [];
      // Preserve theme preference
      const currentTheme = state.theme;
      Object.assign(state, { ...initialState, theme: currentTheme });
    },
  },
});

// Export actions for component usage
export const uiActions = {
  ...uiSlice.actions,
};

// Export reducer as default
export default uiSlice.reducer;