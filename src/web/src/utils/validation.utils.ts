// typescript v5.0.x

/**
 * Human Tasks:
 * 1. Review and confirm validation patterns meet current industry standards
 * 2. Verify validation rules comply with latest regulatory requirements
 * 3. Confirm validation error handling meets security best practices
 */

import {
  VALIDATION_RULES,
  AMOUNT_VALIDATION,
  DATE_VALIDATION
} from '../constants/validation.constants';

// REQ: Form Validation Rules - Business name validation
export const validateBusinessName = (name: string): boolean => {
  if (!name || typeof name !== 'string') {
    return false;
  }

  const trimmedName = name.trim();
  return (
    trimmedName.length >= VALIDATION_RULES.BUSINESS_NAME_MIN_LENGTH &&
    trimmedName.length <= VALIDATION_RULES.BUSINESS_NAME_MAX_LENGTH &&
    /^[a-zA-Z0-9\s\-\.,&'()]+$/.test(trimmedName)
  );
};

// REQ: Data Management - EIN validation
export const validateEIN = (ein: string): boolean => {
  if (!ein || typeof ein !== 'string') {
    return false;
  }

  const cleanEIN = ein.replace(/\D/g, '');
  return cleanEIN.length === 9 && VALIDATION_RULES.EIN_REGEX.test(ein);
};

// REQ: Data Management - SSN validation
export const validateSSN = (ssn: string): boolean => {
  if (!ssn || typeof ssn !== 'string') {
    return false;
  }

  const cleanSSN = ssn.replace(/\D/g, '');
  return cleanSSN.length === 9 && VALIDATION_RULES.SSN_REGEX.test(ssn);
};

// REQ: Form Validation Rules - Email validation (RFC 5322)
export const validateEmail = (email: string): boolean => {
  if (!email || typeof email !== 'string') {
    return false;
  }

  const trimmedEmail = email.trim();
  return VALIDATION_RULES.EMAIL_REGEX.test(trimmedEmail);
};

// REQ: Form Validation Rules - Phone number validation (E.164)
export const validatePhoneNumber = (phone: string): boolean => {
  if (!phone || typeof phone !== 'string') {
    return false;
  }

  const cleanPhone = phone.replace(/\D/g, '');
  const isValidLength = cleanPhone.length >= 10 && cleanPhone.length <= 11;
  return isValidLength && VALIDATION_RULES.PHONE_REGEX.test(phone);
};

// REQ: Data Management - Currency amount validation
export const validateAmount = (amount: number): boolean => {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return false;
  }

  // Check amount range
  if (amount < AMOUNT_VALIDATION.MIN_AMOUNT || amount > AMOUNT_VALIDATION.MAX_AMOUNT) {
    return false;
  }

  // Check decimal places
  const decimalStr = amount.toString().split('.')[1] || '';
  return decimalStr.length <= AMOUNT_VALIDATION.DECIMAL_PLACES;
};

// REQ: Form Validation Rules - Date validation (ISO 8601)
export const validateDate = (date: string): boolean => {
  if (!date || typeof date !== 'string') {
    return false;
  }

  // Check format (YYYY-MM-DD)
  if (!date.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return false;
  }

  // Validate actual date
  const parsedDate = new Date(date);
  if (isNaN(parsedDate.getTime())) {
    return false;
  }

  // Format date to match expected format
  const formattedDate = parsedDate.toISOString().split('T')[0];
  return formattedDate === date && date.includes(DATE_VALIDATION.DATE_FORMAT.slice(0, 4));
};