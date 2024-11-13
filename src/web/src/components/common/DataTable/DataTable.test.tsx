// @testing-library/react v14.0.0
import { screen, within, fireEvent, waitFor } from '@testing-library/react';
// @testing-library/jest-dom v5.16.5
import '@testing-library/jest-dom';
// @testing-library/user-event v14.0.0
import userEvent from '@testing-library/user-event';

import DataTable, { Column, DataTableProps } from './DataTable';
import { renderWithProviders } from '../../../utils/test.utils';

/*
Human Tasks:
1. Verify table responsiveness across all supported breakpoints (320px, 768px, 1024px, 1440px)
2. Test keyboard navigation with screen readers using actual screen reader software
3. Validate color contrast ratios meet WCAG 2.1 Level AA standards
4. Test with large datasets (1000+ rows) to verify performance
*/

// Mock data setup
const mockTableData = [
  { id: 1, name: 'Test Company 1', revenue: 50000, status: 'Active' },
  { id: 2, name: 'Test Company 2', revenue: 75000, status: 'Pending' },
  { id: 3, name: 'Test Company 3', revenue: 100000, status: 'Inactive' },
];

const mockColumns: Column[] = [
  { id: 'name', label: 'Company Name', accessor: 'name', sortable: true },
  { id: 'revenue', label: 'Revenue', accessor: 'revenue', sortable: true, align: 'right' },
  { id: 'status', label: 'Status', accessor: 'status', sortable: false },
];

// Mock callback functions
const mockHandleSort = jest.fn();
const mockHandleFilter = jest.fn();
const mockHandlePageChange = jest.fn();
const mockHandleRowClick = jest.fn();

// Default props for testing
const defaultProps: DataTableProps = {
  data: mockTableData,
  columns: mockColumns,
  loading: false,
  sortable: true,
  filterable: true,
  paginated: true,
  pageSize: 10,
  onSort: mockHandleSort,
  onFilter: mockHandleFilter,
  onPageChange: mockHandlePageChange,
  onRowClick: mockHandleRowClick,
};

