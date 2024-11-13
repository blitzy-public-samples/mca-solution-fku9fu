// @mui/material v5.14.x
// react v18.x

/**
 * Human Tasks:
 * 1. Verify WCAG 2.1 Level AA compliance with automated accessibility testing tools
 * 2. Test form submission with screen readers
 * 3. Validate keyboard navigation flow with tab order analysis
 * 4. Review form error messages with UX team for clarity
 */

import React, { useCallback, useEffect } from 'react';
import { 
  TextField, 
  FormControl, 
  FormHelperText 
} from '@mui/material';
import { FormState } from '../../hooks/useForm';
import Button from '../Button/Button';
import { validateBusinessName } from '../../utils/validation.utils';

// REQ: Form Validation Rules - Define form component props interface
export interface FormProps {
  initialValues: Record<string, any>;
  validationSchema: Record<string, (value: any) => boolean>;
  onSubmit: (values: Record<string, any>) => void | Promise<void>;
  children?: React.ReactNode;
  className?: string;
  id?: string;
}

// REQ: Data Management - Form component with validation and accessibility
const Form: React.FC<FormProps> = React.memo(({
  initialValues,
  validationSchema,
  onSubmit,
  children,
  className = '',
  id = 'mca-form'
}) => {
  // REQ: Data Management - Initialize form state with validation
  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    isSubmitting,
    isValid
  } = useForm(initialValues, validationSchema, onSubmit);

  // REQ: Accessibility - Handle keyboard navigation
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && event.target instanceof HTMLElement) {
      if (event.target.tagName !== 'TEXTAREA') {
        event.preventDefault();
        const form = event.target.closest('form');
        if (form) {
          const submitButton = form.querySelector('button[type="submit"]');
          submitButton?.click();
        }
      }
    }
  }, []);

  // REQ: Form Validation Rules - Validate form on mount
  useEffect(() => {
    Object.keys(validationSchema).forEach(field => {
      const value = values[field];
      if (value !== undefined) {
        handleBlur(field);
      }
    });
  }, [validationSchema, values, handleBlur]);

  // REQ: Accessibility - Render form with ARIA attributes
  return (
    <form
      id={id}
      className={`mca-form ${className}`}
      onSubmit={handleSubmit}
      onKeyDown={handleKeyDown}
      noValidate
      aria-label="Application form"
      role="form"
    >
      {/* REQ: Data Management - Provide form context to children */}
      {React.Children.map(children, child => {
        if (!React.isValidElement(child)) return child;

        // REQ: Form Validation Rules - Pass form state to child components
        return React.cloneElement(child, {
          value: values[child.props.name],
          onChange: (e: React.ChangeEvent<HTMLInputElement>) => 
            handleChange(child.props.name, e.target.value),
          onBlur: () => handleBlur(child.props.name),
          error: touched[child.props.name] && !!errors[child.props.name],
          helperText: touched[child.props.name] && errors[child.props.name],
          'aria-invalid': touched[child.props.name] && !!errors[child.props.name],
          'aria-describedby': `${child.props.name}-helper-text`
        });
      })}

      {/* REQ: Accessibility - Form controls with proper ARIA labels */}
      <div className="form-controls" role="group" aria-label="Form controls">
        <Button
          type="submit"
          disabled={isSubmitting || !isValid}
          aria-busy={isSubmitting}
          className="submit-button"
          color="primary"
          variant="contained"
        >
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </Button>
        <Button
          type="button"
          onClick={resetForm}
          className="reset-button"
          color="secondary"
          variant="outlined"
          aria-label="Reset form"
        >
          Reset
        </Button>
      </div>

      {/* REQ: Form Validation Rules - Error boundary for form submission */}
      <FormControl error={!isValid} className="form-error-boundary">
        <FormHelperText
          id="form-error-message"
          role="alert"
          aria-live="polite"
        >
          {!isValid && 'Please correct the errors before submitting.'}
        </FormHelperText>
      </FormControl>
    </form>
  );
});

Form.displayName = 'Form';

export default Form;