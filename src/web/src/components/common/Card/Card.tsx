// @mui/material v5.14.x
import { Card as MuiCard, CardContent, CardHeader, CardActions } from '@mui/material';
import { styled } from '@mui/material/styles';
import React from 'react';

// Import theme configuration for styling and WCAG compliance
import createAppTheme from '../../../assets/styles/theme';

/*
Human Tasks:
1. Verify WCAG 2.1 Level AA color contrast compliance with your theme configuration
2. Test keyboard navigation functionality across all supported browsers
3. Validate screen reader compatibility with ARIA labels
4. Ensure touch targets meet minimum size requirements for mobile devices
*/

// Props interface for Card component with accessibility support
export interface CardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  elevation?: number;
  actions?: React.ReactNode;
  onClick?: () => void;
  className?: string;
  ariaLabel?: string;
}

// Styled Material-UI Card component with theme integration
// Requirement: Visual Hierarchy - Card-based layout with consistent spacing system (8px grid)
const StyledCard = styled(MuiCard)(({ theme, onClick, elevation = 1 }) => ({
  margin: theme.spacing(1),
  cursor: onClick ? 'pointer' : 'default',
  transition: theme.transitions.create(['box-shadow']),
  '&:hover': {
    boxShadow: onClick ? theme.shadows[elevation + 1] : undefined,
  },
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  // Ensure proper spacing and padding for content
  '& .MuiCardHeader-root': {
    padding: theme.spacing(2),
  },
  '& .MuiCardContent-root': {
    padding: theme.spacing(2),
    '&:last-child': {
      paddingBottom: theme.spacing(2),
    },
  },
  '& .MuiCardActions-root': {
    padding: theme.spacing(1, 2),
    justifyContent: 'flex-end',
  },
}));

// Card component implementation
// Requirement: Component Library - Material Design components with reusable form elements
// Requirement: Accessibility - WCAG 2.1 Level AA compliance with ARIA labels
const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  children,
  elevation = 1,
  actions,
  onClick,
  className,
  ariaLabel,
}) => {
  // Keyboard event handler for accessibility
  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (onClick && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      onClick();
    }
  };

  return (
    <StyledCard
      elevation={elevation}
      onClick={onClick}
      onKeyPress={handleKeyPress}
      className={className}
      role={onClick ? 'button' : 'article'}
      tabIndex={onClick ? 0 : undefined}
      aria-label={ariaLabel}
      component={onClick ? 'button' : 'div'}
    >
      {/* Render header if title or subtitle is provided */}
      {(title || subtitle) && (
        <CardHeader
          title={title}
          titleTypographyProps={{
            variant: 'h6',
            component: 'h2',
            // Ensure proper heading hierarchy for accessibility
            role: 'heading',
            'aria-level': '2',
          }}
          subheader={subtitle}
          subheaderTypographyProps={{
            variant: 'body2',
            color: 'textSecondary',
          }}
        />
      )}

      {/* Render main content */}
      <CardContent>{children}</CardContent>

      {/* Render actions if provided */}
      {actions && <CardActions>{actions}</CardActions>}
    </StyledCard>
  );
};

export default Card;