// @testing-library/react v14.0.0
// @testing-library/user-event v14.0.0
// @testing-library/jest-dom v5.16.5

/**
 * Human Tasks:
 * 1. Configure axe-core for automated accessibility testing
 * 2. Set up test coverage thresholds in Jest config
 * 3. Review test cases with QA team for complete coverage
 */

import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

// Internal imports
import WebhookForm, { WebhookFormProps } from './WebhookForm';
import { renderWithProviders, RenderResult } from '../../../utils/test.utils';
import { WebhookConfig, WebhookEventType } from '../../../interfaces/webhook.interface';

describe('WebhookForm', () => {
  let component: RenderResult;
  let mockOnSubmit: jest.Mock;
  let mockOnTest: jest.Mock;

  /**
   * REQ: Webhook Configuration - Test setup for webhook form validation
   * Location: 5.1 USER INTERFACE DESIGN/5.1.4 Webhook Configuration
   */
  const mockInitialValues: Partial<WebhookConfig> = {
    url: '',
    events: [],
    active: true,
    secret: ''
  };

  beforeEach(() => {
    mockOnSubmit = jest.fn();
    mockOnTest = jest.fn();

    const props: WebhookFormProps = {
      initialValues: mockInitialValues,
      onSubmit: mockOnSubmit,
      onTest: mockOnTest,
      isLoading: false
    };

    component = renderWithProviders(<WebhookForm {...props} />);
  });

  /**
   * REQ: Accessibility Testing - Validates WCAG 2.1 Level AA compliance
   * Location: 5. SYSTEM DESIGN/5.1 USER INTERFACE DESIGN/Design Specifications
   */
  it('renders form fields correctly with proper accessibility attributes', async () => {
    // URL field
    const urlInput = screen.getByLabelText(/webhook url/i);
    expect(urlInput).toBeInTheDocument();
    expect(urlInput).toHaveAttribute('aria-describedby', 'webhook-url-helper-text');
    expect(urlInput).toHaveAttribute('required');

    // Event checkboxes
    const eventGroup = screen.getByRole('group', { name: /webhook event types/i });
    expect(eventGroup).toBeInTheDocument();
    
    const applicationReceivedCheckbox = screen.getByRole('checkbox', {
      name: /subscribe to application.received events/i
    });
    expect(applicationReceivedCheckbox).toBeInTheDocument();

    // Secret field
    const secretInput = screen.getByLabelText(/webhook secret key/i);
    expect(secretInput).toBeInTheDocument();
    expect(secretInput).toHaveAttribute('type', 'password');
    
    // Buttons
    const testButton = screen.getByRole('button', { name: /test webhook configuration/i });
    const saveButton = screen.getByRole('button', { name: /save webhook configuration/i });
    expect(testButton).toBeInTheDocument();
    expect(saveButton).toBeInTheDocument();
  });

  /**
   * REQ: Integration Layer - Validates webhook URL format
   * Location: 2. SYSTEM OVERVIEW/High-Level Description
   */
  it('validates URL format and displays error messages', async () => {
    const urlInput = screen.getByLabelText(/webhook url/i);
    const saveButton = screen.getByRole('button', { name: /save webhook configuration/i });

    // Test invalid URL
    await userEvent.type(urlInput, 'invalid-url');
    await userEvent.click(saveButton);
    
    expect(await screen.findByText(/please enter a valid https webhook url/i))
      .toBeInTheDocument();

    // Test valid URL
    await userEvent.clear(urlInput);
    await userEvent.type(urlInput, 'https://api.example.com/webhook');
    
    expect(screen.queryByText(/please enter a valid https webhook url/i))
      .not.toBeInTheDocument();
  });

  /**
   * REQ: Webhook Configuration - Tests form submission with valid data
   * Location: 5.1 USER INTERFACE DESIGN/5.1.4 Webhook Configuration
   */
  it('handles form submission with valid webhook configuration', async () => {
    // Fill form with valid data
    const urlInput = screen.getByLabelText(/webhook url/i);
    const secretInput = screen.getByLabelText(/webhook secret key/i);
    const eventCheckbox = screen.getByRole('checkbox', {
      name: /subscribe to application.received events/i
    });

    await userEvent.type(urlInput, 'https://api.example.com/webhook');
    await userEvent.type(secretInput, 'secure-webhook-secret-key-32-chars-min');
    await userEvent.click(eventCheckbox);

    // Submit form
    const saveButton = screen.getByRole('button', { name: /save webhook configuration/i });
    await userEvent.click(saveButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        url: 'https://api.example.com/webhook',
        secret: 'secure-webhook-secret-key-32-chars-min',
        events: [WebhookEventType.APPLICATION_RECEIVED],
        active: true
      });
    });
  });

  /**
   * REQ: Integration Layer - Tests webhook testing functionality
   * Location: 2. SYSTEM OVERVIEW/High-Level Description
   */
  it('handles test webhook functionality', async () => {
    // Fill form with valid data
    const urlInput = screen.getByLabelText(/webhook url/i);
    const secretInput = screen.getByLabelText(/webhook secret key/i);
    
    await userEvent.type(urlInput, 'https://api.example.com/webhook');
    await userEvent.type(secretInput, 'secure-webhook-secret-key-32-chars-min');

    // Test webhook
    const testButton = screen.getByRole('button', { name: /test webhook configuration/i });
    await userEvent.click(testButton);

    await waitFor(() => {
      expect(mockOnTest).toHaveBeenCalledWith({
        url: 'https://api.example.com/webhook',
        secret: 'secure-webhook-secret-key-32-chars-min',
        events: [],
        active: true
      });
    });
  });

  it('disables submit and test buttons when form is invalid', async () => {
    const testButton = screen.getByRole('button', { name: /test webhook configuration/i });
    const saveButton = screen.getByRole('button', { name: /save webhook configuration/i });

    expect(testButton).toBeDisabled();
    expect(saveButton).toBeDisabled();

    // Fill partial data
    const urlInput = screen.getByLabelText(/webhook url/i);
    await userEvent.type(urlInput, 'https://api.example.com/webhook');

    // Buttons should still be disabled
    expect(testButton).toBeDisabled();
    expect(saveButton).toBeDisabled();
  });

  it('handles loading state correctly', () => {
    // Re-render with loading state
    component.rerender(
      <WebhookForm
        initialValues={mockInitialValues}
        onSubmit={mockOnSubmit}
        onTest={mockOnTest}
        isLoading={true}
      />
    );

    const saveButton = screen.getByRole('button', { name: /save webhook configuration/i });
    expect(saveButton).toBeDisabled();
    expect(saveButton).toHaveTextContent(/saving/i);
  });
});