// @testing-library/react v14.0.0
// @testing-library/user-event v14.0.0
// @testing-library/jest-dom v5.16.5

/**
 * Human Tasks:
 * 1. Run automated accessibility testing tools (e.g., jest-axe) to verify WCAG 2.1 Level AA compliance
 * 2. Perform manual screen reader testing with NVDA and VoiceOver
 * 3. Verify keyboard navigation flows with business team
 */

import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import ApplicationForm, { ApplicationFormProps } from './ApplicationForm';
import { renderWithProviders, RenderResult } from '../../../utils/test.utils';
import { Application } from '../../../interfaces/application.interface';

// REQ: Data Management - Mock test data
const mockApplication: Partial<Application> = {
  merchant: {
    businessName: 'Test Business LLC',
    ein: '12-3456789',
  },
  funding: {
    requestedAmount: 100000,
    useOfFunds: 'Equipment purchase'
  }
};

// REQ: Form Validation Rules - Mock submission handler
const mockOnSubmit = jest.fn().mockImplementation(async (application: Application) => {
  return Promise.resolve();
});

describe('ApplicationForm', () => {
  let rendered: RenderResult;
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
    mockOnSubmit.mockClear();
  });

  // REQ: Form Validation Rules - Test initial rendering
  it('renders form fields correctly with proper ARIA attributes', () => {
    rendered = renderWithProviders(
      <ApplicationForm 
        initialValues={{}} 
        onSubmit={mockOnSubmit}
      />
    );

    // Business name field
    const businessNameInput = screen.getByLabelText(/business name/i);
    expect(businessNameInput).toBeInTheDocument();
    expect(businessNameInput).toHaveAttribute('aria-required', 'true');
    expect(businessNameInput).toHaveAttribute('aria-invalid', 'false');

    // EIN field
    const einInput = screen.getByLabelText(/employer identification number/i);
    expect(einInput).toBeInTheDocument();
    expect(einInput).toHaveAttribute('aria-required', 'true');
    expect(einInput).toHaveAttribute('placeholder', 'XX-XXXXXXX');

    // Amount field
    const amountInput = screen.getByLabelText(/requested funding amount/i);
    expect(amountInput).toBeInTheDocument();
    expect(amountInput).toHaveAttribute('type', 'number');
    expect(amountInput).toHaveAttribute('min', '1000');
    expect(amountInput).toHaveAttribute('max', '5000000');
  });

  // REQ: Form Validation Rules - Test business name validation
  it('validates business name field according to rules', async () => {
    rendered = renderWithProviders(
      <ApplicationForm 
        initialValues={{}} 
        onSubmit={mockOnSubmit}
      />
    );

    const businessNameInput = screen.getByLabelText(/business name/i);

    // Test too short
    await user.type(businessNameInput, 'A');
    await user.tab();
    expect(await screen.findByText(/business name must be between 2-100 characters/i)).toBeInTheDocument();

    // Test too long
    await user.clear(businessNameInput);
    await user.type(businessNameInput, 'A'.repeat(101));
    await user.tab();
    expect(await screen.findByText(/business name must be between 2-100 characters/i)).toBeInTheDocument();

    // Test valid input
    await user.clear(businessNameInput);
    await user.type(businessNameInput, 'Valid Business Name');
    await user.tab();
    expect(screen.queryByText(/business name must be between 2-100 characters/i)).not.toBeInTheDocument();
  });

  // REQ: Form Validation Rules - Test EIN validation
  it('validates EIN format', async () => {
    rendered = renderWithProviders(
      <ApplicationForm 
        initialValues={{}} 
        onSubmit={mockOnSubmit}
      />
    );

    const einInput = screen.getByLabelText(/employer identification number/i);

    // Test invalid format without hyphen
    await user.type(einInput, '123456789');
    await user.tab();
    expect(await screen.findByText(/ein must be in XX-XXXXXXX format/i)).toBeInTheDocument();

    // Test invalid segment lengths
    await user.clear(einInput);
    await user.type(einInput, '1-2345678');
    await user.tab();
    expect(await screen.findByText(/ein must be in XX-XXXXXXX format/i)).toBeInTheDocument();

    // Test valid format
    await user.clear(einInput);
    await user.type(einInput, '12-3456789');
    await user.tab();
    expect(screen.queryByText(/ein must be in XX-XXXXXXX format/i)).not.toBeInTheDocument();
  });

  // REQ: Data Management - Test form submission
  it('handles form submission with valid data', async () => {
    rendered = renderWithProviders(
      <ApplicationForm 
        initialValues={{}} 
        onSubmit={mockOnSubmit}
      />
    );

    // Fill form with valid data
    await user.type(screen.getByLabelText(/business name/i), 'Test Business LLC');
    await user.type(screen.getByLabelText(/employer identification number/i), '12-3456789');
    await user.type(screen.getByLabelText(/requested funding amount/i), '100000');
    await user.type(screen.getByLabelText(/use of funds description/i), 'Equipment purchase');

    // Submit form
    const submitButton = screen.getByRole('button', { name: /submit/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
      expect(mockOnSubmit).toHaveBeenCalledWith(expect.objectContaining({
        merchant: {
          businessName: 'Test Business LLC',
          ein: '12-3456789'
        },
        funding: {
          requestedAmount: 100000,
          useOfFunds: 'Equipment purchase'
        }
      }));
    });
  });

  // REQ: Form Validation Rules - Test form validation on submission
  it('prevents submission with invalid data', async () => {
    rendered = renderWithProviders(
      <ApplicationForm 
        initialValues={{}} 
        onSubmit={mockOnSubmit}
      />
    );

    // Submit without filling required fields
    const submitButton = screen.getByRole('button', { name: /submit/i });
    await user.click(submitButton);

    expect(mockOnSubmit).not.toHaveBeenCalled();
    expect(await screen.findByText(/please correct the errors/i)).toBeVisible();
  });

  // REQ: Data Management - Test edit mode
  it('initializes with provided values in edit mode', () => {
    rendered = renderWithProviders(
      <ApplicationForm 
        initialValues={mockApplication} 
        onSubmit={mockOnSubmit}
        isEdit={true}
      />
    );

    expect(screen.getByLabelText(/business name/i)).toHaveValue('Test Business LLC');
    expect(screen.getByLabelText(/employer identification number/i)).toHaveValue('12-3456789');
    expect(screen.getByLabelText(/requested funding amount/i)).toHaveValue(100000);
    expect(screen.getByLabelText(/use of funds description/i)).toHaveValue('Equipment purchase');
  });

  // REQ: Form Validation Rules - Test amount validation
  it('validates funding amount range', async () => {
    rendered = renderWithProviders(
      <ApplicationForm 
        initialValues={{}} 
        onSubmit={mockOnSubmit}
      />
    );

    const amountInput = screen.getByLabelText(/requested funding amount/i);

    // Test below minimum
    await user.type(amountInput, '500');
    await user.tab();
    expect(await screen.findByText(/amount must be between \$1,000 and \$5,000,000/i)).toBeInTheDocument();

    // Test above maximum
    await user.clear(amountInput);
    await user.type(amountInput, '6000000');
    await user.tab();
    expect(await screen.findByText(/amount must be between \$1,000 and \$5,000,000/i)).toBeInTheDocument();

    // Test valid amount
    await user.clear(amountInput);
    await user.type(amountInput, '100000');
    await user.tab();
    expect(screen.queryByText(/amount must be between \$1,000 and \$5,000,000/i)).not.toBeInTheDocument();
  });
});