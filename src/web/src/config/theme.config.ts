// @mui/material v5.14.x
import { ThemeOptions, PaletteOptions, TypographyOptions, createTheme } from '@mui/material';

/*
Human Tasks:
1. Verify color contrast ratios meet WCAG 2.1 Level AA requirements using a color contrast analyzer
2. Test theme rendering across supported browsers (Chrome, Firefox, Safari, Edge - last 2 versions)
3. Validate high contrast mode with screen readers and accessibility tools
4. Review fluid typography scaling across all supported breakpoints
*/

// Base spacing unit for consistent layout (8px grid system)
// Requirement: Visual Hierarchy - Consistent spacing system using 8px grid
const SPACING_UNIT = 8;

// Base font family definition
const FONT_FAMILY = '"Roboto", "Helvetica", "Arial", sans-serif';

// Light mode palette configuration
// Requirement: Component Library - WCAG 2.1 Level AA compliant color contrasts
const LIGHT_PALETTE: PaletteOptions = {
  primary: {
    main: '#1976d2',
    light: '#42a5f5',
    dark: '#1565c0',
    contrastText: '#ffffff'
  },
  secondary: {
    main: '#9c27b0',
    light: '#ba68c8',
    dark: '#7b1fa2',
    contrastText: '#ffffff'
  },
  background: {
    default: '#ffffff',
    paper: '#f5f5f5'
  },
  text: {
    primary: 'rgba(0, 0, 0, 0.87)',
    secondary: 'rgba(0, 0, 0, 0.6)'
  },
  error: {
    main: '#d32f2f',
    light: '#ef5350',
    dark: '#c62828',
    contrastText: '#ffffff'
  },
  warning: {
    main: '#ed6c02',
    light: '#ff9800',
    dark: '#e65100',
    contrastText: '#ffffff'
  },
  info: {
    main: '#0288d1',
    light: '#03a9f4',
    dark: '#01579b',
    contrastText: '#ffffff'
  },
  success: {
    main: '#2e7d32',
    light: '#4caf50',
    dark: '#1b5e20',
    contrastText: '#ffffff'
  }
};

// Dark mode palette configuration
// Requirement: Theme Support - Light/Dark mode toggle
const DARK_PALETTE: PaletteOptions = {
  primary: {
    main: '#90caf9',
    light: '#e3f2fd',
    dark: '#42a5f5',
    contrastText: '#000000'
  },
  secondary: {
    main: '#ce93d8',
    light: '#f3e5f5',
    dark: '#ab47bc',
    contrastText: '#000000'
  },
  background: {
    default: '#121212',
    paper: '#1e1e1e'
  },
  text: {
    primary: '#ffffff',
    secondary: 'rgba(255, 255, 255, 0.7)'
  },
  error: {
    main: '#f44336',
    light: '#e57373',
    dark: '#d32f2f',
    contrastText: '#000000'
  },
  warning: {
    main: '#ffa726',
    light: '#ffb74d',
    dark: '#f57c00',
    contrastText: '#000000'
  },
  info: {
    main: '#29b6f6',
    light: '#4fc3f7',
    dark: '#0288d1',
    contrastText: '#000000'
  },
  success: {
    main: '#66bb6a',
    light: '#81c784',
    dark: '#388e3c',
    contrastText: '#000000'
  }
};

// High contrast palette configuration
// Requirement: Theme Support - High contrast mode for accessibility compliance
const HIGH_CONTRAST_PALETTE: PaletteOptions = {
  primary: {
    main: '#ffffff',
    light: '#ffffff',
    dark: '#ffffff',
    contrastText: '#000000'
  },
  secondary: {
    main: '#ffff00',
    light: '#ffff00',
    dark: '#ffff00',
    contrastText: '#000000'
  },
  background: {
    default: '#000000',
    paper: '#000000'
  },
  text: {
    primary: '#ffffff',
    secondary: '#ffffff'
  },
  error: {
    main: '#ff0000',
    light: '#ff0000',
    dark: '#ff0000',
    contrastText: '#ffffff'
  },
  warning: {
    main: '#ffff00',
    light: '#ffff00',
    dark: '#ffff00',
    contrastText: '#000000'
  },
  info: {
    main: '#00ffff',
    light: '#00ffff',
    dark: '#00ffff',
    contrastText: '#000000'
  },
  success: {
    main: '#00ff00',
    light: '#00ff00',
    dark: '#00ff00',
    contrastText: '#000000'
  }
};

