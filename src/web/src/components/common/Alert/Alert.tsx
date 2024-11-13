// @mui/material v5.14.x
// react v18.x
import React, { useEffect } from 'react';
import { Alert as MuiAlert, AlertProps, styled } from '@mui/material';
import createAppTheme from '../../../assets/styles/theme';

/*
Human Tasks:
1. Verify alert color contrast ratios meet WCAG 2.1 Level AA requirements
2. Test screen reader compatibility with dynamic alerts
3. Validate alert auto-hide behavior across different browsers
4. Test keyboard navigation and focus management
*/

// Extend AlertProps while omitting css prop to prevent styled-components conflict
interface CustomAlertProps extends Omit<AlertProps, 'css'> {
  message: string;
  autoHideDuration?: number;
  onClose?: () => void;
  severity?: AlertProps['severity'];
}

// Requirement: Visual Hierarchy - Status-driven color coding for clear visual feedback
// Requirement: Component Library - Material Design components with consistent theming
const StyledAlert = styled(MuiAlert)(({ theme }) => ({
  margin: theme.spacing(1),
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[2],
  
  // Custom severity-based color schemes using theme palette
  '&.MuiAlert-standardSuccess': {
    backgroundColor: theme.palette.success.light,
    color: theme.palette.success.contrastText,
  },
  '&.MuiAlert-standardError': {
    backgroundColor: theme.palette.error.light,
    color: theme.palette.error.contrastText,
  },
  '&.MuiAlert-standardWarning': {
    backgroundColor: theme.palette.warning.light,
    color: theme.palette.warning.contrastText,
  },
  '&.MuiAlert-standardInfo': {
    backgroundColor: theme.palette.info.light,
    color: theme.palette.info.contrastText,
  },

  // Requirement: Accessibility - WCAG 2.1 Level AA compliance
  '&:focus-visible': {
    outline: `3px solid ${theme.palette.primary.main}`,
    outlineOffset: '2px',
  },

  // Ensure proper contrast for action buttons
  '& .MuiAlert-action': {
    '& .MuiIconButton-root': {
      color: 'inherit',
      '&:hover': {
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
      },
    },
  },
}));

// Requirement: Accessibility - WCAG 2.1 Level AA compliance with ARIA labels
const Alert: React.FC<CustomAlertProps> = ({
  message,
  severity = 'info',
  autoHideDuration,
  onClose,
  ...props
}) => {
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (autoHideDuration && onClose) {
      timeoutId = setTimeout(() => {
        onClose();
      }, autoHideDuration);
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [autoHideDuration, onClose]);

  return (
    <StyledAlert
      severity={severity}
      onClose={onClose}
      role="alert"
      aria-live="polite"
      {...props}
    >
      {message}
    </StyledAlert>
  );
};

export default Alert;