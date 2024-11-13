// @testing-library/react@14.0.0
// @testing-library/jest-dom@5.16.5
// @testing-library/user-event@14.0.0

/**
 * Human Tasks:
 * 1. Verify color contrast ratios in different browser/OS themes
 * 2. Test with actual screen readers to validate accessibility experience
 * 3. Configure CI pipeline to include these tests in coverage reports
 */

import { screen, waitForElementToBeRemoved } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import Toast from './Toast';
import { renderWithProviders } from '../../../utils/test.utils';

// Mock react-redux hooks
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(),
}));

describe('Toast Component', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  /**
   * Tests success notification rendering and styling
   * Implements: Visual Hierarchy - Status-driven color coding
   */
  it('should render success notification with correct styling and ARIA attributes', () => {
    const successNotification = {
      ui: {
        notifications: [{
          id: '1',
          type: 'success',
          message: 'Operation successful',
          duration: 3000
        }]
      }
    };

    renderWithProviders(<Toast />, {
      preloadedState: successNotification
    });

    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveTextContent('Operation successful');
    expect(alert.querySelector('.MuiAlert-standardSuccess')).toBeTruthy();
    expect(alert).toHaveAttribute('aria-live', 'polite');
  });

  /**
   * Tests error notification rendering and styling
   * Implements: Visual Hierarchy - Status-driven color coding
   */
  it('should render error notification with correct styling and ARIA attributes', () => {
    const errorNotification = {
      ui: {
        notifications: [{
          id: '2',
          type: 'error',
          message: 'Operation failed',
          duration: 3000
        }]
      }
    };

    renderWithProviders(<Toast />, {
      preloadedState: errorNotification
    });

    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveTextContent('Operation failed');
    expect(alert.querySelector('.MuiAlert-standardError')).toBeTruthy();
    expect(alert).toHaveAttribute('aria-live', 'polite');
  });

  /**
   * Tests warning notification rendering and styling
   * Implements: Visual Hierarchy - Status-driven color coding
   */
  it('should render warning notification with correct styling', () => {
    const warningNotification = {
      ui: {
        notifications: [{
          id: '3',
          type: 'warning',
          message: 'Warning message',
          duration: 3000
        }]
      }
    };

    renderWithProviders(<Toast />, {
      preloadedState: warningNotification
    });

    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveTextContent('Warning message');
    expect(alert.querySelector('.MuiAlert-standardWarning')).toBeTruthy();
  });

  /**
   * Tests info notification rendering and styling
   * Implements: Visual Hierarchy - Status-driven color coding
   */
  it('should render info notification with correct styling', () => {
    const infoNotification = {
      ui: {
        notifications: [{
          id: '4',
          type: 'info',
          message: 'Info message',
          duration: 3000
        }]
      }
    };

    renderWithProviders(<Toast />, {
      preloadedState: infoNotification
    });

    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveTextContent('Info message');
    expect(alert.querySelector('.MuiAlert-standardInfo')).toBeTruthy();
  });

  /**
   * Tests notification dismissal through user interaction
   * Implements: Component Library - Material Design integration
   */
  it('should handle notification dismissal on close button click', async () => {
    const notification = {
      ui: {
        notifications: [{
          id: '5',
          type: 'info',
          message: 'Dismissible message',
          duration: 3000
        }]
      }
    };

    renderWithProviders(<Toast />, {
      preloadedState: notification
    });

    const closeButton = screen.getByRole('button', { name: /close/i });
    await userEvent.click(closeButton);

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  /**
   * Tests auto-dismiss functionality
   * Implements: Component Library - Material Design integration
   */
  it('should auto-dismiss notification after specified duration', async () => {
    const notification = {
      ui: {
        notifications: [{
          id: '6',
          type: 'info',
          message: 'Auto-dismiss message',
          duration: 3000
        }]
      }
    };

    renderWithProviders(<Toast />, {
      preloadedState: notification
    });

    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();

    // Fast-forward time by duration
    jest.advanceTimersByTime(3000);

    await waitForElementToBeRemoved(() => screen.queryByRole('alert'));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  /**
   * Tests accessibility attributes
   * Implements: Accessibility - ARIA labels and roles
   */
  it('should have correct accessibility attributes', () => {
    const notification = {
      ui: {
        notifications: [{
          id: '7',
          type: 'info',
          message: 'Accessible message',
          duration: 3000
        }]
      }
    };

    renderWithProviders(<Toast />, {
      preloadedState: notification
    });

    const alert = screen.getByRole('alert');
    expect(alert).toHaveAttribute('role', 'alert');
    expect(alert).toHaveAttribute('aria-live', 'polite');
    
    const closeButton = screen.getByRole('button', { name: /close/i });
    expect(closeButton).toHaveAttribute('aria-label', 'Close');
  });

  /**
   * Tests notification queueing behavior
   * Implements: Component Library - Material Design integration
   */
  it('should show only the most recent notification', () => {
    const multipleNotifications = {
      ui: {
        notifications: [
          {
            id: '8',
            type: 'info',
            message: 'Latest message',
            duration: 3000
          },
          {
            id: '9',
            type: 'success',
            message: 'Older message',
            duration: 3000
          }
        ]
      }
    };

    renderWithProviders(<Toast />, {
      preloadedState: multipleNotifications
    });

    expect(screen.getByText('Latest message')).toBeInTheDocument();
    expect(screen.queryByText('Older message')).not.toBeInTheDocument();
  });
});