// Typography configuration
// Requirement: Accessibility - Readable typography
const TYPOGRAPHY_OPTIONS: TypographyOptions = {
  fontFamily: FONT_FAMILY,
  fontSize: 16,
  htmlFontSize: 16,
  fontWeightLight: 300,
  fontWeightRegular: 400,
  fontWeightMedium: 500,
  fontWeightBold: 700,
  h1: {
    fontSize: '2.5rem',
    fontWeight: 500,
    lineHeight: 1.2,
    letterSpacing: '-0.01562em'
  },
  h2: {
    fontSize: '2rem',
    fontWeight: 500,
    lineHeight: 1.2,
    letterSpacing: '-0.00833em'
  },
  h3: {
    fontSize: '1.75rem',
    fontWeight: 500,
    lineHeight: 1.2,
    letterSpacing: '0em'
  },
  h4: {
    fontSize: '1.5rem',
    fontWeight: 500,
    lineHeight: 1.2,
    letterSpacing: '0.00735em'
  },
  h5: {
    fontSize: '1.25rem',
    fontWeight: 500,
    lineHeight: 1.2,
    letterSpacing: '0em'
  },
  h6: {
    fontSize: '1rem',
    fontWeight: 500,
    lineHeight: 1.2,
    letterSpacing: '0.0075em'
  },
  subtitle1: {
    fontSize: '1rem',
    fontWeight: 400,
    lineHeight: 1.75,
    letterSpacing: '0.00938em'
  },
  subtitle2: {
    fontSize: '0.875rem',
    fontWeight: 500,
    lineHeight: 1.57,
    letterSpacing: '0.00714em'
  },
  body1: {
    fontSize: '1rem',
    fontWeight: 400,
    lineHeight: 1.5,
    letterSpacing: '0.00938em'
  },
  body2: {
    fontSize: '0.875rem',
    fontWeight: 400,
    lineHeight: 1.43,
    letterSpacing: '0.01071em'
  },
  button: {
    fontSize: '0.875rem',
    fontWeight: 500,
    lineHeight: 1.75,
    letterSpacing: '0.02857em',
    textTransform: 'uppercase'
  },
  caption: {
    fontSize: '0.75rem',
    fontWeight: 400,
    lineHeight: 1.66,
    letterSpacing: '0.03333em'
  },
  overline: {
    fontSize: '0.75rem',
    fontWeight: 400,
    lineHeight: 2.66,
    letterSpacing: '0.08333em',
    textTransform: 'uppercase'
  }
};

/**
 * Returns theme configuration options based on mode and contrast settings
 * Requirement: Theme Support - System preference detection for accessibility compliance
 */
export const getThemeOptions = (mode: string, highContrast: boolean): ThemeOptions => {
  // Select the appropriate palette based on mode and contrast settings
  const palette = highContrast ? HIGH_CONTRAST_PALETTE : 
                 mode === 'dark' ? DARK_PALETTE : 
                 LIGHT_PALETTE;

  return createTheme({
    palette,
    typography: TYPOGRAPHY_OPTIONS,
    spacing: SPACING_UNIT,
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            scrollbarColor: palette.primary.main,
            '&::-webkit-scrollbar, & *::-webkit-scrollbar': {
              width: '8px',
              height: '8px'
            },
            '&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': {
              borderRadius: '4px',
              backgroundColor: palette.primary.main
            }
          }
        }
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: SPACING_UNIT / 2,
            textTransform: 'none',
            fontWeight: 500
          }
        }
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: SPACING_UNIT,
            boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)'
          }
        }
      },
      MuiTextField: {
        defaultProps: {
          variant: 'outlined',
          size: 'medium'
        },
        styleOverrides: {
          root: {
            borderRadius: SPACING_UNIT / 4
          }
        }
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            padding: SPACING_UNIT * 2
          }
        }
      }
    },
    shape: {
      borderRadius: SPACING_UNIT / 2
    }
  });
};