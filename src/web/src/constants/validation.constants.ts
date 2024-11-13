// typescript v5.0.x

/**
 * Human Tasks:
 * 1. Review and confirm EIN validation pattern meets current IRS standards
 * 2. Verify SSN validation pattern complies with latest PII security requirements
 * 3. Confirm currency amount limits align with current business policies
 * 4. Review error messages for compliance with accessibility guidelines
 */

// REQ: Form Validation Rules - Business name length constraints
export const VALIDATION_RULES = {
  BUSINESS_NAME_MIN_LENGTH: 2,
  BUSINESS_NAME_MAX_LENGTH: 100,
  
  // REQ: Data Security - Secure validation patterns for sensitive data
  // Format: XX-XXXXXXX where X is a digit
  EIN_REGEX: /^\d{2}-?\d{7}$/,
  
  // Format: XXX-XX-XXXX where X is a digit
  SSN_REGEX: /^\d{3}-?\d{2}-?\d{4}$/,
  
  // REQ: Form Validation Rules - Email validation following RFC 5322 standards
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  
  // REQ: Form Validation Rules - Phone number validation supporting multiple formats
  // Supports: +1-XXX-XXX-XXXX, (XXX) XXX-XXXX, XXX.XXX.XXXX
  PHONE_REGEX: /^\+?1?[-.]?\(?[0-9]{3}\)?[-.]?[0-9]{3}[-.]?[0-9]{4}$/,
  
  // REQ: Data Management - Address validation
  // Format: XXXXX or XXXXX-XXXX
  ZIP_CODE_REGEX: /^\d{5}(?:-\d{4})?$/
} as const;

// REQ: Data Management - Funding details validation
export const AMOUNT_VALIDATION = {
  // Minimum funding amount in USD
  MIN_AMOUNT: 1000,
  
  // Maximum funding amount in USD
  MAX_AMOUNT: 5000000,
  
  // Number of decimal places allowed for currency amounts
  DECIMAL_PLACES: 2
} as const;

// REQ: Form Validation Rules - Date validation rules
export const DATE_VALIDATION = {
  // Minimum allowed date for business documents
  MIN_DATE: '2000-01-01',
  
  // Required date format for all date inputs
  DATE_FORMAT: 'YYYY-MM-DD'
} as const;

// REQ: Form Validation Rules - User-friendly error messages
export const ERROR_MESSAGES = {
  // Generic required field message
  REQUIRED_FIELD: 'This field is required',
  
  // Email validation error
  INVALID_EMAIL: 'Please enter a valid email address',
  
  // Phone validation error
  INVALID_PHONE: 'Please enter a valid phone number',
  
  // REQ: Data Security - Secure sensitive data validation messages
  INVALID_EIN: 'Please enter a valid 9-digit Employer Identification Number (XX-XXXXXXX)',
  
  // SSN validation error with security consideration
  INVALID_SSN: 'Please enter a valid Social Security Number (XXX-XX-XXXX)',
  
  // Amount validation error
  INVALID_AMOUNT: `Please enter an amount between $${AMOUNT_VALIDATION.MIN_AMOUNT} and $${AMOUNT_VALIDATION.MAX_AMOUNT}`
} as const;