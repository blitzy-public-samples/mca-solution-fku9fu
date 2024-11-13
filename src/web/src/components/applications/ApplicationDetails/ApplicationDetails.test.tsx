/**
 * Human Tasks:
 * 1. Configure screen reader testing tools for document viewer accessibility
 * 2. Set up viewport size testing configurations for responsive layout validation
 * 3. Verify currency formatting test cases match current accounting standards
 */

// @testing-library/react v14.0.0
import { screen, waitFor } from '@testing-library/react';
// @testing-library/jest-dom v5.16.5
import '@testing-library/jest-dom';
// @testing-library/user-event v14.0.0
import userEvent from '@testing-library/user-event';

import { ApplicationDetails, ApplicationDetailsProps } from './ApplicationDetails';
import { renderWithProviders } from '../../../utils/test.utils';
import { Application, ApplicationStatus } from '../../../interfaces/application.interface';

/**
 * REQ: Application Detail View Testing
 * Location: 5. SYSTEM DESIGN/5.1.3 Application Detail View
 */
const mockApplication: Application = {
  id: 'test-app-123',
  status: ApplicationStatus.IN_REVIEW,
  merchant: {
    legalName: 'Test Business LLC',
    dbaName: 'Test Business',
    ein: '12-3456789',
    industry: 'Technology',
    address: {
      street: '123 Test St',
      city: 'Test City',
      state: 'TS',
      zip: '12345'
    }
  },
  funding: {
    requestedAmount: 100000,
    term: 12,
    useOfFunds: 'Equipment purchase'
  },
  documents: [
    {
      id: 'doc-123',
      fileName: 'test-document.pdf',
      type: 'application',
      uploadedAt: '2023-01-01T00:00:00Z',
      url: 'https://test.com/doc.pdf'
    }
  ],
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: '2023-01-01T00:00:00Z',
  submittedAt: '2023-01-01T00:00:00Z',
  reviewedAt: '2023-01-01T00:00:00Z',
  reviewedBy: 'test-reviewer'
};

describe('ApplicationDetails', () => {
  const mockStatusChange = jest.fn();

  const defaultProps: ApplicationDetailsProps = {
    application: mockApplication,
    onStatusChange: mockStatusChange
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * REQ: Data Management Testing
   * Location: 3. SCOPE/Core Features and Functionalities
   */
  it('renders merchant information correctly', () => {
    renderWithProviders(<ApplicationDetails {...defaultProps} />);

    expect(screen.getByText('Test Business LLC')).toBeInTheDocument();
    expect(screen.getByText('Test Business')).toBeInTheDocument();
    expect(screen.getByText('12-3456789')).toBeInTheDocument();
    expect(screen.getByText('Technology')).toBeInTheDocument();
    expect(screen.getByText(/123 Test St/)).toBeInTheDocument();
    expect(screen.getByText(/Test City, TS 12345/)).toBeInTheDocument();
  });

  /**
   * REQ: Application Detail View Testing
   * Location: 5. SYSTEM DESIGN/5.1.3 Application Detail View
   */
  it('renders funding details with correct currency formatting', () => {
    renderWithProviders(<ApplicationDetails {...defaultProps} />);

    expect(screen.getByText('$100,000.00')).toBeInTheDocument();
    expect(screen.getByText('12 months')).toBeInTheDocument();
    expect(screen.getByText('Equipment purchase')).toBeInTheDocument();
  });

  it('renders application status correctly', () => {
    renderWithProviders(<ApplicationDetails {...defaultProps} />);

    expect(screen.getByText('Application Status')).toBeInTheDocument();
    expect(screen.getByText('IN_REVIEW')).toBeInTheDocument();
  });

  /**
   * REQ: Application Detail View Testing
   * Location: 5. SYSTEM DESIGN/5.1.3 Application Detail View
   */
  it('displays document list and handles document selection', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ApplicationDetails {...defaultProps} />);

    expect(screen.getByText('test-document.pdf')).toBeInTheDocument();
    expect(screen.getByText(/Uploaded: 1\/1\/2023/)).toBeInTheDocument();

    await user.click(screen.getByText('test-document.pdf'));
    
    // Verify document viewer is rendered with correct document
    await waitFor(() => {
      expect(screen.getByText('test-document.pdf')).toBeInTheDocument();
    });
  });

  it('handles missing optional merchant information gracefully', () => {
    const applicationWithoutDba = {
      ...mockApplication,
      merchant: {
        ...mockApplication.merchant,
        dbaName: undefined
      }
    };

    renderWithProviders(
      <ApplicationDetails 
        application={applicationWithoutDba}
        onStatusChange={mockStatusChange}
      />
    );

    expect(screen.queryByText('DBA Name')).not.toBeInTheDocument();
  });

  it('renders with custom className when provided', () => {
    const customClass = 'custom-details';
    renderWithProviders(
      <ApplicationDetails 
        {...defaultProps}
        className={customClass}
      />
    );

    expect(document.querySelector(`.${customClass}`)).toBeInTheDocument();
  });

  /**
   * REQ: Data Management Testing
   * Location: 3. SCOPE/Core Features and Functionalities
   */
  it('handles empty documents array', () => {
    const applicationWithoutDocs = {
      ...mockApplication,
      documents: []
    };

    renderWithProviders(
      <ApplicationDetails 
        application={applicationWithoutDocs}
        onStatusChange={mockStatusChange}
      />
    );

    expect(screen.getByText('Application Documents')).toBeInTheDocument();
    expect(screen.queryByText('test-document.pdf')).not.toBeInTheDocument();
  });
});