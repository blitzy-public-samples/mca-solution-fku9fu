// @mui/material v5.14.x
// react v18.x

/**
 * Human Tasks:
 * 1. Verify WCAG 2.1 Level AA compliance with automated accessibility testing
 * 2. Review form validation rules with business team
 * 3. Test form submission with screen readers
 * 4. Confirm keyboard navigation meets accessibility standards
 */

import React, { useCallback, useMemo } from 'react';
import { TextField, Grid } from '@mui/material';
import Form from '../../common/Form/Form';
import { useForm, FormState } from '../../../hooks/useForm';
import { Application } from '../../../interfaces/application.interface';
import {
  validateBusinessName,
  validateEIN,
  validateAmount
} from '../../../utils/validation.utils';

// REQ: Application Processing - Define form props interface
export interface ApplicationFormProps {
  initialValues: Partial<Application>;
  onSubmit: (application: Application) => void | Promise<void>;
  isEdit?: boolean;
  className?: string;
}

// REQ: Application Processing - Main application form component
const ApplicationForm: React.FC<ApplicationFormProps> = React.memo(({
  initialValues,
  onSubmit,
  isEdit = false,
  className = ''
}) => {
  // REQ: Form Validation Rules - Define validation schema
  const validationSchema = useMemo(() => ({
    'merchant.businessName': {
      validate: validateBusinessName,
      errorMessage: 'Business name must be between 2-100 characters',
      required: true
    },
    'merchant.ein': {
      validate: validateEIN,
      errorMessage: 'EIN must be in XX-XXXXXXX format',
      required: true
    },
    'funding.requestedAmount': {
      validate: validateAmount,
      errorMessage: 'Amount must be between $1,000 and $5,000,000',
      required: true
    }
  }), []);

  // REQ: Data Management - Initialize form state
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
  } = useForm<Partial<Application>>(initialValues, validationSchema, onSubmit);

  // REQ: Form Validation Rules - Handle form submission
  const onFormSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSubmit(e);
  }, [handleSubmit]);

  // REQ: Data Management - Handle field changes
  const handleFieldChange = useCallback((field: keyof Application) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    handleChange(field, e.target.value);
  }, [handleChange]);

  // REQ: Data Management - Handle field blur
  const handleFieldBlur = useCallback((field: keyof Application) => () => {
    handleBlur(field);
  }, [handleBlur]);

  return (
    <Form
      className={`application-form ${className}`}
      onSubmit={onFormSubmit}
      id="mca-application-form"
    >
      {/* REQ: Data Management - Merchant Information Section */}
      <Grid container spacing={3} role="group" aria-label="Merchant Information">
        <Grid item xs={12}>
          <TextField
            fullWidth
            id="merchant-business-name"
            name="merchant.businessName"
            label="Business Name"
            value={values.merchant?.businessName || ''}
            onChange={handleFieldChange('merchant.businessName')}
            onBlur={handleFieldBlur('merchant.businessName')}
            error={touched.merchant?.businessName && !!errors.merchant?.businessName}
            helperText={touched.merchant?.businessName && errors.merchant?.businessName}
            required
            inputProps={{
              'aria-label': 'Business Name',
              'aria-required': 'true',
              'aria-invalid': touched.merchant?.businessName && !!errors.merchant?.businessName
            }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            id="merchant-ein"
            name="merchant.ein"
            label="EIN"
            value={values.merchant?.ein || ''}
            onChange={handleFieldChange('merchant.ein')}
            onBlur={handleFieldBlur('merchant.ein')}
            error={touched.merchant?.ein && !!errors.merchant?.ein}
            helperText={touched.merchant?.ein && errors.merchant?.ein}
            required
            placeholder="XX-XXXXXXX"
            inputProps={{
              'aria-label': 'Employer Identification Number',
              'aria-required': 'true',
              'aria-invalid': touched.merchant?.ein && !!errors.merchant?.ein,
              'aria-describedby': 'ein-format-helper'
            }}
          />
        </Grid>
      </Grid>

      {/* REQ: Data Management - Funding Details Section */}
      <Grid container spacing={3} role="group" aria-label="Funding Details" sx={{ mt: 2 }}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            id="funding-amount"
            name="funding.requestedAmount"
            label="Requested Amount"
            type="number"
            value={values.funding?.requestedAmount || ''}
            onChange={handleFieldChange('funding.requestedAmount')}
            onBlur={handleFieldBlur('funding.requestedAmount')}
            error={touched.funding?.requestedAmount && !!errors.funding?.requestedAmount}
            helperText={touched.funding?.requestedAmount && errors.funding?.requestedAmount}
            required
            InputProps={{
              startAdornment: '$',
              inputProps: {
                min: 1000,
                max: 5000000,
                step: 1000,
                'aria-label': 'Requested Funding Amount',
                'aria-required': 'true',
                'aria-invalid': touched.funding?.requestedAmount && !!errors.funding?.requestedAmount
              }
            }}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            id="funding-use"
            name="funding.useOfFunds"
            label="Use of Funds"
            multiline
            rows={4}
            value={values.funding?.useOfFunds || ''}
            onChange={handleFieldChange('funding.useOfFunds')}
            onBlur={handleFieldBlur('funding.useOfFunds')}
            inputProps={{
              'aria-label': 'Use of Funds Description',
              'maxLength': 500
            }}
          />
        </Grid>
      </Grid>

      {/* REQ: Form Validation Rules - Error boundary and accessibility support */}
      <div
        role="alert"
        aria-live="polite"
        className="form-error-boundary"
        style={{ visibility: !isValid ? 'visible' : 'hidden' }}
      >
        {!isValid && 'Please correct the errors before submitting the application.'}
      </div>
    </Form>
  );
});

ApplicationForm.displayName = 'ApplicationForm';

export default ApplicationForm;