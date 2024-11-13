// @mui/material v5.14.x
// @mui/material/styles v5.14.x
// react v18.x

import React from 'react';
import { Button as MuiButton, ButtonProps as MuiButtonProps } from '@mui/material';
import { styled } from '@mui/material/styles';
import { getThemeOptions } from '../../config/theme.config';

/*
Human Tasks:
1. Verify button contrast ratios meet WCAG 2.1 Level AA requirements using a color contrast analyzer
2. Test keyboard navigation and focus states across supported browsers
3. Validate button behavior with screen readers
4. Review touch target sizes on mobile devices (minimum 44x44px)
*/

// Requirement: Component Library - Material Design components with consistent theming
const StyledButton = styled(MuiButton)(({ theme }) => ({
  ...theme.components?.MuiButton?.styleOverrides,
  // Requirement: Accessibility - WCAG 2.1 Level AA compliance
  minHeight: '44px', // Ensure minimum touch target size
  '&:focus-visible': {
    outline: `3px solid ${theme.palette.primary.main}`,
    outlineOffset: '2px',
  },
  '&.Mui-disabled': {
    opacity: 0.7,
    cursor: 'not-allowed',
  },
}));

interface ButtonProps extends Omit<MuiButtonProps, 'color'> {
  variant?: 'contained' | 'outlined' | 'text';
  size?: 'small' | 'medium' | 'large';
  color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
  disabled?: boolean;
  fullWidth?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  children: React.ReactNode;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  ariaLabel?: string;
}

const DEFAULT_BUTTON_PROPS: Partial<ButtonProps> = {
  variant: 'contained',
  size: 'medium',
  color: 'primary',
  type: 'button',
};

// Requirement: Component Library - Material Design components with consistent theming
// Requirement: Accessibility - WCAG 2.1 Level AA compliance with ARIA labels and keyboard navigation support
const Button: React.FC<ButtonProps> = React.memo((props) => {
  const {
    variant = DEFAULT_BUTTON_PROPS.variant,
    size = DEFAULT_BUTTON_PROPS.size,
    color = DEFAULT_BUTTON_PROPS.color,
    disabled = false,
    fullWidth = false,
    startIcon,
    endIcon,
    onClick,
    children,
    className,
    type = DEFAULT_BUTTON_PROPS.type,
    ariaLabel,
    ...rest
  } = props;

  // Handle keyboard interaction
  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick?.(event as unknown as React.MouseEvent<HTMLButtonElement>);
    }
  };

  return (
    <StyledButton
      variant={variant}
      size={size}
      color={color}
      disabled={disabled}
      fullWidth={fullWidth}
      startIcon={startIcon}
      endIcon={endIcon}
      onClick={onClick}
      className={className}
      type={type}
      aria-label={ariaLabel || (typeof children === 'string' ? children : undefined)}
      aria-disabled={disabled}
      role="button"
      tabIndex={disabled ? -1 : 0}
      onKeyDown={handleKeyDown}
      {...rest}
    >
      {children}
    </StyledButton>
  );
});

Button.displayName = 'Button';

export default Button;