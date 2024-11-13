// @testing-library/react@14.0.0
// @testing-library/user-event@14.0.0
// @testing-library/jest-dom@5.16.5

/**
 * Human Tasks:
 * 1. Verify test coverage meets minimum threshold requirements
 * 2. Run accessibility tests with screen readers
 * 3. Add integration tests with mock API endpoints if needed
 */

import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import DocumentUpload from './DocumentUpload';
import { renderWithProviders } from '../../../utils/test.utils';
import { Document, DocumentType, DocumentClassification } from '../../../interfaces/document.interface';

// Mock constants
const mockFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
const mockOnUploadComplete = jest.fn();
const mockOnUploadError = jest.fn();
const defaultProps = {
  allowedTypes: [DocumentType.ISO_APPLICATION, DocumentType.BANK_STATEMENT],
  maxFileSize: 5 * 1024 * 1024, // 5MB
  disabled: false,
  onUploadComplete: mockOnUploadComplete,
  onUploadError: mockOnUploadError
};

// Mock document service
jest.mock('../../../services/document.service', () => ({
  DocumentService: jest.fn().mockImplementation(() => ({
    processDocument: jest.fn().mockResolvedValue({
      id: '123',
      type: DocumentType.ISO_APPLICATION,
      classification: DocumentClassification.CLASSIFIED,
      fileName: 'test.pdf'
    })
  }))
}));

/**
 * Requirement: Testing Infrastructure
 * Location: 4. SYSTEM ARCHITECTURE/4.2 Component Details/4.2.1 Core Components
 */
describe('DocumentUpload component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Requirement: Document Management
   * Location: 2. SYSTEM OVERVIEW/High-Level Description
   */
  it('should render document type selector with allowed types', () => {
    renderWithProviders(<DocumentUpload {...defaultProps} />);

    const select = screen.getByLabelText('Document Type');
    expect(select).toBeInTheDocument();
    
    // Open select dropdown
    userEvent.click(select);
    
    // Verify allowed document types are rendered
    defaultProps.allowedTypes.forEach(type => {
      expect(screen.getByText(type.replace(/_/g, ' '))).toBeInTheDocument();
    });
  });

  /**
   * Requirement: Document Processing
   * Location: 3. SCOPE/Core Features and Functionalities
   */
  it('should handle document type selection', async () => {
    renderWithProviders(<DocumentUpload {...defaultProps} />);

    const select = screen.getByLabelText('Document Type');
    await userEvent.click(select);
    
    const option = screen.getByText('ISO APPLICATION');
    await userEvent.click(option);

    expect(select).toHaveValue(DocumentType.ISO_APPLICATION);
  });

  /**
   * Requirement: Document Management
   * Location: 2. SYSTEM OVERVIEW/High-Level Description
   */
  it('should disable file upload when no document type is selected', () => {
    renderWithProviders(<DocumentUpload {...defaultProps} />);
    
    const fileInput = screen.getByLabelText(/drop files here/i);
    expect(fileInput).toBeDisabled();
  });

  /**
   * Requirement: Document Processing
   * Location: 3. SCOPE/Core Features and Functionalities
   */
  it('should handle successful file upload', async () => {
    renderWithProviders(<DocumentUpload {...defaultProps} />);

    // Select document type
    const select = screen.getByLabelText('Document Type');
    await userEvent.click(select);
    await userEvent.click(screen.getByText('ISO APPLICATION'));

    // Upload file
    const fileInput = screen.getByLabelText(/drop files here/i);
    await userEvent.upload(fileInput, mockFile);

    await waitFor(() => {
      expect(mockOnUploadComplete).toHaveBeenCalledWith(
        expect.objectContaining({
          id: '123',
          type: DocumentType.ISO_APPLICATION,
          classification: DocumentClassification.CLASSIFIED
        })
      );
    });
  });

  /**
   * Requirement: Document Management
   * Location: 2. SYSTEM OVERVIEW/High-Level Description
   */
  it('should validate file size', async () => {
    const oversizedFile = new File(['test'.repeat(1000000)], 'large.pdf', { type: 'application/pdf' });
    
    renderWithProviders(
      <DocumentUpload {...defaultProps} maxFileSize={1024} /> // 1KB limit
    );

    // Select document type
    const select = screen.getByLabelText('Document Type');
    await userEvent.click(select);
    await userEvent.click(screen.getByText('ISO APPLICATION'));

    // Upload oversized file
    const fileInput = screen.getByLabelText(/drop files here/i);
    await userEvent.upload(fileInput, oversizedFile);

    await waitFor(() => {
      expect(mockOnUploadError).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('file size')
        })
      );
    });
  });

  /**
   * Requirement: Document Processing
   * Location: 3. SCOPE/Core Features and Functionalities
   */
  it('should handle processing failure', async () => {
    // Mock processing failure
    jest.spyOn(DocumentService.prototype, 'processDocument').mockResolvedValueOnce({
      id: '123',
      type: DocumentType.ISO_APPLICATION,
      classification: DocumentClassification.FAILED,
      fileName: 'test.pdf'
    } as Document);

    renderWithProviders(<DocumentUpload {...defaultProps} />);

    // Select document type
    const select = screen.getByLabelText('Document Type');
    await userEvent.click(select);
    await userEvent.click(screen.getByText('ISO APPLICATION'));

    // Upload file
    const fileInput = screen.getByLabelText(/drop files here/i);
    await userEvent.upload(fileInput, mockFile);

    await waitFor(() => {
      expect(mockOnUploadError).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Document processing failed'
        })
      );
    });
  });

  /**
   * Requirement: Document Management
   * Location: 2. SYSTEM OVERVIEW/High-Level Description
   */
  it('should disable component when disabled prop is true', () => {
    renderWithProviders(<DocumentUpload {...defaultProps} disabled={true} />);

    expect(screen.getByLabelText('Document Type')).toBeDisabled();
    expect(screen.getByLabelText(/drop files here/i)).toBeDisabled();
  });

  /**
   * Requirement: Document Processing
   * Location: 3. SCOPE/Core Features and Functionalities
   */
  it('should reset document type after successful upload', async () => {
    renderWithProviders(<DocumentUpload {...defaultProps} />);

    // Select document type
    const select = screen.getByLabelText('Document Type');
    await userEvent.click(select);
    await userEvent.click(screen.getByText('ISO APPLICATION'));

    // Upload file
    const fileInput = screen.getByLabelText(/drop files here/i);
    await userEvent.upload(fileInput, mockFile);

    await waitFor(() => {
      expect(select).toHaveValue('');
    });
  });
});