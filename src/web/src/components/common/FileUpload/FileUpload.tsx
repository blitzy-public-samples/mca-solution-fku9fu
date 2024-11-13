// @package react@18.x
// @package @mui/material@5.x
// @package @mui/icons-material@5.x

/**
 * Human Tasks:
 * 1. Verify file upload size limits match backend configuration (currently 10MB)
 * 2. Test WCAG 2.1 Level AA compliance with screen readers
 * 3. Validate drag-and-drop functionality across supported browsers
 * 4. Ensure proper error handling for network timeouts during uploads
 */

import React, { useState, useCallback, useRef } from 'react';
import { Box, Typography, LinearProgress } from '@mui/material';
import { CloudUpload } from '@mui/icons-material';
import Button from '../Button/Button';
import { DocumentService } from '../../../services/document.service';
import { useNotification } from '../../../hooks/useNotification';

// Default maximum file size (10MB) aligned with DocumentService
const DEFAULT_MAX_FILE_SIZE = 10 * 1024 * 1024;

// Default accepted file types
const DEFAULT_ACCEPTED_TYPES = ['.pdf', '.jpg', '.jpeg', '.png'];

interface FileUploadProps {
  onUploadComplete: (document: Document) => void;
  acceptedFileTypes?: string[];
  maxFileSize?: number;
  multiple?: boolean;
  disabled?: boolean;
}

// Requirement: Component Library - Material Design components with reusable form elements
const FileUpload: React.FC<FileUploadProps> = React.memo(({
  onUploadComplete,
  acceptedFileTypes = DEFAULT_ACCEPTED_TYPES,
  maxFileSize = DEFAULT_MAX_FILE_SIZE,
  multiple = false,
  disabled = false
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const documentService = new DocumentService();
  const { showSuccess, showError } = useNotification();

  // Requirement: Document Management - Validate file types and size
  const validateFile = useCallback((file: File): boolean => {
    if (file.size > maxFileSize) {
      showError(`File size exceeds maximum limit of ${maxFileSize / 1024 / 1024}MB`);
      return false;
    }

    const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`;
    if (!acceptedFileTypes.includes(fileExtension)) {
      showError(`File type not supported. Accepted types: ${acceptedFileTypes.join(', ')}`);
      return false;
    }

    return true;
  }, [acceptedFileTypes, maxFileSize, showError]);

  // Requirement: Document Processing - Handle file upload with progress tracking
  const handleFileUpload = useCallback(async (file: File) => {
    try {
      setUploadProgress(0);
      const response = await documentService.uploadDocument(file, 'application');
      setUploadProgress(100);
      showSuccess('File uploaded successfully');
      onUploadComplete(response);
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Failed to upload file');
    } finally {
      setUploadProgress(null);
    }
  }, [documentService, onUploadComplete, showSuccess, showError]);

  // Requirement: Document Management - Handle drag and drop functionality
  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);

    if (disabled) return;

    const files = Array.from(event.dataTransfer.files);
    const validFiles = files.filter(validateFile);

    if (validFiles.length) {
      if (!multiple && validFiles.length > 1) {
        showError('Only one file can be uploaded at a time');
        return;
      }
      validFiles.forEach(handleFileUpload);
    }
  }, [disabled, multiple, validateFile, handleFileUpload, showError]);

  // Handle file selection through button click
  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter(validateFile);

    if (validFiles.length) {
      validFiles.forEach(handleFileUpload);
    }

    // Reset input value to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [validateFile, handleFileUpload]);

  // Drag event handlers
  const handleDragEnter = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    if (!disabled) setIsDragging(true);
  }, [disabled]);

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
  }, []);

  // Requirement: Component Library - Material Design styling with WCAG 2.1 compliance
  return (
    <Box
      sx={{
        border: theme => `2px dashed ${isDragging ? theme.palette.primary.main : theme.palette.divider}`,
        borderRadius: 1,
        p: 3,
        textAlign: 'center',
        backgroundColor: theme => isDragging ? theme.palette.action.hover : 'transparent',
        transition: 'all 0.2s ease',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
      }}
      onDrop={handleDrop}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-label="File upload area"
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedFileTypes.join(',')}
        multiple={multiple}
        onChange={handleFileSelect}
        style={{ display: 'none' }}
        disabled={disabled}
        aria-hidden="true"
      />

      <CloudUpload
        sx={{
          fontSize: 48,
          color: theme => isDragging ? theme.palette.primary.main : theme.palette.text.secondary,
          mb: 2
        }}
      />

      <Typography variant="h6" component="div" gutterBottom>
        Drag and drop files here
      </Typography>

      <Typography variant="body2" color="textSecondary" gutterBottom>
        or
      </Typography>

      <Button
        variant="contained"
        onClick={() => fileInputRef.current?.click()}
        disabled={disabled}
        startIcon={<CloudUpload />}
        aria-label="Select files to upload"
      >
        Select Files
      </Button>

      <Typography variant="caption" display="block" color="textSecondary" sx={{ mt: 1 }}>
        Accepted files: {acceptedFileTypes.join(', ')} (max {maxFileSize / 1024 / 1024}MB)
      </Typography>

      {uploadProgress !== null && (
        <Box sx={{ mt: 2, width: '100%' }}>
          <LinearProgress
            variant="determinate"
            value={uploadProgress}
            aria-label="Upload progress"
          />
          <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5 }}>
            Uploading... {uploadProgress}%
          </Typography>
        </Box>
      )}
    </Box>
  );
});

FileUpload.displayName = 'FileUpload';

export default FileUpload;