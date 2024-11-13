// react v18.x
import React from 'react';
// @mui/material v5.14.x
import { CircularProgress, Box } from '@mui/material';
// Internal imports
import useTheme from '../../../hooks/useTheme';

/*
Human Tasks:
1. Verify loading indicator contrast ratios meet WCAG 2.1 AA standards in both light and dark themes
2. Test loading indicator visibility against all background colors in the theme
3. Validate loading animation performance on low-end devices
*/

// Maps string size values to pixel values following 8px grid system
// Requirement: Visual Hierarchy - Consistent spacing system (8px grid)
const SIZE_MAP = {
  small: 24, // 3 * 8px
  medium: 40, // 5 * 8px
  large: 56, // 7 * 8px
};

interface LoadingProps {
  /**
   * Size of the loading spinner. Numbers are pixel values, strings map to predefined sizes
   * @default 'medium'
   */
  size?: number | 'small' | 'medium' | 'large';
  /**
   * Whether to center the spinner in the full viewport
   * @default false
   */
  fullScreen?: boolean;
}

/**
 * A reusable loading indicator component that displays a Material-UI circular progress
 * indicator with configurable size and color based on the current theme.
 * 
 * Requirement: Component Library - Material Design components with consistent theming
 * Requirement: Accessibility - WCAG 2.1 Level AA compliant through proper theme integration
 */
const Loading: React.FC<LoadingProps> = ({
  size = 'medium',
  fullScreen = false,
}) => {
  // Get current theme for WCAG compliant colors
  const { theme } = useTheme();

  // Calculate actual size in pixels
  const sizeInPx = typeof size === 'number' ? size : SIZE_MAP[size];

  // Base styles for the loading container
  const containerStyles = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    ...(fullScreen && {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: theme.zIndex.modal,
      backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent overlay
    }),
  };

  return (
    <Box
      sx={containerStyles}
      role="progressbar"
      aria-label="Loading content"
      aria-busy="true"
    >
      <CircularProgress
        size={sizeInPx}
        // Use primary color from theme for WCAG compliance
        color="primary"
        // Ensure smooth animation
        disableShrink={false}
        // Improve performance on low-end devices
        thickness={3.6}
      />
    </Box>
  );
};

export default Loading;