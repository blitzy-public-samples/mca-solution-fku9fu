// typescript v5.0.x

/**
 * Human Tasks:
 * 1. Review validation schema structure with business team
 * 2. Verify error message templates meet UX requirements
 * 3. Confirm form submission error handling aligns with system requirements
 */

// react v18.x
import { useState, useCallback } from 'react';
import { 
  validateBusinessName, 
  validateEIN, 
  validateSSN, 
  validateAmount 
} from '../utils/validation.utils';
import { Application } from '../interfaces/application.interface';

// REQ: Form Validation Rules - Define form state interface
export interface FormState<T> {
  values: T;
  errors: Record<keyof T, string>;
  touched: Record<keyof T, boolean>;
  isSubmitting: boolean;
  isValid: boolean;
}

// REQ: Form Validation Rules - Define validation schema interface
interface ValidationSchema<T> {
  [K in keyof T]: {
    validate: (value: T[K]) => boolean;
    errorMessage: string;
    required?: boolean;
  };
}

// REQ: Data Management - Define form hook return type
interface FormHookReturn<T> {
  values: T;
  errors: Record<keyof T, string>;
  touched: Record<keyof T, boolean>;
  handleChange: (field: keyof T, value: any) => void;
  handleBlur: (field: keyof T) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  resetForm: () => void;
  isSubmitting: boolean;
  isValid: boolean;
}

// REQ: Form Validation Rules - Custom form management hook
export function useForm<T extends Partial<Application>>(
  initialValues: T,
  validationSchema: ValidationSchema<T>,
  onSubmit: (values: T) => Promise<void>
): FormHookReturn<T> {
  // Initialize form state
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Record<keyof T, string>>({} as Record<keyof T, string>);
  const [touched, setTouched] = useState<Record<keyof T, boolean>>({} as Record<keyof T, boolean>);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // REQ: Form Validation Rules - Validate individual field
  const validateField = useCallback((field: keyof T, value: any): string => {
    if (!validationSchema[field]) return '';

    const { validate, errorMessage, required } = validationSchema[field];
    
    if (required && (value === undefined || value === null || value === '')) {
      return 'This field is required';
    }

    return validate(value) ? '' : errorMessage;
  }, [validationSchema]);

  // REQ: Form Validation Rules - Validate entire form
  const validateForm = useCallback((): Record<keyof T, string> => {
    const newErrors = {} as Record<keyof T, string>;
    
    Object.keys(validationSchema).forEach((field) => {
      const error = validateField(field as keyof T, values[field as keyof T]);
      if (error) {
        newErrors[field as keyof T] = error;
      }
    });

    return newErrors;
  }, [validationSchema, values, validateField]);

  // REQ: Data Management - Handle input changes
  const handleChange = useCallback((field: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [field]: value }));
    const error = validateField(field, value);
    setErrors(prev => ({ ...prev, [field]: error }));
  }, [validateField]);

  // REQ: Form Validation Rules - Handle field blur events
  const handleBlur = useCallback((field: keyof T) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const error = validateField(field, values[field]);
    setErrors(prev => ({ ...prev, [field]: error }));
  }, [validateField, values]);

  // REQ: Data Management - Handle form submission
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const newErrors = validateForm();
    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      try {
        await onSubmit(values);
      } catch (error) {
        console.error('Form submission error:', error);
      }
    }

    setIsSubmitting(false);
  }, [values, validateForm, onSubmit]);

  // REQ: Data Management - Reset form state
  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({} as Record<keyof T, string>);
    setTouched({} as Record<keyof T, boolean>);
    setIsSubmitting(false);
  }, [initialValues]);

  // Calculate form validity
  const isValid = Object.keys(errors).length === 0;

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    isSubmitting,
    isValid
  };
}