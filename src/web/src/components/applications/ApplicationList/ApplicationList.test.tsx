// @testing-library/react v14.0.0
// @testing-library/jest-dom v5.16.5
// @testing-library/user-event v14.0.0

import React from 'react';
import { screen, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';

import { ApplicationList, ApplicationListProps } from './ApplicationList';
import { renderWithProviders } from '../../../utils/test.utils';
import { Application } from '../../../interfaces/application.interface';

/*
Human Tasks:
1. Run accessibility audit tools (axe-core, WAVE) to verify WCAG 2.1 AA compliance
2. Manually test screen reader compatibility with NVDA and VoiceOver
3. Verify color contrast ratios meet WCAG standards for status indicators
*/

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn()
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock matchMedia for responsive design testing
Object.defineProperty(window, 'matchMedia', {
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock application data
const mockApplications: Application[] = [
  {
    id: '1',
    merchant: { legalName: 'Test Business 1' },
    status: 'pending',
    funding: { requestedAmount: 50000 },
    createdAt: '2023-01-01T00:00:00Z'
  },
  {
    id: '2',
    merchant: { legalName: 'Test Business 2' },
    status: 'approved',
    funding: { requestedAmount: 75000 },
    createdAt: '2023-01-02T00:00:00Z'
  }
];

const defaultProps: ApplicationListProps = {
  onApplicationClick: jest.fn(),
};

// Mock Redux actions
jest.mock('../../../redux/slices/applicationSlice', () => ({
  fetchApplications: jest.fn(),
  selectApplications: (state: any) => state.application.applications || [],
  selectApplicationsLoading: (state: any) => state.application.loading || false,
}));

describe('ApplicationList', () => {
  const user = userEvent.setup();
  
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue('table');
  });

  // REQ: Data Management - Verify correct display of merchant and funding details
  it('should render applications in table view', async () => {
    const preloadedState = {
      application: {
        applications: mockApplications,
        loading: false
      }
    };

    renderWithProviders(<ApplicationList {...defaultProps} />, { preloadedState });

    // Verify table headers
    expect(screen.getByRole('columnheader', { name: /business name/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /status/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /amount/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /date/i })).toBeInTheDocument();

    // Verify data cells
    expect(screen.getByText('Test Business 1')).toBeInTheDocument();
    expect(screen.getByText('$50,000.00')).toBeInTheDocument();
    expect(screen.getByText('1/1/2023')).toBeInTheDocument();
  });

  // REQ: Visual Hierarchy - Verify card-based layout implementation
  it('should render applications in grid view', async () => {
    const preloadedState = {
      application: {
        applications: mockApplications,
        loading: false
      }
    };

    renderWithProviders(<ApplicationList {...defaultProps} />, { preloadedState });

    // Switch to grid view
    const viewModeButton = screen.getByRole('button', { name: /switch to grid view/i });
    await user.click(viewModeButton);

    // Verify grid layout
    const grid = screen.getByRole('list', { name: /applications grid/i });
    const cards = within(grid).getAllByRole('listitem');
    expect(cards).toHaveLength(2);
  });

  // REQ: Responsive Design - Test view mode switching
  it('should handle view mode switching', async () => {
    renderWithProviders(<ApplicationList {...defaultProps} />);

    const viewModeButton = screen.getByRole('button', { name: /switch to grid view/i });
    await user.click(viewModeButton);

    expect(localStorageMock.setItem).toHaveBeenCalledWith('applicationViewMode', 'grid');
    expect(screen.getByRole('list', { name: /applications grid/i })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /switch to table view/i }));
    expect(localStorageMock.setItem).toHaveBeenCalledWith('applicationViewMode', 'table');
  });

  it('should render empty state', () => {
    const preloadedState = {
      application: {
        applications: [],
        loading: false
      }
    };

    renderWithProviders(<ApplicationList {...defaultProps} />, { preloadedState });
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  // REQ: Data Management - Test pagination functionality
  it('should handle pagination', async () => {
    const mockFetchApplications = jest.fn();
    jest.mock('../../../redux/slices/applicationSlice', () => ({
      ...jest.requireActual('../../../redux/slices/applicationSlice'),
      fetchApplications: mockFetchApplications,
    }));

    const preloadedState = {
      application: {
        applications: mockApplications,
        loading: false,
        total: 25
      }
    };

    renderWithProviders(<ApplicationList {...defaultProps} />, { preloadedState });

    // Navigate to next page
    const nextPageButton = screen.getByRole('button', { name: /next page/i });
    await user.click(nextPageButton);

    await waitFor(() => {
      expect(mockFetchApplications).toHaveBeenCalledWith({
        page: 2,
        limit: 10,
        status: undefined
      });
    });
  });

  it('should handle application click', async () => {
    const onApplicationClick = jest.fn();
    const preloadedState = {
      application: {
        applications: mockApplications,
        loading: false
      }
    };

    renderWithProviders(
      <ApplicationList {...defaultProps} onApplicationClick={onApplicationClick} />,
      { preloadedState }
    );

    const firstRow = screen.getByText('Test Business 1').closest('tr');
    if (firstRow) {
      await user.click(firstRow);
      expect(onApplicationClick).toHaveBeenCalledWith('1');
    }
  });

  it('should show loading state', () => {
    const preloadedState = {
      application: {
        applications: [],
        loading: true
      }
    };

    renderWithProviders(<ApplicationList {...defaultProps} />, { preloadedState });
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });
});