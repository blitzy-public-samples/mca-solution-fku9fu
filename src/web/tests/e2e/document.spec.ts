/**
 * Human Tasks:
 * 1. Configure test environment variables for document service endpoints
 * 2. Set up test data fixtures for document files and responses
 * 3. Ensure PDF.js worker is properly configured in test environment
 */

// @testing-library/react v14.0.0
import { screen, waitFor, fireEvent } from '@testing-library/react';
// @testing-library/user-event v14.0.0
import userEvent from '@testing-library/user-event';
// jest v29.0.0
import { jest, describe, beforeEach, it, expect } from '@jest/globals';

// Internal imports
import { renderWithProviders, mockApiResponse } from '../../src/utils/test.utils';
import DocumentViewer from '../../src/components/documents/DocumentViewer/DocumentViewer';
import { DocumentService } from '../../src/services/document.service';
import { Document, DocumentType, DocumentClassification } from '../../src/interfaces/document.interface';

// Mock DocumentService
jest.mock('../../src/services/document.service');

describe('Document Management', () => {
  // Test constants
  const TEST_DOCUMENT_ID = 'test-doc-123';
  const MAX_UPLOAD_SIZE = 10485760; // 10MB

  // Mock document data
  const mockDocument: Document = {
    id: TEST_DOCUMENT_ID,
    type: DocumentType.APPLICATION,
    url: 'https://test-bucket.s3.amazonaws.com/test-doc.pdf',
    fileName: 'test-document.pdf',
    classification: DocumentClassification.IDENTIFICATION,
    fileSize: 1024 * 1024 // 1MB
  };

  // Service mocks
  let documentServiceMock: jest.Mocked<DocumentService>;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Initialize document service mock
    documentServiceMock = {
      uploadDocument: jest.fn(),
      downloadDocument: jest.fn(),
      getDocumentById: jest.fn(),
      processDocument: jest.fn()
    } as unknown as jest.Mocked<DocumentService>;

    // Mock document service constructor
    (DocumentService as jest.Mock).mockImplementation(() => documentServiceMock);
  });

  /**
   * REQ: Document Management (2. SYSTEM OVERVIEW/High-Level Description)
   * Tests document viewer rendering and functionality
   */
  it('should render document viewer with controls', async () => {
    // Mock successful document fetch
    documentServiceMock.getDocumentById.mockResolvedValue(mockDocument);

    // Render document viewer
    const { container } = renderWithProviders(
      <DocumentViewer documentId={TEST_DOCUMENT_ID} />
    );

    // Wait for document to load
    await waitFor(() => {
      expect(documentServiceMock.getDocumentById).toHaveBeenCalledWith(TEST_DOCUMENT_ID);
    });

    // Verify zoom controls
    expect(screen.getByLabelText('Zoom in')).toBeInTheDocument();
    expect(screen.getByLabelText('Zoom out')).toBeInTheDocument();

    // Verify navigation controls
    expect(screen.getByLabelText('Previous page')).toBeInTheDocument();
    expect(screen.getByLabelText('Next page')).toBeInTheDocument();

    // Verify document info is displayed
    expect(screen.getByText(mockDocument.fileName)).toBeInTheDocument();
  });

  /**
   * REQ: Document Processing (3. SCOPE/Core Features and Functionalities)
   * Tests document upload functionality with AI classification
   */
  it('should handle document upload with classification', async () => {
    // Create test file
    const testFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
    
    // Mock upload response
    const uploadResponse = {
      document: {
        ...mockDocument,
        classification: DocumentClassification.PENDING
      },
      presignedUrl: 'https://test-bucket.s3.amazonaws.com/upload'
    };

    documentServiceMock.uploadDocument.mockResolvedValue(uploadResponse);

    // Set up user event
    const user = userEvent.setup();

    // Render upload component (assuming it's part of DocumentViewer)
    const { container } = renderWithProviders(
      <DocumentViewer documentId={TEST_DOCUMENT_ID} />
    );

    // Trigger file upload
    const fileInput = container.querySelector('input[type="file"]');
    if (fileInput) {
      await user.upload(fileInput, testFile);
    }

    // Verify upload was called with correct parameters
    await waitFor(() => {
      expect(documentServiceMock.uploadDocument).toHaveBeenCalledWith(
        testFile,
        DocumentType.APPLICATION
      );
    });
  });

  /**
   * REQ: Document Management (2. SYSTEM OVERVIEW/High-Level Description)
   * Tests document download functionality
   */
  it('should handle document download', async () => {
    // Mock successful document fetch
    documentServiceMock.getDocumentById.mockResolvedValue(mockDocument);

    // Mock download response
    const mockBlob = new Blob(['test content'], { type: 'application/pdf' });
    documentServiceMock.downloadDocument.mockResolvedValue(mockBlob);

    // Mock URL.createObjectURL
    const mockUrl = 'blob:test-url';
    global.URL.createObjectURL = jest.fn().mockReturnValue(mockUrl);
    global.URL.revokeObjectURL = jest.fn();

    // Mock document.createElement for download link
    const mockLink = {
      href: '',
      download: '',
      click: jest.fn(),
    };
    document.createElement = jest.fn().mockReturnValue(mockLink);
    document.body.appendChild = jest.fn();
    document.body.removeChild = jest.fn();

    // Render document viewer
    const { container } = renderWithProviders(
      <DocumentViewer documentId={TEST_DOCUMENT_ID} />
    );

    // Wait for document to load
    await waitFor(() => {
      expect(documentServiceMock.getDocumentById).toHaveBeenCalledWith(TEST_DOCUMENT_ID);
    });

    // Click download button
    const downloadButton = screen.getByLabelText('Download document');
    await userEvent.click(downloadButton);

    // Verify download was initiated
    await waitFor(() => {
      expect(documentServiceMock.downloadDocument).toHaveBeenCalledWith(TEST_DOCUMENT_ID);
      expect(mockLink.click).toHaveBeenCalled();
    });
  });

  /**
   * REQ: Document Processing (3. SCOPE/Core Features and Functionalities)
   * Tests error handling for document operations
   */
  it('should handle document operation errors', async () => {
    // Mock failed document fetch
    documentServiceMock.getDocumentById.mockRejectedValue(new Error('Failed to load document'));

    // Render document viewer
    const { container } = renderWithProviders(
      <DocumentViewer documentId={TEST_DOCUMENT_ID} />
    );

    // Verify error message is displayed
    await waitFor(() => {
      expect(screen.getByText('Failed to load document')).toBeInTheDocument();
    });

    // Mock oversized file upload
    const largeFile = new File(['test'.repeat(MAX_UPLOAD_SIZE)], 'large.pdf', {
      type: 'application/pdf'
    });

    // Verify file size validation
    const fileInput = container.querySelector('input[type="file"]');
    if (fileInput) {
      await userEvent.upload(fileInput, largeFile);
      expect(documentServiceMock.uploadDocument).not.toHaveBeenCalled();
    }
  });
});