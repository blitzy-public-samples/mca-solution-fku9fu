/**
 * Human Tasks:
 * 1. Configure test environment variables in Jest setup files
 * 2. Set up mock service worker (MSW) for API mocking if needed
 * 3. Review test coverage thresholds in Jest configuration
 * 4. Ensure test data matches current business validation rules
 */

// @testing-library/react v14.0.0
import { screen, waitFor, within } from '@testing-library/react';
// @testing-library/user-event v14.0.0
import userEvent from '@testing-library/user-event';
// jest v29.0.0
import { describe, beforeAll, afterEach, afterAll, it, expect, jest } from '@jest';

import { 
  mockApiResponse, 
  renderWithProviders,
  UserEvent 
} from '../../src/utils/test.utils';

import { 
  ApplicationStatus,
  FundingDetails,
  type Application 
} from '../../src/interfaces/application.interface';

import { 
  apiClient,
  getApplications,
  getApplicationById,
  uploadDocument 
} from '../../src/services/api.service';

// Mock API client
jest.mock('../../src/services/api.service');

/**
 * REQ: Application Processing (2. SYSTEM OVERVIEW/High-Level Description)
 * Sets up mock API responses for application testing
 */
function setupMockApiResponses() {
  const mockApplications = Array.from({ length: 10 }, (_, i) => 
    generateTestApplication({
      id: `app-${i}`,
      status: Object.values(ApplicationStatus)[i % 5]
    })
  );

  (getApplications as jest.Mock).mockResolvedValue({
    data: mockApplications,
    total: 100,
    page: 1
  });

  (getApplicationById as jest.Mock).mockImplementation((id: string) =>
    Promise.resolve(mockApplications.find(app => app.id === id))
  );

  (uploadDocument as jest.Mock).mockResolvedValue({
    id: 'doc-123',
    type: 'BANK_STATEMENT',
    status: 'PROCESSED',
    url: 'https://storage.example.com/doc-123.pdf'
  });
}

/**
 * REQ: Form Validation Rules (5. SYSTEM DESIGN/5.1.2 Interface Elements)
 * Generates test application data with required fields
 */
function generateTestApplication(overrides: Partial<Application> = {}): Application {
  const baseApplication: Application = {
    id: 'test-app-123',
    status: ApplicationStatus.DRAFT,
    merchant: {
      businessName: 'Test Business LLC',
      ein: '12-3456789',
      address: {
        street: '123 Test St',
        city: 'Testville',
        state: 'TX',
        zipCode: '12345'
      },
      owner: {
        firstName: 'John',
        lastName: 'Doe',
        ssn: '123-45-6789',
        email: 'john@test.com',
        phone: '(555) 123-4567'
      }
    },
    funding: {
      requestedAmount: 50000,
      term: 12,
      useOfFunds: 'Working capital'
    },
    documents: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    submittedAt: '',
    reviewedAt: '',
    reviewedBy: ''
  };

  return { ...baseApplication, ...overrides };
}

let user: UserEvent;

beforeAll(() => {
  user = userEvent.setup();
  setupMockApiResponses();
});

afterEach(() => {
  jest.clearAllMocks();
  document.body.innerHTML = '';
  localStorage.clear();
});

afterAll(() => {
  jest.resetAllMocks();
});

describe('Application List Page', () => {
  /**
   * REQ: User Interface Testing (5. SYSTEM DESIGN/5.1 USER INTERFACE DESIGN)
   */
  it('should display paginated list of applications', async () => {
    renderWithProviders(<ApplicationList />);

    await waitFor(() => {
      expect(getApplications).toHaveBeenCalledWith({
        page: 1,
        limit: 10
      });
    });

    const applications = screen.getAllByRole('listitem');
    expect(applications).toHaveLength(10);

    const pagination = screen.getByRole('navigation');
    expect(pagination).toBeInTheDocument();
  });

  it('should filter applications by status', async () => {
    renderWithProviders(<ApplicationList />);

    const filterSelect = screen.getByLabelText(/status filter/i);
    await user.selectOptions(filterSelect, ApplicationStatus.IN_REVIEW);

    await waitFor(() => {
      expect(getApplications).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        status: ApplicationStatus.IN_REVIEW
      });
    });
  });

  it('should handle API errors gracefully', async () => {
    (getApplications as jest.Mock).mockRejectedValueOnce({
      message: 'Network error',
      status: 500
    });

    renderWithProviders(<ApplicationList />);

    await waitFor(() => {
      expect(screen.getByText(/error loading applications/i)).toBeInTheDocument();
    });
  });
});

