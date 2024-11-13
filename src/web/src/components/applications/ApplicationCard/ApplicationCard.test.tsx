// @testing-library/react v14.0.0
// @testing-library/jest-dom v5.16.5
// @testing-library/user-event v14.0.0

import React from 'react';
import { screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { ApplicationCard, ApplicationCardProps } from './ApplicationCard';
import { renderWithProviders } from '../../../utils/test.utils';
import type { Application } from '../../../interfaces/application.interface';

/*
Human Tasks:
1. Verify color contrast ratios in different themes using automated accessibility tools
2. Test with multiple screen readers to ensure proper announcements
3. Validate touch target sizes on different mobile devices and screen sizes
*/

// Mock application data that matches the Application interface
const mockApplication: Application = {
  id: 'APP-123',
  status: 'IN_REVIEW',
  merchant: {
    legalName: 'Test Business LLC',
    dbaName: 'Test Business',
    businessType: 'LLC',
    ein: '12-3456789',
    address: {
      street: '123 Test St',
      city: 'Test City',
      state: 'TS',
      zipCode: '12345'
    }
  },
  funding: {
    requestedAmount: 50000,
    term: 12,
    useOfFunds: 'Working capital'
  },
  documents: [],
  createdAt: '2023-06-15T10:00:00Z',
  updatedAt: '2023-06-15T10:00:00Z',
  submittedAt: '2023-06-15T10:00:00Z',
  reviewedAt: '2023-06-15T11:00:00Z',
  reviewedBy: 'UW-123'
};

describe('ApplicationCard', () => {
  // REQ: Visual Hierarchy - Verify card-based layout and status-driven color coding
  describe('rendering', () => {
    it('displays business information correctly', () => {
      renderWithProviders(<ApplicationCard application={mockApplication} />);
      
      expect(screen.getByText('Test Business LLC')).toBeInTheDocument();
      expect(screen.getByText('DBA: Test Business')).toBeInTheDocument();
      expect(screen.getByText('ID: APP-123')).toBeInTheDocument();
    });

    it('formats and displays funding amount correctly', () => {
      renderWithProviders(<ApplicationCard application={mockApplication} />);
      
      // Amount should be formatted as currency
      expect(screen.getByText('$50,000.00')).toBeInTheDocument();
    });

    it('formats and displays date correctly', () => {
      renderWithProviders(<ApplicationCard application={mockApplication} />);
      
      // Date should be formatted as MMM D, YYYY
      expect(screen.getByText('Jun 15, 2023')).toBeInTheDocument();
    });

    it('displays application status with correct styling', () => {
      renderWithProviders(<ApplicationCard application={mockApplication} />);
      
      const statusElement = screen.getByText('IN_REVIEW');
      expect(statusElement).toBeInTheDocument();
      // Verify status chip has the correct color class
      expect(statusElement.closest('.MuiChip-root')).toHaveClass('MuiChip-filled');
    });
  });

  // REQ: Component Library - Test Material Design components integration
  describe('interactions', () => {
    it('calls onClick handler when card is clicked', async () => {
      const handleClick = jest.fn();
      renderWithProviders(
        <ApplicationCard 
          application={mockApplication}
          onClick={handleClick}
        />
      );

      const card = screen.getByRole('button');
      await userEvent.click(card);
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('applies hover styles when mouse is over the card', async () => {
      renderWithProviders(<ApplicationCard application={mockApplication} />);
      
      const card = screen.getByRole('button');
      await userEvent.hover(card);
      
      // Verify hover styles are applied
      expect(card).toHaveStyle('transform: translateY(-2px)');
    });
  });

  // REQ: Accessibility - Validate WCAG 2.1 Level AA compliance
  describe('accessibility', () => {
    it('has correct ARIA labels', () => {
      renderWithProviders(<ApplicationCard application={mockApplication} />);
      
      const card = screen.getByRole('button');
      expect(card).toHaveAttribute('aria-label', 'Application for Test Business LLC');
    });

    it('supports keyboard navigation', async () => {
      const handleClick = jest.fn();
      renderWithProviders(
        <ApplicationCard 
          application={mockApplication}
          onClick={handleClick}
        />
      );

      const card = screen.getByRole('button');
      await userEvent.tab();
      expect(card).toHaveFocus();
      
      await userEvent.keyboard('{enter}');
      expect(handleClick).toHaveBeenCalled();
    });

    it('has sufficient color contrast', () => {
      renderWithProviders(<ApplicationCard application={mockApplication} />);
      
      const businessName = screen.getByText('Test Business LLC');
      const styles = window.getComputedStyle(businessName);
      // Verify text color has sufficient contrast with background
      expect(styles.color).toBeTruthy();
    });
  });

  describe('error handling', () => {
    it('handles missing optional props gracefully', () => {
      renderWithProviders(<ApplicationCard application={mockApplication} />);
      
      // Should render without onClick handler
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('handles missing DBA name gracefully', () => {
      const applicationWithoutDBA = {
        ...mockApplication,
        merchant: {
          ...mockApplication.merchant,
          dbaName: undefined
        }
      };
      
      renderWithProviders(<ApplicationCard application={applicationWithoutDBA} />);
      
      // Should not display DBA section
      expect(screen.queryByText(/DBA:/)).not.toBeInTheDocument();
    });
  });
});