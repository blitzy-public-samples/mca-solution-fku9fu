// @mui/material v5.14.x
import { Theme, createTheme } from '@mui/material';
import { getThemeOptions } from '../../config/theme.config';

/*
Human Tasks:
1. Verify theme changes are properly reflected across all components
2. Test theme transitions when switching between modes
3. Validate theme persistence across page refreshes
4. Test system preference detection functionality
*/

// Type definition for supported theme modes
// Requirement: Theme Support - Light/Dark mode toggle
export type ThemeMode = 'light' | 'dark';

/**
 * Creates a Material-UI theme instance based on the provided mode and contrast settings
 * Requirement: Theme Support - Light/Dark mode toggle, High contrast mode
 * Requirement: Accessibility - WCAG 2.1 Level AA compliant theming
 * 
 * @param mode - The theme mode ('light' or 'dark')
 * @param highContrast - Whether to use high contrast mode
 * @returns Material-UI theme instance with configured palette, typography, spacing, and component styles
 */
const createAppTheme = (mode: ThemeMode, highContrast: boolean): Theme => {
  // Validate theme mode
  if (mode !== 'light' && mode !== 'dark') {
    throw new Error('Invalid theme mode. Must be either "light" or "dark".');
  }

  // Get theme options based on mode and contrast settings
  // This ensures WCAG 2.1 Level AA compliance with proper contrast ratios
  // Requirement: Component Library - Material Design components with consistent theming
  const themeOptions = getThemeOptions(mode, highContrast);

  // Create and return the theme instance
  // Requirement: Visual Hierarchy - Consistent spacing system (8px grid)
  return createTheme(themeOptions);
};

export default createAppTheme;