describe('Application Detail Page', () => {
  /**
   * REQ: Application Processing (2. SYSTEM OVERVIEW/High-Level Description)
   */
  it('should display application details correctly', async () => {
    const testApp = generateTestApplication();
    (getApplicationById as jest.Mock).mockResolvedValueOnce(testApp);

    renderWithProviders(<ApplicationDetail id={testApp.id} />);

    await waitFor(() => {
      expect(screen.getByText(testApp.merchant.businessName)).toBeInTheDocument();
      expect(screen.getByText(testApp.status)).toBeInTheDocument();
      expect(screen.getByText(new RegExp(testApp.funding.requestedAmount.toString()))).toBeInTheDocument();
    });
  });

  it('should allow document upload', async () => {
    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
    renderWithProviders(<ApplicationDetail id="test-123" />);

    const fileInput = screen.getByLabelText(/upload document/i);
    await user.upload(fileInput, file);

    await waitFor(() => {
      expect(uploadDocument).toHaveBeenCalledWith(
        'test-123',
        file,
        expect.any(String)
      );
    });
  });

  it('should show validation errors', async () => {
    const file = new File(['test'], 'test.txt', { type: 'text/plain' });
    renderWithProviders(<ApplicationDetail id="test-123" />);

    const fileInput = screen.getByLabelText(/upload document/i);
    await user.upload(fileInput, file);

    expect(screen.getByText(/only pdf files are allowed/i)).toBeInTheDocument();
  });
});

describe('Application Form', () => {
  /**
   * REQ: Form Validation Rules (5. SYSTEM DESIGN/5.1.2 Interface Elements)
   */
  it('should validate required fields', async () => {
    renderWithProviders(<ApplicationForm />);

    const submitButton = screen.getByRole('button', { name: /submit/i });
    await user.click(submitButton);

    expect(screen.getByText(/business name is required/i)).toBeInTheDocument();
    expect(screen.getByText(/ein is required/i)).toBeInTheDocument();
  });

  it('should validate business name format', async () => {
    renderWithProviders(<ApplicationForm />);

    const businessNameInput = screen.getByLabelText(/business name/i);
    await user.type(businessNameInput, '123');

    expect(screen.getByText(/invalid business name format/i)).toBeInTheDocument();
  });

  it('should validate EIN format', async () => {
    renderWithProviders(<ApplicationForm />);

    const einInput = screen.getByLabelText(/ein/i);
    await user.type(einInput, '123456789');

    expect(screen.getByText(/invalid ein format/i)).toBeInTheDocument();
  });

  it('should validate funding amount limits', async () => {
    renderWithProviders(<ApplicationForm />);

    const amountInput = screen.getByLabelText(/funding amount/i);
    await user.type(amountInput, '1000');

    expect(screen.getByText(/minimum funding amount is \$25,000/i)).toBeInTheDocument();
  });
});

describe('Document Upload', () => {
  /**
   * REQ: Application Processing (2. SYSTEM OVERVIEW/High-Level Description)
   */
  it('should allow PDF file upload', async () => {
    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
    renderWithProviders(<DocumentUpload applicationId="test-123" />);

    const dropzone = screen.getByTestId('document-dropzone');
    await user.upload(dropzone, file);

    expect(screen.getByText(/uploading.../i)).toBeInTheDocument();

    await waitFor(() => {
      expect(uploadDocument).toHaveBeenCalledWith(
        'test-123',
        file,
        expect.any(String)
      );
      expect(screen.getByText(/upload complete/i)).toBeInTheDocument();
    });
  });

  it('should validate file size limits', async () => {
    const largeFile = new File(['test'.repeat(1000000)], 'large.pdf', { type: 'application/pdf' });
    renderWithProviders(<DocumentUpload applicationId="test-123" />);

    const dropzone = screen.getByTestId('document-dropzone');
    await user.upload(dropzone, largeFile);

    expect(screen.getByText(/file size exceeds maximum allowed size/i)).toBeInTheDocument();
  });

  it('should show upload progress', async () => {
    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
    renderWithProviders(<DocumentUpload applicationId="test-123" />);

    const dropzone = screen.getByTestId('document-dropzone');
    await user.upload(dropzone, file);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should handle upload errors', async () => {
    (uploadDocument as jest.Mock).mockRejectedValueOnce(new Error('Upload failed'));
    
    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
    renderWithProviders(<DocumentUpload applicationId="test-123" />);

    const dropzone = screen.getByTestId('document-dropzone');
    await user.upload(dropzone, file);

    await waitFor(() => {
      expect(screen.getByText(/error uploading document/i)).toBeInTheDocument();
    });
  });
});