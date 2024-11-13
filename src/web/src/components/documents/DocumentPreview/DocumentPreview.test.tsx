// @testing-library/react v14.0.0
// @testing-library/jest-dom v5.16.5
// @testing-library/user-event v14.0.0
import { screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { DocumentPreview, DocumentPreviewProps } from './DocumentPreview';
import { renderWithProviders } from '../../../utils/test.utils';
import { Document, DocumentType, DocumentClassification } from '../../../interfaces/document.interface';

/*
Human Tasks:
1. Verify screen reader compatibility in your testing environment
2. Configure axe-core for automated accessibility testing if needed
3. Set up mock service worker for document service API calls
*/

// Mock document service
jest.mock('../../../services/document.service');

describe('DocumentPreview component', () => {
  // Test document data setup
  const mockDocument: Document = {
    id: 'test-doc-1',
    type: DocumentType.ISO_APPLICATION,
    classification: DocumentClassification.CLASSIFIED,
    fileName: 'test-document.pdf',
    thumbnailUrl: 'test-thumbnail.jpg',
    fileSize: 1024,
    mimeType: 'application/pdf',
    uploadedAt: '2023-01-01T00:00:00Z',
    url: 'test-url',
    metadata: {
      pageCount: 3,
      isAccessible: true
    }
  };

  const defaultProps: DocumentPreviewProps = {
    document: mockDocument,
  };

  // Helper function to render component with default props
  const renderComponent = (props: Partial<DocumentPreviewProps> = {}) => {
    return renderWithProviders(
      <DocumentPreview {...defaultProps} {...props} />
    );
  };

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  /**
   * Requirement: Document Viewer - Interactive document viewer with preview capabilities
   * Tests basic rendering of document preview with accessibility checks
   */
  it('should render document preview correctly', () => {
    renderComponent();

    // Verify document thumbnail
    const thumbnail = screen.getByAltText(`Preview of ${mockDocument.fileName}`);
    expect(thumbnail).toBeInTheDocument();
    expect(thumbnail).toHaveAttribute('src', mockDocument.thumbnailUrl);

    // Verify document metadata
    expect(screen.getByText(mockDocument.fileName)).toBeInTheDocument();
    expect(screen.getByText(/Type: ISO APPLICATION/)).toBeInTheDocument();
    expect(screen.getByText(/Status: CLASSIFIED/)).toBeInTheDocument();

    // Verify ARIA labels and roles
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByLabelText(`Document preview for ${mockDocument.fileName}`)).toBeInTheDocument();
  });

  /**
   * Requirement: Document Viewer - Interactive document viewer with preview capabilities
   * Tests view callback functionality with keyboard interaction
   */
  it('should call onView when view button is clicked', async () => {
    const onView = jest.fn();
    const user = userEvent.setup();
    
    renderComponent({ onView });

    const viewButton = screen.getByLabelText(`View ${mockDocument.fileName}`);
    expect(viewButton).toBeInTheDocument();

    // Test mouse click
    await user.click(viewButton);
    expect(onView).toHaveBeenCalledWith(mockDocument);
    
    // Test keyboard interaction
    onView.mockClear();
    await user.tab();
    await user.keyboard('{Enter}');
    expect(onView).toHaveBeenCalledWith(mockDocument);
  });

  /**
   * Requirement: Document Management - Secure storage of application documents
   * Tests download callback functionality with keyboard interaction
   */
  it('should call onDownload when download button is clicked', async () => {
    const onDownload = jest.fn();
    const user = userEvent.setup();
    
    renderComponent({ onDownload });

    const downloadButton = screen.getByLabelText(`Download ${mockDocument.fileName}`);
    expect(downloadButton).toBeInTheDocument();

    // Test mouse click
    await user.click(downloadButton);
    expect(onDownload).toHaveBeenCalledWith(mockDocument);
    
    // Test keyboard interaction
    onDownload.mockClear();
    await user.tab();
    await user.keyboard('{Enter}');
    expect(onDownload).toHaveBeenCalledWith(mockDocument);
  });

  /**
   * Requirement: Accessibility - WCAG 2.1 Level AA compliance
   * Tests accessibility features and ARIA attributes
   */
  it('should meet accessibility requirements', () => {
    renderComponent();

    // Verify status updates are announced
    const statusElements = screen.getAllByRole('status');
    statusElements.forEach(element => {
      expect(element).toHaveAttribute('aria-live', 'polite');
    });

    // Verify interactive elements are keyboard accessible
    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      expect(button).toHaveAttribute('aria-label');
      expect(button).toHaveAttribute('size', 'medium');
    });

    // Verify image has alt text
    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('alt');
  });

  /**
   * Requirement: Document Processing - Document classification
   * Tests classification status display
   */
  it('should display correct classification status', () => {
    const processingDoc = {
      ...mockDocument,
      classification: DocumentClassification.PROCESSING
    };
    
    const { rerender } = renderComponent({ document: processingDoc });
    expect(screen.getByText(/Status: PROCESSING/)).toBeInTheDocument();

    const failedDoc = {
      ...mockDocument,
      classification: DocumentClassification.FAILED
    };
    
    rerender(<DocumentPreview document={failedDoc} />);
    expect(screen.getByText(/Status: FAILED/)).toBeInTheDocument();
  });

  /**
   * Requirement: Document Viewer - Interactive document viewer with preview capabilities
   * Tests thumbnail error handling
   */
  it('should handle thumbnail loading errors', async () => {
    renderComponent();
    
    const thumbnail = screen.getByRole('img');
    fireEvent.error(thumbnail);
    
    await waitFor(() => {
      expect(thumbnail).toHaveStyle({ display: 'none' });
    });
  });
});