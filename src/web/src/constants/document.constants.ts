/**
 * Human Tasks:
 * 1. Verify that backend API document size limits match the MAX_FILE_SIZE constant (10MB)
 * 2. Confirm allowed MIME types are properly configured in backend validation
 * 3. Review document viewer zoom settings with UX team for optimal user experience
 */

import { DocumentType, DocumentClassification } from '../interfaces/document.interface';

/**
 * Requirement: Document Management
 * Location: 2. SYSTEM OVERVIEW/High-Level Description
 * Human-readable labels for document types displayed in the UI
 */
export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
    ISO_APPLICATION: 'ISO Application',
    BANK_STATEMENT: 'Bank Statement',
    VOIDED_CHECK: 'Voided Check',
    BUSINESS_LICENSE: 'Business License',
    TAX_RETURN: 'Tax Return'
};

/**
 * Requirement: Document Processing
 * Location: 3. SCOPE/Core Features and Functionalities
 * Human-readable labels for document classification states
 */
export const DOCUMENT_CLASSIFICATION_LABELS: Record<DocumentClassification, string> = {
    UNCLASSIFIED: 'Unclassified',
    PROCESSING: 'Processing',
    CLASSIFIED: 'Classified',
    FAILED: 'Failed'
};

/**
 * Requirement: Document Management
 * Location: 2. SYSTEM OVERVIEW/High-Level Description
 * Supported file types for document uploads
 */
export const ALLOWED_DOCUMENT_TYPES: string[] = [
    'application/pdf',
    'image/jpeg',
    'image/png'
];

/**
 * Requirement: Document Management
 * Location: 2. SYSTEM OVERVIEW/High-Level Description
 * Maximum file size limit for document uploads (10MB)
 */
export const MAX_FILE_SIZE: number = 10 * 1024 * 1024; // 10MB in bytes

/**
 * Requirement: Data Domains
 * Location: 3. SCOPE/Implementation Boundaries
 * Minimum number of required documents per MCA application
 */
export const MIN_REQUIRED_DOCUMENTS: number = 1;

/**
 * Requirement: Document Processing
 * Location: 3. SCOPE/Core Features and Functionalities
 * Configuration for document viewer component
 */
export const DOCUMENT_VIEWER_CONFIG = {
    minZoom: 0.5,    // Minimum zoom level (50%)
    maxZoom: 3.0,    // Maximum zoom level (300%)
    zoomStep: 0.2    // Zoom increment/decrement step
} as const;