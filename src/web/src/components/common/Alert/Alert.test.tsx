// @testing-library/react v14.0.0
import { screen, waitFor, act } from '@testing-library/react';
// @testing-library/jest-dom v5.16.5
import '@testing-library/jest-dom';
// @testing-library/user-event v14.0.0
import userEvent from '@testing-library/user-event';

import Alert from './Alert';
import { renderWithProviders } from '../../../utils/test.utils';

/*
Human Tasks:
1. Verify color contrast ratios with automated accessibility tools
2. Test with multiple screen readers for announcement behavior
3. Cross-browser testing for auto-hide functionality
4. Manual verification of keyboard navigation patterns
*/

describe('Alert component', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  // Requirement: Component Library - Test Material Design alert component integration
  it('renders successfully with default props', () => {
    const message = 'Test alert message';
    renderWithProviders(<Alert message={message} />);

    const alertElement = screen.getByRole('alert');
    expect(alertElement).toBeInTheDocument();
    expect(alertElement).toHaveTextContent(message);
    expect(alertElement).toHaveClass('MuiAlert-standardInfo'); // Default severity
  });

  // Requirement: Visual Hierarchy - Verify status-driven color coding
  it('displays correct severity styles', () => {
    const severities = ['success', 'error', 'warning', 'info'] as const;
    const message = 'Test message';

    severities.forEach(severity => {
      const { container } = renderWithProviders(
        <Alert message={message} severity={severity} />
      );
      
      const alertElement = screen.getByRole('alert');
      expect(alertElement).toHaveClass(`MuiAlert-standard${severity.charAt(0).toUpperCase() + severity.slice(1)}`);
      
      // Cleanup for next iteration
      container.remove();
    });
  });

  // Requirement: Accessibility - Test ARIA labels and interactions
  it('meets accessibility requirements', () => {
    renderWithProviders(<Alert message="Test message" />);
    
    const alertElement = screen.getByRole('alert');
    expect(alertElement).toHaveAttribute('role', 'alert');
    expect(alertElement).toHaveAttribute('aria-live', 'polite');
  });

  it('handles close events correctly', async () => {
    const onCloseMock = jest.fn();
    const user = userEvent.setup();

    renderWithProviders(
      <Alert 
        message="Closeable alert" 
        onClose={onCloseMock}
      />
    );

    const closeButton = screen.getByRole('button', { name: /close/i });
    expect(closeButton).toBeInTheDocument();

    await user.click(closeButton);
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  // Requirement: Component Library - Test auto-hide functionality
  it('auto-hides after specified duration', async () => {
    const onCloseMock = jest.fn();
    const autoHideDuration = 3000;

    renderWithProviders(
      <Alert
        message="Auto-hiding alert"
        onClose={onCloseMock}
        autoHideDuration={autoHideDuration}
      />
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();

    // Fast-forward time
    act(() => {
      jest.advanceTimersByTime(autoHideDuration);
    });

    await waitFor(() => {
      expect(onCloseMock).toHaveBeenCalledTimes(1);
    });
  });

  it('clears auto-hide timer on unmount', () => {
    const onCloseMock = jest.fn();
    const autoHideDuration = 3000;

    const { unmount } = renderWithProviders(
      <Alert
        message="Unmounting alert"
        onClose={onCloseMock}
        autoHideDuration={autoHideDuration}
      />
    );

    unmount();
    
    // Advance time past autoHideDuration
    act(() => {
      jest.advanceTimersByTime(autoHideDuration + 1000);
    });

    expect(onCloseMock).not.toHaveBeenCalled();
  });

  // Requirement: Accessibility - Validate keyboard interactions
  it('supports keyboard interaction for close button', async () => {
    const onCloseMock = jest.fn();
    const user = userEvent.setup();

    renderWithProviders(
      <Alert 
        message="Keyboard accessible alert" 
        onClose={onCloseMock}
      />
    );

    const closeButton = screen.getByRole('button', { name: /close/i });
    
    // Tab to focus the close button
    await user.tab();
    expect(closeButton).toHaveFocus();

    // Trigger with keyboard
    await user.keyboard('{enter}');
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  // Requirement: Visual Hierarchy - Test message display
  it('renders long messages correctly', () => {
    const longMessage = 'This is a very long alert message that should be displayed correctly and wrapped if necessary while maintaining proper styling and accessibility';
    
    renderWithProviders(<Alert message={longMessage} />);
    
    const alertElement = screen.getByRole('alert');
    expect(alertElement).toHaveTextContent(longMessage);
    expect(alertElement).toBeVisible();
  });
});