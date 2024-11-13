// react v18.x
import React from 'react';
// @testing-library/react v14.x
import { screen, fireEvent, waitFor } from '@testing-library/react';
// vitest v^0.34.0
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

// Internal imports
import DocumentViewer from './DocumentViewer';
import { renderWithProviders } from '../../../utils/test.utils';
import { DocumentService } from '../../../services/document.service';

// Mock DocumentService
vi.mock('../../../services/document.service', () => ({
  DocumentService: vi.fn().mockImplementation(() => ({
    getDocumentById: vi.fn(),
    downloadDocument: vi.fn()
  }))
}));

describe('DocumentViewer', () => {
  const mockDocumentId = 'test-doc-123';
  let documentService: jest.Mocked<DocumentService>;

  const mockDocument = {
    id: mockDocumentId,
    fileName: 'test-document.pdf',
    url: 'https://test-bucket.s3.amazonaws.com/test-document.pdf',
    type: 'application/pdf',
    createdAt: '2023-08-01T00:00:00Z',
    status: 'processed'
  };

  beforeEach(() => {
    documentService = new DocumentService() as jest.Mocked<DocumentService>;
    // Reset all mocks before each test
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  /**
   * Test: Initial loading state
   * Requirement: Document Management
   * Location: 2. SYSTEM OVERVIEW/High-Level Description
   */
  it('should render loading state initially', async () => {
    // Mock delayed document loading
    documentService.getDocumentById.mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve(mockDocument), 100))
    );

    renderWithProviders(<DocumentViewer documentId={mockDocumentId} />);

    // Verify loading component is displayed
    const loadingElement = screen.getByRole('progressbar');
    expect(loadingElement).toBeInTheDocument();
    expect(loadingElement).toHaveAttribute('aria-label', 'Loading');
  });

  /**
   * Test: Document viewer UI elements
   * Requirement: Document Processing
   * Location: 3. SCOPE/Core Features and Functionalities
   */
  it('should render document viewer with controls', async () => {
    // Mock successful document fetch
    documentService.getDocumentById.mockResolvedValue(mockDocument);

    renderWithProviders(<DocumentViewer documentId={mockDocumentId} />);

    // Wait for document to load
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    // Verify zoom controls
    expect(screen.getByLabelText('Zoom in')).toBeInTheDocument();
    expect(screen.getByLabelText('Zoom out')).toBeInTheDocument();

    // Verify navigation controls
    expect(screen.getByLabelText('Previous page')).toBeInTheDocument();
    expect(screen.getByLabelText('Next page')).toBeInTheDocument();

    // Verify download button
    expect(screen.getByLabelText('Download document')).toBeInTheDocument();

    // Verify document metadata
    expect(screen.getByText(mockDocument.fileName)).toBeInTheDocument();
    expect(screen.getByText('Page 1 of 0')).toBeInTheDocument();
  });

  /**
   * Test: Zoom functionality
   * Requirement: Document Management
   * Location: 2. SYSTEM OVERVIEW/High-Level Description
   */
  it('should handle zoom controls', async () => {
    documentService.getDocumentById.mockResolvedValue(mockDocument);

    renderWithProviders(<DocumentViewer documentId={mockDocumentId} />);

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    // Initial zoom level
    expect(screen.getByText('100%')).toBeInTheDocument();

    // Test zoom in
    const zoomInButton = screen.getByLabelText('Zoom in');
    fireEvent.click(zoomInButton);
    expect(screen.getByText('120%')).toBeInTheDocument();

    // Test zoom out
    const zoomOutButton = screen.getByLabelText('Zoom out');
    fireEvent.click(zoomOutButton);
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  /**
   * Test: Document download
   * Requirement: Document Management
   * Location: 2. SYSTEM OVERVIEW/High-Level Description
   */
  it('should handle document download', async () => {
    const mockBlob = new Blob(['test content'], { type: 'application/pdf' });
    documentService.getDocumentById.mockResolvedValue(mockDocument);
    documentService.downloadDocument.mockResolvedValue(mockBlob);

    // Mock URL.createObjectURL and URL.revokeObjectURL
    const mockObjectUrl = 'blob:test-url';
    global.URL.createObjectURL = vi.fn(() => mockObjectUrl);
    global.URL.revokeObjectURL = vi.fn();

    // Mock document.createElement and click event
    const mockLink = {
      href: '',
      download: '',
      click: vi.fn(),
    };
    document.createElement = vi.fn().mockReturnValue(mockLink);
    document.body.appendChild = vi.fn();
    document.body.removeChild = vi.fn();

    renderWithProviders(<DocumentViewer documentId={mockDocumentId} />);

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    // Trigger download
    const downloadButton = screen.getByLabelText('Download document');
    fireEvent.click(downloadButton);

    await waitFor(() => {
      expect(documentService.downloadDocument).toHaveBeenCalledWith(mockDocumentId);
    });

    // Verify download link creation and cleanup
    expect(mockLink.download).toBe(mockDocument.fileName);
    expect(mockLink.click).toHaveBeenCalled();
    expect(global.URL.createObjectURL).toHaveBeenCalledWith(mockBlob);
    expect(global.URL.revokeObjectURL).toHaveBeenCalledWith(mockObjectUrl);
  });

  /**
   * Test: Error handling
   * Requirement: Document Processing
   * Location: 3. SCOPE/Core Features and Functionalities
   */
  it('should handle document loading error', async () => {
    const errorMessage = 'Failed to load document';
    documentService.getDocumentById.mockRejectedValue(new Error(errorMessage));

    renderWithProviders(<DocumentViewer documentId={mockDocumentId} />);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });
});