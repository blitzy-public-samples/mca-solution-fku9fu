// @package react@18.x
// @package @mui/material@5.x

/**
 * Human Tasks:
 * 1. Verify document type configuration matches backend API expectations
 * 2. Test WCAG 2.1 Level AA compliance with screen readers
 * 3. Validate error handling for network timeouts during document processing
 */

import React, { useState, useCallback } from 'react';
import { FormControl, InputLabel, Select, MenuItem, Box } from '@mui/material';
import FileUpload from '../../common/FileUpload/FileUpload';
import { DocumentService } from '../../../services/document.service';
import { 
    Document, 
    DocumentType, 
    DocumentClassification 
} from '../../../interfaces/document.interface';

// Accepted file types for document uploads
const ACCEPTED_FILE_TYPES = ['.pdf', '.jpg', '.jpeg', '.png'];

// Maximum file size (20MB)
const MAX_FILE_SIZE = 20 * 1024 * 1024;

interface DocumentUploadProps {
    onUploadComplete: (document: Document) => void;
    onUploadError: (error: Error) => void;
    allowedTypes: DocumentType[];
    maxFileSize?: number;
    disabled?: boolean;
}

/**
 * Requirement: Document Management
 * Location: 2. SYSTEM OVERVIEW/High-Level Description
 * A specialized document upload component that handles document type selection,
 * validation, and upload processing with progress tracking.
 */
const DocumentUpload: React.FC<DocumentUploadProps> = React.memo(({
    onUploadComplete,
    onUploadError,
    allowedTypes,
    maxFileSize = MAX_FILE_SIZE,
    disabled = false
}) => {
    const [selectedType, setSelectedType] = useState<DocumentType | ''>('');
    const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'processing'>('idle');
    const documentService = new DocumentService();

    /**
     * Requirement: Component Library
     * Location: 5. SYSTEM DESIGN/5.1 USER INTERFACE DESIGN/Design Specifications
     * Handles changes in document type selection with Material Design components
     */
    const handleDocumentTypeChange = useCallback((
        event: React.ChangeEvent<{ value: unknown }>
    ) => {
        const value = event.target.value as DocumentType;
        if (allowedTypes.includes(value)) {
            setSelectedType(value);
        }
    }, [allowedTypes]);

    /**
     * Requirement: Document Processing
     * Location: 3. SCOPE/Core Features and Functionalities
     * Handles successful document upload and initiates AI processing
     */
    const handleUploadComplete = useCallback(async (document: Document) => {
        try {
            setUploadStatus('processing');
            
            // Initiate document processing
            const processedDocument = await documentService.processDocument(document.id);
            
            if (processedDocument.classification === DocumentClassification.FAILED) {
                throw new Error('Document processing failed');
            }

            setUploadStatus('idle');
            onUploadComplete(processedDocument);
            setSelectedType('');
        } catch (error) {
            setUploadStatus('idle');
            onUploadError(error instanceof Error ? error : new Error('Processing failed'));
        }
    }, [documentService, onUploadComplete, onUploadError]);

    /**
     * Requirement: Document Management
     * Location: 2. SYSTEM OVERVIEW/High-Level Description
     * Handles upload errors and provides user feedback
     */
    const handleUploadError = useCallback((error: Error) => {
        setUploadStatus('idle');
        onUploadError(error);
    }, [onUploadError]);

    return (
        <Box 
            sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: 2 
            }}
        >
            <FormControl 
                fullWidth 
                disabled={disabled || uploadStatus !== 'idle'}
            >
                <InputLabel id="document-type-label">
                    Document Type
                </InputLabel>
                <Select
                    labelId="document-type-label"
                    value={selectedType}
                    onChange={handleDocumentTypeChange}
                    label="Document Type"
                    aria-label="Select document type"
                >
                    {allowedTypes.map((type) => (
                        <MenuItem 
                            key={type} 
                            value={type}
                        >
                            {type.replace(/_/g, ' ')}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            <FileUpload
                onUploadComplete={handleUploadComplete}
                acceptedFileTypes={ACCEPTED_FILE_TYPES}
                maxFileSize={maxFileSize}
                disabled={disabled || !selectedType || uploadStatus !== 'idle'}
                multiple={false}
            />
        </Box>
    );
});

DocumentUpload.displayName = 'DocumentUpload';

export default DocumentUpload;