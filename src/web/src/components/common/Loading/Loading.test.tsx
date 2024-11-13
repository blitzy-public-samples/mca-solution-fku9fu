// @testing-library/react v14.0.0
import { screen } from '@testing-library/react';
// @testing-library/jest-dom v5.16.5
import '@testing-library/jest-dom';
// Internal imports
import Loading from './Loading';
import { renderWithProviders } from '../../../utils/test.utils';

/*
Human Tasks:
1. Verify loading indicator contrast ratios in CI pipeline with automated accessibility tests
2. Set up visual regression tests for different size variations
3. Configure performance monitoring for animation smoothness
*/

// Requirement: Component Library - Verify Material Design components with consistent theming and accessibility compliance
describe('Loading component', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<Loading />);
    
    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toBeInTheDocument();
    
    // Verify default medium size (40px)
    const circularProgress = container.querySelector('.MuiCircularProgress-root');
    expect(circularProgress).toHaveStyle({ width: '40px', height: '40px' });
    
    // Verify ARIA attributes
    expect(progressbar).toHaveAttribute('aria-busy', 'true');
    expect(progressbar).toHaveAttribute('aria-label', 'Loading content');
  });

  // Requirement: Visual Hierarchy - Test consistent spacing system and size variations according to 8px grid
  it('renders with different sizes', () => {
    // Test small size (24px = 3 * 8px)
    const { container: smallContainer } = renderWithProviders(<Loading size="small" />);
    const smallProgress = smallContainer.querySelector('.MuiCircularProgress-root');
    expect(smallProgress).toHaveStyle({ width: '24px', height: '24px' });

    // Test medium size (40px = 5 * 8px)
    const { container: mediumContainer } = renderWithProviders(<Loading size="medium" />);
    const mediumProgress = mediumContainer.querySelector('.MuiCircularProgress-root');
    expect(mediumProgress).toHaveStyle({ width: '40px', height: '40px' });

    // Test large size (56px = 7 * 8px)
    const { container: largeContainer } = renderWithProviders(<Loading size="large" />);
    const largeProgress = largeContainer.querySelector('.MuiCircularProgress-root');
    expect(largeProgress).toHaveStyle({ width: '56px', height: '56px' });

    // Test custom numeric size
    const { container: customContainer } = renderWithProviders(<Loading size={32} />);
    const customProgress = customContainer.querySelector('.MuiCircularProgress-root');
    expect(customProgress).toHaveStyle({ width: '32px', height: '32px' });
  });

  it('renders in fullscreen mode', () => {
    const { container } = renderWithProviders(<Loading fullScreen />);
    
    const overlay = container.firstChild;
    expect(overlay).toHaveStyle({
      position: 'fixed',
      top: '0',
      left: '0',
      right: '0',
      bottom: '0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    });

    // Verify semi-transparent overlay
    expect(overlay).toHaveStyle({
      backgroundColor: 'rgba(0, 0, 0, 0.5)'
    });

    // Verify loading indicator is present in fullscreen mode
    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toBeInTheDocument();
  });

  it('applies theme-aware styling', () => {
    const { container } = renderWithProviders(<Loading />);
    
    const circularProgress = container.querySelector('.MuiCircularProgress-root');
    // Verify primary color is applied from theme
    expect(circularProgress).toHaveClass('MuiCircularProgress-colorPrimary');
    
    // Verify proper thickness for performance
    expect(circularProgress).toHaveStyle({
      'stroke-width': '3.6px'
    });
  });
});