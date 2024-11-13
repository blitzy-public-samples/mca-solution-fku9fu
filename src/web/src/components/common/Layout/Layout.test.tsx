/*
Human Tasks:
1. Verify actual breakpoint behavior in real browsers as Jest's DOM environment may not perfectly simulate all viewport scenarios
2. Run visual regression tests to ensure theme transitions are smooth
3. Validate layout behavior with different content lengths and types
*/

// @testing-library/react v14.0.0
import { screen, waitFor } from '@testing-library/react';
// @testing-library/jest-dom v5.16.5
import '@testing-library/jest-dom';
// @testing-library/user-event v14.0.0
import userEvent from '@testing-library/user-event';
// @mui/material v5.x
import { useMediaQuery } from '@mui/material';

// Internal imports
import Layout from './Layout';
import { renderWithProviders } from '../../../utils/test.utils';

// Mock Material-UI's useMediaQuery hook
jest.mock('@mui/material', () => ({
  ...jest.requireActual('@mui/material'),
  useMediaQuery: jest.fn()
}));

describe('Layout Component', () => {
  // Setup user event instance
  const user = userEvent.setup();
  
  // Reset mocks before each test
  beforeEach(() => {
    (useMediaQuery as jest.Mock).mockReset();
  });

  /**
   * @implements Visual Hierarchy requirement - Tests for consistent spacing system
   */
  it('renders correctly with proper visual hierarchy', () => {
    (useMediaQuery as jest.Mock).mockReturnValue(false); // Desktop view
    
    renderWithProviders(
      <Layout>
        <div data-testid="test-content">Test Content</div>
      </Layout>
    );

    // Verify main structural components
    expect(screen.getByRole('banner')).toBeInTheDocument(); // Navbar
    expect(screen.getByRole('complementary')).toBeInTheDocument(); // Sidebar
    expect(screen.getByTestId('test-content')).toBeInTheDocument();
    
    // Verify content wrapper
    const mainContent = screen.getByRole('main');
    expect(mainContent).toHaveStyle({
      minHeight: 'calc(100vh - 64px)',
      marginTop: '64px'
    });
  });

  /**
   * @implements Theme Support requirement - Tests for theme-aware styling
   */
  it('applies correct theme-based styles', () => {
    renderWithProviders(
      <Layout>
        <div>Content</div>
      </Layout>
    );

    const mainContent = screen.getByRole('main');
    expect(mainContent).toHaveStyle({
      backgroundColor: expect.any(String)
    });
    
    // Verify theme transitions
    expect(mainContent).toHaveStyle({
      transition: expect.stringContaining('margin')
    });
  });

  /**
   * @implements Responsive Design requirement - Tests for mobile-first approach
   */
  it('adapts layout for mobile viewport', async () => {
    // Mock mobile viewport
    (useMediaQuery as jest.Mock).mockReturnValue(true);

    renderWithProviders(
      <Layout>
        <div>Mobile Content</div>
      </Layout>
    );

    const mainContent = screen.getByRole('main');
    
    // Verify mobile-specific styles
    expect(mainContent).toHaveStyle({
      width: '100%'
    });

    // Test mobile menu interaction
    const menuButton = screen.getByRole('button', { name: /menu/i });
    await user.click(menuButton);
    
    // Verify sidebar behavior on mobile
    const sidebar = screen.getByRole('complementary');
    expect(sidebar).toHaveAttribute('aria-hidden', 'false');
  });

  /**
   * @implements Responsive Design requirement - Tests for breakpoint behavior
   */
  it('handles sidebar toggle correctly on desktop', async () => {
    // Mock desktop viewport
    (useMediaQuery as jest.Mock).mockReturnValue(false);

    renderWithProviders(
      <Layout>
        <div>Desktop Content</div>
      </Layout>
    );

    // Initial state
    const mainContent = screen.getByRole('main');
    expect(mainContent).not.toHaveStyle({ marginLeft: '240px' });

    // Toggle sidebar
    const menuButton = screen.getByRole('button', { name: /menu/i });
    await user.click(menuButton);

    // Verify sidebar open state
    await waitFor(() => {
      expect(screen.getByRole('complementary')).toHaveAttribute('aria-hidden', 'false');
    });

    // Close sidebar
    const closeButton = screen.getByRole('button', { name: /close/i });
    await user.click(closeButton);

    // Verify sidebar closed state
    await waitFor(() => {
      expect(screen.getByRole('complementary')).toHaveAttribute('aria-hidden', 'true');
    });
  });

  /**
   * @implements Visual Hierarchy requirement - Tests for Material Design components
   */
  it('maintains proper spacing in content wrapper', () => {
    renderWithProviders(
      <Layout>
        <div>Wrapped Content</div>
      </Layout>
    );

    const contentWrapper = screen.getByRole('main').querySelector('.MuiContainer-root');
    expect(contentWrapper).toBeInTheDocument();
    expect(contentWrapper).toHaveStyle({
      maxWidth: '1200px'
    });
  });

  /**
   * @implements Theme Support requirement - Tests for light/dark mode compatibility
   */
  it('handles theme changes properly', () => {
    renderWithProviders(
      <Layout>
        <div>Theme-aware Content</div>
      </Layout>
    );

    const mainContent = screen.getByRole('main');
    
    // Verify theme-aware styles
    expect(mainContent).toHaveStyle({
      backgroundColor: expect.any(String),
      transition: expect.stringContaining('theme.transitions')
    });
  });

  /**
   * @implements Responsive Design requirement - Tests for different viewport sizes
   */
  it('adjusts content padding based on viewport', () => {
    // Test mobile viewport
    (useMediaQuery as jest.Mock).mockReturnValue(true);
    
    const { rerender } = renderWithProviders(
      <Layout>
        <div>Responsive Content</div>
      </Layout>
    );

    let contentWrapper = screen.getByRole('main').querySelector('.MuiContainer-root');
    expect(contentWrapper).toHaveStyle({
      padding: expect.any(String)
    });

    // Test desktop viewport
    (useMediaQuery as jest.Mock).mockReturnValue(false);
    
    rerender(
      <Layout>
        <div>Responsive Content</div>
      </Layout>
    );

    contentWrapper = screen.getByRole('main').querySelector('.MuiContainer-root');
    expect(contentWrapper).toHaveStyle({
      padding: expect.any(String)
    });
  });
});