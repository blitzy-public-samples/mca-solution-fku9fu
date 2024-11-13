// react v18.x
// @mui/material v5.14.x

/**
 * Human Tasks:
 * 1. Verify webhook URL validation rules with security team
 * 2. Review webhook secret requirements and password policies
 * 3. Test webhook endpoint configuration with integration team
 * 4. Validate WCAG 2.1 Level AA compliance with automated tools
 */

import React, { useCallback, useMemo } from 'react';
import {
  TextField,
  Checkbox,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  InputAdornment,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

// Internal imports
import { WebhookConfig, WebhookEventType } from '../../interfaces/webhook.interface';
import { useForm, FormState } from '../../hooks/useForm';
import Form from '../../components/common/Form/Form';
import { validateUrl } from '../../utils/validation.utils';

interface WebhookFormProps {
  initialValues: Partial<WebhookConfig>;
  onSubmit: (values: WebhookConfig) => void | Promise<void>;
  onTest: (values: WebhookConfig) => void | Promise<void>;
  isLoading: boolean;
}

/**
 * REQ: Webhook Configuration - Form component for webhook configuration
 * Location: 5.1 USER INTERFACE DESIGN/5.1.4 Webhook Configuration
 */
const WebhookForm: React.FC<WebhookFormProps> = React.memo(({
  initialValues,
  onSubmit,
  onTest,
  isLoading
}) => {
  const [showSecret, setShowSecret] = React.useState(false);

  // Initialize form with validation schema
  const validationSchema = useMemo(() => ({
    url: {
      validate: validateUrl,
      errorMessage: 'Please enter a valid HTTPS webhook URL',
      required: true
    },
    events: {
      validate: (events: WebhookEventType[]) => events && events.length > 0,
      errorMessage: 'Please select at least one event type',
      required: true
    },
    secret: {
      validate: (secret: string) => secret && secret.length >= 32,
      errorMessage: 'Secret must be at least 32 characters long',
      required: true
    }
  }), []);

  // Default form values
  const defaultValues: Partial<WebhookConfig> = {
    url: '',
    events: [],
    active: true,
    secret: '',
    ...initialValues
  };

  // Form state management
  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    isValid
  } = useForm<Partial<WebhookConfig>>(defaultValues, validationSchema, onSubmit);

  // Handle event checkbox changes
  const handleEventChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const eventType = event.target.name as WebhookEventType;
    const newEvents = event.target.checked
      ? [...(values.events || []), eventType]
      : (values.events || []).filter(e => e !== eventType);
    handleChange('events', newEvents);
  }, [values.events, handleChange]);

  // Handle test webhook
  const handleTestWebhook = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    if (isValid && values.url && values.secret) {
      onTest(values as WebhookConfig);
    }
  }, [isValid, values, onTest]);

  /**
   * REQ: Accessibility - Render form with ARIA labels and keyboard navigation
   * Location: 5. SYSTEM DESIGN/5.1 USER INTERFACE DESIGN/Design Specifications
   */
  return (
    <Form
      id="webhook-form"
      className="webhook-form"
      onSubmit={handleSubmit}
      initialValues={defaultValues}
      validationSchema={validationSchema}
    >
      <TextField
        fullWidth
        id="webhook-url"
        name="url"
        label="Webhook URL"
        value={values.url || ''}
        onChange={(e) => handleChange('url', e.target.value)}
        onBlur={() => handleBlur('url')}
        error={touched.url && !!errors.url}
        helperText={touched.url && errors.url}
        margin="normal"
        required
        placeholder="https://api.example.com/webhooks"
        inputProps={{
          'aria-label': 'Webhook URL',
          'aria-describedby': 'webhook-url-helper-text'
        }}
      />

      <FormGroup aria-label="Webhook event types">
        <FormHelperText id="events-helper-text">
          Select events to receive webhook notifications
        </FormHelperText>
        {Object.values(WebhookEventType).map((eventType) => (
          <FormControlLabel
            key={eventType}
            control={
              <Checkbox
                checked={values.events?.includes(eventType) || false}
                onChange={handleEventChange}
                name={eventType}
                color="primary"
              />
            }
            label={eventType.replace(/\./g, ' ').toLowerCase()}
            aria-label={`Subscribe to ${eventType} events`}
          />
        ))}
        {touched.events && errors.events && (
          <FormHelperText error>{errors.events}</FormHelperText>
        )}
      </FormGroup>

      <TextField
        fullWidth
        id="webhook-secret"
        name="secret"
        label="Webhook Secret"
        type={showSecret ? 'text' : 'password'}
        value={values.secret || ''}
        onChange={(e) => handleChange('secret', e.target.value)}
        onBlur={() => handleBlur('secret')}
        error={touched.secret && !!errors.secret}
        helperText={touched.secret && errors.secret}
        margin="normal"
        required
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label={showSecret ? 'Hide secret' : 'Show secret'}
                onClick={() => setShowSecret(!showSecret)}
                onMouseDown={(e) => e.preventDefault()}
                edge="end"
              >
                {showSecret ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          )
        }}
        inputProps={{
          'aria-label': 'Webhook secret key',
          'aria-describedby': 'webhook-secret-helper-text',
          autoComplete: 'new-password'
        }}
      />

      <FormControlLabel
        control={
          <Checkbox
            checked={values.active || false}
            onChange={(e) => handleChange('active', e.target.checked)}
            name="active"
            color="primary"
          />
        }
        label="Enable webhook"
        aria-label="Enable or disable webhook"
      />

      <div className="webhook-form-actions">
        <Tooltip title={!isValid ? 'Please fill all required fields correctly' : ''}>
          <span>
            <IconButton
              onClick={handleTestWebhook}
              disabled={!isValid || isLoading}
              aria-label="Test webhook configuration"
              color="secondary"
            >
              Test Webhook
            </IconButton>
          </span>
        </Tooltip>

        <button
          type="submit"
          disabled={!isValid || isLoading}
          aria-label="Save webhook configuration"
          className="submit-button"
        >
          {isLoading ? 'Saving...' : 'Save Webhook'}
        </button>
      </div>
    </Form>
  );
});

WebhookForm.displayName = 'WebhookForm';

export default WebhookForm;