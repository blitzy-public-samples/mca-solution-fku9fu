// react v18.x
import { useState, useEffect } from 'react';
// @mui/material v5.14.x
import { Theme } from '@mui/material';
import createAppTheme from '../assets/styles/theme';

/*
Human Tasks:
1. Test theme persistence across browser sessions
2. Verify system preference detection works across different operating systems
3. Validate theme transitions are smooth and don't cause layout shifts
4. Ensure localStorage is available and handles errors gracefully
*/

// Storage keys for theme preferences
const STORAGE_KEY_MODE = 'theme-mode';
const STORAGE_KEY_CONTRAST = 'theme-contrast';

// Type definition for theme mode options
type ThemeMode = 'light' | 'dark';

/**
 * Custom hook for managing theme preferences with system preference detection
 * and local storage persistence
 * 
 * Requirement: Theme Support - Light/Dark mode toggle, High contrast mode,
 * System preference detection with proper persistence
 */
const useTheme = () => {
  // Initialize theme mode from localStorage or system preference
  const getInitialMode = (): ThemeMode => {
    try {
      const storedMode = localStorage.getItem(STORAGE_KEY_MODE);
      if (storedMode === 'light' || storedMode === 'dark') {
        return storedMode;
      }
      
      // Check system preference if no stored preference exists
      if (window.matchMedia && 
          window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    } catch (error) {
      console.warn('Failed to access localStorage or media queries:', error);
    }
    return 'light'; // Default to light mode
  };

  // Initialize high contrast from localStorage
  const getInitialContrast = (): boolean => {
    try {
      return localStorage.getItem(STORAGE_KEY_CONTRAST) === 'true';
    } catch (error) {
      console.warn('Failed to access localStorage:', error);
      return false;
    }
  };

  // State for theme preferences
  const [mode, setMode] = useState<ThemeMode>(getInitialMode);
  const [highContrast, setHighContrast] = useState<boolean>(getInitialContrast);
  
  // Create theme instance based on current preferences
  const theme: Theme = createAppTheme(mode, highContrast);

  // Persist theme mode changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_MODE, mode);
    } catch (error) {
      console.warn('Failed to save theme mode to localStorage:', error);
    }
  }, [mode]);

  // Persist contrast preference changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CONTRAST, String(highContrast));
    } catch (error) {
      console.warn('Failed to save contrast preference to localStorage:', error);
    }
  }, [highContrast]);

  // Listen for system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      // Only update if no user preference is stored
      if (!localStorage.getItem(STORAGE_KEY_MODE)) {
        setMode(e.matches ? 'dark' : 'light');
      }
    };

    // Add listener and cleanup
    try {
      // Modern browsers
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } catch (error) {
      try {
        // Fallback for older browsers
        mediaQuery.addListener(handleChange);
        return () => mediaQuery.removeListener(handleChange);
      } catch (error) {
        console.warn('Media query listeners not supported:', error);
      }
    }
  }, []);

  // Theme control functions
  const toggleMode = () => {
    setMode(prevMode => prevMode === 'light' ? 'dark' : 'light');
  };

  const toggleContrast = () => {
    setHighContrast(prevContrast => !prevContrast);
  };

  return {
    theme,
    mode,
    highContrast,
    toggleMode,
    toggleContrast
  };
};

export default useTheme;