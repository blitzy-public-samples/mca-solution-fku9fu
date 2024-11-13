// typescript v5.0.x

/**
 * Human Tasks:
 * 1. Review business name suffix handling rules with legal team
 * 2. Verify currency formatting rules comply with accounting standards
 * 3. Confirm phone number formatting requirements for international numbers
 */

import { VALIDATION_RULES, AMOUNT_VALIDATION } from '../constants/validation.constants';

// REQ: Form Validation Rules - Currency formatting with 2 decimal places
export function formatCurrency(amount: number): string {
  if (isNaN(amount) || !isFinite(amount)) {
    throw new Error('Invalid amount provided');
  }

  // Round to specified decimal places and remove trailing zeros
  const roundedAmount = Number(amount.toFixed(AMOUNT_VALIDATION.DECIMAL_PLACES));
  
  // Format with commas and add dollar sign
  return `$${roundedAmount.toLocaleString('en-US', {
    minimumFractionDigits: AMOUNT_VALIDATION.DECIMAL_PLACES,
    maximumFractionDigits: AMOUNT_VALIDATION.DECIMAL_PLACES
  })}`;
}

// REQ: Data Management - Standardized EIN formatting
export function formatEIN(ein: string): string {
  // Remove any existing hyphens and whitespace
  const cleanEIN = ein.replace(/[-\s]/g, '');
  
  if (!VALIDATION_RULES.EIN_REGEX.test(cleanEIN)) {
    throw new Error('Invalid EIN format');
  }

  // Format as XX-XXXXXXX
  return `${cleanEIN.slice(0, 2)}-${cleanEIN.slice(2)}`;
}

// REQ: Data Management - Standardized SSN formatting with security considerations
export function formatSSN(ssn: string): string {
  // Remove any existing hyphens and whitespace
  const cleanSSN = ssn.replace(/[-\s]/g, '');
  
  if (!VALIDATION_RULES.SSN_REGEX.test(cleanSSN)) {
    throw new Error('Invalid SSN format');
  }

  // Format as XXX-XX-XXXX
  return `${cleanSSN.slice(0, 3)}-${cleanSSN.slice(3, 5)}-${cleanSSN.slice(5)}`;
}

// REQ: Form Validation Rules - Phone number E.164 format
export function formatPhoneNumber(phone: string): string {
  // Remove all non-digit characters
  const cleanPhone = phone.replace(/\D/g, '');
  
  if (!VALIDATION_RULES.PHONE_REGEX.test(cleanPhone)) {
    throw new Error('Invalid phone number format');
  }

  // Ensure 10 digits and format as +1-XXX-XXX-XXXX
  const normalizedPhone = cleanPhone.slice(-10);
  return `+1-${normalizedPhone.slice(0, 3)}-${normalizedPhone.slice(3, 6)}-${normalizedPhone.slice(6)}`;
}

// REQ: Data Management - Business name formatting
export function formatBusinessName(name: string): string {
  if (!name || typeof name !== 'string') {
    throw new Error('Invalid business name');
  }

  // List of words that should not be capitalized unless at start
  const lowercaseWords = new Set(['and', 'or', 'the', 'in', 'of', 'at', 'by', 'for']);
  
  // List of business suffixes that should be properly formatted
  const suffixFormatting: { [key: string]: string } = {
    'llc': 'LLC',
    'inc': 'Inc.',
    'incorporated': 'Inc.',
    'corporation': 'Corp.',
    'corp': 'Corp.',
    'limited': 'Ltd.',
    'ltd': 'Ltd.',
    'pc': 'P.C.',
    'llp': 'LLP',
    'pllc': 'PLLC'
  };

  // Split the name into words and process each word
  const words = name.trim().toLowerCase().split(/\s+/);
  
  const formattedWords = words.map((word, index) => {
    // Check if word is a known business suffix
    const suffix = suffixFormatting[word];
    if (suffix) {
      return suffix;
    }

    // Don't lowercase articles and prepositions unless they're the first word
    if (index !== 0 && lowercaseWords.has(word)) {
      return word;
    }

    // Capitalize first letter of other words
    return word.charAt(0).toUpperCase() + word.slice(1);
  });

  return formattedWords.join(' ');
}