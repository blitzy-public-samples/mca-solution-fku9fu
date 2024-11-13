/*
Human Tasks:
1. Run automated accessibility tests using axe-core or similar tools to verify WCAG 2.1 Level AA compliance
2. Manually verify screen reader announcements for theme toggle and menu interactions
3. Test keyboard navigation flow with Tab and Enter keys
*/

// @testing-library/react v14.0.0
import { screen, waitFor } from '@testing-library/react';
// @testing-library/jest-dom v5.16.5
import '@testing-library/jest-dom';
// @testing-library/user-event v14.0.0
import userEvent from '@testing-library/user-event';

// Internal imports
import { Navbar } from './Navbar';
import { renderWithProviders } from '../../../utils/test.utils';

// Mock hooks
jest.mock('../../../hooks/useAuth', () => ({
  useAuth: () => ({
    isAuthenticated: true,
    user: { name: 'Test User' },
    logout: jest.fn()
  })
}));

jest.mock('../../../hooks/useTheme', () => ({
  useTheme: () => ({
    theme: { 
      mode: 'light',
      palette: { mode: 'light' },
      breakpoints: {
        down: jest.fn().mockReturnValue('(max-width:899.95px)')
      }
    },
    toggleMode: jest.fn()
  })
}));

// Mock useMediaQuery for responsive testing
jest.mock('@mui/material', () => ({
  ...jest.requireActual('@mui/material'),
  useMediaQuery: jest.fn()
}));

describe('Navbar', () => {
  const mockOnMenuClick = jest.fn();
  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock react-router-dom navigate
    jest.mock('react-router-dom', () => ({
      ...jest.requireActual('react-router-dom'),
      useNavigate: () => mockNavigate
    }));
  });

  // REQ: Visual Hierarchy - Verify consistent spacing and Material Design implementation
  it('should render correctly with all expected elements', () => {
    renderWithProviders(<Navbar onMenuClick={mockOnMenuClick} />);

    // Verify core elements
    expect(screen.getByRole('banner')).toBeInTheDocument(); // AppBar
    expect(screen.getByText('Dollar Funding MCA')).toBeInTheDocument();
    expect(screen.getByLabelText(/switch to dark mode/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/user account menu/i)).toBeInTheDocument();
  });

  // REQ: Theme Support - Verify theme toggle functionality
  it('should handle theme toggle correctly', async () => {
    const { useTheme } = require('../../../hooks/useTheme');
    const mockToggleMode = jest.fn();
    (useTheme as jest.Mock).mockImplementation(() => ({
      theme: { mode: 'light', palette: { mode: 'light' } },
      toggleMode: mockToggleMode
    }));

    const user = userEvent.setup();
    renderWithProviders(<Navbar onMenuClick={mockOnMenuClick} />);

    const themeToggle = screen.getByLabelText(/switch to dark mode/i);
    await user.click(themeToggle);

    expect(mockToggleMode).toHaveBeenCalledTimes(1);
  });

  // REQ: Visual Hierarchy - Test user menu interactions
  it('should handle user menu interactions correctly', async () => {
    const { useAuth } = require('../../../hooks/useAuth');
    const mockLogout = jest.fn();
    (useAuth as jest.Mock).mockImplementation(() => ({
      isAuthenticated: true,
      user: { name: 'Test User' },
      logout: mockLogout
    }));

    const user = userEvent.setup();
    renderWithProviders(<Navbar onMenuClick={mockOnMenuClick} />);

    // Open user menu
    const userMenuButton = screen.getByLabelText(/user account menu/i);
    await user.click(userMenuButton);

    // Verify menu items
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('Preferences')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();

    // Test logout
    await user.click(screen.getByText('Logout'));
    expect(mockLogout).toHaveBeenCalledTimes(1);
  });

  // REQ: Responsive Design - Test responsive behavior across viewport sizes
  it('should handle responsive behavior correctly', async () => {
    const { useMediaQuery } = require('@mui/material');

    // Test mobile viewport
    (useMediaQuery as jest.Mock).mockReturnValue(true);
    renderWithProviders(<Navbar onMenuClick={mockOnMenuClick} />);
    
    expect(screen.getByLabelText(/open drawer/i)).toBeInTheDocument();
    await userEvent.click(screen.getByLabelText(/open drawer/i));
    expect(mockOnMenuClick).toHaveBeenCalledTimes(1);

    // Clean up and test desktop viewport
    jest.clearAllMocks();
    (useMediaQuery as jest.Mock).mockReturnValue(false);
    
    renderWithProviders(<Navbar onMenuClick={mockOnMenuClick} />);
    expect(screen.queryByLabelText(/open drawer/i)).not.toBeInTheDocument();
  });

  // REQ: Visual Hierarchy - Test navigation functionality
  it('should handle navigation correctly', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Navbar onMenuClick={mockOnMenuClick} />);

    // Test logo navigation
    const logo = screen.getByText('Dollar Funding MCA');
    await user.click(logo);
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');

    // Test profile navigation
    const userMenuButton = screen.getByLabelText(/user account menu/i);
    await user.click(userMenuButton);
    await user.click(screen.getByText('Test User'));
    expect(mockNavigate).toHaveBeenCalledWith('/settings/profile');
  });

  // REQ: Theme Support - Test theme-based rendering
  it('should render correct theme icon based on current theme', () => {
    const { useTheme } = require('../../../hooks/useTheme');
    
    // Test light theme
    (useTheme as jest.Mock).mockImplementation(() => ({
      theme: { mode: 'light', palette: { mode: 'light' } },
      toggleMode: jest.fn()
    }));
    
    renderWithProviders(<Navbar onMenuClick={mockOnMenuClick} />);
    expect(screen.getByLabelText(/switch to dark mode/i)).toBeInTheDocument();

    // Clean up and test dark theme
    jest.clearAllMocks();
    (useTheme as jest.Mock).mockImplementation(() => ({
      theme: { mode: 'dark', palette: { mode: 'dark' } },
      toggleMode: jest.fn()
    }));

    renderWithProviders(<Navbar onMenuClick={mockOnMenuClick} />);
    expect(screen.getByLabelText(/switch to light mode/i)).toBeInTheDocument();
  });
});