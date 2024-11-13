// @mui/material v5.14.x
// @mui/material/styles v5.14.x
// react v18.x

/*
Human Tasks:
1. Verify dialog contrast ratios meet WCAG 2.1 Level AA requirements using a color contrast analyzer
2. Test keyboard navigation and focus management across supported browsers
3. Validate dialog behavior with screen readers
4. Review dialog content spacing and readability on different screen sizes
*/

import React from 'react';
import {
  Dialog as MuiDialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import Button from '../Button/Button';
import { getThemeOptions } from '../../../config/theme.config';

// Requirement: Component Library - Material Design components with consistent theming
const StyledDialog = styled(MuiDialog)(({ theme }) => ({
  ...theme.components?.MuiDialog?.styleOverrides,
  // Requirement: Accessibility - WCAG 2.1 Level AA compliance
  '& .MuiDialog-paper': {
    margin: theme.spacing(2),
    padding: theme.spacing(2),
    '&:focus-visible': {
      outline: `3px solid ${theme.palette.primary.main}`,
      outlineOffset: '2px',
    },
  },
  // Requirement: Visual Hierarchy - Progressive disclosure and consistent spacing
  '& .MuiDialogTitle-root': {
    padding: theme.spacing(2),
    fontSize: theme.typography.h5.fontSize,
    fontWeight: theme.typography.fontWeightMedium,
  },
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2),
    '&:first-of-type': {
      paddingTop: theme.spacing(2),
    },
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(2),
    gap: theme.spacing(2),
  },
}));

interface DialogProps {
  open: boolean;
  title: string;
  size?: 'small' | 'medium' | 'large' | 'fullscreen';
  children: React.ReactNode;
  onClose: () => void;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
  showActions?: boolean;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
  disableBackdropClick?: boolean;
  disableEscapeKeyDown?: boolean;
  className?: string;
  ariaLabelledBy?: string;
  ariaDescribedBy?: string;
}

const DEFAULT_DIALOG_PROPS = {
  size: 'medium',
  maxWidth: 'sm',
  fullWidth: true,
  showActions: true,
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  disableBackdropClick: false,
  disableEscapeKeyDown: false,
};

// Requirement: Component Library - Material Design components with consistent theming
// Requirement: Accessibility - WCAG 2.1 Level AA compliance with ARIA labels and keyboard navigation support
const Dialog: React.FC<DialogProps> = React.memo((props) => {
  const {
    open,
    title,
    size = DEFAULT_DIALOG_PROPS.size,
    children,
    onClose,
    onConfirm,
    confirmText = DEFAULT_DIALOG_PROPS.confirmText,
    cancelText = DEFAULT_DIALOG_PROPS.cancelText,
    showActions = DEFAULT_DIALOG_PROPS.showActions,
    maxWidth = DEFAULT_DIALOG_PROPS.maxWidth,
    fullWidth = DEFAULT_DIALOG_PROPS.fullWidth,
    disableBackdropClick = DEFAULT_DIALOG_PROPS.disableBackdropClick,
    disableEscapeKeyDown = DEFAULT_DIALOG_PROPS.disableEscapeKeyDown,
    className,
    ariaLabelledBy,
    ariaDescribedBy,
  } = props;

  // Handle backdrop click events
  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!disableBackdropClick) {
      onClose();
    }
  };

  // Handle escape key events
  const handleEscapeKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!disableEscapeKeyDown && event.key === 'Escape') {
      onClose();
    }
  };

  // Generate unique IDs for accessibility if not provided
  const dialogTitleId = ariaLabelledBy || 'dialog-title';
  const dialogDescriptionId = ariaDescribedBy || 'dialog-description';

  // Map size to maxWidth
  const getMaxWidth = () => {
    switch (size) {
      case 'small':
        return 'xs';
      case 'large':
        return 'lg';
      case 'fullscreen':
        return false;
      default:
        return maxWidth;
    }
  };

  return (
    <StyledDialog
      open={open}
      maxWidth={getMaxWidth()}
      fullWidth={fullWidth}
      fullScreen={size === 'fullscreen'}
      onClose={onClose}
      onClick={handleBackdropClick}
      onKeyDown={handleEscapeKeyDown}
      className={className}
      aria-labelledby={dialogTitleId}
      aria-describedby={dialogDescriptionId}
      // Requirement: Accessibility - WCAG 2.1 Level AA compliance
      role="dialog"
      aria-modal="true"
    >
      <DialogTitle id={dialogTitleId}>{title}</DialogTitle>
      <DialogContent id={dialogDescriptionId}>{children}</DialogContent>
      {showActions && (
        <DialogActions>
          <Button
            variant="outlined"
            onClick={onClose}
            ariaLabel={cancelText}
          >
            {cancelText}
          </Button>
          <Button
            variant="contained"
            onClick={onConfirm}
            ariaLabel={confirmText}
          >
            {confirmText}
          </Button>
        </DialogActions>
      )}
    </StyledDialog>
  );
});

Dialog.displayName = 'Dialog';

export default Dialog;