// @testing-library/react v14.0.0
import { screen, waitFor } from '@testing-library/react';
// @testing-library/user-event v14.0.0
import userEvent from '@testing-library/user-event';
// @testing-library/jest-dom v5.16.5
import '@testing-library/jest-dom';
// jest v29.0.0
import { jest } from '@jest/globals';

import { WebhookList, WebhookListProps } from './WebhookList';
import { renderWithProviders } from '../../../utils/test.utils';
import { WebhookConfig, WebhookEventType } from '../../../interfaces/webhook.interface';
import { fetchWebhooks, deleteWebhook } from '../../../redux/slices/webhookSlice';

/*
Human Tasks:
1. Configure test data generation scripts for webhook configurations
2. Set up integration test environment with mock API endpoints
3. Review test coverage requirements with QA team
*/

// Mock Redux actions
jest.mock('../../../redux/slices/webhookSlice', () => ({
  fetchWebhooks: jest.fn(),
  deleteWebhook: jest.fn()
}));

describe('WebhookList component', () => {
  const mockWebhooks: WebhookConfig[] = [
    {
      id: '1',
      url: 'https://api.example.com/webhook1',
      events: [WebhookEventType.APPLICATION_RECEIVED, WebhookEventType.STATUS_CHANGED],
      active: true,
      secret: 'secret1',
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z'
    },
    {
      id: '2',
      url: 'https://api.example.com/webhook2',
      events: [WebhookEventType.DOCUMENT_UPLOADED],
      active: false,
      secret: 'secret2',
      createdAt: '2023-01-02T00:00:00Z',
      updatedAt: '2023-01-02T00:00:00Z'
    }
  ];

  const mockOnEdit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (fetchWebhooks as jest.Mock).mockResolvedValue({ payload: mockWebhooks });
    (deleteWebhook as jest.Mock).mockResolvedValue({ payload: '1' });
  });

  /**
   * REQ: Webhook Configuration UI Testing
   * Location: 5.1 USER INTERFACE DESIGN/5.1.4 Webhook Configuration
   */
  it('should render webhook list', async () => {
    const initialState = {
      webhook: {
        webhooks: mockWebhooks,
        loading: false,
        error: null
      }
    };

    renderWithProviders(<WebhookList onEdit={mockOnEdit} />, {
      preloadedState: initialState
    });

    // Verify webhook URLs are displayed
    expect(screen.getByText('https://api.example.com/webhook1')).toBeInTheDocument();
    expect(screen.getByText('https://api.example.com/webhook2')).toBeInTheDocument();

    // Verify event tags are rendered
    expect(screen.getByText('application.received')).toBeInTheDocument();
    expect(screen.getByText('status_changed')).toBeInTheDocument();
    expect(screen.getByText('document_uploaded')).toBeInTheDocument();

    // Verify status indicators
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('Inactive')).toBeInTheDocument();
  });

  /**
   * REQ: Integration Layer Testing
   * Location: 2. SYSTEM OVERVIEW/High-Level Description
   */
  it('should fetch webhooks on mount', async () => {
    renderWithProviders(<WebhookList onEdit={mockOnEdit} />);

    await waitFor(() => {
      expect(fetchWebhooks).toHaveBeenCalledTimes(1);
    });
  });

  /**
   * REQ: Webhook Configuration UI Testing
   * Location: 5.1 USER INTERFACE DESIGN/5.1.4 Webhook Configuration
   */
  it('should handle webhook deletion', async () => {
    const user = userEvent.setup();
    const initialState = {
      webhook: {
        webhooks: mockWebhooks,
        loading: false,
        error: null
      }
    };

    window.confirm = jest.fn(() => true);

    renderWithProviders(<WebhookList onEdit={mockOnEdit} />, {
      preloadedState: initialState
    });

    // Find and click delete button for first webhook
    const deleteButtons = screen.getAllByLabelText('delete webhook');
    await user.click(deleteButtons[0]);

    // Verify confirmation dialog
    expect(window.confirm).toHaveBeenCalledWith(
      'Are you sure you want to delete this webhook configuration?'
    );

    await waitFor(() => {
      expect(deleteWebhook).toHaveBeenCalledWith('1');
      expect(fetchWebhooks).toHaveBeenCalledTimes(2); // Initial + after delete
    });
  });

  /**
   * REQ: Webhook Configuration UI Testing
   * Location: 5.1 USER INTERFACE DESIGN/5.1.4 Webhook Configuration
   */
  it('should handle webhook edit', async () => {
    const user = userEvent.setup();
    const initialState = {
      webhook: {
        webhooks: mockWebhooks,
        loading: false,
        error: null
      }
    };

    renderWithProviders(<WebhookList onEdit={mockOnEdit} />, {
      preloadedState: initialState
    });

    // Find and click edit button for first webhook
    const editButtons = screen.getAllByLabelText('edit webhook');
    await user.click(editButtons[0]);

    expect(mockOnEdit).toHaveBeenCalledWith(mockWebhooks[0]);
  });

  it('should handle loading state', () => {
    const initialState = {
      webhook: {
        webhooks: [],
        loading: true,
        error: null
      }
    };

    renderWithProviders(<WebhookList onEdit={mockOnEdit} />, {
      preloadedState: initialState
    });

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should cancel webhook deletion when user declines confirmation', async () => {
    const user = userEvent.setup();
    const initialState = {
      webhook: {
        webhooks: mockWebhooks,
        loading: false,
        error: null
      }
    };

    window.confirm = jest.fn(() => false);

    renderWithProviders(<WebhookList onEdit={mockOnEdit} />, {
      preloadedState: initialState
    });

    const deleteButtons = screen.getAllByLabelText('delete webhook');
    await user.click(deleteButtons[0]);

    expect(window.confirm).toHaveBeenCalled();
    expect(deleteWebhook).not.toHaveBeenCalled();
  });
});