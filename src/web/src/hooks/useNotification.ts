// @package react@18.x
// @package react-redux@8.x

import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { showNotification, hideNotification } from '../../redux/slices/uiSlice';

/**
 * Interface for notification configuration
 * Implements: Visual Hierarchy - Status-driven color coding for different notification types
 */
interface NotificationConfig {
  message: string;
  severity: string;
  duration?: number;
}

/**
 * Custom hook for managing toast notifications with Material Design patterns
 * Implements:
 * - Visual Hierarchy (SYSTEM DESIGN/USER INTERFACE DESIGN/Design Specifications)
 * - Component Library (SYSTEM DESIGN/USER INTERFACE DESIGN/Design Specifications)
 */
export const useNotification = () => {
  const dispatch = useDispatch();

  /**
   * Shows a success notification with green styling and 6s auto-dismiss
   */
  const showSuccess = useCallback((message: string) => {
    const id = `success-${Date.now()}`;
    dispatch(
      showNotification({
        id,
        message,
        type: 'success',
        duration: 6000,
      })
    );
  }, [dispatch]);

  /**
   * Shows an error notification with red styling and manual dismiss
   */
  const showError = useCallback((message: string) => {
    const id = `error-${Date.now()}`;
    dispatch(
      showNotification({
        id,
        message,
        type: 'error',
        duration: 0, // Manual dismiss only
      })
    );
  }, [dispatch]);

  /**
   * Shows a warning notification with amber styling and 6s auto-dismiss
   */
  const showWarning = useCallback((message: string) => {
    const id = `warning-${Date.now()}`;
    dispatch(
      showNotification({
        id,
        message,
        type: 'warning',
        duration: 6000,
      })
    );
  }, [dispatch]);

  /**
   * Shows an info notification with blue styling and 6s auto-dismiss
   */
  const showInfo = useCallback((message: string) => {
    const id = `info-${Date.now()}`;
    dispatch(
      showNotification({
        id,
        message,
        type: 'info',
        duration: 6000,
      })
    );
  }, [dispatch]);

  /**
   * Dismisses a specific notification by ID
   */
  const dismiss = useCallback((id: string) => {
    dispatch(hideNotification(id));
  }, [dispatch]);

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    dismiss,
  };
};

export default useNotification;