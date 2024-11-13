/**
 * Human Tasks:
 * 1. Verify Auth0 configuration in development and production environments
 * 2. Test login form accessibility with screen readers
 * 3. Validate form error handling with different input scenarios
 * 4. Confirm redirect behavior after successful authentication
 */

// react v18.2.0
import React from 'react';
// react-router-dom v6.11.0
import { useNavigate } from 'react-router-dom';
// @mui/material v5.14.x
import { Card, Typography } from '@mui/material';

// Internal imports
import { useAuth } from '../../hooks/useAuth';
import AuthLayout from '../../layouts/AuthLayout/AuthLayout';
import Form from '../../components/common/Form/Form';
import { validateEmail } from '../../utils/validation.utils';

/**
 * Interface for login form values
 */
interface LoginFormValues {
  email: string;
  password: string;
}

/**
 * Login page component that provides user authentication functionality
 * @implements Authentication & Authorization requirement from 7.1.1 Authentication Methods
 * @implements User Interface Design requirement from 5.1 USER INTERFACE DESIGN/Design Specifications
 * @implements Accessibility requirement from 5.1 USER INTERFACE DESIGN/Design Specifications
 */
const LoginPage: React.FC = React.memo(() => {
  const navigate = useNavigate();
  const { login, isAuthenticated, loading } = useAuth();

  // Redirect to dashboard if already authenticated
  React.useEffect(() => {
    if (isAuthenticated && !loading) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, loading, navigate]);

  // Initial form values
  const initialValues: LoginFormValues = {
    email: '',
    password: ''
  };

  // Form validation schema
  const validationSchema = {
    email: (value: string) => validateEmail(value) || 'Please enter a valid email address',
    password: (value: string) => value.length >= 8 || 'Password must be at least 8 characters'
  };

  /**
   * Handle form submission
   * @implements Authentication & Authorization requirement from 7.1.1 Authentication Methods
   */
  const handleSubmit = async (values: LoginFormValues): Promise<void> => {
    try {
      await login();
      // Navigation is handled by useAuth hook after successful login
    } catch (error) {
      // Error handling is managed by useAuth hook
      console.error('Login failed:', error);
    }
  };

  return (
    <AuthLayout>
      <Card
        sx={{
          padding: 4,
          maxWidth: 400,
          margin: '0 auto',
          width: '100%'
        }}
        // Accessibility attributes
        role="region"
        aria-label="Login form"
      >
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          align="center"
          sx={{ mb: 4 }}
        >
          Welcome Back
        </Typography>

        <Form
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          id="login-form"
        >
          {/* Email input */}
          <TextField
            name="email"
            label="Email Address"
            type="email"
            fullWidth
            margin="normal"
            required
            autoComplete="email"
            // Accessibility attributes
            aria-required="true"
            inputProps={{
              'aria-label': 'Email Address',
              'aria-describedby': 'email-helper-text'
            }}
          />

          {/* Password input */}
          <TextField
            name="password"
            label="Password"
            type="password"
            fullWidth
            margin="normal"
            required
            autoComplete="current-password"
            // Accessibility attributes
            aria-required="true"
            inputProps={{
              'aria-label': 'Password',
              'aria-describedby': 'password-helper-text'
            }}
          />

          {/* Submit button is handled by Form component */}
        </Form>

        {/* Additional help text */}
        <Typography
          variant="body2"
          align="center"
          sx={{ mt: 2 }}
          color="text.secondary"
        >
          Contact your administrator if you need help accessing your account
        </Typography>
      </Card>
    </AuthLayout>
  );
});

LoginPage.displayName = 'LoginPage';

export default LoginPage;