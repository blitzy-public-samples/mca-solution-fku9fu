// typescript v5.0.x

import { MerchantDetails } from '../interfaces/merchant.interface';
import { Document, DocumentType } from '../interfaces/document.interface';

/**
 * Human Tasks:
 * 1. Review application status workflow transitions to ensure compliance with business rules
 * 2. Verify funding amount ranges and terms align with current underwriting policies
 * 3. Confirm required document types match current compliance requirements
 */

/**
 * REQ: Application Processing - Defines application status workflow states
 * Location: 2. SYSTEM OVERVIEW/High-Level Description
 */
export enum ApplicationStatus {
    DRAFT = 'DRAFT',           // Initial state when application is created
    SUBMITTED = 'SUBMITTED',   // Application submitted by merchant
    IN_REVIEW = 'IN_REVIEW',   // Under review by underwriting team
    APPROVED = 'APPROVED',     // Application approved for funding
    REJECTED = 'REJECTED'      // Application rejected by underwriting
}

/**
 * REQ: Data Management - Defines funding request parameters
 * Location: 3. SCOPE/Core Features and Functionalities
 */
export interface FundingDetails {
    /** Requested funding amount in USD (cents) */
    requestedAmount: number;

    /** Funding term in months */
    term: number;

    /** Description of how funds will be used */
    useOfFunds: string;
}

/**
 * REQ: Application Processing - Defines core application data structure
 * REQ: Data Management - Implements comprehensive application data model
 * REQ: Form Validation Rules - Enforces data structure validation
 * Location: 2. SYSTEM OVERVIEW/High-Level Description
 */
export interface Application {
    /** Unique identifier for the application */
    id: string;

    /** Current status in the application workflow */
    status: ApplicationStatus;

    /** Complete merchant profile information */
    merchant: MerchantDetails;

    /** Funding request details */
    funding: FundingDetails;

    /** Required and supporting documentation */
    documents: Document[];

    /** ISO 8601 timestamp of application creation */
    createdAt: string;

    /** ISO 8601 timestamp of last update */
    updatedAt: string;

    /** ISO 8601 timestamp when application was submitted */
    submittedAt: string;

    /** ISO 8601 timestamp when application was last reviewed */
    reviewedAt: string;

    /** ID of the underwriter who reviewed the application */
    reviewedBy: string;
}

/**
 * REQ: Form Validation Rules - Defines required documents for application submission
 * Location: 5. SYSTEM DESIGN/5.1.2 Interface Elements
 */
export const REQUIRED_DOCUMENTS: DocumentType[] = [
    DocumentType.ISO_APPLICATION,
    DocumentType.BANK_STATEMENT,
    DocumentType.VOIDED_CHECK
];