// dayjs v1.11.x
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { DATE_VALIDATION } from '../constants/validation.constants';

// Configure dayjs plugins
dayjs.extend(relativeTime);

/**
 * Human Tasks:
 * 1. Verify timezone handling requirements for date operations
 * 2. Confirm business days calculation aligns with company holiday calendar
 * 3. Review relative time string formats for internationalization needs
 */

/**
 * REQ: Form Validation Rules - Implements date validation rules requiring ISO 8601 format
 * Formats a date string or Date object to ISO 8601 format (YYYY-MM-DD)
 */
export const formatDate = (date: Date | string): string => {
  return dayjs(date).format(DATE_VALIDATION.DATE_FORMAT);
};

/**
 * REQ: Form Validation Rules - Validates dates against ISO 8601 format
 * REQ: Data Management - Validates dates for merchant information
 * Validates if a date string is in correct ISO format and within acceptable range
 */
export const isValidDate = (dateString: string): boolean => {
  const date = dayjs(dateString);
  const minDate = dayjs(DATE_VALIDATION.MIN_DATE);
  
  return date.isValid() && 
         date.format(DATE_VALIDATION.DATE_FORMAT) === dateString && 
         !date.isBefore(minDate);
};

/**
 * REQ: Data Management - Handles date calculations for application processing
 * Calculates the difference between two dates in days
 */
export const calculateDateDifference = (
  startDate: Date | string,
  endDate: Date | string
): number => {
  const start = dayjs(startDate);
  const end = dayjs(endDate);
  return Math.abs(end.diff(start, 'day'));
};

/**
 * REQ: Data Management - Handles business day calculations for processing timelines
 * Adds specified number of business days to a date, excluding weekends
 */
export const addBusinessDays = (date: Date | string, days: number): string => {
  let currentDate = dayjs(date);
  let remainingDays = days;
  
  while (remainingDays > 0) {
    currentDate = currentDate.add(1, 'day');
    // Skip weekends (6 = Saturday, 0 = Sunday)
    if (currentDate.day() !== 6 && currentDate.day() !== 0) {
      remainingDays--;
    }
  }
  
  return currentDate.format(DATE_VALIDATION.DATE_FORMAT);
};

/**
 * REQ: Data Management - Provides user-friendly timestamp displays
 * Returns a human-readable relative time string
 */
export const getRelativeTimeString = (date: Date | string): string => {
  return dayjs(date).fromNow();
};