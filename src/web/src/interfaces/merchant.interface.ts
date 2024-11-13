// typescript v5.0.x

import { 
  BUSINESS_NAME_MIN_LENGTH, 
  BUSINESS_NAME_MAX_LENGTH, 
  EIN_REGEX 
} from '../constants/validation.constants';

/**
 * Human Tasks:
 * 1. Review industry types list for completeness based on current business requirements
 * 2. Verify email and phone validation patterns meet current security standards
 * 3. Confirm monthly revenue range aligns with current underwriting policies
 */

// REQ: Data Management - Defines supported merchant industry categories
export enum Industry {
  RETAIL = 'RETAIL',
  RESTAURANT = 'RESTAURANT',
  SERVICES = 'SERVICES',
  MANUFACTURING = 'MANUFACTURING',
  OTHER = 'OTHER'
}

// REQ: Data Management - Defines structure for merchant address information
export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string; // Format: XXXXX or XXXXX-XXXX
}

// REQ: Data Management - Defines comprehensive merchant information structure
// REQ: Form Validation Rules - Implements validation rules for business data fields
export interface MerchantDetails {
  // Unique identifier for the merchant
  id: string;

  // Legal business name with length validation
  legalName: string; // Length: BUSINESS_NAME_MIN_LENGTH to BUSINESS_NAME_MAX_LENGTH

  // DBA (Doing Business As) name with length validation
  dbaName: string; // Length: BUSINESS_NAME_MIN_LENGTH to BUSINESS_NAME_MAX_LENGTH

  // Employer Identification Number with format validation
  ein: string; // Format: XX-XXXXXXX (must match EIN_REGEX)

  // Business location information
  address: Address;

  // Contact information
  phone: string; // Format: +1-XXX-XXX-XXXX, (XXX) XXX-XXXX, or XXX.XXX.XXXX
  email: string; // Format: RFC 5322 compliant email address

  // Business classification
  industry: Industry;

  // Financial information
  monthlyRevenue: number; // Average monthly revenue in USD
  timeInBusiness: number; // Time in business in months

  // Audit timestamps
  createdAt: string; // ISO 8601 format
  updatedAt: string; // ISO 8601 format
}