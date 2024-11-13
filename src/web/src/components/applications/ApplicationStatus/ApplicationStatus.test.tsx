// @testing-library/react v14.0.0
// @testing-library/jest-dom v5.16.5
// @testing-library/user-event v14.0.0

import React from 'react';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ApplicationStatus as ApplicationStatusComponent, ApplicationStatusProps } from './ApplicationStatus';
import { renderWithProviders } from '../../../utils/test.utils';
import { ApplicationStatus } from '../../../interfaces/application.interface';

// Mock MUI components to test styling
jest.mock('@mui/material', () => {
  const actual = jest.requireActual('@mui/material');
  return {
    ...actual,
    Chip: jest.fn(({ label, color, size, className, role, 'aria-label': ariaLabel }) => (
      <div 
        role={role}
        aria-label={ariaLabel}
        data-testid="status-chip"
        data-color={color}
        data-size={size}
        className={className}
      >
        {label}
      </div>
    ))
  };
});

describe('ApplicationStatus Component', () => {
  // REQ: Visual Hierarchy - Verify status-driven color coding implementation
  it('renders status chip with correct label for each status', () => {
    const statuses = [
      ApplicationStatus.DRAFT,
      ApplicationStatus.SUBMITTED,
      ApplicationStatus.IN_REVIEW,
      ApplicationStatus.APPROVED,
      ApplicationStatus.REJECTED
    ];

    statuses.forEach(status => {
      const { rerender } = renderWithProviders(
        <ApplicationStatusComponent status={status} />
      );

      const statusChip = screen.getByRole('status');
      expect(statusChip).toHaveTextContent(status);
      
      rerender(<ApplicationStatusComponent status={status} />);
    });
  });

  // REQ: Visual Hierarchy - Test color coding based on application status
  it('applies correct color styling based on status', () => {
    const statusColorMap = {
      [ApplicationStatus.DRAFT]: 'default',
      [ApplicationStatus.SUBMITTED]: 'primary',
      [ApplicationStatus.IN_REVIEW]: 'warning',
      [ApplicationStatus.APPROVED]: 'success',
      [ApplicationStatus.REJECTED]: 'error'
    };

    Object.entries(statusColorMap).forEach(([status, expectedColor]) => {
      renderWithProviders(
        <ApplicationStatusComponent status={status as ApplicationStatus} />
      );

      const statusChip = screen.getByTestId('status-chip');
      expect(statusChip).toHaveAttribute('data-color', expectedColor);
    });
  });

  // REQ: Visual Hierarchy - Test size variants
  it('supports different size variants', () => {
    const sizes: Array<ApplicationStatusProps['size']> = ['small', 'medium'];

    sizes.forEach(size => {
      renderWithProviders(
        <ApplicationStatusComponent 
          status={ApplicationStatus.DRAFT} 
          size={size}
        />
      );

      const statusChip = screen.getByTestId('status-chip');
      expect(statusChip).toHaveAttribute('data-size', size);
    });
  });

  // REQ: Accessibility - Test WCAG 2.1 Level AA compliance
  it('has proper accessibility attributes', () => {
    renderWithProviders(
      <ApplicationStatusComponent status={ApplicationStatus.APPROVED} />
    );

    const statusChip = screen.getByRole('status');
    
    // Verify proper role attribute
    expect(statusChip).toHaveAttribute('role', 'status');
    
    // Verify aria-label includes status description
    expect(statusChip).toHaveAttribute(
      'aria-label',
      expect.stringContaining('Application status:')
    );
  });

  // REQ: Accessibility - Test screen reader support
  it('provides accessible text for screen readers', () => {
    renderWithProviders(
      <ApplicationStatusComponent status={ApplicationStatus.IN_REVIEW} />
    );

    const statusChip = screen.getByRole('status');
    expect(statusChip).toHaveAccessibleName(
      expect.stringContaining('Application status:')
    );
  });

  // REQ: Visual Hierarchy - Test custom className prop
  it('accepts and applies custom className', () => {
    const customClass = 'custom-status-chip';
    renderWithProviders(
      <ApplicationStatusComponent 
        status={ApplicationStatus.DRAFT} 
        className={customClass}
      />
    );

    const statusChip = screen.getByTestId('status-chip');
    expect(statusChip).toHaveClass(customClass);
  });

  // REQ: Visual Hierarchy - Test default size prop
  it('uses medium size by default when size prop is not provided', () => {
    renderWithProviders(
      <ApplicationStatusComponent status={ApplicationStatus.DRAFT} />
    );

    const statusChip = screen.getByTestId('status-chip');
    expect(statusChip).toHaveAttribute('data-size', 'medium');
  });
});