describe('DataTable', () => {
  // Reset all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Requirement: Component Library - Material Design components with consistent theming
  describe('rendering', () => {
    it('should render the table with correct structure', () => {
      renderWithProviders(<DataTable {...defaultProps} />);
      
      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: /company name/i })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: /revenue/i })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: /status/i })).toBeInTheDocument();
    });

    it('should render loading state correctly', () => {
      renderWithProviders(<DataTable {...defaultProps} loading={true} />);
      
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
      expect(screen.queryByRole('table')).not.toBeInTheDocument();
    });

    it('should render all data rows', () => {
      renderWithProviders(<DataTable {...defaultProps} />);
      
      const rows = screen.getAllByRole('row');
      // +1 for header row
      expect(rows).toHaveLength(mockTableData.length + 1);
      
      mockTableData.forEach(item => {
        expect(screen.getByText(item.name)).toBeInTheDocument();
        expect(screen.getByText(item.status)).toBeInTheDocument();
        expect(screen.getByText(item.revenue.toString())).toBeInTheDocument();
      });
    });
  });

  // Requirement: Component Library - Standardized data tables with sorting
  describe('sorting', () => {
    it('should display sort indicators on sortable columns', () => {
      renderWithProviders(<DataTable {...defaultProps} />);
      
      const sortableHeaders = screen.getAllByRole('columnheader')
        .filter(header => within(header).queryByRole('button'));
      
      expect(sortableHeaders).toHaveLength(2); // name and revenue columns
    });

    it('should call onSort with correct parameters when clicking sortable column', async () => {
      renderWithProviders(<DataTable {...defaultProps} />);
      
      const nameHeader = screen.getByRole('columnheader', { name: /company name/i });
      const sortButton = within(nameHeader).getByRole('button');
      
      await userEvent.click(sortButton);
      expect(mockHandleSort).toHaveBeenCalledWith('name', 'asc');
      
      await userEvent.click(sortButton);
      expect(mockHandleSort).toHaveBeenCalledWith('name', 'desc');
      
      await userEvent.click(sortButton);
      expect(mockHandleSort).toHaveBeenCalledWith('name', undefined);
    });

    it('should not allow sorting on non-sortable columns', () => {
      renderWithProviders(<DataTable {...defaultProps} />);
      
      const statusHeader = screen.getByRole('columnheader', { name: /status/i });
      expect(within(statusHeader).queryByRole('button')).not.toBeInTheDocument();
    });
  });

  // Requirement: Component Library - Standardized data tables with filtering
  describe('filtering', () => {
    it('should render filter inputs for each column when filterable is true', () => {
      renderWithProviders(<DataTable {...defaultProps} />);
      
      const filterInputs = screen.getAllByRole('textbox');
      expect(filterInputs).toHaveLength(mockColumns.length);
    });

    it('should call onFilter with correct parameters when typing in filter', async () => {
      renderWithProviders(<DataTable {...defaultProps} />);
      
      const nameFilter = screen.getByRole('textbox', { name: /filter company name/i });
      await userEvent.type(nameFilter, 'test');
      
      expect(mockHandleFilter).toHaveBeenCalledWith('name', 'test');
    });

    it('should not render filter inputs when filterable is false', () => {
      renderWithProviders(<DataTable {...defaultProps} filterable={false} />);
      
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    });
  });

  // Requirement: Component Library - Standardized data tables with pagination
  describe('pagination', () => {
    it('should render pagination controls when paginated is true', () => {
      renderWithProviders(<DataTable {...defaultProps} />);
      
      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });

    it('should call onPageChange with correct parameters when changing page', async () => {
      renderWithProviders(<DataTable {...defaultProps} />);
      
      const nextPageButton = screen.getByRole('button', { name: /next/i });
      await userEvent.click(nextPageButton);
      
      expect(mockHandlePageChange).toHaveBeenCalledWith(2, 10);
    });

    it('should not render pagination when paginated is false', () => {
      renderWithProviders(<DataTable {...defaultProps} paginated={false} />);
      
      expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
    });
  });

  // Requirement: Responsive Design - Mobile-first approach
  describe('responsiveness', () => {
    it('should adjust table size based on viewport', () => {
      // Mock useMediaQuery for mobile viewport
      window.matchMedia = jest.fn().mockImplementation(query => ({
        matches: query === '(max-width:600px)',
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
      }));

      renderWithProviders(<DataTable {...defaultProps} />);
      
      const table = screen.getByRole('table');
      expect(table).toHaveAttribute('size', 'small');
    });
  });

  // Requirement: Accessibility - WCAG 2.1 Level AA compliance
  describe('accessibility', () => {
    it('should have proper ARIA labels for interactive elements', () => {
      renderWithProviders(<DataTable {...defaultProps} />);
      
      const table = screen.getByRole('table');
      expect(table).toHaveAttribute('aria-label', 'Data table');

      const sortableHeaders = screen.getAllByRole('columnheader')
        .filter(header => within(header).queryByRole('button'));
      
      sortableHeaders.forEach(header => {
        expect(header).toHaveAttribute('aria-sort');
      });
    });

    it('should support keyboard navigation', async () => {
      renderWithProviders(<DataTable {...defaultProps} />);
      
      const firstRow = screen.getAllByRole('row')[1];
      firstRow.focus();
      expect(document.activeElement).toBe(firstRow);

      // Simulate keyboard interaction
      fireEvent.keyDown(firstRow, { key: 'Enter' });
      expect(mockHandleRowClick).toHaveBeenCalledWith(mockTableData[0]);
    });

    it('should announce sort changes to screen readers', async () => {
      renderWithProviders(<DataTable {...defaultProps} />);
      
      const nameHeader = screen.getByRole('columnheader', { name: /company name/i });
      const sortButton = within(nameHeader).getByRole('button');
      
      await userEvent.click(sortButton);
      expect(nameHeader).toHaveAttribute('aria-sort', 'asc');
      
      await userEvent.click(sortButton);
      expect(nameHeader).toHaveAttribute('aria-sort', 'desc');
    });
  });

  describe('row interaction', () => {
    it('should call onRowClick when clicking a row', async () => {
      renderWithProviders(<DataTable {...defaultProps} />);
      
      const firstRow = screen.getAllByRole('row')[1];
      await userEvent.click(firstRow);
      
      expect(mockHandleRowClick).toHaveBeenCalledWith(mockTableData[0]);
    });

    it('should apply correct cursor style when rows are clickable', () => {
      renderWithProviders(<DataTable {...defaultProps} />);
      
      const rows = screen.getAllByRole('row').slice(1); // Exclude header row
      rows.forEach(row => {
        expect(row).toHaveStyle({ cursor: 'pointer' });
      });
    });

    it('should not apply pointer cursor when onRowClick is not provided', () => {
      const propsWithoutRowClick = { ...defaultProps, onRowClick: undefined };
      renderWithProviders(<DataTable {...propsWithoutRowClick} />);
      
      const rows = screen.getAllByRole('row').slice(1);
      rows.forEach(row => {
        expect(row).toHaveStyle({ cursor: 'default' });
      });
    });
  });
});