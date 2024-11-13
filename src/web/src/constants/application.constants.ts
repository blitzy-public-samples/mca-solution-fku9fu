// typescript v5.0.x

import { ApplicationStatus } from '../interfaces/application.interface';

/**
 * Human Tasks:
 * 1. Verify color codes match UI design system standards
 * 2. Confirm timeout values align with infrastructure capabilities
 * 3. Review funding limits with business stakeholders periodically
 */

/**
 * REQ: Application Processing - Human-readable status labels
 * Location: 2. SYSTEM OVERVIEW/High-Level Description
 */
export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
    [ApplicationStatus.DRAFT]: 'Draft',
    [ApplicationStatus.SUBMITTED]: 'Submitted',
    [ApplicationStatus.IN_REVIEW]: 'In Review',
    [ApplicationStatus.APPROVED]: 'Approved',
    [ApplicationStatus.REJECTED]: 'Rejected'
} as const;

/**
 * REQ: Application Processing - Status-specific color codes for UI
 * Location: 2. SYSTEM OVERVIEW/High-Level Description
 */
export const APPLICATION_STATUS_COLORS: Record<ApplicationStatus, string> = {
    [ApplicationStatus.DRAFT]: 'gray.500',
    [ApplicationStatus.SUBMITTED]: 'blue.500',
    [ApplicationStatus.IN_REVIEW]: 'orange.500',
    [ApplicationStatus.APPROVED]: 'green.500',
    [ApplicationStatus.REJECTED]: 'red.500'
} as const;

/**
 * REQ: Data Management - Document type display labels
 * Location: 3. SCOPE/Core Features and Functionalities
 */
export const DOCUMENT_TYPES: Record<string, string> = {
    ISO_APPLICATION: 'ISO Application',
    BANK_STATEMENTS: 'Bank Statements',
    VOIDED_CHECK: 'Voided Check',
    BUSINESS_LICENSE: 'Business License',
    TAX_RETURNS: 'Tax Returns'
} as const;

/**
 * REQ: Processing Time - Operation timeout configurations
 * Location: 2. SYSTEM OVERVIEW/Success Criteria
 */
export const PROCESSING_TIMEOUTS: Record<string, number> = {
    // Timeout for document upload operations (5 minutes)
    DOCUMENT_UPLOAD: 300000,
    // Timeout for OCR processing operations (3 minutes)
    OCR_PROCESSING: 180000,
    // Timeout for application review operations (5 minutes)
    APPLICATION_REVIEW: 300000
} as const;

/**
 * REQ: Data Management - Funding amount constraints
 * Location: 3. SCOPE/Core Features and Functionalities
 */
export const FUNDING_AMOUNT_LIMITS: Record<string, number> = {
    // Minimum funding amount in USD
    MIN: 5000,
    // Maximum funding amount in USD
    MAX: 500000,
    // Default funding amount in USD
    DEFAULT: 50000
} as const;

/**
 * REQ: Data Management - Funding term constraints
 * Location: 3. SCOPE/Core Features and Functionalities
 */
export const FUNDING_TERM_LIMITS: Record<string, number> = {
    // Minimum funding term in months
    MIN: 3,
    // Maximum funding term in months
    MAX: 24,
    // Default funding term in months
    DEFAULT: 12
} as const;