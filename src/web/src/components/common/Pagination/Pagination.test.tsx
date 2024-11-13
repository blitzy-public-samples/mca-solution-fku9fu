// @testing-library/react v14.0.0
// @testing-library/user-event v14.0.0
// @testing-library/jest-dom v5.16.5

import React from 'react';
import { cleanup, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { renderWithProviders } from '../../../utils/test.utils';
import { Pagination, PaginationProps } from './Pagination';

/*
Human Tasks:
1. Verify screen reader announcements in real devices with different screen readers
2. Test with actual assistive technologies to validate ARIA implementation
3. Validate component behavior across different browser/OS combinations
4. Test with real mobile devices to verify touch interactions
*/

describe('Pagination Component', () => {
  // Default props for most test cases
  const defaultProps: PaginationProps = {
    currentPage: 1,
    totalPages: 10,
    pageSize: 25,
    showPageSize: true,
    onPageChange: jest.fn(),
    onPageSizeChange: jest.fn(),
  };

  // Cleanup after each test
  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });

  // Requirement: Component Library - Tests for Material Design pagination component implementation
  test('renders pagination controls with correct structure', () => {
    renderWithProviders(<Pagination {...defaultProps} />);
    
    const navigation = screen.getByRole('navigation', { name: /pagination navigation/i });
    expect(navigation).toBeInTheDocument();
    
    const paginationList = screen.getByRole('list');
    expect(paginationList).toBeInTheDocument();
    
    const pageButtons = screen.getAllByRole('button');
    expect(pageButtons.length).toBeGreaterThan(0);
  });

  // Requirement: Accessibility - Verification of ARIA attributes
  test('includes proper ARIA attributes for accessibility', () => {
    renderWithProviders(<Pagination {...defaultProps} />);
    
    const firstPageButton = screen.getByLabelText(/go to first page/i);
    expect(firstPageButton).toHaveAttribute('aria-label');
    
    const nextPageButton = screen.getByLabelText(/go to next page/i);
    expect(nextPageButton).toHaveAttribute('aria-label');
    
    const pageSizeSelector = screen.getByRole('group', { name: /items per page selector/i });
    expect(pageSizeSelector).toBeInTheDocument();
  });

  // Requirement: Component Library - Tests for pagination functionality
  test('handles page changes correctly', async () => {
    const onPageChange = jest.fn();
    renderWithProviders(
      <Pagination {...defaultProps} onPageChange={onPageChange} />
    );
    
    const user = userEvent.setup();
    const page2Button = screen.getByRole('button', { name: /go to page 2/i });
    
    await user.click(page2Button);
    expect(onPageChange).toHaveBeenCalledWith(2);
    
    const nextButton = screen.getByLabelText(/go to next page/i);
    await user.click(nextButton);
    expect(onPageChange).toHaveBeenCalledTimes(2);
  });

  // Requirement: Component Library - Tests for page size functionality
  test('handles page size changes correctly', async () => {
    const onPageSizeChange = jest.fn();
    renderWithProviders(
      <Pagination {...defaultProps} onPageSizeChange={onPageSizeChange} />
    );
    
    const user = userEvent.setup();
    const pageSizeSelect = screen.getByLabelText(/select number of items per page/i);
    
    await user.click(pageSizeSelect);
    const option50 = screen.getByRole('option', { name: /50 per page/i });
    await user.click(option50);
    
    expect(onPageSizeChange).toHaveBeenCalledWith(50);
  });

  // Requirement: Accessibility - Tests for keyboard navigation
  test('supports keyboard navigation', async () => {
    renderWithProviders(<Pagination {...defaultProps} />);
    const user = userEvent.setup();
    
    const firstPageButton = screen.getByLabelText(/go to first page/i);
    firstPageButton.focus();
    expect(document.activeElement).toBe(firstPageButton);
    
    await user.keyboard('{Tab}');
    const prevButton = screen.getByLabelText(/go to previous page/i);
    expect(document.activeElement).toBe(prevButton);
    
    await user.keyboard('{Enter}');
    expect(defaultProps.onPageChange).toHaveBeenCalled();
  });

  // Requirement: Responsive Design - Tests for responsive behavior
  test('adapts to mobile viewport', () => {
    // Mock mobile viewport
    window.matchMedia = jest.fn().mockImplementation(query => ({
      matches: query === '(max-width: 600px)',
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));

    renderWithProviders(<Pagination {...defaultProps} />);
    
    const container = screen.getByRole('navigation');
    const styles = window.getComputedStyle(container);
    expect(styles.flexDirection).toBe('column');
  });

  // Requirement: Component Library - Tests for error states
  test('handles invalid page numbers gracefully', async () => {
    const onPageChange = jest.fn();
    renderWithProviders(
      <Pagination
        {...defaultProps}
        currentPage={1}
        totalPages={5}
        onPageChange={onPageChange}
      />
    );
    
    const user = userEvent.setup();
    const lastPageButton = screen.getByLabelText(/go to last page/i);
    
    await user.click(lastPageButton);
    expect(onPageChange).toHaveBeenCalledWith(5);
    expect(onPageChange).not.toHaveBeenCalledWith(6);
  });

  // Requirement: Component Library - Tests for optional features
  test('renders without page size selector when showPageSize is false', () => {
    renderWithProviders(
      <Pagination {...defaultProps} showPageSize={false} />
    );
    
    const pageSizeSelector = screen.queryByRole('group', { name: /items per page selector/i });
    expect(pageSizeSelector).not.toBeInTheDocument();
  });

  // Requirement: Accessibility - Tests for focus management
  test('maintains focus after page change', async () => {
    renderWithProviders(<Pagination {...defaultProps} />);
    const user = userEvent.setup();
    
    const page2Button = screen.getByRole('button', { name: /go to page 2/i });
    await user.click(page2Button);
    
    expect(document.activeElement).toBe(page2Button);
  });

  // Requirement: Responsive Design - Tests for mobile adaptations
  test('shows simplified controls on mobile', () => {
    // Mock mobile viewport
    window.matchMedia = jest.fn().mockImplementation(query => ({
      matches: query === '(max-width: 600px)',
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));

    renderWithProviders(<Pagination {...defaultProps} />);
    
    const paginationButtons = screen.getAllByRole('button');
    paginationButtons.forEach(button => {
      const styles = window.getComputedStyle(button);
      expect(styles.minWidth).toBe('32px');
    });
  });
});