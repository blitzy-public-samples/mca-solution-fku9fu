// @testing-library/react v14.0.0
import { screen, waitFor, within } from '@testing-library/react';
// @testing-library/user-event v14.0.0
import userEvent from '@testing-library/user-event';
// @testing-library/jest-dom v5.16.5
import '@testing-library/jest-dom';
// jest v29.5.0
import { jest } from '@jest/globals';

import { WebhookConfig } from './WebhookConfig';
import { renderWithProviders } from '../../../utils/test.utils';
import { WebhookConfig as IWebhookConfig } from '../../../interfaces/webhook.interface';

/*
Human Tasks:
1. Configure axe-core for automated accessibility testing
2. Set up test coverage thresholds in Jest configuration
3. Configure CI pipeline to run accessibility tests
4. Review test scenarios with QA team for complete coverage
*/

const mockWebhook: IWebhookConfig = {
  id: 'test-webhook-1',
  url: 'https://test.example.com/webhook',
  events: ['APPLICATION_RECEIVED', 'STATUS_CHANGED'],
  active: true,
  secret: 'test-secret',
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: '2023-01-01T00:00:00Z'
};

const mockStore = {
  webhook: {
    webhooks: [],
    loading: false,
    error: null
  }
};

describe('WebhookConfig component', () => {
  const mockOnRefresh = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * REQ: Integration Layer - Tests UI implementation of webhook configuration
   * Location: 2. SYSTEM OVERVIEW/High-Level Description
   */
  it('should render webhook configuration interface', async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <WebhookConfig isLoading={false} onRefresh={mockOnRefresh} />,
      { preloadedState: mockStore }
    );

    // Verify main components are rendered
    expect(screen.getByText('Webhook Configuration')).toBeInTheDocument();
    const addButton = screen.getByRole('button', { name: /add webhook/i });
    expect(addButton).toBeInTheDocument();
    expect(addButton).toHaveAttribute('aria-label', 'Add new webhook');

    // Test keyboard navigation
    await user.tab();
    expect(addButton).toHaveFocus();
  });

  /**
   * REQ: Webhook Configuration - Tests webhook creation functionality
   * Location: 5.1 USER INTERFACE DESIGN/5.1.4 Webhook Configuration
   */
  it('should handle adding new webhook', async () => {
    const user = userEvent.setup();
    const { store } = renderWithProviders(
      <WebhookConfig isLoading={false} onRefresh={mockOnRefresh} />,
      { preloadedState: mockStore }
    );

    // Open add webhook dialog
    await user.click(screen.getByRole('button', { name: /add webhook/i }));
    
    // Verify dialog accessibility
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-labelledby', 'add-webhook-dialog');
    
    // Fill form
    const urlInput = screen.getByLabelText(/url/i);
    await user.type(urlInput, mockWebhook.url);
    
    // Submit form
    await user.click(screen.getByRole('button', { name: /save/i }));
    
    // Verify webhook creation
    await waitFor(() => {
      expect(mockOnRefresh).toHaveBeenCalled();
    });
  });

  /**
   * REQ: Webhook Configuration - Tests webhook editing functionality
   * Location: 5.1 USER INTERFACE DESIGN/5.1.4 Webhook Configuration
   */
  it('should handle editing webhook', async () => {
    const user = userEvent.setup();
    const storeWithWebhook = {
      webhook: {
        ...mockStore.webhook,
        webhooks: [mockWebhook]
      }
    };

    renderWithProviders(
      <WebhookConfig isLoading={false} onRefresh={mockOnRefresh} />,
      { preloadedState: storeWithWebhook }
    );

    // Click edit button
    const editButton = screen.getByRole('button', { name: /edit/i });
    await user.click(editButton);

    // Verify edit dialog accessibility
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-labelledby', 'edit-webhook-dialog');

    // Modify webhook
    const urlInput = screen.getByLabelText(/url/i);
    await user.clear(urlInput);
    await user.type(urlInput, 'https://updated.example.com/webhook');

    // Submit changes
    await user.click(screen.getByRole('button', { name: /save/i }));

    // Verify update
    await waitFor(() => {
      expect(mockOnRefresh).toHaveBeenCalled();
    });
  });

  /**
   * REQ: Webhook Configuration - Tests webhook deletion functionality
   * Location: 5.1 USER INTERFACE DESIGN/5.1.4 Webhook Configuration
   */
  it('should handle deleting webhook', async () => {
    const user = userEvent.setup();
    const storeWithWebhook = {
      webhook: {
        ...mockStore.webhook,
        webhooks: [mockWebhook]
      }
    };

    renderWithProviders(
      <WebhookConfig isLoading={false} onRefresh={mockOnRefresh} />,
      { preloadedState: storeWithWebhook }
    );

    // Click delete button
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    await user.click(deleteButton);

    // Verify confirmation dialog accessibility
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute('role', 'dialog');

    // Confirm deletion
    const confirmButton = screen.getByRole('button', { name: /confirm/i });
    await user.click(confirmButton);

    // Verify deletion
    await waitFor(() => {
      expect(mockOnRefresh).toHaveBeenCalled();
    });
  });

  /**
   * REQ: Accessibility Compliance - Tests loading state accessibility
   * Location: 5.1 USER INTERFACE DESIGN/5.1.1 General Requirements
   */
  it('should handle loading state accessibly', () => {
    renderWithProviders(
      <WebhookConfig isLoading={true} onRefresh={mockOnRefresh} />,
      { preloadedState: mockStore }
    );

    // Verify loading indicator accessibility
    const loadingElement = screen.getByRole('progressbar');
    expect(loadingElement).toBeInTheDocument();
    expect(loadingElement).toHaveAttribute('aria-busy', 'true');
  });

  /**
   * REQ: Accessibility Compliance - Tests error state accessibility
   * Location: 5.1 USER INTERFACE DESIGN/5.1.1 General Requirements
   */
  it('should display errors accessibly', () => {
    const storeWithError = {
      webhook: {
        ...mockStore.webhook,
        error: 'Failed to load webhooks'
      }
    };

    renderWithProviders(
      <WebhookConfig isLoading={false} onRefresh={mockOnRefresh} />,
      { preloadedState: storeWithError }
    );

    // Verify error message accessibility
    const errorMessage = screen.getByRole('alert');
    expect(errorMessage).toBeInTheDocument();
    expect(errorMessage).toHaveAttribute('aria-live', 'polite');
  });
});