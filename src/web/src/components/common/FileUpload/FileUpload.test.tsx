// @testing-library/react v14.0.0
// @testing-library/jest-dom v5.16.5
// @testing-library/user-event v14.0.0
// jest v29.0.0

import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import FileUpload from './FileUpload';
import { renderWithProviders } from '../../../utils/test.utils';
import { DocumentService } from '../../../services/document.service';

// Mock DocumentService
jest.mock('../../../services/document.service');

// Mock useNotification hook
const mockShowSuccess = jest.fn();
const mockShowError = jest.fn();
jest.mock('../../../hooks/useNotification', () => ({
  useNotification: () => ({
    showSuccess: mockShowSuccess,
    showError: mockShowError
  })
}));

describe('FileUpload Component', () => {
  const mockOnUploadComplete = jest.fn();
  const mockUploadDocument = jest.fn();
  const user = userEvent.setup();

  beforeEach(() => {
    jest.clearAllMocks();
    // Setup DocumentService mock
    (DocumentService as jest.Mock).mockImplementation(() => ({
      uploadDocument: mockUploadDocument
    }));
  });

  // REQ: Component Library - Material Design components with reusable form elements
  it('renders upload zone with correct styling and accessibility attributes', () => {
    renderWithProviders(
      <FileUpload onUploadComplete={mockOnUploadComplete} />
    );

    const uploadZone = screen.getByRole('button', { name: /file upload area/i });
    expect(uploadZone).toBeInTheDocument();
    expect(uploadZone).toHaveAttribute('tabIndex', '0');
    expect(screen.getByText(/drag and drop files here/i)).toBeInTheDocument();
    expect(screen.getByText(/select files/i)).toBeInTheDocument();
  });

  // REQ: Document Management - Validate file types and size
  it('validates file types correctly', async () => {
    renderWithProviders(
      <FileUpload onUploadComplete={mockOnUploadComplete} />
    );

    const file = new File(['test'], 'test.txt', { type: 'text/plain' });
    const input = screen.getByRole('button', { name: /file upload area/i });

    await user.upload(input, file);

    expect(mockShowError).toHaveBeenCalledWith(
      expect.stringContaining('File type not supported')
    );
    expect(mockUploadDocument).not.toHaveBeenCalled();
  });

  // REQ: Document Management - AI-powered classification and secure storage
  it('handles valid file upload successfully', async () => {
    const mockDocument = { id: '123', name: 'test.pdf' };
    mockUploadDocument.mockResolvedValueOnce(mockDocument);

    renderWithProviders(
      <FileUpload onUploadComplete={mockOnUploadComplete} />
    );

    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
    const input = screen.getByRole('button', { name: /file upload area/i });

    await user.upload(input, file);

    await waitFor(() => {
      expect(mockUploadDocument).toHaveBeenCalledWith(file, 'application');
      expect(mockShowSuccess).toHaveBeenCalledWith('File uploaded successfully');
      expect(mockOnUploadComplete).toHaveBeenCalledWith(mockDocument);
    });
  });

  // REQ: Document Processing - Document classification and data extraction
  it('shows upload progress during file upload', async () => {
    mockUploadDocument.mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 100))
    );

    renderWithProviders(
      <FileUpload onUploadComplete={mockOnUploadComplete} />
    );

    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
    const input = screen.getByRole('button', { name: /file upload area/i });

    await user.upload(input, file);

    expect(await screen.findByRole('progressbar')).toBeInTheDocument();
    expect(screen.getByText(/uploading/i)).toBeInTheDocument();
  });

  it('handles file size validation', async () => {
    const maxFileSize = 5 * 1024 * 1024; // 5MB
    renderWithProviders(
      <FileUpload 
        onUploadComplete={mockOnUploadComplete}
        maxFileSize={maxFileSize}
      />
    );

    // Create a file larger than maxFileSize
    const largeFile = new File(['x'.repeat(maxFileSize + 1000)], 'large.pdf', { type: 'application/pdf' });
    const input = screen.getByRole('button', { name: /file upload area/i });

    await user.upload(input, largeFile);

    expect(mockShowError).toHaveBeenCalledWith(
      expect.stringContaining('File size exceeds maximum limit')
    );
    expect(mockUploadDocument).not.toHaveBeenCalled();
  });

  it('handles drag and drop interactions', async () => {
    renderWithProviders(
      <FileUpload onUploadComplete={mockOnUploadComplete} />
    );

    const uploadZone = screen.getByRole('button', { name: /file upload area/i });

    // Simulate drag enter
    await user.hover(uploadZone);
    fireEvent.dragEnter(uploadZone);
    expect(uploadZone).toHaveStyle({ backgroundColor: expect.any(String) });

    // Simulate drag leave
    fireEvent.dragLeave(uploadZone);
    expect(uploadZone).not.toHaveStyle({ backgroundColor: expect.any(String) });
  });

  it('handles multiple file selection when enabled', async () => {
    renderWithProviders(
      <FileUpload onUploadComplete={mockOnUploadComplete} multiple={true} />
    );

    const files = [
      new File(['test1'], 'test1.pdf', { type: 'application/pdf' }),
      new File(['test2'], 'test2.pdf', { type: 'application/pdf' })
    ];

    const input = screen.getByRole('button', { name: /file upload area/i });
    await user.upload(input, files);

    expect(mockUploadDocument).toHaveBeenCalledTimes(2);
  });

  it('prevents interactions when disabled', async () => {
    renderWithProviders(
      <FileUpload onUploadComplete={mockOnUploadComplete} disabled={true} />
    );

    const uploadZone = screen.getByRole('button', { name: /file upload area/i });
    const selectButton = screen.getByRole('button', { name: /select files/i });

    expect(uploadZone).toHaveAttribute('tabIndex', '-1');
    expect(selectButton).toBeDisabled();

    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
    await user.upload(uploadZone, file);

    expect(mockUploadDocument).not.toHaveBeenCalled();
  });

  it('handles upload errors gracefully', async () => {
    const errorMessage = 'Network error';
    mockUploadDocument.mockRejectedValueOnce(new Error(errorMessage));

    renderWithProviders(
      <FileUpload onUploadComplete={mockOnUploadComplete} />
    );

    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
    const input = screen.getByRole('button', { name: /file upload area/i });

    await user.upload(input, file);

    await waitFor(() => {
      expect(mockShowError).toHaveBeenCalledWith(errorMessage);
      expect(mockOnUploadComplete).not.toHaveBeenCalled();
    });
  });
});

// Helper function for drag and drop events
function fireEvent(element: Element, eventName: string, options = {}) {
  const event = new Event(eventName, {
    bubbles: true,
    cancelable: true,
    ...options
  });
  element.dispatchEvent(event);
}