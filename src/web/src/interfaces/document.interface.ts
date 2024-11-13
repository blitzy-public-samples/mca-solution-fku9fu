/**
 * Human Tasks:
 * 1. Ensure AWS S3 bucket CORS configuration allows presigned URL uploads from the web frontend
 * 2. Configure document size limits and allowed MIME types in the backend API
 */

/**
 * Requirement: Document Management
 * Location: 2. SYSTEM OVERVIEW/High-Level Description
 * Enumeration of supported document types in the MCA application
 */
export enum DocumentType {
    ISO_APPLICATION = 'ISO_APPLICATION',
    BANK_STATEMENT = 'BANK_STATEMENT',
    VOIDED_CHECK = 'VOIDED_CHECK',
    BUSINESS_LICENSE = 'BUSINESS_LICENSE',
    TAX_RETURN = 'TAX_RETURN'
}

/**
 * Requirement: Document Processing
 * Location: 3. SCOPE/Core Features and Functionalities
 * Enumeration of document classification states for AI processing pipeline
 */
export enum DocumentClassification {
    UNCLASSIFIED = 'UNCLASSIFIED',
    PROCESSING = 'PROCESSING',
    CLASSIFIED = 'CLASSIFIED',
    FAILED = 'FAILED'
}

/**
 * Requirement: Data Domains
 * Location: 3. SCOPE/Implementation Boundaries
 * Main interface representing a document in the MCA application
 */
export interface Document {
    /** Unique identifier for the document */
    id: string;

    /** Type of the document based on business requirements */
    type: DocumentType;

    /** Current classification state of the document */
    classification: DocumentClassification;

    /** Original filename of the uploaded document */
    fileName: string;

    /** Size of the document in bytes */
    fileSize: number;

    /** MIME type of the document (e.g., application/pdf) */
    mimeType: string;

    /** ISO 8601 timestamp of when the document was uploaded */
    uploadedAt: string;

    /** URL to access the document (typically an S3 presigned URL) */
    url: string;

    /** URL to access document thumbnail (typically an S3 presigned URL) */
    thumbnailUrl: string;

    /** 
     * Additional metadata extracted from the document during processing
     * Can include OCR results, extracted fields, confidence scores, etc.
     */
    metadata: Record<string, any>;
}

/**
 * Requirement: Document Management
 * Location: 2. SYSTEM OVERVIEW/High-Level Description
 * Interface for document upload API response with secure upload URL
 */
export interface DocumentUploadResponse {
    /** Document object with initial metadata */
    document: Document;

    /** Presigned URL for secure direct upload to S3 */
    presignedUrl: string;
}