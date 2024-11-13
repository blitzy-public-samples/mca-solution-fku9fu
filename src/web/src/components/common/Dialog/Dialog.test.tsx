// @testing-library/react v14.0.0
// @testing-library/jest-dom v5.16.5
// @testing-library/user-event v14.0.0

import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import Dialog, { DialogProps } from './Dialog';
import { renderWithProviders } from '../../../utils/test.utils';

// Mock props for testing
const mockProps: DialogProps = {
  open: true,
  title: 'Test Dialog',
  onClose: jest.fn(),
  onConfirm: jest.fn(),
  children: <div>Test Content</div>,
  size: 'medium',
  maxWidth: 'sm',
  fullWidth: true,
  showActions: true,
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  disableBackdropClick: false,
  disableEscapeKeyDown: false,
};

describe('Dialog component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Requirement: Component Library - Tests for Material Design components with consistent theming
  it('renders correctly', () => {
    renderWithProviders(<Dialog {...mockProps} />);

    // Verify dialog title
    expect(screen.getByText('Test Dialog')).toBeInTheDocument();
    
    // Verify content
    expect(screen.getByText('Test Content')).toBeInTheDocument();
    
    // Verify action buttons
    expect(screen.getByText('Confirm')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    
    // Verify ARIA attributes
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby');
    expect(dialog).toHaveAttribute('aria-describedby');
  });

  // Requirement: Accessibility - Tests for WCAG 2.1 Level AA compliance
  it('maintains accessibility standards', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Dialog {...mockProps} />);

    const dialog = screen.getByRole('dialog');
    const cancelButton = screen.getByText('Cancel');
    const confirmButton = screen.getByText('Confirm');

    // Test focus management
    expect(document.activeElement).toBeInTheDocument();
    
    // Test keyboard navigation
    await user.tab();
    expect(cancelButton).toHaveFocus();
    
    await user.tab();
    expect(confirmButton).toHaveFocus();
    
    // Verify ARIA labels
    expect(dialog).toHaveAttribute('aria-labelledby', expect.any(String));
    expect(dialog).toHaveAttribute('aria-describedby', expect.any(String));
  });

  it('handles user interactions', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Dialog {...mockProps} />);

    // Test confirm button
    await user.click(screen.getByText('Confirm'));
    expect(mockProps.onConfirm).toHaveBeenCalledTimes(1);

    // Test cancel button
    await user.click(screen.getByText('Cancel'));
    expect(mockProps.onClose).toHaveBeenCalledTimes(1);

    // Test backdrop click
    const dialog = screen.getByRole('dialog');
    await user.click(dialog);
    expect(mockProps.onClose).toHaveBeenCalledTimes(2);

    // Test escape key
    await user.keyboard('{Escape}');
    expect(mockProps.onClose).toHaveBeenCalledTimes(3);
  });

  it('respects disabled interactions', async () => {
    const user = userEvent.setup();
    const propsWithDisabledInteractions = {
      ...mockProps,
      disableBackdropClick: true,
      disableEscapeKeyDown: true,
    };

    renderWithProviders(<Dialog {...propsWithDisabledInteractions} />);

    // Test backdrop click when disabled
    const dialog = screen.getByRole('dialog');
    await user.click(dialog);
    expect(mockProps.onClose).not.toHaveBeenCalled();

    // Test escape key when disabled
    await user.keyboard('{Escape}');
    expect(mockProps.onClose).not.toHaveBeenCalled();
  });

  it('supports different sizes', () => {
    // Test small size
    const { rerender } = renderWithProviders(
      <Dialog {...mockProps} size="small" />
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    // Test large size
    rerender(<Dialog {...mockProps} size="large" />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    // Test fullscreen size
    rerender(<Dialog {...mockProps} size="fullscreen" />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('handles custom ARIA attributes', () => {
    const customAriaProps = {
      ...mockProps,
      ariaLabelledBy: 'custom-label',
      ariaDescribedBy: 'custom-description',
    };

    renderWithProviders(<Dialog {...customAriaProps} />);
    
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-labelledby', 'custom-label');
    expect(dialog).toHaveAttribute('aria-describedby', 'custom-description');
  });

  it('renders without actions when showActions is false', () => {
    renderWithProviders(<Dialog {...mockProps} showActions={false} />);
    
    expect(screen.queryByText('Confirm')).not.toBeInTheDocument();
    expect(screen.queryByText('Cancel')).not.toBeInTheDocument();
  });

  it('updates when props change', async () => {
    const { rerender } = renderWithProviders(<Dialog {...mockProps} />);
    
    // Update title
    rerender(<Dialog {...mockProps} title="Updated Title" />);
    expect(screen.getByText('Updated Title')).toBeInTheDocument();

    // Update action button text
    rerender(
      <Dialog {...mockProps} confirmText="Save" cancelText="Close" />
    );
    expect(screen.getByText('Save')).toBeInTheDocument();
    expect(screen.getByText('Close')).toBeInTheDocument();
  });
});