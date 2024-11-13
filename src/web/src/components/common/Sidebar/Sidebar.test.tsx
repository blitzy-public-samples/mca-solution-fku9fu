// @testing-library/react v14.0.0
// @testing-library/jest-dom v5.16.5
// @testing-library/user-event v14.0.0

/**
 * Human Tasks:
 * 1. Configure mock service worker (MSW) for auth API endpoints if needed
 * 2. Verify theme provider configuration in test environment
 * 3. Set up responsive breakpoint mocks in test setup
 */

import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { useMediaQuery, useTheme } from '@mui/material';

import Sidebar from './Sidebar';
import { renderWithProviders } from '../../../utils/test.utils';
import { ROUTES } from '../../../constants/routes.constants';

// Mock Material-UI hooks
jest.mock('@mui/material', () => ({
  ...jest.requireActual('@mui/material'),
  useMediaQuery: jest.fn(),
  useTheme: jest.fn(),
}));

// Mock authentication hook
jest.mock('../../../hooks/useAuth', () => ({
  useAuth: jest.fn(),
}));

describe('Sidebar Component', () => {
  const mockOnClose = jest.fn();
  const defaultProps = {
    open: true,
    onClose: mockOnClose,
  };

  // Mock theme implementation
  const mockTheme = {
    palette: {
      mode: 'light',
      background: { paper: '#fff' },
      text: { primary: '#000' },
      action: { selected: '#f5f5f5', hover: '#eeeeee' },
    },
    breakpoints: {
      down: jest.fn(),
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useTheme as jest.Mock).mockReturnValue(mockTheme);
  });

  /**
   * @implements Navigation Structure requirement (SYSTEM DESIGN/USER INTERFACE DESIGN/5.1.7 Navigation Structure)
   */
  test('renders navigation items for admin role', async () => {
    // Mock admin authentication state
    const mockUseAuth = {
      isAuthenticated: true,
      user: { role: 'admin' },
    };
    require('../../../hooks/useAuth').useAuth.mockReturnValue(mockUseAuth);
    (useMediaQuery as jest.Mock).mockReturnValue(false); // Desktop view

    renderWithProviders(<Sidebar {...defaultProps} />);

    // Verify all navigation items are present
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Applications')).toBeInTheDocument();
    expect(screen.getByText('Documents')).toBeInTheDocument();
    expect(screen.getByText('Webhooks')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();

    // Verify navigation items are clickable
    const dashboardLink = screen.getByText('Dashboard').closest('div');
    await userEvent.click(dashboardLink!);
    expect(window.location.pathname).toBe(ROUTES.DASHBOARD.HOME);
  });

  /**
   * @implements Role-Based Access requirement (7. SECURITY CONSIDERATIONS/7.1.3 Role-Based Access Control)
   */
  test('renders limited navigation for operations role', () => {
    // Mock operations user authentication state
    const mockUseAuth = {
      isAuthenticated: true,
      user: { role: 'user' },
    };
    require('../../../hooks/useAuth').useAuth.mockReturnValue(mockUseAuth);
    (useMediaQuery as jest.Mock).mockReturnValue(false); // Desktop view

    renderWithProviders(<Sidebar {...defaultProps} />);

    // Verify allowed navigation items
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Applications')).toBeInTheDocument();

    // Verify restricted items are not shown
    expect(screen.queryByText('Webhooks')).not.toBeInTheDocument();
  });

  /**
   * @implements Theme Support requirement (SYSTEM DESIGN/USER INTERFACE DESIGN/Design Specifications)
   */
  test('handles theme changes', () => {
    const mockUseAuth = {
      isAuthenticated: true,
      user: { role: 'admin' },
    };
    require('../../../hooks/useAuth').useAuth.mockReturnValue(mockUseAuth);

    // Test light theme
    renderWithProviders(<Sidebar {...defaultProps} />);
    const drawer = screen.getByRole('presentation');
    expect(drawer).toHaveStyle({ backgroundColor: '#fff' });

    // Test dark theme
    (useTheme as jest.Mock).mockReturnValue({
      ...mockTheme,
      palette: {
        ...mockTheme.palette,
        mode: 'dark',
        background: { paper: '#121212' },
        text: { primary: '#fff' },
      },
    });

    renderWithProviders(<Sidebar {...defaultProps} />);
    const darkDrawer = screen.getByRole('presentation');
    expect(darkDrawer).toHaveStyle({ backgroundColor: '#121212' });
  });

  /**
   * @implements Navigation Structure requirement (SYSTEM DESIGN/USER INTERFACE DESIGN/5.1.7 Navigation Structure)
   */
  test('handles responsive behavior', async () => {
    const mockUseAuth = {
      isAuthenticated: true,
      user: { role: 'admin' },
    };
    require('../../../hooks/useAuth').useAuth.mockReturnValue(mockUseAuth);

    // Test desktop layout
    (useMediaQuery as jest.Mock).mockReturnValue(false);
    const { rerender } = renderWithProviders(<Sidebar {...defaultProps} />);
    expect(screen.getByRole('presentation')).toHaveAttribute('aria-modal', 'false');

    // Test mobile layout
    (useMediaQuery as jest.Mock).mockReturnValue(true);
    rerender(<Sidebar {...defaultProps} />);
    expect(screen.getByRole('presentation')).toHaveAttribute('aria-modal', 'true');

    // Test drawer close behavior on mobile
    const dashboardLink = screen.getByText('Dashboard').closest('div');
    await userEvent.click(dashboardLink!);
    expect(mockOnClose).toHaveBeenCalled();
  });

  test('does not render when user is not authenticated', () => {
    const mockUseAuth = {
      isAuthenticated: false,
      user: null,
    };
    require('../../../hooks/useAuth').useAuth.mockReturnValue(mockUseAuth);

    renderWithProviders(<Sidebar {...defaultProps} />);
    expect(screen.queryByRole('presentation')).not.toBeInTheDocument();
  });

  test('closes sidebar when close button is clicked', async () => {
    const mockUseAuth = {
      isAuthenticated: true,
      user: { role: 'admin' },
    };
    require('../../../hooks/useAuth').useAuth.mockReturnValue(mockUseAuth);

    renderWithProviders(<Sidebar {...defaultProps} />);
    const closeButton = screen.getByRole('button');
    await userEvent.click(closeButton);
    expect(mockOnClose).toHaveBeenCalled();
  });
});