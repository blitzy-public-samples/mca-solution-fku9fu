// @testing-library/react v14.0.0
// @testing-library/user-event v14.0.0
// @testing-library/jest-dom v5.16.5

/**
 * Human Tasks:
 * 1. Verify color contrast ratios meet WCAG 2.1 Level AA standards
 * 2. Test with multiple screen readers for announcement clarity
 * 3. Validate tab order with keyboard navigation testing tool
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import Form, { FormProps } from './Form';
import { renderWithProviders } from '../../utils/test.utils';

describe('Form component', () => {
  // Mock validation schema based on business rules
  const mockValidationSchema = {
    businessName: (value: string) => value.length >= 2 && value.length <= 100,
    ein: (value: string) => /^\d{2}-\d{7}$/.test(value),
    ssn: (value: string) => /^\d{3}-\d{2}-\d{4}$/.test(value),
    email: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    phone: (value: string) => /^\+1\d{10}$/.test(value),
    amount: (value: string) => /^\$\d+(\.\d{2})?$/.test(value),
    date: (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value)
  };

  const mockInitialValues = {
    businessName: '',
    ein: '',
    ssn: '',
    email: '',
    phone: '',
    amount: '',
    date: ''
  };

  const mockOnSubmit = jest.fn();

  const defaultProps: FormProps = {
    initialValues: mockInitialValues,
    validationSchema: mockValidationSchema,
    onSubmit: mockOnSubmit,
    id: 'test-form'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // REQ: Form Validation Rules - Test form rendering and structure
  it('renders form elements correctly', () => {
    renderWithProviders(<Form {...defaultProps} />);

    expect(screen.getByRole('form')).toHaveAttribute('id', 'test-form');
    expect(screen.getByRole('form')).toHaveAttribute('aria-label', 'Application form');
    expect(screen.getByRole('group', { name: /form controls/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument();
  });

  // REQ: Form Validation Rules - Test business validation rules
  it('validates business name field', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Form {...defaultProps} />);

    const businessNameInput = screen.getByRole('textbox', { name: /business name/i });
    
    // Test too short
    await user.type(businessNameInput, 'A');
    await user.tab();
    expect(screen.getByText(/business name must be between 2 and 100 characters/i)).toBeInTheDocument();

    // Test valid input
    await user.clear(businessNameInput);
    await user.type(businessNameInput, 'Valid Business Name');
    await user.tab();
    expect(screen.queryByText(/business name must be between 2 and 100 characters/i)).not.toBeInTheDocument();

    // Test too long
    await user.clear(businessNameInput);
    await user.type(businessNameInput, 'A'.repeat(101));
    await user.tab();
    expect(screen.getByText(/business name must be between 2 and 100 characters/i)).toBeInTheDocument();
  });

  // REQ: Form Validation Rules - Test EIN and SSN validation
  it('validates tax identification fields', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Form {...defaultProps} />);

    // Test EIN validation
    const einInput = screen.getByRole('textbox', { name: /ein/i });
    await user.type(einInput, '12-3456789');
    await user.tab();
    expect(screen.queryByText(/invalid ein format/i)).not.toBeInTheDocument();

    await user.clear(einInput);
    await user.type(einInput, '123-45678');
    await user.tab();
    expect(screen.getByText(/invalid ein format/i)).toBeInTheDocument();

    // Test SSN validation
    const ssnInput = screen.getByRole('textbox', { name: /ssn/i });
    await user.type(ssnInput, '123-45-6789');
    await user.tab();
    expect(screen.queryByText(/invalid ssn format/i)).not.toBeInTheDocument();

    await user.clear(ssnInput);
    await user.type(ssnInput, '123-456-789');
    await user.tab();
    expect(screen.getByText(/invalid ssn format/i)).toBeInTheDocument();
  });

  // REQ: Form Validation Rules - Test contact information validation
  it('validates contact information fields', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Form {...defaultProps} />);

    // Test email validation
    const emailInput = screen.getByRole('textbox', { name: /email/i });
    await user.type(emailInput, 'valid@email.com');
    await user.tab();
    expect(screen.queryByText(/invalid email format/i)).not.toBeInTheDocument();

    await user.clear(emailInput);
    await user.type(emailInput, 'invalid.email');
    await user.tab();
    expect(screen.getByText(/invalid email format/i)).toBeInTheDocument();

    // Test phone validation
    const phoneInput = screen.getByRole('textbox', { name: /phone/i });
    await user.type(phoneInput, '+12345678901');
    await user.tab();
    expect(screen.queryByText(/invalid phone format/i)).not.toBeInTheDocument();

    await user.clear(phoneInput);
    await user.type(phoneInput, '1234567890');
    await user.tab();
    expect(screen.getByText(/invalid phone format/i)).toBeInTheDocument();
  });

  // REQ: Form Validation Rules - Test financial and date validation
  it('validates amount and date fields', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Form {...defaultProps} />);

    // Test amount validation
    const amountInput = screen.getByRole('textbox', { name: /amount/i });
    await user.type(amountInput, '$1234.56');
    await user.tab();
    expect(screen.queryByText(/invalid amount format/i)).not.toBeInTheDocument();

    await user.clear(amountInput);
    await user.type(amountInput, '1234.56');
    await user.tab();
    expect(screen.getByText(/invalid amount format/i)).toBeInTheDocument();

    // Test date validation
    const dateInput = screen.getByRole('textbox', { name: /date/i });
    await user.type(dateInput, '2023-12-31');
    await user.tab();
    expect(screen.queryByText(/invalid date format/i)).not.toBeInTheDocument();

    await user.clear(dateInput);
    await user.type(dateInput, '12/31/2023');
    await user.tab();
    expect(screen.getByText(/invalid date format/i)).toBeInTheDocument();
  });

  // REQ: Form Validation Rules - Test form submission
  it('handles form submission with valid data', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Form {...defaultProps} />);

    const validFormData = {
      businessName: 'Test Business LLC',
      ein: '12-3456789',
      ssn: '123-45-6789',
      email: 'test@business.com',
      phone: '+12345678901',
      amount: '$50000.00',
      date: '2023-12-31'
    };

    // Fill all fields with valid data
    for (const [field, value] of Object.entries(validFormData)) {
      const input = screen.getByRole('textbox', { name: new RegExp(field, 'i') });
      await user.type(input, value);
      await user.tab();
    }

    // Submit form
    const submitButton = screen.getByRole('button', { name: /submit/i });
    expect(submitButton).toBeEnabled();
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(validFormData);
    });
  });

  // REQ: Accessibility - Test keyboard navigation and screen reader support
  it('maintains accessibility standards', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Form {...defaultProps} />);

    // Test form landmarks
    expect(screen.getByRole('form')).toHaveAttribute('aria-label', 'Application form');
    expect(screen.getByRole('group', { name: /form controls/i })).toBeInTheDocument();

    // Test error announcements
    const businessNameInput = screen.getByRole('textbox', { name: /business name/i });
    await user.type(businessNameInput, 'A');
    await user.tab();

    const errorMessage = screen.getByText(/business name must be between 2 and 100 characters/i);
    expect(errorMessage).toHaveAttribute('role', 'alert');
    expect(businessNameInput).toHaveAttribute('aria-invalid', 'true');
    expect(businessNameInput).toHaveAttribute('aria-describedby', expect.stringContaining('helper-text'));

    // Test focus management
    const inputs = screen.getAllByRole('textbox');
    const buttons = screen.getAllByRole('button');
    const focusableElements = [...inputs, ...buttons];

    // Tab through all focusable elements
    for (const element of focusableElements) {
      await user.tab();
      expect(element).toHaveFocus();
    }
  });

  // REQ: Form Validation Rules - Test form reset functionality
  it('handles form reset correctly', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Form {...defaultProps} />);

    // Fill a field
    const businessNameInput = screen.getByRole('textbox', { name: /business name/i });
    await user.type(businessNameInput, 'Test Business');

    // Reset form
    const resetButton = screen.getByRole('button', { name: /reset/i });
    await user.click(resetButton);

    // Verify fields are reset
    expect(businessNameInput).toHaveValue('');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});