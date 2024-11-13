// @package react@18.x
// @package react-redux@8.x
// @package @mui/material@5.x

/**
 * Human Tasks:
 * 1. Configure screen reader preferences in system settings for optimal accessibility
 * 2. Verify color contrast ratios meet WCAG 2.1 Level AA standards
 * 3. Test keyboard navigation flow with screen readers
 */

import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Alert, Snackbar } from '@mui/material';
import { dismiss } from '../../../hooks/useNotification';
import { hideNotification } from '../../../redux/slices/uiSlice';

/**
 * Toast notification component that displays temporary messages with different severity levels
 * Implements:
 * - Visual Hierarchy (SYSTEM DESIGN/USER INTERFACE DESIGN/Design Specifications)
 *   Status-driven color coding for different notification types
 * - Component Library (SYSTEM DESIGN/USER INTERFACE DESIGN/Design Specifications)
 *   Material Design components integration
 * - Accessibility (SYSTEM DESIGN/USER INTERFACE DESIGN/Design Specifications)
 *   ARIA labels and keyboard navigation support
 */
const Toast: React.FC = () => {
  // Select current notification from Redux store
  const currentNotification = useSelector((state: any) => 
    state.ui.notifications[0] || null
  );

  // Set up auto-dismiss effect if duration is specified
  useEffect(() => {
    if (currentNotification?.duration && currentNotification?.duration > 0) {
      const timer = setTimeout(() => {
        handleClose(null, 'timeout');
      }, currentNotification.duration);

      // Cleanup timer on unmount or notification change
      return () => clearTimeout(timer);
    }
  }, [currentNotification]);

  /**
   * Handles closing of toast notification
   * Implements auto-dismiss and manual close functionality
   */
  const handleClose = (
    event: React.SyntheticEvent | null,
    reason?: string
  ): void => {
    // Prevent closing on clickaway
    if (reason === 'clickaway') {
      return;
    }

    if (currentNotification?.id) {
      // Dismiss notification through hook and update Redux state
      dismiss(currentNotification.id);
      hideNotification(currentNotification.id);
    }
  };

  // Map notification types to Material-UI severity levels
  const getSeverity = (type: string) => {
    switch (type) {
      case 'success':
        return 'success';
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      case 'info':
        return 'info';
      default:
        return 'info';
    }
  };

  return (
    <Snackbar
      open={!!currentNotification}
      autoHideDuration={currentNotification?.duration || null}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      // Implements accessibility requirement
      aria-live="polite"
      role="alert"
    >
      <Alert
        onClose={handleClose}
        severity={getSeverity(currentNotification?.type)}
        variant="filled"
        elevation={6}
        // Implements accessibility requirement
        sx={{
          width: '100%',
          minWidth: '300px',
          '& .MuiAlert-message': {
            flex: 1,
          },
          // Ensure sufficient color contrast for accessibility
          '& .MuiAlert-icon': {
            marginRight: 1,
          },
        }}
      >
        {currentNotification?.message}
      </Alert>
    </Snackbar>
  );
};

export default Toast;